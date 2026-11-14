import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as game from '../engine.js';
import { getBirthConditions } from '../birth-conditions.js';
import { heightReference } from '../growth.js';
import { avatar, genderBadge, parentLabel } from '../profile-view.js';

const KEYS = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = state => structuredClone(state);
const rounded = (value, places = 2) => Math.round(value * 10 ** places) / 10 ** places;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const symmetric = value => Math.sign(value) * Math.round(Math.abs(value)) || 0;
function reload(state) {
  const before = copy(state);
  assert.equal(game.validateSave(state), true);
  assert.deepEqual(game.migrateSave(JSON.parse(JSON.stringify(state))), before);
  assert.deepEqual(state, before);
}
function parentalTendency(parent) {
  const adult = heightReference(20, parent.growthSex).median, birth = heightReference(0, parent.growthSex).median;
  return clamp(1 + (parent.height * 2.54 - adult) / (adult - birth), .8, 1.2);
}
function assertMeanInheritance(child, parents) {
  const perks = getBirthConditions(child);
  for (const key of KEYS) {
    const rating = parents.reduce((sum, parent) => sum + parent.stats[key], 0) / parents.length;
    assert.equal(child.stats[key], rounded(rating), `${key} inherits the biological parents' base ratings`);
    const affinity = symmetric(parents.reduce((sum, parent) => sum + parent.aptitudes[key], 0) / parents.length);
    const perk = perks.reduce((sum, condition) => sum + (condition.aptitudeChanges[key] || 0), 0);
    assert.equal(child.aptitudes[key], clamp(affinity + perk, -3, 3), `${key} inherits both affinities before recorded perks`);
  }
  assert.equal(child.growthFactor, rounded(parents.reduce((sum, parent) => sum + parentalTendency(parent), 0) / parents.length, 4));
  assert.equal(child.adultHeight, null, 'inheritance supplies a tendency, never a predetermined adult endpoint');
}
function adult(api = game, seed = 510031) {
  const state = api.createGame({ seed, gender: 'male', firstName: 'Alex', surname: 'Inheritance' });
  while (state.age < 18) assert.equal(api.advanceYear(state, calm).ok, true);
  assert.equal(api.chooseEducation(state, 'work').ok, true);
  state.money = 1000000;
  state.stats.social = 10; state.stats.attractiveness = 10;
  return state;
}
function conceived(api = game) {
  let state = adult(api);
  while (!state.encounters.length && state.age < 30) assert.equal(api.advanceYear(state, calm).ok, true);
  assert.ok(state.encounters.length);
  let coupled;
  for (let rng = 1; rng <= 100 && !coupled; rng++) {
    const candidate = copy(state); candidate.rng = rng;
    const result = api.respondToEncounter(candidate, candidate.encounters[0].id, 'relationship');
    if (result.ok && result.accepted) coupled = candidate;
  }
  assert.ok(coupled, 'an actual accepted encounter produces the co-parent');
  let married;
  for (let rng = 1; rng <= 100 && !married; rng++) {
    const candidate = copy(coupled); candidate.rng = rng;
    const result = api.proposeMarriage(candidate);
    if (result.ok && result.accepted) married = candidate;
  }
  assert.ok(married, 'an actual accepted proposal creates the pregnancy fixture');
  married.partner.age = 25;
  for (const key of KEYS) {
    married.stats[key] = 2; married.aptitudes[key] = -2;
    married.partner.stats[key] = 8; married.partner.aptitudes[key] = 2;
  }
  married.height = married.adultHeight = 74; married.growthFactor = .8;
  married.partner.height = married.partner.adultHeight = 66; married.partner.growthFactor = .8;
  married.conditions = []; married.partner.conditions = [];
  married.focus = { work: 2, social: 2, family: 2, self: 2 };
  assert.equal(api.validateSave(married), true);
  for (let rng = 1; rng <= 150; rng++) {
    const candidate = copy(married); candidate.rng = rng;
    assert.equal(api.advanceYear(candidate, calm).ok, true);
    if (candidate.pregnancy) {
      assert.equal(api.validateSave(candidate), true);
      return candidate;
    }
  }
  assert.fail('a real married annual roll should conceive within the seeded fixture cohort');
}

test('new games use both parents for every inherited stat, affinity and height tendency at zero variation', () => {
  const previous = game.GENETICS_BALANCE.randomness;
  let withPerks = 0;
  try {
    game.GENETICS_BALANCE.randomness = 0;
    for (let seed = 1; seed <= 32; seed++) {
      const state = game.createGame({ seed });
      assertMeanInheritance(state, state.parents);
      if (state.conditions.length) withPerks++;
      reload(state);
    }
  } finally { game.GENETICS_BALANCE.randomness = previous; }
  assert.ok(withPerks > 0, 'the deterministic inheritance check includes real newborn perk adjustments');
});

