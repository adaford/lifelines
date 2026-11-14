// Low ratings should produce noticeable ordinary experiences without making
// rare affinity changes or major crises more common. These are game odds.
export const LOW_STAT_EVENT_CAP = .6;

export function lowStatEventTarget(value) {
  if (!Number.isFinite(value) || value >= 4) return 0;
  const rating = Math.max(0, value);
  return rating <= 2 ? .6 - .05 * rating : .25 * (4 - rating);
}

const hazard = chance => -Math.log1p(-chance);
const capacity = hazard(LOW_STAT_EVENT_CAP);

// Solve sum(min(scale * weight, capacity)) = target without iterative fitting.
// Saturated events keep their cap while the remaining hazard is shared in the
// same proportions as their original independent chances.
function requiredScale(indices, hazards, target) {
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

// Catalog and rates are aligned. All calculations use the original chances so
// a shared event takes the strongest required boost, never multiplied boosts.
// The returned copies are safe for forecasts, odds displays and saved lives.
export function boostLowStatRates(catalog, rates, values) {
  const result = rates.map(rate => ({ ...rate }));
  const hazards = rates.map(rate => Number.isFinite(rate.chance) && rate.chance > 0 && rate.chance <= 1 ? hazard(rate.chance) : 0);
  const scales = rates.map(() => 1);
  const groups = new Map();
  for (const [index, event] of catalog.entries()) {
    // Matrix additions provide variety at bounded base rates. Promoting each
    // newly covered relative/stat pair to its own floor would saturate the
    // shared five-event cap and crowd out the original ordinary incidents.
    if (!event || event.rare || event.supplemental || !hazards[index]) continue;
    const keys = new Set((event.statFactors || []).filter(([, direction]) => direction === 'low').map(([key]) => key));
    for (const key of keys) {
      if (!lowStatEventTarget(values?.[key])) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(index);
    }
  }
  for (const [key, indices] of groups) {
    const target = hazard(lowStatEventTarget(values[key]));
    const current = indices.reduce((sum, index) => sum + hazards[index], 0);
    if (current >= target) continue;
    const adjustable = indices.filter(index => catalog[index].severity !== 'major');
    if (!adjustable.length) continue;
    const fixed = indices.filter(index => catalog[index].severity === 'major').reduce((sum, index) => sum + hazards[index], 0);
    const scale = requiredScale(adjustable, hazards, target - fixed);
    for (const index of adjustable) scales[index] = Math.max(scales[index], scale);
  }
  for (const [index, scale] of scales.entries()) {
    if (scale > 1) result[index].chance = Math.max(rates[index].chance, Math.min(LOW_STAT_EVENT_CAP, -Math.expm1(-hazards[index] * scale)));
  }
  return result;
}
