import {
  SKILLS, JOBS, EVENTS, resolveEventChoice, createGame, advanceYear, setFocus, setCryLevel, annualForecast, dismissYearSummary, jobFit,
  canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed,
  effectiveStats, eventOdds, mortalityOdds, stage, migrateSave, chooseEducation,
  offeredJobs, needsEducationChoice, pendingEventSubject,
  relationshipOdds, meetingChances, proposalChance, pregnancyChance, oneNightChance,
  respondToEncounter, proposeMarriage, endRelationship, normalizeSurname
} from './engine.js?v=family-years-1';

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
const journalText = value => esc(String(value ?? '').replace(/\$\d[\d,]*(?:\.\d+)?/g, 'a share of the family legacy'));
const number = value => Number(value || 0).toFixed(1);
const pct = value => `${Math.round((Number(value) || 0) * 100)}%`;
const aptitude = value => value > 0 ? `+${value}` : String(value);
const aptitudeLabel = value => value >= 2 ? 'Comes naturally' : value === 1 ? 'Quick learner' : value === 0 ? 'Steady learner' : value === -1 ? 'Takes practice' : 'Hard-earned growth';
const skillLabel = key => SKILLS.find(s => s.key === key)?.label || ({health:'Health',stability:'Mental stability',lifestyle:'Lifestyle'}[key]) || key;
const stageNames = {baby:'The beginning',child:'Growing roots',teen:'Finding your way',adult:'A life of your own',elder:'What you leave behind'};
const career = () => JOBS.find(j => j.id === state.jobId);
const focusUsed = () => Object.values(state.focus).reduce((a,b) => a+b, 0);

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
    <section class="profile-bar" aria-label="Your life"><div class="portrait">${avatar(state)}</div><div class="profile-copy"><p class="eyebrow">GENERATION ${state.generation}</p><h1 class="person-name">${esc(state.name)}</h1><p class="muted">${state.age<3?'A whole life ahead':state.age<18?'Student':state.education.status==='college'?'College student':career()?.name || 'Finding a path'}</p></div><div class="profile-age"><strong>${state.age}</strong><span>YEARS OLD</span></div></section>
    <div class="status-strip" aria-label="At a glance">${[['Health',number(stats.health)],['Stability',number(stats.stability)],['Lifestyle',state.lifestyle]].map(([label,value])=>`<button class="status-pill" data-action="tab" data-tab="character" aria-label="${label} ${value} out of 10. View your character."><span class="status-label">${label}</span><strong>${value}<small>/10</small></strong></button>`).join('')}</div>
      <main class="main-column" id="main-content"><div class="chapter-heading"><h2>${isYear ? stageNames[lifeStage] : ({career:'Find your calling',family:'A life, connected',character:'This is you'}[activeTab])}<span style="color:var(--orange)">.</span></h2><p>${isYear ? (state.age<3 ? 'Small choices. A whole world ahead.' : 'Choose what matters this year.') : ({career:'Find a role that fits your strengths.',family:'Grow together. Leave a legacy.',character:'Your starting point is only part of the story.'}[activeTab])}</p></div>
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

