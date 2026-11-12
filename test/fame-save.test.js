import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, validateSave, migrateSave, quitFame, JOBS } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
function fixture(age = 15, kind = 'sports') {
  const state = createGame({ seed: 884109, firstName: 'Jamie', surname: 'Reed' });
  Object.assign(state, { age, parents: [], conditions: [], effects: [], maturityAge: 18,
    height: age < 18 ? 60 : 68, adultHeight: age < 18 ? null : 68,
    education: { status: age < 18 ? 'school' : 'workforce', years: 0 },
    jobOffers: age < 18 ? [] : JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id) });
  state.school = createSchoolRecord({ ...state, age: Math.min(age, 17) });
  state.school.sports = { id: 'soccer', success: 5 };
  state.school.extracurricular = { id: 'chess', success: 5 };
  state.fame = kind ? { kind, activityId: kind === 'personal' ? null : kind === 'sports' ? 'soccer' : 'chess',
    rating: 5, support: 0, startedAge: Math.min(age, 14) } : null;
  state.focus = { ...defaultFocus(state), work: 1, social: 1, family: 1, self: 1 };
  if (kind && kind !== 'personal') state.focus[kind] = 3;
  assert.equal(validateSave(state), true, 'starting fixture validates');
  return state;
}
function rejects(original, mutations) {
  for (const [label, mutate] of mutations) {
    const invalid = copy(original); mutate(invalid);
    const before = copy(invalid);
    assert.equal(validateSave(invalid), false, label);
    assert.equal(migrateSave(invalid), null, `${label} cannot be recovered as a legacy save`);
    assert.deepEqual(invalid, before, `${label} remains untouched`);
  }
}
function completed(age, kind) {
  const state = fixture(age, kind);
  assert.equal(advanceYear(state, steady).ok, true);
  assert.equal(validateSave(state), true, 'completed famous year validates');
  return state;
}

test('historical school fame grants a third point only to its recorded activity after current fame ends', () => {
  const state = completed(15, 'sports');
  const report = state.yearSummary.school.activities.find(activity => activity.kind === 'sports');
  assert.equal(report.focus, 3);
  state.pendingEvents = []; state.lastYearEvents = [];
  assert.equal(quitFame(state).ok, true);
  state.school.sports = { id: 'tennis', success: null };
  assert.equal(validateSave(state), true, 'past Soccer allocation remains valid after leaving fame and changing enrollment');
  assert.deepEqual(migrateSave(state), state, 'historical snapshots and earned report are preserved');
  rejects(state, [
    ['ordinary category cannot gain capacity', value => { value.yearSummary.decisions.focusCaps.extracurricular = 3; }],
    ['recorded fame is required for capacity three', value => { delete value.yearSummary.decisions.fame; }],
    ['four activity points remain impossible', value => { value.yearSummary.decisions.focus.sports = 4; }],
    ['report must match the recorded source ID', value => { value.yearSummary.school.activities.find(activity => activity.kind === 'sports').id = 'tennis'; }],
    ['report cannot exceed recorded capacity', value => { value.yearSummary.decisions.focusCaps.sports = 2; value.yearSummary.decisions.focus.sports = 2; }],
    ['historical fame cannot start after the reviewed year', value => { value.yearSummary.decisions.fame.startedAge = value.age; }],
  ]);
});

test('adult fame reviews keep an eight-point budget and exactly one source focus even after loss', () => {
  const state = completed(18, 'extracurricular');
  assert.equal(state.yearSummary.decisions.focusBudget, 8);
  assert.equal(state.yearSummary.decisions.focus.extracurricular, 3);
  state.pendingEvents = []; state.lastYearEvents = [];
  assert.equal(quitFame(state).ok, true);
  assert.equal(Object.hasOwn(state.focus, 'extracurricular'), false);
  assert.equal(validateSave(state), true, 'recorded adult source is independent of current focus keys');
  rejects(state, [
    ['adult extra focus does not add budget', value => { value.yearSummary.decisions.focusBudget = 10; }],
    ['adult extra focus needs its fame snapshot', value => { delete value.yearSummary.decisions.fame; }],
    ['adult cannot retain both optional categories', value => { value.yearSummary.decisions.focus.sports = 0; }],
    ['adult source remains capped at three', value => { value.yearSummary.decisions.focus.extracurricular = 4; }],
    ['personal fame cannot justify an activity key', value => { Object.assign(value.yearSummary.decisions.fame, { kind: 'personal', activityId: null }); }],
  ]);
  assert.equal(validateSave(completed(18, 'personal')), true, 'personal fame retains ordinary adult controls');
});

