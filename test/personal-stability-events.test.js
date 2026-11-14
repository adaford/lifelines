import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS as PERSONAL_EVENTS, eventChances } from '../events.js';
import { createGame, advanceYear, chooseEducation, resolveEventChoice, EVENTS,
  eventOdds, effectiveStats, focusLimits, focusMinimums, validateSave, migrateSave } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const additions = PERSONAL_EVENTS.filter(event => event.id.startsWith('mental_'));
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const copy = value => structuredClone(value);
function fixture(age = 15, stability = 5) {
  const state = createGame({ seed: 91501 });
  state.age = Math.min(age, 17);
  state.maturityAge = 18;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(state.age);
  state.school = state.age >= 5 && state.age < 18 ? createSchoolRecord(state) : null;
  if (age >= 18) {
    assert.equal(advanceYear(state, calm).ok, true);
    resolveChoices(state);
    assert.equal(chooseEducation(state, 'work').ok, true);
    state.effects = [];
    state.lastYearEvents = [];
    state.focus = defaultFocus(age);
  }
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
  }
  state.stats.stability = stability;
  return state;
}
const chance = (state, id, stats = effectiveStats(state)) => eventChances(state, stats).find(event => event.id === id).chance;
function resolveChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
  }
}

test('personal mental-stability catalog keeps severity and support while affecting only different stats', () => {
  assert.equal(additions.length, 12);
  assert.ok(additions.every(event => event.category === 'Mental stability' && !event.choices));
  assert.equal(additions.filter(event => event.minStability !== undefined).length, 4);
  assert.equal(additions.filter(event => event.maxStability !== undefined && event.kind === 'negative').length, 5);
  assert.equal(additions.filter(event => event.maxStability !== undefined && event.kind === 'positive').length, 3);
  const admission = additions.find(event => event.id === 'mental_inpatient_admission');
  assert.equal(admission.severity, 'major');
  assert.equal(admission.minAge, 13);
  assert.equal(admission.maxStability, 2);
  assert.equal(admission.statChanges.social, -1.1);
  assert.equal(admission.statChanges.stability, undefined, 'an event caused by Mental stability cannot change that rating');
  assert.match(admission.description, /secure psychiatric ward against your wishes/);
  const minor = additions.find(event => event.id === 'mental_leave_gathering');
  assert.ok(Math.abs(admission.statChanges.social) >= 4 * Math.abs(minor.statChanges.social));
  assert.ok(additions.some(event => event.kind === 'positive' && event.maxStability !== undefined && event.statChanges?.social >= .45));
  assert.ok(additions.some(event => event.minStability >= 8 && event.statChanges.social >= .7));
  for (const event of additions) {
    assert.equal(event.statChanges?.stability, undefined, event.id);
    assert.deepEqual(event.modifiers, {}, 'stat outcomes are permanent base changes');
    assert.ok(['minor', 'moderate', 'major'].includes(event.severity));
    assert.ok(event.baseChance > 0 && event.baseChance <= .01);
  }
});

