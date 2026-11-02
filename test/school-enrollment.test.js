import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, effectiveStats, setFocus, focusLimits,
  enrollSchoolActivity, leaveSchoolActivity, migrateSave, validateSave, chooseEducation } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { SPORTS, schoolActivity, createSchoolRecord, gradeScore, activitySuccessChange } from '../school.js';
import { familyEventChances } from '../family-events.js';
import { heightReference } from '../growth.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function pupil(age = 12) {
  const state = createGame({ seed: 57402 });
  state.age = age;
  state.maturityAge = 18;
  state.height = heightReference(age, state.growthSex).median / 2.54;
  state.conditions = [];
  state.focus = defaultFocus(age);
  state.effects = [];
  state.lifestyle = 5;
  for (const person of [state, ...state.parents]) for (const key of Object.keys(person.stats)) {
    person.stats[key] = 5;
    person.aptitudes[key] = 0;
  }
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  return state;
}
function offered(state, kind, id) {
  state.school.offers[kind] = [id, ...state.school.offers[kind].filter(other => other !== id)].slice(0, 5);
  return state;
}
function join(state, kind, id) {
  offered(state, kind, id);
  assert.equal(enrollSchoolActivity(state, kind, id).ok, true);
}
function quietYear(state, growthRandom = () => 0) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = copy(state);
    candidate.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, { ...steady, growthRandom }).ok, true);
    assert.ok(candidate.lastYearEvents.length <= 5);
    if (!candidate.lastYearEvents.length) return candidate;
  }
  assert.fail('No event-free school year found');
}

test('joining requires an offered affordable activity and unlocks one of two focus points within the ten-point budget', () => {
  const state = pupil();
  assert.equal(focusBudget(state), 10);
  assert.equal(state.focus.sports, 0);
  assert.equal(state.focus.extracurricular, 0);
  assert.equal(focusLimits(state).sports, 0);
  const before = copy(state);
  assert.equal(setFocus(state, 'sports', 1).ok, false);
  const absent = SPORTS.find(entry => !state.school.offers.sports.includes(entry.id)).id;
  assert.equal(enrollSchoolActivity(state, 'sports', absent).ok, false);
  assert.deepEqual(state, before);
  offered(state, 'sports', 'lacrosse');
  const lowLifestyle = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'lacrosse').ok, false);
  assert.deepEqual(state, lowLifestyle);
  state.lifestyle = 7;
  assert.equal(enrollSchoolActivity(state, 'sports', 'lacrosse').ok, true);
  assert.deepEqual(state.school.sports, { id: 'lacrosse', success: 5 });
  assert.equal(state.focus.sports, 1);
  assert.equal(focusLimits(state).sports, 2);
  join(state, 'extracurricular', 'chess');
  assert.equal(Object.values(state.focus).reduce((sum, value) => sum + value, 0), 10);
  assert.equal(setFocus(state, 'sports', 2).ok, false, 'raising an activity still uses the shared budget');
  assert.equal(setFocus(state, 'family', 1).ok, true);
  assert.equal(setFocus(state, 'sports', 2).ok, true);
  assert.equal(setFocus(state, 'sports', 3).ok, false);
  assert.equal(validateSave(state), true);
});

test('keeping an activity preserves success, switching resets it, and leaving locks its focus at zero', () => {
  const state = pupil();
  join(state, 'sports', 'soccer');
  state.school.sports.success = 8.75;
  const before = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'soccer').ok, true);
  assert.deepEqual(state, before, 'keeping the current activity is a true no-op');
  offered(state, 'sports', 'tennis');
  assert.equal(enrollSchoolActivity(state, 'sports', 'tennis').ok, true);
  assert.deepEqual(state.school.sports, { id: 'tennis', success: 5 });
  assert.equal(state.focus.sports, 1);
  assert.equal(leaveSchoolActivity(state, 'sports').ok, true);
  assert.equal(state.school.sports, null);
  assert.equal(state.focus.sports, 0);
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), []);
  assert.equal(setFocus(state, 'sports', 1).ok, false);
  state.pendingEvents = [{ eventId: 'school_team', age: state.age }];
  const pending = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'tennis').ok, false);
  assert.deepEqual(state, pending, 'school enrollment cannot bypass a pending decision');
});

