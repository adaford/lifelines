import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, eventOdds, annualForecast, validateSave, migrateSave } from '../engine.js';
import { createSchoolRecord } from '../school.js';
import { defaultFocus } from '../focus-rules.js';

const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = value => structuredClone(value);
function fixture(condition, health) {
  const state = createGame({ seed: 7301 });
  state.age = 10;
  state.conditions = [condition];
  state.aptitudes.health = health;
  state.stats.health = 5;
  state.focus = defaultFocus(10);
  state.school = createSchoolRecord(state);
  assert.equal(validateSave(state), true);
  return state;
}
// Target a real automatic event using the existing independent-roll injection.
// Reproduce only the unchanged pre-roll shuffle on a separate local RNG.
function rollOnly(state, id) {
  const odds = eventOdds(state).filter(roll => roll.chance > 0);
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
  assert.ok(odds.some(roll => roll.id === id), `${id} is eligible`);
  let calls = 0;
  assert.equal(advanceYear(state, { ...calm, eventRandom: () => odds[calls++].id === id ? 0 : 1 }).ok, true);
  assert.equal(calls, odds.length);
  assert.ok(state.lastYearEvents.includes(id));
}

test('real affinity events use perk-extended limits in both directions and preserve overflow on reload', () => {
  for (const [condition, before, direction, after] of [
    ['physical_resilience', 3, 1, 4],
    ['physical_resilience', 4, -1, 3],
    ['delicate_constitution', -3, -1, -4],
    ['delicate_constitution', -4, 1, -3],
  ]) {
    const state = fixture(condition, before);
    const id = `aptitude_intelligence_health_${direction > 0 ? 'gain' : 'loss'}`;
    const original = copy(state);
    annualForecast(state); eventOdds(state);
    assert.deepEqual(state, original, 'previews preserve affinity, history and RNG');
    rollOnly(state, id);
    assert.equal(state.aptitudes.health, after);
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), state);
    const signed = value => value > 0 ? `+${value}` : String(value);
    assert.ok(state.history.some(entry => entry.text.includes(`Your health learning ability ${signed(before)} → ${signed(after)}`)));
  }
});

test('extended-bound events do not fire past a supporting perk and unrelated annual changes never clip affinity', () => {
  for (const [condition, health, direction] of [
    ['physical_resilience', 4, 'gain'], ['delicate_constitution', -4, 'loss'],
  ]) {
    const state = fixture(condition, health);
    assert.equal(eventOdds(state).find(roll => roll.id === `aptitude_intelligence_health_${direction}`).chance, 0);
    const aptitudes = copy(state.aptitudes);
    assert.equal(advanceYear(state, { ...calm, eventRandom: () => 1 }).ok, true);
    assert.deepEqual(state.aptitudes, aptitudes);
    assert.equal(validateSave(state), true);
  }
});
