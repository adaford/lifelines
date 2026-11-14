import { focusEffect, defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  YEARLY_DECISION_SCALE, TODDLER_FOCUS,
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
  if (age >= 18) {
    state.education = { status: 'undecided', years: 0 };
    state.money = 1000000; // Isolate focus from housing hardship/support.
    assert.equal(chooseEducation(state, 'work').ok, true);
  }
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  state.focus = defaultFocus(state);
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

test('stronger crying contributions retain the yearly factor and aptitude response without magnifying caregiver strain', () => {
  assert.equal(YEARLY_DECISION_SCALE, .25);
  for (const aptitude of [-3, 0, 3]) {
    for (let level = 1; level <= 5; level++) {
      const state = stateAt(0);
      state.cryLevel = level;
      for (const key of statKeys) state.aptitudes[key] = aptitude;
      const response = value => value * (value >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
      const effects = infantChoiceEffects(state);
      close(effects.intelligence, response([-.48, -.24, .24, .48, .72][level - 1]) * .575, 'intelligence');
      close(effects.stability, response([-.48, -.24, .24, .48, .72][level - 1]) * .5, 'mental stability');
      close(effects.health, response(.36 * ((level - 1) / 4 - .5)) * .5, 'health');
      for (const key of ['social', 'creativity']) close(effects[key], response(.12 * (level - 3)) * .575, key);
      assert.equal(effects.strength, 0);
      const forecast = annualForecast(state);
      for (const parent of forecast.parents) {
        assert.equal(parent.stability.change, [.1, 0, -.3, -.6, -.9][level - 1]);
        assert.equal(parent.relationship.change, round(.1 * (level - 3)));
      }
    }
  }
});

test('stronger toddler activity effects retain proportional signs and unused points add no stat changes', () => {
  const state = stateAt(3);
  const coefficients = {
    work: { strength: .3, social: .165 },
    social: { intelligence: .27, social: -.165 },
    family: { social: .165 },
    self: { health: .3, stability: .24 },
    creative: { creativity: .33, intelligence: .27 },
  };
  for (const [activity, stats] of Object.entries(coefficients)) {
    for (const points of [0, 1, 2, 3, 4]) {
      const effects = toddlerActivityEffects({ ...state, focus: { ...state.focus, [activity]: points } })[activity];
      for (const [stat, coefficient] of Object.entries(stats)) {
        const contributionSteps = activity === 'social' ? (points - 2) * (stat === 'intelligence' ? 2 : 1) : activity === 'creative' && stat === 'intelligence'
          ? [-1, 0, 0, 0, 1][points] : focusEffect(points);
        close(effects[stat], coefficient * contributionSteps * (learned.includes(stat) ? .2875 : .25), `${activity} ${stat} at ${points}`);
      }
    }
  }
  const lessPlay = { ...state, focus: { ...state.focus, work: 1 } };
  close(childhoodWellbeing(lessPlay).stability - childhoodWellbeing(state).stability, 0, 'unused points do not create an extra stat effect');
  const lowerFamily = { ...state, focus: { ...state.focus, family: 1 } };
  for (const parent of annualForecast(lowerFamily).parents) {
    assert.equal(parent.relationship.change, -.02);
    assert.equal(parent.stability.change, -.01);
  }
});

test('school, career, and later-life practice produce gains and losses without background development', () => {
  const focused = { work: 4, social: 0, family: 0, self: 4 };
  const neglected = { work: 0, social: 4, family: 4, self: 0 };
  const practice = { intelligence: .675, strength: .45, social: -.72, creativity: 0 };
  for (const [age, flexibility] of [[10, 1.15], [25, 1], [50, .85], [75, .65]]) {
    const state = stateAt(age);
    state.stats.intelligence = 8;
    const baseline = skillChanges(state);
    const background = skillChanges(state, null, 0);
    close(background.intelligence, 0, 'no practice means no innate tendency or background adjustment');
    close(baseline.intelligence - background.intelligence, age < 18 ? -.225 * .25 * flexibility : 0, 'unjoined extracurricular Intelligence loss receives the yearly factor once');
    for (const [focus, sign] of [[focused, 1], [neglected, -1]]) {
      const changed = skillChanges({ ...state, focus });
      for (const key of learned) close(changed[key] - baseline[key], (age < 18 ? { intelligence: .3375, strength: 0, social: -1.08, creativity: .24 } : practice)[key] * .5 * flexibility * sign, `${age} ${key}`);
    }
    if (age >= 18) {
      const working = { ...state, focus: focused };
      const career = skillChanges(working, { weights: { intelligence: 1 } });
      close(career.intelligence - skillChanges(working).intelligence, .1575 * flexibility, 'career practice uses the stronger choice coefficient');
    }
  }
  const child = stateAt(10);
  const wellbeing = childhoodWellbeing(child);
  close(wellbeing.health, 0, 'neutral choices do not change health');
  close(wellbeing.stability, 0, 'neutral choices do not change mental stability');
  const senior = stateAt(65);
  senior.focus.self = 2;
  assert.equal(annualForecast(senior).stats.health.change, -.1, 'age-related health loss remains whole');
  assert.equal(annualForecast(senior).stats.attractiveness.change, -.12, 'age-related appearance loss remains whole');

  const adult = stateAt(30);
  adult.focus = { work: 4, social: 2, family: 0, self: 0 };
  const adultForecast = annualForecast(adult);
  assert.equal(adultForecast.stats.health.after, 4.92, 'adult self-focus health loss is substantial before rounding');
  assert.equal(adultForecast.stats.stability.after, changedRating(changedRating(5, -.675), -.1125), 'focus strain is stronger while the unemployment penalty retains its existing scale');
});

test('stronger child focus practice preserves caregiver strain and family relationship pacing', () => {
  for (const family of [0, 4]) {
    const state = stateAt(30);
    state.focus = { work: family === 4 ? 0 : 2, social: 2, family, self: 2 };
    const effort = focusEffect(family);
    state.partner = { ...copy(state.parents[0]), id: 'partner', age: 30, canGestate: false, married: true, yearsTogether: 2, lastProposalAge: -1 };
    state.children = [0, 3, 12, 25].map((age, i) => ({ ...copy(state.parents[0]), id: `child-${i}`, age, canGestate: false }));
    const result = quietMean(state);
    assert.equal(result.stats.stability, round(5 + (-.3 * focusEffect(state.focus.work) + .3 * effort) * .25), 'adult focus wellbeing uses the stronger coefficients');
    for (const parent of result.parents) {
      assert.equal(parent.relationship, round(5 + effort * .02));
      assert.equal(parent.stats.stability, round(5 + effort * .00625));
    }
    assert.equal(result.partner.relationship, round(5 + effort * .0275));
    assert.equal(result.partner.stats.stability, round(5 + effort * .00875));
    for (let i = 0; i < state.children.length; i++) {
      const child = state.children[i], grown = result.children[i];
      assert.equal(grown.relationship, round(5 + effort * .0325));
      if (child.age >= 18) {
        assert.equal(grown.stats.stability, round(5 + (effort * .045) * .25));
        assert.equal(grown.stats.health, round(5 + effort * .005));
      } else if (child.age === 0) {
        const carePractice = .12 * effort;
        assert.equal(grown.stats.intelligence, round(5 + (.24 + carePractice * .5) * .575));
      } else {
        const toddler = child.age < 5;
        const skillPractice = toddler
          ? { intelligence: 0, strength: 0, social: .165 * effort, creativity: 0 }
          : { intelligence: 0, strength: 0, social: .24 * effort, creativity: 0 };
        for (const key of learned) {
          assert.equal(grown.stats[key], round(5 + skillPractice[key] * .2875), `${child.age}-year-old child ${key} care`);
        }
        const healthPractice = (toddler ? .3 : .105) * effort;
        const stabilityPractice = toddler
          ? .24 * effort
          : .6 * effort;
        assert.equal(grown.stats.health, round(5 + healthPractice * .25));
        assert.equal(grown.stats.stability, round(5 + stabilityPractice * .25));
      }
    }
  }
  const child = stateAt(3);
  child.guardian = { ...copy(child.parents[0]), id: 'guardian', guardianRole: 'aunt' };
  for (const parent of child.parents) parent.abandonedAt = 2;
  child.focus.family = 0;
  const guardian = annualForecast(child).parents.find(parent => parent.id === 'guardian');
  assert.equal(guardian.relationship.change, -.06);
  assert.equal(guardian.stability.change, -.02);
});

test('autonomous family practice halves while event outcomes retain their full effects', () => {
  const state = stateAt(10);
  for (const parent of state.parents) parent.career.focus = 5;
  state.siblings = [{ ...copy(state.parents[0]), id: 'sibling', age: 20, focus: { work: 5, social: 1, family: 1, self: 5 } }];
  const after = quietMean(state);
  for (const parent of after.parents) assert.equal(parent.stats.intelligence, 5.08, 'autonomous career practice is halved before rounding');
  assert.equal(after.siblings[0].stats.intelligence, 5.11, 'autonomous sibling practice is halved');

  const event = stateAt(10);
  event.pendingEvents = [{ eventId: 'extra_lessons', age: 10 }];
  const rng = event.rng;
  assert.equal(resolveEventChoice(event, 'study', 'extra_lessons').ok, true);
  assert.equal(event.stats.intelligence, 5.5, 'direct event gain remains full strength');
  assert.equal(effectiveStats(event).stability, 5, 'ordinary extra lessons have no automatic mental penalty');
  assert.equal(event.effects[0].focusCapacity.standard.social, -2);
  assert.equal(event.rng, rng);
});
