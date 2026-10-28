# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

**Development handoff:** [HANDOFF.md](HANDOFF.md) covers the implemented game, save contract, code structure, cloud setup, and remaining work. Coding instructions live in [AGENTS.md](AGENTS.md).

## Designed for phones

The four tabs are **Year**, **Career**, **Family**, and **You**. Year shows focus controls, stats, and compact **Dad:**/**Mom:** rows with mental stability and relationship bars. Green/red segments preview routine changes; actual year reviews use **before → after** values. Full parent profiles remain in Family. Short explanations live in **?** popups. Health, mental stability, lifestyle, and gender remain visible beside the character profile.

Tap **More** (the three dots) for help, event odds, save export/import, or a new life. These menus open as bottom sheets. Focus controls have 44-pixel touch targets, inputs use 16-pixel text to avoid automatic zoom, and the layout reserves room for phone safe areas. Larger screens display the same centered phone layout. Existing browser saves are preserved.

## The first playable framework

- Begin by entering a family surname; its first letter is capitalized automatically. A first name is optional. The story starts at age 0 with a female Mom and male Dad, distinct first names from gendered name pools, inherited growth affinities, and a growing height. Sons and daughters keep the whole family surname, including multiword names.
- Babies and adults share five stats: intelligence, strength, attractiveness, social ability, and creativity. The four trainable skills begin at 1.0–1.5 out of 10, with permanent growth affinities from −3 to +3. Attractiveness begins near its inherited mature level and does not gain ordinary growth from crying, focus, or careers.
- Health and mental stability also run from 1–10. Higher mental stability means calmer and more resilient; low mental stability increases the chances of impulsive behavior, conflict, and distress. Wellbeing meters begin healthy/calm rather than using the low skill baseline.
- Until age 18, lifestyle matches the parent household. Both parents share a household lifestyle that changes with their career focus, progress, promotions, job losses, and recovery. Career growth generally improves it over time, but setbacks remain possible. Children you raise share yours. At 18, career success and personal resources determine lifestyle.
- Ages 0–2: choose a cry level from 1–5. More crying brings faster development and a stronger relationship with each living parent, while increasing their stress. Even level 1 builds a little connection through everyday care.
- From age 3: assign 0–5 focus to school/career, friends, family, and yourself, sharing a 12-point budget. Unused energy contributes to rest.
- Advance exactly one year per click. Green and red segments inside stat bars preview expected routine gains and losses. Actual development varies around these expectations. A small year-review popup shows before → after values and events afterward; it survives reloads until dismissed.
- 176 personal and household random events each roll independently, with a maximum of five per year. Quiet years remain common. Your age, school/college status, career, focus, and effective stats shape which events can happen and their odds. Eight childhood parent events include comfort, routines, stress spilling into home life, illness, and help with caregiving; parents' own wellbeing and relationships affect the chances.
- 45 events pause play for a decision. Each option shows its lasting stat changes and temporary buffs, setbacks, or lifestyle changes. Choices and outcomes persist through reloads and appear in the journal. No yearly advance or career/family change can skip a pending choice.
- A pool of 100 distinct careers spans 10 fields. Every job has skill affinities, a base lifestyle (1–10), and age/skill requirements. This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- At 18, choose college or take a job from 10 offers. Choosing a job starts the workforce path; advancing is paused until the choice is made.
- College takes four yearly turns. College focus develops skills while studying; graduating opens a new list of 15 offers, including degree-based careers. The game remembers each list rather than rerolling it when a menu opens.
- Single adults can meet up to five people per year. Attractiveness, social ability, and lifestyle affect frequency, profile strength, and pursuit success. Profiles show every stat and affinity; browse one at a time on a phone. Choose a relationship, a consensual one-night stand, or ignore. Unanswered encounters expire the following year.
- A new relationship starts at a random 3–7 out of 10. Dating adds social ability +0.7 and mental stability +0.6; marriage raises these to +0.9 and +0.8. Either costs one lifestyle level. Family focus builds the relationship. Propose once per year; relationship strength and years together determine acceptance.
- Dating has a low annual pregnancy chance; marriage raises it substantially. Pregnancy is saved, and a baby arrives on the next yearly turn. A one-night stand also has a small pregnancy chance. Adults can adopt, with a maximum of six children and one arrival per year. An expected baby reserves a place in the family.
- Each living dependent child under 18 adds social ability +0.2 (up to +1.2) and costs one lifestyle level. Children have their own 1–10 relationship, stats, and affinities. Family focus improves their relationship and abilities. Partners and children have personal events and decisions with clearly labeled consequences for them and for you.
- Attractiveness starts near its inherited mature value and fluctuates slightly in either direction each year. Its mean stays flat until gradual decline begins from age 30 to 31 for men and age 22 to 23 for women; other genders currently use 30. This is appearance pacing for the game, not a scientific attractiveness standard. Specific events can still change appearance.
- Everyone in the active family can die in any year, including the player, parents, partner, children, and siblings. Age supplies a real-world baseline; lower health raises disease risk. Death rolls are separate from the five ordinary events.
- Retirement opens at 65, and death opens succession at any age. Choose any eligible child; if there are no eligible children, choose a sibling. With neither, give the legacy to a random child aged 6–12 with low stats and a different surname. At 85, retirement from the playable chapter is required; it does not kill the retiring character. Family members can live beyond 85. The heir preview stays the same across menu visits and reloads.
- Heirs keep their age, stats, affinity, height, identity, and personal resources. Child and sibling heirs keep your family surname regardless of gender. A sibling handoff preserves the existing parents and remaining siblings; a previously played character cannot receive another handoff. Newly born/adopted children record known parent IDs, allowing the current partner to remain a parent after a child handoff when that relationship is recorded. Old saves do not guess unknown parentage.
- The entire estate is divided equally among eligible living children, including those not selected as the next player. With no children, the chosen sibling or unrelated child receives the whole estate. Inheritance supports their lifestyle, and the history records previous chapters.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is shown for finances. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system.

For babies, let `intensity = (cryLevel - 1) / 4`. Mean yearly trainable-skill gain is `0.13 + 0.19 * intensity` before affinity scaling, and mean health gain is `0.06 + 0.06 * intensity`. Each living parent's mean mental stability change is `0.20 - 2 * intensity ** 1.35`: light crying can allow recovery, while level 5 costs 1.8 points before variation. Mean parent-relationship gain is `0.08 + 0.32 * intensity`. New Mom/Dad relationships use a normal distribution centered at 8 with SD 1, capped to 5–10; existing saved relationships are preserved. From age 3, family focus changes each living parent's mean relationship by `(familyFocus - 2) * 0.08` per year. All meters remain bounded to 1–10.

The annual forecast previews mean routine development, finances, family aging, and expiring effects without consuming randomness. Actual gains and losses receive seeded normal variation, so the same save produces the same next year. Skill-change SD is 18% of the mean change's magnitude; appearance uses a baseline SD of 0.04 plus 30% of any age-related decline; health and mental stability use 25% plus 0.02; relationships use 20% plus 0.01. Residuals are capped at three standard deviations. These abstract stat distributions are gameplay calibration, not measured distributions of human intelligence or appearance. Random events, deaths, new relationships, births, and unresolved decisions are excluded. The year review records actual before → after values plus journal events; later decisions add their effects afterward.

Height uses [WHO infant length references](https://www.cdc.gov/growthcharts/who-data-files.htm) and [CDC stature-for-age data](https://www.cdc.gov/growthcharts/cdc-data-files.htm). Birth length varies around the reference median and scale rather than always being 50 cm. Each year adds an age-appropriate gain shaped by inherited `growthFactor`, health, and fresh seeded variation. Adult height is the result of those gains when growth stops at individual maturity between 14 and 18; it is never chosen in advance. Health below 7 reduces that year's gain by up to 15% at health 1, including the final growing year. Recovery affects future growth without repaying missed centimetres; height never shrinks or jumps toward a target. The direction follows [WHO's account of nutrition and illness affecting growth](https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell); the health mapping, interpolation, maturation timing, and growth-velocity variation are game calibration, not clinical predictions. Percentile uses the unchanged age-specific LMS reference until maturity. Growth profiles are separate from gender identity and pregnancy capability.

Each parent's saved career records focus from 1–5, employment status, progress, and years. Seeded career growth and promotions can raise the shared household lifestyle, while job loss and recovery can interrupt that trend. Parents and the under-18 player share the household result. Career progression and event probabilities are gameplay calibration, not measured earnings forecasts; no income amounts are shown.

Annual mortality uses the [SSA 2023 period life table published with the 2026 Trustees Report](https://www.ssa.gov/oact/STATS/table4c6.html), taking the equal-weight mean of male and female rates at each age as a representative US baseline. The game has no country or medical-history model; gender identity and pregnancy capability do not choose a mortality table. At health and mental stability 7, risk matches the baseline. Lower health increases the disease/natural-cause hazard; adult mental stability has a smaller effect on accident hazard. A child's own mental stability or cry level never directly changes accident risk.

Disease/natural causes and accidents share one competing-risk draw per person, using start-of-year age and stats. The cause split is a coarse game approximation informed by [NCHS leading causes of death in 2023](https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-010.pdf); neither the split nor the stat multipliers are measured medical estimates. The model retains the source table's last rate beyond its age range instead of forcing death on a birthday. These are population-inspired game odds, not individual predictions or worldwide rates. More → Event odds shows each active family member's current risk separately from ordinary-event chances.

For adults, the internal lifestyle calculation starts with the higher of the career tier `clamp(1 + floor(income / 22000), 1, 10)` and the reserve tier `clamp(1 + floor(log2(1 + reserves / 25000)), 1, 10)`. Partner/dependent-child costs and temporary event effects then adjust this tier, still bounded to 1–10. Inherited reserves support adult comfort and gradually deplete through yearly upkeep. Child heirs continue the parental household lifestyle until 18 and preserve their reserves. Higher lifestyle reduces the percentage preserved for inheritance:

```text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate      = floor(savings × legacy rate)
child share = estate / number of living children
```

Child shares are equal fractional amounts internally, so there is no discarded remainder. Handoff closes the previous playable chapter, even when chosen before 85. A descendant begins with no job or children of their own; their developed stats and personal savings persist. Adult heirs make their own college-or-work choice. College is a single four-year program; majors, tuition, housing, and detailed custody or divorce finances are not modeled. An active pregnancy and pending event decisions must finish before voluntary retirement. Ending a relationship preserves children and any expected baby. If a gestating parent dies, the pregnancy ends; if the player dies while another living parent carries the baby, the due birth completes before succession. Bereavement reduces player mental stability, dead family members stop aging or receiving events, and a surviving player can form another relationship.

The original 136-event catalog averaged about 0.64 events per year in a historical 300-life balance check; that is not a measured average for the expanded catalog. Household events add small independent chances based on each family member’s traits, age, relationship, and your focus. Personal and household events share the five-event annual limit; mortality, dating encounters, and pregnancy use separate rolls.

Ordinary-event risks are fictional game rules. Higher social focus brings more social opportunities and complications; athlete and physical careers raise injury-event risk. Low intelligence sharply raises scam risk, while high intelligence supports academic opportunities. Each retained stat and each focus influences multiple events. Temporary lifestyle modifiers apply to adult comfort and flow through to dependent children. Event rolls use the stats and age at the start of the year; outcomes appear after that year passes. The odds menu computes an ordinary quiet-year probability from missed event rolls; this excludes mortality and other separate systems.

At default social focus, minimum attractiveness/social/lifestyle yields about 0.22 encounters per year and at most one; maximum ratings yield about 4.6 and at most five. Six years together adds 42 percentage points to marriage acceptance at the same relationship level. Pregnancy base chances are 2% while dating, 25% when married, and 1% after an accepted one-night stand, adjusted by the gestating person’s age and health. This simple framework permits pregnancy at ages 18–45 and prevents new pregnancies from player age 84 so the birth precedes mandatory retirement. These are fictional balancing numbers.

Actor identity, growth-reference profile, attraction preferences, and pregnancy capability are separate fields. New games currently default to a male character meeting women, with gender beside the name. The engine and partner labels can support other playable genders and player pregnancy; there is no gender-selection screen yet. Heirs retain their own identity and affinities.

Job skill affinities run from +1 (useful) to +3 (central), and their relative weights determine skill fit and job-related development. These describe what a role uses; a character’s own −3 to +3 affinity determines how quickly that skill grows. Job lifestyle ratings and education requirements are fictional balancing values for this framework.

Existing saves and JSON backups upgrade automatically to schema v9. Migration preserves RNG, saved height, relationships, existing careers, pending decisions, pregnancy, and year review. Duplicate parent names are repaired deterministically; other identities stay intact. Shared support starts at the recorded household lifestyle, so differing legacy parent profiles cannot cause an artificial jump. V9 supplies deterministic parent-career and growth-factor defaults, discards old adult-height targets, and records `adultHeight` only for people already mature. It never changes the saved current height or rerolls identities. Earlier migrations retain the appearance correction for old infants under 3 whose attractiveness was below 3, cry levels, life/death state, family surnames, and former event/stat conversions. The browser key stays `lifelines.save.v1`; the release cache token is `parent-bars-1`.

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

Release validation: all 190 tests passed on Node 24.14.0; all 11 local HTTP assets returned 200 and matched the working files. Prior engine checks also validated 1,950 previous-version save migrations and 9,101 simulated yearly turns. Automated checks cover deterministic saves, distribution calibration, growth distributions and maturity, health-scaled annual gains, appearance variation, parent relationships and careers, stronger crying effects, compatible save migration, forecast purity, actual year summaries, mortality, succession, careers, and family events. DOM checks use LinkeDOM for labels, gender, height percentiles, projection bars, navigation, dialogs, saves, and action handlers. A real-browser phone-layout check was not performed for this release; automated DOM checks do not establish visual verification.

## Source and deployment

- `engine.js`: deterministic simulation, surnames, college, job offers, events, saves, and retirement inheritance.
- `jobs.js`: 100 career titles, skill affinities, lifestyle ratings, and entry requirements.
- `events.js`: 136 personal events, age/context eligibility, and independent probabilities.
- `family-events.js`: 40 parent/partner/child events with person-specific odds and outcomes.
- `mortality.js`: sourced age-specific baseline, stat modifiers, and one annual competing-risk death roll.
- `growth.js`: WHO/CDC height references, percentiles, maturation curves, and annual growth variation.
- `relationships.js`: dating, pursuit, marriage, pregnancy, and attractiveness-aging rules.
- `app.js`: UI, actions, local persistence, and import/export.
- `styles.css`: responsive layout and visual design.
- `index.html` and `favicon.svg`: static entry point and branding.
- `test/`: engine and DOM integration tests.

This uses the same deployment pattern as **Depths**: a separate public GitHub repository, GitHub Pages serving the root of `main`, and `.nojekyll`. Pushes to `main` automatically redeploy.

```sh
git add app.js engine.js jobs.js events.js family-events.js relationships.js mortality.js growth.js styles.css index.html favicon.svg README.md HANDOFF.md test package.json package-lock.json .gitignore .nojekyll server.mjs
git commit -m "Describe the change"
git push origin main
```

Check deployment with `gh api repos/adaford/lifelines/pages/builds/latest`. Game progress stays in the player’s browser, not in GitHub. Exports can move a save between devices; the prototype has no accounts or cloud synchronization.
