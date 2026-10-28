import {
  SKILLS, JOBS, EVENTS, resolveEventChoice, createGame, advanceYear, setFocus, setCryLevel, annualForecast, dismissYearSummary, jobFit,
  canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed,
  effectiveStats, eventOdds, mortalityOdds, stage, migrateSave, chooseEducation,
  offeredJobs, needsEducationChoice, pendingEventSubject,
  relationshipOdds, meetingChances, proposalChance, pregnancyChance, oneNightChance,
  respondToEncounter, proposeMarriage, endRelationship, normalizeSurname, heightPercentile
} from './engine.js?v=life-details-1';

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
  social: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3 2-7a8 8 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',
  school: '<path d="m2 8 10-5 10 5-10 5-10-5Zm4 3v7q6 5 12 0v-7M22 8v9"/>',
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
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const journalText = value => esc(String(value ?? '')
  .replace(/\$\d[\d,]*(?:\.\d+)?/g, 'a share of the family legacy')
  .replace(/\b(?:mental\s+)?instability\s+([+−-])(\d+(?:\.\d+)?|\.\d+)/gi, (_,sign,value) => `Mental stability ${Number(value)===0?'stayed steady':sign==='+'?'decreased':'increased'}`)
  .replace(/\b(?:mental\s+)?instability\b/gi, 'Mental stability')
  .replace(/\b(?:mental\s+)?stability\b/gi, 'Mental stability')
  .replace(/\bbonds\b/gi, 'relationships').replace(/\bbond\b/gi, 'relationship')
  // Older journal entries have deltas but no historical starting value. Keep
  // their direction without inventing a before/after pair or rewriting saves.
  .replace(/\b(Intelligence|Strength|Attractiveness|Social ability|Creativity|Health|Mental stability|Lifestyle|Relationships?)\s+([+−-])(\d+(?:\.\d+)?|\.\d+)/gi, (_,label,sign,value) => `${label} ${Number(value)===0?'stayed steady':sign==='+'?'increased':'decreased'}`)
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
  .trim());
const number = value => Number(value || 0).toFixed(1);
const beforeAfter = ({before,after}, unit = '') => {
  const digits = before!==after && number(before)===number(after) ? 2 : 1;
  return `${Number(before).toFixed(digits)} → ${Number(after).toFixed(digits)}${unit}`;
};
const pct = value => `${Math.round((Number(value) || 0) * 100)}%`;
const aptitude = value => value > 0 ? `+${value}` : String(value);
const skillLabel = key => SKILLS.find(s => s.key === key)?.label || ({health:'Health',stability:'Mental stability',lifestyle:'Lifestyle',height:'Height'}[key]) || key;
const stageNames = {baby:'The beginning',child:'Growing roots',teen:'Finding your way',adult:'A life of your own',elder:'What you leave behind'};
const career = () => JOBS.find(j => j.id === state.jobId);
const focusUsed = () => Object.values(state.focus).reduce((a,b) => a+b, 0);
const genderLabel = person => ({ male: 'Male', female: 'Female', nonbinary: 'Nonbinary' }[person.gender] || 'Unspecified');
const genderBadge = person => `<span class="gender-label" aria-label="Gender: ${genderLabel(person)}">${genderLabel(person)}</span>`;
const parentLabel = person => ({ mom: 'Mom', mother: 'Mom', dad: 'Dad', father: 'Dad', parent: 'Parent' }[String(person.parentRole || '').toLowerCase()] || (person.gender==='female'?'Mom':person.gender==='male'?'Dad':'Parent'));
function heightLabel(person) {
  const percentile = heightPercentile(person);
  if (percentile === null) return 'Adult height';
  const rank = Math.round(percentile);
  if (rank < 1) return 'Below 1st percentile';
  if (rank > 99) return 'Above 99th percentile';
  const last = rank % 10, teens = rank % 100;
  const suffix = teens >= 11 && teens <= 13 ? 'th' : last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
  return `${rank}${suffix} percentile for age`;
}
function projectedMeter(label, value, projected, key = '', extraClass = '') {
  const change = projected?.change || 0;
  const direction = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'steady';
  const left = Math.min(value, projected?.after ?? value) * 10;
  const width = Math.abs(change) * 10;
  return `<div class="stat-track ${extraClass}" role="meter" aria-label="${esc(label)}" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${value}" ${projected?`aria-valuetext="${number(value)} out of 10; expected to ${direction==='steady'?'stay steady':direction} next year"`:''}><span class="stat-fill" style="--stat-color:var(--${key || 'green'}, #809b73);width:${value*10}%"></span>${change?`<span class="stat-projection ${direction}" data-direction="${direction}" style="left:${left}%;width:${width}%" aria-hidden="true"></span>`:''}</div>`;
}
const helpButton = (topic, label, id = '') => `<button type="button" class="help-button" data-action="topic-help" data-topic="${esc(topic)}" ${id?`data-id="${esc(id)}"`:''} aria-label="About ${esc(label)}" aria-haspopup="dialog"><span aria-hidden="true">?</span></button>`;
const labelWithHelp = (label, topic, id = '') => `<span class="label-with-help">${esc(label)}${helpButton(topic,label,id)}</span>`;
const forecastLegend = () => '<div class="forecast-legend"><span class="forecast-key increase">Green: expected increase</span><span class="forecast-key decrease">Red: expected decrease</span></div>';

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

function avatar(person, small = false) {
  const shade = ['#e4ba99','#b37e60','#eecab0','#d09b77'][Math.abs([...person.name].reduce((v,c) => v+c.charCodeAt(0),0)) % 4];
  const baby = person.age < 3;
  const older = person.age >= 60;
  return `<svg viewBox="0 0 120 120" class="avatar" role="img" aria-label="Illustrated portrait of ${esc(person.name)}">
    <circle cx="60" cy="60" r="58" fill="${small ? '#ede7d9' : '#e3e8da'}"/>
    <path d="M18 120v-12c0-25 20-35 42-35s42 10 42 35v12" fill="${baby ? '#d99b78' : '#54796b'}"/>
    <path d="M48 73v12q12 10 24 0V73" fill="${shade}"/>
    <ellipse cx="60" cy="51" rx="${baby ? 28 : 25}" ry="${baby ? 30 : 32}" fill="${shade}"/>
    ${baby ? '<path d="M52 23q-1-14 10-10t-3 13" fill="none" stroke="#564538" stroke-width="4" stroke-linecap="round"/>' : `<path d="M34 48q-9-32 18-34 36-5 35 33l-9-10-7-11q-14 17-37 10" fill="${older ? '#c1beb3' : '#433d35'}"/>`}
    <circle cx="50" cy="53" r="2.3" fill="#3e3832"/><circle cx="70" cy="53" r="2.3" fill="#3e3832"/>
    <path d="M54 67q6 5 12 0" fill="none" stroke="#885845" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="42" cy="62" rx="5" ry="3" fill="#d98f7f" opacity=".4"/><ellipse cx="78" cy="62" rx="5" ry="3" fill="#d98f7f" opacity=".4"/>
    <path d="M48 87l12 10 12-10" fill="none" stroke="#f7f3e9" stroke-width="2" opacity=".65"/>
  </svg>`;
}

