import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS as PERSONAL_EVENTS, eventChances } from '../events.js';
import { EVENTS, createGame, advanceYear, eventOdds, effectiveStats, validateSave, migrateSave } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';
import { changedRating } from '../rating-changes.js';

const stats = ['health', 'stability', 'intelligence', 'strength', 'social', 'creativity', 'attractiveness', 'lifestyle'];
const additions = PERSONAL_EVENTS.filter(event => event.id.startsWith('low_stat_'));
const expectedChanges = {
  low_stat_confusing_toy: {},
  low_stat_unfamiliar_visitor: {},
  low_stat_changed_play_game: { social: -.15 },
  low_stat_unkind_appearance_remark: { social: -.15 },
  low_stat_missed_playgroup: { social: -.15 },
  low_stat_missing_materials: { creativity: -.15, social: -.1 },
};
const metadata = new Map(PERSONAL_EVENTS.map(event => [event.id, event]));
const copy = value => structuredClone(value);
const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function fixture(age = 8) {
  const state = createGame({ seed: 92501 });
  state.age = age;
  state.education = { status: age < 18 ? 'school' : 'workforce', years: 0 };
  state.focus = defaultFocus(age);
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  state.effects = [];
  state.conditions = [];
  state.jobId = null;
  state.lifestyle = 5;
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
    person.lifestyle = 5;
  }
  return state;
}
function setRating(state, key, value) {
  if (key === 'lifestyle') state.lifestyle = value;
  else state.stats[key] = value;
}
const related = (rates, key) => rates.filter(rate => rate.chance > 0 && !metadata.get(rate.id)?.rare
  && metadata.get(rate.id)?.statFactors?.some(([stat, direction]) => stat === key && direction === 'low'));
const anyChance = rates => 1 - rates.reduce((none, rate) => none * (1 - rate.chance), 1);

test('six original minor definitions remain available without inventing consequences for retired incidents', () => {
  assert.equal(additions.length, 6);
  const ordinaryCatalog = EVENTS.filter(event => event.category !== 'Fame' && !event.supplemental);
  assert.equal(ordinaryCatalog.length, 352);
  assert.equal(ordinaryCatalog.filter(event => event.choices).length, 73);
  for (const event of additions) {
    assert.equal(event.category, 'Everyday setbacks');
    assert.equal(event.severity, 'minor');
    assert.equal(event.kind, 'negative');
    assert.equal(event.choices, undefined);
    assert.equal(event.baseChance, .006);
    assert.equal(event.years, 0);
    assert.deepEqual(event.modifiers, {});
    const [[key, direction]] = event.statFactors;
    assert.equal(direction, 'low');
    assert.deepEqual(event.maxStats, { [key]: 4 });
    const changes = event.statChanges || {};
    assert.deepEqual(changes, expectedChanges[event.id], 'ordinary upset adds no mental penalty; lost practice retains its own skill effects');
    assert.equal(changes[key], undefined, 'any rating consequence affects a different rating');
    assert.ok(Object.values(changes).every(amount => amount < 0 && amount >= -.2));
  }
});

test('retained raw catalog probability rules preserve their low-stat floor without rewriting definitions', () => {
  for (const age of [0, 3, 8, 15, 25, 70]) for (const key of stats) {
    for (const rating of [0, 2, 3, 5]) {
      const state = fixture(age);
      setRating(state, key, rating);
      const before = copy(state);
      const rates = eventChances(state, effectiveStats(state));
      const pool = related(rates, key);
      if (rating <= 2) {
        assert.ok(pool.length > 0, `${age}/${key}: an eligible pool exists`);
        assert.ok(anyChance(pool) >= (rating === 0 ? .6 : .5) - 1e-9, `${age}/${key}/${rating}: ${anyChance(pool)}`);
      }
      if (rating < 4) assert.ok(pool.length > 0);
      if (rating === 5) assert.ok(rates.filter(rate => rate.id.startsWith('low_stat_')).every(rate => rate.chance === 0));
      assert.ok(rates.every(rate => Number.isFinite(rate.chance) && rate.chance >= 0 && rate.chance <= .6));
      assert.deepEqual(state, before, 'odds never modify stats, allocations, history, or RNG');
    }
  }
});

