import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, createGame, advanceYear, annualForecast, resolveEventChoice,
  validateSave, migrateSave, setFocus, focusLimits, currentEffects, effectiveStats } from '../engine.js';
import { defaultFocus, focusBudget, temporaryFocusPoints } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';

const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const spent = state => Object.values(state.focus).reduce((sum, points) => sum + points, 0);
const effect = (id, focusPoints, years = 1) => ({ id, name: id, description: '', kind: focusPoints < 0 ? 'negative' : 'positive', modifiers: {}, years, focusPoints });
function pupil(age = 12) {
  const state = createGame({ seed: 7301 });
  state.age = age;
  state.maturityAge = 18;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
  }
  return state;
}
function choice(state, outcome) {
  const event = EVENTS.find(entry => entry.id === (state.age < 5 ? 'school_play' : 'school_team'));
  const original = event.choices;
  event.choices = [{ id: 'point-fixture', label: 'Adjust the schedule', description: '', ...outcome }];
  state.pendingEvents = [{ eventId: event.id, age: state.age }];
  state.lastYearEvents = [event.id];
  try { assert.equal(resolveEventChoice(state, 'point-fixture', event.id).ok, true); }
  finally { event.choices = original; }
  return event.id;
}
function quietYear(state) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const next = copy(state);
    next.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(next, calm).ok, true);
    if (!next.lastYearEvents.length) return next;
  }
  assert.fail('No ordinary-event-free year found');
}

test('a point-only choice immediately reduces the budget for one complete turn and preserves ratings and RNG', () => {
  const state = pupil();
  state.focus.work = 4;
  const before = copy(state), id = choice(state, { focusPoints: -1, years: 1 });
  assert.equal(focusBudget(state), 9, 'the budget loses one whole point, without the yearly stat multiplier');
  assert.equal(temporaryFocusPoints(state), -1);
  assert.equal(spent(state), 9);
  assert.equal(state.focus.work, 3, 'only the excess point is removed deterministically');
  assert.deepEqual(state.stats, before.stats);
  assert.deepEqual(state.aptitudes, before.aptitudes);
  assert.equal(state.rng, before.rng);
  assert.equal(state.age, before.age);
  assert.deepEqual(state.effects.find(entry => entry.id === id).modifiers, {});
  assert.match(state.history[0].text, /Adjust the schedule\. -1 focus point\. Temporary effects: 1 year\./);
  assert.doesNotMatch(state.history[0].text, /No stat changes/);
  assert.equal(setFocus(state, 'work', 4).ok, false);
  const saved = copy(state);
  const forecast = annualForecast(state);
  currentEffects(state); focusBudget(state); temporaryFocusPoints(state);
  assert.deepEqual(state, saved, 'budget and forecast reads never spend time, refill choices, or consume RNG');
  assert.deepEqual(migrateSave(copy(state)), state);
  const next = quietYear(state);
  assert.deepEqual(next.yearSummary.stats, forecast.stats);
  assert.deepEqual(next.yearSummary.decisions.focus, state.focus);
  assert.equal(next.yearSummary.decisions.focusBudget, 9);
  assert.equal(next.yearSummary.decisions.focusPointModifier, -1);
  assert.equal(next.effects.some(entry => entry.id === id), false);
  assert.equal(focusBudget(next), 10);
  assert.deepEqual(next.focus, state.focus, 'expiry restores capacity without refilling allocations');
  assert.equal(validateSave(next), true);
  assert.deepEqual(migrateSave(copy(next)), next, 'the reduced historical budget remains valid after the effect expires');
});

test('timed point changes stack with each other and lifelong budgets while caps remain independent', () => {
  const state = pupil();
  state.conditions = ['high_energy', 'autism'];
  state.focus = { work: 4, social: 1, family: 3, self: 3, sports: 0, extracurricular: 0 };
  state.effects = [effect('extra-time', 1, 2)];
  choice(state, { focusPoints: -2, years: 1, focusLimits: { standard: { self: 1 } } });
  assert.equal(focusBudget(state), 10, '10 base +1 lifelong +1 temporary -2 temporary');
  assert.equal(temporaryFocusPoints(state), -1);
  assert.equal(focusLimits(state).social, 1);
  assert.equal(focusLimits(state).self, 1);
  assert.equal(state.focus.self, 1);
  assert.equal(spent(state), 9, 'unused capacity is not redistributed after the independent cap');
  assert.equal(validateSave(state), true);
  const next = quietYear(state);
  assert.equal(next.yearSummary.decisions.focusBudget, 10);
  assert.equal(next.yearSummary.decisions.focusPointModifier, -1);
  assert.equal(focusBudget(next), 12);
  assert.equal(temporaryFocusPoints(next), 1);
  assert.equal(focusLimits(next).self, 4);
  assert.equal(focusLimits(next).social, 1);
  assert.deepEqual(next.focus, state.focus);
  assert.equal(validateSave(next), true);
  const expired = quietYear(next);
  assert.equal(expired.yearSummary.decisions.focusPointModifier, 1);
  assert.equal(expired.yearSummary.decisions.focusBudget, 12);
  assert.equal(focusBudget(expired), 11);
  assert.deepEqual(expired.focus, state.focus);
  assert.equal(validateSave(expired), true);
});

