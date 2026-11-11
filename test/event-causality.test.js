import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, validateSave, migrateSave, EVENTS } from '../engine.js';
import { eventChances } from '../events.js';
import { familyEventChances } from '../family-events.js';
import { eventStatCause, formatEventCause } from '../event-causes.js';
import { defaultFocus } from '../focus-rules.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function fixture(age = 1) {
  const state = createGame({ seed: 63012 });
  state.age = age;
  state.effects = [];
  state.conditions = [];
  state.focus = defaultFocus(age);
  state.lifestyle = 5;
  for (const person of [state, ...state.parents]) {
    person.conditions = [];
    for (const key in person.stats) person.stats[key] = 5;
    for (const key in person.aptitudes) person.aptitudes[key] = 0;
  }
  return state;
}
const personalChance = (state, id) => eventChances(state, state.stats).find(event => event.id === id).chance;
const householdChance = (state, id, subject) => familyEventChances(state).find(event => event.eventId === id && event.subjectId === subject.id).chance;

test('housing noise and delayed fan replacement depend on Lifestyle, not mental stability', () => {
  for (const [id, age] of [['disrupted_sleep', 10], ['sleepless_baby', 1]]) {
    const state = fixture(age);
    state.lifestyle = 2;
    const low = personalChance(state, id);
    state.stats.stability = 0;
    assert.equal(personalChance(state, id), low, id);
    state.stats.stability = 10;
    assert.equal(personalChance(state, id), low, id);
    state.lifestyle = 9;
    assert.ok(personalChance(state, id) < low, id);
    assert.ok(low > 0 && Number.isFinite(low));
  }
});

test('external mistakes, theft and unkind actions are independent of the affected person abilities', () => {
  for (const [id, age, stat] of [['school_bullying', 10, 'social'], ['teen_rumor', 15, 'social'],
    ['identity_mixup', 25, 'intelligence'], ['lost_valuables', 25, 'intelligence'], ['conflict', 25, 'social']]) {
    const state = fixture(age), event = EVENTS.find(event => event.id === id);
    state.stats[stat] = 0;
    const low = personalChance(state, id);
    assert.ok(low > 0, id);
    assert.equal(eventStatCause(event, state), '', id);
    state.stats[stat] = 10;
    assert.equal(personalChance(state, id), low, id);
  }
});

test('family noise uses the shared household Lifestyle independently of each relative rating', () => {
  for (const role of ['parent', 'guardian', 'child']) {
    const state = fixture(role === 'child' ? 30 : 1);
    let person = state.parents[0];
    if (role === 'guardian') {
      state.guardian = { ...copy(person), id: 'noise-guardian', guardianRole: 'aunt' };
      state.parents.forEach(parent => { parent.abandonedAt = 0; });
      person = state.guardian;
    }
    if (role === 'child') {
      person = { ...copy(person), id: 'noise-child', age: 1 };
      state.children = [person];
    }
    const id = role === 'child' ? 'household_child_sleep' : 'household_parent_sleepless';
    state.lifestyle = 2;
    const low = householdChance(state, id, person);
    person.stats.stability = 0; person.lifestyle = 0;
    assert.equal(householdChance(state, id, person), low, role);
    person.stats.stability = 10; person.lifestyle = 10;
    assert.equal(householdChance(state, id, person), low, role);
    state.lifestyle = 9;
    assert.ok(householdChance(state, id, person) < low, role);
    assert.ok(low > 0 && Number.isFinite(low));
  }
});

test('household Lifestyle causes retain household ownership and never substitute a parent rating', () => {
  const event = EVENTS.find(event => event.id === 'household_parent_sleepless');
  const parent = { name: 'Alex Reed', stats: { stability: 1 }, lifestyle: 9 };
  assert.equal(eventStatCause(event, parent), '', 'missing household context is not inferred from a parent');
  const cause = eventStatCause(event, parent, parent.stats, 1.23);
  assert.match(cause, /Your household's low Lifestyle \(1\.2\/10\)/);
  assert.doesNotMatch(cause, /Alex|Mental stability|9\.0/);
  assert.equal(formatEventCause(cause, event), "Your household's low lifestyle contributed to this event.");
  const mixed = eventStatCause({ subjectType: 'parent', statFactors: [['stability', 'low'], ['lifestyle', 'low']] }, parent, parent.stats, 2);
  assert.match(mixed, /Alex Reed's low Mental stability.*and your household's low Lifestyle/);
});

test('school opportunities follow relevant activity focus while adult hobbies retain Yourself', () => {
  for (const [id, key] of [['school_music', 'extracurricular'], ['learning_bike', 'sports']]) {
    const state = fixture(10);
    state.focus[key] = 0; state.focus.self = 0;
    const zero = personalChance(state, id);
    state.focus.self = 4;
    assert.equal(personalChance(state, id), zero, 'school personal care is not practice for this activity');
    state.focus[key] = 1;
    assert.ok(Math.abs(personalChance(state, id) / zero - 1.15 / .4) < 1e-10, 'one activity point is neutral exposure');
    state.focus[key] = 2;
    assert.ok(Math.abs(personalChance(state, id) / zero - 1.65 / .4) < 1e-10, 'two activity points give maximum exposure');
  }
  const adult = fixture(30);
  adult.focus.self = 0;
  const low = personalChance(adult, 'inspiration');
  adult.focus.self = 4;
  assert.ok(personalChance(adult, 'inspiration') > low, 'adult hobby exposure still uses Yourself');
});

test('actual noise rolls capture starting household Lifestyle before careers update it and survive reload', () => {
  const original = fixture();
  original.lifestyle = 1.23;
  original.parents.forEach(parent => { parent.lifestyle = 9; parent.career.progress = 9; parent.stats.stability = 1; });
  const event = EVENTS.find(event => event.id === 'household_parent_sleepless');
  let found;
  for (let index = 1; index <= 500 && !found; index++) {
    const state = copy(original);
    state.rng = Math.imul(index, 2654435761) >>> 0;
    assert.equal(advanceYear(state, steady).ok, true);
    const entry = state.history.find(entry => entry.title.endsWith(`: ${event.name}`));
    if (entry) found = { state, entry };
  }
  assert.ok(found, 'a seeded noise event actually occurs');
  assert.match(found.entry.cause, /Your household's low Lifestyle \(1\.2\/10\)/);
  assert.doesNotMatch(found.entry.cause, /Mental stability/);
  assert.notEqual(found.state.lifestyle, original.lifestyle);
  assert.equal(validateSave(found.state), true);
  assert.deepEqual(migrateSave(copy(found.state)), found.state);
});

test('obsolete saved causes are omitted without inventing replacement ratings or changing custom prose', () => {
  const event = EVENTS.find(event => event.id === 'household_parent_sleepless');
  const old = "Alex Reed's low Mental stability (1.2/10) contributed to this event (start-of-year ratings).";
  assert.equal(formatEventCause(old, event), '');
  assert.equal(formatEventCause(old + ' <em>Saved note</em>', event), '<em>Saved note</em>');
  assert.equal(formatEventCause('A custom explanation.', event), 'A custom explanation.');
  assert.equal(formatEventCause(undefined, event), '');
  const supported = 'Your low Health (2.3/10) contributed to this event (start-of-year ratings).';
  assert.equal(formatEventCause(supported, { statFactors: [['health', 'low']] }), 'Low health contributed to this event.');
});
