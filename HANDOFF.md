# Lifelines development handoff

Updated 26 October 2026. Lifelines is a playable, phone-first, generational life simulator inspired by the yearly structure of BitLife. The next developer should extend the existing framework while preserving its saves, lifestyle-only presentation, and GitHub Pages deployment.

The gameplay baseline is commit **4da3288**. Commit **6e56897** adds portable cloud instructions and Node version selection. This handoff records the implemented behavior and the cloud setup status; later documentation commits do not change the gameplay baseline.

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
| Save schema | Version 6; browser key remains lifelines.save.v1 |
| Automated checks | 116 tests passed in the cloud environment setup |

Read [AGENTS.md](AGENTS.md) before changing the project and [README.md](README.md) for the detailed current rules. Game progress lives in the player's browser, not in GitHub or the coding environment.

## Product requirements to preserve

- Design for phones: a compact single-column game, touch controls, and bottom navigation.
- The player starts at age 0 and advances exactly one year per turn. Choices and character development influence probabilities rather than guaranteeing an event every year.
- Show financial circumstances only as **lifestyle 1–10**. Do not add visible salary, annual income, spending, savings, or inheritance amounts.
- Use **stability 1–10**, with higher being better. Discipline and relaxation are not traits.
- Babies have the same five skills as adults, initially very low. Each skill has its own permanent **−3 to +3 growth affinity**.
- Child lifestyle follows the parent household until adulthood.
- Family focus improves family relationships and children’s development. Children and partners are individual characters with their own stats.
- Keep the player's family surname through male and female heirs. Split a parent's inheritance equally among eligible children, regardless of which child becomes playable.
- Preserve gender flexibility in the engine. A full new-game gender-selection flow is a future feature.

These are established user preferences, not suggestions to replace with a different design.

## Playable life cycle

| Stage | Current behavior |
| --- | --- |
| New game | A family surname is required in the UI; capitalize its first letter and preserve multiword names. First name is optional. Generate two parents and an age-0 character. |
| Ages 0–2 | Cry or stay quiet. Crying develops skills faster and reduces both living parents' stability. |
| Ages 3–17 | Allocate focus to school, friends, family, and self; develop skills and experience age-appropriate events. |
| Age 18 | Pause for college or a saved shortlist of 10 jobs. Selecting a job chooses the workforce path. |
| College | Four yearly advances; study focus develops skills. Graduation produces a saved shortlist of 15 jobs, including degree-based opportunities. |
| Adulthood | Work, meet prospective partners, date, marry, have or adopt children, and respond to personal and family events. |
| Age 65 onward | Optional retirement into an eligible child, otherwise sibling, otherwise an unrelated low-stat child. |
| Age 85 | Mandatory succession; the story can continue even without children or siblings. |

Unresolved event decisions block ordinary progression and career/family actions. A required education decision blocks the next year. Retirement also waits for pending decisions and an active pregnancy to finish.

## Character development and lifestyle

The five skills are intelligence, strength, attractiveness, social ability, and creativity. Newborn skills start at 1.0–1.5. Health starts at 7–9.5 and stability at 8–10. All seven stats remain within 1–10; the engine keeps two-decimal precision while most UI values display one decimal.

Each skill's growth multiplier is **1 + affinity × 0.18**, giving 0.46× growth at −3 and 1.54× at +3. Affinities derive from both parents with small random variation. Health and stability are wellbeing meters rather than additional affinity-bearing skills. Height is stored in centimetres, starts at 50, and reaches inherited adult height at 18.

From age 3, work/school, social, family, and self each take an integer focus from 0 to 5, sharing a **12-point budget**. Unused focus contributes to rest through stability; it does not create a relaxation trait. During infancy, crying provides 0.32 skill growth before affinity scaling versus 0.13 for quiet. Crying costs each living parent 0.7 stability; quiet adds 0.2.

Initial parents share a household lifestyle from 2–8. Under-18 players and dependent children follow their household's lifestyle. Adult lifestyle combines career performance, internal reserves, family costs, and temporary event modifiers, bounded to 1–10. A living partner costs one level; each living child under 18 costs another level. Each dependent child adds effective social ability +0.2, capped at +1.2.

