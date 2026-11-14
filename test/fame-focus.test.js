import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, annualForecast, focusLimits } from '../engine.js';
import { focusKeysForAge, focusMaxFor, focusNeutralFor, focusBudget, defaultFocus, fitFocusBudget } from '../focus-rules.js';
import { createSchoolRecord, schoolActivity, activityEligible, activitySuccessChange, activitySuccessAfterYear } from '../school.js';
import { effectiveAptitude, standardFocusCoefficients, standardFocusPractice, schoolFocusSteps, schoolFocusEffects,
  skillChanges, schoolAppearanceChange, focusChoiceEffects } from '../development.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} vs ${expected}`);
const coreKeys = ['work', 'social', 'family', 'self'];
function person(age = 17, kind = 'sports', id = 'soccer') {
  const state = createGame({ seed: 66791, gender: 'male' });
  Object.assign(state, { age, conditions: [], effects: [], lifestyle: 8,
    education: { status: age < 18 ? 'school' : 'workforce', years: 0 } });
  for (const key of Object.keys(state.stats)) { state.stats[key] = 5; state.aptitudes[key] = 0; }
  state.school = createSchoolRecord({ ...state, age: Math.min(age, 17) });
  if (kind !== 'personal') state.school[kind] = { id, success: 5 };
  state.fame = { kind, activityId: kind === 'personal' ? null : id, rating: 5, support: 0, startedAge: Math.min(age, 16) };
  state.focus = { ...defaultFocus(state), work: 1, social: 1, family: 1, self: 1 };
  return state;
}

test('only the matching famous activity gains a third point and follows its owner into the eight-point adult budget', () => {
  const state = person(17, 'extracurricular', 'chess');
  assert.equal(focusMaxFor(state, 'extracurricular'), 3);
  assert.equal(focusMaxFor(state, 'sports'), 2);
  assert.equal(focusMaxFor(state, 'self'), 4);
  assert.equal(focusBudget(state), 10);
  assert.deepEqual(focusKeysForAge(state), [...coreKeys, 'sports', 'extracurricular']);
  state.age = 18;
  assert.deepEqual(focusKeysForAge(state), [...coreKeys, 'extracurricular']);
  assert.deepEqual(focusKeysForAge(18), coreKeys, 'age-only calls retain the ordinary adult shape');
  assert.equal(focusBudget(state), 8, 'fame provides capacity, not extra budget');
  assert.equal(focusNeutralFor(state, 'extracurricular'), 1);
  assert.deepEqual(defaultFocus(state), { work: 2, social: 2, family: 2, self: 2, extracurricular: 0 });
  const chosen = { work: 1, social: 1, family: 1, self: 2, extracurricular: 3 };
  assert.deepEqual(fitFocusBudget(state, chosen), chosen);
  const fitted = fitFocusBudget(state, { work: 4, social: 4, family: 4, self: 4, sports: 3, extracurricular: 5 });
  assert.deepEqual(Object.keys(fitted), [...coreKeys, 'extracurricular']);
  assert.equal(Object.values(fitted).reduce((sum, value) => sum + value), 8);
  assert.ok(fitted.extracurricular <= 3);
  state.school.extracurricular.id = 'piano';
  assert.deepEqual(focusKeysForAge(state), coreKeys, 'switching away does not transfer fame privileges');
  state.age = 17;
  assert.equal(focusMaxFor(state, 'extracurricular'), 2);
  const personal = person(25, 'personal');
  assert.deepEqual(focusKeysForAge(personal), coreKeys);
  assert.equal(focusMaxFor(personal, 'self'), 4);
  assert.equal(focusBudget(personal), 8);
});

test('the third source point improves success before and after school while other activities retain their old limits', () => {
  for (const age of [17, 18, 40]) for (const [kind, id] of [['sports', 'soccer'], ['extracurricular', 'chess']]) {
    const state = person(age, kind, id), activity = schoolActivity(kind, id), before = copy(state);
    assert.equal(activityEligible(state, activity), true);
    assert.deepEqual([0, 1, 2, 3].map(points => activitySuccessChange(state, activity, points)), [-.6, 0, .6, 1.2]);
    assert.deepEqual([0, 1, 2, 3].map(points => activitySuccessAfterYear(state, activity, null, points)), [4.4, 5, 5.6, 6.2]);
    assert.deepEqual(state, before, 'success reads preserve enrollment, fame, ratings, and RNG');
    const ordinary = { ...state, fame: null };
    assert.equal(activitySuccessChange(ordinary, activity, 3), .6);
    assert.equal(activityEligible(ordinary, activity), age < 18);
  }
  const state = person(30, 'sports', 'lacrosse'), lacrosse = schoolActivity('sports', 'lacrosse');
  state.lifestyle = 6;
  assert.equal(activityEligible(state, lacrosse), false, 'fame never bypasses a Lifestyle requirement');
  assert.equal(activitySuccessAfterYear(state, lacrosse, 6.2, 3, 3), 6.2);
  state.school.sports.id = 'soccer';
  assert.equal(activityEligible(state, lacrosse), false, 'a retained fame ID cannot substitute for current enrollment');
});

