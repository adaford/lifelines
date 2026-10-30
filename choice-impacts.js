import { annualForecast, effectiveStats, needsEducationChoice } from './engine.js?v=toddler-social-1';
import { infantChoiceEffects, wellbeingResponse, TODDLER_ACTIVITY_EFFECTS, PARENT_FAMILY_RELATIONSHIP_GAIN } from './development.js?v=toddler-social-1';

const nonzero = value => Math.abs(value) > .000001;
const keyOf = entry => `${entry.parentId || 'you'}:${entry.stat}`;
const bounded = (before, change) => Math.max(1, Math.min(10, before + change)) - before;

// Activity help compares direct per-point effects for the same stat across
// activities. The combined forecast separately accounts for selected points.
export function toddlerActivityImpacts(activity) {
  const impacts = Object.entries(TODDLER_ACTIVITY_EFFECTS[activity] || {}).filter(([,change]) => nonzero(change)).map(([stat,change]) => {
    const maximum = Math.max(...Object.values(TODDLER_ACTIVITY_EFFECTS).map(effects => Math.abs(effects[stat] || 0)));
    const level = Math.min(3, Math.max(1, Math.ceil(3 * Math.abs(change) / maximum - 1e-8)));
    return { stat, change, level };
  });
  // Family time is the only toddler activity that improves parent relationships.
  if (activity === 'family') impacts.push({ stat: 'relationship', change: PARENT_FAMILY_RELATIONSHIP_GAIN, level: 3, target: 'parents' });
  return impacts;
}

function forecastEntries(state, forecast) {
  const entries = [...Object.entries(forecast.stats), ['lifestyle', forecast.lifestyle]]
    .map(([stat, value]) => ({ stat, change: value.change, group: 'you' }));
  for (const parent of state.parents.filter(person => person.alive !== false)) {
    const changes = forecast.parents.find(person => person.id === parent.id);
    for (const stat of ['stability', 'lifestyle', 'relationship']) {
      if (changes?.[stat]) entries.push({ stat, parentId: parent.id, change: changes[stat].change,
        group: stat === 'relationship' ? 'relationships' : 'others' });
    }
  }
  return entries;
}

function cryEntries(state, level, clip) {
  const candidate = { ...state, cryLevel: level };
  const entries = forecastEntries(candidate, annualForecast(candidate))
    .filter(entry => entry.parentId || entry.stat === 'lifestyle');
  // Personal crying effects omit unrelated innate development and wellbeing
  // reversion, so an unchanged skill is never presented as an effect of crying.
  const effects = infantChoiceEffects(candidate);
  // Evaluate the contribution with next year's retained modifiers. This keeps
  // boosts at the displayed ceiling from advertising an impossible increase,
  // while excluding the independent effect of a modifier expiring this year.
  const next = { ...state, effects: state.effects.filter(effect => effect.years > 1) };
  const before = clip ? effectiveStats(next) : null;
  const after = clip ? effectiveStats({ ...next, stats: { ...state.stats,
    ...Object.fromEntries(Object.entries(effects).map(([stat, change]) => [stat, state.stats[stat] + bounded(state.stats[stat], change)])),
  } }) : null;
  for (const [stat, change] of Object.entries(effects)) {
    entries.push({ stat, change: clip ? after[stat] - before[stat] : change, group: 'you' });
  }
  for (const entry of entries) {
    if (!entry.parentId) continue;
    const parent = state.parents.find(person => person.id === entry.parentId);
    if (entry.stat === 'stability') {
      const effect = wellbeingResponse(parent, 'stability', [.2, 0, -.6, -1.2, -1.8][level - 1]);
      entry.change = clip ? bounded(parent.stats.stability, effect) : effect;
    } else if (entry.stat === 'relationship') {
      const effect = .2 * (level - 3);
      entry.change = clip ? bounded(parent.relationship, effect) : effect;
    }
  }
  return entries;
}

// Vertices of the legal 12-point/5-per-area allocation space. Routine focus
// effects reach their positive/negative extremes at these allocations; including
// the current allocation also covers discontinuities such as career thresholds.
function focusExtremes(keys) {
  const result = new Map();
  const add = values => result.set(values.join(','), Object.fromEntries(keys.map((key, i) => [key, values[i]])));
  for (let mask = 0; mask < 2 ** keys.length; mask++) {
    const values = keys.map((_, i) => mask & (1 << i) ? 5 : 0);
    const used = values.reduce((sum, value) => sum + value, 0);
    if (used > 12) continue;
    add(values);
    const remaining = 12 - used;
    if (remaining > 0 && remaining < 5) {
      values.forEach((value, i) => {
        if (!value) add(values.map((v, j) => j === i ? remaining : v));
      });
    }
  }
  return [...result.values()];
}

let cachedFocusKey;
let cachedFocusEntries;
function focusComparisons(state) {
  // Reuse alternatives while the user changes only the allocation. No saved
  // state or RNG is written, and any other state change invalidates the cache.
  const cacheKey = JSON.stringify({ ...state, focus: null });
  if (cacheKey !== cachedFocusKey) {
    const keys = state.age < 5 ? ['work', 'social', 'family', 'self', 'creative'] : ['work', 'social', 'family', 'self'];
    cachedFocusEntries = focusExtremes(keys).map(focus => {
      const candidate = { ...state, focus };
      return forecastEntries(candidate, annualForecast(candidate));
    });
    cachedFocusKey = cacheKey;
  }
  return cachedFocusEntries;
}

// Qualitative signs compare options for the same person and stat, never a fixed
// point cutoff shared by unrelated stats. Clipping hides impossible changes but
// does not turn a stronger crying choice into a weaker-looking one near a limit.
export function choiceImpacts(state) {
  if (state.ended || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const infant = state.age < 2;
  const entries = infant ? cryEntries(state, state.cryLevel, true) : forecastEntries(state, annualForecast(state));
  const comparisons = infant
    ? [1, 2, 3, 4, 5].map(level => cryEntries(state, level, false))
    : [...focusComparisons(state), entries];
  const raw = infant ? cryEntries(state, state.cryLevel, false) : entries;
  return entries.filter(entry => nonzero(entry.change)).map(entry => {
    const key = keyOf(entry);
    const change = raw.find(candidate => keyOf(candidate) === key).change;
    const possible = comparisons.map(options => options.find(option => keyOf(option) === key)?.change || 0);
    const magnitudes = possible.filter(candidate => nonzero(candidate) && Math.sign(candidate) === Math.sign(change)).map(Math.abs);
    let level;
    if (infant) {
      const ordered = [...new Set(magnitudes.map(value => Math.round(value * 1e8)))].sort((a, b) => a - b);
      level = Math.min(3, ordered.indexOf(Math.round(Math.abs(change) * 1e8)) + 1);
    } else {
      const maximum = Math.max(Math.abs(change), ...magnitudes);
      level = Math.max(...possible) - Math.min(...possible) < .000001 ? 1
        : Math.min(3, Math.max(1, Math.ceil(3 * Math.abs(change) / maximum - 1e-8)));
    }
    return { ...entry, level };
  });
}
