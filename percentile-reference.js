// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1983,
      "female": 1979
    },
    "cryLevel": 3,
    "cryThroughAge": 1,
    "focus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2
    },
    "toddlerFocus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2,
      "creative": 2
    },
    "choices": "uniform, independent seeded draws",
    "focusPolicy": "two-point targets fitted to birth-condition budgets and active condition/event caps; spare points left unused",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3980,
      3977,
      3977,
      3977,
      3976,
      3975,
      3975,
      3975,
      3975,
      3975,
      3973,
      3973,
      3973,
      3972,
      3971,
      3967,
      3964,
      3962
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
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
      "observedMean": 4.997615,
      "sd": 1.583337,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.060985,
          "sd": 2.188049
        },
        {
          "mean": 5,
          "observedMean": 5.066563,
          "sd": 2.148868
        },
        {
          "mean": 5,
          "observedMean": 5.071401,
          "sd": 2.109166
        },
        {
          "mean": 5,
          "observedMean": 5.061589,
          "sd": 2.066666
        },
        {
          "mean": 5,
          "observedMean": 5.032592,
          "sd": 2.027063
        },
        {
          "mean": 5,
          "observedMean": 4.993146,
          "sd": 1.9849
        },
        {
          "mean": 5,
          "observedMean": 5.001401,
          "sd": 1.938316
        },
        {
          "mean": 5,
          "observedMean": 5.020081,
          "sd": 1.896546
        },
        {
          "mean": 5,
          "observedMean": 5.035452,
          "sd": 1.858161
        },
        {
          "mean": 5,
          "observedMean": 5.048986,
          "sd": 1.820771
        },
        {
          "mean": 5,
          "observedMean": 5.063683,
          "sd": 1.790678
        },
        {
          "mean": 5,
          "observedMean": 5.079846,
          "sd": 1.760894
        },
        {
          "mean": 5,
          "observedMean": 5.093295,
          "sd": 1.725474
        },
        {
          "mean": 5,
          "observedMean": 5.104828,
          "sd": 1.693075
        },
        {
          "mean": 5,
          "observedMean": 5.080098,
          "sd": 1.672215
        },
        {
          "mean": 5,
          "observedMean": 5.057469,
          "sd": 1.650902
        },
        {
          "mean": 5,
          "observedMean": 5.039607,
          "sd": 1.630996
        },
        {
          "mean": 5,
          "observedMean": 5.022977,
          "sd": 1.600051
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.002256,
      "sd": 1.751069,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.036157,
          "sd": 2.205595
        },
        {
          "mean": 5,
          "observedMean": 5.045352,
          "sd": 2.170528
        },
        {
          "mean": 5,
          "observedMean": 5.053835,
          "sd": 2.13712
        },
        {
          "mean": 5,
          "observedMean": 5.045756,
          "sd": 2.102571
        },
        {
          "mean": 5,
          "observedMean": 5.037855,
          "sd": 2.069321
        },
        {
          "mean": 5,
          "observedMean": 5.030704,
          "sd": 2.03945
        },
        {
          "mean": 5,
          "observedMean": 5.030327,
          "sd": 2.010543
        },
        {
          "mean": 5,
          "observedMean": 5.028408,
          "sd": 1.98724
        },
        {
          "mean": 5,
          "observedMean": 5.029932,
          "sd": 1.963814
        },
        {
          "mean": 5,
          "observedMean": 5.028433,
          "sd": 1.935941
        },
        {
          "mean": 5,
          "observedMean": 5.02634,
          "sd": 1.913869
        },
        {
          "mean": 5,
          "observedMean": 5.026559,
          "sd": 1.891566
        },
        {
          "mean": 5,
          "observedMean": 5.027614,
          "sd": 1.869451
        },
        {
          "mean": 5,
          "observedMean": 5.030116,
          "sd": 1.852099
        },
        {
          "mean": 5,
          "observedMean": 5.024267,
          "sd": 1.829403
        },
        {
          "mean": 5,
          "observedMean": 5.018907,
          "sd": 1.80805
        },
        {
          "mean": 5,
          "observedMean": 5.012584,
          "sd": 1.788902
        },
        {
          "mean": 5,
          "observedMean": 5.004011,
          "sd": 1.770536
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.875555,
      "sd": 1.944834,
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
          "observedMean": 4.934823,
          "sd": 2.015601
        },
        {
          "mean": 5,
          "observedMean": 4.926799,
          "sd": 2.011923
        },
        {
          "mean": 5,
          "observedMean": 4.917155,
          "sd": 2.006931
        },
        {
          "mean": 5,
          "observedMean": 4.910445,
          "sd": 2.002538
        },
        {
          "mean": 5,
          "observedMean": 4.902725,
          "sd": 1.997497
        },
        {
          "mean": 5,
          "observedMean": 4.894979,
          "sd": 1.992177
        },
        {
          "mean": 5,
          "observedMean": 4.888023,
          "sd": 1.986832
        },
        {
          "mean": 5,
          "observedMean": 4.879638,
          "sd": 1.981884
        },
        {
          "mean": 5,
          "observedMean": 4.871815,
          "sd": 1.976459
        },
        {
          "mean": 5,
          "observedMean": 4.864921,
          "sd": 1.973065
        },
        {
          "mean": 5,
          "observedMean": 4.858392,
          "sd": 1.969499
        },
        {
          "mean": 5,
          "observedMean": 4.859743,
          "sd": 1.965248
        },
        {
          "mean": 5,
          "observedMean": 4.865059,
          "sd": 1.960155
        },
        {
          "mean": 5,
          "observedMean": 4.868966,
          "sd": 1.953937
        },
        {
          "mean": 5,
          "observedMean": 4.871178,
          "sd": 1.949329
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.001832,
      "sd": 1.602828,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99889,
          "sd": 2.220147
        },
        {
          "mean": 5,
          "observedMean": 4.975299,
          "sd": 2.162322
        },
        {
          "mean": 5,
          "observedMean": 4.955351,
          "sd": 2.111422
        },
        {
          "mean": 5,
          "observedMean": 4.95475,
          "sd": 2.060754
        },
        {
          "mean": 5,
          "observedMean": 4.913887,
          "sd": 2.016625
        },
        {
          "mean": 5,
          "observedMean": 4.856107,
          "sd": 1.976015
        },
        {
          "mean": 5,
          "observedMean": 4.860677,
          "sd": 1.936021
        },
        {
          "mean": 5,
          "observedMean": 4.880294,
          "sd": 1.896203
        },
        {
          "mean": 5,
          "observedMean": 4.906465,
          "sd": 1.853326
        },
        {
          "mean": 5,
          "observedMean": 4.92435,
          "sd": 1.822343
        },
        {
          "mean": 5,
          "observedMean": 4.943904,
          "sd": 1.787312
        },
        {
          "mean": 5,
          "observedMean": 4.960546,
          "sd": 1.758977
        },
        {
          "mean": 5,
          "observedMean": 4.981369,
          "sd": 1.724626
        },
        {
          "mean": 5,
          "observedMean": 5.008442,
          "sd": 1.696386
        },
        {
          "mean": 5,
          "observedMean": 5.008384,
          "sd": 1.675148
        },
        {
          "mean": 5,
          "observedMean": 5.012737,
          "sd": 1.650223
        },
        {
          "mean": 5,
          "observedMean": 5.017764,
          "sd": 1.643048
        },
        {
          "mean": 5,
          "observedMean": 5.016554,
          "sd": 1.622069
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.008599,
      "sd": 1.627652,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043035,
          "sd": 2.202419
        },
        {
          "mean": 5,
          "observedMean": 4.991299,
          "sd": 2.156869
        },
        {
          "mean": 5,
          "observedMean": 4.940996,
          "sd": 2.111669
        },
        {
          "mean": 5,
          "observedMean": 4.909173,
          "sd": 2.071176
        },
        {
          "mean": 5,
          "observedMean": 4.872809,
          "sd": 2.037044
        },
        {
          "mean": 5,
          "observedMean": 4.822674,
          "sd": 2.001723
        },
        {
          "mean": 5,
          "observedMean": 4.831733,
          "sd": 1.963244
        },
        {
          "mean": 5,
          "observedMean": 4.854805,
          "sd": 1.930011
        },
        {
          "mean": 5,
          "observedMean": 4.874068,
          "sd": 1.89492
        },
        {
          "mean": 5,
          "observedMean": 4.893084,
          "sd": 1.857209
        },
        {
          "mean": 5,
          "observedMean": 4.912579,
          "sd": 1.830329
        },
        {
          "mean": 5,
          "observedMean": 4.935412,
          "sd": 1.804736
        },
        {
          "mean": 5,
          "observedMean": 4.94997,
          "sd": 1.772654
        },
        {
          "mean": 5,
          "observedMean": 4.965855,
          "sd": 1.746387
        },
        {
          "mean": 5,
          "observedMean": 4.978691,
          "sd": 1.719505
        },
        {
          "mean": 5,
          "observedMean": 4.990826,
          "sd": 1.69689
        },
        {
          "mean": 5,
          "observedMean": 5.005261,
          "sd": 1.678347
        },
        {
          "mean": 5,
          "observedMean": 5.018262,
          "sd": 1.656971
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999995,
      "sd": 0.683598,
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
          "observedMean": 4.8857,
          "sd": 1.882459
        },
        {
          "mean": 5,
          "observedMean": 4.885509,
          "sd": 1.74895
        },
        {
          "mean": 5,
          "observedMean": 4.923694,
          "sd": 1.622712
        },
        {
          "mean": 5,
          "observedMean": 4.957729,
          "sd": 1.510188
        },
        {
          "mean": 5,
          "observedMean": 4.976682,
          "sd": 1.406974
        },
        {
          "mean": 5,
          "observedMean": 4.99444,
          "sd": 1.310659
        },
        {
          "mean": 5,
          "observedMean": 5.009957,
          "sd": 1.224702
        },
        {
          "mean": 5,
          "observedMean": 5.025814,
          "sd": 1.142504
        },
        {
          "mean": 5,
          "observedMean": 5.039107,
          "sd": 1.066653
        },
        {
          "mean": 5,
          "observedMean": 5.05289,
          "sd": 1.002425
        },
        {
          "mean": 5,
          "observedMean": 5.064148,
          "sd": 0.9393
        },
        {
          "mean": 5,
          "observedMean": 5.074422,
          "sd": 0.8793
        },
        {
          "mean": 5,
          "observedMean": 5.054731,
          "sd": 0.837396
        },
        {
          "mean": 5,
          "observedMean": 5.039715,
          "sd": 0.796314
        },
        {
          "mean": 5,
          "observedMean": 5.024767,
          "sd": 0.756336
        },
        {
          "mean": 5,
          "observedMean": 5.012777,
          "sd": 0.720141
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.996716,
      "sd": 0.836948,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981425,
          "sd": 2.23032
        },
        {
          "mean": 5,
          "observedMean": 5.063236,
          "sd": 2.015039
        },
        {
          "mean": 5,
          "observedMean": 5.132452,
          "sd": 1.826597
        },
        {
          "mean": 5,
          "observedMean": 5.102866,
          "sd": 1.644123
        },
        {
          "mean": 5,
          "observedMean": 5.133176,
          "sd": 1.486583
        },
        {
          "mean": 5,
          "observedMean": 5.158959,
          "sd": 1.354788
        },
        {
          "mean": 5,
          "observedMean": 5.159265,
          "sd": 1.237835
        },
        {
          "mean": 5,
          "observedMean": 5.134704,
          "sd": 1.142299
        },
        {
          "mean": 5,
          "observedMean": 5.110194,
          "sd": 1.061995
        },
        {
          "mean": 5,
          "observedMean": 5.092023,
          "sd": 1.013362
        },
        {
          "mean": 5,
          "observedMean": 5.071384,
          "sd": 0.957378
        },
        {
          "mean": 5,
          "observedMean": 5.053816,
          "sd": 0.91452
        },
        {
          "mean": 5,
          "observedMean": 5.048923,
          "sd": 0.871726
        },
        {
          "mean": 5,
          "observedMean": 5.040725,
          "sd": 0.848836
        },
        {
          "mean": 5,
          "observedMean": 5.03181,
          "sd": 0.844978
        },
        {
          "mean": 5,
          "observedMean": 5.01937,
          "sd": 0.844432
        },
        {
          "mean": 5,
          "observedMean": 5.025011,
          "sd": 0.837152
        },
        {
          "mean": 5,
          "observedMean": 5.007303,
          "sd": 0.835793
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.425512,
      "sd": 3.455353,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.450608,
          "sd": 1.200944
        },
        {
          "mean": 33.525953,
          "sd": 1.432138
        },
        {
          "mean": 36.772871,
          "sd": 1.625384
        },
        {
          "mean": 39.551141,
          "sd": 1.790294
        },
        {
          "mean": 42.113615,
          "sd": 1.943187
        },
        {
          "mean": 44.604037,
          "sd": 2.084324
        },
        {
          "mean": 47.06188,
          "sd": 2.232594
        },
        {
          "mean": 49.422453,
          "sd": 2.369262
        },
        {
          "mean": 51.610945,
          "sd": 2.497897
        },
        {
          "mean": 53.608904,
          "sd": 2.624885
        },
        {
          "mean": 55.560116,
          "sd": 2.765813
        },
        {
          "mean": 57.782535,
          "sd": 2.962273
        },
        {
          "mean": 60.523632,
          "sd": 3.234985
        },
        {
          "mean": 63.422022,
          "sd": 3.430138
        },
        {
          "mean": 65.840101,
          "sd": 3.493642
        },
        {
          "mean": 67.459778,
          "sd": 3.474055
        },
        {
          "mean": 68.248024,
          "sd": 3.45441
        }
      ]
    },
    "female": {
      "mean": 63.26524,
      "sd": 3.046249,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.847291,
          "sd": 1.184233
        },
        {
          "mean": 33.026585,
          "sd": 1.409951
        },
        {
          "mean": 36.451242,
          "sd": 1.602186
        },
        {
          "mean": 39.067274,
          "sd": 1.750767
        },
        {
          "mean": 41.714172,
          "sd": 1.899301
        },
        {
          "mean": 44.424632,
          "sd": 2.05442
        },
        {
          "mean": 47.045322,
          "sd": 2.198107
        },
        {
          "mean": 49.399451,
          "sd": 2.326083
        },
        {
          "mean": 51.470634,
          "sd": 2.444379
        },
        {
          "mean": 53.472316,
          "sd": 2.568151
        },
        {
          "mean": 55.841234,
          "sd": 2.764991
        },
        {
          "mean": 58.552378,
          "sd": 2.978542
        },
        {
          "mean": 60.910126,
          "sd": 3.082979
        },
        {
          "mean": 62.42127,
          "sd": 3.076837
        },
        {
          "mean": 63.10753,
          "sd": 3.055775
        },
        {
          "mean": 63.258996,
          "sd": 3.047539
        },
        {
          "mean": 63.265404,
          "sd": 3.045489
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
      "mean": 5.1808,
      "sd": 1.958485
    },
    {
      "mean": 5.283022,
      "sd": 1.932617
    },
    {
      "mean": 5.38472,
      "sd": 1.911016
    },
    {
      "mean": 5.490611,
      "sd": 1.889863
    },
    {
      "mean": 5.593638,
      "sd": 1.868253
    },
    {
      "mean": 5.692264,
      "sd": 1.84674
    },
    {
      "mean": 5.790123,
      "sd": 1.823183
    },
    {
      "mean": 5.885748,
      "sd": 1.798823
    },
    {
      "mean": 5.983391,
      "sd": 1.777456
    },
    {
      "mean": 6.075024,
      "sd": 1.754629
    },
    {
      "mean": 6.162059,
      "sd": 1.728326
    },
    {
      "mean": 6.251744,
      "sd": 1.707903
    },
    {
      "mean": 6.33495,
      "sd": 1.690803
    },
    {
      "mean": 6.419015,
      "sd": 1.6733
    },
    {
      "mean": 6.503433,
      "sd": 1.650608
    },
    {
      "mean": 6.586559,
      "sd": 1.630312
    }
  ]
};
