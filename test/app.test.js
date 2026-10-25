// DOM integration checks run entirely in Node. They verify UI wiring and saves,
// but are not a substitute for checking layout in a real browser.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { SKILLS, JOBS, canTakeJob, chooseEducation, offeredJobs, needsEducationChoice, createGame, advanceYear, haveChild, takeJob, successionInfo, validateSave } from '../engine.js';

const SAVE_KEY = 'lifelines.save.v1';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const nativeSetTimeout = globalThis.setTimeout;
const nativeClearTimeout = globalThis.clearTimeout;
const originalGlobals = new Map(['document', 'window', 'localStorage', 'setTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const timers = new Set();
let importId = 0;

function ageTo(state, age) {
  while (state.age < age) {
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state).ok, true);
  }
  assert.equal(validateSave(state), true, 'fixture must be a valid loadable save');
  return state;
}

function startOfferedJob(state) {
  const job = offeredJobs(state).find(candidate => canTakeJob(state, candidate).ok);
  assert.ok(job, 'fixture must have a reachable offered career');
  assert.equal(takeJob(state, job.id).ok, true);
  return job;
}

function assertCareerOffers(ui, count) {
  const cards = ui.all('.job-card');
  assert.equal(cards.length, count);
  assert.equal(new Set(cards.map(card => card.dataset.jobId)).size, count);
  assert.deepEqual(cards.map(card => card.dataset.jobId), offeredJobs(ui.saved()).map(job => job.id));
  for (const card of cards) {
    const job = JOBS.find(candidate => candidate.id === card.dataset.jobId);
    assert.ok(job, 'every offered career belongs to the catalog');
    assert.equal(card.querySelector('h3').textContent.trim(), job.name);
    const lifestyle = card.querySelector('.job-lifestyle');
    assert.ok(lifestyle, 'every role must show its lifestyle, including the selected role');
    assert.match(lifestyle.textContent, new RegExp(`${job.baseLifestyle}\\s*\\/\\s*10`));
    const affinities = [...card.querySelectorAll('.job-affinities .job-affinity')];
    assert.equal(affinities.length, Object.keys(job.affinities).length);
    for (const [key, affinity] of Object.entries(job.affinities)) {
      const badge = affinities.find(element => element.dataset.skill === key);
      assert.ok(badge, `${job.name} must display its ${key} affinity`);
      assert.match(badge.textContent, new RegExp(SKILLS.find(skill => skill.key === key).label));
      assert.match(badge.textContent, new RegExp(`\\+${affinity}\\b`));
    }
    assertNoMoneyDisplay(card, job.name);
  }
}

function assertNoMoneyDisplay(element, context) {
  const text = element.textContent;
  assert.doesNotMatch(text, /[$€£¥]\s*[\d,.]+|\b(?:USD|EUR|GBP)\s*[\d,.]+/, `${context} should not expose currency amounts`);
  assert.doesNotMatch(text, /Annual income|Annual spending|Income last year|Spending last year|base\s*\/\s*yr/i, `${context} should use lifestyle rather than income or spending metrics`);
}

