import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_EVENTS, familyEventChances, FAMILY_EVENT_RATE_MULTIPLIER } from '../family-events.js';
import { createGame, advanceYear, validateSave, migrateSave, focusLimits } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const additions = FAMILY_EVENTS.filter(event => event.category === 'Parent mental stability');
const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function fixture(age = 10) {
  const state = createGame({ seed: 90411 });
  state.age = age;
  state.maturityAge = 18;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.school = age >= 5 ? createSchoolRecord(state) : null;
  for (const person of [state, ...state.parents]) {
    for (const key in person.stats) person.stats[key] = 5;
    for (const key in person.aptitudes) person.aptitudes[key] = 0;
  }
  for (const person of state.parents) { person.age = 40; person.relationship = 7; }
  return state;
}
const chance = (state, event, subject = state.parents[0]) => familyEventChances(state).find(roll => roll.eventId === event.id && roll.subjectId === subject.id)?.chance ?? 0;

test('parent stability catalog has small incidents, major disruptions, and substantial support', () => {
  assert.equal(additions.length, 12);
  assert.equal(additions.filter(event => event.minStability !== undefined).length, 4);
  assert.equal(additions.filter(event => event.maxStability !== undefined && event.kind === 'negative').length, 5);
  assert.equal(additions.filter(event => event.maxStability !== undefined && event.kind === 'positive').length, 3);
  assert.ok(additions.every(event => !event.choices && event.subjectType === 'parent' && event.minAge === 18 && event.maxPlayerAge === 17));
  assert.ok(additions.every(event => ['minor', 'moderate', 'major'].includes(event.severity)));
  const negative = additions.filter(event => event.kind === 'negative');
  const minor = negative.filter(event => event.severity === 'minor');
  const major = negative.filter(event => event.severity === 'major');
  assert.equal(major.length, 2);
  assert.ok(major.every(event => event.maxStability === 2 && event.playerChanges.stability <= -.8 && event.playerChanges.social <= -.5));
  assert.deepEqual(minor.map(event => event.id).sort(), ['household_parent_cancelled_outing', 'household_parent_missed_meeting']);
  assert.ok(minor.every(event => event.playerChanges?.stability === undefined && event.subjectChanges?.stability === undefined),
    'one cancellation or missed meeting affects connection and trust without lasting mental-stability penalties');
  assert.ok(major.every(event => minor.every(small => changedRating(5, event.playerChanges.stability) < changedRating(5, small.playerChanges?.stability ?? 0) - .5)));
  const care = additions.find(event => event.id === 'household_parent_psychiatric_admission');
  assert.equal(care.relationship, undefined, 'receiving psychiatric care does not automatically damage the relationship');
  assert.ok(additions.every(event => event.subjectChanges?.stability === undefined), 'a parent stability trigger cannot change that same parent rating');
  assert.equal(care.subjectChanges.social, -.4, 'separation still affects the parent social connections');
  assert.equal(care.years, 1);
  assert.deepEqual(care.focusCapacity, { standard: { work: -1, social: -1 } });
  const support = additions.find(event => event.id === 'household_parent_family_care_plan');
  assert.equal(support.playerChanges.stability, .65, 'support can still improve the child stability when the parent rating triggered it');
  assert.equal(support.relationship, .5);
});

