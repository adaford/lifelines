import test from 'node:test';
import assert from 'node:assert/strict';
import { naturalSkillRating, skillChanges, childhoodWellbeing, infantChoiceEffects, wellbeingResponse, TODDLER_FOCUS } from '../development.js';
import { createGame, advanceYear, resolveEventChoice, EVENTS, effectiveStats } from '../engine.js';
import { eventChances } from '../events.js';

test('newborn ratings span the scale around five with broad variation and aptitude correlation', () => {
  const learned = ['intelligence', 'strength', 'social', 'creativity'];
  const keys = [...learned, 'attractiveness', 'health', 'stability'];
  const samples = Object.fromEntries(keys.map(key => [key, { all: [], high: [], low: [] }]));
  for (let seed = 820001; seed < 822001; seed++) {
    const state = createGame({ seed });
    for (const key of keys) {
      const value = state.stats[key];
      samples[key].all.push(value);
      if (state.aptitudes[key] >= 2) samples[key].high.push(value);
      if (state.aptitudes[key] <= -2) samples[key].low.push(value);
    }
  }
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  for (const [key, values] of Object.entries(samples)) {
    const average = mean(values.all);
    const sd = Math.sqrt(mean(values.all.map(value => (value - average) ** 2)));
    assert.ok(Math.abs(average - 5) < .2, `${key} starts around five: ${average}`);
    assert.ok(sd > 1.75 && sd < 2.7, `${key} has broad variation: ${sd}`);
    assert.equal(Math.min(...values.all), 1, `${key} can start at the bottom of the scale`);
    assert.equal(Math.max(...values.all), 10, `${key} can start at the top of the scale`);
    if (learned.includes(key) || ['health', 'stability'].includes(key)) {
      assert.ok(mean(values.high) > mean(values.low) + 2, `${key} aptitude shifts the distribution`);
      assert.ok(values.high.some(value => value < 5), `${key} high aptitude does not fix the starting score`);
      assert.ok(values.low.some(value => value > 5), `${key} low aptitude does not fix the starting score`);
    }
  }
});

test('lifetime focus produces substantial gains, losses, and reversals without fixing a final score', () => {
  const person = {
    age: 20, alive: true,
    stats: { intelligence: 5, strength: 5, social: 5, creativity: 5 },
    aptitudes: { intelligence: 0, strength: 0, social: 0, creativity: 0 },
    focus: { work: 3, social: 3, family: 3, self: 3 },
  };
  assert.deepEqual(skillChanges(person), { intelligence: 0, strength: 0, social: 0, creativity: 0 });
  const practice = { work: 5, social: 1, family: 1, self: 5 };
  const neglect = { work: 1, social: 5, family: 5, self: 1 };
  const advance = (state, focus, years) => {
    state.focus = focus;
    for (let year = 0; year < years; year++) {
      for (const [key, change] of Object.entries(skillChanges(state))) state.stats[key] = Math.max(1, Math.min(10, state.stats[key] + change));
      state.age++;
    }
    return state;
  };
  const trained = advance(structuredClone(person), practice, 10);
  const neglected = advance(structuredClone(person), neglect, 10);
  assert.ok(trained.stats.intelligence > 6.8);
  assert.ok(neglected.stats.intelligence < 3.2);
  const previous = trained.stats.intelligence;
  advance(trained, neglect, 10);
  assert.ok(trained.stats.intelligence < previous - 1.8);
  assert.ok(trained.stats.intelligence < 5);
  assert.deepEqual(person.stats, { intelligence: 5, strength: 5, social: 5, creativity: 5 });
});

