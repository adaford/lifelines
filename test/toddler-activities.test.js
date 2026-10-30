import { stripWellbeingAptitudes, neutralWellbeingAptitudes } from './helpers/legacy-height.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, setFocus, validateSave, migrateSave, annualForecast } from '../engine.js';
import { TODDLER_FOCUS, skillChanges, childhoodWellbeing, toddlerActivityEffects } from '../development.js';

const copy = value => structuredClone(value);
const toddler = () => {
  const state = createGame({ seed: 42110 });
  state.age = 2;
  state.focus = { ...TODDLER_FOCUS };
  return state;
};
const survives = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };

test('activity contributions grow with points, match practice changes, and do not consume RNG', () => {
  for (const aptitude of [-3, 0, 3]) {
    const state = toddler();
    for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = aptitude;
    const before = copy(state);
    const effects = toddlerActivityEffects(state);
    assert.deepEqual(state, before);
    for (const [activity, stats] of Object.entries(effects)) {
      const without = { ...state, focus: { ...state.focus, [activity]: 0 } };
      for (const [stat, amount] of Object.entries(stats)) {
        if (['health', 'stability'].includes(stat)) continue;
        assert.ok(Math.abs(amount - (skillChanges(state)[stat] - skillChanges(without)[stat])) < 1e-12);
      }
      let previous = 0;
      for (let points = 0; points <= 5; points++) {
        const impacts = toddlerActivityEffects({ ...state, focus: { ...state.focus, [activity]: points } })[activity];
        const total = Object.values(impacts).reduce((sum, amount) => sum + Math.abs(amount), 0);
        assert.ok(total >= previous);
        previous = total;
        if (activity === 'social' && points) assert.ok(impacts.intelligence > 0 && impacts.social < 0);
      }
    }
    assert.equal(Object.hasOwn(effects.work, 'creativity'), false);
    assert.ok(effects.creative.creativity > 0);
  }
});

test('rest uses the halved toddler health response and crafts spend the shared budget', () => {
  const state = toddler();
  state.aptitudes.health = 0;
  const higher = { ...state, focus: { ...state.focus, self: 4 } };
  assert.ok(Math.abs(childhoodWellbeing(higher).health - childhoodWellbeing(state).health - .05) < 1e-12);
  assert.equal(setFocus(state, 'creative', 3).ok, false);
  assert.equal(setFocus(state, 'work', 2).ok, true);
  assert.equal(setFocus(state, 'creative', 3).ok, true);
  assert.equal(setFocus(state, 'creative', 6).ok, false);
  assert.equal(setFocus(state, 'creative', 1.5).ok, false);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(state), state);
  state.age = 5;
  delete state.focus.creative;
  assert.equal(setFocus(state, 'creative', 1).ok, false);
});

test('crafts develop intelligence at one-third the electronics rate while retaining creativity', () => {
  for (const age of [2, 3, 4]) {
    const state = toddler();
    state.age = age;
    state.aptitudes.intelligence = 0;
    state.focus.work = 2;
    const before = copy(state);
    const baseline = skillChanges(state);
    const crafts = skillChanges({ ...state, focus: { ...state.focus, creative: 3 } });
    const electronics = skillChanges({ ...state, focus: { ...state.focus, social: 3 } });
    const craftsGain = crafts.intelligence - baseline.intelligence;
    const electronicsGain = electronics.intelligence - baseline.intelligence;
    assert.ok(craftsGain > 0);
    assert.ok(Math.abs(craftsGain * 3 - electronicsGain) < 1e-12);
    assert.ok(crafts.creativity > baseline.creativity);
    assert.equal(crafts.social, baseline.social);
    assert.equal(crafts.strength, baseline.strength);
    const effects = toddlerActivityEffects(state);
    assert.ok(Math.abs(effects.creative.intelligence * 3 - effects.social.intelligence) < 1e-12);
    assert.deepEqual(state, before, 'development and activity reads preserve the save and RNG');
  }
});

test('toddler social practice has three, minus one, and two relative units while family time builds parent relationships', () => {
  for (const age of [2, 3, 4]) {
    const state = toddler();
    state.age = age;
    state.aptitudes.social = 0;
    state.focus.self = 2;
    state.parents.forEach(parent => { parent.relationship = 5; });
    const before = copy(state);
    const baseline = skillChanges(state);
    const more = activity => ({ ...state, focus: { ...state.focus, [activity]: state.focus[activity] + 1 } });
    const play = skillChanges(more('work'));
    const electronics = skillChanges(more('social'));
    const family = skillChanges(more('family'));
    const playGain = play.social - baseline.social;
    const electronicsGain = electronics.social - baseline.social;
    const familyGain = family.social - baseline.social;
    assert.ok(playGain > 0 && electronicsGain < 0 && familyGain > 0);
    assert.ok(Math.abs(electronicsGain * -3 - playGain) < 1e-12);
    assert.ok(Math.abs(familyGain * 3 - playGain * 2) < 1e-12);
    assert.equal(family.intelligence, baseline.intelligence);
    assert.equal(Object.hasOwn(toddlerActivityEffects(state).family, 'intelligence'), false);
    const neutral = annualForecast(state);
    const closer = annualForecast(more('family'));
    for (const parent of neutral.parents) {
      const next = closer.parents.find(person => person.id === parent.id);
      assert.equal(parent.relationship.change, 0);
      assert.equal(next.relationship.change, .04);
    }
    assert.deepEqual(state, before, 'practice and forecast reads preserve the save and RNG');
  }
});

test('age two unlocks five activities and the school transition preserves the completed choices', () => {
  const infant = createGame({ seed: 42111 });
  infant.age = 1;
  assert.equal(advanceYear(infant, survives).ok, true);
  assert.deepEqual(infant.focus, TODDLER_FOCUS);
  const state = toddler();
  state.age = 4;
  state.focus = { work: 4, social: 0, family: 2, self: 1, creative: 5 };
  const decisions = copy(state.focus);
  const before = copy(state);
  annualForecast(state);
  assert.deepEqual(state, before);
  assert.equal(advanceYear(state, survives).ok, true);
  assert.equal(state.age, 5);
  assert.deepEqual(state.yearSummary.decisions, { focus: decisions, workLabel: 'Play' });
  assert.deepEqual(state.focus, { work: 5, social: 0, family: 2, self: 5 });
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(state), state);
});

test('v10 toddler saves gain an empty crafts allocation without rewriting progress or old reviews', () => {
  const state = toddler();
  state.age = 3;
  state.focus = { work: 2, social: 4, family: 3, self: 3 };
  advanceYear(state, survives);
  stripWellbeingAptitudes(state);
  state.version = 10;
  delete state.focus.creative;
  delete state.yearSummary.decisions.focus.creative;
  const before = copy(state);
  const migrated = migrateSave(state);
  assert.deepEqual(state, before);
  assert.ok(migrated);
  const expected = { ...copy(before), version: 16, focus: { ...before.focus, creative: 0 } };
  neutralWellbeingAptitudes(expected);
  assert.deepEqual(migrated, expected);
  assert.equal(Object.hasOwn(migrated.yearSummary.decisions.focus, 'creative'), false);
  assert.deepEqual(migrateSave(migrated), migrated);
  for (const focus of [
    { ...migrated.focus, creative: 1 },
    { ...migrated.focus, creative: -1 },
    { ...migrated.focus, creative: .5 },
    { ...migrated.focus, invented: 0 },
  ]) assert.equal(migrateSave({ ...migrated, focus }), null);
});
