// DOM integration checks run entirely in Node. They verify UI wiring and saves,
// but are not a substitute for checking layout in a real browser.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { toLegacyCentimeters, stripWellbeingAptitudes, legacyRatingFloor } from './helpers/legacy-height.js';
import { MAX_FOCUS, focusBudget, defaultFocus } from '../focus-rules.js';
import { createSchoolRecord, gradeLetter, activityGradeLetter, SPORTS, EXTRACURRICULARS } from '../school.js';
import { changedRating } from '../rating-changes.js';
import { choiceImpacts, toddlerChoiceImpacts, schoolChoiceImpacts } from '../choice-impacts.js';
import { SKILLS, JOBS, EVENTS, resolveEventChoice, eventOdds, canTakeJob, chooseEducation, offeredJobs, needsEducationChoice, createGame, advanceYear, annualForecast, haveChild, takeJob, successionInfo, succeed, validateSave, respondToEncounter, proposeMarriage, effectiveStats, householdLifestyle, relationshipOdds, proposalChance, statPercentiles } from '../engine.js';

const SAVE_KEY = 'lifelines.save.v1';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const nativeSetTimeout = globalThis.setTimeout;
const nativeClearTimeout = globalThis.clearTimeout;
const originalGlobals = new Map(['document', 'window', 'localStorage', 'setTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const timers = new Set();
let importId = 0;

test('context help is a compact accessible dialog that returns focus without saving or advancing', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:121});
  fixture.stats.intelligence=8.7;
  fixture.aptitudes.intelligence=3;
  const ui = await mount(fixture);
  ui.click('.nav-list [data-tab="year"]');
  const original = ui.saved(), writes = ui.writes();
  assert.equal(ui.query('.status-strip [data-stat="intelligence"] .status-value').firstChild.textContent,'8.7','a baby’s high innate rating is displayed directly');
  assert.equal(ui.query('.status-strip [data-stat="intelligence"] .aptitude').getAttribute('aria-label'),'Natural aptitude +3');
  const trigger = ui.query('[data-topic="intelligence"]');
  assert.equal(trigger.tagName,'BUTTON');
  assert.match(trigger.getAttribute('aria-label'),/^Intelligence 8.7 out of 10/);
  assert.equal(trigger.getAttribute('aria-haspopup'),'dialog');
  trigger.focus();
  ui.click('[data-topic="intelligence"]');
  const dialog = ui.query('.help-popup[role="dialog"]');
  assert.equal(dialog.getAttribute('aria-modal'),'true');
  assert.equal(dialog.getAttribute('aria-describedby'),'topic-help-content');
  assert.match(dialog.textContent,/Reasoning ability for your age/);
  assert.equal(ui.all('.year-stat-help, [data-topic="stats"], [data-topic="affinity"]').length,0);
  assert.equal(ui.document.activeElement,ui.query('.help-popup [data-action="close"]'));
  assert.ok(ui.query('#app').hasAttribute('inert'));
  ui.key('.help-popup [data-action="close"]','Escape');
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.document.activeElement,trigger);
  assert.equal(ui.query('#app').hasAttribute('inert'),false);
  ui.click('[data-topic="intelligence"]');
  ui.click('.help-popup .modal-body');
  assert.equal(ui.all('[role="dialog"]').length,1,'clicking the content keeps help open');
  ui.click('.help-popup-backdrop');
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.document.activeElement,trigger);
  ui.click('[data-topic="intelligence"]');
  ui.click('.help-popup [data-action="close"]');
  assert.equal(ui.document.activeElement,trigger);
  assert.deepEqual(ui.saved(),original);
  assert.equal(ui.writes(),writes,'reading or dismissing help must not write the save');
});

test('health, appearance, growth, crying, and household help contain the requested rules', async () => {
  const ui = await mount(createGame({seed:121}));
  const topics = [
    ['strength',/A 7\.0\/10 baby is strong for a baby.*Exercise can maintain or raise this rating; inactivity can lower it/],
    ['health',/Poor health raises disease risk and reduces childhood height gains/],
    ['height',/Final height emerges from yearly growth.*14–18.*Poor health reduces new growth, never existing height/],
    ['attractiveness',/During school years, Yourself focus can improve or reduce it.*after 30 for men and 22 for women/],
    ['cry',/relationships tend to fall at levels 1–2, stay steady at 3, and rise at 4–5.*yearly variation.*Harder crying strains their mental stability more/],
    ['lifestyle',/Until 18.*parents.*changing household lifestyle.*adult.*work, family and inheritance/],
  ];
  for(const [topic,content] of topics) {
    ui.click(`.nav-list [data-tab="${'year'}"]`);
    ui.click(`[data-topic="${topic}"]`);
    assert.match(ui.query('.help-popup').textContent,content);
    assert.ok(ui.query('.modal-body').textContent.split(/\s+/).length<60,`${topic} help should stay brief`);
    if(['strength','health','attractiveness'].includes(topic)) {
      assert.match(ui.query('.help-popup').textContent,/Changes need activity, care, events or aging/);
      assert.match(ui.query('.help-popup').textContent,/Low ratings amplify existing gains without creating them/);
    }
    assertNoMoneyDisplay(ui.query('.help-popup'),`${topic} popup`);
    ui.click('.help-popup [data-action="close"]');
  }
});

test('mechanics explanations live in help across childhood, college, and adult routes', async () => {
  const child=createGame({seed:123});
  const college=ageTo(createGame({seed:124}),18);chooseEducation(college,'college');
  const adult=partnerFixture();
  for(const fixture of [child,college,adult]) {
    const ui=await mount(fixture);
    for(const tab of ['year','career','family']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      if(tab==='career' && fixture.age<18) assert.ok(ui.query('.career-locked-bar').disabled);
      else assert.ok(ui.all('#main-content [data-action="topic-help"]').length,`${tab} needs contextual help`);
      assert.equal(ui.all('#app .form-note:not(.event-cause), #app .trait-legend, #app .forecast-legend, #app .character-guide, #app .profile-affinity-note, #app .focus-copy p, #app .job-description').length,0);
      assert.doesNotMatch(ui.query('#app').textContent,/Higher is calmer|College focus builds|Family focus strengthens|Attractiveness, social ability, and lifestyle shape|Small −3 to \+3 ratings|\bbonds?\b/i);
      for(const button of ui.all('#main-content [data-action="topic-help"]')) {
        assert.equal(button.tagName,'BUTTON');
        assert.match(button.getAttribute('aria-label'),/^About .+/);
        assert.equal(button.getAttribute('aria-haspopup'),'dialog');
      }
      if(ui.all('[data-topic="focus"]').length) {
        ui.click('[data-topic="focus"]');
        assert.match(ui.query('.help-popup').textContent,/default 2.*no focus-driven stat changes.*0 and 4 are three times as strong/);
        ui.click('.help-popup [data-action="close"]');
        ui.click('[data-topic="focus-self"]');
        assert.match(ui.query('.help-popup').textContent,/Exercise, learning and self-care support strength/);
        ui.click('.help-popup [data-action="close"]');
      }
    }
  }
});

test('parent profiles show career focus and employment without internal career progress', async () => {
  const fixture=createGame({seed:121});
  fixture.parents[0].career={...fixture.parents[0].career,focus:5,status:'unemployed',progress:3.1415926};
  fixture.parents[1].career={...fixture.parents[1].career,focus:2,status:'retired',progress:6.2831853};
  const ui=await mount(fixture);
  ui.click('.nav-list [data-tab="family"]');
  const [mom,dad]=ui.all('.roots-panel .parent-career');
  assert.match(mom.textContent,/Career focus\? 5\/5.*Unemployed/);
  assert.match(dad.textContent,/Career focus\? 2\/5.*Retired/);
  assert.doesNotMatch(ui.query('.roots-panel').textContent,/3\.1415926|6\.2831853/);
  ui.click('.roots-panel [data-topic="parent-career"]');
  assert.match(ui.query('.help-popup').textContent,/Higher career focus and experience tend to improve lifestyle.*job loss can set it back/);
  assertNoMoneyDisplay(ui.query('.help-popup'),'parent career help');
});

test('opening help while a decision is pending preserves the choice and accurate previews', async () => {
  const fixture=pendingFixture(1);
  const ui=await mount(fixture);
  const saved=ui.saved(), writes=ui.writes();
  const before=ui.query('.event-choices').textContent;
  assert.match(before,/\d\.\d → \d\.\d/);
  assert.doesNotMatch(before,/[+−-]\d/);
  ui.click('.nav-list [data-tab="year"]');
  ui.click('[data-topic="intelligence"]');
  ui.key('.help-popup [data-action="close"]','Escape');
  ui.click('.nav-list [data-tab="year"]');
  assert.equal(ui.query('.event-choices').textContent,before);
  assert.deepEqual(ui.saved(),saved);
  assert.equal(ui.writes(),writes);
  assert.equal(ui.all('[data-action="advance"]').length,0);
});

test('parent lifestyle recaps show before and after while older summaries remain readable', async () => {
  const fixture=ageTo(createGame({seed:121}),1);
  fixture.yearSummary.dismissed=false;
  fixture.lifestyle=6.21;
  fixture.yearSummary.lifestyle={before:6.24,after:6.21,change:-.03};
  fixture.yearSummary.parents[0].lifestyle={before:6.24,after:6.31,change:.07};
  delete fixture.yearSummary.parents[1].lifestyle;
  const ui=await mount(fixture);
  assert.equal(ui.all('.parent-review-lifestyle').length,1);
  assert.equal(ui.query('.parent-review-lifestyle').textContent,'Lifestyle 6.2 → 6.3');
  const lifestyle=ui.query('.year-review-modal [data-stat="lifestyle"] strong');
  assert.equal(lifestyle.textContent,'6.2 → 6.2');
  assert.equal(lifestyle.className,'unchanged');
  assert.equal(ui.saved().lifestyle,6.21,'display rounding preserves stored hundredths');
  assert.match(ui.query('.forecast-parents').textContent,/Mental stability.*Relationship.*Lifestyle/);
  assert.doesNotMatch(ui.query('.forecast-parents').textContent,/undefined|NaN|[+−-]\d/);
  assert.deepEqual(ui.saved().yearSummary,fixture.yearSummary);
});

test('legacy journal and review text hides signed changes and tutorial suffixes without rewriting history', async () => {
  const fixture=ageTo(createGame({seed:121}),1);
  fixture.history[0].title='A closer bond';
  fixture.history[0].text='A visit goes well. Bond +0.4; Social ability +.25; stability -0.1; Health −0.2; Instability +0.3. Lifestyle 6.0 → 5.0. Family focus will help their abilities grow, and your family legacy will be divided equally among your surviving children.';
  fixture.history[0].text=`${fixture.parents[0].name} shares a <quiet> visit with ${fixture.parents[1].name}. ${fixture.history[0].text}`;
  fixture.yearSummary.dismissed=false;
  fixture.yearSummary.events=[{title:fixture.history[0].title,text:fixture.history[0].text,kind:'family'}];
  fixture.effects=[{id:'legacy-effect',name:'A stronger bond',description:'Bond +0.3; Stability -0.2.',years:2,modifiers:{stability:-.2},kind:'negative'}];
  const ui=await mount(fixture);
  const review=ui.query('.year-review-events').textContent;
  assert.match(review,/A closer relationship.*relationship increased.*Social increased.*Mental stability decreased.*Health decreased.*Mental stability decreased.*Lifestyle 6\.0 → 5\.0/);
  assert.doesNotMatch(review,/\bbonds?\b|instability|[+−-](?:\d|\.)|Family focus will help/i);
  assert.ok(review.includes(`${fixture.parents[0].name} (Mom)`));
  assert.ok(review.includes(`${fixture.parents[1].name} (Dad)`));
  assert.ok(review.includes('<quiet>'));
  assert.equal(ui.all('.year-review-events quiet').length,0,'annotated prose is escaped as plain text');
  ui.click('.year-review-modal [data-action="close"]');
  const journal=ui.query('.journal-list').textContent;
  assert.match(journal,/A visit goes well/);
  assert.ok(journal.includes(`${fixture.parents[0].name} (Mom)`));
  assert.ok(journal.includes(`${fixture.parents[1].name} (Dad)`));
  assert.doesNotMatch(journal,/\bbonds?\b|instability|[+−-](?:\d|\.)|Family focus will help/i);
  ui.click('.nav-list [data-tab="year"]');
  assert.match(ui.query('.effect-card').textContent,/A stronger relationship.*-\.2 Mental stability.*2 years remaining/);
  assert.doesNotMatch(ui.query('.effect-card').textContent,/relationship increased|Mental stability decreased/,'active effects show current ratings and duration without old flavor');
  assert.deepEqual(ui.saved().history,fixture.history,'display normalization must preserve original saved history');
  assert.deepEqual(ui.saved().effects,fixture.effects);
});

test('journal and review preserve negative effective endpoints and signed temporary amounts', async () => {
  const fixture = ageTo(createGame({ seed: 78124 }), 1);
  const entry = { title: 'A recorded effect', text: 'Your health -1.25 → -1.05; +.2 Intelligence; -.5 Mental stability. Temporary effects: 2 years.', kind: 'positive' };
  fixture.history[0] = { ...fixture.history[0], ...entry };
  fixture.yearSummary.events = [entry];
  fixture.yearSummary.dismissed = false;
  const ui = await mount(fixture);
  for (const selector of ['.year-review-events', '.journal-list']) {
    const text = ui.query(selector).textContent;
    assert.match(text, /health -1\.3 → -1\.1/);
    assert.match(text, /\+\.2 Intelligence/);
    assert.match(text, /-\.5 Mental stability/);
    assert.doesNotMatch(text, /health decreased/);
  }
  assert.deepEqual(ui.saved(), fixture);
});

test('journal and year-review outcomes put every stat on its own line', async () => {
  const fixture = ageTo(createGame({ surname: 'St. Clair', seed: 78123 }), 1);
  const dad = fixture.parents.find(parent=>parent.role==='Dad') || fixture.parents[1];
  const entry = { title: `${dad.name}: Tired days after broken nights`, text: `Your mental stability 5.2 → 5; ${dad.name}: Mental stability 6.3 → 6; ${dad.name}: Health 7.1 → 7.`, kind: 'negative' };
  fixture.history[0] = { ...fixture.history[0], ...entry };
  fixture.yearSummary.events = [entry];
  fixture.yearSummary.dismissed = false;
  const ui = await mount(fixture);
  assert.equal(ui.query('.year-event-description').textContent, `${dad.name} (Dad) struggles to rest, leaving you both unsettled.`, 'a period in a family name does not truncate its explanation');
  const reviewLines = ui.query('.year-review-events .year-event-results').innerHTML.split('<br>');
  assert.equal(reviewLines.length, 3, 'reviews show each stat separately, even for the same person');
  assert.match(reviewLines[1], /Mental stability 6\.3 \u2192 6\.0/);
  assert.match(reviewLines[2], /Health 7\.1 \u2192 7\.0/);
  assert.ok(reviewLines.every(line => !line.includes(';')), 'stat outcomes never share a semicolon-separated review line');
  const journalLines = ui.query('.journal-entry p').innerHTML.split('<br>');
  assert.equal(journalLines.length, 3, 'every stat gets its own line in the journal');
  assert.match(journalLines[0], /Your Mental stability 5\.2 → 5\.0/);
  assert.ok(journalLines[1].includes(`${dad.name} (Dad)`));
  assert.ok(journalLines[2].includes(`${dad.name} (Dad)`));
  assert.match(journalLines[1], /Mental stability 6\.3 → 6\.0/);
  assert.match(journalLines[2], /Health 7\.1 → 7\.0/);
  assert.deepEqual(ui.saved(), fixture, 'line breaks do not rewrite event history or ratings');
});

test('Mom helping with the load keeps each actual stat change on a separate review line after reload', async () => {
  const original = createGame({ surname: 'St. Clair', seed: 6 });
  const mom = original.parents.find(parent => parent.parentRole === 'mom');
  mom.stats.stability = 3;
  assert.equal(advanceYear(original, { mortalityRandom: () => 1, growthRandom: () => 0, parentCareerRandom: () => 1 }).ok, true);
  const event = EVENTS.find(event => event.id === 'household_parent_support');
  const entry = original.yearSummary.events.find(entry => entry.title === `${mom.name}: ${event.name}`);
  assert.ok(entry, 'the actual automatic household event rolled for Mom');
  assert.equal(entry.text.split(';').length, 4, 'the engine recorded player wellbeing plus Mom wellbeing, health, and relationship');
  assert.equal(validateSave(original), true);

  for (const legacy of [false, true]) {
    const fixture = structuredClone(original);
    if (legacy) delete fixture.yearSummary.events.find(item => item.title === entry.title).description;
    const expectedDescription = legacy
      ? 'A neighbor brings cooked meals and helps {name} with the laundry for a few weeks, giving you both a calmer home.'
      : event.description;
    const before = structuredClone(fixture);
    let ui = await mount(fixture);
    for (let reload = 0; reload < 2; reload++) {
      const card = ui.all('.year-review-events li').find(item => item.querySelector('strong').textContent.includes(event.name));
      assert.ok(card);
      assert.equal(card.querySelector('.year-event-description').textContent, expectedDescription.replaceAll('{name}', `${mom.name} (Mom)`));
      const results = card.querySelector('.year-event-results');
      const lines = results.innerHTML.split('<br>');
      assert.equal(results.querySelectorAll('br').length, 3, 'four changes need three actual HTML line breaks');
      assert.equal(lines.length, 4);
      for (const [index,label] of ['Your Mental stability','Mental stability','Health','Relationship'].entries()) {
        const endpoints=entry.text.split(';')[index].match(/(-?\d+(?:\.\d+)?) \u2192 (-?\d+(?:\.\d+)?)/);
        assert.ok(endpoints,'the actual event records both endpoints');
        const displayed=`${Number(endpoints[1]).toFixed(1)} \u2192 ${Number(endpoints[2]).toFixed(1)}`;
        assert.ok(lines[index].includes(`${label} ${displayed}`),'each line displays its recorded values');
      }
      assert.ok(lines.slice(1).every(line => line.includes(`${mom.name} (Mom)`)), 'each Mom change keeps its subject label');
      assert.doesNotMatch(results.textContent, /;/, "Mom's multiple outcomes are never joined by semicolons");
      assert.deepEqual(ui.saved(), before, 'rendering and reloading never rewrite saved history, ratings, or RNG');
      if (reload === 0) ui = await mount(ui.saved());
    }
  }
});

test('year reviews show one saved explanation while journals retain only titles and results', async () => {
  const fixture = ageTo(createGame({ seed: 78123 }), 1);
  const dad = fixture.parents[1];
  const entry = { title: 'A difficult night', description: `${dad.name} could not sleep after a <loud> storm. The morning was difficult.`, text: `Your mental stability 5.2 → 5; ${dad.name}: Mental stability 6.3 → 6.`, kind: 'negative' };
  fixture.history = [{ ...fixture.history[0], ...entry }];
  fixture.yearSummary.events = [entry];
  fixture.yearSummary.dismissed = false;
  const ui = await mount(fixture);
  assert.equal(ui.query('.year-event-description').textContent, `${dad.name} (Dad) could not sleep after a <loud> storm.`);
  assert.equal(ui.all('.year-event-description loud').length, 0, 'saved prose is escaped');
  assert.doesNotMatch(ui.query('.year-review-events').textContent, /The morning was difficult/);
  assert.match(ui.query('.year-event-results').textContent, /5\.2 → 5\.0/);
  assert.doesNotMatch(ui.query('.journal-list').textContent, /storm|morning was difficult/);
  assert.match(ui.query('.journal-list').textContent, /A difficult night.*5\.2 → 5\.0/);
  assert.deepEqual(ui.saved(), fixture, 'adding review context changes neither saved history nor RNG');
  const reloaded = await mount(ui.saved());
  assert.equal(reloaded.query('.year-event-description').textContent, `${dad.name} (Dad) could not sleep after a <loud> storm.`);
});

test('saved automatic event causes render concise family explanations safely without rewriting detailed history', async () => {
  const fixture=ageTo(createGame({seed:78123}),3);
  const mom=fixture.parents.find(parent=>parent.parentRole==='mom');
  mom.stats.stability=9;
  const cause=`${mom.name}'s low Mental stability (2.3/10) contributed to this event (start-of-year ratings). <em>Recorded note</em>`;
  const entry={title:'A difficult journey home',description:'A missed bus leads to an argument.',text:`Your mental stability 5.2 → 5; ${mom.name}: Mental stability 2.3 → 2.2.`,kind:'negative',cause};
  fixture.history=[{id:'cause-ui-auto',age:fixture.age,generation:fixture.generation,...entry}];
  fixture.yearSummary.events=[entry]; fixture.yearSummary.dismissed=false;
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  for(let reload=0;reload<2;reload++) {
    for(const selector of ['.year-review-events','.journal-list']) {
      const note=ui.query(`${selector} .event-cause`);
      assert.equal(note.textContent,`${mom.name} (Mom)'s low mental stability contributed to this event. <em>Recorded note</em>`);
      assert.doesNotMatch(note.textContent,/Contributing stats|\/10|start-of-year/);
      assert.equal(note.querySelector('strong'),null);
      assert.equal(note.querySelectorAll('em').length,0,'saved cause text is escaped');
      assert.doesNotMatch(note.textContent,/9\.0/,'current ratings never replace the captured cause');
    }
    const results=ui.query('.year-event-results');
    assert.equal(results.querySelectorAll('br').length,1);
    assert.match(results.textContent,/Your Mental stability 5\.2 \u2192 5\.0/);
    assert.match(results.textContent,/Mental stability 2\.3 \u2192 2\.2/);
    assert.doesNotMatch(results.textContent,/Contributing stats|Recorded note/);
    assert.equal(ui.query('.year-event-description').textContent,entry.description);
    assert.deepEqual(ui.saved(),fixture,'reading causes preserves the complete saved life');
    ui=await mount(ui.saved());
  }
});

test('personal and family choices render concise causes while retaining detailed saved causes through selection and reload', async () => {
  for(const family of [false,true]) {
    const fixture=family?partnerFixture():ageTo(createGame({seed:78123}),25);
    const event=EVENTS.find(entry=>entry.id===(family?'household_partner_argument':'investment_pitch'));
    const cause=family?`${fixture.partner.name}'s low Mental stability (2.3/10) contributed to this event (start-of-year ratings).`:'Your low Intelligence (2.3/10) contributed to this event (start-of-year ratings).';
    const pending={eventId:event.id,age:fixture.age,cause,...(family?{subjectType:'partner',subjectId:fixture.partner.id}:{})};
    fixture.pendingEvents=[pending];
    fixture.lastYearEvents=[family?`${event.id}:${fixture.partner.id}`:event.id];
    fixture.stats.intelligence=9; if(family) fixture.partner.stats.stability=9;
    const entry={title:family?`${fixture.partner.name}: ${event.name}`:event.name,description:event.description,text:event.description,kind:'choice',cause};
    fixture.history=[{id:'cause-ui-choice',age:fixture.age,generation:fixture.generation,...entry}];
    fixture.yearSummary.events=[entry]; fixture.yearSummary.dismissed=true;
    assert.equal(validateSave(fixture),true);
    let ui=await mount(fixture),before=ui.saved();
    const note=ui.query('.event-decision .event-cause');
    assert.equal(note.textContent,family?`${fixture.partner.name} (Girlfriend)'s low mental stability contributed to this event.`:'Low intelligence contributed to this event.');
    assert.doesNotMatch(note.textContent,/Contributing stats|\/10|start-of-year|9\.0/);
    assert.deepEqual(ui.saved(),before,'opening a pending choice does not recompute or save its cause');
    ui=await mount(before);
    assert.equal(ui.query('.event-decision .event-cause').textContent,note.textContent);
    ui.click(`[data-action="event-choice"][data-choice="${event.choices[0].id}"]`);
    const completed=ui.saved();
    assert.equal(completed.pendingEvents.length,0);
    assert.equal(completed.history[0].cause,cause,'the chosen result keeps the original cause');
    assert.equal(completed.yearSummary.events[0].cause,cause);
    assert.equal(completed.rng,before.rng);
    assert.equal(ui.query('.journal-entry .event-cause').textContent,note.textContent);
    ui=await mount(completed);
    assert.deepEqual(ui.saved(),completed);
    assert.equal(ui.query('.journal-entry .event-cause').textContent,note.textContent);
  }
});

test('obsolete and superseded event causes are hidden without rewriting saved stories or outcomes', async () => {
  for (const example of [
    { title: 'Night works outside your window', family: true,
      description: 'Overnight road repairs keep waking you and {name}; lost sleep leaves home tense and exhausting.' },
    { title: 'A barking dog next door', family: true,
      description: 'A new dog next door barks through the night, repeatedly waking {name} and wearing you both down.' },
    { title: 'A storm on the trail', family: false,
      description: 'A sudden storm strands your walking group; a ranger guides you to shelter and teaches you how to stay calm under pressure.' },
  ]) {
    const fixture=ageTo(createGame({seed:78123}),1);
    const mom=fixture.parents.find(parent=>parent.parentRole==='mom');
    fixture.lifestyle=1.2;
    for(const parent of fixture.parents) parent.lifestyle=1.2;
    mom.stats.stability=9;
    const description=example.description.replaceAll('{name}',mom.name);
    const entry={title:example.family?`${mom.name}: ${example.title}`:example.title,description,
      text:`Your mental stability 5 \u2192 4.8; ${mom.name}: Mental stability 2.3 \u2192 2.0.`,kind:'negative',
      cause:example.family?`${mom.name}'s low Mental stability (2.3/10) contributed to this event (start-of-year ratings).`:
        'Your high Health (8.2/10) contributed to this event (start-of-year ratings).'};
    fixture.history=[{id:'obsolete-event-cause',age:fixture.age,generation:fixture.generation,...entry}];
    fixture.yearSummary.events=[entry]; fixture.yearSummary.dismissed=false;
    assert.equal(validateSave(fixture),true);
    let ui=await mount(fixture);
    for(let reload=0;reload<2;reload++) {
      for(const selector of ['.year-review-events','.journal-list']) {
        assert.equal(ui.all(`${selector} .event-cause`).length,0,`${example.title}: unsupported or superseded saved cause is omitted`);
        assert.doesNotMatch(ui.query(selector).textContent,/contributed to this event|low lifestyle|low mental stability|high health/i,'current ratings are not substituted as guessed historical causes');
        assert.match(ui.query(selector).textContent,/5\.0 \u2192 4\.8/);
        assert.match(ui.query(selector).textContent,/2\.3 \u2192 2\.0/);
      }
      assert.equal(ui.query('.year-event-description').textContent,description.replaceAll(mom.name,`${mom.name} (Mom)`));
      assert.deepEqual(ui.saved(),fixture,'hidden causal prose stays intact in the saved history and review');
      ui=await mount(ui.saved());
    }
  }
});

test('new environmental event causes name household Lifestyle rather than the affected parent', async () => {
  const fixture=ageTo(createGame({seed:78123}),1);
  const mom=fixture.parents.find(parent=>parent.parentRole==='mom');
  const event=EVENTS.find(entry=>entry.id==='household_parent_sleepless');
  const entry={title:`${mom.name}: ${event.name}`,description:event.description.replaceAll('{name}',mom.name),
    text:`Your mental stability 5 → 4.8; ${mom.name}: Mental stability 2.3 → 2.0.`,kind:'negative',
    cause:"Your household's low Lifestyle (1.2/10) contributed to this event (start-of-year ratings)."};
  fixture.history=[{id:'household-roadworks-cause',age:fixture.age,generation:fixture.generation,...entry}];
  fixture.yearSummary.events=[entry]; fixture.yearSummary.dismissed=false;
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  for(let reload=0;reload<2;reload++) {
    for(const selector of ['.year-review-events','.journal-list']) {
      const note=ui.query(`${selector} .event-cause`);
      assert.equal(note.textContent,"Your household's low lifestyle contributed to this event.");
      assert.ok(!note.textContent.includes(mom.name),'household resources are not attributed to one parent');
      assert.doesNotMatch(note.textContent,/Mental stability|\/10|start-of-year|Contributing stats/i);
    }
    assert.deepEqual(ui.saved(),fixture,'rendering preserves the captured household cause and all other saved fields');
    ui=await mount(ui.saved());
  }
});

test('legacy event entries and pending choices never infer causes from current low ratings', async () => {
  const fixture=ageTo(createGame({seed:78123}),25);
  fixture.stats.intelligence=0;
  const event=EVENTS.find(entry=>entry.id==='investment_pitch');
  fixture.pendingEvents=[{eventId:event.id,age:fixture.age}]; fixture.lastYearEvents=[event.id];
  const entry={title:event.name,text:event.description,kind:'choice'};
  fixture.history=[{id:'legacy-cause-ui',age:fixture.age,generation:fixture.generation,...entry}];
  fixture.yearSummary.events=[entry]; fixture.yearSummary.dismissed=false;
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  for(let reload=0;reload<2;reload++) {
    assert.equal(ui.all('.event-cause').length,0);
    assert.doesNotMatch(ui.query('#app').textContent,/Contributing stats:|Low intelligence contributed to this event/);
    assert.deepEqual(ui.saved(),fixture,'legacy history and pending decisions remain untouched');
    ui=await mount(ui.saved());
  }
});

