// Fictional economic balance, not real-world income or investment guidance.
// Each segment is logarithmic in resources. The final tenth represents a
// tenfold resource increase; it is deliberately not another small pay rise.
// This is the existing save-format bound, not a career earning ceiling.
export const MAX_RESOURCES = 1e15;
export const LIFESTYLE_BALANCE = {
  incomeLogScale: 25000,
  reserveDrawRate: .04,
  changeScale: 1,
  edgeExponent: 1.5,
};
export const LIFESTYLE_INCOME_ANCHORS = [
  [0, 1], [25000, 3], [50000, 4.5], [100000, 6], [200000, 7.2],
  [500000, 8.2], [1000000, 8.8], [2500000, 9.4], [10000000, 9.9], [100000000, 10],
];
const clamp = (value, low = 0, high = 10) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const rounded = value => Math.round(value * 10000) / 10000;
const resourceLog = value => Math.log1p(value / LIFESTYLE_BALANCE.incomeLogScale);

export function lifestyleFromResources(income = 0, money = 0) {
  const resources = Math.max(0, finite(income), Math.max(0, finite(money)) * LIFESTYLE_BALANCE.reserveDrawRate);
  const top = LIFESTYLE_INCOME_ANCHORS.at(-1);
  if (resources >= top[0]) return top[1];
  for (let index = 1; index < LIFESTYLE_INCOME_ANCHORS.length; index++) {
    const [upperIncome, upperRating] = LIFESTYLE_INCOME_ANCHORS[index];
    if (resources > upperIncome) continue;
    const [lowerIncome, lowerRating] = LIFESTYLE_INCOME_ANCHORS[index - 1];
    const portion = (resourceLog(resources) - resourceLog(lowerIncome)) / (resourceLog(upperIncome) - resourceLog(lowerIncome));
    // A sub-threshold resource level must never become an exact 10 by rounding.
    return Math.min(top[1] - .0001, rounded(lowerRating + portion * (upperRating - lowerRating)));
  }
  return top[1];
}

export function incomeForLifestyle(value) {
  const rating = clamp(finite(value));
  if (rating <= LIFESTYLE_INCOME_ANCHORS[0][1]) return 0;
  for (let index = 1; index < LIFESTYLE_INCOME_ANCHORS.length; index++) {
    const [upperIncome, upperRating] = LIFESTYLE_INCOME_ANCHORS[index];
    if (rating > upperRating) continue;
    const [lowerIncome, lowerRating] = LIFESTYLE_INCOME_ANCHORS[index - 1];
    const portion = (rating - lowerRating) / (upperRating - lowerRating);
    return LIFESTYLE_BALANCE.incomeLogScale * Math.expm1(resourceLog(lowerIncome) + portion * (resourceLog(upperIncome) - resourceLog(lowerIncome)));
  }
  return LIFESTYLE_INCOME_ANCHORS.at(-1)[0];
}

// Direct contributions from care, employment setbacks and temporary support
// use directional resistance. The current rating never supplies a contribution.
export function lifestyleChange(current, contribution) {
  const rating = clamp(finite(current));
  const amount = finite(contribution) * Math.max(0, finite(LIFESTYLE_BALANCE.changeScale, 1));
  if (!amount) return 0;
  const distance = amount > 0 ? 10 - rating : rating;
  const response = (Math.log1p(distance) / Math.log(6)) ** Math.max(0, finite(LIFESTYLE_BALANCE.edgeExponent, 1.5));
  return clamp(rating + amount * response) - rating;
}

export function changedLifestyle(current, contribution) {
  const starting = clamp(finite(current));
  const change = lifestyleChange(starting, contribution);
  return change ? roundLifestyle(starting + change) : starting;
}

export function roundLifestyle(value) {
  const bounded = clamp(finite(value));
  return bounded > 0 && bounded < 10 ? clamp(rounded(bounded), .0001, 9.9999) : bounded;
}

// General stat displays round to one decimal. Reserve 10.0 for the actual
// resource threshold rather than displaying it prematurely at 9.95.
export function lifestyleDisplayValue(value) {
  const rating = finite(value);
  return rating < 10 ? Math.min(9.9, Math.round(rating * 10) / 10) : Math.round(rating * 10) / 10;
}
