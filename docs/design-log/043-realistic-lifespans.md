# Realistic lifespans (24 November 2026)

Default play now dies at roughly real US ages. In 600 seeded lives at default focus, 6.8% die before 40, 17.5% before 65 and 57.8% before 85, against 4%, 17% and 58% in the game's US life table (median death age 82; the game's median is about 81). Game rules, not medical estimates.

Three changes, all in `balance.js`:

- **Age risk is scaled.** The life table already includes people in poor health, and the game adds Health-driven risk on top of it, so the table's age risk is multiplied by `MORTALITY_BALANCE.baselineScale` (0.5) before Health applies. A Health 5 person therefore has half the table's yearly risk.
- **The low-Health risk stops at 2.5.** The owner's anchors stay: 5% a year at Health 2, 10% at 1, 20% at 0. Above 2 it now fades to nothing at 2.5 (`fadeTo`, was 4), so people around Health 3 no longer carry extra risk for decades.
- **Old-age decline is slower.** From 65, Health falls 0.05 a year for you and 0.035 for relatives (`AGING_BALANCE`, was 0.1 and 0.07).

The disease multiplier for Health (`diseaseSlope`, 0.14) is now a constant too, unchanged. Supersedes the mortality numbers of 042 and the calibration statement in the original spec that Health 5 reproduces the life table. Cache token: realistic-lifespans.

Validation: `npm test` passes all 818 tests with none skipped; the mortality, event-balance and decision-scale tests now read these constants. The percentile reference was regenerated and a second run matched byte for byte. `node scripts/verify-assets.mjs` checks every served file. Browser and visual checks were not done, by the owner's preference.