function statsView() {
  const stats = effectiveStats(state);
  return `<section class="panel stats-panel"><div class="panel-heading"><h3>Your character</h3><span class="tag">1–10</span></div><div class="stat-list">${SKILLS.map(skill => {
    const value = stats[skill.key]; const apt = state.aptitudes[skill.key];
    return `<div class="stat-row"><div class="stat-heading"><span class="stat-name">${esc(skill.label)}</span><span class="aptitude ${apt>0?'positive':apt<0?'negative':''}" title="Growth affinity ${aptitude(apt)}: ${aptitudeLabel(apt)}" aria-label="Growth affinity ${aptitude(apt)}">${aptitude(apt)}</span><strong class="stat-value">${number(value)}</strong></div><div class="stat-track" role="meter" aria-label="${esc(skill.label)}" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${number(value)}"><span class="stat-fill" style="--stat-color:var(--${skill.key});width:${value*10}%"></span></div></div>`;
  }).join('')}</div><p class="trait-legend"><span class="aptitude positive">+3</span> to <span class="aptitude negative">−3</span> = growth affinity</p><div class="vitals-grid">${[['health','Health','heart'],['stability','Stability','spark']].map(([key,label,ico]) => `<div class="vital"><span class="vital-label">${icon(ico)}${label}</span><span class="vital-value">${number(stats[key])}<small>/10</small></span>${key==='stability'?'<span class="muted">Higher is calmer</span>':''}</div>`).join('')}<div class="vital"><span class="vital-label">Height</span><span class="vital-value">${Math.round(state.height)}<small> cm</small></span></div></div></section>`;
}

function outcomeSummary(outcome, subject) {
  const changes = Object.entries(outcome.statChanges || {}).map(([key,value]) => `${skillLabel(key)} ${value>0?'+':''}${value} permanently`);
  for (const [key,value] of Object.entries(outcome.subjectChanges || {})) changes.push(`${subject?.name || 'Your loved one'}: ${skillLabel(key)} ${value>0?'+':''}${value}`);
  for (const [key,value] of Object.entries(outcome.playerChanges || {})) changes.push(`You: ${skillLabel(key)} ${value>0?'+':''}${value}`);
  if (outcome.relationship) changes.push(`Bond with ${subject?.name || 'your loved one'} ${outcome.relationship>0?'+':''}${outcome.relationship}`);
  const temporary = { ...outcome.modifiers, ...(outcome.lifestyle ? {lifestyle:outcome.lifestyle} : {}) };
  for (const [key,value] of Object.entries(temporary)) changes.push(`${skillLabel(key)} ${value>0?'+':''}${value} for ${outcome.years} year${outcome.years===1?'':'s'}`);
  return changes.join(' · ');
}

function eventDecisionView() {
  const pending = state.pendingEvents[0];
  if (!pending) return '';
  const event = EVENTS.find(event => event.id===pending.eventId);
  const subject = pendingEventSubject(state,pending);
  const story = text => String(text).replaceAll('{name}',subject?.name || 'your loved one');
  return `<section class="panel event-decision" aria-labelledby="event-title" data-event-id="${esc(event.id)}" data-subject-id="${esc(pending.subjectId || '')}"><div class="panel-heading"><span class="eyebrow">${pending.subjectId?'A FAMILY MOMENT':'A TURN IN YOUR STORY'}</span><span class="tag">${state.pendingEvents.length} CHOICE${state.pendingEvents.length===1?'':'S'} LEFT</span></div><h3 id="event-title" tabindex="-1">${esc(event.name)}</h3><p class="event-context">${pending.subjectId?`${esc(subject?.name)} · Age ${subject?.age} · Your age ${pending.age}`:`Age ${pending.age}`} · Year in review</p><p class="section-description">${esc(story(event.description))}</p><div class="event-choices">${event.choices.map(choice=>`<button class="event-option" data-action="event-choice" data-event="${esc(event.id)}" data-subject="${esc(pending.subjectId || '')}" data-choice="${esc(choice.id)}"><strong>${esc(choice.label)} ${icon('arrow')}</strong><span>${esc(story(choice.description))}</span><span class="event-consequences">${esc(outcomeSummary(choice,subject))}</span></button>`).join('')}</div><p class="form-note">Choose before moving on. Your decision and its consequences will be saved.</p></section>`;
}

function focusEventDecision() {
  navigate('year');
  const heading = app.querySelector('#event-title');
  heading?.focus({preventScroll:true});
  heading?.scrollIntoView?.({block:'center',behavior:'instant'});
}

function effectsView() {
  return `<section class="panel"><div class="panel-heading"><h3>Life’s little twists</h3><span class="tag">${state.effects.length} active</span></div>${state.effects.length ? `<div class="effect-list">${state.effects.map(effect => `<div class="effect-card ${Object.values(effect.modifiers || {}).some(value => value<0)||effect.lifestyle<0?'negative':'positive'}"><div class="effect-title">${icon('spark')} ${esc(effect.name)}</div><p>${esc(effect.description)}</p><div class="effect-meta">${esc(outcomeSummary(effect))}<br>${effect.years} year${effect.years===1?'':'s'} remaining</div></div>`).join('')}</div>` : `<div class="empty-state">${icon('spark')}<p>A clean slate.<br>No active buffs or setbacks.</p></div>`}<button class="button ghost small" data-action="odds">View this year’s odds ${icon('arrow')}</button></section>`;
}

function yearView() {
  if (needsEducationChoice(state)) return `<section class="panel education-prompt"><div class="panel-heading"><h3>Your next chapter</h3><span class="tag">A NEW CHOICE</span></div><p class="section-description">Go to college, or start working. Choose your path before your next year begins.</p><button class="button primary" data-action="tab" data-tab="career">College or career? ${icon('arrow')}</button></section>${retirementNotice()}${connectionNotice()}${journalView()}`;
  const baby = state.age < 3;
  const disabled = state.ended || state.needsSuccession || state.pendingEvents.length>0;
  return `${state.education.status==='college'?collegeProgressView():''}<section class="panel focus-panel"><div class="panel-heading"><h3>${baby ? 'Ask for attention' : 'Your focus'}</h3><span class="tag">${baby ? 'AGES 0–2' : `${focusUsed()} / 12 POINTS`}</span></div><p class="section-description">${baby ? 'Choose how much you cry this year, from 1 to 5.' : 'Share 12 points. Each focus takes 0–5.'}</p>
    ${baby ? `<div class="cry-control" role="group" aria-label="Cry level"><div class="cry-heading"><strong>Cry level <span>${state.cryLevel}/5</span></strong><span>${['A little fuss','Gentle cries','Regular cries','Frequent cries','Very frequent cries'][state.cryLevel-1]}</span></div><div class="cry-levels">${[1,2,3,4,5].map(level=>`<button class="cry-level ${state.cryLevel===level?'selected':''}" data-action="baby" data-level="${level}" aria-label="Cry level ${level} of 5" aria-pressed="${state.cryLevel===level}" ${disabled?'disabled':''}>${level}</button>`).join('')}</div><div class="cry-scale-labels"><span>Less crying</span><span>More crying</span></div><p class="form-note">Crying brings care, skill growth, and a stronger bond with living parents. Higher levels also add more strain to their stability.</p><button class="button ghost small" data-action="tab" data-tab="family">See your parents & bonds ${icon('arrow')}</button></div>` : focusView(disabled)}
    </section>
    ${forecastView()}
    ${baby?birthSkillsView():''}
    ${state.effects.length?`<button class="effect-summary button secondary" data-action="tab" data-tab="character">${icon('spark')} ${state.effects.length} active life effect${state.effects.length===1?'':'s'} · View ${icon('arrow')}</button>`:''}
    ${retirementNotice()}${connectionNotice()}${journalView()}`;
}

const changeNumber = value => `${value>0?'+':''}${Number(value).toFixed(2)}`;
function changesView(changes, lifestyle) {
  const entries = [...Object.entries(changes || {}), ...(lifestyle?[['lifestyle',lifestyle]]:[])];
  return `<div class="year-changes">${entries.map(([key,value])=>`<div class="year-change" data-stat="${esc(key)}"><span>${esc(skillLabel(key))}</span><strong class="${value.change>0?'gain':value.change<0?'loss':'unchanged'}">${changeNumber(value.change)}</strong><small>${number(value.before)} → ${number(value.after)}</small></div>`).join('')}</div>`;
}

function forecastView() {
  if (state.ended || state.needsSuccession || state.pendingEvents.length) return '';
  const forecast = annualForecast(state);
  if (!forecast) return '';
  return `<section class="panel forecast-panel" aria-label="Expected changes next year"><div class="panel-heading"><h3>Expected next year</h3><span class="tag">AGE ${forecast.toAge}</span></div>${changesView(forecast.stats,forecast.lifestyle)}${forecast.parents?.length?`<details class="forecast-parents"><summary>Your parents' expected changes</summary>${forecast.parents.map(parent=>`<p><strong>${esc(parent.name)}</strong><span>Stability ${changeNumber(parent.stability.change)} &middot; Bond ${changeNumber(parent.relationship.change)}</span></p>`).join('')}</details>`:''}<p class="form-note">Based on your current choices, growth, and expiring effects. Random events, deaths, births, new relationships, and decisions can change the result.</p></section>`;
}

function yearSummaryModal() {
  const summary=state.yearSummary;
  if (!summary || summary.dismissed) return;
  openModal(`Age ${summary.toAge} &middot; Your year`, `<p class="year-review-intro">What changed from age ${summary.fromAge} to ${summary.toAge}.</p>${changesView(summary.stats,summary.lifestyle)}${summary.parents?.length?`<details class="forecast-parents"><summary>Your parents' changes</summary>${summary.parents.map(parent=>`<p><strong>${esc(parent.name)}</strong><span>Stability ${changeNumber(parent.stability.change)} &middot; Bond ${changeNumber(parent.relationship.change)}</span></p>`).join('')}</details>`:''}${summary.events?.length?`<details class="year-review-events" open><summary>Moments from your year</summary><ul>${summary.events.map(event=>`<li><strong>${journalText(event.title)}</strong><p>${journalText(event.text)}</p></li>`).join('')}</ul></details>`:''}${state.pendingEvents.length?'<p class="form-note">You have decisions to make next. Their effects are added after you choose.</p>':''}`, '<button class="button primary" data-action="close">Continue '+icon('arrow')+'</button>');
  showingYearSummary=true;
  modalRoot.querySelector('.modal').classList.add('year-review-modal');
  modalRoot.querySelector('.modal-backdrop').classList.add('year-review-backdrop');
}

function birthSkillsView() {
  const stats = effectiveStats(state);
  return `<section class="panel birth-skills"><div class="panel-heading"><h3>Small beginnings</h3><span class="tag">SAME SKILLS · 1–10</span></div><p class="section-description">Every skill starts small. Your −3 to +3 affinity shapes how quickly it grows.</p><div class="birth-skill-grid">${SKILLS.map(skill=>`<div class="birth-skill"><span>${esc(skill.label)}</span><strong>${number(stats[skill.key])}<small>/10</small></strong><span class="aptitude ${state.aptitudes[skill.key]>0?'positive':state.aptitudes[skill.key]<0?'negative':''}" aria-label="${esc(skill.label)} affinity ${aptitude(state.aptitudes[skill.key])}">${aptitude(state.aptitudes[skill.key])}</span></div>`).join('')}</div><button class="button ghost small" data-action="tab" data-tab="character">View all your stats ${icon('arrow')}</button></section>`;
}

function lifestyleView() {
  const descriptions = ['The essentials', 'A little breathing room', 'Finding your footing', 'Everyday comfort', 'Living well', 'Room to enjoy life', 'A comfortable abundance', 'A taste of luxury', 'An exceptional life', 'Every comfort imaginable'];
  return `<section class="lifestyle-summary" aria-label="Lifestyle"><div><span class="eyebrow">EVERYDAY COMFORT</span><h3>Lifestyle <strong>${state.lifestyle}<small> / 10</small></strong></h3><p>${descriptions[state.lifestyle-1]}</p></div><div class="lifestyle-scale" role="meter" aria-label="Lifestyle" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${state.lifestyle}">${Array.from({length:10},(_,i)=>`<span class="${i<state.lifestyle?'filled':''}" style="--level:${i+1}"></span>`).join('')}</div></section>`;
}

