import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, validateSave, migrateSave, JOBS, advanceYear, resolveEventChoice, EVENTS } from '../engine.js';
import { createCollegeOffers, graduateJobOffers } from '../college.js';
import { defaultFocus } from '../focus-rules.js';

const copy = value => structuredClone(value);
function student() {
  const state = createGame({ seed: 14882 });
  Object.assign(state, { age: 18, conditions: [], effects: [], school: null,
    height: 68, adultHeight: 68, maturityAge: 18, growthAnchor: null,
    money: 1000000, education: { status: 'college', years: 0, collegeId: 'community_transfer', gpa: null },
    jobId: null, jobOffers: [], housing: { status: 'campus', yearsWithFamily: 0, hostId: null } });
  state.collegeApplications = createCollegeOffers(state);
  state.focus = defaultFocus(state);
  assert.equal(validateSave(state), true, 'valid funded student fixture');
  return state;
}
function withSport() {
  const state = student();
  state.age = 19;
  Object.assign(state.education, { years: 1, gpa: 85,
    sport: { id: 'soccer', success: 8.2, seasons: 1, professionalOffer: false } });
  state.focus = { work: 2, social: 2, family: 2, self: 0, sports: 2 };
  const delta = value => ({ before: value, after: value, change: 0 });
  state.yearSummary = { fromAge: 18, toAge: 19, dismissed: false,
    stats: Object.fromEntries(Object.entries(state.stats).map(([key, value]) => [key, delta(value)])),
    lifestyle: delta(state.lifestyle), parents: [], events: [],
    decisions: { focus: { ...state.focus }, workLabel: 'College', focusMax: 4, focusBudget: 8, collegeSport: 'soccer' } };
  assert.equal(validateSave(state), true, 'valid completed college sport year');
  return state;
}
function rejects(original, changes) {
  for (const [name, change] of Object.entries(changes)) {
    const invalid = copy(original);
    change(invalid);
    assert.equal(validateSave(invalid), false, name);
  }
}

test('college offers, funding, housing and earned sports records reload without mutation', () => {
  for (const state of [student(), withSport()]) {
    const before = copy(state);
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), before);
    assert.deepEqual(state, before);
  }
});

test('legacy college and graduate saves retain their absent optional fields and fixed offer count', () => {
  for (const graduate of [false, true]) {
    const state = student();
    delete state.collegeApplications; delete state.housing;
    state.education = { status: graduate ? 'graduate' : 'college', years: graduate ? 4 : 0 };
    state.age = graduate ? 22 : 18;
    state.jobOffers = graduate ? JOBS.slice(0, 15).map(job => job.id) : [];
    const before = copy(state);
    assert.equal(validateSave(state), true);
    assert.deepEqual(migrateSave(copy(state)), before);
    assert.deepEqual(state, before);
    if (graduate) { state.jobOffers.pop(); assert.equal(validateSave(state), false); }
  }
});

test('college applications reject malformed awards, duplicate offers and invalid funding captures', () => {
  rejects(student(), {
    'null applications': s => { s.collegeApplications = null; },
    'childhood offers': s => { s.collegeApplications.offeredAge = 17; },
    'future offers': s => { s.collegeApplications.offeredAge = 19; },
    'invalid school grade': s => { s.collegeApplications.schoolGpa = 101; },
    'missing funding': s => { delete s.collegeApplications.funding; },
    'nonfinite funding': s => { s.collegeApplications.funding.availableLifestyle = Infinity; },
    'unknown supporter': s => { s.collegeApplications.funding.supporters = [{ id: 'unknown', willing: true }]; },
    'nonboolean willingness': s => { s.collegeApplications.funding.supporters[0].willing = 1; },
    'duplicate supporters': s => { s.collegeApplications.funding.supporters.push(s.collegeApplications.funding.supporters[0]); },
    'empty offers': s => { s.collegeApplications.offers = []; },
    'duplicate offers': s => { s.collegeApplications.offers.push(s.collegeApplications.offers[0]); },
    'unknown college': s => { s.collegeApplications.offers[0].collegeId = 'unknown'; },
    'invalid scholarship type': s => { s.collegeApplications.offers[0].scholarship = { kind: 'luck', coverage: 1 }; },
    'fractional scholarship': s => { s.collegeApplications.offers[0].scholarship = { kind: 'academic', coverage: .6 }; },
    'negative cost': s => { s.collegeApplications.offers[0].annualPersonalCost = -1; },
    'extra offer key': s => { s.collegeApplications.offers[0].reroll = true; },
  });
});

test('new education records enforce earned GPA, college identity and completed sport seasons', () => {
  rejects(student(), {
    'missing GPA': s => { delete s.education.gpa; },
    'unearned GPA': s => { s.education.gpa = 90; },
    'unknown enrolled college': s => { s.education.collegeId = 'unknown'; },
    'missing selected funding': s => { delete s.collegeApplications; },
    'unaffordable enrollment': s => { s.collegeApplications.offers[0].affordable = false; },
  });
  rejects(withSport(), {
    'missing earned GPA': s => { s.education.gpa = null; },
    'nonfinite GPA': s => { s.education.gpa = NaN; },
    'unknown sport': s => { s.education.sport.id = 'unknown'; },
    'too many seasons': s => { s.education.sport.seasons = 2; },
    'fractional season': s => { s.education.sport.seasons = .5; },
    'missing success': s => { s.education.sport.success = null; },
    'excess success': s => { s.education.sport.success = 10.1; },
    'early professional award': s => { s.education.sport.professionalOffer = true; },
  });
});

