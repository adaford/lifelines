// Pure profile markup shared by player, family, partner and heir views.
import { escapeHTML as esc } from './display.js?v=short-events-toddler-order';

const genderLabel = person => ({ male: 'Male', female: 'Female', nonbinary: 'Nonbinary' }[person.gender] || 'Unspecified');
export const genderBadge = person => `<span class="gender-label" aria-label="Gender: ${genderLabel(person)}">${genderLabel(person)}</span>`;
export const parentLabel = person => ({ aunt: 'Aunt', uncle: 'Uncle', relative: 'Relative' }[person?.guardianRole] || { mom: 'Mom', mother: 'Mom', dad: 'Dad', father: 'Dad', parent: 'Parent' }[String(person?.parentRole || '').toLowerCase()] || (person?.gender==='female'?'Mom':person?.gender==='male'?'Dad':'Parent'));

export function avatar(person, small = false) {
  const shade = ['#e4ba99','#b37e60','#eecab0','#d09b77'][Math.abs([...person.name].reduce((v,c) => v+c.charCodeAt(0),0)) % 4];
  const baby = person.age < 2;
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
