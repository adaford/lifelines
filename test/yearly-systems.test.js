import test from 'node:test';
import assert from 'node:assert/strict';
import { toLegacyCentimeters, neutralWellbeingAptitudes } from './helpers/legacy-height.js';
import {
  EVENTS, createGame, advanceYear, annualForecast, dismissYearSummary, setCryLevel,
  effectiveStats, mortalityOdds, haveChild, successionInfo, succeed, validateSave,
  migrateSave, needsEducationChoice, chooseEducation, resolveEventChoice,
} from '../engine.js';

const clone = value => structuredClone(value);
const survives = { mortalityRandom: () => 1 };
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, pending.eventId, pending.subjectId || '').ok, true);
  }
}
function survivorAt(age, seed = 41, gender = 'male') {
  const state = createGame({ seed, surname: 'River', gender });
  while (state.age < age) {
    finishChoices(state);
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state, survives).ok, true);
  }
  finishChoices(state);
  if (needsEducationChoice(state)) chooseEducation(state, 'work');
  return state;
}
function actor(state, id, age, gender = 'female') {
  return { id, name: `${id} River`, familyName: 'River', age, stats: clone(state.stats),
    aptitudes: clone(state.aptitudes), height: 66.93, adultHeight: 66.93, money: 0,
    lifestyle: state.lifestyle, alive: true, relationship: 5, gender,
    canGestate: gender === 'female', attractedTo: [gender === 'female' ? 'male' : 'female'],
    appearancePeakAge: 30 };
}
function household(seed = 41) {
  const state = survivorAt(25, seed);
  assert.equal(haveChild(state).ok, true);
  state.siblings.push(actor(state, 'sibling', 23));
  state.partner = { ...actor(state, 'partner', 25), married: true, yearsTogether: 2, lastProposalAge: -1 };
  state.encounters = [];
  assert.equal(validateSave(state), true);
  return state;
}
function deathOf(state, id) {
  const people = [state, ...state.parents, ...state.children, ...state.siblings, state.partner].filter(p => p && p.alive !== false);
  if (state.pregnancy?.otherParent.alive && !people.some(p => p.id === state.pregnancy.otherParent.id)) people.push(state.pregnancy.otherParent);
  let draws = 0;
  return {
    mortalityRandom: () => {
      assert.ok(draws < people.length, 'one draw per living individual');
      return people[draws++].id === id ? 0 : 1;
    },
    draws: () => draws,
    expectedDraws: people.length,
  };
}
function expectPregnancy(state, otherParent, carrierId) {
  const carrier = carrierId === state.id ? state : otherParent;
  state.pregnancy = { otherParent: clone(otherParent), carrierId, carrierName: carrier.name,
    startedAge: state.age, dueAge: state.age + 1, casual: !state.partner };
  assert.equal(validateSave(state), true, 'pregnancy fixture must be a valid saved life');
}

test('crying below three lowers parent relationships, three is neutral, and higher levels raise them', () => {
  const baby = createGame({ seed: 18 });
  baby.parents.forEach(parent => { parent.stats.stability = 7; parent.relationship = 5; });
  let previous;
  for (let level = 1; level <= 5; level++) {
    const state = clone(baby);
    assert.equal(setCryLevel(state, level).ok, true);
    const preview = annualForecast(state);
    assert.ok(preview.parents.every(parent => Math.sign(parent.relationship.change) === Math.sign(level - 3)));
    if (previous) {
      assert.ok(preview.stats.intelligence.change > previous.stats.intelligence.change);
      assert.ok(preview.parents[0].relationship.change > previous.parents[0].relationship.change);
      assert.ok(preview.parents[0].stability.change < previous.parents[0].stability.change);
    }
    previous = preview;
    assert.equal(validateSave(state), true);
  }
  for (const level of [0, 6, -1, 1.5, '3', NaN]) {
    const before = clone(baby);
    assert.equal(setCryLevel(baby, level).ok, false);
    assert.deepEqual(baby, before);
  }
  const child = survivorAt(3);
  assert.equal(setCryLevel(child, 3).ok, false);
});

