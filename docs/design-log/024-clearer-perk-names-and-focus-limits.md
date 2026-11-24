# Clearer perk names and focus limits (12 November 2026)

Rename Movement sensitive to Uncoordinated, Social hesitancy to Shy, Screen sensitive to Screen fatigue, and Needs recovery to Needs more rest. Clarify Uncoordinated as physical activities taking extra care while quiet learning comes more easily. Prefix every perk activity limit with Focus, such as Focus Yourself max 2, retaining its ages and lifelong status. Keep all perk IDs, affinities, probabilities, focus mechanics, saves and history unchanged. Cache token: `perk-wording`. Browser/visual checks remain omitted by preference.

Validation: all 559 workspace tests pass on Node 24.14.0, including 117 DOM checks; all 26 local HTTP assets match source. All 100 perk IDs and gameplay definitions match the prior release after excluding names and descriptions.

Published as `ee3ed2332144d33b33510469ca33c4f0666fc3fb` to main. The isolated release passes all 519 tests. GitHub Pages built that commit successfully and all 25 live assets match. All 94 working files were preserved while aligning main; earlier unpublished work remains local.
