import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, setFocus, migrateSave, validateSave, focusLimits } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { skillChanges, childhoodWellbeing, schoolAppearanceChange, schoolFocusEffects } from '../development.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} versus ${expected}`);
const schoolKeys = ['work', 'social', 'family', 'self', 'sports', 'extracurricular'];
const adultKeys = ['work', 'social', 'family', 'self'];
const ordinary = [-3, -1, 0, 1, 3];
const learned = ['intelligence', 'strength', 'social', 'creativity'];

function student(age = 12) {
  const state = createGame({ seed: 57402 });
  state.age = age;
  state.conditions = [];
  state.focus = defaultFocus(age);
  state.effects = [];
  state.education = { status: age >= 18 ? 'college' : 'school', years: 0 };
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) {
      person.stats[key] = 5;
      person.aptitudes[key] = 0;
    }
    if ('relationship' in person) person.relationship = 5;
  }
  return state;
}

function quietMean(state) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = copy(state);
    candidate.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
    if (!candidate.lastYearEvents.length) return candidate;
  }
  assert.fail('No event-free mean routine found');
}

test('six school choices spend twelve points only from age five through seventeen', () => {
  for (const age of [2, 4, 5, 17, 18, 19, 65]) {
    const state = student(age);
    const expectedKeys = age < 5 ? [...adultKeys, 'creative'] : age < 18 ? schoolKeys : adultKeys;
    assert.deepEqual(Object.keys(state.focus), expectedKeys);
    assert.ok(Object.values(state.focus).every(value => value === 2));
    assert.equal(focusBudget(state), age < 5 ? 10 : age < 18 ? 12 : 8);
    if (age >= 5 && age < 18) {
      assert.equal(setFocus(state, 'sports', 3).ok, false, 'the neutral schedule spends the whole budget');
      assert.equal(setFocus(state, 'family', 0).ok, true);
      assert.equal(setFocus(state, 'sports', 4).ok, true);
      assert.equal(setFocus(state, 'sports', 5).ok, false);
      assert.equal(setFocus(state, 'extracurricular', 3).ok, false);
    } else {
      assert.equal(setFocus(state, 'sports', 1).ok, false);
      assert.equal(setFocus(state, 'extracurricular', 1).ok, false);
      assert.deepEqual(schoolChoiceImpacts(state, 'sports'), []);
    }
  }
});

test('School uses its specified Intelligence, Creativity, and Social curves in previews and yearly development', () => {
  const units = { intelligence: [-3, -2, 0, 2, 3], creativity: [-2, -1, 0, 1, 2], social: [3, 1, 0, -1, -3] };
  const coefficients = { intelligence: .225, creativity: .24, social: .24 };
  for (const age of [5, 12, 17]) {
    const baseline = student(age);
    baseline.focus.self = 0; // Two spare points; no overlapping learned-skill contributions.
    const mean = skillChanges(baseline);
    for (const points of [0, 1, 2, 3, 4]) {
      const selected = copy(baseline);
      selected.focus.work = points;
      const before = copy(selected);
      const forecast = annualForecast(selected);
      const rows = schoolChoiceImpacts(selected, 'work');
      for (const stat of Object.keys(units)) {
        const contribution = units[stat][points] * coefficients[stat] * .5 * 1.15;
        near(skillChanges(selected)[stat] - mean[stat], contribution, `${age}: ${points} School, ${stat}`);
        assert.equal(forecast.stats[stat].after, changedRating(5, mean[stat] + contribution));
        const row = rows.find(entry => entry.stat === stat && !entry.parentId);
        if (points === 2) assert.equal(row, undefined);
        else {
          near(row.change, changedRating(5, contribution) - 5, 'preview isolates the School choice');
          assert.equal(row.level, Math.abs(units[stat][points]));
        }
      }
      near(schoolFocusEffects(selected, 'work').stability, -.3 * ordinary[points] * .5, 'School retains its existing mental strain');
      assert.deepEqual(selected, before, 'neither forecast nor row rendering consumes RNG or mutates the save');
    }
  }
});

test('Yourself, Sports, and Extracurricular activities have distinct effects in completed school years', () => {
  const effects = {
    self: { attractiveness: .225, stability: .3, health: .105 },
    sports: { strength: .3, health: .105, social: .24 },
    extracurricular: { creativity: .24, social: .24 },
    social: { social: .24, stability: .3 },
  };
  for (const age of [5, 17]) for (const [area, coefficients] of Object.entries(effects)) {
    const baseline = student(age);
    baseline.focus.work = 0;
    const means = skillChanges(baseline), wellbeing = childhoodWellbeing(baseline);
    const selected = copy(baseline);
    selected.focus[area] = 4;
    const before = copy(selected);
    const rows = schoolChoiceImpacts(selected, area).filter(entry => !entry.parentId);
    assert.deepEqual(rows.map(entry => entry.stat).sort(), Object.keys(coefficients).sort(), `${area} only affects its own listed stats`);
    for (const [stat, coefficient] of Object.entries(coefficients)) {
      const contribution = coefficient * 3 * .5 * (learned.includes(stat) || stat === 'attractiveness' ? 1.15 : 1);
      const actual = learned.includes(stat) ? skillChanges(selected)[stat] - means[stat]
        : stat === 'attractiveness' ? schoolAppearanceChange(selected) - schoolAppearanceChange(baseline)
          : childhoodWellbeing(selected)[stat] - wellbeing[stat];
      near(actual, contribution, `${area}: ${stat} is scaled once`);
      assert.equal(rows.find(entry => entry.stat === stat).level, 3);
    }
    const forecast = annualForecast(selected);
    assert.deepEqual(selected, before);
    const advanced = quietMean(selected);
    assert.deepEqual(advanced.yearSummary.stats, forecast.stats, `${area} mean routine matches its forecast at age ${age}`);
    assert.equal(advanced.yearSummary.decisions.focus[area], 4);
    assert.equal(advanced.yearSummary.decisions.focusBudget, 12);
  }
});

