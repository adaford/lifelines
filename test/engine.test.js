import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, JOBS, EVENTS, createGame, stage, advanceYear, setBabyChoice, setFocus, effectiveStats, currentEffects, eventOdds, jobFit, canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed, lifestyleFromResources, validateSave } from '../engine.js';

const copy = value => JSON.parse(JSON.stringify(value));
const adult = (seed = 22) => { const s = createGame({ seed }); for (let i = 0; i < 18; i++) advanceYear(s); return s; };

test('a new life starts at zero with complete, bounded inherited traits and parents', () => {
  const state = createGame({ name: 'Test Family', seed: 12 });
  assert.equal(state.age, 0); assert.equal(state.height, 50); assert.equal(state.parents.length, 2);
  assert.equal(stage(state), 'baby'); assert.equal(validateSave(state), true);
  assert.equal(JOBS.length, 10); assert.equal(EVENTS.length, 10);
  for (const skill of SKILLS) assert.ok(state.aptitudes[skill.key] >= -3 && state.aptitudes[skill.key] <= 3);
  assert.deepEqual(createGame({ seed: 12 }), createGame({ seed: 12 }));
});

test('one click advances exactly one year, infancy unlocks focus at three and height stops at 18', () => {
  const state = createGame({ seed: 1 });
  assert.equal(setFocus(state, 'work', 0).ok, false);
  for (let age = 1; age <= 19; age++) { assert.equal(advanceYear(state).ok, true); assert.equal(state.age, age); }
  assert.equal(state.height, state.adultHeight); assert.equal(stage(state), 'adult');
  assert.equal(setBabyChoice(state, 'cry').ok, false);
});

test('crying improves development more but stresses both parents', () => {
  const cry = createGame({ seed: 3 }), quiet = copy(cry);
  setBabyChoice(cry, 'cry'); setBabyChoice(quiet, 'quiet');
  advanceYear(cry); advanceYear(quiet);
  for (const skill of SKILLS) assert.ok(cry.stats[skill.key] > quiet.stats[skill.key]);
  for (let i = 0; i < 2; i++) assert.ok(cry.parents[i].stats.instability > quiet.parents[i].stats.instability);
});

test('aptitude changes development speed without leaving the stat scale', () => {
  const fast = createGame({ seed: 4 }), slow = copy(fast);
  fast.aptitudes.intelligence = 3; slow.aptitudes.intelligence = -3;
  setBabyChoice(fast, 'cry'); setBabyChoice(slow, 'cry');
  advanceYear(fast); advanceYear(slow);
  assert.ok(fast.stats.intelligence > slow.stats.intelligence);
});

test('focus has four independent 0–5 values and a hard 12-point budget', () => {
  const state = adult();
  assert.equal(setFocus(state, 'work', 5).ok, false);
  assert.equal(setFocus(state, 'social', 1).ok, true);
  assert.equal(setFocus(state, 'work', 5).ok, true);
  assert.equal(setFocus(state, 'self', 5.1).ok, false);
  assert.equal(setFocus(state, 'unknown', 0).ok, false);
  assert.equal(setFocus(state, 'work', -1).ok, false);
});

test('event chances are absolute, leave quiet years and respond to choices and instability', () => {
  const state = adult();
  const chance = id => eventOdds(state).find(event => event.id === id).chance;
  state.stats.instability = 1; const low = chance('crisis');
  state.stats.instability = 10; assert.ok(chance('crisis') > low);
  state.focus.social = 0; const isolated = chance('friendship');
  state.focus.social = 5; assert.ok(chance('friendship') > isolated);
  assert.ok(eventOdds(state).reduce((n, event) => n + event.chance, 0) <= .72000001);
  assert.equal(eventOdds(createGame({ seed: 1 })).find(event => event.id === 'crisis').chance, 0);
});

