import { incomeForLifestyle } from './lifestyle.js?v=perk-affinity-overflow';

// All career balance knobs live here. Potential describes the scope of the
// career ladder; individual skill, focused work and experience determine use.
export const CAREER_BALANCE = {
  fitWeight: .7,
  focusWeight: .2,
  experienceWeight: .1,
  experienceYears: 20,
  advancementRate: .08,
  advancementThreshold: .35,
  remainingOpportunityFloor: .4,
  entryPayFloor: .65,
  entryPayPerformance: .5,
  advancedPayPerformanceExponent: 1.5,
  legacyYearsToFullProgress: 40,
};
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const rounded = value => Math.round(value * 1000000) / 1000000;

export function careerFit(job, stats = {}) {
  if (!job) return 0;
  const weights = Object.entries(job.weights || {}).filter(([, weight]) => Number.isFinite(weight) && weight > 0);
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  if (!total) return 0;
  return clamp(weights.reduce((sum, [stat, weight]) => sum + clamp(finite(stats[stat], 5), 0, 10) / 10 * weight, 0) / total);
}

// Used only when an existing employed life next progresses. Reading a save or
// drawing the UI must not materialize this optional field into stored data.
export function initialCareerProgress(years = 0) {
  return rounded(clamp(Math.max(0, finite(years)) / CAREER_BALANCE.legacyYearsToFullProgress));
}

export function careerYear({ job, stats = {}, focus = 2, years = 0, progress } = {}) {
  if (!job) return { performance: 0, progress: 0, income: 0 };
  const current = clamp(finite(progress, initialCareerProgress(years)));
  const effort = clamp(finite(focus, 2), 0, 4) / 4;
  const experience = clamp(Math.max(0, finite(years)) / CAREER_BALANCE.experienceYears);
  const performance = rounded(clamp(careerFit(job, stats) * CAREER_BALANCE.fitWeight
    + effort * CAREER_BALANCE.focusWeight + experience * CAREER_BALANCE.experienceWeight));
  const capability = clamp((performance - CAREER_BALANCE.advancementThreshold) / (1 - CAREER_BALANCE.advancementThreshold));
  const potential = clamp(finite(job.advancementPotential, 5), 0, 10);
  // A shorter ladder can be traversed sooner; a broader path has a higher pay
  // ceiling but takes sustained work. No focus or no competent performance
  // means no automatic advancement merely because another year has elapsed.
  const ladderLength = .65 + .035 * potential;
  const opportunity = CAREER_BALANCE.remainingOpportunityFloor + (1 - CAREER_BALANCE.remainingOpportunityFloor) * (1 - current);
  const next = rounded(clamp(current + (potential > 0 ? CAREER_BALANCE.advancementRate * effort * capability * opportunity / ladderLength : 0)));
  const ceiling = Math.max(0, finite(job.maxSalary, incomeForLifestyle(finite(job.maxLifestyle, 10))));
  const entry = Math.min(ceiling, Math.max(0, finite(job.baseSalary)) * (CAREER_BALANCE.entryPayFloor + CAREER_BALANCE.entryPayPerformance * performance));
  const income = Math.floor(clamp(entry + (ceiling - entry) * next * performance ** CAREER_BALANCE.advancedPayPerformanceExponent, 0, ceiling));
  return { performance: rounded(performance), progress: next, income };
}
