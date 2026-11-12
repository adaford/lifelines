import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, JOBS, createGame, advanceYear, annualForecast, eventOdds,
  resolveEventChoice, migrateSave, validateSave, focusLimits, setFocus, chooseEducation,
  enrollSchoolActivity, leaveSchoolActivity, quitFame, householdLifestyle, familyLifestyle,
  haveChild, successionInfo, succeed } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { fameLifestyleBonus, fameLearningBonus } from '../fame.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const invitationIds = ['fame_sports_offer', 'fame_extracurricular_offer', 'fame_personal_offer'];
function fixture(age = 15, kind = null) {
  const state = createGame({ seed: 621337, firstName: 'Jamie', surname: 'Fame', gender: 'male' });
  Object.assign(state, { age, conditions: [], effects: [], maturityAge: 18, height: age < 18 ? 62 : 68,
    adultHeight: age < 18 ? null : 68, growthAnchor: null, fame: null,
    education: { status: age < 18 ? 'school' : 'workforce', years: 0 },
    jobOffers: age < 18 ? [] : JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id) });
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
    person.conditions = [];
  }
  for (const parent of state.parents) { parent.age = Math.max(parent.age, age + 25); parent.lifestyle = 4; parent.career.progress = 4; }
  state.stats.social = 10; state.stats.attractiveness = 10;
  state.school = createSchoolRecord({ ...state, age: Math.min(age, 17) });
  state.school.sports = { id: 'soccer', success: 10 };
  state.school.extracurricular = { id: 'chess', success: 10 };
  if (kind) state.fame = { kind, activityId: kind === 'personal' ? null : kind === 'sports' ? 'soccer' : 'chess',
    rating: 5, support: 0, startedAge: Math.min(age, 14) };
  state.focus = { ...defaultFocus(state), work: 1, social: 1, family: 1, self: 1 };
  if (age < 18) { state.focus.sports = 2; state.focus.extracurricular = 2; }
  else if (kind && kind !== 'personal') state.focus[kind] = 3;
  state.lifestyle = age < 18 ? householdLifestyle(state) : 1;
  assert.equal(validateSave(state), true, `valid age-${age} ${kind || 'ordinary'} fixture`);
  return state;
}
function queued(state, eventId, choiceSource) {
  state.pendingEvents = [{ eventId, age: state.age, ...(choiceSource ? { fameActivityId: choiceSource } : {}) }];
  state.lastYearEvents = [eventId];
  return state;
}
function reloadUnchanged(state) {
  const before = copy(state), encoded = JSON.stringify(state);
  assert.equal(validateSave(state), true);
  const restored = migrateSave(JSON.parse(encoded));
  assert.deepEqual(restored, before);
  assert.deepEqual(state, before, 'validation and reload preserve the input, history and RNG');
  return restored;
}
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
    const choice = event.fameKind ? 'decline' : event.choices[0].id;
    assert.equal(resolveEventChoice(state, choice, event.id, pending.subjectId).ok, true);
  }
}
function rolledYear(original, predicate, options = steady, limit = 2500) {
  for (let attempt = 0; attempt < limit; attempt++) {
    const before = copy(original);
    before.rng = (original.rng + Math.imul(attempt, 2654435761)) >>> 0;
    const state = copy(before), result = advanceYear(state, options);
    assert.equal(result.ok, true, result.reason);
    if (predicate(state)) return { before, after: state };
  }
  assert.fail('No seeded year met the integration fixture condition');
}

