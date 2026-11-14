import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, chooseEducation, advanceYear, annualForecast, joinCollegeSport, leaveCollegeSport,
  setFocus, validateSave, migrateSave, JOBS } from '../engine.js';
import { createCollegeOffers } from '../college.js';
import { defaultFocus } from '../focus-rules.js';

const copy = value => structuredClone(value);
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0,
  parentCareerRandom: () => 1, fameRandom: () => 1 };
function adult() {
  const state = createGame({ seed: 14882 });
  Object.assign(state, { age: 18, conditions: [], effects: [], school: null,
    height: 68, adultHeight: 68, maturityAge: 18, growthAnchor: null, money: 1000000,
    education: { status: 'undecided', years: 0 }, jobId: null,
    jobOffers: JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id) });
  state.collegeApplications = createCollegeOffers(state);
  state.focus = defaultFocus(state);
  assert.equal(validateSave(state), true);
  return state;
}
function finalYear({ legacy = false, parents = false, fame = false } = {}) {
  const state = adult();
  assert.equal(chooseEducation(state, 'college', 'community_transfer').ok, true);
  state.age = 21; state.education.years = 3; state.education.gpa = 85;
  state.money = 0;
  state.parents.forEach(parent => {
    parent.relationship = parents ? 10 : 0;
    parent.lifestyle = 4; parent.career.progress = 4;
  });
  if (legacy) {
    delete state.collegeApplications;
    delete state.education.collegeId;
    delete state.education.gpa;
  }
  if (fame) {
    state.education.sport = { id: 'soccer', success: 10, seasons: 3, professionalOffer: false };
    state.fame = { kind: 'sports', activityId: 'soccer', rating: 9, support: 0, startedAge: 19 };
    state.focus = { work: 2, social: 1, family: 1, self: 1, sports: 3 };
  }
  assert.equal(validateSave(state), true);
  return state;
}

test('final college forecasts include graduation housing and match the complete routine without changing saves', () => {
  for (const settings of [{}, { parents: true }, { legacy: true }, { legacy: true, parents: true }, { fame: true }]) {
    const state = finalYear(settings), saved = copy(state), forecast = annualForecast(state);
    assert.deepEqual(state, saved, 'forecast leaves the entire original save and RNG alone');
    assert.equal(advanceYear(state, calm).ok, true);
    assert.equal(state.education.status, 'graduate');
    assert.equal(state.housing.status, settings.parents ? 'parents' : 'homeless');
    assert.equal(forecast.lifestyle.after, state.lifestyle, JSON.stringify(settings));
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(copy(state)), state);
  }
});

test('switching a famous college sport fits the lower ordinary cap and ends only the old source', () => {
  const state = finalYear({ fame: true });
  const old = copy(state);
  assert.equal(joinCollegeSport(state, 'tennis').ok, true);
  assert.equal(state.fame, null);
  assert.deepEqual(state.education.sport, { id: 'tennis', success: null, seasons: 0, professionalOffer: false });
  assert.equal(state.focus.sports, 2);
  assert.equal(Object.values(state.focus).reduce((sum, points) => sum + points, 0), 7);
  assert.deepEqual(state.school, old.school);
  assert.deepEqual(state.stats, old.stats);
  assert.equal(state.rng, old.rng);
  assert.equal(validateSave(state), true);
});

test('a housing host dying during the year ends support and preserves the consumed family year', () => {
  const state = adult(); state.money = 0;
  state.parents.forEach((parent, index) => { parent.relationship = index ? 0 : 10; parent.lifestyle = 4; parent.career.progress = 4; });
  assert.equal(chooseEducation(state, 'work').ok, true);
  assert.equal(state.housing.hostId, state.parents[0].id);
  let deathDraw = 0;
  assert.equal(advanceYear(state, { ...calm, mortalityRandom: () => ++deathDraw === 2 ? 0 : 1 }).ok, true);
  assert.equal(state.parents[0].alive, false);
  assert.equal(state.housing.status, 'homeless');
  assert.equal(state.housing.hostId, null);
  assert.equal(state.housing.yearsWithFamily, 1);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  const saved = copy(state); annualForecast(state);
  assert.deepEqual(state, saved);
});

test('a college sport cannot be switched or left to bypass a saved annual focus requirement', () => {
  const state = adult();
  assert.equal(chooseEducation(state, 'college', 'community_transfer').ok, true);
  assert.equal(setFocus(state, 'social', 0).ok, true);
  assert.equal(joinCollegeSport(state, 'soccer').ok, true);
  state.effects.push({ id: 'required-team', name: 'Team commitment', description: '', years: 1,
    modifiers: {}, focusMinimums: { standard: { sports: 1 } } });
  const before = copy(state);
  assert.equal(joinCollegeSport(state, 'tennis').ok, false);
  assert.equal(leaveCollegeSport(state).ok, false);
  assert.deepEqual(state, before);
});

test('graduating without a school record fits famous sport focus when funded facilities end', () => {
  const state = finalYear({ fame: true });
  state.education.sport.id = state.fame.activityId = 'lacrosse';
  assert.equal(state.school, null);
  assert.equal(state.focus.sports, 3);
  assert.equal(validateSave(state), true);
  const before = copy(state), forecast = annualForecast(state);
  assert.deepEqual(state, before);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.education.status, 'graduate');
  assert.equal(state.housing.status, 'homeless');
  assert.equal(state.focus.sports, 0, 'campus equipment no longer satisfies the sport requirement');
  assert.equal(state.fame.activityId, 'lacrosse', 'a paused source remains captured');
  assert.deepEqual(state.yearSummary.stats, forecast.stats);
  assert.equal(state.lifestyle, forecast.lifestyle.after);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});