function render() {
  const lifeStage = stage(state);
  const stats = effectiveStats(state);
  const isYear = activeTab === 'year';
  app.innerHTML = `<div class="app-shell ${isYear?'with-advance':''}">
    <header class="topbar">
      <a class="brand" href="#" data-action="tab" data-tab="year" aria-label="Lifelines home"><span class="brand-mark">${icon('sprout')}</span><span class="brand-title">lifelines<span style="color:var(--orange)">.</span></span></a>
      <div class="top-actions"><span class="save-status">${icon(saveAvailable ? 'check' : 'download')}${saveAvailable ? 'Saved' : 'Session only'}</span><button class="icon-button" data-action="menu" aria-label="More options" aria-haspopup="dialog">${icon('menu')}</button></div>
    </header>
    <section class="profile-bar" aria-label="Your life"><div class="portrait">${avatar(state)}</div><div class="profile-copy"><p class="eyebrow">GENERATION ${state.generation}</p><div class="profile-name-row"><h1 class="person-name">${esc(state.name)}</h1>${genderBadge(state)}</div><p class="muted">${state.age<3?'A whole life ahead':state.age<18?'Student':state.education.status==='college'?'College student':career()?.name || 'Finding a path'}</p></div><div class="profile-age"><strong>${state.age}</strong><span>YEARS OLD</span></div></section>
    <div class="status-strip" aria-label="At a glance">${[['Health',number(stats.health)],['Mental stability',number(stats.stability)],['Lifestyle',state.lifestyle]].map(([label,value])=>`<button class="status-pill" data-action="tab" data-tab="character" aria-label="${label} ${value} out of 10. View your character."><span class="status-label">${label}</span><strong>${value}<small>/10</small></strong></button>`).join('')}</div>
      <main class="main-column" id="main-content"><div class="chapter-heading"><h2>${isYear ? stageNames[lifeStage] : ({career:'Find your calling',family:'A life, connected',character:'This is you'}[activeTab])}<span style="color:var(--orange)">.</span></h2></div>
      ${eventDecisionView()}${state.ended ? endPanel() : ''}${state.needsSuccession ? successionPanel() : ''}
      ${activeTab==='year' ? yearView() : activeTab==='career' ? careerView() : activeTab==='family' ? familyView() : characterView()}</main>
    <footer class="bottom-dock" aria-label="Game controls">${isYear?advanceControls():''}<nav class="nav-list" aria-label="Game sections">${[['year','Year'],['career','Career'],['family','Family'],['character','You']].map(([id,label])=>`<button class="nav-button ${activeTab===id?'active':''}" data-action="tab" data-tab="${id}" ${activeTab===id?'aria-current="page"':''}><span class="nav-icon">${icon(id)}</span><span class="nav-label">${label}</span>${id==='family'&&state.children.length?`<span class="nav-count">${state.children.length}</span>`:''}</button>`).join('')}</nav></footer>
  </div>`;
}

function advanceControls() {
  if (state.pendingEvents.length) return '<div class="advance-row"><button class="button primary advance-button" data-action="review-event">Make your choice '+icon('arrow')+'</button></div>';
  if (state.ended) return `<div class="advance-row"><button class="button primary advance-button" data-action="new">Begin another life ${icon('arrow')}</button></div>`;
  if (state.needsSuccession) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></div>`;
  if (needsEducationChoice(state)) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="career">Choose your path ${icon('arrow')}</button></div>`;
  return `<div class="advance-row"><div class="advance-copy"><strong>Age ${state.age} → ${state.age+1}</strong><span>${state.age<3?`Cry level ${state.cryLevel}/5`:`${focusUsed()}/12 focus used`}</span></div><button class="button primary advance-button" data-action="advance">Next year ${icon('arrow')}</button></div>`;
}

function statsView(preview = false) {
  const stats = effectiveStats(state);
  const forecast = preview && !state.ended && !state.needsSuccession && !state.pendingEvents.length && !needsEducationChoice(state) ? annualForecast(state) : null;
  return `<section class="panel stats-panel ${preview?'year-stats':''} ${forecast?'forecast-panel':''}" aria-label="${preview?'Your stats and expected changes':'Your character stats'}"><div class="panel-heading"><h3>${labelWithHelp(preview?'Your stats':'Your character','stats')}</h3><span class="tag">1–10</span></div><div class="stat-list">${SKILLS.map(skill => {
    const value = stats[skill.key]; const apt = state.aptitudes[skill.key];
    return `<div class="stat-row" data-stat="${skill.key}"><div class="stat-heading"><span class="stat-name">${labelWithHelp(skill.label,skill.key)}</span><span class="aptitude ${apt>0?'positive':apt<0?'negative':''}" aria-label="Growth affinity ${aptitude(apt)}">${aptitude(apt)}</span><strong class="stat-value">${number(value)}</strong></div>${projectedMeter(skill.label,value,forecast?.stats[skill.key],skill.key)}</div>`;
  }).join('')}</div><div class="stat-help-links">${labelWithHelp('Growth affinity','affinity')}${forecast?labelWithHelp('Next year','forecast'):''}</div><div class="vitals-grid">${[['health','Health','heart'],['stability','Mental stability','spark'],['lifestyle','Lifestyle','self']].map(([key,label,ico]) => {
    const value = key==='lifestyle' ? state.lifestyle : stats[key];
    return `<div class="vital" data-stat="${key}"><span class="vital-label">${labelWithHelp(label,key)}</span><span class="vital-value">${number(value)}<small>/10</small></span>${projectedMeter(label,value,key==='lifestyle'?forecast?.lifestyle:forecast?.stats[key],key)}</div>`;
  }).join('')}<div class="vital height-vital"><span class="vital-label">${labelWithHelp('Height','height',state.id)}</span><span class="vital-value">${number(state.height)}<small> cm</small></span><span class="height-percentile">${heightLabel(state)}</span></div></div></section>`;
}

function outcomeSummary(outcome, subject, pending) {
  const keys = [...new Set([...Object.keys(outcome.statChanges || {}), ...Object.keys(outcome.playerChanges || {}), ...Object.keys(outcome.modifiers || {}), ...(outcome.lifestyle?['lifestyle']:[])])];
  if (!pending) {
    const current = effectiveStats(state);
    return keys.map(key => `${skillLabel(key)} ${number(key==='lifestyle'?state.lifestyle:current[key])}`).join(' · ');
  }
  const preview = structuredClone(state);
  const result = resolveEventChoice(preview,outcome.id,pending.eventId,pending.subjectId || undefined);
  if (!result.ok) return '';
  const before = effectiveStats(state), after = effectiveStats(preview);
  const change = (label,start,end) => `${label} ${beforeAfter({before:start,after:end})}`;
  const changes = keys.map(key => change(skillLabel(key),key==='lifestyle'?state.lifestyle:before[key],key==='lifestyle'?preview.lifestyle:after[key]));
  const nextSubject = pendingEventSubject(preview,pending);
  for (const key of Object.keys(outcome.subjectChanges || {})) changes.push(change(`${subject?.name || 'Your loved one'}: ${skillLabel(key)}`,subject?.stats[key],nextSubject?.stats[key]));
  if (outcome.relationship) changes.push(change(`Relationship with ${subject?.name || 'your loved one'}`,subject?.relationship,nextSubject?.relationship));
  if (outcome.years && (outcome.modifiers || outcome.lifestyle)) changes.push(`${outcome.years} year${outcome.years===1?'':'s'}`);
  return changes.join(' · ');
}