test('fame invitations persist, decline without a draw, and start exactly one reproducible route without rerating skills', () => {
  for (const kind of ['sports', 'extracurricular', 'personal']) {
    const source = kind === 'personal' ? undefined : kind === 'sports' ? 'soccer' : 'chess';
    const original = queued(fixture(), `fame_${kind}_offer`, source);
    const restored = reloadUnchanged(original), declined = copy(restored);
    assert.equal(resolveEventChoice(declined, 'decline', original.pendingEvents[0].eventId).ok, true);
    assert.equal(declined.fame, null); assert.equal(declined.rng, original.rng);
    assert.deepEqual(declined.stats, original.stats); assert.deepEqual(declined.aptitudes, original.aptitudes);
    assert.equal(declined.pendingEvents.length, 0); reloadUnchanged(declined);
    const accepted = copy(restored), repeated = copy(restored);
    for (const state of [accepted, repeated]) assert.equal(resolveEventChoice(state, 'pursue', original.pendingEvents[0].eventId).ok, true);
    assert.deepEqual(accepted, repeated, 'the same saved invitation produces the same initial fame and RNG');
    assert.deepEqual(Object.keys(accepted.fame).sort(), ['activityId', 'kind', 'rating', 'startedAge', 'support']);
    assert.equal(accepted.fame.kind, kind); assert.equal(accepted.fame.activityId, source ?? null);
    assert.equal(accepted.fame.startedAge, accepted.age); assert.equal(accepted.fame.support, 0);
    assert.ok(accepted.fame.rating >= 0 && accepted.fame.rating <= 10);
    assert.equal(accepted.fame.rating * 10, Math.round(accepted.fame.rating * 10));
    assert.notEqual(accepted.rng, original.rng, 'acceptance samples the initial rating once');
    assert.deepEqual(accepted.stats, original.stats); assert.deepEqual(accepted.aptitudes, original.aptitudes);
    assert.equal(fameLearningBonus(accepted, 'social'), 5);
    assert.equal(focusLimits(accepted)[kind === 'personal' ? 'self' : kind], kind === 'personal' ? 4 : 3);
    reloadUnchanged(accepted);
    queued(accepted, 'fame_personal_offer');
    const before = copy(accepted);
    assert.equal(resolveEventChoice(accepted, 'pursue', 'fame_personal_offer').ok, false);
    assert.deepEqual(accepted, before, 'another invitation cannot replace or reroll the active route');
  }
});

test('actual yearly rolls offer every fame route while respecting activity eligibility, one invitation and the shared cap', () => {
  const original = fixture(), before = copy(original), odds = eventOdds(original);
  for (const [id, chance] of [['fame_sports_offer', .2], ['fame_extracurricular_offer', .2], ['fame_personal_offer', .05]]) {
    assert.equal(odds.find(event => event.id === id).chance, chance);
  }
  assert.deepEqual(original, before);
  const paused = copy(original); paused.school.sports.id = 'lacrosse'; paused.lifestyle = 6;
  assert.equal(eventOdds(paused).find(event => event.id === 'fame_sports_offer').chance, 0, 'the engine applies catalog Lifestyle eligibility');
  const seen = new Set(); let fullYears = 0;
  for (let attempt = 0; attempt < 500; attempt++) {
    const state = copy(original); state.rng = (original.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(state, steady).ok, true);
    const invites = state.pendingEvents.filter(event => invitationIds.includes(event.eventId));
    assert.ok(invites.length <= 1); assert.ok(state.lastYearEvents.length <= 5);
    if (state.lastYearEvents.length === 5) fullYears++;
    for (const invitation of invites) {
      seen.add(invitation.eventId);
      assert.ok(state.lastYearEvents.includes(invitation.eventId));
      assert.equal(invitation.fameActivityId, invitation.eventId === 'fame_personal_offer' ? undefined : invitation.eventId === 'fame_sports_offer' ? 'soccer' : 'chess');
      reloadUnchanged(state);
    }
    if (attempt >= 99 && seen.size === 3 && fullYears) break;
  }
  assert.deepEqual([...seen].sort(), [...invitationIds].sort());
  assert.ok(fullYears > 0, 'invitations compete in years that reach the ordinary event maximum');
  const famous = fixture(15, 'sports');
  const famousOdds = eventOdds(famous);
  assert.ok(famousOdds.filter(event => invitationIds.includes(event.id)).every(event => event.chance === 0));
  assert.ok(famousOdds.some(event => event.id === 'fame_youth_clinic' && event.chance > 0));
});

