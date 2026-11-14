import test from 'node:test';
import assert from 'node:assert/strict';
import { housingHost, nextHousing, housingLifestyle, housingChanges, housingMeetingMultiplier, housingDetails, HOUSING_BALANCE } from '../housing.js';

const host = (id = 'parent', fields = {}) => ({ id, alive: true, relationship: 8, lifestyle: 5, ...fields });
const player = fields => ({ age: 18, money: 0, income: 0, jobId: null, parents: [host()], guardian: null, education: { status: 'none', years: 0 }, ...fields });

test('housing depends on actual work and reserves, never a stale former salary', () => {
  const state = player({ income: 100000 });
  assert.equal(nextHousing(state).status, 'parents');
  assert.equal(nextHousing({ ...state, jobId: 'retail', income: 18000 }).status, 'independent');
  assert.equal(nextHousing({ ...state, money: 9000 }).status, 'independent');
  assert.equal(nextHousing({ ...state, money: 8999 }).status, 'parents');
  assert.equal(nextHousing(state, { income: 10000 }).status, 'independent', 'a caller can provide current computed income before saving it');
  assert.equal(housingDetails({ ...state, housing: nextHousing(state) }).independentLifestyle, 1);
});

test('family housing requires an available supportive host and prefers the strongest relationship', () => {
  const state = player({ parents: [host('dead', { alive: false }), host('absent', { abandonedAt: 10 }), host('poor', { lifestyle: 1.99 }), host('distant', { relationship: 5.99 })] });
  assert.equal(housingHost(state), null);
  assert.equal(nextHousing(state).status, 'homeless');
  state.guardian = host('guardian', { relationship: 6, lifestyle: 2 });
  assert.equal(nextHousing(state).hostId, 'guardian');
  state.parents.push(host('parent'));
  assert.equal(housingHost(state).id, 'parent');
  state.parents.at(-1).alive = false;
  assert.equal(housingHost(state).id, 'guardian');
});

test('three completed years with family consume one lifetime allowance without menu or job resets', () => {
  const state = player();
  for (let year = 0; year < HOUSING_BALANCE.maxFamilyYears; year++) {
    state.housing = nextHousing(state);
    assert.equal(state.housing.status, 'parents');
    assert.equal(state.housing.yearsWithFamily, year);
    assert.equal(housingDetails(state).remainingYears, 3 - year);
    for (let check = 0; check < 10; check++) assert.deepEqual(nextHousing(state), state.housing);
    state.housing = nextHousing(state, { completeYear: true });
    assert.equal(state.housing.yearsWithFamily, year + 1);
  }
  state.housing = nextHousing(state);
  assert.equal(state.housing.status, 'homeless');
  state.housing = nextHousing(state, { income: 20000 });
  assert.equal(state.housing.status, 'independent');
  assert.equal(state.housing.yearsWithFamily, 3);
  assert.equal(nextHousing(state).status, 'homeless');
});

test('campus living uses captured funded support without duplicating it or consuming family housing years', () => {
  const state = player({ education: { status: 'college', years: 0 }, housing: { status: 'parents', yearsWithFamily: 2, hostId: 'parent' } });
  state.housing = nextHousing(state, { completeYear: true });
  assert.deepEqual(state.housing, { status: 'campus', hostId: null, yearsWithFamily: 2 });
  assert.equal(housingLifestyle(state, 0), 2.5, 'legacy colleges keep basic campus support');
  const offer = { affordable: true, livingLifestyle: 5.5 };
  assert.equal(housingLifestyle(state, 1, offer), 5.5);
  assert.equal(housingLifestyle(state, housingLifestyle(state, 1, offer), offer), 5.5);
  assert.equal(housingLifestyle(state, 8, offer), 8, 'personal resources can support a higher Lifestyle');
});

test('housing supplies explicit consequences and dating effects only for family or homelessness', () => {
  const state = player();
  state.housing = nextHousing(state);
  assert.deepEqual(housingChanges(state.housing), { social: -.06, stability: .06 });
  assert.equal(housingLifestyle(state, 0), 4);
  assert.equal(housingMeetingMultiplier(state), .8);
  state.housing = { status: 'homeless', yearsWithFamily: 3, hostId: null };
  assert.deepEqual(housingChanges(state.housing), { health: -.3, social: -.18, stability: -.25 });
  assert.equal(housingLifestyle(state, 3), .8);
  assert.equal(housingLifestyle(state, .2), .2);
  assert.equal(housingMeetingMultiplier(state), .55);
  for (const status of ['campus', 'independent']) {
    state.housing.status = status;
    assert.deepEqual(housingChanges(state.housing), {});
    assert.equal(housingMeetingMultiplier(state), 1);
  }
});

test('housing inspection never adds new fields to old saves or changes ratings and RNG', () => {
  const state = player({ rng: 711, stats: { health: 5, stability: 5, social: 5 } });
  const before = structuredClone(state);
  assert.equal(housingDetails(state), null);
  assert.equal(housingMeetingMultiplier(state), 1);
  housingHost(state); nextHousing(state); housingLifestyle(state, 4); housingChanges(state.housing);
  assert.deepEqual(state, before);
  assert.equal(housingDetails({ ...state, age: 17, housing: nextHousing(state) }), null);
});