// Build the shape exported before the stability update, independently of the
// migration implementation, to exercise both persisted and imported backups.
function legacySave(state) {
  const legacy = structuredClone(state);
  legacy.version = 1;
  delete legacy.education;
  delete legacy.jobOffers;
  for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, ...legacy.lineage]) {
    person.stats.instability = Math.round((11 - person.stats.stability) * 100) / 100;
    delete person.stats.stability;
    if (person !== legacy && !legacy.lineage.includes(person)) delete person.lifestyle;
  }
  for (const effect of legacy.effects) {
    if ('stability' in effect.modifiers) {
      effect.modifiers.instability = -effect.modifiers.stability;
      delete effect.modifiers.stability;
    }
  }
  return legacy;
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
  test('the phone navigation keeps one year action and preserves the current life', async () => {
    const fixture = ageTo(createGame({ name: 'Riley Santos', seed: 20 }), 12);
    fixture.focus = { work: 5, social: 2, family: 2, self: 3 };
    const ui = await mount(fixture);
    const originalSave = ui.saved();
    const expectedTabs = ['year', 'career', 'family', 'character'];
    const expectedLabels = ['Year', 'Career', 'Family', 'You'];
    assert.equal(ui.all('.sidebar, .right-column').length, 0);
    assert.equal(ui.all('.bottom-dock .nav-list .nav-button').length, 4);
    assert.deepEqual(ui.all('.bottom-dock .nav-button').map(button => button.dataset.tab), expectedTabs);
    assert.deepEqual(ui.all('.bottom-dock .nav-label').map(label => label.textContent.trim()), expectedLabels);
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.ok(ui.query('.bottom-dock [data-action="advance"]'));
    assert.match(ui.query('.profile-bar').textContent, /Riley Santos/);
    assert.match(ui.query('.status-strip').textContent, /Health/);
    assert.match(ui.query('.status-strip').textContent, /Stability/);

    for (const tab of ['career', 'family', 'character']) {
      ui.click(`.bottom-dock [data-tab="${tab}"]`);
      assert.equal(ui.all('[data-action="advance"]').length, 0, 'other screens must not advance time accidentally');
      assert.equal(ui.query(`.nav-list [data-tab="${tab}"]`).getAttribute('aria-current'), 'page');
      assert.equal(ui.all('.bottom-dock .nav-button').length, 4);
      assert.deepEqual(ui.saved(), originalSave, 'navigation must preserve the full saved life');
    }
    ui.click('.bottom-dock [data-tab="year"]');
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.deepEqual(ui.saved().focus, fixture.focus);
    ui.click('.bottom-dock [data-action="advance"]');
    assert.equal(ui.saved().age, 13);
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('the More menu exposes utilities and a new life still requires confirmation', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Casey Walker', seed: 21 }), 24));
    const originalSave = ui.saved();
    assert.equal(ui.all('[data-action="new"]').length, 0, 'restart belongs in the utility menu');
    ui.click('[data-action="menu"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.equal(ui.query('#app').hasAttribute('inert'), true, 'the game underneath a sheet must not receive taps');
    for (const action of ['help', 'export', 'import', 'new']) {
      assert.ok(ui.query(`.menu-list [data-action="${action}"]`));
    }
    assert.deepEqual(ui.saved(), originalSave);
    ui.click('.menu-list [data-action="new"]');
    assert.equal(ui.all('[role="dialog"]').length, 1, 'a new-life prompt must replace the utility sheet');
    assert.ok(ui.query('#new-name'));
    assert.ok(ui.query('[data-action="confirm-new"]'));
    assert.deepEqual(ui.saved(), originalSave, 'opening the restart prompt must not discard progress');
    ui.click('.modal [data-action="close"]');
    assert.deepEqual(ui.saved(), originalSave);
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(ui.document.body.style.overflow, '');
    assert.equal(ui.query('#app').hasAttribute('inert'), false);
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="help"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.match(ui.query('.modal-body').textContent, /focus/i);
    assert.deepEqual(ui.saved(), originalSave);
  });

  test('a new baby renders, crying saves, and three annual advances unlock focus', async () => {
    const ui = await mount();
    const initial = ui.saved();
    assert.equal(initial.age, 0);
    assert.equal(ui.query('.person-name').textContent, 'Jamie Reed');
    assert.equal(ui.all('.choice-card').length, 2);
    assert.equal(ui.all('.stat-list .stat-row').length, 0, 'detailed skills belong on the You screen');
    assert.equal(ui.all('.birth-skills .birth-skill').length, 6, 'all adult skills must be visible from birth');
    assert.equal(ui.all('.birth-skills .aptitude').length, 6, 'every newborn skill needs its growth affinity');
    for (const [index, skill] of SKILLS.entries()) {
      assert.ok(initial.stats[skill.key] >= 1 && initial.stats[skill.key] <= 1.5, `${skill.label} should begin very low`);
      const cell = ui.all('.birth-skills .birth-skill')[index];
      assert.match(cell.textContent, new RegExp(skill.label));
      assert.ok(Number.isInteger(initial.aptitudes[skill.key]) && initial.aptitudes[skill.key] >= -3 && initial.aptitudes[skill.key] <= 3);
      assert.equal(cell.querySelector('.aptitude').textContent.trim(), `${initial.aptitudes[skill.key] > 0 ? '+' : ''}${initial.aptitudes[skill.key]}`);
    }
    assert.match(ui.query('.birth-skills').textContent, /affinity/i);
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
    assert.ok(ui.saved().parents[0].stats.stability < initial.parents[0].stats.stability);
    assert.match(ui.query('.journal-list').textContent, /bigger little world/i);
    assert.equal(validateSave(ui.saved()), true);
    assert.doesNotMatch(ui.query('#app').textContent, /undefined|NaN/);
    ui.click('.nav-list [data-tab="character"]');
    assert.equal(ui.all('.stat-list .stat-row').length, 6);
    assert.equal(ui.all('.stat-list .aptitude').length, 6);
    assert.equal(ui.saved().age, 3, 'viewing detailed skills must not advance the year');
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

  test('a child shares the displayed parental lifestyle until adulthood', async () => {
    const fixture = createGame({ name: 'Robin Park', seed: 211 });
    const parentLifestyle = fixture.parents[0].lifestyle;
    assert.ok(Number.isInteger(parentLifestyle) && parentLifestyle >= 1 && parentLifestyle <= 10);
    assert.ok(fixture.parents.every(parent => parent.lifestyle === parentLifestyle));
    const ui = await mount(fixture);
    for (let age = 0; age < 18; age += 1) {
      assert.equal(ui.saved().age, age);
      assert.equal(ui.saved().lifestyle, parentLifestyle);
      assert.match(ui.query('.status-strip').textContent, new RegExp(`Lifestyle\\s*${parentLifestyle}\\s*\\/\\s*10`));
      if (age === 0 || age === 17) {
        ui.click('.nav-list [data-tab="family"]');
        for (const card of ui.all('.family-card')) {
          assert.match(card.textContent, new RegExp(`Lifestyle[\\s\\S]{0,20}${parentLifestyle}\\s*\\/\\s*10`, 'i'));
        }
        ui.click('.nav-list [data-tab="year"]');
      }
      ui.click('.bottom-dock [data-action="advance"]');
    }
    assert.equal(ui.saved().age, 18);
    assert.equal(ui.saved().lifestyle, 1, 'an adult with no career or reserves starts supporting their own lifestyle');
    assert.equal(validateSave(ui.saved()), true);
  });

  test('Stability replaces Instability throughout character, family, effects, and help', async () => {
    const fixture = ageTo(createGame({ name: 'Quinn Reed', seed: 212 }), 26);
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2, discipline: -.6 }, kind: 'negative' }];
    const ui = await mount(fixture);
    for (const tab of ['year', 'career', 'family', 'character']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.doesNotMatch(ui.query('#app').textContent, /instability/i, `${tab} must use the positive stability scale`);
      assert.match(ui.query('.status-strip').textContent, /Stability\s*[\d.]+\s*\/\s*10/);
    }
    assert.match(ui.query('.effect-card.negative').textContent, /[Ss]tability\s*-1\.2/);
    assert.match(ui.query('.vitals-grid').textContent, /Higher is calmer/);
    assert.match(ui.query('.character-guide').textContent, /affinity/i);
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="help"]');
    assert.doesNotMatch(ui.query('.modal-body').textContent, /instability/i);
    assert.match(ui.query('.modal-body').textContent, /affinity/i);
  });

  test('an existing v1 life upgrades its stability without resetting progress', async () => {
    const fixture = ageTo(createGame({ name: 'Jordan Chen', seed: 213 }), 28);
    startOfferedJob(fixture);
    assert.equal(haveChild(fixture).ok, true);
    advanceYear(fixture);
    fixture.focus = { work: 4, social: 2, family: 3, self: 3 };
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2 }, kind: 'negative' }];
    const legacy = legacySave(fixture);
    assert.equal(legacy.version, 1);
    assert.ok('instability' in legacy.stats);
    const ui = await mount(legacy);
    const restored = ui.saved();
    assert.equal(restored.version, fixture.version);
    for (const key of ['id', 'name', 'age', 'generation', 'rng', 'nextId', 'jobId', 'jobYears', 'money']) {
      assert.equal(restored[key], fixture[key], `${key} must survive upgrading an existing save`);
    }
    assert.deepEqual(restored.stats, fixture.stats);
    assert.deepEqual(restored.aptitudes, fixture.aptitudes);
    assert.deepEqual(restored.focus, fixture.focus);
    assert.deepEqual(restored.history, fixture.history);
    assert.deepEqual(restored.effects[0].modifiers, { stability: -1.2 });
    assert.deepEqual(restored.parents.map(parent => parent.stats), fixture.parents.map(parent => parent.stats));
    assert.deepEqual(restored.children.map(child => child.stats), fixture.children.map(child => child.stats));
    assert.equal(validateSave(restored), true);
    assert.equal(ui.query('.person-name').textContent, fixture.name);
    assert.match(ui.query('.profile-age').textContent, /29/);
    assert.doesNotMatch(ui.query('#app').textContent, /instability|undefined|NaN/i);
    ui.click('.bottom-dock [data-action="advance"]');
    assert.equal(ui.saved().age, 30, 'the migrated life must remain playable');
  });

  test('a v1 backup imports with converted stability after restore confirmation', async () => {
    const current = ageTo(createGame({ name: 'Sage Rivera', seed: 214 }), 7);
    const incoming = ageTo(createGame({ name: 'Ellis Brooks', seed: 215 }), 24);
    incoming.stats.stability = 6.25;
    const legacy = legacySave(incoming);
    assert.equal(legacy.stats.instability, 4.75);
    const ui = await mount(current);
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="import"]');
    const raw = JSON.stringify(legacy);
    await ui.change('#import-file', { size: raw.length, text: async () => raw });
    assert.equal(ui.saved().name, current.name, 'choosing a legacy backup must still wait for confirmation');
    assert.match(ui.query('.modal-body').textContent, /Ellis Brooks/);
    ui.click('#restore-save');
    const restored = ui.saved();
    assert.equal(restored.version, incoming.version);
    assert.equal(restored.name, incoming.name);
    assert.equal(restored.age, incoming.age);
    assert.equal(restored.stats.stability, 6.25);
    assert.deepEqual(restored.aptitudes, incoming.aptitudes);
    assert.equal(restored.rng, incoming.rng);
    assert.equal(validateSave(restored), true);
    assert.equal(ui.query('.person-name').textContent, incoming.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
  });

  test('all sections render, childhood has no career offers, and dialogs close', async () => {
    const ui = await mount();
    ui.click('[data-action="tab"][data-tab="career"]');
    assert.equal(ui.all('.job-card').length, 0, 'career offers begin at adulthood');
    assert.equal(ui.all('[data-action="job"]').length, 0);
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('.family-card').length, 2);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="tab"][data-tab="character"]');
    assert.equal(ui.all('.stat-list .stat-row').length, 6);
    ui.click('[data-action="menu"]');
    assert.ok(ui.query('.menu-list [data-action="export"]'));
    ui.click('.menu-list [data-action="help"]');
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
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="new"]');
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
    const offered = ui.all('[data-action="job"]').find(button => !button.disabled);
    assert.ok(offered, 'a new adult must have at least one reachable career');
    const jobId = offered.dataset.id;
    const jobButton = `[data-action="job"][data-id="${jobId}"]`;
    ui.click(jobButton);
    assert.equal(ui.saved().jobId, jobId);
    assert.equal(ui.saved().education.status, 'workforce');
    assert.equal(ui.query(jobButton).disabled, true);
    assertCareerOffers(ui, 10);
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

  test('turning eighteen requires a choice between college and ten personal career offers', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Rowan Ellis', seed: 216 }), 17));
    ui.click('.bottom-dock [data-action="advance"]');
    assert.equal(ui.saved().age, 18);
    assert.equal(ui.saved().education.status, 'undecided');
    assert.equal(ui.all('[data-action="advance"]').length, 0, 'the next year must wait for a path');
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your path/i);
    assert.match(ui.query('#main-content').textContent, /college/i);
    const beforeNavigation = ui.saved();
    ui.click('.bottom-dock .advance-button');
    assert.equal(ui.query('.nav-list [data-tab="career"]').getAttribute('aria-current'), 'page');
    assert.deepEqual(ui.saved(), beforeNavigation, 'opening the choices must preserve the life');
    assert.ok(ui.query('.education-choice [data-action="education"][data-path="college"]'));
    assert.equal(ui.all('[data-action="education"][data-path="work"]').length, 0, 'starting work means choosing an actual offered job');
    assert.equal(ui.all('#career-search, #career-category, [data-action="career-more"]').length, 0, 'the shortlist is the complete choice screen');
    assertCareerOffers(ui, 10);
    assertNoMoneyDisplay(ui.query('#app'), 'the college or career decision');
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.all('[data-action="advance"]').length, 0, 'changing tabs must not bypass the decision');
    assert.equal(ui.saved().age, 18);
  });

  test('four college years persist across reloads and unlock fifteen career offers', async () => {
    let ui = await mount(ageTo(createGame({ name: 'Avery Vale', seed: 217 }), 18));
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 10);
    ui.click('[data-action="education"][data-path="college"]');
    assert.equal(ui.saved().age, 18, 'enrolling does not spend a year');
    assert.deepEqual(ui.saved().education, { status: 'college', years: 0 });
    assert.equal(ui.saved().jobId, null);
    assert.equal(ui.all('.job-card').length, 0, 'college students cannot choose a full-time career');
    assert.match(ui.query('.college-progress').textContent, /0\s*\/\s*4/);
    assertNoMoneyDisplay(ui.query('#app'), 'college progress');
    for (let year = 1; year <= 4; year += 1) {
      ui.click('.nav-list [data-tab="year"]');
      assert.match(ui.query('.focus-row').textContent, /College/);
      ui.click('.bottom-dock [data-action="advance"]');
      assert.equal(ui.saved().age, 18 + year);
      assert.equal(ui.saved().education.years, year);
      assert.equal(validateSave(ui.saved()), true);
      ui.click('.nav-list [data-tab="career"]');
      if (year < 4) {
        assert.equal(ui.saved().education.status, 'college');
        assert.equal(ui.all('.job-card').length, 0);
        assert.match(ui.query('.college-progress').textContent, new RegExp(`${year}\\s*\\/\\s*4`));
      } else {
        assert.equal(ui.saved().education.status, 'graduate');
        assertCareerOffers(ui, 15);
      }
      if (year === 2) {
        const persisted = ui.saved();
        ui = await mount(persisted);
        assert.deepEqual(ui.saved(), persisted, 'reloading must preserve the exact college progress');
      }
    }
    const graduate = ui.saved();
    ui = await mount(graduate);
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 15);
    assert.deepEqual(ui.saved().jobOffers, graduate.jobOffers, 'reloading must not reroll the graduate shortlist');
    const choice = ui.all('[data-action="job"]').find(button => !button.disabled);
    assert.ok(choice, 'a graduate must have an attainable offered role');
    ui.click(`[data-action="job"][data-id="${choice.dataset.id}"]`);
    assert.equal(ui.saved().education.status, 'graduate', 'taking a role must preserve graduation');
    assert.equal(ui.saved().jobId, choice.dataset.id);
    assertCareerOffers(ui, 15);
    assertNoMoneyDisplay(ui.query('#app'), 'a graduate career');
  });

  test('an existing v2 career survives the education update without reopening the age-eighteen decision', async () => {
    const fixture = ageTo(createGame({ name: 'Emery Quinn', seed: 218 }), 29);
    startOfferedJob(fixture);
    assert.equal(advanceYear(fixture).ok, true);
    const legacy = structuredClone(fixture);
    legacy.version = 2;
    delete legacy.education;
    delete legacy.jobOffers;
    const ui = await mount(legacy);
    const restored = ui.saved();
    assert.equal(restored.version, fixture.version);
    assert.equal(restored.education.status, 'workforce');
    for (const key of ['id', 'name', 'age', 'rng', 'jobId', 'jobYears', 'money', 'lifestyle']) {
      assert.equal(restored[key], fixture[key], `${key} must survive the education migration`);
    }
    assert.deepEqual(restored.stats, fixture.stats);
    assert.deepEqual(restored.history, fixture.history);
    assert.equal(validateSave(restored), true);
    assert.equal(ui.all('.bottom-dock [data-action="advance"]').length, 1);
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 10);
    assert.ok(ui.query(`.job-card[data-job-id="${fixture.jobId}"]`), 'an existing career stays in the shortlist');
    assert.equal(ui.query(`[data-action="job"][data-id="${fixture.jobId}"]`).disabled, true);
    assert.equal(ui.all('[data-action="education"]').length, 0);
  });

  test('choosing an heir requires confirmation and transfers skills and an equal share', async () => {
    const elder = ageTo(createGame({ name: 'Alex Bennett', seed: 55 }), 18);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 19);
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

  test('the phone dock leads to succession when a life closes', async () => {
    const elder = ageTo(createGame({ name: 'Jordan Patel', seed: 22 }), 60);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 85);
    const child = structuredClone(elder.children[0]);
    const ui = await mount(elder);
    assert.equal(ui.saved().needsSuccession, true);
    assert.equal(ui.all('[data-action="advance"]').length, 0);
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your heir/);
    ui.click('.bottom-dock .advance-button');
    assert.equal(ui.query('.nav-list [data-tab="family"]').getAttribute('aria-current'), 'page');
    assert.equal(ui.saved().age, 85);
    ui.click(`[data-action="heir"][data-id="${child.id}"]`);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assert.equal(ui.saved().name, child.name);
    assert.equal(ui.saved().age, child.age);
    assert.equal(ui.saved().needsSuccession, false);
    assert.equal(ui.saved().education.status, 'undecided', 'an adult heir gets their own college or career decision');
    assert.equal(ui.all('.bottom-dock [data-action="advance"]').length, 0);
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your path/i);
    assert.equal(ui.query('#app').hasAttribute('inert'), false);
  });

  test('all views and succession show lifestyle without money or annual cash-flow metrics', async () => {
    const elder = ageTo(createGame({ name: 'Robin Reed', seed: 47 }), 18);
    startOfferedJob(elder);
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
      assert.match(ui.query('.status-strip').textContent, /Lifestyle[\s\S]{0,30}5\s*\/\s*10/i, `${tab} view should show lifestyle on its 1–10 scale`);
    }

    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="heir"]');
    assertNoMoneyDisplay(ui.query('.modal'), 'heir confirmation');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assertNoMoneyDisplay(ui.query('#app'), 'next generation');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'succession journal');
    assert.match(ui.query('.status-strip').textContent, /Lifestyle\s*(?:10|[1-9])\s*\/\s*10/i);
    ui.click('[data-action="history"]');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'complete family journal');
  });

  test('a saved life reloads and the same import can be retried after cancelling restore', async () => {
    const fixture = ageTo(createGame({ name: 'Taylor Brooks', seed: 99 }), 29);
    fixture.focus = { work: 5, social: 2, family: 2, self: 3 };
    const ui = await mount(fixture);
    assert.equal(ui.saved().age, 29);
    assert.deepEqual(ui.saved().focus, fixture.focus);
    const input = ui.query('#import-file');
    input.value = 'C:\\fakepath\\lifelines-save.json';
    ui.click('[data-action="menu"]');
    assert.ok(ui.query('.menu-list [data-action="import"]'));
    ui.click('.menu-list [data-action="import"]');
    assert.equal(input.value, '', 'opening the picker must clear its previous file selection');
    const incoming = createGame({ name: 'Avery Rivera', seed: 42 });
    const raw = JSON.stringify(incoming);
    const importFile = { size: raw.length, text: async () => raw };
    input.value = 'C:\\fakepath\\lifelines-save.json';
    await ui.change('#import-file', importFile);
    assert.deepEqual(ui.saved(), fixture);
    assert.match(ui.query('.modal-body').textContent, /Avery Rivera/);
    ui.click('.modal [data-action="close"]');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.deepEqual(ui.saved(), fixture, 'cancelling restore must preserve every part of the current life');
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="import"]');
    assert.equal(input.value, '', 'clearing the persistent input permits choosing the same file again');
    input.value = 'C:\\fakepath\\lifelines-save.json';
    await ui.change('#import-file', importFile);
    assert.deepEqual(ui.saved(), fixture, 'retrying import still requires explicit restore');
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