test('annual activity offers are fresh while enrollment, success, saved offers, and previews survive reloads', () => {
  const state = pupil();
  join(state, 'sports', 'soccer');
  join(state, 'extracurricular', 'chess');
  const before = copy(state), offers = copy(state.school.offers);
  for (let read = 0; read < 3; read++) {
    annualForecast(state);
    schoolChoiceImpacts(state, 'sports');
    schoolChoiceImpacts(state, 'extracurricular');
    assert.deepEqual(state, before, 'preview reads never reroll or consume RNG');
  }
  const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(reloaded, before);
  const advanced = quietYear(reloaded);
  for (const kind of ['sports', 'extracurricular']) {
    assert.equal(advanced.school[kind].id, before.school[kind].id);
    assert.equal(advanced.school[kind].success, 5, 'neutral focus and middle performance retain success');
    assert.equal(advanced.school.offers[kind].length, 5);
    assert.ok(advanced.school.offers[kind].every(id => !offers[kind].includes(id) && id !== advanced.school[kind].id));
    assert.equal(new Set(advanced.school.offers[kind]).size, 5);
  }
  assert.equal(advanced.school.offersAge, advanced.age);
  const saved = copy(advanced);
  assert.equal(enrollSchoolActivity(advanced, 'sports', 'soccer').ok, true, 'the existing activity can be kept after leaving the offered list');
  assert.deepEqual(advanced, saved);
  assert.deepEqual(migrateSave(saved), saved);
});

test('grades use study and effective Intelligence at the beginning of the completed year', () => {
  const state = pupil();
  state.stats.intelligence = 4.5;
  state.effects = [{ id: 'old-learning-bonus', name: 'Saved bonus', years: 1, modifiers: { intelligence: 1 }, kind: 'positive' }];
  const expected = gradeScore(2, 5.5), before = copy(state);
  const forecast = annualForecast(state);
  assert.equal(forecast.school.gpa, 81);
  assert.equal(forecast.school.study, 2);
  assert.equal(forecast.school.intelligence, 5.5);
  assert.deepEqual(state, before);
  const advanced = quietYear(state);
  assert.equal(advanced.school.gpa, expected);
  assert.equal(advanced.school.reportedAge, 13);
  assert.deepEqual(advanced.yearSummary.school, forecast.school);
  assert.equal(advanced.effects.length, 0);
  assert.notEqual(gradeScore(advanced.focus.work, effectiveStats(advanced).intelligence), expected, 'the report is not recomputed from end-of-year ratings');
  assert.deepEqual(migrateSave(copy(advanced)), advanced);
});

test('saved grades and report cards survive grading changes and use the new scale only in future years', () => {
  const state = pupil();
  state.stats.intelligence = 4.5;
  const saved = quietYear(state);
  saved.school.gpa = 72.5;
  saved.yearSummary.school.gpa = 72.5;
  saved.yearSummary.school.previousGpa = 75;
  assert.notEqual(saved.yearSummary.school.gpa, gradeScore(saved.yearSummary.school.study, saved.yearSummary.school.intelligence));
  const before = copy(saved);
  assert.equal(validateSave(saved), true);
  const restored = migrateSave(copy(saved));
  assert.deepEqual(restored, before, 'reload preserves historical grades, stats, RNG, and progress exactly');
  const forecast = annualForecast(restored);
  assert.equal(forecast.school.previousGpa, 72.5);
  assert.equal(forecast.school.gpa, gradeScore(restored.focus.work, effectiveStats(restored).intelligence));
  const next = quietYear(restored);
  assert.equal(next.school.gpa, forecast.school.gpa);
  assert.equal(next.yearSummary.school.previousGpa, 72.5);
  for (const invalid of [49.9, 100.1, NaN]) {
    const malformed = copy(before);
    malformed.yearSummary.school.gpa = invalid;
    assert.equal(validateSave(malformed), false, 'historical grade validation retains score bounds');
  }
  assert.deepEqual(saved, before);
});

test('activity success uses starting weighted performance, one supplied draw, and rating bounds', () => {
  const state = pupil();
  join(state, 'sports', 'basketball');
  state.stats.strength = 8;
  assert.equal(setFocus(state, 'sports', 2).ok, true);
  const activity = schoolActivity('sports', 'basketball');
  for (const draw of [-3, 0, 3]) {
    const advanced = quietYear(state, () => draw);
    const expected = Math.round((5 + activitySuccessChange({ ...state, stats: effectiveStats(state) }, activity, 2, draw)) * 100) / 100;
    assert.equal(advanced.school.sports.success, expected);
    assert.deepEqual(advanced.yearSummary.school.activities[0], { kind: 'sports', id: 'basketball', name: 'Basketball', focus: 2, before: 5, after: expected });
  }
  state.school.sports.success = 9.99;
  assert.equal(quietYear(state).school.sports.success, 10);
  state.school.sports.success = .01;
  state.stats.strength = 0;
  state.focus.sports = 0;
  assert.equal(quietYear(state).school.sports.success, 0);
  const counts = [];
  for (const kinds of [[], ['sports'], ['sports', 'extracurricular']]) {
    const candidate = pupil();
    if (kinds.includes('sports')) join(candidate, 'sports', 'soccer');
    if (kinds.includes('extracurricular')) join(candidate, 'extracurricular', 'chess');
    let draws = 0;
    assert.equal(advanceYear(candidate, { ...steady, growthRandom: () => { draws++; return 0; } }).ok, true);
    counts.push(draws);
  }
  assert.equal(counts[1] - counts[0], 1);
  assert.equal(counts[2] - counts[1], 1);
});

