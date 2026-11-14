import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, createGame, advanceYear, annualForecast, resolveEventChoice,
  focusLimits, focusMinimums, focusLimitDetails, setFocus, validateSave, migrateSave,
  enrollSchoolActivity, leaveSchoolActivity, effectiveStats, fitFocusAllocation } from '../engine.js';
import { defaultFocus, focusBudget } from '../focus-rules.js';
import { createSchoolRecord } from '../school.js';

const calm = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
const copy = value => structuredClone(value);
const spent = state => Object.values(state.focus).reduce((sum, amount) => sum + amount, 0);
function pupil(age = 12) {
  const state = createGame({ seed: 7301 });
  state.age = age;
  state.maturityAge = 18;
  state.conditions = [];
  state.effects = [];
  state.focus = defaultFocus(age);
  state.school = age >= 5 && age < 18 ? createSchoolRecord(state) : null;
  return state;
}
function choice(state, outcome) {
  const event = EVENTS.find(entry => entry.id === (state.age < 5 ? 'school_play' : 'school_team'));
  const original = event.choices;
  event.choices = [{ id: 'capacity-fixture', label: 'Adjust the schedule', description: '', ...outcome }];
  state.pendingEvents = [{ eventId: event.id, age: state.age }];
  state.lastYearEvents = [event.id];
  try { assert.equal(resolveEventChoice(state, 'capacity-fixture', event.id).ok, true); }
  finally { event.choices = original; }
}
function quietYear(state) {
  const next = copy(state);
  assert.equal(advanceYear(next, { ...calm, eventRandom: () => 1 }).ok, true);
  assert.equal(next.lastYearEvents.length, 0);
  return next;
}

const capacity = (key, amount, years = 1) => ({ years, focusCapacity: { standard: { [key]: amount } } });
const minimum = (key, amount, years = 1) => ({ years, focusMinimums: { standard: { [key]: amount } } });

test('repeated capacity penalties stack independently and expire after complete playable years', () => {
  const state = pupil();
  state.focus.work = 4;
  const before = copy(state);
  choice(state, capacity('work', -1, 2));
  choice(state, capacity('work', -1));
  assert.equal(focusLimits(state).work, 2);
  assert.equal(state.focus.work, 2);
  assert.equal(focusBudget(state), 10);
  assert.equal(state.effects.length, 2);
  assert.equal(new Set(state.effects.map(effect => effect.id)).size, 2);
  assert.deepEqual(state.effects.map(effect => effect.years), [2, 1]);
  assert.deepEqual(state.stats, before.stats);
  assert.equal(state.rng, before.rng);
  assert.match(state.history[0].text, /-1 School focus capacity\. Temporary effects: 1 year\./);
  assert.equal(setFocus(state, 'work', 3).ok, false);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state);
  const next = quietYear(state);
  assert.equal(focusLimits(next).work, 3);
  assert.equal(next.effects.length, 1);
  assert.equal(next.focus.work, 2, 'expired capacity does not refill the allocation');
  assert.equal(next.yearSummary.decisions.focus.work, 2);
  assert.equal(validateSave(next), true);
  const ended = quietYear(next);
  assert.equal(focusLimits(ended).work, 4);
  assert.equal(ended.focus.work, 2);
  assert.equal(validateSave(ended), true);
});

test('capacity buffs offset penalties but never override stage maxima or permanent and saved caps', () => {
  const state = pupil();
  choice(state, capacity('social', -3));
  choice(state, capacity('social', 1));
  choice(state, capacity('social', 1));
  assert.equal(focusLimits(state).social, 3);
  assert.equal(state.effects.length, 3);
  choice(state, capacity('social', 4));
  assert.equal(focusLimits(state).social, 4);
  state.conditions = ['autism'];
  assert.equal(focusLimits(state).social, 1, 'lifelong limits remain hard limits');
  state.effects.push({ id: 'legacy-cap', name: 'Saved cap', description: '', years: 1, modifiers: {}, focusLimits: { standard: { work: 1 } } });
  choice(state, capacity('work', 4));
  assert.equal(focusLimits(state).work, 1);
  choice(state, capacity('sports', 4));
  assert.equal(focusLimits(state).sports, 0, 'unenrolled sports remain locked');
  assert.equal(validateSave(state), true);
});

