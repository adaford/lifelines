import test from 'node:test';
import assert from 'node:assert/strict';
import { toLegacyCentimeters, neutralWellbeingAptitudes } from './helpers/legacy-height.js';
import {
  createGame, advanceYear, annualForecast, householdLifestyle,
  validateSave, migrateSave, needsEducationChoice, chooseEducation,
  haveChild, succeed,
} from '../engine.js';

const copy = value => structuredClone(value);
const meanYear = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const people = state => [state, ...state.parents, ...state.children, ...state.siblings, ...state.lineage, state.partner, ...state.encounters, state.pregnancy?.otherParent].filter(Boolean);

// Find a reproducible ordinary-event-free year without changing the event
// catalog. Discrete parent career events remain controlled independently.
function quietYear(state, options = {}) {
  const originalRng = state.rng;
  for (let attempt = 0; attempt < 200; attempt++) {
    const next = copy(state);
    next.rng = (originalRng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(next, { ...meanYear, ...options }).ok, true);
    if (next.lastYearEvents.length) continue;
    Object.assign(state, next);
    return;
  }
  assert.fail('could not find a quiet year for the annual dynamics check');
}

function legacyV8(state) {
  const old = toLegacyCentimeters(copy(state));
  old.version = 8;
  for (const person of people(old)) {
    if (person.adultHeight === null) person.adultHeight = 170;
    delete person.growthFactor;
    delete person.career;
  }
  return old;
}

test('new families use distinct Mom/Dad names from separate gendered name pools', () => {
  const moms = new Set(), dads = new Set();
  for (let seed = 1; seed <= 500; seed++) {
    const state = createGame({ seed, surname: 'Family' });
    const mom = state.parents.find(parent => parent.parentRole === 'mom');
    const dad = state.parents.find(parent => parent.parentRole === 'dad');
    assert.equal(state.gender, 'male');
    assert.equal(mom.gender, 'female');
    assert.equal(dad.gender, 'male');
    assert.notEqual(mom.name, dad.name);
    moms.add(mom.name); dads.add(dad.name);
    assert.equal(validateSave(state), true, `seed ${seed}`);
  }
  assert.ok(moms.size >= 5 && dads.size >= 5, 'both parents retain name variety');
  assert.deepEqual([...moms].filter(name => dads.has(name)), [], 'new Mom and Dad names use separate pools');
});

test('v8 migration adds career and growth state without rerolling existing lives', () => {
  const legacy = legacyV8(createGame({ seed: 410, surname: 'Migration' }));
  legacy.age = 5;
  legacy.height = 106.2;
  legacy.growthAnchor = { age: 5, height: 106.2 };
  legacy.parents[0].name = 'Robin Migration';
  legacy.parents[1].name = 'Avery Migration';
  legacy.parents[0].relationship = 6.3;
  legacy.parents[1].relationship = 9.1;
  const before = copy(legacy);
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, 13);
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(legacy, before, 'migration does not mutate the imported object');
  for (const key of ['rng', 'seed', 'nextId', 'age', 'maturityAge', 'stats', 'pendingEvents', 'history', 'yearSummary', 'lifestyle']) {
    assert.deepEqual(migrated[key], before[key], key);
  }
  for (const key of ['height', 'birthHeight']) assert.equal(migrated[key], Math.round(before[key] / 2.54 * 100) / 100);
  assert.equal(migrated.adultHeight, null, 'the obsolete childhood endpoint is removed');
  for (let index = 0; index < migrated.parents.length; index++) {
    const parent = migrated.parents[index], old = before.parents[index];
    for (const key of ['id', 'name', 'gender', 'stats', 'relationship', 'lifestyle']) assert.deepEqual(parent[key], old[key], key);
    assert.equal(parent.height, Math.round(old.height / 2.54 * 100) / 100);
    assert.equal(parent.career.progress, old.lifestyle);
    assert.ok(Number.isInteger(parent.career.focus) && parent.career.focus >= 0 && parent.career.focus <= 5);
  }
  assert.ok(people(migrated).every(person => Number.isFinite(person.growthFactor) && person.growthFactor > 0));
  assert.deepEqual(migrateSave(legacy), migrated, 'upgrading the same save never rerolls careers');
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(migrated))), migrated, 'schema 10 round-trips unchanged');
});

test('v8 duplicate parent names are repaired deterministically while relationships survive', () => {
  const legacy = legacyV8(createGame({ seed: 433, surname: 'Duplicate' }));
  legacy.parents.forEach(parent => { parent.name = 'Alex Duplicate'; });
  const before = copy(legacy);
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.notEqual(migrated.parents[0].name, migrated.parents[1].name);
  assert.equal(migrated.rng, legacy.rng);
  assert.deepEqual(migrated.parents.map(parent => parent.relationship), legacy.parents.map(parent => parent.relationship));
  assert.deepEqual(migrated.parents.map(parent => parent.gender), legacy.parents.map(parent => parent.gender));
  assert.deepEqual(migrateSave(legacy), migrated);
  assert.deepEqual(legacy, before);
});

