# Lifelines development handoff

Updated 30 October 2026 for lifestyle below the profile identity row and inherited health/mental stability aptitude. Lifelines is a phone-first, generational life simulator. Preserve saves, lifestyle-only finances, and GitHub Pages deployment.

The current update puts lifestyle on its own line below gender and height, leaving seven personal ratings in the top grid. Health and mental stability now also show signed -3 to +3 natural aptitude beside their ratings and use it for routine resilience. Schema 12 adds neutral wellbeing aptitude to existing people without changing saved ratings, prior aptitudes, RNG, or focus. The 4,000-life reference was regenerated and balance refitted in two iterations. All **247 tests**, including **65 DOM checks**, pass after `npm ci` on Node **24.14.0**. All **18 local HTTP assets** returned 200 and matched disk. Phone visual verification could not be completed because the browser access host is unavailable. GitHub Pages deployed commit **5c1973b** successfully (workflow run **41058664148**); all **18 live HTTP assets** returned 200 and matched the release.

Release verification, 30 October 2026: GitHub Pages build and deploy jobs succeeded for gameplay commit **80285d1** (workflow run **41049209978**); all **18 live HTTP assets** returned 200 and matched the committed files. Live game: https://adaford.github.io/lifelines/. The legacy Pages builds endpoint still reported the previous commit, so the exact-commit Actions deployment and live file comparison establish this release.

Prior release verification, 30 October 2026: gameplay commit **a0a2b6a** was pushed to `main` and GitHub Pages reported `built` for that exact commit. The live entry point and seven updated assets returned HTTP 200 and matched the released files at https://adaford.github.io/lifelines/. All 231 tests passed, including 57 DOM checks.

Prior release verification, 30 October 2026: commit **2746c82** replaced stat bars with numeric ratings and combined choice forecasts. GitHub Pages reported `built` for that exact commit; the live entry point, app, engine and stylesheet returned HTTP 200 and matched the released files. Validation: 232 tests including 58 DOM checks, plus 17 matching local HTTP assets. The readability and crying update is verified below.

Prior release verification, 30 October 2026: commit **5541cb8** improved rating bars and height placement and introduced the stepped crying curve. GitHub Pages reported `built` for that exact commit. The live entry point, app, engine, stylesheet and percentile reference returned HTTP 200 and matched the released files. Validation: 235 tests including 60 DOM checks, 17 matching local HTTP assets, and a regenerated 4,000-life reference. Browser visual verification remains unavailable.

The earlier gameplay baseline was commit **4da3288**; **6e56897** added portable cloud instructions. New characters have broad natural ratings across 1–10, with focus and aptitude shaping lifelong gains or losses. Under-18 abilities describe ability relative to peers, not adult knowledge or strength. Only height shows a percentile. Reviews record the choices actually used for the completed year, and stories identify known people's relationships. Blank name fields use defaults. Existing saves, parent ratings, stochastic growth, mortality, and before → after reviews remain. Cloud setup observations below remain historical records from 26 October. Record the final tested/deployed commit with the release result.

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
| Save schema | Version 12; browser key remains lifelines.save.v1 |
| Automated checks | Current wellbeing-aptitude release: all 247 tests pass, including 65 DOM checks, after npm ci on Node 24.14.0. All 18 local HTTP assets match disk; 4,000-life calibration refitted. Browser visual verification unavailable; deployment verified for 5c1973b. |

Read [AGENTS.md](AGENTS.md) before changing the project and [README.md](README.md) for the detailed current rules. Game progress lives in the player's browser, not in GitHub or the coding environment.

## Product requirements to preserve

