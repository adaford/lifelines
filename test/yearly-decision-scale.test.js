import test from 'node:test';
import assert from 'node:assert/strict';
import {
  YEARLY_DECISION_SCALE, DEVELOPMENT_BALANCE, TODDLER_FOCUS,
  infantChoiceEffects, toddlerActivityEffects, skillChanges, childhoodWellbeing,
} from '../development.js';
import { createGame, annualForecast, advanceYear, chooseEducation, resolveEventChoice, effectiveStats } from '../engine.js';

const copy = value => structuredClone(value);
const round = value => Math.round(value * 100) / 100;
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} vs ${expected}`);
const statKeys = ['health', 'stability', 'attractiveness', 'intelligence', 'strength', 'social', 'creativity'];
const learned = ['intelligence', 'strength', 'social', 'creativity'];
const neutral = person => {
  person.stats = Object.fromEntries(statKeys.map(key => [key, 5]));
  person.aptitudes = Object.fromEntries(statKeys.map(key => [key, 0]));
  if ('relationship' in person) person.relationship = 5;
  return person;
};
function stateAt(age) {
  const state = createGame({ seed: 84721 });
  state.age = age;
  if (age >= 18) chooseEducation(state, 'work');
  state.focus = age >= 2 && age < 5 ? { ...TODDLER_FOCUS } : { work: 3, social: 3, family: 3, self: 3 };
  for (const person of [state, ...state.parents]) neutral(person);
  return state;
}
function quietMean(state) {
  for (let rng = 1; rng <= 500; rng++) {
    const candidate = { ...copy(state), rng };
    assert.equal(advanceYear(candidate, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
    if (!candidate.lastYearEvents.length) return candidate;
  }
  assert.fail('No quiet mean-year fixture found');
}

test('each crying contribution is half strength before bounds, including aptitude response', () => {
  assert.equal(YEARLY_DECISION_SCALE, .5);
  for (const aptitude of [-3, 0, 3]) {
    for (let level = 1; level <= 5; level++) {
      const state = stateAt(0);
      state.cryLevel = level;
      for (const key of statKeys) state.aptitudes[key] = aptitude;
      const response = value => value * (value >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
      const effects = infantChoiceEffects(state);
      close(effects.intelligence, response([-.08, -.04, .04, .08, .12][level - 1]) * .575, 'intelligence');
      close(effects.stability, response([-.24, -.12, .12, .24, .36][level - 1]) * .5, 'mental stability');
      close(effects.health, response(.06 * ((level - 1) / 4 - .5)) * .5, 'health');
      for (const key of ['social', 'creativity']) close(effects[key], response(.02 * (level - 3)) * .575, key);
      assert.equal(effects.strength, 0);
      const forecast = annualForecast(state);
      for (const parent of forecast.parents) {
        assert.equal(parent.stability.change, [.1, 0, -.3, -.6, -.9][level - 1]);
        assert.equal(parent.relationship.change, round(.1 * (level - 3)));
      }
    }
  }
});

test('all toddler activity effects and unused-point rest use half-strength contributions', () => {
  const state = stateAt(3);
  const coefficients = {
    work: { strength: .1, social: .055 },
    social: { intelligence: .09, social: -.055 / 3 },
    family: { social: .055 * 2 / 3, stability: .035 },
    self: { health: .1, stability: .08 },
    creative: { creativity: .11, intelligence: .03 },
  };
  for (const [activity, stats] of Object.entries(coefficients)) {
    for (const points of [0, 1, 5]) {
      const effects = toddlerActivityEffects({ ...state, focus: { ...state.focus, [activity]: points } })[activity];
      for (const [stat, coefficient] of Object.entries(stats)) {
        close(effects[stat], coefficient * points * (learned.includes(stat) ? .575 : .5), `${activity} ${stat} at ${points}`);
      }
    }
  }
  const lessPlay = { ...state, focus: { ...state.focus, work: 2 } };
  close(childhoodWellbeing(lessPlay).stability - childhoodWellbeing(state).stability, .02, 'one unused point gives half the former rest');
  const lowerFamily = { ...state, focus: { ...state.focus, family: 1 } };
  for (const parent of annualForecast(lowerFamily).parents) {
    assert.equal(parent.relationship.change, -.04);
    assert.equal(parent.stability.change, -.01);
  }
});

test('school, career, and later-life practice halve both gains and losses without scaling background development', () => {
  const focused = { work: 5, social: 1, family: 1, self: 5 };
  const neglected = { work: 1, social: 5, family: 5, self: 1 };
  const halfPractice = { intelligence: .11, strength: .1, social: -.105, creativity: .055 };
  for (const [age, flexibility] of [[10, 1.15], [25, 1], [50, .85], [75, .65]]) {
    const state = stateAt(age);
    state.stats.intelligence = 8;
    const baseline = skillChanges(state);
    close(baseline.intelligence, -.036 * flexibility + (age < 18 ? DEVELOPMENT_BALANCE.childhoodBias.intelligence : 0), 'innate tendency and fitted bias');
    for (const [focus, sign] of [[focused, 1], [neglected, -1]]) {
      const changed = skillChanges({ ...state, focus });
      for (const key of learned) close(changed[key] - baseline[key], halfPractice[key] * flexibility * sign, `${age} ${key}`);
    }
    if (age >= 18) {
      const working = { ...state, focus: focused };
      const career = skillChanges(working, { weights: { intelligence: 1 } });
      close(career.intelligence - skillChanges(working).intelligence, .035 * flexibility, 'career practice is halved');
    }
  }
  const child = stateAt(10);
  const wellbeing = childhoodWellbeing(child);
  close(wellbeing.health, .06 * (DEVELOPMENT_BALANCE.wellbeingTarget.health - 5), 'health reversion');
  close(wellbeing.stability, .08 * (DEVELOPMENT_BALANCE.wellbeingTarget.stability - 5), 'mental stability reversion');
  const senior = stateAt(65);
  senior.focus.self = 2;
  assert.equal(annualForecast(senior).stats.health.change, -.1, 'age-related health loss remains whole');
  assert.equal(annualForecast(senior).stats.attractiveness.change, -.12, 'age-related appearance loss remains whole');

  const adult = stateAt(30);
  adult.focus = { work: 5, social: 2, family: 0, self: 0 };
  const adultForecast = annualForecast(adult);
  assert.equal(adultForecast.stats.health.after, 4.97, 'adult self-focus health loss is halved before rounding');
  assert.equal(adultForecast.stats.stability.after, round(round(5 - .032) - .075), 'adult strain and high-work unemployment penalty are each halved');
});

test('caregiver, partner, and child routine relationships and wellbeing receive half-strength family decisions', () => {
  for (const family of [0, 5]) {
    const state = stateAt(30);
    state.focus = { work: 2, social: 2, family, self: 2 };
    state.partner = { ...copy(state.parents[0]), id: 'partner', age: 30, canGestate: false, married: true, yearsTogether: 2, lastProposalAge: -1 };
    state.children = [0, 3, 12, 25].map((age, i) => ({ ...copy(state.parents[0]), id: `child-${i}`, age, canGestate: false }));
    const result = quietMean(state);
    assert.equal(result.stats.stability, round(5 + (.416 - family * .015) * .5), 'adult routine wellbeing is halved');
    for (const parent of result.parents) {
      assert.equal(parent.relationship, round(5 + (family - 2) * .04));
      assert.equal(parent.stats.stability, round(5 + (family - 3) * .0125));
    }
    assert.equal(result.partner.relationship, round(5 + (family - 2) * .055));
    assert.equal(result.partner.stats.stability, round(5 + (family - 2) * .0175));
    for (let i = 0; i < state.children.length; i++) {
      const child = state.children[i], grown = result.children[i];
      assert.equal(grown.relationship, round(5 + (family - 2) * .065));
      if (child.age >= 18) {
        assert.equal(grown.stats.stability, round(5 + (-.08 + family * .045) * .5));
        assert.equal(grown.stats.health, round(5 + (family - 2) * .01));
      } else if (child.age === 0) {
        const carePractice = .02 * (family - 3);
        assert.equal(grown.stats.intelligence, round(5 + (.04 + carePractice) * .575 + DEVELOPMENT_BALANCE.childhoodBias.intelligence));
      } else {
        const toddler = child.age < 5;
        const skillPractice = toddler
          ? { intelligence: 0, strength: 0, social: .055 * 2 / 3 * (family - 2) + .055 / 3, creativity: 0 }
          : { intelligence: .035 * (family - 3), strength: .1 * (family - 3), social: .025 * (family - 3), creativity: .08 * (family - 3) };
        for (const key of learned) assert.equal(grown.stats[key], round(5 + skillPractice[key] * .575 + DEVELOPMENT_BALANCE.childhoodBias[key]), `${child.age}-year-old child ${key} care`);
        const healthPractice = (toddler ? .1 : .035) * (family - 3);
        const stabilityPractice = toddler
          ? .08 * (family - 3) + .035 * (family - 2) + Math.max(0, 5 - family * 2) * .04
          : .095 * (family - 3) + Math.max(0, 6 - family * 2) * .04;
        assert.equal(grown.stats.health, round(5 + .06 * (DEVELOPMENT_BALANCE.wellbeingTarget.health - 5) + healthPractice * .5));
        assert.equal(grown.stats.stability, round(5 + .08 * (DEVELOPMENT_BALANCE.wellbeingTarget.stability - 5) + stabilityPractice * .5));
      }
    }
  }
  const child = stateAt(3);
  child.guardian = { ...copy(child.parents[0]), id: 'guardian', guardianRole: 'aunt' };
  for (const parent of child.parents) parent.abandonedAt = 2;
  child.focus.family = 0;
  const guardian = annualForecast(child).parents.find(parent => parent.id === 'guardian');
  assert.equal(guardian.relationship.change, -.08);
  assert.equal(guardian.stability.change, -.03);
});

test('autonomous family practice and event outcomes retain their full effects', () => {
  const state = stateAt(10);
  for (const parent of state.parents) parent.career.focus = 5;
  state.siblings = [{ ...copy(state.parents[0]), id: 'sibling', age: 20, focus: { work: 5, social: 1, family: 1, self: 5 } }];
  const after = quietMean(state);
  for (const parent of after.parents) assert.equal(parent.stats.intelligence, 5.15, 'autonomous career practice is unchanged');
  assert.equal(after.siblings[0].stats.intelligence, 5.22, 'autonomous sibling practice is unchanged');

  const event = stateAt(10);
  event.pendingEvents = [{ eventId: 'extra_lessons', age: 10 }];
  const rng = event.rng;
  assert.equal(resolveEventChoice(event, 'study', 'extra_lessons').ok, true);
  assert.equal(event.stats.intelligence, 5.5, 'direct event gain remains full strength');
  assert.equal(effectiveStats(event).stability, 4.8, 'temporary event penalty remains full strength');
  assert.equal(event.effects[0].focusLimits.standard.social, 2);
  assert.equal(event.rng, rng);
});
