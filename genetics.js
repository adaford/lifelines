import { heightReference } from './growth.js?v=perk-affinity-overflow';
import { aptitudeBounds } from './birth-conditions.js?v=perk-affinity-overflow';

// Fictional inheritance settings for the game, not claims about human genetics.
// One shared scalar controls the spread around the parents' mean. Zero removes
// this variation; larger values broaden it without changing the parental mean.
export const GENETICS_BALANCE = {
  randomness: 1,
  ratingDeviation: 2.5,
  affinityDeviation: 1.6,
  growthDeviation: .047,
};

const STAT_KEYS = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability'];
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const round = (value, places) => Math.round(value * 10 ** places) / 10 ** places;
const symmetricInteger = value => Math.sign(value) * Math.round(Math.abs(value)) || 0;
const contributors = parents => Array.isArray(parents) ? parents.filter(parent => parent && typeof parent === 'object') : [];
const mean = (parents, value, fallback) => parents.length ? parents.reduce((sum, parent) => sum + value(parent), 0) / parents.length : fallback;

// Call the supplied seeded stream even at randomness zero, so tuning the spread
// does not change the caller's draw schedule. No function uses global randomness.
function residual(normal, randomness) {
  const draw = typeof normal === 'function' ? finite(normal()) : 0;
  return clamp(draw, -3, 3) * Math.max(0, finite(randomness, 1));
}

/**
 * Return all seven inherited base ratings, rounded to two decimals and bounded
 * to 0-10. Each supplied biological parent contributes equally through stats;
 * effects, effective ratings, partners and household bonuses are never read.
 * normal() supplies a seeded standard-normal draw, once per rating (seven calls).
 * With no supplied parents the neutral center is 5; adoption should continue to
 * use the caller's independent population generator rather than this fallback.
 */
export function inheritRatings(parents, normal, randomness = GENETICS_BALANCE.randomness) {
  const people = contributors(parents);
  return Object.fromEntries(STAT_KEYS.map(key => {
    const center = mean(people, parent => clamp(finite(parent.stats?.[key], 5), 0, 10), 5);
    return [key, round(clamp(center + residual(normal, randomness) * GENETICS_BALANCE.ratingDeviation, 0, 10), 2)];
  }));
}

/**
 * Return all seven inherited natural affinities from parents' stored totals,
 * including valid perk overflow. The parental mean plus one seeded normal
 * residual per stat is rounded symmetrically, then bounded to integer -3..3.
 * The caller applies the newborn's own perks once afterward, without clipping.
 * Zero randomness gives the nearest representable parental mean, with exact
 * halves rounded away from zero; parental Fame is never inherited.
 */
export function inheritAffinities(parents, normal, randomness = GENETICS_BALANCE.randomness) {
  const people = contributors(parents);
  return Object.fromEntries(STAT_KEYS.map(key => {
    const center = mean(people, parent => {
      const { min, max } = aptitudeBounds(parent, key);
      return clamp(finite(parent.aptitudes?.[key]), min, max);
    }, 0);
    return [key, clamp(symmetricInteger(center + residual(normal, randomness) * GENETICS_BALANCE.affinityDeviation), -3, 3)];
  }));
}

function parentalGrowthFactor(parent) {
  const growthSex = parent.growthSex;
  if (!['male', 'female'].includes(growthSex)) return clamp(finite(parent.growthFactor, 1), .8, 1.2);
  const maturity = finite(parent.maturityAge, growthSex === 'female' ? 15 : 17);
  const grown = finite(parent.age, -1) >= maturity;
  // Current adult stature is attained height, in inches. An old adultHeight
  // target on a still-growing person must never become a child's destination.
  const height = grown && finite(parent.height) > 0 ? parent.height
    : grown && finite(parent.adultHeight) > 0 ? parent.adultHeight : null;
  if (height !== null) {
    const adult = heightReference(20, growthSex).median;
    const birth = heightReference(0, growthSex).median;
    return clamp(1 + (height * 2.54 - adult) / (adult - birth), .8, 1.2);
  }
  return clamp(finite(parent.growthFactor, 1), .8, 1.2);
}

/**
 * Return a four-decimal growth tendency in .8..1.2, not an adult-height target.
 * Each mature parent's attained stature is normalized using that parent's own
 * growthSex adult and birth reference medians. This takes precedence over a stale
 * saved growthFactor; unavailable adult measurements or growth references fall back to the saved
 * tendency (or neutral 1). Consumes exactly one supplied normal draw, including
 * at randomness zero. Parents and their existing height records remain unchanged.
 */
export function inheritedGrowthFactor(parents, normal, randomness = GENETICS_BALANCE.randomness) {
  const center = mean(contributors(parents), parentalGrowthFactor, 1);
  return round(clamp(center + residual(normal, randomness) * GENETICS_BALANCE.growthDeviation, .8, 1.2), 4);
}
