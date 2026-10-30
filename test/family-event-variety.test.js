import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_EVENTS, familyEventChances } from '../family-events.js';
import { createGame, JOBS, resolveEventChoice, validateSave, migrateSave, focusLimits } from '../engine.js';

const parentIds = ['household_parent_park_walks', 'household_parent_cooking', 'household_parent_shift_change', 'household_parent_missed_pickup'];
const partnerIds = ['household_partner_language_course', 'household_partner_roof_leak', 'household_partner_travel_plans', 'household_partner_lost_keys'];
const childIds = ['household_child_care_closure', 'household_child_science_fair', 'household_child_driving', 'household_child_rescued_stray'];
const newIds = [...parentIds, ...partnerIds, ...childIds];
const copy = value => structuredClone(value);
const rounded = value => Math.round(Math.max(1, Math.min(10, value)) * 100) / 100;

function adult() {
  const state = createGame({ seed: 87101, firstName: 'Jamie', surname: 'Reed' });
  Object.assign(state, { age: 40, height: 68, adultHeight: 68, parents: [], lifestyle: 5,
    education: { status: 'workforce', years: 0 }, jobOffers: JOBS.filter(job=>!job.requiresCollege).slice(0, 10).map(job=>job.id) });
  state.stats = Object.fromEntries(Object.keys(state.stats).map(key=>[key, 5]));
  return state;
}

function relative(age, seed) {
  const person = createGame({ seed, firstName: 'Taylor', surname: 'Reed' });
  Object.assign(person, { age, height: age < 18 ? 48 : 66, adultHeight: age < 18 ? null : 66,
    maturityAge: 18, relationship: 5, yearsTogether: 3, married: false, lastProposalAge: -1 });
  person.stats = Object.fromEntries(Object.keys(person.stats).map(key=>[key, 5]));
  return person;
}

function fixture(event) {
  if (event.subjectType === 'parent') {
    const state = createGame({ seed: 87102 });
    state.age = event.minPlayerAge;
    if (state.age >= 2 && state.age < 5) state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
    return { state, subject: state.parents[0] };
  }
  const state = adult();
  const subject = relative(event.minAge, event.subjectType === 'partner' ? 87103 : 87104);
  if (event.subjectType === 'partner') state.partner = subject;
  else state.children = [subject];
  return { state, subject };
}

const chance = (state, event, subject) => familyEventChances(state).find(roll=>roll.eventId===event.id && roll.subjectId===subject.id)?.chance || 0;

test('new household events are reachable only for their intended people and ages', () => {
  assert.equal(new Set(FAMILY_EVENTS.map(event=>event.id)).size, FAMILY_EVENTS.length);
  const events = newIds.map(id=>FAMILY_EVENTS.find(event=>event.id===id));
  assert.ok(events.every(Boolean));
  assert.equal(events.filter(event=>event.choices).length, 6);
  for (const event of events) {
    const { state, subject } = fixture(event);
    assert.equal(validateSave(state), true, `${event.id} fixture`);
    const before = copy(state);
    assert.ok(chance(state,event,subject)>0, `${event.id} must be reachable`);
    assert.deepEqual(state,before,'reading odds preserves saved state and RNG');
    const pastSubject = copy(state);
    const pastPerson = event.subjectType==='parent'?pastSubject.parents[0]:event.subjectType==='partner'?pastSubject.partner:pastSubject.children[0];
    pastPerson.age=event.maxAge+1;
    assert.equal(chance(pastSubject,event,pastPerson),0);
    subject.alive=false;
    assert.equal(chance(state,event,subject),0,'deceased relatives never receive new events');
    subject.alive=true;
    state.age=event.subjectType==='parent'?18:17;
    assert.equal(chance(state,event,subject),0,'adult responsibilities cannot appear for an underage player');
    if(event.subjectType==='parent') assert.equal(event.choices,undefined,'parents provide childhood experiences without caregiving decisions for babies');
  }
});

test('every new household choice applies to its named relative and preserves a valid reload', () => {
  for (const id of [...partnerIds,...childIds]) {
    const event = FAMILY_EVENTS.find(event=>event.id===id);
    for (const choice of event.choices || []) {
      const { state, subject } = fixture(event);
      subject.age += 1; // The event rolled before this person's birthday.
      state.pendingEvents=[{eventId:id,subjectType:event.subjectType,subjectId:subject.id,age:state.age}];
      state.lastYearEvents=[`${id}:${subject.id}`];
      assert.equal(validateSave(state),true);
      const before=copy(state), subjectBefore=copy(subject);
      assert.equal(resolveEventChoice(state,choice.id,id,subject.id).ok,true);
      for (const key of Object.keys(state.stats)) {
        assert.equal(state.stats[key],rounded(before.stats[key]+(choice.playerChanges?.[key] || 0)),`${id}/${choice.id} player ${key}`);
        assert.equal(subject.stats[key],rounded(subjectBefore.stats[key]+(choice.subjectChanges?.[key] || 0)),`${id}/${choice.id} subject ${key}`);
      }
      assert.equal(subject.relationship,rounded(subjectBefore.relationship+(choice.relationship || 0)));
      assert.equal(state.age,before.age);
      assert.equal(state.rng,before.rng,'resolving authored consequences must not reroll randomness');
      for (const [key,max] of Object.entries(choice.focusLimits?.standard || {})) {
        assert.equal(focusLimits(state)[key],max,`${id}/${choice.id} restricts the player's time`);
        assert.equal(state.focus[key],Math.min(before.focus[key],max));
      }
      assert.equal(state.pendingEvents.length,0);
      assert.equal(validateSave(state),true);
      assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))),state);
      assert.ok(state.history[0].title.startsWith(`${subject.name}: `));
    }
  }
});

test('care, repairs, and driving trade time for lifestyle without hiding the other person effects', () => {
  for (const [id,timeChoice,paidChoice,key,max] of [
    ['household_child_care_closure','home','replace','work',2],
    ['household_partner_roof_leak','repair','hire','social',1],
    ['household_child_driving','teach','instructor','social',2],
  ]) {
    const event=FAMILY_EVENTS.find(event=>event.id===id);
    const original=fixture(event);
    original.subject.age += 1;
    original.state.money=25000*(2**4-1);
    original.state.lifestyle=4;
    const branches=[timeChoice,paidChoice].map(choiceId=>{
      const state=copy(original.state);
      state.pendingEvents=[{eventId:id,subjectType:event.subjectType,subjectId:original.subject.id,age:state.age}];
      state.lastYearEvents=[`${id}:${original.subject.id}`];
      assert.equal(resolveEventChoice(state,choiceId,id,original.subject.id).ok,true);
      return state;
    });
    assert.equal(focusLimits(branches[0])[key],max);
    assert.equal(focusLimits(branches[1])[key],5);
    assert.equal(branches[0].lifestyle-branches[1].lifestyle,1,'paid help exchanges lifestyle for available time');
    assert.ok(branches.every(state=>state.effects.some(effect=>effect.years===1)));
    assert.ok(branches.every(validateSave));
  }
});
