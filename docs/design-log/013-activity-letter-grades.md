# Sports and extracurricular letter grades (3 November 2026)

Validation: all **462 tests** pass, including 102 DOM checks for enrollment, chooser, reports, N/A, and preserved saved success. All 15 grade boundaries were checked; all **24 local HTTP assets** match source. Browser/visual checks remain omitted by preference.

Show activity success as F- through A+ in enrolled activity rows, the activity chooser, and completed report cards, using the same letter bands as GPA. Map the saved 0-10 success range to 50-100 with `50 + 5 * success`, then use `gradeLetter`; 0 is F-, 5 is C, and 9.4-10 is A+. Keep N/A before the first eligible completed year, after switching, and while an unrated activity is paused. Remove numeric /10 labels and activity success meters.

This is a display change only. Keep the stored two-decimal success values, annual progression, first-year baseline, enrollment rules, GPA, reports, RNG, and schema 20 unchanged. Render saved report endpoints as letter grades without rewriting history. The pure `activityGradeLetter` helper in `school.js` shares GPA's bands. No percentile recalibration is needed.
