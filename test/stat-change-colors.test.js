import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { createGame, advanceYear, validateSave, EVENTS } from '../engine.js';

const SAVE_KEY = 'lifelines.save.v1';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const nativeSetTimeout = globalThis.setTimeout;
const nativeClearTimeout = globalThis.clearTimeout;
const originalGlobals = new Map(['document', 'window', 'localStorage', 'setTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const timers = new Set();
let importId = 0;

function reviewFixture() {
  const fixture = createGame({ seed: 78123 });
  assert.equal(advanceYear(fixture, { mortalityRandom: () => 1 }).ok, true);
  fixture.yearSummary.dismissed = false;
  return fixture;
}

test('parent yearly changes use red, green and neutral text based on displayed endpoints', async () => {
  const fixture = reviewFixture();
  Object.assign(fixture.yearSummary.parents[0], {
    stability: { before: 5, after: 5.3, change: .3 },
    relationship: { before: 7, after: 6.8, change: -.2 },
    lifestyle: { before: 6.21, after: 6.24, change: .03 },
  });
  const ui = await mount(fixture);
  const parent = ui.query('.forecast-parents p');
  assert.deepEqual([...parent.querySelectorAll('.stat-change')].map(node => [node.className, node.textContent]), [
    ['stat-change gain', '5.0 → 5.3'],
    ['stat-change loss', '7.0 → 6.8'],
    ['stat-change unchanged', '6.2 → 6.2'],
  ]);
  assert.deepEqual(ui.saved(), fixture);
});

test('mixed event results color each stat independently in reviews and journal without coloring prose', async () => {
  const fixture = reviewFixture();
  const entry = { title: 'A shared afternoon', kind: 'positive', text: `Your health -1.25 → -1.05; ${fixture.parents[0].name}: Mental stability 7 -> 6.7; +.2 Intelligence; -.5 Strength; Your social 5.21 → 5.24. <quiet> recovery: 2 years.` };
  fixture.yearSummary.events = [entry];
  fixture.history = [{ id: 'mixed-outcome-colors', age: fixture.age, generation: fixture.generation, ...entry }];
  assert.equal(validateSave(fixture), true);
  let ui = await mount(fixture);
  for (const selector of ['.year-event-results', '.journal-entry p']) {
    const results = ui.query(selector);
    assert.deepEqual([...results.querySelectorAll('.stat-change')].map(node => [node.className, node.textContent]), [
      ['stat-change gain', 'Your health -1.3 → -1.1'],
      ['stat-change loss', 'Mental stability 7.0 -> 6.7'],
      ['stat-change gain', '+.2 Intelligence'],
      ['stat-change loss', '-.5 Strength'],
      ['stat-change unchanged', 'Your social 5.2 → 5.2'],
    ]);
    assert.equal(results.querySelector('quiet'), null);
    assert.equal([...results.querySelectorAll('.stat-change')].some(node => /recovery|years|quiet/.test(node.textContent)), false);
    assert.equal(results.querySelectorAll('br').length, 4);
  }
  assert.deepEqual(ui.saved(), fixture);
  ui = await mount(ui.saved());
  assert.equal(ui.query('.year-event-results .gain').textContent, 'Your health -1.3 → -1.1');
  assert.deepEqual(ui.saved(), fixture);
});

test('legacy signed outcomes retain direction colors without changing their saved wording', async () => {
  const fixture = reviewFixture();
  const entry = { title: 'An old memory', kind: 'neutral', text: 'Health +.2; Social -0.2; Instability +0.3; Strength +0' };
  fixture.yearSummary.events = [entry];
  fixture.history = [{ ...fixture.history[0], ...entry }];
  const ui = await mount(fixture);
  assert.deepEqual(ui.all('.year-event-results .stat-change').map(node => [node.className, node.textContent]), [
    ['stat-change gain', 'Health increased'],
    ['stat-change loss', 'Social decreased'],
    ['stat-change loss', 'Mental stability decreased'],
    ['stat-change unchanged', 'Strength stayed steady'],
  ]);
  assert.deepEqual(ui.saved(), fixture);
});

test('event choice previews color their actual stat endpoints without consuming RNG', async () => {
  const fixture = createGame({ seed: 78123 });
  const event = EVENTS.find(event => event.id === 'art_workshop');
  fixture.age = 3;
  fixture.focus = { work: 2, social: 2, family: 2, self: 2, creative: 2 };
  fixture.pendingEvents = [{ eventId: event.id, age: fixture.age }];
  fixture.lastYearEvents = [event.id];
  assert.equal(validateSave(fixture), true);
  const ui = await mount(fixture);
  assert.ok(ui.all('.event-consequences .stat-change').length);
  for (const node of ui.all('.event-consequences .stat-change')) {
    const pair = node.textContent.match(/(-?\d+\.\d) → (-?\d+\.\d)/);
    if (!pair) continue;
    assert.ok(node.classList.contains(Number(pair[2]) > Number(pair[1]) ? 'gain' : Number(pair[2]) < Number(pair[1]) ? 'loss' : 'unchanged'));
  }
  assert.deepEqual(ui.saved(), fixture);
});

async function mount(initial = createGame({ name: 'Jamie Reed', seed: 121 })) {
  for (const timer of timers) nativeClearTimeout(timer);
  timers.clear();
  const { document, window } = parseHTML(html);
  // LinkeDOM does not track focus; model that DOM behavior so modal focus
  // placement and return can be tested without driving a desktop browser.
  let focused = document.body;
  Object.defineProperty(document, 'activeElement', { configurable: true, get: () => focused });
  window.HTMLElement.prototype.focus = function () { focused = this; };
  const storage = new Map(initial === null ? [] : [[SAVE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  let saveWrites = 0;
  Object.assign(globalThis, {
    document,
    window,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => { saveWrites++; storage.set(key, String(value)); },
      removeItem: key => storage.delete(key),
    },
    setTimeout: (...args) => {
      const timer = nativeSetTimeout(...args);
      timer.unref();
      timers.add(timer);
      return timer;
    },
  });
  await import(`../app.js?dom-test=${++importId}`);
  const query = selector => {
    const result = document.querySelector(selector);
    assert.ok(result, `Expected DOM element ${selector}`);
    return result;
  };
  return {
    document,
    storage,
    writes: () => saveWrites,
    query,
    all: selector => [...document.querySelectorAll(selector)],
    saved: () => JSON.parse(storage.get(SAVE_KEY)),
    click: selector => {
      const element = query(selector);
      element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
    },
    key: (selector, key) => {
      const event = new window.Event('keydown', {bubbles:true,cancelable:true});
      Object.defineProperty(event,'key',{value:key});
      query(selector).dispatchEvent(event);
    },
    change: async (selector, file) => {
      const element = query(selector);
      Object.defineProperty(element, 'files', { configurable: true, value: [file] });
      element.dispatchEvent(new window.Event('change', { bubbles: true }));
      // The app awaits file.text() before opening a restore dialog.
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

afterEach(() => {
  for (const timer of timers) nativeClearTimeout(timer);
  timers.clear();
  for (const [key, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
