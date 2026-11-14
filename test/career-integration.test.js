import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, chooseEducation, needsEducationChoice, takeJob, quitJob, annualForecast, validateSave, migrateSave, JOBS, jobFit, lifestyleFromResources } from '../engine.js';
import { defaultFocus } from '../focus-rules.js';
import { initialCareerProgress } from '../career-rules.js';

const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1, fameRandom: () => 1 };
const copy = value => structuredClone(value);
function qualified() {
  const state = createGame({ seed: 881142 });
  // Career fixtures need a funded education offer before applications are captured.
  state.money = 1000000;
  while (state.age < 30) {
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'college').ok, true);
    assert.equal(advanceYear(state, calm).ok, true);
  }
  state.conditions = []; state.effects = []; state.fame = null;
  state.focus = defaultFocus(state);
  for (const key of Object.keys(state.stats)) state.stats[key] = 9;
  for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = 0;
  state.focus = { work: 4, social: 0, family: 2, self: 2 };
  return state;
}
function offer(state, id) {
  if (!state.jobOffers.includes(id)) state.jobOffers[state.jobOffers.length - 1] = id;
  assert.equal(takeJob(state, id).ok, true);
}

test('old career saves keep their recorded economy and absent advancement fields on load and reads', () => {
  const state = qualified(); offer(state, 'sales');
  state.jobYears = 12; state.performance = .62; state.income = 77000; state.money = 60000; state.lifestyle = 4.5;
  delete state.careerProgress; delete state.economyVersion;
  const saved = copy(state);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), saved);
  annualForecast(state); jobFit(state, 'sales');
  assert.deepEqual(state, saved);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.equal(state.economyVersion, 1);
  assert.ok(state.careerProgress > initialCareerProgress(saved.jobYears));
  assert.equal(state.jobYears, 13);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('switching and leaving careers reset only their advancement while previewing preserves current progress', () => {
  const state = qualified(); offer(state, 'plumber');
  for (let year = 0; year < 5; year++) assert.equal(advanceYear(state, calm).ok, true);
  assert.ok(state.careerProgress > 0);
  const saved = copy(state); annualForecast(state);
  assert.deepEqual(state, saved);
  offer(state, 'computer_scientist');
  assert.equal(state.careerProgress, 0); assert.equal(state.jobYears, 0);
  assert.deepEqual(state.stats, saved.stats); assert.equal(state.rng, saved.rng);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.ok(state.careerProgress > 0);
  const atQuit = copy(state);
  assert.equal(quitJob(state).ok, true);
  assert.equal(state.careerProgress, 0); assert.equal(state.jobYears, 0); assert.equal(state.jobId, null);
  assert.equal(state.rng, atQuit.rng); assert.deepEqual(state.stats, atQuit.stats);
  assert.equal(validateSave(state), true);
});

test('long employed careers respect their own ceilings while a higher-potential research path can earn more', () => {
  const outcomes = {};
  for (const id of ['plumber', 'computer_scientist', 'sales', 'barista']) {
    const state = qualified(), job = JOBS.find(job => job.id === id); offer(state, id);
    for (let year = 0; year < 30; year++) {
      assert.equal(advanceYear(state, calm).ok, true);
      assert.ok(state.income > 0 && state.income <= job.maxSalary, `${id}, year ${year}`);
      assert.ok(lifestyleFromResources(state.income, 0) <= job.maxLifestyle, id);
      assert.equal(validateSave(state), true);
      assert.deepEqual(migrateSave(copy(state)), state);
    }
    outcomes[id] = state.income;
  }
  assert.ok(outcomes.computer_scientist > outcomes.plumber);
  assert.ok(outcomes.sales > outcomes.barista);
});

test('career caps constrain earnings rather than confiscating independently accumulated household wealth', () => {
  const state = qualified(), job = JOBS.find(job => job.id === 'plumber'); offer(state, job.id);
  state.money = 100000000;
  const initialWealth = state.money;
  assert.equal(advanceYear(state, calm).ok, true);
  assert.ok(state.income <= job.maxSalary);
  assert.ok(state.money >= initialWealth, 'earning a trade income does not remove existing savings to fit its career cap');
  assert.ok(state.lifestyle > job.maxLifestyle);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('optional career progression and economy version fields reject malformed values without changing old saves', () => {
  const state = qualified(); offer(state, 'sales');
  for (const value of [-.1, 1.1, NaN, Infinity, '0.5', null]) {
    const invalid = copy(state); invalid.careerProgress = value;
    assert.equal(validateSave(invalid), false, `invalid progress ${String(value)}`);
  }
  for (const value of [0, 2, '1', null]) {
    const invalid = copy(state); invalid.economyVersion = value;
    assert.equal(validateSave(invalid), false, `invalid economy ${String(value)}`);
  }
});


test('an almost-maximum resource household cannot round up to a true Lifestyle ten during annual refresh', () => {
  const state = qualified();
  state.money = 2500000000 - 1;
  assert.equal(state.jobId, null);
  const saved = copy(state), forecast = annualForecast(state);
  assert.ok(forecast.lifestyle.after < 10, 'the pure forecast also preserves a sub-threshold economic rating');
  assert.deepEqual(state, saved);
  assert.equal(advanceYear(state, calm).ok, true);
  assert.ok(lifestyleFromResources(0, state.money) < 10);
  assert.ok(state.lifestyle < 10, 'routine synchronization preserves the sub-threshold economic rating');
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
});
