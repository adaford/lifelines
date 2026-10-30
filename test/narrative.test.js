import test from 'node:test';
import assert from 'node:assert/strict';
import { annotateNarrative } from '../narrative.js';

const person = (id, name, gender = 'nonbinary', extra = {}) => ({ id, name, gender, ...extra });
const family = extra => ({ ...person('self', 'Jamie Ford'), parents: [], siblings: [], children: [], encounters: [], lineage: [], partner: null, pregnancy: null, ...extra });

test('names in prose receive current family roles without changing generic family terms', () => {
  const state = family({
    parents: [person('mom', 'Olivia Ford', 'female'), person('dad', 'Noah Ford', 'male'), person('parent', 'Robin Ford')],
    siblings: [person('brother', 'Henry Ford', 'male'), person('sister', 'Lily Ford', 'female'), person('sibling', 'River Ford')],
    children: [person('son', 'Milo Ford', 'male'), person('daughter', 'Iris Ford', 'female'), person('child', 'Sky Ford')],
  });
  const input = 'Jamie Ford met Olivia Ford, Noah Ford, Robin Ford, Henry Ford, Lily Ford, River Ford, Milo Ford, Iris Ford and Sky Ford. Your parents smiled.';
  assert.equal(annotateNarrative(input, state), 'Jamie Ford (You) met Olivia Ford (Mom), Noah Ford (Dad), Robin Ford (Parent), Henry Ford (Brother), Lily Ford (Sister), River Ford (Sibling), Milo Ford (Son), Iris Ford (Daughter) and Sky Ford (Child). Your parents smiled.');
});

test('explicit parent roles override gender and missing gender uses neutral roles', () => {
  const state = family({ parents: [person('a', 'Alex Ford', 'male', { parentRole: 'mom' }), { id: 'b', name: 'Casey Ford' }] });
  assert.equal(annotateNarrative('Alex Ford and Casey Ford.', state), 'Alex Ford (Mom) and Casey Ford (Parent).');
});

test('adoption labels the relative while retaining biological parent roles', () => {
  const state = family({
    parents: [person('mom', 'Olivia Ford', 'female', { abandonedAt: 2 }), person('dad', 'Noah Ford', 'male', { abandonedAt: 3 })],
    guardian: person('guardian', 'Anna Ford', 'female', { guardianRole: 'aunt', adoptedAt: 3 }),
  });
  const source = 'Olivia Ford left. Noah Ford left. Anna Ford adopted you.';
  const expected = 'Olivia Ford (Mom) left. Noah Ford (Dad) left. Anna Ford (Aunt) adopted you.';
  assert.equal(annotateNarrative(source, state), expected);
  assert.equal(annotateNarrative(expected, state), expected, 'labels are idempotent');
  state.guardian.guardianRole = 'uncle';
  assert.equal(annotateNarrative('Anna Ford', state), 'Anna Ford (Uncle)');
});

test('partner roles reflect gender and marriage; encounters stay acquaintances', () => {
  for (const [gender, married, role] of [
    ['female', false, 'Girlfriend'], ['male', false, 'Boyfriend'], ['nonbinary', false, 'Partner'],
    ['female', true, 'Wife'], ['male', true, 'Husband'], ['nonbinary', true, 'Partner'],
  ]) {
    const state = family({ partner: person('partner', 'Alex Vale', gender, { married }), encounters: [person('new', 'Lee Stone')] });
    assert.equal(annotateNarrative('Alex Vale called Lee Stone.', state), `Alex Vale (${role}) called Lee Stone (Acquaintance).`);
  }
});

test('pregnancy uses a known partner role or identifies the other parent', () => {
  const partner = person('partner', 'Alex Vale', 'female', { married: true });
  const state = family({ partner, pregnancy: { otherParent: { ...partner } }, encounters: [{ ...partner }] });
  assert.equal(annotateNarrative('Alex Vale is expecting.', state), 'Alex Vale (Wife) is expecting.');
  state.partner = null;
  assert.equal(annotateNarrative('Alex Vale is expecting.', state), 'Alex Vale (Co-parent) is expecting.');
});

test('literal names are safe with regex characters, apostrophes, Unicode and HTML text', () => {
  const state = family({ parents: [person('mom', "Ana O’Neil", 'female'), person('dad', 'A. [Lee]+', 'male')], children: [person('child', '<Max & Jo>')] });
  assert.equal(annotateNarrative("Ana O’Neil thanked A. [Lee]+. <Max & Jo> saw Ana O’Neil's gift.", state), "Ana O’Neil (Mom) thanked A. [Lee]+ (Dad). <Max & Jo> (Child) saw Ana O’Neil (Mom)'s gift.");
  assert.equal(annotateNarrative('Axx Lee and Ana O’Neill.', state), 'Axx Lee and Ana O’Neill.');
});

