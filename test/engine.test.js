import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, JOBS, EVENTS, createGame, stage, advanceYear as advanceYearRaw, setBabyChoice, setFocus, effectiveStats, currentEffects, eventOdds, jobFit, canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed, lifestyleFromResources, householdLifestyle, validateSave, migrateSave, chooseEducation, needsEducationChoice, offeredJobs } from '../engine.js';

const copy = value => JSON.parse(JSON.stringify(value));
// Existing long-life scenarios choose work automatically at each adult handoff.
// Education tests call the actual action directly to exercise the choice gate.
const advanceYear = state => {
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  return advanceYearRaw(state);
};
const decision = (seed = 22) => { const s = createGame({ seed }); for (let i = 0; i < 18; i++) advanceYearRaw(s); return s; };
const adult = (seed = 22) => { const s = decision(seed); chooseEducation(s, 'work'); return s; };
const offerJob = (state, job) => {
  state.education = { status: job.requiresCollege ? 'graduate' : 'workforce', years: job.requiresCollege ? 4 : 0 };
  state.jobOffers = [...new Set(['retail', job.id, ...JOBS.filter(candidate => job.requiresCollege || !candidate.requiresCollege).map(candidate => candidate.id)])].slice(0, job.requiresCollege ? 15 : 10);
};
const v2Save = state => {
  const previous = copy(state);
  previous.version = 2;
  delete previous.education; delete previous.jobOffers;
  return previous;
};
const legacySave = state => {
  const legacy = copy(state);
  legacy.version = 1;
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

test('a new life starts at zero with complete, bounded inherited traits and parents', () => {
  const state = createGame({ name: 'Test Family', seed: 12 });
  assert.equal(state.age, 0); assert.equal(state.height, 50); assert.equal(state.parents.length, 2);
  assert.equal(stage(state), 'baby'); assert.equal(validateSave(state), true);
  assert.equal(JOBS.length, 100); assert.equal(EVENTS.length, 10);
  for (const skill of SKILLS) assert.ok(state.aptitudes[skill.key] >= -3 && state.aptitudes[skill.key] <= 3);
  assert.deepEqual(createGame({ seed: 12 }), createGame({ seed: 12 }));
});

test('all six adult skills exist at birth, start very low, and use their individual affinities', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const baby = createGame({ seed });
    for (const { key } of SKILLS) assert.ok(baby.stats[key] >= 1 && baby.stats[key] <= 1.5, `${key} at birth`);
    assert.equal(baby.version, 3);
    assert.ok(baby.stats.health >= 7);
    assert.ok(baby.stats.stability >= 8);
    assert.deepEqual(Object.keys(baby.stats).sort(), Object.keys(adult(seed).stats).sort());
  }
  const fast = createGame({ seed: 93 }), slow = copy(fast);
  for (const { key } of SKILLS) { fast.aptitudes[key] = 3; slow.aptitudes[key] = -3; }
  advanceYear(fast); advanceYear(slow);
  for (const { key } of SKILLS) assert.ok(fast.stats[key] > slow.stats[key], `${key} responds to affinity`);
  const parent = adult(90); haveChild(parent);
  for (const { key } of SKILLS) assert.ok(parent.children[0].stats[key] >= 1 && parent.children[0].stats[key] <= 1.5);
});