test('temporary effects modify effective stats and expire without permanently changing base stats', () => {
  const state = createGame({ seed: 7 });
  state.effects.push({ id: 'test', name: 'Test', description: '', years: 1, modifiers: { strength: 2 } });
  assert.equal(effectiveStats(state).strength, Math.round((state.stats.strength + 2) * 100) / 100);
  advanceYear(state);
  assert.equal(currentEffects(state).some(effect => effect.id === 'test'), false);
  assert.ok(state.stats.strength < 4);
});

test('jobs respect age and requirements; fit and focus influence earnings and lifestyle', () => {
  const state = createGame({ seed: 8 });
  assert.equal(canTakeJob(state, JOBS[0]).ok, false);
  state.age = 25;
  for (const skill of SKILLS) state.stats[skill.key] = 8;
  assert.equal(takeJob(state, 'doctor').ok, true);
  const stronger = copy(state), weaker = copy(state);
  stronger.focus = { work: 5, social: 2, family: 2, self: 3 };
  weaker.focus = { work: 0, social: 4, family: 4, self: 4 };
  weaker.stats.intelligence = 3;
  assert.ok(jobFit(stronger, 'doctor') > jobFit(weaker, 'doctor'));
  advanceYear(stronger); advanceYear(weaker);
  assert.ok(stronger.income > weaker.income); assert.ok(stronger.money > 0); assert.ok(stronger.lifestyle > 1);
  assert.equal(quitJob(stronger).ok, true); advanceYear(stronger); assert.equal(stronger.income, 0);
});

test('family focus improves children, and births are limited to one per year', () => {
  const caring = adult(9);
  assert.equal(haveChild(caring).ok, true); assert.equal(haveChild(caring).ok, false);
  const distant = copy(caring);
  caring.focus = { work: 2, social: 2, family: 5, self: 3 };
  distant.focus = { work: 4, social: 4, family: 0, self: 4 };
  advanceYear(caring); advanceYear(distant);
  assert.equal(caring.children[0].age, 1);
  for (const skill of SKILLS) assert.ok(caring.children[0].stats[skill.key] > distant.children[0].stats[skill.key]);
  assert.ok(caring.children[0].stats.instability <= distant.children[0].stats.instability);
  assert.equal(haveChild(caring).ok, true);
  assert.equal(caring.children[0].adopted, false);
});

test('older heirs can adopt and continue a family beyond mandatory succession', () => {
  const state = adult(94);
  haveChild(state);
  while (state.age < 85) advanceYear(state);
  succeed(state, state.children[0].id);
  assert.equal(state.age, 67);
  assert.equal(haveChild(state).ok, true);
  assert.equal(state.children[0].adopted, true);
  assert.equal(state.children[0].age, 0);
  assert.equal(state.history[0].title, 'A new beginning');
  assert.match(state.history[0].text, /adopt/);
  assert.equal(haveChild(state).ok, false);
  assert.equal(validateSave(state), true);
  while (state.age < 85) advanceYear(state);
  assert.equal(succeed(state, state.children[0].id).ok, true);
  assert.equal(state.age, 18);
  assert.equal(state.generation, 3);
  assert.equal(haveChild(state).ok, true);
  assert.equal(state.children[0].adopted, false);
  assert.equal(validateSave(state), true);
});

test('parenthood begins at 18, changes to adoption after 60, and remains capped at six', () => {
  const state = createGame({ seed: 95 });
  assert.equal(haveChild(state).ok, false);
  state.age = 60; assert.equal(haveChild(state).ok, true); assert.equal(state.children[0].adopted, false);
  for (let index = 1; index < 6; index++) {
    advanceYear(state);
    assert.equal(haveChild(state).ok, true);
    assert.equal(state.children[index].adopted, true);
  }
  advanceYear(state); assert.equal(haveChild(state).ok, false);
});

