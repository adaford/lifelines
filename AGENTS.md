# Lifelines

Lifelines is a phone-first, generational life simulator. Read `HANDOFF.md` for the project and cloud setup status, and `README.md` for the current gameplay rules, save migrations, and deployment details before changing behavior.

## Setup and validation

- Use Node.js 24 (see `.nvmrc`). Run `npm ci` to install test dependencies.
- Run `npm test` for simulation and DOM integration checks after code changes.
- Run `npm start` for an HTTP preview on port 4173. Use a browser for visual checks when available, especially at phone widths; report any visual checks that could not be completed.
- This is a static HTML/CSS/JavaScript ES-module app with no production build step or runtime dependencies. Do not open the app through `file://`.

## Source map

- `engine.js`: simulation, progression, education, career offers, saves, and succession.
- `jobs.js`, `events.js`, `family-events.js`, `relationships.js`: careers, event catalogs, and family/relationship rules.
- `growth.js`, `mortality.js`: sourced age/height references and stochastic growth/mortality rules.
- `development.js`: innate ratings, lifelong focus/aptitude development, and childhood wellbeing mean reversion.
- `percentiles.js`, `percentile-reference.js`: normal CDF and generated simulation references; `scripts/calibrate-percentiles.mjs` reproduces or refits them.
- `parent-careers.js`: parent career progression, employment events, and household support.
- `app.js`: UI actions, browser persistence, and save import/export.
- `display.js`: one-decimal ratings and feet/inches display formatting; no simulation changes.
- `narrative.js`: pure relationship labels for known names in rendered stories.
- `styles.css`, `index.html`, `favicon.svg`: phone layout, static entry point, and branding.
- `test/`: simulation and DOM integration tests; `server.mjs`: development server.

## Preserve the game's intent