test('stability bands use effective player ratings at exact thresholds and exclude inappropriate ages', () => {
  for (const event of additions) {
    const state = fixture(Math.max(15, event.minAge));
    const boundary = event.minStability ?? event.maxStability;
    const atBoundary = { ...state.stats, stability: boundary };
    const outside = { ...atBoundary, stability: boundary + (event.minStability !== undefined ? -.01 : .01) };
    assert.ok(chance(state, event.id, atBoundary) > 0, event.id);
    assert.equal(chance(state, event.id, outside), 0, event.id);
    assert.equal(chance({ ...state, age: event.minAge - 1 }, event.id, atBoundary), 0);
    assert.equal(chance({ ...state, age: event.maxAge + 1 }, event.id, atBoundary), 0);
    assert.equal(chance(state, event.id, { ...state.stats, stability: NaN }), 0);
    assert.equal(chance(state, event.id, { ...state.stats, stability: undefined }), 0);
  }
  const state = fixture(15, 8);
  state.effects = [{ id: 'saved-distress', name: 'Saved modifier', description: '', years: 2, modifiers: { stability: -7 }, kind: 'negative' }];
  const before = copy(state);
  assert.ok(eventOdds(state).find(event => event.id === 'mental_inpatient_admission').chance > 0, 'temporary modifiers affect eligibility');
  assert.equal(eventOdds(state).find(event => event.id === 'mental_newcomer_welcome').chance, 0);
  assert.deepEqual(state, before, 'reading thresholds and odds does not write stats, effects, history or RNG');
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('low and high stability curves strengthen toward extremes while major disruptions remain rarer', () => {
  const low = [4, 3, 2, 1, 0].map(value => chance(fixture(15, value), 'mental_leave_gathering'));
  const high = [7, 8, 9, 10].map(value => chance(fixture(15, value), 'mental_newcomer_welcome'));
  assert.ok(low.every((value, index) => index === 0 || value > low[index - 1]));
  assert.ok(high.every((value, index) => index === 0 || value > high[index - 1]));
  for (const value of [0, 1, 2]) {
    const state = fixture(15, value);
    assert.ok(chance(state, 'mental_inpatient_admission') < chance(state, 'mental_leave_gathering'));
    assert.ok(chance(state, 'mental_long_withdrawal') < chance(state, 'mental_missed_meetup'));
    assert.ok(chance(state, 'mental_supported_return') > 0, 'major help remains possible at the lowest ratings');
  }
  assert.equal(chance(fixture(15, 2.01), 'mental_inpatient_admission'), 0);
  for (const value of [-2, 0, 5, 10, 12]) {
    const state = fixture(18, value);
    for (const roll of eventChances(state, state.stats).filter(roll => roll.id.startsWith('mental_'))) assert.ok(Number.isFinite(roll.chance) && roll.chance >= 0 && roll.chance <= .18);
  }
});

test('all twelve new personal events can roll with directional outcomes, intact saves and the shared annual maximum', () => {
  for (const event of additions) {
    const original = fixture(Math.max(15, event.minAge), event.minStability !== undefined ? 9 : 1);
    let found;
    for (let attempt = 1; attempt <= 1000; attempt++) {
      const state = copy(original);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      assert.ok(state.lastYearEvents.length <= 5);
      if (state.lastYearEvents.includes(event.id)) { found = state; break; }
    }
    assert.ok(found, event.id);
    const record = found.yearSummary.events.find(entry => entry.title === event.name);
    assert.ok(record);
    assert.equal(record.description, event.description);
    for (const [key, amount] of Object.entries(event.statChanges || {})) {
      const label = key === 'stability' ? 'mental stability' : key;
      const values = record.text.match(new RegExp(`Your ${label} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
      assert.ok(values, `${event.id}: ${key}`);
      assert.equal(Number(values[2]), changedRating(Number(values[1]), amount), 'permanent changes use the shared directional response and bounds');
    }
    assert.doesNotMatch(record.text, /Your mental stability [\d.]+ (?:→|->)/, `${event.id} cannot change its causal rating`);
    if (!Object.keys(event.statChanges || {}).length) {
      assert.match(record.text, /\+1 Yourself minimum focus\. Temporary effects: 1 year\./);
      assert.doesNotMatch(record.text, /No stat changes/);
    }
    assert.equal(validateSave(found), true, event.id);
    assert.deepEqual(migrateSave(copy(found)), found);
  }
});

test('an admission reserves recovery time and limits commitments for a complete playable year', () => {
  const original = fixture(15, 1);
  original.focus = { work: 4, social: 4, family: 1, self: 1, sports: 0, extracurricular: 0 };
  let admitted;
  for (let attempt = 1; attempt <= 1000; attempt++) {
    const state = copy(original);
    state.rng = Math.imul(attempt, 2654435761) >>> 0;
    advanceYear(state, calm);
    if (state.lastYearEvents.includes('mental_inpatient_admission')) {
      resolveChoices(state);
      // Other capacity/minimum events can offset or stack with this restriction;
      // isolate the admission's own limits for this expiry check.
      if (state.effects.every(effect => effect.id === 'mental_inpatient_admission' ||
        (!effect.focusCapacity && !effect.focusMinimums && !effect.focusLimits && !effect.focusPoints))) {
        admitted = state;
        break;
      }
    }
  }
  assert.ok(admitted);
  resolveChoices(admitted);
  const effect = admitted.effects.find(effect => effect.id === 'mental_inpatient_admission');
  assert.equal(effect.years, 1);
  assert.deepEqual(effect.focusCapacity, { standard: { work: -2, social: -2 } });
  assert.deepEqual(effect.focusMinimums, { standard: { self: 2 } });
  assert.ok(focusLimits(admitted).work <= 2 && focusLimits(admitted).social <= 2);
  assert.ok(focusMinimums(admitted).self >= 2);
  assert.ok(admitted.focus.self >= 2);
  const focus = copy(admitted.focus);
  let next;
  for (let attempt = 1; attempt <= 1000; attempt++) {
    const state = copy(admitted);
    state.rng = Math.imul(attempt, 2654435761) >>> 0;
    assert.equal(advanceYear(state, calm).ok, true);
    if (!state.lastYearEvents.length) { next = state; break; }
  }
  assert.ok(next);
  assert.deepEqual(next.yearSummary.decisions.focus, focus);
  assert.equal(next.effects.some(effect => effect.id === 'mental_inpatient_admission'), false);
  assert.deepEqual(next.focus, focus, 'expiry does not refill allocations');
  assert.equal(validateSave(next), true);
  assert.deepEqual(migrateSave(copy(next)), next);
});