test('older catalog events gain review context without restoring journal flavor or duplicating choices', async () => {
  for (const choice of [false, true]) {
    const fixture = ageTo(createGame({ seed: 78123 }), 1);
    const event = EVENTS.find(event => event.id === (choice ? 'broken_tablet' : 'broken_bone'));
    const text = choice ? event.description : `${event.description} Your health 5 → 4.4. Temporary effects: 1 year.`;
    const entry = { title: event.name, text, kind: choice ? 'choice' : 'negative' };
    fixture.history = [{ ...fixture.history[0], ...entry }];
    fixture.yearSummary.events = [entry];
    fixture.yearSummary.dismissed = false;
    const ui = await mount(fixture);
    assert.equal(ui.query('.year-event-description').textContent, event.description);
    assert.equal(ui.all('.year-event-description').length, 1);
    assert.doesNotMatch(ui.query('.journal-list').textContent, choice ? /tablet stops working/ : /means less active play/);
    if (choice) assert.equal(ui.query('.year-event-results').textContent, 'Choice offered.');
    else assert.match(ui.query('.year-event-results').textContent, /Your health 5\.0 → 4\.4.*1 year/);
    assert.deepEqual(ui.saved(), fixture);
  }
});

test('saved reviews show events earliest first while preserving legacy context and stored order', async () => {
  const fixture = ageTo(createGame({ seed: 78123 }), 1);
  const description = 'A familiar sound becomes a word, and your family celebrates the discovery.';
  const entries = [
    { title: 'Words find their way', text: `${description} Your social 5 → 5.2.`, kind: 'positive' },
    { title: 'Words find their way', text: 'A custom family memory. Your social 5 → 5.2.', kind: 'positive' },
    { title: 'A broken bone', text: 'An unknown custom event stays intact.', kind: 'negative' },
  ];
  fixture.history = entries.map(entry=>({ ...fixture.history[0], ...entry }));
  fixture.yearSummary.events = entries;
  fixture.yearSummary.dismissed = false;
  let ui = await mount(fixture);
  for (let reload=0; reload<2; reload++) {
    const rows = ui.all('.year-review-events li');
    assert.equal(rows[0].querySelector('strong').textContent, 'A broken bone');
    assert.equal(rows[0].querySelector('.year-event-results').textContent, entries[2].text);
    assert.match(rows[1].querySelector('.year-event-results').textContent, /^A custom family memory\./);
    assert.equal(rows[2].querySelector('strong').textContent, 'Words find their way');
    assert.equal(rows[2].querySelector('.year-event-description').textContent, description);
    assert.match(rows[2].querySelector('.year-event-results').textContent, /^Your social 5\.0 → 5\.2\.$/);
    assert.deepEqual(ui.saved(), fixture, 'rendering old events never rewrites saved history');
    ui = await mount(ui.saved());
  }
});

test('first launch accepts a blank surname and preserves supplied multiword names', async () => {
  let ui=await mount(null);
  assert.equal(ui.storage.has(SAVE_KEY),false,'an unnamed provisional life must not overwrite storage');
  assert.equal(ui.query('#new-surname').hasAttribute('required'),false);
  assert.equal(ui.query('#new-surname').hasAttribute('aria-required'),false);
  assert.equal(ui.query('#new-surname').getAttribute('placeholder'),'Random if blank');
  assert.equal(ui.all('.modal [data-action="close"]').length,0);
  ui.key('#new-surname','Escape');
  assert.equal(ui.all('[role="dialog"]').length,1,'the surname prompt cannot be dismissed on first launch');
  ui.query('#new-surname').value='   ';
  ui.click('[data-action="confirm-new"]');
  assert.equal(validateSave(ui.saved()),true);
  assert.ok(ui.saved().familyName);
  assert.equal(ui.all('[role="dialog"]').length,0);
  ui=await mount(null);
  ui.query('#new-surname').value='  van buren  ';
  ui.query('#new-name').value='Alex';
  ui.click('[data-action="confirm-new"]');
  const saved=ui.saved();
  assert.equal(saved.familyName,'Van buren');
  assert.equal(saved.name,'Alex Van buren');
  assert.ok(saved.parents.every(parent=>parent.name.endsWith(' Van buren')));
  assert.equal(validateSave(saved),true);
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.query('#app').hasAttribute('inert'),false);
  ui=await mount(saved);
  assert.deepEqual(ui.saved(),saved);
  assert.equal(ui.all('#new-surname').length,0,'an existing family must not be asked to start over');
});

test('all parent stats, affinities, and relationships are visible from childhood', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:121});
  fixture.parents[0].relationship=7.25;
  fixture.parents[1].alive=false;
  const ui=await mount(fixture);
  ui.click('.nav-list [data-tab="family"]');
  assert.match(ui.query('.roots-panel').textContent,/Mom/);
  assert.match(ui.query('.roots-panel').textContent,/Dad/);
  assert.doesNotMatch(ui.query('.roots-panel').textContent,/PARENT ONE|PARENT TWO/);
  for(const parent of fixture.parents) {
    const card=ui.query(`.roots-panel [data-person-id="${parent.id}"]`);
    assert.deepEqual([...card.querySelectorAll('.profile-stat[data-skill]')].map(row=>row.dataset.skill),['health','stability']);
    assert.equal(card.querySelectorAll('.aptitude').length,['health','stability'].filter(key=>parent.aptitudes[key]!==0).length);
    assert.equal(card.querySelectorAll('[data-topic="lifestyle"], .family-lifestyle').length,0);
    assert.ok(card.querySelector('[data-topic="height"]'));
    for(const aptitude of card.querySelectorAll('.aptitude')) assert.match(aptitude.getAttribute('aria-label'),/natural aptitude/);
    assert.ok(card.querySelector('.family-details').hasAttribute('open'));
    assert.equal(card.querySelector('.relationship-summary strong').textContent,`${parent.relationship.toFixed(1)}/10`);
    if(parent.alive===false) assert.match(card.textContent,/Remembered/);
    else assert.doesNotMatch(card.textContent,/Remembered/);
    assertNoMoneyDisplay(card,'parent profile');
  }
  assert.deepEqual(ui.saved(),fixture,'reading family profiles must preserve all state');
});

test('cry levels update the combined choice impact list without numeric deltas or consuming randomness', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:121});
  fixture.stats.intelligence=5;
  fixture.aptitudes.intelligence=0;
  const ui=await mount(fixture);
  const initial=ui.saved();
  assert.equal(ui.all('.focus-panel .choice-impact-summary').length,1);
  ui.click('[data-action="baby"][data-level="1"]');
  assertChoiceImpacts(ui);
  const low=annualForecast(ui.saved()).stats.intelligence.change;
  ui.click('[data-action="baby"][data-level="5"]');
  assertChoiceImpacts(ui);
  const high=annualForecast(ui.saved()).stats.intelligence.change;
  assert.ok(high>low,'crying changes the net annual expectation');
  assert.equal(ui.all('.stat-projection, .year-stats').length,0);
  assert.equal(ui.query('.status-strip [data-stat="intelligence"] .status-value').firstChild.textContent,'5.0');
  ui.click('.choice-impact-summary [data-topic="forecast"]');
  assert.match(ui.query('.help-popup').textContent,/routine changes/);
  assert.match(ui.query('.help-popup').textContent,/Activities, care, events and aging cause changes/);
  assert.match(ui.query('.help-popup').textContent,/Yearly variation changes the size of routine effects without reversing them/);
  assert.doesNotMatch(ui.query('.help-popup').textContent,/Background development/);
  assert.doesNotMatch(ui.query('.help-popup').textContent,/Green:|Red:|segments|stat bars/);
  ui.click('.help-popup [data-action="close"]');
  assert.equal(ui.saved().rng,initial.rng);
  assert.equal(ui.saved().age,initial.age);
  assert.equal(ui.saved().cryLevel,5);
  assert.deepEqual(ui.saved().stats,initial.stats);
  assertNoMoneyDisplay(ui.query('.choice-impact-summary'),'annual forecast');
  ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.all('.stat-projection').length,0);
  assert.match(ui.query('.roots-panel [data-skill="stability"] strong').textContent,/^\d+\.\d\/10$/);
});

test('gender is visible next to the name and player height percentiles continue until eighteen', async () => {
  for(const gender of ['male','female','nonbinary']) {
    const baby=createGame({name:'Jamie Reed',seed:121,gender});
    baby.maturityAge=16;
    baby.height=17;
    baby.birthHeight=17;
    let ui=await mount(baby);
    assert.equal(ui.query('.profile-name-row .person-name').textContent,baby.name);
    assert.equal(ui.all('.profile-copy > .muted').length,0,'infants have no filler subtitle');
    assert.doesNotMatch(ui.query('.profile-copy').textContent,/A whole life ahead/);
    assert.equal(ui.query('.profile-identity .gender-label').textContent,gender==='nonbinary'?'Nonbinary':gender[0].toUpperCase()+gender.slice(1));
    assert.equal(ui.query('.profile-height .status-value').textContent,'17.0"');
    assert.equal(ui.all('.profile-height .stat-emoji').length,0,'height has no ruler emoji');
    assert.match(ui.query('.profile-height').getAttribute('aria-label'),/17\.0 inches/);
    assert.match(ui.query('.profile-height').textContent,/17\.0".*percentile/);
    assert.equal(ui.all('.year-stats .vitals-grid').length,0,'Year keeps vitals in the top strip without a duplicate bottom grid');
    assert.deepEqual(ui.all('.status-pill').map(pill=>pill.dataset.stat).sort(),[...SKILLS.map(skill=>skill.key),'health','stability','lifestyle'].sort());
    for(const key of [...SKILLS.map(skill=>skill.key),'health','stability','lifestyle','height']) {
      ui.click(key==='height'?'.profile-height':key==='lifestyle'?'.profile-lifestyle':`.status-strip [data-stat="${key}"]`);
      assert.equal(ui.query('.nav-list [data-tab="year"]').getAttribute('aria-current'),'page');
      assert.ok(ui.query('.help-popup'), 'top stats open their own help without leaving Year');
      assert.equal(ui.all('.stats-panel, .vitals-grid').length,0,'the duplicate detailed stats page is removed');
      ui.click('.help-popup [data-action="close"]');
    }
    assert.deepEqual(ui.saved(),baby,'opening top vitals must not alter the life');
    const grown=ageTo(baby,baby.maturityAge);
    const [storedInches,displayHeight]=({male:[69,`5'9"`],female:[71.5,`6'0"`],nonbinary:[71.49,`5'11"`]})[gender];
    grown.height=storedInches;
    grown.adultHeight=storedInches;
    ui=await mount(grown);
    assert.equal(ui.query('.profile-height .status-value').textContent,displayHeight,'height rounds to a whole inch and carries twelve inches into a foot');
    if(gender==='male') assert.match(ui.query('.profile-height').getAttribute('aria-label'),/5 feet 9 inches/);
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.query('.profile-height .status-value').textContent,displayHeight);
    assert.doesNotMatch(ui.query('.profile-height').textContent,/cm|centimetres/);
    assert.deepEqual(ui.saved(),grown,'display rounding preserves stored inches and stat precision');
    assert.match(ui.query('.profile-height .height-percentile').textContent,/percentile/);
    assert.equal(ui.query('.profile-height .height-percentile').dataset.percentileKey,'height');
    ui.click('.profile-height');
    assert.match(ui.query('.help-popup').textContent,/ending at 14–18/);
    assert.doesNotMatch(ui.query('.help-popup').textContent,/Current position|This person has reached/);
    const adult=ageTo(grown,18);
    chooseEducation(adult,'work');
    ui=await mount(adult);
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.query('.profile-height .height-percentile').textContent,'Adult height');
    assert.equal(ui.all('.profile-height .stat-percentile').length,0);
  }
});

test('only height shows a percentile before eighteen without changing current values or saves', async () => {
  const keys=[...SKILLS.map(skill=>skill.key),'health','stability','lifestyle','height'];
  const ordinal=value=>{
    const rank=Math.round(value);
    if(rank<1) return 'Below 1st percentile';
    if(rank>99) return 'Above 99th percentile';
    const suffix=rank%100>=11&&rank%100<=13?'th':({1:'st',2:'nd',3:'rd'}[rank%10]||'th');
    return `${rank}${suffix} percentile`;
  };
  for(const age of [0,1,2,17,18]) {
    const fixture=ageTo(createGame({seed:121}),age);
    if(age===18) chooseEducation(fixture,'work');
    fixture.lifestyle=4.26;
    fixture.parents.forEach(parent=>{parent.lifestyle=4.26;});
    const current=effectiveStats(fixture), percentiles=statPercentiles(fixture);
    const ui=await mount(fixture), saved=ui.saved(), writes=ui.writes();
    for(const tab of ['year']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.equal(ui.all('.stats-panel').length,0,'there is no duplicate stats page');
      assert.equal(ui.all('.profile-height .stat-percentile').length,age<18?1:0);
      for(const key of keys) {
        const row=ui.query(key==='height'?'.profile-height':key==='lifestyle'?'.profile-lifestyle':`.status-strip [data-stat="${key}"]`);
        const value=row.querySelector('.status-value');
        if(key==='height') {
          if(age<2) assert.equal(value.textContent,`${(Math.round(fixture.height*10)/10).toFixed(1)}"`);
          else {
            assert.match(value.textContent,/^\d+'(?:[0-9]|1[01])"$/);
            const [feet,inches]=value.textContent.slice(0,-1).split("'").map(Number);
            assert.equal(feet*12+inches,Math.round(fixture.height),'height displays the saved inches rounded to one inch');
          }
        } else assert.equal(value.firstChild.textContent,(key==='lifestyle'?fixture.lifestyle:current[key]).toFixed(1),`${key} always displays one decimal`);
        if(age<18 && key==='height') {
          const label=row.querySelector(`[data-percentile-key="${key}"]`);
          assert.ok(label,`${key} needs its own percentile`);
          assert.equal(label.textContent,ordinal(percentiles[key].percentile));
          assert.match(label.getAttribute('aria-label'),/percentile/);
        } else assert.equal(row.querySelectorAll('[data-percentile-key]').length,0,`${key} has no percentile label`);
      }
      assert.equal(ui.all('[data-topic="percentiles"]').length,0,'height uses its own help rather than generic stat percentiles');
      if(age<18) {
        ui.click('.profile-height');
        assert.match(ui.query('.help-popup').textContent,/Percentile compares simulated heights at your age/);
        ui.click('.help-popup [data-action="close"]');
      }
    }
    assert.deepEqual(ui.saved(),saved);
    assert.equal(ui.writes(),writes,'refreshing percentile displays must not save or reroll');
    if(age<18) {
      const ranks=ui.all('.profile-height .stat-percentile').map(label=>label.textContent);
      ui.click(age<2?'[data-action="baby"][data-level="5"]':'[data-action="focus"][data-key="self"][data-delta="-1"]');
      assert.deepEqual(ui.all('.profile-height .stat-percentile').map(label=>label.textContent),ranks,'changing future focus leaves current same-age ranks unchanged');
      assert.equal(ui.saved().rng,saved.rng);
      assert.equal(ui.saved().age,saved.age);
    }
  }
});

test('aging losses stay out of focus contributions and parents keep their explicit family roles', async () => {
  const fixture=ageTo(createGame({name:'Jamie Reed',seed:121,gender:'female'}),23);
  fixture.stats.attractiveness=8;
  fixture.parents[0].parentRole='mom';
  fixture.parents[1].parentRole='dad';
  const ui=await mount(fixture);
  assert.equal(ui.all('.choice-impact[data-stat="attractiveness"]:not([data-parent-id])').length,0);
  assert.ok(annualForecast(fixture).stats.attractiveness.change<0,'aging still affects the actual routine');
  assert.equal(ui.query('.status-strip [data-stat="attractiveness"] .status-value').firstChild.textContent,'8.0');
  ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.query(`.roots-panel [data-person-id="${fixture.parents[0].id}"] .eyebrow`).textContent,'Mom');
  assert.equal(ui.query(`.roots-panel [data-person-id="${fixture.parents[1].id}"] .eyebrow`).textContent,'Dad');
});

test('new-year review shows actual changes, survives reload, and dismisses persistently', async () => {
  let ui=await mount(createGame({name:'Jamie Reed',seed:121}));
  ui.click('[data-action="baby"][data-level="5"]');
  ui.click('[data-action="advance"]');
  const advanced=ui.saved();
  assert.equal(advanced.yearSummary.dismissed,false);
  assert.equal(ui.all('.year-review-modal').length,1);
  assert.equal(ui.query('.year-review-modal #modal-title').textContent,'Age 0 → 1');
  assert.match(ui.query('.year-decisions').textContent,/Cry level5\/5/);
  assert.equal(ui.all('.year-review-intro').length,0,'the recap heading already identifies the year');
  for(const [key,delta] of Object.entries(advanced.yearSummary.stats)) {
    assert.equal(ui.query(`.year-review-modal [data-stat="${key}"] strong`).textContent,`${delta.before.toFixed(1)} → ${delta.after.toFixed(1)}`);
  }
  const height=advanced.yearSummary.height;
  assert.equal(ui.query('.year-review-modal [data-stat="height"] > span').textContent,'Height');
  const reviewHeights=ui.query('.year-review-modal [data-stat="height"] strong').textContent.split(' → ');
  for(const [index,measurement] of [height.before,height.after].entries()) {
    assert.equal(reviewHeights[index],`${(Math.round(measurement*10)/10).toFixed(1)}"`);
  }
  assert.doesNotMatch(ui.query('.year-changes').textContent,/[+−-]\d/);
  assert.doesNotMatch(ui.query('.forecast-parents').textContent,/\bbond\b|[+−-]\d/i);
  assert.match(ui.query('.forecast-parents').textContent,/Mental stability [\d.]+ → [\d.]+.*Relationship [\d.]+ → [\d.]+/);
  assertNoMoneyDisplay(ui.query('.year-review-modal'),'year in review');
  assert.ok(ui.query('.forecast-parents').hasAttribute('open'),'parent changes start expanded');
  assert.ok(ui.query('#app').hasAttribute('inert'));
  ui=await mount(advanced);
  assert.equal(ui.all('.year-review-modal').length,1,'unread reviews reopen after reload');
  assert.deepEqual(ui.saved(),advanced);
  ui.key('.year-review-modal [data-action="close"]','Escape');
  assert.equal(ui.saved().yearSummary.dismissed,true);
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.query('#app').hasAttribute('inert'),false);
  const dismissed=ui.saved();
  ui=await mount(dismissed);
  assert.equal(ui.all('.year-review-modal').length,0);
  assert.deepEqual(ui.saved(),dismissed);
  const nextBabyChoice=structuredClone(advanced);
  nextBabyChoice.cryLevel=1;
  ui=await mount(nextBabyChoice);
  assert.match(ui.query('.year-decisions').textContent,/Cry level5\/5/,'the review uses the completed year, not the new cry choice');
  for(const [after,expected] of [[4.33,'4.3 → 4.3'],[4.36,'4.3 → 4.4']]) {
    const older=structuredClone(advanced);
    delete older.yearSummary.height;
    delete older.yearSummary.decisions;
    older.yearSummary.stats.intelligence={before:4.32,after,change:Math.round((after-4.32)*100)/100};
    older.yearSummary.parents[0].stability={before:8.12,after:8.13,change:.01};
    ui=await mount(older);
    assert.equal(ui.all('.year-review-modal [data-stat="height"]').length,0,'old reviews have no invented height history');
    assert.equal(ui.all('.year-decisions').length,0,'old reviews have no invented decisions');
    assert.equal(ui.query('.year-review-modal [data-stat="intelligence"] strong').textContent,expected);
    assert.match(ui.query('.forecast-parents').textContent,/Mental stability 8\.1 → 8\.1/);
    assert.deepEqual(ui.saved(),older);
  }
  const child=ageTo(createGame({seed:123}),7);
  for (const effect of child.effects) delete effect.focusLimits;
  child.focus={...defaultFocus(child.age),work:4,social:1,family:1,self:1};
  assert.equal(advanceYear(child,{mortalityRandom:()=>1,growthRandom:()=>0}).ok,true);
  child.focus={...defaultFocus(child.age),work:2,social:1,family:2,self:2};
  ui=await mount(child);
  assert.match(ui.query('.year-decisions').textContent,/School4\/4Friends1\/4Family1\/4Yourself1\/4Sports0\/2Extracurriculars0\/2Unused3 points/);
  assert.doesNotMatch(ui.query('.year-decisions').textContent,/Cry level/);
  assert.deepEqual(ui.saved(),child,'reading past decisions must preserve current controls');
  const historicalCry=ageTo(createGame({seed:123}),3);
  historicalCry.yearSummary.dismissed=false;
  historicalCry.yearSummary.decisions={cryLevel:4};
  ui=await mount(historicalCry);
  assert.match(ui.query('.year-decisions').textContent,/Cry level4\/5/,'an old age-two cry decision stays historically accurate');
  assert.doesNotMatch(ui.query('.year-decisions').textContent,/Play|Explore/);
  assert.deepEqual(ui.saved(),historicalCry);
});

test('a death before retirement opens a playable next chapter', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:121});
  assert.equal(advanceYear(fixture,{mortalityRandom:()=>0}).ok,true);
  assert.equal(fixture.alive,false);
  const ui=await mount(fixture);
  ui.click('.year-review-modal [data-action="close"]');
  assert.match(ui.query('#main-content').textContent,/died at age 1/);
  assert.equal(ui.all('.profile-height .stat-percentile').length,0,'a closed life no longer shows peer ranks');
  assert.doesNotMatch(ui.query('.profile-height').textContent,/Adult height/,'a baby’s final height is not adult height');
  ui.click('.bottom-dock .advance-button');
  assert.ok(ui.query('.beneficiary-preview'));
  ui.click('[data-action="heir"]');
  assert.match(ui.query('#modal-title').textContent,/legacy/i);
  ui.click('[data-action="confirm-heir"]');
  assert.equal(ui.saved().generation,2);
  assert.equal(ui.saved().alive,true);
  assert.equal(ui.saved().needsSuccession,false);
  assert.equal(validateSave(ui.saved()),true);
});

test('a confirmed new life with a blank surname uses a default while preserving the first name', async () => {
  const fixture=ageTo(createGame({name:'Riley Reed',seed:2091}),20);
  const ui=await mount(fixture);
  ui.click('[data-action="menu"]'); ui.click('.menu-list [data-action="new"]');
  ui.query('#new-surname').value='';
  ui.query('#new-name').value='Jamie';
  ui.click('[data-action="confirm-new"]');
  const replacement=ui.saved();
  assert.equal(replacement.age,0);
  assert.ok(replacement.familyName);
  assert.equal(replacement.name,`Jamie ${replacement.familyName}`);
  assert.equal(validateSave(replacement),true);
  assert.equal(ui.all('[role="dialog"]').length,0);
});

function siblingRetirementFixture() {
  const state=ageTo(createGame({surname:'rivera',firstName:'Alex',seed:2092}),18);
  assert.equal(haveChild(state).ok,true);
  ageTo(state,19); assert.equal(haveChild(state).ok,true);
  ageTo(state,65);
  assert.equal(succeed(state,state.children[0].id).ok,true);
  ageTo(state,65);
  state.money=51001; state.lifestyle=5;
  assert.equal(validateSave(state),true);
  assert.equal(successionInfo(state).route,'siblings');
  return state;
}

test('retirement can continue as a sibling while preserving actual parents and the family name', async () => {
  const fixture=siblingRetirementFixture();
  const parents=structuredClone(fixture.parents);
  const info=successionInfo(fixture), selected=info.candidates[0];
  const ui=await mount(fixture);
  assert.ok(ui.query('.retirement-notice'));
  ui.click('.retirement-notice');
  assert.match(ui.query('.retirement-panel').textContent,/sibling/i);
  assert.ok(ui.query('.sibling-grid'));
  ui.click(`[data-action="heir"][data-id="${selected.id}"]`);
  assert.equal(ui.saved().id,fixture.id);
  assertNoMoneyDisplay(ui.query('.modal'),'sibling retirement confirmation');
  ui.click('[data-action="confirm-heir"]');
  const next=ui.saved();
  assert.equal(next.id,selected.id);
  assert.equal(next.name,selected.name);
  assert.equal(next.familyName,fixture.familyName);
  assert.equal(next.money,selected.money+info.estate);
  assert.deepEqual(next.parents,parents,'a retired sibling must not become the new player’s parent');
  assert.ok(!next.parents.some(parent=>parent.id===fixture.id));
  assert.equal(validateSave(next),true);
});

test('children have priority over siblings and male and female heirs keep the typed surname', async () => {
  const fixture=siblingRetirementFixture();
  assert.equal(haveChild(fixture).ok,true);
  const child=fixture.children[0];
  for(const gender of ['male','female']) {
    const branch=structuredClone(fixture);
    Object.assign(branch.children[0],{gender,canGestate:gender==='female',attractedTo:[gender==='female'?'male':'female']});
    const ui=await mount(branch);
    ui.click('.nav-list [data-tab="family"]');
    const info=successionInfo(branch);
    assert.equal(info.route,'children');
    assert.deepEqual(ui.all('.retirement-panel .heir-candidate').map(card=>card.dataset.personId),[child.id]);
    assert.equal(ui.all(`[data-action="heir"][data-id="${branch.siblings[0].id}"]`).length,0);
    ui.click(`[data-action="heir"][data-id="${child.id}"]`);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().gender,gender);
    assert.equal(ui.saved().familyName,'Rivera');
    assert.ok(ui.saved().name.endsWith(' Rivera'));
    assert.equal(validateSave(ui.saved()),true);
  }
});

test('a childless retirement previews one stable beneficiary with natural ratings and a different surname', async () => {
  const fixture=ageTo(createGame({surname:'reed',firstName:'Sam',seed:2093}),65);
  fixture.money=82000; fixture.lifestyle=4;
  const info=successionInfo(fixture), candidate=info.candidates[0];
  assert.equal(info.route,'beneficiary');
  assert.notEqual(candidate.familyName.toLowerCase(),fixture.familyName.toLowerCase());
  let ui=await mount(fixture);
  ui.click('.retirement-notice');
  assert.match(ui.query('.beneficiary-preview').textContent,new RegExp(candidate.name));
  for(const skill of SKILLS) {
    const row=ui.query(`.beneficiary-preview [data-skill="${skill.key}"]`);
    assert.match(row.textContent,new RegExp(skill.label));
    assert.equal(row.querySelector('strong').firstChild.textContent,candidate.stats[skill.key].toFixed(1),'the preview displays the saved natural rating');
  }
  assert.deepEqual(ui.saved(),fixture,'previewing a beneficiary must not reroll or spend the legacy');
  ui=await mount(ui.saved()); ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.query('.beneficiary-preview').dataset.personId,candidate.id);
  ui.click(`[data-action="heir"][data-id="${candidate.id}"]`);
  assertNoMoneyDisplay(ui.query('.modal'),'beneficiary confirmation');
  assert.equal(ui.query('.modal-body strong').textContent,`${candidate.name} (Heir)`);
  assert.equal(ui.saved().familyName,fixture.familyName);
  ui.click('[data-action="confirm-heir"]');
  const next=ui.saved();
  assert.equal(next.id,candidate.id);
  assert.equal(next.name,candidate.name);
  assert.equal(next.familyName,candidate.familyName);
  assert.deepEqual(next.stats,candidate.stats);
  assert.equal(next.money,candidate.money+info.estate);
  assert.equal(next.needsSuccession,false);
  assert.equal(validateSave(next),true);
});

test('a previously finished v5 childless life can continue through a beneficiary at age85', async () => {
  const old=ageTo(createGame({name:'Morgan Brooks',seed:2094}),85);
  toLegacyCentimeters(old);
  old.version=5; old.ended=true; old.needsSuccession=false;
  for (const effect of old.effects) delete effect.focusLimits;
  // The pre-mortality schema capped every relative at 85.
  for(const person of [...old.parents,...old.children,...old.siblings]) {
    if(person.age>=85) { person.age=85; person.alive=false; }
  }
  for(const person of [old,...old.parents,...old.children,...old.siblings,...old.lineage,...old.encounters,old.partner].filter(Boolean)) { delete person.familyName; person.appearancePeakAge=30; }
  const ui=await mount(old);
  assert.equal(ui.saved().age,85);
  assert.equal(ui.saved().ended,false);
  assert.equal(ui.saved().needsSuccession,true);
  assert.equal(ui.all('[data-action="advance"]').length,0);
  assert.match(ui.query('.bottom-dock .advance-button').textContent,/Choose your heir/i);
  ui.click('.bottom-dock .advance-button');
  const candidate=successionInfo(ui.saved()).candidates[0];
  assert.ok(ui.query('.beneficiary-preview'));
  ui.click(`[data-action="heir"][data-id="${candidate.id}"]`);
  ui.click('[data-action="confirm-heir"]');
  assert.equal(ui.saved().id,candidate.id);
  assert.equal(validateSave(ui.saved()),true);
  assert.equal(ui.all('.bottom-dock [data-action="advance"]').length,1);
});

