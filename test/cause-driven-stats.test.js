import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, migrateSave, validateSave } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { skillChanges, childhoodWellbeing } from '../development.js';
import { changedRating } from '../rating-changes.js';
import { attractivenessAgeChange } from '../relationships.js';

const keys = ['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'];
const learned = ['intelligence', 'strength', 'social', 'creativity'];
const copy = value => structuredClone(value);
const round = value => Math.round(value * 100) / 100;
const steady = { mortalityRandom: () => 1, parentCareerRandom: () => 1 };

function fixture(age = 3, rating = 5) {
  const state = createGame({ seed: 58467 });
  state.age = age;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.education = { status: age >= 18 ? 'workforce' : 'school', years: 0 };
  state.lifestyle = 5;
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  for (const person of [state, ...state.parents]) {
    person.conditions = [];
    for (const key of keys) { person.stats[key] = person === state ? rating : 5; person.aptitudes[key] = 0; }
    if (person !== state) { person.relationship = 7; person.career.focus = 3; }
  }
  return state;
}

// Use actual independent event rolls, retaining only a year with no event
// outcome so assertions measure the routine and its full bounded noise range.
function quietYear(template, draw) {
  for (let rng = 1; rng <= 1500; rng++) {
    const state = { ...copy(template), rng };
    let draws = 0;
    assert.equal(advanceYear(state, { ...steady, growthRandom: () => { draws++; return draw; } }).ok, true);
    if (!state.lastYearEvents.length) return { state, draws };
  }
  assert.fail('Could not isolate an event-free routine');
}

test('neutral personal ratings do not seek a middle or innate target at any starting rating or aptitude', () => {
  for (const age of [2, 4, 20, 40, 70]) for (const rating of [0, 1, 5, 9, 10]) for (const aptitude of [-3, 0, 3]) {
    const person = { age, alive: true, stats: Object.fromEntries(keys.map(key => [key, rating])),
      aptitudes: Object.fromEntries(keys.map(key => [key, aptitude])), focus: defaultFocus(age) };
    assert.deepEqual(skillChanges(person), Object.fromEntries(learned.map(key => [key, 0])), `${age}, rating ${rating}, aptitude ${aptitude}`);
    if (age < 18) assert.deepEqual(childhoodWellbeing(person), { health: 0, stability: 0 });
  }
  for (const age of [5, 17]) for (const rating of [0, 1, 9, 10]) {
    const person = fixture(age, rating);
    assert.deepEqual(childhoodWellbeing(person), { health: 0, stability: 0 }, 'neutral school wellbeing has no recovery or downward drift');
  }
});

test('neutral toddler and young-adult forecasts preserve all seven ratings and parent wellbeing', () => {
  for (const age of [2, 3, 4, 20]) for (const rating of [0, 1, 5, 9, 10]) {
    const state = fixture(age, rating);
    for (const parent of state.parents) parent.stats.stability = rating;
    const before = copy(state), forecast = annualForecast(state);
    for (const key of keys) assert.equal(forecast.stats[key].change, 0, `${age}: ${key} at ${rating}`);
    assert.ok(forecast.parents.every(parent => parent.stability.change === 0 && parent.relationship.change === 0));
    assert.deepEqual(state, before, 'forecast reads never adjust saved ratings, records or RNG');
  }
});

test('bounded annual noise cannot invent movement when the routine has no contribution', () => {
  for (const age of [3, 20]) for (const rating of [1, 5, 9]) for (const draw of [-3, 0, 3]) {
    const before = fixture(age, rating), { state } = quietYear(before, draw);
    assert.deepEqual(state.stats, before.stats, `${age}: neutral ratings ${rating}, noise ${draw}`);
    for (let index = 0; index < state.parents.length; index++) {
      assert.equal(state.parents[index].stats.stability, before.parents[index].stats.stability);
      assert.equal(state.parents[index].relationship, before.parents[index].relationship, 'neutral relationships have no independent residual');
    }
  }
});

test('zero toddler Family time lowers low parent stability until a positive cause intervenes', () => {
  const template = fixture();
  template.focus.family = 0;
  for (const parent of template.parents) parent.stats.stability = 2.3;
  const forecast = annualForecast(template);
  for (const parent of forecast.parents) assert.ok(parent.stability.after < 2.3);
  for (const draw of [-3, 0, 3]) {
    let state = copy(template);
    for (let year = 0; year < 2; year++) {
      const before = state.parents.map(parent => parent.stats.stability);
      state = quietYear(state, draw).state;
      state.pendingEvents = [];
      for (let index = 0; index < before.length; index++) assert.ok(state.parents[index].stats.stability < before[index], 'no automatic recovery can overwhelm the negative Family contribution');
    }
  }
});

