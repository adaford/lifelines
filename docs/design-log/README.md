# Design log

Every design change to Lifelines since 1 November 2026 has one record here, numbered in the order the changes were made (001 is the oldest, 043 the newest). A record says what the rule is, what it replaced, what has to be preserved, and how the change was validated. The records are the owner's decisions as they were written at the time, so their text is left alone.

Rules that predate the log are in [`docs/original-spec/`](../original-spec/): [agent-rules.md](../original-spec/agent-rules.md), [game-rules.md](../original-spec/game-rules.md) and [handoff.md](../original-spec/handoff.md).

## Reading the log

- **Newer wins.** When two records disagree, the higher number is the rule. When a record disagrees with the original spec, the record is the rule. The tested code is what the game actually does; if it disagrees with a record, raise the mismatch instead of quietly changing either side.
- **Read an area newest first.** Find the area below, then read its records from the highest number down. Stop when the older ones only repeat what you already know.
- **Counts are snapshots.** Test totals, event totals, schema numbers and cache tokens inside a record describe the day it was written. Check the code for today's values.
- **Old paths have moved.** Records written before 22 November 2026 mention snapshot folders under `.git/`. The frozen runtimes that tests still use now live in `.baselines/` under shorter names (for example `.git/life-realism-baseline` is `.baselines/life-realism`); the other snapshots, logs and per-release tools were archived outside the repository. `README.md`, `AGENTS.md` and `HANDOFF.md` in those records mean the old long versions, whose text is now in this log and in `docs/original-spec/`.

## Adding a record

When a change alters how the game behaves or looks, add `042-<short-slug>.md` (then the next number, and so on) with the title and date as its heading, in the same shape as the existing records: the rule as it now stands, what it supersedes, what stays untouched (saves, RNG, IDs), and one short validation paragraph. Then add the record to the table at the bottom of this file and to each area it belongs to. If it replaces an earlier rule, say so in both the new record and the area list.

## Records by area

Each list is newest first. Code paths are the usual places to look, not a complete list.

### Saves and schema

Code: `save-schema.js`, `validateSave` and `migrateSave` in `engine.js`.

- Records: 042 (old-save compatibility no longer required during development; optional school stage records), 040, 038, 037 (resource ceiling, modifier records), 036 (optional college, sport and housing fields), 035 (optional career fields), 030 (optional fame fields), 022 (optional cause text), 016 and 015 (effect fields), 011 (schema 20: one-time perk affinity conversion), 007 (schema 19: school record), 002 and 001 (schema 17).
- Almost every record ends with a paragraph on what a loaded save must keep. Read that paragraph in any record you rely on.
- Original spec: "Code structure and save contract" in handoff.md; the long migration paragraph near the end of "Deliberately simple rules" in game-rules.md.

### Ratings, development and balance

Code: `development.js`, `rating-changes.js`.

- Records: 042 (balance.js constants; birth ratings near N(5, 1)), 034 (focus-driven gains and losses halved), 020 (ratings change only for a cause), 005 (stronger choices, smaller random residuals), 004, 003 (directional rating response).
- 020 removes the passive drift, childhood offsets and wellbeing targets described in 004 and throughout the original spec, and disables `--fit` in the calibration script.
- Original spec: "Character development and lifestyle" in handoff.md; "Deliberately simple rules" in game-rules.md.

### Focus, activities and choice previews

Code: `focus-rules.js`, `choice-impacts.js`, `development.js`.

- Records: 042 (school budget 9; Friends, Family and Yourself effects; caregiver Health), 041 (toddler activity order), 037 (adult focus normalization), 034, 016 (stacking capacity and minimums), 015 (temporary focus-point effects), 007 (school budget and activity focus), 006 (toddler Electronics and Family time curves), 002 (base rules: 0-4 points, neutral 2, budgets, the shared curve).
- Original spec: the focus and preview bullets of "Preserve the game's intent" in agent-rules.md.

### School

Code: `school.js`.

- Records: 042 (stage GPAs, end-of-stage rewards, first-year offers, training from success stats), 028 (expected activity success), 021 (random invitation sizes), 019 (Lifestyle-based invitations), 014 (expected GPA, inactivity effects), 013 (letter grades for activities), 010 (sport variety), 009 (participation units, height advantages, unrated first year), 007 (grades and enrollment).
- Offer counts changed three times: five per category in 007, three in 010, Lifestyle-based in 019, and a random size around a Lifestyle median in 021. 009 replaces the activity training scale and starting success of 007.
- School-linked events: 033, 015.

### College and housing

Code: `college.js`, `college-sports.js`, `housing.js`.

- Records: 037, 036.

### Careers and Lifestyle

Code: `jobs.js`, `career-profiles.js`, `career-rules.js`, `parent-careers.js`, `lifestyle.js`.

