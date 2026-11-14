// Lifelines: deterministic, browser-independent simulation rules.
// All public actions mutate their state and return { ok, reason? }.
import { createSaveValidator } from './save-schema.js?v=parent-colors-events';
import { JOBS } from './jobs.js?v=parent-colors-events';
import { careerFit, careerYear } from './career-rules.js?v=parent-colors-events';
import { collegeById, createCollegeOffers, collegeGradeScore, graduateJobOffers } from './college.js?v=parent-colors-events';
import { collegeSportSuccessAfterYear, collegeSportFameChance, professionalSportChance } from './college-sports.js?v=parent-colors-events';
import { HOUSING_BALANCE, nextHousing, housingLifestyle, housingChanges } from './housing.js?v=parent-colors-events';
import { MAX_RESOURCES, lifestyleFromResources, changedLifestyle } from './lifestyle.js?v=parent-colors-events';
import { GENETICS_BALANCE, inheritRatings, inheritAffinities, inheritedGrowthFactor } from './genetics.js?v=parent-colors-events';
export { GENETICS_BALANCE };
export { lifestyleFromResources };
import { EVENTS as PERSONAL_EVENTS, eventChances } from './events.js?v=parent-colors-events';
import { FAMILY_EVENTS, familyEventChances } from './family-events.js?v=parent-colors-events';
import { FAME_EVENTS, fameEventChances } from './fame-events.js?v=parent-colors-events';
import { hasFame, fameFocusKey, fameActivityMatches, fameStartingRating, fameNextRating, fameLossChance, fameLifestyleBonus } from './fame.js?v=parent-colors-events';
import { eventStatCause } from './event-causes.js?v=parent-colors-events';
import { eventDescriptionAtAge } from './life-events.js?v=parent-colors-events';
import { mortalityRisk, rollMortality } from './mortality.js?v=parent-colors-events';
import { heightReference, advanceGrowth } from './growth.js?v=parent-colors-events';
import { initialParentCareer, careerForecast, advanceParentCareer } from './parent-careers.js?v=parent-colors-events';
import { naturalSkillRating, skillChanges, childhoodWellbeing, wellbeingResponse, caregiverCryEffects, unemploymentStabilityChange, standardFocusPractice, schoolAppearanceChange, DEVELOPMENT_BALANCE, BIRTH_VARIATION, SKILL_VARIATION, TODDLER_FOCUS, PARENT_FAMILY_RELATIONSHIP_GAIN, PARENT_FAMILY_STABILITY_GAIN, YEARLY_DECISION_SCALE } from './development.js?v=parent-colors-events';
import { PERCENTILE_REFERENCE } from './percentile-reference.js?v=parent-colors-events';
import { normalPercentile } from './percentiles.js?v=parent-colors-events';
import { changedRating } from './rating-changes.js?v=parent-colors-events';
import { MAX_FOCUS, DEFAULT_FOCUS, focusMaxFor, focusNeutralFor, isSchoolActivityFocus, focusEffect, focusKeysForAge, focusBudget, temporaryFocusPoints, defaultFocus, legacyFocusValue } from './focus-rules.js?v=parent-colors-events';
import { SCHOOL_OFFER_COUNT, schoolActivity, currentSchoolEnrollment, currentSchoolActivity, gradeScore, gradeLetter, activityGradeLetter, activitySuccessAfterYear, activityEligible, annualSchoolOffers, createSchoolRecord } from './school.js?v=parent-colors-events';
import { assignBirthConditions, applyBirthConditions, getBirthConditions, conditionFocusLimits } from './birth-conditions.js?v=parent-colors-events';
export { DEVELOPMENT_BALANCE };
export { heightPercentile } from './growth.js?v=parent-colors-events';
export { mortalityRisk } from './mortality.js?v=parent-colors-events';
import { datingPotential as datingPotentialRules, meetingChances as meetingRules, relationshipOdds as attractionRules, proposalChance as proposalRules, pregnancyChance as pregnancyRules, gestatingActor, createProspects, oneNightChance as casualRules, attractivenessAgeChange, appearanceDeclineAge } from './relationships.js?v=parent-colors-events';
export { JOBS, JOB_CATEGORIES } from './jobs.js?v=parent-colors-events';
export const EVENTS = [...PERSONAL_EVENTS, ...FAMILY_EVENTS, ...FAME_EVENTS];
const EVENT_BY_ID = new Map(EVENTS.map(event => [event.id, event]));

