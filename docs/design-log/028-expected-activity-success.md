# Expected activity success (12 November 2026)

Sports and Extracurriculars focus rows now show Expected success as a letter grade for the next report, recalculated when points change. Use current effective abilities, age-relative height where relevant, saved success (or the first-year internal baseline of 5), and selected 0-2 focus points with zero random noise. Share the pure activitySuccessAfterYear endpoint with completed reports, preserving the existing annual draw, double rounding and bounds. Help explains that chance can change the actual result.

Keep the earned Success grade unchanged, including N/A before the first report or after switching. Hide the preview when unenrolled, ineligible/paused, outside school ages or progression is blocked. Eligible zero-focus activities still preview their existing success calculation. Rendering, help and reloads never modify saves, ratings, success or RNG. Schema 20 and percentile references remain unchanged. Cache token: `activity-projection`. Browser/visual checks remain omitted by preference.

Validation: all 571 workspace tests pass (121 DOM checks), including live focus updates, effective-stat inputs, first-year and earned grades, unchanged saves/RNG, forecast parity, bounds and availability gates. All 28 local HTTP assets match source. Existing report formulas and random-draw counts remain unchanged.

Published as `6a8561e788c095c43e05c2210c686f8943c37271` to main. The isolated release passes 531 tests (117 DOM checks), and all 27 local and live assets match. GitHub Pages successfully built the intended commit. All 97 working files were preserved while aligning main; earlier unpublished work remains local.
