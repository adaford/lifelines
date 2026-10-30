import { annualForecast, effectiveStats, needsEducationChoice, focusLimits, caregivers } from './engine.js?v=decision-choice-rows-1';
import { infantChoiceEffects, wellbeingResponse, toddlerActivityEffects, schoolFocusEffects, TODDLER_FOCUS, TODDLER_ACTIVITY_EFFECTS, PARENT_FAMILY_RELATIONSHIP_GAIN, YEARLY_DECISION_SCALE } from './development.js?v=decision-choice-rows-1';

const nonzero = value => Math.abs(value) > .000001;
const keyOf = entry => `${entry.parentId || 'you'}:${entry.stat}`;
const bounded = (before, change) => Math.max(0, Math.min(10, before + change)) - before;

// Activity help compares direct per-point effects for the same stat across
// activities. The activity rows separately account for selected points.
export function toddlerActivityImpacts(activity) {
  const impacts = Object.entries(TODDLER_ACTIVITY_EFFECTS[activity] || {}).filter(([,change]) => nonzero(change)).map(([stat,change]) => {
    const maximum = Math.max(...Object.values(TODDLER_ACTIVITY_EFFECTS).map(effects => Math.abs(effects[stat] || 0)));
    const level = Math.min(3, Math.max(1, Math.ceil(3 * Math.abs(change) / maximum - 1e-8)));
    return { stat, change, level };
  });
  // Family time is the only toddler activity that improves parent relationships.
  if (activity === 'family') impacts.push({ stat: 'relationship', change: PARENT_FAMILY_RELATIONSHIP_GAIN, level: 2, target: 'parents' });
  return impacts;
}

function personalChoiceEntries(state, effects, clip) {
  // Retained modifiers can hide an otherwise possible change at the displayed
  // bounds. Expiring modifiers are background changes, not activity effects.
  const next = { ...state, effects: state.effects.filter(effect => effect.years > 1) };
  const before = clip ? effectiveStats(next) : null;
  const after = clip ? effectiveStats({ ...next, stats: { ...state.stats,
    ...Object.fromEntries(Object.entries(effects).map(([stat, change]) => [stat, state.stats[stat] + bounded(state.stats[stat], change)])),
  } }) : null;
  return Object.entries(effects).map(([stat, change]) => ({ stat, change: clip ? after[stat] - before[stat] : change, group: 'you' }));
}

function toddlerChoiceEntries(state, activity, points, clip) {
  const candidate = { ...state, focus: { ...state.focus, [activity]: points } };
  const balanced = { ...candidate, focus: { ...candidate.focus, [activity]: TODDLER_FOCUS[activity] } };
  const contributions = toddlerActivityEffects(candidate)[activity];
  const reference = toddlerActivityEffects(balanced)[activity];
  const effects = Object.fromEntries(Object.entries(contributions).map(([stat, change]) => [stat, change - reference[stat]]));
  const entries = personalChoiceEntries(state, effects, clip);
  if (activity === 'family') {
    for (const parent of caregivers(state)) {
      const stability = wellbeingResponse(parent, 'stability', .025 * (points - 2));
      const relationship = PARENT_FAMILY_RELATIONSHIP_GAIN * (points - 3);
      entries.push({ stat: 'stability', parentId: parent.id, group: 'others', change: clip ? bounded(parent.stats.stability, stability) : stability });
      entries.push({ stat: 'relationship', parentId: parent.id, group: 'relationships', change: clip ? bounded(parent.relationship, relationship) : relationship });
    }
  }
  return entries;
}