test('event decisions show consequences, block time, and persist across navigation and reloads', async () => {
  const fixture = pendingFixture(2);
  let ui = await mount(fixture);
  const first = EVENTS.find(event=>event.id===fixture.pendingEvents[0].eventId);
  assert.equal(ui.query('.event-decision').dataset.eventId,first.id);
  assert.equal(ui.all('[data-action="advance"]').length,0);
  assert.equal(ui.all('[data-action="event-choice"]').length,first.choices.length);
  for (const choice of first.choices) {
    const button=ui.query(`[data-action="event-choice"][data-choice="${choice.id}"]`);
    assert.match(button.textContent,new RegExp(choice.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.ok(button.querySelector('.event-consequences').textContent.length>0);
  }
  assertNoMoneyDisplay(ui.query('.event-decision'),'event consequences');
  for(const tab of ['career','family','year']) {
    ui.click(`.nav-list [data-tab="${tab}"]`);
    assert.equal(ui.query('.event-decision').dataset.eventId,first.id);
    assert.deepEqual(ui.saved(),fixture,'reading sections must not reroll pending events');
  }
  assert.ok(ui.all('[data-action="focus"]').every(button=>button.disabled));
  ui.click('[data-action="event-choice"]');
  assert.equal(ui.saved().age,fixture.age);
  assert.equal(ui.saved().pendingEvents.length,1);
  assert.notEqual(ui.query('.event-decision').dataset.eventId,first.id);
  const persisted=ui.saved();
  ui=await mount(persisted);
  assert.deepEqual(ui.saved(),persisted);
  assert.equal(ui.query('.event-decision').dataset.eventId,persisted.pendingEvents[0].eventId);
  ui.click('[data-action="event-choice"]');
  assert.equal(ui.saved().pendingEvents.length,0);
  assert.equal(ui.all('.event-decision').length,0);
  assert.equal(ui.all('.bottom-dock [data-action="advance"]').length,1);
  assert.equal(validateSave(ui.saved()),true);
});

test('temporary activity limits show their cause, enforce the cap, and survive reloads', async () => {
  const fixture = createGame({ seed: 78121 });
  fixture.age = 3;
  fixture.focus = { work: 2, social: 2, family: 2, self: 1, creative: 2 };
  fixture.effects = [{ id: 'broken_bone', name: 'Broken bone', description: 'Recovery at home.', years: 1, modifiers: { health: -.5 }, kind: 'negative', focusLimits: { toddler: { work: 2 }, standard: { social: 2 } } }];
  assert.equal(validateSave(fixture), true);
  let ui = await mount(fixture);
  const original = ui.saved();
  const row = '.focus-row[data-focus-key="work"]';
  assert.match(ui.query(`${row} .focus-limit`).textContent, /Max 2.*Broken bone.*this year/);
  assert.equal(ui.query(`${row} .stepper`).getAttribute('aria-describedby'), 'focus-limit-work');
  assert.equal(ui.all(`${row} .focus-scale .limited`).length, 2);
  assert.equal(ui.query(`${row} [data-delta="1"]`).disabled, true);
  ui.click(`${row} [data-delta="1"]`);
  assert.deepEqual(ui.saved(), original, 'disabled controls cannot exceed the limit');
  ui.click('.focus-row[data-focus-key="creative"] [data-delta="1"]');
  assert.equal(ui.saved().focus.creative, 3, 'freed points remain available elsewhere');
  ui.click('.nav-list [data-tab="year"]');
  assert.match(ui.query('.effect-list').textContent, /Play max 2.*1 year remaining/);
  assert.doesNotMatch(ui.query('.effect-list').textContent, /Recovery at home/);
  const persisted = ui.saved();
  ui = await mount(persisted);
  assert.match(ui.query(`${row} .focus-limit`).textContent, /Max 2.*this year/);
  assert.deepEqual(ui.saved(), persisted, 'reading restrictions never changes the save');

  const recovered = structuredClone(persisted);
  recovered.effects = [];
  recovered.focus.creative = 2;
  ui = await mount(recovered);
  assert.equal(ui.all('.focus-limit').length, 0);
  assert.equal(ui.query(`${row} [data-delta="1"]`).disabled, false);
  ui.click(`${row} [data-delta="1"]`);
  assert.equal(ui.saved().focus.work, 3);

  const school=ageTo(createGame({seed:121}),10);
  school.conditions=['movement_sensitive'];
  school.school.sports={id:'basketball',success:5};
  school.focus=defaultFocus(school);
  school.effects=[{id:'sports-recovery',name:'Recovery',description:'',years:1,modifiers:{},kind:'negative',focusLimits:{standard:{self:2}}}];
  ui=await mount(school);
  const sport='.focus-row[data-focus-key="sports"]';
  assert.match(ui.query('.effect-list').textContent,/Yourself max 2.*Sports max 1/);
  assert.doesNotMatch(ui.query('.effect-list').textContent,/Sports max 2/);
  assert.match(ui.query(`${sport} .focus-limit`).textContent,/Max 1.*Uncoordinated.*Recovery/);
  assert.equal(ui.query(`${sport} [data-delta="1"]`).disabled,true);
  assert.match(ui.query('.profile-bar [data-condition-id="movement_sensitive"]').textContent,/Yourself max 2 from age 5, lifelong.*Sports max 1 at ages 5–17, lifelong/);
  assert.deepEqual(ui.saved(),school,'displaying translated sports caps does not alter saved restrictions');
});

test('a new event previews activity tradeoffs and frees points when the choice applies', async () => {
  const fixture = createGame({ seed: 78122 });
  fixture.age = 3;
  fixture.focus = { work: 1, social: 4, family: 2, self: 1, creative: 2 };
  fixture.pendingEvents = [{ eventId: 'broken_tablet', age: 3 }];
  fixture.lastYearEvents = ['broken_tablet'];
  let ui = await mount(fixture);
  const event = EVENTS.find(event=>event.id==='broken_tablet');
  for (const choice of event.choices) {
    const consequences = ui.query(`[data-choice="${choice.id}"] .event-consequences`).textContent;
    const cap = choice.focusLimits?.toddler?.social;
    if (cap !== undefined) assert.ok(consequences.includes(`Electronics max ${cap}`));
    if (choice.focusLimits) assert.match(consequences, /1 year/);
  }
  assert.deepEqual(ui.saved(), fixture, 'previewing tradeoffs does not apply them or consume RNG');
  const choice = event.choices.find(choice=>choice.focusLimits?.toddler?.social<4);
  assert.ok(choice, 'the broken tablet requires an allocation tradeoff');
  ui.click(`[data-action="event-choice"][data-choice="${choice.id}"]`);
  const saved = ui.saved();
  assert.equal(saved.age, 3);
  assert.equal(saved.rng, fixture.rng);
  assert.equal(saved.focus.social, choice.focusLimits.toddler.social);
  assert.match(ui.query('.focus-row[data-focus-key="social"] .focus-limit').textContent, /Max \d.*this year/);
  assert.equal(validateSave(saved), true);
  ui = await mount(saved);
  assert.equal(ui.query('.focus-row[data-focus-key="social"] [data-delta="1"]').disabled, true);
  assert.deepEqual(ui.saved(), saved);
});

test('a focus-only choice previews signed whole points and duration without changing the pending save', async () => {
  const fixture=createGame({seed:78123});
  fixture.age=3; fixture.conditions=[]; fixture.focus=defaultFocus(3); fixture.effects=[];
  fixture.pendingEvents=[{eventId:'broken_tablet',age:3}];
  fixture.lastYearEvents=['broken_tablet'];
  const choice=EVENTS.find(event=>event.id==='broken_tablet').choices[0];
  const original=structuredClone(choice);
  try {
    // Exercise a supported outcome shape without adding a test-only catalog event.
    Object.assign(choice,{statChanges:{},modifiers:{},focusPoints:-1,years:1});
    delete choice.focusLimits;
    assert.equal(validateSave(fixture),true);
    const ui=await mount(fixture),before=ui.saved(),writes=ui.writes();
    assert.equal(ui.query(`[data-choice="${choice.id}"] .event-consequences`).textContent,'-1 focus point · 1 year');
    for(const tab of ['family','career','year']) ui.click(`.nav-list [data-tab="${tab}"]`);
    assert.deepEqual(ui.saved(),before,'consequence previews preserve stats, allocations, pending choices and RNG');
    assert.equal(ui.writes(),writes);
    ui.click(`[data-action="event-choice"][data-choice="${choice.id}"]`);
    const saved=ui.saved();
    assert.equal(saved.effects[0].focusPoints,-1);
    assert.equal(saved.effects[0].years,1);
    assert.equal(saved.effects[0].focusLimits,undefined);
    assert.deepEqual(saved.stats,before.stats);
    assert.equal(saved.rng,before.rng);
    assert.equal(focusBudget(saved),9);
    assert.match(ui.query('.effect-card.negative .effect-meta').textContent,/-1 focus point.*1 year remaining/);
    assert.doesNotMatch(ui.query('.effect-meta').textContent,/-1\.0|Health|Intelligence/);
    assert.match(ui.query('.journal-list').textContent,/-1 focus point.*Temporary effects: 1 year/);
    assert.equal(validateSave(saved),true);
  } finally {
    for(const key of Object.keys(choice)) delete choice[key];
    Object.assign(choice,original);
  }
});

test('study headaches show a reduced budget for one full turn and preserve recorded outcomes after expiry', async () => {
  const initial=createGame({seed:78124});
  initial.age=10; initial.conditions=[]; initial.effects=[];
  initial.school=createSchoolRecord(initial);
  initial.focus={work:4,social:2,family:2,self:2,sports:0,extracurricular:0};
  const steady={mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1};
  let affected;
  for(let rng=1;rng<=500;rng++) {
    const candidate={...structuredClone(initial),rng};
    assert.equal(advanceYear(candidate,steady).ok,true);
    if(candidate.lastYearEvents.includes('study_headache') && !candidate.pendingEvents.length && candidate.effects.length===1) {
      affected=candidate;
      break;
    }
  }
  assert.ok(affected,'a seeded completed study year produces the real headache event');
  assert.equal(affected.effects[0].focusPoints,-1);
  assert.equal(affected.yearSummary.decisions.focusBudget,10,'the event does not rewrite the budget of the year just completed');
  assert.equal(validateSave(affected),true);
  let ui=await mount(affected);
  const before=ui.saved(),writes=ui.writes();
  assert.match(ui.query('.effect-card.negative').textContent,/Headaches interrupt your studies.*-1 focus point.*1 year remaining/);
  assert.equal(ui.query('.focus-panel .panel-heading .tag').textContent,'9 / 9 POINTS');
  assert.ok(ui.all('.focus-row [data-delta="1"]').every(button=>button.disabled));
  assert.match(ui.query('.journal-list').textContent,/-1 focus point.*Temporary effects: 1 year/);
  assert.match(ui.query('.year-review-events').textContent,/Headaches interrupt your studies.*-1 focus point.*Temporary effects: 1 year/);
  assert.deepEqual(ui.saved(),before,'reading the active effect and recorded review does not change the save');
  assert.equal(ui.writes(),writes);
  ui.click('.year-review-modal [data-action="close"]');
  const planned=ui.saved();
  ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
  assert.deepEqual(ui.saved(),planned,'the reduced total prevents an extra focus point');
  ui.click('[data-topic="focus-work"]');
  assert.match(ui.query('.help-popup').textContent,/More study focus can increase study event chances/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('[data-topic="focus"]');
  assert.match(ui.query('.help-popup').textContent,/More focus can increase related activity event chances/);
  ui.click('.help-popup [data-action="close"]');
  ui=await mount(planned);
  assert.deepEqual(ui.saved(),planned);
  assert.equal(ui.query('.focus-panel .panel-heading .tag').textContent,'9 / 9 POINTS');
  let expiryInput,expired;
  for(let rng=1;rng<=500;rng++) {
    const input={...structuredClone(planned),rng},candidate=structuredClone(input);
    assert.equal(advanceYear(candidate,steady).ok,true);
    if(!candidate.lastYearEvents.length && !candidate.effects.length) { expiryInput=input; expired=candidate; break; }
  }
  assert.ok(expired,'an event-free next routine isolates the recovery');
  assert.equal(expired.yearSummary.decisions.focusBudget,9);
  assert.equal(expired.yearSummary.decisions.focusPointModifier,-1);
  assert.deepEqual(expired.focus,expiryInput.focus,'the returned point stays unspent');
  assert.equal(focusBudget(expired),10);
  ui=await mount(expired);
  assert.equal(ui.query('.focus-panel .panel-heading .tag').textContent,'9 / 10 POINTS');
  assert.equal(ui.all('.active-effects').length,0);
  assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-delta="1"]').disabled,false);
  assert.match(ui.query('.journal-list').textContent,/-1 focus point.*Temporary effects: 1 year/,'the recorded past outcome remains visible after expiry');
  assert.deepEqual(ui.saved(),expired,'reading the expired effect history never restores old allocations or edits recorded budgets');
});

test('every displayed option applies its own lasting consequences without advancing time', async () => {
  const fixture=pendingFixture();
  const event=EVENTS.find(event=>event.id===fixture.pendingEvents[0].eventId);
  for(const choice of event.choices) {
    const ui=await mount(fixture);
    ui.click(`[data-action="event-choice"][data-choice="${choice.id}"]`);
    const saved=ui.saved();
    assert.equal(saved.age,fixture.age);
    assert.equal(saved.pendingEvents.length,0);
    for(const [key,change] of Object.entries(choice.statChanges||{})) {
      const expected=changedRating(fixture.stats[key],change);
      assert.equal(saved.stats[key],expected);
    }
    assert.ok(saved.history.some(memory=>memory.text.includes(choice.label)));
    assert.equal(validateSave(saved),true);
  }
});

test('odds show independent quiet-year probability and only eligible events', async () => {
  const fixture=ageTo(createGame({seed:991}),10);
  const odds=eventOdds(fixture).filter(event=>event.chance>0);
  const quiet=odds.reduce((chance,event)=>chance*(1-event.chance),1);
  const ui=await mount(fixture);
  ui.click('[data-action="menu"]'); ui.click('.menu-list [data-action="odds"]');
  assert.equal(ui.all('.odds-row').length,odds.length);
  assert.match(ui.query('.chance-summary').textContent,new RegExp((quiet*100).toFixed(1).replace('.', '\\.')));
  assert.match(ui.query('.modal-body').textContent,/at most five/i);
  assert.doesNotMatch(ui.query('.modal-body').textContent,/discipline|relaxation/i);
  const impossible=EVENTS.filter(event=>!odds.some(candidate=>candidate.id===event.id));
  const titles=ui.all('.odds-row > span').map(element=>element.firstChild.textContent);
  for(const event of impossible) assert.ok(!titles.includes(event.name));
});

function resolvePending(state) {
  while (state.pendingEvents.length) {
    const event = EVENTS.find(event=>event.id===state.pendingEvents[0].eventId);
    assert.equal(resolveEventChoice(state,event.choices[0].id,event.id,state.pendingEvents[0].subjectId).ok,true);
  }
}
function resolveUIEvents(ui) {
  if (ui.all('.year-review-modal').length) ui.click('.year-review-modal [data-action="close"]');
  while (ui.saved().pendingEvents.length) ui.click('[data-action="event-choice"]');
}

function pendingFixture(count = 1) {
  const state = ageTo(createGame({name:'Taylor Reed',seed:908}),25);
  const previousYear = {...state,age:state.age-1};
  const eligible = new Set(eventOdds(previousYear).filter(event=>event.chance>0).map(event=>event.id));
  const choices = EVENTS.filter(event=>event.choices?.length && eligible.has(event.id)).slice(0,count);
  assert.equal(choices.length,count,'need enough eligible choice events for this fixture');
  state.pendingEvents=choices.map(event=>({eventId:event.id,age:state.age}));
  state.lastYearEvents=choices.map(event=>event.id);
  assert.equal(validateSave(state),true);
  return state;
}

function encounterFixture() {
  const state=ageTo(createGame({name:'Jordan Reed',seed:1447}),24);
  state.stats.attractiveness=10; state.stats.social=10;
  state.money=100000000; state.lifestyle=10;
  state.focus={work:1,social:4,family:1,self:2};
  state.effects=[];
  for(let attempt=0;attempt<5;attempt++) {
    assert.equal(advanceYear(state,{mortalityRandom:()=>1,growthRandom:()=>0}).ok,true); resolvePending(state);
    if(state.yearSummary) state.yearSummary.dismissed=true;
    if(state.encounters.length>=2) break;
  }
  assert.ok(state.encounters.length>=2 && state.encounters.length<=5);
  assert.equal(validateSave(state),true);
  return state;
}

function actionOutcome(fixture,action,predicate) {
  for(let rng=0;rng<2000;rng++) {
    const before=structuredClone(fixture);before.rng=rng;
    const after=structuredClone(before),result=action(after);
    if(result.ok && predicate(after,result)) return {before,after,result};
  }
  assert.fail('Could not find the required deterministic branch');
}

function partnerFixture() {
  const state=encounterFixture();
  state.stats.social=5; state.stats.stability=5; state.effects=[];
  return actionOutcome(state,s=>respondToEncounter(s,s.encounters[0].id,'relationship'),(s,result)=>result.accepted).after;
}

function beforeFamilySave(state) {
  const old=toLegacyCentimeters(structuredClone(state));old.version=4;
  for(const effect of old.effects) delete effect.focusLimits;
  for(const key of ['partner','encounters','encounterYear','pregnancy']) delete old[key];
  for(const person of [old,...old.parents,...old.children,...old.siblings,...old.lineage]) {
    for(const key of ['gender','canGestate','attractedTo','appearancePeakAge','relationship','familyName']) delete person[key];
  }
  return old;
}

function ageTo(state, age) {
  resolvePending(state);
  while (state.age < age) {
    if (needsEducationChoice(state)) assert.equal(chooseEducation(state, 'work').ok, true);
    assert.equal(advanceYear(state,{mortalityRandom:()=>1,growthRandom:()=>0}).ok, true);
    resolvePending(state);
  }
  if(state.yearSummary) state.yearSummary.dismissed=true;
  assert.equal(validateSave(state), true, 'fixture must be a valid loadable save');
  return state;
}

function startOfferedJob(state) {
  const job = offeredJobs(state).find(candidate => canTakeJob(state, candidate).ok);
  assert.ok(job, 'fixture must have a reachable offered career');
  assert.equal(takeJob(state, job.id).ok, true);
  return job;
}

function assertCareerOffers(ui, count) {
  const cards = ui.all('.job-card');
  assert.equal(cards.length, count);
  assert.equal(new Set(cards.map(card => card.dataset.jobId)).size, count);
  assert.deepEqual(cards.map(card => card.dataset.jobId), offeredJobs(ui.saved()).map(job => job.id));
  for (const card of cards) {
    const job = JOBS.find(candidate => candidate.id === card.dataset.jobId);
    assert.ok(job, 'every offered career belongs to the catalog');
    assert.equal(card.querySelector('h3 .label-with-help').firstChild.textContent, job.name);
    const lifestyle = card.querySelector('.job-lifestyle');
    assert.ok(lifestyle, 'every role must show its lifestyle, including the selected role');
    assert.match(lifestyle.textContent, new RegExp(`${job.baseLifestyle.toFixed(1).replace('.','\\.')}\\s*\\/\\s*10`));
    const affinities = [...card.querySelectorAll('.job-affinities .job-affinity')];
    assert.equal(affinities.length, Object.keys(job.affinities).length);
    for (const [key, affinity] of Object.entries(job.affinities)) {
      const badge = affinities.find(element => element.dataset.skill === key);
      assert.ok(badge, `${job.name} must display its ${key} affinity`);
      assert.match(badge.textContent, new RegExp(SKILLS.find(skill => skill.key === key).label));
      assert.match(badge.textContent, new RegExp(`\\+${affinity}\\b`));
    }
    assertNoMoneyDisplay(card, job.name);
  }
}

function assertNoMoneyDisplay(element, context) {
  const text = element.textContent;
  assert.doesNotMatch(text, /[$€£¥]\s*[\d,.]+|\b(?:USD|EUR|GBP)\s*[\d,.]+/, `${context} should not expose currency amounts`);
  assert.doesNotMatch(text, /Annual income|Annual spending|Income last year|Spending last year|base\s*\/\s*yr/i, `${context} should use lifestyle rather than income or spending metrics`);
}

// Build the shape exported before the stability update, independently of the
// migration implementation, to exercise both persisted and imported backups.
function legacySave(state) {
  const legacy = toLegacyCentimeters(structuredClone(state));
  legacy.version = 1;
  delete legacy.education;
  delete legacy.jobOffers;
  delete legacy.pendingEvents;
  delete legacy.lastYearEvents;
  for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, ...legacy.lineage]) {
    // Historical saves kept a numeric adult endpoint, including for children.
    person.adultHeight=Math.max(145,Math.min(205,person.adultHeight ?? 175));
    person.stats.discipline = 5;
    person.stats.relaxation = 7;
    person.aptitudes.discipline = 0;
    person.stats.instability = Math.round((11 - person.stats.stability) * 100) / 100;
    delete person.stats.stability;
    if (person !== legacy && !legacy.lineage.includes(person)) delete person.lifestyle;
  }
  for (const effect of legacy.effects) {
    delete effect.lifestyle;
    delete effect.focusLimits;
    if ('stability' in effect.modifiers) {
      effect.modifiers.instability = -effect.modifiers.stability;
      delete effect.modifiers.stability;
    }
  }
  return legacy;
}

