import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as engine from '../engine.js';
import { createCollegeOffers } from '../college.js';
import { createSchoolRecord } from '../school.js';
import { defaultFocus } from '../focus-rules.js';
import { housingDetails } from '../housing.js';

const copy = value => structuredClone(value);
const calm = { eventRandom: () => 1, mortalityRandom: () => 1, growthRandom: () => 0,
  parentCareerRandom: () => 1, fameRandom: () => 1 };
function applicant() {
  const state = engine.createGame({ seed: 14882 });
  Object.assign(state, { age: 18, conditions: [], effects: [], height: 68, adultHeight: 68,
    maturityAge: 18, growthAnchor: null, money: 1000000,
    education: { status: 'undecided', years: 0 },
    jobOffers: engine.JOBS.filter(job => !job.requiresCollege).slice(0, 10).map(job => job.id) });
  state.school = createSchoolRecord({ ...state, age: 17 });
  state.school.sports = { id: 'tennis', success: 9.5 };
  state.school.extracurricular = { id: 'chess', success: 8 };
  state.collegeApplications = createCollegeOffers(state);
  state.focus = defaultFocus(state);
  assert.equal(engine.validateSave(state), true);
  return state;
}
function student() {
  const state = applicant();
  assert.equal(engine.chooseEducation(state, 'college', 'community_transfer').ok, true);
  state.focus.social = 0;
  assert.equal(engine.joinCollegeSport(state, 'soccer').ok, true);
  return state;
}
function unchangedReload(state, label) {
  const before = copy(state), encoded = JSON.stringify(state);
  assert.equal(engine.validateSave(state), true, label);
  assert.deepEqual(engine.migrateSave(JSON.parse(encoded)), before, label);
  engine.annualForecast(state); engine.offeredColleges(state); engine.offeredJobs(state);
  engine.eventOdds(state); engine.focusLimits(state); housingDetails(state);
  assert.equal(JSON.stringify(state), encoded, `${label}: validation, reload and reads preserve every saved byte`);
}
function rejected(state, mutate, label) {
  const invalid = copy(state); mutate(invalid);
  const before = copy(invalid);
  assert.equal(engine.validateSave(invalid), false, label);
  assert.equal(engine.migrateSave(invalid), null, label);
  assert.deepEqual(invalid, before, `${label}: no repair or mutation`);
}

test('live sports Fame and pending invitations must match the current college source, not an unrelated old school sport', () => {
  const state = student();
  assert.equal(engine.advanceYear(state, calm).ok, true);
  rejected(state, s => {
    s.fame = { kind: 'sports', activityId: 'tennis', rating: 7, support: 0, startedAge: 17 };
  }, 'a historical school enrollment cannot validate the wrong current college Fame source');
  rejected(state, s => {
    s.pendingEvents = [{ eventId: 'fame_sports_offer', age: s.age, fameActivityId: 'tennis' }];
    s.lastYearEvents = ['fame_sports_offer'];
  }, 'a captured adult invitation must name the active college sport');
  state.fame = { kind: 'sports', activityId: 'soccer', rating: 7, support: 0, startedAge: 18 };
  unchangedReload(state, 'current college source');
});

test('named college years cannot precede captured application age while legacy education stays unmodified', () => {
  const state = student();
  for (const years of [1, 2, 3]) rejected(state, s => {
    s.education.years = years; s.education.gpa = 85;
  }, `${years} completed years cannot fit at the admission age`);
  for (let year = 1; year <= 4; year++) {
    assert.equal(engine.advanceYear(state, calm).ok, true);
    unchangedReload(state, `real college year ${year}`);
  }
  rejected(state, s => { s.collegeApplications.offeredAge = s.age - 3; }, 'four-year degree cannot follow applications by only three years');
});

