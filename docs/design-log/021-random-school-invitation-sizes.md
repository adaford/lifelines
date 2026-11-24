# Random school invitation sizes (12 November 2026)

Lifestyle now sets the median number of choices, not a fixed count. Keep each category's independent yearly invitation chance at 20% + 8% * clamped Lifestyle. When invited, start with median max(2, round(Lifestyle)), then draw an offset -2/-1/0/+1/+2 with probabilities 10%/20%/40%/20%/10%, clamping the resulting count to 1-10. Lifestyle 1 therefore offers 1/2/3/4 choices with probabilities 30%/40%/20%/10% when an invitation arrives, giving median 2. Lifestyle 5 offers 3-7 with median 5; Lifestyle 10 offers 8-10 with median 10. These medians describe invitation years; years without an invitation still offer zero choices.

Sports and extracurriculars roll their invitation and size independently. Use the existing local seeded generator, keeping gameplay RNG untouched. Counts and activities remain saved for the year, with no rerolls on menus, forecasts, Lifestyle changes or reloads. Keep previous/current-activity exclusions, enrollment, keeping/leaving, saved history, schema 20 and all existing offers unchanged. This supersedes the fixed-count wording of the earlier invitation update. Cache token: `random-offer-counts`. Browser/visual checks remain omitted by preference.

Validation in the existing workspace: all 545 tests pass, including 30,000 sampled count pairs and 40,000 sampled invitation pairs. All 25 local HTTP assets match source.

Published the random-count update separately from pre-existing local edits as `7ff3b7d4581e7ec8028feb18fa3ed74e2fffb049`. The isolated release passed 505 tests. A fresh Pages build (workflow 43108993290) succeeded for that commit and all 24 live assets matched. Local main is aligned; existing workspace content was preserved.
