import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, resolveEventChoice, chooseEducation, needsEducationChoice,
  EVENTS, eventOdds, annualForecast, validateSave, migrateSave, fitFocusAllocation } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { eventChances } from '../events.js';
import { effectiveStats } from '../engine.js';

const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const stats = ['health', 'stability', 'intelligence', 'strength', 'social', 'creativity', 'attractiveness', 'lifestyle'];
const copy = value => structuredClone(value);
const catalog = new Map(EVENTS.map(event => [event.id, event]));
function fixture(age) {
  const state = createGame({ seed: 83107 });
  while (state.age < age) {
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state, calm).ok, true);
    while (state.pendingEvents.length) {
      const pending = state.pendingEvents[0], event = catalog.get(pending.eventId);
      assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
    }
  }
  if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
  state.conditions = []; state.effects = []; state.history = []; state.yearSummary = null;
  state.lastYearEvents = []; state.pendingEvents = []; state.encounters = [];
  state.focus = fitFocusAllocation(state, defaultFocus(state));
  for (const person of [state, ...state.parents, state.guardian].filter(Boolean)) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
    person.conditions = []; person.lifestyle = 5;
    if (person !== state) { person.relationship = 7; delete person.abandonedAt; person.alive = true; }
  }
  assert.equal(validateSave(state), true);
  return state;
}
function relatedIds(state, stat, subjectId) {
  return new Set(eventOdds(state).filter(roll => {
    if ((roll.subjectId || undefined) !== subjectId) return false;
    const event = catalog.get(roll.eventId || roll.id);
    return !event.rare && event.statFactors?.some(([key, direction]) => key === stat && direction === 'low');
  }).map(roll => roll.id));
}
function observe(state, related, samples = 800) {
  let hits = 0;
  for (let index = 0; index < samples; index++) {
    const next = copy(state);
    next.rng = Math.imul(index + 1, 2654435761) >>> 0;
    assert.equal(advanceYear(next, calm).ok, true);
    assert.ok(next.lastYearEvents.length <= 5);
    if (next.lastYearEvents.some(id => related.has(id))) hits++;
    if (index % 100 === 0) {
      assert.equal(validateSave(next), true);
      assert.deepEqual(migrateSave(copy(next)), next);
    }
  }
  return hits / samples;
}

test('isolated very-low player stats retain surviving event probabilities without compensating for empty events', t => {
  const frequencies = [];
  for (const age of [3, 15, 25]) {
    const base = fixture(age);
    for (const stat of stats) {
      const state = copy(base);
      if (stat === 'lifestyle') state.lifestyle = 1;
      else state.stats[stat] = 1;
      const before = copy(state), related = relatedIds(state, stat);
      assert.ok(related.size, `${age}/${stat} has an eligible related pool`);
      const odds = eventOdds(state).filter(roll => related.has(roll.id));
      const raw = new Map(eventChances(state, effectiveStats(state)).map(roll => [roll.id, roll.chance]));
      for (const roll of odds.filter(roll => roll.chance > 0)) assert.equal(roll.chance, raw.get(roll.id), `${age}/${stat}/${roll.id}: no compensation raises retained probabilities`);
      const combined = 1 - odds.reduce((none, roll) => none * (1 - roll.chance), 1);
      assert.ok(combined > 0 && combined < 1, `${age}/${stat}: meaningful eligible events remain`);
      annualForecast(state);
      assert.deepEqual(state, before, 'odds and forecasts preserve current stats, allocations, and RNG');
      assert.deepEqual(migrateSave(copy(state)), state);
      const frequency = observe(state, related);
      // Removed no-result incidents no longer provide the old half-year floor.
      // Retained independent probabilities predict the uncapped incidence;
      // sampling error and the shared five-event limit bound actual records.
      const sampling = 4 * Math.sqrt(combined * (1 - combined) / 800);
      assert.ok(frequency > 0 && frequency <= combined + sampling + .005, `${age}/${stat}: observed ${frequency}, combined ${combined}`);
      assert.ok(frequency >= combined - sampling - (combined < .1 ? .005 : .04), `${age}/${stat}: shared-cap observed ${frequency}, combined ${combined}`);
      frequencies.push(`${age}/${stat}: ${(frequency * 100).toFixed(1)}% (combined ${(combined * 100).toFixed(1)}%)`);
    }
  }
  t.diagnostic(frequencies.join('; '));
});

test('a very-low parental mental-stability rating creates frequent events for that named parent', t => {
  const frequencies = [];
  for (const age of [1, 3, 15]) {
    const state = fixture(age), parent = state.parents[0];
    parent.stats.stability = 1;
    const before = copy(state), related = relatedIds(state, 'stability', parent.id);
    const frequency = observe(state, related);
    assert.ok(frequency >= .47 && frequency <= .7, `${age}: observed ${frequency}`);
    assert.deepEqual(state, before);
    frequencies.push(`child age ${age}: ${(frequency * 100).toFixed(1)}%`);
  }
  t.diagnostic(frequencies.join('; '));
});

test('several very-low stats coexist without bypassing five events or mutating saved odds', () => {
  const state = fixture(15);
  state.lifestyle = 0;
  for (const person of [state, ...state.parents]) for (const key of Object.keys(person.stats)) person.stats[key] = 0;
  const before = copy(state), odds = eventOdds(state);
  assert.ok(odds.every(roll => Number.isFinite(roll.chance) && roll.chance >= 0 && roll.chance <= .6));
  assert.deepEqual(state, before);
  let reachedMaximum = false;
  for (let index = 0; index < 200; index++) {
    const next = copy(state); next.rng = Math.imul(index + 1, 2654435761) >>> 0;
    assert.equal(advanceYear(next, calm).ok, true);
    assert.ok(next.lastYearEvents.length <= 5);
    assert.equal(validateSave(next), true);
    reachedMaximum ||= next.lastYearEvents.length === 5;
  }
  assert.equal(reachedMaximum, true, 'the high-risk cohort exercises the maximum');
});