function focusView(disabled) {
  const studying = state.age<18 || state.education.status==='college';
  const rows = [['work',state.age<18?'School':studying?'College':'Career',studying?'Learn & develop your mind':'Success & lifestyle',studying?'school':'career'],['social','Friends','Connection & confidence','social'],['family','Family','Build bonds & help your kids grow','family'],['self','Yourself','Learn, grow & relax','self']];
  return `<div class="focus-list">${rows.map(([key,label,description,ico]) => `<div class="focus-row"><span class="focus-icon">${icon(ico)}</span><div class="focus-copy"><h4>${label}</h4><p>${description}</p><div class="focus-scale" aria-hidden="true">${Array.from({length:5},(_,i)=>`<span class="${i<state.focus[key]?'filled':''}"></span>`).join('')}</div></div><div class="stepper" role="group" aria-label="${label} focus"><button data-action="focus" data-key="${key}" data-delta="-1" aria-label="Decrease ${label.toLowerCase()} focus" ${state.focus[key]<=0||disabled?'disabled':''}>${icon('minus')}</button><output aria-label="${label} focus level">${state.focus[key]}</output><button data-action="focus" data-key="${key}" data-delta="1" aria-label="Increase ${label.toLowerCase()} focus" ${state.focus[key]>=5||focusUsed()>=12||disabled?'disabled':''}>${icon('plus')}</button></div></div>`).join('')}</div><div class="budget-bar"><div class="budget-summary"><span>${focusUsed()===12?'All your energy has a place.':`${12-focusUsed()} focus point${12-focusUsed()===1?'':'s'} still available`}</span><strong>${focusUsed()} / 12</strong></div><div class="budget-track"><span style="width:${focusUsed()/12*100}%"></span></div></div>`;
}

