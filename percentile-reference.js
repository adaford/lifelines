// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1984,
      "female": 1981
    },
    "cryLevel": 3,
    "cryThroughAge": 1,
    "focus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2,
      "sports": 0,
      "extracurricular": 0
    },
    "toddlerFocus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2,
      "creative": 2
    },
    "choices": "uniform, independent seeded draws",
    "focusPolicy": "core two-point targets with optional school activities unenrolled and both sports and extracurricular inactivity penalties active; fitted to birth-condition budgets and active condition/event caps; spare points left unused",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3980,
      3977,
      3977,
      3977,
      3976,
      3976,
      3976,
      3976,
      3976,
      3976,
      3974,
      3973,
      3973,
      3972,
      3970,
      3969,
      3968,
      3965
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
    },
    "choiceStatMultiplier": 6,
    "infantStabilityMultiplier": 2,
    "skillVariation": {
      "proportional": 0.1
    },
    "development": {
      "innateScale": 0.6
    },
    "reproduce": "node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001"
  },
  "stats": {
    "intelligence": {
      "mean": 5,
      "observedMean": 4.718681,
      "sd": 1.902417,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.074535,
          "sd": 2.17921
        },
        {
          "mean": 5,
          "observedMean": 5.259103,
          "sd": 2.156768
        },
        {
          "mean": 5,
          "observedMean": 5.437076,
          "sd": 2.133125
        },
        {
          "mean": 5,
          "observedMean": 5.492479,
          "sd": 2.124831
        },
        {
          "mean": 5,
          "observedMean": 5.502064,
          "sd": 2.122562
        },
        {
          "mean": 5,
          "observedMean": 5.506668,
          "sd": 2.117754
        },
        {
          "mean": 5,
          "observedMean": 5.453428,
          "sd": 2.100441
        },
        {
          "mean": 5,
          "observedMean": 5.400133,
          "sd": 2.081801
        },
        {
          "mean": 5,
          "observedMean": 5.351212,
          "sd": 2.062854
        },
        {
          "mean": 5,
          "observedMean": 5.306144,
          "sd": 2.043547
        },
        {
          "mean": 5,
          "observedMean": 5.259555,
          "sd": 2.022396
        },
        {
          "mean": 5,
          "observedMean": 5.215214,
          "sd": 2.005008
        },
        {
          "mean": 5,
          "observedMean": 5.170113,
          "sd": 1.988203
        },
        {
          "mean": 5,
          "observedMean": 5.123151,
          "sd": 1.971392
        },
        {
          "mean": 5,
          "observedMean": 5.043376,
          "sd": 1.953983
        },
        {
          "mean": 5,
          "observedMean": 4.963904,
          "sd": 1.937261
        },
        {
          "mean": 5,
          "observedMean": 4.890988,
          "sd": 1.919794
        },
        {
          "mean": 5,
          "observedMean": 4.809869,
          "sd": 1.907081
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 2.835493,
      "sd": 1.886782,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030385,
          "sd": 2.206269
        },
        {
          "mean": 5,
          "observedMean": 5.032535,
          "sd": 2.204983
        },
        {
          "mean": 5,
          "observedMean": 5.033347,
          "sd": 2.204106
        },
        {
          "mean": 5,
          "observedMean": 5.008489,
          "sd": 2.201955
        },
        {
          "mean": 5,
          "observedMean": 4.986291,
          "sd": 2.196258
        },
        {
          "mean": 5,
          "observedMean": 4.960855,
          "sd": 2.196928
        },
        {
          "mean": 5,
          "observedMean": 4.78202,
          "sd": 2.178593
        },
        {
          "mean": 5,
          "observedMean": 4.607975,
          "sd": 2.162178
        },
        {
          "mean": 5,
          "observedMean": 4.437711,
          "sd": 2.143011
        },
        {
          "mean": 5,
          "observedMean": 4.267613,
          "sd": 2.123369
        },
        {
          "mean": 5,
          "observedMean": 4.100624,
          "sd": 2.103549
        },
        {
          "mean": 5,
          "observedMean": 3.931842,
          "sd": 2.081315
        },
        {
          "mean": 5,
          "observedMean": 3.768555,
          "sd": 2.056538
        },
        {
          "mean": 5,
          "observedMean": 3.609753,
          "sd": 2.033551
        },
        {
          "mean": 5,
          "observedMean": 3.449841,
          "sd": 2.009025
        },
        {
          "mean": 5,
          "observedMean": 3.290743,
          "sd": 1.980516
        },
        {
          "mean": 5,
          "observedMean": 3.134722,
          "sd": 1.949566
        },
        {
          "mean": 5,
          "observedMean": 2.981184,
          "sd": 1.9158
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.853924,
      "sd": 2.004984,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938915,
          "sd": 2.023951
        },
        {
          "mean": 5,
          "observedMean": 4.938798,
          "sd": 2.024483
        },
        {
          "mean": 5,
          "observedMean": 4.930875,
          "sd": 2.023511
        },
        {
          "mean": 5,
          "observedMean": 4.923186,
          "sd": 2.023337
        },
        {
          "mean": 5,
          "observedMean": 4.914693,
          "sd": 2.022288
        },
        {
          "mean": 5,
          "observedMean": 4.906803,
          "sd": 2.020309
        },
        {
          "mean": 5,
          "observedMean": 4.89835,
          "sd": 2.019341
        },
        {
          "mean": 5,
          "observedMean": 4.889122,
          "sd": 2.01776
        },
        {
          "mean": 5,
          "observedMean": 4.880249,
          "sd": 2.016282
        },
        {
          "mean": 5,
          "observedMean": 4.870121,
          "sd": 2.014859
        },
        {
          "mean": 5,
          "observedMean": 4.861492,
          "sd": 2.013718
        },
        {
          "mean": 5,
          "observedMean": 4.851488,
          "sd": 2.012967
        },
        {
          "mean": 5,
          "observedMean": 4.840614,
          "sd": 2.011994
        },
        {
          "mean": 5,
          "observedMean": 4.842581,
          "sd": 2.010758
        },
        {
          "mean": 5,
          "observedMean": 4.846982,
          "sd": 2.009168
        },
        {
          "mean": 5,
          "observedMean": 4.849892,
          "sd": 2.007522
        },
        {
          "mean": 5,
          "observedMean": 4.850648,
          "sd": 2.005461
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.538696,
      "sd": 2.01101,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.002082,
          "sd": 2.21191
        },
        {
          "mean": 5,
          "observedMean": 5.052018,
          "sd": 2.198416
        },
        {
          "mean": 5,
          "observedMean": 5.104355,
          "sd": 2.188266
        },
        {
          "mean": 5,
          "observedMean": 5.172102,
          "sd": 2.176031
        },
        {
          "mean": 5,
          "observedMean": 5.212995,
          "sd": 2.169705
        },
        {
          "mean": 5,
          "observedMean": 5.234381,
          "sd": 2.165485
        },
        {
          "mean": 5,
          "observedMean": 5.171202,
          "sd": 2.142365
        },
        {
          "mean": 5,
          "observedMean": 5.11331,
          "sd": 2.134346
        },
        {
          "mean": 5,
          "observedMean": 5.055561,
          "sd": 2.119098
        },
        {
          "mean": 5,
          "observedMean": 5.006972,
          "sd": 2.110543
        },
        {
          "mean": 5,
          "observedMean": 4.959962,
          "sd": 2.103243
        },
        {
          "mean": 5,
          "observedMean": 4.908578,
          "sd": 2.093983
        },
        {
          "mean": 5,
          "observedMean": 4.868565,
          "sd": 2.081593
        },
        {
          "mean": 5,
          "observedMean": 4.825505,
          "sd": 2.074087
        },
        {
          "mean": 5,
          "observedMean": 4.772779,
          "sd": 2.064133
        },
        {
          "mean": 5,
          "observedMean": 4.72006,
          "sd": 2.047238
        },
        {
          "mean": 5,
          "observedMean": 4.660154,
          "sd": 2.031052
        },
        {
          "mean": 5,
          "observedMean": 4.608604,
          "sd": 2.021661
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.756638,
      "sd": 1.992959,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.097369,
          "sd": 2.207042
        },
        {
          "mean": 5,
          "observedMean": 5.141169,
          "sd": 2.209905
        },
        {
          "mean": 5,
          "observedMean": 5.201398,
          "sd": 2.21128
        },
        {
          "mean": 5,
          "observedMean": 5.237493,
          "sd": 2.210746
        },
        {
          "mean": 5,
          "observedMean": 5.258778,
          "sd": 2.21043
        },
        {
          "mean": 5,
          "observedMean": 5.208287,
          "sd": 2.189686
        },
        {
          "mean": 5,
          "observedMean": 5.169291,
          "sd": 2.169123
        },
        {
          "mean": 5,
          "observedMean": 5.13201,
          "sd": 2.148221
        },
        {
          "mean": 5,
          "observedMean": 5.099135,
          "sd": 2.126294
        },
        {
          "mean": 5,
          "observedMean": 5.065048,
          "sd": 2.106361
        },
        {
          "mean": 5,
          "observedMean": 5.026057,
          "sd": 2.087603
        },
        {
          "mean": 5,
          "observedMean": 4.988377,
          "sd": 2.068364
        },
        {
          "mean": 5,
          "observedMean": 4.946131,
          "sd": 2.056525
        },
        {
          "mean": 5,
          "observedMean": 4.913676,
          "sd": 2.038873
        },
        {
          "mean": 5,
          "observedMean": 4.881879,
          "sd": 2.024149
        },
        {
          "mean": 5,
          "observedMean": 4.847637,
          "sd": 2.01223
        },
        {
          "mean": 5,
          "observedMean": 4.813357,
          "sd": 2.002458
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.690333,
      "sd": 2.137611,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.891608,
          "sd": 2.196033
        },
        {
          "mean": 5,
          "observedMean": 4.86603,
          "sd": 2.189742
        },
        {
          "mean": 5,
          "observedMean": 4.836336,
          "sd": 2.181156
        },
        {
          "mean": 5,
          "observedMean": 4.81562,
          "sd": 2.177945
        },
        {
          "mean": 5,
          "observedMean": 4.831974,
          "sd": 2.173297
        },
        {
          "mean": 5,
          "observedMean": 4.846554,
          "sd": 2.172194
        },
        {
          "mean": 5,
          "observedMean": 4.843101,
          "sd": 2.168561
        },
        {
          "mean": 5,
          "observedMean": 4.839874,
          "sd": 2.166485
        },
        {
          "mean": 5,
          "observedMean": 4.838011,
          "sd": 2.166072
        },
        {
          "mean": 5,
          "observedMean": 4.83625,
          "sd": 2.163939
        },
        {
          "mean": 5,
          "observedMean": 4.833343,
          "sd": 2.161762
        },
        {
          "mean": 5,
          "observedMean": 4.833118,
          "sd": 2.160095
        },
        {
          "mean": 5,
          "observedMean": 4.832839,
          "sd": 2.15738
        },
        {
          "mean": 5,
          "observedMean": 4.832127,
          "sd": 2.15597
        },
        {
          "mean": 5,
          "observedMean": 4.804834,
          "sd": 2.153457
        },
        {
          "mean": 5,
          "observedMean": 4.778209,
          "sd": 2.150953
        },
        {
          "mean": 5,
          "observedMean": 4.746672,
          "sd": 2.148335
        },
        {
          "mean": 5,
          "observedMean": 4.719252,
          "sd": 2.143804
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.865912,
      "sd": 2.099916,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.076249,
          "sd": 2.204686
        },
        {
          "mean": 5,
          "observedMean": 5.162426,
          "sd": 2.18401
        },
        {
          "mean": 5,
          "observedMean": 5.120744,
          "sd": 2.169254
        },
        {
          "mean": 5,
          "observedMean": 5.114254,
          "sd": 2.161449
        },
        {
          "mean": 5,
          "observedMean": 5.106097,
          "sd": 2.158935
        },
        {
          "mean": 5,
          "observedMean": 5.103267,
          "sd": 2.152144
        },
        {
          "mean": 5,
          "observedMean": 5.094205,
          "sd": 2.151709
        },
        {
          "mean": 5,
          "observedMean": 5.088436,
          "sd": 2.145005
        },
        {
          "mean": 5,
          "observedMean": 5.085558,
          "sd": 2.142734
        },
        {
          "mean": 5,
          "observedMean": 5.076974,
          "sd": 2.140235
        },
        {
          "mean": 5,
          "observedMean": 5.0707,
          "sd": 2.132681
        },
        {
          "mean": 5,
          "observedMean": 5.066962,
          "sd": 2.127139
        },
        {
          "mean": 5,
          "observedMean": 5.060415,
          "sd": 2.127023
        },
        {
          "mean": 5,
          "observedMean": 5.032256,
          "sd": 2.118824
        },
        {
          "mean": 5,
          "observedMean": 4.994753,
          "sd": 2.110393
        },
        {
          "mean": 5,
          "observedMean": 4.951441,
          "sd": 2.103015
        },
        {
          "mean": 5,
          "observedMean": 4.911386,
          "sd": 2.099499
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.01561,
      "sd": 3.168261,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.77709,
          "sd": 1.122852
        },
        {
          "mean": 33.967552,
          "sd": 1.298739
        },
        {
          "mean": 37.293977,
          "sd": 1.448244
        },
        {
          "mean": 40.129663,
          "sd": 1.577604
        },
        {
          "mean": 42.733947,
          "sd": 1.698217
        },
        {
          "mean": 45.2528,
          "sd": 1.829084
        },
        {
          "mean": 47.735716,
          "sd": 1.958565
        },
        {
          "mean": 50.104113,
          "sd": 2.083201
        },
        {
          "mean": 52.306229,
          "sd": 2.207339
        },
        {
          "mean": 54.305289,
          "sd": 2.33346
        },
        {
          "mean": 56.244628,
          "sd": 2.463675
        },
        {
          "mean": 58.458365,
          "sd": 2.674999
        },
        {
          "mean": 61.197394,
          "sd": 2.948393
        },
        {
          "mean": 64.089522,
          "sd": 3.153358
        },
        {
          "mean": 66.496348,
          "sd": 3.212699
        },
        {
          "mean": 68.084748,
          "sd": 3.1881
        },
        {
          "mean": 68.844315,
          "sd": 3.167376
        }
      ]
    },
    "female": {
      "mean": 63.94206,
      "sd": 2.760968,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 29.172186,
          "sd": 1.122265
        },
        {
          "mean": 33.472767,
          "sd": 1.295679
        },
        {
          "mean": 36.98507,
          "sd": 1.442531
        },
        {
          "mean": 39.65585,
          "sd": 1.558978
        },
        {
          "mean": 42.349321,
          "sd": 1.681065
        },
        {
          "mean": 45.109814,
          "sd": 1.810262
        },
        {
          "mean": 47.751756,
          "sd": 1.93695
        },
        {
          "mean": 50.123941,
          "sd": 2.041393
        },
        {
          "mean": 52.190091,
          "sd": 2.15246
        },
        {
          "mean": 54.193372,
          "sd": 2.28902
        },
        {
          "mean": 56.566375,
          "sd": 2.50311
        },
        {
          "mean": 59.28671,
          "sd": 2.732243
        },
        {
          "mean": 61.6307,
          "sd": 2.827353
        },
        {
          "mean": 63.123501,
          "sd": 2.80703
        },
        {
          "mean": 63.790388,
          "sd": 2.780562
        },
        {
          "mean": 63.932282,
          "sd": 2.767312
        },
        {
          "mean": 63.939476,
          "sd": 2.76565
        }
      ]
    }
  },
  "lifestyle": [
    {
      "mean": 4.97,
      "sd": 1.998775
    },
    {
      "mean": 5.077769,
      "sd": 1.975109
    },
    {
      "mean": 5.180903,
      "sd": 1.958838
    },
    {
      "mean": 5.283435,
      "sd": 1.932725
    },
    {
      "mean": 5.385205,
      "sd": 1.911086
    },
    {
      "mean": 5.489899,
      "sd": 1.889871
    },
    {
      "mean": 5.59172,
      "sd": 1.868122
    },
    {
      "mean": 5.683229,
      "sd": 1.849129
    },
    {
      "mean": 5.784359,
      "sd": 1.829114
    },
    {
      "mean": 5.882072,
      "sd": 1.806233
    },
    {
      "mean": 5.975143,
      "sd": 1.782944
    },
    {
      "mean": 6.064333,
      "sd": 1.763536
    },
    {
      "mean": 6.149341,
      "sd": 1.743688
    },
    {
      "mean": 6.23451,
      "sd": 1.720103
    },
    {
      "mean": 6.322072,
      "sd": 1.701313
    },
    {
      "mean": 6.407282,
      "sd": 1.683891
    },
    {
      "mean": 6.489476,
      "sd": 1.668681
    },
    {
      "mean": 6.569456,
      "sd": 1.654458
    }
  ]
};
