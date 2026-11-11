import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, chooseEducation, haveChild, EVENTS, resolveEventChoice,
  migrateSave, validateSave, succeed } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord, SPORTS, EXTRACURRICULARS } from '../school.js';

const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const currentPeople = state => [state, ...state.parents, state.guardian, ...state.children,
  ...state.siblings, state.partner, ...state.encounters, state.pregnancy?.otherParent].filter(Boolean);
function finishChoices(state) {
  while (state.pendingEvents.length) {
    const pending = state.pendingEvents[0];
    const event = EVENTS.find(entry => entry.id === pending.eventId);
    assert.equal(resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
  }
}
function adultFamily() {
  const state = createGame({ seed: 80319 });
  while (state.age < 19) {
    if (state.age === 18) assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state, calm).ok, true);
    finishChoices(state);
  }
  state.pregnancy = null;
  state.encounters = [];
  assert.equal(haveChild(state).ok, true);
  state.siblings = [{ ...copy(state.children[0]), id: 'perk-sibling' }];
  state.partner = { ...copy(state.parents.find(person => person.gender === 'female')),
    id: 'perk-partner', age: 25, relationship: 5, yearsTogether: 1, married: false, lastProposalAge: -1 };
  state.guardian = { ...copy(state.parents[0]), id: 'perk-guardian', guardianRole: 'aunt', adoptedAt: 3 };
  delete state.guardian.abandonedAt;
  state.pregnancy = { otherParent: copy(state.partner), carrierId: state.partner.id,
    carrierName: state.partner.name, startedAge: state.age, dueAge: state.age + 1, casual: false };
  for (const person of currentPeople(state)) {
    person.conditions = [];
    for (const key of Object.keys(person.aptitudes)) person.aptitudes[key] = 0;
  }
  state.conditions = ['literal_thinker', 'sharp_memory', 'forgetful'];
  state.aptitudes.intelligence = 2;
  state.parents[0].conditions = ['sharp_memory'];
  state.parents[0].aptitudes.intelligence = -2;
  state.parents[1].conditions = ['powerful_build'];
  state.parents[1].aptitudes.strength = 3;
  state.guardian.conditions = ['delicate_constitution'];
  state.guardian.aptitudes.health = -3;
  state.children[0].conditions = ['vivid_imagination'];
  state.siblings[0].conditions = ['even_tempered'];
  state.siblings[0].aptitudes.stability = 1;
  state.partner.conditions = ['literal_thinker'];
  Object.assign(state.partner.aptitudes, { intelligence: -2, creativity: 2 });
  state.pregnancy.otherParent.conditions = ['literal_thinker'];
  Object.assign(state.pregnancy.otherParent.aptitudes, { intelligence: 1, creativity: -1 });
  state.lineage = [{ ...copy(state.parents[0]), generation: 1, money: 100, estate: 90,
    share: 90, children: [], retired: true }];
  state.effects = [{ id: 'saved-bonus', name: 'Saved support', description: '', years: 2,
    kind: 'positive', modifiers: { intelligence: .2 }, focusLimits: { standard: { work: 3 } } }];
  state.focus = defaultFocus(state.age);
  const event = EVENTS.find(entry => !entry.subjectType && entry.choices?.length
    && entry.minAge <= state.age - 1 && (entry.maxAge ?? 85) >= state.age - 1);
  assert.ok(event);
  state.pendingEvents = [{ eventId: event.id, age: state.age }];
  state.lastYearEvents = [event.id];
  // These fixtures model legacy schema-19 records with fixed three offers.
  state.school.offers = { sports: SPORTS.slice(0, 3).map(entry => entry.id),
    extracurricular: EXTRACURRICULARS.slice(0, 3).map(entry => entry.id) };
  assert.equal(validateSave(state), true, 'the fixture has valid current person and historical records');
  return state;
}
function expectedAffinities(state) {
  const expected = copy(state);
  expected.version = 20;
  Object.assign(expected.aptitudes, { intelligence: 3, creativity: -1 });
  expected.parents[0].aptitudes.intelligence = -1;
  expected.children[0].aptitudes.creativity = 1;
  expected.siblings[0].aptitudes.stability = 2;
  if (expected.partner) Object.assign(expected.partner.aptitudes, { intelligence: -1, creativity: 1 });
  if (expected.pregnancy) Object.assign(expected.pregnancy.otherParent.aptitudes, { intelligence: 2, creativity: -2 });
  return expected;
}