// Keep retired definitions available for saved history and pending decisions.
// Only future rolls require an authored consequence; a choice may still offer
// declining an otherwise meaningful opportunity without a rating change.
function authoredConsequence(outcome) {
  if (['statChanges', 'playerChanges', 'subjectChanges', 'aptitudeChanges', 'modifiers']
    .some(field => Object.values(outcome[field] || {}).some(Boolean))) return true;
  if (outcome.relationship || outcome.fameChange || outcome.fameSupport || outcome.fameAction) return true;
  return outcome.years > 0 && (outcome.householdLifestyle || outcome.focusPoints
    || ['focusLimits', 'focusCapacity', 'focusMinimums'].some(field => Object.values(outcome[field] || {}).some(stage => Object.keys(stage).length)));
}
function eventHasConsequence(event) {
  return event.id === 'household_parent_abandonment'
    || (event.choices?.length ? event.choices.some(authoredConsequence) : authoredConsequence(event));
}
function effectMechanics(effect) {
  const entries = value => Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b));
  const stages = field => entries(effect[field]).map(([stage, values]) => [stage, entries(values)]);
  return JSON.stringify([effect.years, entries(effect.modifiers).filter(([, amount]) => amount),
    effect.lifestyle || 0, effect.householdLifestyle || 0, effect.focusPoints || 0,
    stages('focusLimits'), stages('focusCapacity'), stages('focusMinimums')]);
}

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
const focusKeys = focusKeysForAge;
const legacyFocusKeys = age => age >= 2 && age < 5 ? [...FOCUS_KEYS, 'creative'] : FOCUS_KEYS;
const appearanceChange = person => attractivenessAgeChange(person) + schoolAppearanceChange(person);
function focusAfterBirthday(state) {
  if (state.age === 2) state.focus = { ...TODDLER_FOCUS };
  if (state.age === 5 && Object.hasOwn(state.focus, 'creative')) {
    const { creative, ...retained } = state.focus;
    state.focus = { ...retained, sports: 0, extracurricular: 0 };
    state.school = createSchoolRecord({ ...state, stats: effectiveStats(state) });
  }
  if (state.age === 18) {
    state.focus = Object.fromEntries(focusKeys(state).map(key => [key, state.focus[key] ?? DEFAULT_FOCUS]));
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
function initialBond(state) { return round(clamp(7 + normal(state), 0, 10)); }
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
function log(state, title, text, kind = 'neutral', description, cause) {
  state.history.unshift({ id: uid(state, 'memory'), age: state.age, generation: state.generation, title, text, kind, ...(description === undefined ? {} : { description }), ...(cause ? { cause } : {}) });
  state.history = state.history.slice(0, 500);
}
function addStat(person, key, amount) { person.stats[key] = changedRating(person.stats[key], amount); }
function developSkills(person, context = person, career = null, practiceScale = YEARLY_DECISION_SCALE) {
  for (const [key, amount] of Object.entries(skillChanges(context, career, practiceScale))) addStat(person, key, amount);
}
function randomStats(state, aptitudes) {
  const result = Object.fromEntries(CORE.filter(key => key !== 'attractiveness').map(key => [key, round(clamp(naturalSkillRating(aptitudes[key]) + normal(state) * BIRTH_VARIATION.skill, 0, 10))]));
  result.attractiveness = round(clamp(5 + normal(state) * BIRTH_VARIATION.appearance, 0, 10));
  return { ...result, health: round(clamp(naturalSkillRating(aptitudes.health) + normal(state) * BIRTH_VARIATION.health, 0, 10)), stability: round(clamp(naturalSkillRating(aptitudes.stability) + normal(state) * BIRTH_VARIATION.stability, 0, 10)) };
}
function randomAptitudes(state) { return Object.fromEntries(STAT_KEYS.map(key => [key, integer(state, -3, 3)])); }
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
  person.growthFactor = parents.length
    ? inheritedGrowthFactor(parents, () => normal(state))
    : Math.round(clamp(1 + normal(state) * .054, .8, 1.2) * 10000) / 10000;
  // Only attained adult height is stored. While growing there is no endpoint.
  person.adultHeight = null;
  person.growthAnchor = null;
}
function datingHelpers(state) {
  return { random: () => random(state), integer: (low, high) => integer(state, low, high), uid: prefix => uid(state, prefix), personName: gender => personName(state, undefined, gender), randomAptitudes: () => randomAptitudes(state) };
}
const livingPartner = state => state.partner?.alive !== false ? state.partner : null;
const dependents = state => state.children.filter(child => child.alive !== false && child.age < 18);
// Biological parents remain in family history after leaving. Care, routine
// relationship changes and household support follow the people still present.
export function caregivers(state) {
  const parents = (state.parents || []).filter(person => person.alive !== false && person.abandonedAt === undefined);
  return parents.length ? parents : state.guardian?.alive ? [state.guardian] : [];
}
function makeParent(state, lastName, gender) {
  const age = integer(state, 25, 40);
  const reference = heightReference(20, gender);
  const heightCm = round(clamp(reference.median + normal(state) * reference.sd, 145, 205));
  const height = fromCentimeters(heightCm);
  const growthFactor = Math.round(clamp(1 + (heightCm - reference.median) / (reference.median - heightReference(0, gender).median), .8, 1.2) * 10000) / 10000;
  const aptitudes = randomAptitudes(state);
  const parent = demographics({ id: uid(state, 'parent'), name: personName(state, lastName, gender), familyName: lastName, parentRole: gender === 'female' ? 'mom' : 'dad', age, stats: randomStats(state, aptitudes), aptitudes, height, adultHeight: height, growthFactor, alive: true, relationship: initialBond(state) }, gender);
  return assignBirthConditions(parent, state.seed);
}
function active(state) {
  if (state.pendingEvents.length) return fail('Resolve your event choices before continuing.');
  if (state.ended) return fail('This life has ended. Start a new family to play again.');
  if (state.needsSuccession) return fail('Choose an heir to continue the story.');
  return ok();
}

export function createGame({ name, surname: chosenSurname, firstName, seed, gender = 'male', canGestate, attractedTo } = {}) {
  const initialSeed = Number.isFinite(seed) ? seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
  const state = { version: 20, seed: initialSeed, rng: initialSeed, nextId: 0, id: `life-${initialSeed}`, age: 0, generation: 1,
    name: '', stats: {}, aptitudes: {}, height: fromCentimeters(50), adultHeight: null,
    focus: defaultFocus(0), school: null, fame: null, babyChoice: 'quiet', cryLevel: 1, alive: true, death: null, yearSummary: null,
    parents: [], guardian: null, children: [], siblings: [], money: 0, income: 0, expenses: 0, lifestyle: 1,
    jobId: null, jobYears: 0, performance: 0, careerProgress: 0, economyVersion: 1, schoolProgress: 0, lastChildAge: -1,
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
  state.parents.forEach(parent => { parent.lifestyle = homeLifestyle; parent.career = initialParentCareer(parent, integer(state, 1, 5), { assignJob: true }); });
  state.lifestyle = homeLifestyle;
  state.aptitudes = inheritAffinities(state.parents, () => normal(state));
  state.stats = inheritRatings(state.parents, () => normal(state));
  newbornGrowth(state, state, state.parents);
  assignBirthConditions(state, state.seed, state.parents);
  clampFocusToLimits(state);
  log(state, 'A life begins', `${state.name} is born.`, 'milestone');
  return state;
}

export function stage(state) {
  return state.age < 2 ? 'baby' : state.age < 5 ? 'toddler' : state.age < 13 ? 'child' : state.age < 18 ? 'teen' : state.age < 65 ? 'adult' : 'elder';
}
export function effectiveStats(state) {
  const result = { ...state.stats };
  const partner = livingPartner(state);
  if (partner) { result.social += partner.married ? .9 : .7; result.stability += partner.married ? .8 : .6; }
  result.social += Math.min(1.2, dependents(state).length * .2);
  for (const key of STAT_KEYS) result[key] = round(clamp(result[key], 0, 10));
  // Base ratings and ongoing family benefits remain bounded. Timed event
  // modifiers are a separate layer, so their full amount survives the bounds.
  for (const effect of state.effects) if (effect.years > 0) for (const [key, value] of Object.entries(effect.modifiers)) result[key] += value;
  for (const key of STAT_KEYS) result[key] = round(result[key]);
  return result;
}
export function currentEffects(state) { return state.effects.filter(effect => effect.years > 0); }
const focusStage = state => state.age < 2 ? null : state.age < 5 ? 'toddler' : 'standard';
function focusLabel(state, key) {
  if (state.age < 5) return { work: 'Play', social: 'Electronics', family: 'Family time', self: 'Rest', creative: 'Arts & crafts' }[key];
  return { work: state.age < 18 ? 'School' : state.education.status === 'college' ? 'College' : 'Career', social: 'Friends', family: 'Family', self: 'Yourself', sports: 'Sports', extracurricular: 'Extracurriculars' }[key];
}
// Standard restrictions survive birthdays. During school, restrictions on the
// old exercise-containing Yourself area also constrain the new Sports area.
function activeFocusCaps(state, caps = {}) {
  const limits = { ...caps };
  if (isSchoolActivityFocus(state, 'sports') && limits.self !== undefined && limits.self < MAX_FOCUS) limits.sports = Math.min(limits.sports ?? focusMaxFor(state, 'sports'), Math.floor(limits.self / 2));
  return Object.entries(limits).filter(([key, max]) => focusKeys(state).includes(key) && max < focusMaxFor(state, key));
}
export function focusLimitDetails(state) {
  const stage = focusStage(state);
  if (!stage) return [];
  const permanent = getBirthConditions(state).flatMap(condition => activeFocusCaps(state, condition.focusLimits?.[stage])
    .map(([key, max]) => ({ key, max, effectId: `birth-condition:${condition.id}`, name: condition.name, years: null, permanent: true })));
  return [...permanent, ...currentEffects(state).flatMap(effect => {
    const source = { effectId: effect.id, name: effect.name, years: effect.years };
    const entries = field => Object.entries(effect[field]?.[stage] || {}).filter(([key]) => focusKeys(state).includes(key));
    return [
      ...activeFocusCaps(state, effect.focusLimits?.[stage]).map(([key, max]) => ({ key, max, ...source })),
      ...entries('focusCapacity').map(([key, capacity]) => ({ key, capacity, ...source })),
      ...entries('focusMinimums').map(([key, minimum]) => ({ key, minimum, ...source })),
    ];
  })];
}
export function focusLimits(state) {
  const limits = Object.fromEntries(focusKeys(state).map(key => [key, focusMaxFor(state, key)]));
  const details = focusLimitDetails(state);
  for (const { key, capacity = 0 } of details) limits[key] += capacity;
  for (const key of Object.keys(limits)) limits[key] = clamp(limits[key], 0, focusMaxFor(state, key));
  for (const key of ['sports', 'extracurricular']) if (isSchoolActivityFocus(state, key)) {
    const activity = currentSchoolActivity(state, key);
    if (!activity || !activityEligible(state, activity)) limits[key] = 0;
  }
  for (const { key, max } of details) if (max !== undefined) limits[key] = Math.min(limits[key], max);
  return limits;
}
export function focusMinimums(state) {
  const limits = focusLimits(state);
  const minimums = Object.fromEntries(focusKeys(state).map(key => [key, 0]));
  for (const { key, minimum = 0 } of focusLimitDetails(state)) minimums[key] += minimum;
  // Hard limits and the total budget take priority over incompatible demands.
  // Stable focus order makes even extreme combinations deterministic.
  let remaining = focusBudget(state);
  for (const key of Object.keys(minimums)) {
    minimums[key] = Math.min(minimums[key], limits[key], remaining);
    remaining -= minimums[key];
  }
  return minimums;
}
function clampFocusToLimits(state) {
  // A fame-only adult activity disappears when its source is no longer active.
  const activeKeys = focusKeys(state);
  for (const key of Object.keys(state.focus)) if (!activeKeys.includes(key)) delete state.focus[key];
  const minimums = focusMinimums(state);
  for (const [key, max] of Object.entries(focusLimits(state))) {
    state.focus[key] = clamp(state.focus[key] ?? 0, minimums[key], max);
  }
  // Stage transitions and legacy allocations may exceed the smaller budget.
  // Remove only excess points, deterministically, without filling spare points.
  const keys = focusKeys(state);
  let excess = keys.reduce((sum, key) => sum + (state.focus[key] || 0), 0) - focusBudget(state);
  while (excess > 0) {
    const available = keys.filter(key => state.focus[key] > minimums[key]);
    const key = available.reduce((largest, next) => state.focus[next] > state.focus[largest] ? next : largest);
    state.focus[key]--;
    excess--;
  }
}
// Simulations can select a desired allocation using the same active constraints
// as player actions without mutating the person, effects, or random stream.
export function fitFocusAllocation(state, allocation) {
  const defaults = defaultFocus(state);
  const draft = { ...state, focus: Object.fromEntries(focusKeys(state).map(key => [key, allocation[key] ?? defaults[key]])) };
  clampFocusToLimits(draft);
  return draft.focus;
}
function focusLimitViolation(state) {
  if (state.age < 2) return null;
  return Object.entries(focusLimits(state)).find(([key, max]) => state.focus[key] > max);
}
export function setFocus(state, key, value) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 2) return fail('Activity choices unlock at age 2.');
  const keys = focusKeys(state);
  if (!keys.includes(key) || !Number.isInteger(value) || value < 0 || value > focusMaxFor(state, key)) return fail(`This focus must be a whole number from 0 to ${focusMaxFor(state, key)}.`);
  const maximum = focusLimits(state)[key];
  if (value > maximum) return fail(`${focusLabel(state, key)} is limited to ${maximum} this year.`);
  const minimum = focusMinimums(state)[key];
  if (value < minimum) return fail(`${focusLabel(state, key)} requires at least ${minimum} focus ${minimum === 1 ? 'point' : 'points'} this year.`);
  const total = keys.reduce((sum, other) => sum + (other === key ? value : state.focus[other] ?? 0), 0);
  if (total > focusBudget(state)) return fail(`You have ${focusBudget(state)} focus points. Lower another focus first.`);
  state.focus[key] = value;
  return ok();
}
export function enrollSchoolActivity(state, kind, id) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 5 || state.age >= 18 || !state.school || !['sports', 'extracurricular'].includes(kind)) return fail('School activities are available from ages 5 to 17.');
  if (state.school[kind]?.id === id) return ok();
  if (!state.school.offers[kind].includes(id)) return fail('Choose one of this year’s offered activities.');
  const activity = schoolActivity(kind, id);
  const endsFame = hasFame(state) && state.fame.kind === kind && state.fame.activityId !== id;
  const candidate = { ...state, ...(endsFame ? { fame: null, lifestyle: householdLifestyle(state, false) } : {}),
    school: { ...state.school, [kind]: { id, success: null } } };
  if (!activity || !activityEligible(candidate, activity)) return fail('Your lifestyle does not meet this activity’s requirement.');
  if (focusLimits(candidate)[kind] < 1) return fail('This activity is currently restricted.');
  const starting = Math.min(focusLimits(candidate)[kind], Math.max(1, state.focus[kind], focusMinimums(candidate)[kind]));
  const required = starting - state.focus[kind];
  if (Object.values(state.focus).reduce((sum, value) => sum + value, 0) + required > focusBudget(state)) return fail(required === 1 ? 'Free one focus point before joining this activity.' : `Free ${required} focus points before joining this activity.`);
  if (endsFame) endFame(state, 'A different direction', 'Switching activities ends the public profile built around your previous activity.');
  state.school[kind] = { id, success: null };
  state.focus[kind] = starting;
  return ok();
}
export function leaveSchoolActivity(state, kind) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 5 || state.age >= 18 || !state.school || !['sports', 'extracurricular'].includes(kind)) return fail('School activities are available from ages 5 to 17.');
  if (focusMinimums(state)[kind] > 0) return fail(`${focusLabel(state, kind)} has a required minimum focus this year.`);
  if (hasFame(state) && state.fame.kind === kind) endFame(state, 'Leaving the spotlight', 'You leave the activity that brought you public attention.');
  state.school[kind] = null;
  state.focus[kind] = 0;
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
  return careerFit(job, effectiveStats(state));
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
export function offeredColleges(state) {
  if (!needsEducationChoice(state)) return [];
  return (state.collegeApplications || createCollegeOffers(state)).offers.map(offer => ({ ...offer, college: collegeById(offer.collegeId) }));
}
export function chooseEducation(state, path, collegeId) {
  const status = active(state); if (!status.ok) return status;
  if (!needsEducationChoice(state)) return fail('Choose your education path when adulthood begins.');
  if (path !== 'college' && path !== 'work') return fail('Choose college or work.');
  const applications = state.collegeApplications || createCollegeOffers(state);
  const offer = path === 'college' ? applications.offers.find(entry => collegeId ? entry.collegeId === collegeId : entry.affordable) : null;
  if (path === 'college' && (!offer?.affordable || offer.annualPersonalCost * 4 > state.money + .000001)) return fail('Choose an offered college whose four-year funding you can afford.');
  state.collegeApplications = applications;
  state.education = { status: path === 'college' ? 'college' : 'workforce', years: 0,
    ...(offer ? { collegeId: offer.collegeId, gpa: null } : {}) };
  if (path === 'college') {
    state.jobOffers = [];
    state.jobId = null; state.jobYears = 0; state.performance = 0; state.careerProgress = 0;
    state.income = 0;
    log(state, 'A place to learn', `You start at ${collegeById(offer.collegeId).name}.`, 'milestone');
  } else log(state, 'Ready for work', 'You start looking for work.', 'career');
  refreshHousing(state);
  syncFamilyLifestyles(state);
  return ok();
}
export function joinCollegeSport(state, id) {
  const status = active(state); if (!status.ok) return status;
  if (state.age < 18 || state.education.status !== 'college' || !schoolActivity('sports', id)) return fail('Choose a sport while enrolled in college.');
  if (state.education.sport?.id === id) return ok();
  if (state.education.sport && focusMinimums(state).sports > 0) return fail('Your current sport has a required focus minimum this year.');
  const endsFame = hasFame(state) && state.fame.kind === 'sports' && state.fame.activityId !== id;
  const candidate = { ...state, ...(endsFame ? { fame: null } : {}), education: { ...state.education, sport: { id, success: null, seasons: 0, professionalOffer: false } } };
  const maximum = focusLimits(candidate).sports;
  if (maximum < 1) return fail('This sport is currently restricted.');
  const starting = Math.min(maximum, Math.max(1, state.focus.sports || 0, focusMinimums(candidate).sports));
  if (Object.values(state.focus).reduce((sum, points) => sum + points, 0) + starting - (state.focus.sports || 0) > focusBudget(candidate)) return fail('Free a focus point before joining a college sport.');
  if (endsFame) endFame(state, 'A different direction', 'Switching sports ends the public profile built around your previous sport.');
  state.education.sport = candidate.education.sport;
  state.focus.sports = starting;
  return ok();
}
export function leaveCollegeSport(state) {
  const status = active(state); if (!status.ok) return status;
  if (state.education.status !== 'college' || !state.education.sport) return fail('You are not on a college team.');
  if (focusMinimums(state).sports > 0) return fail('Your sport has a required focus minimum this year.');
  if (fameActivityMatches(state, 'sports', state.education.sport.id)) endFame(state, 'Leaving the spotlight', 'You leave your college sport.');
  delete state.education.sport;
  clampFocusToLimits(state);
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
  if (job.id === 'athlete' && state.education.collegeId && !state.education.sport?.professionalOffer) return fail('Professional recruitment requires four exceptional college seasons and a scouting offer.');
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
  state.jobId = id; state.jobYears = 0; state.performance = round(jobFit(state, job)); state.careerProgress = 0;
  refreshHousing(state); syncFamilyLifestyles(state);
  log(state, 'A new direction', `You start as a ${job.name.toLowerCase()}.`, 'career');
  return ok();
}
export function quitJob(state) {
  const status = active(state); if (!status.ok) return status;
  if (!state.jobId) return fail('You are not currently employed.');
  const job = JOBS.find(candidate => candidate.id === state.jobId);
  log(state, 'Turning a page', `You leave your role as a ${job.name.toLowerCase()}.`, 'career');
  state.jobId = null; state.jobYears = 0; state.performance = 0; state.careerProgress = 0;
  state.income = 0;
  refreshHousing(state); syncFamilyLifestyles(state);
  return ok();
}

