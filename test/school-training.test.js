import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, enrollSchoolActivity, leaveSchoolActivity, setFocus, focusLimits, annualForecast, advanceYear, validateSave, migrateSave } from '../engine.js';
import { defaultFocus, focusBudget, focusMaxFor, focusNeutralFor } from '../focus-rules.js';
import { SPORTS, EXTRACURRICULARS, createSchoolRecord } from '../school.js';
import { standardFocusCoefficients, standardFocusPractice, schoolFocusSteps, schoolFocusEffects, schoolAppearanceChange, focusChoiceEffects, DEVELOPMENT_BALANCE, CHILDHOOD_DEDUCTION_SCALE } from '../development.js';
import { schoolChoiceImpacts } from '../choice-impacts.js';
import { changedRating } from '../rating-changes.js';

const copy = value => structuredClone(value);
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} vs ${expected}`);
const affected = changes => Object.entries(changes).filter(([, value]) => Math.abs(value) > 1e-10).map(([key]) => key).sort();
const inactivity = { sports: { strength: .3, social: .24 }, extracurricular: { creativity: .24, intelligence: .225 } };

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
  state.school.offers[kind] = [id, ...state.school.offers[kind].filter(other => other !== id)].slice(0, 3);
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

test('unjoined activities incur their fixed penalties and default enrolled allocations use ten points', () => {
  const state = student();
  assert.deepEqual(state.focus, { work: 2, social: 2, family: 2, self: 2, sports: 0, extracurricular: 0 });
  for (const area of ['sports', 'extracurricular']) {
    assert.equal(focusLimits(state)[area], 0);
    assert.equal(setFocus(state, area, 1).ok, false);
    assert.deepEqual(standardFocusCoefficients(state)[area], inactivity[area]);
    assert.deepEqual(affected(schoolFocusEffects(state, area)), Object.keys(inactivity[area]).sort());
    const penalties = schoolChoiceImpacts(state, area);
    assert.deepEqual(penalties.map(entry => entry.stat).sort(), Object.keys(inactivity[area]).sort());
    for (const entry of penalties) {
      assert.equal(entry.level, 1);
      near(entry.change, changedRating(5, -inactivity[area][entry.stat] * .575) - 5, 'unjoined activity retains one negative unit');
    }
  }
  join(state, 'sports', 'basketball');
  join(state, 'extracurricular', 'chess');
  assert.deepEqual(state.focus, { work: 2, social: 2, family: 2, self: 2, sports: 1, extracurricular: 1 });
  assert.equal(focusBudget(state), 10);
  assert.equal(Object.values(state.focus).reduce((sum, value) => sum + value), 10);
  assert.deepEqual(affected(focusChoiceEffects(state)), ['intelligence', 'social', 'strength']);
  for (const area of ['work', 'social', 'family', 'self']) assert.deepEqual(schoolChoiceImpacts(state, area), []);
  for (const area of ['sports', 'extracurricular']) assert.ok(schoolChoiceImpacts(state, area).every(entry => entry.level === 1 && entry.change > 0));
  assert.equal(setFocus(state, 'sports', 2).ok, false, 'the full default schedule needs a point freed first');
  assert.equal(setFocus(state, 'work', 1).ok, true);
  assert.equal(setFocus(state, 'sports', 2).ok, true);
  assert.equal(setFocus(state, 'sports', 3).ok, false);
  assert.equal(focusMaxFor(state, 'sports'), 2);
  assert.equal(focusNeutralFor(state, 'sports'), 1);
  assert.equal(leaveSchoolActivity(state, 'sports').ok, true);
  assert.equal(state.focus.sports, 0);
  assert.deepEqual(schoolChoiceImpacts(state, 'sports').map(entry => entry.stat).sort(), ['social', 'strength']);
  assert.equal(leaveSchoolActivity(state, 'extracurricular').ok, true);
  assert.equal(state.focus.extracurricular, 0);
  assert.deepEqual(schoolChoiceImpacts(state, 'extracurricular').map(entry => entry.stat).sort(), ['creativity', 'intelligence']);
});

test('basketball, chess, instruments, and modeling use fixed zero-point losses and their own positive training', () => {
  for (const kind of ['sports', 'extracurricular']) assert.deepEqual([0, 1, 2].map(points => schoolFocusSteps(kind, 'social', points)), [-1, 1, 2]);
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
      const coefficients = points === 0 ? inactivity[kind] : expected;
      assert.deepEqual(affected(contribution), Object.keys(coefficients).sort(), `${id} at ${points}`);
      assert.deepEqual(rows.map(row => row.stat).sort(), Object.keys(coefficients).sort());
      for (const [stat, coefficient] of Object.entries(coefficients)) {
        const units = [-1, 1, 2][points];
        const raw = coefficient * units;
        const baselineRaw = -(inactivity[kind === 'sports' ? 'extracurricular' : 'sports'][stat] || 0);
        const response = amount => amount * .575 * (amount >= 0 ? 1 + aptitude * .08 : 1 - aptitude * .07);
        const mean = response(baselineRaw + raw) - response(baselineRaw);
        near(standardFocusPractice(state)[stat] - standardFocusPractice(state, null, kind)[stat], raw, `${id} training has exactly ${units} raw units`);
        near(contribution[stat], mean, `${id} ${stat} keeps the single yearly and aptitude response`);
        const row = rows.find(entry => entry.stat === stat);
        assert.equal(row.level, Math.abs(units));
        near(row.change, changedRating(5, mean) - 5, `${id} preview applies boundary response once`);
      }
      assert.deepEqual(state, before, 'training and preview queries preserve choices, success, ratings, and RNG');
    }
  }
});

test('both unjoined activity penalties affect the actual year and forecast without touching saved state', () => {
  const state = student();
  const before = copy(state);
  const forecast = annualForecast(state);
  for (const [stat, coefficient] of Object.entries({ ...inactivity.sports, ...inactivity.extracurricular })) {
    near(standardFocusPractice(state)[stat], -coefficient, `${stat} has one raw negative unit without enrollment`);
    const bias = DEVELOPMENT_BALANCE.childhoodBias[stat];
    const expected = changedRating(5, -coefficient * .575 + bias * (bias < 0 ? CHILDHOOD_DEDUCTION_SCALE : 1));
    assert.equal(forecast.stats[stat].after, expected);
  }
  assert.deepEqual(state, before, 'previewing the default penalty preserves RNG and saves');
  const result = quietMean(state);
  assert.deepEqual(result.yearSummary.stats, forecast.stats);
  assert.equal(result.yearSummary.decisions.focus.sports, 0);
  assert.equal(result.school.sports, null);
  assert.equal(result.yearSummary.decisions.focus.extracurricular, 0);
  assert.equal(result.school.extracurricular, null);
});

test('school-age family members outside the enrollment system retain their existing practice', () => {
  for (const age of [5, 12, 17]) for (const school of [undefined, null]) {
    const person = student();
    person.age = age;
    if (school === undefined) delete person.school;
    else person.school = school;
    person.focus = { work: 2, social: 2, family: 2, self: 2 };
    const before = copy(person);
    assert.deepEqual(standardFocusCoefficients(person).sports, {});
    assert.deepEqual(standardFocusCoefficients(person).extracurricular, {});
    assert.deepEqual(affected(standardFocusPractice(person)), []);
    assert.deepEqual(affected(focusChoiceEffects(person)), []);
    assert.deepEqual(person, before);
  }
});

test('every catalog activity uses fixed inactivity losses at zero and its own positive training map', () => {
  for (const [kind, catalog] of [['sports', SPORTS], ['extracurricular', EXTRACURRICULARS]]) for (const activity of catalog) {
    const state = join(student(), kind, activity.id);
    if (kind === 'sports') {
      assert.equal(activity.training.health, undefined);
      assert.equal(activity.training.strength, .3);
      assert.equal(activity.training.social, .24);
    }
    for (const points of [0, 1, 2]) {
      state.focus[kind] = points;
      const entries = schoolChoiceImpacts(state, kind);
      assert.deepEqual(entries.map(entry => entry.stat).sort(), Object.keys(points === 0 ? inactivity[kind] : activity.training).sort(), `${activity.id} at ${points}: isolated training`);
      const units = [-1, 1, 2][points];
      assert.ok(entries.every(entry => entry.level === Math.abs(units) && Math.sign(entry.change) === Math.sign(units)));
    }
  }
});

test('activity previews honor restrictions, rating bounds, and lifestyle without changing sign proportions', () => {
  const state = join(student(), 'sports', 'basketball');
  state.focus.sports = 2;
  state.effects = [{ id: 'recovery', name: 'Recovery', years: 1, modifiers: {}, focusLimits: { standard: { self: 2 } } }];
  const before = copy(state);
  assert.equal(focusLimits(state).sports, 1);
  const capped = schoolChoiceImpacts(state, 'sports');
  assert.deepEqual(capped.map(entry => entry.stat).sort(), ['social', 'strength']);
  assert.ok(capped.every(entry => entry.level === 1 && entry.change > 0), 'a cap of one retains one positive training unit');
  assert.deepEqual(state, before, 'a preview does not apply its cap to saved allocations');
  state.effects = [];
  state.stats.strength = 9.99;
  state.stats.social = 10;
  const rows = schoolChoiceImpacts(state, 'sports');
  assert.deepEqual(rows.map(row => row.stat), ['strength']);
  assert.equal(rows[0].level, 2);
  near(rows[0].change, .01, 'partial clipping retains two plus signs');
  state.stats.strength = 0;
  state.stats.social = 0;
  state.focus.sports = 0;
  assert.deepEqual(schoolChoiceImpacts(state, 'sports'), [], 'fully blocked losses disappear');
  const expensive = join(student(), 'sports', 'lacrosse');
  expensive.lifestyle = 6;
  for (const points of [0, 1, 2]) {
    expensive.focus.sports = points;
    const before = copy(expensive);
    assert.deepEqual(affected(schoolFocusEffects(expensive, 'sports')), ['social', 'strength'], 'paused participation uses fixed sports inactivity losses');
    const penalties = schoolChoiceImpacts(expensive, 'sports');
    assert.deepEqual(penalties.map(entry => entry.stat).sort(), ['social', 'strength']);
    assert.ok(penalties.every(entry => entry.level === 1 && entry.change < 0), 'a stale positive saved focus cannot make paused training positive');
    assert.deepEqual(expensive, before);
  }
});

test('zero-point restrictions replace specialty training with generic inactivity losses without changing saved choices', () => {
  for (const [kind, id] of [['sports', 'fencing'], ['sports', 'gymnastics'], ['extracurricular', 'modeling'], ['extracurricular', 'chess']]) {
    const state = join(student(), kind, id);
    state.focus[kind] = 2;
    state.effects = [{ id: 'activity-break', name: 'Activity break', years: 1, modifiers: {},
      focusLimits: { standard: { [kind]: 0 } } }];
    const before = copy(state), penalties = schoolChoiceImpacts(state, kind);
    assert.deepEqual(penalties.map(entry => entry.stat).sort(), Object.keys(inactivity[kind]).sort());
    for (const entry of penalties) {
      assert.equal(entry.level, 1);
      near(entry.change, changedRating(5, -inactivity[kind][entry.stat] * .575) - 5, 'zero-cap preview uses exactly one generic loss unit');
    }
    assert.deepEqual(state, before, 'reading limits never resets focus or success');
    for (const stat of Object.keys(inactivity[kind])) state.stats[stat] = 0;
    assert.deepEqual(schoolChoiceImpacts(state, kind), [], 'fully clipped generic losses are hidden');
  }
});

test('Yourself and modeling combine appearance once before response, with consistent isolated previews', () => {
  const state = join(student(), 'extracurricular', 'modeling');
  state.focus.self = 1;
  state.focus.extracurricular = 1;
  for (const aptitude of [-3, 0, 3]) {
    state.aptitudes.attractiveness = aptitude;
    near(schoolAppearanceChange(state), 0, 'equal raw Yourself loss and modeling gain cancel before aptitude');
    const withoutModeling = { ...state, school: { ...state.school, extracurricular: null } };
    near(schoolFocusEffects(state, 'extracurricular').attractiveness, -schoolAppearanceChange(withoutModeling), 'modeling row is a marginal contribution against no appearance training');
  }
  state.aptitudes.attractiveness = 0;
  state.focus.work = 0;
  state.focus.self = 4;
  state.focus.extracurricular = 2;
  near(schoolAppearanceChange(state), (.225 * 3 + .225 * 2) * .5 * 1.15, 'combined positive appearance uses a single yearly response');
});

test('enrolled training forecasts match completed mean years and preserve activity choices through reload', () => {
  for (const [kind, id] of [['sports', 'basketball'], ['extracurricular', 'chess'], ['extracurricular', 'violin'], ['extracurricular', 'modeling']]) for (const points of [0, 1, 2]) {
    const state = join(student(), kind, id);
    state.focus[kind] = points;
    const before = copy(state);
    const forecast = annualForecast(state);
    assert.deepEqual(state, before, 'forecast preserves enrollment, success, offers, and RNG');
    const result = quietMean(state);
    assert.deepEqual(result.yearSummary.stats, forecast.stats, `${id} at ${points}`);
    assert.equal(result.yearSummary.decisions.focus[kind], points);
    assert.deepEqual(result.yearSummary.decisions.focusCaps, { sports: 2, extracurricular: 2 });
    assert.equal(result.yearSummary.school.activities.find(entry => entry.kind === kind).id, id);
    assert.equal(validateSave(result), true);
    assert.deepEqual(migrateSave(copy(result)), result, 'reload preserves success, offers, recorded choices, stats, and RNG');
  }
});
