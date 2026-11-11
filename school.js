import { heightReference } from './growth.js?v=activity-projection';

// Fictional school activities and success rules, independent of save mutation
// and the gameplay RNG. The engine supplies effective ratings and any draw.
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const round = (value, places) => Math.round(value * 10 ** places) / 10 ** places;
const activity = (id, name, weights, training, minLifestyle, heightPreference) => Object.freeze({
  id, name, weights: Object.freeze(weights), training: Object.freeze(training),
  ...(minLifestyle === undefined ? {} : { minLifestyle }),
  ...(heightPreference === undefined ? {} : { heightPreference }),
});
const sport = (id, name, weights = { strength: 1 }, extraTraining = {}, minLifestyle, heightPreference) =>
  activity(id, name, weights, { strength: .3, social: .24, ...extraTraining }, minLifestyle, heightPreference);
const instrument = (id, name) => activity(id, name, { creativity: 1 }, { creativity: .24 });
// Retained only for pre-update save validation/migration.
export const SCHOOL_OFFER_COUNT = 3;
export const MAX_SCHOOL_OFFERS = 10;

export function schoolOfferRules(lifestyle) {
  const rating = clamp(finite(lifestyle), 0, 10);
  return { chance: .2 + .08 * rating, medianCount: Math.max(2, Math.round(rating)) };
}

export const SPORTS = Object.freeze([
  sport('basketball', 'Basketball', { strength: .7, height: .3 }),
  sport('soccer', 'Soccer'),
  sport('football', 'Football'),
  sport('tennis', 'Tennis'),
  sport('cheerleading', 'Cheerleading', { strength: .6, attractiveness: .4 }),
  sport('lacrosse', 'Lacrosse', { strength: 1 }, {}, 7),
  sport('fencing', 'Fencing', { strength: .6, intelligence: .4 }, { intelligence: .225 }),
  sport('gymnastics', 'Gymnastics', { strength: .7, creativity: .3 }, { creativity: .24 }),
  sport('swimming', 'Swimming', { strength: .7, height: .3 }),
  sport('track', 'Track and field'),
  sport('cross_country', 'Cross-country running', { strength: .6, health: .4 }),
  sport('volleyball', 'Volleyball', { strength: .7, height: .3 }),
  sport('wrestling', 'Wrestling', { strength: .7, height: .3 }, {}, undefined, 'shorter'),
  sport('martial_arts', 'Martial arts'),
  sport('badminton', 'Badminton'),
  sport('table_tennis', 'Table tennis'),
  sport('baseball', 'Baseball'),
  sport('softball', 'Softball'),
  sport('rowing', 'Rowing', { strength: .65, health: .35 }),
  sport('golf', 'Golf', { strength: .55, stability: .45 }),
  sport('cycling', 'Cycling', { strength: .6, health: .4 }),
  sport('triathlon', 'Triathlon', { strength: .55, health: .45 }),
  sport('archery', 'Archery', { strength: .55, stability: .45 }),
  sport('diving', 'Diving', { strength: .6, stability: .4 }),
  sport('orienteering', 'Orienteering', { strength: .5, intelligence: .3, health: .2 }),
  sport('sport_climbing', 'Sport climbing', { strength: .55, intelligence: .3, stability: .15 }),
  sport('figure_skating', 'Figure skating', { strength: .5, creativity: .35, stability: .15 }),
  sport('artistic_swimming', 'Artistic swimming', { strength: .5, creativity: .3, health: .2 }),
]);

export const EXTRACURRICULARS = Object.freeze([
  activity('chess', 'Chess club', { intelligence: 1 }, { intelligence: .225 }),
  instrument('piano', 'Piano'),
  instrument('violin', 'Violin'),
  instrument('guitar', 'Guitar'),
  instrument('drums', 'Drums'),
  instrument('flute', 'Flute'),
  instrument('choir', 'Choir'),
  activity('modeling', 'Modeling', { attractiveness: 1 }, { attractiveness: .225 }),
  activity('debate', 'Debate club', { intelligence: .6, social: .4 }, { intelligence: .225, social: .24 }),
  activity('drama', 'Drama club', { creativity: .6, social: .4 }, { creativity: .24, social: .24 }),
  activity('robotics', 'Robotics club', { intelligence: .7, creativity: .3 }, { intelligence: .225, creativity: .24 }),
  activity('coding', 'Coding club', { intelligence: 1 }, { intelligence: .225 }),
  activity('math_club', 'Math club', { intelligence: 1 }, { intelligence: .225 }),
  activity('science_club', 'Science club', { intelligence: 1 }, { intelligence: .225 }),
  activity('art', 'Art club', { creativity: 1 }, { creativity: .24 }),
  activity('creative_writing', 'Creative writing', { creativity: 1 }, { creativity: .24 }),
  activity('photography', 'Photography club', { creativity: 1 }, { creativity: .24 }),
  activity('school_newspaper', 'School newspaper', { intelligence: .5, creativity: .5 }, { intelligence: .225, creativity: .24 }),
  activity('student_council', 'Student council', { social: .7, intelligence: .3 }, { social: .24, intelligence: .225 }),
  activity('volunteering', 'Volunteering', { social: 1 }, { social: .24 }),
  activity('language_club', 'Language club', { intelligence: .6, social: .4 }, { intelligence: .225, social: .24 }),
  activity('film_club', 'Film club', { creativity: .7, social: .3 }, { creativity: .24, social: .24 }),
]);

const catalog = kind => kind === 'sports' ? SPORTS : kind === 'extracurricular' ? EXTRACURRICULARS : [];
export const schoolActivity = (kind, id) => catalog(kind).find(entry => entry.id === id) || null;

