// Read-only explanations for an event already selected by the ordinary rolls.
// Capture these before the routine/outcomes; never infer old causes on reload.
const labels = {
  health: 'Health', stability: 'Mental stability', attractiveness: 'Attractiveness',
  intelligence: 'Intelligence', strength: 'Strength', social: 'Social',
  creativity: 'Creativity', lifestyle: 'Lifestyle', relationship: 'Relationship with you',
};

// Shorten the known saved explanation for display without rewriting history
// or losing which person's stat contributed. Leave custom prose intact.
export function formatEventCause(cause, event) {
  const marker = ' contributed to this event (start-of-year ratings).';
  const at = typeof cause === 'string' ? cause.indexOf(marker) : -1;
  if (at < 0) return cause || '';
  const original = cause.slice(0, at);
  // Old saves may contain a factor removed by a later causality correction.
  // Omit that obsolete explanation; never guess a replacement historical rating.
  if (event) {
    const supported = new Set((event.statFactors || []).map(([key, direction]) => `${direction}:${labels[key]}`));
    if (event.relationshipFactor) supported.add(`${event.relationshipFactor}:${labels.relationship}`);
    for (const key of Object.keys(event.maxStats || {})) supported.add(`low:${labels[key]}`);
    if (event.minStability !== undefined) supported.add(`high:${labels.stability}`);
    if (event.maxStability !== undefined) supported.add(`low:${labels.stability}`);
    if (event.id === 'household_parent_abandonment') {
      supported.add(`low:${labels.stability}`); supported.add(`low:${labels.relationship}`);
    }
    const captured = [...original.matchAll(/\b(low|high) (Health|Mental stability|Attractiveness|Intelligence|Strength|Social|Creativity|Lifestyle|Relationship with you) \(-?\d+(?:\.\d+)?\/10\)/g)];
    if (captured.some(([, direction, stat]) => !supported.has(`${direction}:${stat}`))) return cause.slice(at + marker.length).trim();
  }
  let subject = original.replace(/\b(low|high) (Health|Mental stability|Attractiveness|Intelligence|Strength|Social|Creativity|Lifestyle|Relationship with you) \(-?\d+(?:\.\d+)?\/10\)/g,
    (_, direction, stat) => `${direction} ${stat.toLowerCase()}`);
  if (subject === original) return cause;
  subject = subject.replace(/^Your (low|high) /, (_, direction) => `${direction[0].toUpperCase()}${direction.slice(1)} `);
  return `${subject} contributed to this event.${cause.slice(at + marker.length)}`;
}

export function eventStatCause(event, person, stats = person?.stats, householdLifestyle) {
  if (!event || !person) return '';
  const valueFor = key => key === 'lifestyle' ? event.subjectType ? householdLifestyle : person.lifestyle
    : key === 'relationship' ? person.relationship : stats?.[key];
  const factors = [...(event.statFactors || [])];
  if (event.relationshipFactor) factors.push(['relationship', event.relationshipFactor]);
  for (const [key, maximum] of Object.entries(event.maxStats || {})) {
    if (valueFor(key) <= maximum) factors.push([key, 'low']);
  }
  if (stats?.stability >= event.minStability) factors.push(['stability', 'high']);
  if (stats?.stability <= event.maxStability) factors.push(['stability', 'low']);
  // Abandonment has a small unconditional floor. Either factor at 10 removes
  // the entire stat-dependent part, so neither stat explains a floor-only roll.
  if (event.id === 'household_parent_abandonment' && Number.isFinite(stats?.stability)
      && Number.isFinite(person.relationship) && stats.stability < 10 && person.relationship < 10) {
    factors.push(['stability', 'low'], ['relationship', 'low']);
  }
  const seen = new Set(), causes = [];
  for (const [key, direction] of factors) {
    const value = valueFor(key);
    if (!labels[key] || !Number.isFinite(value) || seen.has(key)) continue;
    // Avoid labelling a displayed 5.0 as high/low. Only factors pointing in
    // the same direction as the starting rating are useful explanations.
    const displayed = Number(value.toFixed(1));
    if (!(direction === 'low' && displayed < 5 || direction === 'high' && displayed > 5)) continue;
    seen.add(key);
    causes.push({ key, text: `${direction} ${labels[key]} (${value.toFixed(1)}/10)` });
  }
  if (!causes.length) return '';
  const owner = event.subjectType ? `${person.name || 'Your family member'}'s` : 'Your';
  const personal = causes.filter(cause => !event.subjectType || cause.key !== 'lifestyle');
  const household = causes.filter(cause => event.subjectType && cause.key === 'lifestyle');
  const subjects = [];
  if (personal.length) subjects.push(`${owner} ${personal.map(cause => cause.text).join(' and ')}`);
  if (household.length) subjects.push(`${personal.length ? 'your' : 'Your'} household's ${household.map(cause => cause.text).join(' and ')}`);
  return `${subjects.join(' and ')} contributed to this event (start-of-year ratings).`;
}