async function mount(initial = createGame({ name: 'Jamie Reed', seed: 121 })) {
  for (const timer of timers) nativeClearTimeout(timer);
  timers.clear();
  const { document, window } = parseHTML(html);
  // LinkeDOM does not track focus; model that DOM behavior so modal focus
  // placement and return can be tested without driving a desktop browser.
  let focused = document.body;
  Object.defineProperty(document, 'activeElement', { configurable: true, get: () => focused });
  window.HTMLElement.prototype.focus = function () { focused = this; };
  const storage = new Map(initial === null ? [] : [[SAVE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  let saveWrites = 0;
  Object.assign(globalThis, {
    document,
    window,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => { saveWrites++; storage.set(key, String(value)); },
      removeItem: key => storage.delete(key),
    },
    setTimeout: (...args) => {
      const timer = nativeSetTimeout(...args);
      timer.unref();
      timers.add(timer);
      return timer;
    },
  });
  await import(`../app.js?dom-test=${++importId}`);
  const query = selector => {
    const result = document.querySelector(selector);
    assert.ok(result, `Expected DOM element ${selector}`);
    return result;
  };
  return {
    document,
    storage,
    writes: () => saveWrites,
    query,
    all: selector => [...document.querySelectorAll(selector)],
    saved: () => JSON.parse(storage.get(SAVE_KEY)),
    click: selector => {
      const element = query(selector);
      element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
    },
    key: (selector, key) => {
      const event = new window.Event('keydown', {bubbles:true,cancelable:true});
      Object.defineProperty(event,'key',{value:key});
      query(selector).dispatchEvent(event);
    },
    change: async (selector, file) => {
      const element = query(selector);
      Object.defineProperty(element, 'files', { configurable: true, value: [file] });
      element.dispatchEvent(new window.Event('change', { bubbles: true }));
      // The app awaits file.text() before opening a restore dialog.
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

afterEach(() => {
  for (const timer of timers) nativeClearTimeout(timer);
  timers.clear();
  for (const [key, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

describe('Dating and family DOM integration', {concurrency:false},()=>{
  test('a remembered partner does not hide new encounters',async()=>{
    const fixture=partnerFixture();
    fixture.partner.alive=false;
    fixture.partner.death={cause:'disease',age:fixture.partner.age};
    fixture.encounters=encounterFixture().encounters.map((person,index)=>({...person,id:`widowed-prospect-${index}`}));
    fixture.encounterYear=fixture.age;
    assert.equal(validateSave(fixture),true);
    const ui=await mount(fixture);
    ui.click('.nav-list [data-tab="family"]');
    assert.match(ui.query('.remembered-partner').textContent,new RegExp(fixture.partner.name));
    assert.equal(ui.all('.encounter-card').length,1);
    assert.equal(ui.all('[data-action="encounter"]').length,3);
    assert.equal(ui.all('[data-action="propose"]').length,0);
    ui.click('[data-action="encounter"][data-choice="ignore"]');
    assert.equal(ui.saved().encounters.length,fixture.encounters.length-1);
  });

  test('adult encounters show one complete profile at a time and ignoring persists',async()=>{
    let ui=await mount(ageTo(createGame({seed:1201}),17));
    ui.click('.nav-list [data-tab="family"]');
    assert.equal(ui.all('.encounter-card,[data-action="encounter"]').length,0);
    const fixture=encounterFixture();
    ui=await mount(fixture);
    assert.ok(ui.query('.connection-notice'));
    ui.click('.connection-notice');
    assert.equal(ui.query('.nav-list [data-tab="family"]').getAttribute('aria-current'),'page');
    assert.equal(ui.query('.encounter-list').dataset.total,String(fixture.encounters.length));
    for(let index=0;index<fixture.encounters.length;index++) {
      const person=fixture.encounters[index],card=ui.query('.encounter-card');
      assert.equal(ui.all('.encounter-card').length,1,'phone profiles must not become a long list');
      assert.equal(card.dataset.personId,person.id);
      assert.match(card.textContent,new RegExp(person.name));
      assert.ok(person.age>=18);
      assert.equal(card.querySelectorAll('.profile-stat[data-skill]').length,7);
      assert.equal(card.querySelectorAll('.profile-stat .aptitude').length,Object.values(person.aptitudes).filter(Boolean).length);
      for(const skill of [...SKILLS.map(s=>s.key),'health','stability']) assert.ok(card.querySelector(`[data-skill="${skill}"]`));
      for(const label of ['Lifestyle','Height']) assert.match(card.textContent,new RegExp(label));
      assert.equal(card.querySelector('[data-topic="lifestyle"]').closest('.profile-stat').querySelector('strong').firstChild.textContent,person.lifestyle.toFixed(1));
      assert.match(card.querySelector('[data-topic="height"]').closest('.profile-stat').querySelector('strong').textContent,/^\d+'(?:[0-9]|1[01])"$/);
      assert.doesNotMatch(card.textContent,/\bcm\b/);
      assert.equal(card.querySelectorAll('[data-action="encounter"]').length,3);
      assertNoMoneyDisplay(card,'dating profile');
      assert.deepEqual(ui.saved(),fixture,'browsing must not reroll or consume a profile');
      if(index<fixture.encounters.length-1) ui.click('[data-action="prospect-page"][data-delta="1"]');
    }
    const ignored=ui.query('.encounter-card').dataset.personId;
    ui.click('[data-action="encounter"][data-choice="ignore"]');
    assert.equal(ui.saved().encounters.length,fixture.encounters.length-1);
    assert.ok(!ui.saved().encounters.some(person=>person.id===ignored));
    assert.equal(ui.saved().age,fixture.age);
    const persisted=ui.saved();ui=await mount(persisted);
    ui.click('.nav-list [data-tab="family"]');
    assert.deepEqual(ui.saved(),persisted);
    assert.ok(!ui.saved().encounters.some(person=>person.id===ignored));
    assert.equal(ui.all('.encounter-card').length,1);
  });

  test('pursuit can be declined or become a relationship with displayed bonuses',async()=>{
    const fixture=encounterFixture();fixture.stats.social=5;fixture.stats.stability=5;
    for(const accepted of [false,true]) {
      const branch=actionOutcome(fixture,s=>respondToEncounter(s,s.encounters[0].id,'relationship'),(s,result)=>result.accepted===accepted);
      const prospect=branch.before.encounters[0];
      const ui=await mount(branch.before);ui.click('.nav-list [data-tab="family"]');
      const button=ui.query('[data-action="encounter"][data-choice="relationship"]');
      assert.match(button.textContent,new RegExp(`${Math.round(relationshipOdds(branch.before,prospect)*100)}%`));
      ui.click('[data-action="encounter"][data-choice="relationship"]');
      assert.deepEqual(ui.saved(),branch.after,'UI must perform exactly one pursuit roll');
      if(accepted) {
        assert.equal(ui.saved().partner.id,prospect.id);
        assert.equal(ui.saved().encounters.length,0);
        assert.equal(ui.all('.encounter-card').length,0);
        assert.ok(ui.saved().partner.relationship>=3 && ui.saved().partner.relationship<=7);
        assert.equal(ui.query('.partner-panel .relationship-summary strong').textContent,`${ui.saved().partner.relationship.toFixed(1)}/10`);
        assert.ok(effectiveStats(ui.saved()).social>effectiveStats(branch.before).social);
        assert.ok(effectiveStats(ui.saved()).stability>effectiveStats(branch.before).stability);
        assert.equal(ui.saved().lifestyle,Math.round((branch.before.lifestyle-1)*100)/100);
        assert.match(ui.query('.partner-panel').textContent,/Girlfriend/i);
      } else {
        assert.equal(ui.saved().partner,null);
        assert.equal(ui.saved().encounters.length,fixture.encounters.length-1);
        assert.ok(!ui.saved().encounters.some(person=>person.id===prospect.id));
        assert.match(ui.query('#toast-root').textContent,/not mutual/i);
      }
      assert.equal(validateSave(ui.saved()),true);
    }
  });

  test('a one-night stand can be accepted without starting a relationship',async()=>{
    const fixture=encounterFixture();fixture.stats.social=5;fixture.stats.stability=5;fixture.effects=[];
    const branch=actionOutcome(fixture,s=>respondToEncounter(s,s.encounters[0].id,'casual'),(s,result)=>result.accepted && !s.pregnancy);
    const ui=await mount(branch.before);ui.click('.nav-list [data-tab="family"]');
    ui.click('[data-action="encounter"][data-choice="casual"]');
    assert.deepEqual(ui.saved(),branch.after);
    assert.equal(ui.saved().partner,null);
    assert.equal(ui.saved().stats.social,5.25);
    assert.equal(ui.saved().stats.stability,4.9);
    assert.equal(ui.saved().encounters.length,fixture.encounters.length-1);
    assert.equal(ui.saved().age,fixture.age);
  });

  test('proposal outcomes persist, a rejection cannot be retried, and breakup requires confirmation',async()=>{
    const fixture=partnerFixture();fixture.partner.yearsTogether=3;
    for(const accepted of [false,true]) {
      const branch=actionOutcome(fixture,proposeMarriage,(s,result)=>result.accepted===accepted);
      let ui=await mount(branch.before);ui.click('.nav-list [data-tab="family"]');
      assert.match(ui.query('[data-action="propose"]').textContent,new RegExp(`${Math.round(proposalChance(branch.before)*100)}%`));
      ui.click('[data-action="propose"]');
      assert.deepEqual(ui.saved(),branch.after);
      const persisted=ui.saved();ui=await mount(persisted);ui.click('.nav-list [data-tab="family"]');
      assert.deepEqual(ui.saved(),persisted);
      if(accepted) {
        assert.match(ui.query('.partner-panel').textContent,/Wife|Married/);
        assert.equal(ui.all('[data-action="propose"]').length,0);
      } else {
        assert.equal(ui.query('[data-action="propose"]').disabled,true);
        ui.click('[data-action="propose"]');assert.deepEqual(ui.saved(),persisted);
        assert.match(ui.query('.partner-panel').textContent,/already proposed this year/i);
      }
      ui.click('[data-action="breakup"]');
      assert.deepEqual(ui.saved(),persisted);
      ui.click('.modal [data-action="close"]');assert.deepEqual(ui.saved(),persisted);
      ui.click('[data-action="breakup"]');ui.click('[data-action="confirm-breakup"]');
      assert.equal(ui.saved().partner,null);
      assert.equal(ui.saved().age,fixture.age);
      assert.equal(ui.all('.partner-panel').length,0);
      assert.equal(validateSave(ui.saved()),true);
    }
  });

  test('a pregnancy survives reload and becomes a newborn with a numeric relationship',async()=>{
    const fixture=partnerFixture();fixture.partner.married=true;fixture.partner.yearsTogether=4;
    const branch=actionOutcome(fixture,advanceYear,(s)=>Boolean(s.pregnancy));
    resolvePending(branch.after);
    let ui=await mount(branch.after);ui.click('.nav-list [data-tab="family"]');
    assert.match(ui.query('.pregnancy-panel').textContent,new RegExp(branch.after.pregnancy.otherParent.name));
    assert.ok(ui.query('.pregnancy-panel').textContent.includes(`${branch.after.pregnancy.otherParent.name} (Wife)`));
    assert.match(ui.query('.pregnancy-panel').textContent,new RegExp(`age ${branch.after.pregnancy.dueAge}`));
    assertNoMoneyDisplay(ui.query('.pregnancy-panel'),'pregnancy');
    const persisted=ui.saved();ui=await mount(persisted);assert.deepEqual(ui.saved(),persisted);
    ui.click('.bottom-dock [data-action="advance"]');resolveUIEvents(ui);
    assert.equal(ui.saved().pregnancy,null);
    assert.equal(ui.saved().children.length,1);
    assert.equal(ui.saved().children[0].age,0);
    assert.equal(ui.saved().children[0].adopted,false);
    ui.click('.nav-list [data-tab="family"]');
    assert.equal(ui.all('.pregnancy-panel').length,0);
    assert.equal(ui.query('.child-grid .relationship-summary strong').textContent,`${ui.saved().children[0].relationship.toFixed(1)}/10`);
    assert.equal(validateSave(ui.saved()),true);
  });

  test('child decisions name the correct child and change that child, their bond, and the player',async()=>{
    const fixture=ageTo(createGame({seed:1500}),25);
    haveChild(fixture);ageTo(fixture,26);haveChild(fixture);ageTo(fixture,33);
    fixture.stats.stability=5;
    for(const child of fixture.children) {child.stats.intelligence=5;child.relationship=5;}
    const event=EVENTS.find(event=>event.id==='household_child_school');
    fixture.pendingEvents=fixture.children.map(child=>({eventId:event.id,age:fixture.age,subjectType:'child',subjectId:child.id}));
    fixture.lastYearEvents=fixture.children.map(child=>`${event.id}:${child.id}`);
    assert.equal(validateSave(fixture),true);
    let ui=await mount(fixture);
    for(let index=0;index<fixture.children.length;index++) {
      const child=fixture.children[index];
      assert.equal(ui.query('.event-decision').dataset.subjectId,child.id);
      assert.match(ui.query('.event-decision').textContent,new RegExp(child.name));
      const role=child.gender==='male'?'Son':child.gender==='female'?'Daughter':'Child';
      assert.ok(ui.query('.event-decision .section-description').textContent.includes(`${child.name} (${role})`));
      assert.ok(ui.query('.event-context').textContent.includes(`${child.name} (${role})`));
      assert.doesNotMatch(ui.query('.event-decision').textContent,/\{name\}/);
      assert.equal(ui.all('[data-action="advance"]').length,0);
      ui.click('[data-action="event-choice"][data-choice="home"]');
      assert.equal(ui.saved().children[index].stats.intelligence,5.4);
      assert.equal(ui.saved().children[index].relationship,5.4);
      assert.equal(ui.saved().stats.stability,Math.round((5-.1*(index+1))*100)/100);
      if(index===0) {
        assert.equal(ui.saved().children[1].stats.intelligence,5);
        const persisted=ui.saved();ui=await mount(persisted);assert.deepEqual(ui.saved(),persisted);
      }
    }
    assert.equal(ui.saved().pendingEvents.length,0);
    assert.equal(ui.all('.event-decision').length,0);
    assert.equal(validateSave(ui.saved()),true);
  });

  test('partner decisions display personal and shared consequences and update the bond',async()=>{
    const fixture=partnerFixture();fixture.stats.social=5;fixture.partner.stats.social=5;fixture.partner.relationship=5;
    const event=EVENTS.find(event=>event.id==='household_partner_argument');
    fixture.pendingEvents=[{eventId:event.id,age:fixture.age,subjectType:'partner',subjectId:fixture.partner.id}];
    fixture.lastYearEvents=[`${event.id}:${fixture.partner.id}`];
    assert.equal(validateSave(fixture),true);
    const ui=await mount(fixture);
    assert.equal(ui.query('.event-decision').dataset.subjectId,fixture.partner.id);
    assert.match(ui.query('.event-decision').textContent,new RegExp(fixture.partner.name));
    assert.match(ui.query('[data-choice="listen"] .event-consequences').textContent,/Relationship.*5\.0 → 5\.6/);
    assert.doesNotMatch(ui.query('[data-choice="listen"] .event-consequences').textContent,/\bbond\b|[+−-]\d/i);
    ui.click('[data-action="event-choice"][data-choice="listen"]');
    assert.equal(ui.saved().stats.social,5.2);
    assert.equal(ui.saved().partner.stats.social,5.2);
    assert.equal(ui.saved().partner.relationship,5.6);
    ui.click('.nav-list [data-tab="family"]');
    assert.equal(ui.query('.partner-panel .relationship-summary strong').textContent,'5.6/10');
  });

  test('a v4 save preserves pending decisions and progress through the family update',async()=>{
    const fixture=pendingFixture(2);
    legacyRatingFloor(fixture);
    const legacy=beforeFamilySave(fixture);
    let ui=await mount(legacy);
    const restored=ui.saved();
    assert.equal(restored.version,fixture.version);
    for(const key of ['id','name','familyName','age','rng','nextId','education','jobOffers','stats','aptitudes','history','pendingEvents','lastYearEvents']) assert.deepEqual(restored[key],key==='aptitudes'?{...fixture[key],health:0,stability:0}:fixture[key],`${key} must survive migration`);
    assert.equal(restored.partner,null);assert.deepEqual(restored.encounters,[]);
    assert.equal(ui.query('.event-decision').dataset.eventId,fixture.pendingEvents[0].eventId);
    assert.equal(validateSave(restored),true);
    ui=await mount(restored);assert.deepEqual(ui.saved(),restored);
    resolveUIEvents(ui);assert.equal(ui.saved().pendingEvents.length,0);
    assert.equal(ui.saved().age,fixture.age);
  });
});

describe('Lifelines DOM integration', { concurrency: false }, () => {
  test('the phone navigation keeps one year action and preserves the current life', async () => {
    const fixture = ageTo(createGame({ name: 'Riley Santos', seed: 20 }), 12);
    for (const effect of fixture.effects) delete effect.focusLimits;
    fixture.focus = { ...defaultFocus(fixture.age), work: 4, social: 1, family: 1, self: 2 };
    assert.equal(validateSave(fixture), true);
    const ui = await mount(fixture);
    const originalSave = ui.saved();
    const expectedTabs = ['year', 'career', 'family'];
    const expectedLabels = ['Year', 'Career', 'Family'];
    assert.equal(ui.all('.sidebar, .right-column').length, 0);
    assert.equal(ui.all('.bottom-dock .nav-list .nav-button').length, 3);
    assert.deepEqual(ui.all('.bottom-dock .nav-button').map(button => button.dataset.tab), expectedTabs);
    assert.deepEqual(ui.all('.bottom-dock .nav-label').map(label => label.textContent.trim()), expectedLabels);
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.ok(ui.query('.bottom-dock [data-action="advance"]'));
    assert.match(ui.query('.profile-bar').textContent, /Riley Santos/);
    assert.match(ui.query('.status-strip').textContent, /Health/);
    assert.match(ui.query('.status-strip').textContent, /Mental stability/);

    for (const tab of ['career', 'family']) {
      ui.click(`.bottom-dock [data-tab="${tab}"]`);
      assert.equal(ui.all('[data-action="advance"]').length, 0, 'other screens must not advance time accidentally');
      assert.equal(ui.query(`.nav-list [data-tab="${tab}"]`).getAttribute('aria-current'), 'page');
      assert.equal(ui.all('.bottom-dock .nav-button').length, 3);
      assert.deepEqual(ui.saved(), originalSave, 'navigation must preserve the full saved life');
    }
    ui.click('.bottom-dock [data-tab="year"]');
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.deepEqual(ui.saved().focus, fixture.focus);
    ui.click('.bottom-dock [data-action="advance"]');
    resolveUIEvents(ui);
    assert.equal(ui.saved().age, 13);
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('the More menu exposes utilities and a new life still requires confirmation', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Casey Walker', seed: 21 }), 24));
    const originalSave = ui.saved();
    assert.equal(ui.all('[data-action="new"]').length, 0, 'restart belongs in the utility menu');
    ui.click('[data-action="menu"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.equal(ui.query('#app').hasAttribute('inert'), true, 'the game underneath a sheet must not receive taps');
    for (const action of ['help', 'export', 'import', 'new']) {
      assert.ok(ui.query(`.menu-list [data-action="${action}"]`));
    }
    assert.deepEqual(ui.saved(), originalSave);
    ui.click('.menu-list [data-action="new"]');
    assert.equal(ui.all('[role="dialog"]').length, 1, 'a new-life prompt must replace the utility sheet');
    assert.ok(ui.query('#new-name'));
    assert.ok(ui.query('#new-surname'));
    assert.ok(ui.query('[data-action="confirm-new"]'));
    assert.deepEqual(ui.saved(), originalSave, 'opening the restart prompt must not discard progress');
    ui.click('.modal [data-action="close"]');
    assert.deepEqual(ui.saved(), originalSave);
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(ui.document.body.style.overflow, '');
    assert.equal(ui.query('#app').hasAttribute('inert'), false);
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="help"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.match(ui.query('.modal-body').textContent, /focus/i);
    assert.deepEqual(ui.saved(), originalSave);
  });

  test('crying gives way to toddler activities at two and school focus at five', async () => {
    const fixture=createGame({name:'Jamie Reed',seed:121});
    fixture.parents.forEach(parent=>{parent.stats.stability=8;});
    let ui = await mount(fixture);
    const initial = ui.saved();
    assert.equal(initial.age, 0);
    assert.equal(ui.query('.person-name').textContent, 'Jamie Reed');
    assert.equal(ui.all('.cry-level').length, 5);
    assert.equal(ui.all('.year-stats').length,0,'all ratings live in the top section');
    for (const skill of SKILLS) {
      const cell=ui.query(`.status-strip [data-stat="${skill.key}"]`);
      assert.match(cell.textContent,new RegExp(skill.label));
      assert.equal(cell.querySelector('.status-value').firstChild.textContent,initial.stats[skill.key].toFixed(1));
      assert.equal(cell.querySelector('.status-value small').textContent,'/10');
    }
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.all('.status-strip .aptitude').length,Object.values(initial.aptitudes).filter(Boolean).length,'nonzero natural aptitudes remain beside ratings on Year');
    for(const skill of SKILLS) {
      const cell=ui.query(`.status-strip [data-stat="${skill.key}"]`);
      assert.equal(cell.querySelector('.aptitude')?.textContent.trim() || '',initial.aptitudes[skill.key] ? `${initial.aptitudes[skill.key]>0?'+':''}${initial.aptitudes[skill.key]}` : '');
    }
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.all('[data-action="focus"]').length, 0);

    ui.click('[data-action="baby"][data-level="5"]');
    assert.equal(ui.saved().cryLevel, 5);
    assert.equal(ui.query('[data-action="baby"][data-level="5"]').getAttribute('aria-pressed'), 'true');
    for (let year = 1; year <= 5; year += 1) {
      const usedChoices = ui.saved().focus;
      ui.click('[data-action="advance"]');
      if(year===2) assert.match(ui.query('.year-decisions').textContent,/Cry level5\/5/,'the review still shows the infant year just completed');
      if(year===2) assert.match(ui.query('.year-review-modal [data-stat="height"] strong').textContent,/^\d+\.\d" \u2192 \d+'(?:[0-9]|1[01])"$/,'the second birthday switches only the after-height into feet and inches');
      if(year===5) {
        assert.deepEqual(ui.saved().yearSummary.decisions.focus, usedChoices, 'the fifth-birthday review retains the exact toddler choices, including event limits');
        for (const [key, label] of [['work','Play'],['social','Electronics'],['family','Family time'],['self','Rest'],['creative','Arts & crafts']]) {
          assert.ok(ui.query('.year-decisions').textContent.includes(`${label}${usedChoices[key]}/4`));
        }
      }
      resolveUIEvents(ui);
      assert.equal(ui.saved().age, year, 'one click advances exactly one year');
      if(year===1) assert.equal(ui.all('.cry-level').length,5);
      if(year>=2 && year<=4) {
        assert.equal(ui.all('.cry-level').length,0);
        assert.match(ui.query('.focus-panel .panel-heading').textContent,/Toddler activities/);
        assert.deepEqual(ui.all('.focus-copy h4').map(heading=>[...heading.firstChild.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join('')),['Play','Electronics','Family time','Rest','Arts & crafts']);
        assert.match(ui.query('.profile-age .profile-stage').textContent,/Toddler/);
        assert.doesNotMatch(ui.query('.focus-panel').textContent,/School|Career/);
      }
      if(year===2) {
        ui.click('[data-action="focus"][data-key="social"][data-delta="-1"]');
        ui.click('[data-action="focus"][data-key="work"][data-delta="1"]');
        ui.click('[data-topic="toddler-focus"]');
        assert.match(ui.query('.help-popup').textContent,/10 points.*4 each/);
        assert.match(ui.query('.help-popup').textContent,/default 2.*no activity-driven stat changes/);
        ui.click('.help-popup [data-action="close"]');
        const persisted=ui.saved();
        ui=await mount(persisted);
        assert.deepEqual(ui.saved(),persisted,'toddler choices survive reload');
      }
    }
    assert.equal(ui.all('.cry-level').length, 0);
    assert.equal(ui.all('.focus-row').length, 6);
    assert.equal(ui.all('[data-action="focus"]').length, 12);
    assert.equal(ui.query('.status-strip [data-stat="intelligence"] .status-value').firstChild.textContent,ui.saved().stats.intelligence.toFixed(1),'the changing age-relative rating remains synchronized with the save');
    assert.ok(ui.saved().parents[0].stats.stability < initial.parents[0].stats.stability);
    assert.deepEqual(ui.all('.focus-copy h4').map(heading=>[...heading.firstChild.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join('')),['School','Friends','Family','Yourself','Sports','Extracurriculars']);
    assert.equal(ui.query('.profile-age .profile-stage').textContent,'Student');
    assert.equal(validateSave(ui.saved()), true);
    assert.doesNotMatch(ui.query('#app').textContent, /undefined|NaN/);
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.all('.status-strip .status-pill').length, 7);
    assert.equal(ui.all('.status-strip .aptitude').length, Object.values(ui.saved().aptitudes).filter(Boolean).length);
    assert.equal(ui.saved().age, 5, 'viewing detailed skills must not advance the year');
  });

  test('the focus controls enforce the shared budget and persist reallocations', async () => {
    const ui = await mount(ageTo(createGame({ seed: 19 }), 3));
    const plus = '[data-action="focus"][data-key="work"][data-delta="1"]';
    const minus = '[data-action="focus"][data-key="social"][data-delta="-1"]';
    assert.equal(ui.query(plus).disabled, true);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 2, 'disabled controls must not change the state');
    ui.click(minus);
    assert.equal(ui.query(plus).disabled, false);
    assert.equal(ui.saved().focus.social, 1);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 3);
    assert.equal(Object.values(ui.saved().focus).reduce((a, b) => a + b, 0), 10);
    assert.equal(ui.query(plus).disabled, true);
    assert.equal(ui.all('.budget-summary').length,0);
    assert.match(ui.query('.focus-panel .panel-heading .tag').textContent,/10 \/ 10 POINTS/);
  });

  test('toddler choices show their own point-sensitive effects without household changes or save mutation', async () => {
    const fixture=ageTo(createGame({seed:19}),3);
    fixture.focus={work:0,social:0,family:0,self:0,creative:0};
    fixture.lifestyle=5;
    fixture.parents.forEach(parent=>{parent.lifestyle=5;Object.assign(parent.career,{status:'employed',progress:4.6,focus:3});});
    assert.ok(annualForecast(fixture).lifestyle.change<0,'legacy whole ratings can exceed projected career support even with employed parents');
    for(const key of ['intelligence','strength','social','creativity']) fixture.aptitudes[key]=0;
    const ui=await mount(fixture);
    assert.equal(ui.all('.choice-impact-summary').length,0,'toddler previews appear beneath individual choices');
    assertChoiceImpacts(ui);
    const initialStrength=annualForecast(ui.saved()).stats.strength.change;
    for(let points=1;points<=4;points++) {
      ui.click('[data-action="focus"][data-key="work"][data-delta="1"]');
      assertChoiceImpacts(ui);
    }
    assert.ok(annualForecast(ui.saved()).stats.strength.change>initialStrength);
    const previousSocial=annualForecast(ui.saved()).stats.social.change;
    for(let points=1;points<=4;points++) {
      ui.click('[data-action="focus"][data-key="social"][data-delta="1"]');
      assertChoiceImpacts(ui);
    }
    assert.ok(annualForecast(ui.saved()).stats.social.change<previousSocial,'Electronics cost is reflected in the combined Social result');
    ui.click('[data-action="focus"][data-key="creative"][data-delta="1"]');
    ui.click('[data-action="focus"][data-key="self"][data-delta="1"]');
    assertChoiceImpacts(ui);
    assert.equal(ui.query('[data-action="focus"][data-key="work"][data-delta="1"]').disabled,true);
    const saved=ui.saved();
    assert.deepEqual(saved.stats,fixture.stats);
    assert.deepEqual(saved.parents,fixture.parents);
    assert.equal(saved.rng,fixture.rng);
    assert.equal(saved.age,fixture.age);
    const reloaded=await mount(saved);
    assert.deepEqual(reloaded.saved(),saved);
    assertChoiceImpacts(reloaded);
  });

  test('legacy toddler reviews retain Explore while migrated controls use Electronics and Arts & crafts', async () => {
    const legacy=ageTo(createGame({seed:123}),3);
    legacy.version=10;
    for (const effect of legacy.effects) delete effect.focusLimits;
    stripWellbeingAptitudes(legacy);
    legacy.focus={work:4,social:2,family:3,self:3};
    legacy.yearSummary.dismissed=false;
    legacy.yearSummary.decisions={workLabel:'Play',focus:{work:2,social:4,family:3,self:3}};
    const ui=await mount(legacy);
    assert.match(ui.query('.year-decisions').textContent,/Play2\/5Explore4\/5Family time3\/5Rest3\/5/);
    assert.doesNotMatch(ui.query('.year-decisions').textContent,/Electronics|Arts & crafts/,'historical choices must not be relabeled or invented');
    assert.deepEqual(ui.saved().yearSummary,legacy.yearSummary);
    assert.deepEqual(ui.saved().stats,legacy.stats);
    assert.equal(ui.saved().rng,legacy.rng);
    assert.deepEqual(ui.saved().focus,{work:3,social:2,family:3,self:2,creative:0},'only active controls adapt to the new scale; the completed review is untouched');
    for(const key of ['health','stability']) {
      assert.equal(ui.saved().aptitudes[key],0,'legacy wellbeing aptitude is neutral');
      assert.equal(ui.all(`.status-strip [data-stat="${key}"] .aptitude`).length,0);
    }
    assert.equal(validateSave(ui.saved()),true);
    ui.click('.year-review-modal [data-action="close"]');
    assert.deepEqual(ui.all('.focus-copy h4').map(heading=>[...heading.firstChild.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join('')),['Play','Electronics','Family time','Rest','Arts & crafts']);
  });

  test('Social is the stat label throughout Year, Family, careers, and contextual help', async () => {
    for(const fixture of [ageTo(createGame({seed:19}),3),partnerFixture()]) {
      const ui=await mount(fixture);
      for(const tab of ['year','family','career']) {
        ui.click(`.nav-list [data-tab="${tab}"]`);
        assert.doesNotMatch(ui.query('#app').textContent,/social ability/i,`${tab} uses the shorter stat label`);
      }
      ui.click('.nav-list [data-tab="year"]');
      ui.click('[data-topic="social"]');
      assert.equal(ui.query('.help-popup #modal-title').textContent,'Social');
      assert.doesNotMatch(ui.query('.help-popup').textContent,/social ability/i);
      ui.click('.help-popup [data-action="close"]');
      assert.deepEqual(ui.saved(),fixture,'label changes must preserve saved data');
    }
  });

  test('a child shares the displayed parental lifestyle until adulthood', async () => {
    const fixture = createGame({ name: 'Robin Park', seed: 211 });
    const initialLifestyle = fixture.parents[0].lifestyle;
    assert.ok(Number.isInteger(initialLifestyle) && initialLifestyle >= 1 && initialLifestyle <= 10);
    assert.ok(fixture.parents.every(parent => parent.lifestyle === initialLifestyle));
    const ui = await mount(fixture);
    for (let age = 0; age < 18; age += 1) {
      const saved=ui.saved();
      const parentLifestyle=householdLifestyle(saved);
      assert.equal(saved.age, age);
      assert.equal(saved.lifestyle, parentLifestyle);
      assert.equal(parseFloat(ui.query('.profile-lifestyle .status-value').textContent),Number(parentLifestyle.toFixed(1)));
      assert.equal(ui.query('.profile-lifestyle .status-value small').textContent,'/10');
      if (age === 0 || age === 17) {
        ui.click('.nav-list [data-tab="family"]');
        for (const card of ui.all('.roots-panel .family-card')) {
          assert.equal(card.querySelectorAll('.family-lifestyle, [data-topic="lifestyle"]').length,0,'parent lifestyle is omitted from Family cards');
        }
        ui.click('.nav-list [data-tab="year"]');
      }
      ui.click('.bottom-dock [data-action="advance"]');
    resolveUIEvents(ui);
    }
    assert.equal(ui.saved().age, 18);
    assert.equal(ui.saved().lifestyle, 1, 'an adult with no career or reserves starts supporting their own lifestyle');
    assert.equal(validateSave(ui.saved()), true);
  });

  test('Mental stability replaces abbreviated or legacy labels throughout Year, family, effects, and help', async () => {
    const fixture = ageTo(createGame({ name: 'Quinn Reed', seed: 212 }), 26);
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2, intelligence: -.6 }, kind: 'negative' }];
    const ui = await mount(fixture);
    for (const tab of ['year', 'career', 'family']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.doesNotMatch(ui.query('#app').textContent, /instability/i, `${tab} must use the positive stability scale`);
      if (tab==='year') assert.match(ui.query('.status-strip').textContent, /Mental stability\s*[\d.]+\s*\/\s*10/);
      else assert.equal(ui.all('.status-strip').length,0);
    }
    ui.click('.nav-list [data-tab="year"]');
    assert.match(ui.query('.effect-card.negative').textContent, /-1\.2 Mental stability/);
    assert.doesNotMatch(ui.query('.status-strip').textContent, /Higher is calmer/);
    ui.click('.status-strip [data-topic="stability"]');
    assert.match(ui.query('.help-popup').textContent, /Higher means calmer/);
    ui.click('.help-popup [data-action="close"]');
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="help"]');
    assert.doesNotMatch(ui.query('.modal-body').textContent, /instability/i);
    assert.match(ui.query('.modal-body').textContent, /Natural aptitude/i);
  });

  test('an existing v1 life upgrades its stability without resetting progress', async () => {
    const fixture = ageTo(createGame({ name: 'Jordan Chen', seed: 213 }), 28);
    startOfferedJob(fixture);
    assert.equal(haveChild(fixture).ok, true);
    advanceYear(fixture);
    resolvePending(fixture);
    fixture.children[0].stats.attractiveness = 5; // Keep this stability fixture outside the separate legacy infant appearance repair.
    fixture.focus = { work: 3, social: 1, family: 2, self: 2 };
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2 }, kind: 'negative' }];
    legacyRatingFloor(fixture);
    const legacy = legacySave(fixture);
    assert.equal(legacy.version, 1);
    assert.ok('instability' in legacy.stats);
    const ui = await mount(legacy);
    const restored = ui.saved();
    assert.equal(restored.version, fixture.version);
    for (const key of ['id', 'name', 'age', 'generation', 'rng', 'nextId', 'jobId', 'jobYears', 'money']) {
      assert.equal(restored[key], fixture[key], `${key} must survive upgrading an existing save`);
    }
    assert.deepEqual(restored.stats, fixture.stats);
    assert.deepEqual(restored.aptitudes, {...fixture.aptitudes,health:0,stability:0});
    assert.deepEqual(restored.focus, fixture.focus,'active legacy controls adapt back to the neutral-two scale');
    assert.deepEqual(restored.history, fixture.history);
    assert.deepEqual(restored.effects[0].modifiers, { stability: -1.2 });
    assert.deepEqual(restored.parents.map(parent => parent.stats), fixture.parents.map(parent => parent.stats));
    assert.deepEqual(restored.children.map(child => child.stats), fixture.children.map(child => child.stats));
    assert.equal(validateSave(restored), true);
    assert.equal(ui.query('.person-name').textContent, fixture.name);
    assert.match(ui.query('.profile-age').textContent, /29/);
    assert.doesNotMatch(ui.query('#app').textContent, /instability|undefined|NaN/i);
    ui.click('.bottom-dock [data-action="advance"]');
    resolveUIEvents(ui);
    assert.equal(ui.saved().age, 30, 'the migrated life must remain playable');
  });

  test('a v1 backup imports with converted stability after restore confirmation', async () => {
    const current = ageTo(createGame({ name: 'Sage Rivera', seed: 214 }), 7);
    const incoming = ageTo(createGame({ name: 'Ellis Brooks', seed: 215 }), 24);
    incoming.stats.stability = 6.25;
    const legacy = legacySave(incoming);
    assert.equal(legacy.stats.instability, 4.75);
    const ui = await mount(current);
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="import"]');
    const raw = JSON.stringify(legacy);
    await ui.change('#import-file', { size: raw.length, text: async () => raw });
    assert.equal(ui.saved().name, current.name, 'choosing a legacy backup must still wait for confirmation');
    assert.match(ui.query('.modal-body').textContent, /Ellis Brooks/);
    ui.click('#restore-save');
    const restored = ui.saved();
    assert.equal(restored.version, incoming.version);
    assert.equal(restored.name, incoming.name);
    assert.equal(restored.age, incoming.age);
    assert.equal(restored.stats.stability, 6.25);
    assert.deepEqual(restored.aptitudes, {...incoming.aptitudes,health:0,stability:0});
    assert.equal(restored.rng, incoming.rng);
    assert.equal(validateSave(restored), true);
    assert.equal(ui.query('.person-name').textContent, incoming.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
  });

  test('all sections render, childhood has no career offers, and dialogs close', async () => {
    const ui = await mount();
    ui.click('[data-action="tab"][data-tab="career"]');
    assert.equal(ui.all('.job-card').length, 0, 'career offers begin at adulthood');
    assert.equal(ui.all('[data-action="job"]').length, 0);
    assert.equal(ui.query('.career-locked-bar').textContent.trim(),'Unlocks at age 18');
    assert.equal(ui.query('.career-locked-bar').disabled,true);
    assert.doesNotMatch(ui.query('#main-content').textContent,/Find your calling|Your future starts here/);
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('.family-card').length, 2);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="tab"][data-tab="year"]');
    assert.equal(ui.all('.status-strip .status-pill').length, 7);
    ui.click('[data-action="menu"]');
    assert.ok(ui.query('.menu-list [data-action="export"]'));
    ui.click('.menu-list [data-action="help"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.deepEqual(ui.all('.help-item h4').map(heading=>heading.textContent), ['Babies','Each year','School','Stats','Events','Work','Family']);
    assert.match(ui.query('.help-grid').textContent,/Share 10 points as a toddler or school student, and 8 as an adult.*both use 0–2 points, starting at 1/);
    assert.equal(ui.document.body.style.overflow, 'hidden');
    ui.click('.modal [data-action="close"]');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(ui.document.body.style.overflow, '');
    ui.click('[data-action="menu"]');
    ui.click('[data-action="odds"]');
    assert.match(ui.query('.modal-body').textContent, /No events/);
    assert.ok(ui.query('.modal-body').textContent.includes(EVENTS.find(event=>event.id==='illness').name));
  });

  test('starting over stores the chosen name as escaped text', async () => {
    const ui = await mount(ageTo(createGame({ seed: 98 }), 7));
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="new"]');
    const chosenName = '<img>';
    const fullName = '<img> Reed';
    ui.query('#new-surname').value = 'reed';
    ui.query('#new-name').value = chosenName;
    ui.click('[data-action="confirm-new"]');
    assert.equal(ui.saved().name, fullName);
    assert.equal(ui.saved().familyName, 'Reed');
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.saved().generation, 1);
    assert.equal(ui.query('.person-name').textContent, fullName);
    assert.equal(ui.all('#app img').length, 0, 'name must never become executable HTML');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('an adult can choose a job, earn income, and welcome one child per year', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Morgan Park', seed: 76 }), 18));
    ui.click('[data-action="tab"][data-tab="career"]');
    assert.doesNotMatch(ui.query('#main-content').textContent,/Find your calling/);
    const offered = ui.all('[data-action="job"]').find(button => !button.disabled);
    assert.ok(offered, 'a new adult must have at least one reachable career');
    const jobId = offered.dataset.id;
    const jobButton = `[data-action="job"][data-id="${jobId}"]`;
    ui.click(jobButton);
    assert.equal(ui.saved().jobId, jobId);
    assert.equal(ui.saved().education.status, 'workforce');
    assert.equal(ui.query(jobButton).disabled, true);
    assertCareerOffers(ui, 10);
    ui.click('[data-action="tab"][data-tab="year"]');
    ui.click('[data-action="advance"]');
    resolveUIEvents(ui);
    assert.equal(ui.saved().age, 19);
    assert.ok(ui.saved().income > 0);
    assert.equal(ui.saved().jobYears, 1);
    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.equal(ui.saved().children[0].age, 0);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.match(ui.query('.child-grid').textContent, new RegExp(ui.saved().children[0].name));
    assert.equal(validateSave(ui.saved()), true);
  });

  test('turning eighteen requires a choice between college and ten personal career offers', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Rowan Ellis', seed: 216 }), 17));
    ui.click('.bottom-dock [data-action="advance"]');
    resolveUIEvents(ui);
    assert.equal(ui.saved().age, 18);
    assert.equal(ui.saved().education.status, 'undecided');
    assert.equal(ui.all('[data-action="advance"]').length, 0, 'the next year must wait for a path');
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your path/i);
    assert.match(ui.query('#main-content').textContent, /college/i);
    const beforeNavigation = ui.saved();
    ui.click('.bottom-dock .advance-button');
    assert.equal(ui.query('.nav-list [data-tab="career"]').getAttribute('aria-current'), 'page');
    assert.deepEqual(ui.saved(), beforeNavigation, 'opening the choices must preserve the life');
    assert.ok(ui.query('.education-choice [data-action="education"][data-path="college"]'));
    assert.equal(ui.all('[data-action="education"][data-path="work"]').length, 0, 'starting work means choosing an actual offered job');
    assert.equal(ui.all('#career-search, #career-category, [data-action="career-more"]').length, 0, 'the shortlist is the complete choice screen');
    assertCareerOffers(ui, 10);
    assertNoMoneyDisplay(ui.query('#app'), 'the college or career decision');
    ui.click('.nav-list [data-tab="year"]');
    assert.equal(ui.all('[data-action="advance"]').length, 0, 'changing tabs must not bypass the decision');
    assert.equal(ui.saved().age, 18);
  });

  test('four college years persist across reloads and unlock fifteen career offers', async () => {
    let ui = await mount(ageTo(createGame({ name: 'Avery Vale', seed: 217 }), 18));
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 10);
    ui.click('[data-action="education"][data-path="college"]');
    assert.equal(ui.saved().age, 18, 'enrolling does not spend a year');
    assert.deepEqual(ui.saved().education, { status: 'college', years: 0 });
    assert.equal(ui.saved().jobId, null);
    assert.equal(ui.all('.job-card').length, 0, 'college students cannot choose a full-time career');
    assert.match(ui.query('.college-progress').textContent, /0\s*\/\s*4/);
    assertNoMoneyDisplay(ui.query('#app'), 'college progress');
    for (let year = 1; year <= 4; year += 1) {
      ui.click('.nav-list [data-tab="year"]');
      assert.match(ui.query('.focus-row').textContent, /College/);
      ui.click('.bottom-dock [data-action="advance"]');
    resolveUIEvents(ui);
      assert.equal(ui.saved().age, 18 + year);
      assert.equal(ui.saved().education.years, year);
      assert.equal(validateSave(ui.saved()), true);
      ui.click('.nav-list [data-tab="career"]');
      if (year < 4) {
        assert.equal(ui.saved().education.status, 'college');
        assert.equal(ui.all('.job-card').length, 0);
        assert.match(ui.query('.college-progress').textContent, new RegExp(`${year}\\s*\\/\\s*4`));
      } else {
        assert.equal(ui.saved().education.status, 'graduate');
        assertCareerOffers(ui, 15);
      }
      if (year === 2) {
        const persisted = ui.saved();
        ui = await mount(persisted);
        assert.deepEqual(ui.saved(), persisted, 'reloading must preserve the exact college progress');
      }
    }
    const graduate = ui.saved();
    ui = await mount(graduate);
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 15);
    assert.deepEqual(ui.saved().jobOffers, graduate.jobOffers, 'reloading must not reroll the graduate shortlist');
    const choice = ui.all('[data-action="job"]').find(button => !button.disabled);
    assert.ok(choice, 'a graduate must have an attainable offered role');
    ui.click(`[data-action="job"][data-id="${choice.dataset.id}"]`);
    assert.equal(ui.saved().education.status, 'graduate', 'taking a role must preserve graduation');
    assert.equal(ui.saved().jobId, choice.dataset.id);
    assertCareerOffers(ui, 15);
    assertNoMoneyDisplay(ui.query('#app'), 'a graduate career');
  });

  test('an existing v2 career survives the education update without reopening the age-eighteen decision', async () => {
    const fixture = ageTo(createGame({ name: 'Emery Quinn', seed: 218 }), 29);
    startOfferedJob(fixture);
    assert.equal(advanceYear(fixture).ok, true);
    resolvePending(fixture);
    legacyRatingFloor(fixture); // Construct ratings that existed in the v2 save format.
    const legacy = toLegacyCentimeters(structuredClone(fixture));
    legacy.version = 2;
    for (const person of [legacy, ...legacy.parents, ...legacy.children, ...legacy.siblings, ...legacy.lineage]) {
    // Historical saves kept a numeric adult endpoint, including for children.
    person.adultHeight=Math.max(145,Math.min(205,person.adultHeight ?? 175));
      person.stats.discipline=5; person.stats.relaxation=7; person.aptitudes.discipline=0;
    }
    delete legacy.pendingEvents; delete legacy.lastYearEvents;
    delete legacy.education;
    delete legacy.jobOffers;
    // The v2 schema had stat modifiers only; household effects arrived later.
    for (const effect of legacy.effects) { delete effect.lifestyle; delete effect.focusLimits; }
    const ui = await mount(legacy);
    const restored = ui.saved();
    assert.equal(restored.version, fixture.version);
    assert.equal(restored.education.status, 'workforce');
    for (const key of ['id', 'name', 'age', 'rng', 'jobId', 'jobYears', 'money', 'lifestyle']) {
      assert.equal(restored[key], legacy[key], `${key} must survive the education migration`);
    }
    assert.deepEqual(restored.stats, fixture.stats);
    assert.deepEqual(restored.history, fixture.history);
    assert.equal(validateSave(restored), true);
    assert.equal(ui.all('.bottom-dock [data-action="advance"]').length, 1);
    ui.click('.nav-list [data-tab="career"]');
    assertCareerOffers(ui, 10);
    assert.ok(ui.query(`.job-card[data-job-id="${fixture.jobId}"]`), 'an existing career stays in the shortlist');
    assert.equal(ui.query(`[data-action="job"][data-id="${fixture.jobId}"]`).disabled, true);
    assert.equal(ui.all('[data-action="education"]').length, 0);
  });

  test('choosing an heir requires confirmation and transfers skills and an equal share', async () => {
    const elder = ageTo(createGame({ name: 'Alex Bennett', seed: 55 }), 18);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 19);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 65);
    elder.money = 100000;
    elder.lifestyle = 5;
    elder.children[1].conditions=['sharp_memory','literal_thinker'];
    const selected = structuredClone(elder.children[1]);
    const sibling = structuredClone(elder.children[0]);
    const info = successionInfo(elder);
    const ui = await mount(elder);
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('[data-action="heir"]').length, 2);
    const heir=ui.query(`.heir-candidate[data-person-id="${selected.id}"]`);
    assert.deepEqual([...heir.querySelectorAll('.birth-condition-name')].map(node=>node.textContent),['Sharp memory','Literal thinker']);
    assert.deepEqual([...heir.querySelectorAll('.birth-condition-effect')].map(node=>node.textContent),['+1 Intelligence affinity','-1 Creativity affinity','+1 Intelligence affinity']);
    assert.equal(heir.querySelector('.birth-conditions').getAttribute('aria-label'),`${selected.name}: perks`);
    ui.click(`[data-action="heir"][data-id="${selected.id}"]`);
    assert.equal(ui.saved().generation, 1, 'opening confirmation must leave the current life intact');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    const next = ui.saved();
    assert.equal(next.generation, 2);
    assert.equal(next.name, selected.name);
    assert.equal(next.age, selected.age);
    assert.deepEqual(next.stats, selected.stats);
    assert.deepEqual(next.aptitudes, selected.aptitudes);
    assert.equal(next.money, selected.money + info.share);
    assert.equal(next.siblings[0].money, sibling.money + info.share);
    assert.equal(next.children.length, 0);
    assert.equal(next.jobId, null);
    assert.equal(next.lineage.length, 1);
    assert.equal(ui.query('.person-name').textContent, selected.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(validateSave(next), true);
  });

  test('an elder can adopt a child, preventing a dead-end family story', async () => {
    const ui = await mount(ageTo(createGame({ name: 'Sage Chen', seed: 83 }), 67));
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.query('[data-action="child"]').disabled, false);
    assert.match(ui.query('[data-action="child"]').textContent, /Adopt a child/);
    ui.click('[data-action="child"]');
    assert.equal(ui.saved().children.length, 1);
    assert.equal(ui.saved().children[0].adopted, true);
    assert.equal(ui.saved().children[0].age, 0);
    assert.equal(ui.all('[data-action="heir"]').length, 1);
    assert.equal(validateSave(ui.saved()), true);
  });

  test('the phone dock leads to succession when a life closes', async () => {
    const elder = ageTo(createGame({ name: 'Jordan Patel', seed: 22 }), 60);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 85);
    const child = structuredClone(elder.children[0]);
    const ui = await mount(elder);
    assert.equal(ui.saved().needsSuccession, true);
    assert.equal(ui.all('[data-action="advance"]').length, 0);
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your heir/);
    ui.click('.bottom-dock .advance-button');
    assert.equal(ui.query('.nav-list [data-tab="family"]').getAttribute('aria-current'), 'page');
    assert.equal(ui.saved().age, 85);
    ui.click(`[data-action="heir"][data-id="${child.id}"]`);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assert.equal(ui.saved().name, child.name);
    assert.equal(ui.saved().age, child.age);
    assert.equal(ui.saved().needsSuccession, false);
    assert.equal(ui.saved().education.status, 'undecided', 'an adult heir gets their own college or career decision');
    assert.equal(ui.all('.bottom-dock [data-action="advance"]').length, 0);
    assert.match(ui.query('.bottom-dock .advance-button').textContent, /Choose your path/i);
    assert.equal(ui.query('#app').hasAttribute('inert'), false);
  });

  test('all views and succession show lifestyle without money or annual cash-flow metrics', async () => {
    const elder = ageTo(createGame({ name: 'Robin Reed', seed: 47 }), 18);
    startOfferedJob(elder);
    assert.equal(haveChild(elder).ok, true);
    ageTo(elder, 65);
    elder.money = 125000;
    elder.lifestyle = 5;
    assert.ok(elder.income > 0);
    assert.ok(elder.expenses > 0);
    const ui = await mount(elder);

    for (const tab of ['year', 'career', 'family']) {
      ui.click(`[data-action="tab"][data-tab="${tab}"]`);
      assertNoMoneyDisplay(ui.query('#app'), `${tab} view`);
      if (tab==='year') {
        assert.equal(parseFloat(ui.query('.profile-lifestyle .status-value').textContent),5,`${tab} view should show the saved lifestyle`);
        assert.equal(ui.query('.profile-lifestyle .status-value small').textContent,'/10');
      } else assert.equal(ui.all('.profile-lifestyle').length,0);
    }

    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="heir"]');
    assertNoMoneyDisplay(ui.query('.modal'), 'heir confirmation');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assertNoMoneyDisplay(ui.query('#app'), 'next generation');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'succession journal');
    assert.equal(parseFloat(ui.query('.profile-lifestyle .status-value').textContent),Number(ui.saved().lifestyle.toFixed(1)));
    assert.equal(ui.query('.profile-lifestyle .status-value small').textContent,'/10');
    ui.click('[data-action="history"]');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'complete family journal');
  });

  test('a saved life reloads and the same import can be retried after cancelling restore', async () => {
    const fixture = ageTo(createGame({ name: 'Taylor Brooks', seed: 99 }), 29);
    fixture.effects = []; // Isolate import persistence from this seed's newly rolled focus caps.
    fixture.focus = { ...defaultFocus(fixture.age), work: 4, social: 1, family: 1, self: 2 };
    assert.equal(validateSave(fixture), true);
    const ui = await mount(fixture);
    assert.equal(ui.saved().age, 29);
    assert.deepEqual(ui.saved().focus, fixture.focus);
    const input = ui.query('#import-file');
    input.value = 'C:\\fakepath\\lifelines-save.json';
    ui.click('[data-action="menu"]');
    assert.ok(ui.query('.menu-list [data-action="import"]'));
    ui.click('.menu-list [data-action="import"]');
    assert.equal(input.value, '', 'opening the picker must clear its previous file selection');
    const incoming = createGame({ name: 'Avery Rivera', seed: 42 });
    const raw = JSON.stringify(incoming);
    const importFile = { size: raw.length, text: async () => raw };
    input.value = 'C:\\fakepath\\lifelines-save.json';
    await ui.change('#import-file', importFile);
    assert.deepEqual(ui.saved(), fixture);
    assert.match(ui.query('.modal-body').textContent, /Avery Rivera/);
    ui.click('.modal [data-action="close"]');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.deepEqual(ui.saved(), fixture, 'cancelling restore must preserve every part of the current life');
    ui.click('[data-action="menu"]');
    ui.click('.menu-list [data-action="import"]');
    assert.equal(input.value, '', 'clearing the persistent input permits choosing the same file again');
    input.value = 'C:\\fakepath\\lifelines-save.json';
    await ui.change('#import-file', importFile);
    assert.deepEqual(ui.saved(), fixture, 'retrying import still requires explicit restore');
    assert.match(ui.query('.modal-body').textContent, /Avery Rivera/);
    ui.click('#restore-save');
    assert.equal(ui.saved().name, incoming.name);
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.query('.person-name').textContent, incoming.name);
    assert.equal(ui.all('[role="dialog"]').length, 0);
  });

  test('a malformed saved life asks for a surname before replacing the unreadable save', async () => {
    const unreadable='{"version":1,"age":10}';
    const ui = await mount(unreadable);
    assert.equal(ui.storage.get(SAVE_KEY), unreadable);
    assert.ok(ui.query('#new-surname'));
    assert.match(ui.query('#toast-root').textContent, /could not be read/);
    ui.query('#new-surname').value='newman';
    ui.click('[data-action="confirm-new"]');
    assert.equal(validateSave(ui.saved()), true);
    assert.equal(ui.saved().age, 0);
    assert.equal(ui.query('[data-action="advance"]').disabled, false);
    ui.click('[data-action="advance"]');
    resolveUIEvents(ui);
    assert.equal(ui.saved().age, 1);
  });
});