test('an age-seventeen activity invitation survives the birthday and keeps its source progressing through adulthood', () => {
  const branch = rolledYear(fixture(17), state => state.pendingEvents.some(event => event.eventId === 'fame_sports_offer'));
  let state = reloadUnchanged(branch.after);
  assert.equal(state.age, 18); assert.equal(state.focus.sports, undefined);
  while (state.pendingEvents[0].eventId !== 'fame_sports_offer') {
    const pending = state.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
  }
  assert.equal(state.pendingEvents[0].fameActivityId, 'soccer');
  assert.equal(resolveEventChoice(state, 'pursue', 'fame_sports_offer').ok, true);
  finishChoices(state);
  assert.equal(state.fame.startedAge, 18); assert.equal(state.focus.sports, 0);
  assert.equal(state.school.sports.id, 'soccer'); assert.equal(focusLimits(state).sports, 3);
  assert.equal(chooseEducation(state, 'work').ok, true);
  state.conditions = []; state.effects = [];
  state.stats.strength = 5; state.stats.social = 5; state.school.sports.success = 5;
  state.fame.rating = 5; state.fame.support = 0;
  for (const key of ['work', 'social', 'family', 'self']) assert.equal(setFocus(state, key, 1).ok, true);
  assert.equal(setFocus(state, 'sports', 3).ok, true);
  assert.equal(focusBudget(state), 8); reloadUnchanged(state);
  const schoolReport = { gpa: state.school.gpa, reportedAge: state.school.reportedAge };
  state = rolledYear(state, candidate => candidate.lastYearEvents.length === 0).after;
  assert.equal(state.age, 19); assert.equal(state.focus.sports, 3);
  assert.equal(state.school.sports.success, 6.2); assert.equal(state.fame.rating, 6.2);
  assert.deepEqual({ gpa: state.school.gpa, reportedAge: state.school.reportedAge }, schoolReport, 'adult activity practice does not rewrite the final school report');
  assert.ok(state.yearSummary.decisions.fame); reloadUnchanged(state);
});

test('fame forecasts preserve saves and low or high fame can end only after the current year receives its learning bonus', () => {
  for (const rating of [0, 10]) {
    const original = fixture(25, 'sports');
    original.stats.social = 5; original.school.sports.success = 5; original.fame.rating = rating;
    const before = copy(original), forecast = annualForecast(original);
    assert.deepEqual(annualForecast(original), forecast);
    assert.deepEqual(original, before, 'maintenance previews cannot consume RNG or roll the end of fame');
    assert.notEqual(forecast.fame.after, null);
    const kept = rolledYear(original, candidate => candidate.lastYearEvents.length === 0);
    const lost = copy(kept.before);
    assert.equal(advanceYear(lost, { ...steady, fameRandom: () => 0 }).ok, true);
    assert.equal(kept.after.fame === null, false, 'a supplied keep roll protects even zero starting fame');
    assert.equal(lost.fame, null, 'a supplied loss roll can end even maximum starting fame');
    assert.equal(lost.focus.sports, undefined); assert.equal(focusLimits(lost).sports, undefined);
    assert.deepEqual(lost.stats, kept.after.stats, 'the year develops with the same fame learning before the loss');
    assert.deepEqual(lost.aptitudes, original.aptitudes, 'temporary fame learning never rewrites inherited aptitude');
    assert.deepEqual(kept.after.yearSummary.stats, forecast.stats);
    assert.ok(lost.yearSummary.decisions.fame, 'recorded three-point adult decisions retain their fame context after loss');
    reloadUnchanged(kept.after); reloadUnchanged(lost);
  }
});