- Records: 037 (resource ceiling), 035.
- Original spec: "Household lifestyle" and "Careers and education" in handoff.md.

### Events: catalog, odds and outcomes

Code: `events.js`, `family-events.js`, `life-events.js`, `life-event-bridges.js`, `cross-aptitude-events.js`, `event-rates.js`.

- Records: 042 (stat-driven odds curve, two-way pools, random-event split and ratio, repeat suppression, household events, choice trade-offs), 041 (stories of at most two sentences), 039 (only events with a real consequence), 034 (life-stage coverage), 033 (deadline event costs a focus point), 032 (an event never changes its own causal stat), 029 (selective mental-stability effects), 025 (realistic causes), 018 (frequent events at very low stats), 017 (mental-stability event tiers), 016 and 015 (focus-related events), 012, 006 (events are concrete incidents), 003 (permanent changes, rare cross-stat affinity events).
- 029 replaces the incidental mental-stability amounts of earlier event rules. 033 gives the deadline event a focus-point cost, replacing the earlier instruction to leave it without an effect. 039 withdraws earlier frequency promises that relied on empty events.
- Original spec: "Events and decisions" and "Abandonment and care by relatives" in handoff.md; the event bullets of "Preserve the game's intent" in agent-rules.md.

### Events: how they are shown

Code: `app.js`, `event-causes.js`, and the render-only lookups `event-copy-history.js`, `life-event-copy-history.js`, `life-event-bridges-history.js`.

- Records: 042 (timed lines read "this year", highlighted cause notes), 041 (saved long stories map to short ones), 039 (review colors, focus-only outcomes), 031 (one line per effect), 027 (chronological year reviews), 023 (short cause notes), 022 (cause capture), 016 (colored changes).
- 023 replaces the wording of the cause notes introduced in 022.

### Fame

Code: `fame.js`, `fame-events.js`.

- Records: 037, 036 (college teams), 032 (fame rises and falls through focus, not through fame events), 030.

### Perks, affinities and genetics

Code: `birth-conditions.js`, `genetics.js`.

- Records: 040 (perks can push affinity beyond ±3), 038 (inherited ratings and affinities, perk odds from parents), 034 (48 birth profiles), 024 (clearer names and limit wording), 011 (perks change affinities, never ratings), 006, 001 (base rules).
- 011 replaces the birth stat bonuses of 001 and the inline stat effects of 006. 040 replaces the ±3 clamp of 011.
- Original spec: "Birth conditions" in game-rules.md and handoff.md.

### Dating, family and succession

Code: `relationships.js`, `genetics.js`, `engine.js`.

- Records: 038 (dating potential, inheritance), 032 (encounter and proposal outcomes).
- Original spec: "Relationships and children", "Retirement and inheritance" and "Abandonment and care by relatives" in handoff.md.

### Growth, mortality and percentiles

Code: `growth.js`, `mortality.js`, `percentiles.js`, `percentile-reference.js`, `scripts/calibrate-percentiles.mjs`.

- Records: 043 (lifespans tuned to the US life table; slower old-age decline), 042 (low-Health deaths at any age), 038 (height inheritance), 020 (the reference is regenerated without fitting), 008 (health and height).
- Original spec: the growth paragraphs of "Character development and lifestyle", plus "Simulated percentiles and calibration" and "Mortality and annual reviews", in handoff.md.

### Interface

Code: `app.js`, `styles.css`, `display.js`, `profile-view.js`, `narrative.js`, `choice-impacts.js`.

- Records: 042 (parent Health, aligned parent bars, Career-tab GPA), 041, 039, 038 (dating potential and profiles), 036 (college and housing screens), 035 (career cards), 031, 030 (fame panel), 028, 027, 024, 023, 022, 016, 014, 013, 011 (perk rows).
- Original spec: "Preserve the game's intent" in agent-rules.md is the main layout specification; see also "Designed for phones" in game-rules.md and "Interface and validation" in handoff.md.

### Code structure

- Records: 037 (correctness audit), 026 (`save-schema.js`, `profile-view.js`, shared development helpers).

## All records

Newest first.

