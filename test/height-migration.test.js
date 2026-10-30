import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, chooseEducation, needsEducationChoice, EVENTS, resolveEventChoice, haveChild, migrateSave, validateSave } from '../engine.js';
import { toLegacyCentimeters } from './helpers/legacy-height.js';

const copy = value => structuredClone(value);
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId || '').ok, true);
  }
}
function lifeAt(age) {
  const state = createGame({ seed: 1911 });
  while (state.age < age) {
    finishChoices(state);
    if (needsEducationChoice(state)) chooseEducation(state, 'work');
    assert.equal(advanceYear(state, { mortalityRandom: () => 1 }).ok, true);
  }
  finishChoices(state);
  return state;
}

test('v9 centimetre saves convert every family measurement and review while preserving all other progress', () => {
  const state = lifeAt(35);
  assert.equal(haveChild(state).ok, true);
  const adult = { ...copy(state.parents[1]), id: 'unit-adult', name: 'Summer Reed', age: 30, money: 0, gender: 'female', canGestate: true, attractedTo: ['male'] };
  state.siblings = [{ ...copy(adult), id: 'unit-sibling', name: 'Casey Reed' }];
  state.partner = { ...copy(adult), yearsTogether: 2, married: true, lastProposalAge: -1 };
  state.encounters = [];
  state.pregnancy = { otherParent: copy(state.partner), carrierId: state.partner.id, carrierName: state.partner.name, startedAge: state.age, dueAge: state.age + 1, casual: false };
  state.lineage = [{ ...copy(state.parents[0]), money: 0, generation: 1, estate: 0, share: 0, children: [{ ...copy(state.children[0]), inheritance: 0 }] }];
  state.growthAnchor = { age: state.age, height: state.height };
  assert.equal(validateSave(state), true);

  const legacy = toLegacyCentimeters(copy(state));
  legacy.version = 9;
  const untouched = copy(legacy);
  const migrated = migrateSave(legacy);
  assert.deepEqual(migrated, state, 'all actor fields, nested growth metadata and review values round-trip');
  assert.deepEqual(legacy, untouched, 'the imported save is never mutated');
  assert.deepEqual(migrateSave(copy(migrated)), state, 'current saves are not converted again');

  state.partner = null;
  state.pregnancy = null;
  state.encounters = [adult];
  assert.equal(validateSave(state), true);
  const oldEncounters = toLegacyCentimeters(copy(state));
  oldEncounters.version = 9;
  assert.deepEqual(migrateSave(oldEncounters), state, 'encounter heights convert too');
});

test('v9 migration rounds inches once and recomputes review growth from converted endpoints', () => {
  const legacy = toLegacyCentimeters(lifeAt(1));
  legacy.version = 9;
  legacy.birthHeight = 50.13;
  legacy.height = 75.26;
  legacy.yearSummary.height = { before: 50.13, after: 75.26, change: 25.13 };
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.equal(migrated.birthHeight, 19.74);
  assert.equal(migrated.height, 29.63);
  assert.deepEqual(migrated.yearSummary.height, { before: 19.74, after: 29.63, change: 9.89 });
  assert.deepEqual(migrated.stats, legacy.stats);
  assert.equal(migrated.rng, legacy.rng);
  assert.equal(validateSave(migrated), true);
  assert.equal(validateSave({ ...migrated, height: 190 }), false, 'current save heights must use inches');
});

test('old age-two cry reviews and queued childhood choices survive the new age boundaries', () => {
  const legacy = toLegacyCentimeters(lifeAt(3));
  legacy.version = 9;
  delete legacy.focus.creative;
  legacy.yearSummary.decisions = { cryLevel: 4 };
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.deepEqual(migrated.yearSummary.decisions, { cryLevel: 4 });

  const pending = toLegacyCentimeters(lifeAt(4));
  pending.version = 9;
  delete pending.focus.creative;
  delete pending.yearSummary.decisions.focus.creative;
  pending.yearSummary.decisions.workLabel = 'School';
  pending.pendingEvents = [{ eventId: 'school_play', age: 4 }];
  pending.lastYearEvents = ['school_play'];
  const child = migrateSave(pending);
  assert.ok(child);
  assert.deepEqual(child.pendingEvents, pending.pendingEvents);
  finishChoices(child);
  assert.equal(validateSave(child), true);
});
