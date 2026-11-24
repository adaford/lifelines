// Checks every file the game loads, starting from index.html and following
// each relative script, stylesheet and import it references.
//
//   node scripts/verify-assets.mjs
//       Serves the working tree on a temporary local port. Every asset must
//       return 200 and match the file on disk byte-for-byte.
//
//   node scripts/verify-assets.mjs --live [commit]
//       Fetches the published site. Every asset must match the blob Git stores
//       for that commit (default HEAD). Confirm the GitHub Pages build for the
//       commit first: gh api repos/adaford/lifelines/pages/builds/latest
//
// In both modes every JavaScript and CSS reference must carry the same
// ?v= cache token as the app.js entry in index.html.
// Options: --site <url> (live site root), --report <file> (write a JSON report).
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const option = name => { const at = args.indexOf(name); return at === -1 ? null : args[at + 1]; };
const live = args.includes('--live');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...parameters) => execFileSync('git', ['-C', root, ...parameters], { windowsHide: true, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });

function references(text, path) {
  if (path.endsWith('.html')) return [...text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(match => match[1].replaceAll('&amp;', '&'));
  if (/\.m?js$/.test(path)) return [...text.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(match => match[1]);
  if (path.endsWith('.css')) return [...text.matchAll(/(?:@import\s+["']([^"']+)["']|url\(\s*["']?([^"')\s]+)["']?\s*\))/gi)].map(match => match[1] || match[2]);
  return [];
}

// Crawls the site at `base`. `expected(path)` returns the bytes each asset must have.
async function crawl(base, expected, request = url => url) {
  const indexUrl = new URL('index.html', base);
  const token = /app\.js\?v=([\w-]+)/.exec((await expected('index.html')).toString())?.[1];
  assert.ok(token, 'index.html must load app.js with a ?v= cache token');
  const pending = [indexUrl], seen = new Set(), assets = [];
  while (pending.length) {
    const url = pending.shift();
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    const path = decodeURIComponent(url.pathname.slice(base.pathname.length));
    assert.ok(path && !path.split('/').includes('..'), `Invalid asset path: ${url.href}`);
    if (/\.(?:m?js|css)$/.test(path)) assert.deepEqual(url.searchParams.getAll('v'), [token], `${path} is referenced without the current cache token ${token}`);
    const want = await expected(path);
    const response = await fetch(request(url), { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' } });
    assert.equal(response.status, 200, `${url.href}: HTTP ${response.status}`);
    const got = Buffer.from(await response.arrayBuffer());
    assert.ok(got.equals(want), `${path}: served bytes differ (expected ${want.length} bytes, SHA-256 ${sha256(want)}; received ${got.length} bytes, SHA-256 ${sha256(got)})`);
    assets.push({ path, bytes: got.length, sha256: sha256(got) });
    for (const reference of references(got.toString('utf8'), path)) {
      // Follow relative references to served assets only; ordinary strings that merely look like imports are skipped.
      if (!reference || /^[a-z][a-z\d+.-]*:|^\/|^#/i.test(reference)) continue;
      if (/\.m?js$/.test(path) && !/^\.{1,2}\//.test(reference)) continue;
      const next = new URL(reference, url);
      next.hash = '';
      if (!/\.(?:m?js|css|svg|ico|png|webp|jpe?g)$/i.test(next.pathname)) continue;
      assert.ok(next.origin === base.origin && next.pathname.startsWith(base.pathname), `${path} references a file outside the site: ${reference}`);
      pending.push(next);
    }
  }
  return { token, assets: assets.sort((left, right) => left.path.localeCompare(right.path)) };
}

async function verifyLocal() {
  const port = await new Promise((done, fail) => {
    const probe = createServer().once('error', fail);
    probe.listen(0, '127.0.0.1', () => { const { port: free } = probe.address(); probe.close(() => done(free)); });
  });
  const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((ready, fail) => {
      const timeout = setTimeout(() => fail(new Error('The local server did not start within 10 seconds.')), 10000);
      server.stdout.once('data', () => { clearTimeout(timeout); ready(); });
      server.once('error', error => { clearTimeout(timeout); fail(error); });
      server.once('exit', code => { clearTimeout(timeout); fail(new Error(`The local server exited early (code ${code}).`)); });
    });
    const base = new URL(`http://127.0.0.1:${port}/`);
    const result = await crawl(base, path => readFile(resolve(root, path)));
    console.log(`PASS: ${result.assets.length} local HTTP assets match source; all JavaScript/CSS cache tokens are ${result.token}.`);
    return { mode: 'local', url: base.href, ...result };
  } finally {
    server.removeAllListeners('exit');
    server.kill();
    await new Promise(stopped => { if (server.exitCode !== null || server.signalCode) stopped(); else server.once('exit', stopped); });
    console.log('Temporary server stopped.');
  }
}

async function verifyLive() {
  const named = args[args.indexOf('--live') + 1];
  const commit = git('rev-parse', '--verify', `${named && !named.startsWith('--') ? named : 'HEAD'}^{commit}`).toString().trim();
  const base = new URL(option('--site') ?? 'https://adaford.github.io/lifelines/');
  // The extra query parameter only defeats CDN caching; it is not part of the asset's identity.
  const result = await crawl(base, async path => git('show', `${commit}:${path}`),
    url => { const fresh = new URL(url); fresh.searchParams.append('verify_commit', commit); return fresh; });
  console.log(`PASS: ${result.assets.length} live assets at ${base.href} match commit ${commit}; all JavaScript/CSS cache tokens are ${result.token}.`);
  return { mode: 'live', url: base.href, commit, ...result };
}

try {
  const result = await (live ? verifyLive() : verifyLocal());
  const report = option('--report');
  if (report) {
    await mkdir(dirname(resolve(report)), { recursive: true });
    await writeFile(resolve(report), `${JSON.stringify({ verifiedAt: new Date().toISOString(), status: 'passed', ...result }, null, 2)}\n`);
    console.log(`Report: ${report}`);
  }
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