test('aptitude helps learning and retention while care and older-age focus still matter', () => {
  const person = aptitude => ({
    age: 25, alive: true,
    stats: { intelligence: naturalSkillRating(aptitude) }, aptitudes: { intelligence: aptitude },
    focus: { work: 5, social: 1, family: 1, self: 5 },
  });
  assert.ok(skillChanges(person(3)).intelligence > skillChanges(person(0)).intelligence);
  const neglected = aptitude => ({ ...person(aptitude), focus: { work: 1, social: 5, family: 5, self: 1 } });
  assert.ok(skillChanges(neglected(3)).intelligence > skillChanges(neglected(0)).intelligence);
  assert.ok(skillChanges(neglected(3)).intelligence < 0);
  const older = skillChanges({ ...person(0), age: 75 });
  assert.ok(older.intelligence > .1 && older.intelligence < skillChanges(person(0)).intelligence);
  const baby = { ...person(0), age: 0, cryLevel: 3 };
  assert.ok(skillChanges({ ...baby, careFocus: 5 }).intelligence > skillChanges({ ...baby, careFocus: 1 }).intelligence);
  assert.ok(skillChanges({ ...baby, cryLevel: 5 }).social > skillChanges({ ...baby, cryLevel: 1 }).social);
  assert.deepEqual(skillChanges({ ...person(0), alive: false }), { intelligence: 0, strength: 0, social: 0, creativity: 0 });
});

test('childhood wellbeing recovers toward its usual range while choices still matter', () => {
  const child = { age: 10, alive: true, stats: { health: 5, stability: 5 }, focus: { work: 3, social: 3, family: 3, self: 3 } };
  const low = childhoodWellbeing({ ...child, stats: { health: 2, stability: 2 } });
  const high = childhoodWellbeing({ ...child, stats: { health: 9, stability: 9 } });
  assert.ok(low.health > 0 && low.stability > 0);
  assert.ok(high.health < 0 && high.stability < 0);
  const rested = childhoodWellbeing({ ...child, focus: { work: 1, social: 2, family: 4, self: 5 } });
  const strained = childhoodWellbeing({ ...child, focus: { work: 5, social: 3, family: 3, self: 1 } });
  assert.ok(rested.health > strained.health);
  assert.ok(rested.stability > strained.stability);
  const baby = { ...child, age: 0 };
  assert.ok(childhoodWellbeing({ ...baby, cryLevel: 5 }).health > childhoodWellbeing({ ...baby, cryLevel: 1 }).health);
  assert.deepEqual(childhoodWellbeing({ ...child, age: 18 }), { health: 0, stability: 0 });
  assert.deepEqual(childhoodWellbeing({ ...child, alive: false }), { health: 0, stability: 0 });
  assert.deepEqual(child.stats, { health: 5, stability: 5 });
});

test('crying choice effects isolate the selected level from background development and care', () => {
  for (const age of [0, 1]) for (const aptitude of [-3, 0, 3]) for (const careFocus of [1, 3, 5]) {
    const baby = { age, alive: true, careFocus,
      stats: { intelligence: 2, strength: 8, social: 4, creativity: 7, health: 9, stability: 2 },
      aptitudes: { intelligence: aptitude, strength: aptitude, social: aptitude, creativity: aptitude, health: aptitude, stability: aptitude } };
    const before = structuredClone(baby);
    const levels = Array.from({ length: 5 }, (_, index) => ({ ...baby, cryLevel: index + 1 }));
    const choices = levels.map(infantChoiceEffects);
    for (let index = 0; index < choices.length; index++) {
      const effect = choices[index];
      assert.equal(effect.strength, 0);
      for (const key of ['intelligence', 'stability']) assert.ok(index < 2 ? effect[key] < 0 : effect[key] > 0);
      if (index === 0) continue;
      assert.ok(effect.intelligence > choices[index - 1].intelligence);
      assert.ok(effect.stability > choices[index - 1].stability);
      for (const key of ['intelligence', 'strength', 'social', 'creativity']) {
        const annualDifference = skillChanges(levels[index])[key] - skillChanges(levels[0])[key];
        assert.ok(Math.abs(annualDifference - (effect[key] - choices[0][key])) < 1e-10,
          `${key} preview isolates exactly the effect used in the annual mean`);
      }
      for (const key of ['health', 'stability']) {
        const annualDifference = childhoodWellbeing(levels[index])[key] - childhoodWellbeing(levels[0])[key];
        assert.ok(Math.abs(annualDifference - (effect[key] - choices[0][key])) < 1e-10);
      }
    }
    assert.deepEqual(baby, before, 'reading choice effects is pure');
    for (const inactive of [{ ...baby, age: 2 }, { ...baby, alive: false }]) {
      assert.ok(Object.values(infantChoiceEffects(inactive)).every(effect => effect === 0));
    }
  }
});