Internal money, income, expenses, and inheritance values remain necessary simulation state. They are deliberately hidden from the player. Reserve-supported lifestyle gradually declines through upkeep; there is no debt system.

## Careers and education

[jobs.js](jobs.js) contains **100 jobs across 10 categories**, including **45 degree-gated roles**. Each job defines a stable ID, title, category, description, minimum age, stat requirements, skill affinities, normalized weights, college requirement, base lifestyle, and internal base salary.

Job affinities of **+1 to +3** describe which skills the job uses. They are different from the character's **−3 to +3** growth affinities. Job performance uses effective skill fit, work focus, experience, and a low-stability penalty.

Offer lists are persistent and do not reroll when opening a menu or reloading. They include an accessible starting role but can also contain aspirational roles whose age or skill requirements are not yet met. Career changes are limited to the current saved shortlist. College blocks full-time job selection. Choosing the workforce path without a job is possible through the engine.

## Events and decisions

There are **168 event definitions**: 136 personal and 32 household events. The household catalog contains 16 partner and 16 child definitions, with separate rolls for applicable family members. **45 definitions have choices**: 32 personal and 13 household.

Eligibility and probability depend on age, education, employment, job type, focus, effective stats, and family relationships. Examples include increased injury risk in physical careers, greater scam risk with low intelligence, academic opportunities with high intelligence, and impulsive outcomes with low stability. Social focus increases social opportunities and complications. The values are fictional game-balancing rules.

Personal base rates range from 0.6–2.5% and household base rates from 0.8–0.9%, before modifiers. Final per-roll probabilities are capped at 18% for personal and 12% for household events. The intended pacing is roughly one event every year or two in ordinary circumstances, with quiet years common. This is a balance target, not a guaranteed annual quota. The earlier 136-event catalog averaged about 0.64 events per year in a 300-life check; the expanded household catalog has not received an equivalent full balance pass.

The engine calculates event odds from the **start-of-year state**, shuffles eligible rolls, and rolls independently up to a shared **five-event annual limit**. Growth, finances, family aging, effect expiration, and age advancement precede applying the selected outcomes. Dating and pregnancy use separate rolls outside that event limit.

Choices resolve in queue order and carry event/subject IDs so an old click cannot resolve the wrong person's event. Outcomes can permanently change stats or add temporary effects, including lifestyle effects. Matching temporary effects refresh rather than stack duplicates. Choices, effects, and outcomes survive save/reload and appear in the journal. The odds menu calculates quiet-year probability from the product of missed independent rolls.

## Relationships and children

Single adults can meet zero to five prospective partners in a year. Attractiveness, social ability, and lifestyle determine encounter opportunities and influence generated profiles and pursuit success; social focus also affects frequency. At default social focus, minimum desirability ratings yield about 0.22 expected encounters per year and at most one, while maximum ratings yield about 4.6 and at most five.

Profiles show skills, affinities, health, stability, age, height, and lifestyle. Each encounter can be pursued as a relationship, approached for a consensual one-night stand, or ignored. Both approaches can be declined. An encounter is consumed once; unanswered encounters expire next year. Starting a relationship closes other invitations.

New relationships start at a random bond of 3–7 out of 10. Dating gives effective social +0.7 and stability +0.6; marriage gives +0.9 and +0.8. Family focus develops bond and partner wellbeing. Proposals are limited to once per year. Bond and years together determine acceptance; six years together adds 42 percentage points at the same bond.

Pregnancy base probabilities are 2% yearly while dating, 25% while married, and 1% after an accepted casual encounter, adjusted for the gestating person's age and health. Gestating ages are 18–45. Pregnancy is saved and leads to birth on the next yearly advance. No new pregnancy starts when another exists, when the player is at least 84, or when family capacity is full.

Manual **haveChild** currently means adoption, available from 18 without requiring a partner. There is a six-child cap, an expected baby reserves a place, and only one child arrival is allowed per player age. Children have their own stats, affinities, height, identity, and bond; family focus supports their development. Partner/child events can affect that person, the player, or both. Ending a relationship preserves children and any expected baby.

