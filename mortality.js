// Annual all-cause death probabilities, SSA 2023 period life table (2026
// Trustees Report), retrieved 28 October 2026:
// https://www.ssa.gov/oact/STATS/table4c6.html
// Rows are [male qx, female qx] at exact ages 0..119. Use their equal-weight
// mean as one representative US baseline: the game has no country or medical
// sex/history model, and gender identity/pregnancy capability must not stand
// in for those. This is a population reference, not an individual prediction.
const LIFE_TABLE = [
  [.006015,.005125], [.000479,.000392], [.000320,.000229], [.000249,.000188], [.000194,.000155],
  [.000159,.000133], [.000137,.000115], [.000125,.000105], [.000120,.000100], [.000120,.000098],
  [.000125,.000101], [.000140,.000111], [.000173,.000126], [.000233,.000152], [.000327,.000188],
  [.000463,.000229], [.000634,.000273], [.000819,.000323], [.000999,.000372], [.001138,.000410],
  [.001235,.000441], [.001315,.000476], [.001378,.000513], [.001439,.000546], [.001509,.000582],
  [.001595,.000609], [.001685,.000641], [.001783,.000683], [.001876,.000740], [.001970,.000808],
  [.002085,.000878], [.002202,.000947], [.002308,.001018], [.002407,.001089], [.002490,.001154],
  [.002577,.001209], [.002665,.001263], [.002764,.001347], [.002864,.001438], [.002987,.001533],
  [.003115,.001643], [.003253,.001742], [.003419,.001845], [.003600,.001954], [.003777,.002075],
  [.003931,.002187], [.004073,.002306], [.004245,.002438], [.004477,.002595], [.004795,.002791],
  [.005126,.003030], [.005496,.003288], [.005917,.003554], [.006404,.003847], [.006923,.004172],
  [.007491,.004532], [.008173,.004923], [.008938,.005365], [.009714,.005815], [.010494,.006333],
  [.011337,.006923], [.012232,.007555], [.013196,.008220], [.014229,.008881], [.015316,.009514],
  [.016455,.010188], [.017574,.010880], [.018735,.011659], [.019981,.012543], [.021366,.013581],
  [.022903,.014769], [.024615,.016153], [.026504,.017705], [.028648,.019495], [.031071,.021533],
  [.033802,.023846], [.037010,.026458], [.041158,.029700], [.045461,.033135], [.050346,.036982],
  [.055633,.041183], [.061757,.045959], [.068358,.051282], [.075420,.057262], [.083364,.064107],
  [.092680,.071752], [.103459,.080490], [.115502,.090566], [.129018,.102204], [.143810,.115178],
  [.159458,.129176], [.176551,.144229], [.195360,.160353], [.216286,.177635], [.238799,.196502],
  [.262268,.216846], [.286291,.238750], [.310944,.261359], [.332325,.283899], [.349036,.306491],
  [.366568,.329680], [.384960,.353333], [.404252,.377300], [.424488,.401416], [.445712,.425501],
  [.467998,.451031], [.491398,.478092], [.515968,.506778], [.541766,.537185], [.568854,.568854],
  [.597297,.597297], [.627162,.627162], [.658520,.658520], [.691446,.691446], [.726018,.726018],
  [.762319,.762319], [.800435,.800435], [.840457,.840457], [.882480,.882480], [.926604,.926604],
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const stat = (person, key) => clamp(Number.isFinite(person.stats?.[key]) ? person.stats[key] : 7, 1, 10);

export function baselineAnnualMortality(age) {
  // Keep the final observed rate beyond the source's horizon rather than
  // introducing a guaranteed death on a particular birthday.
  const index = clamp(Math.floor(Number.isFinite(age) ? age : 0), 0, LIFE_TABLE.length - 1);
  const [male, female] = LIFE_TABLE[index];
  return (male + female) / 2;
}

function accidentShare(age) {
  // A deliberately coarse narrative cause split, not a cause-specific medical
  // model. Injury is more prominent in younger lives; natural causes dominate
  // later. Direction informed by NCHS Deaths: Leading Causes for 2023:
  // https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-010.pdf
  // All residual causes are simplified into the disease/natural-causes bucket.
  if (age < 1) return .08;
  if (age < 15) return .30;
  if (age < 45) return .40;
  if (age < 65) return .12;
  return .032;
}

export function mortalityRisk(person) {
  if (!person || person.alive === false) return { total: 0, disease: 0, accident: 0, baseline: 0 };
  const age = Number.isFinite(person.age) ? Math.max(0, person.age) : 0;
  const baseline = baselineAnnualMortality(age);
  const hazard = -Math.log1p(-baseline);
  const injuryShare = accidentShare(age);
  // Game calibration: health/stability 7 reproduce the population baseline.
  // A low health score raises disease hazard (2.32x at 1, 0.66x at 10).
  // These stat mappings are fictional, not estimates from the life table.
  const diseaseHazard = hazard * (1 - injuryShare) * Math.exp((7 - stat(person, 'health')) * .14);
  // Adult stability has a modest effect on accident hazard (0.90x..1.23x).
  // A child's own mood/crying never changes their accident risk.
  const accidentHazard = hazard * injuryShare * (age >= 18 ? Math.exp((7 - stat(person, 'stability')) * .035) : 1);
  const combined = diseaseHazard + accidentHazard;
  const total = -Math.expm1(-combined);
  // Competing causes share ONE annual death probability, so they cannot kill
  // a person twice or accidentally add extra mortality above the baseline.
  const disease = total * diseaseHazard / combined;
  return { total, disease, accident: total - disease, baseline };
}

export function rollMortality(person, random) {
  const risk = mortalityRisk(person);
  if (!risk.total) return null;
  const draw = random();
  if (draw >= risk.total) return null;
  return { cause: draw < risk.disease ? 'disease' : 'accident' };
}