test('cry level three has no routine relationship change even with yearly variation', () => {
  let checked = 0;
  for (let seed = 1; seed <= 180; seed++) {
    const state = createGame({ seed });
    setCryLevel(state, 3);
    state.parents.forEach(parent => { parent.relationship = 7; });
    advanceYear(state, { ...survives, growthRandom: () => 3, parentCareerRandom: () => 1 });
    if (state.lastYearEvents.length) continue;
    assert.ok(state.parents.every(parent => parent.relationship === 7));
    checked++;
  }
  assert.ok(checked > 20);
});

test('crying respects stat and relationship limits and never changes deceased parents', () => {
  const state = createGame({ seed: 31 });
  state.stats.intelligence = 9.99;
  state.aptitudes.intelligence = 3;
  state.parents[0].relationship = 9.99;
  state.parents[0].stats.stability = 1;
  state.parents[1].alive = false;
  const deceased = clone(state.parents[1]);
  setCryLevel(state, 5);
  const preview = annualForecast(state);
  assert.ok(preview.stats.intelligence.after >= 1 && preview.stats.intelligence.after <= 10);
  assert.equal(preview.parents[0].relationship.after, 10);
  assert.equal(preview.parents[0].stability.after, 1);
  assert.equal(preview.parents[1].relationship.change, 0);
  assert.equal(preview.parents[1].stability.change, 0);
  advanceYear(state, { ...survives, growthRandom: () => 3 });
  assert.equal(state.stats.intelligence, 10, 'a positive yearly fluctuation stops at the rating ceiling');
  assert.deepEqual(state.parents[1], deceased);
});

test('annual forecasts are pure, include expiring effects, and match mean growth in quiet years', () => {
  let checked = false;
  for (let seed = 1; seed <= 50 && !checked; seed++) {
    const state = createGame({ seed });
    state.effects = [{ id: 'baby_cold', name: 'A cold', description: 'Recovering', years: 1, modifiers: { health: -.6 }, kind: 'negative' }];
    const withoutCold = clone(state);
    withoutCold.effects = [];
    const routine = annualForecast(withoutCold);
    const before = clone(state);
    const preview = annualForecast(state);
    assert.deepEqual(annualForecast(state), preview);
    assert.deepEqual(state, before, 'preview must not consume RNG or mutate any saved state');
    assert.equal(preview.stats.health.after, routine.stats.health.after, 'the expired cold no longer changes final health');
    assert.ok(Math.abs(preview.stats.health.change - routine.stats.health.change - .6) < .001, 'recovery is added to routine wellbeing drift');
    advanceYear(state, { ...survives, growthRandom: () => 0, parentCareerRandom: () => 1 });
    if (state.lastYearEvents.length) continue;
    assert.deepEqual(state.yearSummary.stats, preview.stats);
    assert.deepEqual(state.yearSummary.parents, preview.parents);
    assert.deepEqual(state.yearSummary.lifestyle, preview.lifestyle);
    for (const [key, change] of Object.entries(preview.stats)) assert.equal(effectiveStats(state)[key], change.after);
    checked = true;
  }
  assert.equal(checked, true, 'at least one deterministic quiet year was checked');
});

test('year summaries survive reload, can be dismissed, and reopen only after the next year', () => {
  let state = createGame({ seed: 23 });
  setCryLevel(state, 2);
  advanceYear(state, survives);
  assert.equal(state.yearSummary.fromAge, 0);
  assert.equal(state.yearSummary.toAge, 1);
  assert.equal(state.yearSummary.dismissed, false);
  assert.ok(state.yearSummary.events.length > 0);
  assert.deepEqual(state.yearSummary.decisions, { cryLevel: 2 });
  assert.equal(validateSave(state), true);
  state = migrateSave(JSON.parse(JSON.stringify(state)));
  assert.equal(state.yearSummary.dismissed, false);
  assert.equal(dismissYearSummary(state).ok, true);
  assert.equal(migrateSave(JSON.parse(JSON.stringify(state))).yearSummary.dismissed, true);
  finishChoices(state);
  advanceYear(state, survives);
  assert.equal(state.yearSummary.dismissed, false);
  assert.equal(state.yearSummary.toAge, 2);
});

