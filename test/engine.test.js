import test from 'node:test';
import assert from 'node:assert/strict';
import { toLegacyCentimeters } from './helpers/legacy-height.js';
import { SKILLS, JOBS, EVENTS, createGame, stage, advanceYear as advanceYearAction, setBabyChoice, setFocus, effectiveStats, currentEffects, eventOdds, jobFit, canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed, lifestyleFromResources, householdLifestyle, validateSave, migrateSave, chooseEducation, needsEducationChoice, offeredJobs, resolveEventChoice, respondToEncounter, proposeMarriage, endRelationship, relationshipOdds, oneNightChance, meetingChances, proposalChance, pregnancyChance, pendingEventSubject, normalizeSurname } from '../engine.js';

const copy = value => JSON.parse(JSON.stringify(value));
const finishChoices = state => {
  while (state.pendingEvents.length) {
    const event = EVENTS.find(event => event.id === state.pendingEvents[0].eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id).ok, true);
  }
};
const advanceYearRaw = state => {
  finishChoices(state);
  const result = advanceYearAction(state, { mortalityRandom: () => 1 });
  finishChoices(state);
  return result;
};
// Existing long-life scenarios choose work automatically at each adult handoff.
// Education tests call the actual action directly to exercise the choice gate.
const advanceYear = state => {
  finishChoices(state);
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  return advanceYearRaw(state);
};
const decision = (seed = 22) => { const s = createGame({ seed }); for (let i = 0; i < 18; i++) advanceYearRaw(s); return s; };
const adult = (seed = 22) => { const s = decision(seed); chooseEducation(s, 'work'); return s; };
function advanceMatchedQuietYears(...states) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const next = states.map(state => {
      const draft = copy(state);
      draft.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
      assert.equal(advanceYearAction(draft, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
      return draft;
    });
    if (next.some(state => state.lastYearEvents.length)) continue;
    states.forEach((state, index) => Object.assign(state, next[index]));
    return;
  }
  assert.fail('could not isolate an ordinary-event-free year');
}
const offerJob = (state, job) => {
  state.education = { status: job.requiresCollege ? 'graduate' : 'workforce', years: job.requiresCollege ? 4 : 0 };
  state.jobOffers = [...new Set(['retail', job.id, ...JOBS.filter(candidate => job.requiresCollege || !candidate.requiresCollege).map(candidate => candidate.id)])].slice(0, job.requiresCollege ? 15 : 10);
};
const v2Save = state => {
  const previous = oldTraits(state, 2);
  delete previous.education; delete previous.jobOffers;
  return previous;
};
const legacySave = state => {
  const legacy = oldTraits(state, 1);
  delete legacy.education; delete legacy.jobOffers;
  for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, ...legacy.lineage]) {
    person.stats.instability = Math.round((11 - person.stats.stability) * 100) / 100;
    delete person.stats.stability;
  }
  for (const relative of [...legacy.parents, ...legacy.children, ...legacy.siblings]) delete relative.lifestyle;
  for (const effect of legacy.effects) if (Object.hasOwn(effect.modifiers, 'stability')) {
    effect.modifiers.instability = -effect.modifiers.stability;
    delete effect.modifiers.stability;
  }
  return legacy;
};
function oldTraits(state, version = 3) {
  const previous = toLegacyCentimeters(copy(state));
  previous.version = version;
  delete previous.pendingEvents; delete previous.lastYearEvents;
  for (const person of [previous, ...previous.parents, ...previous.children, ...previous.siblings, ...previous.lineage]) {
    person.adultHeight ??= 170; // Older schemas always stored a predetermined endpoint.
    person.stats.discipline = 5; person.stats.relaxation = 6; person.aptitudes.discipline = 0;
  }
  return previous;
}

test('a new life starts at zero with complete, bounded inherited traits and parents', () => {
  const state = createGame({ name: 'Test Family', seed: 12 });
  assert.equal(state.age, 0); assert.ok(state.height >= 40 / 2.54 && state.height <= 60 / 2.54); assert.equal(state.parents.length, 2);
  assert.equal(stage(state), 'baby'); assert.equal(validateSave(state), true);
  assert.equal(JOBS.length, 100); assert.ok(EVENTS.length >= 100);
  for (const skill of SKILLS) assert.ok(state.aptitudes[skill.key] >= -3 && state.aptitudes[skill.key] <= 3);
  assert.deepEqual(createGame({ seed: 12 }), createGame({ seed: 12 }));
});

test('all five stats exist at birth with established natural ratings and average wellbeing', () => {
  const wellbeing = { health: [], stability: [] };
  for (let seed = 1; seed <= 40; seed++) {
    const baby = createGame({ seed });
    for (const { key } of SKILLS) assert.ok(baby.stats[key] >= 1 && baby.stats[key] <= 10, `${key} at birth`);
    assert.ok(baby.stats.attractiveness >= 1 && baby.stats.attractiveness <= 10);
    assert.equal(baby.version, 11);
    for (const key of ['health', 'stability']) {
      assert.ok(baby.stats[key] >= 1 && baby.stats[key] <= 10);
      wellbeing[key].push(baby.stats[key]);
    }
    assert.deepEqual(Object.keys(baby.stats).sort(), Object.keys(adult(seed).stats).sort());
  }
  for (const [key, values] of Object.entries(wellbeing)) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    assert.ok(Math.abs(mean - 5) < .5, `${key} starts around 5 rather than near the ceiling`);
    assert.ok(values.some(value => value < 5) && values.some(value => value > 5), `${key} varies on both sides of average`);
  }
  const fast = createGame({ seed: 93 }), slow = copy(fast);
  for (const { key } of SKILLS) { fast.aptitudes[key] = 3; slow.aptitudes[key] = -3; }
  advanceYear(fast); advanceYear(slow);
  for (const { key } of SKILLS.filter(skill => skill.key !== 'attractiveness')) assert.ok(fast.stats[key] > slow.stats[key], `${key} responds to affinity`);
  const parent = adult(90); haveChild(parent);
  for (const { key } of SKILLS) assert.ok(parent.children[0].stats[key] >= 1 && parent.children[0].stats[key] <= 10);
});

test('birth and adoption start with varied learned ratings that reflect natural aptitude', () => {
  const keys = SKILLS.filter(skill => skill.key !== 'attractiveness').map(skill => skill.key);
  const cohorts = { birth: [], adoption: [] };
  const adopter = adult(90);
  for (let seed = 1; seed <= 200; seed++) {
    cohorts.birth.push(createGame({ seed }));
    const parent = copy(adopter);
    parent.rng = seed;
    assert.equal(haveChild(parent).ok, true);
    const child = parent.children[0];
    assert.equal(child.age, 0);
    assert.equal(validateSave(parent), true);
    cohorts.adoption.push(child);
  }
  for (const [origin, children] of Object.entries(cohorts)) for (const key of keys) {
    const values = children.map(child => child.stats[key]);
    const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    assert.ok(Math.abs(average(values) - 5) < .4, `${origin} ${key} centers near 5 before any yearly growth`);
    assert.ok(new Set(values).size > 50, `${origin} ${key} varies between newborns`);
    assert.ok(values.every(value => value >= 1 && value <= 10));
    const high = children.filter(child => child.aptitudes[key] >= 2).map(child => child.stats[key]);
    const low = children.filter(child => child.aptitudes[key] <= -2).map(child => child.stats[key]);
    assert.ok(high.length > 10 && low.length > 10);
    assert.ok(average(high) - average(low) > 2, `${origin} ${key} reflects aptitude immediately`);
  }
});

test('childhood shares the parents household and changes to independent lifestyle exactly at18', () => {
  const state = createGame({ seed: 89 });
  assert.ok(state.lifestyle >= 2 && state.lifestyle <= 8);
  assert.equal(state.lifestyle, state.parents[0].lifestyle);
  assert.equal(state.lifestyle, state.parents[1].lifestyle);
  state.parents.forEach(parent => { parent.lifestyle = 8; parent.career.progress = 8; });
  while (state.age < 17) {
    advanceYear(state);
    assert.equal(state.lifestyle, householdLifestyle(state));
    assert.equal(state.lifestyle, state.parents[1].lifestyle);
    assert.equal(state.expenses, 0);
  }
  state.money = 0;
  advanceYear(state);
  assert.equal(state.age, 18);
  assert.equal(state.lifestyle, 1);
  assert.equal(validateSave(state), true);
});

test('dependent children track parent lifestyle each year and grow into their own lifestyle at18', () => {
  const parent = adult(87);
  parent.money = 300000;
  parent.lifestyle = lifestyleFromResources(0, parent.money);
  haveChild(parent);
  assert.equal(parent.children[0].lifestyle, parent.lifestyle);
  parent.money = 1000000;
  for (let year = 1; year < 18; year++) {
    advanceYear(parent);
    assert.equal(parent.children[0].lifestyle, parent.lifestyle);
  }
  advanceYear(parent);
  assert.equal(parent.children[0].age, 18);
  assert.equal(parent.children[0].lifestyle, lifestyleFromResources(0, parent.children[0].money));
  assert.ok(parent.children[0].lifestyle < parent.lifestyle);
});

test('one click advances one year, toddler activities start at two, school at five, and height stops by eighteen', () => {
  const state = createGame({ seed: 1 });
  assert.equal(setFocus(state, 'work', 0).ok, false);
  for (let age = 1; age <= 19; age++) {
    assert.equal(advanceYear(state).ok, true); assert.equal(state.age, age);
    assert.equal(stage(state), age < 2 ? 'baby' : age < 5 ? 'toddler' : age < 13 ? 'child' : age < 18 ? 'teen' : 'adult');
    if (age === 1) assert.equal(setFocus(state, 'work', 0).ok, false);
    if (age === 2) {
      assert.equal(setBabyChoice(state, 'cry').ok, false);
      assert.equal(setFocus(state, 'work', 0).ok, true);
      assert.equal(setFocus(state, 'work', 3).ok, true);
    }
    if (age <= 5) assert.equal(state.schoolProgress, 0, 'school practice begins in the year played at age five');
    if (age === 6) assert.ok(state.schoolProgress > 0);
  }
  assert.equal(state.height, state.adultHeight); assert.equal(stage(state), 'adult');
  assert.equal(setBabyChoice(state, 'cry').ok, false);
});

