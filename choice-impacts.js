import { annualForecast, effectiveStats, needsEducationChoice, focusLimits, caregivers, JOBS } from './engine.js?v=concrete-events-activities';
import { infantChoiceEffects, wellbeingResponse, toddlerActivityEffects, toddlerActivityNeutral, toddlerActivitySteps, schoolFocusEffects, focusChoiceEffects, focusEffectStrength, standardFocusCoefficients, TODDLER_FOCUS, TODDLER_ACTIVITY_EFFECTS, PARENT_FAMILY_STABILITY_GAIN, PARENT_FAMILY_RELATIONSHIP_GAIN, YEARLY_DECISION_SCALE } from './development.js?v=concrete-events-activities';
import { DEFAULT_FOCUS, focusEffect } from './focus-rules.js?v=concrete-events-activities';
import { changedRating } from './rating-changes.js?v=concrete-events-activities';

const nonzero = value => Math.abs(value) > .000001;
const keyOf = entry => `${entry.parentId || 'you'}:${entry.stat}`;
const bounded = (before, change) => Math.max(0, Math.min(10, before + change)) - before;

// Activity help compares direct per-point effects for the same stat across
// activities. The activity rows separately account for selected points.
export function toddlerActivityImpacts(activity) {
  const impacts = Object.entries(TODDLER_ACTIVITY_EFFECTS[activity] || {}).filter(([,change]) => nonzero(change)).map(([stat,change]) => {
    const level = focusEffectStrength(TODDLER_ACTIVITY_EFFECTS, activity, stat);
    return { stat, change, level };
  });
  // Family time is the only toddler activity that improves parent relationships.
  if (activity === 'family') impacts.push({ stat: 'relationship', change: PARENT_FAMILY_RELATIONSHIP_GAIN, level: 1, target: 'parents' });
  return impacts;
}

function personalChoiceEntries(state, effects, clip) {
  // Clip underlying ratings at their limits; temporary modifiers can carry the
  // displayed total beyond them. Expiration is not part of an activity effect.
  const next = { ...state, effects: state.effects.filter(effect => effect.years > 1) };
  const before = clip ? effectiveStats(next) : null;
  const after = clip ? effectiveStats({ ...next, stats: { ...state.stats,
    ...Object.fromEntries(Object.entries(effects).map(([stat, change]) => [stat, changedRating(state.stats[stat], change)])),
  } }) : null;
  return Object.entries(effects).map(([stat, change]) => ({ stat, change: clip ? after[stat] - before[stat] : change, group: 'you' }));
}

function toddlerChoiceEntries(state, activity, points, clip) {
  const candidate = { ...state, focus: { ...state.focus, [activity]: points } };
  const contributions = toddlerActivityEffects(candidate)[activity];
  const effects = Object.fromEntries(Object.entries(contributions).map(([stat, change]) => {
    const balanced = { ...candidate, focus: { ...candidate.focus, [activity]: toddlerActivityNeutral(activity, stat) } };
    return [stat, change - toddlerActivityEffects(balanced)[activity][stat]];
  }));
  const entries = personalChoiceEntries(state, effects, clip);
  if (activity === 'family') {
    for (const parent of caregivers(state)) {
      const stability = wellbeingResponse(parent, 'stability', PARENT_FAMILY_STABILITY_GAIN * focusEffect(points));
      const relationship = PARENT_FAMILY_RELATIONSHIP_GAIN * focusEffect(points);
      entries.push({ stat: 'stability', parentId: parent.id, group: 'others', change: clip ? changedRating(parent.stats.stability, stability) - parent.stats.stability : stability });
      entries.push({ stat: 'relationship', parentId: parent.id, group: 'relationships', change: clip ? bounded(parent.relationship, relationship) : relationship });
    }
  }
  return entries;
}

