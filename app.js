import {
  SKILLS, JOBS, EVENTS, resolveEventChoice, createGame, advanceYear, setFocus, setCryLevel, dismissYearSummary, jobFit,
  enrollSchoolActivity, leaveSchoolActivity, quitFame, familyLifestyle,
  canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed,
  effectiveStats, eventOdds, mortalityOdds, stage, migrateSave, chooseEducation,
  offeredJobs, offeredColleges, joinCollegeSport, leaveCollegeSport, needsEducationChoice, pendingEventSubject, focusLimits, focusMinimums, focusLimitDetails, caregivers,
  relationshipOdds, meetingChances, datingPotential, proposalChance, pregnancyChance, oneNightChance,
  respondToEncounter, proposeMarriage, endRelationship, normalizeSurname, heightPercentile, statPercentiles
} from './engine.js?v=short-events-toddler-order';
import { LEGACY_EVENT_COPY } from './event-copy-history.js?v=short-events-toddler-order';
import { legacyLifeEventCopies } from './life-event-copy-history.js?v=short-events-toddler-order';
import { formatEventCause } from './event-causes.js?v=short-events-toddler-order';
import { eventDescriptionAtAge } from './life-events.js?v=short-events-toddler-order';
import { annotateNarrative } from './narrative.js?v=short-events-toddler-order';
import { formatRating, formatHeight, heightDescription, formatStatNarrative, splitEventOutcome, focusCapLabel, escapeHTML as esc } from './display.js?v=short-events-toddler-order';
import { avatar, genderBadge, parentLabel } from './profile-view.js?v=short-events-toddler-order';

import { MAX_FOCUS, focusBudget, focusMaxFor, isSchoolActivityFocus } from './focus-rules.js?v=short-events-toddler-order';
import { SPORTS, schoolActivity, currentSchoolEnrollment, gradeScore, gradeLetter, activityGradeLetter, activitySuccessAfterYear, activityEligible } from './school.js?v=short-events-toddler-order';
import { COLLEGE_BALANCE, collegeById, collegeGradeScore, createCollegeOffers } from './college.js?v=short-events-toddler-order';
import { collegeSportSuccessAfterYear } from './college-sports.js?v=short-events-toddler-order';
import { housingDetails } from './housing.js?v=short-events-toddler-order';
import { hasFame, fameFocusKey, fameFocusChange, fameLearningBonus, fameLossChance, fameLifestyleBonus } from './fame.js?v=short-events-toddler-order';
import { getBirthConditions } from './birth-conditions.js?v=short-events-toddler-order';
import { initialCareerProgress } from './career-rules.js?v=short-events-toddler-order';
import { lifestyleDisplayValue } from './lifestyle.js?v=short-events-toddler-order';
import { choiceImpacts, toddlerActivityImpacts, toddlerChoiceImpacts, schoolChoiceImpacts } from './choice-impacts.js?v=short-events-toddler-order';

const SAVE_KEY = 'lifelines.save.v1';
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
let activeTab = 'year';
let showAllHistory = false;
let encounterIndex = 0;
let saveAvailable = true;
let loadNotice = '';
let modalReturnFocus = null;
let toastTimer;
let mustNameFamily = false;
let modalLocked = false;
let showingYearSummary = false;
let state = loadGame();

const icons = {
  year: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  career: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12q9 5 18 0M12 12v4"/>',
  family: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14q4 1 3 7"/>',
  character: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  sprout: '<path d="M12 22V10M12 16C2 16 2 7 2 7s10-1 10 9ZM12 11C12 2 22 3 22 3s1 9-10 8Z"/>',
  self: '<path d="M12 3c-7 6-9 11-5 16 3 3 7 3 10 0 4-5 2-10-5-16Z"/><path d="M12 10v12M8 15l4 4 4-4"/>',
  electronics: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M10 18h4"/>',
  social: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3 2-7a8 8 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',
  school: '<path d="m2 8 10-5 10 5-10 5-10-5Zm4 3v7q6 5 12 0v-7M22 8v9"/>',
  sports: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5 5q14 3 14 14M5 19Q19 16 19 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3c-1 0-1 2-1 3M12 17h.01"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  heart: '<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 3 11 8 15 5-4 13-10 8-15Z"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  menu: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const narrativeText = (value, age = state.age) => esc(annotateNarrative(formatStatNarrative(String(value ?? ''),state,age),state));
const journalText = (value, age = state.age) => narrativeText(String(value ?? '')
  .replace(/\$\d[\d,]*(?:\.\d+)?/g, 'a share of the family legacy')
  .replace(/\b(?:mental\s+)?instability\s+([+−-])(\d+(?:\.\d+)?|\.\d+)/gi, (_,sign,value) => `Mental stability ${Number(value)===0?'stayed steady':sign==='+'?'decreased':'increased'}`)
  .replace(/\b(?:mental\s+)?instability\b/gi, 'Mental stability')
  .replace(/\b(?:mental\s+)?stability\b/gi, 'Mental stability')
  .replace(/\bbonds\b/gi, 'relationships').replace(/\bbond\b/gi, 'relationship')
  // Older journal entries have deltas but no historical starting value. Keep
  // their direction without inventing a before/after pair or rewriting saves.
  .replace(/\b(Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|Mental stability|Lifestyle|Relationships?)\s+([+−-])(\d+(?:\.\d+)?|\.\d+)(?![\d.]|\s*(?:→|->))/gi, (_,label,sign,value) => `${label} ${Number(value)===0?'stayed steady':sign==='+'?'increased':'decreased'}`)
  // Tutorial suffixes in existing saves belong in contextual help, not the
  // journal. Event narratives and recorded outcomes remain visible.
  .replace(/\s*For now, a cry or a quiet moment is enough to shape the day\./g, '')
  .replace(/\s*Study focus develops your abilities, and graduation brings 15 career options\./g, '')
  .replace(/\s*Explore your 10 career options and build your skills along the way\./g, '')
  .replace(/\s*Your skills and career focus will help support your lifestyle\./g, '')
  .replace(/\s*Time together will shape your relationship\./g, '')
  .replace(/\s*Your relationship can continue to grow before another proposal next year\./g, '')
  .replace(/\s*At cry level \d, responding to your needs builds your relationship with your parents\./g, '')
  .replace(/\s*Divide up to 12 focus points between school, friends, family, and yourself\./g, '')
  .replace(/\s*Family focus will help their abilities grow, and your family legacy will be divided equally among your surviving children\./g, '')
  .replace(/\s*Continue as a child, a sibling if there are no children, or a young beneficiary if neither is available\./g, '')
  .replace(/\s*Your abilities and affinities carry over\./g, '')
  .trim(),age);
const number = formatRating;
const lifestyleNumber = value => number(lifestyleDisplayValue(value));
const beforeAfter = ({before,after}, format = number) => `${format(before)} → ${format(after)}`;
const changeClass = change => change > 0 ? 'gain' : change < 0 ? 'loss' : 'unchanged';
const statChangeText = (text, change) => `<span class="stat-change ${changeClass(change)}">${text}</span>`;
const coloredBeforeAfter = (change, format = number) => statChangeText(beforeAfter(change,format), format(change.before) === format(change.after) ? 0 : change.after - change.before);
// Color only recorded stat results. Narrative, names, durations and focus rules
// remain ordinary text; the input has already been escaped for safe rendering.
function colorStatChanges(text) {
  const stat = '(?:Intelligence|Strength|Attractiveness|Social(?: ability)?|Creativity|Health|(?:Mental\\s+)?stability|Lifestyle|Relationships?)';
  const value = '[+−-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
  const pattern = new RegExp(`\\b(?:Your\\s+)?${stat}(?:\\s+learning ability|\\s+with\\s+.*?)?\\s+(?:(?<before>${value})\\s*(?:→|-&gt;)\\s*(?<after>${value})|(?<direction>increased|decreased|stayed steady))|(?<amount>[+−-](?:\\d+(?:\\.\\d+)?|\\.\\d+))\\s+${stat}\\b`, 'giu');
  return text.replace(pattern, (...args) => {
    const { before, after, direction, amount } = args.at(-1);
    const numeric = value => Number(value.replace('−', '-'));
    const change = amount !== undefined ? numeric(amount) : direction ? ({ increased: 1, decreased: -1, 'stayed steady': 0 }[direction.toLowerCase()]) : numeric(after) - numeric(before);
    return statChangeText(args[0], change);
  });
}
const pct = value => `${Math.round((Number(value) || 0) * 100)}%`;
const aptitude = value => value > 0 ? `+${value}` : String(value);
const focusPointChange = value => `${value>0?'+':''}${value} focus point${Math.abs(value)===1?'':'s'}`;
function aptitudeBadge(value, label = 'Natural aptitude') {
  if (!Number.isInteger(value) || value === 0) return '';
  const description = `${label} ${aptitude(value)}`;
  return `<span class="aptitude ${value>0?'positive':value<0?'negative':''}" role="img" aria-label="${esc(description)}" title="${esc(description)}"><span aria-hidden="true">${aptitude(value)}</span></span>`;
}
const skillLabel = key => SKILLS.find(s => s.key === key)?.label || ({health:'Health',stability:'Mental stability',lifestyle:'Lifestyle',height:'Height',relationship:'Relationship'}[key]) || key;
const STAT_EMOJI = {
  health: '\u2764\uFE0F', stability: '\u{1F9D8}', lifestyle: '\u{1F3E1}',
  intelligence: '\u{1F9E0}', strength: '\u{1F4AA}', attractiveness: '\u2728',
  social: '\u{1F4AC}', creativity: '\u{1F3A8}', relationship: '\u{1F91D}',
};
const statEmoji = key => STAT_EMOJI[key] ? `<span class="stat-emoji" data-emoji="${STAT_EMOJI[key]}" aria-hidden="true"></span>` : '';
const DISPLAY_STATS = [{ key:'health', label:'Health' }, { key:'stability', label:'Mental stability' }, ...SKILLS.filter(skill => skill.key === 'attractiveness'), ...SKILLS.filter(skill => skill.key !== 'attractiveness')];
const stageNames = {baby:'The beginning',toddler:'',child:'Growing roots',teen:'Finding your way',adult:'A life of your own',elder:'What you leave behind'};
const toddlerFocusRows = [['work','Play','sprout'],['social','Electronics','electronics'],['creative','Arts & crafts','spark'],['family','Family time','family'],['self','Rest','self']];
const legacyToddlerFocusRows = [['work','Play'],['social','Explore'],['family','Family time'],['self','Rest']];
const schoolFocusRows = [['work','School','school'],['social','Friends','social'],['family','Family','family'],['self','Yourself','self'],['sports','Sports','sports'],['extracurricular','Extracurriculars','spark']];
const career = () => JOBS.find(j => j.id === state.jobId);
const focusUsed = () => Object.values(state.focus).reduce((a,b) => a+b, 0);
const familyCareProfiles = () => [...state.parents, ...(state.guardian ? [state.guardian] : [])];
function percentileLabel(percentile) {
  const rank = Math.round(percentile);
  if (rank < 1) return 'Below 1st percentile';
  if (rank > 99) return 'Above 99th percentile';
  const last = rank % 10, teens = rank % 100;
  const suffix = teens >= 11 && teens <= 13 ? 'th' : last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
  return `${rank}${suffix} percentile`;
}
function heightLabel(person) {
  const percentile = heightPercentile(person);
  return percentile===null?'Adult height':`${percentileLabel(percentile)} for age`;
}
const percentileTag = (percentiles, key) => percentiles ? `<span class="stat-percentile${key==='height'?' height-percentile':''}" data-percentile-key="${key}" aria-label="${esc(skillLabel(key))}: ${percentileLabel(percentiles[key].percentile)}">${percentileLabel(percentiles[key].percentile)}</span>` : '';
const helpButton = (topic, label, id = '') => `<button type="button" class="help-button" data-action="topic-help" data-topic="${esc(topic)}" ${id?`data-id="${esc(id)}"`:''} aria-label="About ${esc(label)}" aria-haspopup="dialog"><span aria-hidden="true">?</span></button>`;
const labelWithHelp = (label, topic, id = '') => `<span class="label-with-help">${esc(label)}${statEmoji(topic)}${helpButton(topic,label,id)}</span>`;

function birthConditionEffects(condition) {
  const effects = Object.entries(condition.aptitudeChanges || {}).filter(([,amount])=>amount).map(([key,amount])=>`${amount>0?'+':''}${amount} ${skillLabel(key)} affinity`);
  if (condition.focusPoints) effects.push(focusPointChange(condition.focusPoints));
  for (const [stage,limits] of Object.entries(condition.focusLimits || {})) {
    for (const [key,max] of Object.entries(limits)) {
      const label = stage==='toddler'?toddlerFocusRows.find(([area])=>area===key)?.[1]:({work:'School / College / Career',social:'Friends',family:'Family',self:'Yourself',sports:'Sports',extracurricular:'Extracurriculars'})[key];
      effects.push(`Focus ${label || key} max ${max} ${stage==='toddler'?'at ages 2–4':'from age 5'}, lifelong`);
      if (stage==='standard' && key==='self' && max<MAX_FOCUS) effects.push(`Focus Sports max ${Math.floor(max/2)} at ages 5–17, lifelong`);
    }
  }
  return effects;
}

function birthConditionsView(person) {
  const conditions = getBirthConditions(person);
  if (!conditions.length) return '';
  return `<ul class="birth-conditions" role="list" aria-label="${esc(person.name)}: perks">${conditions.map(condition=>{
    const effects=birthConditionEffects(condition);
    return `<li class="birth-condition" data-condition-id="${esc(condition.id)}" aria-label="${esc(condition.name)}: ${esc(effects.join('; '))}"><strong class="birth-condition-name">${esc(condition.name)}</strong>${condition.legacy?'':`<p class="perk-description">${esc(condition.description)}</p>`}<div class="birth-condition-effects">${effects.map(effect=>`<span class="birth-condition-effect">${esc(effect)}</span>`).join('')}</div></li>`;
  }).join('')}</ul>`;
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = migrateSave(JSON.parse(raw));
      if (parsed) return parsed;
      loadNotice = 'Your saved game could not be read. A fresh life is ready.';
    }
  } catch { saveAvailable = false; loadNotice = 'Browser saving is unavailable. You can still play and export a save.'; }
  mustNameFamily = true;
  return createGame();
}

function save() {
  if (mustNameFamily) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); saveAvailable = true; }
  catch { saveAvailable = false; }
}

