import { incomeForLifestyle, LIFESTYLE_BALANCE } from '../lifestyle.js';
﻿import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, JOBS, haveChild, advanceYear, eventOdds, annualForecast, householdLifestyle,
  quitFame, validateSave, migrateSave } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
function reload(state) {
  assert.equal(validateSave(state), true);
  const before = copy(state);
  assert.deepEqual(migrateSave(copy(state)), before);
  assert.deepEqual(state, before);
}
function rollOnly(state, id) {
  const odds = eventOdds(state).filter(roll => roll.chance > 0);
  assert.ok(odds.some(roll => roll.id === id), `${id} is eligible`);
  let rng = state.rng;
  const random = () => {
    rng = (rng + 0x6D2B79F5) >>> 0;
    let value = rng;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  for (let index = odds.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [odds[index], odds[other]] = [odds[other], odds[index]];
  }
  let calls = 0;
  assert.equal(advanceYear(state, { ...steady, eventRandom: () => odds[calls++].id === id ? 0 : 1 }).ok, true);
  assert.equal(calls, odds.length, 'the targeted annual outcome retains every independent candidate roll');
}
function famousOrphan() {
  const state = createGame({ seed: 432117, firstName: 'Jamie', surname: 'Support' });
  Object.assign(state, { age: 15, parents: [], guardian: null, conditions: [], effects: [],
    height: 62, adultHeight: null, maturityAge: 18, money: incomeForLifestyle(5) / LIFESTYLE_BALANCE.reserveDrawRate, income: 0,
    fame: { kind: 'personal', activityId: null, rating: 10, support: 0, startedAge: 14 },
    focus: { work: 2, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 } });
  for (const key in state.stats) state.stats[key] = 5;
  state.stats.intelligence = 8;
  state.school = createSchoolRecord(state);
  state.lifestyle = householdLifestyle(state);
  return state;
}

test('an actual household grant preserves the fame-free orphan baseline, legacy effects, expiry and quit', () => {
  for (const legacy of [false, true]) {
    const state = famousOrphan();
    const eventId = 'life_personal_intelligence_lifestyle_support';
    if (legacy) state.effects = [{ id: eventId, name: 'Recorded legacy help', description: 'Keep this recorded effect.',
      years: 2, modifiers: { health: .3 }, lifestyle: 1, kind: 'positive' }];
    assert.equal(state.lifestyle, 7);
    reload(state);
    rollOnly(state, eventId);
    assert.deepEqual(state.lastYearEvents, [eventId]);
    assert.equal(state.householdEventBase, 5);
    assert.equal(state.lifestyle, 7.18, 'Fame support is added once, alongside the grant');
    if (legacy) {
      assert.deepEqual(state.effects.find(effect => effect.id === eventId), {
        id: eventId, name: 'Recorded legacy help', description: 'Keep this recorded effect.',
        years: 1, modifiers: { health: .3 }, lifestyle: 1, kind: 'positive',
      });
      assert.equal(state.effects.find(effect => effect.id === `${eventId}:limits`).householdLifestyle, .18);
    }
    reload(state);
    const before = copy(state);
    assert.equal(annualForecast(state).lifestyle.after, 7, 'the grant expires after one complete routine');
    assert.deepEqual(state, before, 'forecast remains read-only');
    assert.equal(quitFame(state).ok, true);
    assert.equal(state.lifestyle, 5.18, 'leaving fame retains only ordinary resources and the live grant');
    assert.equal(annualForecast(state).lifestyle.after, 5);
    reload(state);
  }
});

test('an actual sibling event changes only its target and captures the stage before the birthday', () => {
  const state = createGame({ seed: 432117, firstName: 'Jamie', surname: 'Support' });
  Object.assign(state, { age: 25, parents: [], conditions: [], effects: [], height: 68,
    adultHeight: 68, maturityAge: 18, money: 0, income: 0,
    education: { status: 'workforce', years: 0 },
    jobOffers: JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id), focus: defaultFocus(25) });
  assert.equal(haveChild(state).ok, true);
  const sibling = state.children.pop();
  Object.assign(sibling, { id: 'younger-sibling', age: 12, height: 58, conditions: [], parentIds: ['prior-parent'], lifestyle: 4 });
  state.siblings = [sibling];
  for (const person of [state, sibling]) for (const key in person.stats) { person.stats[key] = 5; person.aptitudes[key] = 0; }
  sibling.stats.health = 8;
  state.lifestyle = 1;
  reload(state);
  const control = copy(state);
  rollOnly(state, 'life_sibling_health_strength_support:younger-sibling');
  assert.equal(advanceYear(control, { ...steady, eventRandom: () => 1 }).ok, true);
  assert.deepEqual(state.lastYearEvents, ['life_sibling_health_strength_support:younger-sibling']);
  assert.equal(sibling.age, 13);
  assert.equal(sibling.stats.strength, changedRating(control.siblings[0].stats.strength, .18));
  for (const key of Object.keys(sibling.stats).filter(key => key !== 'strength')) assert.equal(sibling.stats[key], control.siblings[0].stats[key], key);
  assert.deepEqual(state.stats, control.stats, 'the sibling outcome does not affect the player');
  const entry = state.history.find(memory => memory.title === `${sibling.name}: Health and movement sessions: a supported place`);
  assert.ok(entry);
  assert.match(entry.description, /neighborhood children's program/);
  assert.doesNotMatch(entry.description, /youth program/);
  assert.match(entry.cause, /high Health \(8.0\/10\)/);
  assert.equal(state.yearSummary.events.find(memory => memory.title === entry.title).description, entry.description);
  reload(state);
});


test('household support expires at eighteen without carrying a child household bonus into adult resources', () => {
  const state = famousOrphan();
  state.age = 17;
  state.school = createSchoolRecord(state);
  state.householdEventBase = 5;
  state.effects = [{ id: 'transition-support', name: 'Temporary transport', description: 'One complete year of transport help.',
    years: 1, modifiers: {}, householdLifestyle: .18, kind: 'positive' }];
  state.lifestyle = householdLifestyle(state);
  assert.equal(state.lifestyle, 7.18);
  reload(state);
  const predicted = annualForecast(state);
  assert.equal(predicted.lifestyle.after, 7);
  assert.equal(advanceYear(state, { ...steady, eventRandom: () => 1 }).ok, true);
  assert.equal(state.age, 18);
  assert.equal(state.lifestyle, 7);
  assert.deepEqual(state.effects, []);
  assert.equal(state.fame.rating, 10);
  reload(state);
  assert.equal(quitFame(state).ok, true);
  assert.equal(state.lifestyle, 5);
  reload(state);
});
