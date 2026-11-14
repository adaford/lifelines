import { gradeScore } from './school.js?v=short-events-toddler-order';
import { incomeForLifestyle, lifestyleFromResources } from './lifestyle.js?v=short-events-toddler-order';
import { careerFit } from './career-rules.js?v=short-events-toddler-order';
import { JOBS } from './jobs.js?v=short-events-toddler-order';

// Fictional four-year routes, not rankings of actual institutions. College
// changes the distribution of opportunities, never a career's absolute cap.
export const COLLEGES = Object.freeze([
  { id: 'community_transfer', name: 'Community transfer pathway', difficulty: 2, requiredLifestyle: 2, careerPotential: 3.5,
    description: 'Two years locally, then two at a partner college. A smaller recruiting network and more guided classes keep this degree accessible.' },
  { id: 'regional_college', name: 'Regional public college', difficulty: 4, requiredLifestyle: 3, careerPotential: 5,
    description: 'A practical four-year degree with structured teaching and links to local employers.' },
  { id: 'state_university', name: 'State university', difficulty: 6, requiredLifestyle: 4, careerPotential: 6.5,
    description: 'A broad public university with demanding classes, campus teams and a wider employer network.' },
  { id: 'technical_university', name: 'Technical university', difficulty: 7.2, requiredLifestyle: 4.6, careerPotential: 7.5,
    description: 'Intensive technical study and industry projects can open specialist careers, with substantial work outside class.' },
  { id: 'research_university', name: 'Research university', difficulty: 8.4, requiredLifestyle: 5.3, careerPotential: 8.5,
    description: 'Independent study, research projects and national recruiting offer broad opportunities to students who keep up.' },
  { id: 'selective_university', name: 'Highly selective university', difficulty: 9.5, requiredLifestyle: 6.2, careerPotential: 9.5,
    description: 'A demanding academic environment and extensive recruiting network. Admission and strong grades are difficult to earn.' },
].map(entry => Object.freeze(entry)));

export const COLLEGE_BALANCE = {
  years: 4,
  familyContributionShare: .3,
  parentWillingnessFloor: .02,
  parentWillingnessRange: .96,
  parentRelationshipExponent: 2,
  academicScholarshipThreshold: 90,
  activityScholarshipThreshold: 8,
  academicScholarshipMaximum: .75,
  sportsScholarshipMaximum: .65,
  extracurricularScholarshipMaximum: .6,
  activityScholarshipExponent: 8,
  fullScholarshipChance: .12,
  difficultyGradePenalty: 2.25,
  referenceDifficulty: 4,
  gradeNoise: .8,
  campusLifestyle: 2.5,
  familyLivingDiscount: 1,
  maximumStudentLifestyle: 5.5,
  graduateMinimumOffers: 5,
  graduateMaximumOffers: 18,
  graduateGradeWeight: .55,
  graduatePotentialWeight: .45,
  careerQualityBias: 12,
};

const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const rounded = (value, places = 4) => Math.round(value * 10 ** places) / 10 ** places;
const resourceRating = value => value > 0 ? lifestyleFromResources(value) : 0;
export const collegeById = id => COLLEGES.find(college => college.id === id) || null;