test('crying improves development more but stresses both parents', () => {
  const cry = createGame({ seed: 3 }), quiet = copy(cry);
  setBabyChoice(cry, 'cry'); setBabyChoice(quiet, 'quiet');
  advanceYear(cry); advanceYear(quiet);
  for (const skill of SKILLS.filter(skill => skill.key !== 'attractiveness')) assert.ok(cry.stats[skill.key] > quiet.stats[skill.key]);
  assert.equal(cry.stats.attractiveness, quiet.stats.attractiveness);
  for (let i = 0; i < 2; i++) assert.ok(cry.parents[i].stats.stability < quiet.parents[i].stats.stability);
});

test('aptitude changes development speed without leaving the stat scale', () => {
  const fast = createGame({ seed: 4 }), slow = copy(fast);
  fast.aptitudes.intelligence = 3; slow.aptitudes.intelligence = -3;
  setBabyChoice(fast, 'cry'); setBabyChoice(slow, 'cry');
  advanceYear(fast); advanceYear(slow);
  assert.ok(fast.stats.intelligence > slow.stats.intelligence);
});

test('focus has four independent 0–5 values and a hard 12-point budget', () => {
  const state = adult();
  state.focus = { work: 3, social: 3, family: 3, self: 3 };
  assert.equal(setFocus(state, 'work', 5).ok, false);
  assert.equal(setFocus(state, 'social', 1).ok, true);
  assert.equal(setFocus(state, 'work', 5).ok, true);
  assert.equal(setFocus(state, 'self', 5.1).ok, false);
  assert.equal(setFocus(state, 'unknown', 0).ok, false);
  assert.equal(setFocus(state, 'work', -1).ok, false);
});

test('event chances are absolute, leave quiet years and respond to choices and stability', () => {
  const state = adult();
  const chance = id => eventOdds(state).find(event => event.id === id).chance;
  state.stats.stability = 10; const calm = chance('crisis');
  state.stats.stability = 1; assert.ok(chance('crisis') > calm);
  state.focus.social = 0; const isolated = chance('friendship');
  state.focus.social = 5; assert.ok(chance('friendship') > isolated);
  assert.ok(eventOdds(state).every(event => event.chance >= 0 && event.chance < 1));
  assert.equal(eventOdds(createGame({ seed: 1 })).find(event => event.id === 'crisis').chance, 0);
});

test('stability effects and self care follow the higher-is-calmer scale', () => {
  assert.ok(EVENTS.find(event => event.id === 'crisis').modifiers.stability < 0);
  assert.ok(EVENTS.find(event => event.id === 'burnout').modifiers.stability < 0);
  assert.ok(EVENTS.find(event => event.id === 'friendship').modifiers.stability > 0);
  const resting = adult(88); resting.stats.stability = 5;
  const pressured = copy(resting);
  resting.focus = { work: 0, social: 3, family: 4, self: 5 };
  pressured.focus = { work: 5, social: 0, family: 0, self: 0 };
  advanceYear(resting); advanceYear(pressured);
  assert.ok(resting.stats.stability > 5);
  assert.ok(pressured.stats.stability < 5);
});

test('temporary effects modify effective stats and expire without permanently changing base stats', () => {
  const state = createGame({ seed: 7 });
  state.stats.strength = 5;
  const control = copy(state);
  state.effects.push({ id: 'test', name: 'Test', description: '', years: 1, modifiers: { strength: 2 } });
  assert.equal(effectiveStats(state).strength, Math.round((state.stats.strength + 2) * 100) / 100);
  advanceMatchedQuietYears(state, control);
  assert.equal(currentEffects(state).some(effect => effect.id === 'test'), false);
  assert.equal(state.stats.strength, control.stats.strength, 'the temporary bonus never becomes permanent');
  assert.equal(effectiveStats(state).strength, effectiveStats(control).strength);
});

test('jobs respect age and requirements; fit and focus influence earnings and lifestyle', () => {
  const state = createGame({ seed: 8 });
  assert.equal(canTakeJob(state, JOBS[0]).ok, false);
  state.age = 25;
  for (const skill of SKILLS) state.stats[skill.key] = 8;
  offerJob(state, JOBS.find(job => job.id === 'doctor'));
  assert.equal(takeJob(state, 'doctor').ok, true);
  const stronger = copy(state), weaker = copy(state);
  stronger.focus = { work: 5, social: 2, family: 2, self: 3 };
  weaker.focus = { work: 0, social: 4, family: 4, self: 4 };
  weaker.stats.intelligence = 3;
  assert.ok(jobFit(stronger, 'doctor') > jobFit(weaker, 'doctor'));
  advanceYear(stronger); advanceYear(weaker);
  assert.ok(stronger.income > weaker.income); assert.ok(stronger.money > 0); assert.ok(stronger.lifestyle > 1);
  assert.equal(quitJob(stronger).ok, true); advanceYear(stronger); assert.equal(stronger.income, 0);
});

test('the hundred careers have distinct titles, valid skill affinities, and lifestyle ratings', () => {
  assert.equal(JOBS.length, 100);
  assert.equal(new Set(JOBS.map(job => job.id)).size, 100);
  assert.equal(new Set(JOBS.map(job => job.name.toLowerCase())).size, 100);
  const categories = new Map();
  const knownSkills = new Set(SKILLS.map(skill => skill.key));
  for (const job of JOBS) {
    assert.match(job.id, /^[a-z][a-z0-9_-]*$/, `${job.name} must have a stable save identifier`);
    assert.ok(job.name.trim() && job.description.trim() && job.category.trim());
    categories.set(job.category, (categories.get(job.category) || 0) + 1);
    assert.ok(Number.isInteger(job.minAge) && job.minAge >= 18 && job.minAge <= 35);
    assert.equal(typeof job.requiresCollege, 'boolean');
    assert.ok(Number.isInteger(job.baseLifestyle) && job.baseLifestyle >= 1 && job.baseLifestyle <= 10);
    assert.ok(Number.isFinite(job.baseSalary) && job.baseSalary > 0);
    assert.equal(job.baseLifestyle, lifestyleFromResources(job.baseSalary, 0), `${job.name} lifestyle matches its base resources`);
    const entries = Object.entries(job.affinities);
    assert.ok(entries.length >= 2 && entries.length <= 4, `${job.name} needs meaningful skill emphases`);
    assert.deepEqual(Object.keys(job.weights).sort(), entries.map(([key]) => key).sort());
    const totalAffinity = entries.reduce((sum, [, value]) => sum + value, 0);
    for (const [key, value] of entries) {
      assert.ok(knownSkills.has(key), `${job.name} references a supported skill`);
      assert.ok(Number.isInteger(value) && value >= 1 && value <= 3, `${job.name} has a 1–3 job affinity`);
      assert.ok(Math.abs(job.weights[key] - value / totalAffinity) < 1e-10, `${job.name} skill weighting follows its affinities`);
    }
    assert.ok(Math.abs(Object.values(job.weights).reduce((sum, value) => sum + value, 0) - 1) < 1e-10);
    for (const [key, value] of Object.entries(job.requirements)) {
      assert.ok(knownSkills.has(key));
      assert.ok(Number.isFinite(value) && value >= 1 && value <= 10);
    }
  }
  assert.equal(categories.size, 10);
  assert.ok([...categories.values()].every(count => count === 10));
  assert.ok(new Set(JOBS.map(job => job.baseLifestyle)).size >= 8, 'career rewards span a broad lifestyle range');
  for (const id of ['retail', 'chef', 'builder', 'designer', 'sales', 'athlete', 'teacher', 'engineer', 'performer', 'doctor']) {
    assert.ok(JOBS.some(job => job.id === id), `existing ${id} saves must retain their career`);
  }
});

test('every career can be entered, simulated, and restored with a qualified adult', () => {
  const qualified = createGame({ seed: 404 });
  while (qualified.age < 35) advanceYear(qualified);
  for (const skill of SKILLS) qualified.stats[skill.key] = 10;
  qualified.effects = [];
  qualified.focus = { work: 5, social: 2, family: 2, self: 3 };
  for (const job of JOBS) {
    const state = copy(qualified);
    offerJob(state, job);
    assert.equal(canTakeJob(state, job).ok, true, `${job.name} should be reachable`);
    assert.equal(takeJob(state, job.id).ok, true);
    assert.ok(Math.abs(jobFit(state, job) - 1) < 1e-10);
    assert.equal(advanceYear(state).ok, true);
    assert.equal(state.jobId, job.id);
    assert.equal(state.jobYears, 1);
    assert.ok(Number.isFinite(state.income) && state.income > 0);
    assert.ok(Number.isInteger(state.lifestyle) && state.lifestyle >= 1 && state.lifestyle <= 10);
    assert.equal(validateSave(state), true, `${job.name} leaves a valid save`);
    const restored = migrateSave(copy(state));
    assert.equal(restored.jobId, job.id);
    assert.deepEqual(restored, state);
  }
});

test('turning eighteen pauses for college or one of ten persistent career offers', () => {
  const state = createGame({ seed: 501 });
  assert.deepEqual(offeredJobs(state), []);
  assert.equal(chooseEducation(state, 'college').ok, false);
  while (state.age < 17) assert.equal(advanceYearRaw(state).ok, true);
  assert.equal(needsEducationChoice(state), false);
  assert.equal(advanceYearRaw(state).ok, true);
  assert.equal(state.age, 18);
  assert.deepEqual(state.education, { status: 'undecided', years: 0 });
  assert.equal(needsEducationChoice(state), true);
  assert.equal(state.jobOffers.length, 10);
  assert.equal(new Set(state.jobOffers).size, 10);
  assert.ok(offeredJobs(state).every(job => !job.requiresCollege));
  assert.ok(offeredJobs(state).some(job => canTakeJob(state, job).ok));
  const snapshot = copy(state);
  assert.equal(advanceYearRaw(state).ok, false);
  assert.equal(advanceYearRaw(state).ok, false);
  assert.deepEqual(state, snapshot, 'a blocked advance never consumes a year or randomness');
  assert.equal(chooseEducation(state, 'unknown').ok, false);
  assert.deepEqual(state, snapshot);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(state), state);
});

