import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, migrateSave, validateSave, focusLimits } from '../engine.js';
import { skillChanges, childhoodWellbeing, toddlerActivityEffects } from '../development.js';
import { toddlerChoiceImpacts } from '../choice-impacts.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} versus ${expected}`);
function toddler(age = 3, aptitude = 0) {
  const state = createGame({ seed: 44129 });
  state.age = age;
  state.conditions = [];
  // Leave two points free so every Electronics/Family alternative is legal.
  state.focus = { work: 2, social: 2, family: 2, self: 0, creative: 2 };
  for (const key of Object.keys(state.stats)) {
    state.stats[key] = 5;
    state.aptitudes[key] = aptitude;
  }
  for (const parent of state.parents) {
    parent.stats.stability = 5;
    parent.aptitudes.stability = 0;
    parent.relationship = 5;
  }
  return state;
}
function quietYear(state) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = copy(state);
    candidate.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
    if (!candidate.lastYearEvents.length) return candidate;
  }
  assert.fail('Could not isolate a mean routine without random events');
}

test('Electronics custom contributions reach the annual forecast and completed routine at ages two through four', () => {
  const units = { intelligence: [-4, -2, 0, 2, 4], social: [2, 1, 0, -1, -2] };
  const coefficients = { intelligence: .27, social: .165 };
  for (const age of [2, 3, 4]) for (const aptitude of [-3, 0, 3]) {
    const neutral = toddler(age, aptitude);
    const baseline = skillChanges(neutral);
    for (const points of [0, 1, 2, 3, 4]) {
      const selected = copy(neutral);
      selected.focus.social = points;
      const before = copy(selected);
      const forecast = annualForecast(selected);
      const entries = toddlerChoiceImpacts(selected, 'social');
      const means = skillChanges(selected);
      for (const stat of ['intelligence', 'social']) {
        const raw = units[stat][points] * coefficients[stat];
        const contribution = raw * .5 * 1.15 * (raw >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
        near(means[stat] - baseline[stat], contribution, `${stat} choice at age ${age}, aptitude ${aptitude}, points ${points}`);
        assert.equal(forecast.stats[stat].after, changedRating(5, baseline[stat] + contribution));
        const row = entries.find(entry => entry.stat === stat);
        if (!raw) assert.equal(row, undefined);
        else {
          near(row.change, changedRating(5, contribution) - 5, 'row isolates choice contribution');
          assert.equal(row.level, Math.abs(units[stat][points]));
        }
      }
      assert.deepEqual(selected, before, 'forecast and contribution reads preserve the whole save');
      const advanced = quietYear(selected);
      assert.deepEqual(advanced.yearSummary.stats, forecast.stats, 'completed mean routine uses the same custom curves');
      assert.equal(advanced.yearSummary.decisions.focus.social, points, 'age-four recaps retain Electronics before the school transition');
    }
  }
});

test('Family time never changes toddler personal wellbeing, including alongside Rest and nonzero aptitudes', () => {
  for (const age of [2, 3, 4]) for (const aptitude of [-3, 0, 3]) for (const rest of [0, 2, 4]) {
    const neutral = toddler(age, aptitude);
    neutral.focus.work = 0;
    neutral.focus.creative = 0;
    neutral.focus.self = rest;
    const wellbeing = childhoodWellbeing(neutral);
    const forecast = annualForecast(neutral);
    for (const points of [0, 1, 2, 3, 4]) {
      const selected = copy(neutral);
      selected.focus.family = points;
      const before = copy(selected);
      assert.deepEqual(childhoodWellbeing(selected), wellbeing, 'only Rest supplies personal toddler wellbeing input');
      assert.equal(Object.hasOwn(toddlerActivityEffects(selected).family, 'stability'), false);
      assert.deepEqual(annualForecast(selected).stats.stability, forecast.stats.stability);
      const entries = toddlerChoiceImpacts(selected, 'family');
      assert.ok(!entries.some(entry => entry.group === 'you' && entry.stat === 'stability'));
      for (const parent of selected.parents) for (const stat of ['stability', 'relationship']) {
        const row = entries.find(entry => entry.parentId === parent.id && entry.stat === stat);
        if (points === 2) assert.equal(row, undefined);
        else {
          assert.equal(Math.sign(row.change), Math.sign(points - 2), 'caregiver effects keep their directions');
          assert.equal(row.level, points === 0 || points === 4 ? 3 : 1);
        }
      }
      assert.deepEqual(selected, before);
    }
  }
});

test('capped Electronics keeps its custom units after reload, clips bounds, and does not consume RNG', () => {
  for (const points of [1, 3]) {
    const state = toddler();
    state.focus.social = points;
    state.effects = [{ id: 'screen-limit', name: 'Shared tablet', description: '', years: 1, modifiers: {}, kind: 'neutral', focusLimits: { toddler: { social: points } } }];
    state.stats.intelligence = points === 1 ? 0 : 9.99;
    state.stats.social = points === 1 ? 9.99 : 0;
    assert.equal(validateSave(state), true);
    const before = copy(state);
    const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
    assert.deepEqual(reloaded, before, 'reload preserves allocations, ratings, effects and RNG');
    const visibleStat = points === 1 ? 'social' : 'intelligence';
    const expectedLevel = points === 1 ? 1 : 2;
    for (const subject of [state, reloaded]) {
      const rows = toddlerChoiceImpacts(subject, 'social');
      assert.equal(rows.length, 1, 'the fully blocked opposite effect is hidden');
      assert.equal(rows[0].stat, visibleStat);
      assert.equal(rows[0].level, expectedLevel, 'partially clipped gains retain their original contribution units');
      near(rows[0].change, .01, 'the remaining gain stops at the rating ceiling');
      annualForecast(subject);
      assert.deepEqual(subject, before, 'repeated previews are pure, including temporary caps');
    }
    const forecast = annualForecast(reloaded);
    const advanced = quietYear(reloaded);
    assert.deepEqual(advanced.yearSummary.stats, forecast.stats);
    assert.equal(advanced.effects.length, 0);
    assert.equal(focusLimits(advanced).social, 4);
    assert.equal(advanced.focus.social, points, 'expiry does not restore old allocations');
  }
});
