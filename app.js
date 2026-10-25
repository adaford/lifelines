import {
  SKILLS, JOBS, createGame, advanceYear, setFocus, setBabyChoice, jobFit,
  canTakeJob, takeJob, quitJob, haveChild, successionInfo, succeed,
  effectiveStats, eventOdds, stage, migrateSave, chooseEducation,
  offeredJobs, needsEducationChoice
} from './engine.js?v=careers-100';

const SAVE_KEY = 'lifelines.save.v1';
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
let activeTab = 'year';
let showAllHistory = false;
let saveAvailable = true;
let loadNotice = '';
let modalReturnFocus = null;
let toastTimer;
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
const skillLabel = key => SKILLS.find(s => s.key === key)?.label || ({health:'Health',stability:'Mental stability',relaxation:'Relaxation'}[key]) || key;
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
  return createGame();
}

function save() {
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
      ${state.ended ? endPanel() : ''}${state.needsSuccession ? successionPanel() : ''}
      ${activeTab==='year' ? yearView() : activeTab==='career' ? careerView() : activeTab==='family' ? familyView() : characterView()}</main>
    <footer class="bottom-dock" aria-label="Game controls">${isYear?advanceControls():''}<nav class="nav-list" aria-label="Game sections">${[['year','Year'],['career','Career'],['family','Family'],['character','You']].map(([id,label])=>`<button class="nav-button ${activeTab===id?'active':''}" data-action="tab" data-tab="${id}" ${activeTab===id?'aria-current="page"':''}><span class="nav-icon">${icon(id)}</span><span class="nav-label">${label}</span>${id==='family'&&state.children.length?`<span class="nav-count">${state.children.length}</span>`:''}</button>`).join('')}</nav></footer>
  </div>`;
}

function advanceControls() {
  if (state.ended) return `<div class="advance-row"><button class="button primary advance-button" data-action="new">Begin another life ${icon('arrow')}</button></div>`;
  if (state.needsSuccession) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></div>`;
  if (needsEducationChoice(state)) return `<div class="advance-row"><button class="button primary advance-button" data-action="tab" data-tab="career">Choose your path ${icon('arrow')}</button></div>`;
  return `<div class="advance-row"><div class="advance-copy"><strong>Age ${state.age} → ${state.age+1}</strong><span>${state.age<3?(state.babyChoice==='cry'?'Cry for attention':'Stay quiet'):`${focusUsed()}/12 focus used`}</span></div><button class="button primary advance-button" data-action="advance">Next year ${icon('arrow')}</button></div>`;
}