function journalView() {
  const entries = showAllHistory ? state.history : state.history.slice(0,8);
  return `<section class="panel journal-panel"><div class="panel-heading"><h3>The story so far</h3><span class="tag">LIFE JOURNAL</span></div><div class="journal-list">${entries.map(entry => `<article class="journal-entry ${esc(entry.kind || 'neutral')}"><div class="journal-age"><strong>${entry.age}</strong><span>${entry.generation===state.generation?'AGE':`GEN ${entry.generation}`}</span></div><span class="journal-marker"></span><div class="journal-content"><h4>${esc(entry.title)}</h4><p>${journalText(entry.text)}</p></div></article>`).join('')}</div>${state.history.length>8?`<button class="button ghost small" data-action="history">${showAllHistory?'Show recent years':'Read the whole story'} ${icon('arrow')}</button>`:''}</section>`;
}

function collegeProgressView() {
  const years = state.education.years;
  return `<section class="panel college-progress"><div class="panel-heading"><h3>${icon('school')} College</h3><span class="tag">${years}/4 YEARS COMPLETE</span></div><div class="budget-track" role="progressbar" aria-label="College progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${years}"><span style="width:${years/4*100}%"></span></div><p class="form-note">${4-years} more year${years===3?'':'s'} to graduation. College focus builds your skills. You’ll receive 15 job offers when you graduate.</p></section>`;
}

function careerView() {
  if (state.age<18) return `<section class="panel"><div class="panel-heading"><h3>${icon('school')} Your future starts here</h3><span class="tag">AGE 18</span></div><p class="section-description">At 18, choose college or a job from 10 offers. Four years of college opens a new list of 15 offers, including graduate careers.</p><p class="form-note">There are ${JOBS.length} different careers in the world. The skills you build now help shape your options.</p></section>`;
  if (state.education.status==='college') return `${collegeProgressView()}<section class="panel"><p class="section-description">Your career chapter comes after graduation. Head back to your year to set your college focus and keep growing.</p><button class="button primary" data-action="tab" data-tab="year">Continue studying ${icon('arrow')}</button></section>`;
  const current = career();
  const offers = offeredJobs(state);
  const choosing = needsEducationChoice(state);
  const intro = choosing ? `<section class="panel education-choice"><div class="panel-heading"><h3>${icon('school')} College or a career?</h3><span class="tag">YOUR CHOICE</span></div><p class="section-description">Spend four years in college and graduate with 15 job offers, including careers that need a degree. Or start working by choosing one of the 10 jobs below.</p><button class="button primary" data-action="education" data-path="college">Go to college · 4 years ${icon('arrow')}</button></section>` : `<section class="panel"><div class="panel-heading"><h3>${current ? esc(current.name) : 'Choose your next role'}</h3>${current?'<button class="button ghost small" data-action="quit">Leave job</button>':`<span class="tag">${state.education.status==='graduate'?'COLLEGE GRADUATE':'WORKING LIFE'}</span>`}</div><p class="section-description">${current?`${state.jobYears} year${state.jobYears===1?'':'s'} in this role. Career focus improves your performance and lifestyle as the years pass.`:'Your skills and career focus shape your success and lifestyle.'}</p>${lifestyleView()}${current?`<div class="job-metrics"><span>Job performance</span><strong>${pct(state.performance)}</strong></div>`:''}</section>`;
  return `${intro}<div class="panel-heading career-offer-heading"><h3>Your ${offers.length} job offers</h3><span class="tag">${JOBS.length} CAREERS</span></div><p class="section-description">Skill affinities show which abilities each role uses most: +3 is strongest. Base lifestyle can rise with performance and experience.</p><div class="job-grid">${offers.map(job => {
    const eligibility = canTakeJob(state,job); const fit = jobFit(state,job); const selected = state.jobId===job.id;
    return `<article class="job-card ${selected?'selected':''} ${!eligibility.ok&&!selected?'locked':''}" data-job-id="${esc(job.id)}"><div class="job-top"><span class="tag">${esc(job.category)}</span><span class="job-lifestyle"><small>Lifestyle </small>${job.baseLifestyle}<small>/10</small></span></div><h3>${esc(job.name)}</h3>${selected?'<span class="tag current-role">YOUR ROLE</span>':''}<p class="job-description">${esc(job.description)}</p><div class="job-affinities" aria-label="Skill affinities">${Object.entries(job.affinities).sort((a,b)=>b[1]-a[1]).map(([key,value])=>`<span class="job-affinity" data-skill="${key}">${esc(skillLabel(key))} <strong>+${value}</strong></span>`).join('')}</div><div class="job-metrics"><span>Your skill fit</span><strong>${pct(fit)}</strong></div><div class="fit-track"><span style="width:${fit*100}%"></span></div><p class="requirement">Age ${job.minAge}+${job.requiresCollege?' · College degree':''}${Object.entries(job.requirements).length?' · '+Object.entries(job.requirements).map(([key,value])=>`${esc(skillLabel(key))} ${value}+`).join(' · '):' · No skill minimum'}</p><div class="job-actions"><button class="button ${selected?'ghost':'secondary'} small" data-action="job" data-id="${esc(job.id)}" ${selected||!eligibility.ok||state.ended||state.needsSuccession?'disabled':''}>${selected?'Currently employed':'Choose career'} ${selected?icon('check'):icon('arrow')}</button>${!eligibility.ok&&!selected?`<span class="muted">${esc(eligibility.reason)}</span>`:''}</div></article>`;
  }).join('')}</div>`;
}