- Keep the phone layout, bottom navigation, accessible touch targets, and safe-area spacing.
- Show all eight rated values at the top as one-decimal X/10 numbers: health, mental stability, lifestyle, intelligence, strength, attractiveness, Social, and creativity. Show height separately in feet/inches with its height-only percentile. Top stat buttons open You, which retains the full numeric stats grid and natural aptitudes. Year places cry/focus choices after this compact summary; do not add a separate skill panel or stat bars.
- Before 18, Career shows a disabled **Unlocks at age 18** bar. Keep the redundant global Career heading removed at every age.
- Use lifestyle 1-10 as the only player-facing financial number; do not add salary, income, spending, savings, or inheritance amounts to the UI.
- Label the social stat **Social** and preserve its internal `social` key. Label the wellbeing stat **mental stability**, 1-10 with higher better; preserve its internal `stability` save key. Discipline and relaxation are not traits.
- Babies and adults share the same stat set and 1-10 rating scale. Before 18, abilities are relative to others of the same age: strength 7 means a strong baby, not adult strength. New trainable ratings center near 5 and reflect inherited -3 to +3 **natural aptitude** plus random variation. Aptitude influences both starting ability and response to practice; focus can substantially raise skills and neglect can lower them throughout life. Exercise belongs to self focus. Never reset or rescale existing saved ratings.
- Attractiveness starts near its mature inherited value, fluctuates slightly each year, and has no ordinary positive growth trend. Its requested decline begins after 30 for men and 22 for women.
- Keep the seven rated stats centered near 5/10 at age 18 in balanced simulated lives. New ratings have broad variation across 1-10: trainable skills use aptitude plus normal noise with SD 2; health, mental stability, and general appearance use SD 2, while inherited appearance adds SD 1.5 to the parental mean. Childhood wellbeing varies around fitted targets rather than drifting to 10. Health 5 is neutral for growth, mortality, and parent-career adjustments. Preserve existing saved stats.
- Child lifestyle follows the shared parent household until 18. Preserve each parent's career focus, status, progress, and years; career growth tends to improve household lifestyle, with random promotion, job-loss, and recovery outcomes.
- Keep Mom/Dad roles, distinct gendered names for newly generated parents, random initial relationships centered near 8, gender beside the name, and stronger parent mental-stability costs for intense crying. Cry levels 1-2 lower parent relationships, 3 is routinely neutral, and 4-5 raise them; events can still change the result. Use **relationship**, not bond, in the interface. Annotate known names in stories with their current relationship, without rewriting saved names or history.
- Height emerges from each year's gain based on age, inherited `growthFactor`, health, and seeded variation; there must be no predetermined adult-height target or catch-up toward one. Stop growth at individual maturity between 14 and 18. `adultHeight` is null while growing and records attained height only after maturity. Health below 5 reduces that year's gain without later repayment. Keep growth reference separate from gender identity.
- Show percentiles only for height. Player height compares measured height with same-age simulated lives while alive and under 18, including after early maturity; NPC height uses the age-specific LMS reference until maturity. Keep other stat percentiles out of the interface, even though the calibration API retains them. Percentile reads must not mutate saves or consume RNG. Recalibrate the reference after changing relevant simulation rules.
- Put gameplay explanations in adjacent **?** popups. Use short, plain wording; explain each rule once and omit repeated labels or tutorial text from stories.
- Show compact **Dad:** and **Mom:** rows on Year with numeric mental stability and relationship ratings out of 10. Keep full profiles in Family. Do not show stat, relationship, or parent meters anywhere.
- Show one combined expected-change list inside the cry/focus choices box at every age, using + to +++ or - to --- for net routine player stats/lifestyle and each living parent's mental stability, relationship, and lifestyle. Label parents separately as Dad/Mom, omit unchanged values, and hide the list while progression is blocked. Forecasts never consume RNG. Preserve actual before → after year reviews, including parent changes; actual annual development still has seeded variation.
- Display every stat rating with exactly one decimal, including lifestyle and before → after values; preserve internal two-decimal stats. Store height in inches (introduced in schema 10; current schema 11) and display feet/whole inches, such as `5'9`, rounding total inches before splitting feet/inches. Migrate all legacy centimetre height fields once without changing stats or RNG. Ages, focus, crying, aptitudes, counts, and probabilities keep their existing formats.
- Crying applies only at ages 0–1. Ages 2–4 use Play (`work`), Electronics (`social`), Family time (`family`), Rest (`self`), and Arts & crafts (`creative`) under the same 12-point budget and 5-per-area cap. Balanced toddler allocation is 3/2/2/3/2. Play supports strength and social, Electronics supports intelligence but reduces social, Arts & crafts supports creativity, and Rest has a stronger health effect. Play does not train creativity. Use the combined choices-box forecast rather than separate per-activity impact labels. School/Student begins at 5; transfer creative points into the four school areas without losing points or exceeding caps. Preserve historical age-two cry recaps and four-key Explore reviews; use saved `workLabel: 'Play'` and five-key choices for new toddler recap labels.
- Year reviews show the cry level or focus choices saved before that year advanced, including its School/College/Career label. Do not infer decisions from current controls or invent decisions for older summaries.
- Preserve one-year turns, focus-influenced development and event odds, age-appropriate choices, college/career progression, and generational family play unless the user requests a change.
- Keep identity, attraction, and pregnancy capability separate so future playable genders remain possible.
- Preserve existing saves and the `lifelines.save.v1` localStorage key. Schema 11 adds `creative: 0` to existing toddler allocations and keeps old reviews intact. Add compatible migrations when the schema changes; do not reset or reroll existing progress. Pending decisions must survive reloads.
- Blank surname and first-name fields use random defaults; preserve a supplied first name when the surname is blank. Family surnames persist across genders and generations. Inheritance is divided equally among eligible living children; consult the existing retirement rules before altering succession.

## Releases from cloud tasks

The repository is `adaford/lifelines`. GitHub Pages serves the root of `main` using `.nojekyll`; pushes or merges to `main` automatically redeploy https://adaford.github.io/lifelines/.

For requested game changes, finish the implementation, run the relevant checks, and commit and publish to `main` when GitHub write access is available, unless the user requests a draft or another branch. Preserve unrelated work and never force-push. A cloud environment needs its own GitHub access; do not depend on another computer's credentials, files, or running processes.

If the environment can only produce a pull request, create it and clearly state that merging it into `main` is still required to deploy. Do not claim the game is published just because a task or commit is complete.

After publishing, verify that the GitHub Pages deployment succeeded for the intended commit (for example, with `gh api repos/adaford/lifelines/pages/builds/latest`) and check the live site when accessible. Report the live URL, validation performed, and any remaining deployment or access limitation. Keep credentials out of source files and logs.