test('active effects stay accessible on Year with three tabs and no duplicate stats page', async () => {
  const fixture = createGame({ seed: 84022 });
  fixture.effects = [{ id: 'baby_separation_anxiety', name: 'Separation anxiety', description: 'Unfamiliar caregivers leave you unsettled.', years: 1, modifiers: { stability: -.4, social: -.2 }, kind: 'negative' }];
  const ui = await mount(fixture), original = ui.saved(), writes = ui.writes();
  assert.deepEqual(ui.all('.nav-button').map(button=>button.dataset.tab), ['year','career','family']);
  const panel = ui.query('.active-effects');
  assert.equal(panel.tagName, 'DETAILS');
  assert.equal(panel.hasAttribute('open'), false);
  assert.match(panel.querySelector('summary').textContent, /Active effects\s*1/);
  assert.match(panel.textContent, /Separation anxiety.*Mental stability.*Social.*1 year remaining/);
  assert.ok(panel.closest('#main-content'));
  assert.equal(ui.all('.stats-panel, [data-tab="character"]').length, 0);
  ui.click('.status-strip [data-topic="social"]');
  assert.equal(ui.query('.help-popup #modal-title').textContent, 'Social');
  ui.click('.help-popup [data-action="close"]');
  for (const tab of ['career','family']) {
    ui.click(`.nav-list [data-tab="${tab}"]`);
    assert.equal(ui.all('.active-effects, .status-strip, .profile-bar').length, 0);
  }
  ui.click('.nav-list [data-tab="year"]');
  assert.match(ui.query('.active-effects').textContent, /Separation anxiety/);
  assert.deepEqual(ui.saved(), original);
  assert.equal(ui.writes(), writes, 'reading effects and help does not change the save');
});

test('stat boxes show total temporary amounts beside aptitude while bars stay clear', async () => {
  const fixture = createGame({ seed: 84023 });
  fixture.age = 3;
  fixture.focus = { work: 2, social: 2, family: 2, self: 2, creative: 2 };
  fixture.stats.health = 5;
  fixture.stats.intelligence = 5;
  fixture.stats.strength = 6.2;
  fixture.effects = [
    { id: 'support', name: 'Swimming lessons', description: '', years: 2, modifiers: { health: .4, intelligence: .2 }, kind: 'positive' },
    { id: 'strain', name: 'Disrupted sleep', description: '', years: 1, modifiers: { health: -.4, intelligence: -.6 }, kind: 'negative' },
    { id: 'schedule', name: 'Craft schedule', description: '', years: 1, modifiers: { social: 0 }, focusLimits: { toddler: { creative: 2 } }, kind: 'neutral' },
  ];
  assert.equal(validateSave(fixture), true);
  let ui = await mount(fixture);
  const original = ui.saved(), writes = ui.writes(), stats = effectiveStats(fixture);
  for (const key of ['health','intelligence']) {
    const bar = ui.query(`.status-strip [data-stat="${key}"] .rating-track`);
    assert.equal(bar.querySelectorAll('.stat-effect-indicator').length,0,'buff amounts remain outside the bar');
    assert.equal(Number(bar.getAttribute('aria-valuenow')), Number(stats[key].toFixed(1)));
    assert.match(bar.getAttribute('aria-valuetext'), /Swimming lessons.*2 years/);
    assert.match(bar.getAttribute('aria-valuetext'), /Disrupted sleep.*1 year/);
    assert.equal(ui.query(`.status-strip [data-stat="${key}"] .status-value`).textContent, `${stats[key].toFixed(1)}/10`);
  }
  assert.equal(ui.query('.status-strip [data-stat="health"] .status-value').textContent, '5.0/10', 'opposite active modifiers cancel in the displayed total');
  for (const key of ['strength','social','creativity']) assert.equal(ui.all(`.status-strip [data-stat="${key}"] .stat-effect-indicator`).length, 0, 'permanent values, zero modifiers, and activity caps have no stat buff marker');
  assert.equal(ui.all('.parent-status .stat-effect-indicator').length, 0);
  assert.deepEqual(ui.saved(), original);
  assert.equal(ui.writes(), writes);
  ui = await mount(original);
  assert.equal(ui.all('.status-strip .stat-effect-indicator').length, 1);
  assert.equal(ui.query('.status-strip [data-stat="intelligence"] .status-reading .stat-effect-indicator').textContent,'-.4');
  assert.deepEqual(ui.saved(), original, 'reloading icons neither applies effects again nor consumes RNG');
});

test('temporary stat and lifestyle markers expire after their full turns and stay out of family profiles', async () => {
  const fixture = ageTo(createGame({ seed: 84024 }), 25);
  fixture.effects = [
    { id: 'brief_support', name: 'A visiting friend', description: '', years: 1, modifiers: { social: .4 }, kind: 'positive' },
    { id: 'repair', name: 'Home repairs', description: '', years: 1, modifiers: {}, lifestyle: -1, kind: 'negative' },
    { id: 'recovery', name: 'Recovery routine', description: '', years: 2, modifiers: { health: .3 }, kind: 'positive' },
  ];
  assert.equal(validateSave(fixture), true);
  let ui = await mount(fixture);
  assert.equal(ui.all('.profile-lifestyle .profile-lifestyle-heading .stat-effect-indicator[data-direction="debuff"]').length, 1);
  assert.match(ui.query('.profile-lifestyle .rating-track').getAttribute('aria-valuetext'), /Home repairs.*1 year/);
  assert.equal(ui.all('.status-strip [data-stat="social"] .stat-effect-indicator[data-direction="buff"]').length, 1);
  const original = ui.saved();
  ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.all('.family-card .stat-effect-indicator').length, 0);
  assert.deepEqual(ui.saved(), original);

  const quietAdvance = state => {
    for (let attempt = 1; attempt <= 300; attempt++) {
      const next = structuredClone(state);
      next.rng = Math.imul(attempt, 2654435761) >>> 0;
      assert.equal(advanceYear(next, { mortalityRandom:()=>1, growthRandom:()=>0, parentCareerRandom:()=>1 }).ok, true);
      if (next.lastYearEvents.length) continue;
      if (next.yearSummary) next.yearSummary.dismissed = true;
      return next;
    }
    assert.fail('no ordinary-event-free year found for expiry check');
  };
  const next = quietAdvance(original);
  ui = await mount(next);
  assert.equal(ui.all('.profile-lifestyle .stat-effect-indicator, .status-strip [data-stat="social"] .stat-effect-indicator').length, 0);
  assert.equal(ui.all('.status-strip [data-stat="health"] .stat-effect-indicator[data-direction="buff"]').length, 1);
  assert.match(ui.query('.status-strip [data-stat="health"] .rating-track').getAttribute('aria-valuetext'), /Recovery routine.*1 year/);
  assert.deepEqual(ui.saved(), next);
  const recovered = quietAdvance(next);
  ui = await mount(recovered);
  assert.equal(ui.all('.stat-effect-indicator').length, 0, 'expired effects leave no stale icon after reload');
  assert.equal(ui.all('.active-effects').length, 0);
  assert.deepEqual(ui.saved(), recovered);
});

test('player ratings appear on Year while Career and Family keep their own content', async () => {
  for(const fixture of [createGame({seed:121}),ageTo(createGame({seed:19}),3),partnerFixture()]) {
    const ui=await mount(fixture), original=ui.saved(), writes=ui.writes();
    for(const tab of ['year','family','career']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      if (tab==='year') {
        const stats=effectiveStats(original);
        assert.equal(ui.all('.status-strip .status-pill').length,7,'lifestyle moves below gender and height');
        assert.equal(ui.all('.profile-identity .profile-height').length,1);
        assert.equal(ui.all('.profile-identity .gender-label').length,1);
        assert.equal(ui.query('.profile-identity').nextElementSibling,ui.query('.profile-lifestyle'),'lifestyle has its own row immediately after gender and height');
        assert.equal(ui.all('.status-strip [data-stat="lifestyle"], .profile-lifestyle .aptitude').length,0);
        for(const key of ['health','stability']) {
          const badge=ui.document.querySelector(`.status-strip [data-stat="${key}"] .aptitude`);
          const aptitude=original.aptitudes[key];
          assert.equal(badge?.textContent || '',aptitude?`${aptitude>0?'+':''}${aptitude}`:'');
          assert.equal(ui.query(`.status-strip [data-stat="${key}"] .status-value`).textContent,`${stats[key].toFixed(1)}/10`);
        }
        for(const key of [...SKILLS.map(skill=>skill.key),'health','stability','lifestyle']) {
          const value=ui.query(key==='lifestyle'?'.profile-lifestyle .status-value':`.status-strip [data-stat="${key}"] .status-value`);
          assert.equal(value.textContent,`${(key==='lifestyle'?original.lifestyle:stats[key]).toFixed(1)}/10`);
        }
      } else {
        assert.equal(ui.all('.profile-bar, .status-strip, .stats-panel').length,0,`${tab} omits the player summary`);
      }
      assert.equal(ui.all('.stat-projection').length,0,'rating bars show the current value, not future segments');
      assertCurrentRatingBars(ui);
      assert.equal(ui.all('.year-stats').length,0,'the old skills panel is not repeated below the ratings');
    }
    assert.deepEqual(ui.saved(),original);
    assert.equal(ui.writes(),writes,'viewing numeric ratings never writes or rerolls the life');
  }
  const undecided=ageTo(createGame({seed:121}),18);
  const ui=await mount(undecided);
  assert.equal(needsEducationChoice(ui.saved()),true);
  assert.equal(ui.all('.choice-impact-summary').length,0,'a blocked education year has no expected changes');
});

