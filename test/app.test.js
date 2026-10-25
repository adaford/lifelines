// DOM integration checks run entirely in Node. They verify UI wiring and saves,
// but are not a substitute for checking layout in a real browser.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { createGame, advanceYear, haveChild, takeJob, successionInfo, validateSave } from '../engine.js';

const SAVE_KEY = 'lifelines.save.v1';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const nativeSetTimeout = globalThis.setTimeout;
const nativeClearTimeout = globalThis.clearTimeout;
const originalGlobals = new Map(['document', 'window', 'localStorage', 'setTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const timers = new Set();
let importId = 0;

function ageTo(state, age) {
  while (state.age < age) assert.equal(advanceYear(state).ok, true);
  assert.equal(validateSave(state), true, 'fixture must be a valid loadable save');
  return state;
}

function assertNoMoneyDisplay(element, context) {
  const text = element.textContent;
  assert.doesNotMatch(text, /[$€£¥]\s*[\d,.]+|\b(?:USD|EUR|GBP)\s*[\d,.]+/, `${context} should not expose currency amounts`);
  assert.doesNotMatch(text, /Annual income|Annual spending|Income last year|Spending last year|base\s*\/\s*yr/i, `${context} should use lifestyle rather than income or spending metrics`);
}

async function mount(initial = createGame({ name: 'Jamie Reed', seed: 121 })) {
  for (const timer of timers) nativeClearTimeout(timer);
  timers.clear();
  const { document, window } = parseHTML(html);
  const storage = new Map(initial === null ? [] : [[SAVE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  Object.assign(globalThis, {
    document,
    window,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
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
    query,
    all: selector => [...document.querySelectorAll(selector)],
    saved: () => JSON.parse(storage.get(SAVE_KEY)),
    click: selector => {
      const element = query(selector);
      element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
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

describe('Lifelines DOM integration', { concurrency: false }, () => {
  test('a new baby renders, crying saves, and three annual advances unlock focus', async () => {
    const ui = await mount();
    const initial = ui.saved();
    assert.equal(initial.age, 0);
    assert.equal(ui.query('.person-name').textContent, 'Jamie Reed');
    assert.equal(ui.all('.choice-card').length, 2);
    assert.equal(ui.all('.stat-list .stat-row').length, 6);
    assert.equal(ui.all('[data-action="focus"]').length, 0);

    ui.click('[data-action="baby"][data-choice="cry"]');
    assert.equal(ui.saved().babyChoice, 'cry');
    assert.equal(ui.query('[data-choice="cry"]').getAttribute('aria-pressed'), 'true');
    for (let year = 1; year <= 3; year += 1) {
      ui.click('[data-action="advance"]');
      assert.equal(ui.saved().age, year, 'one click advances exactly one year');
    }
    assert.equal(ui.all('.choice-card').length, 0);
    assert.equal(ui.all('.focus-row').length, 4);
    assert.equal(ui.all('[data-action="focus"]').length, 8);
    assert.ok(ui.saved().stats.intelligence > initial.stats.intelligence);
    assert.ok(ui.saved().parents[0].stats.instability > initial.parents[0].stats.instability);
    assert.match(ui.query('.journal-list').textContent, /bigger little world/i);
    assert.equal(validateSave(ui.saved()), true);
    assert.doesNotMatch(ui.query('#app').textContent, /undefined|NaN/);
  });

  test('the focus controls enforce the shared budget and persist reallocations', async () => {
    const ui = await mount(ageTo(createGame({ seed: 19 }), 3));
    const plus = '[data-action="focus"][data-key="work"][data-delta="1"]';
    const minus = '[data-action="focus"][data-key="social"][data-delta="-1"]';
    assert.equal(ui.query(plus).disabled, true);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 3, 'disabled controls must not change the state');
    ui.click(minus);
    assert.equal(ui.query(plus).disabled, false);
    assert.equal(ui.saved().focus.social, 2);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 4);
    assert.equal(Object.values(ui.saved().focus).reduce((a, b) => a + b, 0), 12);
    assert.equal(ui.query(plus).disabled, true);
    assert.match(ui.query('.budget-summary').textContent, /12\s*\/\s*12/);
  });

  test('all sections render, childhood careers stay locked, and dialogs close', async () => {
    const ui = await mount();
    ui.click('[data-action="tab"][data-tab="career"]');
    assert.equal(ui.all('.job-card').length, 10);
    assert.ok(ui.all('[data-action="job"]').every(button => button.disabled));
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('.family-card').length, 2);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="tab"][data-tab="character"]');
    assert.equal(ui.all('.attribute-card').length, 6);
    assert.ok(ui.query('[data-action="export"]'));
    ui.click('[data-action="help"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.equal(ui.all('.help-item').filter(item => item.closest('.modal')).length, 6);
    assert.equal(ui.document.body.style.overflow, 'hidden');
    ui.click('.modal [data-action="close"]');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(ui.document.body.style.overflow, '');
    ui.click('[data-action="odds"]');
    assert.match(ui.query('.modal-body').textContent, /A quiet year/);
    assert.match(ui.query('.modal-body').textContent, /Under the weather/);
  });

  test('starting over stores the chosen name as escaped text', async () => {
    const ui = await mount(ageTo(createGame({ seed: 98 }), 7));
    ui.click('[data-action="new"]');
    const chosenName = '<img src=x onerror=1> & Lee';
    ui.query('#new-name').value = chosenName;
    ui.click('[data-action="confirm-new"]');
    assert.equal(ui.saved().name, chosenName);
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.saved().generation, 1);
    assert.equal(ui.query('.person-name').textContent, chosenName);
    assert.equal(ui.all('#app img').length, 0, 'name must never become executable HTML');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('an adult can choose a job, earn income, and welcome one child per year', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Morgan Park', seed: 76 }), 18));
    ui.click('[data-action="tab"][data-tab="career"]');
    const retail = '[data-action="job"][data-id="retail"]';
    assert.equal(ui.query(retail).disabled, false);
    ui.click(retail);
    assert.equal(ui.saved().jobId, 'retail');
    assert.equal(ui.query(retail).disabled, true);
    ui.click('[data-action="tab"][data-tab="year"]');
    ui.click('[data-action="advance"]');
    assert.equal(ui.saved().age, 19);
    assert.ok(ui.saved().income > 0);
    assert.equal(ui.saved().jobYears, 1);
    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.equal(ui.saved().children[0].age, 0);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.match(ui.query('.child-grid').textContent, new RegExp(ui.saved().children[0].name));
    assert.equal(validateSave(ui.saved()), true);
  });

  test('choosing an heir requires confirmation and transfers skills and an equal share', async () => {
    const elder = ageTo(createGame({ name: 'Alex Bennett', seed: 55 }), 18);
    assert.equal(haveChild(elder).ok, true);
    advanceYear(elder);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 65);
    elder.money = 100000;
    elder.lifestyle = 5;
    const selected = structuredClone(elder.children[1]);
    const sibling = structuredClone(elder.children[0]);
    const info = successionInfo(elder);
    const ui = await mount(elder);
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('[data-action="heir"]').length, 2);
    ui.click(`[data-action="heir"][data-id="${selected.id}"]`);
    assert.equal(ui.saved().generation, 1, 'opening confirmation must leave the current life intact');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    const next = ui.saved();
    assert.equal(next.generation, 2);
    assert.equal(next.name, selected.name);
    assert.equal(next.age, selected.age);
    assert.deepEqual(next.stats, selected.stats);
    assert.deepEqual(next.aptitudes, selected.aptitudes);
    assert.equal(next.money, selected.money + info.share);
    assert.equal(next.siblings[0].money, sibling.money + info.share);
    assert.equal(next.children.length, 0);
    assert.equal(next.jobId, null);
    assert.equal(next.lineage.length, 1);
    assert.equal(ui.query('.person-name').textContent, selected.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(validateSave(next), true);
  });

  test('an elder can adopt a child, preventing a dead-end family story', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Sage Chen', seed: 83 }), 67));
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.query('[data-action="child"]').disabled, false);
    assert.match(ui.query('[data-action="child"]').textContent, /Adopt a child/);
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.equal(ui.saved().children[0].adopted, true);
    assert.equal(ui.saved().children[0].age, 0);
    assert.equal(ui.all('[data-action="heir"]').length, 1);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('all views and succession show lifestyle without money or annual cash-flow metrics', async () => {
    const elder = ageTo(createGame({ name: 'Robin Reed', seed: 47 }), 18);
    assert.equal(takeJob(elder, 'retail').ok, true);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 65);
    elder.money = 125000;
    elder.lifestyle = 5;
    assert.ok(elder.income > 0);
    assert.ok(elder.expenses > 0);
    const ui = await mount(elder);

    for (const tab of ['year', 'career', 'family', 'character']) {
      ui.click(`[data-action="tab"][data-tab="${tab}"]`);
      assertNoMoneyDisplay(ui.query('#app'), `${tab} view`);
      assert.match(ui.query('#main-content').textContent, /Lifestyle[\s\S]{0,30}5\s*\/\s*10/i, `${tab} view should show lifestyle on its 1–10 scale`);
    }

    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="heir"]');
    assertNoMoneyDisplay(ui.query('.modal'), 'heir confirmation');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assertNoMoneyDisplay(ui.query('#app'), 'next generation');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'succession journal');
    assert.match(ui.query('#main-content').textContent, /Lifestyle[\s\S]{0,30}\b(?:10|[1-9])\s*\/\s*10/i);
    ui.click('[data-action="history"]');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'complete family journal');
  });

  test('a saved life reloads and a valid import waits for explicit restore', async () => {
    const fixture = ageTo(createGame({ name: 'Taylor Brooks', seed: 99 }), 29);
    fixture.focus = { work: 5, social: 2, family: 2, self: 3 };
    const ui = await mount(fixture);
    assert.equal(ui.saved().age, 29);
    assert.deepEqual(ui.saved().focus, fixture.focus);
    ui.click('[data-action="tab"][data-tab="character"]');
    const incoming = createGame({ name: 'Avery Rivera', seed: 42 });
    const raw = JSON.stringify(incoming);
    await ui.change('#import-file', { size: raw.length, text: async () => raw });
    assert.equal(ui.saved().name, fixture.name);
    assert.match(ui.query('.modal-body').textContent, /Avery Rivera/);
    ui.click('#restore-save');
    assert.equal(ui.saved().name, incoming.name);
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.query('.person-name').textContent, incoming.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
  });

  test('a malformed saved life recovers into a playable new game', async () => {
    const ui = await mount('{"version":1,"age":10}');
    assert.equal(validateSave(ui.saved()), true);
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.query('[data-action="advance"]').disabled, false);
    assert.match(ui.query('#toast-root').textContent, /could not be read/);
    ui.click('[data-action="advance"]');
    assert.equal(ui.saved().age, 1);
  });
});
