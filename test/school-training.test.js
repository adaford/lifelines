import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, enrollSchoolActivity, leaveSchoolActivity, setFocus, focusLimits, annualForecast, advanceYear, validateSave, migrateSave } from '../engine.js';
import { defaultFocus, focusBudget, focusMaxFor, focusNeutralFor } from '../focus-rules.js';
import { SPORTS, EXTRACURRICULARS, createSchoolRecord } from '../school.js';
import { standardFocusCoefficients, schoolFocusEffects, schoolAppearanceChange, focusChoiceEffects } from '../development.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} vs ${expected}`);
const affected = changes => Object.entries(changes).filter(([, value]) => Math.abs(value) > 1e-10).map(([key]) => key).sort();

function student() {
  const state = createGame({ seed: 91423 });
  state.age = 12;
  state.conditions = [];
  state.lifestyle = 8;
  for (const person of [state, ...state.parents]) {
    for (const key of Object.keys(person.stats)) { person.stats[key] = 5; person.aptitudes[key] = 0; }
    if ('relationship' in person) person.relationship = 5;
  }
  state.school = createSchoolRecord(state);
  state.focus = defaultFocus(state);
  return state;
}

function join(state, kind, id) {
  state.school.offers[kind] = [id, ...state.school.offers[kind].filter(other => other !== id)].slice(0, 5);
  assert.equal(enrollSchoolActivity(state, kind, id).ok, true);
  return state;
}

function quietMean(state) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = copy(state);
    candidate.rng = (state.rng + Math.imul(attempt, 2654435761)) >>> 0;
    assert.equal(advanceYear(candidate, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
    if (!candidate.lastYearEvents.length) return candidate;
  }
  assert.fail('Could not isolate a mean school year without random events');
}

test('unjoined school activities have no training effects and mixed neutral allocations use ten points', () => {
  const state = student();
  assert.deepEqual(state.focus, { work: 2, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 });
  for (const area of ['sports', 'extracurricular']) {
    assert.equal(focusLimits(state)[area], 0);
    assert.equal(setFocus(state, area, 1).ok, false);
    assert.deepEqual(schoolChoiceImpacts(state, area), []);
    assert.deepEqual(affected(schoolFocusEffects(state, area)), []);
    assert.deepEqual(standardFocusCoefficients(state)[area], {});
  }
  join(state, 'sports', 'basketball');
  join(state, 'extracurricular', 'chess');
  assert.deepEqual(state.focus, { work: 2, social: 2, family: 2, self: 2, sports: 1, extracurricular: 1 });
  assert.equal(focusBudget(state), 10);
  assert.equal(Object.values(state.focus).reduce((sum, value) => sum + value), 10);
  assert.deepEqual(affected(focusChoiceEffects(state)), []);
  for (const area of Object.keys(state.focus)) assert.deepEqual(schoolChoiceImpacts(state, area), []);
  assert.equal(setFocus(state, 'sports', 2).ok, false, 'the full neutral schedule needs a point freed first');
  assert.equal(setFocus(state, 'work', 1).ok, true);
  assert.equal(setFocus(state, 'sports', 2).ok, true);
  assert.equal(setFocus(state, 'sports', 3).ok, false);
  assert.equal(focusMaxFor(state, 'sports'), 2);
  assert.equal(focusNeutralFor(state, 'sports'), 1);
  assert.equal(leaveSchoolActivity(state, 'sports').ok, true);
  assert.equal(state.focus.sports, 0);
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), []);
});

