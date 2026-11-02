import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, effectiveStats, setFocus, focusLimits,
  enrollSchoolActivity, leaveSchoolActivity, migrateSave, validateSave, chooseEducation } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { SCHOOL_OFFER_COUNT, SPORTS, EXTRACURRICULARS, schoolActivity, createSchoolRecord, gradeScore, activitySuccessChange } from '../school.js';
import { familyEventChances } from '../family-events.js';
import { heightReference } from '../growth.js';
import { standardFocusCoefficients, standardFocusPractice, schoolFocusEffects, schoolAppearanceChange,
  DEVELOPMENT_BALANCE, CHILDHOOD_DEDUCTION_SCALE } from '../development.js';
import { changedRating } from '../rating-changes.js';

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
  state.school.offers[kind] = [id, ...state.school.offers[kind].filter(other => other !== id)].slice(0, SCHOOL_OFFER_COUNT);
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

test('school inactivity uses category losses while positive points retain each enrolled activity training map', () => {
  const losses = {
    sports: { strength: .3, social: .24 },
    extracurricular: { creativity: .24, intelligence: .225 },
  };
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} versus ${expected}`);
  const cases = [
    ['sports', null], ['sports', 'fencing'], ['sports', 'gymnastics'],
    ['extracurricular', null], ['extracurricular', 'chess'], ['extracurricular', 'modeling'],
  ];
  for (const [kind, id] of cases) for (const points of id ? [0, 1, 2] : [0]) {
    const state = pupil();
    if (id) join(state, kind, id);
    state.focus[kind] = points;
    const expected = points === 0 ? losses[kind] : schoolActivity(kind, id).training;
    const units = points === 0 ? -1 : points;
    const before = copy(state), raw = standardFocusPractice(state), without = standardFocusPractice(state, null, kind);
    assert.deepEqual(standardFocusCoefficients(state)[kind], expected, `${kind} ${id} at ${points}`);
    for (const key of Object.keys(state.stats)) near((raw[key] || 0) - (without[key] || 0), (expected[key] || 0) * units);
    const effects = schoolFocusEffects(state, kind), rows = schoolChoiceImpacts(state, kind);
    assert.deepEqual(rows.map(row => row.stat).sort(), Object.keys(expected).sort(), `${id} at ${points} affects only the selected map`);
    for (const row of rows) {
      near(effects[row.stat], expected[row.stat] * units * .5 * 1.15);
      near(row.change, changedRating(5, effects[row.stat]) - 5);
      assert.equal(row.level, Math.abs(units));
      assert.equal(Math.sign(row.change), Math.sign(units));
    }
    if (id === 'modeling' && points === 0) assert.equal(schoolAppearanceChange(state), 0, 'skipping modeling has no appearance penalty');
    assert.deepEqual(state, before, 'reading maps and previews preserves saved selections, success, and RNG');
    const forecast = annualForecast(state);
    assert.deepEqual(quietYear(state).yearSummary.stats, forecast.stats, `${kind} ${id} at ${points}: actual mean year follows the same map`);
  }
});

test('unjoined and paused school activities apply one general loss unit without special-sport or Social club penalties', () => {
  const state = pupil(), before = copy(state), forecast = annualForecast(state);
  const inputs = { strength: -.3, social: -.24, creativity: -.24, intelligence: -.225 };
  for (const [stat, amount] of Object.entries(inputs)) {
    const bias = DEVELOPMENT_BALANCE.childhoodBias[stat];
    const expected = changedRating(5, amount * .5 * 1.15 + bias * (bias < 0 ? CHILDHOOD_DEDUCTION_SCALE : 1));
    assert.equal(forecast.stats[stat].after, expected, `${stat} includes exactly one category inactivity contribution`);
  }
  assert.deepEqual(state, before);
  assert.deepEqual(quietYear(state).yearSummary.stats, forecast.stats);
  const paused = pupil();
  paused.lifestyle = 7;
  join(paused, 'sports', 'lacrosse');
  paused.lifestyle = 6;
  for (const points of [0, 1, 2]) {
    paused.focus.sports = points;
    const snapshot = copy(paused);
    assert.equal(focusLimits(paused).sports, 0);
    assert.deepEqual(standardFocusCoefficients(paused).sports, { strength: .3, social: .24 });
    assert.equal(standardFocusPractice(paused).strength, -.3, 'ineligibility overrides a stale positive allocation');
    const rows = schoolChoiceImpacts(paused, 'sports');
    assert.deepEqual(rows.map(row => row.stat).sort(), ['social', 'strength']);
    assert.ok(rows.every(row => row.change < 0 && row.level === 1));
    assert.deepEqual(paused, snapshot);
  }
  paused.focus.sports = 0;
  const pausedForecast = annualForecast(paused), advanced = quietYear(paused);
  assert.deepEqual(advanced.yearSummary.stats, pausedForecast.stats);
  assert.equal(advanced.school.sports.success, null, 'inactivity losses do not fabricate participation or success');
});

test('inactivity previews clip at rating limits and school family members without records keep their prior practice', () => {
  const state = pupil();
  for (const stat of ['strength', 'social', 'intelligence', 'creativity']) state.stats[stat] = 0;
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), []);
  assert.deepEqual(schoolChoiceImpacts(state, 'extracurricular'), []);
  state.stats.intelligence = .01;
  const rows = schoolChoiceImpacts(state, 'extracurricular');
  assert.deepEqual(rows.map(row => [row.stat, row.change, row.level]), [['intelligence', -.01, 1]]);
  for (const school of [null, undefined]) {
    const relative = { ...pupil(), school };
    assert.deepEqual(standardFocusCoefficients(relative).sports, {});
    assert.deepEqual(standardFocusCoefficients(relative).extracurricular, {});
    assert.ok(Object.values(standardFocusPractice(relative)).every(amount => amount === 0), 'missing school records do not impose optional activity losses on family members');
    const autonomous = { ...relative, autonomousFocus: true, focus: { work: 3, social: 3, family: 3, self: 3 } };
    assert.ok(Object.values(standardFocusPractice(autonomous)).every(amount => amount === 0));
  }
});

test('new school records have exactly three distinct known offers per activity category', () => {
  assert.equal(SCHOOL_OFFER_COUNT, 3);
  for (const age of [5, 12, 17]) {
    const state = pupil(age);
    for (const kind of ['sports', 'extracurricular']) {
      const ids = state.school.offers[kind];
      assert.equal(ids.length, 3);
      assert.equal(new Set(ids).size, 3);
      assert.ok(ids.every(id => schoolActivity(kind, id)));
    }
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(copy(state)), state, 'current shortlists survive reload exactly');
  }
  const infant = createGame({ seed: 31415 });
  assert.equal(infant.school, null);
  assert.deepEqual(migrateSave(copy(infant)), infant, 'records without school need no shortlist migration');
});

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
  assert.deepEqual(state.school.sports, { id: 'lacrosse', success: null });
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
  const unreported = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'soccer').ok, true);
  assert.deepEqual(state, unreported, 'keeping an unreported activity preserves N/A');
  state.school.sports.success = 8.75;
  assert.deepEqual(migrateSave(copy(state)), state, 'saved numeric success is never reset on load');
  const before = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'soccer').ok, true);
  assert.deepEqual(state, before, 'keeping the current activity is a true no-op');
  offered(state, 'sports', 'tennis');
  assert.equal(enrollSchoolActivity(state, 'sports', 'tennis').ok, true);
  assert.deepEqual(state.school.sports, { id: 'tennis', success: null });
  assert.equal(state.focus.sports, 1);
  assert.equal(leaveSchoolActivity(state, 'sports').ok, true);
  assert.equal(state.school.sports, null);
  assert.equal(state.focus.sports, 0);
  const inactivity = schoolChoiceImpacts(state, 'sports');
  assert.deepEqual(inactivity.map(row => row.stat).sort(), ['social', 'strength']);
  assert.ok(inactivity.every(row => row.change < 0 && row.level === 1));
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
    const forecast = annualForecast(state);
    assert.ok(forecast.school.activities.every(activity => activity.before === null && activity.after === 5));
    schoolChoiceImpacts(state, 'sports');
    schoolChoiceImpacts(state, 'extracurricular');
    assert.deepEqual(state, before, 'preview reads never reroll or consume RNG');
  }
  const reloaded = migrateSave(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(reloaded, before);
  const advanced = quietYear(reloaded);
  for (const kind of ['sports', 'extracurricular']) {
    assert.equal(advanced.school[kind].id, before.school[kind].id);
    assert.equal(advanced.school[kind].success, 5, 'the first eligible year starts from five before its success change');
    assert.equal(advanced.yearSummary.school.activities.find(activity => activity.kind === kind).before, null);
    assert.equal(advanced.school.offers[kind].length, 3);
    assert.ok(advanced.school.offers[kind].every(id => !offers[kind].includes(id) && id !== advanced.school[kind].id));
    assert.equal(new Set(advanced.school.offers[kind]).size, 3);
  }
  assert.equal(advanced.school.offersAge, advanced.age);
  const saved = copy(advanced);
  assert.equal(enrollSchoolActivity(advanced, 'sports', 'soccer').ok, true, 'the existing activity can be kept after leaving the offered list');
  assert.deepEqual(advanced, saved);
  assert.deepEqual(migrateSave(saved), saved);
});

test('five-offer schema nineteen saves trim only their shortlists and keep selections outside the first three', () => {
  for (const age of [12, 17]) {
    const initial = pupil(age);
    join(initial, 'sports', 'basketball');
    join(initial, 'extracurricular', 'chess');
    const saved = quietYear(initial);
    saved.pendingEvents = [{ eventId: 'school_team', age: saved.age }];
    saved.lastYearEvents = ['school_team'];
    assert.equal(validateSave(saved), true);
    saved.version = 19;
    for (const person of [saved, ...saved.parents, ...saved.encounters]) person.conditions = [];
    saved.school.offers = {
      sports: ['soccer', 'football', 'tennis', 'basketball', 'cheerleading'],
      extracurricular: ['piano', 'violin', 'guitar', 'drums', 'chess'],
    };
    assert.equal(saved.school.offers.sports[3], saved.school.sports.id);
    assert.equal(saved.school.offers.extracurricular[4], saved.school.extracurricular.id);
    assert.equal(validateSave(saved), false, 'current saves require three offers');
    const before = copy(saved), expected = copy(saved);
    expected.version = 20;
    for (const kind of ['sports', 'extracurricular']) expected.school.offers[kind] = expected.school.offers[kind].slice(0, 3);
    const migrated = migrateSave(saved);
    assert.deepEqual(migrated, expected, 'only shortlist lengths change; ratings, enrollment, success, focus, history, reports, pending decisions, and RNG remain exact');
    assert.equal(migrated.version, 20);
    assert.equal(validateSave(migrated), true);
    assert.deepEqual(migrateSave(copy(migrated)), migrated, 'the migration runs once');
    assert.deepEqual(saved, before, 'migration never mutates its input');
    for (const kind of ['sports', 'extracurricular']) assert.ok(!migrated.school.offers[kind].includes(migrated.school[kind].id));
    if (migrated.age < 18) {
      migrated.pendingEvents = [];
      const kept = copy(migrated);
      assert.equal(enrollSchoolActivity(migrated, 'sports', 'basketball').ok, true);
      assert.equal(enrollSchoolActivity(migrated, 'extracurricular', 'chess').ok, true);
      assert.deepEqual(migrated, kept, 'enrollment outside the trimmed shortlist can still be kept');
      assert.equal(enrollSchoolActivity(migrated, 'sports', 'cheerleading').ok, false, 'removed offers cannot be newly selected');
    } else {
      assert.equal(migrated.age, 18);
      assert.equal(migrated.school.offersAge, 17);
      assert.deepEqual(migrated.school.sports, before.school.sports, 'graduated players retain their final activity record');
    }
  }
});

test('shortlist migration rejects malformed current and legacy lists instead of discarding invalid entries', () => {
  for (const count of [3, 5]) {
    const saved = pupil();
    saved.school.offers = { sports: SPORTS.slice(0, count).map(entry => entry.id), extracurricular: EXTRACURRICULARS.slice(0, count).map(entry => entry.id) };
    const variants = [
      state => { state.school.offers.sports[count - 1] = 'unknown-sport'; },
      state => { state.school.offers.extracurricular[count - 1] = 'soccer'; },
      state => { state.school.offers.sports[count - 1] = state.school.offers.sports[0]; },
      state => { state.school.offers.extracurricular[count - 1] = state.school.offers.extracurricular[0]; },
      state => { delete state.school.offers.sports; },
      state => { state.school.offers.extracurricular = null; },
      state => { state.school.offers.sports = SPORTS.slice(0, count + 1).map(entry => entry.id); },
      state => { state.school.offers.extracurricular.pop(); },
      state => { state.school.offers.sports = SPORTS.slice(0, count === 3 ? 5 : 3).map(entry => entry.id); },
      state => { state.stats.intelligence = 11; },
    ];
    for (const mutate of variants) {
      const malformed = copy(saved);
      mutate(malformed);
      const before = copy(malformed);
      assert.equal(validateSave(malformed), false);
      assert.equal(migrateSave(malformed), null, `${count}-offer malformed data must not be repaired by trimming`);
      assert.deepEqual(malformed, before);
    }
  }
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
    assert.deepEqual(advanced.yearSummary.school.activities[0], { kind: 'sports', id: 'basketball', name: 'Basketball', focus: 2, before: null, after: expected });
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

test('unreported success stays N/A while participation is paused, then initializes only in an eligible year', () => {
  const state = pupil();
  state.lifestyle = 7;
  join(state, 'sports', 'lacrosse');
  state.lifestyle = 6;
  state.focus.sports = 0;
  const before = copy(state);
  const forecast = annualForecast(state);
  assert.deepEqual(forecast.school.activities[0], { kind: 'sports', id: 'lacrosse', name: 'Lacrosse', focus: 0, before: null, after: null });
  assert.deepEqual(state, before);
  assert.deepEqual(migrateSave(copy(state)), state);
  const paused = quietYear(state);
  assert.equal(paused.school.sports.success, null);
  assert.equal(paused.yearSummary.school.activities[0].after, null);
  assert.equal(validateSave(paused), true);
  assert.deepEqual(migrateSave(copy(paused)), paused);
  paused.lifestyle = 7;
  assert.equal(setFocus(paused, 'sports', 1).ok, true);
  const expected = Math.round((5 + activitySuccessChange({ ...paused, stats: effectiveStats(paused) }, schoolActivity('sports', 'lacrosse'), 1)) * 100) / 100;
  const active = quietYear(paused);
  assert.equal(active.school.sports.success, expected);
  assert.equal(active.yearSummary.school.activities[0].before, null);
  assert.equal(validateSave(active), true);
  assert.deepEqual(migrateSave(copy(active)), active);
  for (const invalid of [undefined, -1, 10.1, NaN]) {
    const malformed = copy(state);
    malformed.school.sports.success = invalid;
    assert.equal(validateSave(malformed), false, 'only explicit null or bounded numeric success is valid');
  }
  const erased = copy(active);
  erased.yearSummary.school.activities[0].before = 5;
  erased.yearSummary.school.activities[0].after = null;
  assert.equal(validateSave(erased), false, 'a completed numeric rating cannot become unreported within a year');
});

test('school begins with unjoined activities and the final school report survives adulthood without continuing to change', () => {
  const child = quietYear(pupil(4));
  assert.equal(child.age, 5);
  assert.equal(child.school.gpa, gradeScore(child.focus.work, effectiveStats(child).intelligence));
  assert.equal(child.school.reportedAge, null);
  assert.equal(child.focus.sports, 0);
  assert.equal(child.focus.extracurricular, 0);
  assert.equal(child.yearSummary.school, undefined);
  const beforeFirstReport = copy(child);
  assert.deepEqual(migrateSave(copy(child)), child, 'an unreported first school year survives reload');
  const firstGrade = gradeScore(child.focus.work, effectiveStats(child).intelligence);
  const firstReport = quietYear(child);
  assert.equal(firstReport.age, 6);
  assert.equal(firstReport.school.reportedAge, 6);
  assert.equal(firstReport.school.gpa, firstGrade);
  assert.equal(firstReport.yearSummary.school.previousGpa, null, 'the first report has no invented previous grade');
  assert.equal(validateSave(firstReport), true);
  assert.deepEqual(migrateSave(copy(firstReport)), firstReport);
  const secondReport = quietYear(firstReport);
  assert.equal(secondReport.yearSummary.school.previousGpa, firstGrade);
  assert.deepEqual(child, beforeFirstReport);
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
  for (const person of [old, ...old.parents]) person.conditions = [];
  old.version = 18;
  delete old.school;
  delete old.yearSummary.school;
  old.focus = { work: 3, social: 1, family: 2, self: 2, sports: 2, extracurricular: 2 };
  old.yearSummary.decisions = { focus: { work: 2, social: 2, family: 2, self: 2, sports: 2, extracurricular: 2 }, workLabel: 'School', focusMax: 4, focusBudget: 12 };
  old.pendingEvents = [{ eventId: 'school_team', age: old.age }];
  old.lastYearEvents = ['school_team'];
  const before = copy(old), migrated = migrateSave(old);
  assert.ok(migrated);
  assert.equal(migrated.version, 20);
  assert.deepEqual(migrated.focus, { work: 3, social: 1, family: 2, self: 2, sports: 0, extracurricular: 0 });
  assert.equal(migrated.school.sports, null);
  assert.equal(migrated.school.extracurricular, null);
  assert.equal(migrated.school.reportedAge, null);
  for (const kind of ['sports', 'extracurricular']) assert.equal(migrated.school.offers[kind].length, 3);
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
