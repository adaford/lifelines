// Read-only validation for current and legacy saves. Migration stays in the
// engine, where it can use the same generation and progression rules.
import { JOBS } from './jobs.js?v=deadline-effect';
import { EVENTS as PERSONAL_EVENTS } from './events.js?v=deadline-effect';
import { FAMILY_EVENTS } from './family-events.js?v=deadline-effect';
import { FAME_EVENTS } from './fame-events.js?v=deadline-effect';
import { MAX_FOCUS, DEFAULT_FOCUS, SCHOOL_FOCUS_KEYS, focusMaxFor, focusBudget } from './focus-rules.js?v=deadline-effect';
import { SCHOOL_OFFER_COUNT, MAX_SCHOOL_OFFERS, schoolActivity } from './school.js?v=deadline-effect';
import { conditionFocusPoints, conditionFocusLimits, validateBirthConditions } from './birth-conditions.js?v=deadline-effect';
import { gestatingActor } from './relationships.js?v=deadline-effect';

// Inject engine-owned helpers rather than importing the engine back here.
// Keeping these references shared prevents validation rules from drifting.
export function createSaveValidator({
  CORE, STAT_KEYS, FOCUS_KEYS, focusKeys, legacyFocusKeys,
  normalizeSurname, fromCentimeters, round, focusStage, focusLimits,
  EVENTS, eventKey, pendingEventSubject,
}) {
  return function validSchema(raw, version, schoolOfferCount = version >= 20 ? null : SCHOOL_OFFER_COUNT) {
    try {
      if (!raw || typeof raw !== 'object' || raw.version !== version) return false;
      const finite = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
      const heightBound = cm => version >= 10 ? fromCentimeters(cm) : cm;
      const text = (s, max = 1000) => typeof s === 'string' && s.length > 0 && s.length <= max;
      const validCause = entry => entry.cause === undefined || text(entry.cause, 1000);
      const validFame = (fame, age) => fame && typeof fame === 'object' && !Array.isArray(fame)
        && Object.keys(fame).length === 5 && ['sports', 'extracurricular', 'personal'].includes(fame.kind)
        && finite(fame.rating, 0, 10) && fame.rating === Math.round(fame.rating * 10) / 10
        && finite(fame.support, -2, 2) && Number.isInteger(fame.startedAge)
        && finite(fame.startedAge, fame.kind === 'personal' ? 13 : 6, age)
        && (fame.kind === 'personal' ? fame.activityId === null : Boolean(schoolActivity(fame.kind, fame.activityId)));
      const validPersonFame = person => person.fame === undefined || person.fame === null
        || person === raw && version >= 20 && person.alive === true && validFame(person.fame, person.age)
          && (person.fame.kind === 'personal' || person.school?.[person.fame.kind]?.id === person.fame.activityId);
      const legacy = version < 4;
      const ratingFloor = version >= 15 ? 0 : 1;
      const coreKeys = legacy ? [...CORE, 'discipline'] : CORE;
      const statKeys = [...coreKeys, 'health', version === 1 ? 'instability' : 'stability', ...(legacy ? ['relaxation'] : [])];
      const validStats = stats => stats && Object.keys(stats).length === statKeys.length && statKeys.every(key => finite(stats[key], ratingFloor, 10));
      const effectiveFloor = version >= 16 ? -270 : ratingFloor;
      const effectiveCeiling = version >= 16 ? 280 : 10;
      const validLifestyle = value => finite(value, effectiveFloor, effectiveCeiling) && (version >= 13 || Number.isInteger(value));
      const aptitudeKeys = version >= 12 ? STAT_KEYS : coreKeys;
      const validAptitudes = aptitude => aptitude && Object.keys(aptitude).length === aptitudeKeys.length && aptitudeKeys.every(key => Number.isInteger(aptitude[key]) && finite(aptitude[key], -3, 3));
      const validGeneration = value => Number.isInteger(value) && finite(value, 1, 100000);
      const genders = ['male', 'female', 'nonbinary'];
      const validIdentity = person => genders.includes(person.gender) && typeof person.canGestate === 'boolean' && Array.isArray(person.attractedTo) && person.attractedTo.length > 0 && person.attractedTo.length <= 3 && new Set(person.attractedTo).size === person.attractedTo.length && person.attractedTo.every(gender => genders.includes(gender)) && Number.isInteger(person.appearancePeakAge) && finite(person.appearancePeakAge, version >= 8 ? 22 : 27, 33);
      const validAdultHeight = person => version >= 9 ? (person.adultHeight === null && person.age < (person.maturityAge ?? 18) || finite(person.adultHeight, heightBound(40), heightBound(240))) : finite(person.adultHeight, 145, 205);
      const validGrowth = person => ['male','female'].includes(person.growthSex) && Number.isInteger(person.maturityAge) && finite(person.maturityAge, 14, 18) && finite(person.birthHeight, heightBound(40), heightBound(60)) && validAdultHeight(person) && (version < 9 || finite(person.growthFactor, .8, 1.2)) && (person.growthAnchor === null || person.growthAnchor && Number.isInteger(person.growthAnchor.age) && finite(person.growthAnchor.age, 0, person.age) && finite(person.growthAnchor.height, heightBound(40), heightBound(210)));
      const validDeath = person => person.death === undefined || person.death === null || person.alive === false && ['disease', 'accident'].includes(person.death.cause) && person.death.age === person.age;
      const validPerson = person => person && text(person.id, 100) && text(person.name, 50) && Number.isInteger(person.age) && finite(person.age, 0, version >= 7 ? 200 : 120) && finite(person.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) && validStats(person.stats) && validAptitudes(person.aptitudes) && validPersonFame(person) && (version < 17 || validateBirthConditions(person.conditions)) && (version === 1 || validLifestyle(person.lifestyle)) && (person.adopted === undefined || typeof person.adopted === 'boolean') && (version < 5 || validIdentity(person)) && (version < 6 || text(person.familyName, 30) && normalizeSurname(person.familyName) === person.familyName) && (version < 7 || validDeath(person));
      if (!validPerson(raw) || raw.age > 85 || !Number.isInteger(raw.generation) || !finite(raw.generation, 1, 100000)) return false;
      if (version >= 8 && (!validGrowth(raw) || ![...raw.parents, ...(version >= 15 && raw.guardian ? [raw.guardian] : []), ...raw.children, ...raw.siblings, ...raw.lineage, raw.partner, ...raw.encounters, raw.pregnancy?.otherParent].filter(Boolean).every(person => (['growthSex','maturityAge','birthHeight','growthAnchor'].every(key => person[key] === undefined) || validGrowth(person)) && (person.parentRole === undefined || ['mom','dad','parent'].includes(person.parentRole))))) return false;
      if (![raw.seed, raw.rng, raw.nextId].every(value => Number.isInteger(value) && finite(value, 0, Number.MAX_SAFE_INTEGER))) return false;
      if (!finite(raw.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) || !validAdultHeight(raw)) return false;
      const validFocus = (focus, keys, maximum = version >= 17 ? MAX_FOCUS : 5, budget = version >= 17 ? DEFAULT_FOCUS * keys.length : 12) => focus && Object.keys(focus).length === keys.length && keys.every(key => Number.isInteger(focus[key]) && finite(focus[key], 0, typeof maximum === 'object' ? maximum[key] : maximum)) && keys.reduce((sum, key) => sum + focus[key], 0) <= budget;
      const currentFocusKeys = version >= 20 ? focusKeys(raw) : version >= 18 ? focusKeys(raw.age) : version >= 17 || version >= 11 && raw.age >= 2 && raw.age < 5 && Object.hasOwn(raw.focus || {}, 'creative') ? legacyFocusKeys(raw.age) : FOCUS_KEYS;
      const currentBudget = version >= 19 ? focusBudget(raw) : version >= 17 ? Math.max(0, DEFAULT_FOCUS * currentFocusKeys.length + conditionFocusPoints(raw)) : 12;
      const currentMaximum = version >= 19 ? Object.fromEntries(currentFocusKeys.map(key => [key, focusMaxFor(raw, key)])) : version >= 17 ? MAX_FOCUS : 5;
      if (!validFocus(raw.focus, currentFocusKeys, currentMaximum, currentBudget)) return false;
      if (version >= 19) {
        const school = raw.school;
        const validEnrollment = (entry, kind) => entry === null || entry && Object.keys(entry).length === 2 && Boolean(schoolActivity(kind, entry.id)) && (entry.success === null || finite(entry.success, 0, 10));
        const validOffers = (ids, kind) => Array.isArray(ids) && (schoolOfferCount === null ? ids.length <= MAX_SCHOOL_OFFERS : ids.length === schoolOfferCount) && new Set(ids).size === ids.length && ids.every(id => Boolean(schoolActivity(kind, id)));
        if (school === null) { if (raw.age >= 5 && raw.age < 18) return false; }
        else if (raw.age < 5 || !school || Object.keys(school).length !== 6 || !finite(school.gpa, 50, 100)
          || !(school.reportedAge === null || Number.isInteger(school.reportedAge) && finite(school.reportedAge, 6, Math.min(18, raw.age)))
          || !Number.isInteger(school.offersAge) || school.offersAge !== Math.min(raw.age, 17)
          || !school.offers || Object.keys(school.offers).length !== 2
          || !['sports', 'extracurricular'].every(kind => validOffers(school.offers[kind], kind) && validEnrollment(school[kind], kind))) return false;
      }
      if (!['cry', 'quiet'].includes(raw.babyChoice) || ![raw.ended, raw.needsSuccession].every(value => typeof value === 'boolean')) return false;
      const validLivingAge = person => typeof person.alive === 'boolean' && (version >= 7 || person.age <= 85 && (!person.alive || person.age < 85));
      if (version >= 7) {
        if (!Number.isInteger(raw.cryLevel) || !finite(raw.cryLevel, 1, 5) || typeof raw.alive !== 'boolean' || !validDeath(raw)) return false;
        if (raw.alive ? raw.death !== null : !raw.death || !raw.needsSuccession || raw.pendingEvents.length || raw.pregnancy) return false;
        const validDelta = (value, effective = false) => {
          const low = effective ? effectiveFloor : ratingFloor, high = effective ? effectiveCeiling : 10;
          return value && finite(value.before, low, high) && finite(value.after, low, high) && finite(value.change, low - high, high - low) && Math.abs(round(value.after - value.before) - value.change) < .001;
        };
        const summary = raw.yearSummary;
        if (summary?.fame !== undefined && (version < 20 || !summary.fame || typeof summary.fame !== 'object' || Array.isArray(summary.fame)
          || Object.keys(summary.fame).length !== 2 || summary.fame.before === null && summary.fame.after === null
          || !(summary.fame.before === null || validFame(summary.fame.before, summary.fromAge))
          || !(summary.fame.after === null || validFame(summary.fame.after, summary.toAge)))) return false;
        if (summary?.decisions !== undefined) {
          const decisions = summary.decisions;
          if (!decisions || typeof decisions !== 'object' || Array.isArray(decisions)) return false;
          if (Object.hasOwn(decisions, 'cryLevel')) {
            // Older saves can retain a completed cry decision from age 2.
            if (summary.fromAge >= 3 || Object.keys(decisions).length !== 1 || !Number.isInteger(decisions.cryLevel) || !finite(decisions.cryLevel, 1, 5)) return false;
          } else {
            const focus = decisions.focus;
            const hasRecordedFame = Object.hasOwn(decisions, 'fame');
            if (hasRecordedFame && (version < 20 || !validFame(decisions.fame, summary.fromAge))) return false;
            const fameActivity = hasRecordedFame && decisions.fame.kind !== 'personal' ? decisions.fame.kind : null;
            const adultFameActivity = summary.fromAge >= 18 && fameActivity;
            // Completed four-area School years remain valid after schema 18;
            // infer their shape from the recorded controls, never today's age.
            const expandedSchool = version >= 18 && summary.fromAge >= 5 && summary.fromAge < 18 && (Object.hasOwn(focus || {}, 'sports') || Object.hasOwn(focus || {}, 'extracurricular'));
            const keys = expandedSchool ? SCHOOL_FOCUS_KEYS : adultFameActivity ? [...FOCUS_KEYS, fameActivity] : version >= 17 && decisions.focusMax !== undefined || version >= 11 && decisions.workLabel === 'Play' && summary.fromAge >= 2 && summary.fromAge < 5 && Object.hasOwn(focus || {}, 'creative') ? legacyFocusKeys(summary.fromAge) : FOCUS_KEYS;
            const currentRules = decisions.focusMax !== undefined || decisions.focusBudget !== undefined;
            const mixedSchool = version >= 19 && expandedSchool && decisions.focusCaps !== undefined;
            if (decisions.focusCaps !== undefined && (!mixedSchool || Object.keys(decisions.focusCaps || {}).length !== 2 || !['sports', 'extracurricular'].every(kind => decisions.focusCaps[kind] === 2 || decisions.focusCaps[kind] === 3 && fameActivity === kind))) return false;
            if (hasRecordedFame && (!currentRules || summary.fromAge < 18 && !mixedSchool)) return false;
            const hasPointModifier = Object.hasOwn(decisions, 'focusPointModifier');
            if (hasPointModifier && (version < 20 || !currentRules || !Number.isInteger(decisions.focusPointModifier) || !finite(decisions.focusPointModifier, -256, 256) || decisions.focusPointModifier === 0)) return false;
            const recordedBudget = Math.max(0, (mixedSchool ? 10 : adultFameActivity ? 8 : DEFAULT_FOCUS * keys.length) + conditionFocusPoints(raw) + (hasPointModifier ? decisions.focusPointModifier : 0));
            if (currentRules && (version < 17 || decisions.focusMax !== MAX_FOCUS || decisions.focusBudget !== recordedBudget)) return false;
            const recordedMaximum = mixedSchool ? Object.fromEntries(keys.map(key => [key, decisions.focusCaps[key] ?? MAX_FOCUS])) : adultFameActivity ? Object.fromEntries(keys.map(key => [key, key === fameActivity ? 3 : MAX_FOCUS])) : currentRules ? MAX_FOCUS : 5;
            if (summary.fromAge < (version >= 10 ? 2 : 3) || Object.keys(decisions).length !== (currentRules ? mixedSchool ? 5 : 4 : 2) + Number(hasPointModifier) + Number(hasRecordedFame) || !(version >= 10 ? ['Play', 'School', 'College', 'Career'] : ['School', 'College', 'Career']).includes(decisions.workLabel) || !validFocus(focus, keys, recordedMaximum, currentRules ? decisions.focusBudget : 12)) return false;
          }
        }
        if (summary?.school !== undefined) {
          const report = summary.school;
          const reportMaximum = activity => summary.decisions?.fame?.kind === activity.kind
            && summary.decisions.fame.activityId === activity.id && summary.decisions.focusCaps?.[activity.kind] === 3 ? 3 : 2;
          // Reports record the grading rules used that year. Balance changes
          // must not invalidate or recalculate already saved grades.
          if (version < 19 || summary.fromAge < 5 || summary.fromAge >= 18 || !report || !finite(report.gpa, 50, 100) || !(report.previousGpa === null || finite(report.previousGpa, 50, 100))
            || !Number.isInteger(report.study) || !finite(report.study, 0, 4) || !finite(report.intelligence, effectiveFloor, effectiveCeiling)
            || !Array.isArray(report.activities) || report.activities.length > 2
            || new Set(report.activities.map(activity => activity.kind)).size !== report.activities.length
            || !report.activities.every(activity => ['sports', 'extracurricular'].includes(activity.kind) && Boolean(schoolActivity(activity.kind, activity.id)) && text(activity.name, 100) && Number.isInteger(activity.focus) && finite(activity.focus, 0, reportMaximum(activity))
              && (activity.before === null || finite(activity.before, 0, 10))
              && (activity.after === null ? activity.before === null && activity.focus === 0 : finite(activity.after, 0, 10)))) return false;
        }
        if (summary?.height !== undefined && (!finite(summary.height.before, heightBound(40), heightBound(240)) || !finite(summary.height.after, heightBound(40), heightBound(240)) || !finite(summary.height.change, 0, heightBound(200)) || Math.abs(round(summary.height.after - summary.height.before) - summary.height.change) > .001)) return false;
        if (summary !== null && (!summary || typeof summary.dismissed !== 'boolean' || summary.toAge !== raw.age || summary.fromAge !== raw.age - 1 || !summary.stats || Object.keys(summary.stats).length !== STAT_KEYS.length || !STAT_KEYS.every(key => validDelta(summary.stats[key], true)) || !validDelta(summary.lifestyle, true) || !Array.isArray(summary.parents) || summary.parents.length > (version >= 15 ? 3 : 2) || !summary.parents.every(parent => text(parent.id, 100) && text(parent.name, 50) && validDelta(parent.stability) && validDelta(parent.relationship) && (parent.lifestyle === undefined || validDelta(parent.lifestyle, true))) || !Array.isArray(summary.events) || summary.events.length > 30 || !summary.events.every(event => text(event.title, 200) && text(event.text, 2000) && text(event.kind, 50) && validCause(event) && (event.description === undefined || text(event.description, 1000))))) return false;
      }
      if (!Array.isArray(raw.parents) || raw.parents.length > 2 || !raw.parents.every(person => validPerson(person) && validLivingAge(person) && (!person.alive || person.age > raw.age))) return false;
      if (version >= 7 && !raw.parents.every(person => finite(person.relationship, ratingFloor, 10))) return false;
      const validCareer = person => person.career && Number.isInteger(person.career.focus) && finite(person.career.focus, 0, 5) && ['employed','unemployed','retired'].includes(person.career.status) && finite(person.career.progress, ratingFloor, 10) && Number.isInteger(person.career.years) && finite(person.career.years, 0, 200);
      if (version >= 9 && !raw.parents.every(validCareer)) return false;
      if (version >= 15) {
        if (!raw.parents.every(person => person.abandonedAt === undefined || Number.isInteger(person.abandonedAt) && finite(person.abandonedAt, 0, 85))) return false;
        const guardian = raw.guardian;
        if (guardian !== undefined && guardian !== null && (!validPerson(guardian) || !validLivingAge(guardian) || guardian.age < 18 || !validGrowth(guardian) || !finite(guardian.relationship, 0, 10) || !validCareer(guardian) || !['aunt', 'uncle'].includes(guardian.guardianRole) || !Number.isInteger(guardian.adoptedAt) || !finite(guardian.adoptedAt, 0, 85) || guardian.abandonedAt !== undefined)) return false;
      }
      if (!Array.isArray(raw.children) || raw.children.length > 6 || !raw.children.every(child => validPerson(child) && validLivingAge(child) && child.age < raw.age && finite(child.height, heightBound(40), heightBound(version >= 9 ? 240 : 210)) && validAdultHeight(child) && finite(child.money, 0, 1e15))) return false;
      if (version >= 7 && ![...raw.children, ...(raw.siblings || [])].every(person => person.parentIds === undefined || Array.isArray(person.parentIds) && person.parentIds.length >= 1 && person.parentIds.length <= 2 && new Set(person.parentIds).size === person.parentIds.length && person.parentIds.every(id => text(id, 100) && id !== person.id))) return false;
      if (!Array.isArray(raw.siblings) || !raw.siblings.every(person => validPerson(person) && validLivingAge(person) && validAdultHeight(person) && finite(person.money, 0, 1e15))) return false;
      const familyIds = [raw.id, ...(version >= 15 && raw.guardian ? [raw.guardian.id] : []), ...raw.parents.map(person => person.id), ...raw.children.map(person => person.id), ...raw.siblings.map(person => person.id)];
      if (new Set(familyIds).size !== familyIds.length) return false;
      if (version >= 5) {
        if (![...raw.children, ...raw.siblings].every(person => finite(person.relationship, ratingFloor, 10))) return false;
        const validAdult = person => validPerson(person) && person.age >= 18 && validLivingAge(person) && validAdultHeight(person);
        const partner = raw.partner;
        if (partner !== null && (!validAdult(partner) || raw.age < 18 || !finite(partner.relationship, ratingFloor, 10) || !Number.isInteger(partner.yearsTogether) || !finite(partner.yearsTogether, 0, 100) || typeof partner.married !== 'boolean' || !Number.isInteger(partner.lastProposalAge) || !finite(partner.lastProposalAge, -1, raw.age) || familyIds.includes(partner.id))) return false;
        if (!Number.isInteger(raw.encounterYear) || !finite(raw.encounterYear, 0, raw.age) || !Array.isArray(raw.encounters) || raw.encounters.length > 5) return false;
        if (raw.encounters.length && (raw.age < 18 || raw.encounterYear !== raw.age || partner?.alive !== false && partner !== null)) return false;
        if (!raw.encounters.every(person => validAdult(person) && person.alive && !familyIds.includes(person.id) && person.id !== partner?.id) || new Set(raw.encounters.map(person => person.id)).size !== raw.encounters.length) return false;
        const pregnancy = raw.pregnancy;
        if (pregnancy !== null) {
          if (!pregnancy || raw.age < 18 || raw.age >= 85 || raw.children.length >= 6 || !validAdult(pregnancy.otherParent) || !text(pregnancy.carrierName, 50) || !Number.isInteger(pregnancy.startedAge) || pregnancy.startedAge !== raw.age || pregnancy.dueAge !== raw.age + 1 || typeof pregnancy.casual !== 'boolean') return false;
          const carrier = gestatingActor(raw, pregnancy.otherParent);
          if (!carrier || carrier.id !== pregnancy.carrierId || carrier.age < 18 || carrier.age > 45) return false;
        }
      }
      if (![raw.money, raw.income, raw.expenses].every(value => finite(value, 0, 1e15)) || !validLifestyle(raw.lifestyle)) return false;
      if (raw.jobId !== null && !JOBS.some(job => job.id === raw.jobId)) return false;
      if (version >= 3) {
        const education = raw.education;
        if (!education || !['school', 'undecided', 'workforce', 'college', 'graduate'].includes(education.status) || !Number.isInteger(education.years)) return false;
        const studying = education.status === 'college';
        const graduate = education.status === 'graduate';
        if (studying ? !finite(education.years, 0, 3) : education.years !== (graduate ? 4 : 0)) return false;
        if ((education.status === 'school') !== (raw.age < 18)) return false;
        const offers = raw.jobOffers;
        const expectedCount = raw.age < 18 || studying ? 0 : graduate ? 15 : 10;
        if (!Array.isArray(offers) || offers.length !== expectedCount || new Set(offers).size !== offers.length) return false;
        if (!offers.every(id => JOBS.some(job => job.id === id && (graduate || !job.requiresCollege)))) return false;
        if (expectedCount && !offers.includes('retail')) return false;
        if ((education.status === 'school' || education.status === 'undecided' || studying) && raw.jobId !== null) return false;
        if (raw.jobId !== null && !offers.includes(raw.jobId)) return false;
      }
      if (!Number.isInteger(raw.jobYears) || !finite(raw.jobYears, 0, 100) || !finite(raw.performance, 0, 1) || !finite(raw.schoolProgress, 0, 100) || !finite(raw.lastChildAge, -1, 85)) return false;
      const validLimits = limits => limits && typeof limits === 'object' && !Array.isArray(limits) && Object.keys(limits).length > 0 && Object.entries(limits).every(([stage, caps]) => {
        const keys = stage === 'toddler' ? [...FOCUS_KEYS, 'creative'] : stage === 'standard' ? version >= 18 ? SCHOOL_FOCUS_KEYS : FOCUS_KEYS : null;
        return keys && caps && typeof caps === 'object' && !Array.isArray(caps) && Object.keys(caps).length > 0 && Object.entries(caps).every(([key, max]) => keys.includes(key) && Number.isInteger(max) && finite(max, 0, 5));
      });
      // New restrictions can coexist with the full legacy modifier history while
      // those old effects expire. This expands capacity without changing records.
      const effectCapacity = version >= 16 ? 64 : legacy ? 10 : version >= 15 ? 27 : 25;
      if (!Array.isArray(raw.effects) || raw.effects.length > effectCapacity || !raw.effects.every(effect => text(effect.id, 100) && text(effect.name, 100) && typeof effect.description === 'string' && Number.isInteger(effect.years) && finite(effect.years, 1, legacy ? 3 : 5) && effect.modifiers && Object.entries(effect.modifiers).every(([key, value]) => statKeys.includes(key) && finite(value, -10, 10)) && (effect.lifestyle === undefined || !legacy && Number.isInteger(effect.lifestyle) && finite(effect.lifestyle, -10, 10)) && (effect.focusLimits === undefined || version >= 14 && validLimits(effect.focusLimits)) && (effect.focusPoints === undefined || version >= 20 && Number.isInteger(effect.focusPoints) && finite(effect.focusPoints, -4, 4) && effect.focusPoints !== 0))) return false;
      if (version >= 14) {
        const stage = focusStage(raw);
        const maximum = version >= 17 ? MAX_FOCUS : 5;
        const limits = version >= 19 ? focusLimits(raw) : Object.fromEntries(currentFocusKeys.map(key => [key, maximum]));
        if (version < 19) {
          const applyCaps = caps => {
            const entries = { ...caps };
            if (version >= 18 && raw.age >= 5 && raw.age < 18 && entries.self !== undefined) entries.sports = Math.min(entries.sports ?? maximum, entries.self);
            for (const [key, max] of Object.entries(entries)) if (Object.hasOwn(limits, key)) limits[key] = Math.min(limits[key], max);
          };
          if (version >= 17 && stage) applyCaps(conditionFocusLimits(raw, stage));
          for (const effect of raw.effects) applyCaps(effect.focusLimits?.[stage]);
        }
        if (Object.entries(limits).some(([key, max]) => raw.focus[key] > max)) return false;
      }
      if (!legacy) {
        const knownKey = key => typeof key === 'string' && (PERSONAL_EVENTS.some(event => event.id === key) || version >= 20 && FAME_EVENTS.some(event => event.id === key) || version >= 5 && FAMILY_EVENTS.some(event => key.startsWith(`${event.id}:`) && key.length <= 200));
        if (!Array.isArray(raw.lastYearEvents) || raw.lastYearEvents.length > 5 || new Set(raw.lastYearEvents).size !== raw.lastYearEvents.length || !raw.lastYearEvents.every(knownKey)) return false;
        if (!Array.isArray(raw.pendingEvents) || raw.pendingEvents.length > 5 || new Set(raw.pendingEvents.map(pending => pending && eventKey(pending))).size !== raw.pendingEvents.length) return false;
        if (!raw.pendingEvents.every(pending => {
          if (!pending || !validCause(pending) || pending.age !== raw.age || !raw.lastYearEvents.includes(eventKey(pending))) return false;
          const event = EVENTS.find(event => event.id === pending.eventId);
          if (!event?.choices?.length) return false;
          const invitationKind = ['sports', 'extracurricular'].includes(event.fameKind) ? event.fameKind : null;
          if (invitationKind) {
            if (version < 20 || !schoolActivity(invitationKind, pending.fameActivityId) || raw.school?.[invitationKind]?.id !== pending.fameActivityId) return false;
          } else if (Object.hasOwn(pending, 'fameActivityId')) return false;
          if (event.subjectType) {
            if (version < 5 || pending.subjectType !== event.subjectType || !text(pending.subjectId, 100)) return false;
            const subject = pendingEventSubject(raw, pending);
            return subject && subject.age - 1 >= event.minAge && subject.age - 1 <= (event.maxAge ?? 85);
          }
          return !pending.subjectType && !pending.subjectId && raw.age - 1 >= event.minAge && raw.age - 1 <= (event.maxAge ?? 85);
        })) return false;
      }
      if (!Array.isArray(raw.history) || raw.history.length > 500 || !raw.history.every(memory => text(memory.id, 100) && finite(memory.age, 0, 85) && finite(memory.generation, 1, 100000) && text(memory.title, 200) && text(memory.text, 2000) && text(memory.kind, 50) && validCause(memory) && (memory.description === undefined || text(memory.description, 1000)))) return false;
      if (!Array.isArray(raw.lineage) || !raw.lineage.every(person => validPerson(person) && validGeneration(person.generation) && typeof person.alive === 'boolean' && validLifestyle(person.lifestyle) && finite(person.money, 0, 1e15) && finite(person.estate, 0, 1e15) && finite(person.share, 0, 1e15) && Array.isArray(person.children) && person.children.length <= 6 && person.children.every(child => child && text(child.id, 100) && text(child.name, 50) && finite(child.inheritance, 0, 1e15)))) return false;
      if (raw.needsSuccession && ((raw.age < 85 && (version < 7 || raw.alive)) || raw.ended || version < 6 && !raw.children.some(child => child.alive !== false && child.age < 85))) return false;
      if (version >= 6 && raw.ended) return false;
      if (raw.ended && raw.age < 85) return false;
      if (raw.age === 85 && !raw.ended && !raw.needsSuccession) return false;
      return true;
    } catch { return false; }
  };
}
