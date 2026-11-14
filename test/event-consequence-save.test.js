import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as game from '../engine.js';
import { focusBudget } from '../focus-rules.js';

const baselineUrl = new URL('../.git/event-consequences-baseline/engine.js', import.meta.url);
const baseline = existsSync(baselineUrl) ? await import(baselineUrl.href) : null;
const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const definition = (runtime, id) => runtime.EVENTS.find(event => event.id === id);
function lifeAt(runtime, age, path = 'work', seed = 93141) {
  const state = runtime.createGame({ seed });
  state.money = 100000000;
  while (state.age < age) {
    if (runtime.needsEducationChoice(state)) assert.equal(runtime.chooseEducation(state, path).ok, true);
    assert.equal(runtime.advanceYear(state, { ...calm, eventRandom: () => 1 }).ok, true);
  }
  if (runtime.needsEducationChoice(state)) assert.equal(runtime.chooseEducation(state, path).ok, true);
  return state;
}
function exactReads(state) {
  const saved = JSON.stringify(state);
  assert.equal(game.validateSave(state), true);
  const loaded = game.migrateSave(JSON.parse(saved));
  assert.equal(JSON.stringify(loaded), saved, 'loading preserves every existing field and absent optional field');
  for (let pass = 0; pass < 3; pass++) {
    game.eventOdds(loaded); game.annualForecast(loaded); game.effectiveStats(loaded);
    game.focusLimits(loaded); game.focusMinimums(loaded); game.caregivers(loaded);
    assert.equal(JSON.stringify(loaded), saved, 'reads preserve ratings, family, effects, history and RNG');
  }
  assert.equal(JSON.stringify(state), saved);
  return loaded;
}
// Use the public annual-roll hook after reproducing its seeded shuffle. This
// targets a real eligible event without adding pending records by hand.
function rollOnly(runtime, state, id) {
  const odds = runtime.eventOdds(state).filter(roll => roll.chance > 0);
  assert.ok(odds.some(roll => (roll.eventId || roll.id) === id), `${id} is eligible`);
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
  let calls = 0;
  assert.equal(runtime.advanceYear(state, { ...calm, eventRandom: () => {
    const roll = odds[calls++];
    return (roll.eventId || roll.id) === id ? 0 : 1;
  } }).ok, true);
  assert.equal(calls, odds.length, 'all eligible candidates receive independent rolls');
}

test('genuine pre-change empty pending choices and clipped history load exactly and remain actionable', { skip: baseline ? false : 'Optional frozen pre-change runtime is absent' }, () => {
  for (const id of ['college_roommate', 'neighborhood_dispute', 'work_conflict']) {
    const state = lifeAt(baseline, 18, id === 'college_roommate' ? 'college' : 'work');
    if (id === 'work_conflict') assert.equal(baseline.takeJob(state, 'retail').ok, true);
    rollOnly(baseline, state, id);
    assert.equal(baseline.validateSave(state), true);
    assert.equal(state.pendingEvents[0].eventId, id);
    assert.ok(state.history.some(entry => entry.title === definition(baseline, id).name));
    for (const choice of definition(baseline, id).choices) {
      const loaded = exactReads(state), before = copy(loaded);
      assert.equal(game.eventOdds(loaded).find(roll => roll.id === id).chance, 0);
      assert.equal(game.resolveEventChoice(loaded, choice.id, id).ok, true);
      assert.equal(loaded.pendingEvents.length, 0);
      assert.equal(loaded.rng, before.rng);
      for (const key of ['stats', 'aptitudes', 'focus', 'effects', 'parents', 'guardian', 'education', 'lifestyle']) assert.deepEqual(loaded[key], before[key], key);
      for (const memory of before.history) assert.deepEqual(loaded.history.find(entry => entry.id === memory.id), memory, 'existing saved prose is not rewritten');
      assert.ok(loaded.history[0].text.startsWith(`${choice.label}. `));
      exactReads(loaded);
    }
  }
  const old = baseline.createGame({ seed: 93142 });
  old.stats.intelligence = 10; old.stats.strength = 10;
  const target = 'life_personal_intelligence_strength_support';
  rollOnly(baseline, old, target);
  assert.ok(old.history.some(entry => entry.title === definition(baseline, target).name && entry.text === 'Your strength 10 → 10.'));
  const loaded = exactReads(old), history = copy(loaded.history), quiet = copy(loaded);
  assert.equal(game.advanceYear(quiet, { ...calm, eventRandom: () => 1 }).ok, true);
  rollOnly(game, loaded, target);
  assert.deepEqual(loaded, quiet, 'a newly clipped roll is omitted without changing the old clipped record');
  for (const memory of history) assert.deepEqual(loaded.history.find(entry => entry.id === memory.id), memory);
  exactReads(loaded);
});