| No. | Date | Record | Areas |
| --- | --- | --- | --- |
| 043 | 24 November 2026 | [Realistic lifespans](043-realistic-lifespans.md) | Mortality, growth |
| 042 | 24 November 2026 | [Stat-driven events, household events, low-health deaths and school stages](042-stat-driven-events-and-school-stages.md) | Events, focus, school, mortality, interface, saves |
| 041 | 14 November 2026 | [Concise event stories and toddler activity order](041-concise-event-stories-and-toddler-order.md) | Events, focus, interface |
| 040 | 14 November 2026 | [Perks can extend affinity beyond ±3](040-perk-affinity-overflow.md) | Perks, genetics, saves |
| 039 | 14 November 2026 | [Parent review colors and consequential events](039-parent-review-colors-and-consequential-events.md) | Events, interface |
| 038 | 14 November 2026 | [Dating potential and inherited traits](038-dating-potential-and-inherited-traits.md) | Dating, genetics, perks, growth |
| 037 | 14 November 2026 | [Comprehensive correctness audit](037-comprehensive-correctness-audit.md) | Focus, college, fame, saves |
| 036 | 14 November 2026 | [College choices, sports and housing](036-college-sports-and-housing.md) | College, housing, fame |
| 035 | 13 November 2026 | [Career potential and logarithmic Lifestyle](035-career-potential-and-logarithmic-lifestyle.md) | Careers, Lifestyle |
| 034 | 13 November 2026 | [Life-stage event coverage, realistic birth profiles, and slower focus changes](034-life-stage-events-birth-profiles-slower-focus.md) | Events, perks, ratings |
| 033 | 12 November 2026 | [Earlier extracurricular deadline has a time cost](033-extracurricular-deadline-time-cost.md) | Events, school |
| 032 | 12 November 2026 | [Events cannot change their own causal stat](032-events-cannot-change-their-causal-stat.md) | Events, fame, dating |
| 031 | 12 November 2026 | [One line per event effect](031-one-line-per-event-effect.md) | Events, interface |
| 030 | 12 November 2026 | [Fame through activities and public life](030-fame.md) | Fame, events, interface |
| 029 | 12 November 2026 | [Selective mental-stability event effects](029-selective-mental-stability-event-effects.md) | Events |
| 028 | 12 November 2026 | [Expected activity success](028-expected-activity-success.md) | School, interface |
| 027 | 12 November 2026 | [Chronological year reviews](027-chronological-year-reviews.md) | Interface |
| 026 | 12 November 2026 | [Small structural refactor](026-small-structural-refactor.md) | Code structure |
| 025 | 12 November 2026 | [Realistic event causes](025-realistic-event-causes.md) | Events |
| 024 | 12 November 2026 | [Clearer perk names and focus limits](024-clearer-perk-names-and-focus-limits.md) | Perks, interface |
| 023 | 12 November 2026 | [Concise event cause notes](023-concise-event-cause-notes.md) | Events, interface |
| 022 | 12 November 2026 | [Visible stat influences on events](022-visible-stat-influences-on-events.md) | Events, interface |
| 021 | 12 November 2026 | [Random school invitation sizes](021-random-school-invitation-sizes.md) | School |
| 020 | 12 November 2026 | [Ratings require a cause](020-ratings-require-a-cause.md) | Ratings, percentiles |
| 019 | 12 November 2026 | [Lifestyle-based school invitations](019-lifestyle-based-school-invitations.md) | School |
| 018 | 11 November 2026 | [Frequent events for very low stats](018-frequent-events-for-very-low-stats.md) | Events |
| 017 | 11 November 2026 | [Mental-stability event variety](017-mental-stability-event-variety.md) | Events |
| 016 | 11 November 2026 | [Stacking focus capacity and colored changes](016-stacking-focus-capacity-and-colored-changes.md) | Focus, events, interface |
| 015 | 3 November 2026 | [Focus-driven school events](015-focus-driven-school-events.md) | Events, focus, school |
| 014 | 3 November 2026 | [Expected GPA and activity inactivity](014-expected-gpa-and-activity-inactivity.md) | School, interface |
| 013 | 3 November 2026 | [Sports and extracurricular letter grades](013-activity-letter-grades.md) | School, interface |
| 012 | 3 November 2026 | [Playgroup musician reward](012-playgroup-musician-reward.md) | Events |
| 011 | 3 November 2026 | [Perk affinities and readable profiles](011-perk-affinities-and-readable-profiles.md) | Perks, saves, interface |
| 010 | 3 November 2026 | [Sport variety and three annual offers](010-sport-variety-and-annual-offers.md) | School |
| 009 | 3 November 2026 | [Activity participation and height advantages](009-activity-participation-and-height-advantages.md) | School |
| 008 | 3 November 2026 | [Gentler health effects on height](008-gentler-health-effects-on-height.md) | Growth |
| 007 | 3 November 2026 | [School grades and enrollment](007-school-grades-and-enrollment.md) | School, focus, saves |
| 006 | 3 November 2026 | [Event and toddler activity update](006-event-and-toddler-activity-update.md) | Events, focus, perks |
| 005 | 2 November 2026 | [Choice balance](005-choice-balance.md) | Ratings, focus |
| 004 | 1 November 2026 | [Childhood background deductions](004-childhood-background-deductions.md) | Ratings |
| 003 | 1 November 2026 | [Current event and rating rules](003-event-and-rating-rules.md) | Events, ratings |
| 002 | 1 November 2026 | [Current focus rules](002-focus-rules.md) | Focus |
| 001 | 1 November 2026 | [Birth conditions](001-birth-conditions.md) | Perks |
