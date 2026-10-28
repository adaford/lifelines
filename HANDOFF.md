# Lifelines development handoff

Updated 28 October 2026 for the growth-years release (schema v8). Lifelines is a playable, phone-first, generational life simulator inspired by the yearly structure of BitLife. The next developer should extend the existing framework while preserving its saves, lifestyle-only presentation, and GitHub Pages deployment.

The earlier gameplay baseline was commit **4da3288**; **6e56897** added portable cloud instructions. This release extends family mortality and yearly reviews with Mom/Dad roles, gender labels, mental stability wording, mature starting appearance, sourced height percentiles and curves, stochastic development, and visual forecast segments. Cloud setup observations below remain historical records from 26 October. Record the final tested/deployed commit with the release result.

## Project access and current status

| Item | Location or status |
| --- | --- |
| Live game | https://adaford.github.io/lifelines/ |
| Source repository | https://github.com/adaford/lifelines |
| Release branch | main |
| Hosting | GitHub Pages, repository root, with .nojekyll |
| Local checkout used so far | C:/Users/forda/OneDrive/Desktop/Lifelines |
| Cloud environment | lifelines, published privately in the owner's ChatGPT account |
| Runtime | Node.js 24 for development and tests; static browser files in production |
| Save schema | Version 8; browser key remains lifelines.save.v1 |
| Automated checks | 159 tests passed on Node 24.14.0; local HTTP assets returned 200 |

Read [AGENTS.md](AGENTS.md) before changing the project and [README.md](README.md) for the detailed current rules. Game progress lives in the player's browser, not in GitHub or the coding environment.

## Product requirements to preserve

- Design for phones: a compact single-column game, touch controls, and bottom navigation.
- The player starts at age 0 and advances exactly one year per turn. Choices and character development influence probabilities rather than guaranteeing an event every year.
- Show financial circumstances only as **lifestyle 1–10**. Do not add visible salary, annual income, spending, savings, or inheritance amounts.
- Use **mental stability 1–10**, with higher being better. Keep the internal `stability` save key. Discipline and relaxation are not traits.
- Babies share the adult stat set. Intelligence, strength, social ability, and creativity start low with permanent **−3 to +3 growth affinity**; attractiveness starts near its inherited mature level with no routine positive growth.
- Child lifestyle follows the parent household until adulthood.
- Family focus improves family relationships and children’s development. Parents, children, and partners are individual characters with their own visible stats and bonds.
- Preview mean routine changes with green/red segments inside stat bars, without numerical forecast deltas or RNG consumption. Persist actual numerical year reviews until dismissed.
- Apply annual age/stat-based mortality to the player and active family. Preserve generational play after early death; age 85 requires retirement, not automatic death.
- Keep the player's family surname through male and female heirs. Split a parent's inheritance equally among eligible children, regardless of which child becomes playable.
- Show gender beside the name while keeping identity, growth-reference profile, attraction, and gestation separate. New games default male; a gender-selection flow is future work.

These are established user preferences, not suggestions to replace with a different design.

## Playable life cycle

| Stage | Current behavior |
| --- | --- |
| New game | A family surname is required in the UI; capitalize its first letter and preserve multiword names. First name is optional. Generate Mom and Dad with random bonds near 8 and an age-0 character with varied birth length. |
| Ages 0–2 | Choose cry level 1–5. Higher levels increase development and parent bonds, while reducing parent mental stability. Parent wellbeing shapes automatic childhood events. |
| Ages 3–17 | Allocate focus to school, friends, family, and self; develop skills and experience personal and parent events. |
| Age 18 | Pause for college or a saved shortlist of 10 jobs. Selecting a job chooses the workforce path. |
| College | Four yearly advances; study focus develops skills. Graduation produces a saved shortlist of 15 jobs, including degree-based opportunities. |
| Adulthood | Work, meet prospective partners, date, marry, have or adopt children, and respond to personal and family events. |
| Age 65 onward | Optional retirement into an eligible child, otherwise sibling, otherwise an unrelated low-stat child. |
| Any age | Player death opens succession immediately. Active family members also face annual mortality. |
| Age 85 | Mandatory retirement and succession; a surviving retiree can remain alive in the heir's family. |

