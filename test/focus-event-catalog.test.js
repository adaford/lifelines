import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS as PERSONAL_EVENTS, eventChances } from '../events.js';
import { FAMILY_EVENTS } from '../family-events.js';
import { EVENTS, createGame, advanceYear, chooseEducation, resolveEventChoice, validateSave, migrateSave, focusLimits, focusMinimums } from '../engine.js';
import { createSchoolRecord } from '../school.js';
import { defaultFocus } from '../focus-rules.js';

const ids = ['school_catch_up_sessions', 'family_recovery_visits', 'toddler_rest_schedule', 'school_quiet_study_room', 'family_shared_errands'];
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function fixture(age) {
  const state = createGame({ seed: 7301 });
  if (age >= 18) {
    while (state.age < age) {
      assert.equal(advanceYear(state, calm).ok, true);
      while (state.pendingEvents.length) {
        const pending = state.pendingEvents[0];
        const event = EVENTS.find(entry => entry.id === pending.eventId);
        assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
      }
    }
  }
  state.age = age;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.education = { status: age < 18 ? 'school' : 'workforce', years: 0 };
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  if (age >= 18) {
    state.education.status = 'undecided';
    assert.equal(chooseEducation(state, 'work').ok, true);
  }
  for (const key of Object.keys(state.stats)) state.stats[key] = 5;
  return state;
}

test('catalog uses signed capacity changes and concrete minimum commitments without changing decision counts', () => {
  const events = [...PERSONAL_EVENTS, ...FAMILY_EVENTS];
  assert.equal(events.filter(event => !event.supplemental).length, 352, 'all original definitions remain');
  assert.equal(events.filter(event => event.choices).length, 73);
  for (const event of events) for (const outcome of [event, ...(event.choices || [])]) {
    assert.equal(outcome.focusLimits, undefined, `${event.id} no longer authors absolute event caps`);
    for (const [field, minimum] of [['focusCapacity', false], ['focusMinimums', true]]) {
      for (const changes of Object.values(outcome[field] || {})) {
        assert.ok(Object.values(changes).every(value => Number.isInteger(value) && value !== 0 && value >= (minimum ? 1 : -4) && value <= 4));
        assert.ok(outcome.years >= 1);
      }
    }
  }
  const additions = ids.map(id => PERSONAL_EVENTS.find(event => event.id === id));
  assert.ok(additions.every(event => event && !event.choices && event.years === 1));
  assert.equal(additions.filter(event => event.focusMinimums).length, 3);
  assert.equal(additions.filter(event => event.focusCapacity).length, 2);
});

test('minimum commitments and capacity support have stage-appropriate pure odds', () => {
  for (const id of ids) {
    const event = PERSONAL_EVENTS.find(event => event.id === id);
    const state = fixture(event.minAge);
    if (id === 'school_catch_up_sessions') state.focus.work = 0;
    const before = structuredClone(state);
    const chance = candidate => eventChances(candidate, candidate.stats).find(entry => entry.id === id).chance;
    assert.equal(chance(state), .006 * 3, id);
    assert.equal(chance({ ...state, age: event.minAge - 1 }), 0);
    assert.equal(chance({ ...state, age: event.maxAge + 1 }), 0);
    assert.deepEqual(state, before, 'odds preserve allocations, ratings, and RNG');
  }
  const pupil = fixture(10);
  const chance = intelligence => eventChances(pupil, { ...pupil.stats, intelligence }).find(entry => entry.id === 'school_catch_up_sessions').chance;
  pupil.focus.work = 1;
  assert.equal(chance(0), .006 * 3);
  assert.equal(chance(10), 0, 'catch-up sessions use the same effective intelligence as the coming report');
});

test('new automatic minimum and capacity events roll and survive reload with a complete remaining year', () => {
  for (const id of ids) {
    const event = PERSONAL_EVENTS.find(event => event.id === id);
    const original = fixture(event.minAge);
    if (id === 'school_catch_up_sessions') original.focus.work = 0;
    let found;
    for (let seed = 1; seed <= 1000; seed++) {
      const state = structuredClone(original);
      state.rng = Math.imul(seed, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      if (state.lastYearEvents.includes(id)) { found = state; break; }
    }
    assert.ok(found, id);
    const effect = found.effects.find(effect => effect.id === id);
    assert.equal(effect.years, 1);
    assert.deepEqual(effect.focusCapacity, event.focusCapacity);
    assert.deepEqual(effect.focusMinimums, event.focusMinimums);
    assert.ok(found.yearSummary.events.some(entry => entry.title === event.name));
    if (event.focusMinimums) for (const [key, minimum] of Object.entries(focusMinimums(found))) assert.ok(found.focus[key] >= minimum);
    for (const [key, maximum] of Object.entries(focusLimits(found))) assert.ok(found.focus[key] <= maximum);
    assert.equal(validateSave(found), true, id);
    assert.deepEqual(migrateSave(structuredClone(found)), found);
  }
});