test('inheritance uses lifestyle and equal shares while succession preserves the chosen child', () => {
  const state = adult(11); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; state.money = 100000; state.lifestyle = 4;
  const info = successionInfo(state); assert.equal(info.estate, 75000); assert.equal(info.share, 37500);
  const chosen = copy(state.children[1]);
  assert.equal(succeed(state, chosen.id).ok, true);
  assert.equal(state.name, chosen.name); assert.equal(state.age, chosen.age); assert.equal(state.generation, 2);
  assert.deepEqual(state.stats, chosen.stats); assert.deepEqual(state.aptitudes, chosen.aptitudes);
  assert.equal(state.money, chosen.money + info.share); assert.equal(state.siblings[0].inheritance, info.share);
  assert.equal(state.children.length, 0); assert.equal(state.jobId, null); assert.equal(state.effects.length, 0);
  assert.equal(state.lineage.length, 1); assert.equal(validateSave(state), true);
  assert.equal(state.history[0].generation, 2);
});

test('higher lifestyle reduces the share and deceased children are excluded', () => {
  const state = adult(15); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; state.money = 100000;
  state.lifestyle = 1; const lowSpending = successionInfo(state).share;
  state.lifestyle = 10; assert.ok(successionInfo(state).share < lowSpending);
  state.children[1].alive = false;
  assert.equal(successionInfo(state).share, successionInfo(state).estate);
});

test('lifestyle is supported by earnings or reserves and remains on the 1–10 scale', () => {
  assert.equal(lifestyleFromResources(0, 0), 1);
  assert.equal(lifestyleFromResources(0, 25000), 2);
  assert.equal(lifestyleFromResources(0, 175000), 4);
  assert.equal(lifestyleFromResources(66000, 0), 4);
  assert.equal(lifestyleFromResources(0, 1e15), 10);
  assert.equal(lifestyleFromResources(1e15, 0), 10);
});

test('inherited resources improve a young heir\'s lifestyle and gradually fund their comfort', () => {
  const wealthy = adult(123);
  while (wealthy.age < 60) advanceYear(wealthy);
  haveChild(wealthy);
  while (wealthy.age < 65) advanceYear(wealthy);
  const modest = copy(wealthy);
  wealthy.money = 500000; wealthy.lifestyle = lifestyleFromResources(0, wealthy.money);
  modest.money = 0; modest.lifestyle = 1;
  succeed(wealthy, wealthy.children[0].id); succeed(modest, modest.children[0].id);
  assert.equal(wealthy.age, 5); assert.equal(modest.age, 5);
  assert.ok(wealthy.lifestyle > modest.lifestyle);
  const inheritedReserves = wealthy.money;
  advanceYear(wealthy); advanceYear(modest);
  assert.ok(wealthy.money < inheritedReserves);
  assert.ok(wealthy.lifestyle > modest.lifestyle);
  assert.equal(wealthy.income, 0);
  assert.equal(validateSave(wealthy), true);
  assert.equal(validateSave(modest), true);
  assert.doesNotMatch(wealthy.history.map(memory => memory.text).join(' '), /\$\s*[\d,]+/);
});

test('an unemployed adult\'s reserve-supported lifestyle declines as resources are used', () => {
  const state = adult(124); state.money = 76000;
  state.lifestyle = lifestyleFromResources(0, state.money);
  const before = state.lifestyle;
  advanceYear(state);
  assert.ok(state.money < 76000);
  assert.ok(state.lifestyle < before);
  assert.equal(state.lifestyle, lifestyleFromResources(state.income, state.money));
});

test('age 85 ends a childless life and pauses a parent for mandatory succession', () => {
  const childless = createGame({ seed: 16 });
  for (let i = 0; i < 85; i++) advanceYear(childless);
  assert.equal(childless.ended, true); assert.equal(advanceYear(childless).ok, false); assert.equal(childless.age, 85);
  assert.equal(validateSave(childless), true);
  const parent = adult(17); haveChild(parent);
  for (let i = parent.age; i < 85; i++) advanceYear(parent);
  assert.equal(parent.needsSuccession, true); assert.equal(parent.ended, false); assert.equal(advanceYear(parent).ok, false);
  assert.equal(succeed(parent, parent.children[0].id).ok, true); assert.equal(parent.age, 67);
  assert.equal(validateSave(parent), true);
});