function eventDecisionView() {
  const pending = state.pendingEvents[0];
  if (!pending) return '';
  const event = EVENTS.find(event => event.id===pending.eventId);
  const subject = pendingEventSubject(state,pending);
  const story = text => String(text).replaceAll('{name}',subject?.name || 'your loved one');
  return `<section class="panel event-decision" aria-labelledby="event-title" data-event-id="${esc(event.id)}" data-subject-id="${esc(pending.subjectId || '')}"><div class="panel-heading"><span class="eyebrow">${pending.subjectId?'A FAMILY MOMENT':'A TURN IN YOUR STORY'}</span><span class="tag">${state.pendingEvents.length} CHOICE${state.pendingEvents.length===1?'':'S'} LEFT</span></div><h3 id="event-title" tabindex="-1">${journalText(event.name)}</h3><p class="event-context">${pending.subjectId?`${esc(subject?.name)} · Age ${subject?.age} · Your age ${pending.age}`:`Age ${pending.age}`} · Year in review</p><p class="section-description">${journalText(story(event.description))}</p><div class="event-choices">${event.choices.map(choice=>`<button class="event-option" data-action="event-choice" data-event="${esc(event.id)}" data-subject="${esc(pending.subjectId || '')}" data-choice="${esc(choice.id)}"><strong>${journalText(choice.label)} ${icon('arrow')}</strong><span>${journalText(story(choice.description))}</span><span class="event-consequences">${esc(outcomeSummary(choice,subject,pending))}</span></button>`).join('')}</div><p class="decision-required">Choose before moving on.</p></section>`;
}

function focusEventDecision() {
  navigate('year');
  const heading = app.querySelector('#event-title');
  heading?.focus({preventScroll:true});
  heading?.scrollIntoView?.({block:'center',behavior:'instant'});
}

function effectsView() {
  return `<section class="panel"><div class="panel-heading"><h3>Life’s little twists</h3><span class="tag">${state.effects.length} active</span></div>${state.effects.length ? `<div class="effect-list">${state.effects.map(effect => `<div class="effect-card ${Object.values(effect.modifiers || {}).some(value => value<0)||effect.lifestyle<0?'negative':'positive'}"><div class="effect-title">${icon('spark')} ${journalText(effect.name)}</div><p>${journalText(effect.description)}</p><div class="effect-meta">${esc(outcomeSummary(effect))}<br>${effect.years} year${effect.years===1?'':'s'} remaining</div></div>`).join('')}</div>` : `<div class="empty-state">${icon('spark')}<p>A clean slate.<br>No active buffs or setbacks.</p></div>`}<button class="button ghost small" data-action="odds">View this year’s odds ${icon('arrow')}</button></section>`;
}

function yearView() {
  if (needsEducationChoice(state)) return `<section class="panel education-prompt"><div class="panel-heading"><h3>${labelWithHelp('Your next chapter','college')}</h3><span class="tag">A NEW CHOICE</span></div><p class="decision-required">Choose college or a career before your next year.</p><button class="button primary" data-action="tab" data-tab="career">College or career? ${icon('arrow')}</button></section>${retirementNotice()}${connectionNotice()}${journalView()}`;
  const baby = state.age < 3;
  const disabled = state.ended || state.needsSuccession || state.pendingEvents.length>0;
  return `${state.education.status==='college'?collegeProgressView():''}<section class="panel focus-panel"><div class="panel-heading"><h3>${labelWithHelp(baby?'Ask for attention':'Your focus',baby?'cry':'focus')}</h3><span class="tag">${baby ? 'AGES 0–2' : `${focusUsed()} / 12 POINTS`}</span></div>
    ${baby ? `<div class="cry-control" role="group" aria-label="Cry level"><div class="cry-heading"><strong>Cry level <span>${state.cryLevel}/5</span></strong><span>${['A little fuss','Gentle cries','Regular cries','Frequent cries','Very frequent cries'][state.cryLevel-1]}</span></div><div class="cry-levels">${[1,2,3,4,5].map(level=>`<button class="cry-level ${state.cryLevel===level?'selected':''}" data-action="baby" data-level="${level}" aria-label="Cry level ${level} of 5" aria-pressed="${state.cryLevel===level}" ${disabled?'disabled':''}>${level}</button>`).join('')}</div><div class="cry-scale-labels"><span>Less crying</span><span>More crying</span></div><button class="button ghost small" data-action="tab" data-tab="family">See your parents & relationships ${icon('arrow')}</button></div>` : focusView(disabled)}
    </section>
    ${statsView(true)}
    ${state.effects.length?`<button class="effect-summary button secondary" data-action="tab" data-tab="character">${icon('spark')} ${state.effects.length} active life effect${state.effects.length===1?'':'s'} · View ${icon('arrow')}</button>`:''}
    ${retirementNotice()}${connectionNotice()}${journalView()}`;
}

function changesView(changes, lifestyle, height) {
  const entries = [...Object.entries(changes || {}), ...(lifestyle?[['lifestyle',lifestyle]]:[]), ...(height?[['height',height]]:[])];
  return `<div class="year-changes">${entries.map(([key,value])=>`<div class="year-change" data-stat="${esc(key)}"><span>${esc(skillLabel(key))}</span><strong class="${value.change>0?'gain':value.change<0?'loss':'unchanged'}">${beforeAfter(value,key==='height'?' cm':'')}</strong></div>`).join('')}</div>`;
}