test('natural resilience boosts routine wellbeing gains and buffers losses without changing reversion', () => {
  for (const key of ['health', 'stability']) {
    assert.equal(wellbeingResponse({}, key, .2), .2, 'missing legacy aptitude is neutral');
    assert.equal(wellbeingResponse({ aptitudes: { [key]: 0 } }, key, -.2), -.2);
    assert.equal(wellbeingResponse({ aptitudes: { [key]: 3 } }, key, 0), 0);
    assert.ok(wellbeingResponse({ aptitudes: { [key]: 3 } }, key, .2) > .2);
    assert.ok(wellbeingResponse({ aptitudes: { [key]: -3 } }, key, .2) < .2);
    assert.ok(wellbeingResponse({ aptitudes: { [key]: 3 } }, key, -.2) > -.2);
    assert.ok(wellbeingResponse({ aptitudes: { [key]: -3 } }, key, -.2) < -.2);
  }
  for (const age of [2, 4, 5, 10, 17]) {
    const toddler = age < 5;
    const person = { age, alive: true, stats: { health: 2, stability: 9 },
      focus: toddler ? { ...TODDLER_FOCUS } : { work: 3, social: 3, family: 3, self: 3 } };
    const before = structuredClone(person);
    const withAptitude = aptitude => ({ ...person, aptitudes: { health: aptitude, stability: aptitude } });
    const neutral = childhoodWellbeing(person);
    for (const aptitude of [-3, 0, 3]) assert.deepEqual(childhoodWellbeing(withAptitude(aptitude)), neutral,
      'natural resilience does not scale the background return toward wellbeing targets');
    const positive = toddler ? { work: 1, social: 1, family: 5, self: 5, creative: 0 } : { work: 1, social: 3, family: 3, self: 5 };
    const negative = toddler ? { work: 5, social: 5, family: 1, self: 1, creative: 0 } : { work: 5, social: 3, family: 3, self: 1 };
    for (const focus of [positive, negative]) {
      const values = [-3, 0, 3].map(aptitude => childhoodWellbeing({ ...withAptitude(aptitude), focus }));
      for (const key of ['health', 'stability']) {
        assert.ok(values[0][key] < values[1][key] && values[1][key] < values[2][key], `${key} responds to natural resilience at age ${age}`);
        const change = values[1][key] - neutral[key];
        assert.ok(focus === positive ? change > 0 : change < 0);
      }
    }
    assert.deepEqual(person, before, 'reading wellbeing responses never mutates the person');
  }
});

test('toddler play, electronics and crafts have distinct development effects', () => {
  const toddler = { age: 2, alive: true, cryLevel: 3,
    stats: { intelligence: 5, strength: 5, social: 5, creativity: 5, health: 5, stability: 5 },
    aptitudes: { intelligence: 0, strength: 0, social: 0, creativity: 0 },
    focus: { work: 2, social: 2, family: 2, self: 2 } };
  const option = key => ({ ...toddler, focus: { ...toddler.focus, [key]: 5 } });
  for (const age of [2, 3, 4]) {
    toddler.age = age;
    const base = skillChanges(toddler), play = skillChanges(option('work')), explore = skillChanges(option('social'));
    assert.ok(play.strength > base.strength && play.social > base.social && play.creativity === base.creativity);
    assert.ok(explore.intelligence > base.intelligence && explore.social < base.social && explore.creativity === base.creativity);
    assert.deepEqual(skillChanges(option('self')), base, 'rest does not teach skills');
    const rested = childhoodWellbeing(option('self')), usual = childhoodWellbeing(toddler);
    assert.ok(rested.health > usual.health && rested.stability > usual.stability);
    assert.deepEqual(childhoodWellbeing(option('work')), childhoodWellbeing(option('social')), 'play has no school-work stress penalty');
    const family = { ...toddler, focus: { work: 3, social: 1, family: 5, self: 3 } };
    const exploring = { ...toddler, focus: { work: 3, social: 5, family: 1, self: 3 } };
    assert.ok(childhoodWellbeing(family).stability > childhoodWellbeing(exploring).stability);
    assert.deepEqual(skillChanges({ ...toddler, cryLevel: 1 }), skillChanges({ ...toddler, cryLevel: 5 }));
    assert.deepEqual(childhoodWellbeing({ ...toddler, cryLevel: 1 }), childhoodWellbeing({ ...toddler, cryLevel: 5 }));
  }
  const baby = { ...toddler, age: 1 };
  assert.ok(skillChanges({ ...baby, cryLevel: 5 }).social > skillChanges({ ...baby, cryLevel: 1 }).social);
});

