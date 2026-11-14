import test from 'node:test';
import assert from 'node:assert/strict';
import { collegeSportEligible, collegeSportSuccessAfterYear, professionalSportChance, collegeSportFameChance, COLLEGE_SPORT_BALANCE } from '../college-sports.js';
import { schoolActivity, currentSchoolActivity, currentSchoolEnrollment, activityEligible, activitySuccessAfterYear } from '../school.js';
import { focusBudget, focusKeysForAge, focusMaxFor, focusNeutralFor, defaultFocus, fitFocusBudget } from '../focus-rules.js';
import { standardFocusCoefficients, standardFocusPractice, skillChanges, YEARLY_DECISION_SCALE } from '../development.js';

const core = ['work', 'social', 'family', 'self'];
function player(ability = 5, id = 'soccer') {
  return {
    age: 18, alive: true, rng: 88721, lifestyle: 1, conditions: [], effects: [], fame: null,
    stats: { intelligence: ability, strength: ability, social: ability, creativity: ability, attractiveness: ability, health: ability, stability: ability },
    aptitudes: { intelligence: 0, strength: 0, social: 0, creativity: 0, attractiveness: 0, health: 0, stability: 0 },
    focus: { work: 2, social: 1, family: 1, self: 2, sports: 2 },
    school: { sports: { id, success: 10 }, extracurricular: null },
    education: { status: 'college', years: 0, sport: { id, success: null, seasons: 0, professionalOffer: false } },
  };
}

test('college reports are separate from high-school achievement and require a much stronger field', () => {
  const ordinary = player(5), before = structuredClone(ordinary);
  assert.equal(currentSchoolEnrollment(ordinary, 'sports'), ordinary.education.sport);
  assert.equal(currentSchoolActivity(ordinary, 'sports'), schoolActivity('sports', 'soccer'));
  assert.equal(collegeSportSuccessAfterYear(ordinary, null, 2), .16);
  const highSchool = { ...ordinary, age: 17, education: { status: 'school', years: 0 } };
  assert.equal(activitySuccessAfterYear(highSchool, schoolActivity('sports', 'soccer'), null, 2), 5.6);
  const scores = [5, 8, 9, 9.5, 10].map(ability => collegeSportSuccessAfterYear(player(ability), null, 2));
  assert.deepEqual(scores, [.16, 2.62, 5.31, 7.35, 10]);
  assert.ok(scores[4] - scores[3] > scores[3] - scores[2], 'top-end ability makes an increasingly large competitive difference');
  assert.deepEqual(ordinary, before, 'forecasts never mutate high school, college, focus, or RNG');
});

test('college report effort, retained form and noise remain bounded without passive skill gains', () => {
  const state = player(10);
  assert.deepEqual([0, 1, 2, 3].map(points => collegeSportSuccessAfterYear(state, null, points)), [0, 6, 10, 10]);
  assert.equal(collegeSportSuccessAfterYear(state, 4, 2), 7.9);
  assert.equal(collegeSportSuccessAfterYear(state, 4, 0, 3), 1.4, 'no-focus reporting receives no positive noise');
  assert.equal(collegeSportSuccessAfterYear(state, null, 2, 100), 10);
  assert.equal(collegeSportSuccessAfterYear(player(0), null, 2, -100), 0);
  const before = structuredClone(state);
  collegeSportSuccessAfterYear(state, 4, 2, -1);
  assert.deepEqual(state, before);
});

test('funded college facilities allow selected sports while unrelated school activity access remains gated', () => {
  const state = player(9, 'lacrosse');
  assert.equal(collegeSportEligible(state), true);
  assert.equal(activityEligible(state, schoolActivity('sports', 'lacrosse')), true);
  assert.equal(collegeSportEligible(state, schoolActivity('sports', 'soccer')), false);
  const school = { ...state, age: 17, education: { status: 'school', years: 0 } };
  assert.equal(activityEligible(school, schoolActivity('sports', 'lacrosse')), false);
  const graduate = { ...state, education: { ...state.education, status: 'graduate', years: 4 } };
  assert.equal(collegeSportEligible(graduate), false);
  assert.equal(activityEligible(graduate, schoolActivity('sports', 'lacrosse')), false);
  assert.equal(collegeSportSuccessAfterYear(graduate, 7, 2), 7);
});

