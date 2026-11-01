import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame as createGameWithConditions, advanceYear, setFocus, focusLimits, validateSave, migrateSave, annualForecast } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';

// These focus-only fixtures explicitly exclude optional birth constraints.
const createGame = options => { const state = createGameWithConditions(options); state.conditions = []; state.focus = defaultFocus(state.age); return state; };
const copy = value => structuredClone(value);
const calmYear = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const legacyDefaults = age => age >= 2 && age < 5
  ? { work: 3, social: 2, family: 2, self: 3, creative: 2 }
  : { work: 3, social: 3, family: 3, self: 3 };

test('schema 17 defaults, action limits and budgets match the active focus count', () => {
  for (const age of [2, 4, 5, 17, 25]) {
    const state = createGame({ seed: 3317 });
    state.age = age;
    state.focus = defaultFocus(age);
    assert.ok(Object.values(state.focus).every(points => points === 2));
    assert.equal(Object.values(state.focus).reduce((sum, points) => sum + points, 0), focusBudget(age));
    assert.ok(Object.values(focusLimits(state)).every(max => max === 4));
    const before = copy(state);
    assert.equal(setFocus(state, 'work', 5).ok, false);
    assert.equal(setFocus(state, 'work', 3).ok, false, 'default allocations spend the exact budget');
    assert.deepEqual(state, before);
    assert.equal(setFocus(state, 'social', 0).ok, true);
    assert.equal(setFocus(state, 'work', 4).ok, true);
  }
});

test('schema 16 migration changes only active focus and version, preserving old reviews and pending choices', () => {
  const old = createGame({ seed: 3317 });
  old.age = 6;
  assert.equal(advanceYear(old, calmYear).ok, true);
  old.version = 16;
  old.focus = legacyDefaults(old.age);
  old.effects = [{ id: 'legacy-cap', name: 'Saved limit', description: '', years: 2, modifiers: { health: .2 }, focusLimits: { standard: { social: 3, self: 5 } }, kind: 'positive' }];
  old.yearSummary.decisions = { focus: { work: 5, social: 3, family: 2, self: 2 }, workLabel: 'School' };
  old.pendingEvents = [{ eventId: 'school_team', age: old.age }];
  old.lastYearEvents = ['school_team'];
  const before = copy(old);
  const migrated = migrateSave(old);
  assert.ok(migrated);
  assert.deepEqual(migrated, { ...before, version: 17, focus: defaultFocus(7) });
  assert.deepEqual(old, before, 'loading never modifies the input');
  assert.deepEqual(migrateSave(copy(migrated)), migrated, 'a second load never converts allocation again');
  assert.equal(validateSave(migrated), true);
});

test('legacy balanced toddlers become all twos and over-budget allocations normalize even in infancy', () => {
  for (const age of [0, 1, 3, 10]) {
    const old = createGame({ seed: 3317 });
    old.age = age;
    old.version = 16;
    old.focus = legacyDefaults(age);
    assert.deepEqual(migrateSave(old).focus, defaultFocus(age));
    old.focus = age === 3 ? { work: 4, social: 4, family: 4, self: 0, creative: 0 } : { work: 4, social: 4, family: 4, self: 0 };
    const before = copy(old);
    const migrated = migrateSave(old);
    assert.ok(migrated, `formerly valid allocation at age ${age} still loads`);
    assert.equal(validateSave(migrated), true);
    assert.ok(Object.values(migrated.focus).every(points => points >= 0 && points <= 4));
    assert.ok(Object.values(migrated.focus).reduce((sum, points) => sum + points, 0) <= focusBudget(age));
    assert.deepEqual(old, before);
    assert.equal(migrated.rng, old.rng);
    assert.deepEqual(migrated.stats, old.stats);
  }
});

test('current toddlers require all five focus keys and current reviews record their exact rule set', () => {
  const state = createGame({ seed: 3317 });
  state.age = 4;
  state.focus = defaultFocus(4);
  assert.equal(validateSave(state), true);
  const missing = copy(state);
  delete missing.focus.creative;
  assert.equal(validateSave(missing), false);
  assert.equal(migrateSave(missing), null);
  const before = copy(state.focus);
  assert.equal(advanceYear(state, calmYear).ok, true);
  assert.deepEqual(state.yearSummary.decisions, { focus: before, workLabel: 'Play', focusMax: 4, focusBudget: 10 });
  assert.deepEqual(state.focus, defaultFocus(5), 'default birthday-five allocations fit the new eight-point budget');
  assert.equal(validateSave(state), true);
  const malformed = copy(state);
  delete malformed.yearSummary.decisions.focus.creative;
  assert.equal(validateSave(malformed), false, 'new toddler reviews require the recorded fifth activity');
});

test('direct over-budget allocations cannot advance and forecast reads do not mutate legal allocations', () => {
  const state = createGame({ seed: 3317 });
  state.age = 6;
  state.focus = { work: 4, social: 4, family: 1, self: 0 };
  const before = copy(state);
  assert.equal(validateSave(state), false);
  assert.match(advanceYear(state).reason, /8 focus points/);
  assert.deepEqual(state, before);
  state.focus.family = 0;
  const legal = copy(state);
  annualForecast(state);
  assert.deepEqual(state, legal);
});
