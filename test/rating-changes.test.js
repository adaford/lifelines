import test from 'node:test';
import assert from 'node:assert/strict';
import { ratingChange, changedRating } from '../rating-changes.js';
import { EVENTS, createGame, resolveEventChoice, validateSave, migrateSave, annualForecast } from '../engine.js';

const event = { id: 'test_directional_changes', name: 'A lasting experience', description: 'An experience changes how you learn.', kind: 'neutral', choices: [
  { id: 'gain', label: 'Learn', statChanges: { social: .3 }, aptitudeChanges: { social: 1 } },
  { id: 'loss', label: 'Withdraw', statChanges: { social: -.3 }, aptitudeChanges: { social: -1 } },
  { id: 'legacy_shape', label: 'Recover', statChanges: { social: .2 }, modifiers: { social: .3, health: -.2 }, years: 2, focusLimits: { toddler: { work: 2 } } },
] };
EVENTS.push(event);
function resolve(state, choice) {
  state.pendingEvents.push({ eventId: event.id, age: state.age });
  assert.equal(resolveEventChoice(state, choice, event.id).ok, true);
}

test('logarithmic rating response slows only movement toward a nearby edge', () => {
  assert.equal(ratingChange(5, .3), .3);
  assert.equal(ratingChange(5, -.3), -.3);
  assert.ok(ratingChange(1, .3) > .3);
  assert.ok(Math.abs(ratingChange(1, -.3)) < .3);
  assert.equal(ratingChange(1, .3), -ratingChange(9, -.3));
  assert.equal(ratingChange(9, .3), -ratingChange(1, -.3));
  assert.ok(changedRating(0, .3) > 0);
  assert.ok(changedRating(10, -.3) < 10);
  assert.equal(changedRating(0, -.3), 0);
  assert.equal(changedRating(10, .3), 10);
  assert.equal(changedRating(.01, -10), 0);
  assert.equal(changedRating(9.99, 10), 10);
});

test('events apply the same directional response to gains and losses', () => {
  for (const [choice, amount] of [['gain', .3], ['loss', -.3]]) {
    for (const current of [0, 1, 5, 9, 10]) {
      const state = createGame({ seed: 51 });
      state.stats.social = current;
      resolve(state, choice);
      assert.equal(state.stats.social, changedRating(current, amount));
      assert.equal(state.effects.length, 0);
    }
  }
});

test('aptitude events change only the target, respect both bounds and survive save reload', () => {
  for (const [choice, direction] of [['gain', 1], ['loss', -1]]) {
    for (const current of [-3, 0, 3]) {
      const state = createGame({ seed: 51 });
      state.aptitudes.social = current;
      const before = structuredClone(state.aptitudes);
      resolve(state, choice);
      const expected = Math.max(-3, Math.min(3, current + direction));
      assert.deepEqual(state.aptitudes, { ...before, social: expected });
      assert.match(state.history[0].text, /social learning ability .* → /);
      assert.equal(validateSave(state), true);
      assert.deepEqual(migrateSave(structuredClone(state)).aptitudes, state.aptitudes);
    }
  }
});

test('new modifier-shaped outcomes are permanent, while only activity limits are temporary', () => {
  const state = createGame({ seed: 51 });
  state.age = 2;
  state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
  state.stats.social = state.stats.health = 5;
  resolve(state, 'legacy_shape');
  assert.equal(state.stats.social, 5.5, 'permanent and formerly temporary contributions merge before scaling');
  assert.equal(state.stats.health, 4.8);
  assert.deepEqual(state.effects[0].modifiers, {});
  assert.deepEqual(state.effects[0].focusLimits, { toddler: { work: 2 } });
  assert.equal(state.effects[0].years, 2);
  assert.equal(state.focus.work, 2);
  assert.equal(validateSave(state), true);
});

test('legacy timed effects remain unchanged and forecast reads are pure', () => {
  const state = createGame({ seed: 51 });
  state.effects.push({ id: 'old-effect', name: 'Old effect', description: 'Saved effect', years: 2, modifiers: { intelligence: .7 }, kind: 'positive' });
  const old = structuredClone(state.effects[0]);
  resolve(state, 'gain');
  assert.deepEqual(state.effects, [old]);
  const before = structuredClone(state);
  const forecast = annualForecast(state);
  assert.ok(Object.values(forecast.stats).every(item => Number.isFinite(item.after)));
  assert.deepEqual(state, before);
  assert.equal(validateSave(state), true);
});

test('a new restriction cannot overwrite a legacy stat effect from the same event', () => {
  const state = createGame({ seed: 51 });
  state.age = 2;
  state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
  const legacy = { id: event.id, name: event.name, description: 'Saved outcome', years: 4, modifiers: { health: .7 }, lifestyle: 1, kind: 'positive' };
  state.effects = [structuredClone(legacy)];
  resolve(state, 'legacy_shape');
  assert.deepEqual(state.effects[0], legacy);
  assert.equal(state.effects[1].id, `${event.id}:limits`);
  assert.equal(state.effects[1].years, 2);
  assert.deepEqual(state.effects[1].modifiers, {});
  assert.equal(state.effects[1].lifestyle, undefined);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
  resolve(state, 'legacy_shape');
  assert.equal(state.effects.length, 2, 'repeating the restriction refreshes its own record');
  assert.deepEqual(state.effects[0], legacy);
});

test('a full legacy effect history can coexist with new restrictions and still reload', () => {
  const state = createGame({ seed: 51 });
  state.age = 2;
  state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
  state.effects = Array.from({ length: 27 }, (_, index) => ({ id: `legacy-${index}`, name: 'Saved bonus', description: '', years: 5, modifiers: { social: .1 }, kind: 'positive' }));
  const legacy = structuredClone(state.effects);
  resolve(state, 'legacy_shape');
  assert.equal(state.effects.length, 28);
  assert.deepEqual(state.effects.slice(0, 27), legacy);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(structuredClone(state)), state);
  const oldVersion = { ...structuredClone(state), version: 15 };
  assert.equal(migrateSave(oldVersion), null, 'older versions retain their original capacity contract');
  state.effects.push(...Array.from({ length: 37 }, (_, index) => ({ id: `restriction-${index}`, name: 'Restriction', description: '', years: 1, modifiers: {}, focusLimits: { toddler: { work: 2 } }, kind: 'negative' })));
  assert.equal(state.effects.length, 65);
  assert.equal(validateSave(state), false, 'malformed oversized arrays remain rejected');
});