test('a saved real pregnancy uses the captured biological co-parent after breakup and preserves legacy temporary modifiers', () => {
  const previous = game.GENETICS_BALANCE.randomness;
  try {
    game.GENETICS_BALANCE.randomness = 0;
    const state = conceived(), captured = copy(state.pregnancy.otherParent), formerPartner = state.partner;
    reload(state);
    assert.equal(game.endRelationship(state).ok, true);
    assert.deepEqual(state.pregnancy.otherParent, captured);
    // This object is no longer part of the state. A captured pregnancy must not
    // consult it again, even if its later abilities or stature are different.
    formerPartner.stats = Object.fromEntries(KEYS.map(key => [key, 0]));
    formerPartner.aptitudes = Object.fromEntries(KEYS.map(key => [key, -3]));
    formerPartner.height = 50;
    state.effects.push({ id: 'saved-pregnancy-bonus', name: 'Saved support', description: '', years: 2, kind: 'positive', modifiers: { intelligence: 5, social: 5, health: 5 } });
    reload(state);
    const encoded = JSON.stringify(state), replay = game.migrateSave(JSON.parse(encoded));
    assert.equal(game.advanceYear(state, calm).ok, true);
    assert.equal(game.advanceYear(replay, calm).ok, true);
    assert.deepEqual(state, replay, 'the same saved pregnancy and seeded stream produce exactly the same newborn');
    assert.equal(state.pregnancy, null);
    const child = state.children.at(-1);
    assert.equal(child.adopted, false);
    assert.deepEqual(child.parentIds, [state.id, captured.id]);
    assertMeanInheritance(child, [state, captured]);
    assert.ok(child.growthFactor > 1, 'attained tall parental heights override both stale .8 tendencies');
    assert.equal(state.effects.find(effect => effect.id === 'saved-pregnancy-bonus').years, 1);
    reload(state);
  } finally { game.GENETICS_BALANCE.randomness = previous; }
});

test('adoption stays independent of adoptive parental traits and the biological randomness control', () => {
  const state = adult(), low = copy(state), high = copy(state), previous = game.GENETICS_BALANCE.randomness;
  for (const key of KEYS) {
    low.stats[key] = 0; low.aptitudes[key] = -3;
    high.stats[key] = 10; high.aptitudes[key] = 3;
  }
  low.height = low.adultHeight = 55; low.growthFactor = .8;
  high.height = high.adultHeight = 80; high.growthFactor = 1.2;
  try {
    game.GENETICS_BALANCE.randomness = 0;
    assert.equal(game.haveChild(low).ok, true);
    game.GENETICS_BALANCE.randomness = 2;
    assert.equal(game.haveChild(high).ok, true);
  } finally { game.GENETICS_BALANCE.randomness = previous; }
  assert.deepEqual(low.children[0], high.children[0]);
  assert.equal(low.children[0].adopted, true);
  assert.equal(low.rng, high.rng);
  assert.ok(KEYS.some(key => low.children[0].stats[key] !== 0 && low.children[0].stats[key] !== 10));
  reload(low); reload(high);
});

test('genetic spread changes new outcomes reproducibly without changing the seeded draw count', () => {
  const previous = game.GENETICS_BALANCE.randomness;
  try {
    for (let seed = 50; seed < 60; seed++) {
      game.GENETICS_BALANCE.randomness = 0;
      const fixed = game.createGame({ seed });
      game.GENETICS_BALANCE.randomness = 2;
      const varied = game.createGame({ seed }), replay = game.createGame({ seed });
      assert.deepEqual(varied, replay);
      assert.equal(fixed.rng, varied.rng);
      assert.equal(fixed.nextId, varied.nextId);
      assert.deepEqual(fixed.parents, varied.parents, 'the independent founder population is unchanged by the child inheritance control');
      assert.notDeepEqual(fixed.stats, varied.stats);
      assert.deepEqual(fixed.conditions, varied.conditions);
      reload(fixed); reload(varied);
    }
  } finally { game.GENETICS_BALANCE.randomness = previous; }
});

test('genuine pre-genetics lives and saved pregnancies remain exact on current reads and reloads', async t => {
  const path = new URL('../.git/dating-genetics-baseline/engine.js', import.meta.url);
  if (!existsSync(path)) return t.skip('optional complete pre-genetics baseline is not present in this checkout');
  const baseline = await import(path.href), snapshots = [];
  for (const seed of [13, 91, 1024]) {
    const state = baseline.createGame({ seed }); snapshots.push(copy(state));
    while (state.age < 18) {
      assert.equal(baseline.advanceYear(state, calm).ok, true);
      if ([5, 12, 18].includes(state.age)) snapshots.push(copy(state));
    }
  }
  const pregnancy = conceived(baseline); snapshots.push(copy(pregnancy));
  for (const original of snapshots) {
    const state = game.migrateSave(copy(original));
    assert.deepEqual(state, original);
    for (const person of [state, ...state.parents, ...state.children, state.partner, state.pregnancy?.otherParent].filter(Boolean)) {
      avatar(person); genderBadge(person); parentLabel(person);
    }
    game.annualForecast(state); game.eventOdds(state); game.offeredColleges(state);
    assert.deepEqual(state, original, 'profile rendering, forecasts and menu reads do not reroll existing traits');
    reload(state);
  }
  const previous = game.GENETICS_BALANCE.randomness;
  try {
    game.GENETICS_BALANCE.randomness = 0;
    const state = game.migrateSave(copy(pregnancy)), otherParent = copy(state.pregnancy.otherParent);
    assert.equal(game.endRelationship(state).ok, true);
    assert.equal(game.advanceYear(state, calm).ok, true);
    assertMeanInheritance(state.children.at(-1), [state, otherParent]);
    reload(state);
  } finally { game.GENETICS_BALANCE.randomness = previous; }
  t.diagnostic(`${snapshots.length} genuine pre-change snapshots retained exactly, including a saved pregnancy`);
});
