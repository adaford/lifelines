import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advanceYear, EVENTS, resolveEventChoice, pendingEventSubject, validateSave, migrateSave } from '../engine.js';

const copy = value => structuredClone(value);
const steadyYear = { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 };
function toddler() {
  const state = createGame({ seed: 13579 });
  state.age = 3;
  state.focus = { work: 3, social: 2, family: 2, self: 3, creative: 2 };
  return state;
}
function matchingYear(matches) {
  for (let rng = 0; rng < 300; rng++) {
    const state = toddler();
    state.rng = rng;
    assert.equal(advanceYear(state, steadyYear).ok, true);
    if (matches(state)) return state;
  }
  assert.fail('A deterministic year should contain the required event');
}
function stripDescriptions(state) {
  for (const entry of [...state.history, ...(state.yearSummary?.events || [])]) delete entry.description;
  return state;
}

test('completed event context is saved separately from concise results in the annual review', () => {
  const state = matchingYear(state => state.yearSummary.events.some(entry => entry.kind !== 'choice' && entry.description && entry.title.includes(': ')));
  const entry = state.yearSummary.events.find(entry => entry.kind !== 'choice' && entry.description && entry.title.includes(': '));
  const event = EVENTS.find(event => entry.title.endsWith(`: ${event.name}`));
  const subject = entry.title.slice(0, -event.name.length - 2);
  assert.equal(entry.description, event.description.replaceAll('{name}', subject));
  assert.ok(!entry.text.includes(entry.description), 'journal results do not acquire explanatory prose');
  const history = state.history.find(memory => memory.title === entry.title);
  assert.equal(history.description, entry.description);
  assert.equal(history.text, entry.text);
  assert.equal(validateSave(state), true);
  assert.deepEqual(migrateSave(copy(state)), state, 'review context survives reloads');
});

test('pending and resolved choices keep the event context rather than the chosen outcome prose', () => {
  const state = matchingYear(state => state.pendingEvents.length > 0);
  const pending = state.pendingEvents[0];
  const event = EVENTS.find(event => event.id === pending.eventId);
  const subject = pendingEventSubject(state, pending);
  const description = event.description.replaceAll('{name}', subject.name);
  const title = `${pending.subjectId ? `${subject.name}: ` : ''}${event.name}`;
  assert.equal(state.yearSummary.events.find(entry => entry.title === title).description, description);
  const restored = migrateSave(copy(state));
  const rng = state.rng;
  const choice = event.choices[0];
  assert.equal(resolveEventChoice(state, choice.id, event.id, pending.subjectId).ok, true);
  assert.equal(resolveEventChoice(restored, choice.id, event.id, pending.subjectId).ok, true);
  assert.deepEqual(restored, state);
  assert.equal(state.history[0].description, description);
  assert.ok(state.history[0].text.startsWith(`${choice.label}. `));
  assert.ok(!state.history[0].text.includes(choice.description));
  assert.equal(state.rng, rng);
  assert.equal(validateSave(state), true);
});

test('abandonment, transferred care, and adoption retain their distinct explanations', () => {
  const state = toddler();
  for (const person of [state, ...state.parents]) for (const key in person.stats) person.stats[key] = 5;
  for (const parent of state.parents) { parent.stats.stability = 0; parent.relationship = 0; }
  state.rng = 558;
  assert.equal(advanceYear(state, steadyYear).ok, true);
  assert.ok(state.guardian);
  const events = state.yearSummary.events;
  assert.equal(events.filter(event => event.title.endsWith(': Abandons you')).length, 2);
  for (const parent of state.parents) {
    assert.ok(events.find(event => event.title === `${parent.name}: Abandons you`).description.startsWith(`${parent.name} leaves the family.`));
  }
  assert.equal(events.find(event => event.title.endsWith('Takes over your care')).description, 'The remaining parent takes over your care.');
  assert.equal(events.find(event => event.title.endsWith('adopts you')).description, 'You move in with an adult relative.');
  assert.deepEqual(migrateSave(copy(state)), state);
});

test('optional review descriptions are bounded and old entries stay valid without affecting future outcomes', () => {
  const state = matchingYear(state => state.pendingEvents.length === 0 && state.yearSummary.events.some(entry => entry.description));
  const legacy = stripDescriptions(copy(state));
  assert.equal(validateSave(legacy), true);
  assert.deepEqual(migrateSave(copy(legacy)), legacy);
  for (const location of ['history', 'review']) for (const invalid of [null, 3, '', 'x'.repeat(1001)]) {
    const candidate = copy(state);
    const entry = location === 'history' ? candidate.history[0] : candidate.yearSummary.events[0];
    entry.description = invalid;
    assert.equal(validateSave(candidate), false, `${location} rejects invalid context`);
  }
  assert.equal(advanceYear(state, steadyYear).ok, true);
  assert.equal(advanceYear(legacy, steadyYear).ok, true);
  assert.deepEqual(stripDescriptions(state), stripDescriptions(legacy), 'context metadata never changes RNG or outcomes');
});