test('choosing an offered career starts work directly and restricts changes to the saved shortlist', () => {
  const state = decision(502);
  const originalOffers = [...state.jobOffers];
  const unlisted = JOBS.find(job => !job.requiresCollege && !state.jobOffers.includes(job.id));
  for (const { key } of SKILLS) state.stats[key] = 10;
  assert.equal(takeJob(state, unlisted.id).ok, false);
  assert.equal(needsEducationChoice(state), true);
  assert.equal(takeJob(state, 'retail').ok, true);
  assert.equal(state.education.status, 'workforce');
  assert.equal(needsEducationChoice(state), false);
  assert.deepEqual(state.jobOffers, originalOffers);
  assert.equal(chooseEducation(state, 'college').ok, false);
  assert.equal(advanceYearRaw(state).ok, true);
  assert.equal(state.age, 19);
  assert.equal(state.jobYears, 1);
  assert.deepEqual(state.jobOffers, originalOffers);
  assert.deepEqual(migrateSave(state).jobOffers, originalOffers);
});

test('college lasts four years, develops skills, and then offers fifteen careers with degree options', () => {
  const state = decision(503);
  state.focus = { work: 5, social: 1, family: 3, self: 3 };
  const intelligence = state.stats.intelligence;
  assert.equal(chooseEducation(state, 'college').ok, true);
  assert.deepEqual(state.education, { status: 'college', years: 0 });
  assert.deepEqual(state.jobOffers, []);
  assert.deepEqual(offeredJobs(state), []);
  assert.equal(takeJob(state, 'retail').ok, false);
  assert.equal(chooseEducation(state, 'work').ok, false);
  for (let year = 1; year <= 4; year++) {
    advanceMatchedQuietYears(state);
    assert.equal(state.age, 18 + year);
    assert.equal(state.education.years, year);
    assert.equal(state.education.status, year < 4 ? 'college' : 'graduate');
    assert.equal(state.jobOffers.length, year < 4 ? 0 : 15);
    assert.equal(state.income, 0);
    assert.equal(state.jobId, null);
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(state), state);
  }
  assert.ok(state.stats.intelligence > intelligence);
  const jobs = offeredJobs(state);
  assert.equal(new Set(jobs.map(job => job.id)).size, 15);
  assert.ok(jobs.some(job => job.requiresCollege));
  assert.ok(jobs.some(job => !job.requiresCollege));
  assert.ok(jobs.some(job => canTakeJob(state, job).ok));
  const offers = [...state.jobOffers];
  takeJob(state, 'retail'); advanceYearRaw(state);
  assert.deepEqual(state.jobOffers, offers);
  assert.equal(state.education.years, 4);
});

test('study focus and skill affinity affect development during college', () => {
  const studying = decision(504);
  chooseEducation(studying, 'college');
  studying.stats.intelligence = 3;
  studying.aptitudes.intelligence = 3;
  studying.focus = { work: 5, social: 1, family: 3, self: 3 };
  const distracted = copy(studying), lowAffinity = copy(studying);
  distracted.focus.work = 0;
  lowAffinity.aptitudes.intelligence = -3;
  advanceYearRaw(studying); advanceYearRaw(distracted); advanceYearRaw(lowAffinity);
  assert.ok(studying.stats.intelligence > distracted.stats.intelligence);
  assert.ok(studying.stats.intelligence > lowAffinity.stats.intelligence);
});

test('degree careers require graduation even with sufficient age and skills', () => {
  const state = adult(505);
  while (state.age < 35) advanceYearRaw(state);
  for (const { key } of SKILLS) state.stats[key] = 10;
  state.jobOffers[state.jobOffers.length - 1] = 'doctor';
  assert.equal(canTakeJob(state, 'doctor').ok, false);
  assert.match(canTakeJob(state, 'doctor').reason, /college degree/);
  offerJob(state, JOBS.find(job => job.id === 'doctor'));
  assert.equal(takeJob(state, 'doctor').ok, true);
});

test('shortlists vary between families while guaranteeing an accessible first career', () => {
  const shortlists = new Set();
  const available = new Set();
  for (let seed = 510; seed < 570; seed++) {
    const state = decision(seed);
    shortlists.add(state.jobOffers.join(','));
    state.jobOffers.forEach(id => available.add(id));
    assert.equal(canTakeJob(state, 'retail').ok, true);
    const rng = state.rng;
    const snapshot = copy(state);
    offeredJobs(state); offeredJobs(state);
    assert.equal(state.rng, rng);
    assert.deepEqual(state, snapshot);
    assert.deepEqual(state, decision(seed));
  }
  assert.ok(shortlists.size > 50);
  assert.ok(available.size > 35, 'the pool spans many careers across characters');
});

test('v2 upgrades preserve school, current careers, and adults without consuming randomness', () => {
  const young = createGame({ seed: 601 });
  const eighteen = decision(602);
  const unemployed = adult(603); advanceYear(unemployed);
  const worker = adult(604); takeJob(worker, 'retail'); advanceYear(worker);
  const professional = adult(605);
  while (professional.age < 35) advanceYear(professional);
  for (const { key } of SKILLS) professional.stats[key] = 9;
  offerJob(professional, JOBS.find(job => job.id === 'doctor'));
  takeJob(professional, 'doctor'); advanceYear(professional);
  const examples = [[young, 'school', 0], [eighteen, 'undecided', 10], [unemployed, 'workforce', 10], [worker, 'workforce', 10], [professional, 'graduate', 15]];
  for (const [state, status, count] of examples) {
    state.effects = []; // These legacy career fixtures predate lifestyle event modifiers.
    for (const old of [v2Save(state), legacySave(state)]) {
      const snapshot = copy(old);
      const upgraded = migrateSave(old);
      assert.equal(validateSave(upgraded), true);
      assert.equal(upgraded.version, 11);
      assert.equal(upgraded.education.status, status);
      assert.equal(upgraded.education.years, status === 'graduate' ? 4 : 0);
      assert.equal(upgraded.jobOffers.length, count);
      assert.deepEqual(old, snapshot);
      for (const key of ['age', 'rng', 'seed', 'id', 'nextId', 'jobId', 'jobYears', 'performance', 'schoolProgress', 'money']) assert.equal(upgraded[key], state[key]);
      for (const key of ['stats', 'aptitudes', 'history', 'effects']) assert.deepEqual(upgraded[key], state[key]);
      if (old.version === 2) for (const key of ['parents', 'children', 'siblings', 'lineage']) assert.deepEqual(upgraded[key], state[key]);
      if (upgraded.jobId) assert.ok(upgraded.jobOffers.includes(upgraded.jobId));
      assert.deepEqual(migrateSave(old), upgraded);
      assert.deepEqual(migrateSave(upgraded), upgraded);
    }
  }
});

test('education import validation rejects impossible progress or malformed career offers', () => {
  const state = decision(606);
  for (const mutate of [
    s => { delete s.education; },
    s => { s.education.status = 'hacked'; },
    s => { s.education.years = 2; },
    s => { s.education.status = 'school'; },
    s => { s.education.status = 'college'; },
    s => { s.education.status = 'graduate'; s.education.years = 4; },
    s => { s.jobOffers.pop(); },
    s => { s.jobOffers[1] = s.jobOffers[0]; },
    s => { s.jobOffers[1] = 'unknown'; },
    s => { s.jobOffers[1] = 'doctor'; },
    s => { s.jobId = 'retail'; },
  ]) {
    const bad = copy(state); mutate(bad);
    assert.equal(validateSave(bad), false);
    assert.equal(migrateSave(bad), null);
  }
  const college = copy(state); chooseEducation(college, 'college');
  college.education.years = 4;
  assert.equal(validateSave(college), false);
  const minor = createGame({ seed: 607 });
  minor.education.status = 'undecided';
  minor.jobOffers = [...state.jobOffers];
  assert.equal(validateSave(minor), false);
});

test('succession resets education for heirs and mandatory retirement takes precedence', () => {
  const parent = adult(608); haveChild(parent);
  while (parent.age < 65) advanceYear(parent);
  const childId = parent.children[0].id;
  assert.equal(succeed(parent, childId).ok, true);
  assert.equal(parent.age, 47);
  assert.equal(parent.education.status, 'undecided');
  assert.equal(parent.jobOffers.length, 10);
  assert.equal(advanceYearRaw(parent).ok, false);
  assert.equal(chooseEducation(parent, 'college').ok, true);
  for (let index = 0; index < 4; index++) advanceYearRaw(parent);
  assert.equal(parent.education.status, 'graduate');
  assert.equal(parent.jobOffers.length, 15);
  assert.equal(validateSave(parent), true);

  const young = adult(609);
  while (young.age < 64) advanceYear(young);
  haveChild(young); advanceYear(young);
  succeed(young, young.children[0].id);
  assert.equal(young.age, 1);
  assert.deepEqual(young.education, { status: 'school', years: 0 });
  assert.deepEqual(young.jobOffers, []);
  assert.equal(validateSave(young), true);

  const ended = adult(610);
  while (ended.age < 85) advanceYear(ended);
  assert.equal(needsEducationChoice(ended), false);
  assert.equal(chooseEducation(ended, 'college').ok, false);
  assert.match(advanceYearRaw(ended).reason, /Choose an heir/);
});