export function datingPotential(state) { return datingPotentialRules(state, effectiveStats(state)); }
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
    log(state, 'Not the same spark', `${person.name} isn't interested.`, 'relationship');
    return { ok: true, accepted: false, chance };
  }
  if (decision === 'relationship') {
    state.partner = { ...person, relationship: integer(state, 3, 7), yearsTogether: 0, married: false, lastProposalAge: -1 };
    state.encounters = [];
    syncFamilyLifestyles(state);
    log(state, 'A connection becomes a relationship', `You and ${person.name} begin dating.`, 'relationship');
  } else {
    log(state, 'A brief connection', `You spend a night with ${person.name}.`, 'relationship');
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
    partner.married = true;
    log(state, 'A life together', `You marry ${partner.name}.`, 'relationship');
  } else {
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
  const stats = effectiveStats(state);
  const own = eventChances(state, stats, JOBS.find(job => job.id === state.jobId));
  const family = familyEventChances(state, stats);
  const fame = fameEventChances(state, stats).map(roll => {
    const event = FAME_EVENTS.find(event => event.id === roll.id);
    const kind = event?.fameKind;
    if (kind === 'sports' && state.education.status === 'college' && state.education.sport) return { ...roll, chance: collegeSportFameChance({ ...state, stats }) };
    if (kind && kind !== 'personal' && !activityEligible(state, currentSchoolActivity(state, kind))) return { ...roll, chance: 0 };
    return roll;
  });
  return [...own, ...family, ...fame].map(roll => eventHasConsequence(EVENT_BY_ID.get(roll.eventId || roll.id)) ? roll : { ...roll, chance: 0 });
}

function endFame(state, title, text) {
  if (!hasFame(state)) return;
  const childhoodLifestyle = state.age < 18 ? householdLifestyle(state, false) : null;
  state.fame = null;
  if (childhoodLifestyle !== null) state.lifestyle = childhoodLifestyle;
  clampFocusToLimits(state);
  syncFamilyLifestyles(state);
  log(state, title, `${text} Your fame bonus to Social learning ability and household support end.`, 'fame');
}
export function quitFame(state) {
  const status = active(state); if (!status.ok) return status;
  if (!hasFame(state)) return fail('You are not currently famous.');
  endFame(state, 'Leaving the spotlight', 'You choose to step away from public attention.');
  return ok();
}
function advanceFameYear(state, growthRandom, fameRandom) {
  if (!hasFame(state) || state.alive === false) return;
  const before = state.fame.rating;
  state.fame.rating = fameNextRating(state, growthRandom ? growthRandom() : 0);
  if (fameRandom && fameRandom() < fameLossChance(state.fame.rating)) {
    endFame(state, 'The spotlight moves on', `Public attention moves elsewhere. Fame ${before.toFixed(1)} → ${state.fame.rating.toFixed(1)} before it ends.`);
  } else if (state.fame.rating !== before) {
    log(state, 'Your year in the spotlight', `${focusLabel(state, fameFocusKey(state))} focus shapes your public profile. Fame ${before.toFixed(1)} → ${state.fame.rating.toFixed(1)}.`, 'fame');
  }
}

