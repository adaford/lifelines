import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyRatingFloor } from './helpers/legacy-height.js';
import {
  EVENTS, createGame, setFocus, focusLimits, focusLimitDetails, advanceYear,
  annualForecast, resolveEventChoice, validateSave, migrateSave,
} from '../engine.js';

const copy = value => structuredClone(value);
const calmYear = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const effect = (id, focusLimits, years = 1) => ({ id, name: id, description: '', years, modifiers: {}, kind: 'negative', focusLimits });
function child(age = 3) {
  const state = createGame({ seed: 7301 });
  state.age = age;
  state.focus = age < 5 ? { work: 3, social: 2, family: 2, self: 3, creative: 2 } : { work: 3, social: 3, family: 3, self: 3 };
  return state;
}
function quietAdvance(state) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const draft = copy(state);
    draft.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(draft, calmYear).ok, true);
    if (draft.lastYearEvents.length) continue;
    Object.assign(state, draft);
    return;
  }
  assert.fail('could not find an ordinary-event-free year');
}
function queuedTeam(state) {
  state.pendingEvents = [{ eventId: 'school_team', age: state.age }];
  state.lastYearEvents = ['school_team'];
}

test('active limits use the strictest current-stage cap without changing a save or RNG', () => {
  const state = child();
  state.effects = [
    effect('Broken bone', { toddler: { work: 2 }, standard: { social: 2 } }),
    effect('Extra recovery', { toddler: { work: 1, creative: 2 } }, 2),
    { ...effect('Expired', { toddler: { social: 0 } }), years: 0 },
  ];
  state.focus.work = 1;
  const before = copy(state);
  assert.deepEqual(focusLimits(state), { work: 1, social: 5, family: 5, self: 5, creative: 2 });
  assert.deepEqual(focusLimitDetails(state), [
    { key: 'work', max: 2, effectId: 'Broken bone', name: 'Broken bone', years: 1 },
    { key: 'work', max: 1, effectId: 'Extra recovery', name: 'Extra recovery', years: 2 },
    { key: 'creative', max: 2, effectId: 'Extra recovery', name: 'Extra recovery', years: 2 },
  ]);
  annualForecast(state);
  assert.deepEqual(state, before);
  assert.equal(setFocus(state, 'work', 2).ok, false);
  assert.match(setFocus(state, 'work', 2).reason, /Play is limited to 1/);
  assert.equal(setFocus(state, 'family', 3).ok, true, 'freed points remain available elsewhere');
  state.age = 1;
  assert.deepEqual(focusLimitDetails(state), []);
  assert.deepEqual(focusLimits(state), { work: 5, social: 5, family: 5, self: 5 });
});

test('resolving an event clamps only over-limit allocations and records restrictions and duration', () => {
  const state = child(6);
  state.focus = { work: 5, social: 3, family: 2, self: 2 };
  queuedTeam(state);
  const event = EVENTS.find(event => event.id === 'school_team');
  const original = event.choices;
  event.choices = [{ id: 'test_limits', label: 'Join', description: 'Filler is omitted.', years: 1, modifiers: { health: -.4 }, focusLimits: { standard: { work: 2, social: 1 } } }];
  try {
    const rng = state.rng;
    assert.equal(resolveEventChoice(state, 'test_limits', event.id).ok, true);
    assert.deepEqual(state.focus, { work: 2, social: 1, family: 2, self: 2 });
    assert.equal(state.rng, rng);
    assert.equal(state.effects.at(-1).years, 1);
    assert.match(state.history[0].text, /School max 2; Friends max 1\. Temporary effects: 1 year\./);
    assert.match(state.history[0].text, /-\.4 Health/);
    assert.doesNotMatch(state.history[0].text, /Filler/);
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(copy(state)), state);
  } finally { event.choices = original; }
});

test('a randomly rolled broken bone applies its Play cap to the newly playable toddler year', () => {
  let injured;
  for (let seed = 1; seed <= 300; seed++) {
    const state = createGame({ seed });
    state.age = 2;
    state.focus = { work: 5, social: 2, family: 2, self: 1, creative: 2 };
    assert.equal(advanceYear(state, calmYear).ok, true);
    if (state.lastYearEvents.includes('broken_bone')) { injured = state; break; }
  }
  assert.ok(injured, 'the new automatic event must be eligible and rollable in toddler years');
  assert.equal(injured.age, 3);
  assert.equal(injured.effects.find(effect => effect.id === 'broken_bone').years, 1);
  assert.equal(focusLimits(injured).work, 2);
  assert.equal(injured.focus.work, 2);
  assert.equal(injured.yearSummary.decisions.focus.work, 5, 'the completed year keeps the original decision');
  assert.ok(injured.yearSummary.events.some(event => event.text.includes('Play max 2. Temporary effects: 1 year.')));
  assert.equal(validateSave(injured), true);
});

