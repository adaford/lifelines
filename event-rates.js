// Event odds shared by every catalog. Game odds, not real-world estimates; the
// knobs live in EVENT_BALANCE (balance.js). All functions are pure.
import { EVENT_BALANCE as B } from './balance.js?v=realistic-lifespans';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const hazard = chance => -Math.log1p(-chance);

// How far a rating sits past neutral in an event's direction, from -1 (the
// opposite extreme) to 1 (0 for a low event, 10 for a high event).
export function statDrive(value, direction) {
  if (!Number.isFinite(value)) return 0;
  const distance = direction === 'low' ? B.neutralRating - value : value - B.neutralRating;
  return clamp(distance / B.neutralRating, -1, 1);
}

// Chance multiplier for one stat factor. Quiet at neutral, rising along a
// power curve toward the extreme, fading to zero toward the opposite end.
export function statEventFactor(value, direction) {
  const drive = statDrive(value, direction);
  return drive >= 0 ? B.factorAtNeutral + (B.factorAtExtreme - B.factorAtNeutral) * drive ** B.factorCurve
    : B.factorAtNeutral * (1 + drive) ** B.factorCurve;
}

// The chance that at least one event caused by this rating happens in a year.
export function statPoolTarget(value, direction) {
  const distance = statDrive(value, direction) * B.neutralRating;
  if (!(distance > B.poolStart)) return 0;
  const reach = clamp((distance - B.poolStart) / (B.neutralRating - B.poolStart), 0, 1) ** B.poolCurve;
  return (direction === 'low' ? B.lowPoolMax : B.highPoolMax) * reach;
}
export const lowStatEventTarget = value => statPoolTarget(value, 'low');
export const LOW_STAT_EVENT_CAP = B.poolEventCap;

// Keep retired definitions available for saved history and pending decisions.
// Only future rolls require an authored consequence; a choice may still offer
// declining an otherwise meaningful opportunity without a rating change.
export function authoredConsequence(outcome) {
  if (['statChanges', 'playerChanges', 'subjectChanges', 'aptitudeChanges', 'modifiers']
    .some(field => Object.values(outcome[field] || {}).some(Boolean))) return true;
  if (outcome.relationship || outcome.fameChange || outcome.fameSupport || outcome.fameAction) return true;
  return outcome.years > 0 && (outcome.householdLifestyle || outcome.focusPoints
    || ['focusLimits', 'focusCapacity', 'focusMinimums'].some(field => Object.values(outcome[field] || {}).some(stage => Object.keys(stage).length)));
}
export function eventHasConsequence(event) {
  return event.id === 'household_parent_abandonment'
    || (event.choices?.length ? event.choices.some(authoredConsequence) : authoredConsequence(event));
}

// 'stat': caused by a rating, a relationship or school grades. 'fame': fame has
// its own odds. 'random': everything else, including focus-driven incidents.
const gradeEvent = event => ['good_grades', 'poor_grades'].includes(event.id) || (event.conditions || []).some(condition => /SchoolGrade$/.test(condition));
export function eventClass(event) {
  if (event.requiresFame || event.fameKind) return 'fame';
  return event.statFactors?.length || event.relationshipFactor || event.maxStats || event.minStability !== undefined
    || event.maxStability !== undefined || event.id === 'household_parent_abandonment' || gradeEvent(event) ? 'stat' : 'random';
}
// +1 good, -1 bad, 0 for a choice or a balanced outcome, from the signed effects.
const valences = new WeakMap();
export function eventValence(event) {
  if (valences.has(event)) return valences.get(event);
  const sum = values => Object.values(values || {}).reduce((total, amount) => total + (Number.isFinite(amount) ? amount : 0), 0);
  const staged = values => Object.values(values || {}).reduce((total, stage) => total + sum(stage), 0);
  const net = event.choices?.length ? 0 : sum(event.statChanges) + sum(event.playerChanges) + sum(event.subjectChanges)
    + sum(event.modifiers) + (event.relationship || 0) + (event.householdLifestyle || 0) + (event.fameSupport || 0)
    + (event.focusPoints || 0) + staged(event.focusCapacity) - staged(event.focusMinimums);
  const valence = event.choices?.length ? 0 : net > 0 ? 1 : net < 0 ? -1 : event.kind === 'positive' ? 1 : event.kind === 'negative' ? -1 : 0;
  valences.set(event, valence);
  return valence;
}

