import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, eventOdds } from '../engine.js';

test('optional catalog-roll injection preserves default seeded outcomes and rolls every eligible event', () => {
  for (const seed of [107, 621, 4207]) {
    const baseline = createGame({ seed }), injected = structuredClone(baseline);
    const eligible = eventOdds(baseline).filter(event => event.chance > 0).length;
    let calls = 0;
    // Same seeded draw as the default engine, applied to its state after the
    // unchanged shuffle. Full save equality includes outcomes and final RNG.
    const draw = () => {
      calls++;
      injected.rng = (injected.rng + 0x6D2B79F5) >>> 0;
      let value = injected.rng;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
    assert.deepEqual(advanceYear(injected, { eventRandom: draw }), advanceYear(baseline));
    assert.equal(calls, eligible, 'independent rolls continue beyond the five selected events');
    assert.deepEqual(injected, baseline);
    const quiet = createGame({ seed });
    assert.equal(advanceYear(quiet, { eventRandom: () => 1, mortalityRandom: () => 1 }).ok, true);
    assert.deepEqual(quiet.lastYearEvents, []);
  }
});
