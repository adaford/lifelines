import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FAMILY_EVENTS, familyEventChances } from '../family-events.js';

const traits = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const actor = (id, age, value = 5.5) => ({ id, name: id, age, alive: true,
  stats: Object.fromEntries(traits.map(key => [key, value])), relationship: 5.5 });
function household(childAge = 10) {
  return { age: 30, focus: { work: 3, social: 3, family: 3, self: 3 },
    partner: { ...actor('partner', 30), married: true, yearsTogether: 3 },
    children: [actor('child', childAge)], ended: false, needsSuccession: false };
}
const chanceFor = (state, eventId, subjectId) => familyEventChances(state).find(event => event.eventId === eventId && (!subjectId || event.subjectId === subjectId))?.chance || 0;

test('household catalog provides distinct, consequential choices for partners and children', () => {
  assert.ok(FAMILY_EVENTS.length >= 32);
  assert.equal(new Set(FAMILY_EVENTS.map(event => event.id)).size, FAMILY_EVENTS.length);
  for (const subjectType of ['partner', 'child']) {
    assert.ok(FAMILY_EVENTS.filter(event => event.subjectType === subjectType && event.choices?.length).length >= 4);
  }
  for (const event of FAMILY_EVENTS) {
    assert.ok(event.minAge >= 0 && event.maxAge >= event.minAge);
    assert.ok(event.baseChance > 0 && event.baseChance < .02);
    if (event.choices) {
      assert.equal(new Set(event.choices.map(choice => choice.id)).size, event.choices.length);
      assert.equal(event.subjectChanges, undefined, 'decisions do not apply an outcome before a choice');
      assert.equal(event.playerChanges, undefined);
      assert.equal(event.relationship, undefined);
    }
    for (const outcome of event.choices || [event]) {
      const changes = [...Object.entries(outcome.subjectChanges || {}), ...Object.entries(outcome.playerChanges || {})];
      assert.ok(changes.length || outcome.relationship || outcome.lifestyle, `${event.id} must have consequences`);
      for (const [key, value] of changes) {
        assert.ok(traits.includes(key), `unknown trait ${key}`);
        assert.ok(Number.isFinite(value) && value !== 0);
      }
      if (outcome.lifestyle) assert.ok(Number.isInteger(outcome.years) && outcome.years >= 1 && outcome.years <= 3);
    }
  }
});

test('age and relationship context keep household events appropriate', () => {
  for (const age of [0, 2, 3, 5, 6, 10, 12, 13, 17, 18, 84, 85]) {
    const state = household(age);
    for (const roll of familyEventChances(state).filter(roll => roll.subjectType === 'child' && roll.chance > 0)) {
      const event = FAMILY_EVENTS.find(event => event.id === roll.eventId);
      assert.ok(age >= event.minAge && age <= event.maxAge);
    }
    assert.equal(chanceFor(state, 'household_child_grades') > 0, age >= 6 && age <= 17);
    assert.equal(chanceFor(state, 'household_child_peer') > 0, age >= 13 && age <= 17);
    assert.equal(chanceFor(state, 'household_child_direction') > 0, age >= 18 && age <= 84);
    assert.equal(chanceFor(state, 'household_child_words') > 0, age >= 1 && age <= 2);
  }
  const state = household();
  state.partner.married = false;
  assert.equal(chanceFor(state, 'household_partner_shared_load'), 0);
  state.partner.yearsTogether = 0;
  assert.equal(chanceFor(state, 'household_partner_anniversary'), 0);
  state.partner.age = 17;
  assert.ok(familyEventChances(state).filter(event => event.subjectType === 'partner').every(event => event.chance === 0));
  state.partner = null;
  state.children[0].alive = false;
  assert.ok(familyEventChances(state).every(event => event.chance === 0));
});

test('each family member rolls from their own traits and keeps a distinct target', () => {
  const state = household(10);
  state.children.push(actor('second-child', 10));
  state.children[0].stats.intelligence = 1;
  state.children[1].stats.intelligence = 10;
  const low = chanceFor(state, 'household_child_school', 'child');
  const high = chanceFor(state, 'household_child_school', 'second-child');
  assert.ok(low > high * 40, 'a child struggling with understanding has much higher school-difficulty odds');
  const rolls = familyEventChances(state);
  assert.equal(new Set(rolls.map(roll => roll.id)).size, rolls.length);
  const schoolRolls = rolls.filter(roll => roll.eventId === 'household_child_school');
  assert.equal(schoolRolls.length, 2);
  assert.notEqual(schoolRolls[0].id, schoolRolls[1].id);
  const before = JSON.stringify(rolls);
  state.stats = Object.fromEntries(traits.map(key => [key, 10]));
  assert.equal(JSON.stringify(familyEventChances(state)), before, 'player traits never replace the subject traits');
});

test('family focus supports connection and reduces neglected relationships', () => {
  const low = household(); low.focus.family = 0;
  const high = household(); high.focus.family = 5;
  assert.ok(chanceFor(high, 'household_partner_open') > chanceFor(low, 'household_partner_open') * 4);
  assert.ok(chanceFor(high, 'household_child_gratitude') > chanceFor(low, 'household_child_gratitude') * 4);
  assert.ok(chanceFor(low, 'household_partner_forgotten') > chanceFor(high, 'household_partner_forgotten') * 7);
  assert.ok(chanceFor(low, 'household_child_school') > chanceFor(high, 'household_child_school') * 7);
});

