import { naturalSkillRating, BIRTH_VARIATION } from './development.js?v=decision-choice-rows-1';
// Fictional relationship balance. These are game rules, not real-world estimates.
// Actor identity and pregnancy capability are separate so future playable genders
// can use the same relationship system. The current default is men meeting women.
const CORE = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity'];
const TRAITS = [...CORE, 'health', 'stability'];
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const round = value => Math.round(value * 100) / 100;
const rating = value => clamp(Number.isFinite(value) ? value : 1, 0, 10);

export function desirability(state, stats = state.stats) {
  return (rating(stats.attractiveness) + rating(stats.social) + rating(state.lifestyle)) / 3;
}

export function meetingChances(state, stats = state.stats) {
  const score = desirability(state, stats);
  if (state.age < 18 || state.age >= 85 || (state.partner && state.partner.alive !== false) || state.ended || state.needsSuccession) {
    return { desirability: score, slots: 0, chance: 0, expected: 0 };
  }
  const strength = clamp((score - 1) / 9, 0, 1);
  const slots = 1 + Math.floor(strength * 4 + 1e-9);
  const socialFocus = clamp(state.focus?.social ?? 3, 0, 5);
  const chance = clamp((.22 + .7 * strength) * (.7 + socialFocus * .1), .05, .95);
  return { desirability: score, slots, chance, expected: slots * chance };
}

// A profile's overall abilities shape pursuit difficulty. This is deliberately
// distinct from the three player traits which generate meeting opportunities.
export function prospectQuality(person) {
  return (TRAITS.reduce((total, key) => total + rating(person.stats[key]), 0) + rating(person.lifestyle)) / 8;
}

export function relationshipOdds(state, person, stats = state.stats) {
  if (state.age < 18 || person?.age < 18 || !person?.stats || person.alive === false || (state.partner && state.partner.alive !== false) || state.ended || state.needsSuccession) return 0;
  const appeal = desirability(state, stats);
  return clamp(.58 + (appeal - prospectQuality(person)) * .065 + (appeal - 5.5) * .012, .04, .94);
}

export const relationshipChance = relationshipOdds;

export function oneNightChance(state, person, stats = state.stats) {
  const chance = relationshipOdds(state, person, stats);
  return chance ? clamp(chance + .06, .04, .96) : 0;
}

export function proposalChance(state) {
  const partner = state.partner;
  if (!partner || state.age < 18 || partner.age < 18 || partner.alive === false || partner.married || state.ended || state.needsSuccession || partner.lastProposalAge === state.age) return 0;
  const relationship = rating(partner.relationship);
  const years = clamp(partner.yearsTogether ?? 0, 0, 100);
  // Six shared years add 42 percentage points at the same relationship level.
  return clamp(.03 + relationship * .045 + Math.min(years / 6, 1) * .42 + Math.min(Math.max(years - 6, 0), 10) * .006, .05, .97);
}

export const marriageChance = proposalChance;

export function gestatingActor(state, partner = state.partner) {
  if (!partner || state.age < 18 || partner.age < 18 || partner.alive === false) return null;
  if (state.canGestate === true && partner.canGestate === false) return state;
  if (partner.canGestate === true && state.canGestate === false) return partner;
  return null;
}

export function pregnancyChance(state, partner = state.partner, { casual = false } = {}) {
  if (state.pregnancy || state.ended || state.needsSuccession || state.age >= 84 || (state.children?.length ?? 0) >= 6) return 0;
  const carrier = gestatingActor(state, partner);
  if (!carrier || carrier.age < 18 || carrier.age > 45) return 0;
  const baseChance = casual ? .01 : partner.married ? .25 : .02;
  const healthFactor = .5 + rating(carrier.stats.health) * .05;
  const ageFactor = carrier.age <= 35 ? 1 : 1 - (carrier.age - 35) * .05;
  return baseChance * healthFactor * ageFactor;
}

// Requested appearance pacing for the game, not a biological attractiveness
// standard. Identity remains independent from pregnancy and growth profiles.
export function appearanceDeclineAge(person) {
  return person.gender === 'female' ? 22 : 30;
}

export function attractivenessAgeChange(person) {
  const declineAge = appearanceDeclineAge(person);
  // Called at the start of a one-year interval: 30 -> 31 is after age 30.
  if (person.age < declineAge) return 0;
  return -(.06 + Math.min(40, person.age - declineAge) * .0018);
}

// Helpers are bound to the engine's seeded state: random(), integer(lo,hi),
// uid(prefix), personName(), and optionally randomAptitudes(). No unseeded RNG.
export function createProspects(state, helpers, stats = state.stats) {
  const chance = meetingChances(state, stats);
  if (!chance.slots) return [];
  const { random, integer, uid, personName } = helpers;
  const normal = () => clamp(Math.sqrt(-2 * Math.log(Math.max(1e-12, random()))) * Math.cos(2 * Math.PI * random()), -3, 3);
  const preference = Array.isArray(state.attractedTo) && state.attractedTo.length ? state.attractedTo : ['female'];
  const availableGenders = preference.filter(gender => ['male', 'female', 'nonbinary'].includes(gender));
  if (!availableGenders.length) return [];
  const prospects = [];
  const center = 2.6 + clamp((chance.desirability - 1) / 9, 0, 1) * 5.5;
  for (let slot = 0; slot < chance.slots; slot++) {
    if (random() >= chance.chance) continue;
    const gender = availableGenders[integer(0, availableGenders.length - 1)];
    const actorStats = Object.fromEntries(CORE.map(key => [key, round(clamp(center + (random() - .5) * 4.4, 0, 10))]));
    const aptitudes = helpers.randomAptitudes ? helpers.randomAptitudes() : Object.fromEntries(TRAITS.map(key => [key, integer(-3, 3)]));
    actorStats.health = round(clamp(naturalSkillRating(aptitudes.health) + normal() * BIRTH_VARIATION.health, 0, 10));
    actorStats.stability = round(clamp(naturalSkillRating(aptitudes.stability) + normal() * BIRTH_VARIATION.stability, 0, 10));
    const age = integer(Math.max(18, state.age - 5), Math.min(84, Math.max(18, state.age + 5)));
    const height = round(integer(150, 195) / 2.54);
    const appearancePeakAge = appearanceDeclineAge({ gender });
    for (let pastAge = appearancePeakAge; pastAge < age; pastAge++) {
      actorStats.attractiveness = clamp(actorStats.attractiveness + attractivenessAgeChange({age:pastAge,gender}),0,10);
    }
    actorStats.attractiveness = round(actorStats.attractiveness);
    prospects.push({
      id: uid('prospect'), name: personName(gender), age, stats: actorStats, aptitudes,
      height, adultHeight: height, lifestyle: round(clamp(center + (random() - .5) * 4, 0, 10)), alive: true,
      gender, canGestate: gender === 'female', attractedTo: [state.gender || 'male'], appearancePeakAge,
    });
  }
  return prospects;
}