function yearSummaryModal() {
  const summary=state.yearSummary;
  if (!summary || summary.dismissed) return;
  openModal(`Age ${summary.toAge} &middot; Your year`, `<p class="year-review-intro">What changed from age ${summary.fromAge} to ${summary.toAge}.</p>${changesView(summary.stats,summary.lifestyle,summary.height)}${summary.parents?.length?`<details class="forecast-parents"><summary>Your parents' changes</summary>${summary.parents.map(parent=>`<p><strong>${esc(parent.name)}</strong><span>Mental stability ${beforeAfter(parent.stability)}<br>Relationship ${beforeAfter(parent.relationship)}${parent.lifestyle?`<span class="parent-review-lifestyle">Lifestyle ${beforeAfter(parent.lifestyle)}</span>`:''}</span></p>`).join('')}</details>`:''}${summary.events?.length?`<details class="year-review-events" open><summary>Moments from your year</summary><ul>${summary.events.map(event=>`<li><strong>${journalText(event.title)}</strong><p>${journalText(event.text)}</p></li>`).join('')}</ul></details>`:''}${state.pendingEvents.length?'<p class="form-note">You have decisions to make next. Their effects are added after you choose.</p>':''}`, '<button class="button primary" data-action="close">Continue '+icon('arrow')+'</button>');
  showingYearSummary=true;
  modalRoot.querySelector('.modal').classList.add('year-review-modal');
  modalRoot.querySelector('.modal-backdrop').classList.add('year-review-backdrop');
}

function lifestyleView() {
  const descriptions = ['The essentials', 'A little breathing room', 'Finding your footing', 'Everyday comfort', 'Living well', 'Room to enjoy life', 'A comfortable abundance', 'A taste of luxury', 'An exceptional life', 'Every comfort imaginable'];
  return `<section class="lifestyle-summary" aria-label="Lifestyle"><div><span class="eyebrow">EVERYDAY COMFORT</span><h3>${labelWithHelp('Lifestyle','lifestyle')} <strong>${state.lifestyle}<small> / 10</small></strong></h3><p>${descriptions[state.lifestyle-1]}</p></div><div class="lifestyle-scale" role="meter" aria-label="Lifestyle" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${state.lifestyle}">${Array.from({length:10},(_,i)=>`<span class="${i<state.lifestyle?'filled':''}" style="--level:${i+1}"></span>`).join('')}</div></section>`;
}

function focusView(disabled) {
  const studying = state.age<18 || state.education.status==='college';
  const rows = [['work',state.age<18?'School':studying?'College':'Career',studying?'school':'career'],['social','Friends','social'],['family','Family','family'],['self','Yourself','self']];
  return `<div class="focus-list">${rows.map(([key,label,ico]) => `<div class="focus-row"><span class="focus-icon">${icon(ico)}</span><div class="focus-copy"><h4>${labelWithHelp(label,`focus-${key}`)}</h4><div class="focus-scale" aria-hidden="true">${Array.from({length:5},(_,i)=>`<span class="${i<state.focus[key]?'filled':''}"></span>`).join('')}</div></div><div class="stepper" role="group" aria-label="${label} focus"><button data-action="focus" data-key="${key}" data-delta="-1" aria-label="Decrease ${label.toLowerCase()} focus" ${state.focus[key]<=0||disabled?'disabled':''}>${icon('minus')}</button><output aria-label="${label} focus level">${state.focus[key]}</output><button data-action="focus" data-key="${key}" data-delta="1" aria-label="Increase ${label.toLowerCase()} focus" ${state.focus[key]>=5||focusUsed()>=12||disabled?'disabled':''}>${icon('plus')}</button></div></div>`).join('')}</div><div class="budget-bar"><div class="budget-summary"><span>${12-focusUsed()} focus point${12-focusUsed()===1?'':'s'} available</span><strong>${focusUsed()} / 12</strong></div><div class="budget-track"><span style="width:${focusUsed()/12*100}%"></span></div></div>`;
}

function journalView() {
  const entries = showAllHistory ? state.history : state.history.slice(0,8);
  return `<section class="panel journal-panel"><div class="panel-heading"><h3>The story so far</h3><span class="tag">LIFE JOURNAL</span></div><div class="journal-list">${entries.map(entry => `<article class="journal-entry ${esc(entry.kind || 'neutral')}"><div class="journal-age"><strong>${entry.age}</strong><span>${entry.generation===state.generation?'AGE':`GEN ${entry.generation}`}</span></div><span class="journal-marker"></span><div class="journal-content"><h4>${journalText(entry.title)}</h4><p>${journalText(entry.text)}</p></div></article>`).join('')}</div>${state.history.length>8?`<button class="button ghost small" data-action="history">${showAllHistory?'Show recent years':'Read the whole story'} ${icon('arrow')}</button>`:''}</section>`;
}

function collegeProgressView() {
  const years = state.education.years;
  return `<section class="panel college-progress"><div class="panel-heading"><h3>${labelWithHelp('College','college')}</h3><span class="tag">${years}/4 YEARS COMPLETE</span></div><div class="budget-track" role="progressbar" aria-label="College progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${years}"><span style="width:${years/4*100}%"></span></div><p class="game-status">${4-years} more year${years===3?'':'s'} to graduation.</p></section>`;
}

function careerView() {
  if (state.age<18) return `<section class="panel"><div class="panel-heading"><h3>${labelWithHelp('Your future starts here','career')}</h3><span class="tag">AGE 18</span></div></section>`;
  if (state.education.status==='college') return `${collegeProgressView()}<section class="panel"><button class="button primary" data-action="tab" data-tab="year">Continue studying ${icon('arrow')}</button></section>`;
  const current = career();
  const offers = offeredJobs(state);
  const choosing = needsEducationChoice(state);
  const intro = choosing ? `<section class="panel education-choice"><div class="panel-heading"><h3>${labelWithHelp('College or a career?','college')}</h3><span class="tag">YOUR CHOICE</span></div><button class="button primary" data-action="education" data-path="college">Go to college · 4 years ${icon('arrow')}</button></section>` : `<section class="panel"><div class="panel-heading"><h3>${labelWithHelp(current?current.name:'Choose your next role','career')}</h3>${current?'<button class="button ghost small" data-action="quit">Leave job</button>':`<span class="tag">${state.education.status==='graduate'?'COLLEGE GRADUATE':'WORKING LIFE'}</span>`}</div>${current?`<p class="game-status">${state.jobYears} year${state.jobYears===1?'':'s'} in this role.</p>`:''}${lifestyleView()}${current?`<div class="job-metrics"><span>Job performance</span><strong>${pct(state.performance)}</strong></div>`:''}</section>`;
  return `${intro}<div class="panel-heading career-offer-heading"><h3>${labelWithHelp(`Your ${offers.length} job offers`,'career')}</h3><span class="tag">${JOBS.length} CAREERS</span></div><div class="job-grid">${offers.map(job => {
    const eligibility = canTakeJob(state,job); const fit = jobFit(state,job); const selected = state.jobId===job.id;
    return `<article class="job-card ${selected?'selected':''} ${!eligibility.ok&&!selected?'locked':''}" data-job-id="${esc(job.id)}"><div class="job-top"><span class="tag">${esc(job.category)}</span><span class="job-lifestyle"><small>Lifestyle </small>${job.baseLifestyle}<small>/10</small></span></div><h3>${labelWithHelp(job.name,'job',job.id)}</h3>${selected?'<span class="tag current-role">YOUR ROLE</span>':''}<div class="job-affinities" aria-label="Skill affinities">${Object.entries(job.affinities).sort((a,b)=>b[1]-a[1]).map(([key,value])=>`<span class="job-affinity" data-skill="${key}">${esc(skillLabel(key))} <strong>+${value}</strong></span>`).join('')}</div><div class="job-metrics"><span>Your skill fit</span><strong>${pct(fit)}</strong></div><div class="fit-track"><span style="width:${fit*100}%"></span></div><p class="requirement">Age ${job.minAge}+${job.requiresCollege?' · College degree':''}${Object.entries(job.requirements).length?' · '+Object.entries(job.requirements).map(([key,value])=>`${esc(skillLabel(key))} ${value}+`).join(' · '):' · No skill minimum'}</p><div class="job-actions"><button class="button ${selected?'ghost':'secondary'} small" data-action="job" data-id="${esc(job.id)}" ${selected||!eligibility.ok||state.ended||state.needsSuccession?'disabled':''}>${selected?'Currently employed':'Choose career'} ${selected?icon('check'):icon('arrow')}</button>${!eligibility.ok&&!selected?`<span class="muted">${esc(eligibility.reason)}</span>`:''}</div></article>`;
  }).join('')}</div>`;
}

function miniStats(person) {
  return `<div class="mini-stats">${[...SKILLS.map(skill=>[skill.key,skill.label]),['health','Health'],['stability','Mental stability']].map(([key,label]) => `<span>${labelWithHelp(label,key)} <strong>${number(person.stats[key])}</strong></span>`).join('')}</div>`;
}

function partnerLabel(person) {
  if (person.gender==='female') return person.married?'Wife':'Girlfriend';
  if (person.gender==='male') return person.married?'Husband':'Boyfriend';
  return person.married?'Spouse':'Partner';
}

function relationshipMeter(person, forecast) {
  return `<div class="relationship-summary">${labelWithHelp('Relationship','relationship')}<strong>${number(person.relationship)}<small>/10</small></strong></div>${projectedMeter(`Relationship with ${person.name}`,person.relationship,forecast,'green','relationship-meter')}`;
}

function profileStats(person, forecast) {
  return `<div class="profile-stats">${SKILLS.map(skill=>`<div class="profile-stat" data-skill="${skill.key}"><span>${labelWithHelp(skill.label,skill.key)}</span><strong>${number(person.stats[skill.key])}<small>/10</small></strong><span class="aptitude ${person.aptitudes[skill.key]>0?'positive':person.aptitudes[skill.key]<0?'negative':''}" aria-label="${esc(skill.label)} growth affinity ${aptitude(person.aptitudes[skill.key])}">${aptitude(person.aptitudes[skill.key])}</span></div>`).join('')}${[['health','Health'],['stability','Mental stability']].map(([key,label])=>`<div class="profile-stat" data-skill="${key}"><span>${labelWithHelp(label,key)}</span><strong>${number(person.stats[key])}<small>/10</small></strong>${key==='stability'?projectedMeter(label,person.stats[key],forecast?.stability,'green'):''}</div>`).join('')}<div class="profile-stat"><span>${labelWithHelp('Lifestyle','lifestyle')}</span><strong>${person.lifestyle}<small>/10</small></strong></div><div class="profile-stat"><span>${labelWithHelp('Height','height',person.id)}</span><strong>${number(person.height)}<small> cm</small></strong><span class="height-percentile">${heightLabel(person)}</span></div></div><div class="stat-help-links">${labelWithHelp('Growth affinity','affinity')}</div>`;
}

function pregnancyView() {
  if (!state.pregnancy) return '';
  const carrierName = state.pregnancy.carrierId===state.id ? 'You are' : `${esc(state.pregnancy.otherParent.name)} is`;
  return `<section class="panel pregnancy-panel"><div class="panel-heading"><h3>${labelWithHelp('A new chapter on the way','children')}</h3><span class="tag">EXPECTING</span></div><p class="section-description">${carrierName} expecting a baby. Your family will welcome the new arrival when you reach age ${state.pregnancy.dueAge}.</p></section>`;
}

function loveView() {
  if (state.age<18) return '';
  const blocked = state.pendingEvents.length>0 || state.ended || state.needsSuccession;
  if (state.partner && state.partner.alive!==false) {
    const person = state.partner;
    const proposal = proposalChance(state);
    const pregnancy = pregnancyChance(state);
    const living = person.alive!==false;
    return `<section class="panel partner-panel" data-person-id="${esc(person.id)}"><div class="panel-heading"><h3>${icon('heart')} Your life together</h3><span class="tag">${living?partnerLabel(person).toUpperCase():'REMEMBERED'}</span></div><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3>${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old · ${person.yearsTogether} year${person.yearsTogether===1?'':'s'} together</p></div></div>${relationshipMeter(person)}${profileStats(person)}${living?`<div class="relationship-actions">${!person.married?`<button class="button primary" data-action="propose" ${blocked||!proposal?'disabled':''}>Propose marriage <span>${pct(proposal)} chance</span></button>${labelWithHelp(person.lastProposalAge===state.age?'Already proposed this year':'Marriage','marriage')}`:'<p class="married-note">Married · A shared chapter</p>'}<div class="game-status">${labelWithHelp(state.pregnancy?'Your family is expecting.':`Pregnancy chance this year: ${pct(pregnancy)}`,'pregnancy')}</div><button class="button ghost small" data-action="breakup" ${blocked?'disabled':''}>${person.married?'End marriage':'End relationship'}</button></div>`:''}</section>${pregnancyView()}`;
  }
  const remembered=state.partner?.alive===false ? `<section class="panel remembered-partner"><div class="panel-heading"><h3>Remembering your partner</h3><span class="tag">REMEMBERED</span></div><div class="family-header"><div class="family-avatar">${avatar(state.partner,true)}</div><div class="family-meta"><h3>${esc(state.partner.name)}</h3>${genderBadge(state.partner)}<p>Died at age ${state.partner.age}</p></div></div>${relationshipMeter(state.partner)}<details class="family-details"><summary>Your shared chapter</summary>${profileStats(state.partner)}</details></section>` : '';
  const chance = meetingChances(state);
  const anyChance = 1-Math.pow(1-chance.chance,chance.slots);
  const people = state.encounters;
  encounterIndex = Math.max(0,Math.min(encounterIndex,people.length-1));
  const person = people[encounterIndex];
  return `${remembered}${pregnancyView()}<section class="panel dating-panel"><div class="panel-heading"><h3>${labelWithHelp('People you meet','dating')}</h3><span class="tag">${people.length} AVAILABLE</span></div><div class="dating-chances"><span>Chance of meeting someone next year <strong>${pct(anyChance)}</strong></span><span>Up to <strong>${chance.slots}</strong> people with your current appeal</span></div>${people.length?`<div class="encounter-list" data-total="${people.length}">${people.length>1?`<div class="encounter-pagination"><button class="button ghost small" data-action="prospect-page" data-delta="-1" aria-label="Previous person" ${encounterIndex===0?'disabled':''}>Back</button><span>${encounterIndex+1} of ${people.length}</span><button class="button ghost small" data-action="prospect-page" data-delta="1" aria-label="Next person" ${encounterIndex===people.length-1?'disabled':''}>Next</button></div>`:''}<article class="encounter-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3 tabindex="-1">${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old</p></div></div>${profileStats(person)}<div class="encounter-actions"><button class="button primary" data-action="encounter" data-choice="relationship" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Pursue a relationship <span>${pct(relationshipOdds(state,person))} chance</span></button><button class="button secondary" data-action="encounter" data-choice="casual" data-id="${esc(person.id)}" ${blocked?'disabled':''}>One-night stand <span>${pct(oneNightChance(state,person))} mutual interest</span></button><button class="button ghost" data-action="encounter" data-choice="ignore" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Ignore</button></div></article></div>`:`<div class="empty-state">${icon('heart')}<h4>No new connection this year</h4></div>`}</section>`;
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
  return `<section class="panel retirement-panel" data-route="${info.route}"><div class="panel-heading"><h3>${labelWithHelp(titles[info.route],'inheritance')}</h3><span class="tag">${state.needsSuccession?'NEXT CHAPTER':'RETIREMENT'}</span></div>${!info.eligible?`<p class="game-status retirement-blocked">${esc(info.reason)}</p>`:''}<div class="heir-list">${info.candidates.map(person=>`<article class="heir-candidate ${info.route==='beneficiary'?'beneficiary-preview':''}" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${info.route==='children'?'YOUR CHILD':info.route==='siblings'?'YOUR SIBLING':'A NEW BEGINNING'}</span><h3>${esc(person.name)}</h3>${genderBadge(person)}<p>${person.age} years old · ${esc(person.familyName)} family</p></div></div>${info.route==='beneficiary'?profileStats(person):`<details class="family-details"><summary>Skills & wellbeing</summary>${miniStats(person)}</details>`}<button class="button primary" data-action="heir" data-id="${esc(person.id)}" ${info.eligible?'':'disabled'}>${state.alive===false?'Continue':'Retire'} & play as ${esc(person.name.split(' ')[0])} ${icon('arrow')}</button></article>`).join('')}</div></section>`;
}

function personCard(person, role, child = false, parent = false, forecast) {
  const employment = {employed:'Employed',unemployed:'Unemployed',retired:'Retired'}[person.career?.status] || 'Employed';
  return `<article class="family-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${esc(role)}</span><div class="profile-name-row"><h3>${esc(person.name)}</h3>${genderBadge(person)}</div><p>${person.age} years old${person.alive===false?' · Remembered':''}</p></div></div><p class="family-lifestyle">${labelWithHelp('Lifestyle','lifestyle')} <strong>${person.lifestyle}/10</strong>${person.age<18?' · Family household':''}</p>${parent?`<div class="parent-career"><span>${labelWithHelp('Career focus','parent-career')} <strong>${person.career?.focus ?? 0}/5</strong></span><span class="employment-status">${employment}</span></div>`:''}${Number.isFinite(person.relationship)?relationshipMeter(person,forecast?.relationship):''}<details class="family-details" ${parent?'open':''}><summary>Skills & wellbeing</summary>${profileStats(person,forecast)}</details>${child&&person.alive===false?'<div class="family-card-footer"><span>Remembered with love</span></div>':''}</article>`;
}

function parentsView() {
  if (!state.parents.length) return '';
  const forecasts = !state.ended && !state.needsSuccession && !state.pendingEvents.length && !needsEducationChoice(state) ? annualForecast(state).parents : [];
  return `<details class="panel roots-panel" ${state.age<18?'open':''}><summary>The people who raised you</summary><div class="stat-help-links">${labelWithHelp('Parents','parents')}${forecasts.length?labelWithHelp('Next year','forecast'):''}</div><div class="family-grid">${state.parents.map(person=>personCard(person,parentLabel(person),false,true,forecasts.find(p=>p.id===person.id))).join('')}</div></details>`;
}

function familyView() {
  const childAllowed = !state.pendingEvents.length && state.age>=18 && state.children.length<(state.pregnancy?5:6) && state.lastChildAge!==state.age && !state.ended && !state.needsSuccession;
  return `${state.age>=65||state.needsSuccession?retirementView():''}${loveView()}${parentsView()}
    <section class="panel"><div class="panel-heading"><h3>${labelWithHelp('The next generation','children')}</h3><button class="button secondary small" data-action="child" ${childAllowed?'':'disabled'}>${icon('plus')} Adopt a child</button></div>${state.age<18?'<p class="game-status">Parenthood · Age 18+</p>':state.lastChildAge===state.age?'<p class="game-status">A new arrival this year.</p>':''}${state.children.length?`<div class="family-grid child-grid">${state.children.map(c=>personCard(c,'YOUR CHILD',true)).join('')}</div>`:`<div class="empty-state">${icon('family')}<h4>A branch yet to grow</h4></div>`}</section>
    ${state.age<65&&!state.needsSuccession?retirementView():''}
    ${state.siblings.length?`<section class="panel"><div class="panel-heading"><h3>${labelWithHelp('Your siblings','inheritance')}</h3><span class="tag">FAMILY</span></div><div class="family-grid sibling-grid">${state.siblings.map(person=>personCard(person,'YOUR SIBLING')).join('')}</div></section>`:''}
    ${state.lineage.length?`<section class="panel"><div class="panel-heading"><h3>Those who came before</h3><span class="tag">${state.lineage.length} CHAPTERS</span></div><div class="legacy-list">${state.lineage.map(p=>`<div class="legacy-card"><strong>${esc(p.name)}</strong><span>Generation ${esc(p.generation ?? '—')} · Age ${esc(p.age ?? '—')}</span></div>`).join('')}</div></section>`:''}`;
}

function characterView() {
  return `${statsView()}${effectsView()}`;
}

function endPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>A life, fully lived.</h3><span class="tag">AGE ${state.age}</span></div><p class="section-description">${esc(state.name)}’s story has come to a close. </p><button class="button primary" data-action="new">Begin another story ${icon('arrow')}</button></section>`;
}

function successionPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>The story goes on.</h3><span class="tag">NEXT GENERATION</span></div><p class="section-description">${state.alive===false?`${esc(state.name)} died at age ${state.age}.`:'This playable chapter closes at age 85.'} Choose your next character in Family.</p><button class="button primary" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></section>`;
}