test('refreshing an event replaces stale point changes and preserves a separate saved stat modifier', () => {
  const state = pupil();
  state.effects = [{ id: 'school_team', name: 'Legacy skill bonus', description: '', years: 3,
    kind: 'positive', modifiers: { intelligence: .5 } }];
  const rating = effectiveStats(state).intelligence;
  choice(state, { focusPoints: -1, years: 2 });
  assert.equal(state.effects.length, 2);
  assert.equal(state.effects.find(entry => entry.id === 'school_team:limits').focusPoints, -1);
  assert.equal(effectiveStats(state).intelligence, rating);
  choice(state, { focusPoints: -2, years: 1 });
  assert.equal(state.effects.length, 2);
  assert.equal(temporaryFocusPoints(state), -2, 'a repeated source replaces its amount instead of stacking with itself');
  assert.equal(state.effects.find(entry => entry.id === 'school_team:limits').years, 2);
  choice(state, { years: 1, focusLimits: { standard: { work: 1 } } });
  const refreshed = state.effects.find(entry => entry.id === 'school_team:limits');
  assert.equal(Object.hasOwn(refreshed, 'focusPoints'), false);
  assert.equal(focusBudget(state), 10);
  assert.equal(focusLimits(state).work, 1);
  assert.equal(effectiveStats(state).intelligence, rating);
  assert.equal(validateSave(state), true);
});

test('current budgets enforce point losses and floor at zero, while expired effects are ignored', () => {
  const state = pupil();
  state.focus.work = 4;
  state.effects = [effect('short-year', -1)];
  assert.equal(validateSave(state), false, 'existing allocations cannot exceed the reduced total');
  assert.equal(advanceYear(copy(state), calm).ok, false);
  assert.equal(setFocus(state, 'work', 3).ok, true);
  assert.equal(validateSave(state), true);
  state.effects.push(effect('another-loss', -4), effect('third-loss', -4), effect('fourth-loss', -4));
  assert.equal(focusBudget(state), 0);
  state.focus = Object.fromEntries(Object.keys(state.focus).map(key => [key, 0]));
  assert.equal(validateSave(state), true);
  const before = copy(state);
  const expired = { ...state, effects: state.effects.map(entry => ({ ...entry, years: 0 })) };
  assert.equal(temporaryFocusPoints(expired), 0);
  assert.equal(focusBudget(expired), 10);
  assert.deepEqual(state, before);
});

test('expiry of a positive point allowance trims only the newly excessive allocations', () => {
  const state = pupil();
  choice(state, { focusPoints: 4, years: 1 });
  assert.equal(focusBudget(state), 14);
  for (const [key, points] of Object.entries({ work: 4, social: 4, family: 4 })) assert.equal(setFocus(state, key, points).ok, true);
  assert.equal(spent(state), 14);
  const next = quietYear(state);
  assert.equal(next.yearSummary.decisions.focusPointModifier, 4);
  assert.equal(next.yearSummary.decisions.focusBudget, 14);
  assert.deepEqual(next.yearSummary.decisions.focus, state.focus);
  assert.equal(focusBudget(next), 10);
  assert.equal(spent(next), 10);
  assert.deepEqual(next.focus, { work: 2, social: 3, family: 3, self: 2, sports: 0, extracurricular: 0 });
  assert.equal(validateSave(next), true);
  assert.deepEqual(migrateSave(copy(next)), next);
});

test('birthday transitions preserve the recorded modifier and use the new stage budget without refilling', () => {
  const toddler = pupil(4);
  choice(toddler, { focusPoints: -1, years: 2 });
  const school = quietYear(toddler);
  assert.equal(school.age, 5);
  assert.equal(school.yearSummary.decisions.workLabel, 'Play');
  assert.equal(school.yearSummary.decisions.focusBudget, 9);
  assert.equal(school.yearSummary.decisions.focusPointModifier, -1);
  assert.equal(school.yearSummary.decisions.focus.creative, toddler.focus.creative);
  assert.equal(focusBudget(school), 9);
  assert.equal(spent(school), 7, 'the removed crafts allocation remains unspent');
  assert.equal(validateSave(school), true);
  const teen = pupil(17);
  teen.focus.work = 4;
  choice(teen, { focusPoints: -1, years: 2 });
  const adult = quietYear(teen);
  assert.equal(adult.yearSummary.decisions.focusBudget, 9);
  assert.equal(adult.yearSummary.decisions.focusPointModifier, -1);
  assert.deepEqual(adult.yearSummary.decisions.focusCaps, { sports: 2, extracurricular: 2 });
  assert.equal(focusBudget(adult), 7, 'adult base8 minus the remaining point loss');
  assert.equal(spent(adult), 7);
  assert.equal(validateSave(adult), true);
  assert.deepEqual(migrateSave(copy(adult)), adult);
});

