// Lifelines: deterministic, browser-independent simulation rules.
// All public actions mutate their state and return { ok, reason? }.
import { JOBS } from './jobs.js?v=careers-100';
export { JOBS, JOB_CATEGORIES } from './jobs.js?v=careers-100';

export const SKILLS = [
  { key: 'intelligence', label: 'Intelligence', color: '#9cb9ff' },
  { key: 'strength', label: 'Strength', color: '#efb490' },
  { key: 'attractiveness', label: 'Attractiveness', color: '#e7aacb' },
  { key: 'social', label: 'Social ability', color: '#e6ca81' },
  { key: 'creativity', label: 'Creativity', color: '#b9a3e8' },
  { key: 'discipline', label: 'Discipline', color: '#91cebf' },
];
const CORE = SKILLS.map(s => s.key);
const STAT_KEYS = [...CORE, 'health', 'stability', 'relaxation'];
const FOCUS_KEYS = ['work', 'social', 'family', 'self'];
const FIRST_NAMES = ['Alex', 'Jamie', 'Rowan', 'Sage', 'Riley', 'Morgan', 'Avery', 'Jordan', 'Taylor', 'Quinn', 'Casey', 'Robin', 'Sam', 'Ellis', 'Charlie', 'Reese'];
const LAST_NAMES = ['Bennett', 'Park', 'Rivera', 'Morgan', 'Reed', 'Patel', 'Santos', 'Chen', 'Walker', 'Brooks'];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round = n => Math.round(n * 100) / 100;
const ok = () => ({ ok: true });
const fail = reason => ({ ok: false, reason });
const clone = value => JSON.parse(JSON.stringify(value));

// These ten events are mutually exclusive within a year. Their displayed
// chances are absolute probabilities, leaving the remainder for a quiet year.
export const EVENTS = [
  { id: 'injury', name: 'An unexpected injury', kind: 'negative', minAge: 3, years: 2, modifiers: { strength: -1.4, health: -1 }, description: 'An awkward fall slows you down. Recovery will take some time.' },
  { id: 'illness', name: 'Under the weather', kind: 'negative', minAge: 0, years: 1, modifiers: { health: -1.4, relaxation: -.6 }, description: 'A lingering illness makes ordinary days harder. Rest helps you through it.' },
  { id: 'burnout', name: 'Running on empty', kind: 'negative', minAge: 13, years: 2, modifiers: { discipline: -1.2, intelligence: -.6, stability: -1.2 }, description: 'The pressure catches up with you. You need time and space to recover.' },
  { id: 'crisis', name: 'A difficult mental health year', kind: 'negative', minAge: 13, years: 2, modifiers: { social: -1.3, discipline: -1.2, stability: -1.5 }, description: 'Distress disrupts your routines and relationships. Support and self-care matter more this year.' },
  { id: 'conflict', name: 'A strained friendship', kind: 'negative', minAge: 6, years: 1, modifiers: { social: -.8, stability: -.7 }, description: 'A misunderstanding creates distance. Rebuilding trust will take attention.' },
  { id: 'mentor', name: 'Someone believes in you', kind: 'positive', minAge: 3, years: 3, modifiers: { intelligence: .8, discipline: .7 }, description: 'A patient mentor notices your potential and helps you find your footing.' },
  { id: 'friendship', name: 'A real connection', kind: 'positive', minAge: 3, years: 2, modifiers: { social: .8, stability: .8, relaxation: .6 }, description: 'A new friendship makes life feel a little lighter.' },
  { id: 'windfall', name: 'A little good fortune', kind: 'positive', minAge: 18, years: 0, modifiers: {}, description: 'An unexpected turn of good fortune gives your family\'s security a welcome boost.' },
  { id: 'inspiration', name: 'A spark of inspiration', kind: 'positive', minAge: 3, years: 2, modifiers: { creativity: 1.2, relaxation: .7 }, description: 'Time for yourself leads to a new interest that lights you up.' },
  { id: 'breakthrough', name: 'Your work pays off', kind: 'positive', minAge: 6, years: 2, modifiers: { discipline: .7, intelligence: .6 }, description: 'A challenge finally clicks. Your confidence grows with the result.' },
];