function growYear(state) {
  developSkills(state, state, JOBS.find(candidate => candidate.id === state.jobId));
  if (state.age < 2) {
    for (const [key, amount] of Object.entries(childhoodWellbeing(state))) addStat(state, key, amount);
    for (const parent of caregivers(state)) {
      const effects = caregiverCryEffects(parent, state.cryLevel);
      addStat(parent, 'stability', effects.stability);
      parent.relationship = round(clamp(parent.relationship + effects.relationship, 0, 10));
    }
    return;
  }
  const f = state.focus;
  const studying = state.age >= 5 && state.age < 18 || state.education.status === 'college';
  const appearance = appearanceChange(state);
  if (appearance) addStat(state, 'attractiveness', appearance);
  if (state.age < 18) {
    for (const [key, amount] of Object.entries(childhoodWellbeing(state))) addStat(state, key, amount);
  } else {
    const practice = standardFocusPractice(state);
    addStat(state, 'stability', wellbeingResponse(state, 'stability', practice.stability));
    addStat(state, 'health', wellbeingResponse(state, 'health', practice.health) - (state.age >= 65 ? .1 : 0));
  }
  if (studying) state.schoolProgress = round(clamp(state.schoolProgress + legacyFocusValue(f.work) * .9, 0, 100));
  for (const parent of caregivers(state)) {
    addStat(parent, 'stability', wellbeingResponse(parent, 'stability', focusEffect(f.family) * PARENT_FAMILY_STABILITY_GAIN));
    parent.relationship = round(clamp(parent.relationship + focusEffect(f.family) * PARENT_FAMILY_RELATIONSHIP_GAIN, 0, 10));
  }
}
// Money remains internal: the player sees only a 0–10 lifestyle score.
// Existing saves retain their resource interpretation until a complete annual
// routine uses the new economy. Reading or loading never rewrites their ratings.
const legacyLifestyleFromResources = (income = 0, money = 0) => round(clamp(Math.max(1 + Math.max(0, income) / 22000, 1 + Math.log2(1 + Math.max(0, money) / 25000)), 0, 10));
const resourceLifestyle = (state, income, money) => (state.economyVersion === 1 ? lifestyleFromResources : legacyLifestyleFromResources)(income, money);
const lifestyleRound = value => value < 10 ? Math.min(9.9999, Math.round(value * 10000) / 10000) : Math.round(value * 10000) / 10000;
const householdContribution = (state, base, amount) => state.economyVersion === 1 ? changedLifestyle(base, amount) : round(clamp(base + amount, 0, 10));
export function householdLifestyle(state, includeFame = true) {
  // Both original parents share one household. A young heir keeps that
  // household's support through guardianship if their parent has died.
  const parent = caregivers(state)[0] || state.guardian || state.parents.find(person => person.abandonedAt === undefined);
  const base = Number.isFinite(parent?.lifestyle) ? parent.lifestyle : state.householdEventBase ?? (hasFame(state) ? resourceLifestyle(state, state.income, state.money) : state.lifestyle);
  return householdContribution(state, base, (includeFame && state.age < 18 ? fameLifestyleBonus(state) : 0) + (state.age < 18 ? householdEventSupport(state) : 0));
}
const householdEventSupport = state => state.effects.reduce((sum, effect) => sum + (effect.years > 0 ? effect.householdLifestyle || 0 : 0), 0);
export function familyLifestyle(state, person) {
  return state.age < 18 && caregivers(state).some(parent => parent.id === person?.id)
    ? householdContribution(state, person.lifestyle, fameLifestyleBonus(state) + householdEventSupport(state)) : person?.lifestyle;
}
function syncFamilyLifestyles(state) {
  const modifier = state.effects.reduce((sum, effect) => sum + (effect.years > 0 ? effect.lifestyle || 0 : 0), 0);
  const familyCost = (livingPartner(state) ? 1 : 0) + dependents(state).length;
  const base = housingLifestyle(state, resourceLifestyle(state, state.income, state.money), selectedCollegeOffer(state));
  state.lifestyle = state.age < 18 ? householdLifestyle(state) : lifestyleRound(householdContribution(state, base, -familyCost + fameLifestyleBonus(state) + householdEventSupport(state)) + modifier);
  for (const child of state.children) if (child.alive !== false) child.lifestyle = child.age < 18 ? state.lifestyle : resourceLifestyle(state, 0, child.money);
  for (const sibling of state.siblings) if (sibling.alive !== false) sibling.lifestyle = sibling.age < 18 ? householdLifestyle(state) : resourceLifestyle(state, 0, sibling.money);
  if (state.age >= 5) clampFocusToLimits(state);
}
function parentCareersForYear(state, careerRandom, growthRandom) {
  const events = [];
  const before = householdLifestyle(state);
  for (const parent of caregivers(state)) {
    parent.career ??= initialParentCareer(parent, 1 + personHash(parent) % 5);
    if (parent.alive === false) continue;
    if (careerRandom) {
      const result = advanceParentCareer(parent, { random: careerRandom, normal: growthRandom });
      parent.career = result.career;
      if (result.event) events.push(result.event);
    } else parent.career = careerForecast(parent);
  }
  const living = caregivers(state);
  if (living.length) {
    const lifestyle = lifestyleRound(clamp(living.reduce((sum, parent) => sum + parent.career.progress, 0) / living.length, 0, 10));
    for (const parent of living) parent.lifestyle = lifestyle;
  }
  return events.map(event => ({ ...event, text: `${event.text} Household lifestyle ${before} → ${householdLifestyle(state)}.` }));
}
function selectedCollegeOffer(state) {
  return state.collegeApplications?.offers.find(offer => offer.collegeId === state.education.collegeId);
}
function currentIncome(state) {
  const job = JOBS.find(candidate => candidate.id === state.jobId);
  return careerYear({ job, stats: effectiveStats(state), focus: state.focus.work, years: state.jobYears, progress: state.careerProgress }).income;
}
function refreshHousing(state) {
  if (state.age < 18) return;
  // A new job's actual earning capacity replaces stale earnings immediately.
  state.income = currentIncome(state);
  state.housing = nextHousing(state, { income: state.income });
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
    const career = careerYear({ job, stats: effectiveStats(state), focus: state.focus.work, years: state.jobYears, progress: state.careerProgress });
    state.performance = career.performance;
    state.careerProgress = career.progress;
    state.income = career.income;
    state.jobYears += 1;
  } else { state.income = 0; state.performance = 0; }
  state.housing = nextHousing(state, { income: state.income });
  for (const [key, amount] of Object.entries(housingChanges(state.housing))) {
    addStat(state, key, key === 'health' || key === 'stability' ? wellbeingResponse(state, key, amount) : amount);
  }
  state.lifestyle = lifestyleFromResources(state.income, state.money);
  // Housing and education are funded by current income, captured awards and
  // reserves. Housing support supplies no savings.
  const dependents = state.children.filter(child => child.alive !== false && child.age < 18).length;
  const reserveUpkeep = (lifestyleFromResources(0, state.money) - 1) * 1800;
  const offer = selectedCollegeOffer(state);
  const housingCost = state.housing.status === 'campus' ? offer?.annualPersonalCost ?? 9000
    : state.housing.status === 'parents' ? HOUSING_BALANCE.familyAnnualCost
      : state.housing.status === 'homeless' ? 0 : HOUSING_BALANCE.independentAnnualCost;
  state.expenses = Math.round(housingCost + state.income * (.32 + state.lifestyle * .025) + dependents * 2500
    + (state.housing.status === 'campus' ? 0 : reserveUpkeep));
  if (state.housing.status === 'campus' && offer) {
    // Admission commits the personal contribution for all four years. Keep
    // the remaining tuition earmarked when later household costs arrive.
    const remainingTuition = offer.annualPersonalCost * Math.max(0, 3 - state.education.years);
    state.expenses = Math.min(state.expenses, Math.max(0, Math.floor(state.money + state.income - remainingTuition)));
  }
  state.money = clamp(Math.round(state.money + state.income - state.expenses), 0, MAX_RESOURCES);
  state.lifestyle = lifestyleFromResources(state.income, state.money);
  const unemploymentStrain = unemploymentStabilityChange(state, job);
  if (unemploymentStrain) addStat(state, 'stability', unemploymentStrain);
  if (state.housing.status === 'parents') state.housing.yearsWithFamily += 1;
}
function ageFamily(state) {
  for (const parent of [...state.parents, state.guardian].filter(Boolean)) {
    if (parent.alive === false) continue;
    developSkills(parent, { ...parent, autonomousFocus: true, focus: { work: parent.career?.focus ?? 3, social: 3, family: 3, self: 3 } }, null, 1);
    addStat(parent, 'attractiveness', appearanceChange({ ...parent, autonomousFocus: true }));
    if (parent.age >= 65) addStat(parent, 'health', -.07);
    parent.age += 1;
  }
  for (const child of state.children) {
    if (child.alive === false) continue;
    const care = { ...child, cryLevel: 3, careFocus: state.focus.family, focus: { ...defaultFocus(child.age), family: state.focus.family, self: state.focus.family } };
    developSkills(child, care);
    const appearance = appearanceChange(care);
    child.age += 1;
    if (appearance) addStat(child, 'attractiveness', appearance);
    if (child.age <= 18) {
      for (const [key, amount] of Object.entries(childhoodWellbeing(care))) addStat(child, key, amount);
    } else {
      addStat(child, 'stability', wellbeingResponse(child, 'stability', focusEffect(state.focus.family) * .045));
      addStat(child, 'health', wellbeingResponse(child, 'health', focusEffect(state.focus.family) * .02));
    }
    child.relationship = round(clamp(child.relationship + YEARLY_DECISION_SCALE * focusEffect(state.focus.family) * .13, 0, 10));
    if (child.age >= 18) child.money = Math.min(MAX_RESOURCES, child.money + Math.round(1500 + child.stats.intelligence * 250));
    if (child.age >= 65) addStat(child, 'health', -.07);
  }
  for (const sibling of state.siblings) if (sibling.alive !== false) { developSkills(sibling, { ...sibling, autonomousFocus: true }, null, 1); addStat(sibling, 'attractiveness', appearanceChange({ ...sibling, autonomousFocus: true })); if (sibling.age >= 65) addStat(sibling, 'health', -.07); sibling.age += 1; }
  const partner = livingPartner(state);
  if (partner) {
    const appearance = appearanceChange(partner);
    developSkills(partner, { ...partner, focus: { ...defaultFocus(partner.age), family: state.focus.family } });
    if (appearance) addStat(partner, 'attractiveness', appearance);
    addStat(partner, 'stability', wellbeingResponse(partner, 'stability', focusEffect(state.focus.family) * .035));
    if (partner.age >= 65) addStat(partner, 'health', -.07);
    partner.relationship = round(clamp(partner.relationship + YEARLY_DECISION_SCALE * focusEffect(state.focus.family) * .11, 0, 10));
    partner.yearsTogether += 1; partner.age += 1;
  }
}
const eventKey = pending => pending.subjectId ? `${pending.eventId}:${pending.subjectId}` : pending.eventId;
export function pendingEventSubject(state, pending) {
  if (!pending?.subjectType || pending.subjectType === 'player') return state;
  if (pending.subjectType === 'partner') return state.partner?.id === pending.subjectId ? state.partner : null;
  if (pending.subjectType === 'parent') return [...state.parents, state.guardian].find(person => person?.id === pending.subjectId) || null;
  if (pending.subjectType === 'sibling') return state.siblings.find(person => person.id === pending.subjectId) || null;
  return state.children.find(person => person.id === pending.subjectId) || null;
}
function applyOutcome(state, event, outcome = event, context = {}) {
  const subject = pendingEventSubject(state, context);
  const before = { stats: effectiveStats(state), baseStats: { ...state.stats }, aptitudes: { ...state.aptitudes }, lifestyle: state.lifestyle, subjectStats: subject ? { ...subject.stats } : {}, relationship: subject?.relationship };
  const key = eventKey({ eventId: event.id, ...context });
  const description = (outcome === event ? eventDescriptionAtAge(event, (subject?.age ?? state.age) - 1) : outcome.description || eventDescriptionAtAge(event, (subject?.age ?? state.age) - 1)).replaceAll('{name}', subject?.name || 'Your family member');
  const fameBefore = state.fame ? clone(state.fame) : null;
  if (outcome.fameAction === 'start' && !hasFame(state)) {
    const kind = event.fameKind;
    state.fame = { kind, activityId: kind === 'personal' ? null : context.fameActivityId,
      rating: fameStartingRating(normal(state)), support: 0, startedAge: state.age };
    if (kind !== 'personal' && state.age >= 18) state.focus[kind] ??= 0;
  }
  if (hasFame(state)) {
    if (outcome.fameChange) state.fame.rating = Math.round(clamp(state.fame.rating + outcome.fameChange, 0, 10) * 10) / 10;
    if (outcome.fameSupport) state.fame.support = round(clamp(state.fame.support + outcome.fameSupport, -2, 2));
  }
  // Newly received effects are permanent. Keep the modifier engine below for
  // existing saves and future use, but never create a new timed stat/lifestyle
  // bonus or penalty while this mode is disabled.
  const timedStatsEnabled = false;
  const permanent = {};
  for (const source of [outcome.statChanges, outcome.playerChanges, timedStatsEnabled ? null : outcome.modifiers]) {
    for (const [key, amount] of Object.entries(source || {})) permanent[key] = (permanent[key] || 0) + amount;
  }
  for (const [key, amount] of Object.entries(permanent)) addStat(state, key, amount);
  for (const [key, amount] of Object.entries(outcome.aptitudeChanges || {})) {
    if (STAT_KEYS.includes(key) && Number.isInteger(amount)) state.aptitudes[key] = clamp(state.aptitudes[key] + amount, -3, 3);
  }
  if (subject && subject !== state) {
    for (const [key, amount] of Object.entries(outcome.subjectChanges || {})) addStat(subject, key, amount);
    if (outcome.relationship) subject.relationship = round(clamp(subject.relationship + outcome.relationship, 0, 10));
  }
  const afterPermanent = effectiveStats(state);
  let temporaryYears = 0;
  const focusPoints = Number.isInteger(outcome.focusPoints) && Math.abs(outcome.focusPoints) <= 4 ? outcome.focusPoints : 0;
  const initializesHouseholdBase = outcome.householdLifestyle && state.age < 18 && !caregivers(state).length && state.householdEventBase === undefined;
  if (initializesHouseholdBase) {
    state.householdEventBase = hasFame(state) ? resourceLifestyle(state, state.income, state.money) : state.lifestyle - householdEventSupport(state);
  }
  if (outcome.years > 0 && (timedStatsEnabled && (Object.keys(outcome.modifiers || {}).length || outcome.lifestyle) || outcome.householdLifestyle || outcome.focusLimits || outcome.focusCapacity || outcome.focusMinimums || focusPoints)) {
    // A new restriction must not overwrite a still-running legacy stat bonus
    // with the same event ID.
    const legacyStatEffect = state.effects.some(effect => effect.id === key && (Object.values(effect.modifiers).some(Boolean) || effect.lifestyle || effect.householdLifestyle));
    let restrictionKey = !timedStatsEnabled && legacyStatEffect ? `${key}:limits` : key;
    const stacks = Boolean(outcome.focusCapacity || outcome.focusMinimums);
    if (stacks) {
      const base = restrictionKey;
      let copy = 2;
      while (state.effects.some(effect => effect.id === restrictionKey)) restrictionKey = `${base}:stack:${copy++}`;
    }
    const old = stacks ? null : state.effects.find(effect => effect.id === restrictionKey);
    const effect = { id: restrictionKey, name: `${context.subjectId ? `${subject.name}: ` : ''}${event.name}`.slice(0, 100), description, years: Math.max(old?.years || 0, outcome.years), modifiers: timedStatsEnabled ? { ...outcome.modifiers } : {}, kind: event.kind };
    if (timedStatsEnabled && outcome.lifestyle) effect.lifestyle = outcome.lifestyle;
    if (outcome.householdLifestyle) effect.householdLifestyle = outcome.householdLifestyle;
    if (outcome.focusLimits) effect.focusLimits = clone(outcome.focusLimits);
    if (outcome.focusCapacity) effect.focusCapacity = clone(outcome.focusCapacity);
    if (outcome.focusMinimums) effect.focusMinimums = clone(outcome.focusMinimums);
    if (focusPoints) effect.focusPoints = focusPoints;
    const updated = old ? { ...old, lifestyle: 0, ...effect } : effect;
    for (const field of ['focusLimits', 'focusCapacity', 'focusMinimums', 'focusPoints']) if (!Object.hasOwn(effect, field)) delete updated[field];
    const changed = !old || effectMechanics(old) !== effectMechanics(updated);
    if (old && changed) {
      for (const field of ['focusLimits', 'focusCapacity', 'focusMinimums', 'focusPoints']) delete old[field];
      Object.assign(old, updated);
    } else if (!old) state.effects.push(effect);
    // A saved longer restriction already provides exactly this consequence.
    // Do not rewrite its prose, log an empty refresh, or pretend to extend it.
    if (changed || initializesHouseholdBase) temporaryYears = effect.years;
  }
  clampFocusToLimits(state);
  syncFamilyLifestyles(state);
  const label = key => SKILLS.find(skill => skill.key === key)?.label || ({ health: 'Health', stability: 'Mental stability' }[key]);
  const keys = new Set(Object.keys(permanent));
  const changes = [...keys].filter(key => before.baseStats[key] !== state.stats[key]).map(key => {
    // Ongoing family benefits can hide a lasting base-rating change at the
    // effective ceiling. Legacy modifiers remain additive beyond that bound.
    // Keep the lasting consequence visible rather than showing 10 → 10.
    const hidden = before.stats[key] === afterPermanent[key];
    return `Your ${label(key).toLowerCase()}${hidden ? ' base rating' : ''} ${hidden ? before.baseStats[key] : before.stats[key]} → ${hidden ? state.stats[key] : afterPermanent[key]}`;
  });
  if (outcome.fameAction === 'start' && hasFame(state)) changes.push(`Fame begins at ${state.fame.rating.toFixed(1)}/10; +5 Social learning ability while famous`);
  if (fameBefore && hasFame(state) && fameBefore.rating !== state.fame.rating) changes.push(`Fame ${fameBefore.rating.toFixed(1)} → ${state.fame.rating.toFixed(1)}`);
  if (outcome.fameSupport && hasFame(state) && fameBefore?.support !== state.fame.support) {
    if (before.lifestyle !== state.lifestyle) changes.push(`Household lifestyle ${before.lifestyle} → ${state.lifestyle}`);
    else changes.push(`Fame household support strength ${fameBefore?.support || 0} → ${state.fame.support}`);
  }
  if (outcome.householdLifestyle && before.lifestyle !== state.lifestyle) changes.push(`Household lifestyle ${before.lifestyle} → ${state.lifestyle}`);
  const signedAptitude = value => `${value > 0 ? '+' : ''}${value}`;
  for (const key of Object.keys(outcome.aptitudeChanges || {})) {
    if (STAT_KEYS.includes(key) && before.aptitudes[key] !== state.aptitudes[key]) changes.push(`Your ${label(key).toLowerCase()} learning ability ${signedAptitude(before.aptitudes[key])} → ${signedAptitude(state.aptitudes[key])}`);
  }
  const signed = amount => `${amount > 0 ? '+' : '-'}${Math.abs(amount).toFixed(1).replace(/^0\./, '.')}`;
  if (timedStatsEnabled && temporaryYears) for (const [key, amount] of Object.entries(outcome.modifiers || {})) {
    if (amount) changes.push(`${signed(amount)} ${label(key)}`);
  }
  if (subject && subject !== state) {
    for (const key of Object.keys(outcome.subjectChanges || {})) if (before.subjectStats[key] !== subject.stats[key]) changes.push(`${subject.name}: ${label(key)} ${before.subjectStats[key]} → ${subject.stats[key]}`);
    if (outcome.relationship && before.relationship !== subject.relationship) changes.push(`${subject.name}: Relationship ${before.relationship} → ${subject.relationship}`);
  }
  if (timedStatsEnabled && temporaryYears && outcome.lifestyle && state.age >= 18) changes.push(`${signed(outcome.lifestyle)} Lifestyle`);
  const decision = outcome === event ? '' : `${outcome.label}. `;
  const duration = temporaryYears ? ` Temporary effects: ${temporaryYears} ${temporaryYears === 1 ? 'year' : 'years'}.` : '';
  const limits = activeFocusCaps(state, temporaryYears ? outcome.focusLimits?.[focusStage(state)] : undefined)
    .map(([key, max]) => `${focusLabel(state, key)} max ${max}`);
  for (const [key, amount] of Object.entries(temporaryYears ? outcome.focusCapacity?.[focusStage(state)] || {} : {})) {
    if (focusKeys(state).includes(key)) limits.push(`${amount > 0 ? '+' : ''}${amount} ${focusLabel(state, key)} focus capacity`);
  }
  for (const [key, amount] of Object.entries(temporaryYears ? outcome.focusMinimums?.[focusStage(state)] || {} : {})) {
    if (focusKeys(state).includes(key)) limits.push(`+${amount} ${focusLabel(state, key)} minimum focus`);
  }
  if (temporaryYears && focusPoints) limits.push(`${focusPoints > 0 ? '+' : ''}${focusPoints} focus ${Math.abs(focusPoints) === 1 ? 'point' : 'points'}`);
  if (temporaryYears && outcome.householdLifestyle && before.lifestyle === state.lifestyle) limits.push(`${signed(outcome.householdLifestyle)} Household lifestyle support strength`);
  // A stored commitment/support remains meaningful even when today's rating or
  // allocation is at its bound. Ordinary fully clipped outcomes are omitted;
  // explicit care changes and saved/declined decisions still resolve and record.
  const meaningful = changes.length || temporaryYears || context.forceRecord;
  if (context.assessConsequence) return Boolean(meaningful);
  if (outcome === event && !meaningful) return false;
  const result = [...changes, ...limits].length ? `${[...changes, ...limits].join('; ')}.`
    : context.forceRecord ? description : outcome === event ? '' : 'No additional effects.';
  // Keep the event context separate from the concise journal outcome. The year
  // review can explain what happened without restoring flavor to saved results.
  const eventDescription = eventDescriptionAtAge(event, (subject?.age ?? state.age) - 1).replaceAll('{name}', subject?.name || 'Your family member');
  log(state, `${context.subjectId ? `${subject.name}: ` : ''}${event.name}`, `${decision}${result}${duration}`, event.kind, eventDescription, context.cause);
  return true;
}

