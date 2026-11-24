// Central balance knobs. Every value is a game rule chosen for play, not a
// medical or statistical estimate. Tune here; the modules only read them.

// Yearly events (event-rates.js). A "drive" runs from 0 at the neutral rating
// to 1 at the extreme in the event's direction (0 for low events, 10 for high).
export const EVENT_BALANCE = {
  maxPerYear: 5,
  neutralRating: 5,
  // One stat factor multiplies an event's base chance by
  // factorAtNeutral + (factorAtExtreme - factorAtNeutral) * drive ** factorCurve,
  // fading to 0 toward the opposite extreme. factorCurve 1 is linear, 2 is
  // quadratic; values below 1 bend it like a logarithm (fast early rise).
  factorAtNeutral: .4,
  factorAtExtreme: 4,
  factorCurve: 2,
  // Pool floor: the chance that at least one event caused by a rating happens.
  // Zero within poolStart points of neutral, then lowPoolMax (or highPoolMax)
  // * ((distance - poolStart) / (5 - poolStart)) ** poolCurve.
  poolStart: 1,
  lowPoolMax: .9, // rating 3: 11%, 2: 32%, 1: 58%, 0: 90%
  highPoolMax: .6,
  poolCurve: 1.5,
  relativePoolScale: .5, // a relative's ratings drive half as many events as your own
  poolEventCap: .3, // the most one event can take from its pool, so pools stay varied
  // Random events: no rating, relationship or grade causes them.
  statToRandomRatio: 3, // at most one random event per three expected stat-driven events
  randomPositiveShare: .5, // good share among automatic random events
  oneSidedRandomScale: .5, // when only good (or only bad) random events can occur
  repeatFactor: .15, // an event that happened last year is this much as likely
};

// Extra yearly death chance from very poor Health, for everyone at every age
// (mortality.js). anchorChance at anchorHealth, doubling for every
// doublingStep of Health lost: 5% at Health 2, 10% at 1, 20% at 0. Above
// fadeFrom it fades out linearly; at fadeTo and above only age-based odds apply.
export const MORTALITY_BALANCE = {
  anchorHealth: 1,
  anchorChance: .1,
  doublingStep: 1,
  fadeFrom: 2,
  fadeTo: 2.5,
  // Disease risk is multiplied by exp((5 - Health) * diseaseSlope) at every Health.
  diseaseSlope: .14,
  // The US life table already includes people in poor health, and the Health
  // rules add that risk back, so its age risk is scaled first. Tuned so default
  // play dies roughly like the table: about 6% before 40, 18% before 65 and
  // 57% before 85 (table: 4%, 17%, 58%; median death age 82).
  baselineScale: .5,
};

// Ratings at birth (engine.js, relationships.js, genetics.js): median 5 with a
// spread (standard deviation) of about 1, so a newborn below 2 is very rare.
export const BIRTH_BALANCE = {
  noise: .8, // random spread of a first-generation rating
  affinityShift: .3, // rating points per natural affinity step (-3..3)
  inheritedNoise: 1, // spread added around the parents' average
};

// Focus points and what focus areas change.
export const FOCUS_BALANCE = {
  schoolBudget: 9, // shared points during ages 5-17
  legacySchoolBudget: 10, // earlier releases; saves from them may still hold 10
  // Raw per-unit inputs, before CHOICE_STAT_MULTIPLIER and the yearly scale.
  friendsSocial: .06, // Friends raises Social only
  familyParentHealth: .08, // Family and Family time: each caregiver's Health
  // Each caregiver's Health by cry level 1-5, halved like the other cry effects.
  cryParentHealth: [.1, 0, -.1, -.2, -.3],
};

// School (school.js, engine.js). Stage ages are inclusive; each stage keeps its
// own running GPA, which starts fresh with the stage.
export const SCHOOL_BALANCE = {
  guaranteedOfferAge: 5, // both categories are always offered the year school starts
  stages: [
    { id: 'elementary', name: 'Elementary school', from: 5, to: 10 },
    { id: 'middle', name: 'Middle school', from: 11, to: 13 },
    { id: 'high', name: 'High school', from: 14, to: 17 }, // the only GPA colleges see
  ],
  // End of elementary and middle school.
  honorsGpa: 87, // B+ or better: pick one of honorsOptions random stats
  honorsReward: .75,
  honorsOptions: 3,
  honorsStats: ['strength', 'attractiveness', 'social', 'creativity', 'health'],
  warningGpa: 73, // below a C: parents yell and one random stat falls
  warningPenalty: .5,
  warningStats: ['social', 'creativity', 'stability'],
  // Activities train exactly the stats that grade them (height excepted). Each
  // trained stat gets its unit divided by (number of trained stats) ** trainingSplit.
  trainingUnits: { strength: .3, social: .24, creativity: .24, intelligence: .225, attractiveness: .225, health: .105, stability: .3 },
  trainingSplit: 1,
};

// Health lost each year from old age (engine.js), from startAge on.
export const AGING_BALANCE = {
  startAge: 65,
  playerHealthLoss: .05,
  relativeHealthLoss: .035,
};