test('school signs retain their custom units under caps and clipping, and bonuses remain aptitude-sensitive', () => {
  const state = student();
  state.focus.work = 1;
  state.effects = [{ id: 'lesson-cap', name: 'Recovery', years: 1, modifiers: {}, focusLimits: { standard: { work: 1 } } }];
  state.stats.intelligence = .01;
  state.stats.creativity = 0;
  const before = copy(state);
  const rows = schoolChoiceImpacts(state, 'work');
  assert.equal(rows.find(entry => entry.stat === 'intelligence').level, 2);
  near(rows.find(entry => entry.stat === 'intelligence').change, -.01, 'partial clipping retains two minus signs');
  assert.ok(!rows.some(entry => entry.stat === 'creativity'), 'fully blocked losses disappear');
  assert.deepEqual(state, before);
  for (const aptitude of [-3, 0, 3]) for (const points of [0, 4]) {
    const candidate = student();
    candidate.focus.work = 0;
    candidate.focus.self = points;
    candidate.aptitudes.attractiveness = aptitude;
    const raw = .225 * ordinary[points];
    near(schoolAppearanceChange(candidate), raw * .5 * 1.15 * (raw > 0 ? 1 + aptitude * .08 : 1 - aptitude * .07), 'school appearance uses aptitude and yearly response once');
  }
  for (const age of [4, 18, 19, 30]) assert.equal(schoolAppearanceChange({ ...student(age), focus: { ...defaultFocus(age), self: 4 } }), 0);
});

test('version seventeen school saves gain neutral new choices without rewriting saved values or old reviews', () => {
  const old = quietMean(student());
  old.version = 17;
  old.focus = { work: 3, social: 1, family: 2, self: 2 };
  old.yearSummary.decisions = { focus: { work: 4, social: 0, family: 2, self: 2 }, workLabel: 'School', focusMax: 4, focusBudget: 8 };
  old.pendingEvents = [{ eventId: 'school_team', age: old.age }];
  old.lastYearEvents = ['school_team'];
  const before = copy(old);
  const migrated = migrateSave(old);
  assert.ok(migrated);
  assert.deepEqual(migrated, { ...before, version: 18, focus: { ...before.focus, sports: 2, extracurricular: 2 } });
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(old, before, 'migration is pure');
  assert.deepEqual(migrateSave(copy(migrated)), migrated, 'reload does not add bonuses or reallocate twice');
  const malformed = copy(migrated);
  delete malformed.focus.sports;
  assert.equal(validateSave(malformed), false, 'current school saves require all six keys');
});

test('school entry carries crafts into extracurricular activities and adulthood drops only the school-only areas', () => {
  const toddler = student(4);
  toddler.focus = { work: 0, social: 2, family: 2, self: 2, creative: 4 };
  const school = quietMean(toddler);
  assert.equal(school.age, 5);
  assert.deepEqual(school.focus, { work: 0, social: 2, family: 2, self: 2, sports: 2, extracurricular: 4 });
  assert.deepEqual(school.yearSummary.decisions, { focus: toddler.focus, workLabel: 'Play', focusMax: 4, focusBudget: 10 });
  assert.equal(validateSave(school), true);
  const teen = student(17);
  teen.focus = { work: 0, social: 0, family: 2, self: 2, sports: 4, extracurricular: 4 };
  const adult = quietMean(teen);
  assert.equal(adult.age, 18);
  assert.deepEqual(adult.focus, { work: 0, social: 0, family: 2, self: 2 }, 'freed school points stay unspent');
  assert.deepEqual(adult.yearSummary.decisions, { focus: teen.focus, workLabel: 'School', focusMax: 4, focusBudget: 12 });
  assert.equal(validateSave(adult), true);
});

test('school Sports respects physical restrictions while college retains its four familiar choices', () => {
  const state = student();
  state.focus.self = 1;
  state.focus.sports = 1;
  state.effects = [{ id: 'physical-limit', name: 'Recovery', years: 1, modifiers: {}, focusLimits: { standard: { self: 1 } } }];
  assert.equal(focusLimits(state).sports, 1);
  assert.equal(setFocus(state, 'sports', 2).ok, false);
  const college = student(19);
  college.focus.work = 0;
  college.focus.self = 4;
  const rows = schoolChoiceImpacts(college, 'self').filter(entry => !entry.parentId);
  assert.deepEqual(rows.map(entry => entry.stat).sort(), ['intelligence', 'strength', 'creativity', 'health', 'stability'].sort());
  assert.equal(focusBudget(college), 8);
});
