import test from 'node:test';
import assert from 'node:assert/strict';
import { naturalSkillRating, skillChanges, childhoodWellbeing } from '../development.js';
import { createGame, advanceYear, resolveEventChoice, EVENTS, effectiveStats } from '../engine.js';

test('newborn ratings share the adult scale and high innate ability starts high', () => {
  const keys = ['intelligence', 'strength', 'social', 'creativity'];
  const samples = Object.fromEntries(keys.map(key => [key, { all: [], high: [], low: [] }]));
  for (let seed = 820001; seed < 820601; seed++) {
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
    assert.ok(Math.abs(mean(values.all) - 5) < .25, `${key} starts around five`);
    assert.ok(mean(values.high) > 6.3, `${key} high innate ability starts high`);
    assert.ok(mean(values.low) < 3.7, `${key} low innate ability starts low`);
    assert.ok(new Set(values.high).size > 25, `${key} varies even with high ability`);
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
    assert.ok(sd > .25 && sd < 2, `${key} SD ${sd}`);
    assert.ok(new Set(values).size > 50, `${key} varies between lives`);
  }
});