test('parent ratings stay numeric while crying updates their separate choice impacts', async () => {
  const fixture=createGame({seed:121});
  fixture.parents.forEach(parent=>{parent.stats.stability=7;parent.relationship=7;});
  const ui=await mount(fixture);
  assert.deepEqual(ui.all('.parent-status h4').map(heading=>heading.textContent),['Dad:','Mom:']);
  assert.equal(ui.all('.parent-status [role="meter"]').length,fixture.parents.length*2);
  for(const parent of fixture.parents) {
    const row=ui.query(`.parent-status[data-parent-id="${parent.id}"]`);
    for(const key of ['stability','relationship']) assert.equal(row.querySelector(`[data-stat="${key}"] strong`).textContent,'7.0/10');
  }
  for(const level of [1,2,3,4,5]) {
    ui.click(`[data-action="baby"][data-level="${level}"]`);
    assertChoiceImpacts(ui);
    for(const parent of fixture.parents) {
      const stability=ui.document.querySelector(`.choice-impact[data-parent-id="${parent.id}"][data-stat="stability"]`);
      if(level===2) assert.equal(stability,null,'zero parent stability effects are omitted');
      else assert.equal(stability.querySelector('b').textContent,['+',null,'-','--','---'][level-1]);
      const effects=ui.all(`.choice-impact[data-parent-id="${parent.id}"][data-stat="relationship"]`);
      assert.equal(effects.length,level===3?0:1,'zero routine relationship changes are omitted');
      if(effects.length) assert.equal(effects[0].dataset.direction,level<3?'decrease':'increase');
    }
  }
  for(const parent of fixture.parents) assert.equal(ui.query(`.choice-impact[data-parent-id="${parent.id}"][data-stat="stability"]`).dataset.direction,'decrease');
  const saved=ui.saved();
  assert.equal(saved.rng,fixture.rng);
  assert.equal(saved.age,0);
  assert.deepEqual(saved.parents,fixture.parents);
  assert.equal(saved.cryLevel,5);
});

test('adult combined parent effects do not cancel each other and remembered parents have no forecast', async () => {
  const fixture=ageTo(createGame({seed:121}),30);
  fixture.parents.forEach(parent=>{parent.alive=true;delete parent.death;delete parent.abandonedAt;});
  fixture.guardian=null;
  for (const effect of fixture.effects) delete effect.focusLimits;
  fixture.focus={work:1,social:1,family:4,self:2};
  fixture.parents[0].stats.stability=2;
  fixture.parents[1].stats.stability=8;
  let ui=await mount(fixture);
  assertChoiceImpacts(ui);
  assert.equal(ui.query(`.choice-impact[data-parent-id="${fixture.parents[0].id}"][data-stat="stability"]`).dataset.direction,'increase');
  assert.equal(ui.query(`.choice-impact[data-parent-id="${fixture.parents[1].id}"][data-stat="stability"]`).dataset.direction,'increase');
  fixture.parents[0].alive=false;
  fixture.parents[0].death={cause:'disease',age:fixture.parents[0].age};
  ui=await mount(fixture);
  const remembered=ui.query(`.parent-status[data-parent-id="${fixture.parents[0].id}"]`);
  assert.match(remembered.textContent,/Mom:.*Deceased/);
  assert.equal(remembered.querySelectorAll('[role="meter"]').length,2,'remembered parents keep their recorded ratings');
  assert.equal(ui.all(`.choice-impact[data-parent-id="${fixture.parents[0].id}"]`).length,0);
  assert.deepEqual(ui.saved(),fixture);
  fixture.parents=fixture.parents.slice(0,1);
  ui=await mount(fixture);
  assert.equal(ui.all('.parent-status').length,1);
  assert.equal(ui.query('.parent-status h4').textContent,'Mom:');
  fixture.parents=[];
  ui=await mount(fixture);
  assert.equal(ui.all('.parent-status-list').length,0);
  const pending=pendingFixture();
  ui=await mount(pending);
  assert.equal(ui.all('.parent-status').length,pending.parents.length);
  assert.equal(ui.all('.choice-impact-summary').length,0,'pending decisions have no routine forecast');
  assert.deepEqual(ui.saved(),pending);
});

function assertChoiceImpacts(ui) {
  assert.equal(ui.all('.choice-impact[data-stat="lifestyle"]').length,0,'Lifestyle is never an expected activity change');
  const state=ui.saved();
  if (state.age>=2 && (state.age<18 || state.education.status==='college')) {
    const toddler=state.age<5;
    assert.equal(ui.all('.choice-impact-summary').length,0);
    assert.equal(ui.all('.activity-effects .choice-impact-group, .activity-effects h5').length,0,'inline effects have no sections or headings');
    for(const activity of Object.keys(defaultFocus(state.age))) {
      const row=ui.query(`.focus-row[data-focus-key="${activity}"]`);
      const expected=(toddler?toddlerChoiceImpacts:schoolChoiceImpacts)(state,activity);
      const distinct=new Set(expected.map(entry=>`${entry.parentId?'family':'you'}:${entry.stat}:${entry.level}:${Math.sign(entry.change)}`));
      assert.equal(row.querySelectorAll('.choice-impact').length,distinct.size);
      assert.equal(row.querySelectorAll('.activity-effects').length,expected.length?1:0);
      for(const {stat,parentId,change,level} of expected) {
        const selector=`.choice-impact[data-stat="${stat}"][data-target="${parentId?'family':'you'}"][data-level="${level}"][data-direction="${change>0?'increase':'decrease'}"]`;
        const entry=row.querySelector(selector);
        assert.ok(entry,`${activity} shows its ${stat} effect`);
        assert.equal(entry.querySelector('b').textContent,(change>0?'+':'-').repeat(level));
        assert.ok(entry.querySelector('[role="img"]').getAttribute('aria-label'));
        if(parentId) {
          assert.ok(entry.dataset.parentIds.split(' ').includes(parentId));
          assert.match(entry.textContent,/\(family\)/);
        }
      }
    }
    assert.equal(ui.all('.activity-effects [data-stat="lifestyle"], .activity-effects [data-stat="height"]').length,0);
    assert.deepEqual(ui.saved(),state);
    return;
  }
  const expected=choiceImpacts(state);
  assert.equal(ui.all('.focus-panel .choice-impact-summary').length,1);
  assert.equal(ui.query('.choice-impact-summary').getAttribute('aria-label'),'Expected changes');
  assert.equal(ui.all('.choice-impact-list .choice-impact').length,expected.length,'each nonzero expected effect appears once');
  const groups=[['you','You'],['others','Other people'],['relationships','Relationships']]
    .filter(([group])=>expected.some(entry=>entry.group===group));
  assert.deepEqual(ui.all('.choice-impact-group').map(group=>group.dataset.impactGroup),groups.map(([key])=>key),'only nonempty groups appear in the requested order');
  assert.deepEqual(ui.all('.choice-impact-group h5').map(heading=>heading.textContent),groups.map(([,label])=>label));
  for(const {stat:key,change,parentId,level,group} of expected) {
    const selector=`.choice-impact[data-stat="${key}"]${parentId?`[data-parent-id="${parentId}"]`:':not([data-parent-id])'}`;
    const entries=ui.all(selector);
    assert.equal(entries.length,1,`${key} has one net impact for ${parentId||'player'}`);
    const entry=entries[0];
    assert.equal(entry.closest('.choice-impact-group').dataset.impactGroup,group);
    assert.notEqual(change,0,'zero effects are not shown');
    const direction=change>0?'increase':'decrease';
    assert.equal(entry.dataset.direction,direction);
    assert.equal(Number(entry.dataset.level),level);
    assert.equal(entry.querySelector('b').textContent,(change>0?'+':'-').repeat(level));
    const spoken=entry.querySelector('[role="img"]');
    assert.ok(spoken,'the signed impact has an accessible description');
    assert.match(spoken.getAttribute('aria-label'),new RegExp(`(?:small|medium|large).*${direction}`));
    assert.doesNotMatch(entry.textContent,/[+\u2212-]\d|\+{7}|-{7}|\u2192/,'forecasts use qualitative signs without numerical deltas');
    if(parentId) assert.match(entry.textContent,/Dad|Mom|Parent/);
  }
  assert.equal(ui.all('.choice-impact[data-stat="height"]').length,0,'height keeps its separate physical unit');
}


function assertCurrentRatingBars(ui) {
  const header=ui.all('.status-strip .rating-track, .profile-lifestyle .rating-track');
  const tab=ui.query('.nav-button[aria-current="page"]').dataset.tab;
  assert.equal(header.length,tab==='year'?8:0,'top rating bars appear only on Year');
  for(const track of ui.all('.rating-track')) {
    const value=Number(track.getAttribute('aria-valuenow'));
    assert.equal(track.getAttribute('role'),'meter');
    assert.equal(Number(track.getAttribute('aria-valuemin')),0);
    assert.equal(Number(track.getAttribute('aria-valuemax')),10);
    assert.ok(value>=0&&value<=10);
    assert.ok(track.getAttribute('aria-label'));
    const fill=track.querySelector('.rating-fill');
    assert.ok(fill,'the fixed full track contains a separate filled portion');
    assert.ok(Math.abs(parseFloat(fill.style.width)-value*10)<.51,'fill length matches the current rating');
    assert.match(fill.getAttribute('style'),/hsl\(/,'fill color varies with the rating');
  }
}

test('rating bars distinguish low and high values and preserve displayed ratings and saves', async () => {
  const fixture=createGame({seed:121});
  fixture.stats.health=0;
  fixture.stats.intelligence=5.5;
  fixture.stats.strength=10;
  const ui=await mount(fixture),before=ui.saved();
  assertCurrentRatingBars(ui);
  const fill=key=>ui.query(`.status-strip [data-stat="${key}"] .rating-fill`);
  const hue=key=>Number(fill(key).getAttribute('style').match(/hsl\(\s*([\d.]+)/)[1]);
  assert.equal(parseFloat(fill('health').style.width),0);
  assert.equal(parseFloat(fill('strength').style.width),100);
  assert.equal(hue('health'),0,'minimum rating is red');
  assert.equal(hue('strength'),120,'maximum rating is green');
  assert.ok(hue('intelligence')>hue('health')&&hue('intelligence')<hue('strength'));
  ui.click('.nav-list [data-tab="year"]');
  assert.equal(ui.all('.status-strip .rating-track, .profile-lifestyle .rating-track').length,8);
  assertCurrentRatingBars(ui);
  ui.click('.nav-list [data-tab="family"]');
  for(const card of ui.all('.roots-panel .family-card')) {
    assert.equal(card.querySelectorAll('.rating-track').length,3,'parents retain health, mental stability, and relationship bars');
  }
  assertCurrentRatingBars(ui);
  assert.deepEqual(ui.saved(),before);
});

test('zero ratings stay readable in the header, family, and event outcomes', async () => {
  const fixture=createGame({seed:121});
  fixture.stats.health=0;
  fixture.lifestyle=0;
  fixture.parents.forEach(parent=>{parent.lifestyle=0;parent.relationship=0;parent.stats.stability=0;});
  fixture.history.unshift({id:'zero-outcome',age:0,generation:1,title:'A difficult year',text:`Your health 1.3 → 0; ${fixture.parents[0].name}: Mental stability 1 → 0.`,kind:'negative'});
  const ui=await mount(fixture);
  assert.equal(ui.query('.status-strip [data-stat="health"] .status-value').textContent,'0.0/10');
  assert.equal(ui.query('.profile-lifestyle .status-value').textContent,'0.0/10');
  assert.match(ui.query('#app').textContent,/Your health 1\.3 → 0\.0/);
  assertCurrentRatingBars(ui);
  ui.click('.nav-list [data-tab="family"]');
  for(const card of ui.all('.roots-panel .family-card')) {
    assert.equal(card.querySelector('.relationship-summary strong').textContent,'0.0/10');
    assert.equal(card.querySelector('[data-skill="stability"] strong').textContent,'0.0/10');
  }
  assert.deepEqual(ui.saved().stats,fixture.stats);
});

test('departed parents remain identified and the guardian receives care previews', async () => {
  const fixture=createGame({seed:121});
  fixture.age=3;
  fixture.focus={work:2,social:2,family:1,self:2,creative:2};
  fixture.parents.forEach(parent=>{parent.abandonedAt=0;});
  fixture.guardian={...structuredClone(fixture.parents[0]),id:'relative-guardian',name:'Anna Reed',guardianRole:'aunt',adoptedAt:0};
  delete fixture.guardian.abandonedAt;
  delete fixture.guardian.parentRole;
  fixture.guardian.relationship=7;
  fixture.guardian.stats.stability=7;
  fixture.guardian.conditions=['sharp_memory','literal_thinker'];
  const ui=await mount(fixture),before=ui.saved();
  assert.equal(ui.query('.parent-status[data-parent-id="relative-guardian"] h4').textContent,'Aunt:');
  assert.equal(ui.query('.parent-status[data-parent-id="relative-guardian"] .parent-status-state').textContent,'Guardian');
  for(const parent of fixture.parents) {
    assert.equal(ui.query(`.parent-status[data-parent-id="${parent.id}"] .parent-status-state`).textContent,'Left the family');
    assert.equal(ui.all(`.choice-impact[data-parent-id="${parent.id}"]`).length,0);
  }
  assert.ok(ui.all('.choice-impact[data-parent-ids="relative-guardian"]').length>0);
  assert.match(ui.query('.choice-impact[data-parent-ids="relative-guardian"]').textContent,/\(family\)/);
  assert.match(ui.query('.choice-impact[data-parent-ids="relative-guardian"] [role="img"]').getAttribute('aria-label'),/Aunt/);
  ui.click('[data-topic="toddler-family"]');
  assert.match(ui.query('.help-popup').textContent,/Guardian relationship/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('.nav-list [data-tab="family"]');
  const guardian=ui.query('.roots-panel [data-person-id="relative-guardian"]');
  assert.equal(guardian.querySelector('.eyebrow').textContent,'Aunt');
  assert.match(guardian.textContent,/Guardian/);
  assert.equal(guardian.querySelectorAll('.rating-track').length,3);
  assert.deepEqual([...guardian.querySelectorAll('.birth-condition-name')].map(node=>node.textContent),['Sharp memory','Literal thinker']);
  assert.deepEqual([...guardian.querySelectorAll('.birth-condition-effect')].map(node=>node.textContent),['+1 Intelligence affinity','-1 Creativity affinity','+1 Intelligence affinity']);
  for(const parent of fixture.parents) {
    const card=ui.query(`.roots-panel [data-person-id="${parent.id}"]`);
    assert.match(card.textContent,/Left the family/);
    assert.doesNotMatch(card.textContent,/Remembered/);
  }
  assert.deepEqual(ui.saved().guardian,before.guardian);
  assert.equal(ui.saved().rng,before.rng);
});

test('crying parent stability signs hide effects blocked by rating bounds', async () => {
  const fixture=createGame({seed:121});
  fixture.parents[0].stats.stability=10;
  fixture.parents[1].stats.stability=0;
  const ui=await mount(fixture),before=ui.saved();
  ui.click('[data-action="baby"][data-level="1"]');
  assertChoiceImpacts(ui);
  assert.equal(ui.all(`.choice-impact[data-parent-id="${fixture.parents[0].id}"][data-stat="stability"]`).length,0,'a parent at the ceiling cannot gain more stability');
  ui.click('[data-action="baby"][data-level="5"]');
  assertChoiceImpacts(ui);
  assert.equal(ui.all(`.choice-impact[data-parent-id="${fixture.parents[1].id}"][data-stat="stability"]`).length,0,'a parent at the floor cannot lose more stability');
  assert.deepEqual(ui.saved().parents,before.parents);
  assert.equal(ui.saved().rng,before.rng);
});

test('crying ranks intelligence and mental stability by the available levels, without strength effects', async () => {
  for(const age of [0,1]) for(const [rating,aptitude] of [[2.2,-3],[8.8,3]]) {
    const fixture=ageTo(createGame({seed:121}),age);
    fixture.stats.intelligence=rating;
    fixture.stats.stability=rating;
    fixture.aptitudes.intelligence=aptitude;
    const ui=await mount(fixture),before=ui.saved();
    for(const level of [1,2,3,4,5]) {
      ui.click(`[data-action="baby"][data-level="${level}"]`);
      assertChoiceImpacts(ui);
      for(const stat of ['intelligence','stability']) {
        const impact=ui.query(`.choice-impact[data-stat="${stat}"]:not([data-parent-id])`);
        assert.equal(impact.querySelector('b').textContent,['--','-','+','++','+++'][level-1],`${stat} compares cry choices regardless of starting rating or absolute gain`);
        assert.equal(impact.closest('.choice-impact-group').dataset.impactGroup,'you');
      }
      assert.equal(ui.all('.choice-impact[data-stat="strength"]:not([data-parent-id])').length,0,'crying does not change strength');
      assert.equal(ui.all('.choice-impact[data-level="0"], .choice-impact[data-direction="steady"]').length,0);
    }
    assert.deepEqual(ui.saved().stats,before.stats);
    assert.deepEqual(ui.saved().parents,before.parents);
    assert.equal(ui.saved().rng,before.rng);
    assert.equal(ui.saved().age,age);
  }
});

test('expected changes separate personal stats, other people and relationships, omitting empty groups', async () => {
  const fixture=createGame({seed:121});
  fixture.parents.forEach(parent=>{parent.stats.stability=7;parent.relationship=7;});
  const ui=await mount(fixture),before=ui.saved();
  ui.click('[data-action="baby"][data-level="5"]');
  assert.deepEqual(ui.all('.choice-impact-group h5').map(heading=>heading.textContent),['You','Other people','Relationships']);
  for(const entry of ui.all('.choice-impact-group[data-impact-group="you"] .choice-impact')) assert.equal(entry.hasAttribute('data-parent-id'),false);
  for(const entry of ui.all('.choice-impact-group[data-impact-group="others"] .choice-impact')) {
    assert.ok(entry.hasAttribute('data-parent-id'));
    assert.notEqual(entry.dataset.stat,'relationship');
  }
  for(const entry of ui.all('.choice-impact-group[data-impact-group="relationships"] .choice-impact')) {
    assert.ok(entry.hasAttribute('data-parent-id'));
    assert.equal(entry.dataset.stat,'relationship');
  }
  ui.click('[data-action="baby"][data-level="3"]');
  assert.equal(ui.all('.choice-impact-group[data-impact-group="relationships"]').length,0,'neutral relationships leave no empty heading or list');
  assert.deepEqual(ui.saved().stats,before.stats);
  assert.deepEqual(ui.saved().parents,before.parents);
  assert.equal(ui.saved().rng,before.rng);
});

test('zero personal effects at rating limits are omitted without changing remaining relative signs', async () => {
  const fixture=createGame({seed:121});
  fixture.stats.intelligence=10;
  fixture.stats.stability=0;
  const ui=await mount(fixture);
  ui.click('[data-action="baby"][data-level="5"]');
  assert.equal(ui.all('.choice-impact[data-stat="intelligence"]:not([data-parent-id])').length,0);
  assert.equal(ui.query('.choice-impact[data-stat="stability"]:not([data-parent-id]) b').textContent,'+++');
  ui.click('[data-action="baby"][data-level="1"]');
  assert.equal(ui.all('.choice-impact[data-stat="stability"]:not([data-parent-id])').length,0);
  assert.equal(ui.query('.choice-impact[data-stat="intelligence"]:not([data-parent-id]) b').textContent,'--');
  assert.equal(ui.saved().rng,fixture.rng);
  assert.deepEqual(ui.saved().stats,fixture.stats);
});

test('activity signs compare possible allocations rather than fixed numerical gains', async () => {
  const maximumGains=[];
  for(const aptitude of [-3,3]) {
    const fixture=ageTo(createGame({seed:121}),3);
    fixture.effects=[];
    fixture.aptitudes.strength=aptitude;
    fixture.stats.strength=5;
    fixture.focus={work:4,social:0,family:0,self:0,creative:0};
    const ui=await mount(fixture),before=ui.saved();
    maximumGains.push(toddlerChoiceImpacts(before,'work').find(entry=>entry.stat==='strength').change);
    assert.equal(ui.query('.choice-impact[data-stat="strength"]:not([data-parent-id]) b').textContent,'+++','maximum Play is three single-sign steps for either aptitude');
    ui.click('[data-action="focus"][data-key="work"][data-delta="-1"]');
    assert.equal(ui.query('.choice-impact[data-stat="strength"]:not([data-parent-id]) b').textContent,'+','one fewer Play point is one sign above neutral');
    assert.deepEqual(ui.saved().stats,before.stats);
    assert.equal(ui.saved().rng,before.rng);
  }
  assert.ok(maximumGains[0]>0 && maximumGains[1]>maximumGains[0],'the same signs apply despite different absolute gains');
});

test('school and college decisions show signed effects inside each choice and update without changing stats', async () => {
  for(const age of [5,17,18]) {
    const fixture=ageTo(createGame({seed:121}),age);
    if(age===18) assert.equal(chooseEducation(fixture,'college').ok,true);
    fixture.effects=[];
    fixture.focus={...defaultFocus(fixture.age),work:3,social:1,family:2,self:2};
    for(const key of Object.keys(fixture.stats)) fixture.stats[key]=5;
    for(const key of Object.keys(fixture.aptitudes)) fixture.aptitudes[key]=0;
    fixture.parents.forEach(parent=>{parent.stats.stability=5;parent.relationship=5;});
    const ui=await mount(fixture),before=ui.saved();
    assertChoiceImpacts(ui);
    const work=ui.query('.focus-row[data-focus-key="work"]');
    assert.match(work.querySelector('h4').textContent,age<18?/School/:/College/);
    assert.equal(work.querySelector('[data-stat="intelligence"] b').textContent,age<18?'++':'+');
    assert.equal(work.querySelector('[data-stat="stability"] b').textContent,'-');
    ui.click('[data-action="focus"][data-key="social"][data-delta="-1"]');
    ui.click('[data-action="focus"][data-key="work"][data-delta="1"]');
    assertChoiceImpacts(ui);
    assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-stat="intelligence"] b').textContent,'+++');
    assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-stat="stability"] b').textContent,'---');
    assert.deepEqual(ui.saved().stats,before.stats);
    assert.deepEqual(ui.saved().parents,before.parents);
    assert.equal(ui.saved().rng,before.rng);
  }
});

test('school controls expose the new activities, requested effects and help through reload', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[];
  fixture.school.sports={id:'basketball',success:5};
  fixture.school.extracurricular={id:'drama',success:5};
  fixture.focus={work:3,social:1,family:0,self:3,sports:2,extracurricular:1};
  for(const key of Object.keys(fixture.stats)) { fixture.stats[key]=5; fixture.aptitudes[key]=0; }
  let ui=await mount(fixture);
  const expected={
    work:{intelligence:'++',creativity:'+',social:'-',stability:'-'},
    social:{social:'-',stability:'-'},
    self:{attractiveness:'+',health:'+',stability:'+'},
    sports:{strength:'++',social:'++'},
  };
  for(let reload=0;reload<2;reload++) {
    assert.equal(ui.all('.focus-row').length,6);
    for(const [area,stats] of Object.entries(expected)) {
      const entries=ui.all(`.focus-row[data-focus-key="${area}"] .choice-impact[data-target="you"]`);
      assert.deepEqual(Object.fromEntries(entries.map(entry=>[entry.dataset.stat,entry.querySelector('b').textContent])),stats);
    }
    assert.deepEqual(ui.saved().stats,fixture.stats);
    assert.equal(ui.saved().rng,fixture.rng);
    ui=await mount(ui.saved());
  }
  ui.click('[data-action="focus"][data-key="sports"][data-delta="-1"]');
  ui.click('[data-action="focus"][data-key="extracurricular"][data-delta="1"]');
  assert.deepEqual(ui.all('.focus-row[data-focus-key="extracurricular"] .choice-impact').map(entry=>entry.dataset.stat).sort(),['creativity','social']);
  ui.click('[data-topic="focus-sports"]');
  assert.match(ui.query('.help-popup').textContent,/Every sport trains Strength and Social/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('[data-topic="focus-self"]');
  assert.match(ui.query('.help-popup').textContent,/Attractiveness, mental stability and Health/);
});

test('old school reviews retain four recorded choices while current controls gain six', async () => {
  const old=ageTo(createGame({seed:121}),10);
  old.version=17; old.conditions=[]; old.effects=[];
  delete old.school; delete old.yearSummary.school;
  old.focus={work:3,social:1,family:2,self:2};
  old.yearSummary.decisions={focus:{work:2,social:2,family:2,self:2},workLabel:'School',focusMax:4,focusBudget:8};
  old.yearSummary.dismissed=false;
  const before=structuredClone(old);
  const ui=await mount(old);
  assert.equal(ui.saved().version,createGame({seed:1}).version);
  assert.deepEqual(ui.saved().yearSummary,before.yearSummary);
  assert.deepEqual(ui.saved().stats,before.stats);
  assert.equal(ui.saved().rng,before.rng);
  assert.equal(ui.all('.focus-row').length,6);
  assert.deepEqual(ui.saved().focus,{...old.focus,sports:0,extracurricular:0});
  assert.equal(ui.query('.year-decisions').textContent,'Your choicesSchool2/4Friends2/4Family2/4Yourself2/4');
});

test('School GPA displays letter grades and help without changing the report when focus changes', async () => {
  const base=ageTo(createGame({seed:121}),10);
  base.conditions=[]; base.effects=[]; base.focus=defaultFocus(base);
  for(const [score,letter] of [[98,'A+'],[80,'B-'],[50,'F-']]) {
    const fixture=structuredClone(base);
    fixture.school.gpa=score;
    const ui=await mount(fixture),before=ui.saved(),writes=ui.writes();
    assert.equal(ui.query('.school-grade > strong').textContent,letter);
    assert.equal(ui.query('.school-grade > strong').getAttribute('aria-label'),`School GPA ${letter}`);
    assert.match(ui.query('.school-grade').textContent,/Latest report card/);
    ui.click('[data-topic="school-gpa"]');
    assert.match(ui.query('.help-popup').textContent,/Study effort sets your yearly grade, with Intelligence adjusting it.*same grade with less study.*updates after each school year/);
    ui.click('.help-popup [data-action="close"]');
    assert.equal(ui.writes(),writes);
    assert.deepEqual(ui.saved(),before);
    ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
    assert.equal(ui.query('.school-grade > strong').textContent,letter,'changing plans does not rewrite the completed grade');
    assert.equal(ui.saved().school.gpa,score);
    assert.equal(ui.saved().rng,before.rng);
    ui.click('.nav-list [data-tab="family"]');
    assert.equal(ui.all('.school-grade').length,0);
    ui.click('.nav-list [data-tab="career"]');
    assert.equal(ui.all('.school-grade').length,0);
  }
  const firstYear=await mount(ageTo(createGame({seed:121}),5));
  assert.equal(firstYear.query('.school-grade > strong').textContent,'N/A');
  assert.match(firstYear.query('.school-grade').textContent,/No report card yet/);
  for(const age of [4,18]) {
    const ui=await mount(ageTo(createGame({seed:121}),age));
    assert.equal(ui.all('.school-grade').length,0,'only school-age Year displays GPA');
  }
});

test('expected GPA updates with study and effective Intelligence while preserving the earned report', async () => {
  for(const [age,intelligence,bonus,letters] of [
    [5,5,0,['F-','D','B-','A-','A+']],
    [10,1,2,['F-','D-','C','B','A']],
    [17,8,0,['F','C-','B','A','A+']],
  ]) {
    const fixture=ageTo(createGame({seed:121}),age);
    fixture.conditions=[]; fixture.effects=[]; fixture.focus={...defaultFocus(fixture),work:0};
    fixture.stats.intelligence=intelligence;
    if(bonus) fixture.effects=[{id:'saved-learning',name:'Saved learning boost',description:'Saved effect',years:1,modifiers:{intelligence:bonus},kind:'positive'}];
    assert.equal(validateSave(fixture),true);
    let ui=await mount(fixture);
    const before=ui.saved();
    const earned=ui.query('.school-grade > strong').textContent;
    for(let points=0;points<=4;points++) {
      if(points) ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
      const preview=ui.query('.focus-row[data-focus-key="work"] .school-gpa-preview');
      assert.equal(preview.getAttribute('role'),'status');
      assert.equal(preview.textContent,`Expected GPA ${letters[points]}`);
      assert.equal(ui.all('.school-gpa-preview').length,1);
      assert.equal(ui.query('.school-grade > strong').textContent,earned);
      const planned=ui.saved();
      assert.deepEqual(planned,{...before,focus:{...before.focus,work:points}},'planning changes only the selected focus');
      const forecast=annualForecast(planned);
      assert.equal(gradeLetter(forecast.school.gpa),letters[points]);
      const completed=structuredClone(planned);
      assert.equal(advanceYear(completed,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
      assert.equal(completed.yearSummary.school.gpa,forecast.school.gpa,'the preview uses the inputs of the actual report');
    }
    const planned=ui.saved(),writes=ui.writes();
    ui.click('[data-topic="school-gpa"]');
    ui.click('.help-popup [data-action="close"]');
    assert.equal(ui.writes(),writes);
    assert.deepEqual(ui.saved(),planned);
    ui=await mount(planned);
    assert.equal(ui.query('.school-gpa-preview strong').textContent,letters[4]);
    assert.deepEqual(ui.saved(),planned,'preview rendering and reload never change grades, stats or RNG');
  }
});

test('expected GPA respects study limits and hides while school progression is unavailable', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.focus={...defaultFocus(fixture),work:1}; fixture.stats.intelligence=5;
  fixture.effects=[{id:'study-limit',name:'Limited study time',description:'Saved restriction',years:1,modifiers:{},kind:'negative',focusLimits:{standard:{work:1}}}];
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  assert.equal(ui.query('.school-gpa-preview strong').textContent,'D');
  assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-delta="1"]').disabled,true);
  for(const tab of ['family','career']) {
    ui.click(`.nav-list [data-tab="${tab}"]`);
    assert.equal(ui.all('.school-gpa-preview').length,0);
  }
  const blocked=structuredClone(fixture);
  blocked.pendingEvents=[{eventId:'school_team',age:blocked.age}]; blocked.lastYearEvents=['school_team'];
  ui=await mount(blocked);
  assert.equal(ui.all('.school-gpa-preview').length,0);
  assert.deepEqual(ui.saved(),blocked);
  const deceased=structuredClone(fixture);
  deceased.alive=false; deceased.death={cause:'disease',age:deceased.age}; deceased.needsSuccession=true;
  deceased.pendingEvents=[]; deceased.pregnancy=null;
  ui=await mount(deceased);
  assert.equal(ui.all('.school-gpa-preview').length,0);
  assert.deepEqual(ui.saved(),deceased);
  const college=ageTo(createGame({seed:121}),18);
  assert.equal(chooseEducation(college,'college').ok,true);
  for(const other of [createGame({seed:121}),ageTo(createGame({seed:121}),4),college,ageTo(createGame({seed:121}),19)]) {
    ui=await mount(other);
    assert.equal(ui.all('.school-gpa-preview').length,0);
  }
});

test('expected activity success updates at each focus allocation without replacing earned grades or consuming RNG', async () => {
  for (const [age, previous, rating, bonus, letters] of [
    [5, null, 3, 2, ['C-', 'C', 'C+']],
    [17, 6.25, 5, 0, ['C+', 'B-', 'B']],
  ]) {
    const fixture=ageTo(createGame({seed:121}),age);
    fixture.conditions=[]; fixture.effects=[];
    fixture.school.sports={id:'soccer',success:previous};
    fixture.school.extracurricular={id:'chess',success:previous};
    fixture.focus={work:1,social:1,family:1,self:1,sports:0,extracurricular:0};
    fixture.stats.strength=rating; fixture.stats.intelligence=rating;
    if(bonus) fixture.effects=[{id:'saved-activity-support',name:'Activity support',description:'Saved support',years:1,
      modifiers:{strength:bonus,intelligence:bonus},kind:'positive'}];
    assert.equal(validateSave(fixture),true);
    let ui=await mount(fixture);
    const before=ui.saved(),earned=`Success ${activityGradeLetter(previous)}`;
    for(let points=0;points<=2;points++) {
      for(const kind of ['sports','extracurricular']) {
        if(points) ui.click(`.focus-row[data-focus-key="${kind}"] [data-delta="1"]`);
        const preview=ui.query(`.focus-row[data-focus-key="${kind}"] .school-success-preview`);
        assert.equal(preview.getAttribute('role'),'status');
        assert.equal(preview.textContent,`Expected success ${letters[points]}`);
        assert.equal(ui.query(`.school-enrollment[data-school-kind="${kind}"] .school-enrollment-title span`).textContent,earned);
      }
      assert.equal(ui.all('.school-success-preview').length,2);
      const planned=ui.saved();
      assert.deepEqual(planned,{...before,focus:{...before.focus,sports:points,extracurricular:points}},'planning changes only the selected focus points');
      const forecast=annualForecast(planned);
      for(const activity of forecast.school.activities) assert.equal(activityGradeLetter(activity.after),letters[points]);
      assert.deepEqual(ui.saved(),planned);
    }
    const planned=ui.saved(),writes=ui.writes();
    ui.click('[data-action="school-offers"][data-kind="sports"]');
    ui.click('[role="dialog"] [data-action="close"]');
    assert.equal(ui.writes(),writes);
    assert.deepEqual(ui.saved(),planned);
    ui=await mount(planned);
    assert.deepEqual(ui.all('.school-success-preview').map(node=>node.textContent),Array(2).fill(`Expected success ${letters[2]}`));
    assert.deepEqual(ui.saved(),planned,'rendering and reload keep earned success, saved reports, ratings, and RNG unchanged');
  }
});

test('expected activity success is limited to eligible enrolled activities in playable school years', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[];
  fixture.school.sports={id:'lacrosse',success:6.25};
  fixture.school.extracurricular={id:'chess',success:null};
  fixture.focus={...defaultFocus(fixture),sports:0,extracurricular:1};
  fixture.lifestyle=6;
  fixture.parents.forEach(parent=>{parent.lifestyle=6;parent.career.progress=6;});
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  assert.equal(ui.all('.focus-row[data-focus-key="sports"] .school-success-preview').length,0,'paused Lacrosse has no projected participation');
  assert.equal(ui.all('.focus-row[data-focus-key="extracurricular"] .school-success-preview').length,1);
  assert.match(ui.query('.school-enrollment[data-school-kind="sports"]').textContent,/Success B-/);
  assert.deepEqual(ui.saved(),fixture);
  for(const tab of ['family','career']) {
    ui.click(`.nav-list [data-tab="${tab}"]`);
    assert.equal(ui.all('.school-success-preview').length,0);
  }
  const unjoined=structuredClone(fixture);
  unjoined.school.sports=null; unjoined.school.extracurricular=null;
  unjoined.focus.sports=0; unjoined.focus.extracurricular=0;
  const blocked=structuredClone(fixture);
  blocked.pendingEvents=[{eventId:'school_team',age:blocked.age}]; blocked.lastYearEvents=['school_team'];
  const deceased=structuredClone(fixture);
  deceased.alive=false; deceased.death={cause:'disease',age:deceased.age}; deceased.needsSuccession=true;
  deceased.pendingEvents=[]; deceased.pregnancy=null;
  const college=ageTo(createGame({seed:121}),18);
  assert.equal(chooseEducation(college,'college').ok,true);
  for(const other of [unjoined,blocked,deceased,createGame({seed:121}),ageTo(createGame({seed:121}),4),college,ageTo(createGame({seed:121}),19)]) {
    ui=await mount(other);
    assert.equal(ui.all('.school-success-preview').length,0);
    assert.deepEqual(ui.saved(),other);
  }
});

