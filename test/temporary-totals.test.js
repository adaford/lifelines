import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, effectiveStats, annualForecast, advanceYear, EVENTS, resolveEventChoice, migrateSave, validateSave, haveChild, succeed } from '../engine.js';

const effect = (id, modifiers, years = 2) => ({ id, name: id, description: '', years, modifiers, kind: 'positive' });

test('temporary totals cross both base bounds without mutating saved ratings or RNG', () => {
  const state = createGame({ seed: 8401 });
  state.stats.creativity = 9.8;
  state.stats.health = .1;
  state.effects = [effect('boost', { creativity: .7, health: -.5 }), effect('opposition', { creativity: -.2 }), effect('expired', { creativity: 5 }, 0)];
  const before = structuredClone(state);
  assert.equal(effectiveStats(state).creativity, 10.3);
  assert.equal(effectiveStats(state).health, -.4);
  annualForecast(state);
  assert.deepEqual(state, before);
});

test('v15 upgrades without changing pending choices, saved buffs, base ratings or history', () => {
  const state = createGame({ seed: 8402 });
  state.age = 8;
  state.version = 15;
  state.effects = [effect('saved', { creativity: .7 })];
  state.pendingEvents = [{ eventId: 'school_play', age: state.age }];
  state.lastYearEvents = ['school_play'];
  const before = structuredClone(state);
  assert.deepEqual(migrateSave(state), { ...before, version: 16 });
  assert.deepEqual(state, before);
});

test('out-of-range effective reviews survive expiration and a save round trip', () => {
  const state = createGame({ seed: 8403 });
  state.stats.creativity = 9.8;
  state.stats.health = .1;
  state.effects = [effect('boost', { creativity: 2, health: -1 }, 1)];
  assert.equal(advanceYear(state, { mortalityRandom: () => 1 }).ok, true);
  assert.equal(state.yearSummary.stats.creativity.before, 11.8);
  assert.equal(state.yearSummary.stats.health.before, -.9);
  assert.equal(state.effects.some(entry => entry.id === 'boost'), false);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
});

test('mixed event results distinguish permanent gains from refreshed temporary amounts', () => {
  const state = createGame({ seed: 8404 });
  state.age = 8;
  state.stats.intelligence = 8.4;
  state.effects = [effect('school_play', { intelligence: .5 })];
  state.pendingEvents = [{ eventId: 'school_play', age: 8 }];
  state.lastYearEvents = ['school_play'];
  const event = EVENTS.find(entry => entry.id === 'school_play');
  const original = event.choices;
  event.choices = [{ id: 'test', label: 'Join', description: 'A test.', statChanges: { intelligence: .2 }, modifiers: { intelligence: .3 }, years: 2 }];
  try {
    assert.equal(resolveEventChoice(state, 'test', event.id).ok, true);
    assert.equal(state.stats.intelligence, 8.6);
    assert.equal(effectiveStats(state).intelligence, 8.9);
    assert.match(state.history[0].text, /Your intelligence 8\.9 → 9\.1; \+\.3 Intelligence\. Temporary effects: 2 years/);
    assert.equal(state.effects.length, 1);
  } finally { event.choices = original; }
});

test('temporary lifestyle outside bounds remains valid through child succession', () => {
  for (const lifestyle of [-1, 11]) {
    const state = createGame({ seed: 8405 });
    state.age = 65;
    state.education = { status: 'workforce', years: 0 };
    state.adultHeight = state.height;
    state.parents = [];
    assert.equal(haveChild(state).ok, true);
    state.lifestyle = lifestyle;
    state.children[0].lifestyle = lifestyle;
    assert.equal(succeed(state, state.children[0].id).ok, true);
    assert.equal(validateSave(state), true);
    assert.ok(state.parents[0].career.progress >= 0 && state.parents[0].career.progress <= 10);
    assert.deepEqual(migrateSave(structuredClone(state)), state);
  }
});
