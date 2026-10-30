import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS as PERSONAL_EVENTS, eventChances } from '../events.js';
import {
  EVENTS, JOBS, createGame, advanceYear, chooseEducation, needsEducationChoice,
  resolveEventChoice, effectiveStats, focusLimits, takeJob, validateSave, migrateSave,
} from '../engine.js';

const ids = [
  'baby_hand_coordination', 'baby_separation_anxiety',
  'toddler_swim_class', 'toddler_messy_paint', 'toddler_new_playmate', 'toddler_nursery_days', 'toddler_sore_fingers', 'toddler_puzzle_box',
  'school_garden', 'school_friend_moves', 'school_lost_project', 'school_class_representative',
  'teen_answer_leak', 'teen_band_disagreement', 'teen_group_chat', 'teen_first_aid',
  'college_noisy_housing', 'college_field_study', 'work_commute_disrupted', 'community_kitchen',
  'elder_safer_home', 'elder_walking_group', 'elder_photo_archive', 'elder_heatwave',
];
const additions = ids.map(id => PERSONAL_EVENTS.find(event => event.id === id));
const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const retail = JOBS.find(job => job.id === 'retail');
const cache = new Map();
function resolveAll(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
  }
}
function lifeAt(age, college = false) {
  const key = `${age}:${college}`;
  if (!cache.has(key)) {
    const state = createGame({ seed: 84021 });
    while (state.age < age) {
      if (needsEducationChoice(state)) assert.equal(chooseEducation(state, college ? 'college' : 'work').ok, true);
      assert.equal(advanceYear(state, calm).ok, true);
      resolveAll(state);
    }
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, college ? 'college' : 'work').ok, true);
    state.effects = [];
    for (const key of Object.keys(state.stats)) state.stats[key] = 5;
    state.focus = age >= 2 && age < 5 ? { work: 3, social: 2, family: 2, self: 3, creative: 2 } : { work: 3, social: 3, family: 3, self: 3 };
    assert.equal(validateSave(state), true);
    cache.set(key, state);
  }
  return copy(cache.get(key));
}

test('new personal events cover each life stage and remain restricted to appropriate contexts', () => {
  assert.equal(additions.length, 24);
  assert.ok(additions.every(Boolean));
  assert.equal(new Set(PERSONAL_EVENTS.map(event => event.id)).size, PERSONAL_EVENTS.length);
  assert.equal(additions.filter(event => event.choices).length, 16);
  for (const event of additions) {
    const state = { age: event.minAge, education: { status: event.conditions?.includes('college') ? 'college' : event.minAge < 18 ? 'school' : 'workforce' },
      stats: { health: 5, stability: 5, intelligence: 5, strength: 5, social: 5, creativity: 5, attractiveness: 5 }, lifestyle: 5,
      focus: { work: 3, social: 2, family: 2, self: 3, creative: 2 }, children: [] };
    const job = event.conditions?.includes('employed') ? retail : null;
    const chance = candidate => eventChances(candidate, candidate.stats, job).find(entry => entry.id === event.id).chance;
    const original = copy(state);
    assert.ok(chance(state) > 0, `${event.id} is reachable`);
    assert.equal(chance({ ...state, age: event.minAge - 1 }), 0, `${event.id} cannot start too early`);
    assert.equal(chance({ ...state, age: event.maxAge + 1 }), 0, `${event.id} cannot start too late`);
    if (event.conditions?.includes('college')) assert.equal(chance({ ...state, education: { status: 'workforce' } }), 0);
    if (event.conditions?.includes('employed')) assert.equal(eventChances(state, state.stats, null).find(entry => entry.id === event.id).chance, 0);
    assert.deepEqual(state, original, 'reading event eligibility is pure');
    if (event.minAge < 2) assert.equal(event.choices, undefined, 'infant experiences are automatic');
    if (event.minAge === 2) assert.equal(event.maxAge, 3, 'toddler limits resolve before school');
  }
});

test('every new decision applies distinct recorded outcomes and preserves them through save reloads', () => {
  for (const event of additions.filter(event => event.choices)) {
    const fixture = lifeAt(event.minAge + 1, event.conditions?.includes('college'));
    assert.notDeepEqual(event.choices[0], event.choices[1], event.id);
    const outcomes = [];
    for (const choice of event.choices) {
      const state = copy(fixture);
      state.pendingEvents = [{ eventId: event.id, age: state.age }];
      state.lastYearEvents = [event.id];
      const rng = state.rng;
      assert.equal(validateSave(state), true, `${event.id}: queued save`);
      assert.equal(resolveEventChoice(state, choice.id, event.id).ok, true);
      assert.equal(state.rng, rng, 'choosing an authored outcome does not reroll it');
      assert.equal(state.pendingEvents.length, 0);
      for (const key of Object.keys(state.stats)) {
        const expected = Math.round(Math.max(1, Math.min(10, 5 + (choice.statChanges?.[key] || 0))) * 100) / 100;
        assert.equal(state.stats[key], expected, `${event.id}/${choice.id}/${key}`);
        assert.equal(effectiveStats(state)[key], Math.round(Math.max(1, Math.min(10, expected + (choice.modifiers?.[key] || 0))) * 100) / 100);
      }
      for (const [key, cap] of Object.entries(choice.focusLimits?.[state.age < 5 ? 'toddler' : 'standard'] || {})) {
        assert.equal(focusLimits(state)[key], cap);
        assert.ok(state.focus[key] <= cap);
      }
      assert.ok(state.history[0].text.startsWith(`${choice.label}. `));
      assert.equal(validateSave(state), true, `${event.id}/${choice.id}: outcome save`);
      assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), state);
      outcomes.push({ stats: state.stats, effects: state.effects, focus: state.focus });
    }
    assert.notDeepEqual(outcomes[0], outcomes[1], `${event.id} offers mechanically different options`);
  }
});

test('new automatic experiences can actually roll and record their consequences', () => {
  for (const event of additions.filter(event => !event.choices)) {
    const fixture = lifeAt(event.minAge, event.conditions?.includes('college'));
    if (event.conditions?.includes('employed')) assert.equal(takeJob(fixture, 'retail').ok, true);
    let found;
    for (let attempt = 1; attempt <= 600; attempt++) {
      const state = copy(fixture);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      if (state.lastYearEvents.includes(event.id)) { found = state; break; }
    }
    assert.ok(found, `${event.id} rolls under its intended conditions`);
    assert.ok(found.yearSummary.events.some(entry => entry.title === event.name));
    if (Object.keys(event.modifiers).length || event.focusLimits) {
      const effect = found.effects.find(effect => effect.id === event.id);
      assert.equal(effect?.years, event.years, `${event.id} begins with its full duration`);
      assert.deepEqual(effect.focusLimits, event.focusLimits);
    }
    assert.equal(validateSave(found), true);
  }
});
