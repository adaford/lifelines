# Lifelines

Lifelines is a phone-first, generational life simulator played in the browser: one year per turn, from birth through school, work and family, until the story passes to an heir. It is a static HTML/CSS/ES-module app with no build step and no runtime dependencies. GitHub Pages serves the root of `main` at https://adaford.github.io/lifelines/, so a push to `main` publishes the game.

## Commands

Use Node 24 (`.nvmrc`). Run `npm ci` once per checkout; it installs linkedom, the only dependency, which the DOM tests need.

| Task | Command |
| --- | --- |
| All tests (about 800, a little over a minute) | `npm test` |
| One test file | `node --test test/<name>.test.js` |
| Local preview at http://127.0.0.1:4173 | `npm start` |
| Check every served asset and cache token | `node scripts/verify-assets.mjs` |
| Check the live site against a pushed commit | `node scripts/verify-assets.mjs --live [commit]` |
| Set a new cache token for a release | `node scripts/set-cache-token.mjs <token>` |
| Regenerate the percentile reference | `node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001` |
| Catalog audits (usage in each file's header) | `node scripts/audit-events.mjs`, `audit-careers.mjs`, `audit-event-copy.mjs` |

The game uses ES modules, so open it over HTTP, never through `file://`.

## Where things are

Every game module sits in the repository root, because Pages serves the root unchanged.

- **Core:** `engine.js` (the simulation: yearly advance, player actions, education and careers, family, succession, save migration), `save-schema.js` (save validation), `app.js` (rendering, action handlers, dialogs, browser storage, import/export), `index.html`, `styles.css`.
- **Development and focus:** `development.js`, `focus-rules.js`, `rating-changes.js`, and `choice-impacts.js` (pure previews of what a choice will do).
- **Life stages:** `school.js`, `college.js`, `college-sports.js`, `housing.js`, `jobs.js` with `career-profiles.js` and `career-rules.js`, `parent-careers.js`, `lifestyle.js`.
- **People:** `birth-conditions.js` (perks and affinity bounds), `genetics.js`, `relationships.js`, `growth.js`, `mortality.js`, `fame.js`.
- **Events:** `events.js` (personal), `family-events.js`, `life-events.js` with `life-event-bridges.js` (generated life-stage events and their stories), `cross-aptitude-events.js` (rare affinity events), `fame-events.js`, `event-rates.js`, `event-causes.js`.
- **Render-only history:** `event-copy-history.js`, `life-event-copy-history.js`, `life-event-bridges-history.js` hold frozen old wording so saved stories still display. They never feed the live catalog.
- **Display helpers:** `display.js`, `profile-view.js`, `narrative.js`.
- **Percentiles:** `percentiles.js` and the generated `percentile-reference.js` (never edit it by hand).
- **Tooling:** `scripts/`, `server.mjs` (development server), `test/` (Node's test runner; DOM tests run on linkedom).

## Rules for every change

These hold across the whole game.

- **Old saves keep working, exactly.** A player's life exists only in their browser (`localStorage` key `lifelines.save.v1`, schema version 20). Loading a save must not change any rating, affinity, focus allocation, effect, pending choice, history entry or RNG state, and must never reset or reroll progress. Add new state as optional, validated fields in `save-schema.js` with round-trip tests. Raise the schema number and extend `migrateSave` only when old data really has to be transformed. An invalid import must never overwrite a valid life.
- **IDs are permanent.** Saved histories and pending choices refer to event, choice, job and perk IDs, so keep every ID stable and keep retired definitions resolvable even when they can no longer occur.
- **Stored text is never rewritten.** When wording changes, translate the old text at render time (the render-only history modules) and leave what is saved alone.
- **Reads are pure.** Rendering, help, forecasts, previews, odds, percentiles, menus and reloads never change the save or consume gameplay RNG. Offers and dating prospects are generated once and saved, and previews such as the heir are deterministic, so nothing is rerolled when a menu opens.
- **The simulation is seeded and reproducible.** Keep the number and order of random draws in existing routines unless the change is about them; a zero contribution still takes its draw.
- **Ratings change only for a cause.** There is no passive drift, mean reversion or calibration offset (record 020). When a rule changes outcomes, accept the new outcomes; do not tune something else to cancel them.
- **The percentile reference follows the simulation.** If a change alters simulated results or RNG use, regenerate `percentile-reference.js` with the command above (fitting is disabled) and confirm a second run produces the identical file. If the simulation is untouched, the file must stay byte-identical.
- **Events have standing rules.** An event never changes the stat that caused it (032). Mental stability changes only for serious or sustained causes (029). Only events with a real consequence may occur (039). Rating changes from events are permanent; timed effects are reserved for focus restrictions and one-year household support (003, 016, 034). Stories are concrete incidents told in at most two short sentences (006, 041). Rolls are independent and share a five-event yearly maximum.
- **The interface is built for phones.** A single column with bottom navigation (Year, Career, Family), 44-pixel touch targets, 16-pixel input text and safe-area spacing. Lifestyle is the only financial number a player ever sees: no salary, income, savings or inheritance amounts. Ratings are stored to two decimals and shown to one. Explanations live in short `?` popups.
- **Game mechanics are fiction.** Perks, health, genetics and mortality are simplified game rules, not medical or statistical claims. Keep that framing in game copy and in the records.
- **The design is the owner's.** The rules in `docs/` are established preferences, not suggestions to redesign. Ask for a product decision only when a request does not settle the question.

## Finding and recording the detailed rules

This file is deliberately short. The detailed rules are in `docs/`:

- `docs/design-log/` has one numbered record per design change (001 is the oldest). `docs/design-log/README.md` groups the records by area and explains how they supersede one another.
- `docs/original-spec/` holds the rules as first written, before the log began: `agent-rules.md` (mainly the interface specification), `game-rules.md` and `handoff.md`. Parts of it have been superseded by later records.

Before changing behavior in an area, open `docs/design-log/README.md`, find the area, and read its records newest first. The tested code is what the game does; a newer record outranks an older one, and any record outranks the original spec. If the code and a record disagree, say so rather than quietly changing either. Numbers quoted inside records (test totals, event totals, schema versions, cache tokens) are snapshots from the day they were written.

After changing how the game behaves or looks, add one new record and list it in the index, as `docs/design-log/README.md` describes. That record is the whole write-up: do not copy it into this file or `README.md`.

## Validation

- `npm test` must finish with no failures. In this checkout it should also show no skipped tests; a skip means a frozen runtime is missing from `.baselines/`, which is expected only in a fresh clone or a cloud session.
- Run `node scripts/verify-assets.mjs` after changing any served file.
- The owner has asked to skip browser and visual checks unless they request them. Rely on the tests, the asset check and deployment verification, and say that visual checks were not done.
- Report results as they are: the test totals, anything skipped, and anything you could not verify.

## Releasing

A game change the owner asked for is finished only when it is live: validate it, commit it, push to `main`, and verify the deployment, unless they ask for a draft or another branch. The `release` skill (`.claude/skills/release/SKILL.md`) has the full procedure. In short: a new cache token when a served file changed, a design record, tests, the asset check, commit, push, confirm that GitHub Pages built that exact commit, check the live assets, and report the live URL. Other work, such as tooling, documentation or experiments, is committed or pushed only when the owner asks.

Never force-push, leave unrelated work intact, and keep credentials out of files and logs. Do not call a change published until the Pages build for that commit has succeeded. If this environment cannot push, say exactly what is missing; if it can only open a pull request, open one and say that merging it is still required.

## Local-only files

Git ignores these, and they are never published. File searches skip them as well, because `.claude/settings.json` makes Glob respect `.gitignore` the way Grep already does; list them with the shell when you need them.

- `.baselines/<name>/` holds frozen copies of the runtime taken before earlier changes. Compatibility tests import them to prove that old saves and catalogs still behave, and skip when one is absent. They are stale copies of the game, not the game: never edit them. To freeze the current commit before a risky change, run this with the Bash tool (a PowerShell pipe would corrupt the archive): `mkdir -p .baselines/<name> && git -c core.autocrlf=false archive HEAD | tar -x -C .baselines/<name>`. The folder name starts with a dot on purpose: Node's test runner does not look for tests inside dot-folders.
- `test-artifacts/` is scratch output such as test logs and audit reports. Nothing in the repository depends on it.
- `toDo.txt` is the owner's personal notes. Read it when asked; never commit or publish it.
