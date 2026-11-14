import test from 'node:test';
import assert from 'node:assert/strict';
import { hasFame, fameFocusKey, fameActivityMatches, fameLearningBonus, fameFocusChange,
  fameNextRating, fameStartingRating, fameLossChance, fameLifestyleBonus, fameOpportunityChance } from '../fame.js';
import { FAME_EVENTS, fameEventChances } from '../fame-events.js';
import { eventStatCause, formatEventCause } from '../event-causes.js';

function person(kind = 'sports') {
  return { age: 15, alive: true, ended: false, needsSuccession: false, rng: 54321,
    stats: { social: 8, attractiveness: 8 }, focus: { sports: 2, extracurricular: 2, self: 2 },
    school: { sports: { id: 'soccer', success: 8 }, extracurricular: { id: 'chess', success: 8 } },
    fame: { kind, activityId: kind === 'sports' ? 'soccer' : kind === 'extracurricular' ? 'chess' : null,
      rating: 5, support: 0, startedAge: 14 } };
}
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} versus ${expected}`);

test('fame progression uses its focus curve, bounded magnitude variation, and explicit learning and lifestyle bonuses', () => {
  for (const kind of ['sports', 'extracurricular', 'personal']) {
    const state = person(kind), before = structuredClone(state), key = kind === 'personal' ? 'self' : kind;
    assert.equal(hasFame(state), true);
    assert.equal(fameFocusKey(state), key);
    const expected = kind === 'personal' ? [-.6, -.2, 0, .2, .6] : [-.6, -.2, .2, .6];
    for (let points = 0; points < expected.length; points++) assert.equal(fameFocusChange(state, points), expected[points]);
    assert.equal(fameLearningBonus(state, 'social'), 5);
    for (const stat of ['intelligence', 'strength', 'creativity', 'attractiveness', 'health', 'stability']) assert.equal(fameLearningBonus(state, stat), 0);
    assert.equal(fameLifestyleBonus(state), 0);
    assert.deepEqual(state, before, 'pure helpers do not change ratings, focus, enrollment or gameplay RNG');
    const zero = { ...state, fame: null };
    assert.equal(hasFame(zero), false); assert.equal(fameFocusKey(zero), null);
    assert.equal(fameFocusChange(zero), 0); assert.equal(fameLearningBonus(zero, 'social'), 0);
    assert.equal(fameLifestyleBonus(zero), 0); assert.equal(fameNextRating(zero), null);
  }
  const state = person('personal');
  for (const draw of [-100, -3, 0, 3, 100]) assert.equal(fameNextRating(state, draw), 5, 'zero focus contribution cannot acquire random drift');
  state.focus.self = 4;
  assert.equal(fameNextRating(state, -100), 5.2);
  assert.equal(fameNextRating(state, 0), 5.6);
  assert.equal(fameNextRating(state, 100), 6);
  state.fame.rating = 9.9; assert.equal(fameNextRating(state, 3), 10);
  state.fame.rating = .1; state.focus.self = 0; assert.equal(fameNextRating(state, 3), 0);
  for (const draw of [-20, -3, -2, -.5, 0, .5, 2, 3, 20]) {
    const value = fameStartingRating(draw);
    assert.ok(value >= 0 && value <= 10);
    near(value * 10, Math.round(value * 10));
    near(value + fameStartingRating(-draw), 10, 'starting distribution is symmetric around five');
  }
  assert.equal(fameStartingRating(0), 5);
  assert.equal(fameStartingRating(-2.5), 0); assert.equal(fameStartingRating(2.5), 10);
  near(fameLossChance(0), .5); near(fameLossChance(5), .08); near(fameLossChance(10), .02);
  assert.equal(fameLossChance(-5), fameLossChance(0)); assert.equal(fameLossChance(20), fameLossChance(10));
  for (let value = 0; value < 10; value++) assert.ok(fameLossChance(value) > fameLossChance(value + 1));
  for (const [value, support, expected] of [[6.9, 0, 0], [7, 0, .5], [10, 0, 2], [10, 2, 3], [0, -2, -2], [8, -.5, .5]]) {
    state.fame.rating = value; state.fame.support = support; assert.equal(fameLifestyleBonus(state), expected);
  }
  const athlete = person();
  assert.equal(fameActivityMatches(athlete, 'sports', 'soccer'), true);
  assert.equal(fameActivityMatches(athlete, 'extracurricular', 'chess'), false);
  athlete.age = 30; assert.equal(fameActivityMatches(athlete, 'sports', 'soccer'), true, 'the source activity can continue in adulthood');
  athlete.school.sports.id = 'tennis'; assert.equal(fameActivityMatches(athlete, 'sports', 'soccer'), false);
  athlete.school.sports = null; assert.equal(fameActivityMatches(athlete, 'sports', 'soccer'), false);
});

test('fame invitations favor exceptional earned performance and social presentation without changing the save', () => {
  const state = person(); state.fame = null;
  const before = structuredClone(state);
  near(fameOpportunityChance(state, 'sports'), .20 * .8 ** 8);
  near(fameOpportunityChance(state, 'extracurricular'), .20 * .8 ** 8);
  near(fameOpportunityChance(state, 'personal'), .05 * .8 ** 10);
  near(fameOpportunityChance(state, 'sports', { social: 10, attractiveness: 6 }), .20 * .8 ** 8);
  near(fameOpportunityChance(state, 'sports', { social: 0, attractiveness: 0 }), .20 * .4 ** 8);
  assert.deepEqual(state, before, 'opportunity reads preserve the complete person and RNG');
  state.stats = { social: 10, attractiveness: 10 }; state.school.sports.success = 10;
  assert.equal(fameOpportunityChance(state, 'sports'), .2); assert.equal(fameOpportunityChance(state, 'personal'), .05);
  state.stats = { social: 100, attractiveness: 100 }; state.school.sports.success = 100;
  assert.equal(fameOpportunityChance(state, 'sports'), .2, 'temporary ratings cannot exceed the opportunity ceiling');
  state.school.sports.success = null; assert.equal(fameOpportunityChance(state, 'sports'), 0, 'unearned success never qualifies');
  state.school.sports.success = 10; state.focus.sports = 0; assert.equal(fameOpportunityChance(state, 'sports'), 0);
  state.focus.sports = 2;
  for (const [age, sports, personal] of [[5, false, false], [6, true, false], [12, true, false], [13, true, true], [17, true, true], [18, false, true], [84, false, true], [85, false, false]]) {
    state.age = age;
    assert.equal(fameOpportunityChance(state, 'sports') > 0, sports);
    assert.equal(fameOpportunityChance(state, 'personal') > 0, personal);
  }
  state.age = 15;
  for (const flag of ['ended', 'needsSuccession']) {
    state[flag] = true; assert.equal(fameOpportunityChance(state, 'sports'), 0); assert.equal(fameOpportunityChance(state, 'personal'), 0); state[flag] = false;
  }
  state.alive = false; assert.equal(fameOpportunityChance(state, 'sports'), 0);
  state.alive = true; state.fame = person().fame;
  for (const kind of ['sports', 'extracurricular', 'personal']) assert.equal(fameOpportunityChance(state, kind), 0, 'one existing route prevents another invitation');
});

test('fame encounters have concrete normalized outcomes and pure age, route and recognition gates', () => {
  const active = FAME_EVENTS.filter(event => event.requiresFame), invitations = FAME_EVENTS.filter(event => !event.requiresFame);
  assert.equal(active.length, 30); assert.equal(invitations.length, 3);
  assert.equal(active.filter(event => event.kind === 'positive').length, 22);
  assert.equal(new Set(FAME_EVENTS.map(event => event.id)).size, FAME_EVENTS.length);
  assert.equal(new Set(FAME_EVENTS.map(event => event.name)).size, FAME_EVENTS.length);
  const stabilityIds = [];
  for (const event of FAME_EVENTS) {
    assert.ok(event.minAge >= 6 && event.maxAge <= 84 && event.minAge <= event.maxAge);
    assert.equal(event.category, 'Fame'); assert.ok(event.description.length > 50);
    if (event.choices) assert.equal(new Set(event.choices.map(choice => choice.id)).size, event.choices.length);
    for (const item of [event, ...(event.choices || [])]) {
      assert.deepEqual(item.modifiers, {}); assert.equal(item.years, 0); assert.equal(item.lifestyle, undefined);
      if (item.fameSupport !== undefined) assert.ok(item.fameSupport >= -.4 && item.fameSupport <= .6 && item.fameSupport !== 0);
      if (item.statChanges?.stability) stabilityIds.push(event.id);
    }
  }
  assert.deepEqual(stabilityIds, ['fame_peer_support', 'fame_persistent_harassment']);
  for (const invitation of invitations) {
    const source = person(); source.fame = null;
    const oddsBefore = fameEventChances(source);
    assert.equal(formatEventCause(eventStatCause(invitation, source), invitation),
      'High social and high attractiveness contributed to this event.');
    assert.deepEqual(fameEventChances(source), oddsBefore, 'explaining the invitation preserves its weighted odds');
    assert.deepEqual(invitation.choices.map(choice => choice.id), ['pursue', 'decline']);
    assert.equal(invitation.choices[0].fameAction, 'start');
    assert.equal(invitation.choices[0].fameKind, invitation.fameKind);
    assert.equal(invitation.choices[1].fameAction, undefined);
  }
  for (const kind of ['sports', 'extracurricular', 'personal']) {
    const state = person(kind), before = structuredClone(state), rolls = fameEventChances(state);
    for (const roll of rolls) {
      const entry = FAME_EVENTS.find(event => event.id === roll.id);
      const eligible = entry.requiresFame && state.age >= entry.minAge && state.age <= entry.maxAge
        && (!entry.fameKinds || entry.fameKinds.includes(kind)) && state.fame.rating >= (entry.minFame ?? 0);
      near(roll.chance, eligible ? entry.baseChance * 3 : 0);
      assert.ok(roll.chance >= 0 && roll.chance <= .12);
    }
    assert.deepEqual(fameEventChances(state), rolls);
    assert.deepEqual(state, before);
    for (const flag of ['ended', 'needsSuccession']) assert.ok(fameEventChances({ ...state, [flag]: true }).every(roll => roll.chance === 0));
    assert.ok(fameEventChances({ ...state, alive: false }).every(roll => roll.chance === 0));
  }
});
