import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, createGame, advanceYear, eventOdds, annualForecast, resolveEventChoice,
  validateSave, migrateSave, effectiveStats, chooseEducation } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';

const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = value => structuredClone(value);
const definition = id => EVENTS.find(event => event.id === id);
const emptyAutomatic = ['low_stat_confusing_toy', 'low_stat_unfamiliar_visitor', 'musical_baby', 'baby_cold', 'birthday_left_out', 'family_outing', 'poor_grades', 'reading_award', 'missed_homework', 'college_exam_failure', 'identity_mixup', 'lost_valuables', 'unexpected_bill', 'adult_good_timing', 'career_recognition', 'work_error', 'work_overlooked', 'client_impression', 'family_tradition', 'family_argument', 'child_thanks', 'conflict', 'social_misread', 'trusted_friend', 'welcoming_presence', 'creative_block', 'windfall', 'household_parent_overloaded', 'household_parent_illness', 'household_partner_learning', 'household_partner_illness', 'household_partner_creative', 'household_partner_anniversary', 'household_child_friend', 'household_child_art', 'household_child_illness'];
const emptyDecisions = ['college_roommate', 'neighborhood_dispute', 'work_conflict'];
function fixture(age = 0) {
  const state = createGame({ seed: 7301 });
  if (age >= 18) while (state.age < age) {
    if (state.education.status === 'undecided') assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state, { ...calm, eventRandom: () => 1 }).ok, true);
  }
  if (state.education.status === 'undecided') assert.equal(chooseEducation(state, 'work').ok, true);
  state.age = age; state.conditions = []; state.effects = [];
  state.focus = defaultFocus(age);
  state.education = { status: age < 18 ? 'school' : 'workforce', years: 0 };
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  for (const person of [state, ...state.parents]) for (const key of Object.keys(person.stats)) {
    person.stats[key] = 5; person.aptitudes[key] = 0;
  }
  return state;
}
function roundTrip(state) {
  const before = copy(state);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(state))), before);
  assert.deepEqual(state, before);
}
// Reproduce the existing shuffle to target actual independent event rolls. This
// does not mutate the save or alter the engine's draw count or five-candidate cap.
function shuffledOdds(state) {
  const odds = eventOdds(state).filter(roll => roll.chance > 0);
  let rng = state.rng;
  const random = () => {
    rng = (rng + 0x6D2B79F5) >>> 0;
    let value = rng;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  for (let index = odds.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [odds[index], odds[other]] = [odds[other], odds[index]];
  }
  return odds;
}
function rollOnly(state, ids) {
  const odds = shuffledOdds(state), wanted = new Set(ids);
  for (const id of wanted) assert.ok(odds.some(roll => roll.id === id || roll.eventId === id), `${id} is eligible`);
  let calls = 0;
  const result = advanceYear(state, { ...calm, eventRandom: () => {
    const roll = odds[calls++];
    return wanted.has(roll.id) || wanted.has(roll.eventId) ? 0 : 1;
  } });
  assert.equal(result.ok, true);
  assert.equal(calls, odds.length, 'every eligible event receives its independent roll');
  return result;
}
const memory = (state, id) => state.history.find(entry => entry.title === definition(id).name || entry.title.endsWith(`: ${definition(id).name}`));

test('empty automatic events and decisions are retained for history but have no future odds', () => {
  assert.equal(emptyAutomatic.length, 36); assert.equal(emptyDecisions.length, 3);
  for (const id of [...emptyAutomatic, ...emptyDecisions]) assert.ok(definition(id), id);
  for (const age of [0, 3, 12, 20, 70]) {
    const state = fixture(age), before = copy(state);
    for (const roll of eventOdds(state)) if ([...emptyAutomatic, ...emptyDecisions].includes(roll.eventId || roll.id)) assert.equal(roll.chance, 0, roll.id);
    annualForecast(state); eventOdds(state);
    assert.deepEqual(state, before, 'odds and forecasts add no draws or save changes');
    assert.equal(advanceYear(state, { ...calm, eventRandom: () => 0 }).ok, true);
    assert.ok(state.lastYearEvents.every(id => !emptyAutomatic.includes(id.split(':')[0]) && !emptyDecisions.includes(id.split(':')[0])));
    roundTrip(state);
  }
});

test('a fully clipped automatic outcome has no event/history record or additional random draws', () => {
  const target = 'life_personal_intelligence_strength_support';
  const state = fixture(); state.stats.intelligence = 10; state.stats.strength = 10;
  const quiet = copy(state), originalHistory = copy(state.history);
  assert.equal(advanceYear(quiet, { ...calm, eventRandom: () => 1 }).ok, true);
  rollOnly(state, [target]);
  assert.deepEqual(state.lastYearEvents, []);
  assert.equal(memory(state, target), undefined);
  assert.equal(state.rng, quiet.rng);
  assert.deepEqual(state.stats, quiet.stats);
  assert.deepEqual(state.effects, quiet.effects);
  assert.ok(originalHistory.every(entry => state.history.some(saved => JSON.stringify(saved) === JSON.stringify(entry))));
  assert.deepEqual(state, quiet, 'an ineffective roll has the same state as the matching quiet year');
  roundTrip(state);
});

test('partially clipped outcomes show only real changes and preserve legacy additive modifiers', () => {
  const target = 'household_parent_support_network', state = fixture();
  state.cryLevel = 5;
  for (const parent of state.parents) { parent.stats.stability = 10; parent.relationship = 10; }
  state.stats.stability = 5; state.stats.social = 10; state.stats.health = 10;
  rollOnly(state, [target]);
  const text = memory(state, target).text;
  assert.match(text, /mental stability/i);
  assert.doesNotMatch(text, /social|health|Relationship|10 → 10|No stat changes/i);
  roundTrip(state);

  const covered = fixture(); covered.stats.intelligence = 10; covered.stats.strength = 5;
  covered.effects = [{ id: 'legacy-strength', name: 'Saved strength', description: 'Preserved support.', years: 2, modifiers: { strength: 10 }, kind: 'positive' }];
  assert.equal(effectiveStats(covered).strength, 15);
  // effectiveStats preserves legacy additive values rather than clipping them;
  // the permanent base still changes and the old effect remains untouched.
  rollOnly(covered, ['life_personal_intelligence_strength_support']);
  assert.ok(covered.stats.strength > 5);
  assert.match(memory(covered, 'life_personal_intelligence_strength_support').text, /strength 15 →/);
  assert.equal(covered.effects[0].years, 1);
  roundTrip(covered);
});

test('focus-only events record their consequence and last one complete routine without refilling points', () => {
  const state = fixture(12); state.focus.work = 3; state.focus.family = 1;
  roundTrip(state);
  const budget = focusBudget(state);
  rollOnly(state, ['study_headache']);
  assert.deepEqual(state.lastYearEvents, ['study_headache']);
  assert.match(memory(state, 'study_headache').text, /-1 focus point/);
  assert.match(memory(state, 'study_headache').text, /1 year/);
  assert.doesNotMatch(memory(state, 'study_headache').text, /No stat changes/);
  assert.equal(focusBudget(state), budget - 1);
  assert.equal(state.effects.find(effect => effect.id === 'study_headache').years, 1);
  assert.ok(Object.values(state.focus).reduce((sum, value) => sum + value, 0) <= budget - 1);
  roundTrip(state);
  const allocation = copy(state.focus);
  assert.equal(advanceYear(state, { ...calm, eventRandom: () => 1 }).ok, true);
  assert.equal(focusBudget(state), budget);
  assert.equal(state.effects.find(effect => effect.id === 'study_headache'), undefined);
  assert.deepEqual(state.focus, allocation);
  roundTrip(state);
});

test('identical shorter refreshes add no result while renewed and stacking commitments still count', () => {
  const state = fixture(12); state.focus.work = 3; state.focus.family = 0;
  state.effects = [{ id: 'study_headache', name: 'Saved recovery time', description: 'Original saved explanation.', years: 5,
    modifiers: {}, kind: 'negative', focusPoints: -1 }];
  roundTrip(state);
  const quiet = copy(state);
  assert.equal(advanceYear(quiet, { ...calm, eventRandom: () => 1 }).ok, true);
  rollOnly(state, ['study_headache']);
  assert.deepEqual(state.lastYearEvents, []);
  assert.equal(memory(state, 'study_headache'), undefined);
  assert.equal(state.effects[0].years, 4);
  assert.deepEqual(state, quiet, 'the retained longer effect and its saved prose are unchanged by a redundant refresh');
  roundTrip(state);

  const renewed = fixture(12); renewed.focus.work = 3; renewed.focus.family = 0;
  renewed.effects = [{ ...copy(state.effects[0]), years: 1 }];
  rollOnly(renewed, ['study_headache']);
  assert.deepEqual(renewed.lastYearEvents, ['study_headache']);
  assert.equal(renewed.effects[0].years, 1, 'the exhausted restriction is extended into a new complete year');
  assert.match(memory(renewed, 'study_headache').text, /-1 focus point/);
  roundTrip(renewed);

  const stacking = fixture(3), event = definition('minor_strain');
  stacking.effects = [{ id: event.id, name: event.name, description: event.description, years: 5,
    modifiers: {}, kind: event.kind, focusCapacity: copy(event.focusCapacity) }];
  rollOnly(stacking, [event.id]);
  assert.deepEqual(stacking.lastYearEvents, [event.id]);
  assert.equal(stacking.effects.length, 2, 'another capacity loss stacks even when the older one lasts longer');
  assert.match(memory(stacking, event.id).text, /-1 Play focus capacity/);
  roundTrip(stacking);
});

test('old empty pending decisions and valid declines remain resolvable with history and RNG preserved on load', () => {
  const state = fixture(20);
  state.pendingEvents = emptyDecisions.map(eventId => ({ eventId, age: 20 }));
  state.lastYearEvents = [...emptyDecisions];
  state.history.unshift({ id: 'saved-empty-event', age: 19, generation: state.generation, title: 'A musician develops your rhythms', text: 'No stat changes.', kind: 'positive' });
  roundTrip(state);
  for (const id of emptyDecisions) {
    const before = copy(state), choice = definition(id).choices[0];
    assert.equal(resolveEventChoice(state, choice.id, id).ok, true);
    assert.deepEqual(state.stats, before.stats);
    assert.equal(state.rng, before.rng);
    assert.match(memory(state, id).text, /No additional effects/);
    assert.deepEqual(state.history.find(entry => entry.id === 'saved-empty-event'), before.history.find(entry => entry.id === 'saved-empty-event'));
    roundTrip(state);
  }
  state.pendingEvents = [{ eventId: 'fame_personal_offer', age: state.age }];
  state.lastYearEvents = ['fame_personal_offer'];
  const rng = state.rng;
  assert.equal(resolveEventChoice(state, 'decline', 'fame_personal_offer').ok, true);
  assert.equal(state.fame, null); assert.equal(state.rng, rng);
  roundTrip(state);
});

test('a newly rolled decision needs one possible result, while a meaningful option can retain an empty decline', () => {
  const state = fixture(12);
  state.stats.intelligence = 10; state.stats.strength = 10;
  state.focus.work = 4; state.focus.self = 0;
  const quiet = copy(state);
  assert.equal(advanceYear(quiet, { ...calm, eventRandom: () => 1 }).ok, true);
  assert.equal(quiet.stats.intelligence, 10, 'the choice is fully clipped after the routine, not just at its start');
  rollOnly(state, ['school_team']);
  assert.deepEqual(state.pendingEvents, []);
  assert.equal(memory(state, 'school_team'), undefined);
  assert.deepEqual(state, quiet, 'assessing a no-result decision changes no ratings, IDs, history or random state');
  roundTrip(state);

  const possible = fixture(12); possible.stats.intelligence = 5;
  const expectedRng = copy(possible);
  assert.equal(advanceYear(expectedRng, { ...calm, eventRandom: () => 1 }).ok, true);
  rollOnly(possible, ['school_team']);
  assert.equal(possible.pendingEvents[0].eventId, 'school_team');
  assert.equal(possible.rng, expectedRng.rng, 'testing the options adds no gameplay draws');
  const before = copy(possible.stats), rng = possible.rng;
  assert.equal(resolveEventChoice(possible, 'join', 'school_team').ok, true);
  assert.deepEqual(possible.stats, before);
  assert.equal(possible.rng, rng);
  roundTrip(possible);
});

test('clipped candidates keep the existing five-candidate cap and never backfill later rolls', () => {
  let found;
  for (let seed = 1; seed <= 100; seed++) {
    const state = fixture(); state.rng = seed;
    state.stats.intelligence = 10; state.stats.strength = 10;
    for (const parent of state.parents) { parent.stats.stability = 0; parent.relationship = 0; }
    const odds = shuffledOdds(state);
    const clippedIndex = odds.findIndex(roll => roll.id === 'life_personal_intelligence_strength_support');
    if (clippedIndex < 4 || clippedIndex >= odds.length - 1) continue;
    const earlier = odds.slice(0, clippedIndex).filter(roll => {
      const event = definition(roll.eventId || roll.id);
      return event.id !== 'household_parent_abandonment' && !(event.statChanges?.strength < 0) && !(event.playerChanges?.strength < 0);
    }).slice(0, 4);
    const laterDeparture = odds.slice(clippedIndex + 1).find(roll => roll.eventId === 'household_parent_abandonment');
    if (earlier.length !== 4 || !laterDeparture) continue;
    const candidates = earlier.concat(odds[clippedIndex], laterDeparture);
    found = { state, candidates }; break;
  }
  assert.ok(found);
  const { state, candidates } = found;
  rollOnly(state, candidates.map(roll => roll.id));
  assert.ok(state.lastYearEvents.length <= 4);
  assert.ok(!state.lastYearEvents.includes(candidates[4].id), 'clipped fifth candidate is omitted');
  assert.ok(!state.lastYearEvents.includes(candidates[5].id), 'the sixth candidate does not fill the vacancy');
  assert.ok(state.parents.every(parent => parent.abandonedAt === undefined), 'departure ordering cannot promote a sixth candidate into the original five');
  roundTrip(state);
});

test('clipped abandonment still records its real care change and preserves guardian follow-up history', () => {
  const state = fixture();
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) person.stats[key] = 0;
    if (person !== state) person.relationship = 0;
  }
  rollOnly(state, ['household_parent_abandonment']);
  assert.ok(state.parents.every(parent => parent.abandonedAt === state.age));
  assert.ok(state.guardian);
  assert.equal(state.lastYearEvents.filter(id => id.startsWith('household_parent_abandonment:')).length, 2);
  assert.equal(state.history.filter(entry => entry.title.endsWith(definition('household_parent_abandonment').name)).length, 2);
  assert.ok(state.history.some(entry => entry.title.includes('adopts you')));
  assert.ok(state.history.some(entry => entry.title.endsWith('Takes over your care')));
  roundTrip(state);
});
