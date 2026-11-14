// Offline calibration only. Rendering uses the generated reference constants.
// Reproduce: node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001
// Regenerate observed references only; no passive rating targets are fitted.
import { writeFile } from 'node:fs/promises';
import { defaultFocus } from '../focus-rules.js';
import { BIRTH_VARIATION, TODDLER_FOCUS, CHOICE_STAT_MULTIPLIER, INFANT_STABILITY_MULTIPLIER, SKILL_VARIATION } from '../development.js';
import {
  createGame, advanceYear, resolveEventChoice, EVENTS, effectiveStats, fitFocusAllocation,
  DEVELOPMENT_BALANCE,
} from '../engine.js';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  const value = index === -1 ? fallback : Number(args[index + 1]);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${name}`);
  return value;
};
const samples = option('--samples', 2000);
const seedStart = option('--seed', 200001);
const statKeys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const round = value => Math.round(value * 1000000) / 1000000;
const moment = () => ({ count: 0, sum: 0, sum2: 0 });
const add = (entry, value) => { entry.count++; entry.sum += value; entry.sum2 += value * value; };
const mean = entry => entry.sum / entry.count;
const summarize = entry => ({ mean: round(mean(entry)), sd: round(Math.sqrt(Math.max(0, entry.sum2 / entry.count - mean(entry) ** 2))) });
const focus = defaultFocus(5);
const eventById = new Map(EVENTS.map(event => [event.id, event]));

function choiceRng(seed) {
  let value = (seed ^ 0xA5A5A5A5) >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

function cohort(measureAges) {
  const stats = Object.fromEntries(statKeys.map(key => [key, moment()]));
  const ageStats = Array.from({ length: 18 }, () => Object.fromEntries(statKeys.map(key => [key, moment()])));
  const height = { male: moment(), female: moment() };
  const ageHeight = Object.fromEntries(['male', 'female'].map(sex => [sex, Array.from({ length: 18 }, moment)]));
  const lifestyle = Array.from({ length: 18 }, moment);
  const survivors = { male: 0, female: 0 };
  for (const [sexIndex, gender] of ['male', 'female'].entries()) {
    for (let sample = 0; sample < samples; sample++) {
      const seed = seedStart + sexIndex * 1000000 + sample;
      const state = createGame({ seed, gender });
      state.cryLevel = 3;
      state.focus = { ...focus };
      const choose = choiceRng(seed);
      while (state.age < 18 && state.alive) {
        const desired = state.age >= 2 && state.age < 5 ? TODDLER_FOCUS : focus;
        state.focus = fitFocusAllocation(state, desired);
        // Same-age peers include everyone currently alive, irrespective of
        // whether they survive later years. No future projection is involved.
        if (measureAges) {
          const current = effectiveStats(state);
          for (const key of statKeys) add(ageStats[state.age][key], current[key]);
          add(ageHeight[gender][state.age], state.height);
          add(lifestyle[state.age], state.lifestyle);
        }
        const result = advanceYear(state);
        if (!result.ok) throw new Error(`Seed ${seed}: ${result.reason}`);
        while (state.pendingEvents.length) {
          const pending = state.pendingEvents[0];
          const choices = eventById.get(pending.eventId).choices;
          const choice = choices[Math.floor(choose() * choices.length)];
          const resolution = resolveEventChoice(state, choice.id, pending.eventId, pending.subjectId);
          if (!resolution.ok) throw new Error(`Seed ${seed}: ${resolution.reason}`);
        }
      }
      if (!state.alive) continue;
      survivors[gender]++;
      const final = effectiveStats(state);
      for (const key of statKeys) add(stats[key], final[key]);
      add(height[gender], state.height);
    }
  }
  return { stats, ageStats, height, ageHeight, lifestyle, survivors };
}

if (args.includes('--fit')) throw new Error('Fitting is disabled: ratings require causes; regenerate the reference without --fit.');

const result = cohort(true);
const reference = {
  calibration: {
    samplesPerSex: samples, seedStart, survivors: result.survivors,
    cryLevel: 3, cryThroughAge: 1, focus, toddlerFocus: TODDLER_FOCUS, choices: 'uniform, independent seeded draws',
    focusPolicy: 'core two-point targets with optional school activities unenrolled and both sports and extracurricular inactivity penalties active; fitted to birth-condition budgets and active condition/event caps, stacked capacity changes and required minima; spare points left unused',
    heightUnit: 'inches',
    conditionedOn: 'alive at the observed age',
    observationsByAge: [...result.ageStats.map(stats => stats.health.count), result.stats.health.count],
    birthVariation: BIRTH_VARIATION,
    choiceStatMultiplier: CHOICE_STAT_MULTIPLIER,
    infantStabilityMultiplier: INFANT_STABILITY_MULTIPLIER,
    skillVariation: SKILL_VARIATION,
    development: DEVELOPMENT_BALANCE,
    reproduce: `node scripts/calibrate-percentiles.mjs --samples ${samples} --seed ${seedStart}`,
  },
  stats: Object.fromEntries(statKeys.map(key => [key, {
    mean: 5, observedMean: round(mean(result.stats[key])), sd: summarize(result.stats[key]).sd,
    ages: result.ageStats.map(stats => ({ mean: 5, observedMean: round(mean(stats[key])), sd: summarize(stats[key]).sd })),
  }])),
  height: Object.fromEntries(['male', 'female'].map(sex => [sex, {
    ...summarize(result.height[sex]),
    ages: result.ageHeight[sex].map(summarize),
  }])),
  lifestyle: result.lifestyle.map(summarize),
};
const generated = '// Generated from seeded game lives; no real-world percentile tables.\n' +
  '// See calibration.reproduce below. Ages contain current same-age peer ratings;\n' +
  '// top-level stat and height moments describe age 18.\n' +
  `export const PERCENTILE_REFERENCE = ${JSON.stringify(reference, null, 2)};\n`;
await writeFile(new URL('../percentile-reference.js', import.meta.url), generated);
console.log(JSON.stringify({ survivors: result.survivors, stats: Object.fromEntries(statKeys.map(key => [key, summarize(result.stats[key])])), height: Object.fromEntries(['male', 'female'].map(sex => [sex, summarize(result.height[sex])])) }, null, 2));
