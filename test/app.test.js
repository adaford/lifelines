// DOM integration checks run entirely in Node. They verify UI wiring and saves,
// but are not a substitute for checking layout in a real browser.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { SKILLS, JOBS, EVENTS, resolveEventChoice, eventOdds, canTakeJob, chooseEducation, offeredJobs, needsEducationChoice, createGame, advanceYear, haveChild, takeJob, successionInfo, succeed, validateSave, respondToEncounter, proposeMarriage, effectiveStats, relationshipOdds, proposalChance, statPercentiles } from '../engine.js';

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
  const original = ui.saved(), writes = ui.writes();
  assert.equal(ui.query('.year-stats [data-stat="intelligence"] .stat-value').textContent,'8.7','a baby’s high innate rating is displayed directly');
  assert.equal(ui.query('.year-stats [data-stat="intelligence"] .aptitude').getAttribute('aria-label'),'Natural aptitude +3');
  const trigger = ui.query('[data-topic="stats"]');
  assert.equal(trigger.tagName,'BUTTON');
  assert.equal(trigger.getAttribute('aria-label'),'About Your stats');
  assert.equal(trigger.getAttribute('aria-haspopup'),'dialog');
  trigger.focus();
  ui.click('[data-topic="stats"]');
  const dialog = ui.query('.help-popup[role="dialog"]');
  assert.equal(dialog.getAttribute('aria-modal'),'true');
  assert.equal(dialog.getAttribute('aria-describedby'),'topic-help-content');
  assert.match(dialog.textContent,/Before 18, ability ratings compare you with others your age.*high infant intelligence means strong natural potential/);
  assert.match(dialog.textContent,/Focus can raise skills; neglect can lower them/);
  assert.doesNotMatch(dialog.textContent,/start low|low at birth|automatic growth/i);
  assert.ok(ui.query('.modal-body').textContent.split(/\s+/).length<45,'the overview should explain age-relative ratings briefly');
  assert.equal(ui.document.activeElement,ui.query('.help-popup [data-action="close"]'));
  assert.ok(ui.query('#app').hasAttribute('inert'));
  ui.key('.help-popup [data-action="close"]','Escape');
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.document.activeElement,trigger);
  assert.equal(ui.query('#app').hasAttribute('inert'),false);
  ui.click('[data-topic="stats"]');
  ui.click('.help-popup .modal-body');
  assert.equal(ui.all('[role="dialog"]').length,1,'clicking the content keeps help open');
  ui.click('.help-popup-backdrop');
  assert.equal(ui.all('[role="dialog"]').length,0);
  assert.equal(ui.document.activeElement,trigger);
  ui.click('[data-topic="stats"]');
  ui.click('.help-popup [data-action="close"]');
  assert.equal(ui.document.activeElement,trigger);
  ui.click('.stats-panel [data-topic="affinity"]');
  assert.equal(ui.query('.help-popup #modal-title').textContent,'Natural aptitude');
  assert.match(ui.query('.help-popup').textContent,/starting ability and responsiveness to focus.*Practice does not increase attractiveness/);
  ui.click('.help-popup [data-action="close"]');
  assert.deepEqual(ui.saved(),original);
  assert.equal(ui.writes(),writes,'reading or dismissing help must not write the save');
});