test('family members have no hidden neutral stat movement outside their explicit aging effects', () => {
  const template = fixture(20);
  const relative = (id, age, rating) => {
    const person = { ...copy(template.parents[0]), id, age, money: 0, school: null, yearsTogether: 1, married: false };
    for (const key of keys) person.stats[key] = rating;
    person.career.focus = 3;
    return person;
  };
  template.partner = relative('neutral-partner', 20, 9);
  template.children = [relative('neutral-toddler', 3, 1), relative('neutral-schoolchild', 8, 9)];
  template.siblings = [relative('neutral-sibling', 20, 1)];
  template.guardian = relative('neutral-guardian', 50, 1);
  for (const draw of [-3, 3]) {
    const { state } = quietYear(template, draw);
    const oldPeople = [...template.parents, template.guardian, template.partner, ...template.children, ...template.siblings];
    const newPeople = [...state.parents, state.guardian, state.partner, ...state.children, ...state.siblings];
    for (let index = 0; index < oldPeople.length; index++) {
      const before = oldPeople[index], after = newPeople[index];
      for (const key of keys) {
        const mean = key === 'attractiveness' ? changedRating(before.stats[key], attractivenessAgeChange(before)) - before.stats[key] : 0;
        const expected = round(before.stats[key] + mean * (1 + draw * .3));
        assert.equal(after.stats[key], expected, `${before.id}: ${key}, noise ${draw}`);
      }
      assert.equal(after.relationship, before.relationship, `${before.id}: neutral family contact`);
    }
  }
});

test('the same caused gain is faster low on the scale and the same caused loss is faster high', () => {
  for (const key of keys) {
    assert.ok(changedRating(1, .2) - 1 > changedRating(9, .2) - 9, key);
    assert.ok(9 - changedRating(9, -.2) > 1 - changedRating(1, -.2), key);
    for (const value of [0, 1, 5, 9, 10]) assert.equal(changedRating(value, 0), value);
  }
  const low = fixture(3, 1), high = fixture(3, 9);
  low.focus.self = high.focus.self = 3;
  for (const key of ['health', 'stability']) assert.ok(annualForecast(low).stats[key].change > annualForecast(high).stats[key].change);
});

test('extreme annual variation scales a caused change without reversing it or disturbing unaffected ratings', () => {
  for (const level of [0, 4]) {
    const template = fixture();
    template.focus = { work: level, social: level === 4 ? 1 : 2, family: level === 4 ? 1 : 2, self: level, creative: 0 };
    const forecast = annualForecast(template);
    for (const draw of [-3, 0, 3]) {
      const { state } = quietYear(template, draw);
      for (const key of keys) {
        const mean = forecast.stats[key].change;
        const rate = ['health', 'stability'].includes(key) ? .25 : key === 'attractiveness' ? .3 : .1;
        const expected = round(Math.max(0, Math.min(10, template.stats[key] + mean * (1 + draw * rate))));
        assert.equal(state.stats[key], expected, `${key}, focus ${level}, noise ${draw}`);
        assert.equal(Math.sign(state.stats[key] - template.stats[key]), Math.sign(mean));
      }
    }
  }
});

test('aging and school inactivity remain real causes after removing arbitrary drift', () => {
  const older = fixture(70), aging = annualForecast(older);
  assert.ok(aging.stats.health.change < 0);
  assert.ok(aging.stats.attractiveness.change < 0);
  for (const key of ['stability', ...learned]) assert.equal(aging.stats[key].change, 0);
  const pupil = fixture(12), inactivity = annualForecast(pupil);
  for (const key of learned) assert.ok(inactivity.stats[key].change < 0, `${key}: missing activity has its explicit inactivity cost`);
  for (const key of ['health', 'stability', 'attractiveness']) assert.equal(inactivity.stats[key].change, 0);
});

test('neutral and caused routines retain the same random draw schedule and saved ratings reload unchanged', () => {
  const neutral = fixture(), active = copy(neutral);
  active.focus.work = 3; active.focus.creative = 1;
  const a = quietYear(neutral, 0), b = quietYear(active, 0);
  assert.equal(a.draws, b.draws, 'zero contributions still consume their scheduled routine draw');
  assert.equal(validateSave(neutral), true);
  const saved = copy(neutral), reloaded = migrateSave(copy(saved));
  assert.deepEqual(reloaded, saved);
  assert.deepEqual(annualForecast(reloaded), annualForecast(saved));
  assert.deepEqual(reloaded, saved);
  const options = { ...steady, growthRandom: () => 3 };
  advanceYear(saved, options); advanceYear(reloaded, options);
  assert.deepEqual(reloaded, saved, 'reload does not alter future events or random state');
});
