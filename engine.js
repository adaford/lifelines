// Lifelines: deterministic, browser-independent simulation rules.
// All public actions mutate their state and return { ok, reason? }.
import { JOBS } from './jobs.js?v=event-variety-1';
import { EVENTS as PERSONAL_EVENTS, eventChances } from './events.js?v=event-variety-1';
import { FAMILY_EVENTS, familyEventChances } from './family-events.js?v=event-variety-1';
import { mortalityRisk, rollMortality } from './mortality.js?v=event-variety-1';
import { heightReference, advanceGrowth } from './growth.js?v=event-variety-1';
import { initialParentCareer, careerForecast, advanceParentCareer } from './parent-careers.js?v=event-variety-1';
import { naturalSkillRating, skillChanges, childhoodWellbeing, wellbeingResponse, DEVELOPMENT_BALANCE, BIRTH_VARIATION, TODDLER_FOCUS, PARENT_FAMILY_RELATIONSHIP_GAIN } from './development.js?v=event-variety-1';
import { PERCENTILE_REFERENCE } from './percentile-reference.js?v=event-variety-1';
import { normalPercentile } from './percentiles.js?v=event-variety-1';
export { DEVELOPMENT_BALANCE };
export { heightPercentile } from './growth.js?v=event-variety-1';
export { mortalityRisk } from './mortality.js?v=event-variety-1';
import { meetingChances as meetingRules, relationshipOdds as attractionRules, proposalChance as proposalRules, pregnancyChance as pregnancyRules, gestatingActor, createProspects, oneNightChance as casualRules, attractivenessAgeChange, appearanceDeclineAge } from './relationships.js?v=event-variety-1';
export { JOBS, JOB_CATEGORIES } from './jobs.js?v=event-variety-1';
export const EVENTS = [...PERSONAL_EVENTS, ...FAMILY_EVENTS];

export const SKILLS = [
  { key: 'intelligence', label: 'Intelligence', color: '#9cb9ff' },
  { key: 'strength', label: 'Strength', color: '#efb490' },
  { key: 'attractiveness', label: 'Attractiveness', color: '#e7aacb' },
  { key: 'social', label: 'Social', color: '#e6ca81' },
  { key: 'creativity', label: 'Creativity', color: '#b9a3e8' },
];
const CORE = SKILLS.map(s => s.key);
const STAT_KEYS = [...CORE, 'health', 'stability'];
const FOCUS_KEYS = ['work', 'social', 'family', 'self'];
const focusKeys = age => age >= 2 && age < 5 ? [...FOCUS_KEYS, 'creative'] : FOCUS_KEYS;
function focusAfterBirthday(state) {
  if (state.age === 2) state.focus = { ...TODDLER_FOCUS };
  if (state.age === 5 && Object.hasOwn(state.focus, 'creative')) {
    let remaining = state.focus.creative;
    delete state.focus.creative;
    clampFocusToLimits(state);
    const limits = focusLimits(state);
    for (const key of ['self', 'work', 'social', 'family']) {
      const transferred = Math.min(remaining, limits[key] - state.focus[key]);
      state.focus[key] += transferred;
      remaining -= transferred;
    }
  }
  clampFocusToLimits(state);
}
const FIRST_NAMES = ['Alex', 'Jamie', 'Rowan', 'Sage', 'Riley', 'Morgan', 'Avery', 'Jordan', 'Taylor', 'Quinn', 'Casey', 'Robin', 'Sam', 'Ellis', 'Charlie', 'Reese'];
const GENDER_NAMES = {
  male: ['Adam', 'Benjamin', 'Daniel', 'David', 'Ethan', 'Gabriel', 'Henry', 'Isaac', 'James', 'Leo', 'Lucas', 'Nathan', 'Noah', 'Oliver', 'Samuel', 'Thomas'],
  female: ['Amelia', 'Anna', 'Charlotte', 'Chloe', 'Clara', 'Ella', 'Emily', 'Grace', 'Hannah', 'Isabella', 'Lily', 'Lucy', 'Mia', 'Olivia', 'Sophia', 'Zoe'],
};
const LAST_NAMES = ['Bennett', 'Park', 'Rivera', 'Morgan', 'Reed', 'Patel', 'Santos', 'Chen', 'Walker', 'Brooks'];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round = n => Math.round(n * 100) / 100;
const fromCentimeters = value => round(value / 2.54);
const ok = () => ({ ok: true });
const fail = reason => ({ ok: false, reason });
const clone = value => JSON.parse(JSON.stringify(value));

function random(state) {
  state.rng = (state.rng + 0x6D2B79F5) >>> 0;
  let value = state.rng;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
}
function integer(state, low, high) { return low + Math.floor(random(state) * (high - low + 1)); }
// Seeded normal variation. Limit rare extremes while preserving a symmetric
// distribution; reloading a save never rerolls a person's next year.
function normal(state) {
  return clamp(Math.sqrt(-2 * Math.log(Math.max(1e-12, random(state)))) * Math.cos(2 * Math.PI * random(state)), -3, 3);
}
function initialBond(state) { return round(clamp(8 + normal(state), 5, 10)); }
function pick(state, array) { return array[integer(state, 0, array.length - 1)]; }
function uid(state, prefix) { state.nextId += 1; return `${prefix}-${state.nextId}`; }
function surname(name) { return name.trim().split(/\s+/).at(-1); }
export function normalizeSurname(value) {
  const cleaned = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 30) : '';
  return cleaned ? (cleaned[0].toLocaleUpperCase() + cleaned.slice(1)).slice(0, 30).trimEnd() : '';
}
function personName(state, lastName, gender) { return `${pick(state, GENDER_NAMES[gender] || FIRST_NAMES)} ${lastName || pick(state, LAST_NAMES)}`; }
function useFamilyName(person, familyName) {
  const old = person.familyName || surname(person.name);
  const firstName = person.name.toLocaleLowerCase().endsWith(` ${old.toLocaleLowerCase()}`) ? person.name.slice(0, -old.length).trim() : person.name.split(/\s+/)[0];
  person.familyName = familyName;
  person.name = `${firstName.slice(0, 49 - familyName.length)} ${familyName}`;
  return person;
}
function log(state, title, text, kind = 'neutral') {
  state.history.unshift({ id: uid(state, 'memory'), age: state.age, generation: state.generation, title, text, kind });
  state.history = state.history.slice(0, 500);
}
function addStat(person, key, amount) { person.stats[key] = round(clamp(person.stats[key] + amount, 1, 10)); }
function developSkills(person, context = person, career = null) {
  for (const [key, amount] of Object.entries(skillChanges(context, career))) addStat(person, key, amount);
}
function randomStats(state, aptitudes) {
  const result = Object.fromEntries(CORE.filter(key => key !== 'attractiveness').map(key => [key, round(clamp(naturalSkillRating(aptitudes[key]) + normal(state) * BIRTH_VARIATION.skill, 1, 10))]));
  result.attractiveness = round(clamp(5 + normal(state) * BIRTH_VARIATION.appearance, 1, 10));
  return { ...result, health: round(clamp(naturalSkillRating(aptitudes.health) + normal(state) * BIRTH_VARIATION.health, 1, 10)), stability: round(clamp(naturalSkillRating(aptitudes.stability) + normal(state) * BIRTH_VARIATION.stability, 1, 10)) };
}
function randomAptitudes(state) { return Object.fromEntries(STAT_KEYS.map(key => [key, integer(state, -3, 3)])); }
function inheritAptitudes(state, first, second) {
  // Round halfway values symmetrically so inheritance does not drift upward.
  return Object.fromEntries(STAT_KEYS.map(key => {
    const average = ((first[key] ?? 0) + (second[key] ?? 0)) / 2;
    return [key, clamp(Math.sign(average) * Math.round(Math.abs(average)) + integer(state, -1, 1), -3, 3)];
  }));
}
function personHash(person) {
  let hash = 2166136261;
  for (const letter of `${person.id}:${person.name}`) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  return hash >>> 0;
}
function demographics(person, gender = person.gender) {
  const hash = personHash(person);
  person.gender = gender || (hash % 2 ? 'female' : 'male');
  person.canGestate ??= person.gender === 'female';
  person.attractedTo ??= [person.gender === 'female' ? 'male' : 'female'];
  person.appearancePeakAge ??= appearanceDeclineAge(person);
  person.familyName ??= normalizeSurname(surname(person.name));
  ensureGrowth(person);
  return person;
}
function ensureGrowth(person) {
  const hash = personHash(person);
  person.growthSex ??= person.gender === 'female' ? 'female' : person.gender === 'male' ? 'male' : hash % 2 ? 'female' : 'male';
  person.maturityAge ??= (person.growthSex === 'female' ? 14 : 16) + hash % 3;
  person.birthHeight ??= fromCentimeters(heightReference(0, person.growthSex).median);
  if (person.adultHeight === undefined) person.adultHeight = person.age >= person.maturityAge ? person.height : null;
  person.growthAnchor ??= null;
  // A persistent inherited tendency changes annual growth velocity, never an
  // adult-height destination. Legacy profiles get a stable, RNG-free default.
  if (person.growthFactor === undefined) {
    const adult = heightReference(20, person.growthSex).median;
    const birth = heightReference(0, person.growthSex).median;
    const stableNormal = clamp(Math.sqrt(-2 * Math.log(((hash & 65535) + .5) / 65536)) * Math.cos(2 * Math.PI * ((hash >>> 16) + .5) / 65536), -3, 3);
    const tendency = person.age >= person.maturityAge ? (person.height * 2.54 - adult) / (adult - birth) : stableNormal * .054;
    person.growthFactor = Math.round(clamp(1 + tendency, .8, 1.2) * 10000) / 10000;
  }
  return person;
}
function newbornGrowth(state, person, parents = []) {
  ensureGrowth(person);
  person.maturityAge = clamp(Math.round((person.growthSex === 'female' ? 15 : 17) + normal(state) * .7), 14, 18);
  const reference = heightReference(0, person.growthSex);
  person.birthHeight = fromCentimeters(clamp(reference.median + normal(state) * reference.sd, 40, 60));
  person.height = person.birthHeight;
  const inherited = parents.length ? parents.reduce((sum, parent) => sum + ensureGrowth(parent).growthFactor, 0) / parents.length : 1;
  person.growthFactor = Math.round(clamp(1 + .7 * (inherited - 1) + normal(state) * (parents.length ? .047 : .054), .8, 1.2) * 10000) / 10000;
  // Only attained adult height is stored. While growing there is no endpoint.
  person.adultHeight = null;
  if (parents.length) person.stats.attractiveness = round(clamp(parents.reduce((sum, p) => sum + p.stats.attractiveness, 0) / parents.length + normal(state) * BIRTH_VARIATION.inheritedAppearance, 1, 10));
  person.growthAnchor = null;
}
function datingHelpers(state) {
  return { random: () => random(state), integer: (low, high) => integer(state, low, high), uid: prefix => uid(state, prefix), personName: gender => personName(state, undefined, gender), randomAptitudes: () => randomAptitudes(state) };
}
const livingPartner = state => state.partner?.alive !== false ? state.partner : null;
const dependents = state => state.children.filter(child => child.alive !== false && child.age < 18);
function makeParent(state, lastName, gender) {
  const age = integer(state, 25, 40);
  const reference = heightReference(20, gender);
  const heightCm = round(clamp(reference.median + normal(state) * reference.sd, 145, 205));
  const height = fromCentimeters(heightCm);
  const growthFactor = Math.round(clamp(1 + (heightCm - reference.median) / (reference.median - heightReference(0, gender).median), .8, 1.2) * 10000) / 10000;
  const aptitudes = randomAptitudes(state);
  return demographics({ id: uid(state, 'parent'), name: personName(state, lastName, gender), familyName: lastName, parentRole: gender === 'female' ? 'mom' : 'dad', age, stats: randomStats(state, aptitudes), aptitudes, height, adultHeight: height, growthFactor, alive: true, relationship: initialBond(state) }, gender);
}
function active(state) {
  if (state.pendingEvents.length) return fail('Resolve your event choices before continuing.');
  if (state.ended) return fail('This life has ended. Start a new family to play again.');
  if (state.needsSuccession) return fail('Choose an heir to continue the story.');
  return ok();
}

