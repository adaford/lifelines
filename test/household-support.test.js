import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, EVENTS, resolveEventChoice, annualForecast, householdLifestyle, familyLifestyle, validateSave, migrateSave, pendingEventSubject } from '../engine.js';

function fixture() {
  const state = createGame({ seed: 771144 });
  state.age = 3; state.conditions = [];
  state.focus = { work: 2, social: 2, family: 2, self: 2, creative: 2 };
  state.effects = [];
  for (const parent of state.parents) parent.lifestyle = 5;
  state.lifestyle = 5;
  return state;
}

function applySupport(state, amount) {
  const event = EVENTS.find(event => event.id === 'broken_tablet');
  const original = event.choices;
  event.choices = [{ id: 'support', label: 'Arrange support', description: 'Practical help covers household costs for a year.', years: 1, householdLifestyle: amount }];
  state.pendingEvents = [{ eventId: event.id, age: state.age }];
  state.lastYearEvents = [event.id];
  try { assert.equal(resolveEventChoice(state, 'support').ok, true); }
  finally { event.choices = original; }
}

test('household event support reaches caregivers once, survives reload and expires after a full routine', () => {
  const state = fixture(), ratings = structuredClone(state.stats), parentBase = state.parents.map(p => p.lifestyle), rng = state.rng;
  applySupport(state, .2);
  assert.equal(state.lifestyle, 5.2);
  assert.equal(householdLifestyle(state), 5.2);
  assert.equal(familyLifestyle(state, state.parents[0]), 5.2);
  assert.deepEqual(state.parents.map(p => p.lifestyle), parentBase);
  assert.deepEqual(state.stats, ratings);
  assert.equal(state.rng, rng);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
  assert.match(state.history[0].text, /Household lifestyle 5 → 5.2/);
  assert.match(state.history[0].text, /1 year/);
  const before = structuredClone(state);
  const forecast = annualForecast(state);
  assert.deepEqual(state, before);
  const control = structuredClone(state); control.effects = []; control.lifestyle = 5;
  assert.equal(forecast.lifestyle.after, annualForecast(control).lifestyle.after, 'support expires rather than compounding into household career support');
});

test('negative support and legacy material effects coexist without rewriting saved data', () => {
  const state = fixture();
  const old = { id: 'legacy-material', name: 'Old support', description: 'Saved text', years: 2, modifiers: { intelligence: .3 }, lifestyle: 1, kind: 'positive' };
  state.effects.push(old);
  applySupport(state, -.2);
  assert.equal(state.lifestyle, 4.8);
  assert.deepEqual(state.effects[0], old);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
  for (const value of [NaN, Infinity, 3, '0.2', 0]) {
    const invalid = structuredClone(state); invalid.effects[1].householdLifestyle = value;
    assert.equal(validateSave(invalid), false);
  }
});

test('sibling subject resolution never falls through to a child with the same id', () => {
  const state = fixture();
  const sibling = { ...structuredClone(state.parents[0]), id: 'sibling-test', relationship: 6 };
  state.siblings = [sibling]; state.children = [{ ...sibling, name: 'Different child' }];
  assert.equal(pendingEventSubject(state, { subjectType: 'sibling', subjectId: sibling.id }), sibling);
  assert.equal(pendingEventSubject(state, { subjectType: 'sibling', subjectId: 'missing' }), null);
});
