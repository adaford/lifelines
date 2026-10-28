// Offline calibration only. Rendering uses the generated reference constants.
// Reproduce: node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001
// Refit development after changing the simulation: add --fit.
import { readFile, writeFile } from 'node:fs/promises';
import {
  createGame, advanceYear, resolveEventChoice, EVENTS, effectiveStats,
  projectAt18, DEVELOPMENT_BALANCE,
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
const learned = ['intelligence', 'strength', 'social', 'creativity'];
const round = value => Math.round(value * 1000000) / 1000000;
const moment = () => ({ count: 0, sum: 0, sum2: 0 });
const add = (entry, value) => { entry.count++; entry.sum += value; entry.sum2 += value * value; };
const mean = entry => entry.sum / entry.count;
const summarize = entry => ({ mean: round(mean(entry)), sd: round(Math.sqrt(Math.max(0, entry.sum2 / entry.count - mean(entry) ** 2))) });
const focus = { work: 3, social: 3, family: 3, self: 3 };
const eventById = new Map(EVENTS.map(event => [event.id, event]));

function choiceRng(seed) {
  let value = (seed ^ 0xA5A5A5A5) >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

function cohort(measureProjections) {
  const stats = Object.fromEntries(statKeys.map(key => [key, moment()]));
  const projections = Array.from({ length: 18 }, () => Object.fromEntries(statKeys.map(key => [key, moment()])));
  const height = { male: moment(), female: moment() };
  const projectedHeight = Object.fromEntries(['male', 'female'].map(sex => [sex, Array.from({ length: 18 }, moment)]));
  const lifestyle = Array.from({ length: 18 }, moment);
  const survivors = { male: 0, female: 0 };
  for (const [sexIndex, gender] of ['male', 'female'].entries()) {
    for (let sample = 0; sample < samples; sample++) {
      const seed = seedStart + sexIndex * 1000000 + sample;
      const state = createGame({ seed, gender });
      state.cryLevel = 3;
      state.focus = { ...focus };
      const choose = choiceRng(seed);
      const path = [];
      while (state.age < 18 && state.alive) {
        if (measureProjections) path.push({ ...projectAt18(state), lifestyle: state.lifestyle });
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
      for (const [age, projected] of path.entries()) {
        for (const key of statKeys) add(projections[age][key], projected.stats[key]);
        add(projectedHeight[gender][age], projected.height);
        add(lifestyle[age], projected.lifestyle);
      }
    }
  }
  return { stats, projections, height, projectedHeight, lifestyle, survivors };
}

if (args.includes('--fit')) {
  let best = { error: Infinity, balance: structuredClone(DEVELOPMENT_BALANCE) };
  for (let iteration = 0; iteration < 8; iteration++) {
    const measured = cohort(false);
    const averages = Object.fromEntries(statKeys.map(key => [key, round(mean(measured.stats[key]))]));
    console.log(`Fit ${iteration + 1}: ${JSON.stringify(averages)}`);
    const error = [...learned, 'health', 'stability'].reduce((sum, key) => sum + (averages[key] - 5) ** 2, 0);
    if (error < best.error) best = { error, balance: structuredClone(DEVELOPMENT_BALANCE) };
    if ([...learned, 'health', 'stability'].every(key => Math.abs(averages[key] - 5) <= .025)) break;
    for (const key of learned) {
      // Damping avoids oscillation across the engine's hundredth-point rounding
      // steps. Preserve the best measured coefficients rather than an untested
      // final update when a quantization step prevents an exact fit.
      const next = DEVELOPMENT_BALANCE.skillScale[key] * (3.75 / Math.max(.1, averages[key] - 1.25)) ** .4;
      DEVELOPMENT_BALANCE.skillScale[key] = round(Math.max(.15, Math.min(2, next)));
    }
    for (const key of ['health', 'stability']) {
      const response = 1 - (1 - DEVELOPMENT_BALANCE.wellbeingReversion[key]) ** 18;
      DEVELOPMENT_BALANCE.wellbeingTarget[key] = round(DEVELOPMENT_BALANCE.wellbeingTarget[key] + (5 - averages[key]) / response);
    }
  }
  Object.assign(DEVELOPMENT_BALANCE, best.balance);
  const moduleUrl = new URL('../development.js', import.meta.url);
  const source = await readFile(moduleUrl, 'utf8');
  await writeFile(moduleUrl, source.replace(/export const DEVELOPMENT_BALANCE = \{[\s\S]*?\n\};/, `export const DEVELOPMENT_BALANCE = ${JSON.stringify(DEVELOPMENT_BALANCE, null, 2)};`));
}

const result = cohort(true);
const reference = {
  calibration: {
    samplesPerSex: samples, seedStart, survivors: result.survivors,
    cryLevel: 3, focus, choices: 'uniform, independent seeded draws',
    conditionedOn: 'surviving to age 18',
    development: DEVELOPMENT_BALANCE,
    reproduce: `node scripts/calibrate-percentiles.mjs --samples ${samples} --seed ${seedStart}`,
  },
  stats: Object.fromEntries(statKeys.map(key => [key, {
    mean: 5, observedMean: round(mean(result.stats[key])), sd: summarize(result.stats[key]).sd,
    corrections: result.projections.map(projected => round(mean(result.stats[key]) - mean(projected[key]))),
  }])),
  height: Object.fromEntries(['male', 'female'].map(sex => [sex, {
    ...summarize(result.height[sex]),
    corrections: result.projectedHeight[sex].map(projected => round(mean(result.height[sex]) - mean(projected))),
  }])),
  lifestyle: result.lifestyle.map(summarize),
};
const generated = '// Generated from seeded game lives; no real-world percentile tables.\n' +
  '// See calibration.reproduce below. Mean corrections cover expected future events\n' +
  '// and stochastic/clamping effects absent from the routine-only projection.\n' +
  `export const PERCENTILE_REFERENCE = ${JSON.stringify(reference, null, 2)};\n`;
await writeFile(new URL('../percentile-reference.js', import.meta.url), generated);
console.log(JSON.stringify({ survivors: result.survivors, stats: Object.fromEntries(statKeys.map(key => [key, summarize(result.stats[key])])), height: Object.fromEntries(['male', 'female'].map(sex => [sex, summarize(result.height[sex])])) }, null, 2));
