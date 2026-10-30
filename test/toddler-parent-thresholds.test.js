import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, annualForecast } from '../engine.js';
import { wellbeingResponse } from '../development.js';

const round = value => Math.round(value * 100) / 100;
function familyTime(age, points) {
  const state = createGame({ seed: 83301 });
  state.age = age;
  state.focus = { work: 2, social: 1, family: points, self: 2, ...(age < 5 ? { creative: 2 } : {}) };
  for (const parent of state.parents) {
    parent.stats.stability = 5;
    parent.aptitudes.stability = 0;
    parent.relationship = 5;
  }
  return state;
}

test('toddler Family time has neutral parent relationships and mental stability at two points', () => {
  for (const age of [2, 3, 4]) for (let points = 0; points <= 5; points++) {
    const state = familyTime(age, points);
    const before = structuredClone(state);
    const forecast = annualForecast(state);
    for (const parent of forecast.parents) {
      assert.equal(parent.relationship.after, round(5 + (points - 2) * .04), `age ${age}, Family ${points}, relationship`);
      assert.equal(parent.relationship.change, round((points - 2) * .04));
      assert.equal(parent.stability.after, round(5 + (points - 2) * .0125), `age ${age}, Family ${points}, mental stability`);
      assert.equal(parent.stability.change, round(round(5 + (points - 2) * .0125) - 5));
    }
    assert.deepEqual(state, before, 'the mean forecast never mutates a saved life or RNG');
  }
});

test('school-age Family keeps its existing parent thresholds', () => {
  for (const age of [5, 17]) for (let points = 0; points <= 5; points++) {
    const forecast = annualForecast(familyTime(age, points));
    for (const parent of forecast.parents) {
      assert.equal(parent.relationship.after, round(5 + (points - 2) * .04));
      assert.equal(parent.stability.after, round(5 + (points - 3) * .0125));
    }
  }
});

test('toddler parent mental stability preserves aptitude response and background recovery', () => {
  for (const points of [1, 2, 3]) {
    const state = familyTime(3, points);
    state.parents.forEach((parent, index) => {
      parent.stats.stability = index ? 3 : 7;
      parent.aptitudes.stability = index ? -3 : 3;
    });
    const forecast = annualForecast(state);
    for (const parent of state.parents) {
      const change = .08 * (5 - parent.stats.stability) + wellbeingResponse(parent, 'stability', (points - 2) * .025);
      assert.equal(forecast.parents.find(row => row.id === parent.id).stability.after, round(parent.stats.stability + change));
    }
  }
  const state = familyTime(3, 0);
  state.parents[0].alive = false;
  const remembered = annualForecast(state).parents[0];
  assert.equal(remembered.relationship.change, 0);
  assert.equal(remembered.stability.change, 0);
});
