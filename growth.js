// Annual height reference: WHO length at birth/12 months, CDC 2000 stature
// from age 2 through 20. Retrieved 28 October 2026 from:
// https://www.cdc.gov/growthcharts/who-data-files.htm
// https://www.cdc.gov/growthcharts/cdc-data-files.htm
// https://www.cdc.gov/growthcharts/data/zscore/statage.csv
// WHO files: https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/
// WHO-Boys-Length-for-age-Percentiles.csv (and WHO-Girls-...)
// Rows are [L,M,S] at exact birthdays. CDC half-month rows were interpolated
// to exact birthdays. Under 2 the measure is recumbent length; from 2 onward
// it is standing stature. Between birthdays we interpolate annual rows, so
// this is a game approximation, not a clinical growth-chart calculator.
const REFERENCES = {
  male: [
    [1,49.8842,.03795], [1,75.7488,.03137], [.94152397,86.45220101,.04032153],
    [-.34738635,94.95998044,.04059422], [.79289757,102.22388965,.04129774],
    [1.26074434,108.9023949,.04254106], [1.15011953,115.39235885,.04363588],
    [.76974529,121.7688739,.04437647], [.46292913,127.8778733,.04509136],
    [.41313536,133.5113525,.0461638], [.50260837,138.61884085,.04755065],
    [.49181786,143.5205452,.0488876], [.41884808,149.0502592,.04991324],
    [.78680941,156.0870472,.05034193], [1.63582651,163.8384468,.04904587],
    [2.19551503,169.93989505,.04602429], [2.12577404,173.5057207,.04318184],
    [1.74126268,175.2903733,.04145769], [1.41049793,176.15989005,.04066324],
    [1.23378564,176.6044909,.04039575], [1.16727922,176.8492322,.04036957],
  ],
  female: [
    [1,49.1477,.0379], [1,74.015,.03479], [1.07244896,84.97555512,.04079139],
    [.56076862,93.92358993,.04199451], [.23843222,100.7509893,.0432089],
    [-.04754056,107.6636436,.0442414], [-.21562177,114.71406475,.04493965],
    [-.21349045,121.4913522,.04544163], [-.08593386,127.58924075,.04594285],
    [.07739254,132.9198686,.04683105], [.273317,137.99014455,.04861176],
    [.71867596,143.9779739,.05049254], [1.28852538,151.19010525,.04877191],
    [1.25613646,157.15406265,.04403731], [.96420497,160.3887163,.04109392],
    [.8950226,161.85767235,.0401042], [.93868718,162.54884935,.03982665],
    [.99722105,162.91258285,.03973453], [1.04581351,163.12397695,.03968881],
    [1.08203749,163.25470355,.03965841], [1.10804619,163.338251,.03963632],
  ],
};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const round = n => Math.round(n * 100) / 100;
const sexOf = value => value === 'female' ? 'female' : 'male';

// Keep the growth reference separate from gender identity and gestation.
// Engine-created people persist growthSex; the default only supports old callers.
export function heightReference(age, growthSex = 'male') {
  const years = clamp(Number.isFinite(age) ? age : 0, 0, 20);
  const rows = REFERENCES[sexOf(growthSex)];
  const low = Math.floor(years), high = Math.ceil(years), fraction = years - low;
  const [L, M, S] = rows[low].map((value, index) => value + (rows[high][index] - value) * fraction);
  // M*S is the LMS scale around the median, approximately one SD for stature.
  return { L, M, S, median: M, sd: M * S };
}

// Population medians supply age-specific increments, never personal targets.
// Shift pubertal timing after age 8 while preserving infant/childhood growth.
// The source population grows slightly past our playable maturity ages, so its
// small adult median remainder is spread across the last three reference years.
export function populationMedianAt(age, maturityAge = 17, growthSex = 'male') {
  const maturity = clamp(maturityAge, 14, 18);
  const birthMedian = heightReference(0, growthSex).median;
  const adultMedian = heightReference(20, growthSex).median;
  if (age <= 0) return birthMedian;
  if (age >= maturity) return adultMedian;
  const referenceMaturity = sexOf(growthSex) === 'female' ? 15 : 17;
  const remainder = adultMedian - heightReference(referenceMaturity, growthSex).median;
  const atBirthday = year => {
    const referenceAge = year <= 8 ? year : 8 + (year - 8) * (referenceMaturity - 8) / (maturity - 8);
    const t = clamp((referenceAge - referenceMaturity + 3) / 3, 0, 1);
    const finish = t * t * (3 - 2 * t);
    return heightReference(referenceAge, growthSex).median + remainder * finish;
  };
  const low = Math.floor(age), high = Math.ceil(age);
  return round(atBirthday(low) + (atBirthday(high) - atBirthday(low)) * (age - low));
}

// The engine supplies a seeded standard-normal residual; previews supply zero.
// Each year contributes an independent increment around the population age
// curve. Persistent growthFactor represents genetics, not an adult-height goal.
// Neither current height nor a legacy adultHeight target changes future gains.
// Annual residual SDs are gameplay variation, not measured velocity estimates.
// Poor nutrition and repeated/chronic illness can impair linear growth:
// https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell
// Health 7+ leaves the reference curve unchanged. Below that, up to 15% of a
// year's potential gain is lost at health 1. That mapping is game calibration,
// not a medical estimate. Recovery changes future gains, never repays missed
// growth. Actual adult height emerges from all the yearly gains and freezes at
// individual maturity; there is no personal endpoint or maturity catch-up.
export function advanceGrowth(person, normalDraw = 0) {
  const maturity = person.maturityAge ?? (person.growthSex === 'female' ? 15 : 17);
  if (person.alive === false || person.age >= maturity) return { height: person.height };
  const referenceGain = Math.max(0, populationMedianAt(person.age + 1, maturity, person.growthSex) - populationMedianAt(person.age, maturity, person.growthSex));
  const genetics = Number.isFinite(person.growthFactor) ? clamp(person.growthFactor, .8, 1.2) : 1;
  const expectedGain = referenceGain * genetics;
  const annualSD = Math.min(1.6, Math.max(.2, expectedGain * .08));
  const residual = clamp(Number.isFinite(normalDraw) ? normalDraw : 0, -3, 3) * annualSD;
  const health = Number.isFinite(person.stats?.health) ? person.stats.health : 7;
  const healthMultiplier = 1 - .15 * clamp((7 - health) / 6, 0, 1);
  const gain = Math.max(0, expectedGain + residual) * healthMultiplier;
  return { height: round(person.height + gain) };
}

// Compatibility for callers that need only a projected measurement.
export function advanceHeight(person, normalDraw = 0) {
  return advanceGrowth(person, normalDraw).height;
}

function normalCDF(z) {
  // Abramowitz-Stegun normal approximation (error below 8e-8).
  const t = 1 / (1 + .2316419 * Math.abs(z));
  const tail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - tail : tail;
}

export function heightPercentile(person) {
  const maturity = person.maturityAge ?? (person.growthSex === 'female' ? 15 : 17);
  if (!Number.isFinite(person.age) || !Number.isFinite(person.height) || person.height <= 0 || person.age >= maturity) return null;
  const { L, M, S } = heightReference(person.age, person.growthSex);
  const z = Math.abs(L) < 1e-8 ? Math.log(person.height / M) / S : (Math.pow(person.height / M, L) - 1) / (L * S);
  return round(clamp(normalCDF(z) * 100, .01, 99.99));
}