test('whole names match longest first without partial word or hyphenated-name matches', () => {
  const state = family({ parents: [person('a', 'Ann', 'female'), person('b', 'Ann Lee', 'male')], siblings: [person('c', 'Ann Lee Ford', 'female')] });
  assert.equal(annotateNarrative('Ann Lee Ford saw Ann Lee and Ann. Anna, Ann-Marie, LéAnn and Ann_2 stayed.', state), 'Ann Lee Ford (Sister) saw Ann Lee (Dad) and Ann (Mom). Anna, Ann-Marie, LéAnn and Ann_2 stayed.');
  assert.equal(annotateNarrative("O’Ann and Ann’O. ‘Ann’ kept Ann’s gift.", state), "O’Ann and Ann’O. ‘Ann (Mom)’ kept Ann (Mom)’s gift.");
});

test('every repeated mention is labeled and repeated rendering is idempotent', () => {
  const state = family({ parents: [person('mom', 'Olivia Ford', 'female')] });
  const first = annotateNarrative('Olivia Ford met Olivia Ford. Olivia Ford (Mom) smiled.', state);
  assert.equal(first, 'Olivia Ford (Mom) met Olivia Ford (Mom). Olivia Ford (Mom) smiled.');
  assert.equal(annotateNarrative(first, state), first);
  assert.equal(annotateNarrative('Olivia Ford (tired) rested.', state), 'Olivia Ford (Mom) (tired) rested.');
});

test('ambiguous identical names do not acquire an incorrect role or shorter partial label', () => {
  const state = family({ parents: [person('mom', 'Alex Vale', 'female'), person('dad', 'Alex Vale', 'male')], siblings: [person('sibling', 'Alex', 'male')] });
  assert.equal(annotateNarrative('Alex Vale called Alex.', state), 'Alex Vale called Alex (Brother).');
  state.parents[1].gender = 'female';
  assert.equal(annotateNarrative('Alex Vale called.', state), 'Alex Vale (Mom) called.');
});

test('succession updates existing labels and resolves historical copies to current roles', () => {
  const previous = person('previous', 'Jordan Ford', 'male');
  const heir = person('heir', 'Iris Ford', 'female');
  const first = family({ ...previous, children: [heir] });
  const text = annotateNarrative('Jordan Ford helped Iris Ford.', first);
  assert.equal(text, 'Jordan Ford (You) helped Iris Ford (Daughter).');
  const next = family({ ...heir, parents: [{ ...previous }], lineage: [{ ...previous, children: [{ id: heir.id }], successor: { id: heir.id, route: 'children' } }] });
  assert.equal(annotateNarrative(text, next), 'Jordan Ford (Dad) helped Iris Ford (You).');
});

test('lineage labels only claim family relationships supported by saved links', () => {
  const state = family({ parents: [person('dad', 'Noah Ford', 'male')], lineage: [
    person('grandma', 'June Ford', 'female', { children: [{ id: 'dad' }] }),
    person('older', 'Ada Ford', 'female', { children: [{ id: 'grandma' }] }),
    person('sibling', 'Lily Ford', 'female', { successor: { id: 'self', route: 'siblings' } }),
    person('benefactor', 'Lee Vale', 'male', { successor: { id: 'self', route: 'beneficiary' } }),
    person('unrelated', 'Eden Stone', 'female'),
  ] });
  assert.equal(annotateNarrative('June Ford, Ada Ford, Lily Ford, Lee Vale and Eden Stone.', state), 'June Ford (Grandmother), Ada Ford (Ancestor), Lily Ford (Sister), Lee Vale (Benefactor) and Eden Stone (Predecessor).');
});

test('current roles cover historical name aliases and annotations never mutate state or RNG', () => {
  const state = family({ rng: 12345, parents: [person('mom', 'Olivia Ford', 'female')], lineage: [person('mom', 'Olivia Vale', 'female')] });
  const before = structuredClone(state);
  assert.equal(annotateNarrative('Olivia Vale visited Olivia Ford.', state), 'Olivia Vale (Mom) visited Olivia Ford (Mom).');
  assert.deepEqual(state, before);
  assert.equal(annotateNarrative('Nobody known.', {}), 'Nobody known.');
  assert.equal(annotateNarrative('', state), '');
  assert.equal(annotateNarrative(null, state), '');
});