const signedModifier = value => {
  const rounded = Math.round(Number(value) * 10) / 10;
  return `${rounded > 0 ? '+' : rounded < 0 ? '-' : ''}${Math.abs(rounded).toFixed(1).replace(/^0(?=\.)/, '').replace(/\.0$/, '')}`;
};
function statEffects(key) {
  if (!key || key==='height' || key==='lifestyle' && state.age<18) return [];
  return state.effects.filter(effect=>effect.years>0).map(effect=>({
    effect, amount:key==='lifestyle'?(effect.lifestyle || 0)+(effect.householdLifestyle || 0):effect.modifiers?.[key],
  })).filter(({amount})=>Number.isFinite(amount) && amount!==0);
}
function statEffectDescription(key) {
  return statEffects(key).map(({effect,amount})=>`${effect.name}: ${signedModifier(amount)} ${skillLabel(key)} (${effect.years} year${effect.years===1?'':'s'} remaining)`).join('; ');
}
function statEffectBadge(key) {
  const amount = Math.round(statEffects(key).reduce((total,item)=>total+item.amount,0)*10)/10;
  if (!amount) return '';
  const description = `Temporary ${skillLabel(key)} ${signedModifier(amount)}. ${statEffectDescription(key)}`;
  return `<span class="stat-effect-indicator ${amount>0?'positive':'negative'}" data-direction="${amount>0?'buff':'debuff'}" role="img" aria-label="${esc(description)}" title="${esc(description)}"><span aria-hidden="true">${signedModifier(amount)}</span></span>`;
}
function ratingBar(label, value, statKey) {
  const format = statKey==='lifestyle' || label==='Lifestyle' ? lifestyleNumber : number;
  const rating = Math.max(0, Math.min(10, Number(value)));
  const displayed = Number(format(value));
  const hue = Math.round(rating / 10 * 120);
  const effects = statEffectDescription(statKey);
  return `<span class="rating-track" role="meter" aria-label="${esc(label)}" aria-valuemin="${Math.min(0,displayed)}" aria-valuemax="${Math.max(10,displayed)}" aria-valuenow="${format(value)}" aria-valuetext="${format(value)} out of 10.${effects?` ${esc(effects)}`:''}"><span class="rating-fill" style="width:${rating*10}%;background:hsl(${hue}, 60%, 40%)"></span></span>`;
}

function profileLifestyleView() {
  return `<button class="status-pill profile-lifestyle" data-stat="lifestyle" data-action="topic-help" data-topic="lifestyle" data-id="${esc(state.id)}" aria-haspopup="dialog" aria-label="Lifestyle ${lifestyleNumber(state.lifestyle)} out of 10. ${esc(statEffectDescription('lifestyle'))} Open help."><span class="profile-lifestyle-heading"><span class="status-label">Lifestyle${statEmoji('lifestyle')}</span><strong class="status-value">${lifestyleNumber(state.lifestyle)}<small>/10</small></strong>${statEffectBadge('lifestyle')}</span>${ratingBar('Lifestyle',state.lifestyle,'lifestyle')}</button>`;
}

function fameSource(fame) {
  return fame?.kind === 'personal' ? 'Personal fame' : schoolActivity(fame?.kind,fame?.activityId)?.name || 'Activity fame';
}

function fameView() {
  if (!hasFame(state)) return '';
  const support = fameLifestyleBonus(state);
  const blocked = state.ended || state.needsSuccession || state.pendingEvents.length > 0;
  return `<section class="panel fame-card" aria-label="Fame"><div class="panel-heading"><h3>${labelWithHelp('Fame','fame')}</h3><strong class="fame-rating">${number(state.fame.rating)}<small>/10</small></strong></div>${ratingBar('Fame',state.fame.rating)}<p class="fame-source">${esc(fameSource(state.fame))}</p><p class="fame-maintenance">Maintain through ${esc(focusLabel(fameFocusKey(state)))} focus.</p><div class="fame-benefits"><span class="fame-learning-bonus">+${fameLearningBonus(state,'social')} Social learning ability <small>Fame bonus</small></span>${support?`<span class="fame-household-support">${signedModifier(support)} household Lifestyle support strength <small>Fame support</small></span>`:''}</div><button class="button ghost small" data-action="quit-fame" ${blocked?'disabled':''}>Leave fame</button></section>`;
}

function datingPotentialView() {
  if (state.age<18) return '';
  const value=datingPotential(state);
  return `<section class="panel dating-potential" aria-label="Your dating potential"><div class="panel-heading"><h3>${labelWithHelp('Your dating potential','dating-potential')}</h3><strong class="dating-potential-value">${number(value)}<small>/10</small></strong></div>${ratingBar('Dating potential',value)}</section>`;
}

function render() {
  const lifeStage = stage(state);
  const stats = effectiveStats(state);
  const isYear = activeTab === 'year';
  const percentiles = statPercentiles(state);
  app.innerHTML = `<div class="app-shell ${isYear?'with-advance':''}">
    <header class="topbar">
      <a class="brand" href="#" data-action="tab" data-tab="year" aria-label="Lifelines home"><span class="brand-mark">${icon('sprout')}</span><span class="brand-title">lifelines<span style="color:var(--orange)">.</span></span></a>
      <div class="top-actions"><span class="save-status">${icon(saveAvailable ? 'check' : 'download')}${saveAvailable ? 'Saved' : 'Session only'}</span><button class="icon-button" data-action="menu" aria-label="More options" aria-haspopup="dialog">${icon('menu')}</button></div>
    </header>
    ${isYear ? `
    <section class="profile-bar" aria-label="Your life"><div class="portrait">${avatar(state)}</div><div class="profile-copy"><p class="eyebrow">GENERATION ${state.generation}</p><div class="profile-name-row"><h1 class="person-name">${esc(state.name)}</h1></div><div class="profile-identity">${genderBadge(state)}<button class="profile-height" data-stat="height" data-action="topic-help" data-topic="height" data-id="${esc(state.id)}" aria-haspopup="dialog" aria-label="Height ${heightDescription(state.height,state.age)}. Open help."><strong class="status-value">${formatHeight(state.height,state.age)}</strong>${percentiles?percentileTag(percentiles,'height'):state.age>=18?'<span class="height-percentile">Adult height</span>':''}</button></div>${profileLifestyleView()}</div><div class="profile-age"><strong>${state.age}</strong>${state.age<2?'':`<p class="profile-stage">${state.age<5?'Toddler':state.age<18?'Student':state.education.status==='college'?'College student':career()?.name || 'Finding a path'}</p>`}<span>YEARS OLD</span></div>${birthConditionsView(state)}</section>
    <div class="status-strip" aria-label="At a glance">${DISPLAY_STATS.map(skill=>[skill.key,skill.label,stats[skill.key]]).map(([key,label,value])=>`<button class="status-pill" data-stat="${key}" data-action="topic-help" data-topic="${key}" data-id="${esc(state.id)}" aria-haspopup="dialog" aria-label="${label} ${number(value)} out of 10.${Number.isInteger(state.aptitudes[key]) && state.aptitudes[key]!==0?` Natural aptitude ${aptitude(state.aptitudes[key])}.`: ''} ${esc(statEffectDescription(key))} Open help."><span class="status-label">${label}${statEmoji(key)}</span><span class="status-reading"><strong class="status-value">${number(value)}<small>/10</small></strong>${aptitudeBadge(state.aptitudes[key])}${statEffectBadge(key)}</span>${ratingBar(label,value,key)}</button>`).join('')}</div>
    ` : ''}
      <main class="main-column" id="main-content">${activeTab==='career'||isYear&&!stageNames[lifeStage]?'':`<div class="chapter-heading"><h2>${isYear ? stageNames[lifeStage] : ({family:'A life, connected'}[activeTab])}<span style="color:var(--orange)">.</span></h2></div>`}
      ${isYear?datingPotentialView()+fameView():''}${isYear&&familyCareProfiles().length?`<section class="panel parent-status-panel">${parentStatusView()}</section>`:''}${eventDecisionView()}${state.ended ? endPanel() : ''}${state.needsSuccession ? successionPanel() : ''}
      ${activeTab==='year' ? yearView() : activeTab==='career' ? careerView() : familyView()}</main>
    <footer class="bottom-dock" aria-label="Game controls">${isYear?advanceControls():''}<nav class="nav-list" aria-label="Game sections">${[['year','Year'],['career','Career'],['family','Family']].map(([id,label])=>`<button class="nav-button ${activeTab===id?'active':''}" data-action="tab" data-tab="${id}" ${activeTab===id?'aria-current="page"':''}><span class="nav-icon">${icon(id)}</span><span class="nav-label">${label}</span>${id==='family'&&state.children.length?`<span class="nav-count">${state.children.length}</span>`:''}</button>`).join('')}</nav></footer>
  </div>`;
}

function advanceControls() {
  if (state.pendingEvents.length) return '<div class="advance-row"><button class="button primary advance-button" data-action="review-event">Make your choice '+icon('arrow')+'</button></div>';
  if (state.ended) return `<div class="advance-row"><button class="button primary advance-button" data-action="new">Begin another life ${icon('arrow')}</button></div>`;
  if (state.needsSuccession) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></div>`;
  if (needsEducationChoice(state)) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="career">Choose your path ${icon('arrow')}</button></div>`;
  return `<div class="advance-row"><div class="advance-copy"><strong>Age ${state.age} → ${state.age+1}</strong>${state.age<2?`<span>Cry level ${state.cryLevel}/5</span>`:''}</div><button class="button primary advance-button" data-action="advance">Next year ${icon('arrow')}</button></div>`;
}

function focusLabel(key) {
  if (state.age < 5) return toddlerFocusRows.find(([area])=>area===key)?.[1] || key;
  return ({work:state.age<18?'School':state.education.status==='college'?'College':'Career',social:'Friends',family:'Family',self:'Yourself',sports:'Sports',extracurricular:'Extracurriculars'})[key] || key;
}

function outcomeLimits(outcome) {
  const limits = { ...(state.age<2?{}:outcome.focusLimits?.[state.age<5?'toddler':'standard'] || {}) };
  if (isSchoolActivityFocus(state,'sports') && limits.self!==undefined && limits.self<MAX_FOCUS) limits.sports=Math.min(limits.sports ?? focusMaxFor(state,'sports'),Math.floor(limits.self/2));
  const active = focusLimits(state);
  const stage = state.age<2?null:state.age<5?'toddler':'standard';
  const capacity = Object.entries(limits).filter(([key,max])=>Object.hasOwn(active,key) && max<focusMaxFor(state,key)).map(([key,max])=>focusCapLabel(focusLabel(key),max));
  for (const [key,amount] of Object.entries(outcome.focusCapacity?.[stage] || {})) if (Object.hasOwn(active,key)) capacity.push(`${amount>0?'+':''}${amount} ${focusLabel(key)} focus capacity`);
  for (const [key,amount] of Object.entries(outcome.focusMinimums?.[stage] || {})) if (Object.hasOwn(active,key)) capacity.push(`+${amount} ${focusLabel(key)} minimum focus`);
  return capacity;
}

function outcomeLines(outcome, subject, pending) {
  if (!pending) {
    return [...Object.entries(outcome.modifiers || {}).filter(([,amount])=>amount).map(([key,amount])=>`${signedModifier(amount)} ${skillLabel(key)}`), ...(outcome.lifestyle?[`${signedModifier(outcome.lifestyle)} Lifestyle`]:[]), ...(outcome.householdLifestyle?[`${signedModifier(outcome.householdLifestyle)} Household lifestyle support strength`]:[]), ...(outcome.focusPoints?[focusPointChange(outcome.focusPoints)]:[]), ...outcomeLimits(outcome)];
  }
  const preview = structuredClone(state);
  const result = resolveEventChoice(preview,outcome.id,pending.eventId,pending.subjectId || undefined);
  if (!result.ok) return [];
  const change = (label,start,end) => `${label} ${beforeAfter({before:start,after:end},/lifestyle/i.test(label)?lifestyleNumber:number)}`;
  const permanentKeys = [...new Set([...Object.keys(outcome.statChanges || {}),...Object.keys(outcome.playerChanges || {}),...Object.keys(outcome.modifiers || {})])];
  const before = effectiveStats(state);
  const afterPermanent = effectiveStats({ ...preview, effects: state.effects });
  const changes = permanentKeys.map(key => change(skillLabel(key),before[key],afterPermanent[key]));
  if (outcome.fameAction === 'start' && preview.fame) changes.push(`Begin ${fameSource(preview.fame)}${preview.fame.kind==='personal'?'':' fame'}`);
  if (outcome.fameChange && state.fame && preview.fame) changes.push(change('Fame',state.fame.rating,preview.fame.rating));
  if (outcome.fameSupport && state.fame && preview.fame) changes.push(`Fame household support strength ${state.fame.support>0?'+':''}${number(state.fame.support)} → ${preview.fame.support>0?'+':''}${number(preview.fame.support)}`);
  const signedAptitude = value => value > 0 ? `+${value}` : String(value);
  for (const key of Object.keys(outcome.aptitudeChanges || {})) changes.push(`${skillLabel(key)} learning ability ${signedAptitude(state.aptitudes[key])} → ${signedAptitude(preview.aptitudes[key])}`);
  const nextSubject = pendingEventSubject(preview,pending);
  for (const key of Object.keys(outcome.subjectChanges || {})) changes.push(change(`${subject?.name || 'Your loved one'}: ${skillLabel(key)}`,subject?.stats[key],nextSubject?.stats[key]));
  if (outcome.relationship) changes.push(change(`Relationship with ${subject?.name || 'your loved one'}`,subject?.relationship,nextSubject?.relationship));
  if (outcome.householdLifestyle) changes.push(change('Household lifestyle',state.lifestyle,preview.lifestyle));
  if (outcome.focusPoints) changes.push(focusPointChange(outcome.focusPoints));
  changes.push(...outcomeLimits(outcome));
  if (outcome.years && (outcome.focusLimits || outcome.focusCapacity || outcome.focusMinimums || outcome.focusPoints || outcome.householdLifestyle)) changes.push(`${outcome.years} year${outcome.years===1?'':'s'}`);
  return changes;
}

function eventCauseView(entry, age = state.age) {
  if (!entry?.cause) return '';
  const recorded = entry.eventId ? null : eventCopiesFor(entry).find(event => event.id);
  const event = EVENTS.find(event => event.id === (entry.eventId || recorded?.id));
  const subject = recorded && entry.title !== recorded.name ? entry.title.slice(0, -recorded.name.length - 2) : 'Your family member';
  const description = recorded?.description.replaceAll('{name}', subject);
  const supersededStory = recorded && event && !recorded.copyOnly && recorded !== event
    && (recorded.name !== event.name || entry.description === description || entry.text?.startsWith(description));
  const cause = formatEventCause(entry.cause, supersededStory ? {} : event);
  return cause ? `<p class="event-cause form-note">${narrativeText(cause,age)}</p>` : '';
}

function eventDecisionView() {
  const pending = state.pendingEvents[0];
  if (!pending) return '';
  const event = EVENTS.find(event => event.id===pending.eventId);
  const subject = pendingEventSubject(state,pending);
  const story = text => String(text).replaceAll('{name}',subject?.name || 'your loved one');
  return `<section class="panel event-decision" aria-labelledby="event-title" data-event-id="${esc(event.id)}" data-subject-id="${esc(pending.subjectId || '')}"><div class="panel-heading"><span class="eyebrow">${pending.subjectId?'A FAMILY MOMENT':'A TURN IN YOUR STORY'}</span><span class="tag">${state.pendingEvents.length} CHOICE${state.pendingEvents.length===1?'':'S'} LEFT</span></div><h3 id="event-title" tabindex="-1">${journalText(event.name)}</h3><p class="event-context">${pending.subjectId?`${narrativeText(subject?.name)} · Age ${subject?.age} · Your age ${pending.age}`:`Age ${pending.age}`} · Year in review</p><p class="section-description">${journalText(story(eventDescriptionAtAge(event,(subject?.age ?? pending.age)-1)))}</p>${eventCauseView(pending,pending.age)}<div class="event-choices">${event.choices.map(choice=>`<button class="event-option" data-action="event-choice" data-event="${esc(event.id)}" data-subject="${esc(pending.subjectId || '')}" data-choice="${esc(choice.id)}"><strong>${journalText(choice.label)} ${icon('arrow')}</strong><span>${journalText(story(choice.description))}</span><span class="event-consequences">${outcomeLines(choice,subject,pending).map(line=>colorStatChanges(narrativeText(line))).join('<br>')}</span></button>`).join('')}</div><p class="decision-required">Choose before moving on.</p></section>`;
}

