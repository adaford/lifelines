const genderRole = (person, female, male, neutral) => person.gender === 'female' ? female : person.gender === 'male' ? male : neutral;
const parentRole = person => ({ mom: 'Mom', mother: 'Mom', dad: 'Dad', father: 'Dad', parent: 'Parent' }[String(person.parentRole || '').toLowerCase()] || genderRole(person, 'Mom', 'Dad', 'Parent'));
const guardianRole = person => ({ aunt: 'Aunt', uncle: 'Uncle' }[person.guardianRole] || 'Relative');
const siblingRole = person => genderRole(person, 'Sister', 'Brother', 'Sibling');
const childRole = person => genderRole(person, 'Daughter', 'Son', 'Child');
const partnerRole = person => person.married ? genderRole(person, 'Wife', 'Husband', 'Partner') : genderRole(person, 'Girlfriend', 'Boyfriend', 'Partner');
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const roles = ['You', 'Mom', 'Dad', 'Parent', 'Aunt', 'Uncle', 'Relative', 'Sister', 'Brother', 'Sibling', 'Daughter', 'Son', 'Child', 'Wife', 'Husband', 'Partner', 'Spouse', 'Girlfriend', 'Boyfriend', 'Acquaintance', 'Co-parent', 'Grandmother', 'Grandfather', 'Grandparent', 'Ancestor', 'Benefactor', 'Predecessor'];

function ancestorDistances(state, people) {
  const parentsByChild = new Map();
  const addParent = (child, parent) => {
    if (!child || !parent || child === parent) return;
    if (!parentsByChild.has(child)) parentsByChild.set(child, new Set());
    parentsByChild.get(child).add(parent);
  };
  for (const parent of state.parents || []) addParent(state.id, parent.id);
  for (const person of people) {
    for (const parentId of person.parentIds || []) addParent(person.id, parentId);
    for (const child of person.children || []) addParent(child.id, person.id);
  }
  const distances = new Map([[state.id, 0]]);
  const queue = [state.id];
  for (let index = 0; index < queue.length; index++) {
    const child = queue[index];
    for (const parent of parentsByChild.get(child) || []) {
      if (distances.has(parent)) continue;
      distances.set(parent, distances.get(child) + 1);
      queue.push(parent);
    }
  }
  return distances;
}

// Render-time labels follow the current player, including in older journal
// entries. This returns plain text; callers still escape it before adding HTML.
export function annotateNarrative(text, state) {
  const source = String(text ?? '');
  if (!source || !state) return source;
  const lineage = state.lineage || [];
  const people = [state, ...(state.parents || []), state.guardian, ...(state.siblings || []), ...(state.children || []), state.partner, ...(state.encounters || []), state.pregnancy?.otherParent, ...lineage].filter(Boolean);
  const distances = ancestorDistances(state, people);
  const identities = new Map();
  const names = new Map();
  const add = (person, role) => {
    if (!person || typeof person.name !== 'string' || !person.name.trim()) return;
    const identity = person.id || person;
    // Current family roles take precedence over historical copies of a person.
    if (!identities.has(identity)) identities.set(identity, role);
    const name = person.name.trim();
    if (!names.has(name)) names.set(name, new Set());
    names.get(name).add(identity);
  };
  add(state, 'You');
  for (const person of state.parents || []) add(person, parentRole(person));
  if (state.guardian) add(state.guardian, guardianRole(state.guardian));
  for (const person of state.siblings || []) add(person, siblingRole(person));
  for (const person of state.children || []) add(person, childRole(person));
  if (state.partner) add(state.partner, partnerRole(state.partner));
  if (state.pregnancy?.otherParent) add(state.pregnancy.otherParent, 'Co-parent');
  for (const person of state.encounters || []) add(person, 'Acquaintance');
  for (const person of lineage) {
    const distance = distances.get(person.id);
    const role = distance === 1 ? parentRole(person)
      : distance === 2 ? genderRole(person, 'Grandmother', 'Grandfather', 'Grandparent')
      : distance > 2 ? 'Ancestor'
      : person.successor?.id === state.id && person.successor.route === 'siblings' ? siblingRole(person)
      : person.successor?.id === state.id && person.successor.route === 'beneficiary' ? 'Benefactor'
      : 'Predecessor';
    add(person, role);
  }
  if (!names.size) return source;
  const nameRoles = new Map([...names].map(([name, ids]) => {
    const labels = new Set([...ids].map(id => identities.get(id)));
    return [name, labels.size === 1 ? [...labels][0] : null];
  }));
  // Include ambiguous names in the alternation so a shorter known name cannot
  // label just part of one. Apostrophes may introduce a possessive, not a name.
  const namePattern = [...names.keys()].sort((a, b) => b.length - a.length).map(escapePattern).join('|');
  const boundary = '[\\p{L}\\p{M}\\p{N}_-]';
  const pattern = new RegExp(`(?<!${boundary})(?<![\\p{L}\\p{M}]['’])(${namePattern})(?!${boundary}|['’](?!s(?:$|[^\\p{L}\\p{M}\\p{N}_]))[\\p{L}\\p{M}])(?:[ \\t]*\\((?:${roles.join('|')})\\))?`, 'gu');
  return source.replace(pattern, (match, name) => {
    const role = nameRoles.get(name);
    return role ? `${name} (${role})` : match;
  });
}
