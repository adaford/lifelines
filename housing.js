import { lifestyleFromResources } from './lifestyle.js?v=parent-colors-events';
import { studentLivingLifestyle } from './college.js?v=parent-colors-events';

// Fictional annual household budgets. Keep housing consequences explicit and
// separate from ability, employability, and a person's worth as a partner.
export const HOUSING_BALANCE = Object.freeze({
  maxFamilyYears: 3, minimumRelationship: 6, minimumHostLifestyle: 2,
  independentAnnualCost: 9000, familyAnnualCost: 3000,
  familySocial: -.06, familyStability: .06,
  homelessHealth: -.3, homelessSocial: -.18, homelessStability: -.25,
  familyMeetingMultiplier: .8, homelessMeetingMultiplier: .55,
});
export function housingHost(state) {
  return [...(state.parents || []), state.guardian].filter(person => person
    && person.alive !== false && person.abandonedAt === undefined
    && person.relationship >= HOUSING_BALANCE.minimumRelationship
    && person.lifestyle >= HOUSING_BALANCE.minimumHostLifestyle)
    .sort((a, b) => b.relationship - a.relationship || a.id.localeCompare(b.id))[0] || null;
}
export function nextHousing(state, { income = state.jobId ? state.income || 0 : 0, money = state.money || 0, completeYear = false } = {}) {
  const yearsWithFamily = state.housing?.yearsWithFamily || 0;
  let status = 'independent', hostId = null;
  if (state.education?.status === 'college') status = 'campus';
  else if (income + money < HOUSING_BALANCE.independentAnnualCost) {
    const host = yearsWithFamily < HOUSING_BALANCE.maxFamilyYears ? housingHost(state) : null;
    status = host ? 'parents' : 'homeless';
    hostId = host?.id || null;
  }
  return { status, hostId, yearsWithFamily: yearsWithFamily + Number(completeYear && status === 'parents') };
}
export function housingLifestyle(state, base, collegeOffer) {
  if (state.housing?.status === 'parents') {
    const host = [...(state.parents || []), state.guardian].find(person => person?.id === state.housing.hostId);
    return Math.max(base, Math.min(4, host?.lifestyle || 1));
  }
  if (state.housing?.status === 'campus') return Math.max(base, 2.5, studentLivingLifestyle(state, collegeOffer));
  if (state.housing?.status === 'homeless') return Math.min(base, .8);
  return base;
}
export function housingChanges(housing) {
  if (housing?.status === 'homeless') return { health: HOUSING_BALANCE.homelessHealth, social: HOUSING_BALANCE.homelessSocial, stability: HOUSING_BALANCE.homelessStability };
  if (housing?.status === 'parents') return { social: HOUSING_BALANCE.familySocial, stability: HOUSING_BALANCE.familyStability };
  return {};
}
export function housingMeetingMultiplier(state) {
  return state.housing?.status === 'parents' ? HOUSING_BALANCE.familyMeetingMultiplier
    : state.housing?.status === 'homeless' ? HOUSING_BALANCE.homelessMeetingMultiplier : 1;
}
export function housingDetails(state) {
  if (state.age < 18 || !state.housing) return null;
  return { ...state.housing, remainingYears: Math.max(0, HOUSING_BALANCE.maxFamilyYears - state.housing.yearsWithFamily),
    changes: housingChanges(state.housing), meetingMultiplier: housingMeetingMultiplier(state),
    independentLifestyle: lifestyleFromResources(state.jobId ? state.income || 0 : 0, state.money || 0) };
}
