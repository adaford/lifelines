import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, chooseEducation } from '../engine.js';
import { MAX_FOCUS, DEFAULT_FOCUS, defaultFocus, focusBudget, focusEffect } from '../focus-rules.js';
import { focusChoiceEffects, schoolFocusEffects, toddlerActivityEffects, TODDLER_ACTIVITY_EFFECTS, STANDARD_FOCUS_EFFECTS } from '../development.js';
import { choiceImpacts, schoolChoiceImpacts, toddlerChoiceImpacts } from '../choice-impacts.js';

const near = (actual, expected, context) => assert.ok(Math.abs(actual - expected) < 1e-10, `${context}: ${actual} vs ${expected}`);
function life(age) {
  const state = createGame({ seed: 61263 });
  state.age = age;
  if (age >= 18) chooseEducation(state, 'work');
  state.focus = defaultFocus(age);
  for (const person of [state, ...state.parents]) {
    for (const stat of Object.keys(person.stats)) { person.stats[stat] = 5; person.aptitudes[stat] = 0; }
    if ('relationship' in person) person.relationship = 5;
  }
  return state;
}

test('the shared focus scale gives every stage its exact neutral allocation and endpoint curve', () => {
  assert.equal(MAX_FOCUS, 4);
  assert.equal(DEFAULT_FOCUS, 2);
  assert.deepEqual([0, 1, 2, 3, 4].map(focusEffect), [-3, -1, 0, 1, 3]);
  for (const age of [2, 4, 5, 17, 18, 30, 70]) {
    const focus = defaultFocus(age);
    assert.ok(Object.values(focus).every(points => points === 2));
    assert.equal(focusBudget(age), age < 5 ? 10 : 8);
    assert.equal(Object.values(focus).reduce((total, points) => total + points, 0), focusBudget(age));
  }
});

test('all default choices have no personal or caregiver effect previews, including adult background decline', () => {
  for (const age of [2, 4, 5, 17, 19, 30, 70]) {
    const state = life(age);
    state.stats.health = 1;
    state.parents[0].stats.stability = 1;
    const before = structuredClone(state);
    if (age < 5) for (const key of Object.keys(state.focus)) assert.deepEqual(toddlerChoiceImpacts(state, key), []);
    else if (age < 18) for (const key of Object.keys(state.focus)) assert.deepEqual(schoolChoiceImpacts(state, key), []);
    else assert.deepEqual(choiceImpacts(state), []);
    assert.deepEqual(state, before, 'neutral previews preserve stats, choices, and RNG');
  }
});

test('every raw choice effect triples at zero and four before rating bounds and rounding', () => {
  for (const age of [2, 12, 19, 35, 70]) for (const aptitude of [-3, 0, 3]) {
    const state = life(age);
    for (const stat of Object.keys(state.aptitudes)) state.aptitudes[stat] = aptitude;
    for (const area of Object.keys(state.focus)) {
      const effects = points => {
        const selected = { ...state, focus: { ...state.focus, [area]: points } };
        return age < 5 ? toddlerActivityEffects(selected)[area]
          : age < 18 ? schoolFocusEffects(selected, area) : focusChoiceEffects(selected);
      };
      const neutral = effects(2);
      assert.ok(Object.values(neutral).every(amount => Math.abs(amount) < 1e-10));
      for (const [endpoint, adjacent] of [[0, 1], [4, 3]]) {
        const extreme = effects(endpoint), unit = effects(adjacent);
        for (const stat of Object.keys(extreme)) near(extreme[stat], 3 * unit[stat], `${age} ${area} ${stat}, aptitude ${aptitude}`);
      }
    }
  }
});

test('every individual focus effect uses one sign next to neutral and three at endpoints', () => {
  for (const age of [3, 12, 19]) {
    const state = life(age);
    state.conditions = [];
    if (age === 19) state.education = { status: 'college', years: 1 };
    const preview = age < 5 ? toddlerChoiceImpacts : schoolChoiceImpacts;
    for (const area of Object.keys(state.focus)) for (const [points, level] of [[0, 3], [1, 1], [2, 0], [3, 1], [4, 3]]) {
      const selected = { ...state, focus: { ...defaultFocus(age), [area]: points } };
      const entries = preview(selected, area);
      if (level === 0) assert.deepEqual(entries, []);
      else {
        assert.ok(entries.length, `${age} ${area} at ${points} points has effects`);
        for (const entry of entries) assert.equal(entry.level, level, `${age} ${area} ${entry.parentId || 'you'} ${entry.stat}`);
      }
    }
  }
});

test('each sign has the same raw stat magnitude across toddler and school activities', () => {
  for (const [age, coefficients, preview] of [[3, TODDLER_ACTIVITY_EFFECTS, toddlerChoiceImpacts], [12, STANDARD_FOCUS_EFFECTS, schoolChoiceImpacts]]) {
    const state = life(age);
    state.conditions = [];
    const perSign = new Map();
    for (const [area, stats] of Object.entries(coefficients)) for (const points of [0, 1, 3, 4]) {
      const selected = { ...state, focus: { ...state.focus, [area]: points } };
      const effects = age < 5 ? toddlerActivityEffects(selected)[area] : schoolFocusEffects(selected, area);
      const entries = preview(selected, area);
      for (const stat of Object.keys(stats)) {
        const entry = entries.find(entry => entry.stat === stat && !entry.parentId);
        assert.ok(entry, `${age} ${area} ${stat} remains visible away from bounds`);
        assert.equal(Math.sign(entry.change), Math.sign(effects[stat]));
        const magnitude = Math.abs(effects[stat]) / entry.level;
        if (!perSign.has(stat)) perSign.set(stat, magnitude);
        near(magnitude, perSign.get(stat), `${age}: one ${stat} sign in ${area} at ${points} points`);
      }
    }
  }
});