test('year reviews retain the completed year decisions across age and education boundaries', () => {
  const baby = survivorAt(1, 405);
  setCryLevel(baby, 4);
  advanceYear(baby, survives);
  assert.equal(baby.age, 2);
  assert.deepEqual(baby.yearSummary.decisions, { cryLevel: 4 });
  finishChoices(baby);
  const focus = { work: 2, social: 4, family: 4, self: 1, creative: 1 };
  baby.focus = clone(focus);
  advanceYear(baby, survives);
  baby.focus.self = 0;
  assert.deepEqual(baby.yearSummary.decisions, { focus, workLabel: 'Play' });
  assert.deepEqual(migrateSave(clone(baby)).yearSummary.decisions, baby.yearSummary.decisions);
  const older = clone(baby);
  delete older.yearSummary.decisions;
  assert.ok(migrateSave(older), 'older reviews still load without inventing choices');

  const student = survivorAt(17, 406);
  const schoolFocus = clone(student.focus);
  advanceYear(student, survives);
  assert.deepEqual(student.yearSummary.decisions, { focus: schoolFocus, workLabel: 'School' });
  finishChoices(student);
  assert.equal(chooseEducation(student, 'college').ok, true);
  while (student.age < 22) { advanceYear(student, survives); finishChoices(student); }
  assert.equal(student.education.status, 'graduate');
  assert.equal(student.yearSummary.decisions.workLabel, 'College');
});

test('malformed saved year decisions are rejected without changing the original save', () => {
  const baby = survivorAt(1, 408);
  for (const decisions of [null, [], { cryLevel: 0 }, { cryLevel: 6 }, { cryLevel: 2.5 }, { focus: {} }]) {
    const bad = clone(baby);
    bad.yearSummary.decisions = decisions;
    assert.equal(migrateSave(bad), null);
  }
  const child = survivorAt(4, 409);
  for (const decisions of [
    { cryLevel: 3 },
    { focus: { work: 5, social: 5, family: 5, self: 5 }, workLabel: 'School' },
    { focus: { work: 3, social: 3, family: 3, self: 3 }, workLabel: '<script>' },
    { focus: { work: 3, social: 3, family: 3 }, workLabel: 'School' },
  ]) {
    const bad = clone(child);
    bad.yearSummary.decisions = decisions;
    assert.equal(migrateSave(bad), null);
  }
  assert.equal(validateSave(baby), true);
  assert.equal(validateSave(child), true);
});

test('v6 saves gain cry level and parent bonds without rerolling progress or queued decisions', () => {
  const legacy = toLegacyCentimeters(survivorAt(8, 70));
  legacy.version = 6;
  legacy.effects.forEach(effect => { delete effect.focusLimits; });
  legacy.adultHeight ??= 170;
  for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, legacy.partner, ...legacy.encounters, legacy.pregnancy?.otherParent].filter(Boolean)) person.appearancePeakAge = 30;
  legacy.babyChoice = 'cry';
  delete legacy.cryLevel; delete legacy.alive; delete legacy.death; delete legacy.yearSummary;
  legacy.parents.forEach(parent => { delete parent.relationship; });
  legacy.pendingEvents = [{ eventId: 'school_play', age: legacy.age }];
  legacy.lastYearEvents = ['school_play'];
  const before = clone(legacy);
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, 14);
  assert.equal(migrated.cryLevel, 5);
  assert.equal(migrated.alive, true);
  assert.equal(migrated.yearSummary, null);
  assert.ok(migrated.parents.every(parent => parent.relationship === 5));
  for (const key of ['id', 'rng', 'seed', 'age', 'nextId', 'name', 'stats', 'aptitudes', 'history', 'pendingEvents', 'lastYearEvents', 'education', 'jobOffers']) assert.deepEqual(migrated[key], neutralWellbeingAptitudes(structuredClone(before))[key], key);
  assert.deepEqual(legacy, before, 'migration must leave the imported object untouched');
  finishChoices(migrated);
  assert.equal(validateSave(migrated), true);
  const quiet = { ...before, babyChoice: 'quiet' };
  assert.equal(migrateSave(quiet).cryLevel, 1);
});

