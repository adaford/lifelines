// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1984,
      "female": 1982
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
    "focusPolicy": "core two-point targets with optional school activities unenrolled and the extracurricular neglect penalty active; fitted to birth-condition budgets and active condition/event caps; spare points left unused",
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
      3976,
      3975,
      3975,
      3975,
      3973,
      3970,
      3969,
      3966
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
    },
    "childhoodDeductionScale": 0.1,
    "choiceStatMultiplier": 6,
    "infantStabilityMultiplier": 2,
    "skillVariation": {
      "base": 0.02,
      "proportional": 0.1
    },
    "development": {
      "innateScale": 0.6,
      "skillReversion": 0.012,
      "childhoodBias": {
        "intelligence": -0.06525,
        "strength": 0.008169,
        "social": -0.085835,
        "creativity": -0.082402
      },
      "wellbeingTarget": {
        "health": 5.208824,
        "stability": 5.478434
      },
      "wellbeingReversion": {
        "health": 0.06,
        "stability": 0.08
      }
    },
    "reproduce": "node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001"
  },
  "stats": {
    "intelligence": {
      "mean": 5,
      "observedMean": 5.974781,
      "sd": 1.661182,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.060985,
          "sd": 2.188049
        },
        {
          "mean": 5,
          "observedMean": 5.240231,
          "sd": 2.143617
        },
        {
          "mean": 5,
          "observedMean": 5.412545,
          "sd": 2.099373
        },
        {
          "mean": 5,
          "observedMean": 5.453918,
          "sd": 2.064722
        },
        {
          "mean": 5,
          "observedMean": 5.449917,
          "sd": 2.037205
        },
        {
          "mean": 5,
          "observedMean": 5.439323,
          "sd": 2.006562
        },
        {
          "mean": 5,
          "observedMean": 5.500641,
          "sd": 1.972205
        },
        {
          "mean": 5,
          "observedMean": 5.560163,
          "sd": 1.9351
        },
        {
          "mean": 5,
          "observedMean": 5.622442,
          "sd": 1.90049
        },
        {
          "mean": 5,
          "observedMean": 5.688717,
          "sd": 1.87107
        },
        {
          "mean": 5,
          "observedMean": 5.752721,
          "sd": 1.836397
        },
        {
          "mean": 5,
          "observedMean": 5.810664,
          "sd": 1.807945
        },
        {
          "mean": 5,
          "observedMean": 5.865648,
          "sd": 1.777604
        },
        {
          "mean": 5,
          "observedMean": 5.914081,
          "sd": 1.748172
        },
        {
          "mean": 5,
          "observedMean": 5.937185,
          "sd": 1.729023
        },
        {
          "mean": 5,
          "observedMean": 5.948087,
          "sd": 1.707427
        },
        {
          "mean": 5,
          "observedMean": 5.95968,
          "sd": 1.687559
        },
        {
          "mean": 5,
          "observedMean": 5.97261,
          "sd": 1.674118
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.988192,
      "sd": 1.80191,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.036157,
          "sd": 2.205595
        },
        {
          "mean": 5,
          "observedMean": 5.046482,
          "sd": 2.174476
        },
        {
          "mean": 5,
          "observedMean": 5.055725,
          "sd": 2.144878
        },
        {
          "mean": 5,
          "observedMean": 5.039507,
          "sd": 2.114871
        },
        {
          "mean": 5,
          "observedMean": 5.025228,
          "sd": 2.08495
        },
        {
          "mean": 5,
          "observedMean": 5.010206,
          "sd": 2.059342
        },
        {
          "mean": 5,
          "observedMean": 5.004992,
          "sd": 2.034544
        },
        {
          "mean": 5,
          "observedMean": 5.005158,
          "sd": 2.012371
        },
        {
          "mean": 5,
          "observedMean": 5.004804,
          "sd": 1.991756
        },
        {
          "mean": 5,
          "observedMean": 5.005533,
          "sd": 1.967955
        },
        {
          "mean": 5,
          "observedMean": 5.006587,
          "sd": 1.947834
        },
        {
          "mean": 5,
          "observedMean": 5.009175,
          "sd": 1.927587
        },
        {
          "mean": 5,
          "observedMean": 5.01205,
          "sd": 1.909808
        },
        {
          "mean": 5,
          "observedMean": 5.012564,
          "sd": 1.891066
        },
        {
          "mean": 5,
          "observedMean": 5.008229,
          "sd": 1.871814
        },
        {
          "mean": 5,
          "observedMean": 5.000211,
          "sd": 1.85384
        },
        {
          "mean": 5,
          "observedMean": 4.998778,
          "sd": 1.834325
        },
        {
          "mean": 5,
          "observedMean": 4.995409,
          "sd": 1.818913
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.876906,
      "sd": 1.949856,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.945897,
          "sd": 2.030087
        },
        {
          "mean": 5,
          "observedMean": 4.943523,
          "sd": 2.024537
        },
        {
          "mean": 5,
          "observedMean": 4.943608,
          "sd": 2.021326
        },
        {
          "mean": 5,
          "observedMean": 4.934868,
          "sd": 2.015683
        },
        {
          "mean": 5,
          "observedMean": 4.926927,
          "sd": 2.012083
        },
        {
          "mean": 5,
          "observedMean": 4.917261,
          "sd": 2.007162
        },
        {
          "mean": 5,
          "observedMean": 4.909361,
          "sd": 2.001631
        },
        {
          "mean": 5,
          "observedMean": 4.901859,
          "sd": 1.996263
        },
        {
          "mean": 5,
          "observedMean": 4.895239,
          "sd": 1.991459
        },
        {
          "mean": 5,
          "observedMean": 4.889173,
          "sd": 1.988213
        },
        {
          "mean": 5,
          "observedMean": 4.881419,
          "sd": 1.983313
        },
        {
          "mean": 5,
          "observedMean": 4.874079,
          "sd": 1.979037
        },
        {
          "mean": 5,
          "observedMean": 4.866558,
          "sd": 1.973971
        },
        {
          "mean": 5,
          "observedMean": 4.858415,
          "sd": 1.969229
        },
        {
          "mean": 5,
          "observedMean": 4.863696,
          "sd": 1.965375
        },
        {
          "mean": 5,
          "observedMean": 4.867053,
          "sd": 1.962073
        },
        {
          "mean": 5,
          "observedMean": 4.869239,
          "sd": 1.957493
        },
        {
          "mean": 5,
          "observedMean": 4.873638,
          "sd": 1.954141
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.561967,
      "sd": 1.686106,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99889,
          "sd": 2.220147
        },
        {
          "mean": 5,
          "observedMean": 5.053741,
          "sd": 2.174811
        },
        {
          "mean": 5,
          "observedMean": 5.110432,
          "sd": 2.134748
        },
        {
          "mean": 5,
          "observedMean": 5.180241,
          "sd": 2.094952
        },
        {
          "mean": 5,
          "observedMean": 5.209532,
          "sd": 2.06255
        },
        {
          "mean": 5,
          "observedMean": 5.21963,
          "sd": 2.032273
        },
        {
          "mean": 5,
          "observedMean": 5.149406,
          "sd": 1.988393
        },
        {
          "mean": 5,
          "observedMean": 5.090624,
          "sd": 1.951457
        },
        {
          "mean": 5,
          "observedMean": 5.036071,
          "sd": 1.909762
        },
        {
          "mean": 5,
          "observedMean": 4.990196,
          "sd": 1.875025
        },
        {
          "mean": 5,
          "observedMean": 4.943846,
          "sd": 1.841673
        },
        {
          "mean": 5,
          "observedMean": 4.894374,
          "sd": 1.815293
        },
        {
          "mean": 5,
          "observedMean": 4.857162,
          "sd": 1.79064
        },
        {
          "mean": 5,
          "observedMean": 4.815459,
          "sd": 1.762288
        },
        {
          "mean": 5,
          "observedMean": 4.761897,
          "sd": 1.746747
        },
        {
          "mean": 5,
          "observedMean": 4.715563,
          "sd": 1.726116
        },
        {
          "mean": 5,
          "observedMean": 4.665466,
          "sd": 1.713153
        },
        {
          "mean": 5,
          "observedMean": 4.617803,
          "sd": 1.698366
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.575958,
      "sd": 1.692276,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043035,
          "sd": 2.202419
        },
        {
          "mean": 5,
          "observedMean": 5.064623,
          "sd": 2.170861
        },
        {
          "mean": 5,
          "observedMean": 5.087113,
          "sd": 2.137523
        },
        {
          "mean": 5,
          "observedMean": 5.126035,
          "sd": 2.106645
        },
        {
          "mean": 5,
          "observedMean": 5.152195,
          "sd": 2.081949
        },
        {
          "mean": 5,
          "observedMean": 5.162686,
          "sd": 2.055783
        },
        {
          "mean": 5,
          "observedMean": 5.105279,
          "sd": 2.018666
        },
        {
          "mean": 5,
          "observedMean": 5.059432,
          "sd": 1.983155
        },
        {
          "mean": 5,
          "observedMean": 5.011323,
          "sd": 1.950116
        },
        {
          "mean": 5,
          "observedMean": 4.977404,
          "sd": 1.914264
        },
        {
          "mean": 5,
          "observedMean": 4.937165,
          "sd": 1.884262
        },
        {
          "mean": 5,
          "observedMean": 4.898018,
          "sd": 1.853104
        },
        {
          "mean": 5,
          "observedMean": 4.854108,
          "sd": 1.827842
        },
        {
          "mean": 5,
          "observedMean": 4.810181,
          "sd": 1.802125
        },
        {
          "mean": 5,
          "observedMean": 4.768886,
          "sd": 1.777033
        },
        {
          "mean": 5,
          "observedMean": 4.726791,
          "sd": 1.752478
        },
        {
          "mean": 5,
          "observedMean": 4.677529,
          "sd": 1.731188
        },
        {
          "mean": 5,
          "observedMean": 4.640436,
          "sd": 1.713043
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.985234,
      "sd": 0.70185,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.900375,
          "sd": 2.197731
        },
        {
          "mean": 5,
          "observedMean": 4.894947,
          "sd": 2.033701
        },
        {
          "mean": 5,
          "observedMean": 4.885695,
          "sd": 1.881743
        },
        {
          "mean": 5,
          "observedMean": 4.885283,
          "sd": 1.74889
        },
        {
          "mean": 5,
          "observedMean": 4.922937,
          "sd": 1.622116
        },
        {
          "mean": 5,
          "observedMean": 4.956766,
          "sd": 1.509551
        },
        {
          "mean": 5,
          "observedMean": 4.973808,
          "sd": 1.403966
        },
        {
          "mean": 5,
          "observedMean": 4.988654,
          "sd": 1.307818
        },
        {
          "mean": 5,
          "observedMean": 5.001901,
          "sd": 1.220389
        },
        {
          "mean": 5,
          "observedMean": 5.0163,
          "sd": 1.140083
        },
        {
          "mean": 5,
          "observedMean": 5.03047,
          "sd": 1.064384
        },
        {
          "mean": 5,
          "observedMean": 5.043036,
          "sd": 0.998521
        },
        {
          "mean": 5,
          "observedMean": 5.053633,
          "sd": 0.934873
        },
        {
          "mean": 5,
          "observedMean": 5.06717,
          "sd": 0.877021
        },
        {
          "mean": 5,
          "observedMean": 5.051691,
          "sd": 0.836734
        },
        {
          "mean": 5,
          "observedMean": 5.033748,
          "sd": 0.798169
        },
        {
          "mean": 5,
          "observedMean": 5.015448,
          "sd": 0.767106
        },
        {
          "mean": 5,
          "observedMean": 5.00064,
          "sd": 0.733424
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.078227,
      "sd": 0.804389,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981425,
          "sd": 2.23032
        },
        {
          "mean": 5,
          "observedMean": 5.127191,
          "sd": 2.019901
        },
        {
          "mean": 5,
          "observedMean": 5.251954,
          "sd": 1.836687
        },
        {
          "mean": 5,
          "observedMean": 5.208675,
          "sd": 1.653085
        },
        {
          "mean": 5,
          "observedMean": 5.218114,
          "sd": 1.496463
        },
        {
          "mean": 5,
          "observedMean": 5.226693,
          "sd": 1.364446
        },
        {
          "mean": 5,
          "observedMean": 5.225332,
          "sd": 1.249462
        },
        {
          "mean": 5,
          "observedMean": 5.211061,
          "sd": 1.154472
        },
        {
          "mean": 5,
          "observedMean": 5.193911,
          "sd": 1.082379
        },
        {
          "mean": 5,
          "observedMean": 5.175508,
          "sd": 1.018432
        },
        {
          "mean": 5,
          "observedMean": 5.162113,
          "sd": 0.958556
        },
        {
          "mean": 5,
          "observedMean": 5.152437,
          "sd": 0.902659
        },
        {
          "mean": 5,
          "observedMean": 5.143328,
          "sd": 0.872826
        },
        {
          "mean": 5,
          "observedMean": 5.137691,
          "sd": 0.844152
        },
        {
          "mean": 5,
          "observedMean": 5.13002,
          "sd": 0.839498
        },
        {
          "mean": 5,
          "observedMean": 5.110936,
          "sd": 0.823378
        },
        {
          "mean": 5,
          "observedMean": 5.095101,
          "sd": 0.819814
        },
        {
          "mean": 5,
          "observedMean": 5.08715,
          "sd": 0.815633
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.243533,
      "sd": 3.074049,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.777085,
          "sd": 1.122752
        },
        {
          "mean": 33.969005,
          "sd": 1.298638
        },
        {
          "mean": 37.297768,
          "sd": 1.447442
        },
        {
          "mean": 40.137381,
          "sd": 1.576626
        },
        {
          "mean": 42.74736,
          "sd": 1.696597
        },
        {
          "mean": 45.282333,
          "sd": 1.814574
        },
        {
          "mean": 47.768954,
          "sd": 1.941044
        },
        {
          "mean": 50.159321,
          "sd": 2.061934
        },
        {
          "mean": 52.363851,
          "sd": 2.178456
        },
        {
          "mean": 54.370654,
          "sd": 2.297402
        },
        {
          "mean": 56.330458,
          "sd": 2.431947
        },
        {
          "mean": 58.569492,
          "sd": 2.639787
        },
        {
          "mean": 61.331654,
          "sd": 2.901914
        },
        {
          "mean": 64.247954,
          "sd": 3.080697
        },
        {
          "mean": 66.667755,
          "sd": 3.133255
        },
        {
          "mean": 68.28535,
          "sd": 3.104222
        },
        {
          "mean": 69.063975,
          "sd": 3.073896
        }
      ]
    },
    "female": {
      "mean": 64.12113,
      "sd": 2.764789,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 29.172291,
          "sd": 1.122278
        },
        {
          "mean": 33.474029,
          "sd": 1.29579
        },
        {
          "mean": 36.988737,
          "sd": 1.442905
        },
        {
          "mean": 39.663109,
          "sd": 1.559317
        },
        {
          "mean": 42.362365,
          "sd": 1.681367
        },
        {
          "mean": 45.128017,
          "sd": 1.814488
        },
        {
          "mean": 47.779396,
          "sd": 1.940606
        },
        {
          "mean": 50.16772,
          "sd": 2.059853
        },
        {
          "mean": 52.251751,
          "sd": 2.169567
        },
        {
          "mean": 54.277328,
          "sd": 2.30126
        },
        {
          "mean": 56.667036,
          "sd": 2.51516
        },
        {
          "mean": 59.404894,
          "sd": 2.733551
        },
        {
          "mean": 61.772367,
          "sd": 2.83058
        },
        {
          "mean": 63.281193,
          "sd": 2.809046
        },
        {
          "mean": 63.964758,
          "sd": 2.782816
        },
        {
          "mean": 64.115199,
          "sd": 2.766492
        },
        {
          "mean": 64.120524,
          "sd": 2.763555
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
      "mean": 5.077558,
      "sd": 1.975365
    },
    {
      "mean": 5.180732,
      "sd": 1.958572
    },
    {
      "mean": 5.282982,
      "sd": 1.932743
    },
    {
      "mean": 5.384991,
      "sd": 1.910756
    },
    {
      "mean": 5.490752,
      "sd": 1.889793
    },
    {
      "mean": 5.594399,
      "sd": 1.872413
    },
    {
      "mean": 5.691665,
      "sd": 1.853038
    },
    {
      "mean": 5.785782,
      "sd": 1.838127
    },
    {
      "mean": 5.874947,
      "sd": 1.82027
    },
    {
      "mean": 5.96839,
      "sd": 1.794437
    },
    {
      "mean": 6.062852,
      "sd": 1.770822
    },
    {
      "mean": 6.153203,
      "sd": 1.747622
    },
    {
      "mean": 6.239089,
      "sd": 1.729614
    },
    {
      "mean": 6.318254,
      "sd": 1.713755
    },
    {
      "mean": 6.397903,
      "sd": 1.698013
    },
    {
      "mean": 6.48428,
      "sd": 1.678652
    },
    {
      "mean": 6.562691,
      "sd": 1.661876
    }
  ]
};
