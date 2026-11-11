// Read-only explanations for an event already selected by the ordinary rolls.
// Capture these before the routine/outcomes; never infer old causes on reload.
const labels = {
  health: 'Health', stability: 'Mental stability', attractiveness: 'Attractiveness',
  intelligence: 'Intelligence', strength: 'Strength', social: 'Social',
  creativity: 'Creativity', lifestyle: 'Lifestyle', relationship: 'Relationship with you',
};

export function eventStatCause(event, person, stats = person?.stats) {
  if (!event || !person) return '';
  const valueFor = key => key === 'lifestyle' ? person.lifestyle
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
    causes.push(`${direction} ${labels[key]} (${value.toFixed(1)}/10)`);
  }
  if (!causes.length) return '';
  const owner = event.subjectType ? `${person.name || 'Your family member'}'s` : 'Your';
  return `${owner} ${causes.join(' and ')} contributed to this event (start-of-year ratings).`;
}
