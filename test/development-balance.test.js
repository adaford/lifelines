import test from 'node:test';
import assert from 'node:assert/strict';
import { skillGrowth, childhoodWellbeing } from '../development.js';
import { createGame, advanceYear, resolveEventChoice, EVENTS, effectiveStats } from '../engine.js';

test('childhood development retains individual affinity and adult development is unscaled', () => {
  const child = { age: 10, aptitudes: { intelligence: 0 } };
  assert.ok(skillGrowth(child, 'intelligence', .3) > 0);
  assert.ok(skillGrowth({ ...child, aptitudes: { intelligence: 3 } }, 'intelligence', .3) > skillGrowth(child, 'intelligence', .3));
  assert.ok(skillGrowth({ ...child, aptitudes: { intelligence: -3 } }, 'intelligence', .3) < skillGrowth(child, 'intelligence', .3));
  assert.equal(skillGrowth({ ...child, age: 18 }, 'intelligence', .3), .3);
  assert.equal(skillGrowth({ ...child, age: 18, aptitudes: { intelligence: 3 } }, 'intelligence', .3), .3 * 1.54);
});

test('childhood wellbeing recovers toward its usual range while choices still matter', () => {
  const child = { age: 10, alive: true, stats: { health: 5, stability: 5 }, focus: { work: 3, social: 3, family: 3, self: 3 } };
  const low = childhoodWellbeing({ ...child, stats: { health: 2, stability: 2 } });
  const high = childhoodWellbeing({ ...child, stats: { health: 9, stability: 9 } });
  assert.ok(low.health > 0 && low.stability > 0);
  assert.ok(high.health < 0 && high.stability < 0);
  const rested = childhoodWellbeing({ ...child, focus: { work: 1, social: 2, family: 4, self: 5 } });
  const strained = childhoodWellbeing({ ...child, focus: { work: 5, social: 3, family: 3, self: 1 } });
  assert.ok(rested.health > strained.health);
  assert.ok(rested.stability > strained.stability);
  const baby = { ...child, age: 0 };
  assert.ok(childhoodWellbeing({ ...baby, cryLevel: 5 }).health > childhoodWellbeing({ ...baby, cryLevel: 1 }).health);
  assert.deepEqual(childhoodWellbeing({ ...child, age: 18 }), { health: 0, stability: 0 });
  assert.deepEqual(childhoodWellbeing({ ...child, alive: false }), { health: 0, stability: 0 });
  assert.deepEqual(child.stats, { health: 5, stability: 5 });
});

test('independent game lives reach age 18 with average ratings near five and retain variation', () => {
  const keys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
  const samples = Object.fromEntries(keys.map(key => [key, []]));
  const events = new Map(EVENTS.map(event => [event.id, event]));
  for (const [index, gender] of ['male', 'female'].entries()) for (let sample = 0; sample < 400; sample++) {
    const seed = 750001 + index * 1000000 + sample;
    const state = createGame({ seed, gender });
    state.cryLevel = 3;
    let choiceSeed = (seed ^ 0xA5A5A5A5) >>> 0;
    while (state.age < 18 && state.alive) {
      assert.equal(advanceYear(state).ok, true);
      while (state.pendingEvents.length) {
        const pending = state.pendingEvents[0];
        const choices = events.get(pending.eventId).choices;
        choiceSeed = (Math.imul(choiceSeed, 1664525) + 1013904223) >>> 0;
        const choice = choices[Math.floor(choiceSeed / 4294967296 * choices.length)];
        assert.equal(resolveEventChoice(state, choice.id, pending.eventId, pending.subjectId).ok, true);
      }
    }
    if (!state.alive) continue;
    const stats = effectiveStats(state);
    for (const key of keys) samples[key].push(stats[key]);
  }
  for (const [key, values] of Object.entries(samples)) {
    assert.ok(values.length > 750);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
    assert.ok(Math.abs(average - 5) < .2, `${key} mean ${average}`);
    assert.ok(sd > .25 && sd < 2, `${key} SD ${sd}`);
    assert.ok(new Set(values).size > 50, `${key} varies between lives`);
  }
});