// Each row shows its own contribution relative to the balanced activity points.
// Comparing all 0–4 choices keeps the signs stable while reallocating a budget;
// unrelated household changes and unused-point rest do not belong to any row.
export function toddlerChoiceImpacts(state, activity) {
  if (state.age < 2 || state.age >= 5 || !Object.hasOwn(TODDLER_FOCUS, activity) || state.ended || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const points = Math.max(0, Math.min(focusLimits(state)[activity], state.focus[activity] ?? DEFAULT_FOCUS));
  const entries = toddlerChoiceEntries(state, activity, points, true);
  return proportionalChoiceEntries(entries, points, entry => toddlerActivitySteps(activity, entry.stat, points));
}

// Each sign represents an equal raw contribution for this activity/person/stat.
// Aptitude and current-rating response affect the outcome, never this scale.
function proportionalChoiceEntries(entries, points, stepsFor = () => focusEffect(points)) {
  return entries.filter(entry => nonzero(entry.change)).map(entry => ({
    ...entry, level: Math.abs(stepsFor(entry)),
  }));
}

function schoolChoiceEntries(state, area, points, clip) {
  const candidate = { ...state, focus: { ...state.focus, [area]: points } };
  const entries = personalChoiceEntries(state, schoolFocusEffects(candidate, area), clip);
  if (area === 'family') {
    for (const parent of caregivers(state)) {
      const stability = wellbeingResponse(parent, 'stability', PARENT_FAMILY_STABILITY_GAIN * focusEffect(points));
      const relationship = PARENT_FAMILY_RELATIONSHIP_GAIN * focusEffect(points);
      entries.push({ stat: 'stability', parentId: parent.id, group: 'others', change: clip ? changedRating(parent.stats.stability, stability) - parent.stats.stability : stability });
      entries.push({ stat: 'relationship', parentId: parent.id, group: 'relationships', change: clip ? bounded(parent.relationship, relationship) : relationship });
    }
  }
  return entries;
}

// School and college show only each choice's own decision contribution. Keep
// the same complete 0–4 reference as toddler rows when an event limits a choice.
export function schoolChoiceImpacts(state, area) {
  if (state.age < 5 || state.age >= 18 && state.education.status !== 'college'
      || !['work', 'social', 'family', 'self'].includes(area) || state.ended
      || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const points = Math.max(0, Math.min(focusLimits(state)[area], state.focus[area] ?? 0));
  const entries = schoolChoiceEntries(state, area, points, true);
  return proportionalChoiceEntries(entries, points);
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
  // Evaluate with next year's retained modifiers, clipping only the underlying
  // rating and excluding the independent effect of a modifier expiring.
  const next = { ...state, effects: state.effects.filter(effect => effect.years > 1) };
  const before = clip ? effectiveStats(next) : null;
  const after = clip ? effectiveStats({ ...next, stats: { ...state.stats,
    ...Object.fromEntries(Object.entries(effects).map(([stat, change]) => [stat, changedRating(state.stats[stat], change)])),
  } }) : null;
  for (const [stat, change] of Object.entries(effects)) {
    entries.push({ stat, change: clip ? after[stat] - before[stat] : change, group: 'you' });
  }
  for (const entry of entries) {
    if (!entry.parentId) continue;
    const parent = caregivers(state).find(person => person.id === entry.parentId);
    if (entry.stat === 'stability') {
      const effect = wellbeingResponse(parent, 'stability', [.2, 0, -.6, -1.2, -1.8][level - 1]);
      entry.change = clip ? changedRating(parent.stats.stability, effect) - parent.stats.stability : effect;
    } else if (entry.stat === 'relationship') {
      const effect = YEARLY_DECISION_SCALE * .2 * (level - 3);
      entry.change = clip ? bounded(parent.relationship, effect) : effect;
    }
  }
  return entries;
}

function adultFocusEntries(state, clip) {
  const career = JOBS.find(job => job.id === state.jobId);
  const effects = focusChoiceEffects(state, career);
  const unemployedStrain = !career && state.education.status !== 'college'
    ? wellbeingResponse(state, 'stability', -.15 * Math.max(0, focusEffect(state.focus.work))) : 0;
  const entries = personalChoiceEntries(state, effects, clip);
  const stability = entries.find(entry => entry.stat === 'stability');
  if (unemployedStrain) stability.change = clip
    ? changedRating(changedRating(state.stats.stability, effects.stability), unemployedStrain) - state.stats.stability
    : stability.change + unemployedStrain;
  const effort = focusEffect(state.focus.family);
  for (const parent of caregivers(state)) {
    const stability = wellbeingResponse(parent, 'stability', PARENT_FAMILY_STABILITY_GAIN * effort);
    const relationship = PARENT_FAMILY_RELATIONSHIP_GAIN * effort;
    entries.push({ stat: 'stability', parentId: parent.id, group: 'others', change: clip ? changedRating(parent.stats.stability, stability) - parent.stats.stability : stability });
    entries.push({ stat: 'relationship', parentId: parent.id, group: 'relationships', change: clip ? bounded(parent.relationship, relationship) : relationship });
  }
  return entries;
}

function adultFocusLevel(state, entry) {
  if (entry.parentId) return Math.abs(focusEffect(state.focus.family));
  const career = JOBS.find(job => job.id === state.jobId);
  const coefficients = standardFocusCoefficients(state, career);
  if (!career && state.education.status !== 'college' && focusEffect(state.focus.work) > 0) coefficients.work.stability -= .15;
  const units = Object.entries(coefficients).reduce((sum, [area, effects]) => sum + Math.sign(effects[entry.stat] || 0) * focusEffectStrength(coefficients, area, entry.stat) * focusEffect(state.focus[area]), 0);
  return Math.min(6, Math.max(1, Math.abs(units)));
}

// Qualitative signs compare options for the same person and stat, never a fixed
// point cutoff shared by unrelated stats. Clipping hides impossible changes but
// does not turn a stronger crying choice into a weaker-looking one near a limit.
export function choiceImpacts(state) {
  if (state.ended || state.alive === false || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return [];
  const infant = state.age < 2;
  if (!infant) {
    const limits = focusLimits(state);
    state = { ...state, focus: Object.fromEntries(Object.entries(limits).map(([area, cap]) => [area, Math.max(0, Math.min(cap, state.focus[area] ?? DEFAULT_FOCUS))])) };
  }
  const entries = infant ? cryEntries(state, state.cryLevel, true) : adultFocusEntries(state, true);
  const comparisons = infant
    ? [1, 2, 3, 4, 5].map(level => cryEntries(state, level, false))
    : [];
  const raw = infant ? cryEntries(state, state.cryLevel, false) : adultFocusEntries(state, false);
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
      level = adultFocusLevel(state, entry);
    }
    return { ...entry, level };
  });
}
