import test from 'node:test';
import { createSchoolRecord } from '../school.js';
import assert from 'node:assert/strict';
import { EVENTS, eventChances } from '../events.js';
import { FAMILY_EVENTS } from '../family-events.js';
import { APTITUDE_EVENTS, APTITUDE_EVENT_STATS } from '../cross-aptitude-events.js';
import { createGame, advanceYear, validateSave, migrateSave } from '../engine.js';
import { changedRating } from '../rating-changes.js';

test('personal ratings are permanent while activity restrictions and explicit household access effects retain durations', () => {
  for (const event of [...EVENTS, ...FAMILY_EVENTS]) {
    for (const outcome of [event, ...(event.choices || [])]) {
      assert.deepEqual(outcome.modifiers || {}, {}, event.id);
      assert.equal(outcome.lifestyle, undefined, event.id);
      assert.equal(outcome.years > 0, Boolean(outcome.focusCapacity || outcome.focusMinimums || outcome.focusPoints || outcome.householdLifestyle), `${event.id}:${outcome.id}`);
    }
  }
  const gossip = EVENTS.find(event => event.id === 'gossip_choice').choices.find(choice => choice.id === 'spread');
  assert.ok(Math.abs(gossip.statChanges.social - (-.4)) < 1e-10, 'lasting and formerly timed effects merge before applying');
  const lesson = EVENTS.find(event => event.id === 'extra_lessons').choices.find(choice => choice.id === 'study');
  assert.deepEqual(lesson.statChanges, { intelligence: .5 });
  assert.deepEqual(lesson.focusCapacity, { standard: { social: -2 } });
});

test('rare aptitude experiences cover every ordered pair in both directions without changing the source', () => {
  assert.equal(APTITUDE_EVENTS.length, 84);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, EVENTS.length);
  for (const source of APTITUDE_EVENT_STATS) {
    for (const target of APTITUDE_EVENT_STATS.filter(key => key !== source)) {
      for (const direction of [1, -1]) {
        const events = APTITUDE_EVENTS.filter(event => event.statFactors[0][0] === source && event.aptitudeChanges[target] === direction);
        assert.equal(events.length, 1, `${source} to ${target} ${direction}`);
        const event = events[0];
        assert.deepEqual(event.statChanges, { [target]: .3 * direction });
        assert.deepEqual(event.aptitudeChanges, { [target]: direction });
        assert.equal(event.statFactors[0][1], direction > 0 ? 'high' : 'low');
        assert.equal(event.rare, true);
        assert.ok(event.description.length > 30);
      }
    }
  }
});

test('rare odds respond only to the different source, respect aptitude limits, and stay rare in total', () => {
  const state = createGame({ seed: 73519 });
  state.age = 10;
  for (const key of APTITUDE_EVENT_STATS) { state.stats[key] = 5; state.aptitudes[key] = 0; }
  const snapshot = structuredClone(state);
  const odds = () => eventChances(state, state.stats).filter(entry => entry.id.startsWith('aptitude_'));
  const balanced = odds();
  assert.deepEqual(state, snapshot, 'reading rare odds never consumes RNG or mutates saves');
  const total = balanced.reduce((sum, entry) => sum + entry.chance, 0);
  assert.ok(total > .005 && total < .02, total);
  for (const event of APTITUDE_EVENTS) {
    const [source, direction] = event.statFactors[0];
    const target = Object.keys(event.aptitudeChanges)[0];
    state.stats[source] = direction === 'high' ? 9 : 1;
    const favored = odds().find(entry => entry.id === event.id).chance;
    state.stats[source] = direction === 'high' ? 1 : 9;
    const unfavored = odds().find(entry => entry.id === event.id).chance;
    assert.ok(favored > unfavored, event.id);
    assert.ok(favored <= .0006, event.id);
    state.stats[source] = 5;
    state.aptitudes[target] = event.aptitudeChanges[target] > 0 ? 3 : -3;
    assert.equal(odds().find(entry => entry.id === event.id).chance, 0, `${event.id} at aptitude limit`);
    state.aptitudes[target] = 0;
  }
  state.age = 4;
  assert.ok(odds().every(event => event.chance === 0), 'these social and learning experiences start at school age');
  state.age = 30;
  assert.ok(odds().filter(event => event.id.startsWith('aptitude_strength_social_')).every(event => event.chance === 0), 'recess is confined to school years');
});

test('trait-driven experiences change different stats and injuries still limit activity', () => {
  // The full owner-aware invariant, including gates and family events, lives
  // in event-source-effects.test.js. Personal outcomes have no exceptions.
  for (const event of EVENTS.filter(event => event.statFactors?.length)) {
    for (const outcome of [event, ...(event.choices || [])]) {
      for (const [key] of event.statFactors) assert.ok(!outcome.statChanges?.[key], `${event.id}:${outcome.id}:${key}`);
    }
  }
  for (const id of ['broken_bone', 'playground_fall', 'injury', 'sports_sprain', 'unsafe_lift', 'minor_strain', 'elder_fall']) {
    const event = EVENTS.find(event => event.id === id);
    assert.ok(event.focusCapacity, id);
    if (id === 'minor_strain') assert.equal(event.statChanges, undefined, 'minor soreness restricts activity without a permanent mental penalty');
    else assert.ok(event.statChanges.attractiveness < 0 || event.statChanges.stability < 0, id);
    assert.equal(event.statChanges?.strength, undefined, id);
    assert.equal(event.statChanges?.health, undefined, id);
  }
});

test('a seeded recess experience permanently raises Social and its learning ability and survives reload', () => {
  const original = createGame({ seed: 73519 });
  original.age = 10;
  original.focus = { work: 2, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 };
  for (const key of APTITUDE_EVENT_STATS) { original.stats[key] = 5; original.aptitudes[key] = 0; }
  original.stats.strength = 10;
  original.school = createSchoolRecord(original);
  const before = { ...original.aptitudes };
  let state;
  // The catalog is shuffled before independent rolls. Search a bounded set of
  // deterministic streams so adding an unrelated event cannot invalidate the fixture.
  for (let attempt = 0; attempt < 20000; attempt++) {
    const candidate = structuredClone(original);
    candidate.rng = (3090398293 + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
    if (candidate.lastYearEvents.includes('aptitude_strength_social_gain')
        && candidate.lastYearEvents.filter(id => id.startsWith('aptitude_')).length === 1) {
      state = candidate;
      break;
    }
  }
  assert.ok(state, 'the recess experience must roll within the deterministic sample');
  assert.ok(state.lastYearEvents.includes('aptitude_strength_social_gain'));
  assert.deepEqual(state.aptitudes, { ...before, social: 1 });
  const event = EVENTS.find(entry => entry.id === 'aptitude_strength_social_gain');
  const story = state.history.find(entry => entry.title === event.name);
  const result = story.text.match(/Your social ([\d.]+) → ([\d.]+)/);
  assert.ok(result, 'the experience records its actual Social rating change');
  assert.equal(Number(result[2]), changedRating(Number(result[1]), .3));
  assert.match(story.text, /Your social [\d.]+ → [\d.]+/);
  assert.match(story.text, /Your social learning ability 0 → \+1/);
  assert.equal(state.effects.some(effect => effect.id.startsWith('aptitude_')), false);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
});
