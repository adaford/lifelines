import test from 'node:test';
import assert from 'node:assert/strict';
import { normalPercentile } from '../percentiles.js';
import { createGame, statPercentiles, annualForecast, setCryLevel, effectiveStats, migrateSave } from '../engine.js';
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
      assert.equal(result.value, effectiveStats(state)[key]);
      assert.equal(result.percentile, normalPercentile(result.value, 5, result.sd));
    }
  }
  assert.deepEqual(statPercentiles(state), first);
  assert.deepEqual(state, before);
  assert.deepEqual(statPercentiles(migrateSave(JSON.parse(JSON.stringify(state)))), first);
  state.age = 18;
  assert.equal(statPercentiles(state), null);
  state.age = 2;
  state.alive = false;
  assert.equal(statPercentiles(state), null);
});

test('a strong baby ranks above same-age peers and changing focus only changes the forecast', () => {
  const state = createGame({ seed: 14 });
  state.stats.strength = 7;
  const babyRank = statPercentiles(state).strength;
  assert.ok(babyRank.percentile > 80);
  assert.equal(babyRank.sd, PERCENTILE_REFERENCE.stats.strength.ages[0].sd);
  const louder = structuredClone(state);
  setCryLevel(louder, 5);
  assert.deepEqual(statPercentiles(louder), statPercentiles(state));
  assert.notEqual(annualForecast(louder).stats.intelligence.change, annualForecast(state).stats.intelligence.change);
  assert.equal(annualForecast(louder).stats.strength.change, annualForecast(state).stats.strength.change);
  state.age = 8;
  const active = structuredClone(state), inactive = structuredClone(state);
  active.focus = { work: 3, self: 5, social: 2, family: 2 };
  inactive.focus = { work: 4, self: 1, social: 3, family: 4 };
  assert.deepEqual(statPercentiles(active), statPercentiles(inactive));
  assert.ok(annualForecast(active).stats.strength.change > 0);
  assert.ok(annualForecast(inactive).stats.strength.change < 0);
  for (const key of Object.keys(state.stats)) state.stats[key] = 5;
  for (let age = 0; age < 18; age++) {
    state.age = age;
    for (const key of Object.keys(state.stats)) assert.equal(statPercentiles(state)[key].percentile, 50, `${key} at age ${age}`);
  }
});

test('current ranks include temporary effects without expiring them or resolving decisions', () => {
  const state = createGame({ seed: 15 });
  state.age = 17;
  state.height = 66.93;
  state.effects = [{ id: 'cold', name: 'Cold', description: 'Resting.', years: 1, modifiers: { health: -.6 }, kind: 'negative' }];
  state.pendingEvents = [{ eventId: 'peer_drinking', age: 17 }];
  state.lastYearEvents = ['peer_drinking'];
  const before = structuredClone(state);
  const ranked = statPercentiles(state);
  assert.equal(ranked.health.value, effectiveStats(state).health);
  const recovered = structuredClone(state);
  recovered.effects = [];
  assert.ok(statPercentiles(recovered).health.percentile > ranked.health.percentile);
  assert.deepEqual(state, before);
});

test('height is ranked through age seventeen without choosing an actual adult endpoint', () => {
  const state = createGame({ seed: 16 });
  state.age = 16;
  state.maturityAge = 16;
  state.height = 64.57;
  state.adultHeight = 164;
  const before = structuredClone(state);
  assert.ok(Number.isFinite(statPercentiles(state).height.percentile));
  assert.equal(statPercentiles(state).height.value, 64.57);
  assert.equal(statPercentiles(state).height.mean, PERCENTILE_REFERENCE.height.male.ages[16].mean);
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
  assert.equal(rank.value, 4);
  assert.equal(rank.mean, PERCENTILE_REFERENCE.lifestyle[12].mean);
  assert.equal(rank.sd, PERCENTILE_REFERENCE.lifestyle[12].sd);
  assert.ok(rank.sd > 0);
  state.lifestyle = 8;
  assert.ok(statPercentiles(state).lifestyle.percentile > rank.percentile);
});
