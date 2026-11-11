// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1982,
      "female": 1983
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
      3971,
      3970,
      3968,
      3967,
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
      "observedMean": 4.771899,
      "sd": 1.906868,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.074535,
          "sd": 2.17921
        },
        {
          "mean": 5,
          "observedMean": 5.259146,
          "sd": 2.156808
        },
        {
          "mean": 5,
          "observedMean": 5.437118,
          "sd": 2.133165
        },
        {
          "mean": 5,
          "observedMean": 5.492464,
          "sd": 2.125013
        },
        {
          "mean": 5,
          "observedMean": 5.50214,
          "sd": 2.122801
        },
        {
          "mean": 5,
          "observedMean": 5.506904,
          "sd": 2.117765
        },
        {
          "mean": 5,
          "observedMean": 5.462098,
          "sd": 2.09949
        },
        {
          "mean": 5,
          "observedMean": 5.416894,
          "sd": 2.08089
        },
        {
          "mean": 5,
          "observedMean": 5.373415,
          "sd": 2.061426
        },
        {
          "mean": 5,
          "observedMean": 5.334603,
          "sd": 2.041531
        },
        {
          "mean": 5,
          "observedMean": 5.293551,
          "sd": 2.019739
        },
        {
          "mean": 5,
          "observedMean": 5.255048,
          "sd": 2.001371
        },
        {
          "mean": 5,
          "observedMean": 5.215988,
          "sd": 1.984923
        },
        {
          "mean": 5,
          "observedMean": 5.172776,
          "sd": 1.969125
        },
        {
          "mean": 5,
          "observedMean": 5.093324,
          "sd": 1.958316
        },
        {
          "mean": 5,
          "observedMean": 5.012922,
          "sd": 1.946654
        },
        {
          "mean": 5,
          "observedMean": 4.938574,
          "sd": 1.926591
        },
        {
          "mean": 5,
          "observedMean": 4.861391,
          "sd": 1.914185
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 2.863718,
      "sd": 1.897067,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030385,
          "sd": 2.206269
        },
        {
          "mean": 5,
          "observedMean": 5.03251,
          "sd": 2.204941
        },
        {
          "mean": 5,
          "observedMean": 5.033322,
          "sd": 2.204063
        },
        {
          "mean": 5,
          "observedMean": 5.008828,
          "sd": 2.201664
        },
        {
          "mean": 5,
          "observedMean": 4.986646,
          "sd": 2.195651
        },
        {
          "mean": 5,
          "observedMean": 4.961408,
          "sd": 2.196353
        },
        {
          "mean": 5,
          "observedMean": 4.785629,
          "sd": 2.177756
        },
        {
          "mean": 5,
          "observedMean": 4.614467,
          "sd": 2.161475
        },
        {
          "mean": 5,
          "observedMean": 4.447211,
          "sd": 2.142069
        },
        {
          "mean": 5,
          "observedMean": 4.280636,
          "sd": 2.122542
        },
        {
          "mean": 5,
          "observedMean": 4.117181,
          "sd": 2.103987
        },
        {
          "mean": 5,
          "observedMean": 3.950654,
          "sd": 2.083163
        },
        {
          "mean": 5,
          "observedMean": 3.789446,
          "sd": 2.059302
        },
        {
          "mean": 5,
          "observedMean": 3.632962,
          "sd": 2.037446
        },
        {
          "mean": 5,
          "observedMean": 3.470363,
          "sd": 2.010924
        },
        {
          "mean": 5,
          "observedMean": 3.312894,
          "sd": 1.98298
        },
        {
          "mean": 5,
          "observedMean": 3.159667,
          "sd": 1.954227
        },
        {
          "mean": 5,
          "observedMean": 3.012455,
          "sd": 1.928123
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.858232,
      "sd": 2.002223,
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
          "observedMean": 4.930888,
          "sd": 2.023449
        },
        {
          "mean": 5,
          "observedMean": 4.923219,
          "sd": 2.023249
        },
        {
          "mean": 5,
          "observedMean": 4.914723,
          "sd": 2.022157
        },
        {
          "mean": 5,
          "observedMean": 4.906876,
          "sd": 2.020159
        },
        {
          "mean": 5,
          "observedMean": 4.898544,
          "sd": 2.019183
        },
        {
          "mean": 5,
          "observedMean": 4.889422,
          "sd": 2.017614
        },
        {
          "mean": 5,
          "observedMean": 4.880664,
          "sd": 2.016094
        },
        {
          "mean": 5,
          "observedMean": 4.870654,
          "sd": 2.014815
        },
        {
          "mean": 5,
          "observedMean": 4.862048,
          "sd": 2.013536
        },
        {
          "mean": 5,
          "observedMean": 4.852288,
          "sd": 2.012766
        },
        {
          "mean": 5,
          "observedMean": 4.841679,
          "sd": 2.011909
        },
        {
          "mean": 5,
          "observedMean": 4.84551,
          "sd": 2.009975
        },
        {
          "mean": 5,
          "observedMean": 4.849264,
          "sd": 2.008376
        },
        {
          "mean": 5,
          "observedMean": 4.85339,
          "sd": 2.006566
        },
        {
          "mean": 5,
          "observedMean": 4.854222,
          "sd": 2.005569
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.710858,
      "sd": 1.935471,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.002082,
          "sd": 2.21191
        },
        {
          "mean": 5,
          "observedMean": 5.052211,
          "sd": 2.198254
        },
        {
          "mean": 5,
          "observedMean": 5.104536,
          "sd": 2.187895
        },
        {
          "mean": 5,
          "observedMean": 5.172243,
          "sd": 2.175779
        },
        {
          "mean": 5,
          "observedMean": 5.213407,
          "sd": 2.169433
        },
        {
          "mean": 5,
          "observedMean": 5.234774,
          "sd": 2.165205
        },
        {
          "mean": 5,
          "observedMean": 5.188332,
          "sd": 2.137449
        },
        {
          "mean": 5,
          "observedMean": 5.150297,
          "sd": 2.114302
        },
        {
          "mean": 5,
          "observedMean": 5.10911,
          "sd": 2.086047
        },
        {
          "mean": 5,
          "observedMean": 5.073189,
          "sd": 2.069813
        },
        {
          "mean": 5,
          "observedMean": 5.042968,
          "sd": 2.055279
        },
        {
          "mean": 5,
          "observedMean": 5.004283,
          "sd": 2.038877
        },
        {
          "mean": 5,
          "observedMean": 4.977989,
          "sd": 2.020503
        },
        {
          "mean": 5,
          "observedMean": 4.947506,
          "sd": 2.004688
        },
        {
          "mean": 5,
          "observedMean": 4.89998,
          "sd": 1.984614
        },
        {
          "mean": 5,
          "observedMean": 4.850569,
          "sd": 1.972161
        },
        {
          "mean": 5,
          "observedMean": 4.807455,
          "sd": 1.960197
        },
        {
          "mean": 5,
          "observedMean": 4.766637,
          "sd": 1.948191
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.849153,
      "sd": 2.013182,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.097399,
          "sd": 2.207096
        },
        {
          "mean": 5,
          "observedMean": 5.14135,
          "sd": 2.209936
        },
        {
          "mean": 5,
          "observedMean": 5.201471,
          "sd": 2.211554
        },
        {
          "mean": 5,
          "observedMean": 5.237229,
          "sd": 2.21134
        },
        {
          "mean": 5,
          "observedMean": 5.258199,
          "sd": 2.211037
        },
        {
          "mean": 5,
          "observedMean": 5.217887,
          "sd": 2.191786
        },
        {
          "mean": 5,
          "observedMean": 5.188131,
          "sd": 2.174527
        },
        {
          "mean": 5,
          "observedMean": 5.15955,
          "sd": 2.154288
        },
        {
          "mean": 5,
          "observedMean": 5.135287,
          "sd": 2.135541
        },
        {
          "mean": 5,
          "observedMean": 5.108332,
          "sd": 2.117021
        },
        {
          "mean": 5,
          "observedMean": 5.076668,
          "sd": 2.099324
        },
        {
          "mean": 5,
          "observedMean": 5.0478,
          "sd": 2.083407
        },
        {
          "mean": 5,
          "observedMean": 5.013549,
          "sd": 2.072978
        },
        {
          "mean": 5,
          "observedMean": 4.983085,
          "sd": 2.063427
        },
        {
          "mean": 5,
          "observedMean": 4.952615,
          "sd": 2.054156
        },
        {
          "mean": 5,
          "observedMean": 4.925847,
          "sd": 2.043997
        },
        {
          "mean": 5,
          "observedMean": 4.900698,
          "sd": 2.029138
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.674386,
      "sd": 2.155,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.891608,
          "sd": 2.196033
        },
        {
          "mean": 5,
          "observedMean": 4.865791,
          "sd": 2.189768
        },
        {
          "mean": 5,
          "observedMean": 4.836457,
          "sd": 2.180869
        },
        {
          "mean": 5,
          "observedMean": 4.814667,
          "sd": 2.177099
        },
        {
          "mean": 5,
          "observedMean": 4.830845,
          "sd": 2.172794
        },
        {
          "mean": 5,
          "observedMean": 4.845229,
          "sd": 2.171157
        },
        {
          "mean": 5,
          "observedMean": 4.843999,
          "sd": 2.166982
        },
        {
          "mean": 5,
          "observedMean": 4.842912,
          "sd": 2.165096
        },
        {
          "mean": 5,
          "observedMean": 4.843473,
          "sd": 2.163246
        },
        {
          "mean": 5,
          "observedMean": 4.843232,
          "sd": 2.160571
        },
        {
          "mean": 5,
          "observedMean": 4.84208,
          "sd": 2.15934
        },
        {
          "mean": 5,
          "observedMean": 4.841789,
          "sd": 2.157975
        },
        {
          "mean": 5,
          "observedMean": 4.840186,
          "sd": 2.156018
        },
        {
          "mean": 5,
          "observedMean": 4.837861,
          "sd": 2.154813
        },
        {
          "mean": 5,
          "observedMean": 4.806437,
          "sd": 2.155481
        },
        {
          "mean": 5,
          "observedMean": 4.777771,
          "sd": 2.15354
        },
        {
          "mean": 5,
          "observedMean": 4.743727,
          "sd": 2.153908
        },
        {
          "mean": 5,
          "observedMean": 4.709231,
          "sd": 2.156173
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.643039,
      "sd": 1.909323,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.071982,
          "sd": 2.200587
        },
        {
          "mean": 5,
          "observedMean": 5.152012,
          "sd": 2.176234
        },
        {
          "mean": 5,
          "observedMean": 5.093136,
          "sd": 2.147212
        },
        {
          "mean": 5,
          "observedMean": 5.082039,
          "sd": 2.133203
        },
        {
          "mean": 5,
          "observedMean": 5.071499,
          "sd": 2.124553
        },
        {
          "mean": 5,
          "observedMean": 5.062963,
          "sd": 2.092069
        },
        {
          "mean": 5,
          "observedMean": 5.028302,
          "sd": 2.075631
        },
        {
          "mean": 5,
          "observedMean": 4.998255,
          "sd": 2.047774
        },
        {
          "mean": 5,
          "observedMean": 4.968443,
          "sd": 2.029776
        },
        {
          "mean": 5,
          "observedMean": 4.938667,
          "sd": 2.013362
        },
        {
          "mean": 5,
          "observedMean": 4.899353,
          "sd": 1.991437
        },
        {
          "mean": 5,
          "observedMean": 4.869547,
          "sd": 1.975265
        },
        {
          "mean": 5,
          "observedMean": 4.83005,
          "sd": 1.961384
        },
        {
          "mean": 5,
          "observedMean": 4.798011,
          "sd": 1.947179
        },
        {
          "mean": 5,
          "observedMean": 4.754259,
          "sd": 1.933509
        },
        {
          "mean": 5,
          "observedMean": 4.717371,
          "sd": 1.924057
        },
        {
          "mean": 5,
          "observedMean": 4.683085,
          "sd": 1.920573
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.0144,
      "sd": 3.16452,
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
          "mean": 33.967557,
          "sd": 1.29872
        },
        {
          "mean": 37.294022,
          "sd": 1.448194
        },
        {
          "mean": 40.129749,
          "sd": 1.5776
        },
        {
          "mean": 42.734072,
          "sd": 1.698281
        },
        {
          "mean": 45.253102,
          "sd": 1.829282
        },
        {
          "mean": 47.735938,
          "sd": 1.95868
        },
        {
          "mean": 50.104615,
          "sd": 2.083434
        },
        {
          "mean": 52.306968,
          "sd": 2.207632
        },
        {
          "mean": 54.306184,
          "sd": 2.333771
        },
        {
          "mean": 56.245976,
          "sd": 2.464078
        },
        {
          "mean": 58.460548,
          "sd": 2.676319
        },
        {
          "mean": 61.200317,
          "sd": 2.949733
        },
        {
          "mean": 64.094743,
          "sd": 3.145689
        },
        {
          "mean": 66.492932,
          "sd": 3.202954
        },
        {
          "mean": 68.082858,
          "sd": 3.176313
        },
        {
          "mean": 68.843306,
          "sd": 3.159419
        }
      ]
    },
    "female": {
      "mean": 63.939965,
      "sd": 2.760132,
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
          "mean": 33.472736,
          "sd": 1.295664
        },
        {
          "mean": 36.985035,
          "sd": 1.442499
        },
        {
          "mean": 39.655815,
          "sd": 1.558897
        },
        {
          "mean": 42.349316,
          "sd": 1.680904
        },
        {
          "mean": 45.109789,
          "sd": 1.809975
        },
        {
          "mean": 47.751963,
          "sd": 1.93628
        },
        {
          "mean": 50.124248,
          "sd": 2.040656
        },
        {
          "mean": 52.190453,
          "sd": 2.151816
        },
        {
          "mean": 54.193991,
          "sd": 2.288692
        },
        {
          "mean": 56.566863,
          "sd": 2.502601
        },
        {
          "mean": 59.287431,
          "sd": 2.731769
        },
        {
          "mean": 61.632338,
          "sd": 2.825969
        },
        {
          "mean": 63.119869,
          "sd": 2.800905
        },
        {
          "mean": 63.78596,
          "sd": 2.774276
        },
        {
          "mean": 63.932964,
          "sd": 2.761761
        },
        {
          "mean": 63.939965,
          "sd": 2.760132
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
      "mean": 5.489736,
      "sd": 1.889816
    },
    {
      "mean": 5.59173,
      "sd": 1.867807
    },
    {
      "mean": 5.683272,
      "sd": 1.848682
    },
    {
      "mean": 5.784142,
      "sd": 1.828702
    },
    {
      "mean": 5.881585,
      "sd": 1.806227
    },
    {
      "mean": 5.974831,
      "sd": 1.782628
    },
    {
      "mean": 6.063993,
      "sd": 1.762929
    },
    {
      "mean": 6.14932,
      "sd": 1.742552
    },
    {
      "mean": 6.234022,
      "sd": 1.719034
    },
    {
      "mean": 6.321763,
      "sd": 1.703988
    },
    {
      "mean": 6.408849,
      "sd": 1.684095
    },
    {
      "mean": 6.485325,
      "sd": 1.67176
    },
    {
      "mean": 6.556594,
      "sd": 1.654661
    }
  ]
};