function toast(message, error = false) {
  clearTimeout(toastTimer);
  document.querySelector('#toast-root').innerHTML = `<div class="toast ${error?'error':''}">${icon(error?'help':'check')}<span>${esc(message)}</span></div>`;
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
  openModal('Your story', `<div class="menu-list"><button data-action="help">${icon('help')} How to play ${icon('arrow')}</button><button data-action="odds">${icon('spark')} This year’s odds ${icon('arrow')}</button><button data-action="export">${icon('download')} Export save ${icon('arrow')}</button><button data-action="import">${icon('year')} Import save ${icon('arrow')}</button><button data-action="new">${icon('plus')} Start a new life ${icon('arrow')}</button></div><p class="menu-note">${saveAvailable?'Your life saves automatically on this device. Export a backup to move it to another phone.':'Browser saving is unavailable. Export your story before leaving.'}</p>`);
}

function newLifeModal(initial = false) {
  openModal(initial?'Name your family.':'Begin a new family?', `<p class="section-description">${initial?'Your story begins with a surname. Sons and daughters will carry it through the generations.':'This starts a new family and replaces your current saved life when you confirm.'}</p><label class="field-label" for="new-surname">Family surname</label><input class="text-input" id="new-surname" maxlength="30" required aria-required="true" placeholder="Your family name" autocomplete="family-name" autocapitalize="words"><p class="form-note">The first letter is capitalized automatically.</p><label class="field-label" for="new-name">First name <span class="muted">(optional)</span></label><input class="text-input" id="new-name" maxlength="19" placeholder="Leave blank for a surprise" autocomplete="given-name" autocapitalize="words"><p class="form-note">You begin at age 0 with randomized parents, stats, and skill affinities.</p>`, `${initial?'':'<button class="button secondary" data-action="close">Keep my story</button>'}<button class="button primary" data-action="confirm-new">Begin this family ${icon('arrow')}</button>`, initial);
}