function miniStats(person) {
  return `<div class="mini-stats">${SKILLS.map(skill => `<span title="${esc(skill.label)}; growth affinity ${aptitude(person.aptitudes?.[skill.key]??0)}">${esc(skill.label)} <strong>${number(person.stats[skill.key])}</strong></span>`).join('')}<span>Health <strong>${number(person.stats.health)}</strong></span><span>Stability <strong>${number(person.stats.stability)}</strong></span></div>`;
}

function partnerLabel(person) {
  if (person.gender==='female') return person.married?'Wife':'Girlfriend';
  if (person.gender==='male') return person.married?'Husband':'Boyfriend';
  return person.married?'Spouse':'Partner';
}

function relationshipMeter(person) {
  return `<div class="relationship-summary"><span>Relationship</span><strong>${number(person.relationship)}<small>/10</small></strong></div><div class="relationship-meter" role="meter" aria-label="Relationship with ${esc(person.name)}" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${person.relationship}"><span style="width:${person.relationship*10}%"></span></div>`;
}

function profileStats(person) {
  return `<div class="profile-stats">${SKILLS.map(skill=>`<div class="profile-stat" data-skill="${skill.key}"><span>${esc(skill.label)}</span><strong>${number(person.stats[skill.key])}<small>/10</small></strong><span class="aptitude ${person.aptitudes[skill.key]>0?'positive':person.aptitudes[skill.key]<0?'negative':''}" aria-label="${esc(skill.label)} growth affinity ${aptitude(person.aptitudes[skill.key])}">${aptitude(person.aptitudes[skill.key])}</span></div>`).join('')}${[['health','Health'],['stability','Stability']].map(([key,label])=>`<div class="profile-stat" data-skill="${key}"><span>${label}</span><strong>${number(person.stats[key])}<small>/10</small></strong></div>`).join('')}<div class="profile-stat"><span>Lifestyle</span><strong>${person.lifestyle}<small>/10</small></strong></div><div class="profile-stat"><span>Height</span><strong>${Math.round(person.height)}<small> cm</small></strong></div></div><p class="profile-affinity-note">Small −3 to +3 ratings show growth affinity.</p>`;
}

function pregnancyView() {
  if (!state.pregnancy) return '';
  const carrierName = state.pregnancy.carrierId===state.id ? 'You are' : `${esc(state.pregnancy.otherParent.name)} is`;
  return `<section class="panel pregnancy-panel"><div class="panel-heading"><h3>${icon('heart')} A new chapter on the way</h3><span class="tag">EXPECTING</span></div><p class="section-description">${carrierName} expecting a baby. Your family will welcome the new arrival when you reach age ${state.pregnancy.dueAge}.</p><p class="form-note">Family time builds your children’s abilities and your bond with them. Each dependent child reduces your lifestyle by one level and brings a social boost.</p></section>`;
}

