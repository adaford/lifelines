// Household career progression is a fictional game model, not measured employment
// or income data. Continuous progress supports the visible 1–10 lifestyle score.
// Keep random draws caller-owned so saves and annual previews stay deterministic.
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const round = value => Math.round(clamp(value, 1, 10) * 10000) / 10000;
const statuses = new Set(['employed', 'unemployed', 'retired']);

export function initialParentCareer(person, focus = 3) {
  return {
    focus: clamp(Math.round(finite(focus, 3)), 0, 5),
    status: person.age >= 65 ? 'retired' : 'employed',
    progress: clamp(finite(person.lifestyle, 4), 1, 10),
    years: Math.max(0, Math.floor(finite(person.age, 22)) - 22),
  };
}

function currentCareer(person) {
  const initial = initialParentCareer(person);
  const saved = person.career || {};
  return {
    focus: clamp(Math.round(finite(saved.focus, initial.focus)), 0, 5),
    status: statuses.has(saved.status) ? saved.status : initial.status,
    progress: clamp(finite(saved.progress, initial.progress), 1, 10),
    years: Math.max(0, Math.floor(finite(saved.years, initial.years))),
  };
}

function routineGain(career) {
  if (career.status === 'unemployed') return -.045;
  // Comfortable households still improve, but advancement slows at the top.
  const headroom = clamp((10 - career.progress) / 5, .2, 1);
  return (.06 + .03 * career.focus) * headroom;
}

// This preview excludes discrete promotion/job-loss/re-employment events.
export function careerForecast(person) {
  const career = currentCareer(person);
  if (person.alive === false) return career;
  if (person.age >= 65) career.status = 'retired';
  if (career.status === 'retired') return career;
  career.progress = round(career.progress + routineGain(career));
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
  const health = clamp(finite(person.stats?.health, 7), 1, 10);
  const stability = clamp(finite(person.stats?.stability, 7), 1, 10);
  const name = person.name || 'Your parent';

  if (career.status === 'unemployed') {
    const recoveryChance = clamp(.20 + .04 * career.focus + .01 * (health - 5) + .01 * (stability - 5), .20, .50);
    if (draw() < recoveryChance) {
      career.status = 'employed';
      career.progress = round(career.progress + .35 + .4 * draw());
      return { career, event: { title: 'Back at work', text: `${name} found a new job. Your household is starting to recover.`, kind: 'career' } };
    }
    career.progress = round(career.progress + routineGain(career) + noise() * .025);
    return { career, event: null };
  }

  const lossChance = clamp(.023 - .0015 * career.focus + .001 * (7 - health) + .001 * (7 - stability), .01, .03);
  if (draw() < lossChance) {
    career.status = 'unemployed';
    career.progress = round(career.progress - 1 - draw());
    return { career, event: { title: 'A parent lost their job', text: `${name} lost their job, putting pressure on your household's lifestyle.`, kind: 'career' } };
  }

  career.progress = round(career.progress + routineGain(career) + noise() * (.08 + .012 * career.focus));
  career.years++;
  const promotionChance = .015 + .005 * career.focus;
  if (draw() < promotionChance) {
    career.progress = round(career.progress + .25 + .35 * draw());
    return { career, event: { title: 'A parent moved ahead at work', text: `${name} earned a promotion, bringing more comfort to your household.`, kind: 'career' } };
  }
  return { career, event: null };
}