test('family focus improves children, and arrivals are limited to one per year', () => {
  const caring = adult(9);
  assert.equal(haveChild(caring).ok, true); assert.equal(haveChild(caring).ok, false);
  const distant = copy(caring);
  caring.focus = { work: 2, social: 2, family: 5, self: 3 };
  distant.focus = { work: 4, social: 4, family: 0, self: 4 };
  advanceMatchedQuietYears(caring, distant);
  assert.equal(caring.children[0].age, 1);
  for (const skill of SKILLS.filter(skill => skill.key !== 'attractiveness')) assert.ok(caring.children[0].stats[skill.key] > distant.children[0].stats[skill.key]);
  assert.ok(caring.children[0].stats.stability >= distant.children[0].stats.stability);
  assert.equal(haveChild(caring).ok, true);
  assert.equal(caring.children[0].adopted, true);
});

test('older heirs can adopt and continue a family beyond mandatory succession', () => {
  const state = adult(94);
  haveChild(state);
  while (state.age < 85) advanceYear(state);
  succeed(state, state.children[0].id);
  assert.equal(state.age, 67);
  assert.equal(haveChild(state).ok, true);
  assert.equal(state.children[0].adopted, true);
  assert.equal(state.children[0].age, 0);
  assert.equal(state.history[0].title, 'A new beginning');
  assert.match(state.history[0].text, /adopt/);
  assert.equal(haveChild(state).ok, false);
  assert.equal(validateSave(state), true);
  while (state.age < 85) advanceYear(state);
  assert.equal(succeed(state, state.children[0].id).ok, true);
  assert.equal(state.age, 18);
  assert.equal(state.generation, 3);
  assert.equal(haveChild(state).ok, true);
  assert.equal(state.children[0].adopted, true);
  assert.equal(validateSave(state), true);
});

test('manual adoption begins at 18 and remains capped at six', () => {
  const state = createGame({ seed: 95 });
  assert.equal(haveChild(state).ok, false);
  state.age = 60; assert.equal(haveChild(state).ok, true); assert.equal(state.children[0].adopted, true);
  for (let index = 1; index < 6; index++) {
    advanceYear(state);
    assert.equal(haveChild(state).ok, true);
    assert.equal(state.children[index].adopted, true);
  }
  advanceYear(state); assert.equal(haveChild(state).ok, false);
});

test('inheritance uses lifestyle and equal shares while succession preserves the chosen child', () => {
  const state = adult(11); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; state.money = 100000; state.lifestyle = 4;
  const info = successionInfo(state); assert.equal(info.estate, 75000); assert.equal(info.share, 37500);
  const chosen = copy(state.children[1]);
  assert.equal(succeed(state, chosen.id).ok, true);
  assert.equal(state.name, chosen.name); assert.equal(state.age, chosen.age); assert.equal(state.generation, 2);
  assert.deepEqual(state.stats, chosen.stats); assert.deepEqual(state.aptitudes, chosen.aptitudes);
  assert.equal(state.money, chosen.money + info.share); assert.equal(state.siblings[0].inheritance, info.share);
  assert.equal(state.children.length, 0); assert.equal(state.jobId, null); assert.equal(state.effects.length, 0);
  assert.equal(state.lineage.length, 1); assert.equal(validateSave(state), true);
  assert.equal(state.history[0].generation, 2);
});

test('higher lifestyle reduces the share and deceased children are excluded', () => {
  const state = adult(15); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; state.money = 100000;
  state.lifestyle = 1; const lowSpending = successionInfo(state).share;
  state.lifestyle = 10; assert.ok(successionInfo(state).share < lowSpending);
  state.children[1].alive = false;
  assert.equal(successionInfo(state).share, successionInfo(state).estate);
});

test('lifestyle is supported by earnings or reserves and remains on the 1–10 scale', () => {
  assert.equal(lifestyleFromResources(0, 0), 1);
  assert.equal(lifestyleFromResources(0, 25000), 2);
  assert.equal(lifestyleFromResources(0, 175000), 4);
  assert.equal(lifestyleFromResources(66000, 0), 4);
  assert.equal(lifestyleFromResources(0, 1e15), 10);
  assert.equal(lifestyleFromResources(1e15, 0), 10);
});

test('young heirs keep their parent household lifestyle and preserve their own reserves', () => {
  const wealthy = adult(123);
  while (wealthy.age < 60) advanceYear(wealthy);
  haveChild(wealthy);
  while (wealthy.age < 65) advanceYear(wealthy);
  const modest = copy(wealthy);
  wealthy.money = 500000; wealthy.lifestyle = lifestyleFromResources(0, wealthy.money);
  modest.money = 0; modest.lifestyle = 1;
  succeed(wealthy, wealthy.children[0].id); succeed(modest, modest.children[0].id);
  assert.equal(wealthy.age, 5); assert.equal(modest.age, 5);
  assert.ok(wealthy.lifestyle > modest.lifestyle);
  assert.equal(wealthy.lifestyle, wealthy.parents[0].lifestyle);
  assert.equal(modest.lifestyle, modest.parents[0].lifestyle);
  const inheritedReserves = wealthy.money;
  advanceYear(wealthy); advanceYear(modest);
  assert.equal(wealthy.money, inheritedReserves);
  assert.ok(wealthy.lifestyle > modest.lifestyle);
  assert.equal(wealthy.income, 0);
  assert.equal(validateSave(wealthy), true);
  assert.equal(validateSave(modest), true);
  assert.doesNotMatch(wealthy.history.map(memory => memory.text).join(' '), /\$\s*[\d,]+/);
});

test('a young heir keeps a deceased parents household support through guardianship', () => {
  const parent = adult(125);
  while (parent.age < 80) advanceYear(parent);
  haveChild(parent);
  while (parent.age < 85) advanceYear(parent);
  const household = parent.lifestyle = 7;
  parent.alive = false; parent.death = { cause: 'disease', age: parent.age };
  succeed(parent, parent.children[0].id);
  assert.equal(parent.age, 5);
  assert.equal(parent.parents[0].alive, false);
  assert.equal(householdLifestyle(parent), household);
  advanceYear(parent);
  assert.equal(parent.lifestyle, household);
});

test('an unemployed adult\'s reserve-supported lifestyle declines as resources are used', () => {
  const state = adult(124); state.money = 76000;
  state.lifestyle = lifestyleFromResources(0, state.money);
  const before = state.lifestyle;
  advanceYear(state);
  assert.ok(state.money < 76000);
  assert.ok(state.lifestyle < before);
  assert.equal(state.lifestyle, lifestyleFromResources(state.income, state.money));
});

test('age 85 pauses every life for mandatory succession including childless lives', () => {
  const childless = createGame({ seed: 16 });
  for (let i = 0; i < 85; i++) advanceYear(childless);
  assert.equal(childless.ended, false); assert.equal(childless.needsSuccession, true); assert.equal(advanceYear(childless).ok, false); assert.equal(childless.age, 85);
  assert.equal(validateSave(childless), true);
  const parent = adult(17); haveChild(parent);
  for (let i = parent.age; i < 85; i++) advanceYear(parent);
  assert.equal(parent.needsSuccession, true); assert.equal(parent.ended, false); assert.equal(advanceYear(parent).ok, false);
  assert.equal(succeed(parent, parent.children[0].id).ok, true); assert.equal(parent.age, 67);
  assert.equal(validateSave(parent), true);
});

test('save loading rejects malformed values while round trips preserve deterministic simulation', () => {
  const state = adult(18); haveChild(state);
  const restored = copy(state); assert.equal(validateSave(restored), true);
  advanceYear(state); advanceYear(restored); assert.deepEqual(restored, state);
  for (const mutate of [s => { s.stats.health = NaN; }, s => { s.focus.self = 12; }, s => { s.focus.extra = 'oops'; }, s => { s.jobId = 'hacker'; }, s => { s.children[0].stats = {}; }, s => { s.rng = null; }, s => { s.effects.push({}); }, s => { s.age = 85; }]) {
    const bad = copy(state); mutate(bad); assert.equal(validateSave(bad), false);
  }
  assert.equal(validateSave(null), false); assert.equal(validateSave({ version: 1 }), false);
});

test('v1 saves migrate every family member and active effects without resetting progress or randomness', () => {
  const state = adult(130); haveChild(state); advanceYear(state); haveChild(state);
  while (state.age < 65) advanceYear(state);
  succeed(state, state.children[0].id);
  haveChild(state);
  state.stats.stability = 6.25;
  // Keep this preservation fixture clear of the separately tested legacy
  // infant appearance correction.
  for (const person of [state, ...state.children, ...state.siblings]) if (person.age < 3) person.stats.attractiveness = 5;
  state.effects = [{ id: 'crisis', name: 'A difficult year', description: 'Recovering', years: 2, modifiers: { stability: -1.5, social: -1.3 }, kind: 'negative' }];
  const old = legacySave(state);
  const snapshot = copy(old);
  const migrated = migrateSave(old);
  assert.equal(validateSave(old), false);
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(old, snapshot, 'migration must not mutate its source');
  for (const key of ['name','age','id','seed','rng','nextId','generation','money','jobId']) assert.equal(migrated[key], state[key]);
  assert.deepEqual(migrated.aptitudes, state.aptitudes);
  assert.deepEqual(migrated.history, state.history);
  assert.deepEqual(migrated.stats, state.stats);
  assert.deepEqual(migrated.effects, state.effects);
  assert.equal(effectiveStats(migrated).stability, 4.75);
  for (const key of ['parents','children','siblings','lineage']) {
    assert.deepEqual(migrated[key].map(person => person.stats), state[key].map(person => person.stats));
    assert.ok(migrated[key].every(person => Number.isInteger(person.lifestyle) && person.lifestyle >= 1 && person.lifestyle <= 10));
  }
  assert.equal(migrated.parents[0].lifestyle, state.lineage.at(-1).lifestyle);
  const roundTrip = migrateSave(migrated);
  assert.deepEqual(roundTrip, migrated);
  advanceYear(migrated); advanceYear(roundTrip);
  assert.deepEqual(roundTrip, migrated);
});

