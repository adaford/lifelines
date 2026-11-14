import { schoolActivity, activityPerformance } from './school.js?v=perk-affinity-overflow';
import { fameActivityMatches, hasFame } from './fame.js?v=perk-affinity-overflow';

// Fictional competition settings, not estimates of real recruitment odds.
// College success is relative to a much more selective field than high school.
export const COLLEGE_SPORT_BALANCE = Object.freeze({
  abilityExponent: 6,
  trainingFactors: Object.freeze([0, .6, 1, 1.05]),
  adjustmentRate: .65,
  reportNoise: .12,
  professionalMinimumSeasons: 4,
  professionalMinimumSuccess: 8.5,
  professionalMinimumAbility: 9,
  professionalMaxChance: .25,
  professionalExponent: 4,
  fameMinimumSuccess: 7,
  fameMaxChance: .06,
  fameExponent: 8,
});

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const round = value => Math.round(value * 100) / 100;
const selectedSport = person => schoolActivity('sports', person?.education?.sport?.id);

export function collegeSportEligible(person, selected = selectedSport(person)) {
  return Boolean(person?.age >= 18 && person.education?.status === 'college'
    && person.alive !== false && selected && selected.id === person.education.sport?.id
    && schoolActivity('sports', selected.id));
}

export function collegeSportSuccessAfterYear(person, previousSuccess, points, randomDraw = 0) {
  const selected = selectedSport(person);
  if (!collegeSportEligible(person, selected)) return previousSuccess;
  const maximum = fameActivityMatches(person, 'sports', selected.id) ? 3 : 2;
  const training = COLLEGE_SPORT_BALANCE.trainingFactors[clamp(Math.round(finite(points)), 0, maximum)];
  const ability = activityPerformance(person, selected) / 10;
  const target = clamp(10 * ability ** COLLEGE_SPORT_BALANCE.abilityExponent * training, 0, 10);
  // The first report starts in the college field; an outstanding high-school
  // result is not a college rating. Later reports retain some earned form.
  const mean = Number.isFinite(previousSuccess)
    ? clamp(previousSuccess, 0, 10) + (target - clamp(previousSuccess, 0, 10)) * COLLEGE_SPORT_BALANCE.adjustmentRate
    : target;
  const noise = training ? clamp(finite(randomDraw), -3, 3) * COLLEGE_SPORT_BALANCE.reportNoise : 0;
  return round(clamp(mean + noise, 0, 10));
}

export function professionalSportChance(person) {
  const sport = person?.education?.sport, selected = selectedSport(person);
  if (!selected || !(person.age >= 18) || !['college', 'graduate'].includes(person.education.status)
    || person.alive === false || finite(sport.seasons) < COLLEGE_SPORT_BALANCE.professionalMinimumSeasons
    || !Number.isFinite(sport.success) || sport.success < COLLEGE_SPORT_BALANCE.professionalMinimumSuccess) return 0;
  const ability = activityPerformance(person, selected);
  if (ability < COLLEGE_SPORT_BALANCE.professionalMinimumAbility) return 0;
  const successTail = clamp((sport.success - COLLEGE_SPORT_BALANCE.professionalMinimumSuccess)
    / (10 - COLLEGE_SPORT_BALANCE.professionalMinimumSuccess), 0, 1);
  const abilityTail = clamp((ability - COLLEGE_SPORT_BALANCE.professionalMinimumAbility)
    / (10 - COLLEGE_SPORT_BALANCE.professionalMinimumAbility), 0, 1);
  return COLLEGE_SPORT_BALANCE.professionalMaxChance * successTail ** COLLEGE_SPORT_BALANCE.professionalExponent * abilityTail;
}

export function collegeSportFameChance(person) {
  const sport = person?.education?.sport;
  if (!collegeSportEligible(person) || hasFame(person) || person.ended || person.needsSuccession
    || !(person.focus?.sports > 0) || !(sport.seasons > 0)
    || !Number.isFinite(sport.success) || sport.success < COLLEGE_SPORT_BALANCE.fameMinimumSuccess) return 0;
  return COLLEGE_SPORT_BALANCE.fameMaxChance * (clamp(sport.success, 0, 10) / 10) ** COLLEGE_SPORT_BALANCE.fameExponent;
}