test('year fame snapshots validate their own ages and shape without requiring current ownership', () => {
  const state = completed(15, 'sports');
  state.pendingEvents = []; state.lastYearEvents = [];
  assert.equal(quitFame(state).ok, true);
  assert.equal(validateSave(state), true);
  const gained = copy(state); gained.yearSummary.fame.before = null;
  assert.equal(validateSave(gained), true, 'a review may record gaining fame');
  const lost = copy(state); lost.yearSummary.fame.after = null;
  assert.equal(validateSave(lost), true, 'a review may record losing fame');
  rejects(state, [
    ['empty transition is omitted rather than stored', value => { value.yearSummary.fame = { before: null, after: null }; }],
    ['transition requires both endpoints', value => { delete value.yearSummary.fame.before; }],
    ['transition has no unrecognized fields', value => { value.yearSummary.fame.extra = true; }],
    ['starting snapshot cannot describe future fame', value => { value.yearSummary.fame.before.startedAge = value.age; }],
    ['ending snapshot cannot describe future fame', value => { value.yearSummary.fame.after.startedAge = value.age + 1; }],
    ['historical rating keeps one decimal precision', value => { value.yearSummary.fame.after.rating = 5.25; }],
    ['historical activity still must be a known source', value => { value.yearSummary.fame.before.activityId = 'unknown'; }],
  ]);
});

test('pending invitations preserve a known matching source across the eighteenth birthday', () => {
  const state = fixture(18, null);
  state.pendingEvents = [{ eventId: 'fame_sports_offer', age: 18, fameActivityId: 'soccer' }];
  state.lastYearEvents = ['fame_sports_offer'];
  assert.equal(validateSave(state), true, 'an invitation rolled at seventeen remains resolvable at eighteen');
  assert.deepEqual(migrateSave(state), state);
  rejects(state, [
    ['invitation must capture its source', value => { delete value.pendingEvents[0].fameActivityId; }],
    ['invitation source must still be enrolled', value => { value.pendingEvents[0].fameActivityId = 'tennis'; }],
    ['invitation source must be known', value => { value.pendingEvents[0].fameActivityId = 'unknown'; }],
    ['an activity field cannot be attached to personal invitations', value => { value.pendingEvents[0].eventId = 'fame_personal_offer'; value.lastYearEvents = ['fame_personal_offer']; }],
    ['an activity field cannot be attached to ordinary fame choices', value => { value.pendingEvents[0].eventId = 'fame_campaign_contract'; value.lastYearEvents = ['fame_campaign_contract']; }],
  ]);
  const alreadyLost = copy(state);
  alreadyLost.pendingEvents = [{ eventId: 'fame_campaign_contract', age: 18 }];
  alreadyLost.lastYearEvents = ['fame_campaign_contract'];
  assert.equal(validateSave(alreadyLost), true, 'saved follow-up decisions are not stranded by a later fame loss');
});

test('missing or null legacy fame stays compatible while active fame belongs only to the living current player', () => {
  const ordinary = createGame({ seed: 99210 });
  delete ordinary.fame;
  assert.equal(validateSave(ordinary), true);
  assert.deepEqual(migrateSave(ordinary), ordinary);
  for (const fame of [undefined, null]) {
    const legacy = copy(ordinary); legacy.version = 19;
    if (fame === null) legacy.fame = null;
    const migrated = migrateSave(legacy);
    assert.ok(migrated); assert.equal(validateSave(migrated), true);
    assert.equal(migrated.rng, legacy.rng);
    assert.equal(Object.hasOwn(migrated, 'fame'), fame === null);
  }
  const famous = fixture(15, 'sports');
  rejects(famous, [
    ['active fame cannot be imported as schema nineteen', value => { value.version = 19; }],
    ['nonliving players cannot hold active fame', value => { value.alive = false; value.death = { cause: 'accident', age: value.age }; value.needsSuccession = true; }],
    ['fame cannot attach to a different enrollment', value => { value.school.sports.id = 'tennis'; }],
  ]);
  const family = createGame({ seed: 99210 });
  family.parents[0].fame = { kind: 'personal', activityId: null, rating: 5, support: 0, startedAge: 13 };
  assert.equal(validateSave(family), false, 'NPC profiles cannot acquire the player-only progression field');
});