function loveView() {
  if (state.age<18) return '';
  const blocked = state.pendingEvents.length>0 || state.ended || state.needsSuccession;
  if (state.partner && state.partner.alive!==false) {
    const person = state.partner;
    const proposal = proposalChance(state);
    const pregnancy = pregnancyChance(state);
    const living = person.alive!==false;
    return `<section class="panel partner-panel" data-person-id="${esc(person.id)}"><div class="panel-heading"><h3>${icon('heart')} Your life together</h3><span class="tag">${living?partnerLabel(person).toUpperCase():'REMEMBERED'}</span></div><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3>${esc(person.name)}</h3><p>${person.age} years old · ${person.yearsTogether} year${person.yearsTogether===1?'':'s'} together</p></div></div>${relationshipMeter(person)}<p class="form-note">Family focus strengthens your bond. ${living?`This relationship brings social ability +${person.married?'0.9':'0.7'}, stability +${person.married?'0.8':'0.6'}, and lifestyle −1.`:'Their place in your story remains.'}</p>${profileStats(person)}${living?`<div class="relationship-actions">${!person.married?`<button class="button primary" data-action="propose" ${blocked||!proposal?'disabled':''}>Propose marriage <span>${pct(proposal)} chance</span></button><p class="form-note">${person.lastProposalAge===state.age?'You have already proposed this year. You can try again next year.':'One proposal each year. A stronger bond and more years together improve the odds.'}</p>`:'<p class="married-note">Married · A shared chapter</p>'}<p class="form-note">${state.pregnancy?'Your family is expecting.':pregnancy?`Pregnancy chance this year: ${pct(pregnancy)}. Marriage makes pregnancy much more likely than dating.`:'No pregnancy chance this year.'}</p><button class="button ghost small" data-action="breakup" ${blocked?'disabled':''}>${person.married?'End marriage':'End relationship'}</button></div>`:''}</section>${pregnancyView()}`;
  }
  const remembered=state.partner?.alive===false ? `<section class="panel remembered-partner"><div class="panel-heading"><h3>Remembering your partner</h3><span class="tag">REMEMBERED</span></div><div class="family-header"><div class="family-avatar">${avatar(state.partner,true)}</div><div class="family-meta"><h3>${esc(state.partner.name)}</h3><p>Died at age ${state.partner.age}</p></div></div>${relationshipMeter(state.partner)}<details class="family-details"><summary>Your shared chapter</summary>${profileStats(state.partner)}</details></section>` : '';
  const chance = meetingChances(state);
  const anyChance = 1-Math.pow(1-chance.chance,chance.slots);
  const people = state.encounters;
  encounterIndex = Math.max(0,Math.min(encounterIndex,people.length-1));
  const person = people[encounterIndex];
  return `${remembered}${pregnancyView()}<section class="panel dating-panel"><div class="panel-heading"><h3>${icon('heart')} People you meet</h3><span class="tag">${people.length} AVAILABLE</span></div><p class="section-description">Attractiveness, social ability, and lifestyle shape how often you meet someone and the people you attract.</p><div class="dating-chances"><span>Chance of meeting someone next year <strong>${pct(anyChance)}</strong></span><span>Up to <strong>${chance.slots}</strong> people with your current appeal</span></div>${people.length?`<p class="form-note">Explore their stats before deciding. Unanswered invitations pass when you advance a year.</p><div class="encounter-list" data-total="${people.length}">${people.length>1?`<div class="encounter-pagination"><button class="button ghost small" data-action="prospect-page" data-delta="-1" aria-label="Previous person" ${encounterIndex===0?'disabled':''}>Back</button><span>${encounterIndex+1} of ${people.length}</span><button class="button ghost small" data-action="prospect-page" data-delta="1" aria-label="Next person" ${encounterIndex===people.length-1?'disabled':''}>Next</button></div>`:''}<article class="encounter-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><h3 tabindex="-1">${esc(person.name)}</h3><p>${person.age} years old</p></div></div>${profileStats(person)}<div class="encounter-actions"><button class="button primary" data-action="encounter" data-choice="relationship" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Pursue a relationship <span>${pct(relationshipOdds(state,person))} chance</span></button><button class="button secondary" data-action="encounter" data-choice="casual" data-id="${esc(person.id)}" ${blocked?'disabled':''}>One-night stand <span>${pct(oneNightChance(state,person))} mutual interest</span></button><button class="button ghost" data-action="encounter" data-choice="ignore" data-id="${esc(person.id)}" ${blocked?'disabled':''}>Ignore</button></div><p class="form-note">Either approach can be declined. A one-night stand may lead to pregnancy. Starting a relationship closes the other invitations.</p></article></div>`:`<div class="empty-state">${icon('heart')}<h4>No new connection this year</h4><p>Some years are quiet. Keep building your life and see who you meet next year.</p></div>`}</section>`;
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
  const explain = 'From age 65, retire and continue as any eligible child. If there are no children, choose a sibling. If neither is available, give your legacy to a child from another family and begin their story.';
  if (state.age<65 && !state.needsSuccession) return `<section class="panel retirement-panel"><div class="panel-heading"><h3>What carries forward</h3><span class="tag">AGE 65</span></div><p class="section-description">${explain}</p>${lifestyleView()}<p class="form-note">All living children share your inheritance equally, whichever child you play next. Your surname stays in the family through both sons and daughters.</p></section>`;
  const titles = {children:state.alive===false?'Continue in the next generation':'Retire into the next generation',siblings:'Keep the story in your family',beneficiary:'A new family, your legacy'};
  const descriptions = {
    children:'Choose any eligible child. All living children receive an equal share of the inheritance, including the ones you do not choose.',
    siblings:'With no eligible children, you can continue as one of your siblings. Your chosen sibling receives the whole inheritance; the others keep their own resources.',
    beneficiary:'With no eligible children or siblings, give your whole inheritance to this child. They begin with low stats and a different surname.'
  };
  return `<section class="panel retirement-panel" data-route="${info.route}"><div class="panel-heading"><h3>${titles[info.route]}</h3><span class="tag">${state.needsSuccession?'NEXT CHAPTER':'RETIREMENT'}</span></div><p class="section-description">${descriptions[info.route]}</p>${!info.eligible?`<p class="form-note retirement-blocked">${esc(info.reason)}</p>`:''}<div class="heir-list">${info.candidates.map(person=>`<article class="heir-candidate ${info.route==='beneficiary'?'beneficiary-preview':''}" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${info.route==='children'?'YOUR CHILD':info.route==='siblings'?'YOUR SIBLING':'A NEW BEGINNING'}</span><h3>${esc(person.name)}</h3><p>${person.age} years old · ${esc(person.familyName)} family</p></div></div>${info.route==='beneficiary'?profileStats(person):`<details class="family-details"><summary>Skills & wellbeing</summary>${miniStats(person)}</details>`}<button class="button primary" data-action="heir" data-id="${esc(person.id)}" ${info.eligible?'':'disabled'}>${state.alive===false?'Continue':'Retire'} & play as ${esc(person.name.split(' ')[0])} ${icon('arrow')}</button></article>`).join('')}</div><p class="form-note">This closes your current playable chapter. Your heir keeps their own age, stats, and growth affinities. ${info.route==='beneficiary'?'A different surname starts a new family line.':'The family surname stays yours, regardless of gender.'}</p></section>`;
}