test('named graduates allow variable unique offers while preserving retail and qualifications', () => {
  const state = student(); state.age = 22;
  Object.assign(state.education, { status: 'graduate', years: 4, gpa: 85 });
  state.housing.status = 'independent';
  state.jobOffers = graduateJobOffers(state, state.education);
  assert.equal(validateSave(state), true);
  for (const length of [5, 18]) {
    state.jobOffers = JOBS.slice(0, length).map(job => job.id);
    assert.equal(validateSave(state), true, `${length} offers`);
  }
  rejects(state, {
    'too few offers': s => { s.jobOffers = JOBS.slice(0, 4).map(job => job.id); },
    'too many offers': s => { s.jobOffers = JOBS.slice(0, 19).map(job => job.id); },
    'duplicate offers': s => { s.jobOffers[1] = s.jobOffers[0]; },
    'missing retail': s => { s.jobOffers = JOBS.slice(1, 19).map(job => job.id); },
  });
});

test('housing validates lifetime allowance and host identity without reevaluating a saved dead host', () => {
  const state = student(); state.education = { status: 'workforce', years: 0 };
  state.jobOffers = JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id);
  state.housing = { status: 'parents', yearsWithFamily: 3, hostId: state.parents[0].id };
  assert.equal(validateSave(state), true);
  state.parents[0].alive = false;
  state.parents[0].death = { cause: 'disease', age: state.parents[0].age };
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  rejects(state, {
    'unknown host': s => { s.housing.hostId = 'unknown'; },
    'negative years': s => { s.housing.yearsWithFamily = -1; },
    'reset-free allowance': s => { s.housing.yearsWithFamily = 4; },
    'fractional years': s => { s.housing.yearsWithFamily = .5; },
    'unknown status': s => { s.housing.status = 'hotel'; },
    'independent host': s => { s.housing.status = 'independent'; },
    'campus without college': s => { s.housing.status = 'campus'; s.housing.hostId = null; },
  });
});

test('completed college sports reviews retain their own caps and adult budget after leaving college', () => {
  const state = withSport();
  rejects(state, {
    'missing sport metadata': s => { delete s.yearSummary.decisions.collegeSport; },
    'invalid sport metadata': s => { s.yearSummary.decisions.collegeSport = 'unknown'; },
    'noncollege sport review': s => { s.yearSummary.decisions.workLabel = 'Career'; },
    'excess sport focus': s => { s.yearSummary.decisions.focus.sports = 3; s.yearSummary.decisions.focus.family = 1; },
    'invented extra budget': s => { s.yearSummary.decisions.focusBudget = 10; },
    'overspent budget': s => { s.yearSummary.decisions.focus.self = 1; },
  });
  state.education = { status: 'workforce', years: 0 };
  state.jobOffers = JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id);
  state.housing.status = 'independent';
  state.focus = defaultFocus(state);
  assert.equal(validateSave(state), true, 'historical review is independent of current enrollment');
});

test('college sports Fame saves and reviews allow the matching third focus point', () => {
  const state = withSport();
  state.fame = { kind: 'sports', activityId: 'soccer', rating: 7, support: 0, startedAge: 18 };
  state.focus.sports = 3; state.focus.family = 1;
  state.yearSummary.decisions.fame = copy(state.fame);
  state.yearSummary.decisions.focus = copy(state.focus);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('real college sports invitations survive reload and acceptance across graduation without a school source', () => {
  for (const age of [19, 21]) {
    const original = withSport();
    original.age = age; original.education.years = age - 18;
    original.education.sport.seasons = age - 18;
    original.education.sport.success = 10;
    original.yearSummary = null;
    for (const key of Object.keys(original.stats)) original.stats[key] = 10;
    let invited;
    for (let attempt = 0; attempt < 200 && !invited; attempt++) {
      const state = copy(original);
      state.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
      assert.equal(advanceYear(state, { eventRandom: () => .05, mortalityRandom: () => 1,
        growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 }).ok, true);
      if (state.pendingEvents.some(event => event.eventId === 'fame_sports_offer')) invited = state;
    }
    assert.ok(invited, `actual college invitation at age ${age}`);
    assert.equal(invited.education.status, age === 21 ? 'graduate' : 'college');
    assert.equal(validateSave(invited), true, 'the captured adult invitation is a valid saved pending choice');
    assert.deepEqual(migrateSave(copy(invited)), invited);
    const focusBefore = invited.focus.sports;
    while (invited.pendingEvents.length) {
      const pending = invited.pendingEvents[0], event = EVENTS.find(entry => entry.id === pending.eventId);
      const choice = event.id === 'fame_sports_offer' ? 'pursue' : event.choices[0].id;
      assert.equal(resolveEventChoice(invited, choice, event.id, pending.subjectId).ok, true);
    }
    assert.equal(invited.fame.kind, 'sports');
    assert.equal(invited.fame.activityId, 'soccer');
    assert.equal(invited.focus.sports, focusBefore ?? 0);
    assert.equal(invited.school, null, 'college recruitment never fabricates high-school enrollment');
    assert.equal(validateSave(invited), true);
    assert.deepEqual(migrateSave(copy(invited)), invited);
  }
});
