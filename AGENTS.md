# Lifelines

Lifelines is a phone-first, generational life simulator. Read `HANDOFF.md` for the project and cloud setup status, and `README.md` for the current gameplay rules, save migrations, and deployment details before changing behavior.

## Setup and validation

- Use Node.js 24 (see `.nvmrc`). Run `npm ci` to install test dependencies.
- Run `npm test` for simulation and DOM integration checks after code changes.
- Run `npm start` for an HTTP preview on port 4173. Use a browser for visual checks when available, especially at phone widths; report any visual checks that could not be completed.
- This is a static HTML/CSS/JavaScript ES-module app with no production build step or runtime dependencies. Do not open the app through `file://`.

## Source map

- `engine.js`: simulation, progression, education, career offers, saves, and succession.
- `jobs.js`, `events.js`, `family-events.js`, `relationships.js`: careers, event catalogs, and family/relationship rules.
- `growth.js`, `mortality.js`: sourced age/height references and stochastic growth/mortality rules.
- `app.js`: UI actions, browser persistence, and save import/export.
- `styles.css`, `index.html`, `favicon.svg`: phone layout, static entry point, and branding.
- `test/`: simulation and DOM integration tests; `server.mjs`: development server.

## Preserve the game's intent

- Keep the phone layout, bottom navigation, accessible touch targets, and safe-area spacing.
- Use lifestyle 1-10 as the only player-facing financial number; do not add salary, income, spending, savings, or inheritance amounts to the UI.
- Label the wellbeing stat **mental stability**, 1-10 with higher better; preserve its internal `stability` save key. Discipline and relaxation are not traits.
- Babies and adults share the same stat set. Four trainable skills start low with permanent -3 to +3 affinities; attractiveness starts near its mature inherited value and has no ordinary positive growth. Its requested decline begins after 30 for men and 22 for women. Child lifestyle follows the parent household.
- Keep Mom/Dad roles, random initial parent bonds centered near 8, gender beside the name, and stronger parent mental-stability costs for intense crying. Preserve existing identities and bonds on migration.
- Height follows sourced infant/childhood curves, varies between people and years, and reaches adult height between 14 and 18. Display approximate age-specific percentiles until maturity; keep growth reference separate from gender identity.
- Show expected routine changes as green/red segments inside stat bars, without numerical forecast deltas. Keep actual year-review numbers. Forecasts never consume RNG; actual annual development has seeded variation around the mean.
- Preserve one-year turns, focus-influenced development and event odds, age-appropriate choices, college/career progression, and generational family play unless the user requests a change.
- Keep identity, attraction, and pregnancy capability separate so future playable genders remain possible.
- Preserve existing saves and the `lifelines.save.v1` localStorage key. Add compatible migrations when the schema changes; do not reset or reroll existing progress. Pending decisions must survive reloads.
- Family surnames persist across genders and generations. Inheritance is divided equally among eligible living children; consult the existing retirement rules before altering succession.

## Releases from cloud tasks

The repository is `adaford/lifelines`. GitHub Pages serves the root of `main` using `.nojekyll`; pushes or merges to `main` automatically redeploy https://adaford.github.io/lifelines/.

For requested game changes, finish the implementation, run the relevant checks, and commit and publish to `main` when GitHub write access is available, unless the user requests a draft or another branch. Preserve unrelated work and never force-push. A cloud environment needs its own GitHub access; do not depend on another computer's credentials, files, or running processes.

If the environment can only produce a pull request, create it and clearly state that merging it into `main` is still required to deploy. Do not claim the game is published just because a task or commit is complete.

After publishing, verify that the GitHub Pages deployment succeeded for the intended commit (for example, with `gh api repos/adaford/lifelines/pages/builds/latest`) and check the live site when accessible. Report the live URL, validation performed, and any remaining deployment or access limitation. Keep credentials out of source files and logs.