Unresolved event decisions block ordinary progression and career/family actions. A required education decision blocks the next year. Voluntary retirement also waits for pending decisions and an active pregnancy to finish. Player death clears ordinary pending outcomes so succession cannot become blocked. A carrier's death ends the pregnancy; a due baby carried by another surviving parent can arrive before handoff.

## Character development and lifestyle

The five displayed stats are intelligence, strength, attractiveness, social ability, and creativity. Four trainable skills begin at 1.0–1.5. Attractiveness starts near the family level: general random appearance uses a normal distribution centered at 5.5 with SD 1.5, and newborns with known parents inherit their mean appearance plus SD 0.7 variation. Values are clamped to 1–10. Health starts at 7–9.5 and mental stability at 8–10. The engine retains two-decimal precision while most current values display one decimal.

Trainable-skill growth uses **1 + affinity × 0.18**, from 0.46 at affinity −3 to 1.54 at +3. Affinities derive from both parents with small variation. Appearance retains an affinity field for save consistency, but ordinary growth, focus, jobs, and crying do not increase it. Health and mental stability are wellbeing meters. Height has its own reference curve and does not use skill affinity.

From age 3, work/school, social, family, and self each take an integer focus from 0 to 5, sharing a **12-point budget**. Unused focus contributes to rest through mental stability; it does not create a relaxation trait. A living parent's yearly bond change is `(familyFocus - 2) × 0.08`, and their mental stability change is `-0.04 + familyFocus × 0.025`.

During infancy, `intensity = (cryLevel - 1) / 4`. Mean trainable-skill gain is `0.13 + 0.19 * intensity` before affinity; health gain is `0.06 + 0.06 * intensity`. Each living parent's mean mental stability change is `0.20 - 2 * intensity ** 1.35`, reaching −1.8 at level 5, and mean bond gain is `0.08 + 0.32 * intensity`. New parent bonds use `clamp(8 + normalDraw, 5, 10)`, with standard-normal draws capped at −3/+3. Original parents have explicit `parentRole` values `mom` and `dad`, with female and male identities respectively. Existing bonds and identities are not rerolled. Legacy `setBabyChoice` maps quiet/cry to levels 1/5; the UI uses `setCryLevel`.

Actual routine changes receive seeded normal residuals: skill SD is `abs(change) * 0.18`; appearance decline SD is `abs(change) * 0.30`; wellbeing SD is `abs(change) * 0.25 + 0.02`; bond SD is `abs(change) * 0.20 + 0.01`. Residuals are bounded to three standard deviations and final values to 1–10. These game distributions vary development around mean changes; they are not empirical estimates of human ability. The preview supplies no random draws; tests can use `growthRandom: () => 0` to isolate mean development.

