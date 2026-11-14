import { changedLifestyle, incomeForLifestyle, LIFESTYLE_BALANCE, lifestyleFromResources } from '../lifestyle.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, resolveEventChoice, effectiveStats, validateSave, migrateSave, JOBS, EVENTS } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const steady = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const event = id => EVENTS.find(entry => entry.id === id);

function fixture(age = 10, seed = 76101) {
  const state = createGame({ seed, firstName: 'Alex', surname: 'Reed' });
  Object.assign(state, { age, conditions: [], effects: [], maturityAge: 18,
    height: age < 18 ? 52 : 67, adultHeight: age < 18 ? null : 67,
    focus: defaultFocus(age), lifestyle: 5 });
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) person.stats[key] = 5;
    for (const key of Object.keys(person.aptitudes)) person.aptitudes[key] = 0;
  }
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  if (age >= 18) {
    state.parents = [];
    state.education = { status: 'workforce', years: 0 };
    state.jobOffers = JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id);
  }
  return state;
}

function addRelative(state, type, age, seed = 76102) {
  const person = fixture(age, seed);
  Object.assign(person, { relationship: 5, yearsTogether: 3, married: false, lastProposalAge: -1 });
  if (type === 'partner') state.partner = person;
  else state.children.push(person);
  return person;
}

function queue(state, id, subject) {
  state.pendingEvents = [{ eventId: id, age: state.age,
    ...(subject ? { subjectType: event(id).subjectType, subjectId: subject.id } : {}) }];
  state.lastYearEvents = [subject ? `${id}:${subject.id}` : id];
  assert.equal(validateSave(state), true, `${id} fixture is a valid saved decision`);
}

function rolledEntry(original, id, subject) {
  for (let attempt = 1; attempt <= 1000; attempt++) {
    const state = copy(original);
    state.rng = Math.imul(attempt, 2654435761) >>> 0;
    assert.equal(advanceYear(state, steady).ok, true);
    const title = `${subject ? `${subject.name}: ` : ''}${event(id).name}`;
    const entry = state.yearSummary.events.find(memory => memory.title === title);
    if (entry) return entry;
  }
  assert.fail(`${id} should occur in deterministic ordinary yearly rolls`);
}

