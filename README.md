# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

## The first playable framework

- Begin at age 0 with randomized parents, inherited growth aptitudes, and a growing height.
- Six skills run from 1–10: intelligence, strength, attractiveness, social ability, creativity, and discipline. Each has a permanent growth aptitude from −3 to +3.
- Health, mental instability, and relaxation also run from 1–10. Higher instability increases the chances of burnout and mental-health setbacks.
- Ages 0–2: cry for faster development and increased parent stress, or stay quiet for gentler growth and calmer parents.
- From age 3: assign 0–5 focus to school/career, friends, family, and yourself, sharing a 12-point budget. Unused energy contributes to rest.
- Advance exactly one year per click. Choices affect skill growth and the probabilities of 10 possible random events. At most one random event happens per year; a quiet year is always possible. Temporary effects expire.
- Ten careers begin opening at 18, with some requiring age 21 or 25 and skill thresholds. Job fit, career focus, and experience determine lifestyle (1–10). This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- Welcome up to six children, one per year. Births are available from 18–60; older characters can adopt. Family focus improves children’s skills. Adoption lets older heirs continue the family line.
- Voluntary succession opens at 65. At 85, the current life closes and the player chooses a living child, or starts another life if no heir exists. An heir retains their current age, skills, aptitude, height, and personal savings.
- The estate is divided equally among living children. Inheritance supports an heir’s lifestyle; siblings keep their shares. The history records previous generations.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is visible to the player. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system. Parents and the player reach the end of life at 85; early mortality is not included.

The internal lifestyle calculation takes the higher of the career tier `clamp(1 + floor(income / 22000), 1, 10)` and the reserve tier `clamp(1 + floor(log2(1 + reserves / 25000)), 1, 10)`. Inherited reserves immediately support comfort, including for child heirs, and gradually deplete through yearly upkeep. Higher lifestyle reduces the percentage preserved for inheritance:

```text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate      = floor(savings × legacy rate)
child share = floor(estate / number of living children)
```

Rounding remainder is not distributed. Handoff closes the previous playable chapter, even when chosen before 85. A descendant begins with no job or children of their own; their developed stats and personal savings persist. There are no partner, housing, education-degree, or relationship subsystems yet.

## Run locally

Install Node.js, then:

```sh
npm start
```

Open http://127.0.0.1:4173. There are no runtime dependencies or build steps. The Node server is for local development; GitHub Pages serves the static files directly. Opening `index.html` via `file://` is not supported because the game uses ES modules.

Run the automated checks:

```sh
npm ci
npm test
```

The engine tests cover deterministic progression, probabilities, temporary effects, aptitude, career earnings, parenting, inheritance, save validation, and repeated succession. DOM integration tests use LinkeDOM to exercise UI rendering and action handlers without a browser. Actual browser visual testing was blocked by the available browser-control tooling during the initial build.

## Source and deployment

- `engine.js`: deterministic simulation, jobs, events, saves, and succession.
- `app.js`: UI, actions, local persistence, and import/export.
- `styles.css`: responsive layout and visual design.
- `index.html` and `favicon.svg`: static entry point and branding.
- `test/`: engine and DOM integration tests.

This uses the same deployment pattern as **Depths**: a separate public GitHub repository, GitHub Pages serving the root of `main`, and `.nojekyll`. Pushes to `main` automatically redeploy.

```sh
git add app.js engine.js styles.css index.html favicon.svg README.md test package.json package-lock.json .gitignore .nojekyll server.mjs
git commit -m "Describe the change"
git push origin main
```

Check deployment with `gh api repos/adaford/lifelines/pages/builds/latest`. Game progress stays in the player’s browser, not in GitHub. Exports can move a save between devices; the prototype has no accounts or cloud synchronization.