test('health, appearance, growth, crying, and household help contain the requested rules', async () => {
  const ui = await mount(createGame({seed:121}));
  const topics = [
    ['strength',/A 7\/10 baby is strong for a baby.*Exercise can maintain or raise this rating; inactivity can lower it/],
    ['health',/Poor health raises disease risk and reduces childhood height gains/],
    ['height',/Final height emerges from yearly growth.*14–18.*Poor health reduces new growth, never existing height/],
    ['attractiveness',/tiny random changes each year.*rather than gains from practice.*after 30 for men and 22 for women/],
    ['cry',/1–5.*brings care and strengthens parent relationships.*harder crying strains their mental stability more/],
    ['lifestyle',/Until 18.*parents.*changing household lifestyle.*adult.*work, family, events and inheritance/],
  ];
  for(const [topic,content] of topics) {
    ui.click(`[data-topic="${topic}"]`);
    assert.match(ui.query('.help-popup').textContent,content);
    assert.ok(ui.query('.modal-body').textContent.split(/\s+/).length<60,`${topic} help should stay brief`);
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
    for(const tab of ['year','career','family','character']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.ok(ui.all('#main-content [data-action="topic-help"]').length,`${tab} needs contextual help`);
      assert.equal(ui.all('#app .form-note, #app .trait-legend, #app .forecast-legend, #app .character-guide, #app .profile-affinity-note, #app .focus-copy p, #app .job-description').length,0);
      assert.doesNotMatch(ui.query('#app').textContent,/Higher is calmer|College focus builds|Family focus strengthens|Attractiveness, social ability, and lifestyle shape|Small −3 to \+3 ratings|\bbonds?\b/i);
      for(const button of ui.all('#main-content [data-action="topic-help"]')) {
        assert.equal(button.tagName,'BUTTON');
        assert.match(button.getAttribute('aria-label'),/^About .+/);
        assert.equal(button.getAttribute('aria-haspopup'),'dialog');
      }
      if(ui.all('[data-topic="focus"]').length) {
        ui.click('[data-topic="focus"]');
        assert.match(ui.query('.help-popup').textContent,/Focused skills can rise, neglected ones can fall, and results vary yearly/);
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
  ui.click('[data-topic="stats"]');
  ui.key('.help-popup [data-action="close"]','Escape');
  assert.equal(ui.query('.event-choices').textContent,before);
  assert.deepEqual(ui.saved(),saved);
  assert.equal(ui.writes(),writes);
  assert.equal(ui.all('[data-action="advance"]').length,0);
});

test('parent lifestyle recaps show before and after while older summaries remain readable', async () => {
  const fixture=ageTo(createGame({seed:121}),1);
  fixture.yearSummary.dismissed=false;
  fixture.yearSummary.parents[0].lifestyle={before:6,after:5,change:-1};
  delete fixture.yearSummary.parents[1].lifestyle;
  const ui=await mount(fixture);
  assert.equal(ui.all('.parent-review-lifestyle').length,1);
  assert.equal(ui.query('.parent-review-lifestyle').textContent,'Lifestyle 6.0 → 5.0');
  assert.match(ui.query('.forecast-parents').textContent,/Mental stability.*Relationship.*Lifestyle/);
  assert.doesNotMatch(ui.query('.forecast-parents').textContent,/undefined|NaN|[+−-]\d/);
  assert.deepEqual(ui.saved().yearSummary,fixture.yearSummary);
});

test('legacy journal and review text hides signed changes and tutorial suffixes without rewriting history', async () => {
  const fixture=ageTo(createGame({seed:121}),1);
  fixture.history[0].title='A closer bond';
  fixture.history[0].text='A visit goes well. Bond +0.4; Social ability +.25; stability -0.1; Health −0.2; Instability +0.3. Lifestyle 6.0 → 5.0. Family focus will help their abilities grow, and your family legacy will be divided equally among your surviving children.';
  fixture.yearSummary.dismissed=false;
  fixture.yearSummary.events=[{title:fixture.history[0].title,text:fixture.history[0].text,kind:'family'}];
  fixture.effects=[{id:'legacy-effect',name:'A stronger bond',description:'Bond +0.3; Stability -0.2.',years:2,modifiers:{stability:-.2},kind:'negative'}];
  const ui=await mount(fixture);
  const review=ui.query('.year-review-events').textContent;
  assert.match(review,/A closer relationship.*relationship increased.*Social ability increased.*Mental stability decreased.*Health decreased.*Mental stability decreased.*Lifestyle 6\.0 → 5\.0/);
  assert.doesNotMatch(review,/\bbonds?\b|instability|[+−-](?:\d|\.)|Family focus will help/i);
  ui.click('.year-review-modal [data-action="close"]');
  const journal=ui.query('.journal-list').textContent;
  assert.match(journal,/A visit goes well/);
  assert.doesNotMatch(journal,/\bbonds?\b|instability|[+−-](?:\d|\.)|Family focus will help/i);
  ui.click('.nav-list [data-tab="character"]');
  assert.match(ui.query('.effect-card').textContent,/A stronger relationship.*relationship increased.*Mental stability decreased/);
  assert.deepEqual(ui.saved().history,fixture.history,'display normalization must preserve original saved history');
  assert.deepEqual(ui.saved().effects,fixture.effects);
});

test('first launch requires a surname, capitalizes its first letter, and preserves multiword names', async () => {
  let ui=await mount(null);
  assert.equal(ui.storage.has(SAVE_KEY),false,'an unnamed provisional life must not overwrite storage');
  assert.ok(ui.query('#new-surname').hasAttribute('required'));
  assert.equal(ui.all('.modal [data-action="close"]').length,0);
  ui.key('#new-surname','Escape');
  assert.equal(ui.all('[role="dialog"]').length,1,'the surname prompt cannot be dismissed on first launch');
  ui.query('#new-surname').value='   ';
  ui.click('[data-action="confirm-new"]');
  assert.equal(ui.storage.has(SAVE_KEY),false);
  assert.equal(ui.all('[role="dialog"]').length,1);
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
    assert.equal(card.querySelectorAll('.profile-stat[data-skill]').length,7);
    assert.equal(card.querySelectorAll('.aptitude').length,5);
    for(const aptitude of card.querySelectorAll('.aptitude')) assert.match(aptitude.getAttribute('aria-label'),/natural aptitude/);
    assert.ok(card.querySelector('.family-details').hasAttribute('open'));
    assert.equal(card.querySelector('.relationship-meter').getAttribute('aria-valuenow'),String(parent.relationship));
    if(parent.alive===false) assert.match(card.textContent,/Remembered/);
    else assert.doesNotMatch(card.textContent,/Remembered/);
    assertNoMoneyDisplay(card,'parent profile');
  }
  assert.deepEqual(ui.saved(),fixture,'reading family profiles must preserve all state');
});

test('cry levels update colored stat forecasts without numeric deltas or consuming randomness', async () => {
  const ui=await mount(createGame({name:'Jamie Reed',seed:121}));
  const initial=ui.saved();
  const intelligenceProjection = () => {
    const segment=ui.query('.forecast-panel [data-stat="intelligence"] .stat-projection');
    return segment ? parseFloat(segment.style.width)*(segment.dataset.direction==='decrease'?-1:1) : 0;
  };
  ui.click('[data-action="baby"][data-level="1"]');
  const low=intelligenceProjection();
  ui.click('[data-action="baby"][data-level="5"]');
  const high=intelligenceProjection();
  assert.ok(high>low,'more crying improves the forecast, including when it reduces a projected decline');
  assert.equal(ui.all('.forecast-panel [role="meter"]').length,8);
  assert.equal(ui.all('.forecast-panel .year-change').length,0);
  assert.equal(Number(ui.query('.forecast-panel [data-stat="intelligence"] strong').textContent),Number(initial.stats.intelligence.toFixed(1)));
  assert.match(ui.query('.forecast-panel [data-stat="intelligence"] [role="meter"]').getAttribute('aria-valuetext'),new RegExp(`expected to ${high>0?'increase':high<0?'decrease':'stay steady'}`));
  assert.doesNotMatch(ui.query('.forecast-panel').textContent,/expected increase|expected decrease|Growth varies each year/i);
  ui.click('.forecast-panel [data-topic="forecast"]');
  assert.match(ui.query('.help-popup').textContent,/Green: expected increase.*Red: expected decrease/);
  assert.match(ui.query('.help-popup').textContent,/events and yearly variation can alter the result/);
  ui.click('.help-popup [data-action="close"]');
  assert.equal(ui.saved().rng,initial.rng);
  assert.equal(ui.saved().age,initial.age);
  assert.equal(ui.saved().cryLevel,5);
  assertNoMoneyDisplay(ui.query('.forecast-panel'),'annual forecast');
  ui.click('.nav-list [data-tab="family"]');
  assert.ok(ui.query('.roots-panel [data-skill="stability"] .stat-projection.decrease'));
  assert.ok(ui.query('.roots-panel .relationship-meter .stat-projection.increase'));
});

test('gender is visible next to the name and player height percentiles continue until eighteen', async () => {
  for(const gender of ['male','female','nonbinary']) {
    const baby=createGame({name:'Jamie Reed',seed:121,gender});
    baby.maturityAge=16;
    let ui=await mount(baby);
    assert.equal(ui.query('.profile-name-row .person-name').textContent,baby.name);
    assert.equal(ui.query('.profile-name-row .gender-label').textContent,gender==='nonbinary'?'Nonbinary':gender[0].toUpperCase()+gender.slice(1));
    assert.match(ui.query('.height-vital').textContent,/cm.*percentile/);
    const grown=ageTo(baby,baby.maturityAge);
    ui=await mount(grown);
    ui.click('.nav-list [data-tab="character"]');
    assert.match(ui.query('.height-vital .height-percentile').textContent,/percentile/);
    assert.equal(ui.query('.height-vital .height-percentile').dataset.percentileKey,'height');
    ui.click('.height-vital [data-topic="height"]');
    assert.match(ui.query('.help-popup').textContent,/ending at 14–18/);
    assert.doesNotMatch(ui.query('.help-popup').textContent,/Current position|This person has reached/);
    const adult=ageTo(grown,18);
    chooseEducation(adult,'work');
    ui=await mount(adult);
    ui.click('.nav-list [data-tab="character"]');
    assert.equal(ui.query('.height-vital .height-percentile').textContent,'Adult height');
    assert.equal(ui.all('.stats-panel .stat-percentile').length,0);
  }
});

test('all own stats show simulation percentiles before eighteen without changing current values or saves', async () => {
  const keys=[...SKILLS.map(skill=>skill.key),'health','stability','lifestyle','height'];
  const ordinal=value=>{
    const rank=Math.round(value);
    if(rank<1) return 'Below 1st percentile';
    if(rank>99) return 'Above 99th percentile';
    const suffix=rank%100>=11&&rank%100<=13?'th':({1:'st',2:'nd',3:'rd'}[rank%10]||'th');
    return `${rank}${suffix} percentile`;
  };
  for(const age of [0,17,18]) {
    const fixture=ageTo(createGame({seed:121}),age);
    if(age===18) chooseEducation(fixture,'work');
    const current=effectiveStats(fixture), percentiles=statPercentiles(fixture);
    const ui=await mount(fixture), saved=ui.saved(), writes=ui.writes();
    for(const tab of ['year','character','year']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.equal(ui.all('.stats-panel .stat-percentile').length,age<18?9:0);
      for(const key of keys) {
        const row=ui.query(`.stats-panel [data-stat="${key}"]`);
        const value=row.querySelector('.stat-value, .vital-value');
        assert.equal(parseFloat(value.textContent),Number((key==='height'?fixture.height:key==='lifestyle'?fixture.lifestyle:current[key]).toFixed(1)),`${key} keeps its current number`);
        if(age<18) {
          const label=row.querySelector(`[data-percentile-key="${key}"]`);
          assert.ok(label,`${key} needs its own percentile`);
          assert.equal(label.textContent,ordinal(percentiles[key].percentile));
          assert.match(label.getAttribute('aria-label'),/percentile/);
        }
      }
      if(age<18) {
        ui.click('.stats-panel [data-topic="percentiles"]');
        assert.match(ui.query('.help-popup').textContent,/Compared with simulated lives your age.*5\/10 is average: the 50th percentile/);
        ui.click('.help-popup [data-action="close"]');
      } else assert.equal(ui.all('.stats-panel [data-topic="percentiles"]').length,0);
    }
    assert.deepEqual(ui.saved(),saved);
    assert.equal(ui.writes(),writes,'refreshing percentile displays must not save or reroll');
    if(age<18) {
      const ranks=ui.all('.stats-panel .stat-percentile').map(label=>label.textContent);
      ui.click(age<3?'[data-action="baby"][data-level="5"]':'[data-action="focus"][data-key="self"][data-delta="-1"]');
      assert.deepEqual(ui.all('.stats-panel .stat-percentile').map(label=>label.textContent),ranks,'changing future focus leaves current same-age ranks unchanged');
      assert.equal(ui.saved().rng,saved.rng);
      assert.equal(ui.saved().age,saved.age);
    }
  }
});

test('aging losses show as red segments and parents keep their explicit family roles', async () => {
  const fixture=ageTo(createGame({name:'Jamie Reed',seed:121,gender:'female'}),23);
  fixture.stats.attractiveness=8;
  fixture.parents[0].parentRole='mom';
  fixture.parents[1].parentRole='dad';
  const ui=await mount(fixture);
  const meter=ui.query('.year-stats [data-stat="attractiveness"] [role="meter"]');
  assert.equal(Number(meter.getAttribute('aria-valuenow')),8);
  assert.match(meter.getAttribute('aria-valuetext'),/expected to decrease/);
  assert.ok(meter.querySelector('.stat-projection.decrease'));
  ui.click('.nav-list [data-tab="family"]');
  assert.equal(ui.query(`.roots-panel [data-person-id="${fixture.parents[0].id}"] .eyebrow`).textContent,'Mom');
  assert.equal(ui.query(`.roots-panel [data-person-id="${fixture.parents[1].id}"] .eyebrow`).textContent,'Dad');
});

test('new-year review shows actual changes, survives reload, and dismisses persistently', async () => {
  let ui=await mount(createGame({name:'Jamie Reed',seed:121}));
  ui.click('[data-action="advance"]');
  const advanced=ui.saved();
  assert.equal(advanced.yearSummary.dismissed,false);
  assert.equal(ui.all('.year-review-modal').length,1);
  assert.equal(ui.query('.year-review-modal #modal-title').textContent,'Age 0 → 1');
  assert.equal(ui.all('.year-review-intro').length,0,'the recap heading already identifies the year');
  for(const [key,delta] of Object.entries(advanced.yearSummary.stats)) {
    const digits=delta.before!==delta.after && delta.before.toFixed(1)===delta.after.toFixed(1)?2:1;
    assert.equal(ui.query(`.year-review-modal [data-stat="${key}"] strong`).textContent,`${delta.before.toFixed(digits)} → ${delta.after.toFixed(digits)}`);
  }
  const height=advanced.yearSummary.height;
  assert.equal(ui.query('.year-review-modal [data-stat="height"] > span').textContent,'Height');
  assert.equal(ui.query('.year-review-modal [data-stat="height"] strong').textContent,`${height.before.toFixed(1)} → ${height.after.toFixed(1)} cm`);
  assert.doesNotMatch(ui.query('.year-changes').textContent,/[+−-]\d/);
  assert.doesNotMatch(ui.query('.forecast-parents').textContent,/\bbond\b|[+−-]\d/i);
  assert.match(ui.query('.forecast-parents').textContent,/Mental stability [\d.]+ → [\d.]+.*Relationship [\d.]+ → [\d.]+/);
  assertNoMoneyDisplay(ui.query('.year-review-modal'),'year in review');
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
  for(const [after,expected] of [[4.33,'4.32 → 4.33'],[4.36,'4.3 → 4.4']]) {
    const older=structuredClone(advanced);
    delete older.yearSummary.height;
    older.yearSummary.stats.intelligence={before:4.32,after,change:Math.round((after-4.32)*100)/100};
    older.yearSummary.parents[0].stability={before:8.12,after:8.13,change:.01};
    ui=await mount(older);
    assert.equal(ui.all('.year-review-modal [data-stat="height"]').length,0,'old reviews have no invented height history');
    assert.equal(ui.query('.year-review-modal [data-stat="intelligence"] strong').textContent,expected);
    assert.match(ui.query('.forecast-parents').textContent,/Mental stability 8\.12 → 8\.13/);
    assert.deepEqual(ui.saved(),older);
  }
});

test('a death before retirement opens a playable next chapter', async () => {
  const fixture=createGame({name:'Jamie Reed',seed:121});
  assert.equal(advanceYear(fixture,{mortalityRandom:()=>0}).ok,true);
  assert.equal(fixture.alive,false);
  const ui=await mount(fixture);
  ui.click('.year-review-modal [data-action="close"]');
  assert.match(ui.query('#main-content').textContent,/died at age 1/);
  assert.equal(ui.all('.stats-panel .stat-percentile').length,0,'a closed life no longer shows peer ranks');
  assert.doesNotMatch(ui.query('.height-vital').textContent,/Adult height/,'a baby’s final height is not adult height');
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

test('a blank surname cannot replace an existing life', async () => {
  const fixture=ageTo(createGame({name:'Riley Reed',seed:2091}),20);
  const ui=await mount(fixture);
  ui.click('[data-action="menu"]'); ui.click('.menu-list [data-action="new"]');
  ui.query('#new-surname').value='';
  ui.query('#new-name').value='Jamie';
  ui.click('[data-action="confirm-new"]');
  assert.deepEqual(ui.saved(),fixture);
  assert.equal(ui.all('[role="dialog"]').length,1);
  ui.click('.modal [data-action="close"]');
  assert.deepEqual(ui.saved(),fixture);
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
  old.version=5; old.ended=true; old.needsSuccession=false;
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
  for(const tab of ['career','family','character','year']) {
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
      const expected=Math.round(Math.max(1,Math.min(10,fixture.stats[key]+change))*100)/100;
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
  state.focus={work:2,social:5,family:2,self:3};
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
  const old=structuredClone(state);old.version=4;
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
    assert.match(lifestyle.textContent, new RegExp(`${job.baseLifestyle}\\s*\\/\\s*10`));
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
  const legacy = structuredClone(state);
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
      assert.equal(card.querySelectorAll('.profile-stat .aptitude').length,5);
      for(const skill of [...SKILLS.map(s=>s.key),'health','stability']) assert.ok(card.querySelector(`[data-skill="${skill}"]`));
      for(const label of ['Lifestyle','Height']) assert.match(card.textContent,new RegExp(label));
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
    const fixture=encounterFixture();fixture.stats.social=5;fixture.stats.stability=5;fixture.effects=[];
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
        assert.equal(ui.query('.partner-panel .relationship-meter').getAttribute('aria-valuenow'),String(ui.saved().partner.relationship));
        assert.ok(effectiveStats(ui.saved()).social>effectiveStats(branch.before).social);
        assert.ok(effectiveStats(ui.saved()).stability>effectiveStats(branch.before).stability);
        assert.equal(ui.saved().lifestyle,branch.before.lifestyle-1);
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

  test('a pregnancy survives reload and becomes a newborn with a relationship meter',async()=>{
    const fixture=partnerFixture();fixture.partner.married=true;fixture.partner.yearsTogether=4;
    const branch=actionOutcome(fixture,advanceYear,(s)=>Boolean(s.pregnancy));
    resolvePending(branch.after);
    let ui=await mount(branch.after);ui.click('.nav-list [data-tab="family"]');
    assert.match(ui.query('.pregnancy-panel').textContent,new RegExp(branch.after.pregnancy.otherParent.name));
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
    assert.equal(ui.query('.child-grid .relationship-meter').getAttribute('aria-valuenow'),String(ui.saved().children[0].relationship));
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
    assert.equal(ui.query('.partner-panel .relationship-meter').getAttribute('aria-valuenow'),'5.6');
  });

  test('a v4 save preserves pending decisions and progress through the family update',async()=>{
    const fixture=pendingFixture(2),legacy=beforeFamilySave(fixture);
    let ui=await mount(legacy);
    const restored=ui.saved();
    assert.equal(restored.version,fixture.version);
    for(const key of ['id','name','familyName','age','rng','nextId','education','jobOffers','stats','aptitudes','history','pendingEvents','lastYearEvents']) assert.deepEqual(restored[key],fixture[key],`${key} must survive migration`);
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
    fixture.focus = { work: 5, social: 2, family: 2, self: 3 };
    const ui = await mount(fixture);
    const originalSave = ui.saved();
    const expectedTabs = ['year', 'career', 'family', 'character'];
    const expectedLabels = ['Year', 'Career', 'Family', 'You'];
    assert.equal(ui.all('.sidebar, .right-column').length, 0);
    assert.equal(ui.all('.bottom-dock .nav-list .nav-button').length, 4);
    assert.deepEqual(ui.all('.bottom-dock .nav-button').map(button => button.dataset.tab), expectedTabs);
    assert.deepEqual(ui.all('.bottom-dock .nav-label').map(label => label.textContent.trim()), expectedLabels);
    assert.equal(ui.all('[data-action="advance"]').length, 1);
    assert.ok(ui.query('.bottom-dock [data-action="advance"]'));
    assert.match(ui.query('.profile-bar').textContent, /Riley Santos/);
    assert.match(ui.query('.status-strip').textContent, /Health/);
    assert.match(ui.query('.status-strip').textContent, /Mental stability/);

    for (const tab of ['career', 'family', 'character']) {
      ui.click(`.bottom-dock [data-tab="${tab}"]`);
      assert.equal(ui.all('[data-action="advance"]').length, 0, 'other screens must not advance time accidentally');
      assert.equal(ui.query(`.nav-list [data-tab="${tab}"]`).getAttribute('aria-current'), 'page');
      assert.equal(ui.all('.bottom-dock .nav-button').length, 4);
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

  test('a new baby renders, crying saves, and three annual advances unlock focus', async () => {
    const ui = await mount();
    const initial = ui.saved();
    assert.equal(initial.age, 0);
    assert.equal(ui.query('.person-name').textContent, 'Jamie Reed');
    assert.equal(ui.all('.cry-level').length, 5);
    assert.equal(ui.all('.stat-list .stat-row').length, 5, 'current skills and forecasts are visible on Year');
    assert.equal(ui.all('.year-stats .stat-row').length, 5, 'all adult skills must be visible from birth');
    assert.equal(ui.all('.year-stats .stat-list .aptitude').length, 5, 'every newborn skill needs its natural aptitude');
    for (const [index, skill] of SKILLS.entries()) {
      const cell = ui.all('.year-stats .stat-row')[index];
      assert.match(cell.textContent, new RegExp(skill.label));
      assert.equal(cell.querySelector('.stat-value').textContent,initial.stats[skill.key].toFixed(1),`${skill.label} displays its saved age-relative rating`);
      assert.ok(Number.isInteger(initial.aptitudes[skill.key]) && initial.aptitudes[skill.key] >= -3 && initial.aptitudes[skill.key] <= 3);
      assert.equal(cell.querySelector('.aptitude').textContent.trim(), `${initial.aptitudes[skill.key] > 0 ? '+' : ''}${initial.aptitudes[skill.key]}`);
    }
    assert.match(ui.query('.year-stats').textContent, /Natural aptitude/);
    assert.doesNotMatch(ui.query('.year-stats').textContent, /Growth affinity/);
    assert.equal(ui.all('[data-action="focus"]').length, 0);

    ui.click('[data-action="baby"][data-level="5"]');
    assert.equal(ui.saved().cryLevel, 5);
    assert.equal(ui.query('[data-action="baby"][data-level="5"]').getAttribute('aria-pressed'), 'true');
    for (let year = 1; year <= 3; year += 1) {
      ui.click('[data-action="advance"]');
    resolveUIEvents(ui);
      assert.equal(ui.saved().age, year, 'one click advances exactly one year');
    }
    assert.equal(ui.all('.cry-level').length, 0);
    assert.equal(ui.all('.focus-row').length, 4);
    assert.equal(ui.all('[data-action="focus"]').length, 8);
    assert.equal(ui.query('.year-stats [data-stat="intelligence"] .stat-value').textContent,ui.saved().stats.intelligence.toFixed(1),'the changing age-relative rating remains synchronized with the save');
    assert.ok(ui.saved().parents[0].stats.stability < initial.parents[0].stats.stability);
    assert.match(ui.query('.journal-list').textContent, /bigger little world/i);
    assert.equal(validateSave(ui.saved()), true);
    assert.doesNotMatch(ui.query('#app').textContent, /undefined|NaN/);
    ui.click('.nav-list [data-tab="character"]');
    assert.equal(ui.all('.stat-list .stat-row').length, 5);
    assert.equal(ui.all('.stat-list .aptitude').length, 5);
    assert.equal(ui.saved().age, 3, 'viewing detailed skills must not advance the year');
  });

  test('the focus controls enforce the shared budget and persist reallocations', async () => {
    const ui = await mount(ageTo(createGame({ seed: 19 }), 3));
    const plus = '[data-action="focus"][data-key="work"][data-delta="1"]';
    const minus = '[data-action="focus"][data-key="social"][data-delta="-1"]';
    assert.equal(ui.query(plus).disabled, true);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 3, 'disabled controls must not change the state');
    ui.click(minus);
    assert.equal(ui.query(plus).disabled, false);
    assert.equal(ui.saved().focus.social, 2);
    ui.click(plus);
    assert.equal(ui.saved().focus.work, 4);
    assert.equal(Object.values(ui.saved().focus).reduce((a, b) => a + b, 0), 12);
    assert.equal(ui.query(plus).disabled, true);
    assert.match(ui.query('.budget-summary').textContent, /12\s*\/\s*12/);
  });

  test('a child shares the displayed parental lifestyle until adulthood', async () => {
    const fixture = createGame({ name: 'Robin Park', seed: 211 });
    const initialLifestyle = fixture.parents[0].lifestyle;
    assert.ok(Number.isInteger(initialLifestyle) && initialLifestyle >= 1 && initialLifestyle <= 10);
    assert.ok(fixture.parents.every(parent => parent.lifestyle === initialLifestyle));
    const ui = await mount(fixture);
    for (let age = 0; age < 18; age += 1) {
      const saved=ui.saved();
      const parentLifestyle=(saved.parents.find(parent=>parent.alive!==false) || saved.parents[0]).lifestyle;
      assert.equal(saved.age, age);
      assert.equal(saved.lifestyle, parentLifestyle);
      assert.match(ui.query('.status-strip').textContent, new RegExp(`Lifestyle\\s*${parentLifestyle}\\s*\\/\\s*10`));
      if (age === 0 || age === 17) {
        ui.click('.nav-list [data-tab="family"]');
        for (const card of ui.all('.roots-panel .family-card')) {
          const parent=saved.parents.find(parent=>parent.id===card.dataset.personId);
          assert.match(card.textContent, new RegExp(`Lifestyle[\\s\\S]{0,20}${parent.lifestyle}\\s*\\/\\s*10`, 'i'));
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

  test('Mental stability replaces abbreviated or legacy labels throughout character, family, effects, and help', async () => {
    const fixture = ageTo(createGame({ name: 'Quinn Reed', seed: 212 }), 26);
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2, intelligence: -.6 }, kind: 'negative' }];
    const ui = await mount(fixture);
    for (const tab of ['year', 'career', 'family', 'character']) {
      ui.click(`.nav-list [data-tab="${tab}"]`);
      assert.doesNotMatch(ui.query('#app').textContent, /instability/i, `${tab} must use the positive stability scale`);
      assert.match(ui.query('.status-strip').textContent, /Mental stability\s*[\d.]+\s*\/\s*10/);
    }
    assert.match(ui.query('.effect-card.negative').textContent, /Mental stability\s*[\d.]+/);
    assert.doesNotMatch(ui.query('.effect-card.negative').textContent, /[+−-]\d/);
    assert.doesNotMatch(ui.query('.vitals-grid').textContent, /Higher is calmer/);
    ui.click('.vitals-grid [data-topic="stability"]');
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
    fixture.focus = { work: 4, social: 2, family: 3, self: 3 };
    fixture.effects = [{ id: 'burnout', name: 'Running on empty', description: 'A difficult stretch.', years: 2, modifiers: { stability: -1.2 }, kind: 'negative' }];
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
    assert.deepEqual(restored.aptitudes, fixture.aptitudes);
    assert.deepEqual(restored.focus, fixture.focus);
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
    assert.deepEqual(restored.aptitudes, incoming.aptitudes);
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
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('.family-card').length, 2);
    assert.equal(ui.query('[data-action="child"]').disabled, true);
    ui.click('[data-action="tab"][data-tab="character"]');
    assert.equal(ui.all('.stat-list .stat-row').length, 5);
    ui.click('[data-action="menu"]');
    assert.ok(ui.query('.menu-list [data-action="export"]'));
    ui.click('.menu-list [data-action="help"]');
    assert.equal(ui.all('[role="dialog"]').length, 1);
    assert.equal(ui.all('.help-item').filter(item => item.closest('.modal')).length, 6);
    assert.equal(ui.document.body.style.overflow, 'hidden');
    ui.click('.modal [data-action="close"]');
    assert.equal(ui.all('[role="dialog"]').length, 0);
    assert.equal(ui.document.body.style.overflow, '');
    ui.click('[data-action="odds"]');
    assert.match(ui.query('.modal-body').textContent, /Quiet year/);
    assert.match(ui.query('.modal-body').textContent, /Under the weather/);
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
    const legacy = structuredClone(fixture);
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
    for (const effect of legacy.effects) delete effect.lifestyle;
    const ui = await mount(legacy);
    const restored = ui.saved();
    assert.equal(restored.version, fixture.version);
    assert.equal(restored.education.status, 'workforce');
    for (const key of ['id', 'name', 'age', 'rng', 'jobId', 'jobYears', 'money', 'lifestyle']) {
      assert.equal(restored[key], fixture[key], `${key} must survive the education migration`);
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
    const selected = structuredClone(elder.children[1]);
    const sibling = structuredClone(elder.children[0]);
    const info = successionInfo(elder);
    const ui = await mount(elder);
    ui.click('[data-action="tab"][data-tab="family"]');
    assert.equal(ui.all('[data-action="heir"]').length, 2);
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

    for (const tab of ['year', 'career', 'family', 'character']) {
      ui.click(`[data-action="tab"][data-tab="${tab}"]`);
      assertNoMoneyDisplay(ui.query('#app'), `${tab} view`);
      assert.match(ui.query('.status-strip').textContent, /Lifestyle[\s\S]{0,30}5\s*\/\s*10/i, `${tab} view should show lifestyle on its 1–10 scale`);
    }

    ui.click('[data-action="tab"][data-tab="family"]');
    ui.click('[data-action="heir"]');
    assertNoMoneyDisplay(ui.query('.modal'), 'heir confirmation');
    assert.match(ui.query('.modal-body').textContent, /equal share/i);
    ui.click('[data-action="confirm-heir"]');
    assert.equal(ui.saved().generation, 2);
    assertNoMoneyDisplay(ui.query('#app'), 'next generation');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'succession journal');
    assert.match(ui.query('.status-strip').textContent, /Lifestyle\s*(?:10|[1-9])\s*\/\s*10/i);
    ui.click('[data-action="history"]');
    assertNoMoneyDisplay(ui.query('.journal-list'), 'complete family journal');
  });

  test('a saved life reloads and the same import can be retried after cancelling restore', async () => {
    const fixture = ageTo(createGame({ name: 'Taylor Brooks', seed: 99 }), 29);
    fixture.focus = { work: 5, social: 2, family: 2, self: 3 };
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

test('Year shows Dad and Mom bars that respond to crying without rerolling the year', async () => {
  const fixture = createGame({ seed: 121 });
  fixture.parents.forEach(parent => { parent.stats.stability = 7; parent.relationship = 7; });
  const ui = await mount(fixture);
  assert.deepEqual(ui.all('.parent-status h4').map(heading => heading.textContent), ['Dad:', 'Mom:']);
  assert.equal(ui.all('.parent-status [role="meter"]').length, 4);
  assert.doesNotMatch(ui.query('.focus-panel').textContent, /See your parents|Ask for attention/);
  for (const parent of fixture.parents) {
    const row = ui.query(`[data-parent-id="${parent.id}"]`);
    for (const key of ['stability', 'relationship']) {
      assert.equal(row.querySelector(`[data-stat="${key}"] [role="meter"]`).getAttribute('aria-valuenow'), '7');
      assert.ok(row.querySelector(`[data-stat="${key}"] .stat-projection.increase`));
    }
  }
  const lowRelationshipWidth = parseFloat(ui.query('.parent-status [data-stat="relationship"] .stat-projection').style.width);
  ui.click('[data-action="baby"][data-level="5"]');
  for (const row of ui.all('.parent-status')) {
    assert.ok(row.querySelector('[data-stat="stability"] .stat-projection.decrease'));
    assert.ok(parseFloat(row.querySelector('[data-stat="relationship"] .stat-projection.increase').style.width) > lowRelationshipWidth);
    assert.doesNotMatch(row.textContent, /[+−-]\d|→/);
  }
  const saved = ui.saved();
  assert.equal(saved.rng, fixture.rng);
  assert.equal(saved.age, 0);
  assert.deepEqual(saved.parents, fixture.parents);
  assert.equal(saved.cryLevel, 5);
});

test('Year parent bars preserve remembered parents and handle a missing parent', async () => {
  const fixture = ageTo(createGame({ seed: 121 }), 8);
  fixture.parents[0].alive = false;
  fixture.parents[0].death = { cause: 'disease', age: fixture.parents[0].age };
  let ui = await mount(fixture);
  const remembered = ui.query(`[data-parent-id="${fixture.parents[0].id}"]`);
  assert.match(remembered.textContent, /Mom:.*Deceased/);
  assert.equal(remembered.querySelectorAll('.stat-projection').length, 0);
  assert.equal(remembered.querySelectorAll('[role="meter"]').length, 2);
  assert.deepEqual(ui.saved(), fixture);
  fixture.parents = fixture.parents.slice(0,1);
  ui = await mount(fixture);
  assert.equal(ui.all('.parent-status').length, 1);
  assert.equal(ui.query('.parent-status h4').textContent, 'Mom:');
  fixture.parents = [];
  ui = await mount(fixture);
  assert.equal(ui.all('.parent-status-list').length, 0);
  const pending = pendingFixture();
  ui = await mount(pending);
  assert.equal(ui.all('.parent-status').length, pending.parents.length);
  assert.equal(ui.all('.parent-status .stat-projection').length, 0);
  assert.deepEqual(ui.saved(), pending, 'pending choices do not acquire a routine forecast');
});