test('migration uses a safe household fallback for old childhood saves and rejects malformed imports', () => {
  const old = legacySave(createGame({ seed: 131 }));
  old.lifestyle = 1;
  const converted = migrateSave(old);
  assert.equal(converted.lifestyle, 4);
  assert.ok(converted.parents.every(parent => parent.lifestyle === converted.lifestyle));
  for (const mutation of [
    state => { state.stats.instability = 'high'; },
    state => { state.parents[0].stats.instability = -4; },
    state => { state.effects = [{ id: 'x', name: 'Bad', description: '', years: 1, modifiers: { instability: Infinity } }]; },
    state => { state.version = 100; },
    state => { state.focus.work = 10; },
  ]) {
    const bad = copy(old); mutation(bad); assert.equal(migrateSave(bad), null);
  }
  const invalidV2 = copy(converted); invalidV2.parents[0].lifestyle = 11;
  assert.equal(validateSave(invalidV2), false);
  assert.equal(migrateSave(invalidV2), null);
  assert.equal(migrateSave(null), null);
});

test('import validation rejects malformed lineage and nested family fields', () => {
  const state = adult(96); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; succeed(state, state.children[0].id);
  assert.equal(validateSave(state), true);
  const attacks = [
    s => { s.lineage[0].generation = '<img src=x onerror=alert(1)>'; },
    s => { s.lineage[0].generation = 1.5; },
    s => { s.lineage[0].generation = -1; },
    s => { s.lineage[0].generation = 100001; },
    s => { s.lineage[0].children = [null]; },
    s => { s.lineage[0].children[0].id = {}; },
    s => { s.lineage[0].children[0].name = 10; },
    s => { s.lineage[0].children[0].inheritance = Infinity; },
    s => { s.lineage[0].height = 'tall'; },
    s => { s.parents[0].height = NaN; },
    s => { s.siblings[0].adultHeight = 'tall'; },
    s => { s.siblings[0].id = false; },
    s => { s.siblings[0].adopted = {}; },
    s => { s.siblings[0].id = s.parents[0].id; },
    s => { s.parents[0].id = s.id; },
    s => { s.parents[0].age = s.age; },
  ];
  for (const mutate of attacks) {
    const malformed = copy(state); mutate(malformed);
    assert.equal(validateSave(malformed), false);
  }
  const parent = adult(97); haveChild(parent); advanceYear(parent); haveChild(parent);
  const duplicate = copy(parent); duplicate.children[1].id = duplicate.children[0].id;
  assert.equal(validateSave(duplicate), false);
  const impossibleAge = copy(parent); impossibleAge.children[0].age = 90;
  assert.equal(validateSave(impossibleAge), false);
  const olderThanParent = copy(parent); olderThanParent.children[0].age = parent.age;
  assert.equal(validateSave(olderThanParent), false);
});

test('long simulations retain bounds and mix quiet years with at most five unique events per year', () => {
  let quiet = 0, events = 0, multiple = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const state = createGame({ seed });
    for (let year = 0; year < 85; year++) {
      const result = advanceYear(state);
      if (!result.eventIds.length) quiet += 1;
      events += result.eventIds.length;
      if (result.eventIds.length > 1) multiple += 1;
      assert.ok(result.eventIds.length <= 5);
      assert.equal(new Set(result.eventIds).size, result.eventIds.length);
      assert.ok(result.eventIds.every(id => EVENTS.some(event => event.id === id || id.startsWith(`${event.id}:`))));
      assert.equal(validateSave(state), true, `invalid seed ${seed}, age ${state.age}`);
      for (const value of Object.values(effectiveStats(state))) assert.ok(value >= 1 && value <= 10);
    }
  }
  assert.ok(quiet > 1000, 'many years stay quiet');
  assert.ok(multiple > 0, 'events are independent, not mutually exclusive');
  assert.ok(events / (60 * 85) >= .3 && events / (60 * 85) <= 1.05, `overall events per year: ${events / (60 * 85)}`);
});

test('event catalogue has unique authored outcomes and only supported traits', () => {
  assert.ok(EVENTS.length >= 100);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, EVENTS.length);
  assert.equal(new Set(EVENTS.map(event => event.name)).size, EVENTS.length);
  assert.ok(EVENTS.filter(event => event.choices?.length).length >= 25);
  const traits = new Set([...SKILLS.map(skill => skill.key), 'health', 'stability']);
  for (const event of EVENTS) {
    assert.ok(event.description.length > 20);
    assert.ok(Number.isInteger(event.minAge) && event.minAge >= 0);
    assert.ok(event.maxAge === undefined || event.maxAge >= event.minAge);
    const outcomes = event.choices || [event];
    if (event.choices) {
      assert.ok(event.choices.length >= 2);
      assert.equal(new Set(event.choices.map(choice => choice.id)).size, event.choices.length);
    }
    for (const outcome of outcomes) {
      assert.ok(Object.keys(outcome.statChanges || {}).length || Object.keys(outcome.subjectChanges || {}).length || Object.keys(outcome.playerChanges || {}).length || outcome.relationship || Object.keys(outcome.modifiers || {}).length || outcome.lifestyle, `${event.id} has a consequence`);
      for (const changes of [outcome.statChanges, outcome.modifiers]) for (const [key, amount] of Object.entries(changes || {})) {
        assert.ok(traits.has(key), `${event.id}: ${key}`);
        assert.ok(Number.isFinite(amount) && amount !== 0 && Math.abs(amount) <= 3);
      }
      if (Object.keys(outcome.modifiers || {}).length || outcome.lifestyle) assert.ok(Number.isInteger(outcome.years) && outcome.years >= 1 && outcome.years <= 5);
    }
  }
});

test('age gates apply to the year being played and every retained stat affects some event odds', () => {
  const state = adult(1001);
  for (const age of [0, 2, 5, 12, 15, 17, 18, 30, 65, 84]) {
    state.age = age;
    const odds = eventOdds(state);
    for (const event of EVENTS.filter(event=>!event.subjectType)) if (age < event.minAge || age > (event.maxAge ?? 85)) assert.equal(odds.find(roll => roll.id === event.id).chance, 0, `${event.id} at ${age}`);
  }
  state.age = 30;
  haveChild(state);
  state.jobId = 'athlete';
  for (const key of [...SKILLS.map(skill => skill.key), 'health', 'stability']) {
    state.stats[key] = 1; const low = eventOdds(state);
    state.stats[key] = 10; const high = eventOdds(state);
    assert.ok(low.some((roll, index) => Math.abs(roll.chance - high[index].chance) > .001), `${key} meaningfully changes odds`);
    state.stats[key] = 5;
  }
  for (const key of ['work', 'social', 'family', 'self']) {
    state.focus[key] = 0; const low = eventOdds(state);
    state.focus[key] = 5; const high = eventOdds(state);
    assert.ok(low.some((roll, index) => Math.abs(roll.chance - high[index].chance) > .001), `${key} focus meaningfully changes odds`);
    state.focus[key] = 3;
  }
});