// Solve sum(min(scale * weight, capacity)) = target without iterative fitting.
// Saturated events keep their cap while the remaining hazard is shared in the
// same proportions as their original independent chances.
function requiredScale(indices, hazards, target, capacity) {
  let remaining = target;
  let weight = indices.reduce((sum, index) => sum + hazards[index], 0);
  const ordered = indices.map(index => ({ weight: hazards[index], limit: capacity / hazards[index] }))
    .sort((a, b) => a.limit - b.limit);
  for (const entry of ordered) {
    const scale = remaining / weight;
    if (scale <= entry.limit) return Math.max(1, scale);
    remaining -= capacity;
    weight -= entry.weight;
  }
  return ordered.at(-1)?.limit ?? 1;
}

// Catalog and rates are aligned. Every rating far enough from neutral gets a
// pool of the live, non-rare, non-major events it causes (low ratings: their
// low factors, high ratings: their high factors). A thin pool is scaled up so
// at least one of them happens with statPoolTarget's chance, each member capped
// at poolEventCap so one event cannot take the whole pool. A shared event takes
// the strongest required boost, never multiplied boosts. Returns copies.
export function boostStatRates(catalog, rates, values, targetScale = 1) {
  const result = rates.map(rate => ({ ...rate }));
  const hazards = rates.map(rate => Number.isFinite(rate.chance) && rate.chance > 0 && rate.chance < 1 ? hazard(rate.chance) : 0);
  const scales = rates.map(() => 1);
  const capacity = hazard(B.poolEventCap);
  const groups = new Map();
  for (const [index, event] of catalog.entries()) {
    if (!event || event.rare || !hazards[index] || !eventHasConsequence(event)) continue;
    for (const [key, direction] of event.statFactors || []) {
      const group = `${key}:${direction}`;
      if (!statPoolTarget(values?.[key], direction)) continue;
      if (!groups.has(group)) groups.set(group, []);
      if (!groups.get(group).includes(index)) groups.get(group).push(index);
    }
  }
  for (const [group, indices] of groups) {
    const [key, direction] = group.split(':');
    const target = hazard(targetScale * statPoolTarget(values[key], direction));
    if (indices.reduce((sum, index) => sum + hazards[index], 0) >= target) continue;
    const adjustable = indices.filter(index => catalog[index].severity !== 'major');
    if (!adjustable.length) continue;
    const fixed = indices.filter(index => catalog[index].severity === 'major').reduce((sum, index) => sum + hazards[index], 0);
    const scale = requiredScale(adjustable, hazards, target - fixed, capacity);
    for (const index of adjustable) scales[index] = Math.max(scales[index], scale);
  }
  for (const [index, scale] of scales.entries()) {
    if (scale > 1) result[index].chance = Math.max(rates[index].chance, Math.min(B.poolEventCap, -Math.expm1(-hazards[index] * scale)));
  }
  return result;
}
export const boostLowStatRates = boostStatRates;

// Year-level balance across all catalogs: an event that happened last year is
// much less likely to repeat; random events are scaled to an even split of good
// and bad outcomes, then to at most one random event per statToRandomRatio
// stat-driven events. Fame odds are left to fame rules. Returns copies.
export function balanceEventOdds(rolls, eventFor, recentIds = []) {
  const recent = new Set(recentIds.map(id => String(id).split(':')[0]));
  const rows = rolls.map(roll => {
    const event = eventFor(roll);
    return { roll: { ...roll, chance: recent.has(event.id) ? roll.chance * B.repeatFactor : roll.chance }, event, kind: eventClass(event), valence: eventValence(event) };
  });
  const total = test => rows.filter(test).reduce((sum, row) => sum + row.roll.chance, 0);
  const positive = total(row => row.kind === 'random' && row.valence > 0);
  const negative = total(row => row.kind === 'random' && row.valence < 0);
  const share = B.randomPositiveShare;
  const positiveScale = !negative ? B.oneSidedRandomScale : Math.min(1, share / (1 - share) * negative / positive);
  const negativeScale = !positive ? B.oneSidedRandomScale : Math.min(1, (1 - share) / share * positive / negative);
  for (const row of rows) if (row.kind === 'random' && row.valence) row.roll.chance *= row.valence > 0 ? positiveScale : negativeScale;
  const stat = total(row => row.kind === 'stat');
  const random = total(row => row.kind === 'random');
  const ratioScale = random ? Math.min(1, stat / (B.statToRandomRatio * random)) : 1;
  for (const row of rows) if (row.kind === 'random') row.roll.chance *= ratioScale;
  return rows.map(row => row.roll);
}