export function createGame({ name, surname: chosenSurname, firstName, seed, gender = 'male', canGestate, attractedTo } = {}) {
  const initialSeed = Number.isFinite(seed) ? seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
  const state = { version: 14, seed: initialSeed, rng: initialSeed, nextId: 0, id: `life-${initialSeed}`, age: 0, generation: 1,
    name: '', stats: {}, aptitudes: {}, height: fromCentimeters(50), adultHeight: null,
    focus: { work: 3, social: 3, family: 3, self: 3 }, babyChoice: 'quiet', cryLevel: 1, alive: true, death: null, yearSummary: null,
    parents: [], children: [], siblings: [], money: 0, income: 0, expenses: 0, lifestyle: 1,
    jobId: null, jobYears: 0, performance: 0, schoolProgress: 0, lastChildAge: -1,
    education: { status: 'school', years: 0 }, jobOffers: [],
    partner: null, encounters: [], encounterYear: 0, pregnancy: null,
    effects: [], pendingEvents: [], lastYearEvents: [], history: [], lineage: [], ended: false, needsSuccession: false };
  const familyName = normalizeSurname(chosenSurname) || (typeof firstName === 'string' && firstName.trim() ? pick(state, LAST_NAMES) : '');
  if (familyName) {
    const givenName = typeof firstName === 'string' && firstName.trim() ? firstName.trim().replace(/\s+/g, ' ') : pick(state, GENDER_NAMES[gender] || FIRST_NAMES);
    state.familyName = familyName;
    state.name = `${givenName.slice(0, 49 - familyName.length)} ${familyName}`;
  } else state.name = typeof name === 'string' && name.trim() ? name.trim().slice(0, 50) : personName(state, undefined, gender);
  demographics(state, ['male', 'female', 'nonbinary'].includes(gender) ? gender : 'male');
  if (typeof canGestate === 'boolean') state.canGestate = canGestate;
  if (Array.isArray(attractedTo) && attractedTo.length && attractedTo.every(value => ['male', 'female', 'nonbinary'].includes(value))) state.attractedTo = [...new Set(attractedTo)];
  state.parents = [makeParent(state, state.familyName, 'female'), makeParent(state, state.familyName, 'male')];
  const homeLifestyle = integer(state, 2, 8);
  state.parents.forEach(parent => { parent.lifestyle = homeLifestyle; parent.career = initialParentCareer(parent, integer(state, 1, 5)); });
  state.lifestyle = homeLifestyle;
  state.aptitudes = inheritAptitudes(state, state.parents[0].aptitudes, state.parents[1].aptitudes);
  state.stats = randomStats(state, state.aptitudes);
  newbornGrowth(state, state, state.parents);
  log(state, 'A life begins', `${state.name} is born.`, 'milestone');
  return state;
}

export function stage(state) {
  return state.age < 2 ? 'baby' : state.age < 5 ? 'toddler' : state.age < 13 ? 'child' : state.age < 18 ? 'teen' : state.age < 65 ? 'adult' : 'elder';
}
export function effectiveStats(state) {
  const result = { ...state.stats };
  for (const effect of state.effects) if (effect.years > 0) for (const [key, value] of Object.entries(effect.modifiers)) result[key] += value;
  const partner = livingPartner(state);
  if (partner) { result.social += partner.married ? .9 : .7; result.stability += partner.married ? .8 : .6; }
  result.social += Math.min(1.2, dependents(state).length * .2);
  for (const key of STAT_KEYS) result[key] = round(clamp(result[key], 1, 10));
  return result;
}
export function currentEffects(state) { return state.effects.filter(effect => effect.years > 0); }
const focusStage = state => state.age < 2 ? null : state.age < 5 ? 'toddler' : 'standard';
function focusLabel(state, key) {
  if (state.age < 5) return { work: 'Play', social: 'Electronics', family: 'Family time', self: 'Rest', creative: 'Arts & crafts' }[key];
  return { work: state.age < 18 ? 'School' : state.education.status === 'college' ? 'College' : 'Career', social: 'Friends', family: 'Family', self: 'Yourself' }[key];
}
export function focusLimitDetails(state) {
  const stage = focusStage(state);
  if (!stage) return [];
  return currentEffects(state).flatMap(effect => Object.entries(effect.focusLimits?.[stage] || {})
    .filter(([, max]) => max < 5)
    .map(([key, max]) => ({ key, max, effectId: effect.id, name: effect.name, years: effect.years })));
}
export function focusLimits(state) {
  const limits = Object.fromEntries(focusKeys(state.age).map(key => [key, 5]));
  for (const { key, max } of focusLimitDetails(state)) limits[key] = Math.min(limits[key], max);
  return limits;
}
function clampFocusToLimits(state) {
  if (state.age < 2) return;
  for (const [key, max] of Object.entries(focusLimits(state))) {
    if (state.focus[key] > max) state.focus[key] = max;
  }
}
function focusLimitViolation(state) {
  if (state.age < 2) return null;
  return Object.entries(focusLimits(state)).find(([key, max]) => state.focus[key] > max);
}
export function setFocus(state, key, value) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 2) return fail('Activity choices unlock at age 2.');
  const keys = focusKeys(state.age);
  if (!keys.includes(key) || !Number.isInteger(value) || value < 0 || value > 5) return fail('Each focus must be a whole number from 0 to 5.');
  const maximum = focusLimits(state)[key];
  if (value > maximum) return fail(`${focusLabel(state, key)} is limited to ${maximum} this year.`);
  const total = keys.reduce((sum, other) => sum + (other === key ? value : state.focus[other] ?? 0), 0);
  if (total > 12) return fail('You have 12 focus points. Lower another focus first.');
  state.focus[key] = value;
  return ok();
}
export function setBabyChoice(state, choice) {
  // Compatibility for callers and old saves; the interface uses five levels.
  if (choice !== 'cry' && choice !== 'quiet') return fail('Choose crying or staying quiet.');
  return setCryLevel(state, choice === 'cry' ? 5 : 1);
}
export function setCryLevel(state, level) {
  const status = active(state); if (!status.ok) return status;
  if (state.age >= 2) return fail('You have outgrown the baby years.');
  if (!Number.isInteger(level) || level < 1 || level > 5) return fail('Choose a cry level from 1 to 5.');
  state.cryLevel = level;
  state.babyChoice = level > 1 ? 'cry' : 'quiet';
  return ok();
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
    log(state, 'A place to learn', 'You start college.', 'milestone');
  } else log(state, 'Ready for work', 'You start looking for work.', 'career');
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
  log(state, 'A new direction', `You start as a ${job.name.toLowerCase()}.`, 'career');
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

export function meetingChances(state) { return meetingRules(state, effectiveStats(state)); }
export function relationshipOdds(state, person) { return attractionRules(state, person, effectiveStats(state)); }
export function oneNightChance(state, person) { return casualRules(state, person, effectiveStats(state)); }
export function proposalChance(state) { return proposalRules(state); }
export function pregnancyChance(state, person = livingPartner(state), options = {}) { return pregnancyRules(state, person, options); }