function personCard(person, role, child = false) {
  return `<article class="family-card" data-person-id="${esc(person.id)}"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${role}</span><h3>${esc(person.name)}</h3><p>${person.age} years old${person.alive===false?' · Remembered':` · Stability ${number(person.stats.stability)}/10`}</p></div></div><p class="family-lifestyle">Lifestyle <strong>${person.lifestyle}/10</strong>${person.age<18?' · Family household':''}</p>${Number.isFinite(person.relationship)?relationshipMeter(person):''}<details class="family-details" ${role.startsWith('PARENT')?'open':''}><summary>Skills & wellbeing</summary>${profileStats(person)}</details>${child?`<div class="family-card-footer"><span>${person.alive!==false?'An equal share of your legacy':'Remembered with love'}</span></div>`:''}</article>`;
}

function parentsView() {
  if (!state.parents.length) return '';
  return `<details class="panel roots-panel" ${state.age<18?'open':''}><summary>The people who raised you</summary><p class="section-description">${state.age<3?'Crying builds your bond and brings care. More crying can strain parent stability; their wellbeing also shapes your childhood.':'Family focus supports your parents and gives your children a stronger start.'}</p><div class="family-grid">${state.parents.map((p,i)=>personCard(p,i===0?'PARENT ONE':'PARENT TWO')).join('')}</div></details>`;
}

function familyView() {
  const childAllowed = !state.pendingEvents.length && state.age>=18 && state.children.length<(state.pregnancy?5:6) && state.lastChildAge!==state.age && !state.ended && !state.needsSuccession;
  return `${state.age>=65||state.needsSuccession?retirementView():''}${loveView()}${parentsView()}
    <section class="panel"><div class="panel-heading"><h3>The next generation</h3><button class="button secondary small" data-action="child" ${childAllowed?'':'disabled'}>${icon('plus')} Adopt a child</button></div><p class="section-description">${state.age<18?'Parenthood opens at age 18. Until then, there’s a whole childhood to live.':state.lastChildAge===state.age?'A new arrival this year. You can welcome another child next year.':'Welcome up to six children through pregnancy or adoption. Each dependent child costs one lifestyle level; every living child adds a small social boost. Family focus improves their skills and your bond.'}</p>${state.children.length?`<div class="family-grid child-grid">${state.children.map(c=>personCard(c,'YOUR CHILD',true)).join('')}</div>`:`<div class="empty-state">${icon('family')}<h4>A branch yet to grow</h4><p>Your children will appear here. Build their skills,<br>then carry the story forward through them.</p></div>`}</section>
    ${state.age<65&&!state.needsSuccession?retirementView():''}
    ${state.siblings.length?`<section class="panel"><div class="panel-heading"><h3>Your siblings</h3><span class="tag">FAMILY</span></div><p class="section-description">When you retire without children, an eligible sibling can continue your story.</p><div class="family-grid sibling-grid">${state.siblings.map(person=>personCard(person,'YOUR SIBLING')).join('')}</div></section>`:''}
    ${state.lineage.length?`<section class="panel"><div class="panel-heading"><h3>Those who came before</h3><span class="tag">${state.lineage.length} CHAPTERS</span></div><div class="legacy-list">${state.lineage.map(p=>`<div class="legacy-card"><strong>${esc(p.name)}</strong><span>Generation ${esc(p.generation ?? '—')} · Age ${esc(p.age ?? '—')}</span></div>`).join('')}</div></section>`:''}`;
}

function characterView() {
  const stats = effectiveStats(state);
  return `${statsView()}${effectsView()}<details class="panel character-guide"><summary>How your character grows</summary><div class="help-grid"><div class="help-item"><h4>Nature & nurture</h4><p>Skills run from 1–10. The −3 to +3 rating is your lifelong growth affinity: positive means faster growth, negative means more practice. Every skill can improve.</p></div><div class="help-item"><h4>Health · ${number(stats.health)}/10</h4><p>Self-care supports health. Injuries and illness can temporarily reduce it; it gradually declines in later life.</p></div><div class="help-item"><h4>Mental stability · ${number(stats.stability)}/10</h4><p>Higher means calmer and more resilient. Low stability raises the odds of impulsive decisions, conflict, and distress. Rest, friends, and family help. These are fictional game probabilities.</p></div><div class="help-item"><h4>Attractiveness over time</h4><p>Your natural peak is around age ${state.appearancePeakAge}. Attractiveness slowly declines after that, with individual differences and life events shaping your story.</p></div><div class="help-item"><h4>Height · ${Math.round(state.height)} cm</h4><p>${state.age<18?'You are still growing. Your adult height will be reached at 18.':'You have reached your adult height.'}</p></div><div class="help-item"><h4>Lifestyle · ${state.lifestyle}/10</h4><p>${state.age<18?'Until age 18, you share the household lifestyle with your parents. Your own career and resources set it in adulthood.':'Your career success and family legacy support your comfort. Your legacy is shared equally among your children.'}</p></div></div></details>`;
}

function endPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>A life, fully lived.</h3><span class="tag">AGE ${state.age}</span></div><p class="section-description">${esc(state.name)}’s story has come to a close. Your legacy can continue through a child, sibling, or a child from another family.</p><button class="button primary" data-action="new">Begin another story ${icon('arrow')}</button></section>`;
}

function successionPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>The story goes on.</h3><span class="tag">NEXT GENERATION</span></div><p class="section-description">${state.alive===false?`${esc(state.name)} died at age ${state.age}.`:'This playable chapter closes at age 85.'} Visit Family to choose your next character: a child, a sibling if you have no children, or a child from another family if neither is available.</p><button class="button primary" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></section>`;
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

function helpModal() {
  openModal('A life, one year at a time.', `<div class="help-grid"><div class="help-item"><h4>01 · Start small</h4><p>At ages 0 to 2, set crying from 1 to 5. Crying helps skills and parent bonds grow; higher levels put more strain on parents. Their stress and support can affect your childhood.</p></div><div class="help-item"><h4>02 · Spend your time</h4><p>From age 3, share 12 focus points across school or career, friends, family, and yourself. Each takes 0–5. Press Next year when you’re ready.</p></div><div class="help-item"><h4>03 · Work with your nature</h4><p>Skills range from 1–10. The −3 to +3 rating is growth affinity. Your choices determine where you improve; affinity changes how fast.</p></div><div class="help-item"><h4>04 · Leave room for life</h4><p>There are ${EVENTS.length} possible events. Each has a small, independent yearly chance based on your age, focus, career, and stats. Up to five ordinary events can happen. Death risks are separate and depend on age and wellbeing. Some events ask you to choose, with consequences shown before you decide.</p></div><div class="help-item"><h4>05 · Find your path</h4><p>At 18, choose a job from 10 offers or attend college for four years. Graduates receive 15 offers. There are 100 careers, each with skill affinities and a base lifestyle from 1 to 10.</p></div><div class="help-item"><h4>06 · Grow a legacy</h4><p>Meet people from 18, build a relationship, and propose once a year. Pregnancy is rare while dating and much more likely in marriage; a baby arrives the following year. Adults can also adopt. Family focus develops children’s skills and strengthens everyone’s bonds. Retire from 65 and play as a child. With no children, choose a sibling; with neither, give your legacy to a low-stat child with a different surname. At 85, choose the next chapter. All living children share the inheritance equally. Death can end any chapter early, with an heir available to continue.</p></div></div><p class="form-note">Mortality uses a real-world age baseline with simplified stat adjustments. Other events are fictional. Saves stay in this browser.</p>`, '<button class="button primary" data-action="close">Let’s live a little</button>');
}

function oddsModal() {
  const odds = eventOdds(state).filter(event=>event.chance>0).sort((a,b)=>b.chance-a.chance);
  const quiet = odds.reduce((chance,event)=>chance*(1-event.chance),1);
  const mortality = mortalityOdds(state);
  const waiting = state.pendingEvents.length || needsEducationChoice(state) || state.ended || state.needsSuccession;
  openModal('A little room for chance.', `<p class="section-description">${waiting?'Finish your current decisions to continue. These chances describe your current age and condition.':'Your age, focus, career, and effective stats shape each event’s chance.'} Ordinary events roll separately, with at most five happening in a year. Mortality is checked separately for everyone and is outside that limit.</p><div class="chance-summary"><span>A quiet year<strong>${(quiet*100).toFixed(1)}%</strong></span><span>At least one event<strong>${((1-quiet)*100).toFixed(1)}%</strong></span></div><p class="form-note">Ordinary lives average roughly one event every year or two. These totals describe ordinary events only. Death risks below are separate; a quiet year can still include a bereavement.</p><details class="event-odds"><summary>${odds.length} possible events this year</summary><div class="odds-list">${odds.map(event=>`<div class="odds-row"><span>${esc(event.name)}${EVENTS.find(candidate=>candidate.id===(event.eventId || event.id))?.choices?'<small>Includes a choice</small>':''}</span><strong>${(event.chance*100).toFixed(2)}%</strong></div>`).join('')}</div></details><p class="form-note">Individual percentages are the roll chances before the five-event limit. They are checked when you press Next year, using your choices and stats for that year.</p><details class="mortality-odds"><summary>Annual death risks</summary><p class="form-note">A real-world age baseline with simplified health and stability adjustments. Lower health raises disease risk. These are game estimates, not individual medical predictions.</p><div class="odds-list">${mortality.map(person=>`<div class="mortality-row"><span>${esc(person.name)}<small>Disease ${(person.disease*100).toFixed(3)}% &middot; Accident ${(person.accident*100).toFixed(3)}%</small></span><strong>${(person.total*100).toFixed(3)}%</strong></div>`).join('')}</div></details>`);
}

function update(action, successMessage) {
  const result = action();
  if (result?.ok===false) { toast(result.reason || 'That choice isn’t available yet.',true); return; }
  save(); render();
  if (successMessage) toast(successMessage);
  return result;
}

document.addEventListener('click', event => {
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
