import test from 'node:test';
import assert from 'node:assert/strict';
import { eventStatCause } from '../event-causes.js';
import { EVENTS, JOBS, createGame, advanceYear, effectiveStats, resolveEventChoice, validateSave, migrateSave, chooseEducation } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const labels = { health: 'Health', stability: 'Mental stability', attractiveness: 'Attractiveness', intelligence: 'Intelligence', strength: 'Strength', social: 'Social', creativity: 'Creativity', lifestyle: 'Lifestyle' };
function fixture(age = 3) {
  const state = createGame({ seed: 65012 });
  state.age = age;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.lifestyle = 5;
  for (const person of [state, ...state.parents]) {
    person.conditions = [];
    for (const key in person.stats) person.stats[key] = 5;
    for (const key in person.aptitudes) person.aptitudes[key] = 0;
  }
  for (const parent of state.parents) { parent.age = 50; parent.relationship = 7; parent.lifestyle = 5; parent.career.progress = 5; }
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  if (age >= 18) {
    state.adultHeight = state.height;
    state.education = { status: 'undecided', years: 0 };
    assert.equal(chooseEducation(state, 'work').ok, true);
    state.jobOffers = ['retail', ...JOBS.filter(job => !job.requiresCollege && job.id !== 'retail').slice(0, 9).map(job => job.id)];
  }
  return state;
}
function rolled(original, eventId, subjectId = '', forceEligibleRolls = false) {
  const id = subjectId ? `${eventId}:${subjectId}` : eventId;
  for (let index = 1; index <= 2000; index++) {
    const state = copy(original);
    state.rng = Math.imul(index, 2654435761) >>> 0;
    assert.equal(advanceYear(state, { ...steady, ...(forceEligibleRolls ? { eventRandom: () => 0 } : {}) }).ok, true);
    if (state.lastYearEvents.includes(id)) return state;
  }
  assert.fail(`No actual seeded roll for ${id}`);
}
function resolveThrough(state, eventId, subjectId = '') {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, pending.eventId, pending.subjectId || '').ok, true);
    if (pending.eventId === eventId && (pending.subjectId || '') === subjectId) return;
  }
  assert.fail(`No pending choice ${eventId}`);
}
function stripCauses(value) {
  if (!value || typeof value !== 'object') return value;
  // Death records have their own unrelated cause field.
  if (Object.hasOwn(value, 'title') || Object.hasOwn(value, 'eventId')) delete value.cause;
  for (const item of Object.values(value)) stripCauses(item);
  return value;
}

test('cause prose covers every rated stat with the supporting direction and displayed precision', () => {
  for (const [key, label] of Object.entries(labels)) for (const [direction, value, shown] of [['low', 2.34, '2.3'], ['high', 8.26, '8.3']]) {
    const event = { statFactors: [[key, direction]] }, person = { stats: { [key]: value }, lifestyle: value };
    const before = copy([event, person]);
    assert.equal(eventStatCause(event, person, { [key]: value }), `Your ${direction} ${label} (${shown}/10) contributed to this event (start-of-year ratings).`);
    assert.deepEqual([event, person], before, 'formatting is pure');
  }
});

test('causes omit neutral, opposite-direction, unknown, and unrelated outcome ratings', () => {
  for (const direction of ['low', 'high']) {
    for (const value of [4.96, 5, 5.04, direction === 'low' ? 8 : 2, NaN, undefined]) {
      assert.equal(eventStatCause({ statFactors: [['intelligence', direction]] }, { stats: { intelligence: value } }), '');
    }
  }
  assert.equal(eventStatCause({ statChanges: { intelligence: 1 }, focusFactors: ['family'] }, { stats: { intelligence: 1 } }), '');
  assert.equal(eventStatCause({ statFactors: [['unknown', 'low']] }, { stats: { unknown: 1 } }), '');
  assert.equal(eventStatCause({}, { stats: { health: 1 } }), '');
});

test('multiple causes deduplicate gates and factors, retaining only supported directions', () => {
  const event = { statFactors: [['intelligence', 'low'], ['intelligence', 'low'], ['stability', 'low'], ['social', 'high'], ['health', 'low']],
    maxStats: { intelligence: 4 }, maxStability: 4 };
  const cause = eventStatCause(event, { stats: { intelligence: 2.3, stability: 3.1, social: 8.2, health: 8 } });
  for (const text of ['low Intelligence (2.3/10)', 'low Mental stability (3.1/10)', 'high Social (8.2/10)']) assert.equal(cause.split(text).length - 1, 1);
  assert.doesNotMatch(cause, /Health/);
  assert.match(eventStatCause({ maxStats: { intelligence: 4 } }, { stats: { intelligence: 2 } }), /low Intelligence \(2.0\/10\)/);
  assert.match(eventStatCause({ minStability: 7 }, { stats: { stability: 8 } }), /high Mental stability \(8.0\/10\)/);
  assert.match(eventStatCause({ maxStability: 4 }, { stats: { stability: 2 } }), /low Mental stability \(2.0\/10\)/);
});