test('toddler events follow play, electronics and crafts while school events begin at five', () => {
  const stats = Object.fromEntries(['intelligence', 'strength', 'social', 'creativity', 'attractiveness', 'health', 'stability'].map(key => [key, 5]));
  const state = { age: 2, focus: { work: 2, social: 2, family: 2, self: 2 }, lifestyle: 5, education: { status: 'school' } };
  const odds = person => Object.fromEntries(eventChances(person, stats).map(event => [event.id, event.chance]));
  for (const age of [2, 3, 4]) {
    const chances = odds({ ...state, age });
    for (const event of EVENTS.filter(event => event.category === 'School')) assert.equal(chances[event.id], 0);
    assert.ok(chances.treehouse > 0 && chances.child_library > 0 && chances.child_art > 0);
    for (const id of ['school_play', 'learning_bike', 'child_pet', 'child_argument']) assert.equal(chances[id], 0);
  }
  const play = odds({ ...state, focus: { ...state.focus, work: 5 } });
  const explore = odds({ ...state, focus: { ...state.focus, social: 5 } });
  const rest = odds({ ...state, focus: { ...state.focus, self: 5 } });
  const crafts = odds({ ...state, focus: { ...state.focus, creative: 5 } });
  assert.ok(crafts.treehouse > play.treehouse && crafts.child_art > play.child_art);
  assert.ok(play.stamina_gain > rest.stamina_gain);
  assert.ok(explore.child_library > rest.child_library);
  assert.ok(odds({ ...state, age: 5 }).good_grades > 0);
});

test('independent game lives reach age 18 with average ratings near five and retain variation', () => {
  const keys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
  const samples = Object.fromEntries(keys.map(key => [key, []]));
  const events = new Map(EVENTS.map(event => [event.id, event]));
  for (const [index, gender] of ['male', 'female'].entries()) for (let sample = 0; sample < 400; sample++) {
    const seed = 750001 + index * 1000000 + sample;
    const state = createGame({ seed, gender });
    state.cryLevel = 3;
    let choiceSeed = (seed ^ 0xA5A5A5A5) >>> 0;
    while (state.age < 18 && state.alive) {
      state.focus = state.age >= 2 && state.age < 5 ? { ...TODDLER_FOCUS } : { work: 3, social: 3, family: 3, self: 3 };
      assert.equal(advanceYear(state).ok, true);
      while (state.pendingEvents.length) {
        const pending = state.pendingEvents[0];
        const choices = events.get(pending.eventId).choices;
        choiceSeed = (Math.imul(choiceSeed, 1664525) + 1013904223) >>> 0;
        const choice = choices[Math.floor(choiceSeed / 4294967296 * choices.length)];
        assert.equal(resolveEventChoice(state, choice.id, pending.eventId, pending.subjectId).ok, true);
      }
    }
    if (!state.alive) continue;
    const stats = effectiveStats(state);
    for (const key of keys) samples[key].push(stats[key]);
  }
  for (const [key, values] of Object.entries(samples)) {
    assert.ok(values.length > 750);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
    assert.ok(Math.abs(average - 5) < .2, `${key} mean ${average}`);
    assert.ok(sd > .25 && sd < 3, `${key} SD ${sd}`);
    assert.ok(new Set(values).size > 50, `${key} varies between lives`);
  }
});
