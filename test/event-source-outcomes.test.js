import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, annualForecast, resolveEventChoice, effectiveStats, validateSave, migrateSave, JOBS, EVENTS } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const definition = id => EVENTS.find(event => event.id === id);

function fixture(age = 10, seed = 78501) {
  const state = createGame({ seed, firstName: 'Alex', surname: 'Reed' });
  Object.assign(state, { age, conditions: [], effects: [], focus: defaultFocus(age), lifestyle: 5,
    height: age < 18 ? 52 : 67, adultHeight: age < 18 ? null : 67, maturityAge: 18 });
  for (const person of [state, ...state.parents]) {
    person.conditions = [];
    for (const key in person.stats) person.stats[key] = 5;
    for (const key in person.aptitudes) person.aptitudes[key] = 0;
  }
  for (const parent of state.parents) {
    parent.age = 40; parent.relationship = 5; parent.lifestyle = 5; parent.career.progress = 5;
  }
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  if (age >= 18) {
    state.education = { status: 'workforce', years: 0 };
    state.jobOffers = JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id);
  }
  return state;
}

function queue(state, id, subject, cause) {
  state.pendingEvents = [{ eventId: id, age: state.age,
    ...(subject ? { subjectType: definition(id).subjectType, subjectId: subject.id } : {}),
    ...(cause === undefined ? {} : { cause }) }];
  state.lastYearEvents = [subject ? `${id}:${subject.id}` : id];
  assert.equal(validateSave(state), true, 'the recorded decision remains a valid save');
}

test('an actual Dad relationship-driven event preserves his source ratings while changing the player', () => {
  const original = fixture(), dad = original.parents.find(parent => parent.parentRole === 'dad');
  dad.relationship = 9; dad.stats.creativity = 9;
  const event = definition('household_parent_stories'), key = `${event.id}:${dad.id}`;
  const forecast = annualForecast(original);
  let result;
  for (let attempt = 1; attempt <= 2000; attempt++) {
    const candidate = copy(original);
    candidate.rng = Math.imul(attempt, 2654435761) >>> 0;
    assert.equal(advanceYear(candidate, steady).ok, true);
    if (candidate.lastYearEvents.length === 1 && candidate.lastYearEvents[0] === key) { result = candidate; break; }
  }
  assert.ok(result, 'the Dad event occurs in actual isolated yearly rolls');
  const afterDad = result.parents.find(parent => parent.id === dad.id);
  assert.equal(afterDad.relationship, forecast.parents.find(parent => parent.id === dad.id).relationship.after);
  assert.equal(afterDad.stats.creativity, dad.stats.creativity);
  assert.equal(result.stats.creativity, changedRating(forecast.stats.creativity.after, .2), 'Dad’s Creativity can still help the player’s Creativity');
  assert.equal(result.stats.intelligence, changedRating(forecast.stats.intelligence.after, .2));
  const entry = result.history.find(entry => entry.title === `${dad.name}: ${event.name}`);
  assert.match(entry.cause, /high Creativity.*high Relationship with you/);
  assert.doesNotMatch(entry.text, /Relationship|Mental stability/);
  assert.match(entry.text, /Your intelligence.*Your creativity/);
  assert.deepEqual(migrateSave(copy(result)), result);
});

test('pending family choices protect the source owner at low, neutral and changed ratings while preserving cross-person gains', () => {
  for (const [rating, savedCause] of [[2.3, undefined], [5, undefined], [9.5, "Morgan Vale's low Intelligence (2.3/10) contributed to this event (start-of-year ratings)."]]) {
    const state = fixture(30), partner = fixture(30, 78502);
    Object.assign(partner, { name: 'Morgan Vale', familyName: 'Vale', relationship: 5, yearsTogether: 3, married: false, lastProposalAge: -1 });
    partner.stats.intelligence = rating; state.partner = partner;
    queue(state, 'household_partner_offer', partner, savedCause);
    const before = copy(state);
    assert.deepEqual(migrateSave(copy(state)), before);
    assert.equal(resolveEventChoice(state, 'review', 'household_partner_offer', partner.id).ok, true);
    assert.equal(partner.stats.intelligence, rating);
    assert.equal(state.stats.intelligence, changedRating(before.stats.intelligence, .15));
    assert.equal(partner.relationship, 5.2, 'a relationship unrelated to this source remains an allowed consequence');
    assert.equal(state.rng, before.rng);
    assert.doesNotMatch(state.history[0].text, /Morgan Vale: Intelligence/);
    assert.match(state.history[0].text, /Your intelligence/);
    assert.equal(state.history[0].cause, savedCause);
    assert.deepEqual(migrateSave(copy(state)), state);
  }
});