function assertRecordedGain(entry, stat, amount) {
  const values = entry.text.match(new RegExp(`Your ${stat} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
  assert.ok(values, `${entry.title} records its ${stat} effect`);
  assert.equal(Number(values[2]), changedRating(Number(values[1]), amount));
}

test('ordinary awards and family workshops retain learning and social gains without mental rewards', () => {
  const pupil = fixture();
  pupil.stats.intelligence = 8;
  pupil.stats.creativity = 8;
  const award = rolledEntry(pupil, 'science_prize');
  assertRecordedGain(award, 'social', .2);
  assert.doesNotMatch(award.text, /mental stability|Stability/i);

  const child = fixture(3), parent = child.parents[0];
  const workshop = rolledEntry(child, 'household_parent_cooking', parent);
  assertRecordedGain(workshop, 'intelligence', .15);
  assertRecordedGain(workshop, 'creativity', .2);
  assert.match(workshop.text, /Relationship/);
  assert.doesNotMatch(workshop.text, /mental stability|Stability/i);
});

test('ordinary personal and family choices change practiced skills and relationships rather than mental stability', () => {
  const pupil = fixture();
  queue(pupil, 'school_speech');
  const pupilBefore = copy(pupil);
  assert.equal(resolveEventChoice(pupil, 'speak', 'school_speech').ok, true);
  assert.equal(pupil.stats.social, pupilBefore.stats.social, 'the causal Social rating does not reward itself');
  assert.equal(pupil.stats.stability, pupilBefore.stats.stability);
  assert.equal(pupil.rng, pupilBefore.rng);

  const household = fixture(40), child = addRelative(household, 'child', 10);
  queue(household, 'household_child_school', child);
  const before = copy(household);
  assert.equal(resolveEventChoice(household, 'home', 'household_child_school', child.id).ok, true);
  assert.equal(child.stats.intelligence, before.children[0].stats.intelligence, 'the causal Intelligence rating stays unchanged');
  assert.equal(child.relationship, 5.4);
  assert.equal(child.stats.stability, before.children[0].stats.stability);
  assert.equal(household.stats.stability, before.stats.stability);
  assert.equal(household.rng, before.rng);
  assert.doesNotMatch(household.history[0].text, /mental stability|Stability/i);
  assert.deepEqual(migrateSave(copy(household)), household);
});

test('paid repair help and driving lessons have no hidden material-to-mental penalty', () => {
  for (const [id, choice, type, age] of [
    ['household_partner_roof_leak', 'hire', 'partner', 40],
    ['household_child_driving', 'instructor', 'child', 17],
  ]) {
    const state = fixture(40), subject = addRelative(state, type, age);
    state.money = incomeForLifestyle(6) / LIFESTYLE_BALANCE.reserveDrawRate;
    state.lifestyle = changedLifestyle(lifestyleFromResources(0, state.money), -1); // Consistent resources and one dependent/partner.
    queue(state, id, subject);
    const before = copy(state);
    assert.equal(resolveEventChoice(state, choice, id, subject.id).ok, true);
    assert.deepEqual(state.stats, before.stats, 'arranging ordinary paid help does not change personal ratings');
    assert.equal(subject.stats.stability, 5, 'the named relative also receives no incidental mental change');
    assert.equal(state.lifestyle, before.lifestyle);
    assert.equal(state.money, before.money);
    assert.equal(state.rng, before.rng);
    assert.deepEqual(state.effects, before.effects);
    if (type === 'child') {
      assert.equal(subject.stats.intelligence, 5.35, 'driving instruction still develops the child’s understanding');
      assert.equal(subject.relationship, 5.1);
    } else {
      assert.deepEqual(subject.stats, before.partner.stats);
      assert.match(state.history[0].text, /No additional effects/);
    }
    assert.doesNotMatch(state.history[0].text, /mental stability|Stability/i);
    assert.equal(validateSave(state), true);
    const resolved = copy(state);
    assert.deepEqual(migrateSave(copy(state)), resolved, 'reload retains outcomes, history, remaining effects, and RNG exactly');
    assert.deepEqual(state, resolved);
  }
});

test('lasting bullying distress and meaningful recovery still affect the person experiencing them', () => {
  for (const [choice, stability, social] of [['support', 5.25, 4.8], ['friends', 4.8, 5.35]]) {
    const state = fixture();
    queue(state, 'school_bullying');
    const parents = copy(state.parents), rng = state.rng;
    assert.equal(resolveEventChoice(state, choice, 'school_bullying').ok, true);
    assert.equal(state.stats.stability, stability);
    assert.equal(state.stats.social, social);
    assert.deepEqual(state.parents, parents, 'the player’s experience does not silently affect caregivers');
    assert.equal(state.rng, rng);
  }
  const state = fixture(40), child = addRelative(state, 'child', 19);
  queue(state, 'household_child_direction', child);
  const before = copy(state);
  assert.equal(resolveEventChoice(state, 'listen', 'household_child_direction', child.id).ok, true);
  assert.equal(child.stats.stability, before.children[0].stats.stability, 'the causal mental-stability rating stays unchanged');
  assert.equal(child.stats.social, 5.2);
  assert.equal(state.stats.stability, before.stats.stability, 'providing support does not automatically reward the parent’s mental stability');
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('new catalog judgments never rewrite saved mental ratings, historical outcomes, or legacy temporary effects', () => {
  const state = fixture();
  assert.equal(advanceYear(state, steady).ok, true);
  state.pendingEvents = [];
  state.lastYearEvents = [];
  state.stats.stability = 6.4;
  state.effects.push({ id: 'good_grades', name: 'An excellent report card', description: 'A saved mental reward',
    years: 2, modifiers: { stability: .4 }, kind: 'positive' });
  const summaryStability = state.yearSummary.stats.stability;
  summaryStability.after = effectiveStats(state).stability;
  summaryStability.change = Math.round((summaryStability.after - summaryStability.before) * 100) / 100;
  const oldOutcome = { title: event('good_grades').name,
    text: 'Your social 5 → 5.2; Your mental stability 6.3 → 6.4.', kind: 'positive' };
  state.history.unshift({ id: 'old-mental-outcome', age: state.age, generation: state.generation, ...oldOutcome });
  state.yearSummary.events = [copy(oldOutcome)];
  assert.equal(validateSave(state), true);
  const before = copy(state), loaded = migrateSave(copy(state));
  assert.deepEqual(loaded, before);
  assert.deepEqual(state, before, 'validation and loading do not modify their input');
  assert.equal(loaded.stats.stability, 6.4);
  assert.equal(effectiveStats(loaded).stability, 6.8);
  assert.equal(loaded.history[0].text, oldOutcome.text);
  assert.equal(loaded.yearSummary.events[0].text, oldOutcome.text);
  assert.deepEqual(migrateSave(copy(loaded)), before, 'repeated reloads never reinterpret recorded outcomes');
});