function focusEventDecision() {
  navigate('year');
  const heading = app.querySelector('#event-title');
  heading?.focus({preventScroll:true});
  heading?.scrollIntoView?.({block:'center',behavior:'instant'});
}

function effectsView() {
  const activeEffects = state.effects.filter(effect=>effect.years>0);
  if (!activeEffects.length) return '';
  return `<details class="panel active-effects"><summary>Active effects <span class="tag">${activeEffects.length}</span></summary><div class="effect-list">${activeEffects.map(effect => `<div class="effect-card ${Object.values(effect.modifiers || {}).some(value => value<0)||effect.lifestyle<0||effect.householdLifestyle<0||effect.focusPoints<0||outcomeLimits(effect).some(text=>text.startsWith('-')||text.includes('minimum focus')||text.includes('focus max'))?'negative':'positive'}"><div class="effect-title">${icon('spark')} ${journalText(effect.name)}</div><div class="effect-meta">${outcomeLines(effect).map(esc).join('<br>')}<br>${effect.years} year${effect.years===1?'':'s'} remaining</div></div>`).join('')}</div><button class="button ghost small" data-action="odds">View this year’s odds ${icon('arrow')}</button></details>`;
}

function yearView() {
  if (needsEducationChoice(state)) return `<section class="panel education-prompt"><div class="panel-heading"><h3>${labelWithHelp('Your next chapter','college')}</h3><span class="tag">A NEW CHOICE</span></div><p class="decision-required">Choose college or a career before your next year.</p><button class="button primary" data-action="tab" data-tab="career">College or career? ${icon('arrow')}</button></section>${effectsView()}${retirementNotice()}${connectionNotice()}${journalView()}`;
  const baby = state.age < 2;
  const toddler = !baby && state.age < 5;
  const disabled = state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const schoolGrade = state.school && (state.school.reportedAge===null?'N/A':gradeLetter(state.school.gpa));
  return `${state.education.status==='college'?collegeProgressView():''}${housingView()}<section class="panel focus-panel"><div class="panel-heading"><h3>${labelWithHelp(baby?'Cry level':toddler?'Toddler activities':'Focus',baby?'cry':toddler?'toddler-focus':'focus')}</h3><span class="tag">${baby ? 'AGES 0–1' : `${focusUsed()} / ${focusBudget(state)} POINTS`}</span></div>
    ${state.age>=5 && state.age<18 && state.school?`<div class="school-grade"><span>${labelWithHelp('School GPA','school-gpa')}<small>${state.school.reportedAge===null?'No report card yet':'Latest report card'}</small></span><strong aria-label="School GPA ${esc(schoolGrade)}">${esc(schoolGrade)}</strong></div>`:''}
    ${baby ? `<div class="cry-control" role="group" aria-label="Cry level"><div class="cry-levels">${[1,2,3,4,5].map(level=>`<button class="cry-level ${state.cryLevel===level?'selected':''}" data-action="baby" data-level="${level}" aria-label="Cry level ${level} of 5" aria-pressed="${state.cryLevel===level}" ${disabled?'disabled':''}>${level}</button>`).join('')}</div><div class="cry-scale-labels"><span>Low</span><span>High</span></div></div>` : focusView(disabled)}
    ${!baby&&(state.age<18||state.education.status==='college')?'':choiceImpactSummary()}
    </section>
    ${effectsView()}
    ${retirementNotice()}${connectionNotice()}${journalView()}`;
}

function parentStatusView() {
  if (!familyCareProfiles().length) return '';
  const order = { Dad: 0, Mom: 1, Parent: 2 };
  const parents = familyCareProfiles().sort((a,b) => (order[parentLabel(a)] ?? 3) - (order[parentLabel(b)] ?? 3));
  return `<div class="parent-status-list" aria-label="Parents and guardians">${parents.map(parent => {
    const role = parentLabel(parent);
    return `<section class="parent-status" data-parent-id="${esc(parent.id)}" aria-label="${esc(role)}"><div class="parent-status-heading"><h4>${role}:</h4>${helpButton('parents',role)}${parent.abandonedAt!=null?'<span class="parent-status-state">Left the family</span>':parent.alive === false?'<span class="parent-status-state">Deceased</span>':parent.guardianRole?'<span class="parent-status-state">Guardian</span>':''}</div><div class="parent-status-stats">${[['stability','Mental stability',parent.stats.stability],['relationship','Relationship',parent.relationship]].map(([key,label,value]) => `<div class="parent-status-stat" data-stat="${key}"><div class="parent-stat-heading"><span>${label}${statEmoji(key)}</span><span class="stat-reading"><strong>${number(value)}<small>/10</small></strong>${aptitudeBadge(parent.aptitudes[key],`${label} natural aptitude`)}</span></div>${ratingBar(`${role}: ${label}`,value)}</div>`).join('')}</div></section>`;
  }).join('')}</div>`;
}

function changesView(changes, lifestyle, height, fromAge, toAge) {
  const entries = [...Object.entries(changes || {}).sort(([a],[b]) => DISPLAY_STATS.findIndex(stat => stat.key === a) - DISPLAY_STATS.findIndex(stat => stat.key === b)), ...(lifestyle?[['lifestyle',lifestyle]]:[]), ...(height?[['height',height]]:[])];
  return `<div class="year-changes">${entries.map(([key,value]) => {
    const before = key === 'height' ? formatHeight(value.before,fromAge) : key === 'lifestyle' ? lifestyleNumber(value.before) : number(value.before);
    const after = key === 'height' ? formatHeight(value.after,toAge) : key === 'lifestyle' ? lifestyleNumber(value.after) : number(value.after);
    const change = before === after ? 0 : value.after - value.before;
    return `<div class="year-change" data-stat="${esc(key)}"><span>${esc(skillLabel(key))}${statEmoji(key)}</span><strong class="${change>0?'gain':change<0?'loss':'unchanged'}">${before} → ${after}</strong></div>`;
  }).join('')}</div>`;
}

function yearDecisionsView(decisions) {
  if (!decisions) return '';
  const entries=decisions.cryLevel!==undefined
    ? [['Cry level',`${decisions.cryLevel}/5`]]
    : (decisions.workLabel==='Play'?(Object.hasOwn(decisions.focus,'creative')?toddlerFocusRows:legacyToddlerFocusRows).map(([key,label])=>[label,key]):decisions.workLabel==='School'?schoolFocusRows.filter(([key])=>Object.hasOwn(decisions.focus,key)).map(([key,label])=>[label,key]):[[decisions.workLabel || 'School/career','work'],['Friends','social'],['Family','family'],['Yourself','self'],...schoolFocusRows.filter(([key])=>['sports','extracurricular'].includes(key)&&Object.hasOwn(decisions.focus,key)).map(([key,label])=>[label,key])]).map(([label,key])=>[label,`${decisions.focus[key]}/${decisions.focusCaps?.[key] ?? decisions.focusMax ?? 5}`]);
  const rest=decisions.focus?(decisions.focusBudget ?? 12)-Object.values(decisions.focus).reduce((sum,value)=>sum+value,0):0;
  if(rest) entries.push([decisions.focusMax===MAX_FOCUS||decisions.workLabel==='Play'?'Unused':'Rest',`${rest} point${rest===1?'':'s'}`]);
  return `<section class="year-decisions" aria-label="Choices used this year"><h3>Your choices</h3><dl>${entries.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`;
}

// Historical copy is render-only: old titles and exact prefixes keep their context.
const eventCopiesFor = entry => [...LEGACY_EVENT_COPY, ...EVENTS]
  .filter(event => entry.title===event.name || entry.title.endsWith(`: ${event.name}`))
  .flatMap(event => [event, ...Object.values(event.descriptionsByStage || {}).map(description => ({...event,description,copyOnly:true})), ...legacyLifeEventCopies(event)]);
const eventImpactTag = event => ['minor','moderate','major'].includes(event?.severity)
  ? `<small class="event-impact" data-severity="${event.severity}">${{minor:'Minor event',moderate:'Moderate event',major:'Major event'}[event.severity]}</small>` : '';
const recordedEventImpact = entry => eventImpactTag(EVENTS.find(event => entry.title===event.name || entry.title.endsWith(`: ${event.name}`)));
const isNoEventEntry = entry => entry.title === 'A quiet year' || entry.kind === 'quiet' && entry.title === 'Events' && entry.text === 'None';
function meaningfulFocusOutcome(entry, text) {
  const lines=splitEventOutcome(text);
  if(lines.length<2) return text;
  const choice=eventCopiesFor(entry).flatMap(event=>event.choices || []).find(choice=>lines[0]===`${choice.label}. No stat changes.`);
  if(lines[0]!=='No stat changes.' && !choice) return text;
  const focusName='(?:Arts\\s*&\\s*crafts|Family\\s+time|Extracurriculars?|Electronics|Yourself|Friends|College|Career|School|Sports|Study|Family|Play|Rest|Work)';
  const signed='[+\\-\u2212]\\d+';
  const focus=new RegExp(`^(?:${signed} (?:total )?focus points?|${signed} ['"]?${focusName}['"]? (?:focus capacity|minimum focus)|['"]?${focusName}['"]? (?:focus )?(?:max|minimum|min|capacity) [+-]?\\d+)\\.?$`,'i');
  const duration=/^(?:(?:Temporary effects|Duration):\s*)?\d+\s+years?\.?$/i;
  const effects=lines.slice(1);
  if(!effects.some(line=>focus.test(line)) || !effects.every(line=>focus.test(line) || duration.test(line))) return text;
  return `${choice?`${choice.label}. `:''}${effects.join('\n')}`;
}
function completedEventCopy(entry) {
  if (isNoEventEntry(entry)) return { title: 'Events', text: 'None' };
  const milestones = {
    'A bigger little world': ['Toddler activities unlocked','Toddler focus choices are now available.'],
    'The first school year': ['School started','School focus and yearly activity offers unlocked.'],
    'Your own way': ['Adulthood reached','College and career choices unlocked.'],
    'Graduation day': ['College completed','Graduate job offers unlocked.'],
    'The next chapter': ['Retirement unlocked','You can now retire and choose an heir.'],
  };
  if (entry.kind==='milestone' && milestones[entry.title]) {
    const [title,text] = milestones[entry.title];
    return {title,text};
  }
  const knownMilestone=Object.values(milestones).find(([title])=>title===entry.title);
  if(entry.kind==='milestone' && knownMilestone && /^(?:(?:College and career choices|Graduate job offers) unlocked\. )?No stat changes\.$/.test(entry.text)) return {title:entry.title,text:knownMilestone[1]};
  for (const event of eventCopiesFor(entry)) {
    const subject = entry.title===event.name?'Your family member':entry.title.slice(0,-event.name.length-2);
    const choice = event.choices?.find(choice=>entry.text.startsWith(`${choice.label}: `));
    const description = (choice?.description || event.description).replaceAll('{name}',subject);
    const prefix = choice?`${choice.label}: ${description}`:description;
    if (!entry.text.startsWith(prefix)) continue;
    const changes = entry.text.slice(prefix.length).trim();
    return {title:entry.title,text:meaningfulFocusOutcome(entry,`${choice?`${choice.label}. `:''}${changes || 'No stat changes.'}`)};
  }
  return {...entry,text:meaningfulFocusOutcome(entry,entry.text)};
}
function yearEventsView(summary) {
  // Saved reviews follow the newest-first journal; show the year in occurrence order.
  const events = (summary.events || []).filter(event => !isNoEventEntry(event)).reverse();
  return `<details class="year-review-events" open><summary>Events</summary>${events.length?`<ul>${events.map(event=>{
    const copy = completedEventCopy(event);
    const description = reviewEventDescription(event);
    const result = event.kind==='choice' && description ? 'Choice offered.' : copy.text;
    return `<li><strong>${journalText(copy.title,summary.toAge)}</strong>${recordedEventImpact(event)}${description?`<p class="year-event-description">${narrativeText(description,summary.toAge)}</p>`:''}${eventCauseView(event,summary.toAge)}<p class="year-event-results">${eventOutcomeText(result,summary.toAge)}</p></li>`;
  }).join('')}</ul>`:'<p>None</p>'}</details>`;
}

function reviewEventDescription(entry) {
  const copies = eventCopiesFor(entry);
  const subjectFor = copy => entry.title===copy.name ? 'Your family member' : entry.title.slice(0,-copy.name.length-2);
  const captured = copies.find(copy => entry.description === copy.description.replaceAll('{name}',subjectFor(copy)));
  const event = captured || copies.find(copy => {
    const subject = entry.title===copy.name ? 'Your family member' : entry.title.slice(0,-copy.name.length-2);
    const choice = copy.choices?.find(choice=>entry.text.startsWith(`${choice.label}: `));
    const prefix = choice ? `${choice.label}: ${choice.description}` : copy.description;
    return entry.text.startsWith(prefix.replaceAll('{name}',subject));
  }) || copies[0];
  const subject = event && entry.title!==event.name ? entry.title.slice(0,-event.name.length-2) : 'Your family member';
  const source = entry.description || event?.description?.replaceAll('{name}',subject) || '';
  // Match the captured story itself, never today's age. Unknown prose and all
  // numerical outcomes remain untouched; only exact old catalog copy is shortened.
  if (event?.shortDescription && (!entry.description || captured)) return event.shortDescription.replaceAll('{name}',subject).trim();
  return source.trim();
}

function eventOutcomeText(text, age) {
  return splitEventOutcome(text).map(line=>colorStatChanges(journalText(line,age))).join('<br>');
}

const activitySuccessLabel = activityGradeLetter;

function schoolReportView(report) {
  if (!report) return '';
  return `<section class="school-report" aria-label="School report card"><h3>Report card</h3><p>GPA <strong>${report.previousGpa==null?'':`${esc(gradeLetter(report.previousGpa))} → `}${esc(gradeLetter(report.gpa))}</strong></p>${(report.activities || []).map(activity=>`<p>${esc(activity.name)} success <strong>${activitySuccessLabel(activity.before)} → ${activitySuccessLabel(activity.after)}</strong></p>`).join('')}</section>`;
}

function fameReviewView(report) {
  if (!report || !report.before && !report.after) return '';
  const source = fameSource(report.after || report.before);
  const direction = report.before && report.after ? Math.sign(Number(number(report.after.rating))-Number(number(report.before.rating))) : 0;
  const result = report.before && report.after
    ? `<span class="stat-change ${direction>0?'gain':direction<0?'loss':'unchanged'}">${beforeAfter({before:report.before.rating,after:report.after.rating})}</span>`
    : report.after ? `<span class="stat-change gain">Began at ${number(report.after.rating)}/10</span>`
    : '<span class="stat-change loss">Fame ended</span>';
  return `<section class="fame-review" aria-label="Fame review"><h3>Fame</h3><p>${esc(source)} <strong>${result}</strong></p></section>`;
}