function random(state) {
  state.rng = (state.rng + 0x6D2B79F5) >>> 0;
  let value = state.rng;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
}
function integer(state, low, high) { return low + Math.floor(random(state) * (high - low + 1)); }
function pick(state, array) { return array[integer(state, 0, array.length - 1)]; }
function uid(state, prefix) { state.nextId += 1; return `${prefix}-${state.nextId}`; }
function surname(name) { return name.trim().split(/\s+/).at(-1); }
function personName(state, lastName) { return `${pick(state, FIRST_NAMES)} ${lastName || pick(state, LAST_NAMES)}`; }
function log(state, title, text, kind = 'neutral') {
  state.history.unshift({ id: uid(state, 'memory'), age: state.age, generation: state.generation, title, text, kind });
  state.history = state.history.slice(0, 500);
}
function addStat(person, key, amount) { person.stats[key] = round(clamp(person.stats[key] + amount, 1, 10)); }
function grow(person, key, amount) { addStat(person, key, amount * (1 + person.aptitudes[key] * .18)); }
function randomStats(state, baby = false) {
  const result = Object.fromEntries(CORE.map(key => [key, round(baby ? 1 + random(state) * .5 : 3 + random(state) * 5)]));
  return { ...result, health: round(7 + random(state) * 2.5), stability: round(10 - random(state) * 2), relaxation: round(6 + random(state) * 3) };
}
function randomAptitudes(state) { return Object.fromEntries(CORE.map(key => [key, integer(state, -3, 3)])); }
function heightAt(age, adultHeight) {
  if (age === 0) return 50;
  if (age === 1) return 75;
  if (age === 2) return 87;
  return Math.round(87 + (adultHeight - 87) * Math.pow(Math.min(age - 2, 16) / 16, .82));
}
function makeParent(state, lastName) {
  const age = integer(state, 25, 40);
  return { id: uid(state, 'parent'), name: personName(state, lastName), age, stats: randomStats(state), aptitudes: randomAptitudes(state), height: integer(state, 153, 193), alive: true };
}
function active(state) {
  if (state.ended) return fail('This life has ended. Start a new family to play again.');
  if (state.needsSuccession) return fail('Choose a child to continue the family story.');
  return ok();
}

export function createGame({ name, seed } = {}) {
  const initialSeed = Number.isFinite(seed) ? seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
  const state = { version: 3, seed: initialSeed, rng: initialSeed, nextId: 0, id: `life-${initialSeed}`, age: 0, generation: 1,
    name: '', stats: {}, aptitudes: {}, height: 50, adultHeight: 170,
    focus: { work: 3, social: 3, family: 3, self: 3 }, babyChoice: 'quiet',
    parents: [], children: [], siblings: [], money: 0, income: 0, expenses: 0, lifestyle: 1,
    jobId: null, jobYears: 0, performance: 0, schoolProgress: 0, lastChildAge: -1,
    education: { status: 'school', years: 0 }, jobOffers: [],
    effects: [], history: [], lineage: [], ended: false, needsSuccession: false };
  state.name = typeof name === 'string' && name.trim() ? name.trim().slice(0, 50) : personName(state);
  state.parents = [makeParent(state, surname(state.name)), makeParent(state, surname(state.name))];
  const homeLifestyle = integer(state, 2, 8);
  state.parents.forEach(parent => { parent.lifestyle = homeLifestyle; });
  state.lifestyle = homeLifestyle;
  state.stats = randomStats(state, true);
  state.aptitudes = Object.fromEntries(CORE.map(key => [key, clamp(Math.round((state.parents[0].aptitudes[key] + state.parents[1].aptitudes[key]) / 2) + integer(state, -1, 1), -3, 3)]));
  state.adultHeight = clamp(Math.round((state.parents[0].height + state.parents[1].height) / 2) + integer(state, -9, 9), 145, 205);
  log(state, 'A life begins', `${state.name} arrives in the world. For now, a cry or a quiet moment is enough to shape the day.`, 'milestone');
  return state;
}

export function stage(state) {
  return state.age < 3 ? 'baby' : state.age < 13 ? 'child' : state.age < 18 ? 'teen' : state.age < 65 ? 'adult' : 'elder';
}
export function effectiveStats(state) {
  const result = { ...state.stats };
  for (const effect of state.effects) if (effect.years > 0) for (const [key, value] of Object.entries(effect.modifiers)) result[key] += value;
  for (const key of STAT_KEYS) result[key] = round(clamp(result[key], 1, 10));
  return result;
}
export function currentEffects(state) { return state.effects.filter(effect => effect.years > 0); }
export function setFocus(state, key, value) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 3) return fail('Yearly focus unlocks at age 3.');
  if (!FOCUS_KEYS.includes(key) || !Number.isInteger(value) || value < 0 || value > 5) return fail('Each focus must be a whole number from 0 to 5.');
  const total = FOCUS_KEYS.reduce((sum, other) => sum + (other === key ? value : state.focus[other]), 0);
  if (total > 12) return fail('You have 12 focus points. Lower another focus first.');
  state.focus[key] = value;
  return ok();
}
export function setBabyChoice(state, choice) {
  const status = active(state); if (!status.ok) return status;
  if (state.age >= 3) return fail('You have outgrown the baby years.');
  if (choice !== 'cry' && choice !== 'quiet') return fail('Choose crying or staying quiet.');
  state.babyChoice = choice; return ok();
}

