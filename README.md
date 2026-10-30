# Lifelines

A small, generational life simulator about how you spend your years and what you leave behind.

**Play:** https://adaford.github.io/lifelines/

**Development handoff:** [HANDOFF.md](HANDOFF.md) covers the implemented game, save contract, code structure, cloud setup, and remaining work. Coding instructions live in [AGENTS.md](AGENTS.md).

## Designed for phones

The four tabs are **Year**, **Career**, **Family**, and **You**. Height appears beside gender at the top, in feet/inches with its height-only percentile. The infant subtitle "A whole life ahead" is omitted. The summary below shows all eight rated stats as one-decimal **X/10** values. Each current rating has an outlined rectangular bar beneath its number: low values are redder, high values greener, and the empty part remains visible. You, Family, relationships, and **Dad:**/**Mom:** ratings use the same bars. Tap a top stat or height for full details in You. Year places cry/focus choices beneath the summary with one combined list of expected changes; bars show current values without forecast overlays. Year reviews retain the choices used and actual **before → after** values. Only height displays a percentile, comparing same-age simulated lives while the player is alive and under 18. Full parent profiles remain in Family. Known names in stories show their relationship, such as **Name (Mom)**. Short explanations live in **?** popups.

Tap **More** (the three dots) for help, event odds, save export/import, or a new life. These menus open as bottom sheets. Focus controls have 44-pixel touch targets, inputs use 16-pixel text to avoid automatic zoom, and the layout reserves room for phone safe areas. Larger screens display the same centered phone layout. Existing browser saves are preserved.

Before 18, Career shows a disabled **Unlocks at age 18** bar; adult college and job choices remain available as usual.

Stat ratings display one decimal everywhere, including lifestyle and year reviews, while internal stats retain two decimals. Height is stored in inches and displays feet and whole inches, such as `5'9`, rounded to the nearest inch. Older centimetre saves upgrade automatically.

## The first playable framework

- First name and family surname are optional; blank fields use random defaults, and a supplied first name is preserved. A typed surname's first letter is capitalized automatically. The story starts at age 0 with a female Mom and male Dad, distinct first names from gendered name pools, inherited natural aptitudes, and a growing height. Sons and daughters keep the whole family surname, including multiword names.
- Babies and adults share intelligence, strength, attractiveness, social, and creativity ratings from 1–10. Before 18, abilities compare with others of the same age: strength 7 means a strong baby, not adult strength. The four trainable ratings start around 5, influenced by inherited natural aptitude from −3 to +3 and random variation; a gifted infant can start high. Attractiveness begins near its inherited mature level and does not gain ordinary growth from crying, focus, or careers.
- All seven rated stats can begin anywhere from 1–10, with broad random variation around 5. Health and mental stability use normal draws with SD 2. Higher mental stability means calmer and more resilient; low mental stability increases the chances of impulsive behavior, conflict, and distress. Childhood development is calibrated so balanced simulated lives average about 5/10 in all seven rated stats at 18.
- Until age 18, lifestyle matches the parent household. Both parents share a household lifestyle that changes with their career focus, progress, promotions, job losses, and recovery. Career growth generally improves it over time, but setbacks remain possible. Children you raise share yours. At 18, career success and personal resources determine lifestyle.
- Ages 0–1: choose a cry level from 1–5. Parent relationships tend to fall at levels 1–2, remain steady at 3, and rise at 4–5. Harder crying supports development but increases parent stress. Yearly events can change the outcome.
- Ages 2–4: share 12 activity points among Play, Electronics, Family time, Rest, and Arts & crafts, with at most 5 each. Play develops strength and social; Electronics develops intelligence but costs social; Arts & crafts develops creativity. Rest has a stronger health effect. The choices box shows the combined expected effect of the current allocation.
- School begins at 5: assign 0–5 focus to school/career, friends, family, and yourself under the same 12-point budget. Focus and natural aptitude can produce substantial skill gains or losses over life, with fresh yearly variation. Self focus includes exercise; inactivity can lower age-relative strength. Unused energy contributes to rest.
- Advance exactly one year per click. A list inside the choices box uses one to three + or - signs for expected routine gains and losses, including separate parent changes. Actual development varies around these expectations. A small year-review popup shows before → after values and events afterward; it survives reloads until dismissed.
- 176 personal and household random events each roll independently, with a maximum of five per year. Quiet years remain common. Your age, school/college status, career, focus, and effective stats shape which events can happen and their odds. Eight childhood parent events include comfort, routines, stress spilling into home life, illness, and help with caregiving; parents' own wellbeing and relationships affect the chances.
- 45 events pause play for a decision. Each option shows its lasting stat changes and temporary buffs, setbacks, or lifestyle changes. Choices and outcomes persist through reloads and appear in the journal. No yearly advance or career/family change can skip a pending choice.
- A pool of 100 distinct careers spans 10 fields. Every job has skill affinities, a base lifestyle (1–10), and age/skill requirements. This is the only financial number shown: no salary, income, spending, savings, or inheritance amounts appear in the game.
- At 18, choose college or take a job from 10 offers. Choosing a job starts the workforce path; advancing is paused until the choice is made.
- College takes four yearly turns. College focus develops skills while studying; graduating opens a new list of 15 offers, including degree-based careers. The game remembers each list rather than rerolling it when a menu opens.
- Single adults can meet up to five people per year. Attractiveness, social, and lifestyle affect frequency, profile strength, and pursuit success. Profiles show every stat and affinity; browse one at a time on a phone. Choose a relationship, a consensual one-night stand, or ignore. Unanswered encounters expire the following year.
- A new relationship starts at a random 3–7 out of 10. Dating adds social +0.7 and mental stability +0.6; marriage raises these to +0.9 and +0.8. Either costs one lifestyle level. Family focus builds the relationship. Propose once per year; relationship strength and years together determine acceptance.
- Dating has a low annual pregnancy chance; marriage raises it substantially. Pregnancy is saved, and a baby arrives on the next yearly turn. A one-night stand also has a small pregnancy chance. Adults can adopt, with a maximum of six children and one arrival per year. An expected baby reserves a place in the family.
- Each living dependent child under 18 adds social +0.2 (up to +1.2) and costs one lifestyle level. Children have their own 1–10 relationship, stats, and affinities. Family focus improves their relationship and abilities. Partners and children have personal events and decisions with clearly labeled consequences for them and for you.
- Attractiveness starts near its inherited mature value and fluctuates slightly in either direction each year. Its mean stays flat until gradual decline begins from age 30 to 31 for men and age 22 to 23 for women; other genders currently use 30. This is appearance pacing for the game, not a scientific attractiveness standard. Specific events can still change appearance.
- Everyone in the active family can die in any year, including the player, parents, partner, children, and siblings. Age supplies a real-world baseline; lower health raises disease risk. Death rolls are separate from the five ordinary events.
- Retirement opens at 65, and death opens succession at any age. Choose any eligible child; if there are no eligible children, choose a sibling. With neither, give the legacy to a random child aged 6–12 with natural ratings and a different surname. At 85, retirement from the playable chapter is required; it does not kill the retiring character. Family members can live beyond 85. The heir preview stays the same across menu visits and reloads.
- Heirs keep their age, stats, affinity, height, identity, and personal resources. Child and sibling heirs keep your family surname regardless of gender. A sibling handoff preserves the existing parents and remaining siblings; a previously played character cannot receive another handoff. Newly born/adopted children record known parent IDs, allowing the current partner to remain a parent after a child handoff when that relationship is recorded. Old saves do not guess unknown parentage.
- The entire estate is divided equally among eligible living children, including those not selected as the next player. With no children, the chosen sibling or unrelated child receives the whole estate. Inheritance supports their lifestyle, and the history records previous chapters.
- Automatic local browser saves, JSON export/import, keyboard-accessible controls, and responsive layouts.

## Deliberately simple rules

Only lifestyle (1–10) is shown for finances. The engine keeps financial reserves internally so career success, family size, and inheritance have consequences. A new role affects lifestyle when the year advances. There is no debt system.

New trainable ratings use `clamp(5 + 0.8 * aptitude + normalDraw * 2, 1, 10)`. Health, mental stability, and general appearance use mean 5 and noise SD 2; known-parent appearance uses the parental mean plus noise SD 1.5. Inherited aptitudes use symmetric rounding, avoiding upward bias across generations. From school onward, annual practice is centered on focus 3; toddler practice uses the balanced allocation described below. More relevant practice tends to raise a rating, less tends to lower it. Aptitude strengthens gains and buffers losses, while a weak innate tendency and yearly randomness prevent uniform paths. Responsiveness slows with age, but skills remain changeable throughout life. [development.js](development.js) defines the coefficients and fitted childhood event corrections.

At ages 2–4, the balanced activity allocation is Play 3, Electronics 2, Family time 2, Rest 3, and Arts & crafts 2. Raw per-point effects are Play: strength +0.10 and social +0.055; Electronics: intelligence +0.09 and social −0.055; Family time: intelligence +0.02, social +0.055 and mental stability +0.035; Rest: health +0.10 and mental stability +0.08; Arts & crafts: creativity +0.11. Play and Electronics do not directly train creativity. Skill practice subtracts the balanced allocation's contributions before the existing aptitude, childhood responsiveness, innate tendency and balancing adjustments. Toddler wellbeing centers Rest on 3 and Family time on 2; each unused point adds +0.04 mental stability. Rest's health coefficient is twice its previous value.

The choices-box impact list uses the net changes from `annualForecast`: player stats and lifestyle, plus each living parent's mental stability, relationship, and lifestyle. Dad/Mom labels distinguish parent effects, including opposing changes. Absolute changes below 0.15 show one sign, 0.15 to below 0.30 show two, and 0.30 or more show three. Infant parent mental stability uses wider cutoffs of 0.9 and 1.5 so cry levels 1–5 show **+, 0, -, --, ---** before rating limits reduce an effect; its zero rows remain visible. Other zero changes are omitted. The list includes background development, unused-point rest, and expiring effects, but excludes random outcomes. It updates when cry/focus choices change without consuming RNG, and is hidden while an event/education decision, succession, or an ended life blocks progression. At age 5, Arts & crafts points transfer to Yourself, then School, Friends and Family as capacity allows, preserving the 12-point total and 5-point cap. The completed toddler review retains the choices used before that transition.

For ages 0–1, practice starts with `0.02 * (cryLevel - 3)`; a child you raise also receives `0.02 * (familyFocus - 3)` before aptitude and age responsiveness. Let `intensity = (cryLevel - 1) / 4`. Health and mental stability move toward fitted central values; crying adds `0.06 * (intensity - 0.5)` to health. Each living parent's mean mental-stability changes at cry levels 1–5 are **+0.2, 0, -0.6, -1.2, and -1.8**, before variation and rating bounds. Mean parent-relationship change remains `0.20 * (cryLevel - 3)`: −0.4, −0.2, 0, +0.2, or +0.4. Level 3 has no routine relationship noise, though events can still change it. New parent relationships center at 8 with SD 1, capped to 5–10. From age 2, a parent's mean relationship change is `(familyFocus - 2) * 0.08`, and mental stability change is `0.08 * (5 - stability) + 0.025 * (familyFocus - 3)`. All ratings remain bounded to 1–10.

Height is the only displayed percentile. It uses `100 × Φ((height - sameAgeMean) / sameAgeSD)`, where `Φ` is the standard normal CDF, against simulated lives of the same growth profile and age. The internal calibration API still computes the other eight ranks, but they are hidden. Reading ranks never changes the save or consumes gameplay RNG.

The generated reference used 4,000 seeded lives, 2,000 per growth profile, with cry level 3 through age 1, the balanced five-activity allocation at ages 2-4 and focus 3 in each area from age 5, and uniformly selected event choices from an independent seeded stream. Each age includes everyone still alive then; 3,959 survived to 18. All seven observed under-18 means range from 4.9375 to 5.0719. At 18, means range from 4.9912 to 5.0241; trainable-skill SDs range from 2.0933 to 2.1857, attractiveness SD is 1.9896, health SD is 0.6900, and mental stability SD is 0.6051. Age-18 height mean/SD is 68.44/3.30 inches for the male growth profile and 63.20/3.02 inches for the female profile. Player height ranks use the relevant age's reference until 18, even after early maturity; NPC height ranks retain their age-specific LMS reference until maturity. These distributions describe game lives, not measured human abilities.

Reproduce the reference with `node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001` (`--samples` is per profile). This regenerates `percentile-reference.js`; add `--fit` to refit `development.js` after changing simulation rules. The generated file records the cohort policy, fitted constants, and reproduction command.

The annual forecast previews mean routine development, finances, family aging, and expiring effects without consuming randomness. Actual gains and losses receive seeded normal variation, so the same save produces the same next year. Skill-change SD is `0.06 + 0.20 * abs(meanChange)`; appearance uses a baseline SD of 0.04 plus 30% of any age-related decline; health and mental stability use 25% plus 0.02; relationships use 20% plus 0.01. Residuals are capped at three standard deviations. These abstract stat distributions are gameplay calibration, not measured distributions of human intelligence or appearance. Random events, deaths, new relationships, births, and unresolved decisions are excluded. The year review records actual before → after values plus journal events; later decisions add their effects afterward.

Height uses [WHO infant length references](https://www.cdc.gov/growthcharts/who-data-files.htm) and [CDC stature-for-age data](https://www.cdc.gov/growthcharts/cdc-data-files.htm) for annual growth. Source tables remain in centimetres; generated measurements and yearly gains convert to stored inches. Birth length varies around the reference median and scale. Each year adds an age-appropriate gain shaped by inherited `growthFactor`, health, and fresh seeded variation. Adult height is the result when growth stops between 14 and 18; it is never chosen in advance. Health below 5 reduces that year's gain by up to 15% at health 1, including the final growing year. Recovery affects future growth without repaying missed growth; height never shrinks or jumps toward a target. Percentile comparisons never control growth. The direction follows [WHO's account of nutrition and illness affecting growth](https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell); numerical rules are game calibration, not clinical predictions. Growth profiles remain separate from gender identity and pregnancy capability.

Each parent's saved career records focus from 0–5 (new parents start at 1–5), employment status, progress, and years. Seeded career growth and promotions can raise household lifestyle, while job loss and recovery can interrupt that trend. Health and mental stability 5 are neutral for employment adjustments. Parents and the under-18 player share the household result. These are game rules, not measured earnings forecasts; no income amounts are shown.

Annual mortality uses the [SSA 2023 period life table published with the 2026 Trustees Report](https://www.ssa.gov/oact/STATS/table4c6.html), taking the equal-weight mean of male and female rates at each age as a representative US baseline. The game has no country or medical-history model; gender identity and pregnancy capability do not choose a mortality table. At health and mental stability 5, risk matches the baseline. Lower health increases the disease/natural-cause hazard; adult mental stability has a smaller effect on accident hazard. A child's own mental stability or cry level never directly changes accident risk.

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

Job skill affinities run from +1 (useful) to +3 (central), and their relative weights determine skill fit and job-related development. These describe what a role uses; a character’s own −3 to +3 natural aptitude affects starting ability and response to practice. Job lifestyle ratings and education requirements are fictional balancing values for this framework.

Existing saves and JSON backups upgrade automatically to schema v11. Existing toddler allocations gain `creative: 0` without redistributing their points. Stats, RNG, relationships, careers, pending decisions, pregnancy, and year reviews are preserved. Pre-v10 centimetre measurements still convert to inches exactly once; v10 heights remain unchanged. Ratings are never reset or rescaled. Saved reviews retain the completed year's cry level or focus and work label; historical age-two crying remains accurate, and `Play` marks toddler choices even after school starts. Historical four-key toddler reviews retain Explore; new five-key reviews show Electronics and Arts & crafts. Older summaries show no invented choices. Relationship annotations affect rendered prose only, preserving stored names and history. Earlier migrations remain compatible. The browser key stays `lifelines.save.v1`; the release cache token is `readable-ratings-1`.

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

The readability and crying update passes all 235 tests on Node 24.14.0, including 60 DOM checks. The infant parent mental-stability curve changes, and the 4,000-life reference has been regenerated; schema 11 and existing saved ratings remain unchanged. A real-browser phone-layout check could not be completed because the browser access host is unavailable; DOM checks do not establish visual verification. All 17 local HTTP assets returned 200 and matched disk. GitHub Pages deployment of commit `5541cb8` was verified successfully, with the updated live files matching the release.

## Source and deployment

- `engine.js`: deterministic simulation, surnames, college, job offers, events, saves, and retirement inheritance.
- `development.js`: natural starting ratings, lifelong focus/aptitude development, and childhood wellbeing mean reversion.
- `percentiles.js`: normal CDF for percentile calculations.
- `percentile-reference.js`: generated same-age cohort references and reproduction metadata.
- `scripts/calibrate-percentiles.mjs`: offline development fitting and reference generation.
- `parent-careers.js`: parent career progression, employment events, and household lifestyle.
- `jobs.js`: 100 career titles, skill affinities, lifestyle ratings, and entry requirements.
- `events.js`: 136 personal events, age/context eligibility, and independent probabilities.
- `family-events.js`: 40 parent/partner/child events with person-specific odds and outcomes.
- `mortality.js`: sourced age-specific baseline, stat modifiers, and one annual competing-risk death roll.
- `growth.js`: WHO/CDC annual growth references, NPC height percentiles, maturation, and annual variation.
- `relationships.js`: dating, pursuit, marriage, pregnancy, and attractiveness-aging rules.
- `app.js`: UI, actions, local persistence, and import/export.
- `display.js`: one-decimal stat ratings and feet/inches display formatting.
- `narrative.js`: relationship annotations for known names in rendered stories.
- `styles.css`: responsive layout and visual design.
- `index.html` and `favicon.svg`: static entry point and branding.
- `test/`: engine and DOM integration tests.

This uses the same deployment pattern as **Depths**: a separate public GitHub repository, GitHub Pages serving the root of `main`, and `.nojekyll`. Pushes to `main` automatically redeploy.

```sh
git add app.js display.js engine.js development.js percentiles.js percentile-reference.js parent-careers.js narrative.js scripts jobs.js events.js family-events.js relationships.js mortality.js growth.js styles.css index.html favicon.svg README.md HANDOFF.md AGENTS.md test package.json package-lock.json .gitignore .nojekyll server.mjs
git commit -m "Describe the change"
git push origin main
```

Check deployment with `gh api repos/adaford/lifelines/pages/builds/latest`. Game progress stays in the player’s browser, not in GitHub. Exports can move a save between devices; the prototype has no accounts or cloud synchronization.