function statsView() {
  const stats = effectiveStats(state);
  return `<section class="panel stats-panel"><div class="panel-heading"><h3>Your character</h3><span class="tag">1–10</span></div><div class="stat-list">${SKILLS.map(skill => {
    const value = stats[skill.key]; const apt = state.aptitudes[skill.key];
    return `<div class="stat-row"><div class="stat-heading"><span class="stat-name">${esc(skill.label)}</span><span class="aptitude ${apt>0?'positive':apt<0?'negative':''}" title="Growth affinity ${aptitude(apt)}: ${aptitudeLabel(apt)}" aria-label="Growth affinity ${aptitude(apt)}">${aptitude(apt)}</span><strong class="stat-value">${number(value)}</strong></div><div class="stat-track" role="meter" aria-label="${esc(skill.label)}" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${number(value)}"><span class="stat-fill" style="--stat-color:var(--${skill.key});width:${value*10}%"></span></div></div>`;
  }).join('')}</div><p class="trait-legend"><span class="aptitude positive">+3</span> to <span class="aptitude negative">−3</span> = growth affinity</p><div class="vitals-grid">${[['health','Health','heart'],['stability','Stability','spark'],['relaxation','Relaxation','self']].map(([key,label,ico]) => `<div class="vital"><span class="vital-label">${icon(ico)}${label}</span><span class="vital-value">${number(stats[key])}<small>/10</small></span>${key==='stability'?'<span class="muted">Higher is calmer</span>':''}</div>`).join('')}<div class="vital"><span class="vital-label">Height</span><span class="vital-value">${Math.round(state.height)}<small> cm</small></span></div></div></section>`;
}

function effectsView() {
  return `<section class="panel"><div class="panel-heading"><h3>Life’s little twists</h3><span class="tag">${state.effects.length} active</span></div>${state.effects.length ? `<div class="effect-list">${state.effects.map(effect => `<div class="effect-card ${Object.values(effect.modifiers || {}).some(value => value<0)?'negative':'positive'}"><div class="effect-title">${icon('spark')} ${esc(effect.name)}</div><p>${esc(effect.description)}</p><div class="effect-meta">${Object.entries(effect.modifiers || {}).map(([key,value]) => `${esc(skillLabel(key))} ${value>0?'+':''}${value}`).join(' · ')}<br>${effect.years} year${effect.years===1?'':'s'} remaining</div></div>`).join('')}</div>` : `<div class="empty-state">${icon('spark')}<p>A clean slate.<br>No active buffs or setbacks.</p></div>`}<button class="button ghost small" data-action="odds">View this year’s odds ${icon('arrow')}</button></section>`;
}

function yearView() {
  if (needsEducationChoice(state)) return `<section class="panel education-prompt"><div class="panel-heading"><h3>Your next chapter</h3><span class="tag">A NEW CHOICE</span></div><p class="section-description">Go to college, or start working. Choose your path before your next year begins.</p><button class="button primary" data-action="tab" data-tab="career">College or career? ${icon('arrow')}</button></section>${journalView()}`;
  const baby = state.age < 3;
  const disabled = state.ended || state.needsSuccession;
  return `${state.education.status==='college'?collegeProgressView():''}<section class="panel focus-panel"><div class="panel-heading"><h3>${baby ? 'Ask for attention' : 'Your focus'}</h3><span class="tag">${baby ? 'AGES 0–2' : `${focusUsed()} / 12 POINTS`}</span></div><p class="section-description">${baby ? 'More attention helps you grow, but strains your parents.' : 'Share 12 points. Each focus takes 0–5.'}</p>
    ${baby ? `<div class="baby-choices"><button class="choice-card ${state.babyChoice==='cry'?'selected':''}" data-action="baby" data-choice="cry" aria-pressed="${state.babyChoice==='cry'}" ${disabled?'disabled':''}><span class="choice-symbol">${icon('social')}</span><h4>Make some noise</h4><p>Cry for more attention. Your skills grow faster, but your parents feel the strain.</p><span class="choice-footer">More growth · more parent stress ${state.babyChoice==='cry'?icon('check'):''}</span></button><button class="choice-card ${state.babyChoice==='quiet'?'selected':''}" data-action="baby" data-choice="quiet" aria-pressed="${state.babyChoice==='quiet'}" ${disabled?'disabled':''}><span class="choice-symbol">${icon('self')}</span><h4>Quiet little observer</h4><p>Don’t cry. Grow at your own pace and give your parents a little breathing room.</p><span class="choice-footer">Gentler growth · calmer parents ${state.babyChoice==='quiet'?icon('check'):''}</span></button></div>` : focusView(disabled)}
    </section>
    ${baby?birthSkillsView():''}
    ${state.effects.length?`<button class="effect-summary button secondary" data-action="tab" data-tab="character">${icon('spark')} ${state.effects.length} active life effect${state.effects.length===1?'':'s'} · View ${icon('arrow')}</button>`:''}
    ${journalView()}`;
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
  const rows = [['work',state.age<18?'School':studying?'College':'Career',studying?'Learn & build discipline':'Success & lifestyle',studying?'school':'career'],['social','Friends','Connection & confidence','social'],['family','Family','Care & help your kids grow','family'],['self','Yourself','Learn, grow & relax','self']];
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
  return `<div class="mini-stats">${SKILLS.map(skill => `<span title="${esc(skill.label)}; growth affinity ${aptitude(person.aptitudes?.[skill.key]??0)}">${esc(skill.label)} <strong>${number(person.stats[skill.key])}</strong></span>`).join('')}<span>Health <strong>${number(person.stats.health)}</strong></span><span>Stability <strong>${number(person.stats.stability)}</strong></span><span>Relaxation <strong>${number(person.stats.relaxation)}</strong></span></div>`;
}

function personCard(person, role, child = false) {
  const info = successionInfo(state);
  const canSelect = child && info.eligible && info.children.some(c=>c.id===person.id);
  return `<article class="family-card"><div class="family-header"><div class="family-avatar">${avatar(person,true)}</div><div class="family-meta"><span class="eyebrow">${role}</span><h3>${esc(person.name)}</h3><p>${person.age} years old${person.age>=85?' · Remembered':` · Stability ${number(person.stats.stability)}/10`}</p></div></div><p class="family-lifestyle">Lifestyle <strong>${person.lifestyle}/10</strong>${person.age<18?' · Shares your household':''}</p><details class="family-details"><summary>Skills & wellbeing</summary>${miniStats(person)}</details>${child?`<div class="family-card-footer"><span>${person.alive!==false?'An equal share of your legacy':'Remembered with love'}</span>${canSelect?`<button class="button primary small" data-action="heir" data-id="${esc(person.id)}">Continue as ${esc(person.name.split(' ')[0])} ${icon('arrow')}</button>`:''}</div>`:''}</article>`;
}

function familyView() {
  const info = successionInfo(state);
  const childAllowed = state.age>=18 && state.children.length<6 && state.lastChildAge!==state.age && !state.ended && !state.needsSuccession;
  return `<section class="panel"><div class="panel-heading"><h3>The people who raised you</h3><span class="tag">ROOTS</span></div><p class="section-description">${state.age<3?'Crying brings more attention and more growth. It also lowers both parents’ mental stability.':'Family focus supports your parents and gives your children a stronger start.'}</p><div class="family-grid">${state.parents.map((p,i)=>personCard(p,i===0?'PARENT ONE':'PARENT TWO')).join('')}</div></section>
    <section class="panel"><div class="panel-heading"><h3>The next generation</h3><button class="button secondary small" data-action="child" ${childAllowed?'':'disabled'}>${icon('plus')} ${state.age>60?'Adopt a child':'Have a child'}</button></div><p class="section-description">${state.age<18?'Parenthood opens at age 18. Until then, there’s a whole childhood to live.':state.age>60?'You can adopt a child in later life. Family focus helps them grow, and they can continue your story.':state.lastChildAge===state.age?'A new arrival this year. You can welcome another child next year.':'Welcome up to six children, one per year, from age 18. After 60, grow your family through adoption. Family focus improves their skills.'}</p>${state.children.length?`<div class="family-grid child-grid">${state.children.map(c=>personCard(c,'YOUR CHILD',true)).join('')}</div>`:`<div class="empty-state">${icon('family')}<h4>A branch yet to grow</h4><p>Your children will appear here. Build their skills,<br>then carry the story forward through them.</p></div>`}</section>
    <section class="panel"><div class="panel-heading"><h3>What carries forward</h3><span class="tag">YOUR LEGACY</span></div><p class="section-description">You can pass the story to a child at 65; at 85, this chapter closes. Older heirs can adopt to keep the family growing. Your heir keeps their age, skills, and skill affinities.</p>${lifestyleView()}<p class="form-note">Your lifestyle shapes what you leave behind. All living children receive an equal share of the family legacy, helping support their own lifestyle. More children means a smaller share for each.</p>${state.age>=65&&!info.eligible?`<p class="form-note">${esc(info.reason)}</p>`:''}</section>
    ${state.lineage.length?`<section class="panel"><div class="panel-heading"><h3>Those who came before</h3><span class="tag">${state.lineage.length} CHAPTERS</span></div><div class="legacy-list">${state.lineage.map(p=>`<div class="legacy-card"><strong>${esc(p.name)}</strong><span>Generation ${esc(p.generation ?? '—')} · Age ${esc(p.age ?? '—')}</span></div>`).join('')}</div></section>`:''}`;
}

function characterView() {
  const stats = effectiveStats(state);
  return `${statsView()}${effectsView()}<details class="panel character-guide"><summary>How your character grows</summary><div class="help-grid"><div class="help-item"><h4>Nature & nurture</h4><p>Skills run from 1–10. The −3 to +3 rating is your lifelong growth affinity: positive means faster growth, negative means more practice. Every skill can improve.</p></div><div class="help-item"><h4>Health · ${number(stats.health)}/10</h4><p>Self-care supports health. Injuries and illness can temporarily reduce it; it gradually declines in later life.</p></div><div class="help-item"><h4>Mental stability · ${number(stats.stability)}/10</h4><p>Higher means calmer and more resilient. Low stability raises the odds of burnout or a mental health crisis. Rest, friends, and family help.</p></div><div class="help-item"><h4>Relaxation · ${number(stats.relaxation)}/10</h4><p>Time for yourself helps you recover. Overworking and neglecting rest can wear you down.</p></div><div class="help-item"><h4>Height · ${Math.round(state.height)} cm</h4><p>${state.age<18?'You are still growing. Your adult height will be reached at 18.':'You have reached your adult height.'}</p></div><div class="help-item"><h4>Lifestyle · ${state.lifestyle}/10</h4><p>${state.age<18?'Until age 18, you share the household lifestyle with your parents. Your own career and resources set it in adulthood.':'Your career success and family legacy support your comfort. Your legacy is shared equally among your children.'}</p></div></div></details>`;
}

function endPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>A life, fully lived.</h3><span class="tag">AGE ${state.age}</span></div><p class="section-description">${esc(state.name)}’s story has come to a close. There is no eligible child to continue as. Your journal is still here to explore.</p><button class="button primary" data-action="new">Begin another story ${icon('arrow')}</button></section>`;
}