function yearSummaryModal() {
  const summary=state.yearSummary;
  if (!summary || summary.dismissed) return;
  openModal(`Age ${summary.fromAge} → ${summary.toAge}`, `${schoolReportView(summary.school)}${fameReviewView(summary.fame)}${yearDecisionsView(summary.decisions)}${changesView(summary.stats,summary.lifestyle,summary.height,summary.fromAge,summary.toAge)}${summary.parents?.length?`<details class="forecast-parents" open><summary>Parents & guardians</summary>${summary.parents.map(parent=>`<p><strong>${narrativeText(parent.name)}</strong><span>Mental stability${statEmoji('stability')} ${coloredBeforeAfter(parent.stability)}<br>Relationship${statEmoji('relationship')} ${coloredBeforeAfter(parent.relationship)}${parent.lifestyle?`<span class="parent-review-lifestyle">Lifestyle${statEmoji('lifestyle')} ${coloredBeforeAfter(parent.lifestyle,lifestyleNumber)}</span>`:''}</span></p>`).join('')}</details>`:''}${yearEventsView(summary)}${state.pendingEvents.length?'<p class="form-note">Decisions waiting.</p>':''}`, '<button class="button primary" data-action="close">Continue '+icon('arrow')+'</button>');
  showingYearSummary=true;
  modalRoot.querySelector('.modal').classList.add('year-review-modal');
  modalRoot.querySelector('.modal-backdrop').classList.add('year-review-backdrop');
}

function lifestyleView() {
  const descriptions = ['Basic needs unmet', 'The essentials', 'A little breathing room', 'Finding your footing', 'Everyday comfort', 'Living well', 'Room to enjoy life', 'A comfortable abundance', 'A taste of luxury', 'An exceptional life', 'Every comfort imaginable'];
  return `<section class="lifestyle-summary" aria-label="Lifestyle"><div><span class="eyebrow">EVERYDAY COMFORT</span><h3>${labelWithHelp('Lifestyle','lifestyle')} <strong>${lifestyleNumber(state.lifestyle)}<small>/10</small></strong></h3><p>${descriptions[state.lifestyle>=10?10:Math.min(9,Math.round(state.lifestyle))]}</p>${ratingBar('Lifestyle',state.lifestyle)}</div></section>`;
}

function choiceImpactGroups(changes) {
  const groups = [['you','You'],['others','Other people'],['relationships','Relationships']];
  return groups.map(([group,title]) => {
    const entries = changes.filter(entry => entry.group === group);
    if (!entries.length) return '';
    return `<section class="choice-impact-group" data-impact-group="${group}" aria-label="${title}"><h5>${title}</h5><ul class="choice-impact-list">${entries.map(({stat,change,level,parentId}) => {
      let label = skillLabel(stat);
      if (parentId) {
        const parent = familyCareProfiles().find(person => person.id === parentId);
        const role = parentLabel(parent);
        const name = familyCareProfiles().filter(person => parentLabel(person) === role).length > 1 ? `${role}: ${parent.name}` : role;
        label += ` (${name})`;
      }
      const direction = change > 0 ? 'increase' : 'decrease';
      const signs = (change > 0 ? '+' : '-').repeat(level);
      const magnitude = ['small','medium','large'][Math.min(level,3)-1];
      return `<li class="choice-impact" data-stat="${stat}" data-level="${level}" data-direction="${direction}" ${parentId?`data-parent-id="${esc(parentId)}"`:''}><span role="img" aria-label="${esc(label)}: ${magnitude} expected ${direction}"><b aria-hidden="true">${signs}</b> ${esc(label)}${statEmoji(stat)}</span></li>`;
    }).join('')}</ul></section>`;
  }).join('');
}

function choiceImpactSummary() {
  if (state.ended || state.needsSuccession || state.pendingEvents.length || needsEducationChoice(state)) return '';
  const changes = choiceImpacts(state);
  return `<section class="choice-impact-summary" aria-label="Expected changes"><h4>${labelWithHelp('Expected changes','forecast')}</h4>${changes.length?choiceImpactGroups(changes):'<p class="muted">No focus-driven changes expected.</p>'}</section>`;
}

function activityEffectsView(activity, label) {
  const changes = state.age<5?toddlerChoiceImpacts(state,activity):schoolChoiceImpacts(state,activity);
  const entries = [];
  for (const change of changes) {
    const existing = change.parentId && entries.find(entry => entry.parentIds && entry.stat===change.stat && entry.level===change.level && Math.sign(entry.change)===Math.sign(change.change));
    if (existing) existing.parentIds.push(change.parentId);
    else entries.push({ ...change, ...(change.parentId?{parentIds:[change.parentId]}:{}) });
  }
  if (activity === fameFocusKey(state)) {
    const change = fameFocusChange(state);
    if (change && (change>0?state.fame.rating<10:state.fame.rating>0)) entries.push({stat:'fame',change,level:Math.abs(change)<.5?1:change<0 && state.fame.kind!=='personal'?2:3});
  }
  if (!entries.length) return '';
  return `<div class="activity-effects" aria-label="${esc(label)} expected changes"><ul class="choice-impact-list">${entries.map(({stat,change,level,parentIds}) => {
    const family = !!parentIds;
    const name = stat==='fame'?'Fame':family?`${stat==='relationship'?'Relationships':skillLabel(stat)} (family)`:skillLabel(stat);
    const direction = change>0?'increase':'decrease';
    const signs = (change>0?'+':'-').repeat(level);
    const magnitude = ['small','medium','large'][Math.min(level,3)-1];
    const people = family?parentIds.map(id=>parentLabel(familyCareProfiles().find(person=>person.id===id))).join(', '):'';
    return `<li class="choice-impact" data-stat="${stat}" data-level="${level}" data-direction="${direction}" data-target="${family?'family':'you'}" ${family?`data-parent-ids="${esc(parentIds.join(' '))}"`:''}><span role="img" aria-label="${esc(name)}: ${magnitude} expected ${direction}${people?`; ${esc(people)}`:''}"><b aria-hidden="true">${signs}</b> ${esc(name)}${statEmoji(stat)}</span></li>`;
  }).join('')}</ul></div>`;
}

function schoolEnrollmentView(kind, disabled) {
  const enrolled=state.school?.[kind];
  const activity=schoolActivity(kind,enrolled?.id);
  const eligible=activity && activityEligible(state,activity);
  const offerCount=state.school?.offers[kind]?.length || 0;
  const emptyNote=`No ${kind==='sports'?'sports':'extracurriculars'} offered this year.`;
  return `<div class="school-enrollment" data-school-kind="${kind}">${activity?`<div class="school-enrollment-title"><strong>${esc(activity.name)}</strong><span>Success <strong>${activitySuccessLabel(enrolled.success)}</strong></span></div>${!eligible?`<p class="form-note">Requires Lifestyle ${lifestyleNumber(activity.minLifestyle)}+. Participation is paused.</p>`:''}`:`<div class="school-enrollment-title"><span>Success N/A</span></div>${offerCount?'<p class="form-note">Sign up to spend focus points here.</p>':''}`}${!offerCount?`<p class="form-note">${emptyNote}</p>`:''}${activity || offerCount?`<button class="button ghost small" data-action="school-offers" data-kind="${kind}" ${disabled?'disabled':''}>${activity?(offerCount?'View this year’s options':'Manage current activity'):kind==='sports'?'Join a sport':'Join an extracurricular'}</button>`:''}</div>`;
}

function fameActivityView(kind) {
  const enrolled = currentSchoolEnrollment(state,kind);
  const activity = schoolActivity(kind,enrolled?.id);
  if (!activity) return '';
  return `<div class="school-enrollment fame-activity" data-school-kind="${kind}"><div class="school-enrollment-title"><strong>${esc(activity.name)}</strong><span>Success <strong>${activitySuccessLabel(enrolled.success)}</strong></span></div>${!activityEligible(state,activity)?`<p class="form-note">Requires Lifestyle ${lifestyleNumber(activity.minLifestyle)}+. Participation is paused.</p>`:''}</div>`;
}

function schoolOffersModal(kind) {
  if (state.age<5 || state.age>=18 || !state.school || !['sports','extracurricular'].includes(kind)) return;
  const enrolled=state.school[kind];
  const current=schoolActivity(kind,enrolled?.id);
  const blocked=state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const freePoints=focusBudget(state)-focusUsed()+(state.focus[kind] || 0);
  const cards=state.school.offers[kind].map(id=>{
    const activity=schoolActivity(kind,id);
    const eligible=activityEligible(state,activity);
    const candidate={...state,school:{...state.school,[kind]:{id,success:null}}};
    const required=Math.max(1,focusMinimums(candidate)[kind]);
    const restricted=focusLimits(candidate)[kind]<required;
    const reason=!eligible?`Requires Lifestyle ${lifestyleNumber(activity.minLifestyle)}+.`:restricted?'Participation is restricted this year.':freePoints<required?`Free ${required===1?'one':required} focus ${required===1?'point':'points'} to sign up.`:'';
    return `<article class="school-offer" data-offer-id="${esc(id)}"><h3>${esc(activity.name)}</h3><p>Performance: ${Object.keys(activity.weights).map(key=>key==='height'?(activity.heightPreference==='shorter'?'Shorter height':'Taller height'):skillLabel(key)).map(esc).join(', ')}.</p><p>Training: ${Object.keys(activity.training).map(skillLabel).map(esc).join(', ')}.</p>${activity.minLifestyle?`<p>Minimum Lifestyle ${lifestyleNumber(activity.minLifestyle)}</p>`:''}${reason?`<p class="form-note">${esc(reason)}</p>`:''}<button class="button secondary small" data-action="school-enroll" data-kind="${kind}" data-id="${esc(id)}" ${blocked || !eligible || restricted || freePoints<required?'disabled':''}>Join ${esc(activity.name)}</button></article>`;
  }).join('');
  openModal(kind==='sports'?'Choose a sport':'Choose an extracurricular', `<p class="form-note">Higher Lifestyle brings more frequent offers and usually more choices. Each category rolls separately. At Lifestyle 1, each has a 28% yearly chance of 1-4 options, with a median of 2. At Lifestyle 10, both arrive every year with 8-10 options and a median of 10. Offers last this school year.</p><p class="form-note">Joining assigns 1 point. Success is N/A until your first completed year of participation, then graded F- through A+. Switching starts a new unrated activity.</p>${current?`<div class="school-current"><strong>Current: ${esc(current.name)} · ${activitySuccessLabel(enrolled.success)}</strong><button class="button secondary small" data-action="close">Keep ${esc(current.name)}</button><button class="button ghost small" data-action="school-leave" data-kind="${kind}" ${blocked || focusMinimums(state)[kind]>0?'disabled':''}>Leave ${esc(current.name)}</button></div>`:''}${!cards?`<p class="form-note">No ${kind==='sports'?'sports':'extracurriculars'} offered this year.${current?' You can keep or leave your current activity.':''}</p>`:''}<div class="school-offers">${cards}</div>`);
}

function focusView(disabled) {
  const toddler = state.age < 5;
  const studying = state.age<18 || state.education.status==='college';
  const rows = toddler?toddlerFocusRows:state.age<18?schoolFocusRows:[['work',studying?'College':'Career',studying?'school':'career'],['social','Friends','social'],['family','Family','family'],['self','Yourself','self']];
  const famousActivity = hasFame(state) && state.fame.kind !== 'personal' ? state.fame.kind : null;
  const collegeSport = state.education.status==='college' && state.education.sport;
  if (collegeSport) rows.push(['sports','College sports','sports']);
  if (state.age>=18 && famousActivity && !(collegeSport && famousActivity==='sports')) rows.push([famousActivity,focusLabel(famousActivity),famousActivity==='sports'?'sports':'spark']);
  const mode = toddler?'activity':'focus';
  const limits = focusLimits(state), minimums = focusMinimums(state), details = focusLimitDetails(state);
  const schoolPerson = !disabled && state.alive!==false && state.age>=5 && (state.age<18 || famousActivity || state.education.status==='college')
    ? { ...state, stats: effectiveStats(state) } : null;
  const selectedCollege = collegeById(state.education.collegeId);
  const expectedGpa = schoolPerson && state.age<18 ? gradeLetter(gradeScore(state.focus.work,schoolPerson.stats.intelligence))
    : schoolPerson && selectedCollege && state.education.status==='college' ? gradeLetter(collegeGradeScore(selectedCollege.difficulty,state.focus.work,schoolPerson.stats.intelligence)) : null;
  return `<div class="focus-list">${rows.map(([key,label,ico]) => {
    const maximum=focusMaxFor(state,key);
    const enrollment = schoolPerson && ['sports','extracurricular'].includes(key) ? currentSchoolEnrollment(state,key) : null;
    const activity = enrollment && schoolActivity(key,enrollment.id);
    const expectedSuccess = activityEligible(schoolPerson,activity)
      ? activityGradeLetter(collegeSport && key==='sports'
        ? collegeSportSuccessAfterYear(schoolPerson,enrollment.success,state.focus[key])
        : activitySuccessAfterYear(schoolPerson,activity,enrollment.success,state.focus[key])) : null;
    const restrictions = details.filter(limit=>limit.key===key);
    const limitText = restrictions.length?(minimums[key]?'Minimum '+minimums[key]+' · ':'')+restrictions.map(limit=>{
      const change = limit.minimum ? `+${limit.minimum} minimum` : limit.capacity !== undefined ? `${limit.capacity>0?'+':''}${limit.capacity} capacity` : limit.permanent ? `Max ${limit.max}` : `${limit.max-maximum} capacity`;
      return change+' · '+limit.name+' ('+(limit.years===null?'lifelong':limit.years===1?'this year':limit.years+' years left')+')';
    }).join('; '):'';
    return `<div class="focus-row" data-focus-key="${key}"><span class="focus-icon">${icon(ico)}</span><div class="focus-copy"><h4>${labelWithHelp(label,`${toddler?'toddler':'focus'}-${key}`)}</h4><div class="focus-scale" aria-hidden="true">${Array.from({length:maximum},(_,i)=>`<span class="${i<(state.focus[key] ?? 0)?'filled':i>=limits[key]?'limited':''}"></span>`).join('')}</div>${limitText?`<div class="focus-limit" id="focus-limit-${key}">${esc(limitText)}</div>`:''}</div><div class="stepper" role="group" aria-label="${esc(label)} ${mode}" ${limitText?`aria-describedby="focus-limit-${key}"`:''}><button data-action="focus" data-key="${key}" data-delta="-1" aria-label="Decrease ${esc(label.toLowerCase())} ${mode}" ${(state.focus[key] ?? 0)<=minimums[key]||disabled?'disabled':''}>${icon('minus')}</button><output aria-label="${esc(label)} ${mode} level">${state.focus[key] ?? 0}</output><button data-action="focus" data-key="${key}" data-delta="1" aria-label="Increase ${esc(label.toLowerCase())} ${mode}" ${(state.focus[key] ?? 0)>=limits[key]||focusUsed()>=focusBudget(state)||disabled?'disabled':''}>${icon('plus')}</button></div>${key==='work' && expectedGpa!==null?`<div class="school-gpa-preview" role="status">${state.education.status==='college'?'Expected yearly grade':'Expected GPA'} <strong>${esc(expectedGpa)}</strong></div>`:''}${expectedSuccess!==null?`<div class="school-success-preview" role="status">Expected success <strong>${esc(expectedSuccess)}</strong></div>`:''}${(toddler||studying||key===fameFocusKey(state))&&!disabled?activityEffectsView(key,label):''}${state.age>=5 && state.age<18 && ['sports','extracurricular'].includes(key)?schoolEnrollmentView(key,disabled):state.age>=18 && (key===famousActivity || collegeSport && key==='sports')?fameActivityView(key):''}</div>`;
  }).join('')}</div>`;
}