test('quitting, switching or leaving the famous activity removes only its extra capacity and respects real legacy caps', () => {
  const original = fixture(15, 'sports'); original.focus.sports = 3;
  for (const operation of ['quit', 'leave', 'switch']) {
    const state = copy(original); state.school.offers.sports = ['tennis'];
    const stats = copy(state.stats), aptitudes = copy(state.aptitudes);
    const result = operation === 'quit' ? quitFame(state) : operation === 'leave'
      ? leaveSchoolActivity(state, 'sports') : enrollSchoolActivity(state, 'sports', 'tennis');
    assert.equal(result.ok, true); assert.equal(state.fame, null);
    assert.equal(state.focus.sports, operation === 'leave' ? 0 : 2);
    assert.deepEqual(state.stats, stats); assert.deepEqual(state.aptitudes, aptitudes);
    if (operation === 'quit') assert.deepEqual(state.school.sports, original.school.sports);
    if (operation === 'leave') assert.equal(state.school.sports, null);
    if (operation === 'switch') assert.deepEqual(state.school.sports, { id: 'tennis', success: null });
    reloadUnchanged(state);
  }
  const blocked = queued(copy(original), 'fame_documentary_request'), before = copy(blocked);
  assert.equal(quitFame(blocked).ok, false); assert.deepEqual(blocked, before);
  for (const age of [15, 25]) {
    const state = fixture(age, 'sports');
    state.effects = [{ id: 'legacy-self-limit', name: 'Saved limit', description: '', years: 1, kind: 'negative', modifiers: {}, focusLimits: { standard: { self: 4 } } }];
    assert.equal(focusLimits(state).sports, 3, 'an inert old Yourself maximum cannot remove the fame point');
    state.effects[0].focusLimits.standard.self = 2;
    assert.equal(focusLimits(state).sports, 1, 'genuine legacy physical restrictions still constrain famous sports');
  }
});

test('fame support benefits a child household without compounding or rewriting parent resources and reverses on exit', () => {
  const state = fixture(15, 'personal'); state.fame.rating = 8; state.fame.support = .5;
  state.lifestyle = householdLifestyle(state);
  const before = copy(state), parents = state.parents.map(parent => parent.lifestyle);
  assert.equal(state.lifestyle, 5.5);
  for (let count = 0; count < 10; count++) {
    assert.equal(householdLifestyle(state), 5.5);
    assert.deepEqual(state.parents.map(parent => familyLifestyle(state, parent)), [5.5, 5.5]);
    annualForecast(state);
  }
  assert.deepEqual(state, before);
  for (let count = 0; count < 4; count++) {
    queued(state, 'fame_campaign_contract');
    const rng = state.rng;
    assert.equal(resolveEventChoice(state, 'travel', 'fame_campaign_contract').ok, true);
    assert.equal(state.lifestyle, Math.round((4 + fameLifestyleBonus(state)) * 100) / 100);
    assert.deepEqual(state.parents.map(parent => parent.lifestyle), parents, 'support never becomes a new parent resource baseline');
    assert.equal(state.rng, rng, 'authored support changes do not reroll fame'); reloadUnchanged(state);
  }
  assert.equal(state.fame.support, 2); assert.equal(state.lifestyle, 7);
  const stats = copy(state.stats);
  assert.equal(quitFame(state).ok, true);
  assert.equal(state.lifestyle, 4); assert.deepEqual(state.parents.map(parent => familyLifestyle(state, parent)), [4, 4]);
  assert.deepEqual(state.stats, stats); reloadUnchanged(state);
});