test('school begins with unjoined activities and the final school report survives adulthood without continuing to change', () => {
  const child = quietYear(pupil(4));
  assert.equal(child.age, 5);
  assert.equal(child.school.gpa, gradeScore(child.focus.work, effectiveStats(child).intelligence));
  assert.equal(child.school.reportedAge, null);
  assert.equal(child.focus.sports, 0);
  assert.equal(child.focus.extracurricular, 0);
  assert.equal(child.yearSummary.school, undefined);
  const teen = pupil(17);
  join(teen, 'sports', 'soccer');
  const adult = quietYear(teen);
  assert.equal(adult.age, 18);
  assert.equal(adult.school.reportedAge, 18);
  assert.equal(adult.school.offersAge, 17);
  assert.deepEqual(Object.keys(adult.focus), ['work', 'social', 'family', 'self']);
  assert.equal(enrollSchoolActivity(adult, 'sports', 'soccer').ok, false);
  assert.equal(chooseEducation(adult, 'college').ok, true);
  const lastReport = copy(adult.school);
  const next = quietYear(adult);
  assert.deepEqual(next.school, lastReport);
  assert.equal(next.yearSummary.school, undefined);
  assert.equal(validateSave(next), true);
});

test('version eighteen migration preserves existing progress, history and pending decisions while new activity slots start empty', () => {
  const old = quietYear(pupil());
  old.version = 18;
  delete old.school;
  delete old.yearSummary.school;
  old.focus = { work: 3, social: 1, family: 2, self: 2, sports: 2, extracurricular: 2 };
  old.yearSummary.decisions = { focus: { work: 2, social: 2, family: 2, self: 2, sports: 2, extracurricular: 2 }, workLabel: 'School', focusMax: 4, focusBudget: 12 };
  old.pendingEvents = [{ eventId: 'school_team', age: old.age }];
  old.lastYearEvents = ['school_team'];
  const before = copy(old), migrated = migrateSave(old);
  assert.ok(migrated);
  assert.equal(migrated.version, 19);
  assert.deepEqual(migrated.focus, { work: 3, social: 1, family: 2, self: 2, sports: 0, extracurricular: 0 });
  assert.equal(migrated.school.sports, null);
  assert.equal(migrated.school.extracurricular, null);
  assert.equal(migrated.school.reportedAge, null);
  const restored = copy(migrated);
  delete restored.school;
  restored.version = before.version;
  restored.focus = before.focus;
  assert.deepEqual(restored, before, 'all ratings, conditions, effects, RNG, history, reviews, and pending choices survive exactly');
  assert.deepEqual(old, before);
  assert.deepEqual(migrateSave(copy(migrated)), migrated);
  const large = copy(old);
  large.focus = { work: 4, social: 4, family: 4, self: 0, sports: 0, extracurricular: 0 };
  const normalized = migrateSave(large);
  assert.ok(normalized);
  assert.equal(Object.values(normalized.focus).reduce((sum, value) => sum + value, 0), 10);
  assert.deepEqual(normalized.stats, large.stats);
  assert.equal(normalized.rng, large.rng);
});

test('parent reactions use this year’s grade and grounding shares the five-event limit and lasts a full playable turn', () => {
  const state = pupil();
  const positive = ['household_school_proud_parent', 'household_school_celebration'];
  const negative = ['household_school_disappointment', 'household_school_grounding'];
  const chances = candidate => familyEventChances(candidate, effectiveStats(candidate));
  state.school.gpa = 50;
  state.stats.intelligence = 10;
  state.focus.work = 2;
  assert.ok(chances(state).filter(event => positive.includes(event.eventId)).every(event => event.chance > 0));
  assert.ok(chances(state).filter(event => negative.includes(event.eventId)).every(event => event.chance === 0));
  state.school.gpa = 100;
  state.focus.work = 0;
  assert.ok(chances(state).filter(event => positive.includes(event.eventId)).every(event => event.chance === 0));
  assert.ok(chances(state).filter(event => negative.includes(event.eventId)).every(event => event.chance > 0));
  let grounded;
  for (let attempt = 0; attempt < 1000; attempt++) {
    const candidate = copy(state);
    candidate.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, steady).ok, true);
    assert.ok(candidate.lastYearEvents.length <= 5);
    if (!candidate.pendingEvents.length && candidate.effects.some(effect => effect.id.startsWith('household_school_grounding:'))) {
      grounded = candidate;
      break;
    }
  }
  assert.ok(grounded, 'a seeded poor-grade year produces an actual grounding');
  assert.equal(focusLimits(grounded).social, 1);
  assert.equal(grounded.focus.social, 1);
  assert.equal(setFocus(grounded, 'social', 2).ok, false);
  assert.equal(grounded.effects.find(effect => effect.id.startsWith('household_school_grounding:')).years, 1);
  assert.deepEqual(migrateSave(copy(grounded)), grounded);
  const after = quietYear(grounded);
  assert.equal(focusLimits(after).social, 4);
  assert.equal(after.focus.social, 1, 'expiry never restores the old allocation');
});