test('new maximum-stat gates use effective values and preserve age and inactivity restrictions', () => {
  for (const event of additions) {
    const [[key]] = event.statFactors;
    const state = fixture(event.minAge);
    const chance = candidate => eventChances(candidate, effectiveStats(candidate)).find(rate => rate.id === event.id).chance;
    setRating(state, key, 4);
    assert.ok(chance(state) > 0, event.id);
    setRating(state, key, 4.01);
    assert.equal(chance(state), 0, event.id);
    setRating(state, key, 1);
    assert.equal(chance({ ...state, age: event.maxAge + 1 }), 0);
    if (event.minAge > 0) assert.equal(chance({ ...state, age: event.minAge - 1 }), 0);
    assert.equal(chance({ ...state, ended: true }), 0);
    assert.equal(chance({ ...state, needsSuccession: true }), 0);
  }
  const child = fixture(3);
  child.effects = [{ id: 'saved-confusion', name: 'Saved modifier', description: '', years: 1, modifiers: { intelligence: -4 }, kind: 'negative' }];
  const before = copy(child);
  assert.ok(eventChances(child, effectiveStats(child)).find(rate => rate.id === 'low_stat_confusing_toy').chance >= .55 - 1e-9, 'its historical catalog gate still reads effective Intelligence');
  assert.equal(eventOdds(child).find(rate => rate.id === 'low_stat_confusing_toy').chance, 0, 'a consequence-free definition cannot roll in new play');
  assert.deepEqual(child, before);
  assert.deepEqual(migrateSave(copy(child)), child);
  const life = fixture(3);
  assert.equal(eventChances(life, { ...life.stats, lifestyle: 1 }).find(rate => rate.id === 'low_stat_missed_playgroup').chance, 0, 'lifestyle comes from the actual household rating');
});

test('report-card events are filtered before low-stat rates are distributed', () => {
  const state = fixture(12);
  state.stats.intelligence = 0;
  state.focus.work = 4;
  let rates = eventChances(state, effectiveStats(state));
  assert.equal(rates.find(rate => rate.id === 'poor_grades').chance, 0, 'high study earns a passing report even with low intelligence');
  state.stats.intelligence = 5;
  state.focus.work = 2;
  rates = eventChances(state, effectiveStats(state));
  assert.equal(rates.find(rate => rate.id === 'good_grades').chance, 0);
  state.focus.work = 4;
  rates = eventChances(state, effectiveStats(state));
  assert.ok(rates.find(rate => rate.id === 'good_grades').chance > 0);
});

test('incidents with retained outcomes still roll while empty originals have zero odds and never record', () => {
  for (const event of additions) {
    const [[source]] = event.statFactors;
    const original = fixture(event.minAge);
    setRating(original, source, 1);
    if (!Object.keys(event.statChanges || {}).length) {
      assert.equal(eventOdds(original).find(rate => rate.id === event.id).chance, 0);
      assert.equal(advanceYear(original, { ...calm, eventRandom: () => 0 }).ok, true);
      assert.ok(!original.lastYearEvents.includes(event.id));
      assert.ok(!original.yearSummary.events.some(entry => entry.title === event.name));
      assert.equal(validateSave(original), true);
      assert.deepEqual(migrateSave(copy(original)), original);
      continue;
    }
    let found;
    for (let attempt = 1; attempt <= 300; attempt++) {
      const state = copy(original);
      state.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(state, calm).ok, true);
      assert.ok(state.lastYearEvents.length <= 5);
      if (state.lastYearEvents.includes(event.id)) { found = state; break; }
    }
    assert.ok(found, event.id);
    const record = found.yearSummary.events.find(entry => entry.title === event.name);
    assert.equal(record.description, event.description);
    const changes = event.statChanges || {};
    assert.doesNotMatch(record.text, /No stat changes/);
    for (const [key, amount] of Object.entries(changes)) {
      const label = key === 'stability' ? 'mental stability' : key;
      const values = record.text.match(new RegExp(`Your ${label} (\\d+(?:\\.\\d+)?) → (\\d+(?:\\.\\d+)?)`));
      assert.ok(values, `${event.id}/${key}`);
      assert.equal(Number(values[2]), changedRating(Number(values[1]), amount));
    }
    assert.equal(found.effects.some(effect => effect.id === event.id), false);
    const before = copy(found);
    assert.equal(validateSave(found), true, event.id);
    assert.deepEqual(migrateSave(copy(found)), before);
    assert.deepEqual(found, before, 'validation and reloading preserve ratings, history, and RNG');
  }
});