function navigate(tab) {
  if (!['year','career','family','character'].includes(tab)) return;
  if (modalRoot.firstElementChild) closeModal();
  activeTab = tab;
  render();
  window.scrollTo?.({top:0,behavior:'instant'});
  app.querySelector(`.nav-button[data-tab="${tab}"]`)?.focus({preventScroll:true});
}

function topicHelpModal(topic, id) {
  const person = [state,...state.parents,...state.children,...state.siblings,...state.encounters,...(state.partner?[state.partner]:[])].find(candidate=>candidate.id===id) || state;
  const childhood = 'Intelligence, strength, social ability, and creativity start low at birth because a baby has had little time to learn or develop. They increase through childhood and practice, with different growth in each life and each year.';
  const appearance = 'Attractiveness starts near its inherited adult value. It does not grow like a learned skill. Tiny random changes can move it slightly up or down each year. In this game, gradual aging begins after 30 for men and after 22 for women; events can also affect it. These ratings and thresholds are game rules, not objective measures of people.';
  const help = {
    stats: ['Your stats', [childhood,appearance,'Stats range from 1 to 10. Health, mental stability, and lifestyle describe wellbeing and circumstances rather than learned skills.']],
    intelligence: ['Intelligence', [childhood,'School, college, and mentally demanding work help this ability develop. Growth affinity affects the pace.']],
    strength: ['Strength', [childhood,'Physical development, self-care, and some careers help build strength. Health and age also matter.']],
    social: ['Social ability', [childhood,'Friends, family, relationships, and people-focused work help this ability develop.']],
    creativity: ['Creativity', [childhood,'Learning, personal interests, and creative work help this ability develop.']],
    attractiveness: ['Attractiveness', [appearance]],
    affinity: ['Growth affinity', ['The small −3 to +3 rating is an inherited, lifelong growth affinity. Positive ratings make a learned skill develop faster; negative ratings mean it takes more practice. The actual change still varies each year.','Attractiveness keeps an inherited affinity rating for consistency, but practice and crying do not raise it.']],
    forecast: ['Next year’s stat bars', ['The colored segment in a bar previews the average routine change for next year. Green means an increase; striped red means a decrease. The displayed stat number is your current value.','Actual changes vary, and events can change the result. Forecasts do not include random events, deaths, new relationships, or unresolved decisions.']],
    health: ['Health', ['Higher health means better physical wellbeing and lower disease death risk. Self-care supports it; illness, injuries, and age can reduce it.','Poor health while growing reduces that year’s height gain. Final height emerges from those yearly gains, so less growth can mean a shorter adult height. Health never shrinks height already gained.']],
    stability: ['Mental stability', ['Higher means calmer and more resilient. Rest, friends, and family can help. Lower mental stability can make conflict and distress more likely.','Parents’ mental stability affects childhood events. Harder crying puts more strain on them. These are simplified game probabilities, not diagnoses.']],
    lifestyle: ['Lifestyle', ['Lifestyle runs from 1 to 10 and represents everyday comfort. Until 18, you share your parents’ household lifestyle.','Parents’ career focus and experience usually improve their prospects over time. Their focus can change each year, and setbacks such as losing a job can lower lifestyle. Your own career, family responsibilities, events, and inheritance matter in adulthood.']],
    height: ['Height & percentile', ['Final height is not predetermined. It emerges from yearly gains influenced by age, inherited growth tendencies, health, and random variation. Growth ends at an individual age between ages 14 and 18.','The percentile compares your height with the reference for your age. For example, the 50th percentile is the middle of that reference. It disappears when adult height is reached.','Poor health reduces that year’s height gain and can mean a shorter adult height. It never shrinks height already gained.',heightPercentile(person)===null?'This person has reached adult height.':`Current position: ${heightLabel(person)}.`]],
    cry: ['Cry level', ['Choose a level from 1 to 5 during ages 0–2. More crying brings attention, helps early learned skills grow, and strengthens your relationship with living parents.','Harder crying has a larger effect on parents’ mental stability. Their wellbeing and circumstances can lead to events that affect you. The outcome varies each year.']],
    focus: ['Your focus', ['From age 3, divide up to 12 points between school or career, friends, family, and yourself. Each focus takes 0–5.','Focus changes routine development and event chances. Unused points leave more time for rest. Results vary rather than increasing by a fixed amount every year.']],
    'focus-work': ['School & career focus', ['School and college focus develop learned abilities. After education, career focus supports performance, experience, and lifestyle. Skills and events also influence the result.']],
    'focus-social': ['Friends focus', ['Time with friends develops social ability and can support mental stability. It also changes the chances of social events and connections.']],
    'focus-family': ['Family focus', ['Family time strengthens relationships and helps children develop. It can support parents’ mental stability and affects family events.']],
    'focus-self': ['Yourself focus', ['Time for yourself supports health, learning, and personal development. Rest and self-care also support mental stability.']],
    parents: ['Your parents', ['Mom and Dad each have their own stats, lifestyle, career focus, and relationship with you. Their wellbeing and career changes can affect your childhood.','Initial relationships vary around 8 out of 10. Crying and family time can strengthen them. Each parent also faces age- and health-related mortality.']],
    'parent-career': ['Parents’ careers', ['Career focus runs from 0 to 5 and can change a little each year. Experience and higher focus generally improve career progress and lifestyle over time.','Job loss, unemployment, recovery, and retirement can change that trend. While you are a child, the household’s changing lifestyle affects yours too.']],
    relationship: ['Relationship', ['This 1–10 rating describes your relationship with this person. Higher means closer. Family time, crying in infancy, and shared events can change it.','A partner can support social ability and mental stability, while shared responsibilities affect lifestyle.']],
    career: ['Careers', [`At 18, choose one of 10 job offers or attend college. There are ${JOBS.length} careers; graduates receive 15 offers, including roles that need a degree.`,'Your skills and a role’s affinities determine skill fit. Career focus, performance, and experience support progress and lifestyle, with annual variation and possible setbacks.']],
    college: ['College or career', ['Start working from 10 offers at age 18, or attend college for four years. College focus builds skills. Graduation brings 15 offers, including degree-based careers.','Job skill affinities show which skills a role uses most. A +3 rating is central to that role. Career success can raise lifestyle above its starting level.']],
    children: ['Children', ['Adults can have or adopt up to six children. A pregnancy arrives the following year, and adoption is available once per year.','Family time supports children’s learned skills and your relationship. Dependent children affect household lifestyle; living children also support social ability. All eligible living children share inheritance equally.']],
    dating: ['People you meet', ['Attractiveness, social ability, and lifestyle influence how often you meet people. You can explore their stats before deciding; either approach may be declined.','Unanswered invitations pass at the next year. A relationship closes other invitations. A one-night stand may lead to pregnancy.']],
    marriage: ['Marriage', ['You can propose once per year. A stronger relationship and more years together improve the chance of acceptance. Marriage increases the game’s chance of pregnancy.']],
    pregnancy: ['Pregnancy', ['Pregnancy depends on pregnancy capability, age, health, and relationship status. It is less likely while dating and more likely in marriage. A baby arrives the following year.']],
    inheritance: ['Retirement & inheritance', ['From age 65, retire and continue as an eligible child. With no eligible children, choose a sibling; with neither, a child from another family can receive your legacy. Death can open succession earlier, and age 85 requires a new playable chapter.','All eligible living children share inheritance equally. With no children, the chosen sibling or unrelated child receives it. Heirs keep their own age, stats, growth affinities, and resources. Children and siblings keep the family surname.']]
  };
  let entry = help[topic];
  if (topic==='job') {
    const job = JOBS.find(candidate=>candidate.id===id);
    if (job) entry = [job.name,[job.description,'The skill affinities show what this role uses most; +3 is central. Skill fit reflects how well your current abilities match the role. Career focus and experience can improve performance and lifestyle.']];
  }
  if (!entry) return;
  openModal(esc(entry[0]),`${entry[1].map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}${topic==='forecast'?forecastLegend():''}`);
  modalRoot.querySelector('.modal').classList.add('help-popup');
  modalRoot.querySelector('.modal').setAttribute('aria-describedby','topic-help-content');
  modalRoot.querySelector('.modal-body').id='topic-help-content';
  modalRoot.querySelector('.modal-backdrop').classList.add('help-popup-backdrop');
}