test('school starts with N/A through planning and reload, then shows only the first earned grade', async () => {
  const fixture=ageTo(createGame({seed:121}),5);
  fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture);
  let ui=await mount(fixture);
  assert.equal(ui.query('.school-grade > strong').textContent,'N/A');
  assert.equal(ui.query('.school-grade > strong').getAttribute('aria-label'),'School GPA N/A');
  assert.equal(ui.saved().school.reportedAge,null);
  assert.equal(ui.all('.school-report').length,0);
  const before=ui.saved(),writes=ui.writes();
  ui.click('[data-topic="school-gpa"]');
  assert.match(ui.query('.help-popup').textContent,/Your first grade arrives after completing your first school year/);
  assert.doesNotMatch(ui.query('.help-popup').textContent,/starting grade/i);
  ui.click('.help-popup [data-action="close"]');
  assert.deepEqual(ui.saved(),before);
  assert.equal(ui.writes(),writes);
  ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
  assert.equal(ui.saved().focus.work,3);
  assert.equal(ui.query('.school-grade > strong').textContent,'N/A','a study plan is not a completed grade');
  assert.match(ui.query('.school-grade').textContent,/No report card yet/);
  const planned=ui.saved();
  ui=await mount(planned);
  assert.equal(ui.query('.school-grade > strong').textContent,'N/A');
  assert.deepEqual(ui.saved(),planned,'loading an ungraded student never invents a report');
  const completed=structuredClone(planned);
  assert.equal(advanceYear(completed,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
  assert.equal(completed.age,6);
  assert.equal(completed.school.reportedAge,6);
  assert.equal(completed.yearSummary.school.previousGpa,null);
  const earned=gradeLetter(completed.yearSummary.school.gpa);
  for(let reload=0;reload<2;reload++) {
    ui=await mount(completed);
    assert.equal(ui.query('.school-grade > strong').textContent,earned);
    assert.match(ui.query('.school-grade').textContent,/Latest report card/);
    assert.equal(ui.query('.school-report > p').textContent,`GPA ${earned}`);
    assert.doesNotMatch(ui.query('.school-report').textContent,/→|N\/A/,'the first report has no invented previous grade');
    assert.deepEqual(ui.saved(),completed);
  }
});

test('annual enrollment offers unlock zero-to-two controls, apply lifestyle gates, and persist selections', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture); fixture.lifestyle=6;
  fixture.school.offers.sports=['basketball','soccer','lacrosse'];
  fixture.school.offers.extracurricular=['chess','piano','modeling'];
  let ui=await mount(fixture);
  const before=ui.saved();
  for(const kind of ['sports','extracurricular']) {
    const row=ui.query(`.focus-row[data-focus-key="${kind}"]`);
    assert.equal(row.querySelector('output').textContent,'0');
    assert.equal(row.querySelector('[data-delta="-1"]').disabled,true);
    assert.equal(row.querySelector('[data-delta="1"]').disabled,true);
    assert.equal(row.querySelectorAll('.focus-scale span').length,2);
    assert.deepEqual(Object.fromEntries([...row.querySelectorAll('.choice-impact')].map(entry=>[entry.dataset.stat,entry.querySelector('b').textContent])),kind==='extracurricular'?{creativity:'-',intelligence:'-'}:{strength:'-',social:'-'});
  }
  ui.click('[data-action="school-offers"][data-kind="sports"]');
  assert.equal(ui.all('.school-offer').length,3);
  assert.deepEqual(ui.all('.school-offer').map(card=>card.dataset.offerId),fixture.school.offers.sports);
  assert.match(ui.query('.school-offer[data-offer-id="basketball"]').textContent,/Performance: Strength, Taller height.*Training: Strength, Social/);
  assert.doesNotMatch(ui.query('.school-offer[data-offer-id="basketball"]').textContent,/Health/);
  assert.equal(ui.query('[data-action="school-enroll"][data-id="lacrosse"]').disabled,true);
  assert.match(ui.query('.school-offer[data-offer-id="lacrosse"]').textContent,/Lifestyle 7\.0/);
  ui.click('[data-action="school-enroll"][data-id="lacrosse"]');
  assert.deepEqual(ui.saved(),before,'disabled enrollment does not consume a choice or RNG');
  ui.click('[data-action="school-enroll"][data-id="basketball"]');
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.deepEqual(ui.saved().school.sports,{id:'basketball',success:null});
  assert.equal(ui.saved().focus.sports,1);
  assert.equal(ui.saved().age,before.age);
  assert.equal(ui.saved().rng,before.rng);
  assert.deepEqual(ui.saved().stats,before.stats);
  assert.match(ui.query('.school-enrollment[data-school-kind="sports"]').textContent,/Basketball.*Success N\/A/);
  assert.equal(ui.query('.school-enrollment[data-school-kind="sports"]').querySelectorAll('[role="meter"]').length,0);
  assert.deepEqual(ui.all('.focus-row[data-focus-key="sports"] .choice-impact b').map(sign=>sign.textContent),['+','+']);
  ui.click('.focus-row[data-focus-key="sports"] [data-delta="-1"]');
  assert.equal(ui.saved().focus.sports,0);
  assert.equal(ui.saved().school.sports.id,'basketball','zero points keep the enrollment');
  assert.deepEqual(ui.all('.focus-row[data-focus-key="sports"] .choice-impact b').map(sign=>sign.textContent),['-','-']);
  ui.click('.focus-row[data-focus-key="sports"] [data-delta="1"]');
  ui.click('.focus-row[data-focus-key="sports"] [data-delta="1"]');
  assert.equal(ui.saved().focus.sports,2);
  assert.equal(ui.query('.focus-row[data-focus-key="sports"] [data-delta="1"]').disabled,true);
  assert.deepEqual(ui.all('.focus-row[data-focus-key="sports"] .choice-impact').map(entry=>entry.dataset.stat).sort(),['social','strength']);
  assert.deepEqual(ui.all('.focus-row[data-focus-key="sports"] .choice-impact b').map(sign=>sign.textContent),['++','++']);
  ui.click('.focus-row[data-focus-key="family"] [data-delta="-1"]');
  ui.click('[data-action="school-offers"][data-kind="extracurricular"]');
  assert.equal(ui.all('.school-offer').length,3);
  assert.match(ui.query('.school-offer[data-offer-id="chess"]').textContent,/Training: Intelligence\./);
  ui.click('[data-action="school-enroll"][data-id="chess"]');
  assert.deepEqual(ui.saved().school.extracurricular,{id:'chess',success:null});
  assert.equal(ui.saved().focus.extracurricular,1);
  assert.deepEqual(ui.all('.focus-row[data-focus-key="extracurricular"] .choice-impact').map(entry=>[entry.dataset.stat,entry.querySelector('b').textContent]),[['intelligence','+']]);
  const saved=ui.saved();
  ui=await mount(saved);
  assert.deepEqual(ui.saved(),saved);
  assert.match(ui.query('.school-enrollment[data-school-kind="sports"]').textContent,/Basketball/);
  assert.match(ui.query('.school-enrollment[data-school-kind="extracurricular"]').textContent,/Chess club/);
  ui.click('[data-action="school-offers"][data-kind="sports"]');
  assert.match(ui.query('.school-current').textContent,/Current: Basketball · N\/A/);
  ui.click('.school-current [data-action="close"]');
  assert.deepEqual(ui.saved(),saved,'keeping an activity preserves its success and selection');
  ui.click('[data-action="school-offers"][data-kind="sports"]');
  ui.click('[data-action="school-leave"][data-kind="sports"]');
  assert.equal(ui.saved().school.sports,null);
  assert.equal(ui.saved().focus.sports,0);
  assert.equal(ui.query('.focus-row[data-focus-key="sports"] [data-delta="1"]').disabled,true);
});

test('years without activity offers have no joining controls but retain keep and leave for current activities', async () => {
  const base=ageTo(createGame({seed:121}),10);
  base.conditions=[]; base.effects=[];
  base.school.offers={sports:[],extracurricular:[]};
  for(const enrolled of [false,true]) {
    const fixture=structuredClone(base);
    fixture.school.sports=enrolled?{id:'basketball',success:6.25}:null;
    fixture.school.extracurricular=enrolled?{id:'chess',success:4.2}:null;
    fixture.focus=defaultFocus(fixture);
    let ui=await mount(fixture);
    const before=ui.saved();
    for(const kind of ['sports','extracurricular']) {
      const row=ui.query(`.school-enrollment[data-school-kind="${kind}"]`);
      assert.match(row.textContent,kind==='sports'?/No sports offered this year/:/No extracurriculars offered this year/);
      assert.equal(row.querySelectorAll('[data-action="school-offers"]').length,enrolled?1:0);
      if(enrolled) {
        assert.match(row.textContent,/Manage current activity/);
        ui.click(`[data-action="school-offers"][data-kind="${kind}"]`);
        assert.equal(ui.all('.school-offer, [data-action="school-enroll"]').length,0);
        assert.match(ui.query('.modal-body').textContent,/You can keep or leave your current activity/);
        ui.click('.school-current [data-action="close"]');
        assert.deepEqual(ui.saved(),before,'keeping an activity in an empty-offer year preserves all progress');
      }
    }
    ui=await mount(before);
    assert.deepEqual(ui.saved(),before,'empty offers survive reload without being rerolled');
    if(enrolled) for(const kind of ['sports','extracurricular']) {
      ui.click(`[data-action="school-offers"][data-kind="${kind}"]`);
      ui.click(`[data-action="school-leave"][data-kind="${kind}"]`);
      assert.equal(ui.saved().school[kind],null);
      assert.equal(ui.saved().focus[kind],0);
      assert.equal(ui.all(`.school-enrollment[data-school-kind="${kind}"] [data-action="school-offers"]`).length,0);
    }
  }
});

test('both activity categories can show ten saved options and their offer notices in the review and journal', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture);
  fixture.school.offers={sports:SPORTS.slice(0,10).map(activity=>activity.id),extracurricular:EXTRACURRICULARS.slice(0,10).map(activity=>activity.id)};
  const entries=[['sports',SPORTS,'Sports offered'],['extracurricular',EXTRACURRICULARS,'Extracurriculars offered']].map(([kind,catalog,title])=>({
    id:`school-offer-${kind}`,age:fixture.age,generation:fixture.generation,kind:'activity-offer',title,
    text:`You have been offered these ${kind==='sports'?'sports':'extracurriculars'}: ${fixture.school.offers[kind].map(id=>catalog.find(activity=>activity.id===id).name).join(', ')}.`,
  }));
  fixture.history.unshift(...entries);
  fixture.yearSummary.events.push(...entries);
  fixture.yearSummary.dismissed=false;
  const ui=await mount(fixture),before=ui.saved();
  for(const entry of entries) for(const selector of ['.year-review-events','.journal-list']) {
    assert.ok(ui.query(selector).textContent.includes(entry.title));
    assert.ok(ui.query(selector).textContent.includes(entry.text));
  }
  ui.click('[role="dialog"] [data-action="close"]');
  const dismissed=ui.saved();
  for(const kind of ['sports','extracurricular']) {
    ui.click(`[data-action="school-offers"][data-kind="${kind}"]`);
    assert.equal(ui.all('.school-offer').length,10);
    assert.deepEqual(ui.all('.school-offer').map(card=>card.dataset.offerId),fixture.school.offers[kind]);
    assert.match(ui.query('.modal-body').textContent,/Lifestyle 1, each has a 28% yearly chance of 1-4 options, with a median of 2.*Lifestyle 10, both arrive every year with 8-10 options and a median of 10/);
    ui.click('[role="dialog"] [data-action="close"]');
    assert.deepEqual(ui.saved(),dismissed);
  }
  assert.equal(ui.saved().rng,before.rng);
});

test('activity rows switch from fixed inactivity losses to the selected activity training', async () => {
  const base=ageTo(createGame({seed:121}),10);
  base.conditions=[]; base.effects=[];
  for(const key of Object.keys(base.stats)) base.stats[key]=5;
  for(const [kind,id,gains] of [
    ['sports','fencing',['intelligence','social','strength']],
    ['sports','gymnastics',['creativity','social','strength']],
    ['extracurricular','chess',['intelligence']],
    ['extracurricular','piano',['creativity']],
    ['extracurricular','modeling',['attractiveness']],
  ]) {
    const fixture=structuredClone(base);
    fixture.school[kind]={id,success:null};
    fixture.focus={...defaultFocus(fixture),[kind]:0};
    const ui=await mount(fixture),before=ui.saved();
    const selector=`.focus-row[data-focus-key="${kind}"]`;
    const impacts=()=>Object.fromEntries(ui.all(`${selector} .choice-impact`).map(entry=>[entry.dataset.stat,entry.querySelector('b').textContent]));
    assert.deepEqual(impacts(),kind==='sports'?{strength:'-',social:'-'}:{creativity:'-',intelligence:'-'});
    for(const points of [1,2]) {
      ui.click(`${selector} [data-delta="1"]`);
      assert.deepEqual(impacts(),Object.fromEntries(gains.map(key=>[key,'+'.repeat(points)])));
    }
    ui.click(`${selector} [data-delta="-1"]`);
    ui.click(`${selector} [data-delta="-1"]`);
    assert.deepEqual(impacts(),kind==='sports'?{strength:'-',social:'-'}:{creativity:'-',intelligence:'-'});
    assert.deepEqual(ui.saved(),before,'returning to zero restores only the allocation, never changes ratings or RNG');
  }
});

test('school report cards render saved grades and activity success with their recorded focus caps', async () => {
  const fixture=ageTo(createGame({seed:121}),12);
  fixture.conditions=[]; fixture.effects=[];
  fixture.school.sports={id:'basketball',success:6.25};
  fixture.school.extracurricular={id:'chess',success:4.2};
  fixture.focus=defaultFocus(fixture);
  assert.equal(advanceYear(fixture,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
  const report=structuredClone(fixture.yearSummary.school);
  fixture.focus.work=0;
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(fixture);
    const card=ui.query('.school-report[aria-label="School report card"]');
    assert.match(card.textContent,new RegExp(`GPA ${gradeLetter(report.previousGpa).replace(/[+]/g,'\\+')} → ${gradeLetter(report.gpa).replace(/[+]/g,'\\+')}`));
    for(const activity of report.activities) assert.ok(card.textContent.includes(`${activity.name} success ${activityGradeLetter(activity.before)} → ${activityGradeLetter(activity.after)}`));
    assert.doesNotMatch(card.textContent,/\/10|\d\.\d/,'activity report results use the same letter-grade presentation as GPA');
    assert.match(ui.query('.year-decisions').textContent,/School2\/4.*Sports1\/2Extracurriculars1\/2/);
    assert.deepEqual(ui.saved(),fixture,'reading a saved report preserves current choices and activity progress');
  }
});

test('school menus preserve yearly Lifestyle-based offers while keeping the current activity separately', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[];
  fixture.school.sports={id:'basketball',success:6.25};
  fixture.school.extracurricular={id:'chess',success:4.2};
  fixture.focus=defaultFocus(fixture);
  let ui=await mount(fixture);
  for(let year=0;year<2;year++) {
    const previous=ui.saved();
    ui.click('[data-action="advance"]');
    resolveUIEvents(ui);
    const completed=ui.saved();
    assert.equal(completed.age,previous.age+1);
    assert.equal(completed.school.offersAge,completed.age);
    for(const kind of ['sports','extracurricular']) {
      const current=completed.school[kind];
      assert.equal(current.id,previous.school[kind].id);
      assert.equal(typeof current.success,'number');
      const offers=completed.school.offers[kind];
      assert.ok(offers.length>=0 && offers.length<=10);
      assert.equal(new Set(offers).size,offers.length);
      assert.ok(offers.every(id=>id!==current.id&&!previous.school.offers[kind].includes(id)),'new offers exclude the current activity and the previous shortlist');
      const writes=ui.writes();
      ui.click(`[data-action="school-offers"][data-kind="${kind}"]`);
      assert.deepEqual(ui.all('.school-offer').map(card=>card.dataset.offerId),offers);
      assert.match(ui.query('.modal-body').textContent,/Higher Lifestyle brings more frequent offers and usually more choices/);
      assert.match(ui.query('.school-current').textContent,kind==='sports'?/Current: Basketball/:/Current: Chess club/);
      ui.click('.school-current [data-action="close"]');
      assert.deepEqual(ui.saved(),completed,'keeping a selection outside the shortlist does not reset progress or use RNG');
      assert.equal(ui.writes(),writes);
    }
    ui=await mount(completed);
    assert.deepEqual(ui.saved(),completed,'reload preserves both saved shortlists and earned success');
  }
});

test('legacy five-offer saves restore three options without resetting an activity removed from the shortlist', async () => {
  const legacy=ageTo(createGame({seed:121}),10);
  const currentVersion=legacy.version;
  legacy.version=19;
  for(const person of [legacy,...legacy.parents,...legacy.siblings]) person.conditions=[];
  legacy.effects=[];
  legacy.school.offers.sports=['basketball','soccer','swimming','archery','figure_skating'];
  legacy.school.offers.extracurricular=['chess','piano','modeling','drama','robotics'];
  legacy.school.sports={id:'figure_skating',success:6.35};
  legacy.school.extracurricular={id:'robotics',success:4.25};
  legacy.focus=defaultFocus(legacy);
  const original=structuredClone(legacy),expected=structuredClone(legacy);
  expected.version=currentVersion;
  for(const kind of ['sports','extracurricular']) expected.school.offers[kind]=expected.school.offers[kind].slice(0,3);
  let ui=await mount(legacy);
  assert.deepEqual(legacy,original,'restoring does not mutate the imported object');
  for(let reload=0;reload<2;reload++) {
    assert.deepEqual(ui.saved(),expected,'only schema metadata and the two offer lists change; history, reports, focus, ratings, success and RNG remain intact');
    for(const kind of ['sports','extracurricular']) {
      ui.click(`[data-action="school-offers"][data-kind="${kind}"]`);
      assert.deepEqual(ui.all('.school-offer').map(card=>card.dataset.offerId),expected.school.offers[kind]);
      assert.match(ui.query('.school-current').textContent,kind==='sports'?/Current: Figure skating · B-/:/Current: Robotics club · C-/);
      assert.doesNotMatch(ui.query('.school-current').textContent,/\/10|\d\.\d/);
      ui.click('.school-current [data-action="close"]');
      assert.deepEqual(ui.saved(),expected);
    }
    ui=await mount(ui.saved());
  }
});

test('new sports display their broader performance factors while training only Strength and Social', async () => {
  for(const [id,performance] of [
    ['cycling','Strength, Health'],
    ['archery','Strength, Mental stability'],
    ['orienteering','Strength, Intelligence, Health'],
    ['figure_skating','Strength, Creativity, Mental stability'],
  ]) {
    const fixture=ageTo(createGame({seed:121}),10);
    fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture);
    for(const key of Object.keys(fixture.stats)) fixture.stats[key]=5;
    fixture.school.offers.sports=[id,'basketball','soccer'];
    const ui=await mount(fixture),before=ui.saved(),writes=ui.writes();
    ui.click('[data-action="school-offers"][data-kind="sports"]');
    assert.equal(ui.all('.school-offer').length,3);
    const card=ui.query(`.school-offer[data-offer-id="${id}"]`);
    assert.deepEqual([...card.querySelectorAll('p')].map(paragraph=>paragraph.textContent),[`Performance: ${performance}.`,'Training: Strength, Social.']);
    assert.deepEqual(ui.saved(),before,'viewing performance requirements does not change ratings or consume RNG');
    assert.equal(ui.writes(),writes);
    ui.click(`[data-action="school-enroll"][data-id="${id}"]`);
    assert.deepEqual(ui.saved().school.sports,{id,success:null});
    assert.deepEqual(ui.all('.focus-row[data-focus-key="sports"] .choice-impact').map(entry=>[entry.dataset.stat,entry.querySelector('b').textContent]),[['strength','+'],['social','+']]);
  }
});

test('activity success changes from N/A to a letter grade after its first eligible year without a numeric meter', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture);
  fixture.school.offers.sports=['basketball','soccer','wrestling'];
  let ui=await mount(fixture);
  ui.click('[data-action="school-offers"][data-kind="sports"]');
  ui.click('[data-action="school-enroll"][data-id="basketball"]');
  const enrolled=ui.saved();
  assert.equal(enrolled.school.sports.success,null);
  for(let reload=0;reload<2;reload++) {
    const card=ui.query('.school-enrollment[data-school-kind="sports"]');
    assert.match(card.textContent,/Success N\/A/);
    assert.equal(card.querySelectorAll('[role="meter"]').length,0,'unearned success is not displayed as zero or five');
    ui.click('[data-action="school-offers"][data-kind="sports"]');
    assert.match(ui.query('.school-current').textContent,/Current: Basketball · N\/A/);
    ui.click('.school-current [data-action="close"]');
    assert.deepEqual(ui.saved(),enrolled,'viewing and keeping an ungraded activity never initializes success');
    ui=await mount(ui.saved());
  }
  const completed=structuredClone(enrolled);
  assert.equal(advanceYear(completed,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
  const result=completed.yearSummary.school.activities.find(activity=>activity.kind==='sports');
  assert.equal(result.before,null);
  assert.equal(typeof result.after,'number');
  for(let reload=0;reload<2;reload++) {
    ui=await mount(completed);
    const card=ui.query('.school-enrollment[data-school-kind="sports"]');
    assert.equal(card.querySelector('.school-enrollment-title span').textContent,`Success ${activityGradeLetter(result.after)}`);
    assert.equal(card.querySelectorAll('[role="meter"]').length,0,'earned activity results use grades rather than numeric meters');
    assert.ok(ui.query('.school-report').textContent.includes(`Basketball success N/A → ${activityGradeLetter(result.after)}`));
    assert.doesNotMatch(card.textContent,/\/10|\d\.\d/);
    assert.deepEqual(ui.saved(),completed);
  }
});