function startPregnancy(state, otherParent, casual = false) {
  const carrier = gestatingActor(state, otherParent);
  if (!carrier || state.pregnancy || state.children.length >= 6 || state.age >= 84) return false;
  state.pregnancy = { carrierId: carrier.id, carrierName: carrier.name, otherParent: clone(otherParent), dueAge: state.age + 1, startedAge: state.age, casual };
  log(state, 'A baby on the way', `${carrier.id === state.id ? 'You are' : `${carrier.name} is`} expecting a baby next year.`, 'family');
  return true;
}

export function respondToEncounter(state, personId, decision) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 18) return fail('Dating begins at age 18.');
  if (livingPartner(state)) return fail('You are already in a relationship.');
  if (!['relationship', 'casual', 'ignore'].includes(decision)) return fail('Choose a relationship, a one-night stand, or ignore.');
  const index = state.encounters.findIndex(person => person.id === personId);
  if (index < 0 || state.encounterYear !== state.age) return fail('That opportunity has already passed.');
  const person = state.encounters[index];
  state.encounters.splice(index, 1);
  if (decision === 'ignore') {
    log(state, 'Paths pass by', `You decide not to pursue ${person.name}.`, 'relationship');
    return { ok: true, ignored: true };
  }
  const chance = decision === 'relationship' ? relationshipOdds(state, person) : oneNightChance(state, person);
  const accepted = random(state) < chance;
  if (!accepted) {
    addStat(state, 'stability', -.1);
    log(state, 'Not the same spark', `${person.name} isn't interested.`, 'relationship');
    return { ok: true, accepted: false, chance };
  }
  if (decision === 'relationship') {
    state.partner = { ...person, relationship: integer(state, 3, 7), yearsTogether: 0, married: false, lastProposalAge: -1 };
    state.encounters = [];
    syncFamilyLifestyles(state);
    log(state, 'A connection becomes a relationship', `You and ${person.name} begin dating.`, 'relationship');
  } else {
    const before = effectiveStats(state);
    addStat(state, 'social', .25); addStat(state, 'stability', -.1);
    const after = effectiveStats(state);
    log(state, 'A brief connection', `You spend a night with ${person.name}. Social ${before.social} → ${after.social}; mental stability ${before.stability} → ${after.stability}.`, 'relationship');
    if (random(state) < pregnancyChance(state, person, { casual: true })) startPregnancy(state, person, true);
  }
  return { ok: true, accepted: true, chance };
}

export function proposeMarriage(state) {
  const status = active(state); if (!status.ok) return status;
  const partner = livingPartner(state);
  if (!partner) return fail('Start a relationship before proposing.');
  if (partner.married) return fail('You are already married.');
  if (partner.lastProposalAge === state.age) return fail('You can propose once each year.');
  const chance = proposalChance(state);
  partner.lastProposalAge = state.age;
  const accepted = random(state) < chance;
  if (accepted) {
    partner.married = true; partner.relationship = round(clamp(partner.relationship + .5, 1, 10));
    log(state, 'A life together', `You marry ${partner.name}.`, 'relationship');
  } else {
    partner.relationship = round(clamp(partner.relationship - .3, 1, 10));
    addStat(state, 'stability', -.2);
    log(state, 'Not ready yet', `${partner.name} isn't ready for marriage.`, 'relationship');
  }
  syncFamilyLifestyles(state);
  return { ok: true, accepted, chance };
}

export function endRelationship(state) {
  const status = active(state); if (!status.ok) return status;
  if (!state.partner) return fail('There is no relationship to end.');
  const name = state.partner.name;
  state.partner = null; state.encounters = [];
  addStat(state, 'stability', -.4);
  syncFamilyLifestyles(state);
  log(state, 'Separate paths', `You and ${name} break up.`, 'relationship');
  return ok();
}

export function eventOdds(state) {
  const own = eventChances(state, effectiveStats(state), JOBS.find(job => job.id === state.jobId));
  const family = familyEventChances(state, effectiveStats(state));
  return [...own, ...family];
}