function helpModal() {
  openModal('A life, one year at a time.', `<div class="help-grid"><div class="help-item"><h4>01 · Start small</h4><p>At ages 0 to 2, set crying from 1 to 5. Crying helps skills and parent relationships grow; higher levels put more strain on parents. Their stress and support can affect your childhood.</p></div><div class="help-item"><h4>02 · Spend your time</h4><p>From age 3, share 12 focus points across school or career, friends, family, and yourself. Each takes 0–5. Press Next year when you’re ready.</p></div><div class="help-item"><h4>03 · Work with your nature</h4><p>Skills range from 1–10. The −3 to +3 rating is growth affinity. Your choices determine where you improve; affinity changes how fast.</p></div><div class="help-item"><h4>04 · Leave room for life</h4><p>There are ${EVENTS.length} possible events. Each has a small, independent yearly chance based on your age, focus, career, and stats. Up to five ordinary events can happen. Death risks are separate and depend on age and wellbeing. Some events ask you to choose, with consequences shown before you decide.</p></div><div class="help-item"><h4>05 · Find your path</h4><p>At 18, choose a job from 10 offers or attend college for four years. Graduates receive 15 offers. There are 100 careers, each with skill affinities and a base lifestyle from 1 to 10.</p></div><div class="help-item"><h4>06 · Grow a legacy</h4><p>Meet people from 18, build a relationship, and propose once a year. Pregnancy is rare while dating and much more likely in marriage; a baby arrives the following year. Adults can also adopt. Family focus develops children’s skills and strengthens everyone’s relationships. Retire from 65 and play as a child. With no children, choose a sibling; with neither, give your legacy to a low-stat child with a different surname. At 85, choose the next chapter. All living children share the inheritance equally. Death can end any chapter early, with an heir available to continue.</p></div></div><p class="form-note">Mortality uses a real-world age baseline with simplified stat adjustments. Other events are fictional. Saves stay in this browser.</p>`, '<button class="button primary" data-action="close">Let’s live a little</button>');
}

