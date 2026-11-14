import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, eventChances } from '../events.js';
import { createGame, advanceYear, annualForecast, chooseEducation, validateSave, migrateSave } from '../engine.js';
import { focusBudget, temporaryFocusPoints } from '../focus-rules.js';
import { createSchoolRecord, EXTRACURRICULARS } from '../school.js';
import { heightReference } from '../growth.js';
import { changedRating } from '../rating-changes.js';

const ids = ['school_sports_injury', 'sports_teammate_invite', 'study_headache', 'teacher_study_feedback',
  'school_activity_showcase', 'club_deadline_pressure', 'school_friends_outing', 'family_recipe_lesson'];
const additions = ids.map(id => EVENTS.find(event => event.id === id));
const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} versus ${expected}`);

function pupil(age = 12) {
  const state = createGame({ seed: 81023 });
  state.age = age;
  state.conditions = [];
  state.effects = [];
  state.maturityAge = 18;
  state.height = heightReference(age, state.growthSex).median / 2.54;
  state.lifestyle = 5;
  state.focus = { work: 1, social: 1, family: 1, self: 1, sports: 1, extracurricular: 1 };
  for (const person of [state, ...state.parents]) for (const key of Object.keys(person.stats)) {
    person.stats[key] = 5;
    person.aptitudes[key] = 0;
  }
  state.school = createSchoolRecord(state);
  state.school.sports = { id: 'basketball', success: null };
  state.school.extracurricular = { id: 'chess', success: null };
  return state;
}
const chanceOf = (state, id) => eventChances(state, state.stats).find(event => event.id === id).chance;

test('eight school activity events keep concrete outcomes and temporary time costs without a deadline mental penalty', () => {
  assert.equal(additions.length, 8);
  assert.ok(additions.every(Boolean));
  assert.equal(new Set(EVENTS.map(event => event.id)).size, EVENTS.length);
  assert.deepEqual(additions.find(event => event.id === 'school_sports_injury').statChanges, { attractiveness: -.3 });
  for (const event of additions) {
    assert.equal(event.minAge, 5);
    assert.equal(event.maxAge, 17);
    assert.equal(event.choices, undefined, `${event.id} is an automatic incident`);
    assert.equal(event.statFactors, undefined, `${event.id} depends on participation, not a stat threshold`);
    assert.equal(event.focusFactors, undefined, 'new participation scaling does not reinterpret legacy focus factors');
    assert.deepEqual(event.modifiers, {});
    if (['study_headache', 'club_deadline_pressure'].includes(event.id)) {
      assert.equal(event.activityFocus, event.id === 'study_headache' ? 'work' : 'extracurricular');
      assert.equal(event.minFocus, event.id === 'study_headache' ? 3 : 1);
      assert.equal(event.focusPoints, -1);
      assert.equal(event.years, 1);
      assert.equal(event.statChanges, undefined, 'a time cost does not create a permanent stat penalty');
    } else {
      assert.equal(event.years, 0);
      assert.equal(event.minFocus, 1);
      assert.ok(Object.values(event.statChanges).every(amount => Math.abs(amount) <= .3 && amount !== 0));
    }
  }
});

test('a rolled club deadline removes one total point for the next full year, including entry into adulthood, then expires without refilling', () => {
  const event = additions.find(event => event.id === 'club_deadline_pressure');
  for (const age of [12, 17]) {
    const original = pupil(age);
    original.focus = { work: 2, social: 2, family: 2, self: 2, sports: 0, extracurricular: 2 };
    const legacy = { id: event.id, name: event.name, description: 'A saved old penalty.', kind: 'negative', years: 3, modifiers: { stability: -.2 } };
    if (age === 12) original.effects = [copy(legacy)];
    assert.deepEqual(migrateSave(copy(original)), original, 'an existing timed mental effect is preserved on load');
    const forecast = annualForecast(original);
    let received;
    for (let attempt = 1; attempt <= 2000; attempt++) {
      const state = copy(original);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      if (state.lastYearEvents.length === 1 && state.lastYearEvents[0] === event.id) { received = state; break; }
    }
    assert.ok(received, `an isolated automatic deadline event can roll at ${age}`);
    assert.equal(received.age, age + 1);
    assert.deepEqual(received.yearSummary.stats, forecast.stats, 'the deadline itself changes no rating, including mental stability');
    assert.equal(received.yearSummary.decisions.focusBudget, 10, 'the triggering school year used its original budget');
    assert.equal(received.yearSummary.decisions.focusPointModifier, undefined);
    const pointEffect = received.effects.find(effect => effect.focusPoints === -1);
    assert.ok(pointEffect);
    assert.equal(pointEffect.id, age === 12 ? `${event.id}:limits` : event.id);
    assert.equal(pointEffect.years, 1, 'the new effect still has one complete playable year');
    assert.deepEqual(pointEffect.modifiers, {});
    assert.equal(temporaryFocusPoints(received), -1);
    assert.equal(focusBudget(received), age === 17 ? 7 : 9);
    assert.equal(Object.values(received.focus).reduce((sum, points) => sum + points, 0), focusBudget(received));
    if (age === 12) assert.deepEqual(received.effects.find(effect => effect.id === event.id), { ...legacy, years: 2 }, 'the point loss coexists with the old stat effect');
    const entry = received.history.find(entry => entry.title === event.name);
    assert.equal(entry.text, '-1 focus point. Temporary effects: 1 year.');
    assert.equal(received.yearSummary.events.find(entry => entry.title === event.name).text, entry.text);
    assert.deepEqual(migrateSave(copy(received)), received);
    if (age === 17) assert.equal(chooseEducation(received, 'work').ok, true);
    const allocated = copy(received.focus), nextForecast = annualForecast(received), saved = copy(received);
    assert.deepEqual(migrateSave(copy(received)), saved);
    let completed;
    for (let attempt = 1; attempt <= 1000; attempt++) {
      const state = copy(received);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      if (!state.lastYearEvents.length) { completed = state; break; }
    }
    assert.ok(completed, 'an event-free next year isolates expiry');
    assert.deepEqual(completed.yearSummary.stats, nextForecast.stats, 'the complete next routine uses the reduced allocation');
    assert.deepEqual(completed.yearSummary.decisions.focus, allocated);
    assert.equal(completed.yearSummary.decisions.focusBudget, age === 17 ? 7 : 9);
    assert.equal(completed.yearSummary.decisions.focusPointModifier, -1);
    assert.equal(completed.effects.some(effect => effect.id === pointEffect.id && effect.focusPoints === -1), false);
    assert.equal(temporaryFocusPoints(completed), 0);
    assert.equal(focusBudget(completed), age === 17 ? 8 : 10);
    assert.deepEqual(completed.focus, allocated, 'expiry restores the total budget without allocating the recovered point');
    assert.equal(validateSave(completed), true);
    assert.deepEqual(migrateSave(copy(completed)), completed, 'the expired effect leaves its historical decision budget valid');
  }
});

test('only participating school pupils can roll activity events and higher selected focus increases their odds', () => {
  for (const event of additions) {
    const state = pupil(), maximum = ['sports', 'extracurricular'].includes(event.activityFocus) ? 2 : 4;
    let previous = 0;
    for (let points = 0; points <= maximum; points++) {
      state.focus[event.activityFocus] = points;
      const before = copy(state), chance = chanceOf(state, event.id);
      if (points < event.minFocus) assert.equal(chance, 0, `${event.id}: ${points} is not enough participation`);
      else {
        assert.ok(chance > previous, `${event.id}: more participation creates more opportunities`);
        near(chance, Math.min(.18, event.baseChance * 3 * points));
      }
      assert.ok(chance >= 0 && chance <= .18);
      assert.deepEqual(state, before, 'reading event odds preserves ratings, enrollment and RNG');
      previous = chance;
    }
    for (const age of [5, 17]) assert.ok(chanceOf({ ...state, age }, event.id) > 0);
    for (const age of [0, 4, 18, 25]) {
      assert.equal(chanceOf({ ...state, age, education: { status: age >= 18 ? 'college' : 'school' } }, event.id), 0, `${event.id} remains a school-age event`);
    }
    assert.equal(chanceOf({ ...state, ended: true }, event.id), 0);
    assert.equal(chanceOf({ ...state, needsSuccession: true }, event.id), 0);
  }
});

test('new event probabilities ignore personal ratings and affinities while preserving old focus scaling', () => {
  for (const event of additions) {
    const state = pupil();
    state.focus[event.activityFocus] = event.minFocus;
    const expected = chanceOf(state, event.id);
    for (const value of [0, 10]) {
      const extreme = copy(state);
      for (const key of Object.keys(extreme.stats)) {
        extreme.stats[key] = value;
        extreme.aptitudes[key] = value === 0 ? -3 : 3;
      }
      assert.equal(chanceOf(extreme, event.id), expected, `${event.id} is not health- or talent-gated`);
    }
  }
  const state = pupil();
  for (const [points, expected] of [0, 1, 2, 3, 4].map((points, i) => [points, [.0216, .04185, .0621, .0756, .0891][i]])) {
    state.focus.work = points;
    near(chanceOf(state, 'extra_lessons'), expected);
  }
});

test('sport and extracurricular events require eligible enrollment, and generic club events work for every club', () => {
  for (const kind of ['sports', 'extracurricular']) {
    const state = pupil(), events = additions.filter(event => event.activityFocus === kind);
    state.focus[kind] = 2;
    for (const event of events) {
      assert.ok(chanceOf(state, event.id) > 0);
      assert.equal(chanceOf({ ...state, school: null }, event.id), 0);
      assert.equal(chanceOf({ ...state, school: { ...state.school, [kind]: null } }, event.id), 0);
      assert.equal(chanceOf({ ...state, school: { ...state.school, [kind]: { id: 'unknown', success: null } } }, event.id), 0);
    }
  }
  const paused = pupil();
  paused.school.sports.id = 'lacrosse';
  paused.focus.sports = 2;
  for (const event of additions.filter(event => event.activityFocus === 'sports')) {
    assert.equal(chanceOf({ ...paused, lifestyle: 6.99 }, event.id), 0, 'a paused sport cannot cause a practice incident');
    assert.ok(chanceOf({ ...paused, lifestyle: 7 }, event.id) > 0);
  }
  const state = pupil();
  for (const club of EXTRACURRICULARS) {
    state.school.extracurricular.id = club.id;
    for (const event of additions.filter(event => event.activityFocus === 'extracurricular')) assert.ok(chanceOf(state, event.id) > 0, `${club.id}: ${event.id}`);
  }
});

test('new automatic activity incidents roll normally and record actual permanent changes within the annual event cap', () => {
  for (const event of additions.filter(event => event.statChanges)) {
    const original = pupil();
    original.focus[event.activityFocus] = ['sports', 'extracurricular'].includes(event.activityFocus) ? 2 : 4;
    let found;
    for (let attempt = 1; attempt <= 800; attempt++) {
      const state = copy(original);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      assert.ok(state.lastYearEvents.length <= 5, 'new events share the existing annual cap');
      if (state.lastYearEvents.includes(event.id)) { found = state; break; }
    }
    assert.ok(found, `${event.id} can actually roll`);
    const recorded = found.history.find(entry => entry.title === event.name);
    const [stat, amount] = Object.entries(event.statChanges)[0];
    const label = stat === 'stability' ? 'mental stability' : stat;
    const values = recorded.text.match(new RegExp(`^Your ${label} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)\\.$`));
    assert.ok(values, `${event.id} records only its intended stat: ${recorded.text}`);
    assert.equal(Number(values[2]), changedRating(Number(values[1]), amount));
    assert.equal(found.yearSummary.events.find(entry => entry.title === event.name).text, recorded.text);
    assert.equal(found.effects.some(effect => effect.id === event.id), false, 'rating changes remain permanent');
    assert.equal(validateSave(found), true);
    assert.deepEqual(migrateSave(copy(found)), found);
  }
});