function growYear(state) {
  developSkills(state, state, JOBS.find(candidate => candidate.id === state.jobId));
  if (state.age < 2) {
    // Low crying offers a little relief; level two is neutral, then strain
    // rises in even steps. These means also drive the pure yearly preview.
    const parentStabilityChange = [.2, 0, -.6, -1.2, -1.8][state.cryLevel - 1];
    for (const [key, amount] of Object.entries(childhoodWellbeing(state))) addStat(state, key, amount);
    for (const parent of state.parents.filter(p => p.alive !== false)) {
      addStat(parent, 'stability', wellbeingResponse(parent, 'stability', parentStabilityChange));
      parent.relationship = round(clamp(parent.relationship + .2 * (state.cryLevel - 3), 1, 10));
    }
    return;
  }
  const f = state.focus;
  const studying = state.age >= 5 && state.age < 18 || state.education.status === 'college';
  const appearanceChange = attractivenessAgeChange(state);
  if (appearanceChange) addStat(state, 'attractiveness', appearanceChange);
  const spare = 12 - Object.values(f).reduce((sum, value) => sum + value, 0);
  if (state.age < 18) {
    for (const [key, amount] of Object.entries(childhoodWellbeing(state))) addStat(state, key, amount);
  } else {
    addStat(state, 'stability', wellbeingResponse(state, 'stability', -.1 * (f.work - 2) + f.self * .07 + f.family * .025 + f.social * .018 + spare * .04));
    addStat(state, 'health', wellbeingResponse(state, 'health', (f.self - 2) * .035) - (state.age >= 65 ? .1 : 0));
  }
  if (studying) state.schoolProgress = round(clamp(state.schoolProgress + f.work * .9, 0, 100));
  const toddler = state.age < 5;
  for (const parent of state.parents.filter(p => p.alive !== false)) {
    addStat(parent, 'stability', .08 * (5 - parent.stats.stability) + wellbeingResponse(parent, 'stability', (f.family - (toddler ? 2 : 3)) * .025));
    parent.relationship = round(clamp(parent.relationship + (f.family - (toddler ? 3 : 2)) * PARENT_FAMILY_RELATIONSHIP_GAIN, 1, 10));
  }
}
// Money remains internal: the player sees only a 1–10 lifestyle score.
// Earnings and reserves support continuous lifestyle ratings. Keep hundredths
// internally; display formatting rounds the visible rating to one decimal.
export function lifestyleFromResources(income = 0, money = 0) {
  const earnings = Number.isFinite(income) ? Math.max(0, income) : 0;
  const reserves = Number.isFinite(money) ? Math.max(0, money) : 0;
  const earnedRating = 1 + earnings / 22000;
  const reserveRating = 1 + Math.log2(1 + reserves / 25000);
  return round(clamp(Math.max(earnedRating, reserveRating), 1, 10));
}
export function householdLifestyle(state) {
  // Both original parents share one household. A young heir keeps that
  // household's support through guardianship if their parent has died.
  const parent = state.parents.find(person => person.alive !== false) || state.parents[0];
  return round(clamp(Number.isFinite(parent?.lifestyle) ? parent.lifestyle : state.lifestyle, 1, 10));
}
function syncFamilyLifestyles(state) {
  const modifier = state.effects.reduce((sum, effect) => sum + (effect.years > 0 ? effect.lifestyle || 0 : 0), 0);
  const familyCost = (livingPartner(state) ? 1 : 0) + dependents(state).length;
  state.lifestyle = state.age < 18 ? householdLifestyle(state) : round(clamp(lifestyleFromResources(state.income, state.money) + modifier - familyCost, 1, 10));
  for (const child of state.children) if (child.alive !== false) child.lifestyle = child.age < 18 ? state.lifestyle : lifestyleFromResources(0, child.money);
  for (const sibling of state.siblings) if (sibling.alive !== false) sibling.lifestyle = sibling.age < 18 ? householdLifestyle(state) : lifestyleFromResources(0, sibling.money);
}
function parentCareersForYear(state, careerRandom, growthRandom) {
  const events = [];
  const before = householdLifestyle(state);
  for (const parent of state.parents) {
    parent.career ??= initialParentCareer(parent, 1 + personHash(parent) % 5);
    if (parent.alive === false) continue;
    if (careerRandom) {
      const result = advanceParentCareer(parent, { random: careerRandom, normal: growthRandom });
      parent.career = result.career;
      if (result.event) events.push(result.event);
    } else parent.career = careerForecast(parent);
  }
  const living = state.parents.filter(parent => parent.alive !== false);
  if (living.length) {
    const lifestyle = round(clamp(living.reduce((sum, parent) => sum + parent.career.progress, 0) / living.length, 1, 10));
    for (const parent of living) parent.lifestyle = lifestyle;
  }
  return events.map(event => ({ ...event, text: `${event.text} Household lifestyle ${before} → ${householdLifestyle(state)}.` }));
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
    developSkills(parent, { ...parent, focus: { work: parent.career?.focus ?? 3, social: 3, family: 3, self: 3 } });
    addStat(parent, 'attractiveness', attractivenessAgeChange(parent));
    if (parent.age >= 65) addStat(parent, 'health', -.07);
    parent.age += 1;
  }
  for (const child of state.children) {
    if (child.alive === false) continue;
    const care = { ...child, cryLevel: 3, careFocus: state.focus.family, focus: child.age >= 2 && child.age < 5 ? { ...TODDLER_FOCUS, family: state.focus.family, self: state.focus.family } : { work: 3, social: 3, family: state.focus.family, self: state.focus.family } };
    developSkills(child, care);
    const appearanceChange = attractivenessAgeChange(child);
    child.age += 1;
    if (appearanceChange) addStat(child, 'attractiveness', appearanceChange);
    if (child.age <= 18) {
      for (const [key, amount] of Object.entries(childhoodWellbeing(care))) addStat(child, key, amount);
    } else {
      addStat(child, 'stability', wellbeingResponse(child, 'stability', -.08 + state.focus.family * .045));
      addStat(child, 'health', wellbeingResponse(child, 'health', (state.focus.family - 2) * .02));
    }
    child.relationship = round(clamp(child.relationship + (state.focus.family - 2) * .13, 1, 10));
    if (child.age >= 18) child.money += Math.round(1500 + child.stats.intelligence * 250);
    if (child.age >= 65) addStat(child, 'health', -.07);
  }
  for (const sibling of state.siblings) if (sibling.alive !== false) { developSkills(sibling); addStat(sibling, 'attractiveness', attractivenessAgeChange(sibling)); if (sibling.age >= 65) addStat(sibling, 'health', -.07); sibling.age += 1; }
  const partner = livingPartner(state);
  if (partner) {
    const appearanceChange = attractivenessAgeChange(partner);
    developSkills(partner, { ...partner, focus: { work: 3, social: 3, family: state.focus.family, self: 3 } });
    if (appearanceChange) addStat(partner, 'attractiveness', appearanceChange);
    addStat(partner, 'stability', wellbeingResponse(partner, 'stability', (state.focus.family - 2) * .035));
    if (partner.age >= 65) addStat(partner, 'health', -.07);
    partner.relationship = round(clamp(partner.relationship + (state.focus.family - 2) * .11, 1, 10));
    partner.yearsTogether += 1; partner.age += 1;
  }
}
const eventKey = pending => pending.subjectId ? `${pending.eventId}:${pending.subjectId}` : pending.eventId;
export function pendingEventSubject(state, pending) {
  if (!pending?.subjectType || pending.subjectType === 'player') return state;
  if (pending.subjectType === 'partner') return state.partner?.id === pending.subjectId ? state.partner : null;
  if (pending.subjectType === 'parent') return state.parents.find(person => person.id === pending.subjectId) || null;
  return state.children.find(person => person.id === pending.subjectId) || null;
}
function applyOutcome(state, event, outcome = event, context = {}) {
  const subject = pendingEventSubject(state, context);
  const before = { stats: effectiveStats(state), lifestyle: state.lifestyle, subjectStats: subject ? { ...subject.stats } : {}, relationship: subject?.relationship };
  const key = eventKey({ eventId: event.id, ...context });
  const description = (outcome.description || event.description).replaceAll('{name}', subject?.name || 'Your family member');
  for (const [key, amount] of Object.entries(outcome.statChanges || {})) addStat(state, key, amount);
  for (const [key, amount] of Object.entries(outcome.playerChanges || {})) addStat(state, key, amount);
  if (subject && subject !== state) {
    for (const [key, amount] of Object.entries(outcome.subjectChanges || {})) addStat(subject, key, amount);
    if (outcome.relationship) subject.relationship = round(clamp(subject.relationship + outcome.relationship, 1, 10));
  }
  let temporaryYears = 0;
  if (outcome.years > 0 && (Object.keys(outcome.modifiers || {}).length || outcome.lifestyle || outcome.focusLimits)) {
    const old = state.effects.find(effect => effect.id === key);
    const effect = { id: key, name: `${context.subjectId ? `${subject.name}: ` : ''}${event.name}`, description, years: Math.max(old?.years || 0, outcome.years), modifiers: { ...outcome.modifiers }, kind: event.kind };
    if (outcome.lifestyle) effect.lifestyle = outcome.lifestyle;
    if (outcome.focusLimits) effect.focusLimits = clone(outcome.focusLimits);
    if (old) {
      delete old.focusLimits;
      Object.assign(old, { lifestyle: 0 }, effect);
    }
    else state.effects.push(effect);
    temporaryYears = effect.years;
  }
  clampFocusToLimits(state);
  syncFamilyLifestyles(state);
  const label = key => SKILLS.find(skill => skill.key === key)?.label || ({ health: 'Health', stability: 'Mental stability' }[key]);
  const after = effectiveStats(state);
  const keys = new Set([...Object.keys(outcome.statChanges || {}), ...Object.keys(outcome.playerChanges || {}), ...Object.keys(outcome.modifiers || {})]);
  const changes = [...keys].map(key => `Your ${label(key).toLowerCase()} ${before.stats[key]} → ${after[key]}`);
  if (subject && subject !== state) {
    for (const key of Object.keys(outcome.subjectChanges || {})) changes.push(`${subject.name}: ${label(key)} ${before.subjectStats[key]} → ${subject.stats[key]}`);
    if (outcome.relationship) changes.push(`${subject.name}: Relationship ${before.relationship} → ${subject.relationship}`);
  }
  if (outcome.lifestyle) changes.push(`Lifestyle ${before.lifestyle} → ${state.lifestyle}`);
  const decision = outcome === event ? '' : `${outcome.label}. `;
  const result = changes.length ? `${changes.join('; ')}.` : 'No stat changes.';
  const duration = temporaryYears ? ` Temporary effects: ${temporaryYears} ${temporaryYears === 1 ? 'year' : 'years'}.` : '';
  const limits = Object.entries(outcome.focusLimits?.[focusStage(state)] || {})
    .filter(([, max]) => max < 5)
    .map(([key, max]) => `${focusLabel(state, key)} max ${max}`);
  const restrictions = limits.length ? ` ${limits.join('; ')}.` : '';
  log(state, `${context.subjectId ? `${subject.name}: ` : ''}${event.name}`, `${decision}${result}${restrictions}${duration}`, event.kind);
}

export function resolveEventChoice(state, choiceId, expectedEventId, expectedSubjectId) {
  const pending = state.pendingEvents[0];
  if (!pending) return fail('There is no event choice to resolve.');
  if (expectedEventId !== undefined && pending.eventId !== expectedEventId) return fail('That event has already been resolved.');
  if (expectedSubjectId !== undefined && (pending.subjectId || '') !== expectedSubjectId) return fail('That family event has already been resolved.');
  const event = EVENTS.find(candidate => candidate.id === pending.eventId);
  const choice = event?.choices?.find(candidate => candidate.id === choiceId);
  if (!choice) return fail('Choose one of the options for this event.');
  if (!pendingEventSubject(state, pending)) return fail('That family member is unavailable.');
  applyOutcome(state, event, choice, pending);
  state.pendingEvents.shift();
  return { ok: true, eventId: event.id, choiceId: choice.id, remaining: state.pendingEvents.length };
}