test('rare events identify their source rating without claiming their target outcome caused them', () => {
  const event = EVENTS.find(event => event.rare && event.statFactors?.[0]?.[1] === 'high');
  assert.ok(event);
  const [source] = event.statFactors[0], target = Object.keys(event.aptitudeChanges)[0];
  const cause = eventStatCause(event, { stats: { [source]: 9, [target]: 1 } });
  assert.match(cause, new RegExp(`high ${labels[source]}`));
  assert.ok(!cause.includes(labels[target]), 'the resulting affinity change is not presented as a cause');
});

test('family causes use the named person and their own relationship, including abandonment', () => {
  for (const subjectType of ['parent', 'partner', 'child']) {
    const person = { name: 'Alex Reed', stats: { stability: 2.3 }, relationship: 8.2 };
    const cause = eventStatCause({ subjectType, statFactors: [['stability', 'low']], relationshipFactor: 'high' }, person);
    assert.ok(cause.startsWith('Alex Reed'));
    assert.match(cause, /low Mental stability \(2.3\/10\)/);
    assert.match(cause, /high Relationship with you \(8.2\/10\)/);
    assert.doesNotMatch(cause, /^Your /);
  }
  const abandoned = eventStatCause(EVENTS.find(event => event.id === 'household_parent_abandonment'), { name: 'Alex Reed', stats: { stability: 2.3 }, relationship: 1.2 });
  assert.match(abandoned, /low Mental stability \(2.3\/10\)/);
  assert.match(abandoned, /low Relationship with you \(1.2\/10\)/);
  const abandonment = EVENTS.find(event => event.id === 'household_parent_abandonment');
  for (const [stability, relationship] of [[2.3, 10], [10, 1.2]]) {
    assert.equal(eventStatCause(abandonment, { name: 'Alex Reed', stats: { stability }, relationship }), '', 'the fixed floor alone does not establish a stat contribution');
  }
});

test('automatic events record starting effective ratings before routine growth and expiring modifiers', () => {
  const original = fixture();
  original.stats.health = 3;
  original.focus.social = 0; original.focus.self = 4;
  original.effects = [{ id: 'saved-health-penalty', name: 'Saved penalty', description: 'A saved modifier.', years: 1, modifiers: { health: -.7 }, kind: 'negative' }];
  const event = EVENTS.find(event => event.id === 'illness');
  const expected = eventStatCause(event, original, effectiveStats(original));
  assert.match(expected, /2.3\/10/);
  const result = rolled(original, event.id);
  assert.equal(result.effects.some(effect => effect.id === 'saved-health-penalty'), false);
  assert.notEqual(result.stats.health, 2.3);
  const history = result.history.find(entry => entry.title === event.name);
  const review = result.yearSummary.events.find(entry => entry.title === event.name);
  assert.equal(history.cause, expected);
  assert.equal(review.cause, expected);
  assert.equal(validateSave(result), true);
  assert.deepEqual(migrateSave(copy(result)), result);
});

test('player Lifestyle causes use the starting household rating even when annual careers change it', () => {
  const original = fixture();
  original.lifestyle = 1.23;
  for (const parent of original.parents) { parent.lifestyle = 1.23; parent.career.progress = 1.23; }
  const event = EVENTS.find(event => event.id === 'low_stat_missed_playgroup');
  const result = rolled(original, event.id);
  const cause = result.history.find(entry => entry.title === event.name).cause;
  assert.match(cause, /low Lifestyle \(1.2\/10\)/);
  assert.notEqual(result.lifestyle, original.lifestyle);
});

