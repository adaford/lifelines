# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

**Development handoff:** [HANDOFF.md](HANDOFF.md) covers the implemented game, save contract, code structure, cloud setup, and remaining work. Coding instructions live in [AGENTS.md](AGENTS.md).

## Designed for phones

The game uses a single-column layout with four bottom tabs: **Year**, **Career**, **Family**, and **You**. The **Next year** control stays within reach at the bottom of the Year screen. Full character stats live in You; health, stability, and lifestyle remain visible at a glance. Babies also show all five skills and their affinities on the Year screen.

Tap **More** (the three dots) for help, event odds, save export/import, or a new life. These menus open as bottom sheets. Focus controls have 44-pixel touch targets, inputs use 16-pixel text to avoid automatic zoom, and the layout reserves room for phone safe areas. Larger screens display the same centered phone layout. Existing browser saves are preserved.

## The first playable framework

- Begin by entering a family surname; its first letter is capitalized automatically. A first name is optional. The story starts at age 0 with randomized parents, inherited growth affinities, and a growing height. Sons and daughters keep the whole family surname, including multiword names.
- Babies and adults share five skills: intelligence, strength, attractiveness, social ability, and creativity. Each starts at 1.0–1.5 out of 10 at birth, with a permanent growth affinity from −3 to +3. Positive affinity speeds up development; negative affinity takes more practice.
- Health and mental stability also run from 1–10. Higher stability means calmer and more resilient; low stability increases the chances of impulsive behavior, conflict, and distress. Wellbeing meters begin healthy/calm rather than using the low skill baseline.
- Until age 18, lifestyle matches the parent household. Both initial parents share a randomized household lifestyle, and children you raise share yours. At 18, career success and personal resources determine lifestyle.
- Ages 0–2: cry for faster development and lower parent stability, or stay quiet for gentler growth and calmer parents.
- From age 3: assign 0–5 focus to school/career, friends, family, and yourself, sharing a 12-point budget. Unused energy contributes to rest.
- Advance exactly one year per click. 168 personal and household random events each roll independently, with a maximum of five per year. Typical lives average roughly one event every year or two; quiet years remain common. Your age, school/college status, career, focus, and effective stats shape which events can happen and their odds.
- 45 events pause play for a decision. Each option shows its lasting stat changes and temporary buffs, setbacks, or lifestyle changes. Choices and outcomes persist through reloads and appear in the journal. No yearly advance or career/family change can skip a pending choice.
- A pool of 100 distinct careers spans 10 fields. Every job has skill affinities, a base lifestyle (1–10), and age/skill requirements. This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- At 18, choose college or take a job from 10 offers. Choosing a job starts the workforce path; advancing is paused until the choice is made.
- College takes four yearly turns. College focus develops skills while studying; graduating opens a new list of 15 offers, including degree-based careers. The game remembers each list rather than rerolling it when a menu opens.
- Single adults can meet up to five people per year. Attractiveness, social ability, and lifestyle affect frequency, profile strength, and pursuit success. Profiles show every stat and affinity; browse one at a time on a phone. Choose a relationship, a consensual one-night stand, or ignore. Unanswered encounters expire the following year.
- A new relationship starts at a random 3–7 out of 10. Dating adds social ability +0.7 and stability +0.6; marriage raises these to +0.9 and +0.8. Either costs one lifestyle level. Family focus builds the bond. Propose once per year; relationship strength and years together determine acceptance.
- Dating has a low annual pregnancy chance; marriage raises it substantially. Pregnancy is saved, and a baby arrives on the next yearly turn. A one-night stand also has a small pregnancy chance. Adults can adopt, with a maximum of six children and one arrival per year. An expected baby reserves a place in the family.
- Each living dependent child under 18 adds social ability +0.2 (up to +1.2) and costs one lifestyle level. Children have their own 1–10 bond, stats, and affinities. Family focus improves their bond and abilities. Partners and children have personal events and decisions with clearly labeled consequences for them and for you.
- Attractiveness naturally peaks at an individual age between 27 and 33, then gradually declines. Events can still change it.
- Retirement opens at 65. Choose any eligible child; if there are no eligible children, choose a sibling. With neither, give the legacy to a random child aged 6–12 with low stats and a different surname. At 85, this handoff is required, so a childless life can still continue. The preview stays the same across menu visits and reloads.
- Heirs keep their age, stats, affinity, height, identity, and personal resources. Child and sibling heirs keep your family surname regardless of gender. A sibling handoff preserves the existing parents and remaining siblings; a previously played character cannot receive another handoff.
- The entire estate is divided equally among eligible living children, including those not selected as the next player. With no children, the chosen sibling or unrelated child receives the whole estate. Inheritance supports their lifestyle, and the history records previous chapters.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is visible to the player. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system. Parents and the player reach the end of life at 85; early mortality is not included.