// Each row shows its own contribution relative to the balanced activity points.
// Comparing all 0–5 choices keeps the signs stable while reallocating a budget;
// unrelated household changes and unused-point rest do not belong to any row.
export function toddlerChoiceImpacts(state, activity) {
  if (state.age < 2 || state.age >= 5 || !Object.hasOwn(TODDLER_FOCUS, activity) || state.ended || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const points = Math.max(0, Math.min(5, state.focus[activity] ?? 0));
  const entries = toddlerChoiceEntries(state, activity, points, true);
  const raw = toddlerChoiceEntries(state, activity, points, false);
  const comparisons = Array.from({ length: 6 }, (_, level) => toddlerChoiceEntries(state, activity, level, false));
  return rankedChoiceEntries(entries, raw, comparisons, points,
    entry => entry.parentId ? (entry.stat === 'relationship' ? 3 : 2) : TODDLER_FOCUS[activity]);
}

function rankedChoiceEntries(entries, raw, comparisons, points, neutralFor) {
  return entries.filter(entry => nonzero(entry.change)).map(entry => {
    const key = keyOf(entry);
    const change = raw.find(candidate => keyOf(candidate) === key).change;
    const magnitudes = comparisons.map(options => options.find(option => keyOf(option) === key)?.change || 0)
      .filter(candidate => nonzero(candidate) && Math.sign(candidate) === Math.sign(change))
      .map(candidate => Math.round(Math.abs(candidate) * 1e8));
    // Below neutral, each ranked reduction adds one sign. Above neutral, the
    // weakest option starts at one and the strongest reaches three; two options
    // skip the middle strength. This follows points, even for negative effects
    // such as Electronics on social. Static help must not cap these ranks.
    const ordered = [...new Set(magnitudes)].sort((a, b) => a - b);
    const rank = Math.max(0, ordered.indexOf(Math.round(Math.abs(change) * 1e8)));
    const neutral = neutralFor(entry);
    const level = points < neutral ? Math.min(3, rank + 1)
      : ordered.length < 2 ? 1 : 1 + Math.round(2 * rank / (ordered.length - 1));
    return { ...entry, level };
  });
}

function schoolChoiceEntries(state, area, points, clip) {
  const candidate = { ...state, focus: { ...state.focus, [area]: points } };
  const entries = personalChoiceEntries(state, schoolFocusEffects(candidate, area), clip);
  if (area === 'family') {
    for (const parent of caregivers(state)) {
      const stability = wellbeingResponse(parent, 'stability', .025 * (points - 3));
      const relationship = PARENT_FAMILY_RELATIONSHIP_GAIN * (points - 2);
      entries.push({ stat: 'stability', parentId: parent.id, group: 'others', change: clip ? bounded(parent.stats.stability, stability) : stability });
      entries.push({ stat: 'relationship', parentId: parent.id, group: 'relationships', change: clip ? bounded(parent.relationship, relationship) : relationship });
    }
  }
  return entries;
}

// School and college show only each choice's own decision contribution. Keep
// the same complete 0–5 reference as toddler rows when an event limits a choice.
export function schoolChoiceImpacts(state, area) {
  if (state.age < 5 || state.age >= 18 && state.education.status !== 'college'
      || !['work', 'social', 'family', 'self'].includes(area) || state.ended
      || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const points = Math.max(0, Math.min(focusLimits(state)[area], state.focus[area] ?? 0));
  const entries = schoolChoiceEntries(state, area, points, true);
  const raw = schoolChoiceEntries(state, area, points, false);
  const comparisons = Array.from({ length: 6 }, (_, level) => schoolChoiceEntries(state, area, level, false));
  return rankedChoiceEntries(entries, raw, comparisons, points,
    entry => entry.parentId && entry.stat === 'relationship' ? 2 : 3);
}

function forecastEntries(state, forecast) {
  // Lifestyle remains a household/financial outcome, never an activity preview.
  const entries = Object.entries(forecast.stats)
    .map(([stat, value]) => ({ stat, change: value.change, group: 'you' }));
  for (const parent of caregivers(state)) {
    const changes = forecast.parents.find(person => person.id === parent.id);
    for (const stat of ['stability', 'relationship']) {
      if (changes?.[stat]) entries.push({ stat, parentId: parent.id, change: changes[stat].change,
        group: stat === 'relationship' ? 'relationships' : 'others' });
    }
  }
  return entries;
}

function cryEntries(state, level, clip) {
  const candidate = { ...state, cryLevel: level };
  const entries = forecastEntries(candidate, annualForecast(candidate))
    .filter(entry => entry.parentId);
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
    const parent = caregivers(state).find(person => person.id === entry.parentId);
    if (entry.stat === 'stability') {
      const effect = wellbeingResponse(parent, 'stability', [.2, 0, -.6, -1.2, -1.8][level - 1]);
      entry.change = clip ? bounded(parent.stats.stability, effect) : effect;
    } else if (entry.stat === 'relationship') {
      const effect = YEARLY_DECISION_SCALE * .2 * (level - 3);
      entry.change = clip ? bounded(parent.relationship, effect) : effect;
    }
  }
  return entries;
}

// Vertices of the legal 12-point allocation space, including temporary caps. Routine focus
// effects reach their positive/negative extremes at these allocations; including
// the current allocation also covers discontinuities such as career thresholds.
function focusExtremes(keys, limits) {
  const result = new Map();
  const add = values => result.set(values.join(','), Object.fromEntries(keys.map((key, i) => [key, values[i]])));
  for (let mask = 0; mask < 2 ** keys.length; mask++) {
    const values = keys.map((key, i) => mask & (1 << i) ? limits[key] : 0);
    const used = values.reduce((sum, value) => sum + value, 0);
    if (used > 12) continue;
    add(values);
    const remaining = 12 - used;
    if (remaining > 0) {
      values.forEach((value, i) => {
        if (!value && remaining < limits[keys[i]]) add(values.map((v, j) => j === i ? remaining : v));
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
    cachedFocusEntries = focusExtremes(keys, focusLimits(state)).map(focus => {
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
