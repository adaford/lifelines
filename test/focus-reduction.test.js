import test from 'node:test';
import assert from 'node:assert/strict';
import { skillChanges, infantChoiceEffects, caregiverCryEffects, wellbeingResponse } from '../development.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} versus ${expected}`);

test('infant Family care halves independently of crying, including opposing inputs and aptitude', () => {
  const effort = [-3, -1, 0, 1, 3];
  for (const aptitude of [-3, 0, 3]) for (const careFocus of [0, 1, 2, 3, 4]) for (const cryLevel of [1, 2, 3, 4, 5]) {
    const person = { age: 0, cryLevel, careFocus, alive: true, rng: 49219,
      aptitudes: { intelligence: aptitude, social: aptitude, health: aptitude, stability: aptitude } };
    const saved = structuredClone(person);
    const response = amount => amount * (amount >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
    const care = .06 * effort[careFocus];
    const crying = [-.48, -.24, .24, .48, .72][cryLevel - 1];
    near(skillChanges(person).intelligence, response(crying + care) * .575);
    near(infantChoiceEffects(person).intelligence, (response(crying + care) - response(care)) * .575);
    near(caregiverCryEffects(person, cryLevel).stability, response([.2, 0, -.6, -1.2, -1.8][cryLevel - 1]) * .5);
    near(wellbeingResponse(person, 'stability', .025 * effort[careFocus]), response(.025 * effort[careFocus]) * .25);
    assert.deepEqual(person, saved, 'contribution reads preserve ratings, choices and RNG');
  }
});

test('autonomous focus halves both its ordinary and explicitly scaled practice', () => {
  const person = { age: 25, alive: true, autonomousFocus: true, focus: { work: 5, social: 3, family: 3, self: 3 } };
  near(skillChanges(person).intelligence, .075 * 2 * .25);
  near(skillChanges(person, null, 1).intelligence, .075 * 2 * .5);
  assert.equal(skillChanges(person, null, 0).intelligence, 0);
});