const STUDY_GRADE_BASELINES = [50, 65, 80, 90, 97];
export function gradeScore(study, intelligence) {
  const points = clamp(finite(study), 0, 4);
  const lower = Math.floor(points), upper = Math.ceil(points);
  const baseline = STUDY_GRADE_BASELINES[lower]
    + (STUDY_GRADE_BASELINES[upper] - STUDY_GRADE_BASELINES[lower]) * (points - lower);
  // Effort sets the main grade; Intelligence moves it by at most ten points
  // in either direction. Even the lowest Intelligence benefits from studying.
  const intelligenceAdjustment = 2 * (clamp(finite(intelligence), 0, 10) - 5);
  return round(clamp(baseline + intelligenceAdjustment, 50, 100), 1);
}

const GRADE_BANDS = [[97, 'A+'], [93, 'A'], [90, 'A-'], [87, 'B+'], [83, 'B'], [80, 'B-'],
  [77, 'C+'], [73, 'C'], [70, 'C-'], [67, 'D+'], [63, 'D'], [60, 'D-'],
  [57, 'F+'], [53, 'F'], [50, 'F-']];
export function gradeLetter(score) {
  const bounded = clamp(finite(score, 50), 50, 100);
  return GRADE_BANDS.find(([minimum]) => bounded >= minimum)[1];
}

// Display the complete 0-10 activity range with the same 50-100 GPA bands.
// Keep earned success numeric in saves and leave unreported results unrated.
export function activityGradeLetter(success) {
  return Number.isFinite(success) ? gradeLetter(50 + 5 * clamp(success, 0, 10)) : 'N/A';
}

function heightRating(person) {
  const reference = heightReference(finite(person?.age), person?.growthSex);
  if (!Number.isFinite(person?.height) || person.height <= 0) return 5;
  // Saved height is inches; references are centimeters. Same-age comparisons
  // remain meaningful after early maturity and do not use an adult target.
  return clamp(5 + 2 * (person.height * 2.54 - reference.median) / reference.sd, 0, 10);
}

export function activityPerformance(person, selected) {
  if (!selected?.weights) return 0;
  let score = 0, total = 0;
  for (const [stat, rawWeight] of Object.entries(selected.weights)) {
    const weight = Math.max(0, finite(rawWeight));
    const rating = stat === 'height' ? heightRating(person) : clamp(finite(person?.stats?.[stat], 5), 0, 10);
    const value = stat === 'height' && selected.heightPreference === 'shorter' ? 10 - rating : rating;
    score += weight * value;
    total += weight;
  }
  return total ? clamp(score / total, 0, 10) : 0;
}

export function activitySuccessChange(person, selected, points, randomDraw = 0) {
  if (!selected) return 0;
  return round(.35 * (activityPerformance(person, selected) - 5)
    + .6 * (clamp(finite(points, 1), 0, 2) - 1)
    + clamp(finite(randomDraw), -3, 3) * .12, 2);
}

export function activityEligible(person, selected) {
  return Boolean(selected && person?.age >= 5 && person.age < 18
    && finite(person.lifestyle) >= (selected.minLifestyle ?? 0));
}

// Previews use zero noise; completed reports supply their existing annual draw.
export function activitySuccessAfterYear(person, selected, previousSuccess, points, randomDraw = 0) {
  if (!activityEligible(person, selected)) return previousSuccess;
  const delta = activitySuccessChange(person, selected, points, randomDraw);
  return round(clamp((previousSuccess ?? 5) + delta, 0, 10), 2);
}

function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) result = Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0;
  return result;
}

export function annualSchoolOffers(person, kind, previousIds = []) {
  if (!(person?.age >= 5 && person.age < 18)) return [];
  const { chance, medianCount } = schoolOfferRules(person.lifestyle);
  const excluded = new Set([...previousIds, person?.school?.[kind]?.id]);
  const candidates = catalog(kind).filter(entry => !excluded.has(entry.id));
  let seed = hash(`${person?.seed ?? 0}:${person?.id ?? ''}:${person?.generation ?? 1}:${person?.age ?? 0}:${kind}`);
  // Separate, reproducible rolls per category. Mix the seed before the first
  // draw so similar identities/years do not produce clustered invitations.
  const draw = () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  if (draw() >= chance) return [];
  // Lifestyle centers the distribution; each invitation gets its own size.
  // Symmetric offsets preserve the median, including at the 1/10 bounds.
  const sizeRoll = draw();
  const offset = sizeRoll < .1 ? -2 : sizeRoll < .3 ? -1 : sizeRoll < .7 ? 0 : sizeRoll < .9 ? 1 : 2;
  const count = clamp(medianCount + offset, 1, MAX_SCHOOL_OFFERS);
  // A local seeded shuffle keeps annual offers repeatable without touching
  // person.rng, Math.random, saved selections, or the previous offer list.
  for (let index = candidates.length - 1; index > 0; index--) {
    const other = Math.floor(draw() * (index + 1));
    [candidates[index], candidates[other]] = [candidates[other], candidates[index]];
  }
  return candidates.slice(0, count).map(entry => entry.id);
}

export function createSchoolRecord(person) {
  return {
    gpa: gradeScore(person?.focus?.work ?? 2, person?.stats?.intelligence ?? 5),
    reportedAge: null,
    offersAge: person.age,
    offers: { sports: annualSchoolOffers(person, 'sports'), extracurricular: annualSchoolOffers(person, 'extracurricular') },
    sports: null,
    extracurricular: null,
  };
}