- Design for phones: a compact single-column game, touch controls, and bottom navigation.
- The player starts at age 0 and advances exactly one year per turn. Choices and character development influence probabilities rather than guaranteeing an event every year.
- Show financial circumstances only as **lifestyle 1–10**. Do not add visible salary, annual income, spending, savings, or inheritance amounts.
- Use **mental stability 1–10**, with higher being better. Keep the internal `stability` save key. Discipline and relaxation are not traits.
- Babies share the adult stat set and 1–10 scale. Before 18, abilities compare with same-age peers: strength 7 means a strong baby. Intelligence, strength, social, and creativity begin near 5 with inherited **−3 to +3 natural aptitude** and random variation; high innate intelligence can start high. Focus can raise skills and neglect can lower them throughout life. Self focus includes exercise. Attractiveness begins near its inherited mature level, fluctuates slightly each year, and has no positive growth trend.
- Balanced simulated lives average about **5/10** in all seven rated stats at 18. New rated stats have broad variation across 1–10; new health and mental stability ratings use `5 + 0.8 * aptitude` plus normal noise with SD 2, bounded to 1-10. Childhood wellbeing returns toward fitted targets rather than rising automatically to 10. Existing saved stats remain unchanged.
- Show percentiles only for height. While alive and under 18, compare the player's measured height with simulated heights of the same age and growth profile. Reads must not consume RNG or change saves; references never control actual growth.
- Child lifestyle follows the shared parent household until 18, with career focus and progress tending to improve it and random job loss causing setbacks.
- Family focus improves family relationships and children’s development. Parents, children, and partners are individual characters with their own visible stats and relationships.
- Separate expected effects into You, Other people, and Relationships inside the choices box, using + to +++ and - to --- relative to other choices for each stat. Omit every zero change and empty group. Infant personal stats show crying contributions without unrelated background development; strength is unaffected. From age 2, retain net routine forecasts. Label parents separately and hide previews while progression is blocked. Forecast reads never consume RNG. Persist actual before → after year reviews until dismissed.
- Keep explanations short and in **?** popups. Explain each rule once; omit repeated labels and tutorial text from stories.
- Show **Dad:**/**Mom:** mental stability and relationship ratings directly on Year as numeric X/10 values with outlined current-rating bars beneath them. Keep full profiles in Family, using the same red-to-green current-rating bars without forecast overlays.
- Adult height must emerge from yearly gains, never a predetermined target. Preserve inherited `growthFactor`, random maturity between 14 and 18, and annual health/random effects; do not shrink height or repay past growth shortfalls.
- Apply annual age/stat-based mortality to the player and active family. Preserve generational play after early death; age 85 requires retirement, not automatic death.
- Keep the player's family surname through male and female heirs. Split a parent's inheritance equally among eligible children, regardless of which child becomes playable.
- Show gender beside the name while keeping identity, growth-reference profile, attraction, and gestation separate. New games default male; a gender-selection flow is future work.

These are established user preferences, not suggestions to replace with a different design.

## Playable life cycle

| Stage | Current behavior |
| --- | --- |
| New game | First name and surname are optional; blank fields use random defaults while a supplied first name is preserved. Capitalize the surname's first letter and preserve multiword names. Generate female Mom and male Dad with distinct first names, relationships near 8, and varied birth length. |
| Ages 0–1 | Choose cry level 1–5. Less crying lowers personal intelligence and mental stability; more raises them. Strength is unaffected. Relationships fall at 1–2, stay routinely steady at 3, and rise at 4–5. Harder crying strains parent mental stability. |
| Ages 2–4 | Allocate 12 activity points among Play, Electronics, Family time, Rest, and Arts & crafts, at most 5 each; the choices box shows the combined expected changes. |
| Ages 5–17 | School begins. Allocate focus to school, friends, family, and self; develop skills and experience personal and parent events. |
| Age 18 | Pause for college or a saved shortlist of 10 jobs. Selecting a job chooses the workforce path. |
| College | Four yearly advances; study focus develops skills. Graduation produces a saved shortlist of 15 jobs, including degree-based opportunities. |
| Adulthood | Work, meet prospective partners, date, marry, have or adopt children, and respond to personal and family events. |
| Age 65 onward | Optional retirement into an eligible child, otherwise sibling, otherwise an unrelated child with natural ratings. |
| Any age | Player death opens succession immediately. Active family members also face annual mortality. |
| Age 85 | Mandatory retirement and succession; a surviving retiree can remain alive in the heir's family. |

Unresolved event decisions block ordinary progression and career/family actions. A required education decision blocks the next year. Voluntary retirement also waits for pending decisions and an active pregnancy to finish. Player death clears ordinary pending outcomes so succession cannot become blocked. A carrier's death ends the pregnancy; a due baby carried by another surviving parent can arrive before handoff.

## Character development and lifestyle

The five displayed skills are intelligence, strength, attractiveness, social, and creativity. New trainable, health, and mental stability ratings use `clamp(5 + 0.8 * aptitude + normalDraw * 2, 1, 10)`, including unrelated beneficiaries. Before 18, these describe ability for the character's age; a gifted infant's rating can be high without implying adult knowledge. General attractiveness centers at 5 with normal noise SD 2. Known-parent appearance inherits the parental mean plus noise SD 1.5. All seven rated stats can span 1–10 at birth. Internal stats retain two-decimal precision; all displayed ratings and before → after values use exactly one decimal, even when a small change rounds to the same displayed number.

Natural aptitude derives from both parents with small variation and symmetric rounding to avoid upward inheritance bias. In [development.js](development.js), school/adult practice is centered on focus 3 and toddler practice on its balanced five-activity allocation: positive effort is multiplied by `1 + aptitude * 0.12`, negative effort by `1 - aptitude * 0.10`. A weak `0.012 * (naturalRating - currentRating)` tendency remains, but there is no fixed final score. Age responsiveness is 1.15 before 18, 1 before 40, 0.85 before 60, then 0.65; practice and neglect can change skills throughout life. Fitted childhood event corrections keep balanced lives near 5 at 18. Childhood health and mental stability revert toward fitted targets with rates 0.06 and 0.08, plus focus effects; toddler Rest centers on 3 and Family time on 2. Appearance retains an aptitude field for save consistency, but practice does not raise its mean. Height does not use skill aptitude.

Health and mental stability use the shared `wellbeingResponse(person, key, amount)` rule for choice-driven routine changes: a positive amount is multiplied by `1 + aptitude * 0.12`, and a negative amount by `1 - aptitude * 0.10`. This covers crying, rest, focus, parent crying, and routine family-care contributions for parents, partners, and children. Childhood mean reversion, age-related decline, and direct event effects are unchanged. An aptitude of 0 preserves the former routine coefficients; higher values support recovery and buffer strain without reversing a gain or loss.

At ages 2–4, five activities each take an integer 0–5 under a **12-point budget**: Play (`work`), Electronics (`social`), Family time (`family`), Rest (`self`), and Arts & crafts (`creative`). The balanced allocation and birthday-two defaults are 3/2/2/3/2 respectively. From 5, four labels become School, Friends, Family, and Yourself, followed by College/Career in adulthood. At the fifth birthday, creative points transfer to self, then work/social/family up to each cap, preserving the point total. Unused focus contributes to rest through mental stability; it does not create a relaxation trait. A living parent's yearly relationship change is `(familyFocus - 2) × 0.08`, and their mental stability change is `0.08 × (5 - stability) + 0.025 × (familyFocus - 3)`.

Toddler activity coefficients are documented in [README.md](README.md). Skill practice subtracts the balanced allocation's contributions, then follows normal aptitude and age rules. Rest's health effect is doubled; Play and Electronics do not directly train creativity. Creative toddler events use the creative key, and social-play events use Play instead of Electronics.

`toddlerActivityEffects(person)` remains a pure simulation helper. The UI reads `choiceImpacts(state)` from [choice-impacts.js](choice-impacts.js), grouping You, Other people, and Relationships and identifying each parent as Dad/Mom. Every zero change and empty group is hidden, including cry level 2 parent mental stability and effects fully blocked at rating limits. During infancy, personal stat entries use `infantChoiceEffects(person)` to isolate crying contributions from background development; strength is always zero. Same-sign effects rank from smallest to largest, capped at three signs: personal intelligence and mental stability show --, -, +, ++, +++ at levels 1–5, and parent mental stability shows +, omitted, -, --, ---. Partial rating-limit clipping does not change relative ranks. Household lifestyle and parent entries retain routine expectations. From age 2, the preview retains net `annualForecast` player/parent changes, including background development and unused-point rest. Sign counts use thirds of the maximum same-direction effect across legal focus allocations, rather than absolute point thresholds. Effects identical across every allocation use one sign. Comparison forecasts are cached while only focus changes; previews never mutate saves or consume RNG. Explanations stay in adjacent ? popups. The player-facing stat label is **Social**, while its save key stays `social`.

During infancy, raw intelligence practice at cry levels 1–5 is **-0.08, -0.04, +0.04, +0.08, +0.12**, followed by aptitude response and the 1.15 childhood multiplier. Social and creativity retain `0.02 * (cryLevel - 3)`; strength has no crying contribution. A child you raise also receives `0.02 * (familyFocus - 3)` care practice. Before wellbeing aptitude response, personal mental stability adds **-0.24, -0.12, +0.12, +0.24, +0.36**; health retains `0.06 * ((cryLevel - 1) / 4 - 0.5)`. Actual annual changes still include innate tendency, fitted childhood corrections, wellbeing mean reversion, seeded variation, and rating bounds. Each living parent's crying contributions before wellbeing aptitude response remain **+0.2, 0, -0.6, -1.2, and -1.8**. Mean relationship change remains `0.20 * (cryLevel - 3)`: -0.4, -0.2, 0, +0.2, or +0.4. Level 3 has no routine relationship noise, but events may still alter it. New parent relationships use `clamp(8 + normalDraw, 5, 10)`, with standard-normal draws capped at -3/+3. Original parents have `parentRole` values `mom` and `dad`, with female and male identities respectively. Existing relationships and identities are not rerolled. Legacy `setBabyChoice` maps quiet/cry to levels 1/5; the UI uses `setCryLevel`.

Actual routine changes receive seeded normal residuals: skill SD is `0.06 + abs(change) * 0.20`, so even a zero mean can vary; appearance SD is `0.04 + abs(ageDecline) * 0.30`; wellbeing SD is `abs(change) * 0.25 + 0.02`; relationship SD is `abs(change) * 0.20 + 0.01`. Residuals are bounded to three standard deviations and final values to 1–10. These game distributions are not empirical estimates of human ability or attractiveness. The preview supplies no random draws; tests can use `growthRandom: () => 0` to isolate mean development.

[growth.js](growth.js) uses [WHO infant length data](https://www.cdc.gov/growthcharts/who-data-files.htm) at birth and 12 months and [CDC 2000 stature-for-age data](https://www.cdc.gov/growthcharts/cdc-data-files.htm) from age 2 to 20 for annual growth increments. Annual LMS rows interpolate CDC half-month rows to exact birthdays. NPC height percentiles still use the LMS transform until `maturityAge`. The player's height percentile instead uses the simulated same-age reference and remains visible until 18, even after early maturity. Infant measurements are recumbent length, followed by standing stature from age 2.

Each person persists `growthSex`, `maturityAge`, `birthHeight`, and `growthFactor`. `adultHeight` stays null while growing and records attained height only at maturity; legacy targets never influence annual gains. Newborn length uses the reference median plus a normal draw times its local scale. Growth factor centers at 1 with SD 0.054 when parents are unknown, bounded to 0.8–1.2. With known parents, their measured heights inform inherited growth tendencies, with additional seeded variation. Maturation centers at 15 for the female growth profile and 17 for the male profile, with SD 0.7, rounded and clamped to 14–18.

Each annual baseline comes from the difference between adjacent birthdays on the population median curve, with rapid infant growth and shifted pubertal timing after age 8. The individual's growth factor scales that increment. Source references and annual-gain calculations remain in centimetres; the gain divides by 2.54 before adding to stored inches. Fresh annual variation has SD `min(1.6, max(0.2, expectedGain * 0.08))` centimetres, with normal draws bounded to three standard deviations; gains cannot be negative. Existing height, old targets, and growth anchors do not change the increment. NPC LMS comparisons convert measured inches back to centimetres without changing the save.

`advanceGrowth(person, normalDraw)` returns `{ height }` without mutation or RNG use. Health 5 or higher leaves growth unchanged; below 5, the gain multiplier is `1 - 0.15 * clamp((5 - health) / 4, 0, 1)`, reaching a 15% reduction at health 1. This affects the final growing year too. Recovery does not restore missed growth; mature/deceased people do not grow. Percentile comparisons never control actual gains. [WHO describes nutrition and illness as causes of impaired growth](https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell); numerical growth rules remain game calibration, not clinical predictions.

## Simulated percentiles and calibration

Only height is displayed as a percentile. The internal `statPercentiles(state)` API still compares current effective ratings, measured height, and household lifestyle with simulated same-age lives, returning `{ value, mean, sd, percentile }` for all nine fields or null at 18 or after death. It does not change saves or consume gameplay RNG; hidden stat ranks are retained for calibration, not exposed in the UI.

The normal approximation uses `100 × Φ((value - mean) / sd)`. Hidden rated-stat ranks use mean 5; height and lifestyle use simulated means. The reference contains 4,000 lives starting at seed 200001: 2,000 per growth profile, cry level 3 through age 1, the balanced 3/2/2/3/2 toddler allocation at ages 2-4 and focus 3 in each area from age 5, and uniformly selected decisions from an independent seeded stream. Each age includes everyone still alive then. Of these, 1,981 male-profile and 1,982 female-profile lives survived to 18. All seven under-18 means range from 4.9019 to 5.2214. At 18, means range from 4.9793 to 5.0079 and trainable-skill SDs from 2.0949 to 2.1810; attractiveness SD is 1.9874, health 0.7956, and mental stability 0.6638.

Height and lifestyle use same-age simulated means and SDs. The reference records `heightUnit: 'inches'` and `cryThroughAge: 1`. Age-18 height mean/SD is 68.28/3.47 inches for the male growth profile and 63.15/3.18 inches for the female profile; these are population summaries, never individual targets. The recorded cohort's newborn trainable-skill SDs range from 2.2778 to 2.2975; the other rated stats range from 1.9887 to 2.3187. Broad birth variation is intentional and does not rescale existing lives.

Reproduce the checked-in reference with `node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001`; sample count is per profile, and the female seed block starts 1,000,000 later. The command rewrites `percentile-reference.js`. Add `--fit` to refit `development.js` when simulation rules change, then regenerate and test the reference. The artifact records its policy, units, fitted constants, and exact command. Existing saves keep their current stats and RNG while legacy centimetre measurements migrate to inches; future development changes without resetting past progress.

## Household lifestyle

Initial parents share a household lifestyle from 2–8. Each parent's `career` persists focus from 0–5 (new parents start at 1–5), employment status, progress, and years. Seeded career growth and promotions tend to improve household lifestyle, while job loss and recovery can interrupt that trend; health and mental stability 5 are neutral for the employment adjustments. Both parents and the under-18 player share the household result. Career progression and event odds are game calibration. Adult player lifestyle combines career performance, internal reserves, family costs, and temporary effects, bounded to 1–10. A living partner costs one level; each living child under 18 costs another. Each dependent child adds effective social +0.2, capped at +1.2.

Internal money, income, expenses, and inheritance values remain necessary simulation state. They are deliberately hidden from the player. Reserve-supported lifestyle gradually declines through upkeep; there is no debt system.

## Careers and education

[jobs.js](jobs.js) contains **100 jobs across 10 categories**, including **45 degree-gated roles**. Each job defines a stable ID, title, category, description, minimum age, stat requirements, skill affinities, normalized weights, college requirement, base lifestyle, and internal base salary.

Job affinities of **+1 to +3** describe which skills the job uses. They differ from a character's **−3 to +3 natural aptitude**, which affects starting ratings and responsiveness to practice. Job performance uses effective skill fit, work focus, experience, and a low mental stability penalty.

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

The baseline probability is converted to a hazard and divided between disease/natural causes and accidents. Health scales disease hazard by `exp((5 - health) × 0.14)`. Adult mental stability scales accident hazard by `exp((5 - stability) × 0.035)`; under-18 mental stability never changes accident risk. At health/mental stability 5 the total reproduces the baseline. The competing hazards convert back to one annual death probability, preventing double counting. Stat multipliers and the coarse cause split are game approximations; the split is informed by [NCHS leading causes of death in 2023](https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-010.pdf), not fitted cause-specific rates. These are population-inspired odds, not individual medical predictions.

Deaths store cause/age, appear in history and the year review, stop the person's aging/events, and reduce player mental stability according to the relationship. A remembered partner does not block new dating. Player death enables succession at any age; age 85 still requires a playable handoff without marking a survivor dead.

`annualForecast` clones state and runs mean routine growth, finances, family aging, and effect expiration. Its internal result retains effective-stat, lifestyle, and parent deltas, and the UI renders the net changes as signed labels in the choices box without numerical forecast deltas. It never changes live state or consumes RNG. Routine variation, careers, events, deaths, relationships, births, and unresolved choices can alter outcomes. `yearSummary` stores actual changes and journal events; its popup shows before → after values for player stats, height, lifestyle, and parent mental stability/relationship/lifestyle. Optional `decisions` captures `{ cryLevel }` before age 2 or `{ focus, workLabel }` afterward, before advancement. `workLabel: 'Play'` preserves toddler labels across the fifth birthday; historical four-key reviews retain Explore, while five-key reviews show Electronics and Arts & crafts; School/College/Career remain correct across later transitions. Historical age-two cry snapshots stay valid. Reviews show past choices and unused points, never current controls; older summaries omit the section. The popup reopens until dismissed, and later event-choice outcomes are not retroactively added.

## Relationships and children

Single adults can meet zero to five prospective partners in a year. Attractiveness, social, and lifestyle determine encounter opportunities and influence generated profiles and pursuit success; social focus also affects frequency. At default social focus, minimum desirability ratings yield about 0.22 expected encounters per year and at most one, while maximum ratings yield about 4.6 and at most five.

Profiles show skills, affinities, health, mental stability, age, height, and lifestyle. Each encounter can be pursued as a relationship, approached for a consensual one-night stand, or ignored. Both approaches can be declined. An encounter is consumed once; unanswered encounters expire next year. Starting a relationship closes other invitations.

New relationships start at a random relationship of 3–7 out of 10. Dating gives effective social +0.7 and mental stability +0.6; marriage gives +0.9 and +0.8. Family focus develops relationship and partner wellbeing. Proposals are limited to once per year. Relationship and years together determine acceptance; six years together adds 42 percentage points at the same relationship.

Pregnancy base probabilities are 2% yearly while dating, 25% while married, and 1% after an accepted casual encounter, adjusted for the gestating person's age and health. Gestating ages are 18–45. Pregnancy is saved and leads to birth on the next yearly advance. No new pregnancy starts when another exists, when the player is at least 84, or when family capacity is full.

Manual **haveChild** currently means adoption, available from 18 without requiring a partner. There is a six-child cap, an expected baby reserves a place, and only one child arrival is allowed per player age. Children have their own stats, affinities, height, identity, and relationship; family focus supports their development. Parent/partner/child events can affect that person, the player, or both. Ending a relationship preserves children and any expected baby. New children record known `parentIds` at birth/adoption so a recorded co-parent can survive a child handoff; older saves do not infer unknown parentage.

Appearance fluctuates slightly each year around a flat mean until the requested gender-based threshold: men begin mean losses in the year 30→31, women in 22→23, and other genders currently default to 30. Mean decline is `-(0.06 + min(40, age - threshold) * 0.0018)` before annual variation. Specific authored events can still change appearance. This is a requested gameplay rule, not a scientific attractiveness standard. `appearanceDeclineAge` is authoritative; `appearancePeakAge` remains in saves for compatibility. Gender appears beside the name. Identity, attraction, growth profile, and pregnancy capability remain separate; there is no new-game gender-selection screen yet.

## Retirement and inheritance

The engine chooses candidates in this order: **eligible children → eligible siblings → unrelated beneficiary**. Eligible means living, younger than 85, and not a previously played character. New games start with no siblings; siblings become available through earlier child handoffs.

With no eligible family heir, the preview generates one child aged 6–12 with a different surname and the same broad natural-rating distributions as other new people. This preview is deterministic across menu visits and reloads and does not consume gameplay randomness.

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
| [development.js](development.js) | Natural starting ratings, lifelong focus/aptitude development, childhood wellbeing mean reversion, and pure infant choice contributions |
| [choice-impacts.js](choice-impacts.js) | Grouped relative choice previews with no save or RNG mutation |
| [percentiles.js](percentiles.js) | Normal CDF used for simulation-based percentiles |
| [percentile-reference.js](percentile-reference.js) | Generated same-age cohort references and calibration metadata |
| [scripts/calibrate-percentiles.mjs](scripts/calibrate-percentiles.mjs) | Offline cohort generation and optional development fitting |
| [parent-careers.js](parent-careers.js) | Parent career progression, employment events, and household support |
| [jobs.js](jobs.js) | Career catalog and requirements |
| [events.js](events.js) | Personal event catalog and probability rules |
| [family-events.js](family-events.js) | Parent/partner/child events, targeted outcomes, and probabilities |
| [mortality.js](mortality.js) | Sourced age baseline, stat adjustments, and annual competing mortality risks |
| [growth.js](growth.js) | WHO/CDC annual growth references, NPC height percentiles, maturation, and height variation |
| [relationships.js](relationships.js) | Encounters, appeal, proposals, pregnancy, and appearance aging |
| [app.js](app.js) | Rendering, action handlers, dialogs, localStorage, save import/export |
| [display.js](display.js) | One-decimal stat ratings and feet/inches formatting without changing stored values |
| [narrative.js](narrative.js) | Pure relationship annotations for known full names in rendered prose |
| [styles.css](styles.css) | Phone layout, touch targets, safe areas, visual design |
| [index.html](index.html), [favicon.svg](favicon.svg) | Static entry point and branding |
| [server.mjs](server.mjs) | Development-only HTTP server |
| [test/](test/) | Engine, relationships, family events, and LinkeDOM integration tests |

Public engine actions mutate the supplied state and return an ok flag with an optional failure reason. Important entry points include createGame, advanceYear, effectiveStats, setFocus, setCryLevel, annualForecast, statPercentiles, dismissYearSummary, heightPercentile, mortalityOdds, chooseEducation, takeJob, eventOdds, resolveEventChoice, respondToEncounter, proposeMarriage, haveChild, successionInfo, succeed, validateSave, and migrateSave. Read-only percentile, forecast, and odds helpers do not mutate state.

State groups include identity/growth profile, stats/aptitudes, focus/cryLevel, parents/children/siblings, education/jobOffers/job, partner/encounters/pregnancy, effects/pendingEvents, history/lineage, alive/death, yearSummary, and succession flags. Stored seed/rng fields make simulations reproducible. Read-only offer, forecast, and beneficiary previews must not consume live RNG. The journal retains up to 500 entries.

Keep **lifelines.save.v1** as the storage key. Schema version is **12** and migration accepts valid v1–v11 saves. V12 gives every saved person `health: 0` and `stability: 0` in their aptitude map, preserving existing ratings, skill aptitudes, RNG, and focus. V11 adds `creative: 0` to existing toddler allocations without redistributing points and preserves historical four-key Explore reviews. V10 converts legacy centimetre measurements to inches across the player, family, lineage, pregnancy copies, growth metadata, and year-summary height values. It preserves physical height, stats, RNG, identities, relationships, pending choices, pregnancy, careers, and reviews without rerolling. Earlier migrations still add deterministic growth/career defaults, remove obsolete adult-height targets, repair duplicate parent names, initialize shared support, and retain the prior identity/stat/education/surname conversions. Unknown parentage is not reconstructed. Invalid imports must never overwrite a valid existing life.

`yearSummary.decisions` remains optional and old age-two cry snapshots remain readable. Stats retain their internal two-decimal precision; only height units convert. Broader starting ratings apply to new people. Preserve stable job/event IDs and queued family subject IDs. New state fields need validation, migration, and save round-trip coverage. The release cache token is **wellbeing-aptitude-1**; update entry-point and module versions coherently.

## Interface and validation

The four bottom tabs are **Year, Career, Family, You**. Height appears beside gender in the profile header, in feet/inches with its height-only percentile. The infant subtitle "A whole life ahead" is omitted. Lifestyle has its own line directly below gender and height, with a one-decimal X/10 value and current-rating bar. The summary grid shows the five skills, health, and mental stability as one-decimal X/10 ratings. Current-rating bars beneath the numbers transition from red at low values to green at high values; the rectangular border and empty track remain visible. You, Family, parents, and relationship ratings use the same bars without forecast overlays. Each top stat and height opens You, which retains its full stats grid and aptitudes. Year places cry/focus controls after the summary without a separate skill panel. The choices box separates expected changes into You, Other people, and Relationships with light dividers, omitting zero entries and empty groups, and retains compact Dad/Mom ratings; non-stat budget/progress controls remain. Only height shows a percentile while alive and under 18, including after early maturity; adult height is labeled afterward. NPC height ranks stop at maturity. Babies use cry levels 1–5. Full parent profiles stay in Family. Saved reviews show past choices and before → after player/parent values. Use **relationship** throughout. Explanations belong in concise **?** popups. More contains help, odds, save tools, and new-life controls.

`annotateNarrative(text, state)` adds current relationship labels after known full names, such as Mom, Son, Wife, or Brother. It returns plain text; the UI escapes it before rendering story, event, journal, pregnancy, and recap prose. Existing labels update idempotently, and ambiguous identical names with conflicting roles stay unlabelled. Stored names and journal history never change. Profile headings already show roles and do not duplicate the annotation.

The interface includes 44-pixel focus controls, 16-pixel input text, safe-area spacing, keyboard controls, focus handling, and accessible numeric ratings and forecast labels. LinkeDOM checks validate DOM behavior, not real browser layout or touch interactions. A real-browser phone-layout check could not be completed for this update because the browser access host is unavailable. Do not describe this release as visually verified.

Career omits its redundant global heading; before 18 it shows a disabled **Unlocks at age 18** bar, with adult college and job flows unchanged.

Natural aptitude appears as a signed number from -3 to +3, including 0, immediately beside all seven personal stat ratings: the five skills, health, and mental stability. Keep the rating and aptitude together with a small gap, such as `5.0/10 +2`, in the top summary, You, and full personal profiles. Stat identity emojis and exact signed accessible labels remain. Health and mental stability aptitude describes natural resilience: it improves routine gains and softens routine losses. Attractiveness retains its existing aptitude but does not improve through practice; lifestyle, height, and relationship have no aptitude value.

Every displayed stat rating uses one decimal, including lifestyle, requirements, profiles, and recaps. Height uses feet and whole inches with no ending quote, such as `1'5` or `5'9`: round the stored inches before splitting feet and remainder. Rounding can carry into the next foot, and screen-reader labels say the units aloud. Height is stored in inches and stats retain two decimals; ages, activity/focus points, cry levels, aptitudes, counts, and probabilities keep their existing formats.

Use Node 24 as specified in [.nvmrc](.nvmrc):

~~~sh
npm ci
npm test
npm start
~~~

The preview runs at http://127.0.0.1:4173. There is no production build command, database, or runtime dependency. ES modules require HTTP rather than opening index.html through file URLs. LinkeDOM is a development dependency for UI tests.

The lifestyle-header and wellbeing-aptitude update introduces schema 12 and changes routine wellbeing response. The 4,000-life reference was regenerated with `--fit`; the second iteration brought all age-18 means within 0.025 of 5. All **247 tests**, including **65 DOM checks**, pass after `npm ci` on Node **24.14.0**. All **18 local HTTP assets** returned 200 and matched disk. Phone visual verification could not be completed because the browser access host is unavailable. GitHub Pages deployed commit **5c1973b** successfully (workflow run **41058664148**); all **18 live HTTP assets** returned 200 and matched the release. The previous numeric-aptitude release passed 242 tests, including 65 DOM checks, and deployed as commit **394f04d** (workflow run **41051957007**); all 18 live assets matched the release. Browser visual checking was unavailable for that prior release.

The previous grouped relative-effects and emoji release passed all **242 tests** on Node **24.14.0**, including **65 LinkeDOM checks**, after `npm ci`. All **18 local HTTP assets** returned 200 and matched disk. Coverage includes separated effect groups, hidden zero changes and empty groups, relative crying signs independent of stat magnitude, unchanged crying strength, later-age routine previews, rating limits, and preserved saves/RNG. That release retained schema 11 and existing saved ratings. The 4,000-life reference was regenerated with `--fit`; the second fit iteration reached age-18 means within 0.025 of 5. A real-browser phone-layout check could not be completed because the browser access host is unavailable. GitHub Pages build and deploy jobs succeeded for gameplay commit **80285d1** (workflow run **41049209978**); all **18 live HTTP assets** returned 200 and matched the committed files.

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
