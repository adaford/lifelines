import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, annualForecast, migrateSave, validateSave, chooseEducation, haveChild, successionInfo } from '../engine.js';
import { stripWellbeingAptitudes, neutralWellbeingAptitudes } from './helpers/legacy-height.js';

const copy = value => structuredClone(value);
const wellbeing = ['health', 'stability'];

test('new lives inherit bounded wellbeing aptitudes and all generation routes retain them', () => {
  const observed = { health: new Set(), stability: new Set() };
  for (let seed = 1; seed <= 120; seed++) {
    const state = createGame({ seed });
    assert.equal(state.version, 16);
    for (const key of wellbeing) {
      const average = (state.parents[0].aptitudes[key] + state.parents[1].aptitudes[key]) / 2;
      const inherited = Math.sign(average) * Math.round(Math.abs(average));
      assert.ok(Math.abs(state.aptitudes[key] - inherited) <= 1);
      for (const person of [state, ...state.parents]) {
        assert.ok(Number.isInteger(person.aptitudes[key]));
        assert.ok(person.aptitudes[key] >= -3 && person.aptitudes[key] <= 3);
      }
      observed[key].add(state.aptitudes[key]);
    }
    assert.equal(validateSave(state), true);
  }
  for (const values of Object.values(observed)) assert.equal(values.size, 7);
  const adult = createGame({ seed: 391 });
  adult.age = 65;
  const preview = successionInfo(adult).candidates[0];
  assert.ok(preview);
  for (const key of wellbeing) assert.ok(Number.isInteger(preview.aptitudes[key]));
  assert.equal(haveChild(adult).ok, true);
  for (const key of wellbeing) assert.ok(Number.isInteger(adult.children[0].aptitudes[key]));
});

test('v11 migration adds neutral wellbeing aptitude without changing any saved progress', () => {
  const legacy = createGame({ seed: 392 });
  legacy.age = 4;
  legacy.focus = { work: 2, social: 3, family: 2, self: 2, creative: 3 };
  legacy.pendingEvents = [{ eventId: 'school_play', age: 4 }];
  legacy.lastYearEvents = ['school_play'];
  stripWellbeingAptitudes(legacy);
  legacy.version = 11;
  const before = copy(legacy);
  const migrated = migrateSave(legacy);
  const expected = neutralWellbeingAptitudes(copy(before));
  expected.version = 16;
  assert.deepEqual(migrated, expected);
  assert.deepEqual(legacy, before);
  assert.equal(migrated.focus.creative, 3, 'v11 crafts choices are not reset');
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(migrateSave(migrated), migrated);
  for (const key of wellbeing) {
    for (const bad of [undefined, 3.1, -4, 4, '0', NaN]) {
      const invalid = copy(migrated);
      invalid.aptitudes[key] = bad;
      assert.equal(validateSave(invalid), false);
      assert.equal(migrateSave(invalid), null);
    }
  }
});

test('wellbeing aptitude strengthens routine adult recovery and buffers routine losses', () => {
  const template = createGame({ seed: 393 });
  template.age = 18;
  chooseEducation(template, 'work');
  template.age = 30;
  for (const key of wellbeing) template.stats[key] = 5;
  for (const focus of [
    { work: 0, social: 3, family: 4, self: 5 },
    { work: 5, social: 5, family: 0, self: 0 },
  ]) {
    const low = { ...copy(template), focus }, high = copy(low);
    for (const key of wellbeing) { low.aptitudes[key] = -3; high.aptitudes[key] = 3; }
    const original = copy(high);
    const slower = annualForecast(low), faster = annualForecast(high);
    for (const key of wellbeing) assert.ok(faster.stats[key].change > slower.stats[key].change, key);
    assert.deepEqual(high, original, 'reading aptitude-sensitive forecasts is pure');
  }
  const low = { ...copy(template), age: 65, focus: { work: 3, social: 3, family: 3, self: 2 } }, high = copy(low);
  low.aptitudes.health = -3; high.aptitudes.health = 3;
  assert.equal(annualForecast(low).stats.health.change, annualForecast(high).stats.health.change, 'aging loss itself is not a practice effect');
});

test('parent wellbeing aptitude changes crying strain without changing relationship effects', () => {
  const low = createGame({ seed: 394 }), high = copy(low);
  low.cryLevel = 5; high.cryLevel = 5;
  for (const parent of low.parents) { parent.stats.stability = 7; parent.aptitudes.stability = -3; }
  for (const parent of high.parents) { parent.stats.stability = 7; parent.aptitudes.stability = 3; }
  const weaker = annualForecast(low), stronger = annualForecast(high);
  for (let i = 0; i < low.parents.length; i++) {
    assert.ok(stronger.parents[i].stability.change > weaker.parents[i].stability.change);
    assert.deepEqual(stronger.parents[i].relationship, weaker.parents[i].relationship);
  }
});