test('college sport alongside extracurricular Fame retains both controls and their recorded adult budget', () => {
  const state = student();
  state.fame = { kind: 'extracurricular', activityId: 'chess', rating: 7, support: 0, startedAge: 17 };
  state.focus = { work: 2, social: 0, family: 1, self: 1, sports: 1, extracurricular: 3 };
  unchangedReload(state, 'simultaneous college sport and extracurricular Fame');
  assert.equal(engine.advanceYear(state, calm).ok, true);
  unchangedReload(state, 'completed simultaneous year');
  assert.equal(state.yearSummary.decisions.focusBudget, 8);
  assert.equal(state.yearSummary.decisions.collegeSport, 'soccer');
  rejected(state, s => { s.yearSummary.decisions.focus.sports = 3; s.yearSummary.decisions.focus.extracurricular = 1; }, 'extracurricular Fame does not grant third sports point');
  rejected(state, s => { s.yearSummary.decisions.focusBudget = 12; }, 'extra source controls do not add an adult budget');
  assert.equal(engine.quitFame(state).ok, true);
  assert.equal(engine.leaveCollegeSport(state).ok, true);
  unchangedReload(state, 'old review remains valid after both current controls disappear');
});

test('new optional nested records reject wrong shapes, nonfinite numbers and actor identities without mutation', () => {
  const state = student();
  const mutations = [
    ['array applications', s => { s.collegeApplications = []; }],
    ['null housing', s => { s.housing = null; }],
    ['array funding', s => { s.collegeApplications.funding = []; }],
    ['foreign family host', s => { s.housing = { status: 'parents', yearsWithFamily: 0, hostId: s.id }; }],
    ['missing scholarship', s => { delete s.collegeApplications.offers[0].scholarship; }],
    ['nonfinite annual cost', s => { s.collegeApplications.offers[0].annualPersonalCost = Infinity; }],
    ['nonfinite resources', s => { s.collegeApplications.funding.personalContribution = NaN; }],
    ['string scholarship coverage', s => { s.collegeApplications.offers[0].scholarship = { kind: 'academic', coverage: '1' }; }],
    ['extra sport field', s => { s.education.sport.reset = true; }],
    ['sport with unearned first score', s => { s.education.sport.success = 8; }],
    ['relative owns Fame', s => { s.parents[0].fame = { kind: 'personal', activityId: null, rating: 7, support: 0, startedAge: 20 }; }],
  ];
  for (const [label, mutate] of mutations) rejected(state, mutate, label);
});

test('modifier-free scheduling records require object maps and preserve large recorded budgets after expiry', () => {
  const base = applicant();
  assert.equal(engine.chooseEducation(base, 'work').ok, true);
  for (const [count, points] of [[65, 1], [200, -4], [200, 4]]) {
    const state = copy(base);
    state.effects = Array.from({ length: count }, (_, index) => ({
      id: `schedule-${index}`, name: 'Saved scheduling effect', description: '', years: 1,
      modifiers: {}, focusPoints: points,
    }));
    state.focus = Object.fromEntries(Object.keys(state.focus).map(key => [key, 0]));
    unchangedReload(state, `legitimate ${count}-record scheduling collection`);
    if (count === 65) {
      const date = new Date('2026-11-14T00:00:00Z');
      for (const modifiers of [[], 1, true, null, 'invalid', date, JSON.parse(JSON.stringify(date))]) {
        rejected(state, s => { s.effects.at(-1).modifiers = modifiers; }, `malformed modifier map ${String(modifiers)}`);
      }
    }
    assert.equal(engine.advanceYear(state, calm).ok, true);
    assert.equal(state.effects.length, 0);
    assert.equal(state.yearSummary.decisions.focusPointModifier, count * points);
    assert.equal(state.yearSummary.decisions.focusBudget, Math.max(0, 8 + count * points));
    unchangedReload(state, `expired ${count}-record scheduling collection retains its review`);
  }
});

test('adult new random draws are limited to each college report and the single fourth-season recruitment roll', () => {
  const withSport = student(), named = copy(withSport);
  delete named.education.sport;
  named.focus = defaultFocus(named);
  const legacy = copy(named);
  delete legacy.education.collegeId; delete legacy.education.gpa;
  delete legacy.collegeApplications; delete legacy.housing;
  function countedYear(original) {
    const state = copy(original), calls = { growth: 0, recruitmentOrFame: 0 };
    assert.equal(engine.advanceYear(state, { ...calm,
      growthRandom: () => { calls.growth++; return 0; },
      fameRandom: () => { calls.recruitmentOrFame++; return 1; },
    }).ok, true);
    unchangedReload(state, 'counted annual draw fixture');
    return { state, calls };
  }
  const original = countedYear(legacy), academic = countedYear(named), sport = countedYear(withSport);
  assert.equal(academic.calls.growth, original.calls.growth + 1, 'one academic report draw');
  assert.equal(sport.calls.growth, academic.calls.growth + 1, 'one college sport report draw');
  assert.equal(sport.calls.recruitmentOrFame, 0, 'no professional roll in the first season');
  let next = sport.state;
  for (let season = 2; season <= 4; season++) {
    const result = countedYear(next); next = result.state;
    assert.equal(result.calls.recruitmentOrFame, season === 4 ? 1 : 0, `season ${season}`);
  }
  assert.equal(countedYear(next).calls.recruitmentOrFame, 0, 'graduation never rerolls recruitment');
});