function journalView() {
  const entries = showAllHistory ? state.history : state.history.slice(0,8);
  return `<section class="panel journal-panel"><div class="panel-heading"><h3>Journal</h3></div><div class="journal-list">${entries.map(entry => `<article class="journal-entry ${esc(entry.kind || 'neutral')}"><div class="journal-age"><strong>${entry.age}</strong><span>${entry.generation===state.generation?'AGE':`GEN ${entry.generation}`}</span></div><span class="journal-marker"></span><div class="journal-content"><h4>${journalText(completedEventCopy(entry).title,entry.age)}</h4>${recordedEventImpact(entry)}${eventCauseView(entry,entry.age)}<p>${eventOutcomeText(completedEventCopy(entry).text,entry.age)}</p></div></article>`).join('')}</div>${state.history.length>8?`<button class="button ghost small" data-action="history">${showAllHistory?'Recent years':'Show all'} ${icon('arrow')}</button>`:''}</section>`;
}

function collegeProgressView() {
  const years = state.education.years;
  const college = collegeById(state.education.collegeId);
  return `<section class="panel college-progress"><div class="panel-heading"><h3>${labelWithHelp(college?.name || 'College','college')}</h3><span class="tag">${years}/4 YEARS COMPLETE</span></div><div class="budget-track" role="progressbar" aria-label="College progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${years}"><span style="width:${years/4*100}%"></span></div><p class="game-status">${4-years} more year${years===3?'':'s'} to graduation.</p>${college?`<div class="college-grades job-metrics"><span>${labelWithHelp('College GPA','college-grades')}</span><strong>${state.education.gpa==null?'N/A':esc(gradeLetter(state.education.gpa))}</strong></div>${collegeMetricsView(college)}`:''}${collegeSportView()}</section>`;
}

function collegeMeter(label, value, college) {
  const bounded = Math.max(0,Math.min(10,Number(value)||0));
  return `<div class="college-metric"><div class="job-metrics"><span>${esc(label)}</span><strong>${number(bounded)}<small>/10</small></strong></div><div class="potential-track" role="meter" aria-label="${esc(college.name)} ${esc(label.toLowerCase())}" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${bounded}"><span style="width:${bounded*10}%"></span></div></div>`;
}

function collegeMetricsView(college) {
  return `<div class="college-metrics">${collegeMeter('Academic difficulty',college.difficulty,college)}${collegeMeter('Career potential',college.careerPotential,college)}</div>`;
}

function collegeFundingView() {
  const funding = state.collegeApplications?.funding || (needsEducationChoice(state) ? createCollegeOffers(state).funding : null);
  if (!funding) return '';
  const relatives = [...state.parents,state.guardian].filter(Boolean);
  return `<div class="college-funding" aria-label="College funding"><div class="job-metrics"><span>Parents’ household Lifestyle</span><strong>${lifestyleNumber(funding.householdLifestyle)}<small>/10</small></strong></div>${funding.supporters.map(supporter=>{
    const person=relatives.find(relative=>relative.id===supporter.id);
    return `<p class="college-supporter"><span>${person?esc(parentLabel(person)): 'Family member'}</span><strong>${supporter.willing?'Willing to help':'Not contributing'}</strong></p>`;
  }).join('')}<div class="job-metrics"><span>Family contribution capacity</span><strong>${lifestyleNumber(funding.familyContribution)}<small>/10</small></strong></div><div class="job-metrics"><span>Your contribution capacity</span><strong>${lifestyleNumber(funding.personalContribution)}<small>/10</small></strong></div><div class="job-metrics college-available"><span>Available college Lifestyle</span><strong>${lifestyleNumber(funding.availableLifestyle)}<small>/10</small></strong></div></div>`;
}

function collegeChoicesView() {
  const blocked=state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const offers=offeredColleges(state);
  return `<section class="panel education-choice"><div class="panel-heading"><h3>${labelWithHelp('College or a career?','college')}</h3><span class="tag">YOUR CHOICE</span></div>${collegeFundingView()}<div class="college-offers">${offers.map(offer=>{
    const college=offer.college || collegeById(offer.collegeId);
    if(!college) return '';
    const scholarship=offer.scholarship;
    const canFund=offer.affordable && offer.annualPersonalCost*COLLEGE_BALANCE.years<=state.money+.000001;
    const award=scholarship?`${scholarship.coverage===1?'Full':`${Math.round(scholarship.coverage*100)}%`} ${({academic:'academic',sports:'sports',extracurricular:'extracurricular'})[scholarship.kind]} scholarship`:'No scholarship offered';
    return `<article class="college-offer ${canFund?'affordable':'unaffordable'}" data-college-id="${esc(college.id)}"><h4>${labelWithHelp(college.name,'college-option',college.id)}</h4>${collegeMetricsView(college)}<div class="job-metrics"><span>Full Lifestyle requirement</span><strong>${lifestyleNumber(college.requiredLifestyle)}<small>/10</small></strong></div><p class="college-scholarship">${esc(award)}</p><div class="job-metrics"><span>After scholarship</span><strong>${lifestyleNumber(offer.requiredLifestyle)}<small>/10</small></strong></div><div class="job-metrics"><span>Available college Lifestyle</span><strong>${lifestyleNumber(offer.availableLifestyle)}<small>/10</small></strong></div><p class="college-affordability">${canFund?'Funding available':offer.affordable?'Your current reserves no longer cover the full course.':'More financial support needed'}</p><button class="button ${canFund?'primary':'secondary'} small" data-action="education" data-path="college" data-college="${esc(college.id)}" ${blocked || !canFund?'disabled':''}>Attend ${esc(college.name)} ${icon('arrow')}</button></article>`;
  }).join('')}</div><div class="college-work-choice"><button class="button secondary" data-action="education" data-path="work" ${blocked?'disabled':''}>Skip college · look for work ${icon('arrow')}</button></div></section>`;
}

function collegeSportView() {
  const enrolled=state.education.sport;
  const sport=schoolActivity('sports',enrolled?.id);
  if(state.education.status==='graduate' && sport) return `<section class="panel college-sport-result" aria-label="College sports result"><div class="panel-heading"><h3>${labelWithHelp('College sports','college-sports')}</h3><span class="tag">${esc(sport.name)}</span></div><p>Latest sport success <strong>${activitySuccessLabel(enrolled.success)}</strong> - ${enrolled.seasons}/4 college seasons</p><p>${enrolled.professionalOffer?'Professional recruitment offer earned. Choose Professional athlete from your career offers when qualified.':'No professional offer from college recruitment.'}</p></section>`;
  if(state.education.status!=='college') return '';
  const blocked=state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const committed=!!enrolled && focusMinimums(state).sports>0;
  return `<div class="college-sport" aria-label="College sport"><div class="panel-heading"><h4>${labelWithHelp('College sports','college-sports')}</h4>${sport?`<span class="tag">${esc(sport.name)}</span>`:''}</div>${enrolled?`<p class="college-sport-success">College success <strong>${activitySuccessLabel(enrolled.success)}</strong><span>${enrolled.seasons}/4 seasons</span></p><button class="button ghost small" data-action="college-sport-leave" ${blocked || committed?'disabled':''}>Leave college ${esc(sport.name)}</button>`:'<p>College success N/A</p>'}<button class="button secondary small" data-action="college-sport-options" ${blocked || committed?'disabled':''}>${sport?'Change college sport':'Join a college sport'}</button>${committed?'<p class="college-sport-requirement">Your current sport has a required focus minimum this year.</p>':''}</div>`;
}

function collegeSportChoicesModal() {
  if(state.education.status!=='college') return;
  const blocked=state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const available=focusBudget(state)-focusUsed()+(state.focus.sports || 0);
  const committed=!!state.education.sport && focusMinimums(state).sports>0;
  const cards=SPORTS.map(sport=>{
    const endsFame=hasFame(state) && state.fame.kind==='sports' && state.fame.activityId!==sport.id;
    const candidate={...state,...(endsFame?{fame:null}:{}),education:{...state.education,sport:{id:sport.id,success:null,seasons:0,professionalOffer:false}}};
    const required=Math.max(1,focusMinimums(candidate).sports || 0);
    const selected=state.education.sport?.id===sport.id;
    const reason=committed?'Your current sport has a required focus minimum this year.':focusLimits(candidate).sports<required?'Participation is restricted this year.':available<required?`Free ${required===1?'one':required} focus ${required===1?'point':'points'} to join.`:'';
    return `<article class="school-offer" data-offer-id="${esc(sport.id)}"><h3>${esc(sport.name)}</h3><p>Performance: ${Object.keys(sport.weights).map(key=>key==='height'?(sport.heightPreference==='shorter'?'Shorter height':'Taller height'):skillLabel(key)).map(esc).join(', ')}.</p><p>Training: ${Object.keys(sport.training).map(skillLabel).map(esc).join(', ')}.</p>${reason?`<p class="form-note">${esc(reason)}</p>`:''}<button class="button secondary small" data-action="college-sport-join" data-id="${esc(sport.id)}" ${selected || blocked || !!reason?'disabled':''}>${selected?'Current sport':`Join ${esc(sport.name)}`}</button></article>`;
  }).join('');
  openModal('Choose a college sport', `<p class="form-note">College teams provide facilities and share your adult focus budget. Joining needs at least one point, including any required minimum. Switching keeps your allocation within the new limits, resets college success and seasons, and ends fame tied to the previous sport.</p><div class="school-offers">${cards}</div>`);
}

function housingView() {
  if(state.age<18 || !state.housing) return '';
  const housing=housingDetails(state);
  const title=({parents:'Staying with family',campus:'College housing',independent:'Living independently',homeless:'Without stable housing'})[housing.status];
  if(!title) return '';
  const host=[...state.parents,state.guardian].filter(Boolean).find(person=>person.id===housing.hostId);
  return `<section class="panel housing-panel ${housing.status}" aria-label="Housing"><div class="panel-heading"><h3>${labelWithHelp('Housing','housing')}</h3><span class="tag">${esc(title)}</span></div>${housing.status==='parents'?`<p class="housing-detail">${host?`${esc(parentLabel(host))} is helping while you get established. `:''}${housing.remainingYears} year${housing.remainingYears===1?'':'s'} of family support remaining.</p>`:housing.status==='homeless'?'<p class="housing-detail">Unstable shelter is affecting your health, social life and mental wellbeing.</p>':''}</section>`;
}

function jobStatFactorsView(job) {
  return `<div class="job-affinities" aria-label="Stats that support job success">${Object.entries(job.affinities).sort((a,b)=>b[1]-a[1]).map(([key,value])=>`<span class="job-affinity" data-skill="${key}" aria-label="${esc(skillLabel(key))}: ${value===3?'central':value===2?'important':'useful'} for job success">${esc(skillLabel(key))}${statEmoji(key)} <strong>+${value}</strong></span>`).join('')}</div>`;
}

function careerPotentialView(job) {
  const potential=Math.max(0,Math.min(10,Number(job.advancementPotential)||0));
  return `<div class="career-potential" data-potential-job="${esc(job.id)}"><div class="job-metrics"><span>${labelWithHelp('Advancement potential','career-potential',job.id)}</span><strong>${number(potential)}<small>/10</small></strong></div><div class="potential-track" role="meter" aria-label="${esc(job.name)} advancement potential" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${potential}" aria-valuetext="${number(potential)} out of 10"><span style="width:${potential*10}%"></span></div><div class="job-metrics career-ceiling"><span>Career Lifestyle ceiling</span><strong>${lifestyleNumber(job.maxLifestyle)}<small>/10</small></strong></div></div>`;
}

function careerProgressView(job) {
  const progress=Math.max(0,Math.min(1,Number.isFinite(state.careerProgress)?state.careerProgress:initialCareerProgress(state.jobYears)));
  return `<div class="career-progress"><div class="job-metrics"><span>${labelWithHelp('Career progress','career-progress',job.id)}</span><strong>${pct(progress)}</strong></div><div class="fit-track" role="progressbar" aria-label="Progress within ${esc(job.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress*100)}"><span style="width:${progress*100}%"></span></div></div>`;
}

function careerView() {
  if (state.age<18) return '<button class="career-locked-bar" type="button" disabled>Unlocks at age 18</button>';
  if (state.education.status==='college') return `${collegeProgressView()}${housingView()}<section class="panel"><button class="button primary" data-action="tab" data-tab="year">Continue studying ${icon('arrow')}</button></section>`;
  const current = career();
  const blocked=state.ended || state.needsSuccession || state.pendingEvents.length>0;
  const offers = offeredJobs(state);
  const choosing = needsEducationChoice(state);
  const intro = choosing ? collegeChoicesView() : `<section class="panel current-career"><div class="panel-heading"><h3>${labelWithHelp(current?current.name:'Choose your next role','career')}</h3>${current?`<button class="button ghost small" data-action="quit" ${blocked?'disabled':''}>Leave job</button>`:`<span class="tag">${state.education.status==='graduate'?'COLLEGE GRADUATE':'WORKING LIFE'}</span>`}</div>${current?`<p class="game-status">${state.jobYears} year${state.jobYears===1?'':'s'} in this role.</p>${jobStatFactorsView(current)}`:''}${lifestyleView()}${current?`<div class="job-metrics career-performance"><span>Job performance</span><strong>${pct(state.performance)}</strong></div>${careerProgressView(current)}${careerPotentialView(current)}`:''}</section>${housingView()}${collegeSportView()}`;
  return `${intro}<div class="panel-heading career-offer-heading"><h3>${labelWithHelp(`Your ${offers.length} job offers`,'career')}</h3><span class="tag">${JOBS.length} CAREERS</span></div><div class="job-grid">${offers.map(job => {
    const eligibility = canTakeJob(state,job); const fit = jobFit(state,job); const selected = state.jobId===job.id;
    return `<article class="job-card ${selected?'selected':''} ${!eligibility.ok&&!selected?'locked':''}" data-job-id="${esc(job.id)}"><div class="job-top"><span class="tag">${esc(job.category)}</span><span class="job-lifestyle"><small>Base Lifestyle${statEmoji('lifestyle')} </small>${lifestyleNumber(job.baseLifestyle)}<small>/10</small></span></div><h3>${labelWithHelp(job.name,'job',job.id)}</h3>${selected?'<span class="tag current-role">YOUR ROLE</span>':''}${jobStatFactorsView(job)}<div class="job-metrics"><span>Your skill fit</span><strong>${pct(fit)}</strong></div><div class="fit-track" role="meter" aria-label="Your skill fit for ${esc(job.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(fit*100)}"><span style="width:${fit*100}%"></span></div>${careerPotentialView(job)}<p class="requirement">Age ${job.minAge}+${job.requiresCollege?' · College degree':''}${Object.entries(job.requirements).length?' · '+Object.entries(job.requirements).map(([key,value])=>`${esc(skillLabel(key))} ${number(value)}+`).join(' · '):' · No skill minimum'}</p><div class="job-actions"><button class="button ${selected?'ghost':'secondary'} small" data-action="job" data-id="${esc(job.id)}" ${selected||!eligibility.ok||state.ended||state.needsSuccession?'disabled':''}>${selected?'Currently employed':'Choose career'} ${selected?icon('check'):icon('arrow')}</button>${!eligibility.ok&&!selected?`<span class="muted">${esc(formatStatNarrative(eligibility.reason,state))}</span>`:''}</div></article>`;
  }).join('')}</div>`;
}