test('minimum increases stack, reassign only required points, and prevent lowering below the floor', () => {
  const state = pupil();
  state.focus = { work: 4, social: 4, family: 0, self: 2, sports: 0, extracurricular: 0 };
  choice(state, minimum('family', 1, 2));
  choice(state, minimum('family', 1));
  assert.equal(focusMinimums(state).family, 2);
  assert.deepEqual(state.focus, { work: 3, social: 3, family: 2, self: 2, sports: 0, extracurricular: 0 });
  assert.equal(spent(state), 10);
  assert.equal(setFocus(state, 'family', 1).ok, false);
  assert.match(state.history[0].text, /\+1 Family minimum focus/);
  assert.equal(validateSave(state), true);
  const snapshot = copy(state);
  focusMinimums(state); focusLimits(state); focusLimitDetails(state); annualForecast(state);
  const fitted = fitFocusAllocation(state, { work: 4, social: 4, family: 0, self: 4, sports: 2, extracurricular: 2 });
  assert.equal(fitted.family, 2);
  assert.equal(fitted.sports, 0);
  assert.equal(Object.values(fitted).reduce((sum, amount) => sum + amount, 0), 10);
  assert.deepEqual(state, snapshot, 'all constraint and forecast reads are pure');
  const next = quietYear(state);
  assert.equal(focusMinimums(next).family, 1);
  assert.equal(next.focus.family, 2, 'expiry leaves the chosen allocation alone');
  assert.equal(setFocus(next, 'family', 0).ok, false);
  assert.equal(setFocus(next, 'family', 1).ok, true);
  assert.equal(validateSave(next), true);
  const ended = quietYear(next);
  assert.equal(focusMinimums(ended).family, 0);
  assert.equal(setFocus(ended, 'family', 0).ok, true);
});

test('conflicting minima, capacity loss, and budget loss resolve deterministically without an impossible year', () => {
  const state = pupil();
  choice(state, { years: 2, focusMinimums: { standard: { work: 4, social: 4, family: 4, self: 4, sports: 2 } } });
  assert.deepEqual(focusMinimums(state), { work: 4, social: 4, family: 2, self: 0, sports: 0, extracurricular: 0 });
  assert.deepEqual(state.focus, focusMinimums(state));
  choice(state, { ...capacity('work', -3), focusPoints: -4 });
  assert.deepEqual(focusMinimums(state), { work: 1, social: 4, family: 1, self: 0, sports: 0, extracurricular: 0 });
  assert.deepEqual(state.focus, focusMinimums(state));
  assert.equal(validateSave(state), true);
  const next = quietYear(state);
  assert.equal(validateSave(next), true);
  assert.equal(spent(next), focusBudget(next), 'remaining demands use the restored budget');
});

test('minimum rules survive stage transitions with no school enrollment bypass', () => {
  const toddler = pupil(4);
  choice(toddler, { years: 2, focusMinimums: { toddler: { creative: 3 }, standard: { work: 3, sports: 2 } } });
  assert.equal(toddler.focus.creative, 3);
  const child = quietYear(toddler);
  assert.equal(child.focus.work, 3);
  assert.equal(child.focus.sports, 0);
  assert.equal(validateSave(child), true);
  assert.equal(setFocus(child, 'social', 0).ok, true);
  assert.equal(setFocus(child, 'family', 0).ok, true);
  const id = child.school.offers.sports.find(id => id !== 'lacrosse');
  assert.equal(enrollSchoolActivity(child, 'sports', id).ok, true);
  assert.equal(child.focus.sports, 2);
  assert.equal(leaveSchoolActivity(child, 'sports').ok, false);
  choice(child, capacity('sports', -2));
  assert.equal(focusMinimums(child).sports, 0);
  assert.equal(child.focus.sports, 0);
  assert.equal(leaveSchoolActivity(child, 'sports').ok, true);
});

test('new effects preserve legacy stat modifiers and independent instance durations', () => {
  const state = pupil();
  state.effects = [{ id: 'school_team', name: 'Old stat bonus', description: '', years: 3, modifiers: { health: .5 } }];
  const health = effectiveStats(state).health;
  choice(state, capacity('work', -1, 2));
  choice(state, capacity('work', -1));
  assert.equal(state.effects.length, 3);
  assert.equal(effectiveStats(state).health, health);
  assert.deepEqual(state.effects.map(effect => effect.years), [3, 2, 1]);
  assert.equal(validateSave(state), true);
});

test('schema20 validates new effect maps and rejects allocations below enforced minima without mutation', () => {
  const state = pupil();
  choice(state, minimum('family', 3));
  assert.deepEqual(migrateSave(copy(state)), state);
  const under = copy(state);
  under.focus.family = 2;
  const before = copy(under);
  assert.equal(validateSave(under), false);
  assert.equal(migrateSave(under), null);
  assert.equal(advanceYear(under, calm).ok, false);
  assert.deepEqual(under, before);
  for (const field of ['focusCapacity', 'focusMinimums']) {
    for (const malformed of [null, [], {}, { infant: { work: 1 } }, { toddler: {} }, { standard: { creative: 1 } }, { standard: { work: 0 } }, { standard: { work: 5 } }, { standard: { work: 1.5 } }, { standard: { work: '1' } }, { standard: { work: -5 } }, ...(field === 'focusMinimums' ? [{ standard: { work: -1 } }] : [])]) {
      const bad = copy(state);
      bad.effects[0][field] = malformed;
      assert.equal(validateSave(bad), false, `${field}: ${JSON.stringify(malformed)}`);
      assert.equal(migrateSave(bad), null);
    }
  }
});