function oddsModal() {
  const odds = eventOdds(state).filter(event=>event.chance>0).sort((a,b)=>b.chance-a.chance);
  const quiet = odds.reduce((chance,event)=>chance*(1-event.chance),1);
  const mortality = mortalityOdds(state);
  const waiting = state.pendingEvents.length || needsEducationChoice(state) || state.ended || state.needsSuccession;
  openModal('A little room for chance.', `<p class="section-description">${waiting?'Finish your current decisions to continue. These chances describe your current age and condition.':'Your age, focus, career, and effective stats shape each event’s chance.'} Ordinary events roll separately, with at most five happening in a year. Mortality is checked separately for everyone and is outside that limit.</p><div class="chance-summary"><span>A quiet year<strong>${(quiet*100).toFixed(1)}%</strong></span><span>At least one event<strong>${((1-quiet)*100).toFixed(1)}%</strong></span></div><p class="form-note">Ordinary lives average roughly one event every year or two. These totals describe ordinary events only. Death risks below are separate; a quiet year can still include a bereavement.</p><details class="event-odds"><summary>${odds.length} possible events this year</summary><div class="odds-list">${odds.map(event=>`<div class="odds-row"><span>${journalText(event.name)}${EVENTS.find(candidate=>candidate.id===(event.eventId || event.id))?.choices?'<small>Includes a choice</small>':''}</span><strong>${(event.chance*100).toFixed(2)}%</strong></div>`).join('')}</div></details><p class="form-note">Individual percentages are the roll chances before the five-event limit. They are checked when you press Next year, using your choices and stats for that year.</p><details class="mortality-odds"><summary>Annual death risks</summary><p class="form-note">A real-world age baseline with simplified health and mental stability adjustments. Lower health raises disease risk. These are game estimates, not individual medical predictions.</p><div class="odds-list">${mortality.map(person=>`<div class="mortality-row"><span>${esc(person.name)}<small>Disease ${(person.disease*100).toFixed(3)}% &middot; Accident ${(person.accident*100).toFixed(3)}%</small></span><strong>${(person.total*100).toFixed(3)}%</strong></div>`).join('')}</div></details>`);
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
      else { navigate('year'); toast('Your choice becomes part of your story.'); }
    }
  }
  if (action==='education') {
    update(()=>chooseEducation(state,button.dataset.path),'Your college chapter begins.');
    if (state.education.status==='college') navigate('year');
  }
  if (action==='baby') {
    update(()=>setCryLevel(state,Number(button.dataset.level)));
    app.querySelector(`[data-action="baby"][data-level="${button.dataset.level}"]`)?.focus({preventScroll:true});
  }
  if (action==='focus') {
    const {key,delta} = button.dataset;
    update(()=>setFocus(state,key,state.focus[key]+Number(delta)));
    app.querySelector(`[data-action="focus"][data-key="${key}"][data-delta="${delta}"]`)?.focus({preventScroll:true});
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
    if (result?.ok) toast(result.accepted?'You are married. A new chapter together.':'Not yet. You can propose again next year.');
  }
  if (action==='breakup' && state.partner) {
    openModal('End this relationship?', '<p>Close your chapter with <strong>'+esc(state.partner.name)+'</strong>? Your children and any pregnancy remain part of your story.</p>', '<button class="button secondary" data-action="close">Stay together</button><button class="button primary" data-action="confirm-breakup">End relationship</button>');
  }
  if (action==='confirm-breakup') { closeModal(); update(()=>endRelationship(state),'Your relationship has ended.'); }
  if (action==='job') update(()=>takeJob(state,button.dataset.id),'A new chapter in your career.');
  if (action==='quit') update(()=>quitJob(state),'You’ve made room for a new path.');
  if (action==='child') update(()=>haveChild(state),'Welcome to the family, little one.');
  if (action==='heir') {
    const info = successionInfo(state);
    const child = info.candidates.find(person=>person.id===button.dataset.id);
    if (!child || !info.eligible) return;
    const inheritance = info.route==='children'?'All living children receive equal shares of the inheritance, including those you do not play.':info.route==='siblings'?'With no eligible children, your chosen sibling receives the whole inheritance.':'You give this child the whole inheritance and continue with a different surname: '+esc(child.familyName)+'.';
    openModal(state.alive===false?'Continue their legacy?':'Retire and continue?', `<p>Play as <strong>${esc(child.name)}</strong>, age ${child.age}, with their own stats and affinities.</p><p>${inheritance}</p><p>This closes ${esc(state.name)}’s playable chapter.</p>`, `<button class="button secondary" data-action="close">${state.alive===false?'Back':'Keep living this chapter'}</button><button class="button primary" data-action="confirm-heir" data-id="${esc(child.id)}">${state.alive===false?'Play next chapter':'Retire & continue'} ${icon('arrow')}</button>`);
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
    if (!surname) { modalRoot.querySelector('#new-surname').setAttribute('aria-invalid','true'); modalRoot.querySelector('#new-surname').focus(); toast('Enter a family surname to begin.',true); return; }
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
