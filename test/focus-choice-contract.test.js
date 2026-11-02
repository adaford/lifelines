import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, chooseEducation } from '../engine.js';
import { MAX_FOCUS, DEFAULT_FOCUS, defaultFocus, focusBudget, focusEffect } from '../focus-rules.js';
import { focusChoiceEffects, schoolFocusEffects, schoolFocusSteps, standardFocusPractice, toddlerActivityEffects, TODDLER_ACTIVITY_EFFECTS, SCHOOL_FOCUS_EFFECTS } from '../development.js';
import { createSchoolRecord } from '../school.js';
import { choiceImpacts, schoolChoiceImpacts, toddlerChoiceImpacts } from '../choice-impacts.js';

const near = (actual, expected, context) => assert.ok(Math.abs(actual - expected) < 1e-10, `${context}: ${actual} vs ${expected}`);
function life(age) {
  const state = createGame({ seed: 61263 });
  state.age = age;
  state.conditions = [];
  if (age >= 18) chooseEducation(state, 'work');
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  state.focus = defaultFocus(state);
  for (const person of [state, ...state.parents]) {
    for (const stat of Object.keys(person.stats)) { person.stats[stat] = 5; person.aptitudes[stat] = 0; }
    if ('relationship' in person) person.relationship = 5;
  }
  return state;
}

test('the shared focus scale gives every stage its default allocation and endpoint curve', () => {
  assert.equal(MAX_FOCUS, 4);
  assert.equal(DEFAULT_FOCUS, 2);
  assert.deepEqual([0, 1, 2, 3, 4].map(focusEffect), [-3, -1, 0, 1, 3]);
  for (const age of [2, 4, 5, 17, 18, 30, 70]) {
    const focus = defaultFocus(age);
    assert.ok(Object.entries(focus).every(([key, points]) => points === (age >= 5 && age < 18 && ['sports', 'extracurricular'].includes(key) ? 0 : 2)));
    assert.equal(focusBudget(age), age < 18 ? 10 : 8);
    assert.equal(Object.values(focus).reduce((total, points) => total + points, 0), age >= 5 && age < 18 ? 8 : focusBudget(age));
  }
});

test('default choices omit background effects and show the two unjoined activity penalties', () => {
  for (const age of [2, 4, 5, 17, 19, 30, 70]) {
    const state = life(age);
    state.stats.health = 1;
    state.parents[0].stats.stability = 1;
    const before = structuredClone(state);
    if (age < 5) for (const key of Object.keys(state.focus)) assert.deepEqual(toddlerChoiceImpacts(state, key), []);
    else if (age < 18) for (const key of Object.keys(state.focus)) {
      const entries = schoolChoiceImpacts(state, key);
      if (key === 'extracurricular' || key === 'sports') {
        assert.deepEqual(entries.map(entry => entry.stat).sort(), key === 'sports' ? ['social', 'strength'] : ['creativity', 'intelligence']);
        assert.ok(entries.every(entry => entry.change < 0 && entry.level === 1 && !entry.parentId));
      } else assert.deepEqual(entries, []);
    }
    else assert.deepEqual(choiceImpacts(state), []);
    assert.deepEqual(state, before, 'previews preserve stats, choices, and RNG');
  }
});