const frozenEngine = new URL('../.git/college-resume-baseline/engine.js', import.meta.url);
test('modern scheduling records preserve aggregate budget history after their expiry', () => {
  const state = applicant();
  assert.equal(engine.chooseEducation(state, 'work').ok, true);
  state.effects = Array.from({ length: 65 }, (_, index) => ({ id: `support-${index}`,
    name: 'Temporary scheduling support', description: '', years: 1, modifiers: {}, focusPoints: 4 }));
  unchangedReload(state, '65 temporary scheduling records');
  assert.equal(engine.advanceYear(state, calm).ok, true);
  assert.equal(state.effects.length, 0);
  assert.equal(state.yearSummary.decisions.focusPointModifier, 260);
  assert.equal(state.yearSummary.decisions.focusBudget, 268);
  assert.deepEqual(state.focus, defaultFocus(state));
  unchangedReload(state, 'expired scheduling records with retained aggregate review');
});

test('genuine pre-college runtime saves load exactly and remain playable through the new adult transition',
  { skip: !existsSync(frozenEngine) }, async t => {
    const old = await import(frozenEngine.href);
    let checkpoints = 0, pendingChoices = 0, transitions = 0;
    function check(state, label, progress = false) {
      assert.equal(old.validateSave(state), true, `${label}: accepted by original frozen engine`);
      assert.equal(state.collegeApplications, undefined);
      assert.equal(state.housing, undefined);
      unchangedReload(state, label); checkpoints++;
      if (!progress) return;
      const next = engine.migrateSave(copy(state));
      while (next.pendingEvents.length) {
        const pending = next.pendingEvents[0], event = engine.EVENTS.find(entry => entry.id === pending.eventId);
        assert.equal(engine.resolveEventChoice(next, event.choices[0].id, event.id, pending.subjectId).ok, true);
      }
      if (engine.needsEducationChoice(next)) assert.equal(engine.chooseEducation(next, 'work').ok, true);
      assert.equal(engine.advanceYear(next, calm).ok, true);
      unchangedReload(next, `${label}: next modern routine`); transitions++;
    }
    for (const seed of [121, 608, 881142, 621337]) {
      const state = old.createGame({ seed });
      check(state, `${seed}: birth`, true);
      const ages = new Set([2, 5, 12, 17, 18, 19, 21, 22, 30, 65]);
      let capturedPending = false;
      while (state.age < 65) {
        if (old.needsEducationChoice(state)) assert.equal(old.chooseEducation(state, seed % 2 ? 'college' : 'work').ok, true);
        assert.equal(old.advanceYear(state, { mortalityRandom: () => 1 }).ok, true);
        if (!capturedPending && state.pendingEvents.length) {
          check(state, `${seed}: genuine pending choice at ${state.age}`, true);
          capturedPending = true;
        }
        while (state.pendingEvents.length) {
          const pending = state.pendingEvents[0], event = old.EVENTS.find(entry => entry.id === pending.eventId);
          assert.equal(old.resolveEventChoice(state, event.choices[0].id, event.id, pending.subjectId).ok, true);
          pendingChoices++;
        }
        if (ages.has(state.age)) check(state, `${seed}: age ${state.age}`, true);
        if (state.age === 25) { old.haveChild(state); check(state, `${seed}: family action`); }
      }
      const info = old.successionInfo(state);
      assert.equal(old.succeed(state, info.candidates[0]?.id).ok, true);
      check(state, `${seed}: genuine succession`);
    }
    assert.ok(checkpoints >= 48);
    assert.ok(pendingChoices > 20);
    t.diagnostic(JSON.stringify({ checkpoints, pendingChoices, transitions, provenance: '.git/college-resume-baseline/engine.js (unmodified historical runtime)' }));
  });