test('pending choices survive saves, block other actions, and apply one selected outcome exactly once', () => {
  let state;
  for (let seed = 1100; seed < 1300 && !state; seed++) {
    const candidate = adult(seed);
    for (let year = 0; year < 15; year++) {
      advanceYearAction(candidate);
      if (candidate.pendingEvents.length) { state = candidate; break; }
    }
  }
  assert.ok(state, 'a normal simulation reaches a choice');
  assert.equal(validateSave(state), true);
  const restored = migrateSave(copy(state));
  assert.deepEqual(restored, state);
  const snapshot = copy(state);
  for (const action of [() => advanceYearAction(state), () => setFocus(state, 'social', 0), () => takeJob(state, 'retail'), () => quitJob(state), () => haveChild(state), () => chooseEducation(state, 'work'), () => succeed(state, 'missing'), () => resolveEventChoice(state, 'bad-option')]) {
    assert.equal(action().ok, false);
    assert.deepEqual(state, snapshot);
  }
  const pending = state.pendingEvents[0];
  const event = EVENTS.find(event => event.id === pending.eventId);
  const choice = event.choices[0];
  assert.equal(resolveEventChoice(state, choice.id, 'already-resolved').ok, false);
  const before = copy(state.stats);
  assert.equal(resolveEventChoice(state, choice.id, event.id).ok, true);
  assert.equal(state.rng, snapshot.rng, 'a decision never rerolls the year');
  for (const [key, amount] of Object.entries(choice.statChanges || {})) assert.equal(state.stats[key], Math.round(Math.max(1, Math.min(10, before[key] + amount)) * 100) / 100);
  if (choice.years) assert.ok(state.effects.some(effect => effect.id === event.id && effect.years === choice.years));
  assert.match(state.history[0].text, new RegExp(choice.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const applied = copy(state);
  assert.equal(resolveEventChoice(state, choice.id, event.id).ok, false);
  assert.deepEqual(state, applied);
  resolveEventChoice(restored, choice.id, event.id);
  assert.deepEqual(restored, state);
  finishChoices(state);
  assert.equal(validateSave(state), true);
});

test('choices still resolve at the end of a life before succession', () => {
  const state = adult(1301);
  haveChild(state);
  while (state.age < 85) advanceYear(state);
  const event = EVENTS.find(event => event.choices?.length && event.minAge <= 84 && (event.maxAge ?? 85) >= 84);
  state.pendingEvents = [{ eventId: event.id, age: 85 }];
  state.lastYearEvents = [event.id];
  assert.equal(validateSave(state), true);
  assert.equal(succeed(state, state.children[0].id).ok, false);
  assert.equal(resolveEventChoice(state, event.choices[0].id, event.id).ok, true);
  assert.equal(succeed(state, state.children[0].id).ok, true);
  assert.deepEqual(state.pendingEvents, []);
  assert.deepEqual(state.lastYearEvents, []);
});

test('v3 saves preserve education and offers while removing retired traits from the whole family', () => {
  const state = adult(1302); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; succeed(state, state.children[0].id);
  const previous = oldTraits(state);
  previous.effects = [{ id: 'burnout', name: 'Running on empty', description: 'Recovering.', years: 2, kind: 'negative', modifiers: { intelligence: -.5, discipline: -1, relaxation: -.5 } }, { id: 'retired', name: 'Old effect', description: 'Rested.', years: 1, kind: 'positive', modifiers: { relaxation: 1 } }];
  const snapshot = copy(previous);
  const migrated = migrateSave(previous);
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(previous, snapshot);
  for (const key of ['rng', 'age', 'name', 'id', 'jobId', 'money', 'education', 'jobOffers', 'history']) assert.deepEqual(migrated[key], state[key]);
  for (const person of [migrated, ...migrated.parents, ...migrated.children, ...migrated.siblings, ...migrated.lineage]) {
    assert.equal('discipline' in person.stats, false);
    assert.equal('relaxation' in person.stats, false);
    assert.equal('discipline' in person.aptitudes, false);
    assert.equal(Object.keys(person.stats).length, 7);
  }
  assert.equal(migrated.effects.length, 1);
  assert.deepEqual(migrated.effects[0].modifiers, { intelligence: -.5 });
  assert.deepEqual(migrated.pendingEvents, []);
  assert.deepEqual(migrated.lastYearEvents, []);
  assert.deepEqual(migrateSave(migrated), migrated);
});

test('new save validation rejects malformed choice queues, event histories, and retired traits', () => {
  const state = adult(1303);
  for (const mutate of [
    s => { delete s.pendingEvents; },
    s => { s.pendingEvents = [{ eventId: 'unknown', age: s.age }]; },
    s => { s.lastYearEvents = ['unknown']; },
    s => { s.lastYearEvents = Array(6).fill(EVENTS[0].id); },
    s => { s.stats.discipline = 5; },
    s => { s.parents[0].stats.relaxation = 5; },
    s => { s.aptitudes.discipline = 1; },
    s => { s.effects.push({ id: 'bad', name: 'Bad', description: '', years: 1, modifiers: { discipline: 1 } }); },
  ]) {
    const bad = copy(state); mutate(bad);
    assert.equal(validateSave(bad), false);
    assert.equal(migrateSave(bad), null);
  }
});

test('intelligence, stability, social focus, and athletic work strongly alter relevant risks', () => {
  const state = adult(1401);
  const chance = id => eventOdds(state).find(event => event.id === id).chance;
  state.stats.intelligence = 10; const cautious = chance('financial_scam');
  state.stats.intelligence = 1; assert.ok(chance('financial_scam') > cautious * 30);
  state.stats.stability = 10; const calm = chance('crisis');
  state.stats.stability = 1; assert.ok(chance('crisis') > calm * 30);
  state.focus.social = 0; const quiet = chance('friendship');
  state.focus.social = 5; assert.ok(chance('friendship') > quiet * 3);
  state.jobId = 'retail'; const shopInjury = chance('injury');
  assert.equal(chance('sports_sprain'), 0);
  state.jobId = 'athlete';
  assert.ok(chance('injury') > shopInjury * 4);
  assert.ok(chance('sports_sprain') > 0);
  state.age = 15; state.education = { status: 'school', years: 0 }; state.jobId = null;
  state.stats.intelligence = 1; const weakGrades = chance('good_grades');
  state.stats.intelligence = 10; assert.ok(chance('good_grades') > weakGrades * 20);
  assert.equal(chance('financial_scam'), 0);
  assert.ok(chance('peer_drinking') > 0);
  state.age = 18; assert.equal(chance('peer_drinking'), 0);
});

test('both peer-pressure choices have different visible stat consequences and persist', () => {
  const state = createGame({ seed: 1402 });
  while (state.age < 16) advanceYear(state);
  state.effects = [];
  for (const key of Object.keys(state.stats)) state.stats[key] = 6;
  state.pendingEvents = [{ eventId: 'peer_drinking', age: 16 }];
  state.lastYearEvents = ['peer_drinking'];
  const declined = copy(state);
  assert.equal(validateSave(state), true);
  assert.equal(resolveEventChoice(state, 'drink', 'peer_drinking').ok, true);
  assert.equal(state.stats.social, 7);
  assert.equal(state.stats.intelligence, 5);
  assert.equal(state.stats.health, 5.7);
  assert.match(state.history[0].text, /social 6 → 7; Your intelligence 6 → 5/);
  assert.equal(resolveEventChoice(declined, 'decline', 'peer_drinking').ok, true);
  assert.equal(declined.stats.stability, 6.5);
  assert.equal(declined.stats.social, 5.8);
  assert.equal(declined.stats.intelligence, 6);
  assert.deepEqual(migrateSave(state), state);
  assert.deepEqual(migrateSave(declined), declined);
});

test('college, employment, physical work, and children gate their own event contexts', () => {
  const state = adult(1404);
  const chance = id => eventOdds(state).find(event => event.id === id).chance;
  assert.equal(chance('college_homesick'), 0);
  assert.equal(chance('career_recognition'), 0);
  assert.equal(chance('unsafe_lift'), 0);
  assert.equal(chance('child_confides'), 0);
  state.education.status = 'college';
  assert.ok(chance('college_homesick') > 0);
  state.education.status = 'workforce';
  state.jobId = 'retail';
  assert.ok(chance('career_recognition') > 0);
  assert.equal(chance('unsafe_lift'), 0);
  state.jobId = 'builder'; assert.ok(chance('unsafe_lift') > 0);
  haveChild(state);
  assert.ok(chance('family_tradition') > 0);
  assert.equal(chance('child_confides'), 0);
  assert.equal(chance('child_thanks'), 0);
  state.children[0].age = 3; assert.ok(chance('child_thanks') > 0);
  assert.equal(chance('child_confides'), 0);
  state.children[0].age = 6; assert.ok(chance('child_confides') > 0);
  state.children[0].alive = false; assert.equal(chance('child_confides'), 0);
});

test('lifestyle consequences are temporary, bounded, and shared by dependent children', () => {
  const state = adult(1403); haveChild(state);
  advanceYear(state);
  state.effects = [];
  state.money = 775000; state.lifestyle = lifestyleFromResources(0, state.money);
  const baseline = state.lifestyle - 1; // One dependent child also lowers lifestyle.
  state.pendingEvents = [{ eventId: 'investment_pitch', age: state.age }];
  state.lastYearEvents = ['investment_pitch'];
  assert.equal(resolveEventChoice(state, 'accept', 'investment_pitch').ok, true);
  assert.equal(state.lifestyle, baseline - 1);
  assert.equal(state.children[0].lifestyle, state.lifestyle);
  assert.equal(state.effects.find(effect => effect.id === 'investment_pitch').years, 2);
  assert.equal(validateSave(state), true);
  const saved = migrateSave(state);
  assert.equal(saved.lifestyle, state.lifestyle);
  assert.equal(saved.effects.find(effect => effect.id === 'investment_pitch').lifestyle, -1);
  advanceYear(state); advanceYear(state);
  assert.equal(state.effects.some(effect => effect.id === 'investment_pitch'), false);
  assert.equal(state.children[0].lifestyle, state.lifestyle);
});

test('successive generations remain playable and valid without inheriting the old job or effects', () => {
  const state = adult(35);
  for (let generation = 1; generation <= 4; generation++) {
    while (state.age < 18) advanceYear(state);
    assert.equal(haveChild(state).ok, true);
    while (state.age < 65) advanceYear(state);
    assert.equal(succeed(state, state.children[0].id).ok, true);
    assert.equal(state.generation, generation + 1);
    assert.equal(validateSave(state), true);
  }
});

function datingLife(seed = 2100, options = {}) {
  const state = createGame({seed,...options});
  while(state.age<18) advanceYear(state);
  chooseEducation(state,'work');
  state.money=8_000_000;
  for(const {key} of SKILLS) state.stats[key]=8;
  state.stats.health=9; state.stats.stability=7;
  advanceYear(state);
  return state;
}

function coupledLife(seed = 2100, options = {}) {
  const state=datingLife(seed,options);
  for(let year=0;!state.partner&&year<10;year++) {
    for(const person of [...state.encounters]) {
      const result=respondToEncounter(state,person.id,'relationship');
      assert.equal(result.ok,true);
      if(result.accepted) break;
    }
    if(!state.partner) advanceYear(state);
  }
  assert.ok(state.partner,'fixture reaches a relationship through a real accepted offer');
  assert.equal(validateSave(state),true);
  return state;
}

test('adult encounters are yearly, bounded, adult-only, and survive saved reloads', () => {
  const child=createGame({seed:2101});
  while(child.age<17) { advanceYear(child); assert.deepEqual(child.encounters,[]); }
  advanceYear(child);
  assert.equal(child.age,18);
  const state=datingLife(2102);
  assert.ok(state.encounters.length>0&&state.encounters.length<=5);
  assert.equal(state.encounterYear,state.age);
  for(const person of state.encounters) {
    assert.ok(person.age>=18&&person.age<85);
    assert.equal(Object.keys(person.stats).length,7);
    assert.equal(Object.keys(person.aptitudes).length,5);
    assert.equal(person.gender,'female');
  }
  const restored=migrateSave(copy(state));
  assert.deepEqual(restored,state);
  const oldIds=state.encounters.map(person=>person.id);
  const before=state.rng;
  const person=state.encounters[0];
  assert.equal(respondToEncounter(state,person.id,'ignore').ok,true);
  assert.equal(state.rng,before,'ignoring does not reroll an invitation');
  assert.equal(respondToEncounter(state,person.id,'relationship').ok,false);
  advanceYear(state);
  assert.ok(state.encounters.every(person=>!oldIds.includes(person.id)));
  assert.equal(validateSave(state),true);
});

test('pursuit can succeed or be declined once, with partner bonuses and lifestyle costs', () => {
  const base=datingLife(2103);
  assert.ok(base.encounters.length);
  const target=base.encounters[0];
  const outcomes=new Set();
  for(let seed=1;seed<=100&&outcomes.size<2;seed++) {
    const state=copy(base); state.rng=seed;
    const stats=effectiveStats(state), lifestyle=state.lifestyle;
    const result=respondToEncounter(state,target.id,'relationship');
    assert.equal(result.ok,true); outcomes.add(result.accepted);
    assert.equal(respondToEncounter(state,target.id,'relationship').ok,false);
    if(result.accepted) {
      assert.ok(state.partner.relationship>=3&&state.partner.relationship<=7);
      assert.equal(state.partner.yearsTogether,0);
      assert.deepEqual(state.encounters,[]);
      assert.equal(effectiveStats(state).social,Math.min(10,Math.round((stats.social+.7)*100)/100));
      assert.equal(effectiveStats(state).stability,Math.min(10,Math.round((stats.stability+.6)*100)/100));
      assert.equal(state.lifestyle,Math.max(1,lifestyle-1));
      const after=copy(state); const repeated=proposeMarriage(state);
      assert.equal(repeated.ok,true);
      assert.equal(proposeMarriage(state).ok,false);
      assert.equal(endRelationship(after).ok,true);
      assert.equal(after.partner,null);
      assert.equal(after.lifestyle,lifestyle);
    } else assert.equal(state.partner,null);
    assert.equal(validateSave(state),true);
  }
  assert.deepEqual(outcomes,new Set([true,false]));
});

test('marriage proposals depend strongly on years together and are limited to one each year', () => {
  const base=coupledLife(2104);
  base.partner.relationship=5;
  const early=proposalChance(base);
  base.partner.yearsTogether=6;
  assert.ok(proposalChance(base)>=early+.41);
  base.partner.relationship=9;
  assert.ok(proposalChance(base)>early+.5);
  const outcomes=new Set();
  for(let seed=1;seed<=100&&outcomes.size<2;seed++) {
    const state=copy(base); state.rng=seed;
    const result=proposeMarriage(state);
    outcomes.add(result.accepted);
    assert.equal(result.ok,true);
    assert.equal(state.partner.lastProposalAge,state.age);
    const snapshot=copy(state);
    assert.equal(proposeMarriage(state).ok,false);
    assert.deepEqual(state,snapshot);
    assert.equal(state.partner.married,result.accepted);
    if(!result.accepted) {
      advanceYear(state);
      assert.equal(proposeMarriage(state).ok,true);
    }
    assert.equal(validateSave(state),true);
  }
  assert.equal(outcomes.size,2);
});

test('casual encounters are consensual rolls, consumed once, and never create a partner', () => {
  const base=datingLife(2105), target=base.encounters[0];
  const outcomes=new Set();
  for(let seed=1;seed<=100&&outcomes.size<2;seed++) {
    const state=copy(base); state.rng=seed;
    const before=state.stats.social;
    const result=respondToEncounter(state,target.id,'casual');
    assert.equal(result.ok,true); outcomes.add(result.accepted);
    assert.equal(state.partner,null);
    assert.equal(respondToEncounter(state,target.id,'casual').ok,false);
    assert.equal(state.stats.social,result.accepted?Math.min(10,Math.round((before+.25)*100)/100):before);
    assert.equal(validateSave(state),true);
  }
  assert.equal(outcomes.size,2);
});

test('marriage raises pregnancy chances and a saved pregnancy produces an inherited newborn next year', () => {
  const base=coupledLife(2106);
  base.partner.age=25; base.partner.stats.health=10;
  for(const {key} of SKILLS) { base.aptitudes[key]=-3; base.partner.aptitudes[key]=3; }
  const dating=pregnancyChance(base);
  base.partner.married=true;
  assert.ok(pregnancyChance(base)>dating*10);
  let pregnant;
  for(let seed=1;seed<=100;seed++) {
    const state=copy(base); state.rng=seed;
    advanceYear(state);
    if(state.pregnancy) { pregnant=state; break; }
  }
  assert.ok(pregnant,'married simulation can conceive');
  assert.equal(pregnant.pregnancy.dueAge,pregnant.age+1);
  assert.equal(pregnant.pregnancy.carrierId,pregnant.partner.id);
  const restored=migrateSave(copy(pregnant));
  assert.deepEqual(restored,pregnant);
  endRelationship(pregnant);
  assert.ok(pregnant.pregnancy,'breaking up does not erase an expected child');
  advanceYear(pregnant);
  const child=pregnant.children[0];
  assert.equal(pregnant.pregnancy,null);
  assert.equal(child.age,0); assert.equal(child.adopted,false); assert.ok(child.relationship >= 5 && child.relationship <= 10);
  assert.equal(child.lifestyle,pregnant.lifestyle);
  for(const {key} of SKILLS) {
    assert.ok(child.stats[key]>=1&&child.stats[key]<=10);
    assert.ok(child.aptitudes[key]>=-1&&child.aptitudes[key]<=1,'both parents affect inherited affinity');
  }
  assert.equal(validateSave(pregnant),true);
});

test('generic pregnancy roles also support a gestating player with a male partner', () => {
  const base=coupledLife(2107,{gender:'female'});
  assert.equal(base.canGestate,true); assert.equal(base.partner.gender,'male');
  assert.equal(base.partner.canGestate,false);
  base.partner.married=true;
  let state;
  for(let seed=1;seed<=100;seed++) {
    const candidate=copy(base); candidate.rng=seed; advanceYear(candidate);
    if(candidate.pregnancy) { state=candidate; break; }
  }
  assert.ok(state,'a gestating player can conceive');
  assert.equal(state.pregnancy.carrierId,state.id);
  advanceYear(state);
  assert.equal(state.children.length,1);
  assert.equal(validateSave(state),true);
});

test('family focus grows partner and child relationships; dependent children have visible household tradeoffs', () => {
  const base=coupledLife(2108);
  base.partner.canGestate=false; // Keep this comparison focused on care, not births.
  base.partner.relationship=5;
  const beforeSocial=effectiveStats(base).social, beforeLifestyle=base.lifestyle;
  haveChild(base);
  assert.equal(base.children[0].adopted,true);
  assert.equal(base.lifestyle,Math.max(1,beforeLifestyle-1));
  assert.equal(effectiveStats(base).social,Math.min(10,Math.round((beforeSocial+.2)*100)/100));
  const caring=copy(base),distant=copy(base);
  caring.focus={work:2,social:2,family:5,self:3};
  distant.focus={work:3,social:3,family:0,self:3};
  advanceMatchedQuietYears(caring, distant);
  assert.ok(caring.partner.relationship>distant.partner.relationship);
  assert.ok(caring.children[0].relationship>distant.children[0].relationship);
  assert.ok(caring.children[0].stats.intelligence>distant.children[0].stats.intelligence);
  assert.equal(caring.partner.yearsTogether,base.partner.yearsTogether+1);
});

test('family choice queues target the correct child and reject stale choices for a sibling', () => {
  const state=adult(2109);
  haveChild(state); advanceYear(state); haveChild(state);
  const event=EVENTS.find(event=>event.id==='household_child_school');
  state.children.forEach(child=>{ child.age=7; child.stats.intelligence=4; });
  const records=state.children.map(child=>({eventId:event.id,age:state.age,subjectType:'child',subjectId:child.id}));
  state.pendingEvents=records;
  state.lastYearEvents=records.map(record=>`${record.eventId}:${record.subjectId}`);
  assert.equal(validateSave(state),true);
  const saved=migrateSave(copy(state));
  assert.deepEqual(saved,state);
  const first=state.children[0],second=state.children[1];
  const before=copy(second.stats);
  assert.equal(pendingEventSubject(state,records[0]).id,first.id);
  assert.equal(resolveEventChoice(state,event.choices[0].id,event.id,first.id).ok,true);
  assert.deepEqual(second.stats,before,'the sibling does not receive the first child outcome');
  const afterFirst=copy(state);
  assert.equal(resolveEventChoice(state,event.choices[0].id,event.id,first.id).ok,false);
  assert.deepEqual(state,afterFirst);
  assert.equal(resolveEventChoice(state,event.choices[1].id,event.id,second.id).ok,true);
  assert.equal(state.pendingEvents.length,0);
  assert.equal(validateSave(state),true);
});

test('attractiveness has mean decline after thirty despite self focus or an appearance-based job', () => {
  const changes = [];
  for(let seed=1;seed<=30;seed++) {
    const state=adult(2200+seed);
    assert.ok(state.appearancePeakAge>=27&&state.appearancePeakAge<=33);
    state.age=state.appearancePeakAge; state.encounters=[];
    state.stats.attractiveness=8;
    state.focus={work:5,social:0,family:0,self:5};
    state.aptitudes.attractiveness=3;
    const job=JOBS.find(job=>job.id==='performer'); offerJob(state,job);
    state.jobId=job.id; state.effects=[];
    advanceYear(state);
    changes.push(state.stats.attractiveness - 8);
    assert.ok(state.stats.attractiveness <= 8.12 && state.stats.attractiveness >= 7.75);
  }
  assert.ok(changes.reduce((sum, value) => sum + value, 0) / changes.length < -.02);
});

test('v4 migration keeps unresolved choices and lifestyle-only effects without consuming randomness', () => {
  const previous=adult(2110); advanceYear(previous); previous.effects=[{id:'windfall',name:'A little good fortune',description:'Comfort.',years:2,modifiers:{},lifestyle:1,kind:'positive'}];
  previous.pendingEvents=[{eventId:'investment_pitch',age:previous.age}]; previous.lastYearEvents=['investment_pitch'];
  toLegacyCentimeters(previous);
  previous.version=4;
  for(const person of [previous,...previous.parents,...previous.children,...previous.siblings,...previous.lineage]) {
    delete person.gender; delete person.canGestate; delete person.attractedTo; delete person.appearancePeakAge;
  }
  delete previous.partner; delete previous.encounters; delete previous.encounterYear; delete previous.pregnancy;
  const snapshot=copy(previous),converted=migrateSave(previous);
  assert.ok(converted); assert.equal(validateSave(converted),true);
  for(const key of ['rng','nextId','age','name','history','education','jobOffers','effects','pendingEvents','lastYearEvents','stats','aptitudes']) assert.deepEqual(converted[key],previous[key]);
  assert.deepEqual(previous,snapshot);
  assert.equal(converted.partner,null); assert.deepEqual(converted.encounters,[]);
  const event=EVENTS.find(event=>event.id==='investment_pitch');
  assert.equal(resolveEventChoice(converted,event.choices[0].id,event.id).ok,true);
});

test('typed surnames are capitalized and carried by descendants of every gender', () => {
  assert.equal(normalizeSurname('  van   buren  '), 'Van buren');
  assert.equal(normalizeSurname("o'neal"), "O'neal");
  assert.equal(normalizeSurname('étoile'), 'Étoile');
  assert.equal(normalizeSurname(''), '');
  for (const surname of ['ß'+'a'.repeat(29), 'a'.repeat(29)+' z']) {
    const state=createGame({surname,seed:3110});
    assert.ok(state.familyName.length<=30);
    assert.equal(validateSave(state),true,'capitalization and truncation must retain valid surname bounds');
  }
  for (const gender of ['male', 'female', 'nonbinary']) {
    const state=createGame({surname:' van buren ',firstName:'Alex',gender,seed:3100});
    assert.equal(state.name,'Alex Van buren');
    assert.equal(state.familyName,'Van buren');
    for(const parent of state.parents) {
      assert.equal(parent.familyName,'Van buren');
      assert.ok(parent.name.endsWith(' Van buren'));
    }
    while(state.age<18) advanceYear(state);
    assert.equal(haveChild(state).ok,true);
    assert.equal(state.children[0].familyName,'Van buren');
    assert.ok(state.children[0].name.endsWith(' Van buren'));
    assert.equal(validateSave(state),true);
  }
});

test('retirement divides the entire estate equally and children take priority over siblings', () => {
  const state=adult(3101);
  while(state.age<61) advanceYear(state);
  for(let child=0;child<3;child++) { haveChild(state); advanceYear(state); }
  advanceYear(state);
  state.money=100003; state.lifestyle=4;
  const info=successionInfo(state);
  assert.equal(info.route,'children'); assert.equal(info.candidates.length,3);
  assert.equal(info.share,info.estate/3);
  assert.ok(Math.abs(info.share*3-info.estate)<1e-9);
  const chosen=copy(info.children[1]);
  const expectedOthers=info.children.filter(person=>person.id!==chosen.id).map(person=>({id:person.id,money:person.money+info.share}));
  assert.equal(succeed(state,chosen.id).ok,true);
  assert.equal(state.name,chosen.name); assert.equal(state.familyName,chosen.familyName);
  assert.deepEqual(state.stats,chosen.stats); assert.deepEqual(state.aptitudes,chosen.aptitudes);
  assert.equal(state.gender,chosen.gender); assert.equal(state.money,chosen.money+info.share);
  assert.deepEqual(state.siblings.map(person=>({id:person.id,money:person.money})),expectedOthers);
  assert.ok(state.lineage.at(-1).children.every(person=>person.inheritance===info.share));
  assert.equal(validateSave(state),true);
  while(state.age<18) advanceYear(state);
  haveChild(state);
  const snapshot=copy(state);
  state.age=65;
  assert.equal(successionInfo(state).route,'children');
  assert.equal(succeed(state,state.siblings[0].id).ok,false,'a sibling cannot bypass a surviving child');
  state.age=snapshot.age;
});

test('a sibling receives the legacy without becoming a child or duplicating other siblings assets', () => {
  const state=adult(3102);
  haveChild(state); advanceYear(state); haveChild(state); advanceYear(state); haveChild(state);
  while(state.age<65) advanceYear(state);
  succeed(state,state.children[0].id);
  while(state.age<65) advanceYear(state);
  const info=successionInfo(state);
  assert.equal(info.route,'siblings'); assert.equal(info.candidates.length,2);
  const chosen=copy(info.candidates[0]), parents=copy(state.parents);
  const untouched=copy(info.candidates[1]);
  const retiredId=state.id, familyName=state.familyName;
  assert.equal(succeed(state,chosen.id).ok,true);
  assert.equal(state.money,chosen.money+info.estate);
  assert.equal(state.familyName,familyName);
  assert.deepEqual(state.parents,parents,'a retired sibling is not the new players parent');
  assert.deepEqual(state.siblings,[untouched]);
  assert.ok(!state.siblings.some(person=>person.id===retiredId));
  assert.equal(state.lineage.at(-1).successor.route,'siblings');
  assert.equal(validateSave(state),true);
  while(state.age<65) advanceYear(state);
  assert.equal(succeed(state,state.siblings[0].id).ok,true);
  assert.equal(successionInfo(state).route,'beneficiary','retired chapters cannot be selected again');
  assert.equal(validateSave(state),true);
});

test('childless retirement offers a stable beneficiary with natural ratings and a different surname', () => {
  const state=createGame({surname:'Bennett',seed:3103});
  while(state.age<65) advanceYear(state);
  state.money=230000; state.lifestyle=5;
  const snapshot=copy(state), info=successionInfo(state);
  assert.equal(info.eligible,true); assert.equal(info.route,'beneficiary');
  assert.equal(info.candidates.length,1); assert.deepEqual(info.beneficiary,info.candidates[0]);
  assert.deepEqual(successionInfo(state),info); assert.deepEqual(state,snapshot);
  const kid=info.beneficiary;
  assert.notEqual(kid.familyName,state.familyName);
  assert.ok(kid.age>=6&&kid.age<=12);
  for(const key of [...SKILLS.map(skill=>skill.key),'health','stability']) assert.ok(kid.stats[key]>=1&&kid.stats[key]<=10);
  assert.ok(SKILLS.some(skill=>kid.stats[skill.key]>3), 'a beneficiary is no longer forced into low ratings');
  const restored=migrateSave(copy(state));
  assert.deepEqual(successionInfo(restored).beneficiary,kid);
  assert.equal(succeed(state,kid.id).ok,true);
  assert.equal(state.id,kid.id); assert.equal(state.familyName,kid.familyName); assert.equal(state.name,kid.name);
  assert.equal(state.money,info.estate); assert.deepEqual(state.parents,[]); assert.deepEqual(state.siblings,[]);
  assert.equal(state.lifestyle,lifestyleFromResources(0,info.estate));
  assert.deepEqual(state.stats,kid.stats); assert.deepEqual(state.education,{status:'school',years:0});
  assert.equal(validateSave(state),true);
});

test('retirement gates never mutate state and dead children fall through to the available route', () => {
  const state=adult(3104);
  const candidate=successionInfo(state).beneficiary;
  const snapshot=copy(state);
  assert.equal(succeed(state,candidate.id).ok,false);
  assert.deepEqual(state,snapshot);
  haveChild(state);
  while(state.age<65) advanceYear(state);
  state.children[0].alive=false;
  assert.equal(successionInfo(state).route,'beneficiary');
  const event=EVENTS.find(event=>!event.subjectType&&event.choices?.length&&event.minAge<=64&&(event.maxAge??85)>=64);
  state.pendingEvents=[{eventId:event.id,age:65}]; state.lastYearEvents=[event.id];
  const waiting=copy(state), fallback=successionInfo(state).beneficiary;
  assert.equal(successionInfo(state).eligible,false);
  assert.equal(succeed(state,fallback.id).ok,false); assert.deepEqual(state,waiting);
  resolveEventChoice(state,event.choices[0].id,event.id);
  assert.equal(succeed(state,fallback.id).ok,true);
  assert.equal(validateSave(state),true);
});

test('old childless endings become valid retirement choices without resetting the saved story', () => {
  const state=createGame({seed:3105});
  while(state.age<85) advanceYear(state);
  const previous=toLegacyCentimeters(copy(state)); previous.version=5; previous.ended=true; previous.needsSuccession=false;
  for (const parent of previous.parents) { parent.age = Math.min(85, parent.age); if (parent.age === 85) parent.alive = false; }
  for(const person of [previous,...previous.parents,...previous.children,...previous.siblings,...previous.lineage,...previous.encounters,previous.partner,previous.pregnancy?.otherParent].filter(Boolean)) { delete person.familyName; person.appearancePeakAge = 30; }
  const migrated=migrateSave(previous);
  assert.equal(validateSave(migrated),true); assert.equal(migrated.version,11);
  assert.equal(migrated.ended,false); assert.equal(migrated.needsSuccession,true);
  for(const key of ['id','name','age','rng','nextId','stats','aptitudes','history','money','education','jobOffers','effects','pendingEvents']) assert.deepEqual(migrated[key],previous[key]);
  const info=successionInfo(migrated);
  assert.equal(info.route,'beneficiary'); assert.equal(info.eligible,true);
  assert.equal(succeed(migrated,info.beneficiary.id).ok,true);
  assert.equal(validateSave(migrated),true);
});

test('v5 family migration preserves partnership, pregnancy, offers, and future surname inheritance', () => {
  const state=coupledLife(3106);
  state.partner.married=true;
  while(!state.pregnancy&&state.age<42) advanceYear(state);
  assert.ok(state.pregnancy);
  const previous=toLegacyCentimeters(copy(state)); previous.version=5;
  for(const person of [previous,...previous.parents,...previous.children,...previous.siblings,...previous.lineage,...previous.encounters,previous.partner,previous.pregnancy.otherParent]) { delete person.familyName; person.appearancePeakAge = 30; }
  const migrated=migrateSave(previous);
  assert.equal(validateSave(migrated),true);
  for(const key of ['rng','nextId','id','name','age','stats','education','jobOffers','history','pendingEvents']) assert.deepEqual(migrated[key],previous[key]);
  assert.equal(migrated.partner.id,previous.partner.id); assert.equal(migrated.partner.relationship,previous.partner.relationship);
  assert.equal(migrated.pregnancy.carrierId,previous.pregnancy.carrierId); assert.equal(migrated.pregnancy.dueAge,previous.pregnancy.dueAge);
  const familyName=migrated.familyName;
  advanceYear(migrated);
  assert.equal(migrated.children.at(-1).familyName,familyName);
  assert.ok(migrated.children.at(-1).name.endsWith(' '+familyName));
  assert.equal(validateSave(migrated),true);
});