function miniStats(person) {
  return `<div class="mini-stats">${DISPLAY_STATS.map(skill=>[skill.key,skill.label]).map(([key,label]) => `<span>${labelWithHelp(label,key)} <strong>${number(person.stats[key])}</strong></span>`).join('')}</div>`;
}

function partnerLabel(person) {
  if (person.gender==='female') return person.married?'Wife':'Girlfriend';
  if (person.gender==='male') return person.married?'Husband':'Boyfriend';
  return person.married?'Spouse':'Partner';
}

function relationshipView(person) {
  return `<div class="relationship-summary">${labelWithHelp('Relationship','relationship')}<strong>${number(person.relationship)}<small>/10</small></strong></div>${ratingBar(`Relationship with ${person.name}`,person.relationship)}`;
}

function profileStats(person, parent = false) {
  const stats = parent ? DISPLAY_STATS.filter(skill=>['health','stability'].includes(skill.key)) : DISPLAY_STATS;
  return `<div class="profile-stats">${stats.map(skill=>`<div class="profile-stat" data-skill="${skill.key}"><span>${labelWithHelp(skill.label,skill.key)}</span><span class="stat-reading"><strong>${number(person.stats[skill.key])}<small>/10</small></strong>${aptitudeBadge(person.aptitudes[skill.key],`${skill.label} natural aptitude`)}</span>${ratingBar(skill.label,person.stats[skill.key])}</div>`).join('')}${parent?'':`<div class="profile-stat"><span>${labelWithHelp('Lifestyle','lifestyle')}</span><strong>${lifestyleNumber(person.lifestyle)}<small>/10</small></strong>${ratingBar('Lifestyle',person.lifestyle)}</div>`}<div class="profile-stat"><span>${labelWithHelp('Height','height',person.id)}</span><strong aria-label="${heightDescription(person.height,person.age)}">${formatHeight(person.height,person.age)}</strong><span class="height-percentile">${heightLabel(person)}</span></div></div>`;
}

function pregnancyView() {
  if (!state.pregnancy) return '';
  const carrierName = state.pregnancy.carrierId===state.id ? 'You' : narrativeText(state.pregnancy.otherParent.name);
  return `<section class="panel pregnancy-panel"><div class="panel-heading"><h3>${labelWithHelp('Pregnancy','pregnancy')}</h3><span class="tag">EXPECTING</span></div><p class="section-description">${carrierName} · Due at your age ${state.pregnancy.dueAge}.</p></section>`;
}

function loveView() {
  if (state.age<18) return '';
  const blocked = state.pendingEvents.length>0 || state.ended || state.needsSuccession;
  if (state.partner && state.partner.alive!==false) {
    const person = state.partner;
    const proposal = proposalChance(state);
    const pregnancy = pregnancyChance(state);
    const living = person.alive!==false;
    return `<section class="panel partner-panel" data-person-id="${esc(person.id)}"><div class="panel-heading"><h3>${icon('heart')} Your life together</h3><span class="tag">${living?partnerLabel(person).toUpperCase():'REMEMBERED'}</span></div><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3>${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old · ${person.yearsTogether} year${person.yearsTogether===1?'':'s'} together</p></div></div>${birthConditionsView(person)}${relationshipView(person)}${profileStats(person)}${living?`<div class="relationship-actions">${!person.married?`<button class="button primary" data-action="propose" ${blocked||!proposal?'disabled':''}>Propose marriage <span>${pct(proposal)} chance</span></button>${labelWithHelp(person.lastProposalAge===state.age?'Already proposed this year':'Marriage','marriage')}`:'<p class="married-note">Married · A shared chapter</p>'}<div class="game-status">${labelWithHelp(state.pregnancy?'Your family is expecting.':`Pregnancy chance this year: ${pct(pregnancy)}`,'pregnancy')}</div><button class="button ghost small" data-action="breakup" ${blocked?'disabled':''}>${person.married?'End marriage':'End relationship'}</button></div>`:''}</section>${pregnancyView()}`;
  }
  const remembered=state.partner?.alive===false ? `<section class="panel remembered-partner"><div class="panel-heading"><h3>Remembering your partner</h3><span class="tag">REMEMBERED</span></div><div class="family-header"><div class="family-avatar">${avatar(state.partner,true)}</div><div class="family-meta"><h3>${esc(state.partner.name)}</h3>${genderBadge(state.partner)}<p>Died at age ${state.partner.age}</p></div></div>${birthConditionsView(state.partner)}${relationshipView(state.partner)}<details class="family-details"><summary>Your shared chapter</summary>${profileStats(state.partner)}</details></section>` : '';
  const chance = meetingChances(state);
  const anyChance = 1-Math.pow(1-chance.chance,chance.slots);
  const people = state.encounters;
  encounterIndex = Math.max(0,Math.min(encounterIndex,people.length-1));
  const person = people[encounterIndex];
  return `${remembered}${pregnancyView()}<section class="panel dating-panel"><div class="panel-heading"><h3>${labelWithHelp('People you meet','dating')}</h3><span class="tag">${people.length} AVAILABLE</span></div><div class="dating-chances"><span>Chance of meeting someone next year <strong>${pct(anyChance)}</strong></span><span>Up to <strong>${chance.slots}</strong> people with your current appeal</span></div>${people.length?`<div class="encounter-list" data-total="${people.length}">${people.length>1?`<div class="encounter-pagination"><button class="button ghost small" data-action="prospect-page" data-delta="-1" aria-label="Previous person" ${encounterIndex===0?'disabled':''}>Back</button><span>${encounterIndex+1} of ${people.length}</span><button class="button ghost small" data-action="prospect-page" data-delta="1" aria-label="Next person" ${encounterIndex===people.length-1?'disabled':''}>Next</button></div>`:''}<article class="encounter-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3 tabindex="-1">${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old</p></div></div>${birthConditionsView(person)}${profileStats(person)}<div class="encounter-actions"><button class="button primary" data-action="encounter" data-choice="relationship" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Pursue a relationship <span>${pct(relationshipOdds(state,person))} chance</span></button><button class="button secondary" data-action="encounter" data-choice="casual" data-id="${esc(person.id)}" ${blocked?'disabled':''}>One-night stand <span>${pct(oneNightChance(state,person))} mutual interest</span></button><button class="button ghost" data-action="encounter" data-choice="ignore" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Ignore</button></div></article></div>`:`<div class="empty-state">${icon('heart')}<h4>No new connection this year</h4></div>`}</section>`;
}

function connectionNotice() {
  if (state.age<18 || state.ended || state.needsSuccession) return '';
  if (state.pregnancy) return `<button class="connection-notice button secondary" data-action="tab" data-tab="family">${icon('heart')} A baby is on the way · Family ${icon('arrow')}</button>`;
  if (state.encounters.length) return `<button class="connection-notice button secondary" data-action="tab" data-tab="family">${icon('heart')} ${state.encounters.length} new connection${state.encounters.length===1?'':'s'} · Meet them ${icon('arrow')}</button>`;
  return '';
}

function retirementNotice() {
  if (state.age<65 || state.needsSuccession || state.ended) return '';
  return `<button class="retirement-notice button secondary" data-action="tab" data-tab="family">${icon('family')} Ready for your next chapter? Retire ${icon('arrow')}</button>`;
}

function retirementView() {
  const info = successionInfo(state);
  if (state.age<65 && !state.needsSuccession) return `<section class="panel retirement-panel"><div class="panel-heading"><h3>${labelWithHelp('What carries forward','inheritance')}</h3><span class="tag">AGE 65</span></div>${lifestyleView()}</section>`;
  const titles = {children:state.alive===false?'Continue in the next generation':'Retire into the next generation',siblings:'Keep the story in your family',beneficiary:'A new family, your legacy'};
  return `<section class="panel retirement-panel" data-route="${info.route}"><div class="panel-heading"><h3>${labelWithHelp(titles[info.route],'inheritance')}</h3><span class="tag">${state.needsSuccession?'NEXT CHAPTER':'RETIREMENT'}</span></div>${!info.eligible?`<p class="game-status retirement-blocked">${esc(info.reason)}</p>`:''}<div class="heir-list">${info.candidates.map(person=>`<article class="heir-candidate ${info.route==='beneficiary'?'beneficiary-preview':''}" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${info.route==='children'?'YOUR CHILD':info.route==='siblings'?'YOUR SIBLING':'A NEW BEGINNING'}</span><h3>${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old · ${esc(person.familyName)} family</p></div></div>${birthConditionsView(person)}${info.route==='beneficiary'?profileStats(person):`<details class="family-details"><summary>Skills & wellbeing</summary>${miniStats(person)}</details>`}<button class="button primary" data-action="heir" data-id="${esc(person.id)}" ${info.eligible?'':'disabled'}>${state.alive===false?'Continue':'Retire'} & play as ${esc(person.name.split(' ')[0])} ${icon('arrow')}</button></article>`).join('')}</div></section>`;
}

function personCard(person, role, child = false, parent = false) {
  const parentJob = parent ? JOBS.find(job=>job.id===person.career?.jobId) : null;
  const employment = {employed:'Employed',unemployed:'Unemployed',retired:'Retired'}[person.career?.status] || 'Employed';
  const showLifestyle = !parent || hasFame(state) && state.age<18 && caregivers(state).some(caregiver=>caregiver.id===person.id);
  return `<article class="family-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${esc(role)}</span><div class="profile-name-row"><h3>${esc(person.name)}</h3>${genderBadge(person)}</div><p>${person.age} years old${person.abandonedAt!=null?' · Left the family':person.guardianRole&&person.alive!==false?' · Guardian':''}${person.alive===false?' · Remembered':''}</p></div></div>${birthConditionsView(person)}${!showLifestyle?'':`<p class="family-lifestyle">${labelWithHelp('Lifestyle','lifestyle')} <strong>${lifestyleNumber(familyLifestyle(state,person))}/10</strong>${person.age<18?' · Family household':''}</p>`}${parent?`<div class="parent-career"><span>${labelWithHelp('Career focus','parent-career')} <strong>${person.career?.focus ?? 0}/5</strong></span><span class="employment-status">${employment}</span></div>`:''}${parentJob?`<div class="parent-career-role"><strong>${labelWithHelp(parentJob.name,'job',parentJob.id)}</strong>${careerPotentialView(parentJob)}</div>`:''}${Number.isFinite(person.relationship)?relationshipView(person):''}<details class="family-details" ${parent?'open':''}><summary>${parent?'Wellbeing':'Skills & wellbeing'}</summary>${profileStats(person,parent)}</details>${child&&person.alive===false?'<div class="family-card-footer"><span>Remembered with love</span></div>':''}</article>`;
}

function parentsView() {
  if (!familyCareProfiles().length) return '';
  return `<details class="panel roots-panel" ${state.age<18?'open':''}><summary>The people who raised you</summary><div class="stat-help-links">${labelWithHelp('Parents','parents')}</div><div class="family-grid">${familyCareProfiles().map(person=>personCard(person,parentLabel(person),false,true)).join('')}</div></details>`;
}

function familyView() {
  const childAllowed = !state.pendingEvents.length && state.age>=18 && state.children.length<(state.pregnancy?5:6) && state.lastChildAge!==state.age && !state.ended && !state.needsSuccession;
  return `${state.age>=65||state.needsSuccession?retirementView():''}${datingPotentialView()}${loveView()}${parentsView()}
    <section class="panel"><div class="panel-heading"><h3>${labelWithHelp('The next generation','children')}</h3><button class="button secondary small" data-action="child" ${childAllowed?'':'disabled'}>${icon('plus')} Adopt a child</button></div>${state.age<18?'<p class="game-status">Parenthood · Age 18+</p>':state.lastChildAge===state.age?'<p class="game-status">A new arrival this year.</p>':''}${state.children.length?`<div class="family-grid child-grid">${state.children.map(c=>personCard(c,'YOUR CHILD',true)).join('')}</div>`:`<div class="empty-state">${icon('family')}<h4>A branch yet to grow</h4></div>`}</section>
    ${state.age<65&&!state.needsSuccession?retirementView():''}
    ${state.siblings.length?`<section class="panel"><div class="panel-heading"><h3>${labelWithHelp('Your siblings','inheritance')}</h3><span class="tag">FAMILY</span></div><div class="family-grid sibling-grid">${state.siblings.map(person=>personCard(person,'YOUR SIBLING')).join('')}</div></section>`:''}
    ${state.lineage.length?`<section class="panel"><div class="panel-heading"><h3>Those who came before</h3><span class="tag">${state.lineage.length} CHAPTERS</span></div><div class="legacy-list">${state.lineage.map(p=>`<div class="legacy-card"><strong>${esc(p.name)}</strong><span>Generation ${esc(p.generation ?? '—')} · Age ${esc(p.age ?? '—')}</span></div>`).join('')}</div></section>`:''}`;
}

function endPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>A life, fully lived.</h3><span class="tag">AGE ${state.age}</span></div><p class="section-description">${narrativeText(state.name)}’s story has come to a close. </p><button class="button primary" data-action="new">Begin another story ${icon('arrow')}</button></section>`;
}

function successionPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>The story goes on.</h3><span class="tag">NEXT GENERATION</span></div><p class="section-description">${state.alive===false?`${narrativeText(state.name)} died at age ${state.age}.`:'This playable chapter closes at age 85.'} Choose your next character in Family.</p><button class="button primary" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></section>`;
}

function toast(message, error = false) {
  clearTimeout(toastTimer);
  document.querySelector('#toast-root').innerHTML = `<div class="toast ${error?'error':''}">${icon(error?'help':'check')}<span>${esc(formatStatNarrative(message,state))}</span></div>`;
  toastTimer = setTimeout(()=>{document.querySelector('#toast-root').innerHTML='';},4500);
}