// A different, well-mixed stream for each purpose. It does not read or advance
// the gameplay RNG, and changing offer order cannot change another offer.
function drawFor(state, key) {
  const text = `${state.seed}:${state.id}:${state.generation}:${key}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  hash ^= hash >>> 16; hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15; hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  // Open interval prevents a zero lottery key or log(0).
  return ((hash >>> 0) + .5) / 4294967296;
}

export function parentCollegeWillingness(relationship) {
  return clamp(COLLEGE_BALANCE.parentWillingnessFloor + COLLEGE_BALANCE.parentWillingnessRange
    * (clamp(finite(relationship), 0, 10) / 10) ** COLLEGE_BALANCE.parentRelationshipExponent);
}

function collegeFunding(state) {
  const candidates = [...(state.parents || []), state.guardian].filter(person => person
    && person.alive !== false && person.abandonedAt === undefined);
  const unique = [...new Map(candidates.map(person => [person.id, person])).values()];
  const supporters = unique.map(person => ({ id: person.id,
    willing: drawFor(state, `college:parent:${person.id}`) < parentCollegeWillingness(person.relationship) }));
  const livingLifestyle = unique.length ? Math.max(...unique.map(person => clamp(finite(person.lifestyle), 0, 10))) : 0;
  const willing = unique.filter(person => supporters.find(supporter => supporter.id === person.id).willing);
  // Caregivers share a household; never add the same household's income twice.
  const familyResources = willing.length ? Math.max(...willing.map(person => incomeForLifestyle(person.lifestyle)))
    * COLLEGE_BALANCE.familyContributionShare : 0;
  const personalResources = Math.max(0, finite(state.money)) / COLLEGE_BALANCE.years;
  return { familyResources, personalResources,
    supportedLifestyle: willing.length ? Math.max(...willing.map(person => clamp(finite(person.lifestyle), 0, 10))) : 0,
    funding: { householdLifestyle: livingLifestyle, familyContribution: resourceRating(familyResources),
      personalContribution: resourceRating(personalResources), availableLifestyle: resourceRating(familyResources + personalResources), supporters } };
}

export function collegeAdmissionChance(college, gpa, activitySuccess = 0) {
  if (!college) return 0;
  if (college.id === 'community_transfer') return 1;
  const difficulty = clamp(finite(college.difficulty), 0, 10);
  const academic = (clamp(finite(gpa, 50), 50, 100) - 75) / 25;
  const activity = (clamp(finite(activitySuccess), 0, 10) / 10) ** 6;
  return clamp(1 - difficulty * .055 + academic * .5 + activity * .15 - (difficulty / 10) ** 3 * .3, .02, .98);
}

function scholarshipFor(state, college, gpa) {
  const chances = [
    ['academic', gpa >= COLLEGE_BALANCE.academicScholarshipThreshold
      ? COLLEGE_BALANCE.academicScholarshipMaximum * ((gpa - 85) / 15) ** 2 : 0],
    ...['sports', 'extracurricular'].map(kind => {
      const success = state.school?.[kind]?.success;
      return [kind, Number.isFinite(success) && success >= COLLEGE_BALANCE.activityScholarshipThreshold
        ? COLLEGE_BALANCE[`${kind}ScholarshipMaximum`] * (clamp(success, 0, 10) / 10) ** COLLEGE_BALANCE.activityScholarshipExponent : 0];
    }),
  ];
  let award = null;
  for (const [kind, chance] of chances) {
    if (!(drawFor(state, `college:${college.id}:${kind}:award`) < chance)) continue;
    const roll = drawFor(state, `college:${college.id}:${kind}:coverage`);
    const coverage = roll < COLLEGE_BALANCE.fullScholarshipChance ? 1 : roll < .32 ? .75 : roll < .68 ? .5 : .25;
    if (!award || coverage > award.coverage) award = { kind, coverage };
  }
  return award;
}

// Capture this result once at the end of grade 12. Rendering and reloading
// should use the captured result, never roll funding or admissions again.
export function createCollegeOffers(state) {
  const schoolGpa = clamp(finite(state.school?.gpa, 50), 50, 100);
  const activitySuccess = Math.max(finite(state.school?.sports?.success), finite(state.school?.extracurricular?.success));
  const { familyResources, personalResources, supportedLifestyle, funding } = collegeFunding(state);
  const offers = COLLEGES.filter(college => drawFor(state, `college:${college.id}:admission`)
    < collegeAdmissionChance(college, schoolGpa, activitySuccess)).map(college => {
    const scholarship = scholarshipFor(state, college, schoolGpa);
    const cost = incomeForLifestyle(college.requiredLifestyle) * (1 - (scholarship?.coverage || 0));
    const annualPersonalCost = Math.max(0, Math.round(cost - familyResources));
    return { collegeId: college.id, scholarship, requiredLifestyle: resourceRating(cost),
      // Use the actual rounded payments charged by the engine, so a displayed
      // affordable offer can be selected even at the exact funding boundary.
      availableLifestyle: funding.availableLifestyle, affordable: personalResources + .000001 >= annualPersonalCost,
      annualPersonalCost,
      livingLifestyle: rounded(Math.max(COLLEGE_BALANCE.campusLifestyle,
        Math.min(COLLEGE_BALANCE.maximumStudentLifestyle, supportedLifestyle - COLLEGE_BALANCE.familyLivingDiscount))) };
  });
  return { offeredAge: state.age, schoolGpa, funding, offers };
}

export function studentLivingLifestyle(state, offer) {
  const own = lifestyleFromResources(0, Math.max(0, finite(state.money)));
  return offer?.affordable ? Math.max(own, clamp(finite(offer.livingLifestyle, COLLEGE_BALANCE.campusLifestyle), 0, 10)) : own;
}

export function collegeGradeScore(difficulty, focus, intelligence, noise = 0) {
  // Apply the course difficulty before clipping. Clipping the school score at
  // 100 first would discard the strongest students' Intelligence advantage and
  // make an A impossible at the most demanding college even with full effort.
  const score = gradeScore(focus, 5) + 2 * (clamp(finite(intelligence, 5), 0, 10) - 5)
    - (clamp(finite(difficulty, COLLEGE_BALANCE.referenceDifficulty), 0, 10) - COLLEGE_BALANCE.referenceDifficulty)
      * COLLEGE_BALANCE.difficultyGradePenalty
    + clamp(finite(noise), -3, 3) * COLLEGE_BALANCE.gradeNoise;
  return rounded(clamp(score, 50, 100), 1);
}

export function graduateOpportunityStrength({ collegeId, gpa } = {}) {
  const college = collegeById(collegeId);
  return clamp((clamp(finite(gpa, 75), 50, 100) - 50) / 50 * COLLEGE_BALANCE.graduateGradeWeight
    + (college?.careerPotential ?? 5) / 10 * COLLEGE_BALANCE.graduatePotentialWeight);
}

export function graduateCareerWeight(job, strength, stats = {}) {
  const quality = clamp((.65 * finite(job?.advancementPotential, 5) + .35 * finite(job?.baseLifestyle, 5)) / 10);
  return Math.exp(COLLEGE_BALANCE.careerQualityBias * (clamp(finite(strength)) - .5) * (quality - .5))
    * (.7 + .6 * careerFit(job, stats)) * (job?.requiresCollege ? 1.4 : .65);
}

// Weighted sampling without replacement. Every career retains strictly positive
// probability at every college/GPA. Offers may include future goals; existing
// engine age, skill and professional qualification checks still govern taking one.
export function graduateJobOffers(state, outcome = {}, jobs = JOBS) {
  const strength = graduateOpportunityStrength(outcome);
  const spread = Math.floor(drawFor(state, 'college:graduate:count') * 5) - 2;
  const count = clamp(Math.round(COLLEGE_BALANCE.graduateMinimumOffers + strength
    * (COLLEGE_BALANCE.graduateMaximumOffers - COLLEGE_BALANCE.graduateMinimumOffers) + spread),
  COLLEGE_BALANCE.graduateMinimumOffers, COLLEGE_BALANCE.graduateMaximumOffers);
  const ranked = jobs.map(job => ({ job, key: -Math.log(drawFor(state, `college:graduate:job:${job.id}`))
    / graduateCareerWeight(job, strength, state.stats) })).sort((a, b) => a.key - b.key || a.job.id.localeCompare(b.job.id));
  const offers = [];
  const add = id => { if (jobs.some(job => job.id === id) && !offers.includes(id) && offers.length < count) offers.push(id); };
  add(state.jobId); add('retail');
  for (const { job } of ranked) add(job.id);
  return offers;
}