test('historical budgets use their recorded modifier rather than current effects and reject forged metadata', () => {
  const prior = quietYear(pupil());
  const oldSummary = copy(prior.yearSummary);
  choice(prior, { focusPoints: -1, years: 1 });
  assert.deepEqual(prior.yearSummary.decisions, oldSummary.decisions);
  assert.equal(Object.hasOwn(prior.yearSummary.decisions, 'focusPointModifier'), false);
  assert.equal(validateSave(prior), true, 'new restrictions cannot invalidate an older ordinary-budget review');
  const next = quietYear(prior);
  assert.equal(next.effects.length, 0);
  assert.equal(validateSave(next), true);
  for (const bad of [0, .5, -257, 257, '1', null]) {
    const malformed = copy(next);
    malformed.yearSummary.decisions.focusPointModifier = bad;
    assert.equal(validateSave(malformed), false);
    assert.equal(migrateSave(malformed), null);
  }
  const missing = copy(next);
  delete missing.yearSummary.decisions.focusPointModifier;
  assert.equal(validateSave(missing), false, 'a reduced recorded budget requires its own modifier');
  const changed = copy(next);
  changed.yearSummary.decisions.focusBudget = 10;
  assert.equal(validateSave(changed), false);
  const zeroSum = pupil();
  zeroSum.effects = [effect('loss', -1), effect('gain', 1)];
  const cancelled = quietYear(zeroSum);
  assert.equal(Object.hasOwn(cancelled.yearSummary.decisions, 'focusPointModifier'), false);
  assert.equal(cancelled.yearSummary.decisions.focusBudget, 10);
  assert.equal(validateSave(cancelled), true);
});

test('schema20 accepts bounded nonzero effect points and retains old saves without adding metadata', () => {
  const state = pupil();
  for (const amount of [-4, -1, 1, 4]) {
    const valid = copy(state);
    valid.effects = [effect('bounded-points', amount)];
    valid.focus = Object.fromEntries(Object.keys(valid.focus).map(key => [key, 0]));
    assert.equal(validateSave(valid), true);
    assert.deepEqual(migrateSave(copy(valid)), valid);
  }
  for (const amount of [-5, 0, 5, .5, '-1', null, NaN]) {
    const malformed = copy(state);
    malformed.effects = [effect('bad-points', amount)];
    assert.equal(validateSave(malformed), false);
    assert.equal(migrateSave(malformed), null);
  }
  assert.deepEqual(migrateSave(copy(state)), state, 'existing schema20 saves gain no fields or allocation changes');
  const maximum = pupil();
  maximum.effects = Array.from({ length: 64 }, (_, index) => effect(`bonus-${index}`, 4));
  assert.equal(temporaryFocusPoints(maximum), 256);
  assert.equal(focusBudget(maximum), 266);
  assert.equal(validateSave(maximum), true);
  const ended = quietYear(maximum);
  assert.equal(ended.yearSummary.decisions.focusPointModifier, 256);
  assert.equal(ended.yearSummary.decisions.focusBudget, 266);
  assert.equal(focusBudget(ended), 10);
  assert.equal(validateSave(ended), true);
});

test('an actual study headache reduces the next playable total and appears in the completed event review', () => {
  let headache;
  for (let seed = 1; seed <= 300; seed++) {
    const state = pupil();
    state.rng = seed;
    state.focus.work = 4;
    assert.equal(advanceYear(state, calm).ok, true);
    if (state.lastYearEvents.includes('study_headache') && !state.pendingEvents.length) { headache = state; break; }
  }
  assert.ok(headache, 'the automatic headache is eligible and can roll for high study focus');
  assert.equal(headache.yearSummary.decisions.focusBudget, 10);
  assert.equal(Object.hasOwn(headache.yearSummary.decisions, 'focusPointModifier'), false);
  assert.equal(focusBudget(headache), 9);
  assert.equal(headache.effects.find(entry => entry.id === 'study_headache').years, 1);
  assert.ok(headache.yearSummary.events.some(entry => entry.text.includes('-1 focus point. Temporary effects: 1 year.')));
  assert.equal(validateSave(headache), true);
  assert.deepEqual(migrateSave(copy(headache)), headache);
  const next = quietYear(headache);
  assert.equal(next.yearSummary.decisions.focusPointModifier, -1);
  assert.equal(next.yearSummary.decisions.focusBudget, 9);
  assert.equal(focusBudget(next), 10);
  assert.equal(next.effects.some(entry => entry.id === 'study_headache'), false);
  assert.equal(validateSave(next), true);
});