test('an infant death opens a playable successor and remains valid across saves', () => {
  const state = createGame({ seed: 12 });
  const mortality = deathOf(state, state.id);
  assert.equal(advanceYear(state, mortality).ok, true);
  assert.equal(state.alive, false);
  assert.equal(state.death.cause, 'disease');
  assert.equal(state.needsSuccession, true);
  assert.equal(state.pendingEvents.length, 0);
  assert.equal(advanceYear(state, survives).ok, false);
  assert.equal(validateSave(state), true);
  const loaded = migrateSave(JSON.parse(JSON.stringify(state)));
  const info = successionInfo(loaded);
  assert.equal(info.eligible, true);
  assert.equal(info.route, 'beneficiary');
  assert.equal(succeed(loaded, info.candidates[0].id).ok, true);
  assert.equal(loaded.generation, 2);
  assert.equal(loaded.alive, true);
  assert.equal(loaded.lineage[0].alive, false);
  assert.equal(loaded.lineage[0].death.cause, 'disease');
  assert.equal(validateSave(loaded), true);
});

test('parents, children, siblings and partners each have risks and die only once', () => {
  for (const role of ['parent', 'child', 'sibling', 'partner']) {
    const state = household();
    const target = role === 'parent' ? state.parents[0] : role === 'child' ? state.children[0] : role === 'sibling' ? state.siblings[0] : state.partner;
    target.stats.health = 5;
    const odds = mortalityOdds(state);
    assert.ok(odds.find(row => row.id === target.id)?.total > 0, role);
    const oldHealth = target.stats.health;
    target.stats.health = 1;
    assert.ok(mortalityOdds(state).find(row => row.id === target.id).disease > odds.find(row => row.id === target.id).disease);
    target.stats.health = oldHealth;
    const mortality = deathOf(state, target.id);
    assert.equal(advanceYear(state, mortality).ok, true);
    assert.equal(mortality.draws(), mortality.expectedDraws);
    assert.equal(target.alive, false, role);
    assert.equal(state.alive, true);
    assert.ok(state.yearSummary.events.some(event => event.text.includes(`${target.name} dies`)));
    assert.equal(mortalityOdds(state).some(row => row.id === target.id), false);
    assert.equal(validateSave(state), true, role);
    const ageAtDeath = target.age;
    const deathCount = state.history.filter(event => event.text.includes(`${target.name} dies`)).length;
    finishChoices(state);
    advanceYear(state, survives);
    assert.equal(target.age, ageAtDeath);
    assert.equal(state.history.filter(event => event.text.includes(`${target.name} dies`)).length, deathCount);
    assert.equal(validateSave(state), true, `${role} subsequent year`);
  }
});

test('family members can survive past 85 without forced mortality', () => {
  const state = survivorAt(50);
  state.parents[0].age = 85;
  const parent = state.parents[0];
  advanceYear(state, survives);
  assert.equal(parent.alive, true);
  assert.equal(parent.age, 86);
  assert.equal(validateSave(state), true);
});

test('gestating partner death ends pregnancy, while a surviving carrier delivers after the other parent dies', () => {
  for (const playerCarries of [false, true]) {
    const state = survivorAt(25, 97, playerCarries ? 'female' : 'male');
    state.partner = { ...actor(state, 'spouse', 25, playerCarries ? 'male' : 'female'), married: true, yearsTogether: 3, lastProposalAge: -1 };
    state.encounters = [];
    expectPregnancy(state, state.partner, playerCarries ? state.id : state.partner.id);
    const mortality = deathOf(state, state.partner.id);
    advanceYear(state, mortality);
    assert.equal(mortality.draws(), mortality.expectedDraws, 'pregnancy snapshot must not double-roll the partner');
    assert.equal(state.partner.alive, false);
    assert.equal(state.pregnancy, null);
    assert.equal(state.children.length, playerCarries ? 1 : 0);
    assert.equal(validateSave(state), true);
  }
});

test('external pregnancy carriers roll once and player death cannot strand succession behind pregnancy', () => {
  const external = survivorAt(25, 118);
  external.partner = null;
  const other = actor(external, 'coparent', 25, 'female');
  expectPregnancy(external, other, other.id);
  advanceYear(external, deathOf(external, other.id));
  assert.equal(external.pregnancy, null);
  assert.equal(external.children.length, 0);
  assert.equal(validateSave(external), true);
  for (const playerCarries of [false, true]) {
    const state = survivorAt(25, 95, playerCarries ? 'female' : 'male');
    state.partner = { ...actor(state, 'spouse', 25, playerCarries ? 'male' : 'female'), married: true, yearsTogether: 3, lastProposalAge: -1 };
    state.encounters = [];
    expectPregnancy(state, state.partner, playerCarries ? state.id : state.partner.id);
    advanceYear(state, deathOf(state, state.id));
    assert.equal(state.alive, false);
    assert.equal(state.pregnancy, null);
    assert.equal(state.children.length, playerCarries ? 0 : 1);
    assert.equal(successionInfo(state).eligible, true);
    assert.equal(validateSave(state), true);
  }
});