export function jobFit(state, job) {
  if (typeof job === 'string') job = JOBS.find(candidate => candidate.id === job);
  if (!job) return 0;
  const stats = effectiveStats(state);
  const totalWeight = Object.values(job.weights).reduce((a, b) => a + b, 0);
  return clamp(Object.entries(job.weights).reduce((sum, [key, weight]) => sum + stats[key] / 10 * weight, 0) / totalWeight, 0, 1);
}

function meetsJobRequirements(state, job) {
  const stats = effectiveStats(state);
  return state.age >= job.minAge && Object.entries(job.requirements).every(([key, value]) => stats[key] >= value);
}
// Offers use a separate hash, leaving the simulation's random sequence intact.
// They are generated once at each decision and then saved with the character.
function offerScore(state, job, graduate) {
  const key = `${state.seed}:${state.id}:${state.generation}:${graduate ? 'graduate' : 'work'}:${job.id}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index++) hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  return (hash >>> 0) / 4294967296 + jobFit(state, job) * .4 + (meetsJobRequirements(state, job) ? .35 : 0);
}
function makeJobOffers(state, graduate = false) {
  const count = graduate ? 15 : 10;
  const pool = JOBS.filter(job => graduate || !job.requiresCollege)
    .sort((a, b) => offerScore(state, b, graduate) - offerScore(state, a, graduate) || a.id.localeCompare(b.id));
  const offers = [];
  const add = job => { if (job && !offers.includes(job.id) && offers.length < count) offers.push(job.id); };
  add(pool.find(job => job.id === state.jobId));
  add(pool.find(job => job.id === 'retail'));
  // A graduate sees a mix of degree careers and other paths. Entry-level
  // work is always available, while some offers remain goals to develop for.
  if (graduate) pool.filter(job => job.requiresCollege).slice(0, 8).forEach(add);
  else pool.filter(job => meetsJobRequirements(state, job)).slice(0, 5).forEach(add);
  pool.forEach(add);
  return offers;
}
export function offeredJobs(state) {
  if (state.age < 18 || state.education.status === 'college') return [];
  return state.jobOffers.map(id => JOBS.find(job => job.id === id)).filter(Boolean);
}
export function needsEducationChoice(state) {
  return state.age >= 18 && state.education.status === 'undecided' && !state.ended && !state.needsSuccession;
}
export function chooseEducation(state, path) {
  const status = active(state); if (!status.ok) return status;
  if (!needsEducationChoice(state)) return fail('Choose your education path when adulthood begins.');
  if (path !== 'college' && path !== 'work') return fail('Choose college or work.');
  state.education = { status: path === 'college' ? 'college' : 'workforce', years: 0 };
  if (path === 'college') {
    state.jobOffers = [];
    state.jobId = null; state.jobYears = 0; state.performance = 0;
    log(state, 'A place to learn', 'You begin four years of college. Study focus develops your abilities, and graduation brings 15 career options.', 'milestone');
  } else log(state, 'Ready for work', 'You choose to begin your working life. Explore your 10 career options and build your skills along the way.', 'career');
  return ok();
}
export function canTakeJob(state, job) {
  const status = active(state); if (!status.ok) return status;
  job = JOBS.find(candidate => candidate.id === (typeof job === 'string' ? job : job?.id));
  if (!job) return fail('That career does not exist.');
  if (state.age < job.minAge) return fail(`Available at age ${job.minAge}.`);
  if (state.education.status === 'college') return fail('Finish your four years of college before choosing a career.');
  if (job.requiresCollege && state.education.status !== 'graduate') return fail('A college degree is required for this career.');
  if (!state.jobOffers.includes(job.id)) return fail('Choose a career from your current offers.');
  const stats = effectiveStats(state);
  const missing = Object.entries(job.requirements).filter(([key, value]) => stats[key] < value);
  if (missing.length) return fail(`Needs ${missing.map(([key, value]) => `${SKILLS.find(s => s.key === key).label.toLowerCase()} ${value}`).join(' and ')}.`);
  if (state.jobId === job.id) return fail('This is already your career.');
  return ok();
}
export function takeJob(state, id) {
  const job = JOBS.find(candidate => candidate.id === id);
  const status = canTakeJob(state, job); if (!status.ok) return status;
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  state.jobId = id; state.jobYears = 0; state.performance = round(jobFit(state, job));
  log(state, 'A new direction', `You start work as a ${job.name.toLowerCase()}. Your skills and career focus will help support your lifestyle.`, 'career');
  return ok();
}
export function quitJob(state) {
  const status = active(state); if (!status.ok) return status;
  if (!state.jobId) return fail('You are not currently employed.');
  const job = JOBS.find(candidate => candidate.id === state.jobId);
  log(state, 'Turning a page', `You leave your role as a ${job.name.toLowerCase()}.`, 'career');
  state.jobId = null; state.jobYears = 0; state.performance = 0;
  return ok();
}

export function eventOdds(state) {
  if (state.ended || state.needsSuccession) return EVENTS.map(event => ({ id: event.id, name: event.name, chance: 0 }));
  const s = effectiveStats(state), f = state.focus;
  const work = state.age < 3 ? 0 : f.work, self = state.age < 3 ? 3 : f.self;
  const chances = {
    injury: .018 + (10 - s.health) * .004 + (5 - self) * .003,
    illness: .025 + (10 - s.health) * .006,
    burnout: .008 + Math.max(0, work - 2) * .015 + (10 - s.stability) * .006 + (5 - self) * .004,
    crisis: .003 + Math.max(0, 8 - s.stability) ** 2 * .004 + Math.max(0, 2 - self) * .005,
    conflict: .018 + (5 - f.social) * .006 + (10 - s.stability) * .003,
    mentor: .018 + work * .012 + f.social * .004,
    friendship: .01 + f.social * .017,
    windfall: .022 + f.social * .003,
    inspiration: .012 + self * .017,
    breakthrough: .012 + work * .016 + s.discipline * .002,
  };
  const result = EVENTS.map(event => ({ id: event.id, name: event.name, chance: state.age >= event.minAge ? chances[event.id] : 0 }));
  const total = result.reduce((sum, event) => sum + event.chance, 0);
  if (total > .72) result.forEach(event => { event.chance *= .72 / total; });
  return result;
}

function growYear(state) {
  if (state.age < 3) {
    const crying = state.babyChoice === 'cry';
    for (const key of CORE) grow(state, key, crying ? .32 : .13);
    addStat(state, 'health', crying ? .12 : .06);
    addStat(state, 'relaxation', crying ? -.1 : .25);
    for (const parent of state.parents.filter(p => p.alive !== false)) addStat(parent, 'stability', crying ? -.7 : .2);
    return;
  }
  const f = state.focus;
  const studying = state.age < 18 || state.education.status === 'college';
  const base = studying ? .1 : state.age < 60 ? .008 : -.018;
  for (const key of CORE) grow(state, key, base);
  grow(state, 'intelligence', f.self * .027 + (studying ? f.work * .055 : f.work * .008));
  grow(state, 'discipline', f.work * .04 + f.self * .012);
  grow(state, 'social', f.social * .055 + f.family * .012);
  grow(state, 'creativity', f.self * .045 + f.social * .009);
  grow(state, 'strength', f.self * .034 - (state.age >= 60 ? .1 : 0));
  grow(state, 'attractiveness', f.self * .012 - (state.age >= 60 ? .025 : 0));
  if (state.jobId) {
    const job = JOBS.find(candidate => candidate.id === state.jobId);
    for (const [key, weight] of Object.entries(job.weights)) grow(state, key, weight * f.work * .028);
  }
  const spare = 12 - Object.values(f).reduce((sum, value) => sum + value, 0);
  addStat(state, 'relaxation', .16 * (f.self - 2) + spare * .06 - Math.max(0, f.work - 3) * .12);
  addStat(state, 'stability', -.1 * (f.work - 2) + f.self * .07 + f.family * .025 + f.social * .018 - (state.stats.relaxation < 4 ? .25 : 0));
  addStat(state, 'health', (f.self - 2) * .035 - (state.age >= 65 ? .1 : 0));
  if (studying) state.schoolProgress = round(clamp(state.schoolProgress + f.work * .9, 0, 100));
  for (const parent of state.parents.filter(p => p.alive !== false)) addStat(parent, 'stability', -.04 + f.family * .025);
}
// Money remains internal: the player sees only a 1–10 lifestyle score.
// Earnings support one tier per 22,000; reserves support logarithmic tiers,
// beginning at 25,000 and then requiring progressively more security.
export function lifestyleFromResources(income = 0, money = 0) {
  const earnings = Number.isFinite(income) ? Math.max(0, income) : 0;
  const reserves = Number.isFinite(money) ? Math.max(0, money) : 0;
  const earnedTier = 1 + Math.floor(earnings / 22000);
  const reserveTier = 1 + Math.floor(Math.log2(1 + reserves / 25000));
  return clamp(Math.max(earnedTier, reserveTier), 1, 10);
}
export function householdLifestyle(state) {
  // Both original parents share one household. A young heir keeps that
  // household's support through guardianship if their parent has died.
  const parent = state.parents.find(person => person.alive !== false) || state.parents[0];
  return Number.isInteger(parent?.lifestyle) ? clamp(parent.lifestyle, 1, 10) : clamp(state.lifestyle, 1, 10);
}
function syncFamilyLifestyles(state) {
  state.lifestyle = state.age < 18 ? householdLifestyle(state) : lifestyleFromResources(state.income, state.money);
  for (const child of state.children) if (child.alive !== false) child.lifestyle = child.age < 18 ? state.lifestyle : lifestyleFromResources(0, child.money);
  for (const sibling of state.siblings) if (sibling.alive !== false) sibling.lifestyle = sibling.age < 18 ? householdLifestyle(state) : lifestyleFromResources(0, sibling.money);
}
function annualFinances(state) {
  if (state.age < 18) {
    state.income = 0;
    state.expenses = 0;
    state.lifestyle = householdLifestyle(state);
    return;
  }
  const job = JOBS.find(candidate => candidate.id === state.jobId);
  if (job) {
    state.performance = round(clamp(jobFit(state, job) * .7 + state.focus.work * .055 + Math.min(state.jobYears, 20) * .004 - Math.max(0, 6 - effectiveStats(state).stability) * .02, .1, 1));
    state.income = Math.round(job.baseSalary * (.55 + .95 * state.performance) * (1 + Math.min(state.jobYears, 25) * .024));
    state.jobYears += 1;
  } else { state.income = 0; state.performance = 0; }
  state.lifestyle = lifestyleFromResources(state.income, state.money);
  // Spending grows with income and dependent children. Essential support keeps
  // an unemployed character playable, but never generates savings.
  const dependents = state.children.filter(child => child.alive !== false && child.age < 18).length;
  const reserveUpkeep = (lifestyleFromResources(0, state.money) - 1) * 1800;
  state.expenses = Math.round(9000 + state.income * (.32 + state.lifestyle * .025) + dependents * 2500 + reserveUpkeep);
  state.money = Math.max(0, Math.round(state.money + state.income - state.expenses));
  state.lifestyle = lifestyleFromResources(state.income, state.money);
  if (!job && state.education.status !== 'college' && state.focus.work >= 3) addStat(state, 'stability', -.15);
}
function ageFamily(state) {
  for (const parent of state.parents) {
    if (parent.alive === false) continue;
    parent.age += 1;
    if (parent.age >= 85) { parent.alive = false; log(state, 'Remembering a parent', `${parent.name} dies at age 85. Their influence stays with you.`, 'family'); }
  }
  for (const child of state.children) {
    if (child.alive === false) continue;
    child.age += 1;
    child.height = heightAt(child.age, child.adultHeight);
    const learning = child.age < 18 ? .06 : .012;
    for (const key of CORE) grow(child, key, learning + state.focus.family * (child.age < 18 ? .045 : .018));
    addStat(child, 'stability', -.08 + state.focus.family * .045);
    addStat(child, 'health', (state.focus.family - 2) * .02);
    addStat(child, 'relaxation', (state.focus.family - 2) * .04);
    if (child.age >= 18) child.money += Math.round(1500 + child.stats.discipline * 250);
    if (child.age >= 85) child.alive = false;
  }
  for (const sibling of state.siblings) if (sibling.alive !== false) { sibling.age += 1; if (sibling.age >= 85) sibling.alive = false; }
}
function applyEvent(state, event) {
  if (event.years > 0) {
    const old = state.effects.find(effect => effect.id === event.id);
    if (old) old.years = Math.max(old.years, event.years);
    else state.effects.push({ id: event.id, name: event.name, description: event.description, years: event.years, modifiers: { ...event.modifiers }, kind: event.kind });
  }
  let text = event.description;
  if (event.id === 'windfall') {
    const amount = integer(state, 10, 40) * 100;
    state.money += amount;
    state.lifestyle = lifestyleFromResources(state.income, state.money);
  }
  log(state, event.name, text, event.kind);
}

export function advanceYear(state) {
  const status = active(state); if (!status.ok) return status;
  if (needsEducationChoice(state)) return fail('Choose college or a career before advancing the year.');
  const previousStage = stage(state);
  const odds = eventOdds(state);
  const roll = random(state);
  let selected = null, boundary = 0;
  for (const event of odds) { boundary += event.chance; if (roll < boundary) { selected = EVENTS.find(candidate => candidate.id === event.id); break; } }
  growYear(state);
  annualFinances(state);
  ageFamily(state);
  state.effects.forEach(effect => { effect.years -= 1; });
  state.effects = state.effects.filter(effect => effect.years > 0);
  state.age += 1;
  state.height = heightAt(state.age, state.adultHeight);
  if (selected) applyEvent(state, selected);
  else log(state, 'A quiet year', previousStage === 'baby' ? `A year of small discoveries. ${state.babyChoice === 'cry' ? 'Your cries bring attention and growth, while your parents feel the strain.' : 'Quiet moments give your parents a little breathing room.'}` : 'No major surprises this year. Your everyday choices still shape who you become.', 'quiet');
  syncFamilyLifestyles(state);
  if (state.age === 3) log(state, 'A bigger little world', 'You can now choose how to spend your year. Divide up to 12 focus points between school, friends, family, and yourself.', 'milestone');
  if (state.age === 18) {
    state.education = { status: 'undecided', years: 0 };
    state.jobOffers = makeJobOffers(state);
    log(state, 'Your own way', 'Choose four years of college or begin work from a list of 10 career options.', 'milestone');
  } else if (state.education.status === 'college') {
    state.education.years += 1;
    if (state.education.years === 4) {
      state.education.status = 'graduate';
      state.jobOffers = makeJobOffers(state, true);
      log(state, 'Graduation day', 'Four years of college are complete. Explore 15 career options, including roles that require a degree.', 'milestone');
    }
  }
  if (state.age === 65) log(state, 'The next chapter', 'You may continue your own life or pass the story to one of your children.', 'milestone');
  if (state.age >= 85) {
    const heirs = state.children.filter(child => child.alive !== false && child.age < 85);
    state.needsSuccession = heirs.length > 0;
    state.ended = !state.needsSuccession;
    log(state, 'A life remembered', heirs.length ? 'At age 85, your chapter closes. Choose a child to carry the family story forward.' : 'At age 85, your chapter closes. With no surviving children, this family story is complete.', 'milestone');
  }
  return { ok: true, eventId: selected?.id || null };
}

export function haveChild(state) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 18) return fail('You can welcome a child from age 18.');
  if (state.children.length >= 6) return fail('This framework supports up to six children per generation.');
  if (state.lastChildAge === state.age) return fail('You can welcome one child per year.');
  const adopted = state.age > 60;
  const otherAptitudes = randomAptitudes(state);
  const aptitudes = adopted ? otherAptitudes : Object.fromEntries(CORE.map(key => [key, clamp(Math.round((state.aptitudes[key] + otherAptitudes[key]) / 2) + integer(state, -1, 1), -3, 3)]));
  const adultHeight = adopted ? integer(state, 150, 200) : clamp(Math.round((state.adultHeight + integer(state, 155, 190)) / 2) + integer(state, -7, 7), 145, 205);
  const child = { id: uid(state, 'child'), name: personName(state, surname(state.name)), age: 0, stats: randomStats(state, true), aptitudes, height: 50, adultHeight, money: 0, lifestyle: state.lifestyle, alive: true, adopted };
  state.children.push(child); state.lastChildAge = state.age;
  log(state, adopted ? 'A new beginning' : 'A new branch', `${adopted ? `You adopt ${child.name}, welcoming a new child into your family.` : `${child.name} joins your family.`} Family focus will help their abilities grow, and your family legacy will be divided equally among your surviving children.`, 'family');
  return { ok: true, childId: child.id };
}

export function successionInfo(state) {
  const children = state.children.filter(child => child.alive !== false && child.age < 85);
  const rate = round(clamp(.95 - .05 * state.lifestyle, .45, .9));
  const estate = Math.floor(state.money * rate);
  const share = children.length ? Math.floor(estate / children.length) : 0;
  const eligible = state.age >= 65 && !state.ended && children.length > 0;
  const reason = state.ended ? 'This family story is complete.' : state.age < 65 ? 'Continue as a child from age 65.' : !children.length ? 'You need a surviving child to continue the family.' : '';
  return { eligible, reason, estate, share, rate, children };
}
export function succeed(state, childId) {
  const info = successionInfo(state);
  if (!info.eligible) return fail(info.reason);
  const child = info.children.find(candidate => candidate.id === childId);
  if (!child) return fail('Choose a surviving child from this family.');
  const previous = { id: state.id, name: state.name, age: state.age, generation: state.generation, stats: clone(state.stats), aptitudes: clone(state.aptitudes), height: state.height, money: state.money, estate: info.estate, share: info.share, lifestyle: state.lifestyle, children: info.children.map(person => ({ id: person.id, name: person.name, inheritance: info.share })), alive: state.age < 85 };
  state.lineage.push(previous);
  state.siblings = info.children.filter(person => person.id !== child.id).map(person => ({ ...clone(person), money: person.money + info.share, inheritance: info.share }));
  const heir = clone(child);
  state.id = heir.id; state.name = heir.name; state.age = heir.age; state.generation += 1;
  state.stats = heir.stats; state.aptitudes = heir.aptitudes; state.height = heir.height; state.adultHeight = heir.adultHeight;
  state.money = heir.money + info.share;
  state.parents = [{ id: previous.id, name: previous.name, age: previous.age, stats: previous.stats, aptitudes: previous.aptitudes, height: previous.height, lifestyle: previous.lifestyle, alive: previous.alive }];
  state.children = []; state.effects = []; state.focus = { work: 3, social: 3, family: 3, self: 3 };
  state.jobId = null; state.jobYears = 0; state.performance = 0; state.income = 0; state.expenses = 0; state.lifestyle = lifestyleFromResources(0, state.money);
  state.babyChoice = 'quiet'; state.schoolProgress = 0; state.lastChildAge = -1; state.ended = false; state.needsSuccession = false;
  state.education = { status: state.age < 18 ? 'school' : 'undecided', years: 0 };
  state.jobOffers = state.age < 18 ? [] : makeJobOffers(state);
  syncFamilyLifestyles(state);
  log(state, 'The story continues', `You are now ${state.name}, age ${state.age}. You receive an equal share of the family legacy. Your abilities and affinities carry over.`, 'milestone');
  return ok();
}

function validSchema(raw, version) {
  try {
    if (!raw || typeof raw !== 'object' || raw.version !== version) return false;
    const finite = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
    const text = (s, max = 1000) => typeof s === 'string' && s.length > 0 && s.length <= max;
    const statKeys = version === 1 ? [...CORE, 'health', 'instability', 'relaxation'] : STAT_KEYS;
    const validStats = stats => stats && !((version === 1 ? 'stability' : 'instability') in stats) && statKeys.every(key => finite(stats[key], 1, 10));
    const validLifestyle = value => Number.isInteger(value) && finite(value, 1, 10);
    const validAptitudes = aptitude => aptitude && CORE.every(key => Number.isInteger(aptitude[key]) && finite(aptitude[key], -3, 3));
    const validGeneration = value => Number.isInteger(value) && finite(value, 1, 100000);
    const validPerson = person => person && text(person.id, 100) && text(person.name, 50) && Number.isInteger(person.age) && finite(person.age, 0, 120) && finite(person.height, 40, 210) && validStats(person.stats) && validAptitudes(person.aptitudes) && (version === 1 || validLifestyle(person.lifestyle)) && (person.adopted === undefined || typeof person.adopted === 'boolean');
    if (!validPerson(raw) || raw.age > 85 || !Number.isInteger(raw.generation) || !finite(raw.generation, 1, 100000)) return false;
    if (![raw.seed, raw.rng, raw.nextId].every(value => Number.isInteger(value) && finite(value, 0, Number.MAX_SAFE_INTEGER))) return false;
    if (!finite(raw.height, 40, 210) || !finite(raw.adultHeight, 145, 205)) return false;
    if (!raw.focus || Object.keys(raw.focus).length !== 4 || !FOCUS_KEYS.every(key => Number.isInteger(raw.focus[key]) && finite(raw.focus[key], 0, 5)) || FOCUS_KEYS.reduce((sum, key) => sum + raw.focus[key], 0) > 12) return false;
    if (!['cry', 'quiet'].includes(raw.babyChoice) || ![raw.ended, raw.needsSuccession].every(value => typeof value === 'boolean')) return false;
    const validLivingAge = person => person.age <= 85 && typeof person.alive === 'boolean' && (!person.alive || person.age < 85);
    if (!Array.isArray(raw.parents) || raw.parents.length > 2 || !raw.parents.every(person => validPerson(person) && validLivingAge(person) && (!person.alive || person.age > raw.age))) return false;
    if (!Array.isArray(raw.children) || raw.children.length > 6 || !raw.children.every(child => validPerson(child) && validLivingAge(child) && child.age < raw.age && finite(child.height, 40, 210) && finite(child.adultHeight, 145, 205) && finite(child.money, 0, 1e15))) return false;
    if (!Array.isArray(raw.siblings) || !raw.siblings.every(person => validPerson(person) && validLivingAge(person) && finite(person.adultHeight, 145, 205) && finite(person.money, 0, 1e15))) return false;
    const familyIds = [raw.id, ...raw.parents.map(person => person.id), ...raw.children.map(person => person.id), ...raw.siblings.map(person => person.id)];
    if (new Set(familyIds).size !== familyIds.length) return false;
    if (![raw.money, raw.income, raw.expenses].every(value => finite(value, 0, 1e15)) || !Number.isInteger(raw.lifestyle) || !finite(raw.lifestyle, 1, 10)) return false;
    if (raw.jobId !== null && !JOBS.some(job => job.id === raw.jobId)) return false;
    if (version >= 3) {
      const education = raw.education;
      if (!education || !['school', 'undecided', 'workforce', 'college', 'graduate'].includes(education.status) || !Number.isInteger(education.years)) return false;
      const studying = education.status === 'college';
      const graduate = education.status === 'graduate';
      if (studying ? !finite(education.years, 0, 3) : education.years !== (graduate ? 4 : 0)) return false;
      if ((education.status === 'school') !== (raw.age < 18)) return false;
      const offers = raw.jobOffers;
      const expectedCount = raw.age < 18 || studying ? 0 : graduate ? 15 : 10;
      if (!Array.isArray(offers) || offers.length !== expectedCount || new Set(offers).size !== offers.length) return false;
      if (!offers.every(id => JOBS.some(job => job.id === id && (graduate || !job.requiresCollege)))) return false;
      if (expectedCount && !offers.includes('retail')) return false;
      if ((education.status === 'school' || education.status === 'undecided' || studying) && raw.jobId !== null) return false;
      if (raw.jobId !== null && !offers.includes(raw.jobId)) return false;
    }
    if (!Number.isInteger(raw.jobYears) || !finite(raw.jobYears, 0, 100) || !finite(raw.performance, 0, 1) || !finite(raw.schoolProgress, 0, 100) || !finite(raw.lastChildAge, -1, 85)) return false;
    if (!Array.isArray(raw.effects) || raw.effects.length > 10 || !raw.effects.every(effect => text(effect.id, 100) && text(effect.name, 100) && typeof effect.description === 'string' && Number.isInteger(effect.years) && finite(effect.years, 1, 3) && effect.modifiers && Object.entries(effect.modifiers).every(([key, value]) => statKeys.includes(key) && finite(value, -10, 10)))) return false;
    if (!Array.isArray(raw.history) || raw.history.length > 500 || !raw.history.every(memory => text(memory.id, 100) && finite(memory.age, 0, 85) && finite(memory.generation, 1, 100000) && text(memory.title, 200) && text(memory.text, 2000) && text(memory.kind, 50))) return false;
    if (!Array.isArray(raw.lineage) || !raw.lineage.every(person => validPerson(person) && validGeneration(person.generation) && typeof person.alive === 'boolean' && Number.isInteger(person.lifestyle) && finite(person.lifestyle, 1, 10) && finite(person.money, 0, 1e15) && finite(person.estate, 0, 1e15) && finite(person.share, 0, 1e15) && Array.isArray(person.children) && person.children.length <= 6 && person.children.every(child => child && text(child.id, 100) && text(child.name, 50) && finite(child.inheritance, 0, 1e15)))) return false;
    if (raw.needsSuccession && (raw.age < 85 || raw.ended || !raw.children.some(child => child.alive !== false && child.age < 85))) return false;
    if (raw.ended && raw.age < 85) return false;
    if (raw.age === 85 && !raw.ended && !raw.needsSuccession) return false;
    return true;
  } catch { return false; }
}

export function validateSave(raw) { return validSchema(raw, 3); }

export function migrateSave(raw) {
  try {
    if (validateSave(raw)) return clone(raw);
    if (!validSchema(raw, 1) && !validSchema(raw, 2)) return null;
    const state = clone(raw);
    if (state.version === 1) {
      const convertStats = person => {
        person.stats.stability = round(11 - person.stats.instability);
        delete person.stats.instability;
      };
      [state, ...state.parents, ...state.children, ...state.siblings, ...state.lineage].forEach(convertStats);
      for (const effect of state.effects) {
        if (Object.hasOwn(effect.modifiers, 'instability')) {
          effect.modifiers.stability = -effect.modifiers.instability;
          delete effect.modifiers.instability;
        }
      }
      // Original saves did not store parents' lifestyle. Prefer a recorded
      // ancestor's household, otherwise use a modest 4/10.
      for (const parent of state.parents) {
        const ancestor = state.lineage.find(person => person.id === parent.id);
        parent.lifestyle = ancestor?.lifestyle ?? 4;
      }
      for (const child of state.children) child.lifestyle = child.age < 18 ? state.lifestyle : lifestyleFromResources(0, child.money);
      for (const sibling of state.siblings) sibling.lifestyle = sibling.age < 18 ? householdLifestyle(state) : lifestyleFromResources(0, sibling.money);
      if (state.age < 18) state.lifestyle = householdLifestyle(state);
    }
    const currentJob = JOBS.find(job => job.id === state.jobId);
    const status = state.age < 18 ? 'school' : currentJob?.requiresCollege ? 'graduate' : state.age === 18 && !currentJob ? 'undecided' : 'workforce';
    state.education = { status, years: status === 'graduate' ? 4 : 0 };
    state.jobOffers = state.age < 18 ? [] : makeJobOffers(state, status === 'graduate');
    state.version = 3;
    return validateSave(state) ? state : null;
  } catch { return null; }
}