function routineYear(state, growthRandom, careerRandom) {
  const people = [state, ...state.parents, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
  const before = people.map(person => {
    ensureGrowth(person);
    return { person, stats: { ...person.stats }, relationship: person.relationship,
      growth: advanceGrowth(person === state ? { ...person, stats: effectiveStats(state) } : person, growthRandom ? growthRandom() : 0) };
  });
  growYear(state);
  const careerEvents = parentCareersForYear(state, careerRandom, growthRandom);
  annualFinances(state);
  ageFamily(state);
  for (const previous of before) {
    const person = previous.person;
    person.height = previous.growth.height;
    // State's age increments below; family members have already aged.
    if ((person === state ? state.age + 1 : person.age) >= person.maturityAge) person.adultHeight = person.height;
    if (!growthRandom) continue;
    for (const key of STAT_KEYS) {
      const change = person.stats[key] - previous.stats[key];
      // Abstract skill variation is gameplay calibration, not measured human
      // intelligence/appearance SD. Affinity supplies persistent differences;
      // this residual provides modest, reproducible year-to-year variation.
      const draw = growthRandom();
      const wellbeing = key === 'health' || key === 'stability';
      const sd = Math.abs(change) * (wellbeing ? .25 : key === 'attractiveness' ? .3 : .2) + (wellbeing ? .02 : key === 'attractiveness' ? .04 : .06);
      person.stats[key] = round(clamp(previous.stats[key] + change + clamp(draw, -3, 3) * sd, 1, 10));
    }
    if (Number.isFinite(previous.relationship)) {
      const change = person.relationship - previous.relationship;
      const neutralCrying = state.age < 2 && state.cryLevel === 3 && state.parents.includes(person);
      const sd = neutralCrying ? 0 : Math.abs(change) * .2 + .01;
      person.relationship = round(clamp(previous.relationship + change + clamp(growthRandom(), -3, 3) * sd, 1, 10));
    }
  }
  state.effects.forEach(effect => { effect.years -= 1; });
  state.effects = state.effects.filter(effect => effect.years > 0);
  state.age += 1;
  focusAfterBirthday(state);
  syncFamilyLifestyles(state);
  for (const event of careerEvents) log(state, event.title, event.text, event.kind);
}
function yearSnapshot(state) {
  return { age: state.age, height: state.height, stats: effectiveStats(state), lifestyle: state.lifestyle,
    parents: state.parents.map(p => ({ id: p.id, name: p.name, lifestyle: p.lifestyle, stability: p.stats.stability, relationship: p.relationship })) };
}
function yearChanges(before, state) {
  const after = yearSnapshot(state);
  const delta = (a, b) => ({ before: a, after: b, change: round(b - a) });
  return { fromAge: before.age, toAge: state.age,
    height: delta(before.height, after.height),
    stats: Object.fromEntries(STAT_KEYS.map(key => [key, delta(before.stats[key], after.stats[key])])),
    lifestyle: delta(before.lifestyle, after.lifestyle),
    parents: before.parents.map(parent => {
      const next = after.parents.find(p => p.id === parent.id) || parent;
      return { id: parent.id, name: parent.name, lifestyle: delta(parent.lifestyle, next.lifestyle), stability: delta(parent.stability, next.stability), relationship: delta(parent.relationship, next.relationship) };
    }) };
}
// A pure preview of routine growth, finances, aging and expiring effects.
// Random events, deaths, new relationships, births and unresolved choices are excluded.
export function annualForecast(state) {
  const draft = clone(state);
  const before = yearSnapshot(state);
  if (active(state).ok && !needsEducationChoice(state)) routineYear(draft);
  return yearChanges(before, draft);
}
export function statPercentiles(state) {
  if (state.age >= 18 || state.alive === false) return null;
  const stats = effectiveStats(state);
  const age = clamp(Math.floor(state.age), 0, 17);
  const estimate = (current, reference) => {
    const value = round(current);
    return { value, mean: reference.mean, sd: reference.sd, percentile: normalPercentile(value, reference.mean, reference.sd) };
  };
  const result = Object.fromEntries(STAT_KEYS.map(key => {
    const reference = PERCENTILE_REFERENCE.stats[key].ages[age];
    return [key, estimate(stats[key], reference)];
  }));
  const height = PERCENTILE_REFERENCE.height[state.growthSex || 'male'];
  result.height = estimate(state.height, height.ages[age]);
  // All ranks compare current values with simulated peers of the same age.
  // These reads never consume RNG or influence the next year's development.
  result.lifestyle = estimate(state.lifestyle, PERCENTILE_REFERENCE.lifestyle[age]);
  return result;
}
export function dismissYearSummary(state) {
  if (state.yearSummary) state.yearSummary.dismissed = true;
  return ok();
}
export function mortalityOdds(state) {
  const people = [state, ...state.parents, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
  const otherParent = state.pregnancy?.otherParent;
  if (otherParent?.alive && !people.some(person => person.id === otherParent.id)) people.push(otherParent);
  return people
    .map(person => ({ id: person.id, name: person.name, ...mortalityRisk(person === state ? { ...state, stats: effectiveStats(state) } : person) }));
}
function applyDeath(state, person, death) {
  person.alive = false;
  person.death = { cause: death.cause, age: person.age };
  const cause = death.cause === 'accident' ? 'an accident' : 'illness or natural causes';
  log(state, person === state ? 'A life remembered' : `Remembering ${person.name}`, `${person.name} dies at ${person.age} from ${cause}.`, 'family');
  if (person === state) {
    state.needsSuccession = true;
    state.pendingEvents = [];
    state.encounters = [];
  } else addStat(state, 'stability', -(person.relationship ?? 5) * .08);
  if (state.pregnancy?.carrierId === person.id) {
    state.pregnancy = null;
    log(state, 'An expected life is lost', 'The pregnancy ends.', 'family');
  }
}

export function advanceYear(state, { mortalityRandom, growthRandom, parentCareerRandom } = {}) {
  const status = active(state); if (!status.ok) return status;
  if (needsEducationChoice(state)) return fail('Choose college or a career before advancing the year.');
  const violation = focusLimitViolation(state);
  if (violation) return fail(`${focusLabel(state, violation[0])} is limited to ${violation[1]} this year. Lower it before continuing.`);
  const before = yearSnapshot(state);
  const decisions = state.age < 2 ? { cryLevel: state.cryLevel } : {
    focus: state.age < 5 ? { ...state.focus, creative: state.focus.creative ?? 0 } : { ...state.focus },
    workLabel: state.age < 5 ? 'Play' : state.age < 18 ? 'School' : state.education.status === 'college' ? 'College' : 'Career',
  };
  const oldMemories = new Set(state.history.map(memory => memory.id));
  // Each eligible event has its own independent roll. Shuffle before limiting
  // to five so the catalogue's ordering never gives an event priority.
  const odds = eventOdds(state).filter(event => event.chance > 0);
  for (let index = odds.length - 1; index > 0; index--) {
    const other = integer(state, 0, index);
    [odds[index], odds[other]] = [odds[other], odds[index]];
  }
  let selected = odds.filter(event => random(state) < event.chance).slice(0, 5);
  // One independent competing-risk draw for each living person, using their
  // start-of-year age/stats. Mortality never competes for ordinary event slots.
  const people = [state, ...state.parents, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
  // A casual/co-parent pregnancy can refer to someone outside the household.
  const otherParent = state.pregnancy?.otherParent;
  if (otherParent?.alive && !people.some(person => person.id === otherParent.id)) people.push(otherParent);
  const deaths = people.map(person => ({ person, result: rollMortality(person === state ? { ...state, stats: effectiveStats(state) } : person, mortalityRandom || (() => random(state))) })).filter(item => item.result);
  routineYear(state, growthRandom || (() => normal(state)), parentCareerRandom || (() => random(state)));
  if (otherParent?.alive && ![...state.parents, ...state.children, ...state.siblings, state.partner].some(person => person?.id === otherParent.id)) otherParent.age += 1;
  for (const { person, result } of deaths) applyDeath(state, person, result);
  selected = selected.filter(roll => state.alive && (!roll.subjectId || pendingEventSubject(state, roll)?.alive !== false));
  state.lastYearEvents = selected.map(roll => roll.id);
  for (const roll of selected) {
    const event = EVENTS.find(event => event.id === (roll.eventId || roll.id));
    const context = roll.subjectId ? { subjectType: roll.subjectType, subjectId: roll.subjectId } : {};
    if (event.choices?.length) {
      state.pendingEvents.push({ eventId: event.id, age: state.age, ...context });
      const subject = pendingEventSubject(state, context);
      log(state, roll.name, event.description.replaceAll('{name}', subject.name), 'choice');
    } else applyOutcome(state, event, event, context);
  }
  if (!selected.length && !deaths.length && !state.history.some(memory => !oldMemories.has(memory.id))) log(state, 'Events', 'None', 'quiet');
  syncFamilyLifestyles(state);
  if (state.age === 2) log(state, 'Toddler activities unlocked', 'No stat changes.', 'milestone');
  if (state.age === 5) log(state, 'School started', 'No stat changes.', 'milestone');
  if (state.age === 18) {
    state.education = { status: 'undecided', years: 0 };
    state.jobOffers = makeJobOffers(state);
    log(state, 'Adulthood reached', 'College and career choices unlocked. No stat changes.', 'milestone');
  } else if (state.education.status === 'college') {
    state.education.years += 1;
    if (state.education.years === 4) {
      state.education.status = 'graduate';
      state.jobOffers = makeJobOffers(state, true);
      log(state, 'College completed', 'Graduate job offers unlocked. No stat changes.', 'milestone');
    }
  }
  if (state.age === 65) log(state, 'Retirement unlocked', 'No stat changes.', 'milestone');
  if (state.pregnancy && state.pregnancy.dueAge <= state.age) {
    const otherParent = state.pregnancy.otherParent;
    state.pregnancy = null;
    welcomeChild(state, false, otherParent);
  } else if (state.alive && !state.pregnancy && random(state) < pregnancyChance(state)) startPregnancy(state, state.partner);
  syncFamilyLifestyles(state);
  state.encounters = state.alive ? createProspects(state, datingHelpers(state), effectiveStats(state)).map(person => demographics(person)) : [];
  state.encounterYear = state.age;
  if (state.encounters.length) log(state, 'Someone new', `You meet ${state.encounters.length} new ${state.encounters.length === 1 ? 'person' : 'people'}.`, 'relationship');
  if (state.age >= 85) {
    state.encounters = [];
    state.needsSuccession = true;
    state.ended = false;
    if (state.alive) log(state, 'Time for the next chapter', 'You retire at 85.', 'milestone');
  }
  state.yearSummary = { ...yearChanges(before, state), decisions, events: state.history.filter(memory => !oldMemories.has(memory.id)).map(({ title, text, kind }) => ({ title, text, kind })), dismissed: false };
  return { ok: true, eventId: selected[0]?.eventId || selected[0]?.id || null, eventIds: [...state.lastYearEvents] };
}

function welcomeChild(state, adopted, otherParent = null) {
  const otherAptitudes = otherParent?.aptitudes || randomAptitudes(state);
  const aptitudes = adopted ? otherAptitudes : inheritAptitudes(state, state.aptitudes, otherAptitudes);
  const gender = random(state) < .5 ? 'female' : 'male';
  const child = demographics({ id: uid(state, 'child'), name: personName(state, state.familyName, gender), familyName: state.familyName, age: 0, stats: randomStats(state, aptitudes), aptitudes, height: fromCentimeters(50), adultHeight: null, money: 0, lifestyle: state.lifestyle, alive: true, adopted, relationship: initialBond(state) }, gender);
  newbornGrowth(state, child, adopted ? [] : [state, otherParent].filter(Boolean));
  const coParent = adopted ? livingPartner(state) : otherParent;
  child.parentIds = [state.id, ...(coParent ? [coParent.id] : [])];
  state.children.push(child); state.lastChildAge = state.age;
  syncFamilyLifestyles(state);
  log(state, adopted ? 'A new beginning' : 'A new branch', adopted ? `You adopt ${child.name}.` : `${child.name} joins your family.`, 'family');
  return { ok: true, childId: child.id };
}

export function haveChild(state) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 18) return fail('You can adopt a child from age 18.');
  if (state.children.length + (state.pregnancy ? 1 : 0) >= 6) return fail('This family already has six children or a baby on the way filling its last place.');
  if (state.lastChildAge === state.age) return fail('You can welcome one child per year.');
  return welcomeChild(state, true);
}

// A beneficiary is a stable preview, derived from this chapter rather than the
// live RNG. Looking at retirement options never rerolls events or consumes IDs.
function legacyBeneficiary(state) {
  const seed = personHash({ id: state.id, name: state.seed + ':' + state.generation });
  const draft = { rng: seed, nextId: 0 };
  const familyName = pick(draft, LAST_NAMES.filter(name => name.toLocaleLowerCase() !== state.familyName.toLocaleLowerCase()));
  const age = integer(draft, 6, 12), gender = random(draft) < .5 ? 'female' : 'male';
  const aptitudes = randomAptitudes(draft);
  const person = {
    id: 'beneficiary-' + state.seed + '-' + state.generation + '-' + seed,
    name: personName(draft, familyName, gender), familyName, age: 0, adultHeight: null,
    height: fromCentimeters(50),
    stats: randomStats(draft, aptitudes),
    aptitudes, money: 0, lifestyle: 1, alive: true,
    relationship: 3, adopted: false,
  };
  demographics(person, gender);
  newbornGrowth(draft, person);
  while (person.age < age) {
    Object.assign(person, advanceGrowth(person, normal(draft)));
    developSkills(person);
    for (const key of CORE) if (key !== 'attractiveness') addStat(person, key, normal(draft) * .06);
    person.age++;
  }
  person.stats.attractiveness = round(clamp(5 + normal(draft) * BIRTH_VARIATION.appearance, 1, 10));
  return person;
}

export function successionInfo(state) {
  const played = new Set(state.lineage.map(person => person.id));
  const available = person => person.alive !== false && person.age < 85 && !played.has(person.id);
  const children = state.children.filter(available);
  const siblings = state.siblings.filter(available);
  const route = children.length ? 'children' : siblings.length ? 'siblings' : 'beneficiary';
  const beneficiary = route === 'beneficiary' ? legacyBeneficiary(state) : null;
  const candidates = route === 'children' ? children : route === 'siblings' ? siblings : [beneficiary];
  const rate = round(clamp(.95 - .05 * state.lifestyle, .45, .9));
  const estate = Math.floor(state.money * rate);
  const share = children.length ? estate / children.length : estate;
  const eligible = (state.age >= 65 || state.alive === false) && !state.ended && !state.pendingEvents.length && !state.pregnancy;
  const reason = state.pendingEvents.length ? 'Resolve your event choices before continuing.' : state.pregnancy ? 'Welcome the expected child before passing the story on.' : state.ended ? 'This chapter has ended.' : state.age < 65 && state.alive !== false ? 'Retirement opens at age 65.' : '';
  return { eligible, reason, estate, share, rate, children, siblings, route, candidates, beneficiary };
}
export function succeed(state, heirId) {
  const info = successionInfo(state);
  if (!info.eligible) return fail(info.reason);
  const candidate = info.candidates.find(person => person.id === heirId);
  if (!candidate) return fail('Choose one of the available retirement heirs.');
  const heir = ensureGrowth(clone(candidate));
  const familyName = info.route === 'beneficiary' ? heir.familyName : state.familyName;
  useFamilyName(heir, familyName);
  const identity = { gender: state.gender, canGestate: state.canGestate, attractedTo: [...state.attractedTo], appearancePeakAge: state.appearancePeakAge, familyName: state.familyName, growthSex: state.growthSex, growthFactor: state.growthFactor, maturityAge: state.maturityAge, birthHeight: state.birthHeight, adultHeight: state.adultHeight, growthAnchor: clone(state.growthAnchor) };
  const previous = { id: state.id, name: state.name, age: state.age, generation: state.generation, stats: clone(state.stats), aptitudes: clone(state.aptitudes), height: state.height, money: state.money, estate: info.estate, share: info.share, lifestyle: state.lifestyle, children: info.children.map(person => ({ id: person.id, name: person.name, inheritance: info.share })), alive: state.alive, death: state.death, retired: true, successor: { id: heir.id, name: heir.name, route: info.route }, ...identity };
  const formerParents = clone(state.parents);
  const formerSiblings = clone(state.siblings);
  state.lineage.push(previous);
  if (info.route === 'children') {
    state.siblings = info.children.filter(person => person.id !== heir.id).map(person => useFamilyName({ ...clone(person), money: person.money + info.share, inheritance: info.share }, familyName));
    state.parents = [{ id: previous.id, name: previous.name, age: previous.age, stats: clone(previous.stats), aptitudes: previous.aptitudes, height: previous.height, lifestyle: previous.lifestyle, alive: previous.alive, death: previous.death, relationship: heir.relationship, parentRole: previous.gender === 'female' ? 'mom' : previous.gender === 'male' ? 'dad' : 'parent', ...identity }];
    // Preserve a known co-parent; a later partner is not automatically a parent.
    if (state.partner && heir.parentIds?.includes(state.partner.id)) state.parents.push({ ...clone(state.partner), relationship: heir.relationship });
    // A child keeps the household they already lived in. A co-parent's old
    // standalone profile must not create an artificial support jump next year.
    for (const parent of state.parents) {
      parent.lifestyle = previous.lifestyle;
      parent.career = { ...(parent.career || initialParentCareer(parent, parent.id === previous.id ? state.focus.work : 1 + personHash(parent) % 5)), progress: previous.lifestyle };
    }
  } else if (info.route === 'siblings') {
    state.siblings = formerSiblings.filter(person => person.id !== heir.id);
    state.parents = formerParents;
  } else {
    state.siblings = [];
    state.parents = [];
  }
  state.id = heir.id; state.name = heir.name; state.familyName = familyName; state.age = heir.age; state.generation += 1;
  state.stats = heir.stats; state.aptitudes = heir.aptitudes; state.height = heir.height; state.adultHeight = heir.adultHeight;
  for (const key of ['growthSex', 'growthFactor', 'maturityAge', 'birthHeight', 'growthAnchor']) state[key] = clone(heir[key]);
  for (const parent of state.parents) parent.career ??= initialParentCareer(parent, parent.id === previous.id ? state.focus.work : 1 + personHash(parent) % 5);
  state.gender = heir.gender; state.canGestate = heir.canGestate; state.attractedTo = [...heir.attractedTo]; state.appearancePeakAge = heir.appearancePeakAge;
  state.money = heir.money + info.share;
  state.children = []; state.effects = []; state.pendingEvents = []; state.lastYearEvents = []; state.focus = state.age >= 2 && state.age < 5 ? { ...TODDLER_FOCUS } : { work: 3, social: 3, family: 3, self: 3 };
  state.partner = null; state.pregnancy = null; state.encounters = []; state.encounterYear = state.age;
  state.jobId = null; state.jobYears = 0; state.performance = 0; state.income = 0; state.expenses = 0; state.lifestyle = lifestyleFromResources(0, state.money);
  state.babyChoice = 'quiet'; state.cryLevel = 1; state.alive = true; state.death = null; state.yearSummary = null; state.schoolProgress = 0; state.lastChildAge = -1; state.ended = false; state.needsSuccession = false;
  state.education = { status: state.age < 18 ? 'school' : 'undecided', years: 0 };
  state.jobOffers = state.age < 18 ? [] : makeJobOffers(state);
  syncFamilyLifestyles(state);
  const inheritance = info.route === 'children' ? 'You inherit an equal share.' : 'You inherit the family legacy.';
  log(state, 'The story continues', 'You continue as ' + state.name + ', age ' + state.age + '. ' + inheritance, 'milestone');
  return ok();
}

function validSchema(raw, version) {
  try {
    if (!raw || typeof raw !== 'object' || raw.version !== version) return false;
    const finite = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
    const heightBound = cm => version >= 10 ? fromCentimeters(cm) : cm;
    const text = (s, max = 1000) => typeof s === 'string' && s.length > 0 && s.length <= max;
    const legacy = version < 4;
    const coreKeys = legacy ? [...CORE, 'discipline'] : CORE;
    const statKeys = [...coreKeys, 'health', version === 1 ? 'instability' : 'stability', ...(legacy ? ['relaxation'] : [])];
    const validStats = stats => stats && Object.keys(stats).length === statKeys.length && statKeys.every(key => finite(stats[key], 1, 10));
    const validLifestyle = value => finite(value, 1, 10) && (version >= 13 || Number.isInteger(value));
    const aptitudeKeys = version >= 12 ? STAT_KEYS : coreKeys;
    const validAptitudes = aptitude => aptitude && Object.keys(aptitude).length === aptitudeKeys.length && aptitudeKeys.every(key => Number.isInteger(aptitude[key]) && finite(aptitude[key], -3, 3));
    const validGeneration = value => Number.isInteger(value) && finite(value, 1, 100000);
    const genders = ['male', 'female', 'nonbinary'];
    const validIdentity = person => genders.includes(person.gender) && typeof person.canGestate === 'boolean' && Array.isArray(person.attractedTo) && person.attractedTo.length > 0 && person.attractedTo.length <= 3 && new Set(person.attractedTo).size === person.attractedTo.length && person.attractedTo.every(gender => genders.includes(gender)) && Number.isInteger(person.appearancePeakAge) && finite(person.appearancePeakAge, version >= 8 ? 22 : 27, 33);
    const validAdultHeight = person => version >= 9 ? (person.adultHeight === null && person.age < (person.maturityAge ?? 18) || finite(person.adultHeight, heightBound(40), heightBound(240))) : finite(person.adultHeight, 145, 205);
    const validGrowth = person => ['male','female'].includes(person.growthSex) && Number.isInteger(person.maturityAge) && finite(person.maturityAge, 14, 18) && finite(person.birthHeight, heightBound(40), heightBound(60)) && validAdultHeight(person) && (version < 9 || finite(person.growthFactor, .8, 1.2)) && (person.growthAnchor === null || person.growthAnchor && Number.isInteger(person.growthAnchor.age) && finite(person.growthAnchor.age, 0, person.age) && finite(person.growthAnchor.height, heightBound(40), heightBound(210)));
    const validDeath = person => person.death === undefined || person.death === null || person.alive === false && ['disease', 'accident'].includes(person.death.cause) && person.death.age === person.age;
    const validPerson = person => person && text(person.id, 100) && text(person.name, 50) && Number.isInteger(person.age) && finite(person.age, 0, version >= 7 ? 200 : 120) && finite(person.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) && validStats(person.stats) && validAptitudes(person.aptitudes) && (version === 1 || validLifestyle(person.lifestyle)) && (person.adopted === undefined || typeof person.adopted === 'boolean') && (version < 5 || validIdentity(person)) && (version < 6 || text(person.familyName, 30) && normalizeSurname(person.familyName) === person.familyName) && (version < 7 || validDeath(person));
    if (!validPerson(raw) || raw.age > 85 || !Number.isInteger(raw.generation) || !finite(raw.generation, 1, 100000)) return false;
    if (version >= 8 && (!validGrowth(raw) || ![...raw.parents, ...raw.children, ...raw.siblings, ...raw.lineage, raw.partner, ...raw.encounters, raw.pregnancy?.otherParent].filter(Boolean).every(person => (['growthSex','maturityAge','birthHeight','growthAnchor'].every(key => person[key] === undefined) || validGrowth(person)) && (person.parentRole === undefined || ['mom','dad','parent'].includes(person.parentRole))))) return false;
    if (![raw.seed, raw.rng, raw.nextId].every(value => Number.isInteger(value) && finite(value, 0, Number.MAX_SAFE_INTEGER))) return false;
    if (!finite(raw.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) || !validAdultHeight(raw)) return false;
    const validFocus = (focus, keys) => focus && Object.keys(focus).length === keys.length && keys.every(key => Number.isInteger(focus[key]) && finite(focus[key], 0, 5)) && keys.reduce((sum, key) => sum + focus[key], 0) <= 12;
    const currentFocusKeys = version >= 11 && raw.age >= 2 && raw.age < 5 && Object.hasOwn(raw.focus || {}, 'creative') ? focusKeys(raw.age) : FOCUS_KEYS;
    if (!validFocus(raw.focus, currentFocusKeys)) return false;
    if (!['cry', 'quiet'].includes(raw.babyChoice) || ![raw.ended, raw.needsSuccession].every(value => typeof value === 'boolean')) return false;
    const validLivingAge = person => typeof person.alive === 'boolean' && (version >= 7 || person.age <= 85 && (!person.alive || person.age < 85));
    if (version >= 7) {
      if (!Number.isInteger(raw.cryLevel) || !finite(raw.cryLevel, 1, 5) || typeof raw.alive !== 'boolean' || !validDeath(raw)) return false;
      if (raw.alive ? raw.death !== null : !raw.death || !raw.needsSuccession || raw.pendingEvents.length || raw.pregnancy) return false;
      const validDelta = value => value && finite(value.before, 1, 10) && finite(value.after, 1, 10) && finite(value.change, -9, 9) && Math.abs(round(value.after - value.before) - value.change) < .001;
      const summary = raw.yearSummary;
      if (summary?.decisions !== undefined) {
        const decisions = summary.decisions;
        if (!decisions || typeof decisions !== 'object' || Array.isArray(decisions)) return false;
        if (Object.hasOwn(decisions, 'cryLevel')) {
          // Older saves can retain a completed cry decision from age 2.
          if (summary.fromAge >= 3 || Object.keys(decisions).length !== 1 || !Number.isInteger(decisions.cryLevel) || !finite(decisions.cryLevel, 1, 5)) return false;
        } else {
          const focus = decisions.focus;
          const keys = version >= 11 && decisions.workLabel === 'Play' && summary.fromAge >= 2 && summary.fromAge < 5 && Object.hasOwn(focus || {}, 'creative') ? focusKeys(summary.fromAge) : FOCUS_KEYS;
          if (summary.fromAge < (version >= 10 ? 2 : 3) || Object.keys(decisions).length !== 2 || !(version >= 10 ? ['Play', 'School', 'College', 'Career'] : ['School', 'College', 'Career']).includes(decisions.workLabel) || !validFocus(focus, keys)) return false;
        }
      }
      if (summary?.height !== undefined && (!finite(summary.height.before, heightBound(40), heightBound(240)) || !finite(summary.height.after, heightBound(40), heightBound(240)) || !finite(summary.height.change, 0, heightBound(200)) || Math.abs(round(summary.height.after - summary.height.before) - summary.height.change) > .001)) return false;
      if (summary !== null && (!summary || typeof summary.dismissed !== 'boolean' || summary.toAge !== raw.age || summary.fromAge !== raw.age - 1 || !summary.stats || Object.keys(summary.stats).length !== STAT_KEYS.length || !STAT_KEYS.every(key => validDelta(summary.stats[key])) || !validDelta(summary.lifestyle) || !Array.isArray(summary.parents) || summary.parents.length > 2 || !summary.parents.every(parent => text(parent.id, 100) && text(parent.name, 50) && validDelta(parent.stability) && validDelta(parent.relationship) && (parent.lifestyle === undefined || validDelta(parent.lifestyle))) || !Array.isArray(summary.events) || summary.events.length > 30 || !summary.events.every(event => text(event.title, 200) && text(event.text, 2000) && text(event.kind, 50)))) return false;
    }
    if (!Array.isArray(raw.parents) || raw.parents.length > 2 || !raw.parents.every(person => validPerson(person) && validLivingAge(person) && (!person.alive || person.age > raw.age))) return false;
    if (version >= 7 && !raw.parents.every(person => finite(person.relationship, 1, 10))) return false;
    if (version >= 9 && !raw.parents.every(person => person.career && Number.isInteger(person.career.focus) && finite(person.career.focus, 0, 5) && ['employed','unemployed','retired'].includes(person.career.status) && finite(person.career.progress, 1, 10) && Number.isInteger(person.career.years) && finite(person.career.years, 0, 200))) return false;
    if (!Array.isArray(raw.children) || raw.children.length > 6 || !raw.children.every(child => validPerson(child) && validLivingAge(child) && child.age < raw.age && finite(child.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) && validAdultHeight(child) && finite(child.money, 0, 1e15))) return false;
    if (version >= 7 && ![...raw.children, ...(raw.siblings || [])].every(person => person.parentIds === undefined || Array.isArray(person.parentIds) && person.parentIds.length >= 1 && person.parentIds.length <= 2 && new Set(person.parentIds).size === person.parentIds.length && person.parentIds.every(id => text(id, 100) && id !== person.id))) return false;
    if (!Array.isArray(raw.siblings) || !raw.siblings.every(person => validPerson(person) && validLivingAge(person) && validAdultHeight(person) && finite(person.money, 0, 1e15))) return false;
    const familyIds = [raw.id, ...raw.parents.map(person => person.id), ...raw.children.map(person => person.id), ...raw.siblings.map(person => person.id)];
    if (new Set(familyIds).size !== familyIds.length) return false;
    if (version >= 5) {
      if (![...raw.children, ...raw.siblings].every(person => finite(person.relationship, 1, 10))) return false;
      const validAdult = person => validPerson(person) && person.age >= 18 && validLivingAge(person) && validAdultHeight(person);
      const partner = raw.partner;
      if (partner !== null && (!validAdult(partner) || raw.age < 18 || !finite(partner.relationship, 1, 10) || !Number.isInteger(partner.yearsTogether) || !finite(partner.yearsTogether, 0, 100) || typeof partner.married !== 'boolean' || !Number.isInteger(partner.lastProposalAge) || !finite(partner.lastProposalAge, -1, raw.age) || familyIds.includes(partner.id))) return false;
      if (!Number.isInteger(raw.encounterYear) || !finite(raw.encounterYear, 0, raw.age) || !Array.isArray(raw.encounters) || raw.encounters.length > 5) return false;
      if (raw.encounters.length && (raw.age < 18 || raw.encounterYear !== raw.age || partner?.alive !== false && partner !== null)) return false;
      if (!raw.encounters.every(person => validAdult(person) && person.alive && !familyIds.includes(person.id) && person.id !== partner?.id) || new Set(raw.encounters.map(person => person.id)).size !== raw.encounters.length) return false;
      const pregnancy = raw.pregnancy;
      if (pregnancy !== null) {
        if (!pregnancy || raw.age < 18 || raw.age >= 85 || raw.children.length >= 6 || !validAdult(pregnancy.otherParent) || !text(pregnancy.carrierName, 50) || !Number.isInteger(pregnancy.startedAge) || pregnancy.startedAge !== raw.age || pregnancy.dueAge !== raw.age + 1 || typeof pregnancy.casual !== 'boolean') return false;
        const carrier = gestatingActor(raw, pregnancy.otherParent);
        if (!carrier || carrier.id !== pregnancy.carrierId || carrier.age < 18 || carrier.age > 45) return false;
      }
    }
    if (![raw.money, raw.income, raw.expenses].every(value => finite(value, 0, 1e15)) || !validLifestyle(raw.lifestyle)) return false;
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
    const validLimits = limits => limits && typeof limits === 'object' && !Array.isArray(limits) && Object.keys(limits).length > 0 && Object.entries(limits).every(([stage, caps]) => {
      const keys = stage === 'toddler' ? [...FOCUS_KEYS, 'creative'] : stage === 'standard' ? FOCUS_KEYS : null;
      return keys && caps && typeof caps === 'object' && !Array.isArray(caps) && Object.keys(caps).length > 0 && Object.entries(caps).every(([key, max]) => keys.includes(key) && Number.isInteger(max) && finite(max, 0, 5));
    });
    if (!Array.isArray(raw.effects) || raw.effects.length > (legacy ? 10 : 25) || !raw.effects.every(effect => text(effect.id, 100) && text(effect.name, 100) && typeof effect.description === 'string' && Number.isInteger(effect.years) && finite(effect.years, 1, legacy ? 3 : 5) && effect.modifiers && Object.entries(effect.modifiers).every(([key, value]) => statKeys.includes(key) && finite(value, -10, 10)) && (effect.lifestyle === undefined || !legacy && Number.isInteger(effect.lifestyle) && finite(effect.lifestyle, -10, 10)) && (effect.focusLimits === undefined || version >= 14 && validLimits(effect.focusLimits)))) return false;
    if (version >= 14 && focusLimitViolation(raw)) return false;
    if (!legacy) {
      const knownKey = key => typeof key === 'string' && (PERSONAL_EVENTS.some(event => event.id === key) || version >= 5 && FAMILY_EVENTS.some(event => key.startsWith(`${event.id}:`) && key.length <= 200));
      if (!Array.isArray(raw.lastYearEvents) || raw.lastYearEvents.length > 5 || new Set(raw.lastYearEvents).size !== raw.lastYearEvents.length || !raw.lastYearEvents.every(knownKey)) return false;
      if (!Array.isArray(raw.pendingEvents) || raw.pendingEvents.length > 5 || new Set(raw.pendingEvents.map(pending => pending && eventKey(pending))).size !== raw.pendingEvents.length) return false;
      if (!raw.pendingEvents.every(pending => {
        if (!pending || pending.age !== raw.age || !raw.lastYearEvents.includes(eventKey(pending))) return false;
        const event = EVENTS.find(event => event.id === pending.eventId);
        if (!event?.choices?.length) return false;
        if (event.subjectType) {
          if (version < 5 || pending.subjectType !== event.subjectType || !text(pending.subjectId, 100)) return false;
          const subject = pendingEventSubject(raw, pending);
          return subject && subject.age - 1 >= event.minAge && subject.age - 1 <= (event.maxAge ?? 85);
        }
        return !pending.subjectType && !pending.subjectId && raw.age - 1 >= event.minAge && raw.age - 1 <= (event.maxAge ?? 85);
      })) return false;
    }
    if (!Array.isArray(raw.history) || raw.history.length > 500 || !raw.history.every(memory => text(memory.id, 100) && finite(memory.age, 0, 85) && finite(memory.generation, 1, 100000) && text(memory.title, 200) && text(memory.text, 2000) && text(memory.kind, 50))) return false;
    if (!Array.isArray(raw.lineage) || !raw.lineage.every(person => validPerson(person) && validGeneration(person.generation) && typeof person.alive === 'boolean' && validLifestyle(person.lifestyle) && finite(person.money, 0, 1e15) && finite(person.estate, 0, 1e15) && finite(person.share, 0, 1e15) && Array.isArray(person.children) && person.children.length <= 6 && person.children.every(child => child && text(child.id, 100) && text(child.name, 50) && finite(child.inheritance, 0, 1e15)))) return false;
    if (raw.needsSuccession && ((raw.age < 85 && (version < 7 || raw.alive)) || raw.ended || version < 6 && !raw.children.some(child => child.alive !== false && child.age < 85))) return false;
    if (version >= 6 && raw.ended) return false;
    if (raw.ended && raw.age < 85) return false;
    if (raw.age === 85 && !raw.ended && !raw.needsSuccession) return false;
    return true;
  } catch { return false; }
}

export function validateSave(raw) { return validSchema(raw, 14); }

// Version 10 stores every measurement in inches. Source growth tables stay in
// centimetres; historical prose is rendered separately without rewriting it.
function convertSavedHeights(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (['height', 'birthHeight', 'adultHeight'].includes(key) && typeof item === 'number') value[key] = fromCentimeters(item);
    else if (key === 'height' && item && typeof item.before === 'number' && typeof item.after === 'number') {
      item.before = fromCentimeters(item.before);
      item.after = fromCentimeters(item.after);
      item.change = round(item.after - item.before);
    } else convertSavedHeights(item);
  }
}