test('childhood shares the parents household and changes to independent lifestyle exactly at18', () => {
  const state = createGame({ seed: 89 });
  assert.ok(state.lifestyle >= 2 && state.lifestyle <= 8);
  assert.equal(state.lifestyle, state.parents[0].lifestyle);
  assert.equal(state.lifestyle, state.parents[1].lifestyle);
  state.parents.forEach(parent => { parent.lifestyle = 8; });
  while (state.age < 17) {
    advanceYear(state);
    assert.equal(state.lifestyle, 8);
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

test('one click advances exactly one year, infancy unlocks focus at three and height stops at 18', () => {
  const state = createGame({ seed: 1 });
  assert.equal(setFocus(state, 'work', 0).ok, false);
  for (let age = 1; age <= 19; age++) { assert.equal(advanceYear(state).ok, true); assert.equal(state.age, age); }
  assert.equal(state.height, state.adultHeight); assert.equal(stage(state), 'adult');
  assert.equal(setBabyChoice(state, 'cry').ok, false);
});

test('crying improves development more but stresses both parents', () => {
  const cry = createGame({ seed: 3 }), quiet = copy(cry);
  setBabyChoice(cry, 'cry'); setBabyChoice(quiet, 'quiet');
  advanceYear(cry); advanceYear(quiet);
  for (const skill of SKILLS) assert.ok(cry.stats[skill.key] > quiet.stats[skill.key]);
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
  assert.ok(eventOdds(state).reduce((n, event) => n + event.chance, 0) <= .72000001);
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
  state.effects.push({ id: 'test', name: 'Test', description: '', years: 1, modifiers: { strength: 2 } });
  assert.equal(effectiveStats(state).strength, Math.round((state.stats.strength + 2) * 100) / 100);
  advanceYear(state);
  assert.equal(currentEffects(state).some(effect => effect.id === 'test'), false);
  assert.ok(state.stats.strength < 4);
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
  const intelligence = state.stats.intelligence;
  assert.equal(chooseEducation(state, 'college').ok, true);
  assert.deepEqual(state.education, { status: 'college', years: 0 });
  assert.deepEqual(state.jobOffers, []);
  assert.deepEqual(offeredJobs(state), []);
  assert.equal(takeJob(state, 'retail').ok, false);
  assert.equal(chooseEducation(state, 'work').ok, false);
  for (let year = 1; year <= 4; year++) {
    assert.equal(advanceYearRaw(state).ok, true);
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
    for (const old of [v2Save(state), legacySave(state)]) {
      const snapshot = copy(old);
      const upgraded = migrateSave(old);
      assert.equal(validateSave(upgraded), true);
      assert.equal(upgraded.version, 3);
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

test('succession resets education for young and adult heirs and an ended life still takes precedence', () => {
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
  assert.match(advanceYearRaw(ended).reason, /life has ended/);
});

test('family focus improves children, and births are limited to one per year', () => {
  const caring = adult(9);
  assert.equal(haveChild(caring).ok, true); assert.equal(haveChild(caring).ok, false);
  const distant = copy(caring);
  caring.focus = { work: 2, social: 2, family: 5, self: 3 };
  distant.focus = { work: 4, social: 4, family: 0, self: 4 };
  advanceYear(caring); advanceYear(distant);
  assert.equal(caring.children[0].age, 1);
  for (const skill of SKILLS) assert.ok(caring.children[0].stats[skill.key] > distant.children[0].stats[skill.key]);
  assert.ok(caring.children[0].stats.stability >= distant.children[0].stats.stability);
  assert.equal(haveChild(caring).ok, true);
  assert.equal(caring.children[0].adopted, false);
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
  assert.equal(state.children[0].adopted, false);
  assert.equal(validateSave(state), true);
});

test('parenthood begins at 18, changes to adoption after 60, and remains capped at six', () => {
  const state = createGame({ seed: 95 });
  assert.equal(haveChild(state).ok, false);
  state.age = 60; assert.equal(haveChild(state).ok, true); assert.equal(state.children[0].adopted, false);
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

test('age 85 ends a childless life and pauses a parent for mandatory succession', () => {
  const childless = createGame({ seed: 16 });
  for (let i = 0; i < 85; i++) advanceYear(childless);
  assert.equal(childless.ended, true); assert.equal(advanceYear(childless).ok, false); assert.equal(childless.age, 85);
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
    s => { s.siblings[0].adultHeight = null; },
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

test('long simulations retain bounds, have quiet years and never select more than one random event per year', () => {
  let quiet = 0, events = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const state = createGame({ seed });
    for (let year = 0; year < 85; year++) {
      const result = advanceYear(state);
      if (result.eventId === null) quiet += 1; else { events += 1; assert.ok(EVENTS.some(event => event.id === result.eventId)); }
      assert.equal(validateSave(state), true, `invalid seed ${seed}, age ${state.age}`);
      for (const value of Object.values(effectiveStats(state))) assert.ok(value >= 1 && value <= 10);
    }
  }
  assert.ok(quiet > events);
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
