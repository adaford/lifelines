// Household career progression is a fictional game model, not measured employment
// or income data. Continuous progress supports the visible 0–10 lifestyle score.
// Keep random draws caller-owned so saves and annual previews stay deterministic.
import { JOBS } from './jobs.js?v=short-events-toddler-order';
import { careerYear, initialCareerProgress } from './career-rules.js?v=short-events-toddler-order';
import { lifestyleChange, roundLifestyle } from './lifestyle.js?v=short-events-toddler-order';
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const round = roundLifestyle;
const statuses = new Set(['employed', 'unemployed', 'retired']);

export function parentCareerJob(person) {
  const saved = JOBS.find(job => job.id === person.career?.jobId);
  if (saved) return saved;
  const candidates = JOBS.filter(job => job.minAge <= finite(person.age, 30)
    && Object.entries(job.requirements).every(([stat, minimum]) => finite(person.stats?.[stat], 5) >= minimum));
  const score = job => {
    let value = 2166136261;
    for (const letter of `${person.id || person.name || 'parent'}:career:${job.id}`) value = Math.imul(value ^ letter.charCodeAt(0), 16777619) >>> 0;
    // Prefer plausible support levels without manufacturing a retrospective
    // occupation or recomputing saved household resources during a load.
    return value / 4294967296 - Math.abs(job.baseLifestyle - finite(person.lifestyle, 4)) * .2;
  };
  return candidates.sort((left, right) => score(right) - score(left) || left.id.localeCompare(right.id))[0] || JOBS.find(job => job.id === 'retail');
}

export function initialParentCareer(person, focus = 3, options = {}) {
  const career = {
    focus: clamp(Math.round(finite(focus, 3)), 0, 5),
    status: person.age >= 65 ? 'retired' : 'employed',
    progress: clamp(finite(person.lifestyle, 4), 0, 10),
    years: Math.max(0, Math.floor(finite(person.age, 22)) - 22),
  };
  if (options.assignJob) {
    career.jobId = parentCareerJob(person).id;
    career.advancement = initialCareerProgress(career.years);
  }
  return career;
}

function currentCareer(person) {
  const initial = initialParentCareer(person);
  const saved = person.career || {};
  const career = {
    focus: clamp(Math.round(finite(saved.focus, initial.focus)), 0, 5),
    status: statuses.has(saved.status) ? saved.status : initial.status,
    progress: clamp(finite(saved.progress, initial.progress), 0, 10),
    years: Math.max(0, Math.floor(finite(saved.years, initial.years))),
  };
  if (saved.jobId !== undefined) career.jobId = saved.jobId;
  if (saved.advancement !== undefined) career.advancement = saved.advancement;
  if (person.alive !== false && finite(person.age, 22) < 65 && career.status !== 'retired') {
    career.jobId = parentCareerJob(person).id;
    career.advancement = clamp(finite(saved.advancement, initialCareerProgress(career.years)), 0, 1);
  }
  return career;
}

function routineGain(career, person) {
  if (career.status === 'unemployed') return -.045;
  const job = JOBS.find(job => job.id === career.jobId);
  const year = careerYear({ job, stats: person.stats, focus: career.focus * 4 / 5, years: career.years, progress: career.advancement });
  const advancement = Math.max(0, year.progress - career.advancement);
  career.advancement = year.progress;
  // A job's opportunity supplies the contribution. A rating above its cap is
  // retained (it may be inherited support), but cannot grow through this job.
  return advancement * Math.max(0, job.maxLifestyle - job.baseLifestyle);
}

function changeProgress(career, amount) {
  if (!amount) return;
  const job = JOBS.find(job => job.id === career.jobId);
  if (amount > 0 && career.status === 'employed' && career.progress >= job.maxLifestyle) return;
  const cap = amount > 0 && career.status === 'employed' ? Math.max(career.progress, job.maxLifestyle) : 10;
  career.progress = Math.min(cap, round(career.progress + lifestyleChange(career.progress, amount)));
}

// This preview excludes discrete promotion/job-loss/re-employment events.
export function careerForecast(person) {
  const career = currentCareer(person);
  if (person.alive === false) return career;
  if (person.age >= 65) career.status = 'retired';
  if (career.status === 'retired') return career;
  changeProgress(career, routineGain(career, person));
  if (career.status === 'employed') career.years++;
  return career;
}

export function advanceParentCareer(person, { random = () => .5, normal = () => 0 } = {}) {
  const career = currentCareer(person);
  if (person.alive === false) return { career, event: null };
  if (person.age >= 65) career.status = 'retired';
  if (career.status === 'retired') return { career, event: null };
  const draw = () => clamp(finite(random(), .5), 0, 1);
  const noise = () => clamp(finite(normal(), 0), -3, 3);
  const health = clamp(finite(person.stats?.health, 5), 0, 10);
  const stability = clamp(finite(person.stats?.stability, 5), 0, 10);
  const name = person.name || 'Your parent';

  if (career.status === 'unemployed') {
    const recoveryChance = clamp(.20 + .04 * career.focus + .01 * (health - 5) + .01 * (stability - 5), .20, .50);
    if (draw() < recoveryChance) {
      career.status = 'employed';
      changeProgress(career, .35 + .4 * draw());
      return { career, event: { title: 'Back at work', text: `${name} found a new job.`, kind: 'career' } };
    }
    changeProgress(career, routineGain(career, person) * (1 + noise() * .2));
    return { career, event: null };
  }

  const lossChance = clamp(.023 - .0015 * career.focus + .001 * (5 - health) + .001 * (5 - stability), .01, .03);
  if (draw() < lossChance) {
    career.status = 'unemployed';
    changeProgress(career, -1 - draw());
    return { career, event: { title: 'A parent lost their job', text: `${name} lost their job.`, kind: 'career' } };
  }

  changeProgress(career, routineGain(career, person) * (1 + noise() * .2));
  career.years++;
  const promotionChance = .015 + .005 * career.focus;
  if (draw() < promotionChance) {
    changeProgress(career, .25 + .35 * draw());
    return { career, event: { title: 'A parent moved ahead at work', text: `${name} earned a promotion.`, kind: 'career' } };
  }
  return { career, event: null };
}