test('paused activities retain N/A while saved numeric success displays its earned letter grade', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[];
  fixture.school.sports={id:'lacrosse',success:null};
  fixture.focus={...defaultFocus(fixture),sports:0};
  fixture.lifestyle=6;
  fixture.parents.forEach(parent=>{parent.lifestyle=6;parent.career.progress=6;});
  assert.equal(validateSave(fixture),true);
  assert.equal(advanceYear(fixture,{mortalityRandom:()=>1,growthRandom:()=>0,parentCareerRandom:()=>1}).ok,true);
  const result=fixture.yearSummary.school.activities.find(activity=>activity.kind==='sports');
  assert.equal(result.before,null);
  assert.equal(result.after,null);
  let ui=await mount(fixture);
  assert.match(ui.query('.school-report').textContent,/Lacrosse success N\/A → N\/A/);
  assert.match(ui.query('.school-enrollment[data-school-kind="sports"]').textContent,/Success N\/A/);
  assert.equal(ui.query('.school-enrollment[data-school-kind="sports"]').querySelectorAll('[role="meter"]').length,0);
  const legacy=structuredClone(fixture);
  legacy.school.sports.success=6.25;
  const before=structuredClone(legacy);
  ui=await mount(legacy);
  const card=ui.query('.school-enrollment[data-school-kind="sports"]');
  assert.match(card.textContent,/Success B-/);
  assert.equal(card.querySelectorAll('[role="meter"]').length,0);
  assert.doesNotMatch(card.textContent,/\/10|6\.3/);
  assert.deepEqual(ui.saved(),before,'saved numeric success is never replaced with an ungraded value');
});

test('sport offers explain the direction of height effects and activity help explains the positive training steps', async () => {
  const fixture=ageTo(createGame({seed:121}),10);
  fixture.conditions=[]; fixture.effects=[]; fixture.focus=defaultFocus(fixture);
  fixture.school.offers.sports=['wrestling','swimming','basketball'];
  const ui=await mount(fixture),before=ui.saved(),writes=ui.writes();
  ui.click('[data-action="school-offers"][data-kind="sports"]');
  assert.match(ui.query('.school-offer[data-offer-id="wrestling"]').textContent,/Performance: Strength, Shorter height/);
  assert.match(ui.query('.school-offer[data-offer-id="swimming"]').textContent,/Performance: Strength, Taller height/);
  assert.match(ui.query('.school-offer[data-offer-id="basketball"]').textContent,/Performance: Strength, Taller height/);
  ui.click('[role="dialog"] [data-action="close"]');
  ui.click('[data-topic="focus-sports"]');
  assert.match(ui.query('.help-popup').textContent,/Higher Lifestyle brings more frequent offers and more options/);
  assert.match(ui.query('.help-popup').textContent,/Active training gives \+ at 1 point and \+\+ at 2/);
  assert.match(ui.query('.help-popup').textContent,/No sport, paused participation, or 0 points gives - Strength and - Social only/);
  assert.match(ui.query('.help-popup').textContent,/graded F- through A\+/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('[data-topic="focus-extracurricular"]');
  assert.match(ui.query('.help-popup').textContent,/graded F- through A\+/);
  assert.match(ui.query('.help-popup').textContent,/No extracurricular or 0 points gives - Creativity and - Intelligence only/);
  ui.click('.help-popup [data-action="close"]');
  assert.deepEqual(ui.saved(),before);
  assert.equal(ui.writes(),writes);
});

test('previously recorded school grades retain their letter and report after the grading correction', async () => {
  const fixture=ageTo(createGame({seed:121}),12);
  // The previous formula recorded 75 for study 2 and Intelligence 5; the new
  // formula would award 80. A completed report must keep the recorded result.
  Object.assign(fixture.yearSummary.school,{study:2,intelligence:5,previousGpa:62,gpa:75});
  fixture.school.gpa=75;
  fixture.yearSummary.dismissed=false;
  assert.equal(validateSave(fixture),true,'old grade calculations remain valid historical records');
  const before=structuredClone(fixture);
  for(let reload=0;reload<2;reload++) {
    const ui=await mount(fixture);
    assert.equal(ui.query('.school-grade > strong').textContent,'C');
    assert.match(ui.query('.school-report').textContent,/GPA D- → C/);
    assert.deepEqual(ui.saved(),before,'reading an old report does not recompute GPA, stats, history, or RNG');
  }
});

test('toddler family effects combine parents without sections and omit neutral or blocked changes', async () => {
  const fixture=ageTo(createGame({seed:121}),3);
  fixture.effects=[];
  fixture.focus={work:1,social:1,family:4,self:2,creative:2};
  fixture.parents.forEach(parent=>{parent.stats.stability=5;parent.relationship=5;});
  const ui=await mount(fixture),before=ui.saved();
  const family=()=>ui.query('.focus-row[data-focus-key="family"]');
  assertChoiceImpacts(ui);
  assert.equal(family().querySelectorAll('[data-target="family"]').length,2,'each shared family effect appears once');
  assert.match(family().querySelector('[data-target="family"][data-stat="stability"]').textContent,/\+.*Mental stability \(family\)/);
  assert.match(family().querySelector('[data-target="family"][data-stat="relationship"]').textContent,/\+.*Relationships \(family\)/);
  assert.doesNotMatch(family().querySelector('.activity-effects').textContent,/Dad|Mom|Other people|You/);
  ui.click('[data-action="focus"][data-key="family"][data-delta="-1"]');
  assert.equal(family().querySelectorAll('[data-target="family"][data-stat="relationship"]').length,1);
  ui.click('[data-action="focus"][data-key="family"][data-delta="-1"]');
  assert.equal(family().querySelectorAll('.choice-impact').length,0,'Family time 2 has no effects');
  assertChoiceImpacts(ui);
  assert.deepEqual(ui.saved().parents,before.parents);
  assert.equal(ui.saved().rng,before.rng);

  fixture.parents[0].stats.stability=10;
  fixture.parents[0].relationship=10;
  const bounded=await mount(fixture);
  for(const item of bounded.all('.activity-effects [data-target="family"]')) {
    assert.equal(item.dataset.parentIds,fixture.parents[1].id,'bounded parent contributes no misleading family gain');
  }
});

test('lifestyle never appears in expected changes even when household or adult lifestyle will change', async () => {
  for(const age of [0,1,3,5,17,30]) {
    const fixture=ageTo(createGame({seed:19}),age);
    fixture.effects=[];
    fixture.lifestyle=9;
    if(age<18) {
      fixture.parents.forEach(parent=>{
        parent.alive=true;delete parent.death;delete parent.abandonedAt;
        parent.lifestyle=9;
        Object.assign(parent.career,{status:'employed',progress:4.6,focus:3});
      });
    } else {
      fixture.jobId=null;fixture.money=0;fixture.income=0;
    }
    assert.ok(annualForecast(fixture).lifestyle.change<0,`age ${age} has an actual lifestyle forecast`);
    const ui=await mount(fixture),before=ui.saved();
    assert.equal(ui.all('.choice-impact[data-stat="lifestyle"]').length,0,`age ${age} hides all expected Lifestyle entries`);
    assert.equal(ui.query('.profile-lifestyle .status-value').textContent,'9.0/10','the current rating remains visible');
    if(age<2) assert.ok(ui.all('.choice-impact').length>0,'crying effects remain visible');
    assert.deepEqual(ui.saved(),before);
    assert.equal(ui.saved().rng,fixture.rng);
  }
});

test('Electronics and crafts show the expected signs at every allocation', async () => {
  const fixture=createGame({seed:121});
  fixture.age=3;
  fixture.focus={work:0,social:0,family:0,self:0,creative:0};
  fixture.stats.social=5;
  fixture.stats.intelligence=5;
  const ui=await mount(fixture),before=ui.saved();
  ui.click('[data-topic="toddler-focus"]');
  assert.match(ui.query('.help-popup').textContent,/Arts & crafts Intelligence shows one minus at 0, no effect at 1–3, and one plus at 4/);
  ui.click('.help-popup [data-action="close"]');
  const social=['++','+',null,'-','--'];
  const intelligence=['----','--',null,'++','++++'];
  const signs=stat=>ui.document.querySelector(`.focus-row[data-focus-key="social"] .choice-impact[data-stat="${stat}"] b`)?.textContent ?? null;
  for(let points=0;points<=4;points++) {
    assert.equal(ui.query('.focus-row[data-focus-key="social"] output').textContent,String(points));
    assert.equal(signs('social'),social[points],`Electronics ${points}: social`);
    assert.equal(signs('intelligence'),intelligence[points],`Electronics ${points}: intelligence`);
    if(points<4) ui.click('[data-action="focus"][data-key="social"][data-delta="1"]');
  }
  for(let points=3;points>=0;points--) {
    ui.click('[data-action="focus"][data-key="social"][data-delta="-1"]');
    assert.equal(signs('social'),social[points]);
    assert.equal(signs('intelligence'),intelligence[points]);
  }
  for(let points=0;points<=4;points++) {
    const craftSigns=ui.document.querySelector('.focus-row[data-focus-key="creative"] .choice-impact[data-stat="intelligence"] b')?.textContent ?? null;
    assert.equal(craftSigns,['-',null,null,null,'+'][points],`Arts & crafts ${points}: intelligence`);
    const creativity=ui.document.querySelector('.focus-row[data-focus-key="creative"] .choice-impact[data-stat="creativity"] b')?.textContent ?? null;
    assert.equal(creativity,['---','-',null,'+','+++'][points],`Arts & crafts ${points}: creativity`);
    if(points<4) ui.click('[data-action="focus"][data-key="creative"][data-delta="1"]');
  }
  assert.deepEqual(ui.saved().stats,before.stats);
  assert.equal(ui.saved().rng,before.rng);
});

test('infant practice can change effective ratings outside the ordinary range', async () => {
  const fixture=createGame({seed:121});
  fixture.stats.intelligence=9;
  fixture.stats.stability=2;
  fixture.effects=[{id:'temporary',name:'Temporary effects',description:'Test effects.',years:2,modifiers:{intelligence:2,stability:-2},kind:'neutral'}];
  const ui=await mount(fixture),before=ui.saved();
  ui.click('[data-action="baby"][data-level="5"]');
  assert.equal(ui.all('.choice-impact[data-stat="intelligence"]:not([data-parent-id])').length,1,'a retained boost does not block base gains');
  ui.click('[data-action="baby"][data-level="1"]');
  assert.equal(ui.all('.choice-impact[data-stat="stability"]:not([data-parent-id])').length,1,'a retained penalty does not block base losses');
  assert.deepEqual(ui.saved().effects,before.effects);
  assert.deepEqual(ui.saved().stats,before.stats);
  assert.equal(ui.saved().rng,before.rng);
});


test('Year keeps parents above decisions and shows unbounded totals with separate temporary amounts', async () => {
  const fixture=createGame({seed:121});
  fixture.age=3;
  fixture.focus={work:2,social:2,family:2,self:2,creative:2};
  fixture.stats.creativity=9.77;
  fixture.stats.health=.13;
  fixture.aptitudes.creativity=2;
  fixture.aptitudes.health=0;
  fixture.effects=[{id:'mixed',name:'Mixed effects',description:'',years:2,modifiers:{creativity:.5,health:-.4},kind:'neutral'}];
  const ui=await mount(fixture),before=ui.saved(),writes=ui.writes();
  assert.equal(ui.query('.status-strip [data-stat="creativity"] .status-value').textContent,'10.3/10');
  assert.equal(ui.query('.status-strip [data-stat="health"] .status-value').textContent,'-0.3/10');
  assert.equal(ui.query('.status-strip [data-stat="creativity"] .stat-effect-indicator').textContent,'+.5');
  assert.equal(ui.query('.status-strip [data-stat="health"] .stat-effect-indicator').textContent,'-.4');
  assert.equal(ui.all('.status-strip [data-stat="health"] .aptitude').length,0);
  assert.doesNotMatch(ui.query('.status-strip [data-stat="health"]').getAttribute('aria-label'),/Natural aptitude 0/);
  assert.equal(ui.all('.rating-track .stat-effect-indicator').length,0);
  const reading=ui.query('.status-strip [data-stat="creativity"] .status-reading');
  assert.equal(reading.lastElementChild.classList.contains('stat-effect-indicator'),true);
  assert.equal(reading.querySelector('.aptitude').textContent,'+2');
  const main=[...ui.query('#main-content').children];
  assert.ok(main.indexOf(ui.query('.parent-status-panel'))<main.indexOf(ui.query('.focus-panel')));
  assert.equal(ui.all('.year-stat-help, [data-topic="affinity"], .budget-summary').length,0);
  assert.doesNotMatch(ui.query('#app').textContent,/Small discoveries/);
  assert.doesNotMatch(ui.query('.advance-copy').textContent,/points|used|available/);
  assert.match(ui.query('.effect-meta').textContent,/\+\.5 Creativity.*-\.4 Health.*2 years remaining/);
  assert.doesNotMatch(ui.query('.effect-meta').textContent,/10\.3|-0\.3/);
  assert.equal(ui.query('.status-strip [data-stat="creativity"] .rating-track').getAttribute('aria-valuenow'),'10.3');
  assert.equal(ui.query('.status-strip [data-stat="health"] .rating-track').getAttribute('aria-valuenow'),'-0.3');
  for (const track of ui.all('.status-strip .rating-track')) {
    assert.ok(Number(track.getAttribute('aria-valuemin')) <= Number(track.getAttribute('aria-valuenow')));
    assert.ok(Number(track.getAttribute('aria-valuenow')) <= Number(track.getAttribute('aria-valuemax')));
  }
  assert.deepEqual(ui.saved(),before);
  assert.equal(ui.writes(),writes);
});


test('core focus starts neutral at two while unjoined school activities stay locked at zero', async () => {
  for (const [age, college] of [[3,false],[5,false],[18,true],[30,false]]) {
    const fixture=ageTo(createGame({seed:125}),age);
    if(college) assert.equal(chooseEducation(fixture,'college').ok,true);
    fixture.effects=[];
    fixture.focus=defaultFocus(age);
    const before=structuredClone(fixture);
    const ui=await mount(fixture);
    const count=age<5?5:age<18?6:4;
    assert.equal(ui.all('.focus-row').length,count);
    assert.ok(ui.all('.focus-row').every(row=>row.querySelector('output').textContent===(age>=5&&age<18&&['sports','extracurricular'].includes(row.dataset.focusKey)?'0':'2')));
    assert.equal(ui.query('.focus-panel .panel-heading .tag').textContent,`${age>=5&&age<18?8:count*2} / ${focusBudget(fixture)} POINTS`);
    assert.equal(ui.all('.focus-scale span').length,age>=5&&age<18?20:count*MAX_FOCUS);
    assert.equal(ui.all('.focus-panel .choice-impact').length,age>=5&&age<18?4:0,'core neutral choices have no effects; each unjoined category retains its two inactivity effects');
    if(age>=5&&age<18) {
      assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-delta="1"]').disabled,false,'unjoined school activities leave two spare points');
      assert.equal(ui.query('.focus-row[data-focus-key="sports"] [data-delta="1"]').disabled,true,'spare points do not bypass enrollment');
    } else assert.ok(ui.all('.focus-row [data-delta="1"]').every(button=>button.disabled),'default allocation uses the exact stage budget');
    assert.deepEqual(ui.saved(),before,'reading neutral previews does not mutate saves or RNG');
    ui.click('.focus-row[data-focus-key="social"] [data-delta="-1"]');
    ui.click('.focus-row[data-focus-key="social"] [data-delta="-1"]');
    assert.equal(ui.query('.focus-row[data-focus-key="social"] [data-delta="-1"]').disabled,true);
    ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
    ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
    assert.equal(ui.saved().focus.work,4);
    assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-delta="1"]').disabled,true);
    ui.click('.focus-row[data-focus-key="self"] [data-delta="-1"]');
    assert.ok(Object.values(ui.saved().focus).reduce((a,b)=>a+b,0)<focusBudget(age));
    assert.equal(ui.query('.focus-row[data-focus-key="work"] [data-delta="1"]').disabled,true,'a free point cannot bypass the per-focus maximum');
    ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
    assert.equal(ui.saved().focus.work,4);
    assert.equal(validateSave(ui.saved()),true);
    const reloaded=await mount(ui.saved());
    assert.deepEqual(reloaded.saved(),ui.saved());
  }
});

test('individual focus effects render one or three signs with accessible labels and no numeric deltas', async () => {
  for(const points of [0,1,2,3,4]) {
    const fixture=ageTo(createGame({seed:125}),3);
    fixture.effects=[];
    fixture.focus={work:points,social:0,family:0,self:0,creative:0};
    fixture.stats.strength=5;
    fixture.aptitudes.strength=0;
    const ui=await mount(fixture);
    const entry=ui.document.querySelector('.focus-row[data-focus-key="work"] [data-stat="strength"]');
    const expected=['---','-',null,'+','+++'][points];
    assert.equal(entry?.querySelector('b').textContent??null,expected);
    if(entry) {
      assert.doesNotMatch(entry.textContent,/undefined|NaN|[+-]\d/);
      assert.match(entry.querySelector('[role="img"]').getAttribute('aria-label'),/Strength: (small|medium|large) expected (increase|decrease)/);
    }
  }
});

test('toddler and family effects retain their point curves and crafts Intelligence threshold after reload', async () => {
  const effects={
    work:[['you','strength'],['you','social']],
    social:[['you','intelligence'],['you','social',true]],
    family:[['you','social'],['family','stability'],['family','relationship']],
    self:[['you','health'],['you','stability']],
    creative:[['you','creativity'],['you','intelligence']],
  };
  for(const [area,expectedEffects] of Object.entries(effects)) {
    const signsFor=(stat,reversed,points)=>(area==='social' ? (stat==='intelligence'?['----','--',null,'++','++++']:['++','+',null,'-','--']) : area==='creative' && stat==='intelligence'
      ? ['-',null,null,null,'+']
      : reversed?['+++','+',null,'-','---']:['---','-',null,'+','+++'])[points];
    const fixture=createGame({seed:121});
    fixture.age=3;
    fixture.conditions=[];
    fixture.effects=[];
    fixture.focus={work:0,social:0,family:0,self:0,creative:0};
    for(const person of [fixture,...fixture.parents]) {
      for(const stat of Object.keys(person.stats)) person.stats[stat]=5;
      for(const stat of Object.keys(person.aptitudes)) person.aptitudes[stat]=0;
      if('relationship' in person) person.relationship=5;
    }
    let ui=await mount(fixture);
    const before=ui.saved();
    for(let points=0;points<=4;points++) {
      if(points) ui.click(`.focus-row[data-focus-key="${area}"] [data-delta="1"]`);
      for(let reload=0;reload<2;reload++) {
        const row=ui.query(`.focus-row[data-focus-key="${area}"]`);
        assert.equal(row.querySelector('output').textContent,String(points));
        assert.equal(row.querySelectorAll('.choice-impact').length,expectedEffects.filter(([,stat,reversed])=>signsFor(stat,reversed,points)!==null).length);
        for(const [target,stat,reversed] of expectedEffects) {
          const entry=row.querySelector(`[data-target="${target}"][data-stat="${stat}"]`);
          const expected=signsFor(stat,reversed,points);
          assert.equal(entry?.querySelector('b').textContent??null,expected,`${area} ${points}: ${target} ${stat}, reload ${reload}`);
          if(entry && target==='family') {
            assert.deepEqual(entry.dataset.parentIds.split(' ').sort(),fixture.parents.map(parent=>parent.id).sort());
            assert.match(entry.querySelector('[role="img"]').getAttribute('aria-label'),/Dad|Mom/);
          }
        }
        assert.deepEqual(ui.saved().stats,before.stats);
        assert.deepEqual(ui.saved().parents,before.parents);
        assert.equal(ui.saved().rng,before.rng);
        if(!reload) {
          const saved=ui.saved();
          ui=await mount(saved);
          assert.deepEqual(ui.saved(),saved,'reload preserves every recorded value');
          const writes=ui.writes();
          ui.click('.nav-list [data-tab="year"]');
          assert.equal(ui.writes(),writes,'rendering previews never writes the save');
        }
      }
    }
  }
});

test('perks show separate named rows and affinity effects across Year and family profiles without changing saves', async () => {
  const fixture=partnerFixture();
  assert.equal(haveChild(fixture).ok,true);
  fixture.conditions=['autism','high_energy','sharp_memory','literal_thinker','restless'];
  fixture.focus={...defaultFocus(fixture),work:2,social:1,family:2,self:2};
  fixture.parents[0].conditions=['low_energy','literal_thinker'];
  fixture.partner.conditions=['high_energy','sharp_memory'];
  fixture.children[0].conditions=['autism','literal_thinker'];
  fixture.yearSummary=null; // The fixture changes birth traits after advancing; do not retain the previous trait budget.
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  const saved=ui.saved(),writes=ui.writes();
  assert.deepEqual(ui.all('.profile-bar .birth-condition').map(node=>node.dataset.conditionId),fixture.conditions);
  const perkList=ui.query('.profile-bar > .birth-conditions');
  assert.equal(perkList.tagName,'UL');
  assert.equal(perkList.getAttribute('role'),'list');
  assert.equal(perkList.getAttribute('aria-label'),`${fixture.name}: perks`);
  assert.equal(perkList.previousElementSibling.className,'profile-age','perks span a separate row below the identity and age');
  assert.equal(ui.all('.profile-copy .birth-conditions').length,0);
  for(const row of perkList.children) {
    assert.equal(row.tagName,'LI');
    assert.equal(row.firstElementChild.tagName,'STRONG');
    assert.equal(row.lastElementChild.className,'birth-condition-effects');
    assert.ok(row.querySelectorAll('.birth-condition-effect').length);
    assert.doesNotMatch(row.textContent,/[();]/,'effects use separate lines instead of a parenthesized paragraph');
  }
  assert.equal(ui.all('.status-strip > button').length,7,'conditions leave the seven-stat grid intact');
  assert.doesNotMatch(ui.query('#app').textContent,/Effects are game rules/);
  const autism=ui.query('.profile-bar [data-condition-id="autism"]');
  assert.equal(autism.querySelector('strong').textContent,'Autism');
  assert.deepEqual([...autism.querySelectorAll('.birth-condition-effect')].map(node=>node.textContent),['+1 Intelligence affinity','Focus Friends max 1 from age 5, lifelong']);
  assert.equal(autism.getAttribute('aria-label'),'Autism: +1 Intelligence affinity; Focus Friends max 1 from age 5, lifelong');
  assert.equal(ui.query('.profile-bar [data-condition-id="sharp_memory"] .birth-condition-effect').textContent,'+1 Intelligence affinity');
  assert.deepEqual(ui.all('.profile-bar [data-condition-id="literal_thinker"] .birth-condition-effect').map(node=>node.textContent),['-1 Creativity affinity','+1 Intelligence affinity']);
  assert.deepEqual(ui.all('.profile-bar [data-condition-id="restless"] .birth-condition-effect').map(node=>node.textContent),['-1 Mental stability affinity','+1 focus point']);
  assert.match(ui.query('.profile-bar [data-condition-id="high_energy"]').textContent,/\+1 focus point/);
  assert.equal(ui.all('.birth-conditions button').length,0,'perk effects need no help buttons');
  assert.doesNotMatch(perkList.textContent,/at birth|\+\.5|\+\.7/,'perks describe affinity changes, not old direct rating bonuses');
  ui.click('[data-topic="intelligence"]');
  assert.match(ui.query('.help-popup').textContent,/Perk affinities adjust natural aptitude, not current ratings/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('.nav-list [data-tab="family"]');
  for(const [person,condition] of [[fixture.parents[0],'low_energy'],[fixture.partner,'high_energy'],[fixture.children[0],'autism']]) {
    const selector=`[data-person-id="${person.id}"] [data-condition-id="${condition}"]`;
    const conditionNode=ui.query(selector);
    assert.match(conditionNode.closest('.birth-conditions').getAttribute('aria-label'),new RegExp(person.name));
    assert.equal(conditionNode.tagName,'LI');
    assert.ok(conditionNode.querySelector('.birth-condition-name'));
    assert.ok(conditionNode.querySelector('.birth-condition-effect'));
    assert.equal(conditionNode.closest('.birth-conditions').children.length,2,'family perks also have individual rows');
    assert.equal(conditionNode.querySelector('button'),null);
  }
  assert.deepEqual(ui.saved(),saved);
  assert.equal(ui.writes(),writes,'reading condition effects must not assign conditions, apply bonuses, or consume RNG');
  ui=await mount(saved);
  assert.equal(ui.all('.profile-bar .birth-condition').length,5);
  assert.deepEqual(ui.saved(),saved);
});

test('lifelong condition caps and extra focus points are enforced together and survive reload', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:89101});
  fixture.age=10;
  fixture.conditions=['autism','high_energy'];
  fixture.school=createSchoolRecord(fixture);
  fixture.school.sports={id:'basketball',success:5};
  fixture.school.extracurricular={id:'chess',success:5};
  fixture.focus={...defaultFocus(fixture),work:2,social:1,family:2,self:2};
  fixture.effects=[];
  assert.equal(validateSave(fixture),true);
  let ui=await mount(fixture);
  const social='.focus-row[data-focus-key="social"]';
  assert.match(ui.query('.focus-panel .tag').textContent,/9 \/ 11 POINTS/);
  assert.match(ui.query(`${social} .focus-limit`).textContent,/Max 1.*Autism.*lifelong/);
  assert.doesNotMatch(ui.query(`${social} .focus-limit`).textContent,/null|years left/);
  assert.equal(ui.query(`${social} [data-delta="1"]`).disabled,true);
  assert.equal(ui.query(`${social} .stepper`).getAttribute('aria-describedby'),'focus-limit-social');
  assert.equal(ui.all(`${social} .focus-scale .limited`).length,3);
  ui.click('[data-topic="focus"]');
  assert.match(ui.query('.help-popup').textContent,/Share 11 points.*Sports and Extracurriculars.*0?2/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
  ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
  assert.equal(ui.saved().focus.work,4);
  assert.match(ui.query('.focus-panel .tag').textContent,/11 \/ 11 POINTS/);
  assert.ok(ui.all('.focus-row [data-delta="1"]').every(button=>button.disabled));
  const saved=ui.saved();
  ui=await mount(saved);
  assert.deepEqual(ui.saved(),saved);
  assert.match(ui.query(`${social} .focus-limit`).textContent,/lifelong/);
  assert.match(ui.query('.focus-panel .tag').textContent,/11 \/ 11 POINTS/);

  const toddler=createGame({seed:89102});
  toddler.age=3;toddler.conditions=['high_energy'];toddler.focus=defaultFocus(3);toddler.effects=[];
  ui=await mount(toddler);
  assert.match(ui.query('.focus-panel .tag').textContent,/10 \/ 11 POINTS/);
  ui.click('[data-topic="toddler-focus"]');
  assert.match(ui.query('.help-popup').textContent,/Share 11 points among five activities/);
  ui.click('.help-popup [data-action="close"]');
  ui.click('.focus-row[data-focus-key="work"] [data-delta="1"]');
  assert.match(ui.query('.focus-panel .tag').textContent,/11 \/ 11 POINTS/);
  assert.ok(ui.all('.focus-row [data-delta="1"]').every(button=>button.disabled));
});

test('dating prospects show their own perk rows and perk-free profiles stay compact', async () => {
  const fixture=encounterFixture();
  fixture.conditions=[];
  fixture.encounters[0].conditions=['autism','literal_thinker'];
  fixture.encounters[1].conditions=[];
  const ui=await mount(fixture),saved=ui.saved();
  assert.equal(ui.all('.profile-bar .birth-conditions').length,0);
  ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.query('.encounter-card [data-condition-id="autism"] .birth-condition-name').textContent,'Autism');
  assert.deepEqual(ui.all('.encounter-card [data-condition-id="autism"] .birth-condition-effect').map(node=>node.textContent),['+1 Intelligence affinity','Focus Friends max 1 from age 5, lifelong']);
  assert.deepEqual(ui.all('.encounter-card [data-condition-id="literal_thinker"] .birth-condition-effect').map(node=>node.textContent),['-1 Creativity affinity','+1 Intelligence affinity']);
  assert.equal(ui.all('.encounter-card .birth-condition').length,2);
  assert.ok(ui.query('.encounter-card .birth-conditions').getAttribute('aria-label').includes(fixture.encounters[0].name));
  assert.equal(ui.all('.encounter-card .birth-conditions button').length,0);
  ui.click('[data-action="prospect-page"][data-delta="1"]');
  assert.equal(ui.all('.encounter-card .birth-conditions').length,0);
  assert.deepEqual(ui.saved(),saved,'reading condition profiles preserves stats and RNG');
});


test('parent help explains caused gains and zero Family time losses without changing the save', async () => {
  const fixture=ageTo(createGame({seed:121}),3);
  const ui=await mount(fixture),saved=ui.saved(),writes=ui.writes();
  ui.click('[data-topic="parents"]');
  assert.match(ui.query('.help-popup').textContent,/Gains need care, activity or an event.*Low ratings amplify existing gains.*Zero Family time contributes a loss/);
  assert.deepEqual(ui.saved(),saved); assert.equal(ui.writes(),writes);
});