test('meaningful focus commitments survive reload, expire after a complete year and do not refill points', () => {
  const state = lifeAt(game, 12);
  state.conditions = [];
  state.focus = game.fitFocusAllocation(state, { work: 3, social: 2, family: 1, self: 2, sports: 0, extracurricular: 0 });
  const originalBudget = focusBudget(state);
  rollOnly(game, state, 'study_headache');
  assert.equal(focusBudget(state), originalBudget - 1);
  assert.ok(state.history.find(entry => entry.title === definition(game, 'study_headache').name).text.includes('-1 focus point'));
  const restored = exactReads(state), allocation = copy(state.focus);
  assert.equal(game.advanceYear(state, { ...calm, eventRandom: () => 1 }).ok, true);
  assert.equal(game.advanceYear(restored, { ...calm, eventRandom: () => 1 }).ok, true);
  assert.deepEqual(restored, state);
  assert.equal(focusBudget(state), originalBudget);
  assert.equal(state.effects.some(effect => effect.id === 'study_headache'), false);
  assert.deepEqual(state.focus, allocation);
  exactReads(state);
});

test('a meaningful public opportunity can be declined without draws or accepted into persistent status', () => {
  const state = lifeAt(game, 20);
  state.stats.social = state.stats.attractiveness = 10;
  rollOnly(game, state, 'fame_personal_offer');
  assert.equal(state.pendingEvents[0].eventId, 'fame_personal_offer');
  const declined = exactReads(state), before = copy(declined);
  assert.equal(game.resolveEventChoice(declined, 'decline', 'fame_personal_offer').ok, true);
  assert.equal(declined.rng, before.rng);
  assert.deepEqual(declined.stats, before.stats);
  assert.equal(declined.fame, null);
  exactReads(declined);
  const accepted = exactReads(state);
  assert.equal(game.resolveEventChoice(accepted, 'pursue', 'fame_personal_offer').ok, true);
  assert.equal(accepted.fame.kind, 'personal');
  exactReads(accepted);
});

test('sampled actual years never record an empty automatic outcome and all resulting saves remain valid', t => {
  let years = 0, automatic = 0, decisions = 0;
  const automaticNames = game.EVENTS.filter(event => !event.choices?.length).map(event => event.name);
  for (let seed = 1; seed <= 12; seed++) {
    const state = game.createGame({ seed: seed * 9817 });
    while (state.age < 30) {
      while (state.pendingEvents.length) {
        const pending = state.pendingEvents[0], event = definition(game, pending.eventId);
        assert.equal(game.resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
        decisions++;
      }
      if (game.needsEducationChoice(state)) assert.equal(game.chooseEducation(state, 'work').ok, true);
      const old = new Set(state.history.map(entry => entry.id));
      assert.equal(game.advanceYear(state, { mortalityRandom: () => 1 }).ok, true);
      years++;
      for (const entry of state.history.filter(entry => !old.has(entry.id) && entry.kind !== 'choice')) {
        if (!automaticNames.some(name => entry.title === name || entry.title.endsWith(`: ${name}`))) continue;
        automatic++;
        assert.ok(entry.text.trim(), entry.title);
        assert.doesNotMatch(entry.text, /No stat changes\.|No additional effects\./, entry.title);
      }
      exactReads(state);
    }
  }
  assert.equal(years, 360);
  assert.ok(automatic > 100 && decisions > 10, 'the audit covers actual automatic outcomes and decisions');
  t.diagnostic(`${years} years, ${automatic} automatic outcomes and ${decisions} decisions; every resulting save survives pure reads and reloads.`);
});