function choiceHasConsequence(state, event, choice, context) {
  // Accepting Fame is a real status change; assessment must not sample its
  // eventual starting rating. Every other effect here is deterministic.
  if (choice.fameAction === 'start') return !hasFame(state);
  if (!authoredConsequence(choice)) return false;
  return applyOutcome(clone(state), event, choice, { ...context, assessConsequence: true });
}

function ensureCare(state, finalChildhoodTurn = false) {
  if (!state.alive || state.age >= 18 && !finalChildhoodTurn || caregivers(state).length) return;
  if (!state.guardian && !state.parents.some(parent => parent.abandonedAt !== undefined)) return;
  const gender = random(state) < .5 ? 'female' : 'male';
  const guardian = makeParent(state, state.familyName, gender);
  const usedNames = new Set([state.name, ...state.parents.map(parent => parent.name)]);
  if (usedNames.has(guardian.name)) guardian.name = `${pick(state, GENDER_NAMES[gender].filter(name => !usedNames.has(`${name} ${state.familyName}`)))} ${state.familyName}`;
  delete guardian.parentRole;
  guardian.guardianRole = gender === 'female' ? 'aunt' : 'uncle';
  guardian.adoptedAt = state.age;
  guardian.lifestyle = integer(state, 2, 8);
  guardian.career = initialParentCareer(guardian, integer(state, 1, 5), { assignJob: true });
  state.guardian = guardian;
  const beforeLifestyle = state.lifestyle;
  applyOutcome(state, { id: `relative_adoption:${guardian.id}`, name: `${guardian.name} adopts you`,
    description: 'You move in with an adult relative.', kind: 'negative', years: 2,
    modifiers: { stability: -1.5, social: -.5 } }, undefined, { forceRecord: true });
  if (beforeLifestyle !== state.lifestyle) state.history[0].text += ` Household lifestyle ${beforeLifestyle} → ${state.lifestyle}.`;
}