test('every source training map uses three full units and adds Social training even when the sport already teaches it', () => {
  const cases = [
    ['sports', 'soccer', { strength: .3, social: .48 }],
    ['sports', 'fencing', { strength: .3, intelligence: .225, social: .48 }],
    ['sports', 'gymnastics', { strength: .3, creativity: .24, social: .48 }],
    ['extracurricular', 'chess', { intelligence: .225, social: .24 }],
    ['extracurricular', 'modeling', { attractiveness: .225, social: .24 }],
  ];
  for (const age of [17, 18, 40]) for (const [kind, id, coefficients] of cases) {
    const state = person(age, kind, id);
    for (const points of [1, 2, 3]) {
      state.focus[kind] = points;
      const before = copy(state), practice = standardFocusPractice(state), without = standardFocusPractice(state, null, kind);
      assert.deepEqual(standardFocusCoefficients(state)[kind], coefficients);
      for (const [stat, coefficient] of Object.entries(coefficients)) {
        near(practice[stat] - (without[stat] || 0), coefficient * points, `${age}/${id}/${stat} at ${points}`);
      }
      assert.deepEqual(state, before);
    }
    assert.deepEqual([0, 1, 2, 3].map(points => schoolFocusSteps(kind, 'social', points)), [-1, 1, 2, 3]);
  }
});

test('adult activity fame keeps only its source practice and does not invent inactivity for the other category', () => {
  const state = person(25, 'extracurricular', 'chess');
  state.focus = { work: 2, social: 2, family: 2, self: 2, extracurricular: 3 };
  assert.equal(standardFocusCoefficients(state).sports, undefined);
  let practice = standardFocusPractice(state);
  near(practice.intelligence, .675, 'three units of chess training');
  near(practice.social, .72, 'three units of fame Social training');
  assert.equal(practice.strength, 0);
  assert.equal(practice.creativity, 0);
  state.focus.extracurricular = 0;
  practice = standardFocusPractice(state);
  assert.equal(practice.intelligence, -.225);
  assert.equal(practice.creativity, -.24);
  assert.equal(practice.social, -.24);
  assert.equal(practice.strength, 0);
  state.fame = null;
  assert.equal(standardFocusCoefficients(state).extracurricular, undefined);
  assert.ok(Object.values(standardFocusPractice(state)).every(value => value === 0), 'ordinary adults retain no school-activity practice');
});

test('fame adds five to effective Social learning above the natural cap without a free rating gain', () => {
  const state = person(25, 'personal');
  state.focus = { work: 2, social: 2, family: 2, self: 2 };
  state.aptitudes.social = 3;
  assert.equal(effectiveAptitude(state, 'social'), 8);
  assert.equal(effectiveAptitude(state, 'intelligence'), 0);
  assert.ok(Object.values(skillChanges(state)).every(value => value === 0), 'fame alone creates no Social gain');
  const before = copy(state);
  for (const [points, expected] of [[3, .24 * .25 * 1.64], [1, -.24 * .25 * .44]]) {
    const candidate = { ...state, focus: { ...state.focus, social: points } };
    near(skillChanges(candidate).social, expected, 'routine Social learning uses aptitude 8');
    near(focusChoiceEffects(candidate).social, expected, 'preview uses the same effective learning ability');
  }
  const practice = { ...state, focus: { ...state.focus, self: 3 } };
  assert.equal(standardFocusCoefficients(practice).self.social, .24);
  near(skillChanges(practice).social, .24 * .25 * 1.64, 'personal fame adds Social training to Yourself');
  assert.deepEqual(state, before);
  assert.equal(state.aptitudes.social, 3);
  assert.equal(effectiveAptitude({ ...state, fame: null }, 'social'), 3);
});

test('source previews match the third-point routine contribution, including adult Modeling and clipping', () => {
  for (const age of [17, 18, 40]) for (const [kind, id] of [['sports', 'fencing'], ['extracurricular', 'modeling']]) {
    const state = person(age, kind, id);
    state.focus[kind] = 3;
    const before = copy(state), contribution = schoolFocusEffects(state, kind);
    assert.equal(focusLimits(state)[kind], 3);
    const rows = schoolChoiceImpacts(state, kind);
    assert.ok(rows.length > 0);
    for (const row of rows) {
      assert.equal(row.level, 3);
      near(row.change, changedRating(5, contribution[row.stat]) - 5, `${age}/${id}/${row.stat} preview`);
    }
    assert.deepEqual(state, before);
  }
  const model = person(18, 'extracurricular', 'modeling');
  model.focus = { work: 0, social: 1, family: 2, self: 2, extracurricular: 3 };
  near(schoolAppearanceChange(model), .225 * 3 * .25, 'adult Modeling trains appearance');
  near(focusChoiceEffects(model).attractiveness, .225 * 3 * .25, 'combined preview includes adult Modeling');
  const before = copy(model), forecast = annualForecast(model);
  assert.equal(forecast.stats.attractiveness.after, changedRating(5, .225 * 3 * .25));
  assert.deepEqual(model, before, 'annual preview preserves stored fame, aptitude, enrollment, and RNG');
  model.stats.attractiveness = 10;
  assert.equal(schoolChoiceImpacts(model, 'extracurricular').some(entry => entry.stat === 'attractiveness'), false);
});