test('save loading rejects malformed values while round trips preserve deterministic simulation', () => {
  const state = adult(18); haveChild(state);
  const restored = copy(state); assert.equal(validateSave(restored), true);
  advanceYear(state); advanceYear(restored); assert.deepEqual(restored, state);
  for (const mutate of [s => { s.stats.health = NaN; }, s => { s.focus.self = 12; }, s => { s.focus.extra = 'oops'; }, s => { s.jobId = 'hacker'; }, s => { s.children[0].stats = {}; }, s => { s.rng = null; }, s => { s.effects.push({}); }, s => { s.age = 85; }]) {
    const bad = copy(state); mutate(bad); assert.equal(validateSave(bad), false);
  }
  assert.equal(validateSave(null), false); assert.equal(validateSave({ version: 1 }), false);
});

test('import validation rejects malformed lineage and nested family fields', () => {
  const state = adult(96); haveChild(state); advanceYear(state); haveChild(state);
  state.age = 65; succeed(state, state.children[0].id);
  assert.equal(validateSave(state), true);
  const attacks = [
    s => { s.lineage[0].generation = '<img src=x onerror=alert(1)>'; },
    s => { s.lineage[0].generation = 1.5; },
    s => { s.lineage[0].generation = -1; },
    s => { s.lineage[0].generation = 100001; },
    s => { s.lineage[0].children = [null]; },
    s => { s.lineage[0].children[0].id = {}; },
    s => { s.lineage[0].children[0].name = 10; },
    s => { s.lineage[0].children[0].inheritance = Infinity; },
    s => { s.lineage[0].height = 'tall'; },
    s => { s.parents[0].height = NaN; },
    s => { s.siblings[0].adultHeight = null; },
    s => { s.siblings[0].id = false; },
    s => { s.siblings[0].adopted = {}; },
    s => { s.siblings[0].id = s.parents[0].id; },
    s => { s.parents[0].id = s.id; },
    s => { s.parents[0].age = s.age; },
  ];
  for (const mutate of attacks) {
    const malformed = copy(state); mutate(malformed);
    assert.equal(validateSave(malformed), false);
  }
  const parent = adult(97); haveChild(parent); advanceYear(parent); haveChild(parent);
  const duplicate = copy(parent); duplicate.children[1].id = duplicate.children[0].id;
  assert.equal(validateSave(duplicate), false);
  const impossibleAge = copy(parent); impossibleAge.children[0].age = 90;
  assert.equal(validateSave(impossibleAge), false);
  const olderThanParent = copy(parent); olderThanParent.children[0].age = parent.age;
  assert.equal(validateSave(olderThanParent), false);
});

test('long simulations retain bounds, have quiet years and never select more than one random event per year', () => {
  let quiet = 0, events = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const state = createGame({ seed });
    for (let year = 0; year < 85; year++) {
      const result = advanceYear(state);
      if (result.eventId === null) quiet += 1; else { events += 1; assert.ok(EVENTS.some(event => event.id === result.eventId)); }
      assert.equal(validateSave(state), true, `invalid seed ${seed}, age ${state.age}`);
      for (const value of Object.values(effectiveStats(state))) assert.ok(value >= 1 && value <= 10);
    }
  }
  assert.ok(quiet > events);
});

test('successive generations remain playable and valid without inheriting the old job or effects', () => {
  const state = adult(35);
  for (let generation = 1; generation <= 4; generation++) {
    while (state.age < 18) advanceYear(state);
    assert.equal(haveChild(state).ok, true);
    while (state.age < 65) advanceYear(state);
    assert.equal(succeed(state, state.children[0].id).ok, true);
    assert.equal(state.generation, generation + 1);
    assert.equal(validateSave(state), true);
  }
});