function applyAbandonment(state, event, context) {
  const parent = pendingEventSubject(state, context);
  if (!parent || parent.alive === false || parent.abandonedAt !== undefined || !state.parents.includes(parent)) return false;
  applyOutcome(state, event, event, { ...context, forceRecord: true });
  parent.abandonedAt = state.age;
  const remaining = caregivers(state);
  if (remaining.length) {
    const caregiver = remaining[0];
    // The remaining adult carries the added strain. These direct losses can
    // recover through later routine wellbeing and supportive events.
    const beforeLifestyle = state.lifestyle;
    caregiver.lifestyle = round(clamp(caregiver.career.progress, 0, 10));
    applyOutcome(state, { id: `remaining_parent:${parent.id}`, name: 'Takes over your care',
      description: 'The remaining parent takes over your care.', kind: 'negative',
      subjectChanges: { stability: -3, health: -1 } }, undefined,
    { subjectType: 'parent', subjectId: caregiver.id, forceRecord: true });
    if (beforeLifestyle !== state.lifestyle) state.history[0].text += ` Household lifestyle ${beforeLifestyle} → ${state.lifestyle}.`;
  } else ensureCare(state, state.age === 18);
  return true;
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
  if (choice.fameAction === 'start') {
    if (hasFame(state)) return fail('You already have a public profile.');
    if (event.fameKind !== 'personal' && (!pending.fameActivityId || currentSchoolEnrollment(state, event.fameKind)?.id !== pending.fameActivityId && !(event.fameKind === 'sports' && state.education.sport?.id === pending.fameActivityId))) return fail('That activity opportunity is no longer available.');
  }
  applyOutcome(state, event, choice, pending);
  state.pendingEvents.shift();
  return { ok: true, eventId: event.id, choiceId: choice.id, remaining: state.pendingEvents.length };
}