Appearance peaks individually between ages 27 and 33 and gradually declines afterward. The current aging helper applies across genders. Identity fields separate gender, attraction preferences, and pregnancy capability. New games currently default to a male character meeting women; the engine and tests already support a gestating player with a male partner, but the UI has no gender-selection screen.

## Retirement and inheritance

The engine chooses candidates in this order: **eligible children → eligible siblings → unrelated beneficiary**. Eligible means living, younger than 85, and not a previously played character. New games start with no siblings; siblings become available through earlier child handoffs.

With no eligible family heir, the preview generates one child aged 6–12 with a different surname, skills of 1–3, health/stability of 2–4, and full affinities. This preview is deterministic across menu visits and reloads and does not consume gameplay randomness.

The internal estate calculation is:

~~~text
legacy rate = clamp(0.95 - 0.05 × lifestyle, 0.45, 0.90)
estate = floor(money × legacy rate)
child share = estate / number of eligible children
~~~

Every eligible child receives exactly the same fractional share, including children not selected as the next player. With no eligible children, the selected sibling or beneficiary receives the whole estate. Do not display these amounts in the game.

An heir retains their age, stats, affinities, height, identity, and own resources, then receives inheritance. The new playable chapter resets career, partner, children, pregnancy, temporary effects, pending choices, focus, and education progress. Adult heirs choose college/work again. Child/sibling heirs retain the family surname regardless of gender; an unrelated beneficiary begins a different family line. The journal and lineage preserve previous chapters. A sibling handoff preserves existing parents and remaining siblings.

## Code structure and save contract

| File | Responsibility |
| --- | --- |
| [engine.js](engine.js) | Deterministic simulation, public actions, careers/education, family progression, succession, save validation and migration |
| [jobs.js](jobs.js) | Career catalog and requirements |
| [events.js](events.js) | Personal event catalog and probability rules |
| [family-events.js](family-events.js) | Partner/child events, targeted outcomes, and probabilities |
| [relationships.js](relationships.js) | Encounters, appeal, proposals, pregnancy, and appearance aging |
| [app.js](app.js) | Rendering, action handlers, dialogs, localStorage, save import/export |
| [styles.css](styles.css) | Phone layout, touch targets, safe areas, visual design |
| [index.html](index.html), [favicon.svg](favicon.svg) | Static entry point and branding |
| [server.mjs](server.mjs) | Development-only HTTP server |
| [test/](test/) | Engine, relationships, family events, and LinkeDOM integration tests |

Public engine actions mutate the supplied state and return an ok flag with an optional failure reason. Important entry points include createGame, advanceYear, effectiveStats, setFocus, chooseEducation, takeJob, eventOdds, resolveEventChoice, respondToEncounter, proposeMarriage, haveChild, successionInfo, succeed, validateSave, and migrateSave.

State groups include identity, stats/aptitudes, focus, parents/children/siblings, education/jobOffers/job, partner/encounters/pregnancy, effects/pendingEvents, history/lineage, and succession flags. Stored seed/rng fields make simulations reproducible. Read-only offer and beneficiary previews must not consume live RNG. The journal retains up to 500 entries.

Keep **lifelines.save.v1** as the storage key. Schema version is **6**, and migrateSave upgrades valid v1–v5 data without rerolling progress or randomness. It converts old instability to 11 minus instability, inverts corresponding temporary effect signs, removes discipline/relaxation, adds missing education/relationship/surname structures, and reopens old age-85 endings for succession. validateSave strictly checks current data; invalid imports must not overwrite an existing valid life.

Preserve stable job/event IDs and queued family subject IDs. New state fields need validation, defaults/migration, and appropriate save round-trip coverage. The static entry point and module imports currently use the cache token **legacy-1**; update cache versions coherently when a release needs to invalidate browser assets.

## Interface and validation

The four bottom tabs are **Year, Career, Family, You**. The Year screen keeps the next-year control near the bottom; the header exposes health, stability, and lifestyle. Babies show all five skills and affinities on Year. The More menu opens bottom sheets for help, odds, export/import, and starting a new life. Encounter profiles are paginated for phones.