test('mental-stability thresholds use the named parent and retain curved odds within each band', () => {
  for (const event of additions) {
    const state = fixture(), parent = state.parents[0], other = state.parents[1];
    const low = event.maxStability !== undefined;
    parent.stats.stability = low ? event.maxStability : event.minStability;
    other.stats.stability = low ? 10 : 0;
    state.stats.stability = low ? 10 : 0;
    const before = copy(state);
    assert.ok(chance(state, event) > 0, event.id);
    assert.equal(chance(state, event, other), 0, 'another parent does not borrow the triggering parent rating');
    state.stats.stability = low ? 0 : 10;
    assert.equal(chance(state, event), chance(before, event), 'player stability does not control a parent event');
    parent.stats.stability = low ? event.maxStability + .01 : event.minStability - .01;
    assert.equal(chance(state, event), 0, 'threshold excludes the neighboring rating');
    parent.stats.stability = low ? 0 : 10;
    assert.ok(chance(state, event) > chance(before, event), 'extreme values increase eligible event odds');
    parent.stats.stability = NaN;
    assert.equal(chance(state, event), 0, 'missing or non-finite ratings cannot trigger the event');
    assert.deepEqual(before.rng, state.rng);
  }
  const state = fixture(), parent = state.parents[0];
  const old = FAMILY_EVENTS.find(event => event.id === 'household_parent_missed_pickup');
  const factor = .08 + 3.68 * ((10 - parent.stats.stability) / 9) ** 2;
  assert.equal(chance(state, old), old.baseChance * FAMILY_EVENT_RATE_MULTIPLIER * factor, 'older event rates retain their formula');
});

test('parent mental-stability events respect age, presence, death, and guardianship', () => {
  for (const event of additions) {
    const state = fixture(Math.max(5, event.minPlayerAge)), subject = state.parents[0];
    subject.stats.stability = event.maxStability ?? event.minStability;
    const before = copy(state);
    assert.ok(chance(state, event) > 0);
    familyEventChances(state);
    assert.deepEqual(state, before, 'odds reads preserve saves and RNG');
    subject.alive = false;
    assert.equal(chance(state, event), 0);
    subject.alive = true;
    subject.abandonedAt = state.age;
    assert.equal(chance(state, event), 0);
    delete subject.abandonedAt;
    state.age = 18;
    assert.equal(chance(state, event), 0);
    state.age = event.minPlayerAge - 1;
    assert.equal(chance(state, event), 0);
    state.age = 10;
    subject.age = 17;
    assert.equal(chance(state, event), 0);
    subject.age = 40;
    state.parents = [];
    assert.equal(chance(state, event, subject), 0);
    state.guardian = subject;
    assert.ok(chance(state, event, subject) > 0, 'the current guardian can provide the same childhood experiences');
  }
});

test('every new parent event can roll, records its actual impact, and preserves a valid unchanged reload', () => {
  for (const event of additions) {
    const original = fixture(), parent = original.parents[0];
    parent.stats.stability = event.maxStability !== undefined ? .5 : 9;
    const key = `${event.id}:${parent.id}`;
    let found;
    for (let seed = 1; seed <= 1500; seed++) {
      const state = copy(original);
      state.rng = Math.imul(seed, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      if (state.lastYearEvents.includes(key)) { found = state; break; }
    }
    assert.ok(found, `${event.id} appears in ordinary independent rolls`);
    const result = found.history.find(entry => entry.title === `${parent.name}: ${event.name}`);
    assert.ok(result);
    assert.equal(result.description, event.description.replaceAll('{name}', parent.name));
    for (const [key, amount] of Object.entries(event.playerChanges || {})) {
      const label = { stability: 'mental stability', social: 'social', health: 'health', intelligence: 'intelligence' }[key];
      const values = result.text.match(new RegExp(`Your ${label} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
      assert.ok(values, `${event.id} records player ${key}`);
      assert.equal(Number(values[2]), changedRating(Number(values[1]), amount));
    }
    if (event.focusCapacity) {
      const effect = found.effects.find(entry => entry.id === key);
      assert.equal(effect.years, 1, 'new restriction remains for the next complete year');
      assert.deepEqual(effect.focusCapacity, event.focusCapacity);
      assert.ok(focusLimits(found).work <= 3 && focusLimits(found).social <= 3);
      assert.match(result.text, /-1 School focus capacity/);
    }
    assert.ok(found.lastYearEvents.length <= 5);
    assert.equal(validateSave(found), true, event.id);
    assert.deepEqual(migrateSave(copy(found)), found, 'loading preserves stats, focus, effects, history, decisions, and RNG');
  }
});