test('a restriction-only event works and refreshed effects replace old caps', () => {
  const state = child(6);
  queuedTeam(state);
  const event = EVENTS.find(event => event.id === 'school_team');
  const original = event.choices;
  event.choices = [
    { id: 'cap', label: 'Commit', description: '', years: 2, focusLimits: { standard: { social: 0 } } },
    { id: 'alternate', label: 'Change plan', description: '', years: 1, modifiers: { stability: .2 } },
  ];
  try {
    assert.equal(resolveEventChoice(state, 'cap', event.id).ok, true);
    assert.equal(state.focus.social, 0);
    assert.equal(focusLimits(state).social, 0);
    assert.match(state.history[0].text, /No stat changes\. Friends max 0\. Temporary effects: 2 years\./);
    queuedTeam(state);
    assert.equal(resolveEventChoice(state, 'alternate', event.id).ok, true);
    assert.equal(state.effects.length, 1);
    assert.equal(state.effects[0].focusLimits, undefined);
    assert.equal(state.effects[0].years, 2, 'a refresh preserves the existing longer duration');
    assert.equal(focusLimits(state).social, 5);
    assert.equal(state.focus.social, 0, 'removing a limit never restores or reallocates points silently');
  } finally { event.choices = original; }
});

test('a one-year limit governs one full turn and expires without restoring the old allocation', () => {
  const state = child();
  state.effects = [effect('Broken bone', { toddler: { work: 2 } })];
  state.focus.work = 2;
  const forecast = annualForecast(state);
  assert.equal(state.effects[0].years, 1);
  quietAdvance(state);
  assert.equal(state.age, 4);
  assert.equal(state.effects.length, 0);
  assert.equal(state.yearSummary.decisions.focus.work, 2);
  assert.deepEqual(state.yearSummary.stats, forecast.stats);
  assert.equal(state.focus.work, 2);
  assert.equal(focusLimits(state).work, 5);
  assert.equal(setFocus(state, 'work', 3).ok, true);
});

test('stage changes apply only the matching caps and transfer creative points within remaining capacity', () => {
  const state = child(4);
  state.focus = { work: 2, social: 1, family: 2, self: 2, creative: 5 };
  state.effects = [effect('Recovery', { toddler: { work: 2 }, standard: { social: 0, self: 1 } }, 2)];
  quietAdvance(state);
  assert.equal(state.age, 5);
  assert.equal(state.effects[0].years, 1);
  assert.deepEqual(focusLimits(state), { work: 5, social: 0, family: 5, self: 1 });
  assert.deepEqual(state.focus, { work: 5, social: 0, family: 4, self: 1 });
  assert.equal(state.yearSummary.decisions.focus.creative, 5);
  assert.equal(validateSave(state), true);
  assert.match(setFocus(state, 'social', 1).reason, /Friends is limited to 0/);
});

test('over-limit states cannot advance or import and malformed limit maps are rejected', () => {
  const state = child();
  state.effects = [effect('Broken bone', { toddler: { work: 2 } })];
  const before = copy(state);
  assert.equal(validateSave(state), false);
  assert.equal(migrateSave(state), null);
  assert.match(advanceYear(state, calmYear).reason, /Play is limited to 2/);
  assert.deepEqual(state, before);
  state.focus.work = 2;
  assert.equal(validateSave(state), true);
  for (const focusLimits of [{}, [], null, { baby: { work: 2 } }, { toddler: {} }, { toddler: [] }, { toddler: { unknown: 2 } }, { standard: { creative: 2 } }, { toddler: { work: -1 } }, { toddler: { work: 6 } }, { toddler: { work: 1.5 } }, { toddler: { work: '2' } }]) {
    const invalid = copy(state);
    invalid.effects[0].focusLimits = focusLimits;
    assert.equal(validateSave(invalid), false, JSON.stringify(focusLimits));
    assert.equal(migrateSave(invalid), null);
  }
});

test('schema 13 migration preserves ratings, effects, pending choices, history and RNG exactly', () => {
  const state = legacyRatingFloor(child(6));
  state.version = 13;
  state.lifestyle = 5.37;
  state.effects = [{ id: 'old', name: 'Existing effect', description: 'Saved text', years: 2, modifiers: { stability: .3 }, kind: 'positive' }];
  queuedTeam(state);
  const before = copy(state);
  assert.equal(validateSave(state), false);
  const migrated = migrateSave(state);
  assert.deepEqual(migrated, { ...before, version: 16 });
  assert.deepEqual(state, before);
  assert.equal(validateSave(migrated), true);
});
