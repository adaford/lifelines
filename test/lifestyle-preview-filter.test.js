import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, annualForecast } from '../engine.js';
import { choiceImpacts, toddlerChoiceImpacts } from '../choice-impacts.js';
import { TODDLER_FOCUS } from '../development.js';

function fixture(age) {
  const state = createGame({ seed: 82431 });
  state.age = age;
  state.focus = age >= 2 && age < 5 ? { ...TODDLER_FOCUS } : { work: 3, social: 3, family: 3, self: 3 };
  state.education = { status: age < 18 ? 'school' : 'workforce', years: 0 };
  state.effects = [];
  for (const key of Object.keys(state.stats)) state.stats[key] = 5;
  state.lifestyle = 4.5;
  for (const parent of state.parents) {
    parent.age = age + 30;
    parent.lifestyle = 4.5;
    parent.stats.stability = 5;
    parent.relationship = 5;
    parent.career = { focus: 3, status: 'employed', progress: 4.5, years: 10 };
  }
  return state;
}

function assertHiddenWithoutMutation(state) {
  const before = structuredClone(state);
  const forecast = annualForecast(state);
  const previews = choiceImpacts(state);
  assert.ok(previews.every(entry => entry.stat !== 'lifestyle'), 'combined previews exclude player and caregiver lifestyle');
  if (state.age >= 2 && state.age < 5) {
    for (const activity of Object.keys(TODDLER_FOCUS)) {
      assert.ok(toddlerChoiceImpacts(state, activity).every(entry => entry.stat !== 'lifestyle'), `${activity} excludes lifestyle`);
    }
  }
  assert.deepEqual(annualForecast(state), forecast, 'routine financial forecasts remain available and unchanged');
  assert.deepEqual(state, before, 'reading previews preserves every saved value and RNG');
  return forecast;
}

test('lifestyle stays out of childhood previews despite household gains, losses, and the adult transition', () => {
  for (const age of [0, 1, 2, 4, 5, 17]) {
    for (const status of ['employed', 'unemployed']) {
      const state = fixture(age);
      state.parents.forEach(parent => { parent.career.status = status; });
      const forecast = assertHiddenWithoutMutation(state);
      assert.notEqual(forecast.lifestyle.change, 0, `age ${age}, ${status}: a real financial change remains in the forecast`);
      assert.ok(forecast.parents.every(parent => Math.sign(parent.lifestyle.change) === (status === 'employed' ? 1 : -1)));
      if (age < 17) assert.equal(Math.sign(forecast.lifestyle.change), status === 'employed' ? 1 : -1);
    }
  }
});

test('expiring adult lifestyle buffs and debuffs do not add expected-change entries', () => {
  for (const age of [18, 30, 70]) {
    for (const modifier of [-1, 1]) {
      const state = fixture(age);
      state.money = 0;
      state.jobId = null;
      state.lifestyle = 1 + modifier;
      state.effects = [{ id: 'temporary-lifestyle', name: 'Household change', description: '', years: 1, modifiers: {}, lifestyle: modifier, kind: modifier > 0 ? 'positive' : 'negative' }];
      const forecast = assertHiddenWithoutMutation(state);
      assert.deepEqual(forecast.lifestyle, { before: 1 + modifier, after: 1, change: -modifier });
    }
  }
});

test('guardian household changes remain calculated but never enter player or other-people previews', () => {
  for (const age of [1, 4, 12]) {
    const state = fixture(age);
    state.parents.forEach(parent => { parent.abandonedAt = 0; parent.relationship = 0; });
    state.guardian = { ...structuredClone(state.parents[0]), id: 'guardian-preview', guardianRole: 'aunt', adoptedAt: 0 };
    delete state.guardian.parentRole;
    delete state.guardian.abandonedAt;
    for (const status of ['employed', 'unemployed']) {
      state.guardian.career.status = status;
      const forecast = assertHiddenWithoutMutation(state);
      const caregiver = forecast.parents.find(parent => parent.id === state.guardian.id);
      assert.ok(caregiver);
      assert.equal(Math.sign(caregiver.lifestyle.change), status === 'employed' ? 1 : -1);
      assert.equal(forecast.lifestyle.change, caregiver.lifestyle.change);
    }
  }
});