The interface includes 44-pixel focus controls, 16-pixel input text, safe-area spacing, keyboard controls, focus handling, and accessible meters. These are implemented features; actual phone/device visual acceptance remains outstanding. LinkeDOM checks validate DOM behavior, not real browser layout or touch interactions.

Use Node 24 as specified in [.nvmrc](.nvmrc):

~~~sh
npm ci
npm test
npm start
~~~

The preview runs at http://127.0.0.1:4173. There is no production build command, database, or runtime dependency. ES modules require HTTP rather than opening index.html through file URLs. LinkeDOM is a development dependency for UI tests.

Current checks cover newborn skills/affinities, focus budgets, deterministic years and saves, career shortlists/college, probability eligibility and bounds, pending decisions, relationship/pregnancy rules, inheritance and repeated succession, naming, navigation, and save preservation. Run relevant checks after code changes; do not add implementation-mirroring tests for prose-only edits.

## Cloud coding and deployment handoff

The owner wants to send instructions from the ChatGPT phone app with the PC **off**. Use the published **lifelines Codex Cloud environment**, not a Remote connection to this Windows computer. The GitHub connector is authorized for adaford/lifelines, and the environment is private to the owner.

Verified in setup:

- The repository was checked out in the cloud at /workspace/lifelines.
- Node 24 and locked dependencies were installed; all 116 tests passed and development HTTP assets were checked.
- Install/start instructions and the environment description were saved, then publication completed. The saved environment appears in Codex Cloud settings.
- The cloud composer offers **GPT-6 Astra → Ultra**. Select it for the intended task; a change in the picker was not proven to persist as a global default across navigation or new tasks.

The cloud install script runs npm ci and npm test in the checkout and checks for Node 24. Startup guidance tells each task to read AGENTS.md/README.md, use the existing isolated checkout, and restart development processes when needed.

**Still unverified:** direct authenticated push from a cloud task to main and automatic deployment from that push. The prepared verification prompt was not submitted before this handoff was requested. Do not infer write access from successful checkout or from this PC's separate GitHub CLI login. Do not copy the PC's credentials into the cloud.

The next cloud session should verify authentication without printing secrets, check a dry-run push, and confirm access to GitHub's API and the live Pages site. If network configuration is required, the relevant destinations include github.com, api.github.com, and adaford.github.io. Report any connection or permission step that is still needed. See the [official cloud environment guide](https://learn.chatgpt.com/docs/environments/cloud-environments).

For game releases, finish the requested changes and tests, commit only intended files, then push or merge to main. GitHub Pages automatically deploys the repository root using the same pattern as Depths. Verify the deployed commit before reporting success:

~~~sh
gh api repos/adaford/lifelines/pages/builds/latest
~~~

Compare the returned commit with the intended commit, require a successful build, and check the live site. If the cloud task can only create a pull request, state clearly that merging it is still required. The previously published cloud-instruction commit 6e56897 was verified as built successfully from this PC; that is not a cloud push test.

## Remaining scope and suggested next work

The framework is implemented, but it is not a packaged iOS/Android application. There is no app-store packaging, service worker/offline installation flow, player account system, or cloud save synchronization. JSON export/import moves game saves between devices.

Intentional simplifications include no early mortality, detailed college majors/tuition, spontaneous sibling births, detailed custody/divorce finances, or full independent careers/partners/families for children. Family actors age and die at 85. Heirs do not bring a previously simulated spouse or children into the next chapter.

The next useful tasks are to verify the cloud release path, test real phone layouts and long dialogs, expose the planned gender/preferences flow, and measure balance across many seeded lives including households. Treat those as follow-up work, not features already delivered. Preserve the existing framework and ask for a new product decision only when the requested change does not settle it.

## Starter instruction for the next coding session

> Work in the published lifelines cloud environment on adaford/lifelines. Read AGENTS.md, HANDOFF.md, and README.md, then implement the requested change. Preserve existing saves, lifestyle-only finances, and the phone layout. Run the relevant tests. For a requested release, commit and publish to main when authorized access is available, verify GitHub Pages deployed that commit, and return the live URL. If cloud write access is unavailable, report the exact missing step rather than claiming deployment succeeded.