[growth.js](growth.js) uses [WHO infant length data](https://www.cdc.gov/growthcharts/who-data-files.htm) at birth and 12 months and [CDC 2000 stature-for-age data](https://www.cdc.gov/growthcharts/cdc-data-files.htm) from age 2 to 20. Annual LMS rows interpolate CDC half-month rows to exact birthdays. The local height scale is `M * S`; the LMS transform and a normal CDF yield percentile. Infant measurements are recumbent length, followed by standing stature from age 2. Percentiles stop at `maturityAge`.

Each person persists `growthSex`, `maturityAge`, `birthHeight`, `adultHeight`, and `growthAnchor`. Newborn length uses the reference median plus a normal draw times its local scale. With known parents, adult-height target z-score is `0.7 * mean(parentZ) + 0.87 * normalDraw`, preserving approximately unit population SD; otherwise it uses a fresh normal draw. Maturation centers at 15 for the female growth profile and 17 for the male profile, with SD 0.7, rounded and clamped to 14–18.

The height curve blends birth and adult z-scores through age 3 with variance normalization, then follows the age-specific reference median and local scale. It keeps rapid infant growth and shifts pubertal timing after age 8. The small gap between the reference population at 15/17 and adult height is distributed across the last three growth years. Annual knots are monotone, reach the fixed target at maturity, and receive small seeded residuals that fade toward that target. This retains age-appropriate childhood height dispersion. Annual interpolation, maturity timing, inheritance weights, and growth-velocity SDs are game approximations, not an individual clinical prediction. Growth profile is separate from gender identity and gestation.

Initial parents share a household lifestyle from 2–8. Under-18 players and dependent children follow their household's lifestyle. Adult lifestyle combines career performance, internal reserves, family costs, and temporary event modifiers, bounded to 1–10. A living partner costs one level; each living child under 18 costs another level. Each dependent child adds effective social ability +0.2, capped at +1.2.

Internal money, income, expenses, and inheritance values remain necessary simulation state. They are deliberately hidden from the player. Reserve-supported lifestyle gradually declines through upkeep; there is no debt system.

## Careers and education

[jobs.js](jobs.js) contains **100 jobs across 10 categories**, including **45 degree-gated roles**. Each job defines a stable ID, title, category, description, minimum age, stat requirements, skill affinities, normalized weights, college requirement, base lifestyle, and internal base salary.

Job affinities of **+1 to +3** describe which skills the job uses. They are different from the character's **−3 to +3** growth affinities. Job performance uses effective skill fit, work focus, experience, and a low mental stability penalty.

Offer lists are persistent and do not reroll when opening a menu or reloading. They include an accessible starting role but can also contain aspirational roles whose age or skill requirements are not yet met. Career changes are limited to the current saved shortlist. College blocks full-time job selection. Choosing the workforce path without a job is possible through the engine.

## Events and decisions

There are **176 event definitions**: 136 personal and 40 household events. The household catalog contains 8 parent, 16 partner, and 16 child definitions, with separate rolls for applicable family members. **45 definitions have choices**: 32 personal and 13 household. All parent events are automatic childhood experiences; babies do not make adult caregiving decisions.

Parent event eligibility uses the player's age separately from the parent's age: infancy 0–2, childhood 3–17, or all ages 0–17, with living parents eligible through 120. Parent mental stability, health, social/creative stats, and relationship affect their own event odds. Events cover reassuring care, routines, listening, stress spillover, illness, and recovery through outside help. Stress does not guarantee a negative outcome.

Eligibility and probability depend on age, education, employment, job type, focus, effective stats, and family relationships. Examples include increased injury risk in physical careers, greater scam risk with low intelligence, academic opportunities with high intelligence, and impulsive outcomes with low mental stability. Social focus increases social opportunities and complications. The values are fictional game-balancing rules.

Personal base rates range from 0.6–2.5% and household base rates from 0.8–1.2%, before modifiers. Final per-roll probabilities are capped at 18% for personal and 12% for household events. The intended pacing leaves quiet years common, with roughly one ordinary event every year or two as a balance target, not a guaranteed quota. The earlier 136-event catalog averaged about 0.64 events per year in a historical 300-life check; that result is not a measured average for the current expanded catalog.

The engine calculates event odds from the **start-of-year state**, shuffles eligible rolls, and rolls independently up to a shared **five-event annual limit**. Mortality also uses start-of-year age/stats, with one separate draw per living player, parent, child, sibling, partner, and a pregnancy co-parent outside the household. Routine development and aging run, deaths are applied, then selected ordinary events for surviving subjects resolve. Dating and pregnancy also roll outside the ordinary event limit.

Choices resolve in queue order and carry event/subject IDs so an old click cannot resolve the wrong person's event. Outcomes can permanently change stats or add temporary effects, including lifestyle effects. Matching temporary effects refresh rather than stack duplicates. Choices, effects, and outcomes survive save/reload and appear in the journal. The odds menu calculates ordinary quiet-year probability from missed event rolls and lists annual death risks separately.

## Mortality and annual reviews

[mortality.js](mortality.js) stores exact-age 0–119 death probabilities from the [SSA 2023 period life table in the 2026 Trustees Report](https://www.ssa.gov/oact/STATS/table4c6.html). The equal-weight mean of male/female rates supplies one representative US baseline. The game has no country, medical-sex, or medical-history model; identity and pregnancy capability do not select a mortality table. Beyond the source horizon, the final rate is retained; no birthday guarantees death.

The baseline probability is converted to a hazard and divided between disease/natural causes and accidents. Health scales disease hazard by `exp((7 - health) × 0.14)`. Adult mental stability scales accident hazard by `exp((7 - stability) × 0.035)`; under-18 mental stability never changes accident risk. At health/mental stability 7 the total reproduces the baseline. The competing hazards convert back to one annual death probability, preventing double counting. Stat multipliers and the coarse cause split are game approximations; the split is informed by [NCHS leading causes of death in 2023](https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-010.pdf), not fitted cause-specific rates. These are population-inspired odds, not individual medical predictions.

Deaths store cause/age, appear in history and the year review, stop the person's aging/events, and reduce player mental stability according to the bond. A remembered partner does not block new dating. Player death enables succession at any age; age 85 still requires a playable handoff without marking a survivor dead.

`annualForecast` clones state and runs mean routine growth, finances, family aging, and effect expiration. Its internal result retains effective-stat, lifestyle, and parent deltas, but the UI renders green/red segments in existing bars without numerical forecast changes. It never changes live state or consumes RNG. Routine variation, random events, deaths, new relationships, births, and unresolved choices can make actual outcomes differ. `yearSummary` stores actual numerical changes and journal events; its popup reopens until `dismissYearSummary` persists dismissal. Later decision outcomes are not retroactively added to that initial review.

## Relationships and children

Single adults can meet zero to five prospective partners in a year. Attractiveness, social ability, and lifestyle determine encounter opportunities and influence generated profiles and pursuit success; social focus also affects frequency. At default social focus, minimum desirability ratings yield about 0.22 expected encounters per year and at most one, while maximum ratings yield about 4.6 and at most five.

Profiles show skills, affinities, health, mental stability, age, height, and lifestyle. Each encounter can be pursued as a relationship, approached for a consensual one-night stand, or ignored. Both approaches can be declined. An encounter is consumed once; unanswered encounters expire next year. Starting a relationship closes other invitations.

New relationships start at a random bond of 3–7 out of 10. Dating gives effective social +0.7 and mental stability +0.6; marriage gives +0.9 and +0.8. Family focus develops bond and partner wellbeing. Proposals are limited to once per year. Bond and years together determine acceptance; six years together adds 42 percentage points at the same bond.

Pregnancy base probabilities are 2% yearly while dating, 25% while married, and 1% after an accepted casual encounter, adjusted for the gestating person's age and health. Gestating ages are 18–45. Pregnancy is saved and leads to birth on the next yearly advance. No new pregnancy starts when another exists, when the player is at least 84, or when family capacity is full.

Manual **haveChild** currently means adoption, available from 18 without requiring a partner. There is a six-child cap, an expected baby reserves a place, and only one child arrival is allowed per player age. Children have their own stats, affinities, height, identity, and bond; family focus supports their development. Parent/partner/child events can affect that person, the player, or both. Ending a relationship preserves children and any expected baby. New children record known `parentIds` at birth/adoption so a recorded co-parent can survive a child handoff; older saves do not infer unknown parentage.

Appearance stays at its current level until the requested gender-based threshold: men begin losses in the year 30→31, women in 22→23, and other genders currently default to 30. Mean decline is `-(0.06 + min(40, age - threshold) * 0.0018)` before annual variation. Specific authored events can still change appearance. This is a requested gameplay rule, not a scientific attractiveness standard. `appearanceDeclineAge` is authoritative; `appearancePeakAge` remains in saves for compatibility. Gender appears beside the name. Identity, attraction, growth profile, and pregnancy capability remain separate; there is no new-game gender-selection screen yet.

## Retirement and inheritance

The engine chooses candidates in this order: **eligible children → eligible siblings → unrelated beneficiary**. Eligible means living, younger than 85, and not a previously played character. New games start with no siblings; siblings become available through earlier child handoffs.

With no eligible family heir, the preview generates one child aged 6–12 with a different surname, trainable skills of 1–3, independently generated mature-level appearance, health/mental stability of 2–4, and full affinities. This preview is deterministic across menu visits and reloads and does not consume gameplay randomness.

The internal estate calculation is:

~~~text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate = floor(money × legacy rate)
child share = estate / number of eligible children
~~~

Every eligible child receives exactly the same fractional share, including children not selected as the next player. With no eligible children, the selected sibling or beneficiary receives the whole estate. Do not display these amounts in the game.

An heir retains their age, stats, affinities, height, identity, and own resources, then receives inheritance. The new playable chapter resets career, partner, children, pregnancy, temporary effects, pending choices, focus, cry level, year summary, and education progress; the new player is alive. Adult heirs choose college/work again. Child/sibling heirs retain the family surname regardless of gender; an unrelated beneficiary begins a different family line. The journal and lineage preserve previous chapters. A child handoff preserves the previous player's life/death status and their current partner only when that partner is a recorded co-parent. A sibling handoff preserves existing parents and remaining siblings.

## Code structure and save contract

| File | Responsibility |
| --- | --- |
| [engine.js](engine.js) | Deterministic simulation, public actions, careers/education, family progression, succession, save validation and migration |
| [jobs.js](jobs.js) | Career catalog and requirements |
| [events.js](events.js) | Personal event catalog and probability rules |
| [family-events.js](family-events.js) | Parent/partner/child events, targeted outcomes, and probabilities |
| [mortality.js](mortality.js) | Sourced age baseline, stat adjustments, and annual competing mortality risks |
| [growth.js](growth.js) | WHO/CDC height references, percentile calculation, maturation, and annual height variation |
| [relationships.js](relationships.js) | Encounters, appeal, proposals, pregnancy, and appearance aging |
| [app.js](app.js) | Rendering, action handlers, dialogs, localStorage, save import/export |
| [styles.css](styles.css) | Phone layout, touch targets, safe areas, visual design |
| [index.html](index.html), [favicon.svg](favicon.svg) | Static entry point and branding |
| [server.mjs](server.mjs) | Development-only HTTP server |
| [test/](test/) | Engine, relationships, family events, and LinkeDOM integration tests |

Public engine actions mutate the supplied state and return an ok flag with an optional failure reason. Important entry points include createGame, advanceYear, effectiveStats, setFocus, setCryLevel, annualForecast, dismissYearSummary, heightPercentile, mortalityOdds, chooseEducation, takeJob, eventOdds, resolveEventChoice, respondToEncounter, proposeMarriage, haveChild, successionInfo, succeed, validateSave, and migrateSave. Read-only forecast/odds helpers do not mutate state.

State groups include identity/growth profile, stats/aptitudes, focus/cryLevel, parents/children/siblings, education/jobOffers/job, partner/encounters/pregnancy, effects/pendingEvents, history/lineage, alive/death, yearSummary, and succession flags. Stored seed/rng fields make simulations reproducible. Read-only offer, forecast, and beneficiary previews must not consume live RNG. The journal retains up to 500 entries.

Keep **lifelines.save.v1** as the storage key. Schema version is **8** and migration accepts valid v1–v7 saves. V8 preserves height, RNG, parent bonds, adult appearance, pending choices, pregnancy, careers, and year reviews. It deterministically assigns missing growth metadata and anchors under-18 growth at the saved age/height. Existing adolescents aged 12–17 who are still below their adult target finish at 18, preserving their remaining legacy growth. Old infants under 3 with attractiveness below 3 receive a deterministic correction toward family appearance; other values remain. Parent roles derive from identity without changing it. Earlier migrations retain cry/life-state additions and previous stat, education, surname, and succession conversions. Unknown old child parentage is not reconstructed. Invalid imports must never overwrite a valid existing life.

Preserve stable job/event IDs and queued family subject IDs. New state fields need validation, defaults/migration, and appropriate save round-trip coverage. The static entry point and module imports use the release cache token **growth-years-1**; update cache versions coherently when a release needs to invalidate browser assets.

## Interface and validation

The four bottom tabs are **Year, Career, Family, You**. Year keeps the next-year control near the bottom and shows current stat bars with colored expected-change segments. The header exposes health, mental stability, lifestyle, and gender beside the name. Growing characters show height percentile until their recorded maturity age; adult height is labeled afterward. Babies use cry levels 1–5. Mom/Dad profiles show stats and bonds in Family. The saved year-review popup retains actual numerical changes. More opens help, event/mortality odds, export/import, and new-life controls; encounter profiles remain paginated for phones.

The interface includes 44-pixel focus controls, 16-pixel input text, safe-area spacing, keyboard controls, focus handling, and accessible meters. LinkeDOM checks validate DOM behavior, not real browser layout or touch interactions. A real-browser visual check was not completed for this release. Do not describe this release as visually verified.

Use Node 24 as specified in [.nvmrc](.nvmrc):

~~~sh
npm ci
npm test
npm start
~~~

The preview runs at http://127.0.0.1:4173. There is no production build command, database, or runtime dependency. ES modules require HTTP rather than opening index.html through file URLs. LinkeDOM is a development dependency for UI tests.

Current checks cover newborn skills/affinities, focus budgets, deterministic years and saves, career shortlists/college, probability eligibility and bounds, pending decisions, relationship/pregnancy rules, inheritance and repeated succession, naming, navigation, and save preservation. Expanded checks cover mortality calibration, cry levels and parent bonds/events, forecast purity, saved summaries, early-death handoffs, and pregnancy loss/birth handling. Run relevant checks after code changes; do not add implementation-mirroring tests for prose-only edits.

## Historical cloud setup and deployment handoff

The setup observations in this section were recorded on 26 October 2026. They describe the earlier cloud environment and do not establish current credentials, model-picker state, or release deployment status.

The owner wants to send instructions from the ChatGPT phone app with the PC **off**. Use the published **lifelines Codex Cloud environment**, not a Remote connection to this Windows computer. The GitHub connector is authorized for adaford/lifelines, and the environment is private to the owner.

Verified in that setup:

- The repository was checked out in the cloud at /workspace/lifelines.
- Node 24 and locked dependencies were installed; all 116 tests passed and development HTTP assets were checked.
- Install/start instructions and the environment description were saved, then publication completed. The saved environment appears in Codex Cloud settings.
- The cloud composer then offered **GPT-6 Astra → Ultra**. A picker change was not proven to persist as a global default across navigation or new tasks.

The cloud install script runs npm ci and npm test in the checkout and checks for Node 24. Startup guidance tells each task to read AGENTS.md/README.md, use the existing isolated checkout, and restart development processes when needed.

**Unverified in the historical setup:** direct authenticated push from a cloud task to main and automatic deployment from that push. The prepared verification prompt was not submitted then. Do not infer current write access from successful checkout or from this PC's separate GitHub CLI login. Do not copy the PC's credentials into the cloud.

The next cloud session should verify authentication without printing secrets, check a dry-run push, and confirm access to GitHub's API and the live Pages site. If network configuration is required, the relevant destinations include github.com, api.github.com, and adaford.github.io. Report any connection or permission step that is still needed. See the [official cloud environment guide](https://learn.chatgpt.com/docs/environments/cloud-environments).

For game releases, finish the requested changes and tests, commit only intended files, then push or merge to main. GitHub Pages automatically deploys the repository root using the same pattern as Depths. Verify the deployed commit before reporting success:

~~~sh
gh api repos/adaford/lifelines/pages/builds/latest
~~~

Compare the returned commit with the intended commit, require a successful build, and check the live site. If the cloud task can only create a pull request, state clearly that merging it is still required. The previously published cloud-instruction commit 6e56897 was verified as built successfully from this PC; that is not a cloud push test.

## Remaining scope and suggested next work

The framework is implemented, but it is not a packaged iOS/Android application. There is no app-store packaging, service worker/offline installation flow, player account system, or cloud save synchronization. JSON export/import moves game saves between devices.

Intentional simplifications include no detailed college majors/tuition, spontaneous sibling births, detailed custody/divorce finances, or full independent careers/partners/families for children. Mortality uses a representative US age baseline with simplified health/accident modifiers, not country-specific or diagnosis-specific models. Family actors can survive beyond 85. Heirs do not bring a previously simulated spouse or children into the next chapter, and unknown parentage in old saves is not reconstructed.

The next useful tasks are to verify the cloud release path, test real phone layouts and long dialogs, expose the planned gender/preferences flow, and measure balance across many seeded lives including households. Treat those as follow-up work, not features already delivered. Preserve the existing framework and ask for a new product decision only when the requested change does not settle it.

## Starter instruction for the next coding session

> Work in the published lifelines cloud environment on adaford/lifelines. Read AGENTS.md, HANDOFF.md, and README.md, then implement the requested change. Preserve existing saves, lifestyle-only finances, and the phone layout. Run the relevant tests. For a requested release, commit and publish to main when authorized access is available, verify GitHub Pages deployed that commit, and return the live URL. If cloud write access is unavailable, report the exact missing step rather than claiming deployment succeeded.