test('college sports share the adult eight-point budget and disappear after college unless Fame maintains them', () => {
  const state = player();
  assert.deepEqual(focusKeysForAge(state), [...core, 'sports']);
  assert.equal(focusBudget(state), 8);
  assert.equal(focusMaxFor(state, 'sports'), 2);
  assert.equal(focusNeutralFor(state, 'sports'), 1);
  assert.deepEqual(defaultFocus(state), { work: 2, social: 2, family: 2, self: 2, sports: 0 });
  const fitted = fitFocusBudget(state, { work: 4, social: 4, family: 4, self: 4, sports: 4, extracurricular: 4 });
  assert.equal(Object.values(fitted).reduce((a, b) => a + b), 8);
  assert.ok(fitted.sports <= 2);
  assert.equal(Object.hasOwn(fitted, 'extracurricular'), false);
  state.education.status = 'graduate';
  assert.deepEqual(focusKeysForAge(state), core);
  state.fame = { kind: 'sports', activityId: 'soccer', rating: 5, support: 0, startedAge: 20 };
  assert.deepEqual(focusKeysForAge(state), [...core, 'sports']);
  assert.equal(focusMaxFor(state, 'sports'), 3);
});

test('Fame and college sports share one row while a separate famous extracurricular still consumes the same budget', () => {
  const state = player();
  state.fame = { kind: 'sports', activityId: 'soccer', rating: 5, support: 0, startedAge: 17 };
  assert.deepEqual(focusKeysForAge(state), [...core, 'sports']);
  assert.equal(focusMaxFor(state, 'sports'), 3);
  assert.equal(standardFocusCoefficients(state).sports.social, .48, 'one ordinary and one Fame contribution');
  state.fame = { ...state.fame, kind: 'extracurricular', activityId: 'chess' };
  state.school.extracurricular = { id: 'chess', success: 8 };
  state.focus.extracurricular = 1;
  assert.deepEqual(focusKeysForAge(state), [...core, 'sports', 'extracurricular']);
  assert.equal(focusBudget(state), 8);
  assert.equal(focusMaxFor(state, 'sports'), 2);
  assert.equal(focusMaxFor(state, 'extracurricular'), 3);
  assert.equal(standardFocusCoefficients(state).sports.social, .24);
  assert.equal(standardFocusCoefficients(state).extracurricular.social, .24);
});

test('college athletic training uses the selected sport and the existing halved choice scale', () => {
  const state = player(5, 'fencing');
  assert.deepEqual(standardFocusCoefficients(state).sports, { strength: .3, social: .24, intelligence: .225 });
  const without = { ...state, focus: { ...state.focus, sports: 0 } };
  assert.deepEqual(standardFocusCoefficients(without).sports, { strength: .3, social: .24 });
  const practice = standardFocusPractice(state), inactive = standardFocusPractice(without);
  assert.ok(Math.abs(practice.strength - inactive.strength - .9) < 1e-12);
  assert.ok(Math.abs(skillChanges(state).strength - skillChanges(without).strength - .9 * YEARLY_DECISION_SCALE) < 1e-12);
  const ended = { ...state, education: { ...state.education, status: 'graduate' } };
  assert.equal(Object.hasOwn(standardFocusCoefficients(ended), 'sports'), false);
});

test('professional recruitment requires four seasons and the extreme college tail', () => {
  const state = player(10);
  Object.assign(state.education.sport, { success: 10, seasons: 3 });
  assert.equal(professionalSportChance(state), 0);
  state.education.sport.seasons = 4;
  assert.equal(professionalSportChance(state), COLLEGE_SPORT_BALANCE.professionalMaxChance);
  state.education.sport.success = 9;
  const veryGood = professionalSportChance(state);
  assert.ok(veryGood > 0 && veryGood < .004);
  state.education.sport.success = 9.5;
  assert.ok(professionalSportChance(state) > veryGood * 10);
  state.education.sport.success = 8.49;
  assert.equal(professionalSportChance(state), 0);
  state.education.sport.success = 10;
  state.stats.strength = 8.99;
  assert.equal(professionalSportChance(state), 0, 'school success alone cannot substitute for current sporting ability');
  const before = structuredClone(state);
  professionalSportChance(state);
  assert.deepEqual(state, before);
});

test('college Fame chances need earned success and participation and remain separate from starting Fame', () => {
  const state = player(10);
  assert.equal(collegeSportFameChance(state), 0);
  Object.assign(state.education.sport, { success: 10, seasons: 1 });
  assert.equal(collegeSportFameChance(state), .06);
  state.education.sport.success = 7;
  assert.ok(collegeSportFameChance(state) > 0 && collegeSportFameChance(state) < .004);
  state.focus.sports = 0;
  assert.equal(collegeSportFameChance(state), 0);
  state.focus.sports = 2;
  state.fame = { kind: 'personal', activityId: null, rating: 5, support: 0, startedAge: 18 };
  assert.equal(collegeSportFameChance(state), 0);
});