test('an event choice rolled for someone who dies that year is removed', () => {
  const original = household();
  let exercised = false;
  for (let rng = 1; rng <= 500 && !exercised; rng++) {
    const seedState = clone(original);
    seedState.rng = rng;
    const control = clone(seedState);
    advanceYear(control, survives);
    const targetChoice = control.pendingEvents.find(event => event.subjectId);
    if (!targetChoice) continue;
    advanceYear(seedState, deathOf(seedState, targetChoice.subjectId));
    assert.equal(seedState.pendingEvents.some(event => event.subjectId === targetChoice.subjectId), false);
    assert.equal(seedState.lastYearEvents.includes(`${targetChoice.eventId}:${targetChoice.subjectId}`), false);
    finishChoices(seedState);
    assert.equal(validateSave(seedState), true);
    exercised = true;
  }
  assert.equal(exercised, true, 'a real seeded family-choice roll was exercised');
});

test('a child keeps their recorded surviving co-parent after an early-death handoff', () => {
  const state = survivorAt(25, 157);
  state.partner = { ...actor(state, 'coparent', 25), married: true, yearsTogether: 3, lastProposalAge: -1 };
  state.encounters = [];
  expectPregnancy(state, state.partner, state.partner.id);
  advanceYear(state, survives);
  finishChoices(state);
  assert.equal(state.children.length, 1);
  const child = state.children[0];
  assert.ok(child.parentIds.includes(state.id));
  assert.ok(child.parentIds.includes(state.partner.id));
  const deceasedId = state.id;
  advanceYear(state, deathOf(state, deceasedId));
  const survivingParent = clone(state.partner);
  assert.equal(succeed(state, child.id).ok, true);
  assert.equal(state.parents.length, 2);
  assert.equal(state.parents.find(parent => parent.id === deceasedId).alive, false);
  const retainedParent = state.parents.find(parent => parent.id === survivingParent.id);
  assert.ok(retainedParent);
  assert.equal(retainedParent.alive, true);
  assert.deepEqual(retainedParent.stats, survivingParent.stats);
  assert.equal(validateSave(state), true);
  advanceYear(state, survives);
  assert.equal(retainedParent.age, survivingParent.age + 1);
  assert.equal(validateSave(state), true);
});

test('succession does not infer unrecorded co-parentage from a current partner', () => {
  const state = household(194);
  const child = state.children[0];
  delete child.parentIds;
  const partnerId = state.partner.id;
  advanceYear(state, deathOf(state, state.id));
  assert.equal(succeed(state, child.id).ok, true);
  assert.equal(state.parents.some(parent => parent.id === partnerId), false);
  assert.equal(state.parents.length, 1);
  assert.equal(validateSave(state), true);
});

test('seeded mortal lives preserve valid saves through deaths, aging and succession', () => {
  let deaths = 0;
  let familyDeaths = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const state = createGame({ seed });
    while (!state.needsSuccession && state.age < 85) {
      finishChoices(state);
      if (needsEducationChoice(state)) chooseEducation(state, 'work');
      assert.equal(advanceYear(state).ok, true);
      assert.equal(validateSave(state), true, `seed ${seed}, age ${state.age}`);
      finishChoices(state);
      assert.equal(validateSave(state), true, `resolved seed ${seed}, age ${state.age}`);
    }
    if (!state.alive) deaths++;
    familyDeaths += state.parents.filter(parent => parent.alive === false).length;
    const loaded = migrateSave(JSON.parse(JSON.stringify(state)));
    assert.ok(loaded);
    const info = successionInfo(loaded);
    assert.equal(info.eligible, true);
    assert.equal(succeed(loaded, info.candidates[0].id).ok, true);
    assert.equal(validateSave(loaded), true);
  }
  assert.ok(deaths > 10 && deaths < 95, `${deaths} player deaths before retirement`);
  assert.ok(familyDeaths > 50, `${familyDeaths} parent deaths across long lives`);
});