function openModal(title, body, actions = '', locked = false) {
  showingYearSummary = false;
  modalLocked = locked;
  if (!modalRoot.firstElementChild) modalReturnFocus = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${title}</h2>${locked?'':`<button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button>`}</div><div class="modal-body">${body}</div>${actions?`<div class="modal-actions">${actions}</div>`:''}</section></div>`;
  document.body.style.overflow='hidden';
  app.setAttribute('inert', '');
  (modalRoot.querySelector('input') || modalRoot.querySelector('button'))?.focus();
}

function closeModal() {
  if (modalLocked) return;
  const wasYearSummary=showingYearSummary;
  if (wasYearSummary) { dismissYearSummary(state); save(); showingYearSummary=false; }
  modalRoot.innerHTML='';
  document.body.style.overflow='';
  app.removeAttribute('inert');
  if (wasYearSummary) {
    const target=app.querySelector('#event-title') || app.querySelector('.bottom-dock .advance-button');
    target?.focus({preventScroll:true});
  } else modalReturnFocus?.focus({preventScroll:true});
}

function menuModal() {
  openModal('Your story', `<div class="menu-list"><button data-action="help">${icon('help')} How to play ${icon('arrow')}</button><button data-action="odds">${icon('spark')} This year’s odds ${icon('arrow')}</button><button data-action="export">${icon('download')} Export save ${icon('arrow')}</button><button data-action="import">${icon('year')} Import save ${icon('arrow')}</button><button data-action="new">${icon('plus')} Start a new life ${icon('arrow')}</button></div><p class="menu-note">${saveAvailable?'Saved on this device. Export to back up or move it.':'Saving unavailable. Export before leaving.'}</p>`);
}

function newLifeModal(initial = false) {
  openModal(initial?'A new life':'Begin a new family?', `${initial?'':'<p class="section-description">This replaces your saved life.</p>'}<label class="field-label" for="new-surname">Family surname <span class="muted">(optional)</span></label><input class="text-input" id="new-surname" maxlength="30" placeholder="Random if blank" autocomplete="family-name" autocapitalize="words"><label class="field-label" for="new-name">First name <span class="muted">(optional)</span></label><input class="text-input" id="new-name" maxlength="19" placeholder="Random if blank" autocomplete="given-name" autocapitalize="words">`, `${initial?'':'<button class="button secondary" data-action="close">Cancel</button>'}<button class="button primary" data-action="confirm-new">Begin ${icon('arrow')}</button>`, initial);
}

function navigate(tab) {
  if (!['year','career','family'].includes(tab)) return;
  if (modalRoot.firstElementChild) closeModal();
  activeTab = tab;
  render();
  window.scrollTo?.({top:0,behavior:'instant'});
  app.querySelector(`.nav-button[data-tab="${tab}"]`)?.focus({preventScroll:true});
}

function topicHelpModal(topic, id) {
  const help = {
    stats: ['Your stats', ['Ratings range from 0.0 to 10.0. Before 18, ability ratings compare you with others your age: high infant intelligence means strong natural potential. Activities, care, events and aging cause rating changes. Yearly focus contributions now have half their previous magnitude, including losses. Low ratings and aptitude change the size of those effects; they do not create passive growth.']],
    intelligence: ['Intelligence', ['Reasoning ability for your age; school and mental practice can strengthen it.']],
    strength: ['Strength', ['A 7.0/10 baby is strong for a baby. Exercise can maintain or raise this rating; inactivity can lower it.']],
    social: ['Social', ['Ease with people for your age; social practice can improve it.']],
    creativity: ['Creativity', ['Creative potential for your age, shaped by exploration and practice.']],
    attractiveness: ['Attractiveness', ['Starts near its adult value. During school years, Yourself focus can improve or reduce it, with aging losses after 30 for men and 22 for women.']],
    affinity: ['Natural aptitude', ['Generated base aptitude ranges from −3 to +3. Perks can take the total beyond that range, and the affinity badge already includes their effects. Each perk lists only its own contribution. Aptitude affects starting ability and responsiveness to activity or care; higher is stronger. Aptitude alone never changes a rating. Health and mental stability aptitude improve routine gains and soften losses. Rare experiences shaped by another stat can raise or lower aptitude by one. Birth profiles describe individual tendencies and support needs, not fixed outcomes or medical diagnoses. Conditions can involve many genes and environmental influences; bipolar predisposition is a risk, not an illness diagnosed at birth. Autism and specific learning disabilities do not determine general intelligence.']],
    forecast: ['Expected changes', ['Signs compare increases and decreases with the other choices for that stat. Zero changes are hidden. Infant stats show crying effects; adult stats show routine changes. Activities, care, events and aging cause changes. Yearly variation changes the size of routine effects without reversing them.']],
    health: ['Health', ['Self-care supports health; illness and aging reduce it. Poor health raises disease risk and reduces childhood height gains.']],
    stability: ['Mental stability', ['Higher means calmer; rest and relationships help. Low ratings increase disruptions; 2 or less can unlock major crises. Ratings of 7 or more unlock supportive opportunities. Treatment and recovery events can help at low ratings. These rules also apply to parental events affecting your childhood.']],
    lifestyle: ['Lifestyle', ['Until 18, you share your parents’ or guardian’s changing household lifestyle. As an adult, work, family and inheritance shape it. Temporary support also helps. The logarithmic scale makes 9.9 to 10.0 far harder than an ordinary tenth. Gains slow near 10; losses slow near 0.']],
    height: ['Height', ['Final height emerges from yearly growth shaped by age, inheritance, health and chance, ending at 14–18. Poor health reduces new growth, never existing height.', 'Compared with Health 5, Health 3–4 costs roughly one height percentile point per growing year near average height.']],
    cry: ['Cry level', ['Less crying lowers your intelligence and mental stability; more crying raises them. Strength is unaffected. Parent relationships tend to fall at levels 1–2, stay steady at 3, and rise at 4–5, with yearly variation. Harder crying strains their mental stability more.']],
    focus: ['Your focus', [state.age>=5 && state.age<18 ? `Share ${focusBudget(state)} points. School, Friends, Family and Yourself use 0–4, neutral at 2. Sports and Extracurriculars unlock after signup and use 0–2, starting at 1. Events can stack capacity changes or require minimum points; perks and enrollment still set limits. More focus can increase related activity event chances.` : `Share ${focusBudget(state)} points across ${Object.keys(state.focus).length} focuses, up to ${MAX_FOCUS} each. The default 2 in each adds no focus-driven stat changes. Events can stack capacity changes or require minimum points; perks still set limits. More focus can increase related activity event chances.`, state.age>=5 && state.age<18 ? 'Most core effects show one sign at 1 or 3 points and three at 0 or 4. School Intelligence shows two signs at 1/3 and three at 0/4; School Creativity shows one and two. Active training gives + at 1 point and ++ at 2. Without participation, Sports gives - Strength and - Social; Extracurriculars gives - Creativity and - Intelligence. Aptitude, current ratings and events affect the final result.' : 'Points 1 and 3 show one sign per effect; 0 and 4 are three times as strong and show three. Combined effects can reach six signs. Aptitude and current ratings shape activity effects; events and aging can add changes. Zero effects are hidden.']],
    'toddler-focus': ['Toddler activities', [`Share ${focusBudget(state)} points among five activities, up to 4 each. The default 2 in each adds no activity-driven stat changes. Events can stack capacity changes or require minimum points; perks still set limits.`, 'Most effects show one sign at 1 or 3 points and three at 0 or 4. Arts & crafts Intelligence shows one minus at 0, no effect at 1–3, and one plus at 4. Electronics Intelligence uses ----, --, none, ++, ++++ at 0 to 4 points; Social uses ++, +, none, -, --. Aptitude and current ratings shape activity effects; events and aging can add changes. Zero effects are hidden.']],
    ...Object.fromEntries(toddlerFocusRows.map(([key,label]) => [`toddler-${key}`, [label,
      toddlerActivityImpacts(key).map(({stat,change,level,target}) => `${(change>0?'+':'-').repeat(level)}${target==='parents'?(caregivers(state).some(person=>person.guardianRole)?'Guardian relationship':'Parent relationships'):skillLabel(stat)}`)
    ]])),
    'focus-work': ['School & career focus', [state.age<18 ? 'School develops Intelligence and Creativity, with less social practice and more strain. More study focus can increase study event chances.' : 'Study and work exercise relevant abilities; career focus also supports performance and lifestyle.']],
    'focus-social': ['Friends focus', ['Can improve social, support mental stability and create chances to meet people.']],
    'focus-family': ['Family focus', ['Strengthens relationships, helps children develop and supports parents’ mental stability.']],
    'focus-self': ['Yourself focus', [state.age<18 ? 'Personal care supports Attractiveness, mental stability and Health.' : 'Exercise, learning and self-care support strength, creativity, health and mental stability.']],
    'school-gpa': ['School GPA', ['Study effort sets your yearly grade, with Intelligence adjusting it. Higher Intelligence can achieve the same grade with less study. The grade updates after each school year.', 'Good and poor grades can lead to family events. Your first grade arrives after completing your first school year. Expected GPA previews your next report with the current study focus and Intelligence.']],
    'focus-sports': ['Sports focus', ['Higher Lifestyle brings more frequent offers and more options. Sports and extracurriculars can both be offered in a year. Keep or leave your current activity even when no new ones are offered. Sign up to unlock 0–2 points, starting at 1. Every sport trains Strength and Social; some train an extra skill. Active training gives + at 1 point and ++ at 2. No sport, paused participation, or 0 points gives - Strength and - Social only. Success is N/A until your first year of participation, then graded F- through A+ based on abilities, focus and chance. Expected success estimates your next grade from current abilities, focus and success; chance can change the result. Performance varies by sport: endurance sports reward Health, archery rewards Mental stability, orienteering rewards Intelligence, and figure skating rewards Creativity. Wrestling rewards shorter height; swimming and basketball reward taller height for your age. Switching returns success to N/A.']],
    'focus-extracurricular': ['Extracurriculars focus', ['Higher Lifestyle brings more frequent offers and more options. Sports and extracurriculars can both be offered in a year. Keep or leave your current activity even when no new ones are offered. Sign up to unlock 0–2 points, starting at 1. Each activity trains its listed stats, with + at 1 point and ++ at 2. No extracurricular or 0 points gives - Creativity and - Intelligence only. Success is N/A until your first year of participation, then graded F- through A+ based on abilities, focus and chance. Expected success estimates your next grade from current abilities, focus and success; chance can change the result. Keep your activity or switch and return success to N/A.']],
    parents: ['Parents & guardians', ['Their wellbeing and careers affect your childhood. Gains need care, activity or an event. Low ratings amplify existing gains; they do not recover by themselves. Zero Family time contributes a loss. Low mental stability can disrupt care; 2 or less unlocks major crises with larger effects on you. High stability can bring lasting support, and help can support recovery.', 'Low mental stability and a weak relationship raise the rare chance of abandonment. The other parent takes over; if neither can care for you, an adult relative adopts you. Departures cause severe setbacks.']],
    'parent-career': ['Parents’ careers', ['The listed job uses its relevant abilities, career focus and experience to shape progress. Its advancement potential and career Lifestyle ceiling limit the path within that role. Job loss can set household support back; a new job can help rebuild it.']],
    relationship: ['Relationship', ['Higher means closer; family time and shared events change this rating. Partners support social and mental stability, but lower lifestyle.']],
    career: ['Careers', ['Each role uses its listed stats for success. +3 means central, +2 important and +1 useful; these are job demands, not automatic stat gains. Career focus and experience also affect performance.', 'Advancement potential describes the breadth of opportunities within a role. Career progress records how far you have developed along that path. A high ceiling is an opportunity, not a promised result.', 'Base Lifestyle is the role’s reference level before your performance and progress. The career ceiling limits support from that job; savings, inheritance, Fame and household responsibilities can make your actual Lifestyle different. Start working at 18 or after college.']],
    college: ['College or career', ['Your final school grades influence college admissions. Excellent grades, sport or extracurricular success can earn partial or full scholarships. Parents’ means and willingness to help shape affordability.', 'Colleges take four years. Your personal contribution is reserved for the full course when you enroll. More demanding courses need more study for the same grade and generally lead to stronger career opportunities. College and grades influence the number and quality of job offers, but every career remains possible with the necessary qualifications.', 'You can skip college and choose a job immediately. Trades offer practical routes with their own advancement paths.']],
    'college-grades': ['College GPA', ['Your college GPA records your completed years. Study focus and Intelligence shape each year’s grade; a harder college needs more effort for the same result. Expected yearly grade previews the next completed year, with chance able to change the result.', 'Grades and college career potential influence your graduate offers. A weaker record gives fewer and generally lower-potential opportunities, but it never rules out a particular career by itself.']],
    'college-sports': ['College sports', ['Join a college sport while sharing your adult focus budget. Teams provide facilities, including for sports you did not play at school. College success begins unrated and is much harder to earn than high-school success. Strong abilities and consistent training matter; ordinary school success rarely translates into top college results.', 'After four college seasons, exceptional athletes have a small chance of a professional opportunity. College performance can also bring an invitation to pursue fame. Fame starts only if you accept.']],
    housing: ['Housing', ['Work or sufficient reserves support independent housing. College funding includes a place to live. If you cannot support yourself, a willing parent or guardian with a good relationship may offer up to three years at home.', 'Family support can help mental wellbeing, while limited privacy reduces social and dating opportunities. Without stable housing, sustained disruption harms Health, Social and mental stability and reduces opportunities to meet people. Housing is checked as your circumstances change.']],
    children: ['Children', ['Adults can have up to six children, with one adoption per year. Family time helps them develop; dependent children lower lifestyle.']],
    dating: ['People you meet', ['Dating potential affects your chance of meeting someone and the typical qualities of new prospects. Height, Attractiveness and Lifestyle have the most weight; the other six ratings also contribute. Focus, housing and individual preferences still matter. Invitations expire next year or when a relationship starts, and either approach can be declined.']],
    'dating-potential': ['Dating potential', ['Height, Attractiveness and Lifestyle each carry one full share. Intelligence, Strength, Social, Creativity, Health and Mental stability each carry one fifth of a share. The result is a weighted average from 0 to 10, using your current effective ratings.', 'Height uses your percentile among adults with the same growth profile, translated onto the 0-10 scale. Higher dating potential improves meeting chances and the typical qualities of new prospects. Chance and individual preferences still matter; no score guarantees a meeting or mutual attraction.']],
    marriage: ['Marriage', ['Propose once per year; a closer relationship and more years together improve acceptance.']],
    pregnancy: ['Pregnancy', ['Age, health and pregnancy capability affect the odds; marriage makes it more likely. A baby arrives the next year.']],
    inheritance: ['Retirement & inheritance', ['Succession opens at 65 or on death and is required at 85; choose a child, sibling or unrelated child, in that order. Eligible children share inheritance equally; otherwise the chosen heir receives it.']]
  };
  let entry = help[topic];
  if(topic==='college-option') {
    const college=collegeById(id);
    if(college) entry=[college.name,[college.description,`Academic difficulty ${number(college.difficulty)}/10; career potential ${number(college.careerPotential)}/10. A more demanding course needs more study for the same grade.`, 'Scholarships reduce the required college Lifestyle. Family and personal resources are combined before being translated onto the Lifestyle scale, so the displayed contribution ratings do not add together.', 'Offers and scholarships are saved; viewing this screen or reloading cannot reroll them.']];
  }
  if(state.education.status==='college' && topic==='focus-work') entry=['College focus',help['college-grades'][1]];
  if(state.education.status==='college' && state.education.sport && topic==='focus-sports') entry=help['college-sports'];
  if (topic==='fame') entry=['Fame',[
    `Maintain fame through ${focusLabel(fameFocusKey(state))} focus. More focus builds your rating; too little lowers it. Fame can end each year (${pct(fameLossChance(state.fame?.rating))} at your current rating). Lower ratings increase that risk.`,
    'Fame adds +5 Social learning ability, separately from natural aptitude. High fame and contracts support household Lifestyle. Support strength has a smaller effect near the limits of the Lifestyle scale. Leaving fame ends these bonuses.'
  ]];
  if (topic==='social' && id===state.id && hasFame(state)) entry=[entry[0],[...entry[1],'+5 Social learning ability from fame is separate from natural aptitude. The bonus ends when fame ends.']];
  if (hasFame(state) && topic==='focus') entry=[entry[0],[...entry[1].map(text=>text.replace('use 0–2, starting at 1','normally use 0–2, starting at 1')),state.fame.kind==='personal'?'Yourself focus also maintains personal fame.':`Your famous ${focusLabel(fameFocusKey(state))} activity allows up to 3 points and continues after school.`]];
  if (hasFame(state) && state.fame.kind!=='personal' && state.age>=18 && topic==='focus') entry[1][0]=`Share ${focusBudget(state)} points. Core focuses use 0–4, neutral at 2. Your famous ${focusLabel(fameFocusKey(state))} activity uses 0–3. Events and perks can restrict these limits.`;
  if (hasFame(state) && topic===`focus-${fameFocusKey(state)}`) entry=[entry[0],state.fame.kind==='personal'?[...entry[1],'Yourself focus also maintains personal fame. Two points are neutral; higher builds fame and lower reduces it.']:['Your famous activity continues after school, using 0–3 focus points. Points 0–1 reduce fame; 2–3 build it. Training and success still follow your activity. Expected success estimates the next grade; chance can change the result. Leaving or switching the activity ends its fame.']];
  if (state.education.status==='college' && state.education.sport && topic==='focus') {
    entry[1][0]=`Share ${focusBudget(state)} points. Core focuses use 0-4, neutral at 2. College sports use 0-${focusMaxFor(state,'sports')}, starting at 1, within the same budget.${hasFame(state) && state.fame.kind==='extracurricular'?' Your famous extracurricular also shares this budget and allows up to 3 points.':''} Events and perks can restrict limits or require minimum points.`;
    entry[1][1]='Core effects use the usual neutral-two scale. College sport training gives positive contributions with active focus; zero points gives Strength and Social inactivity losses. College success uses its more demanding competition scale. Aptitude, current ratings and chance shape the result.';
  }
  if (state.education.status==='college' && state.education.sport && hasFame(state) && state.fame.kind==='sports' && topic==='focus-sports') entry[1]=[...help['college-sports'][1],...entry[1]];
  if(topic==='height' && id===state.id && state.age<18) entry=[entry[0],[...entry[1],'Percentile compares simulated heights at your age.']];
  if (topic==='job') {
    const job = JOBS.find(candidate=>candidate.id===id);
    if (job) entry = [job.name,[job.description,'+3 marks a core skill; skill fit reflects your current match. The listed stats influence success rather than providing automatic gains.',job.advancementDescription,`Base career Lifestyle ${lifestyleNumber(job.baseLifestyle)}/10. Career Lifestyle ceiling ${lifestyleNumber(job.maxLifestyle)}/10. Performance and progress shape the support from this role; savings, inheritance and Fame are separate.`].filter(Boolean)];
  }
  if (topic==='career-potential' || topic==='career-progress') {
    const job=JOBS.find(candidate=>candidate.id===id);
    if (job) entry=topic==='career-potential'
      ? ['Advancement potential',[job.advancementDescription,`This role has advancement potential ${number(job.advancementPotential)}/10 and a career Lifestyle ceiling of ${lifestyleNumber(job.maxLifestyle)}/10. These describe the opportunities within the role, not a guaranteed outcome. Skills, focus and accumulated progress shape what you achieve.`, 'The career ceiling limits support from this job. Your household Lifestyle can differ because of savings, inheritance, Fame and family responsibilities.']]
      : ['Career progress',['Progress measures advancement within your current role. Stronger performance supports progress; a change of role starts a new path. Progress within a role is separate from its advancement potential.']];
  }
  if (!entry) return;
  if (DISPLAY_STATS.some(stat=>stat.key===topic)) entry=[entry[0],[...entry[1],'The affinity badge already includes perk effects. Generated base aptitude ranges from −3 to +3; perks can take the total beyond that range. Each perk lists only its own contribution.']];
  if (id===state.id && DISPLAY_STATS.some(stat=>stat.key===topic)) entry=[entry[0],[...entry[1],'Changes need activity, care, events or aging. Low ratings amplify existing gains without creating them. Gains slow near 10; losses slow near 0. Perk affinities adjust natural aptitude, not current ratings.']];
  if (id===state.id) entry=[entry[0],[...entry[1],...statEffects(topic).map(({effect,amount})=>`${effect.name}: ${signedModifier(amount)} ${skillLabel(topic)} (${effect.years} year${effect.years===1?'':'s'} remaining)`)]];
  openModal(esc(entry[0]),`${entry[1].map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}`);
  modalRoot.querySelector('.modal').classList.add('help-popup');
  modalRoot.querySelector('.modal').setAttribute('aria-describedby','topic-help-content');
  modalRoot.querySelector('.modal-body').id='topic-help-content';
  modalRoot.querySelector('.modal-backdrop').classList.add('help-popup-backdrop');
}

function helpModal() {
  openModal('How to play', `<div class="help-grid"><div class="help-item"><h4>Babies</h4><p>At ages 0–1, choose a cry level from 1–5.</p></div><div class="help-item"><h4>Each year</h4><p>Share 10 points as a toddler or school student, and 8 as an adult. Core focuses use 0–4 points, starting at 2. Conditions can change your budget.</p></div><div class="help-item"><h4>School</h4><p>Study and Intelligence determine your yearly GPA. Lifestyle affects how often sports and extracurriculars are offered and how many choices you get. Both can arrive in the same year. Keep or leave an existing activity when no offers arrive; both use 0–2 points, starting at 1.</p></div><div class="help-item"><h4>Stats</h4><p>Activities, care, events and aging cause rating changes. Natural aptitude shapes responses; ratings do not drift on their own. Tap ? for details.</p></div><div class="help-item"><h4>Events</h4><p>Age, focus, grades and stats affect random events; some require a choice.</p></div><div class="help-item"><h4>Work</h4><p>At 18, choose work or four years of college.</p></div><div class="help-item"><h4>Family</h4><p>Build relationships, raise children and choose an heir when your chapter ends.</p></div></div>`, '<button class="button primary" data-action="close">Got it</button>');
}

function oddsModal() {
  const odds = eventOdds(state).filter(event=>event.chance>0).sort((a,b)=>b.chance-a.chance);
  const quiet = odds.reduce((chance,event)=>chance*(1-event.chance),1);
  const mortality = mortalityOdds(state);
  openModal('Yearly odds', `<p class="section-description">Each event rolls separately; at most five occur per year. Low ratings can increase related event chances. Events without possible effects are excluded; outcomes that would change nothing when they resolve are skipped. Major crises remain rarer. School activity offers and death risks roll separately.</p><div class="chance-summary"><span>No events<strong>${(quiet*100).toFixed(1)}%</strong></span><span>At least one event<strong>${((1-quiet)*100).toFixed(1)}%</strong></span></div><details class="event-odds"><summary>${odds.length} possible events</summary><div class="odds-list">${odds.map(event=>`<div class="odds-row"><span>${journalText(event.name)}${EVENTS.find(candidate=>candidate.id===(event.eventId || event.id))?.choices?'<small>Choice</small>':''}${eventImpactTag(EVENTS.find(candidate=>candidate.id===(event.eventId || event.id)))}</span><strong>${(event.chance*100).toFixed(2)}%</strong></div>`).join('')}</div></details><details class="mortality-odds"><summary>Annual death risks</summary><p class="form-note">Age-based game estimates; poor health raises disease risk, and adult mental stability affects accident risk.</p><div class="odds-list">${mortality.map(person=>`<div class="mortality-row"><span>${esc(person.name)}<small>Disease ${(person.disease*100).toFixed(3)}% &middot; Accident ${(person.accident*100).toFixed(3)}%</small></span><strong>${(person.total*100).toFixed(3)}%</strong></div>`).join('')}</div></details>`);
}

function update(action, successMessage) {
  const result = action();
  if (result?.ok===false) { toast(result.reason || 'That choice isn’t available yet.',true); return; }
  save(); render();
  if (successMessage) toast(successMessage);
  return result;
}

document.addEventListener('click', event => {
  if (event.target.classList?.contains('modal-backdrop')) { closeModal(); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const {action} = button.dataset;
  if (mustNameFamily && action!=='confirm-new') return;
  if (action==='tab') navigate(button.dataset.tab);
  if (action==='menu') menuModal();
  if (action==='review-event') focusEventDecision();
  if (action==='event-choice') {
    const result = update(()=>resolveEventChoice(state,button.dataset.choice,button.dataset.event,button.dataset.subject || undefined));
    if (result?.ok) {
      if (state.pendingEvents.length) focusEventDecision();
      else { navigate('year'); toast('Choice saved.'); }
    }
  }
  if (action==='education') {
    update(()=>chooseEducation(state,button.dataset.path,button.dataset.college),button.dataset.path==='college'?'Started college.':'Your working life begins.');
    if (state.education.status==='college') navigate('year');
  }
  if (action==='college-sport-options') collegeSportChoicesModal();
  if (action==='college-sport-join') {
    const result=update(()=>joinCollegeSport(state,button.dataset.id),'College sport joined.');
    if (result?.ok) closeModal();
  }
  if (action==='college-sport-leave') update(()=>leaveCollegeSport(state),'College sport left.');
  if (action==='baby') {
    update(()=>setCryLevel(state,Number(button.dataset.level)));
    app.querySelector(`[data-action="baby"][data-level="${button.dataset.level}"]`)?.focus({preventScroll:true});
  }
  if (action==='focus') {
    const {key,delta} = button.dataset;
    update(()=>setFocus(state,key,(state.focus[key] ?? 0)+Number(delta)));
    app.querySelector(`[data-action="focus"][data-key="${key}"][data-delta="${delta}"]`)?.focus({preventScroll:true});
  }
  if (action==='school-offers') schoolOffersModal(button.dataset.kind);
  if (action==='school-enroll') {
    const result=update(()=>enrollSchoolActivity(state,button.dataset.kind,button.dataset.id));
    if (result?.ok) { closeModal(); toast('Activity joined.'); }
  }
  if (action==='school-leave') {
    const result=update(()=>leaveSchoolActivity(state,button.dataset.kind));
    if (result?.ok) { closeModal(); toast('Activity left.'); }
  }
  if (action==='advance') {
    encounterIndex=0;
    const result = update(()=>advanceYear(state));
    if (!result?.ok) return;
    yearSummaryModal();
    if (showingYearSummary) return;
    if (state.pendingEvents.length) { focusEventDecision(); return; }
    if (!state.ended&&!state.needsSuccession) app.querySelector('[data-action="advance"]')?.focus({preventScroll:true});
    toast(state.ended?'A life complete. Your journal is saved.':state.needsSuccession?'It’s time to choose the next generation.':`Hello, ${state.age}. A new year begins.`);
  }
  if (action==='prospect-page') {
    encounterIndex+=Number(button.dataset.delta); render();
    app.querySelector('.encounter-card h3')?.focus({preventScroll:true});
  }
  if (action==='encounter') {
    const choice=button.dataset.choice;
    const result=update(()=>respondToEncounter(state,button.dataset.id,choice));
    if (result?.ok) toast(choice==='ignore'?'You leave that invitation behind.':result.accepted?choice==='relationship'?'A relationship begins.':'You share a brief connection.':'The interest is not mutual this time.');
  }
  if (action==='propose') {
    const result=update(()=>proposeMarriage(state));
    if (result?.ok) toast(result.accepted?'You are married.':'Not yet. Try again next year.');
  }
  if (action==='breakup' && state.partner) {
    openModal('End this relationship?', '<p>Leave <strong>'+narrativeText(state.partner.name)+'</strong>? Children and any pregnancy remain.</p>', '<button class="button secondary" data-action="close">Stay together</button><button class="button primary" data-action="confirm-breakup">End relationship</button>');
  }
  if (action==='confirm-breakup') { closeModal(); update(()=>endRelationship(state),'Your relationship has ended.'); }
  if (action==='job') update(()=>takeJob(state,button.dataset.id),'A new chapter in your career.');
  if (action==='quit') update(()=>quitJob(state),'You’ve made room for a new path.');
  if (action==='quit-fame') update(()=>quitFame(state),'You have left the spotlight.');
  if (action==='child') update(()=>haveChild(state),'Welcome to the family, little one.');
  if (action==='heir') {
    const info = successionInfo(state);
    const child = info.candidates.find(person=>person.id===button.dataset.id);
    if (!child || !info.eligible) return;
    const heirName=info.route==='beneficiary'?esc(`${child.name} (Heir)`):narrativeText(child.name);
    const inheritance = info.route==='children'?'Living children receive equal shares.':info.route==='siblings'?'Your sibling receives the inheritance.':'This child inherits; their surname remains '+esc(child.familyName)+'.';
    openModal(state.alive===false?'Continue their legacy?':'Retire and continue?', `<p>Play as <strong>${heirName}</strong>, age ${child.age}, ending this chapter.</p><p>${inheritance}</p>`, `<button class="button secondary" data-action="close">Back</button><button class="button primary" data-action="confirm-heir" data-id="${esc(child.id)}">${state.alive===false?'Play next chapter':'Retire & continue'} ${icon('arrow')}</button>`);
  }
  if (action==='confirm-heir') { closeModal(); activeTab='year'; update(()=>succeed(state,button.dataset.id),'A new generation. The same story.'); }
  if (action==='history') { showAllHistory=!showAllHistory; render(); }
  if (action==='topic-help') { topicHelpModal(button.dataset.topic,button.dataset.id); modalReturnFocus=button; }
  if (action==='help') helpModal();
  if (action==='odds') oddsModal();
  if (action==='close') closeModal();
  if (action==='new') newLifeModal();
  if (action==='confirm-new') {
    const surname=normalizeSurname(modalRoot.querySelector('#new-surname').value);
    const firstName=modalRoot.querySelector('#new-name').value.trim();
    state=createGame({surname,firstName}); mustNameFamily=false; modalLocked=false;
    activeTab='year'; showAllHistory=false; encounterIndex=0; closeModal(); save(); render(); toast('Welcome to the '+state.familyName+' family.');
  }
  if (action==='export') {
    closeModal();
    const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href=url; link.download=`lifelines-generation-${state.generation}-age-${state.age}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),5000); toast('Your story has been exported.');
  }
  if (action==='import') {
    closeModal();
    const input = document.querySelector('#import-file');
    if (input) { input.value = ''; input.click(); }
  }
});

