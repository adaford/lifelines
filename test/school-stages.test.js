import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, createGame, advanceYear, resolveEventChoice, pendingEventChoices, validateSave, migrateSave } from '../engine.js';
import { SPORTS, EXTRACURRICULARS, SCHOOL_STAGES, schoolStage, stageGpa, recordStageGrade, activityTraining, annualSchoolOffers, createSchoolRecord, schoolActivity } from '../school.js';
import { createCollegeOffers } from '../college.js';
import { defaultFocus } from '../focus-rules.js';
import { SCHOOL_BALANCE } from '../balance.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const round = value => Math.round(value * 100) / 100;
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} vs ${expected}`);
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const event = id => EVENTS.find(entry => entry.id === id);
function pupil(age = 5, stages) {
  const state = createGame({ seed: 40917 });
  Object.assign(state, { age, maturityAge: 18, conditions: [], effects: [], lifestyle: 5 });
  for (const person of [state, ...state.parents]) for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
  state.school = createSchoolRecord(state);
  if (stages) state.school.stages = copy(stages);
  state.focus = defaultFocus(state);
  return state;
}
// School focus within the nine points; Family pays for a fourth School point and changes no player rating.
const study = (state, work) => Object.assign(state.focus, { work, family: work === 4 ? 1 : 2 });
// One calm year; any milestone choice resolves with its first option.
function year(state, work) {
  if (work !== undefined) study(state, work);
  const result = advanceYear(state, calm);
  assert.equal(result.ok, true, result.reason);
  for (const pending of [...state.pendingEvents]) assert.equal(resolveEventChoice(state, 'first', pending.eventId).ok, true);
  return state;
}

test('stage boundaries are inclusive and each stage keeps its own running mean', () => {
  assert.deepEqual(SCHOOL_STAGES.map(stage => [stage.id, stage.from, stage.to]), [['elementary', 5, 10], ['middle', 11, 13], ['high', 14, 17]]);
  assert.deepEqual([4, 5, 10, 11, 13, 14, 17, 18].map(age => schoolStage(age)?.id ?? null), [null, 'elementary', 'elementary', 'middle', 'middle', 'high', 'high', null]);
  const record = { gpa: 80, reportedAge: null };
  assert.deepEqual(recordStageGrade(record, 5, 80), { stage: 'elementary', stageGpa: 80 });
  assert.deepEqual(recordStageGrade(record, 6, 97), { stage: 'elementary', stageGpa: 88.5 });
  assert.deepEqual(recordStageGrade(record, 7, 65), { stage: 'elementary', stageGpa: 80.67 });
  assert.deepEqual(record.stages, { elementary: { gpa: 80.67, years: 3 } });
  assert.equal(recordStageGrade(record, 18, 90), null, 'no stage after school');
  assert.equal(stageGpa(record, 'middle'), null);
  assert.equal(stageGpa({ gpa: 91, reportedAge: 12 }, 'middle'), 91, 'saves without stage records read their last report');
  assert.equal(stageGpa({ gpa: 91, reportedAge: 12 }, 'elementary'), null);
});

test('completed school years update the running stage mean and restart it at 11 and 14', () => {
  const state = pupil(5), reports = {};
  const plan = [2, 3, 2, 3, 2, 2, 1, 4, 2, 3, 2, 4, 1];
  for (const work of plan) {
    const age = state.age;
    year(state, work);
    const report = state.yearSummary.school, stage = schoolStage(age).id;
    (reports[stage] ??= []).push(report.gpa);
    const expected = reports[stage].reduce((mean, gpa, index) => round((mean * index + gpa) / (index + 1)), 0);
    assert.equal(report.stage, stage, `age ${age} reports its stage`);
    assert.equal(report.stageGpa, expected, `age ${age} running ${stage} mean`);
    assert.deepEqual(state.school.stages[stage], { gpa: expected, years: reports[stage].length });
    assert.equal(state.school.gpa, report.gpa, 'the latest report is still saved separately');
    assert.equal(validateSave(state), true);
    if (age === 11 || age === 14) assert.deepEqual(state.school.stages[stage], { gpa: report.gpa, years: 1 }, `a new stage starts fresh at ${age}`);
  }
  assert.deepEqual(Object.fromEntries(Object.entries(state.school.stages).map(([id, entry]) => [id, entry.years])), { elementary: 6, middle: 3, high: 4 });
  assert.equal(state.age, 18);
});

test('college offers use the high-school mean, not the final report or earlier stages', () => {
  const state = pupil(5);
  for (const work of [4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 4]) year(state, work);
  const { high } = state.school.stages;
  assert.equal(high.years, 4);
  assert.notEqual(high.gpa, state.school.gpa, 'fixture: the final report differs from the stage mean');
  assert.notEqual(high.gpa, state.school.stages.middle.gpa);
  assert.equal(state.collegeApplications.schoolGpa, high.gpa);
  const fallback = copy(state);
  delete fallback.school.stages;
  fallback.school.gpa = high.gpa;
  const before = copy(state);
  assert.deepEqual(createCollegeOffers(state), createCollegeOffers(fallback), 'stage mean and an equal legacy GPA admit identically');
  const lastReport = copy(state);
  lastReport.school.gpa = high.gpa > 75 ? 50 : 100;
  assert.deepEqual(createCollegeOffers(lastReport), createCollegeOffers(state), 'the final report alone changes nothing');
  assert.deepEqual(state, before, 'offer reads are pure');
});

test('honors at 87 or better queue one saved three-option choice that resolves to +.75 without gameplay RNG', () => {
  for (const [stage, age, stages] of [['elementary', 10, { elementary: { gpa: 95, years: 5 } }], ['middle', 13, { elementary: { gpa: 80, years: 6 }, middle: { gpa: 90, years: 2 } }]]) {
    const id = `school_${stage}_honors`, start = pupil(age, stages);
    study(start, 4);
    assert.equal(validateSave(start), true);
    const runs = [copy(start), copy(start)].map(state => { assert.equal(advanceYear(state, calm).ok, true); return state; });
    assert.deepEqual(runs[0], runs[1], 'the same year produces the same saved options');
    const [state] = runs, pending = state.pendingEvents.find(entry => entry.eventId === id);
    assert.ok(state.school.stages[stage].gpa >= SCHOOL_BALANCE.honorsGpa);
    assert.deepEqual(Object.keys(pending).sort(), ['age', 'eventId', 'options']);
    assert.equal(pending.age, age + 1);
    assert.equal(pending.options.length, 3);
    assert.equal(new Set(pending.options).size, 3);
    assert.ok(pending.options.every(stat => SCHOOL_BALANCE.honorsStats.includes(stat)));
    assert.equal(state.lastYearEvents.includes(id), false, 'a scheduled milestone is not a rolled event');
    const unrolled = copy(start);
    unrolled.school.stages[stage].gpa = 80;
    assert.equal(advanceYear(unrolled, calm).ok, true);
    assert.equal(unrolled.pendingEvents.length, 0);
    assert.equal(unrolled.rng, state.rng, 'queueing honors consumes no gameplay RNG');
    const saved = copy(state);
    const choices = pendingEventChoices(event(id), pending);
    assert.deepEqual(pendingEventChoices(event(id), pending), choices, 'repeated reads give the same options');
    assert.deepEqual(choices.map(choice => [choice.id, choice.statChanges]), pending.options.map((stat, index) => [['first', 'second', 'third'][index], { [stat]: .75 }]));
    assert.ok(choices.every(choice => choice.label && choice.description && choice.label !== 'Reward'));
    assert.deepEqual(state, saved, 'reading the choices is pure');
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), state, 'the saved options survive a reload exactly');
    for (const [index, choiceId] of ['first', 'second', 'third'].entries()) {
      const resolved = copy(state), stat = pending.options[index];
      assert.equal(resolveEventChoice(resolved, choiceId, id).ok, true);
      assert.deepEqual(resolved.stats, { ...state.stats, [stat]: changedRating(state.stats[stat], .75) }, `${choiceId} raises only ${stat}`);
      assert.equal(resolved.rng, state.rng);
      assert.equal(resolved.pendingEvents.length, 0);
      assert.equal(validateSave(resolved), true);
    }
    const next = copy(state), entries = () => next.history.filter(entry => entry.title === event(id).name).length;
    assert.equal(resolveEventChoice(next, 'first', id).ok, true);
    assert.equal(entries(), 2, 'the offer and the chosen reward');
    year(next); year(next);
    assert.equal(entries(), 2, 'honors arrive once per stage');
  }
});

test('honors offer only stats that can still rise and reject forged saved options', () => {
  const start = pupil(10, { elementary: { gpa: 95, years: 5 } });
  study(start, 4);
  for (const stat of ['strength', 'attractiveness', 'social', 'creativity']) start.stats[stat] = 10;
  assert.equal(advanceYear(start, calm).ok, true);
  const open = SCHOOL_BALANCE.honorsStats.filter(stat => start.stats[stat] < 10), { options } = start.pendingEvents[0];
  assert.ok(open.length < SCHOOL_BALANCE.honorsStats.length, 'fixture: some rewards are already at 10 after the year');
  assert.equal(options.length, Math.min(3, open.length));
  assert.ok(options.every(stat => open.includes(stat)), 'a maxed stat is never offered');
  assert.equal(validateSave(start), true);
  const state = pupil(10, { elementary: { gpa: 95, years: 5 } });
  study(state, 4);
  assert.equal(advanceYear(state, calm).ok, true);
  for (const options of [[], ['intelligence'], ['health', 'health'], ['strength', 'social', 'creativity', 'health'], 'health', undefined]) {
    const forged = copy(state);
    forged.pendingEvents[0].options = options;
    assert.equal(validateSave(forged), false, JSON.stringify(options));
    assert.equal(migrateSave(forged), null);
  }
  const rolled = copy(state);
  rolled.pendingEvents = [{ eventId: 'school_team', age: rolled.age, options: ['health'] }];
  rolled.lastYearEvents = ['school_team'];
  assert.equal(validateSave(rolled), false, 'ordinary pending events never carry options');
  for (const stages of [{ middle: { gpa: 80, years: 1 } }, { elementary: { gpa: 49, years: 1 } }, { elementary: { gpa: 80, years: 0 } }, { elementary: { gpa: 80, years: 7 } }, { elementary: { gpa: 80 } }, { college: { gpa: 80, years: 1 } }, []]) {
    const bad = pupil(10);
    bad.school.stages = stages;
    assert.equal(validateSave(bad), false, JSON.stringify(stages));
  }
});

test('a GPA below 73 brings one warning that costs Social, Creativity or Mental stability, never Intelligence', () => {
  // The control's earlier years lift its stage mean into the quiet 73-87 band.
  for (const [stage, age, stages, quiet] of [['elementary', 10, { elementary: { gpa: 60, years: 5 } }, 80], ['middle', 13, { elementary: { gpa: 80, years: 6 }, middle: { gpa: 55, years: 2 } }, 90]]) {
    const start = pupil(age, stages);
    start.focus.work = 0;
    const control = copy(start);
    control.school.stages[stage].gpa = quiet;
    const warned = copy(start);
    assert.equal(advanceYear(warned, calm).ok, true);
    assert.equal(advanceYear(control, calm).ok, true);
    assert.ok(warned.school.stages[stage].gpa < SCHOOL_BALANCE.warningGpa);
    assert.equal(warned.pendingEvents.length, 0, 'the warning is automatic');
    const changed = Object.keys(warned.stats).filter(stat => warned.stats[stat] !== control.stats[stat]);
    assert.equal(changed.length, 1);
    assert.ok(SCHOOL_BALANCE.warningStats.includes(changed[0]), changed[0]);
    assert.equal(warned.stats[changed[0]], changedRating(control.stats[changed[0]], -.5), 'one -.5 change on the rating scale');
    assert.equal(warned.stats.intelligence, control.stats.intelligence, 'poor grades never cost Intelligence');
    assert.equal(warned.rng, control.rng, 'the warning consumes no gameplay RNG');
    const entries = warned.history.filter(entry => entry.title === event(`school_${stage}_warning`).name);
    assert.equal(entries.length, 1);
    assert.doesNotMatch(entries[0].text, /^Reward|^undefined/);
    assert.equal(validateSave(warned), true);
    assert.deepEqual(migrateSave(copy(warned)), warned);
    year(warned, 0); year(warned, 0);
    assert.equal(warned.history.filter(entry => entry.title === entries[0].title).length, 1, 'the warning applies once per stage');
  }
  const finalYear = pupil(17, { high: { gpa: 55, years: 3 } });
  finalYear.focus.work = 0;
  assert.equal(advanceYear(finalYear, calm).ok, true);
  assert.equal(finalYear.history.some(entry => /^Shouting about|honors$/.test(entry.title)), false, 'high school ends without a milestone');
});

test('the first school year always offers both activity categories', () => {
  for (let index = 0; index < 3000; index++) for (const lifestyle of [0, 2, 5]) {
    const person = { id: `first-${index}`, seed: index + 7, generation: 1, age: 5, lifestyle, stats: pupil().stats };
    for (const kind of ['sports', 'extracurricular']) assert.ok(annualSchoolOffers(person, kind).length > 0, `${kind} at Lifestyle ${lifestyle}, seed ${index + 7}`);
  }
  let empty = 0;
  for (let index = 0; index < 500; index++) empty += Number(!annualSchoolOffers({ id: `later-${index}`, seed: index + 7, generation: 1, age: 6, lifestyle: 0 }, 'sports').length);
  assert.ok(empty > 300, 'later years keep their Lifestyle chance');
  const born = createGame({ seed: 51515 });
  born.conditions = [];
  while (born.age < 5) year(born);
  assert.ok(born.school.offers.sports.length > 0 && born.school.offers.extracurricular.length > 0, 'a real life starts school with offers');
});

test('activity training is exactly the graded stats except height, each unit shared by their count', () => {
  for (const activity of [...SPORTS, ...EXTRACURRICULARS]) {
    const stats = Object.keys(activity.weights).filter(stat => stat !== 'height');
    assert.deepEqual(Object.keys(activity.training).sort(), [...stats].sort(), activity.id);
    for (const stat of stats) near(activity.training[stat], SCHOOL_BALANCE.trainingUnits[stat] / stats.length, `${activity.id} ${stat}`);
    assert.deepEqual(activity.training, activityTraining(activity.weights));
    assert.ok(Object.isFrozen(activity.training));
  }
  assert.deepEqual(schoolActivity('sports', 'basketball').training, { strength: .3 });
  assert.deepEqual(schoolActivity('sports', 'soccer').training, { strength: .3 });
  assert.deepEqual(schoolActivity('extracurricular', 'student_council').training, { social: .12, intelligence: .1125 });
  assert.deepEqual(activityTraining({ strength: .7, height: .3 }), { strength: .3 });
  assert.deepEqual(activityTraining({ stability: .4, creativity: .3, health: .3 }), { stability: .1, creativity: .08, health: .035 });
});
