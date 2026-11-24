// Live events organized by cause and effect (record 042).
//   node scripts/event-matrix.mjs            cause x effect counts
//   node scripts/event-matrix.mjs --list     every live event under its cause, with its effects
// Causes: a stat and direction ("low health"), relationship, grades, or random.
// Effects: the stats an event (or any of its choices) can raise or lower.
import { EVENTS } from '../engine.js';
import { eventClass, eventHasConsequence } from '../event-rates.js';

const STATS = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity', 'health', 'stability', 'lifestyle', 'relationship'];
const causes = event => {
  const list = (event.statFactors || []).map(([key, direction]) => `${direction} ${key}`);
  if (event.relationshipFactor) list.push(`${event.relationshipFactor} relationship`);
  for (const key of Object.keys(event.maxStats || {})) list.push(`low ${key}`);
  if (event.minStability !== undefined) list.push('high stability');
  if (event.maxStability !== undefined) list.push('low stability');
  return [...new Set(list.length ? list : [eventClass(event) === 'stat' ? 'grades' : eventClass(event)])];
};
const effects = event => {
  const result = {};
  for (const outcome of event.choices?.length ? event.choices : [event]) {
    const add = (key, amount) => { if (amount) (result[key] ??= new Set()).add(amount > 0 ? '+' : '-'); };
    for (const field of ['statChanges', 'playerChanges', 'modifiers']) for (const [key, amount] of Object.entries(outcome[field] || {})) add(key, amount);
    for (const [key, amount] of Object.entries(outcome.subjectChanges || {})) add(key, amount);
    add('relationship', outcome.relationship);
    add('lifestyle', outcome.years > 0 ? outcome.householdLifestyle : 0);
  }
  return result;
};
const live = EVENTS.filter(event => !event.scheduled && eventHasConsequence(event) && event.baseChance > 0);
const table = new Map();
for (const event of live) for (const cause of causes(event)) {
  const row = table.get(cause) || { events: [], counts: {} };
  row.events.push(event);
  for (const [stat, signs] of Object.entries(effects(event))) for (const sign of signs) row.counts[`${sign}${stat}`] = (row.counts[`${sign}${stat}`] || 0) + 1;
  table.set(cause, row);
}
const order = [...table.keys()].sort();
if (process.argv.includes('--list')) {
  for (const cause of order) {
    console.log(`\n## ${cause} (${table.get(cause).events.length})`);
    for (const event of table.get(cause).events) console.log(`- ${event.id}${event.subjectType ? ` [${event.subjectType}]` : ''}: ${Object.entries(effects(event)).map(([stat, signs]) => `${[...signs].join('')}${stat}`).join(', ')}`);
  }
} else {
  console.log(['cause', 'events', ...STATS.map(stat => `+/-${stat.slice(0, 5)}`)].join('\t'));
  for (const cause of order) {
    const { events, counts } = table.get(cause);
    console.log([cause, events.length, ...STATS.map(stat => `${counts[`+${stat}`] || 0}/${counts[`-${stat}`] || 0}`)].join('\t'));
  }
  const totals = STATS.map(stat => live.filter(event => effects(event)[stat]).length);
  console.log(['any', live.length, ...totals].join('\t'));
}