test('v8 mixed parent lifestyles retain the recorded child household support after migration', () => {
  const legacy = legacyV8(createGame({ seed: 440 }));
  legacy.parents[0].lifestyle = 2;
  legacy.parents[1].lifestyle = 8;
  legacy.lifestyle = 2;
  const state = migrateSave(legacy);
  assert.ok(state);
  assert.equal(validateSave(state), true);
  assert.equal(state.lifestyle, 2);
  assert.ok(state.parents.every(parent => parent.career.progress === 2));
  const forecast = annualForecast(state);
  assert.equal(forecast.lifestyle.before, 2);
  assert.ok(forecast.lifestyle.after > 2 && forecast.lifestyle.after < 2.25, 'only normal career progress changes the migrated household');
  quietYear(state);
  assert.equal(state.lifestyle, forecast.lifestyle.after);
  assert.ok(state.parents.every(parent => parent.lifestyle === state.lifestyle));
});

test('attractiveness has small positive and negative annual variation with no juvenile mean drift', () => {
  const original = createGame({ seed: 502 });
  original.stats.attractiveness = 5;
  const before = copy(original);
  const preview = annualForecast(original);
  assert.equal(preview.stats.attractiveness.before, 5);
  assert.equal(preview.stats.attractiveness.after, 5);
  assert.deepEqual(annualForecast(original), preview);
  assert.deepEqual(original, before, 'forecast consumes no RNG or saved state');
  const values = [-1, 0, 1].map(draw => {
    const state = copy(original);
    quietYear(state, { growthRandom: () => draw });
    assert.equal(state.yearSummary.stats.attractiveness.before, 5);
    assert.equal(state.yearSummary.stats.attractiveness.after, state.stats.attractiveness);
    return state.stats.attractiveness;
  });
  assert.ok(values[0] < 5 && values[2] > 5);
  assert.equal(values[1], 5);
  assert.ok(5 - values[0] <= .15 && values[2] - 5 <= .15, 'ordinary appearance variation stays slight');
  assert.ok(Math.abs((values[0] + values[2]) / 2 - 5) < .001, 'variation is centered at the unchanged mean');
});

test('poor health reduces annual growth, saves retain growth genetics, and maturity freezes attained height', () => {
  const healthy = createGame({ seed: 592 });
  const poor = copy(healthy);
  const genetics = healthy.growthFactor;
  while (healthy.age < healthy.maturityAge) {
    healthy.stats.health = 9;
    poor.stats.health = 1;
    const healthyBefore = healthy.height, poorBefore = poor.height;
    quietYear(healthy);
    quietYear(poor);
    assert.ok(healthy.height >= healthyBefore && poor.height >= poorBefore, 'both children grow rather than shrink');
    assert.ok(healthy.height - healthyBefore > poor.height - poorBefore, 'health changes this year\'s gain');
    assert.ok(poor.height < healthy.height);
    assert.equal(poor.growthFactor, genetics, 'health acts separately from persistent genetic variation');
    assert.equal(validateSave(poor), true);
    if (poor.age === 3) {
      const reloaded = migrateSave(JSON.parse(JSON.stringify(poor)));
      assert.deepEqual(reloaded, poor, 'current height and growth genetics survive saving during childhood');
      Object.assign(poor, reloaded);
    }
  }
  assert.ok(healthy.height - poor.height > 1, 'smaller annual gains accumulate without a maturity catch-up');
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(poor))), poor, 'realized adult height survives saving');
  for (const state of [healthy, poor]) {
    const height = state.height;
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    quietYear(state, { growthRandom: () => 3 });
    assert.equal(state.height, height, 'maturity freezes actual height even with a large growth draw');
  }
});

test('annual height gains do not converge to the obsolete saved adult-height endpoint', () => {
  const first = createGame({ seed: 594 });
  assert.equal(first.adultHeight, null, 'newborns have no predetermined adult height');
  const second = copy(first);
  first.adultHeight = 145;
  second.adultHeight = 205;
  for (let year = 0; year < 3; year++) {
    quietYear(first);
    quietYear(second);
    assert.equal(first.height, second.height, 'current age, genetics, health and randomness determine growth');
    assert.equal(first.growthFactor, second.growthFactor);
  }
});