test('basketball, chess, instruments, and modeling train only their requested stats', () => {
  const cases = [
    ['sports', 'basketball', { strength: .3, social: .24 }],
    ['extracurricular', 'chess', { intelligence: .225 }],
    ...['piano', 'violin', 'guitar', 'drums', 'flute', 'choir'].map(id => ['extracurricular', id, { creativity: .24 }]),
    ['extracurricular', 'modeling', { attractiveness: .225 }],
  ];
  for (const [kind, id, expected] of cases) for (const aptitude of [-3, 0, 3]) {
    const state = join(student(), kind, id);
    for (const key of Object.keys(state.aptitudes)) state.aptitudes[key] = aptitude;
    for (const points of [0, 1, 2]) {
      state.focus[kind] = points;
      const before = copy(state);
      const contribution = schoolFocusEffects(state, kind);
      const rows = schoolChoiceImpacts(state, kind);
      assert.deepEqual(affected(contribution), points === 1 ? [] : Object.keys(expected).sort(), `${id} at ${points}`);
      assert.deepEqual(rows.map(row => row.stat).sort(), points === 1 ? [] : Object.keys(expected).sort());
      for (const [stat, coefficient] of Object.entries(expected)) {
        const raw = coefficient * (points - 1);
        const mean = raw * .5 * 1.15 * (raw >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
        near(contribution[stat], mean, `${id} ${stat} keeps the single yearly and aptitude response`);
        if (points !== 1) {
          const row = rows.find(entry => entry.stat === stat);
          assert.equal(row.level, 1);
          near(row.change, changedRating(5, mean) - 5, `${id} preview applies boundary response once`);
        }
      }
      assert.deepEqual(state, before, 'training and preview queries preserve choices, success, ratings, and RNG');
    }
  }
});

test('every enrolled catalog activity uses its own training map and all sports omit health', () => {
  for (const [kind, catalog] of [['sports', SPORTS], ['extracurricular', EXTRACURRICULARS]]) for (const activity of catalog) {
    const state = join(student(), kind, activity.id);
    if (kind === 'sports') {
      assert.equal(activity.training.health, undefined);
      assert.equal(activity.training.strength, .3);
      assert.equal(activity.training.social, .24);
    }
    for (const points of [0, 2]) {
      state.focus[kind] = points;
      const entries = schoolChoiceImpacts(state, kind);
      assert.deepEqual(entries.map(entry => entry.stat).sort(), Object.keys(activity.training).sort(), `${activity.id}: isolated training`);
      assert.ok(entries.every(entry => entry.level === 1 && Math.sign(entry.change) === points - 1));
    }
  }
});

test('activity previews honor restrictions, rating bounds, and lifestyle without changing sign proportions', () => {
  const state = join(student(), 'sports', 'basketball');
  state.focus.sports = 2;
  state.effects = [{ id: 'recovery', name: 'Recovery', years: 1, modifiers: {}, focusLimits: { standard: { self: 2 } } }];
  const before = copy(state);
  assert.equal(focusLimits(state).sports, 1);
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), [], 'a cap at neutral prevents the proposed extra training');
  assert.deepEqual(state, before, 'a preview does not apply its cap to saved allocations');
  state.effects = [];
  state.stats.strength = 9.99;
  state.stats.social = 10;
  const rows = schoolChoiceImpacts(state, 'sports');
  assert.deepEqual(rows.map(row => row.stat), ['strength']);
  assert.equal(rows[0].level, 1);
  near(rows[0].change, .01, 'partial clipping retains a single plus');
  state.stats.strength = 0;
  state.stats.social = 0;
  state.focus.sports = 0;
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), [], 'fully blocked losses disappear');
  const expensive = join(student(), 'sports', 'lacrosse');
  expensive.lifestyle = 6;
  for (const points of [0, 1, 2]) {
    expensive.focus.sports = points;
    assert.deepEqual(affected(schoolFocusEffects(expensive, 'sports')), [], 'unaffordable enrollment does not train or punish');
    assert.deepEqual(schoolChoiceImpacts(expensive, 'sports'), []);
  }
});

test('Yourself and modeling combine appearance once before response, with consistent isolated previews', () => {
  const state = join(student(), 'extracurricular', 'modeling');
  state.focus.self = 1;
  state.focus.extracurricular = 2;
  for (const aptitude of [-3, 0, 3]) {
    state.aptitudes.attractiveness = aptitude;
    near(schoolAppearanceChange(state), 0, 'equal raw Yourself loss and modeling gain cancel before aptitude');
    const withoutModeling = { ...state, focus: { ...state.focus, extracurricular: 1 } };
    near(schoolFocusEffects(state, 'extracurricular').attractiveness, -schoolAppearanceChange(withoutModeling), 'modeling row is a marginal contribution against neutral enrollment');
  }
  state.aptitudes.attractiveness = 0;
  state.focus.work = 0;
  state.focus.self = 4;
  near(schoolAppearanceChange(state), (.225 * 3 + .225) * .5 * 1.15, 'combined positive appearance uses a single yearly response');
});

test('enrolled training forecasts match completed mean years and preserve activity choices through reload', () => {
  for (const [kind, id] of [['sports', 'basketball'], ['extracurricular', 'chess'], ['extracurricular', 'violin'], ['extracurricular', 'modeling']]) {
    const state = join(student(), kind, id);
    state.focus[kind] = 2;
    const before = copy(state);
    const forecast = annualForecast(state);
    assert.deepEqual(state, before, 'forecast preserves enrollment, success, offers, and RNG');
    const result = quietMean(state);
    assert.deepEqual(result.yearSummary.stats, forecast.stats, id);
    assert.equal(result.yearSummary.decisions.focus[kind], 2);
    assert.deepEqual(result.yearSummary.decisions.focusCaps, { sports: 2, extracurricular: 2 });
    assert.equal(result.yearSummary.school.activities.find(entry => entry.kind === kind).id, id);
    assert.equal(validateSave(result), true);
    assert.deepEqual(migrateSave(copy(result)), result, 'reload preserves success, offers, recorded choices, stats, and RNG');
  }
});
