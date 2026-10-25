# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

## Designed for phones

The game uses a single-column layout with four bottom tabs: **Year**, **Career**, **Family**, and **You**. The **Next year** control stays within reach at the bottom of the Year screen. Full character stats live in You; health, stability, and lifestyle remain visible at a glance. Babies also show all five skills and their affinities on the Year screen.

Tap **More** (the three dots) for help, event odds, save export/import, or a new life. These menus open as bottom sheets. Focus controls have 44-pixel touch targets, inputs use 16-pixel text to avoid automatic zoom, and the layout reserves room for phone safe areas. Larger screens display the same centered phone layout. Existing browser saves are preserved.

## The first playable framework

- Begin at age 0 with randomized parents, inherited growth affinities, and a growing height.
- Babies and adults share five skills: intelligence, strength, attractiveness, social ability, and creativity. Each starts at 1.0–1.5 out of 10 at birth, with a permanent growth affinity from −3 to +3. Positive affinity speeds up development; negative affinity takes more practice.
- Health and mental stability also run from 1–10. Higher stability means calmer and more resilient; low stability increases the chances of impulsive behavior, conflict, and distress. Wellbeing meters begin healthy/calm rather than using the low skill baseline.
- Until age 18, lifestyle matches the parent household. Both initial parents share a randomized household lifestyle, and children you raise share yours. At 18, career success and personal resources determine lifestyle.
- Ages 0–2: cry for faster development and lower parent stability, or stay quiet for gentler growth and calmer parents.
- From age 3: assign 0–5 focus to school/career, friends, family, and yourself, sharing a 12-point budget. Unused energy contributes to rest.
- Advance exactly one year per click. 136 random events each roll independently, with a maximum of five per year. Typical lives average roughly one event every year or two; quiet years remain common. Your age, school/college status, career, focus, and effective stats shape which events can happen and their odds.
- 32 events pause play for a decision. Each option shows its lasting stat changes and temporary buffs, setbacks, or lifestyle changes. Choices and outcomes persist through reloads and appear in the journal. No yearly advance or career/family change can skip a pending choice.
- A pool of 100 distinct careers spans 10 fields. Every job has skill affinities, a base lifestyle (1–10), and age/skill requirements. This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- At 18, choose college or take a job from 10 offers. Choosing a job starts the workforce path; advancing is paused until the choice is made.
- College takes four yearly turns. College focus develops skills while studying; graduating opens a new list of 15 offers, including degree-based careers. The game remembers each list rather than rerolling it when a menu opens.
- Welcome up to six children, one per year. Births are available from 18–60; older characters can adopt. Family focus improves children’s skills. Adoption lets older heirs continue the family line.
- Voluntary succession opens at 65. At 85, the current life closes and the player chooses a living child, or starts another life if no heir exists. An heir retains their current age, skills, affinity, height, and personal savings.
- The estate is divided equally among living children. Inheritance supports an heir’s lifestyle; siblings keep their shares. The history records previous generations.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is visible to the player. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system. Parents and the player reach the end of life at 85; early mortality is not included.

For adults, the internal lifestyle calculation takes the higher of the career tier `clamp(1 + floor(income / 22000), 1, 10)` and the reserve tier `clamp(1 + floor(log2(1 + reserves / 25000)), 1, 10)`. Inherited reserves support adult comfort and gradually deplete through yearly upkeep. Child heirs continue the parental household lifestyle until 18 and preserve their reserves. Higher lifestyle reduces the percentage preserved for inheritance:

```text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate      = floor(savings × legacy rate)
child share = floor(estate / number of living children)
```

Rounding remainder is not distributed. Handoff closes the previous playable chapter, even when chosen before 85. A descendant begins with no job or children of their own; their developed stats and personal savings persist. Adult heirs make their own college-or-work choice. College is a single four-year program; majors, tuition, partners, housing, and detailed relationship systems are not modeled yet.

In a 300-life simulation (25,500 annual turns), default focus with mixed college/work paths averaged 0.644 events per year; 53.3% of years were quiet. This is a balance check, not a guaranteed rhythm for an individual life.

Event risks are fictional game rules. Higher social focus brings more social opportunities and complications; athlete and physical careers raise injury risk. Low intelligence sharply raises scam risk, while high intelligence supports academic opportunities. Each retained stat and each focus influences multiple events. Temporary lifestyle modifiers apply to adult comfort and flow through to dependent children. Event rolls use the stats and age at the start of the year; outcomes appear after that year passes. The odds menu shows each eligible event and computes quiet-year probability as the product of all missed rolls.

Job skill affinities run from +1 (useful) to +3 (central), and their relative weights determine skill fit and job-related development. These describe what a role uses; a character’s own −3 to +3 affinity determines how quickly that skill grows. Job lifestyle ratings and education requirements are fictional balancing values for this framework.

Existing saves and JSON backups are upgraded automatically to schema v4. Discipline and relaxation are removed from player and family stats, affinities, careers, and active effects. Old instability scores convert to `11 - instability`, and temporary effect signs are inverted. Existing careers, college progress, and job offers are preserved; older saves receive missing education data. The browser storage key stays `lifelines.save.v1` so existing players keep their saves.

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

The engine tests cover deterministic progression, probabilities, temporary effects, aptitude, career earnings, parenting, inheritance, save validation, and repeated succession. DOM integration tests use LinkeDOM to exercise UI rendering, bottom navigation, menu confirmations, save preservation, and action handlers without a browser. Phone dimensions and safe-area spacing have been reviewed in the stylesheet; actual browser/device visual testing remains unverified because the available browser-control tooling cannot provide a preview.

## Source and deployment

- `engine.js`: deterministic simulation, college, job offers, events, saves, and succession.
- `jobs.js`: 100 career titles, skill affinities, lifestyle ratings, and entry requirements.
- `events.js`: age/context eligibility, choice outcomes, and independent event probabilities.
- `app.js`: UI, actions, local persistence, and import/export.
- `styles.css`: responsive layout and visual design.
- `index.html` and `favicon.svg`: static entry point and branding.
- `test/`: engine and DOM integration tests.

This uses the same deployment pattern as **Depths**: a separate public GitHub repository, GitHub Pages serving the root of `main`, and `.nojekyll`. Pushes to `main` automatically redeploy.

```sh
git add app.js engine.js jobs.js events.js styles.css index.html favicon.svg README.md test package.json package-lock.json .gitignore .nojekyll server.mjs
git commit -m "Describe the change"
git push origin main
```

Check deployment with `gh api repos/adaford/lifelines/pages/builds/latest`. Game progress stays in the player’s browser, not in GitHub. Exports can move a save between devices; the prototype has no accounts or cloud synchronization.