test('actual parent, guardian, partner and child events capture the named relative ratings', () => {
  for (const role of ['parent', 'guardian', 'partner', 'child']) {
    const original = fixture(['partner', 'child'].includes(role) ? 30 : 8);
    let person, eventId;
    if (role === 'parent') person = original.parents[0];
    if (role === 'guardian') {
      person = { ...copy(original.parents[0]), id: 'cause-guardian', guardianRole: 'aunt', adoptedAt: 2 };
      original.guardian = person;
      for (const parent of original.parents) parent.abandonedAt = 2;
    }
    if (role === 'partner') {
      person = { ...copy(original.parents[0]), id: 'cause-partner', age: 30, married: true, yearsTogether: 3, lastProposalAge: -1 };
      original.partner = person;
    }
    if (role === 'child') {
      person = { ...copy(original.parents[0]), id: 'cause-child', age: 8, money: 0 };
      original.children = [person];
    }
    const stat = ['parent', 'guardian'].includes(role) ? 'stability' : 'health';
    // Keep the same low-stat causes and actor ownership, using incidents that
    // still have a consequence after empty legacy definitions were retired.
    eventId = ['parent', 'guardian'].includes(role) ? 'household_parent_missed_pickup'
      : role === 'partner' ? 'life_partner_health_intelligence_setback' : 'life_child_health_intelligence_setback';
    person.stats[stat] = 2.3;
    original.stats[stat] = 9;
    const event = EVENTS.find(event => event.id === eventId), expected = eventStatCause(event, person);
    // Supplemental replacements are deliberately rare. Exercise their actual
    // selection/capture path with successful eligible rolls, keeping the seeded
    // shuffle and shared five-event limit rather than increasing probabilities.
    const result = rolled(original, eventId, person.id, true);
    const entry = result.history.find(entry => entry.title === `${person.name}: ${event.name}`);
    assert.equal(entry.cause, expected, role);
    assert.ok(entry.cause.startsWith(person.name));
    assert.match(entry.cause, /2.3\/10/);
    assert.doesNotMatch(entry.cause, /9.0\/10/);
    assert.equal(validateSave(result), true, `${role} result remains a valid save`);
    assert.deepEqual(migrateSave(copy(result)), result);
  }
});

function pendingFixture() {
  const original = fixture(8);
  original.stats.stability = 2.34;
  const result = rolled(original, 'child_argument');
  assert.ok(result.pendingEvents.some(entry => entry.eventId === 'child_argument'));
  return result;
}

test('pending causes survive reload and resolve with the original rating after later changes', () => {
  const result = pendingFixture(), event = EVENTS.find(event => event.id === 'child_argument');
  const cause = result.pendingEvents.find(entry => entry.eventId === event.id).cause;
  assert.match(cause, /low Mental stability \(2.3\/10\)/);
  const snapshot = copy(result);
  assert.deepEqual(migrateSave(copy(result)), snapshot);
  result.stats.stability = 9.5;
  const reloaded = migrateSave(copy(result));
  assert.ok(reloaded);
  resolveThrough(reloaded, event.id);
  assert.equal(reloaded.history.find(entry => entry.title === event.name).cause, cause);
  assert.ok(reloaded.yearSummary.events.filter(entry => entry.title === event.name).every(entry => entry.cause === cause));
  assert.equal(validateSave(reloaded), true);
});

test('optional saved causes validate in history, reviews and pending choices without rewriting old records', () => {
  const saved = pendingFixture();
  const locations = [state => state.history[0], state => state.yearSummary.events[0], state => state.pendingEvents[0]];
  for (const locate of locations) {
    for (const cause of [null, 3, {}, [], '', 'x'.repeat(1001)]) {
      const malformed = copy(saved); locate(malformed).cause = cause;
      assert.equal(validateSave(malformed), false, `reject malformed cause ${JSON.stringify(cause).slice(0, 30)}`);
      assert.equal(migrateSave(malformed), null);
    }
    const longest = copy(saved); locate(longest).cause = 'x'.repeat(1000);
    assert.equal(validateSave(longest), true);
    assert.deepEqual(migrateSave(longest), longest);
  }
  const old = stripCauses(copy(saved)), before = copy(old);
  assert.equal(validateSave(old), true);
  assert.deepEqual(migrateSave(old), before, 'loading old entries never fabricates cause text');
  assert.deepEqual(old, before);
});

test('cause metadata does not alter decision outcomes, later rolls or gameplay RNG', () => {
  const withCause = pendingFixture(), withoutCause = stripCauses(copy(withCause));
  while (withCause.pendingEvents.length) {
    const pending = withCause.pendingEvents[0], event = EVENTS.find(event => event.id === pending.eventId);
    for (const state of [withCause, withoutCause]) assert.equal(resolveEventChoice(state, event.choices[0].id, pending.eventId, pending.subjectId || '').ok, true);
    assert.deepEqual(stripCauses(copy(withCause)), stripCauses(copy(withoutCause)));
    assert.equal(withoutCause.history.find(entry => entry.title === event.name).cause, undefined, 'resolving an old pending choice does not invent its historical cause');
  }
  for (const state of [withCause, withoutCause]) assert.equal(advanceYear(state, steady).ok, true);
  assert.deepEqual(stripCauses(copy(withCause)), stripCauses(copy(withoutCause)), 'optional explanations have no simulation effect');
});
