// Gives every served module a new ?v= cache token so browsers fetch the new
// release instead of a cached copy. Run once per release that changes any
// JavaScript, CSS or HTML file:
//
//   node scripts/set-cache-token.mjs <new-token>       e.g. shorter-school-day
//
// The current token is read from the app.js entry in index.html and replaced
// in index.html and every root module. scripts/verify-assets.mjs then confirms
// that no reference was missed.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const next = process.argv[2] ?? '';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(next)) {
  console.error('Usage: node scripts/set-cache-token.mjs <new-token>   (lowercase letters, digits and hyphens)');
  process.exit(1);
}
const current = /app\.js\?v=([\w-]+)/.exec(readFileSync(new URL('index.html', root), 'utf8'))?.[1];
if (!current) throw new Error('index.html does not load app.js with a ?v= cache token.');
if (current === next) { console.log(`The cache token is already ${next}.`); process.exit(0); }

let files = 0, references = 0;
for (const name of readdirSync(root)) {
  if (!/\.(?:js|html)$/.test(name)) continue;
  const text = readFileSync(new URL(name, root), 'utf8');
  const count = text.split(`?v=${current}`).length - 1;
  if (!count) continue;
  writeFileSync(new URL(name, root), text.replaceAll(`?v=${current}`, `?v=${next}`));
  files++; references += count;
}
console.log(`Cache token ${current} -> ${next}: ${references} references in ${files} files.`);