function schoolYear(state, growthRandom) {
  if (state.age < 5 || state.age >= 18 || !state.school) return null;
  const person = { ...state, stats: effectiveStats(state) };
  const gpa = gradeScore(state.focus.work, person.stats.intelligence);
  const report = { gpa, previousGpa: state.school.reportedAge === null ? null : state.school.gpa, study: state.focus.work, intelligence: person.stats.intelligence, activities: [] };
  for (const kind of ['sports', 'extracurricular']) {
    const enrollment = state.school[kind];
    const activity = schoolActivity(kind, enrollment?.id);
    if (!enrollment || !activity) continue;
    const before = enrollment.success;
    if (activityEligible(person, activity)) {
      enrollment.success = activitySuccessAfterYear(person, activity, before, state.focus[kind], growthRandom ? growthRandom() : 0);
    }
    report.activities.push({ kind, id: activity.id, name: activity.name, focus: state.focus[kind], before, after: enrollment.success });
  }
  state.school.gpa = gpa;
  state.school.reportedAge = state.age + 1;
  return report;
}
function logSchoolOffers(state) {
  for (const kind of ['sports', 'extracurricular']) {
    const names = state.school.offers[kind].map(id => schoolActivity(kind, id).name);
    if (!names.length) continue;
    const label = kind === 'sports' ? 'sports' : 'extracurriculars';
    log(state, kind === 'sports' ? 'Sports offered' : 'Extracurriculars offered', `You have been offered these ${label}: ${names.join(', ')}.`, 'activity-offer');
  }
}
function refreshSchoolOffers(state) {
  if (state.age < 5 || state.age >= 18 || !state.school || state.school.offersAge === state.age && state.age !== 5) return;
  for (const kind of ['sports', 'extracurricular']) state.school.offers[kind] = state.alive ? annualSchoolOffers(state, kind, state.age === 5 ? [] : state.school.offers[kind]) : [];
  state.school.offersAge = state.age;
  logSchoolOffers(state);
}
function collegeYear(state, growthRandom, recruitmentRandom) {
  if (state.education.status !== 'college') return;
  const person = { ...state, stats: effectiveStats(state) };
  const college = collegeById(state.education.collegeId);
  if (college) {
    const grade = collegeGradeScore(college.difficulty, state.focus.work, person.stats.intelligence, growthRandom ? growthRandom() : 0);
    state.education.gpa = round(((state.education.gpa || 0) * state.education.years + grade) / (state.education.years + 1));
    log(state, 'College report', `Year ${state.education.years + 1}: grade ${gradeLetter(grade)}. Cumulative college GPA ${gradeLetter(state.education.gpa)}.`, 'education');
  }
  const sport = state.education.sport;
  if (!sport) return;
  sport.success = collegeSportSuccessAfterYear(person, sport.success, state.focus.sports, growthRandom ? growthRandom() : 0);
  sport.seasons += 1;
  log(state, 'College sports report', `${schoolActivity('sports', sport.id).name}: season ${sport.seasons}, success ${activityGradeLetter(sport.success)}.`, 'education');
  if (sport.seasons === 4 && recruitmentRandom) {
    sport.professionalOffer = recruitmentRandom() < professionalSportChance(person);
    log(state, 'Professional scouting', sport.professionalOffer ? 'A scout offers a professional athlete opportunity after your fourth college season.' : 'Your college seasons end without a professional scouting offer.', 'career');
  }
}
function routineYear(state, growthRandom, careerRandom, fameRandom) {
  state.economyVersion = 1;
  if (state.age >= 18 && hasFame(state) && state.fame.kind !== 'personal'
      && !(state.education.status === 'college' && state.fame.kind === 'sports' && state.education.sport)) {
    const kind = state.fame.kind, enrollment = currentSchoolEnrollment(state, kind);
    const activity = schoolActivity(kind, enrollment?.id);
    const person = { ...state, stats: effectiveStats(state) };
    if (fameActivityMatches(state, kind, enrollment?.id) && activityEligible(person, activity)) {
      enrollment.success = activitySuccessAfterYear(person, activity, enrollment.success, state.focus[kind], growthRandom ? growthRandom() : 0);
    }
  }
  const schoolReport = schoolYear(state, growthRandom);
  collegeYear(state, growthRandom, fameRandom);
  if (state.age >= 18) state.housing = nextHousing(state, { income: currentIncome(state) });
  const people = [state, ...state.parents, state.guardian, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
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
      // Randomness varies an existing cause's magnitude, never inventing or
      // reversing a change. Routine inputs already received their directional
      // rating response; do not apply it again to the variation. Keep every
      // draw, including neutral stats, so the RNG schedule stays unchanged.
      const draw = growthRandom();
      const wellbeing = key === 'health' || key === 'stability';
      const variation = wellbeing ? .25 : key === 'attractiveness' ? .3 : SKILL_VARIATION.proportional;
      person.stats[key] = round(clamp(previous.stats[key] + change * (1 + clamp(draw, -3, 3) * variation), 0, 10));
    }
    if (Number.isFinite(previous.relationship) && person.abandonedAt === undefined) {
      const change = person.relationship - previous.relationship;
      person.relationship = round(clamp(previous.relationship + change * (1 + clamp(growthRandom(), -3, 3) * .2), 0, 10));
    }
  }
  state.effects.forEach(effect => { effect.years -= 1; });
  state.effects = state.effects.filter(effect => effect.years > 0);
  advanceFameYear(state, growthRandom, fameRandom);
  state.age += 1;
  if (state.housing) state.housing = nextHousing(state, { income: state.income });
  focusAfterBirthday(state);
  syncFamilyLifestyles(state);
  for (const event of careerEvents) log(state, event.title, event.text, event.kind);
  return schoolReport;
}
function yearSnapshot(state) {
  return { age: state.age, height: state.height, stats: effectiveStats(state), lifestyle: state.lifestyle, fame: state.fame ? clone(state.fame) : null,
    parents: [...state.parents, state.guardian].filter(Boolean).map(p => ({ id: p.id, name: p.name, lifestyle: familyLifestyle(state, p), stability: p.stats.stability, relationship: p.relationship })) };
}
function yearChanges(before, state) {
  const after = yearSnapshot(state);
  const delta = (a, b) => ({ before: a, after: b, change: round(b - a) || 0 });
  return { fromAge: before.age, toAge: state.age,
    ...(before.fame || after.fame ? { fame: { before: before.fame, after: after.fame } } : {}),
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
  const school = active(state).ok && !needsEducationChoice(state) ? routineYear(draft) : null;
  if (draft.age !== state.age && draft.education.status === 'college') {
    completeCollegeYear(draft);
    syncFamilyLifestyles(draft);
  }
  return { ...yearChanges(before, draft), ...(school ? { school } : {}) };
}
function completeCollegeYear(state) {
  state.education.years += 1;
  if (state.education.years !== 4) return;
  state.education.status = 'graduate';
  state.jobOffers = state.education.collegeId ? graduateJobOffers(state, state.education) : makeJobOffers(state, true);
  if (state.education.sport?.professionalOffer && !state.jobOffers.includes('athlete')) state.jobOffers[state.jobOffers.length - 1] = 'athlete';
  clampFocusToLimits(state);
  state.housing = nextHousing(state, { income: state.income });
  log(state, 'College completed', 'Graduate job offers unlocked.', 'milestone');
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
  const people = [state, ...state.parents, state.guardian, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
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
    if (state.age < 18) state.lifestyle = householdLifestyle(state, false);
    state.fame = null;
    clampFocusToLimits(state);
    state.needsSuccession = true;
    state.pendingEvents = [];
    state.encounters = [];
  } else addStat(state, 'stability', -(person.relationship ?? 5) * .08);
  if (state.pregnancy?.carrierId === person.id) {
    state.pregnancy = null;
    log(state, 'An expected life is lost', 'The pregnancy ends.', 'family');
  }
}

export function advanceYear(state, { mortalityRandom, growthRandom, parentCareerRandom, fameRandom, eventRandom } = {}) {
  const status = active(state); if (!status.ok) return status;
  if (needsEducationChoice(state)) return fail('Choose college or a career before advancing the year.');
  if (state.age >= 2 && focusKeys(state).some(key => !Number.isInteger(state.focus[key]) || state.focus[key] < 0 || state.focus[key] > focusMaxFor(state, key))) return fail('Each focus must be a whole number within its allowed range.');
  if (state.age >= 2 && Object.values(state.focus).reduce((sum, points) => sum + points, 0) > focusBudget(state)) return fail(`You have ${focusBudget(state)} focus points. Lower another focus first.`);
  const violation = focusLimitViolation(state);
  if (violation) return fail(`${focusLabel(state, violation[0])} is limited to ${violation[1]} this year. Lower it before continuing.`);
  const minimumViolation = state.age >= 2 && Object.entries(focusMinimums(state)).find(([key, minimum]) => state.focus[key] < minimum);
  if (minimumViolation) return fail(`${focusLabel(state, minimumViolation[0])} requires at least ${minimumViolation[1]} focus points this year. Raise it before continuing.`);
  const before = yearSnapshot(state);
  const focusPointModifier = temporaryFocusPoints(state);
  const decisions = state.age < 2 ? { cryLevel: state.cryLevel } : {
    focus: state.age < 5 ? { ...state.focus, creative: state.focus.creative ?? 0 } : { ...state.focus },
    workLabel: state.age < 5 ? 'Play' : state.age < 18 ? 'School' : state.education.status === 'college' ? 'College' : 'Career',
    focusMax: MAX_FOCUS, focusBudget: focusBudget(state),
    ...(focusPointModifier ? { focusPointModifier } : {}),
    ...(hasFame(state) ? { fame: clone(state.fame) } : {}),
    ...(state.education.status === 'college' && state.education.sport ? { collegeSport: state.education.sport.id } : {}),
    ...(state.age >= 5 && state.age < 18 ? { focusCaps: { sports: focusMaxFor(state, 'sports'), extracurricular: focusMaxFor(state, 'extracurricular') } } : {}),
  };
  const oldMemories = new Set(state.history.map(memory => memory.id));
  // Each eligible event has its own independent roll. Shuffle before limiting
  // to five so the catalogue's ordering never gives an event priority.
  const odds = eventOdds(state).filter(event => event.chance > 0);
  for (let index = odds.length - 1; index > 0; index--) {
    const other = integer(state, 0, index);
    [odds[index], odds[other]] = [odds[other], odds[index]];
  }
  const eventRoll = eventRandom || (() => random(state));
  let selected = odds.filter(event => eventRoll() < event.chance).slice(0, 5).map(roll => {
    const event = EVENTS.find(event => event.id === (roll.eventId || roll.id));
    const person = pendingEventSubject(state, roll);
    const cause = event.fameKind === 'sports' && state.education.status === 'college' && state.education.sport
      ? 'Exceptional college sports success contributed to this invitation.'
      : eventStatCause(event, person, roll.subjectId ? person?.stats : before.stats, before.lifestyle);
    return { ...roll, ...(cause ? { cause } : {}), ...(event.fameKind && event.fameKind !== 'personal' ? { fameActivityId: currentSchoolEnrollment(state, event.fameKind)?.id } : {}) };
  });
  // One independent competing-risk draw for each living person, using their
  // start-of-year age/stats. Mortality never competes for ordinary event slots.
  const people = [state, ...state.parents, state.guardian, ...state.children, ...state.siblings, livingPartner(state)].filter(person => person && person.alive !== false);
  // A casual/co-parent pregnancy can refer to someone outside the household.
  const otherParent = state.pregnancy?.otherParent;
  if (otherParent?.alive && !people.some(person => person.id === otherParent.id)) people.push(otherParent);
  const deaths = people.map(person => ({ person, result: rollMortality(person === state ? { ...state, stats: effectiveStats(state) } : person, mortalityRandom || (() => random(state))) })).filter(item => item.result);
  const schoolReport = routineYear(state, growthRandom || (() => normal(state)), parentCareerRandom || (() => random(state)), fameRandom || (() => random(state)));
  if (otherParent?.alive && ![...state.parents, ...state.children, ...state.siblings, state.partner].some(person => person?.id === otherParent.id)) otherParent.age += 1;
  for (const { person, result } of deaths) applyDeath(state, person, result);
  ensureCare(state);
  selected = selected.filter(roll => state.alive && (!roll.subjectId || pendingEventSubject(state, roll)?.alive === true)
    && (!EVENTS.find(event => event.id === (roll.eventId || roll.id)).requiresFame || hasFame(state)));
  // Resolve departures before any other household event, so a departing parent
  // cannot also queue a decision or perform a caring routine in this year.
  selected.sort((a, b) => Number(b.eventId === 'household_parent_abandonment') - Number(a.eventId === 'household_parent_abandonment'));
  const completed = [];
  let fameOfferQueued = false;
  for (const roll of selected) {
    const event = EVENTS.find(event => event.id === (roll.eventId || roll.id));
    if (event.fameKind && fameOfferQueued) continue;
    if (event.fameKind) fameOfferQueued = true;
    const context = { ...(roll.subjectId ? { subjectType: roll.subjectType, subjectId: roll.subjectId } : {}), ...(roll.cause ? { cause: roll.cause } : {}), ...(roll.fameActivityId ? { fameActivityId: roll.fameActivityId } : {}) };
    if (roll.subjectType === 'parent' && pendingEventSubject(state, roll)?.abandonedAt !== undefined) continue;
    if (event.id === 'household_parent_abandonment') {
      if (applyAbandonment(state, event, context)) completed.push(roll);
      continue;
    }
    if (event.choices?.length) {
      if (!event.choices.some(choice => choiceHasConsequence(state, event, choice, context))) continue;
      completed.push(roll);
      state.pendingEvents.push({ eventId: event.id, age: state.age, ...context });
      const subject = pendingEventSubject(state, context);
      const description = eventDescriptionAtAge(event, subject.age - 1).replaceAll('{name}', subject.name);
      log(state, roll.name, description, 'choice', description, context.cause);
    } else if (applyOutcome(state, event, event, context)) completed.push(roll);
  }
  selected = completed;
  state.lastYearEvents = selected.map(roll => roll.id);
  syncFamilyLifestyles(state);
  if (state.age === 2) log(state, 'Toddler activities unlocked', 'You can now choose your toddler activities.', 'milestone');
  if (state.age === 5) log(state, 'School started', 'School and activity focus choices unlocked.', 'milestone');
  if (state.age === 18) {
    state.education = { status: 'undecided', years: 0 };
    state.collegeApplications = createCollegeOffers(state);
    state.jobOffers = makeJobOffers(state);
    log(state, 'Adulthood reached', 'College and career choices unlocked.', 'milestone');
  } else if (state.education.status === 'college') {
    completeCollegeYear(state);
  }
  if (state.housing) state.housing = nextHousing(state, { income: state.income });
  if (state.age === 65) log(state, 'Retirement unlocked', 'You can now retire and choose an heir.', 'milestone');
  if (state.pregnancy && state.pregnancy.dueAge <= state.age) {
    const otherParent = state.pregnancy.otherParent;
    state.pregnancy = null;
    welcomeChild(state, false, otherParent);
  } else if (state.alive && !state.pregnancy && random(state) < pregnancyChance(state)) startPregnancy(state, state.partner);
  syncFamilyLifestyles(state);
  state.encounters = state.alive ? createProspects(state, datingHelpers(state), effectiveStats(state)).map(person => demographics(person)) : [];
  // Invitations are opportunities for the newly playable year. They have
  // independent category rolls and do not compete for ordinary event slots.
  refreshSchoolOffers(state);
  state.encounterYear = state.age;
  if (state.encounters.length) log(state, 'Someone new', `You meet ${state.encounters.length} new ${state.encounters.length === 1 ? 'person' : 'people'}.`, 'relationship');
  if (state.age >= 85) {
    state.encounters = [];
    state.needsSuccession = true;
    state.ended = false;
    if (state.alive) log(state, 'Time for the next chapter', 'You retire at 85.', 'milestone');
  }
  if (!selected.length && !deaths.length && !state.history.some(memory => !oldMemories.has(memory.id))) log(state, 'Events', 'None', 'quiet');
  state.yearSummary = { ...yearChanges(before, state), decisions, ...(schoolReport ? { school: schoolReport } : {}), events: state.history.filter(memory => !oldMemories.has(memory.id)).map(({ title, text, kind, description, cause }) => ({ title, text, kind, ...(description === undefined ? {} : { description }), ...(cause ? { cause } : {}) })), dismissed: false };
  return { ok: true, eventId: selected[0]?.eventId || selected[0]?.id || null, eventIds: [...state.lastYearEvents] };
}

function welcomeChild(state, adopted, otherParent = null) {
  const biologicalParents = [state, otherParent].filter(Boolean);
  const aptitudes = adopted ? randomAptitudes(state) : inheritAffinities(biologicalParents, () => normal(state));
  const gender = random(state) < .5 ? 'female' : 'male';
  const child = demographics({ id: uid(state, 'child'), name: personName(state, state.familyName, gender), familyName: state.familyName, age: 0, stats: adopted ? randomStats(state, aptitudes) : inheritRatings(biologicalParents, () => normal(state)), aptitudes, height: fromCentimeters(50), adultHeight: null, money: 0, lifestyle: state.lifestyle, alive: true, adopted, relationship: initialBond(state) }, gender);
  newbornGrowth(state, child, adopted ? [] : biologicalParents);
  assignBirthConditions(child, `${state.seed}:${state.rng}`, adopted ? [] : biologicalParents);
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
  person.stats.attractiveness = round(clamp(5 + normal(draft) * BIRTH_VARIATION.appearance, 0, 10));
  assignBirthConditions(person, state.seed);
  while (person.age < age) {
    Object.assign(person, advanceGrowth(person, normal(draft)));
    developSkills(person, person, null, 1);
    for (const key of CORE) if (key !== 'attractiveness') addStat(person, key, normal(draft) * .06);
    person.age++;
  }
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
  const identity = { gender: state.gender, canGestate: state.canGestate, attractedTo: [...state.attractedTo], appearancePeakAge: state.appearancePeakAge, familyName: state.familyName, growthSex: state.growthSex, growthFactor: state.growthFactor, maturityAge: state.maturityAge, birthHeight: state.birthHeight, adultHeight: state.adultHeight, growthAnchor: clone(state.growthAnchor), conditions: [...state.conditions] };
  const previous = { id: state.id, name: state.name, age: state.age, generation: state.generation, stats: clone(state.stats), aptitudes: clone(state.aptitudes), height: state.height, money: state.money, estate: info.estate, share: info.share, lifestyle: state.lifestyle, children: info.children.map(person => ({ id: person.id, name: person.name, inheritance: info.share })), alive: state.alive, death: state.death, retired: true, successor: { id: heir.id, name: heir.name, route: info.route }, ...identity };
  // A temporary grant/cost belongs to this life. Keep the historical rating,
  // but never fold expiring support into an heir's underlying household income.
  let successorLifestyle = previous.lifestyle;
  if (householdEventSupport(state)) {
    const unsupported = clone(state);
    for (const effect of unsupported.effects) delete effect.householdLifestyle;
    syncFamilyLifestyles(unsupported);
    successorLifestyle = unsupported.lifestyle;
  }
  const formerParents = clone(state.parents);
  const formerGuardian = state.guardian ? clone(state.guardian) : null;
  const formerSiblings = clone(state.siblings);
  state.lineage.push(previous);
  state.guardian = null;
  if (info.route === 'children') {
    state.siblings = info.children.filter(person => person.id !== heir.id).map(person => useFamilyName({ ...clone(person), money: Math.min(MAX_RESOURCES, person.money + info.share), inheritance: info.share }, familyName));
    state.parents = [{ id: previous.id, name: previous.name, age: previous.age, stats: clone(previous.stats), aptitudes: previous.aptitudes, height: previous.height, lifestyle: previous.lifestyle, alive: previous.alive, death: previous.death, relationship: heir.relationship, parentRole: previous.gender === 'female' ? 'mom' : previous.gender === 'male' ? 'dad' : 'parent', ...identity }];
    // Preserve a known co-parent; a later partner is not automatically a parent.
    if (state.partner && heir.parentIds?.includes(state.partner.id)) state.parents.push({ ...clone(state.partner), relationship: heir.relationship });
    // A child keeps the household they already lived in. A co-parent's old
    // standalone profile must not create an artificial support jump next year.
    for (const parent of state.parents) {
      parent.lifestyle = successorLifestyle;
      parent.career = { ...(parent.career || initialParentCareer(parent, parent.id === previous.id ? Math.round(legacyFocusValue(state.focus.work)) : 1 + personHash(parent) % 5)), progress: clamp(successorLifestyle, 0, 10) };
    }
  } else if (info.route === 'siblings') {
    state.siblings = formerSiblings.filter(person => person.id !== heir.id);
    state.parents = formerParents;
    state.guardian = formerGuardian;
  } else {
    state.siblings = [];
    state.parents = [];
  }
  state.id = heir.id; state.name = heir.name; state.familyName = familyName; state.age = heir.age; state.generation += 1;
  state.stats = heir.stats; state.aptitudes = heir.aptitudes; state.height = heir.height; state.adultHeight = heir.adultHeight;
  state.conditions = [...heir.conditions];
  for (const key of ['growthSex', 'growthFactor', 'maturityAge', 'birthHeight', 'growthAnchor']) state[key] = clone(heir[key]);
  for (const parent of state.parents) parent.career ??= initialParentCareer(parent, parent.id === previous.id ? Math.round(legacyFocusValue(state.focus.work)) : 1 + personHash(parent) % 5);
  state.gender = heir.gender; state.canGestate = heir.canGestate; state.attractedTo = [...heir.attractedTo]; state.appearancePeakAge = heir.appearancePeakAge;
  state.money = Math.min(MAX_RESOURCES, heir.money + info.share);
  state.children = []; state.effects = []; state.pendingEvents = []; state.lastYearEvents = []; state.fame = null; state.focus = defaultFocus(state.age);
  delete state.householdEventBase;
  state.partner = null; state.pregnancy = null; state.encounters = []; state.encounterYear = state.age;
  state.jobId = null; state.jobYears = 0; state.performance = 0; state.careerProgress = 0; state.economyVersion = 1; state.income = 0; state.expenses = 0; state.lifestyle = lifestyleFromResources(0, state.money);
  state.babyChoice = 'quiet'; state.cryLevel = 1; state.alive = true; state.death = null; state.yearSummary = null; state.schoolProgress = 0; state.lastChildAge = -1; state.ended = false; state.needsSuccession = false;
  state.education = { status: state.age < 18 ? 'school' : 'undecided', years: 0 };
  delete state.collegeApplications;
  delete state.housing;
  clampFocusToLimits(state);
  state.jobOffers = state.age < 18 ? [] : makeJobOffers(state);
  syncFamilyLifestyles(state);
  state.school = state.age >= 5 && state.age < 18 ? createSchoolRecord({ ...state, school: null, stats: effectiveStats(state) }) : null;
  const inheritance = info.route === 'children' ? 'You inherit an equal share.' : 'You inherit the family legacy.';
  log(state, 'The story continues', 'You continue as ' + state.name + ', age ' + state.age + '. ' + inheritance, 'milestone');
  if (state.school) logSchoolOffers(state);
  return ok();
}

const validSchema = createSaveValidator({
  CORE, STAT_KEYS, FOCUS_KEYS, focusKeys, legacyFocusKeys,
  normalizeSurname, fromCentimeters, round, focusStage, focusLimits,
  focusMinimums, EVENTS, eventKey, pendingEventSubject,
});

export function validateSave(raw) { return validSchema(raw, 20); }

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

// Adapt only the active allocation. Completed reviews keep their recorded old
// controls, and all ratings, effects, pending decisions and RNG are preserved.
function upgradeFocus(state) {
  const toddler = state.age >= 2 && state.age < 5;
  const legacyNeutralThree = [0, 1, 1, 2, 3, 4];
  const legacyNeutralTwo = [0, 1, 2, 3, 3, 4];
  state.focus = Object.fromEntries(focusKeys(state).map(key => {
    const mapping = toddler && !['work', 'self'].includes(key) ? legacyNeutralTwo : legacyNeutralThree;
    return [key, mapping[state.focus[key]] ?? DEFAULT_FOCUS];
  }));
  clampFocusToLimits(state);
}
function upgradeSchoolRecord(state) {
  state.school = null;
  if (state.age >= 5 && state.age < 18) {
    // New optional enrollments do not reinterpret old generic allocations.
    state.focus.sports = 0;
    state.focus.extracurricular = 0;
    clampFocusToLimits(state);
    state.school = createSchoolRecord({ ...state, stats: effectiveStats(state) });
  }
}

// Existing perks gain their affinity effects exactly once when upgrading to
// schema 20. Retain recorded ratings, including any historical birth bonuses.
// Lineage and completed reviews are historical snapshots, not active people.
function upgradePerkAffinities(state) {
  const people = [state, ...state.parents, state.guardian, ...state.children,
    ...state.siblings, state.partner, ...state.encounters, state.pregnancy?.otherParent];
  for (const person of people.filter(Boolean)) applyBirthConditions(person);
}

export function migrateSave(raw) {
  try {
    if (validateSave(raw)) return clone(raw);
    if (validSchema(raw, 19) || validSchema(raw, 19, 5)) {
      const state = clone(raw);
      // Earlier schema-19 shortlists contained five offers. Keep their order
      // and the existing enrollment, changing only the two current lists.
      if (state.school) for (const kind of ['sports', 'extracurricular']) state.school.offers[kind] = state.school.offers[kind].slice(0, SCHOOL_OFFER_COUNT);
      upgradePerkAffinities(state);
      state.version = 20;
      return validateSave(state) ? state : null;
    }
    if ([17, 18].some(version => validSchema(raw, version))) {
      const state = clone(raw);
      upgradeSchoolRecord(state);
      upgradePerkAffinities(state);
      state.version = 20;
      return validateSave(state) ? state : null;
    }
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].some(version => validSchema(raw, version))) return null;
    const state = clone(raw);
    // Existing people keep their recorded ratings and receive no newly rolled
    // conditions. This also covers lineage and saved pregnancy partner copies.
    const addKnownConditions = value => {
      if (!value || typeof value !== 'object') return;
      if (value.stats && value.aptitudes) value.conditions ??= [];
      Object.values(value).forEach(addKnownConditions);
    };
    addKnownConditions(state);
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
      // Version 16 allows effective totals outside 0-10; base ratings stay bounded.
      // Existing values and the random state stay unchanged.
      upgradeFocus(state);
      upgradeSchoolRecord(state);
      state.version = 20;
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
      for (const child of state.children) child.lifestyle = child.age < 18 ? state.lifestyle : legacyLifestyleFromResources(0, child.money);
      for (const sibling of state.siblings) sibling.lifestyle = sibling.age < 18 ? householdLifestyle(state) : legacyLifestyleFromResources(0, sibling.money);
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
    upgradeFocus(state);
    upgradeSchoolRecord(state);
    state.version = 20;
    return validateSave(state) ? state : null;
  } catch { return null; }
}