export function migrateSave(raw) {
  try {
    if (validateSave(raw)) return clone(raw);
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].some(version => validSchema(raw, version))) return null;
    const state = clone(raw);
    // Existing lives receive neutral wellbeing aptitudes without rerolling
    // ratings or consuming random numbers, including saved pregnancy copies.
    const addWellbeingAptitudes = value => {
      if (!value || typeof value !== 'object') return;
      if (value.aptitudes) Object.assign(value.aptitudes, { health: 0, stability: 0 });
      Object.values(value).forEach(addWellbeingAptitudes);
    };
    if (state.version < 12) addWellbeingAptitudes(state);
    if (state.version < 11 && state.age >= 2 && state.age < 5) state.focus.creative = 0;
    if (state.version < 10) convertSavedHeights(state);
    if (state.version >= 9) {
      // Version 14 adds optional activity limits. Existing saved values,
      // including fractional lifestyle ratings from version 13, stay unchanged.
      state.version = 14;
      return validateSave(state) ? state : null;
    }
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
    for (const person of [state, ...state.parents, ...state.children, ...state.siblings, ...state.lineage]) {
      delete person.stats.discipline; delete person.stats.relaxation;
      delete person.aptitudes.discipline;
    }
    for (const effect of state.effects) { delete effect.modifiers.discipline; delete effect.modifiers.relaxation; }
    state.effects = state.effects.filter(effect => Object.keys(effect.modifiers).length || effect.lifestyle);
    if (state.version < 3) {
      const currentJob = JOBS.find(job => job.id === state.jobId);
      const status = state.age < 18 ? 'school' : currentJob?.requiresCollege ? 'graduate' : state.age === 18 && !currentJob ? 'undecided' : 'workforce';
      state.education = { status, years: status === 'graduate' ? 4 : 0 };
      state.jobOffers = state.age < 18 ? [] : makeJobOffers(state, status === 'graduate');
    }
    if (state.version < 4) { state.pendingEvents = []; state.lastYearEvents = []; }
    [state, ...state.parents, ...state.children, ...state.siblings, ...state.lineage].forEach(person => demographics(person, person === state ? person.gender || 'male' : person.gender));
    if (state.version < 5) {
      [...state.children, ...state.siblings].forEach(person => { person.relationship = 5; });
      state.partner = null; state.encounters = []; state.encounterYear = state.age; state.pregnancy = null;
    }
    for (const person of [state.partner, ...state.encounters, state.pregnancy?.otherParent].filter(Boolean)) demographics(person);
    if (state.age === 85) { state.ended = false; state.needsSuccession = true; }
    state.parents.forEach(parent => { parent.relationship ??= 5; });
    if (state.version < 7) {
      state.cryLevel = state.babyChoice === 'cry' ? 5 : 1;
      state.alive = true; state.death = null; state.yearSummary = null;
    }
    const people = [state, ...state.parents, ...state.children, ...state.siblings, ...state.lineage, state.partner, ...state.encounters, state.pregnancy?.otherParent].filter(Boolean);
    for (const person of people) {
      ensureGrowth(person);
      if (state.version < 8) {
        person.appearancePeakAge = appearanceDeclineAge(person);
        if (person.age >= 12 && person.age < 18) person.maturityAge = 18;
        if (person.age < 3 && person.stats.attractiveness < 3) {
          const relatives = person === state ? state.parents : [state];
          const center = relatives.length ? relatives.reduce((sum, p) => sum + p.stats.attractiveness, 0) / relatives.length : 5.5;
          person.stats.attractiveness = round(clamp(center + ((personHash(person) % 1001) / 1000 - .5), 3, 9));
        }
      }
      // Discard obsolete endpoints without changing a recorded measurement.
      // Future height emerges solely from new yearly gains.
      person.adultHeight = person.age >= person.maturityAge ? person.height : null;
      person.growthAnchor = null;
      delete person.heightGrowthLoss;
    }
    const names = new Set();
    const recordedHousehold = householdLifestyle(state);
    state.parents.forEach(parent => {
      parent.parentRole ??= parent.gender === 'female' ? 'mom' : parent.gender === 'male' ? 'dad' : 'parent';
      if (parent.alive !== false) parent.lifestyle = recordedHousehold;
      parent.career ??= initialParentCareer(parent, 1 + personHash(parent) % 5);
      if (names.has(parent.name.toLocaleLowerCase())) {
        const pool = GENDER_NAMES[parent.gender] || FIRST_NAMES;
        let index = personHash(parent) % pool.length;
        while (names.has(`${pool[index]} ${parent.familyName}`.toLocaleLowerCase())) index = (index + 1) % pool.length;
        parent.name = `${pool[index]} ${parent.familyName}`;
      }
      names.add(parent.name.toLocaleLowerCase());
    });
    state.version = 14;
    return validateSave(state) ? state : null;
  } catch { return null; }
}
