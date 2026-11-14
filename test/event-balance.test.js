import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../events.js';
import { FAMILY_EVENTS } from '../family-events.js';
import { createGame, advanceYear, effectiveStats, validateSave, migrateSave } from '../engine.js';
import { changedRating } from '../rating-changes.js';

const event = id => EVENTS.find(entry => entry.id === id);

test('ordinary discoveries and connections preserve skill gains without automatic mental rewards', () => {
  assert.deepEqual(event('treehouse').statChanges, { intelligence: .2 });
  for (const id of ['bedtime_stories', 'gentle_playgroup', 'treehouse', 'child_kindness', 'good_grades',
    'reading_award', 'school_music', 'study_buddy', 'teen_club', 'college_honors', 'college_exhibition',
    'work_friend', 'work_idea', 'family_tradition', 'friendship', 'inspiration', 'mentor', 'elder_mentor']) {
    const outcome = event(id);
    assert.ok(Object.values(outcome.statChanges || {}).every(amount => amount > 0 && amount <= .25), id);
    assert.equal(outcome.statChanges?.stability, undefined, `${id} has no automatic mental reward`);
    assert.deepEqual(outcome.modifiers, {}, `${id} no longer creates a timed stat boost`);
  }
  const timedPositiveStats = EVENTS.flatMap(entry => entry.choices || [entry])
    .filter(outcome => Object.values(outcome.modifiers || {}).some(amount => amount > 0));
  assert.ok(timedPositiveStats.length <= 10, 'ordinary gains should mostly be permanent');
});

test('new wellbeing and material events are permanent while injuries retain activity limits', () => {
  assert.deepEqual(event('soothing_routine').statChanges, { stability: .3 });
  assert.deepEqual(event('healthy_stretch').statChanges, { strength: .2 });
  assert.equal(event('work_idea').lifestyle, undefined);
  assert.equal(event('work_idea').years, 0);
  assert.equal(event('broken_bone').focusCapacity.toddler.work, -2);
  assert.deepEqual(event('injury').statChanges, { attractiveness: -.1 });
  assert.equal(event('injury').focusCapacity.toddler.work, -2);
  assert.deepEqual(FAMILY_EVENTS.find(entry => entry.id === 'household_parent_abandonment').playerChanges,
    { stability: -3, social: -1.5, health: -1 });
});

test('a backyard invention develops Intelligence without changing its causal Creativity or creating a temporary effect', () => {
  const original = createGame({ seed: 33021 });
  original.age = 3;
  original.focus = { work: 2, social: 2, family: 2, self: 2, creative: 2 };
  for (const key of Object.keys(original.stats)) original.stats[key] = 5;
  let found;
  for (let attempt = 1; attempt <= 600; attempt++) {
    const state = structuredClone(original);
    state.rng = Math.imul(attempt, 2654435761) >>> 0;
    advanceYear(state, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 });
    if (state.lastYearEvents.includes('treehouse')) { found = state; break; }
  }
  assert.ok(found, 'the discovery can roll normally');
  const recorded = found.history.find(entry => entry.title === 'A backyard invention');
  for (const key of ['intelligence']) {
    const values = recorded.text.match(new RegExp(`Your ${key} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
    assert.ok(values, `${key} has a permanent before/after result`);
    assert.equal(Number(values[2]), changedRating(Number(values[1]), .2));
  }
  assert.doesNotMatch(recorded.text, /Your creativity [\d.]+ (?:→|->)/);
  assert.equal(found.effects.some(effect => effect.id === 'treehouse'), false);
  assert.equal(validateSave(found), true);
  assert.deepEqual(migrateSave(structuredClone(found)), found);
});

test('catalog rebalancing leaves already saved temporary rewards intact', () => {
  const state = createGame({ seed: 33022 });
  state.effects = [{ id: 'treehouse', name: 'A backyard invention', description: 'Saved reward',
    years: 2, modifiers: { creativity: .7 }, kind: 'positive' }];
  const before = structuredClone(state);
  assert.equal(validateSave(state), true);
  const loaded = migrateSave(structuredClone(state));
  assert.deepEqual(loaded, before);
  assert.equal(effectiveStats(loaded).creativity, Math.round((state.stats.creativity + .7) * 100) / 100);
});