document.addEventListener('change', async event => {
  if (event.target.id==='new-surname') { event.target.value=normalizeSurname(event.target.value); event.target.removeAttribute('aria-invalid'); return; }
  if (event.target.id!=='import-file') return;
  const file = event.target.files[0]; if (!file) return;
  if (file.size>2_000_000) { toast('That save is too large. Choose a Lifelines JSON export.',true); return; }
  try {
    const incoming = migrateSave(JSON.parse(await file.text()));
    if (!incoming) throw new Error('Invalid save');
    openModal('Restore this story?', `<p>Replace your current life with <strong>${esc(incoming.name)}</strong>, age ${incoming.age}, generation ${incoming.generation}?</p>`, '<button class="button secondary" data-action="close">Cancel</button><button class="button primary" id="restore-save">Restore life</button>');
    document.querySelector('#restore-save').addEventListener('click',()=>{closeModal(); state=incoming; activeTab='year';save();render();yearSummaryModal();toast('Your story is restored.');},{once:true});
  } catch { toast('This file isn’t a valid Lifelines save.',true); }
});

document.addEventListener('keydown', event => {
  if (!modalRoot.firstElementChild) return;
  if (event.key==='Escape') closeModal();
  if (event.key==='Enter' && ['new-name','new-surname'].includes(event.target.id)) modalRoot.querySelector('[data-action="confirm-new"]')?.click();
  if (event.key==='Tab') {
    const items = [...modalRoot.querySelectorAll('button:not(:disabled),input,a[href]')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
  }
});

save();
render();
if (mustNameFamily) newLifeModal(true);
else yearSummaryModal();
if (loadNotice) toast(loadNotice,true);