For adults, the internal lifestyle calculation starts with the higher of the career tier `clamp(1 + floor(income / 22000), 1, 10)` and the reserve tier `clamp(1 + floor(log2(1 + reserves / 25000)), 1, 10)`. Partner/dependent-child costs and temporary event effects then adjust this tier, still bounded to 1–10. Inherited reserves support adult comfort and gradually deplete through yearly upkeep. Child heirs continue the parental household lifestyle until 18 and preserve their reserves. Higher lifestyle reduces the percentage preserved for inheritance:

```text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate      = floor(savings × legacy rate)
child share = estate / number of living children
```

Child shares are equal fractional amounts internally, so there is no discarded remainder. Handoff closes the previous playable chapter, even when chosen before 85. A descendant begins with no job or children of their own; their developed stats and personal savings persist. Adult heirs make their own college-or-work choice. College is a single four-year program; majors, tuition, housing, and detailed custody or divorce finances are not modeled. An active pregnancy and pending event decisions must finish before retirement. Ending a relationship preserves children and any expected baby.

The original 136-event catalog averaged about 0.64 events per year in a 300-life balance check. Household events add small independent chances based on each family member’s traits, age, relationship, and your focus. Personal and household events share the five-event annual limit; dating encounters use a separate roll.

Event risks are fictional game rules. Higher social focus brings more social opportunities and complications; athlete and physical careers raise injury risk. Low intelligence sharply raises scam risk, while high intelligence supports academic opportunities. Each retained stat and each focus influences multiple events. Temporary lifestyle modifiers apply to adult comfort and flow through to dependent children. Event rolls use the stats and age at the start of the year; outcomes appear after that year passes. The odds menu shows each eligible event and computes quiet-year probability as the product of all missed rolls.

At default social focus, minimum attractiveness/social/lifestyle yields about 0.22 encounters per year and at most one; maximum ratings yield about 4.6 and at most five. Six years together adds 42 percentage points to marriage acceptance at the same bond level. Pregnancy base chances are 2% while dating, 25% when married, and 1% after an accepted one-night stand, adjusted by the gestating person’s age and health. This simple framework permits pregnancy at ages 18–45 and prevents new pregnancies when the current player is about to reach the end of life. These are fictional balancing numbers.

Actor identity, attraction preferences, and pregnancy capability are separate fields. New games currently default to a male character meeting women. The engine and partner labels can support other playable genders and player pregnancy; there is no gender-selection screen yet. Heirs retain their own identity and affinities.

Job skill affinities run from +1 (useful) to +3 (central), and their relative weights determine skill fit and job-related development. These describe what a role uses; a character’s own −3 to +3 affinity determines how quickly that skill grows. Job lifestyle ratings and education requirements are fictional balancing values for this framework.

Existing saves and JSON backups are upgraded automatically to schema v6. Discipline and relaxation are removed from player and family stats, affinities, careers, and active effects. Old instability scores convert to `11 - instability`, and temporary effect signs are inverted. Existing careers, college progress, and job offers are preserved; older saves receive missing education data. Pending event decisions, partners, pregnancies, encounters, and relationship meters are preserved. A family surname is inferred for old saves without rerolling the life. Previously finished age-85 saves reopen retirement selection. The browser storage key stays `lifelines.save.v1` so existing players keep their saves.

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

- `engine.js`: deterministic simulation, surnames, college, job offers, events, saves, and retirement inheritance.
- `jobs.js`: 100 career titles, skill affinities, lifestyle ratings, and entry requirements.
- `events.js`: 136 personal events, age/context eligibility, and independent probabilities.
- `family-events.js`: 32 partner/child events with person-specific odds and choices.
- `relationships.js`: dating, pursuit, marriage, pregnancy, and attractiveness-aging rules.
- `app.js`: UI, actions, local persistence, and import/export.
- `styles.css`: responsive layout and visual design.
- `index.html` and `favicon.svg`: static entry point and branding.
- `test/`: engine and DOM integration tests.

This uses the same deployment pattern as **Depths**: a separate public GitHub repository, GitHub Pages serving the root of `main`, and `.nojekyll`. Pushes to `main` automatically redeploy.

```sh
git add app.js engine.js jobs.js events.js family-events.js relationships.js styles.css index.html favicon.svg README.md test package.json package-lock.json .gitignore .nojekyll server.mjs
git commit -m "Describe the change"
git push origin main
```

Check deployment with `gh api repos/adaford/lifelines/pages/builds/latest`. Game progress stays in the player’s browser, not in GitHub. Exports can move a save between devices; the prototype has no accounts or cloud synchronization.
