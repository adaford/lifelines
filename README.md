# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

**Development handoff:** [HANDOFF.md](HANDOFF.md) covers the implemented game, save contract, code structure, cloud setup, and remaining work. Coding instructions live in [AGENTS.md](AGENTS.md).

## Designed for phones

The game uses a single-column layout with four bottom tabs: **Year**, **Career**, **Family**, and **You**. The **Next year** control stays within reach at the bottom of the Year screen. Stats appear as bars on Year and You; green or red segments show expected routine gains and losses without numerical forecast deltas. Health, mental stability, and lifestyle remain visible at a glance. Gender appears next to the player's name; new games currently begin male. Family shows Mom and Dad's full profiles and your relationship with them.

Tap **More** (the three dots) for help, event odds, save export/import, or a new life. These menus open as bottom sheets. Focus controls have 44-pixel touch targets, inputs use 16-pixel text to avoid automatic zoom, and the layout reserves room for phone safe areas. Larger screens display the same centered phone layout. Existing browser saves are preserved.

## The first playable framework

- Begin by entering a family surname; its first letter is capitalized automatically. A first name is optional. The story starts at age 0 with randomized parents, inherited growth affinities, and a growing height. Sons and daughters keep the whole family surname, including multiword names.
- Babies and adults share five stats: intelligence, strength, attractiveness, social ability, and creativity. The four trainable skills begin at 1.0–1.5 out of 10, with permanent growth affinities from −3 to +3. Attractiveness begins near its inherited mature level and does not gain ordinary growth from crying, focus, or careers.
- Health and mental stability also run from 1–10. Higher mental stability means calmer and more resilient; low mental stability increases the chances of impulsive behavior, conflict, and distress. Wellbeing meters begin healthy/calm rather than using the low skill baseline.
- Until age 18, lifestyle matches the parent household. Both initial parents share a randomized household lifestyle, and children you raise share yours. At 18, career success and personal resources determine lifestyle.
- Ages 0–2: choose a cry level from 1–5. More crying brings faster development and a stronger bond with each living parent, while increasing their stress. Even level 1 builds a little connection through everyday care.
- From age 3: assign 0–5 focus to school/career, friends, family, and yourself, sharing a 12-point budget. Unused energy contributes to rest.
- Advance exactly one year per click. Green and red segments inside stat bars preview expected routine gains and losses. Actual development varies around these expectations. A small year-review popup shows actual numerical changes and events afterward; it survives reloads until dismissed.
- 176 personal and household random events each roll independently, with a maximum of five per year. Quiet years remain common. Your age, school/college status, career, focus, and effective stats shape which events can happen and their odds. Eight childhood parent events include comfort, routines, stress spilling into home life, illness, and help with caregiving; parents' own wellbeing and bonds affect the chances.
- 45 events pause play for a decision. Each option shows its lasting stat changes and temporary buffs, setbacks, or lifestyle changes. Choices and outcomes persist through reloads and appear in the journal. No yearly advance or career/family change can skip a pending choice.
- A pool of 100 distinct careers spans 10 fields. Every job has skill affinities, a base lifestyle (1–10), and age/skill requirements. This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- At 18, choose college or take a job from 10 offers. Choosing a job starts the workforce path; advancing is paused until the choice is made.
- College takes four yearly turns. College focus develops skills while studying; graduating opens a new list of 15 offers, including degree-based careers. The game remembers each list rather than rerolling it when a menu opens.
- Single adults can meet up to five people per year. Attractiveness, social ability, and lifestyle affect frequency, profile strength, and pursuit success. Profiles show every stat and affinity; browse one at a time on a phone. Choose a relationship, a consensual one-night stand, or ignore. Unanswered encounters expire the following year.
- A new relationship starts at a random 3–7 out of 10. Dating adds social ability +0.7 and mental stability +0.6; marriage raises these to +0.9 and +0.8. Either costs one lifestyle level. Family focus builds the bond. Propose once per year; relationship strength and years together determine acceptance.
- Dating has a low annual pregnancy chance; marriage raises it substantially. Pregnancy is saved, and a baby arrives on the next yearly turn. A one-night stand also has a small pregnancy chance. Adults can adopt, with a maximum of six children and one arrival per year. An expected baby reserves a place in the family.
- Each living dependent child under 18 adds social ability +0.2 (up to +1.2) and costs one lifestyle level. Children have their own 1–10 bond, stats, and affinities. Family focus improves their bond and abilities. Partners and children have personal events and decisions with clearly labeled consequences for them and for you.
- Attractiveness has no routine growth before its decline threshold. The requested game rule begins gradual losses from age 30 to 31 for men and age 22 to 23 for women; other genders currently use 30. This is appearance pacing for the game, not a scientific attractiveness standard. Specific events can still change appearance.
- Everyone in the active family can die in any year, including the player, parents, partner, children, and siblings. Age supplies a real-world baseline; lower health raises disease risk. Death rolls are separate from the five ordinary events.
- Retirement opens at 65, and death opens succession at any age. Choose any eligible child; if there are no eligible children, choose a sibling. With neither, give the legacy to a random child aged 6–12 with low stats and a different surname. At 85, retirement from the playable chapter is required; it does not kill the retiring character. Family members can live beyond 85. The heir preview stays the same across menu visits and reloads.
- Heirs keep their age, stats, affinity, height, identity, and personal resources. Child and sibling heirs keep your family surname regardless of gender. A sibling handoff preserves the existing parents and remaining siblings; a previously played character cannot receive another handoff. Newly born/adopted children record known parent IDs, allowing the current partner to remain a parent after a child handoff when that relationship is recorded. Old saves do not guess unknown parentage.
- The entire estate is divided equally among eligible living children, including those not selected as the next player. With no children, the chosen sibling or unrelated child receives the whole estate. Inheritance supports their lifestyle, and the history records previous chapters.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is shown for finances. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system.