function successionPanel() {
  return `<section class="panel"><div class="panel-heading"><h3>The story goes on.</h3><span class="tag">NEXT GENERATION</span></div><p class="section-description">This chapter closes at age 85. Choose a child in Family to inherit their share and continue with the person they’ve become.</p><button class="button primary" data-action="tab" data-tab="family">Choose your heir ${icon('arrow')}</button></section>`;
}

function toast(message, error = false) {
  clearTimeout(toastTimer);
  document.querySelector('#toast-root').innerHTML = `<div class="toast ${error?'error':''}">${icon(error?'help':'check')}<span>${esc(message)}</span></div>`;
  toastTimer = setTimeout(()=>{document.querySelector('#toast-root').innerHTML='';},4500);
}

function openModal(title, body, actions = '') {
  if (!modalRoot.firstElementChild) modalReturnFocus = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>${actions?`<div class="modal-actions">${actions}</div>`:''}</section></div>`;
  document.body.style.overflow='hidden';
  app.setAttribute('inert', '');
  (modalRoot.querySelector('input') || modalRoot.querySelector('button'))?.focus();
}

function closeModal() {
  modalRoot.innerHTML='';
  document.body.style.overflow='';
  app.removeAttribute('inert');
  modalReturnFocus?.focus({preventScroll:true});
}

function menuModal() {
  openModal('Your story', `<div class="menu-list"><button data-action="help">${icon('help')} How to play ${icon('arrow')}</button><button data-action="odds">${icon('spark')} This year’s odds ${icon('arrow')}</button><button data-action="export">${icon('download')} Export save ${icon('arrow')}</button><button data-action="import">${icon('year')} Import save ${icon('arrow')}</button><button data-action="new">${icon('plus')} Start a new life ${icon('arrow')}</button></div><p class="menu-note">${saveAvailable?'Your life saves automatically on this device. Export a backup to move it to another phone.':'Browser saving is unavailable. Export your story before leaving.'}</p>`);
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
  openModal('A life, one year at a time.', `<div class="help-grid"><div class="help-item"><h4>01 · Start small</h4><p>At ages 0–2, cry for extra growth at the cost of your parents’ calm, or stay quiet for gentler development.</p></div><div class="help-item"><h4>02 · Spend your time</h4><p>From age 3, share 12 focus points across school or career, friends, family, and yourself. Each takes 0–5. Press Next year when you’re ready.</p></div><div class="help-item"><h4>03 · Work with your nature</h4><p>Skills range from 1–10. The −3 to +3 rating is growth affinity. Your choices determine where you improve; affinity changes how fast.</p></div><div class="help-item"><h4>04 · Leave room for life</h4><p>Each year may bring one random event, or none. Your focus and stats change the odds. Buffs and setbacks last for a limited time.</p></div><div class="help-item"><h4>05 · Find your path</h4><p>At 18, choose a job from 10 offers or attend college for four years. Graduates receive 15 offers. There are 100 careers, each with skill affinities and a base lifestyle from 1 to 10.</p></div><div class="help-item"><h4>06 · Grow a legacy</h4><p>Have children from 18–60, or adopt after 60. Family time develops their skills. Pass the story on at 65+, or choose an heir when your life closes at 85. All living children share the estate equally.</p></div></div><p class="form-note">This is a first playable framework: fictional annual probabilities, simple careers and family systems, and local browser saves.</p>`, '<button class="button primary" data-action="close">Let’s live a little</button>');
}

function oddsModal() {
  const odds = eventOdds(state);
  const total = odds.reduce((sum,event)=>sum+event.chance,0);
  openModal('A little room for chance.', `<p class="section-description">Your current focus and effective stats shape these annual chances. At most one random event occurs per year. Life can also be quiet.</p><div class="mini-stats">${odds.map(event=>`<span>${esc(event.name)} <strong>${(event.chance*100).toFixed(1)}%</strong></span>`).join('')}<span><strong>A quiet year</strong><strong>${(Math.max(0,1-total)*100).toFixed(1)}%</strong></span></div><p class="form-note">These are the odds at your current age and condition. They can shift as you grow and existing effects expire.</p>`);
}

function update(action, successMessage) {
  const result = action();
  if (result?.ok===false) { toast(result.reason || 'That choice isn’t available yet.',true); return; }
  save(); render();
  if (successMessage) toast(successMessage);
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const {action} = button.dataset;
  if (action==='tab') navigate(button.dataset.tab);
  if (action==='menu') menuModal();
  if (action==='education') {
    update(()=>chooseEducation(state,button.dataset.path),'Your college chapter begins.');
    if (state.education.status==='college') navigate('year');
  }
  if (action==='baby') update(()=>setBabyChoice(state,button.dataset.choice));
  if (action==='focus') {
    const {key,delta} = button.dataset;
    update(()=>setFocus(state,key,state.focus[key]+Number(delta)));
    app.querySelector(`[data-action="focus"][data-key="${key}"][data-delta="${delta}"]`)?.focus({preventScroll:true});
  }
  if (action==='advance') {
    update(()=>advanceYear(state));
    if (!state.ended&&!state.needsSuccession) app.querySelector('[data-action="advance"]')?.focus({preventScroll:true});
    toast(state.ended?'A life complete. Your journal is saved.':state.needsSuccession?'It’s time to choose the next generation.':`Hello, ${state.age}. A new year begins.`);
  }
  if (action==='job') update(()=>takeJob(state,button.dataset.id),'A new chapter in your career.');
  if (action==='quit') update(()=>quitJob(state),'You’ve made room for a new path.');
  if (action==='child') update(()=>haveChild(state),'Welcome to the family, little one.');
  if (action==='heir') {
    const child = state.children.find(c=>c.id===button.dataset.id);
    const info = successionInfo(state);
    openModal('Pass the story forward?', `<p>Continue as <strong>${esc(child.name)}</strong>, age ${child.age}, with their own skills and affinities.</p><p>They’ll receive <strong>an equal share of your family legacy</strong>, alongside ${info.children.length-1} other heir${info.children.length===2?'':'s'}. Their inheritance helps support their lifestyle. This closes ${esc(state.name)}’s playable chapter.</p>`, `<button class="button secondary" data-action="close">Keep living this chapter</button><button class="button primary" data-action="confirm-heir" data-id="${esc(child.id)}">Continue the story ${icon('arrow')}</button>`);
  }
  if (action==='confirm-heir') { closeModal(); activeTab='year'; update(()=>succeed(state,button.dataset.id),'A new generation. The same story.'); }
  if (action==='history') { showAllHistory=!showAllHistory; render(); }
  if (action==='help') helpModal();
  if (action==='odds') oddsModal();
  if (action==='close') closeModal();
  if (action==='new') openModal('Every life starts somewhere.', `<p class="section-description">A new person, a new set of possibilities. This replaces your current saved life.</p><label class="field-label" for="new-name">What’s your name?</label><input class="text-input" id="new-name" maxlength="40" placeholder="Leave blank for a surprise" autocomplete="off"><p class="form-note">Your parents, traits, and skill affinities are randomized. You’ll begin at age 0.</p>`, '<button class="button secondary" data-action="close">Keep my story</button><button class="button primary" data-action="confirm-new">Begin a life '+icon('arrow')+'</button>');
  if (action==='confirm-new') {
    const name = modalRoot.querySelector('#new-name').value.trim();
    state = createGame(name?{name}:{}); activeTab='year'; showAllHistory=false; closeModal(); save(); render(); toast('Welcome to the world.');
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
  if (event.target.id!=='import-file') return;
  const file = event.target.files[0]; if (!file) return;
  if (file.size>2_000_000) { toast('That save is too large. Choose a Lifelines JSON export.',true); return; }
  try {
    const incoming = migrateSave(JSON.parse(await file.text()));
    if (!incoming) throw new Error('Invalid save');
    openModal('Restore this story?', `<p>Replace your current life with <strong>${esc(incoming.name)}</strong>, age ${incoming.age}, generation ${incoming.generation}?</p>`, '<button class="button secondary" data-action="close">Cancel</button><button class="button primary" id="restore-save">Restore life</button>');
    document.querySelector('#restore-save').addEventListener('click',()=>{state=incoming; activeTab='year';closeModal();save();render();toast('Your story is restored.');},{once:true});
  } catch { toast('This file isn’t a valid Lifelines save.',true); }
});

document.addEventListener('keydown', event => {
  if (!modalRoot.firstElementChild) return;
  if (event.key==='Escape') closeModal();
  if (event.key==='Enter' && event.target.id==='new-name') modalRoot.querySelector('[data-action="confirm-new"]')?.click();
  if (event.key==='Tab') {
    const items = [...modalRoot.querySelectorAll('button:not(:disabled),input,a[href]')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
  }
});

save();
render();
if (loadNotice) toast(loadNotice,true);