test('optional fame saves round-trip unchanged, malformed records are rejected, and heirs begin without a public profile', () => {
  const ordinary = createGame({ seed: 71231 });
  for (const omitted of [false, true]) {
    const old = copy(ordinary); if (omitted) delete old.fame;
    assert.deepEqual(reloadUnchanged(old), old, 'schema-twenty saves do not acquire fame fields during load');
  }
  const famous = fixture(15, 'sports'); reloadUnchanged(famous);
  for (const mutate of [
    state => { state.fame.kind = 'unknown'; }, state => { state.fame.activityId = 'unknown'; },
    state => { state.fame.rating = -.1; }, state => { state.fame.rating = 10.1; }, state => { state.fame.rating = 5.55; },
    state => { state.fame.support = -2.1; }, state => { state.fame.support = 2.1; },
    state => { state.fame.startedAge = 16; }, state => { state.fame.startedAge = -1; },
    state => { state.fame.extra = true; }, state => { delete state.fame.support; },
  ]) {
    const malformed = copy(famous); mutate(malformed);
    const before = copy(malformed);
    assert.equal(validateSave(malformed), false); assert.equal(migrateSave(malformed), null);
    assert.deepEqual(malformed, before);
  }
  const elder = fixture(65, 'sports');
  assert.equal(haveChild(elder).ok, true);
  const heir = copy(elder.children[0]);
  assert.equal(successionInfo(elder).eligible, true);
  assert.equal(succeed(elder, heir.id).ok, true);
  assert.equal(elder.fame, null); assert.equal(elder.focus.sports, undefined); assert.equal(elder.school, null);
  assert.deepEqual(elder.aptitudes, heir.aptitudes); assert.deepEqual(elder.stats, heir.stats);
  assert.equal(fameLearningBonus(elder, 'social'), 0); reloadUnchanged(elder);
});

test('switching away from a famous source checks the new activity against household support after fame ends', () => {
  const state = fixture(15, 'sports');
  state.fame.rating = 10;
  state.focus.sports = 3;
  state.school.offers.sports = ['lacrosse'];
  for (const parent of state.parents) { parent.lifestyle = 5; parent.career.progress = 5; }
  state.lifestyle = householdLifestyle(state);
  assert.equal(state.lifestyle, 7);
  reloadUnchanged(state);
  const before = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'lacrosse').ok, false, 'lost sponsorship cannot pay the new activity requirement');
  assert.deepEqual(state, before, 'a refused switch preserves fame, enrollment, focus, history and RNG');
  for (const parent of state.parents) { parent.lifestyle = 7; parent.career.progress = 7; }
  state.lifestyle = householdLifestyle(state);
  const rng = state.rng;
  assert.equal(enrollSchoolActivity(state, 'sports', 'lacrosse').ok, true, 'independent household resources support the switch');
  assert.equal(state.fame, null);
  assert.equal(state.lifestyle, 7);
  assert.deepEqual(state.school.sports, { id: 'lacrosse', success: null });
  assert.equal(state.focus.sports, 2);
  assert.equal(state.rng, rng);
  reloadUnchanged(state);
});

test('ending fame removes support for a child without caregivers while preserving the ordinary legacy fallback', () => {
  const state = fixture(15, 'sports');
  state.parents = []; state.guardian = null; state.money = 375000; state.income = 0;
  state.fame.rating = 10;
  state.school.offers.sports = ['lacrosse'];
  state.lifestyle = householdLifestyle(state);
  assert.equal(state.lifestyle, 7);
  assert.equal(householdLifestyle(state, false), 5);
  const before = copy(state);
  assert.equal(enrollSchoolActivity(state, 'sports', 'lacrosse').ok, false);
  assert.deepEqual(state, before, 'switching cannot retain the departing fame support as a fallback');
  assert.equal(quitFame(state).ok, true);
  assert.equal(state.lifestyle, 5, 'resource support remains, temporary fame support ends');
  reloadUnchanged(state);
  const deceased = copy(before);
  assert.equal(advanceYear(deceased, { ...steady, mortalityRandom: () => 0 }).ok, true);
  assert.equal(deceased.alive, false);
  assert.equal(deceased.fame, null);
  assert.equal(deceased.lifestyle, 5, 'death also ends temporary support without retaining it as the fallback');
  assert.equal(deceased.yearSummary.fame.after, null);
  assert.equal(deceased.yearSummary.lifestyle.before, 7);
  assert.equal(deceased.yearSummary.lifestyle.after, 5, 'the final review records the support ending');
  reloadUnchanged(deceased);
  const ordinary = fixture(15, null);
  ordinary.parents = []; ordinary.guardian = null; ordinary.lifestyle = 6;
  assert.equal(householdLifestyle(ordinary), 6);
  assert.equal(householdLifestyle(ordinary, false), 6, 'ordinary legacy household support is not recomputed from savings');
});