For babies, let `intensity = (cryLevel - 1) / 4`. Mean yearly trainable-skill gain is `0.13 + 0.19 * intensity` before affinity scaling, and mean health gain is `0.06 + 0.06 * intensity`. Each living parent's mean mental stability change is `0.20 - 2 * intensity ** 1.35`: light crying can allow recovery, while level 5 costs 1.8 points before variation. Mean parent-bond gain is `0.08 + 0.32 * intensity`. New Mom/Dad bonds use a normal distribution centered at 8 with SD 1, capped to 5–10; existing saved bonds are preserved. From age 3, family focus changes each living parent's mean bond by `(familyFocus - 2) * 0.08` per year. All meters remain bounded to 1–10.

The annual forecast previews mean routine development, finances, family aging, and expiring effects without consuming randomness. Actual gains and losses receive seeded normal variation, so the same save produces the same next year. Skill-change SD is 18% of the mean change's magnitude; appearance decline uses 30%; health and mental stability use 25% plus 0.02; bonds use 20% plus 0.01. Residuals are capped at three standard deviations. These abstract stat distributions are gameplay calibration, not measured distributions of human intelligence or appearance. Random events, deaths, new relationships, births, and unresolved decisions are excluded. The year review records actual changes plus journal events; later decisions add their effects afterward.

Height uses [WHO infant length references](https://www.cdc.gov/growthcharts/who-data-files.htm) and [CDC stature-for-age data](https://www.cdc.gov/growthcharts/cdc-data-files.htm). Birth length varies around the reference median and scale rather than always being 50 cm. An inherited adult-height target, a persistent growth profile, and maturity between 14 and 18 produce rapid infant growth, slower childhood growth, and a pubertal growth phase. Small seeded annual deviations fade toward the adult target. Percentile compares the current measurement with the age-specific LMS reference and disappears once adult height is reached. Growth profiles are separate from gender identity and pregnancy capability. Annual interpolation, maturation timing, and growth-velocity variation are game approximations, not a clinical growth calculator.

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

At default social focus, minimum attractiveness/social/lifestyle yields about 0.22 encounters per year and at most one; maximum ratings yield about 4.6 and at most five. Six years together adds 42 percentage points to marriage acceptance at the same bond level. Pregnancy base chances are 2% while dating, 25% when married, and 1% after an accepted one-night stand, adjusted by the gestating person’s age and health. This simple framework permits pregnancy at ages 18–45 and prevents new pregnancies from player age 84 so the birth precedes mandatory retirement. These are fictional balancing numbers.

Actor identity, growth-reference profile, attraction preferences, and pregnancy capability are separate fields. New games currently default to a male character meeting women, with gender beside the name. The engine and partner labels can support other playable genders and player pregnancy; there is no gender-selection screen yet. Heirs retain their own identity and affinities.

Job skill affinities run from +1 (useful) to +3 (central), and their relative weights determine skill fit and job-related development. These describe what a role uses; a character’s own −3 to +3 affinity determines how quickly that skill grows. Job lifestyle ratings and education requirements are fictional balancing values for this framework.

Existing saves and JSON backups upgrade automatically to schema v8. Migration preserves RNG, saved height, parent bonds, careers, pending decisions, pregnancy, and year review. It adds deterministic growth metadata and anchors each growing person's future curve at their existing measurement. Only old infants younger than 3 with attractiveness below 3 receive an appearance correction toward the family level; older characters keep their appearance. Parent labels derive from recorded identity without changing it. Earlier migrations retain old cry levels, life/death state, family surnames, and former event/stat conversions. The browser key stays `lifelines.save.v1`; the release cache token is `growth-years-1`.

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

Release validation: all 159 tests passed on Node 24.14.0; local HTTP assets returned 200. Automated checks cover deterministic saves, distribution calibration, growth references and maturity, appearance thresholds, parent bonds, stronger crying effects, migration anchors, forecast purity, actual year summaries, mortality, succession, careers, and family events. DOM checks use LinkeDOM for labels, gender, height percentiles, projection bars, navigation, dialogs, saves, and action handlers. A real-browser phone-layout check was not performed for this release; automated DOM checks do not establish visual verification.

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