test('v17-v19 perks migrate every current person once while preserving ratings and historical lineage', () => {
  const fixture = adultFamily();
  for (const version of [17, 18, 19]) {
    const old = copy(fixture);
    old.version = version;
    if (version < 19) delete old.school;
    const before = copy(old), expected = expectedAffinities(old);
    if (version < 19) expected.school = null;
    const migrated = migrateSave(old);
    assert.deepEqual(migrated, expected, `schema ${version}: only current affinities, version and required legacy school metadata change`);
    assert.equal(validateSave(migrated), true);
    assert.deepEqual(migrated.lineage, before.lineage, 'previous chapters retain their recorded affinities and stats');
    assert.equal(migrated.parents[0].id, migrated.lineage[0].id);
    assert.notEqual(migrated.parents[0].aptitudes.intelligence, migrated.lineage[0].aptitudes.intelligence,
      'the current parent and historical copy have distinct migration semantics');
    assert.equal(migrated.partner.id, migrated.pregnancy.otherParent.id);
    assert.notEqual(migrated.partner.aptitudes.intelligence, migrated.pregnancy.otherParent.aptitudes.intelligence,
      'the saved pregnancy copy keeps its own original affinity before the one-time shift');
    assert.deepEqual(migrateSave(copy(migrated)), migrated, 'schema 20 reload never adds the perk twice');
    assert.deepEqual(old, before, 'migration leaves its input untouched');
  }
});

test('v19 school records and legacy five-offer lists survive the affinity upgrade without rerating', () => {
  const old = createGame({ seed: 121 });
  old.age = 12;
  old.conditions = ['autism', 'high_energy'];
  old.focus = { ...defaultFocus(12), social: 1, sports: 1, extracurricular: 1 };
  old.school = createSchoolRecord(old);
  old.school.sports = { id: 'basketball', success: 6.25 };
  old.school.extracurricular = { id: 'chess', success: null };
  for (const person of [old, ...old.parents]) {
    person.aptitudes = Object.fromEntries(Object.keys(person.aptitudes).map(key => [key, 0]));
    if (person !== old) person.conditions = [];
  }
  old.school.offers = { sports: ['soccer', 'football', 'tennis', 'basketball', 'cheerleading'],
    extracurricular: ['piano', 'violin', 'guitar', 'drums', 'chess'] };
  old.pendingEvents = [{ eventId: 'school_team', age: old.age }];
  old.lastYearEvents = ['school_team'];
  old.version = 19;
  const before = copy(old), expected = copy(old);
  expected.version = 20;
  expected.aptitudes.intelligence = 1;
  for (const kind of ['sports', 'extracurricular']) expected.school.offers[kind] = expected.school.offers[kind].slice(0, 3);
  const migrated = migrateSave(old);
  assert.deepEqual(migrated, expected);
  assert.equal(validateSave(migrated), true);
  assert.deepEqual(migrateSave(copy(migrated)), migrated);
  assert.deepEqual(old, before);
});

test('saved dating prospects gain their affinity shifts without rerolling the encounter', () => {
  const old = adultFamily();
  const prospect = { ...copy(old.partner), id: 'perk-prospect', conditions: ['warm_presence'] };
  old.partner = null;
  old.pregnancy = null;
  old.encounters = [prospect];
  assert.equal(validateSave(old), true);
  old.version = 19;
  const before = copy(old), expected = expectedAffinities(old);
  Object.assign(expected.encounters[0].aptitudes, { social: 1, attractiveness: 1 });
  const migrated = migrateSave(old);
  assert.deepEqual(migrated, expected);
  assert.deepEqual(migrateSave(copy(migrated)), migrated);
  assert.deepEqual(old, before);
});

test('empty-perk v19 saves change only their version and opposing affinity shifts clamp after summing', () => {
  const empty = createGame({ seed: 121 });
  for (const person of currentPeople(empty)) person.conditions = [];
  empty.version = 19;
  assert.deepEqual(migrateSave(empty), { ...empty, version: 20 });
  for (const conditions of [['sharp_memory', 'forgetful'], ['forgetful', 'sharp_memory']]) {
    const old = copy(empty);
    old.conditions = conditions;
    old.aptitudes.intelligence = 3;
    assert.deepEqual(migrateSave(old), { ...old, version: 20 }, 'opposing perks cancel even at the upper affinity boundary');
  }
});

test('affinity migration rejects malformed people and never repairs invalid perks or ratings', () => {
  const fixture = adultFamily();
  fixture.version = 19;
  for (const mutate of [
    state => { state.conditions = ['unknown-perk']; },
    state => { state.parents[0].conditions = ['sharp_memory', 'sharp_memory']; },
    state => { state.guardian.aptitudes.health = -4; },
    state => { state.pregnancy.otherParent.aptitudes.creativity = .5; },
    state => { state.children[0].stats.intelligence = 10.01; },
    state => { state.lineage[0].conditions = ['unknown-perk']; },
  ]) {
    const malformed = copy(fixture);
    mutate(malformed);
    const before = copy(malformed);
    assert.equal(migrateSave(malformed), null);
    assert.deepEqual(malformed, before);
  }
});

test('succession after migration copies the heir affinities without applying their perks again', () => {
  const old = adultFamily();
  old.version = 19;
  const state = migrateSave(old);
  assert.ok(state);
  state.age = 65;
  state.pendingEvents = [];
  state.pregnancy = null;
  state.yearSummary = null;
  const heir = copy(state.children[0]);
  assert.equal(heir.aptitudes.creativity, 1);
  assert.equal(succeed(state, heir.id).ok, true);
  assert.deepEqual(state.conditions, heir.conditions);
  assert.deepEqual(state.aptitudes, heir.aptitudes);
  assert.deepEqual(state.stats, heir.stats);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});