test('raw choice effects retain ordinary endpoints and the custom toddler and School curves', () => {
  for (const age of [2, 12, 19, 35, 70]) for (const aptitude of [-3, 0, 3]) {
    const state = life(age);
    for (const stat of Object.keys(state.aptitudes)) state.aptitudes[stat] = aptitude;
    for (const area of Object.keys(state.focus).filter(key => !['sports', 'extracurricular'].includes(key))) {
      const effects = points => {
        const selected = { ...state, focus: { ...state.focus, [area]: points } };
        if (age >= 5 && age < 18) {
          const chosen = standardFocusPractice(selected), without = standardFocusPractice(selected, null, area);
          // Other choices can oppose the row's contribution, so raw curve
          // proportions must be checked before the sign-specific aptitude response.
          return Object.fromEntries(Object.keys(chosen).map(stat => [stat, chosen[stat] - (without[stat] || 0)]));
        }
        return age < 5 ? toddlerActivityEffects(selected)[area]
          : focusChoiceEffects(selected);
      };
      const neutral = effects(2);
      assert.ok(Object.values(neutral).every(amount => Math.abs(amount) < 1e-10));
      for (const [endpoint, adjacent] of [[0, 1], [4, 3]]) {
        const extreme = effects(endpoint), unit = effects(adjacent);
        for (const stat of Object.keys(extreme)) {
          if (age < 5 && area === 'creative' && stat === 'intelligence') {
            near(unit[stat], 0, 'crafts Intelligence is unchanged at one or three points');
            const electronicsPoints = endpoint === 0 ? 1 : 3;
            const electronics = toddlerActivityEffects({ ...state, focus: { ...state.focus, social: electronicsPoints } }).social.intelligence;
            near(extreme[stat], electronics / 2, 'crafts endpoints have one Intelligence unit');
          } else {
            const ratio = age < 5 && area === 'social' ? 2 : age >= 5 && age < 18
              ? schoolFocusSteps(area, stat, endpoint) / schoolFocusSteps(area, stat, adjacent) : 3;
            near(extreme[stat], ratio * unit[stat], `${age} ${area} ${stat}, aptitude ${aptitude}`);
          }
        }
      }
    }
  }
});

test('individual effects retain their point curves, including endpoint-only crafts Intelligence', () => {
  for (const age of [3, 12, 19]) {
    const state = life(age);
    state.conditions = [];
    if (age === 19) state.education = { status: 'college', years: 1 };
    const preview = age < 5 ? toddlerChoiceImpacts : schoolChoiceImpacts;
    for (const area of Object.keys(state.focus).filter(key => !['sports', 'extracurricular'].includes(key))) for (const [points, level] of [[0, 3], [1, 1], [2, 0], [3, 1], [4, 3]]) {
      const selected = { ...state, focus: { ...defaultFocus(age), [area]: points } };
      const entries = preview(selected, area);
      if (level === 0) assert.deepEqual(entries, []);
      else {
        assert.ok(entries.length, `${age} ${area} at ${points} points has effects`);
        for (const entry of entries) {
          const expected = age < 5 && area === 'social' ? Math.abs(points - 2) * (entry.stat === 'intelligence' ? 2 : 1) : age < 5 && area === 'creative' && entry.stat === 'intelligence' ? [1, 0, 0, 0, 1][points] : age >= 5 && age < 18 ? Math.abs(schoolFocusSteps(area, entry.stat, points)) : level;
          assert.equal(entry.level, expected, `${age} ${area} ${entry.parentId || 'you'} ${entry.stat}`);
        }
        if (age < 5 && area === 'creative') assert.equal(entries.some(entry => entry.stat === 'intelligence'), points === 0 || points === 4);
      }
    }
  }
});

test('each sign has the same raw stat magnitude across toddler and school activities', () => {
  for (const [age, coefficients, preview] of [[3, TODDLER_ACTIVITY_EFFECTS, toddlerChoiceImpacts], [12, SCHOOL_FOCUS_EFFECTS, schoolChoiceImpacts]]) {
    const state = life(age);
    state.conditions = [];
    const perSign = new Map();
    for (const [area, stats] of Object.entries(coefficients)) for (const points of [0, 1, 3, 4]) {
      const selected = { ...state, focus: { ...state.focus, [area]: points } };
      const effects = age < 5 ? toddlerActivityEffects(selected)[area] : schoolFocusEffects(selected, area);
      const entries = preview(selected, area);
      for (const stat of Object.keys(stats)) {
        const entry = entries.find(entry => entry.stat === stat && !entry.parentId);
        if (age < 5 && area === 'creative' && stat === 'intelligence' && [1, 3].includes(points)) {
          assert.equal(entry, undefined);
          near(effects[stat], 0, 'crafts has no Intelligence change at the inner allocations');
          continue;
        }
        assert.ok(entry, `${age} ${area} ${stat} remains visible away from bounds`);
        assert.equal(Math.sign(entry.change), Math.sign(effects[stat]));
        const magnitude = Math.abs(effects[stat]) / entry.level;
        if (!perSign.has(stat)) perSign.set(stat, magnitude);
        near(magnitude, perSign.get(stat), `${age}: one ${stat} sign in ${area} at ${points} points`);
      }
    }
  }
});
