import test from 'node:test';
import assert from 'node:assert/strict';
import { normalPercentile } from '../percentiles.js';
import { createGame, projectAt18, statPercentiles, annualForecast, setCryLevel, effectiveStats, migrateSave } from '../engine.js';
import { PERCENTILE_REFERENCE } from '../percentile-reference.js';

test('normal percentiles center exactly on five and follow standard deviations', () => {
  assert.equal(normalPercentile(5, 5, 1.2), 50);
  assert.equal(normalPercentile(6.2, 5, 1.2), 84.13);
  assert.equal(normalPercentile(3.8, 5, 1.2), 15.87);
  assert.equal(normalPercentile(7.4, 5, 1.2), 97.72);
  assert.equal(normalPercentile(-100, 5, 1), .01);
  assert.equal(normalPercentile(100, 5, 1), 99.99);
  assert.equal(normalPercentile(5, 5, 0), null);
  assert.equal(normalPercentile(NaN, 5, 1), null);
});

test('under-18 ranks cover all own stats and never change a saved life', () => {
  const state = createGame({ seed: 13 });
  const before = structuredClone(state);
  const first = statPercentiles(state);
  assert.deepEqual(Object.keys(first).sort(), ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability', 'height', 'lifestyle'].sort());
  for (const [key, result] of Object.entries(first)) {
    assert.ok(result.percentile > 0 && result.percentile < 100, key);
    assert.ok(result.sd > 0, key);
    if (Object.hasOwn(state.stats, key)) {
      assert.equal(result.mean, 5);
      assert.equal(result.percentile, normalPercentile(result.expected, 5, result.sd));
    }
  }
  assert.deepEqual(statPercentiles(state), first);
  projectAt18(state);
  assert.deepEqual(state, before);
  assert.deepEqual(statPercentiles(migrateSave(JSON.parse(JSON.stringify(state)))), first);
  state.age = 18;
  assert.equal(statPercentiles(state), null);
  state.age = 2;
  state.alive = false;
  assert.equal(statPercentiles(state), null);
});

test('childhood ranks reflect future learning, affinity and current choices', () => {
  const state = createGame({ seed: 14 });
  const fast = structuredClone(state), slow = structuredClone(state);
  fast.aptitudes.intelligence = 3;
  slow.aptitudes.intelligence = -3;
  assert.ok(statPercentiles(fast).intelligence.percentile > statPercentiles(slow).intelligence.percentile);
  setCryLevel(fast, 5);
  setCryLevel(slow, 1);
  assert.ok(statPercentiles(fast).intelligence.expected > statPercentiles(slow).intelligence.expected);
  state.age = 8;
  state.stats.intelligence = 2.5;
  const studious = structuredClone(state), unfocused = structuredClone(state);
  studious.focus = { work: 5, self: 5, social: 1, family: 1 };
  unfocused.focus = { work: 0, self: 0, social: 5, family: 5 };
  assert.ok(statPercentiles(studious).intelligence.percentile > statPercentiles(unfocused).intelligence.percentile);
});

test('projection expires temporary effects and leaves pending decisions unresolved', () => {
  const state = createGame({ seed: 15 });
  state.age = 17;
  state.height = 170;
  state.effects = [{ id: 'cold', name: 'Cold', description: 'Resting.', years: 1, modifiers: { health: -.6 }, kind: 'negative' }];
  state.pendingEvents = [{ eventId: 'peer_drinking', age: 17 }];
  state.lastYearEvents = ['peer_drinking'];
  const before = structuredClone(state);
  const projected = projectAt18(state);
  const routine = structuredClone(state);
  routine.pendingEvents = [];
  const forecast = annualForecast(routine);
  for (const [key, value] of Object.entries(projected.stats)) assert.equal(value, forecast.stats[key].after, key);
  assert.equal(projected.height, forecast.height.after);
  assert.deepEqual(state, before);
  assert.notEqual(projected.stats.health, effectiveStats(state).health);
});

test('height is ranked through age seventeen without choosing an actual adult endpoint', () => {
  const state = createGame({ seed: 16 });
  state.age = 16;
  state.maturityAge = 16;
  state.height = 164;
  state.adultHeight = 164;
  const before = structuredClone(state);
  assert.equal(projectAt18(state).height, 164);
  assert.ok(Number.isFinite(statPercentiles(state).height.percentile));
  assert.equal(statPercentiles(state).height.expected, 164);
  assert.deepEqual(state, before);
  state.age = 17;
  assert.ok(statPercentiles(state).height);
  state.age = 18;
  assert.equal(statPercentiles(state), null);
  const infant = createGame({ seed: 17 });
  statPercentiles(infant);
  assert.equal(infant.adultHeight, null);
});

test('household lifestyle compares same-age game households before personal finances begin', () => {
  const state = createGame({ seed: 18 });
  state.age = 12;
  state.lifestyle = 4;
  const rank = statPercentiles(state).lifestyle;
  assert.equal(rank.expected, 4);
  assert.equal(rank.mean, PERCENTILE_REFERENCE.lifestyle[12].mean);
  assert.equal(rank.sd, PERCENTILE_REFERENCE.lifestyle[12].sd);
  assert.ok(rank.sd > 0);
  state.lifestyle = 8;
  assert.ok(statPercentiles(state).lifestyle.percentile > rank.percentile);
});