test('health recovery improves future annual growth without repaying missed height', () => {
  const healthy = createGame({ seed: 595 });
  const recovering = copy(healthy);
  healthy.stats.health = 9;
  recovering.stats.health = 1;
  quietYear(healthy);
  quietYear(recovering);
  const originalGap = healthy.height - recovering.height;
  assert.ok(originalGap > 1);
  for (let year = 0; year < 4; year++) {
    healthy.stats.health = 9;
    recovering.stats.health = 9;
    quietYear(healthy);
    quietYear(recovering);
    assert.ok(Math.abs((healthy.height - recovering.height) - originalGap) < .03, 'recovery does not trigger convergence to a target');
  }
});

test('parent career growth previews and updates shared household lifestyle for minors', () => {
  const state = createGame({ seed: 608 });
  state.lifestyle = 4;
  for (const parent of state.parents) {
    parent.lifestyle = 4;
    parent.career = { focus: 5, status: 'employed', progress: 4.45, years: 5 };
  }
  const before = copy(state);
  const preview = annualForecast(state);
  assert.equal(preview.lifestyle.before, 4);
  assert.equal(preview.lifestyle.after, 4.66);
  assert.deepEqual(state, before, 'career forecasting never changes RNG, household support, or parent career state');
  quietYear(state);
  assert.equal(state.lifestyle, 4.66);
  assert.equal(householdLifestyle(state), 4.66);
  assert.ok(state.parents.every(parent => parent.lifestyle === state.lifestyle && parent.career.progress > 4.45));
  assert.deepEqual(state.yearSummary.lifestyle, preview.lifestyle);
  assert.equal(validateSave(state), true);
});

test('injected parent job losses reduce household support and appear in the yearly review', () => {
  const state = createGame({ seed: 654 });
  state.lifestyle = 6;
  for (const parent of state.parents) {
    parent.lifestyle = 6;
    parent.career = { focus: 3, status: 'employed', progress: 6, years: 5 };
  }
  const before = copy(state);
  quietYear(state, { parentCareerRandom: () => 0 });
  assert.ok(state.parents.every(parent => parent.career.status === 'unemployed' && parent.career.progress < 6));
  assert.equal(state.lifestyle, 5);
  assert.ok(state.parents.every(parent => parent.lifestyle === state.lifestyle));
  assert.equal(state.yearSummary.lifestyle.before, 6);
  assert.equal(state.yearSummary.lifestyle.after, 5);
  assert.ok(state.yearSummary.events.some(event => /lost.*job/i.test(`${event.title} ${event.text}`)));
  for (const change of state.yearSummary.parents) {
    const old = before.parents.find(parent => parent.id === change.id);
    const current = state.parents.find(parent => parent.id === change.id);
    assert.deepEqual([change.stability.before, change.stability.after], [old.stats.stability, current.stats.stability]);
    assert.deepEqual([change.relationship.before, change.relationship.after], [old.relationship, current.relationship]);
  }
  assert.equal(validateSave(state), true);
});

test('household career support ends when the player becomes financially independent at 18', () => {
  const state = createGame({ seed: 671 });
  state.age = 17;
  state.maturityAge = 18;
  state.height = 67.52;
  state.growthAnchor = { age: 17, height: state.height };
  state.lifestyle = 8;
  state.money = 0;
  for (const parent of state.parents) {
    parent.lifestyle = 8;
    parent.career = { focus: 5, status: 'employed', progress: 8, years: 12 };
  }
  quietYear(state);
  assert.equal(state.age, 18);
  assert.equal(state.lifestyle, 1);
  assert.equal(householdLifestyle(state), 8.08);
  assert.equal(validateSave(state), true);
});

test('a child handoff preserves household support when the known co-parent had a different lifestyle', () => {
  const state = createGame({ seed: 695, surname: 'Handoff' });
  while (state.age < 65) {
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    quietYear(state);
  }
  state.partner = {
    ...copy(state.parents[0]), id: 'handoff-coparent', name: 'Anna Handoff', age: 60,
    relationship: 8, yearsTogether: 20, married: true, lastProposalAge: -1, lifestyle: 8,
  };
  delete state.partner.career;
  state.encounters = [];
  assert.equal(haveChild(state).ok, true);
  state.money = 200000;
  state.lifestyle = 2;
  state.children[0].lifestyle = 2;
  assert.equal(validateSave(state), true);
  assert.equal(succeed(state, state.children[0].id).ok, true);
  assert.equal(state.parents.length, 2, 'the known co-parent follows the child');
  assert.equal(state.lifestyle, 2);
  assert.ok(state.parents.every(parent => parent.career.progress === 2));
  const forecast = annualForecast(state);
  assert.equal(forecast.lifestyle.before, 2);
  assert.ok(forecast.lifestyle.after > 2 && forecast.lifestyle.after < 2.25);
  quietYear(state);
  assert.equal(state.lifestyle, forecast.lifestyle.after, 'the first year after handoff follows normal career progress');
  assert.equal(validateSave(state), true);
});