test('all retained subject traits influence events, with more frequent but bounded household events', () => {
  for (const subjectType of ['partner', 'child']) {
    for (const key of traits) {
      const event = FAMILY_EVENTS.find(event => event.subjectType === subjectType && event.statFactors?.some(([trait]) => trait === key));
      assert.ok(event, `${subjectType} ${key} needs an event influence`);
      const state = household(event.minAge);
      const person = subjectType === 'partner' ? state.partner : state.children[0];
      person.age = event.minAge;
      person.stats[key] = 1;
      const first = chanceFor(state, event.id);
      person.stats[key] = 10;
      assert.notEqual(first, chanceFor(state, event.id));
    }
  }
  for (const age of [0, 2, 5, 10, 16, 22]) {
    const state = household(age);
    const before = JSON.stringify(state);
    const rolls = familyEventChances(state);
    assert.equal(JSON.stringify(state), before, 'viewing chances does not mutate the save');
    assert.ok(rolls.every(roll => Number.isFinite(roll.chance) && roll.chance >= 0 && roll.chance <= .12));
    const expected = rolls.reduce((sum, roll) => sum + roll.chance, 0);
    assert.ok(expected >= .35 && expected <= .75, `ordinary household expectation ${expected}`);
  }
});

function childhood(age = 0) {
  return { age, parents: [actor('parent-one', age + 30), actor('parent-two', age + 32)],
    partner: null, children: [], focus: { work: 3, social: 3, family: 3, self: 3 },
    ended: false, needsSuccession: false };
}

test('parent experiences respect the child age and never require a baby to manage a parent', () => {
  const events = FAMILY_EVENTS.filter(event => event.subjectType === 'parent');
  assert.ok(events.length >= 6);
  for (const event of events) {
    assert.ok(event.minPlayerAge >= 0 && event.maxPlayerAge <= 17);
    assert.equal(event.choices, undefined, 'childhood parent experiences are automatic');
  }
  for (const age of [0, 1, 2, 3, 10, 17, 18, 40]) {
    const state = childhood(age);
    for (const roll of familyEventChances(state).filter(roll => roll.chance > 0)) {
      const event = events.find(event => event.id === roll.eventId);
      assert.ok(event && age >= event.minPlayerAge && age <= event.maxPlayerAge);
    }
    assert.equal(chanceFor(state, 'household_parent_sleepless') > 0, age <= 2);
    assert.equal(chanceFor(state, 'household_parent_listening') > 0, age >= 3 && age <= 17);
    assert.equal(chanceFor(state, 'household_parent_illness') > 0, age <= 17);
  }
  const state = childhood();
  state.parents[0].age = 90;
  assert.ok(chanceFor(state, 'household_parent_soothing', 'parent-one') > 0, 'an older living caregiver can still care for a child');
  state.parents[0].alive = false;
  assert.ok(familyEventChances(state).filter(roll => roll.subjectId === 'parent-one').every(roll => roll.chance === 0));
  state.needsSuccession = true;
  assert.deepEqual(familyEventChances(state), []);
});

test('parent stress, health and bonds influence their own childhood events', () => {
  const state = childhood(6);
  state.parents[0].stats.stability = 2;
  state.parents[1].stats.stability = 9;
  assert.ok(chanceFor(state, 'household_parent_overloaded', 'parent-one') > chanceFor(state, 'household_parent_overloaded', 'parent-two') * 10);
  assert.ok(chanceFor(state, 'household_parent_routine', 'parent-two') > chanceFor(state, 'household_parent_routine', 'parent-one') * 10);
  assert.ok(chanceFor(state, 'household_parent_support', 'parent-one') > chanceFor(state, 'household_parent_support', 'parent-two'), 'stress also makes recovery through help more likely');
  state.parents[0].stats.health = 2;
  state.parents[1].stats.health = 9;
  assert.ok(chanceFor(state, 'household_parent_illness', 'parent-one') > chanceFor(state, 'household_parent_illness', 'parent-two') * 10);
  state.parents[0].relationship = 2;
  state.parents[1].relationship = 9;
  assert.ok(chanceFor(state, 'household_parent_listening', 'parent-two') > chanceFor(state, 'household_parent_listening', 'parent-one') * 10);
  const before = JSON.stringify(state);
  const rolls = familyEventChances(state);
  assert.equal(JSON.stringify(state), before);
  assert.equal(new Set(rolls.map(roll => roll.id)).size, rolls.length);
  assert.ok(rolls.every(roll => roll.chance >= 0 && roll.chance <= .12));
});

test('more frequent childhood experiences still include support and recovery', () => {
  for (const age of [0, 2, 3, 10, 17]) {
    const state = childhood(age);
    const rolls = familyEventChances(state);
    const expected = rolls.reduce((sum, roll) => sum + roll.chance, 0);
    assert.ok(expected > .125 && expected < .5, `ordinary parent experience expectation ${expected}`);
    const positive = rolls.filter(roll => FAMILY_EVENTS.find(event => event.id === roll.eventId).kind === 'positive').reduce((sum, roll) => sum + roll.chance, 0);
    assert.ok(positive > expected / 2, 'care includes positive and recovering moments, not just stress');
  }
});