test('a seeded abandonment keeps a positive causal relationship while preserving departure and other-person consequences', () => {
  const original = fixture(), dad = original.parents.find(parent => parent.parentRole === 'dad');
  const remaining = original.parents.find(parent => parent.id !== dad.id);
  dad.stats.stability = 0; dad.relationship = 3;
  remaining.stats.stability = 8; remaining.relationship = 8;
  const forecast = annualForecast(original), event = definition('household_parent_abandonment');
  const key = `${event.id}:${dad.id}`;
  let result;
  for (let attempt = 1; attempt <= 5000; attempt++) {
    const candidate = copy(original);
    candidate.rng = Math.imul(attempt, 2654435761) >>> 0;
    assert.equal(advanceYear(candidate, steady).ok, true);
    if (candidate.lastYearEvents.length === 1 && candidate.lastYearEvents[0] === key) { result = candidate; break; }
  }
  assert.ok(result, 'an isolated departure actually rolls with a positive starting relationship');
  const departed = result.parents.find(parent => parent.id === dad.id);
  const caregiver = result.parents.find(parent => parent.id === remaining.id);
  assert.equal(departed.abandonedAt, original.age + 1);
  assert.equal(departed.relationship, 3);
  assert.equal(departed.stats.stability, forecast.parents.find(parent => parent.id === dad.id).stability.after);
  assert.equal(result.stats.stability, changedRating(forecast.stats.stability.after, -3));
  assert.equal(result.stats.social, changedRating(forecast.stats.social.after, -1.5));
  assert.equal(caregiver.stats.stability, changedRating(forecast.parents.find(parent => parent.id === caregiver.id).stability.after, -3));
  const entry = result.history.find(entry => entry.title === `${dad.name}: ${event.name}`);
  assert.match(entry.cause, /low Mental stability.*low Relationship with you/);
  assert.doesNotMatch(entry.text, /Relationship/);
  assert.match(entry.text, /Your mental stability/);
  assert.deepEqual(migrateSave(copy(result)), result);
});

test('personal source stats stay unchanged without relying on optional or historical cause prose', () => {
  for (const [rating, savedCause] of [[2.3, undefined], [5, undefined], [9.5, 'Your low Intelligence (2.3/10) contributed to this event (start-of-year ratings).']]) {
    const state = fixture(30); state.stats.intelligence = rating;
    queue(state, 'investment_pitch', null, savedCause);
    const before = copy(state);
    assert.equal(resolveEventChoice(state, 'accept', 'investment_pitch').ok, true);
    assert.equal(state.stats.intelligence, rating);
    assert.equal(state.stats.stability, changedRating(before.stats.stability, -.4), 'the separate mental consequence is retained');
    assert.equal(state.rng, before.rng);
    assert.doesNotMatch(state.history[0].text, /intelligence/i);
    assert.match(state.history[0].text, /mental stability/);
    assert.equal(state.history[0].cause, savedCause);
  }
});

test('a fame-dependent choice retains practice and support without directly changing its Fame source', () => {
  const state = fixture(30);
  state.fame = { kind: 'personal', activityId: null, rating: 8, support: 0, startedAge: 13 };
  queue(state, 'fame_campaign_contract');
  const before = copy(state);
  assert.equal(resolveEventChoice(state, 'travel', 'fame_campaign_contract').ok, true);
  assert.equal(state.fame.rating, before.fame.rating);
  assert.equal(state.fame.support, .6);
  assert.equal(state.stats.social, changedRating(before.stats.social, .2));
  assert.equal(state.stats.health, changedRating(before.stats.health, -.2));
  assert.equal(state.rng, before.rng);
  assert.doesNotMatch(state.history[0].text, /Fame \d/);
  assert.match(state.history[0].text, /Your social.*Your health/);
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('old same-stat rewards and active modifiers survive unchanged loads while newly resolved choices use current outcomes', () => {
  const state = fixture();
  assert.equal(advanceYear(state, steady).ok, true);
  state.stats.social = 6.4;
  const event = definition('school_speech');
  state.effects = [{ id: event.id, name: event.name, description: 'An old saved reward.', years: 2, modifiers: { social: .5 }, kind: 'positive' }];
  const cause = 'Your high Social (6.0/10) contributed to this event (start-of-year ratings).';
  const historical = { title: event.name, text: 'Your social 6 → 6.4.', description: event.description, cause, kind: 'positive' };
  state.history.unshift({ id: 'old-same-stat-reward', age: state.age, generation: state.generation, ...historical });
  state.yearSummary.events = [copy(historical)];
  const summary = state.yearSummary.stats.social;
  summary.after = effectiveStats(state).social;
  summary.change = Math.round((summary.after - summary.before) * 100) / 100;
  queue(state, event.id, null, cause);
  const before = copy(state), loaded = migrateSave(copy(state));
  assert.deepEqual(loaded, before);
  assert.deepEqual(migrateSave(copy(loaded)), before);
  assert.equal(effectiveStats(loaded).social, 6.9);
  assert.equal(resolveEventChoice(loaded, 'speak', event.id).ok, true);
  assert.equal(loaded.stats.social, 6.4);
  assert.equal(effectiveStats(loaded).social, 6.9);
  assert.deepEqual(loaded.effects, before.effects);
  assert.equal(loaded.rng, before.rng);
  assert.deepEqual(loaded.history.find(entry => entry.id === 'old-same-stat-reward'), before.history.find(entry => entry.id === 'old-same-stat-reward'));
  assert.ok(loaded.yearSummary.events.some(entry => entry.text === historical.text && entry.cause === cause));
  assert.match(loaded.history[0].text, /No additional effects/);
  assert.doesNotMatch(loaded.history[0].text, /social/i);
  assert.deepEqual(migrateSave(copy(loaded)), loaded);
});
