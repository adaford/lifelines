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
      "observedMean": 5.015439,
      "sd": 1.579746,
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
          "observedMean": 5.061936,
          "sd": 2.066693
        },
        {
          "mean": 5,
          "observedMean": 5.03612,
          "sd": 2.026985
        },
        {
          "mean": 5,
          "observedMean": 4.9992,
          "sd": 1.985114
        },
        {
          "mean": 5,
          "observedMean": 5.008699,
          "sd": 1.938549
        },
        {
          "mean": 5,
          "observedMean": 5.028589,
          "sd": 1.896774
        },
        {
          "mean": 5,
          "observedMean": 5.045024,
          "sd": 1.858171
        },
        {
          "mean": 5,
          "observedMean": 5.059814,
          "sd": 1.820599
        },
        {
          "mean": 5,
          "observedMean": 5.075416,
          "sd": 1.790368
        },
        {
          "mean": 5,
          "observedMean": 5.092718,
          "sd": 1.760226
        },
        {
          "mean": 5,
          "observedMean": 5.107038,
          "sd": 1.724486
        },
        {
          "mean": 5,
          "observedMean": 5.119333,
          "sd": 1.691692
        },
        {
          "mean": 5,
          "observedMean": 5.095237,
          "sd": 1.670137
        },
        {
          "mean": 5,
          "observedMean": 5.073719,
          "sd": 1.647989
        },
        {
          "mean": 5,
          "observedMean": 5.056415,
          "sd": 1.627976
        },
        {
          "mean": 5,
          "observedMean": 5.040653,
          "sd": 1.596441
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.007158,
      "sd": 1.751145,
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
          "observedMean": 5.047953,
          "sd": 2.102472
        },
        {
          "mean": 5,
          "observedMean": 5.042117,
          "sd": 2.069029
        },
        {
          "mean": 5,
          "observedMean": 5.036879,
          "sd": 2.03889
        },
        {
          "mean": 5,
          "observedMean": 5.036513,
          "sd": 2.010076
        },
        {
          "mean": 5,
          "observedMean": 5.034362,
          "sd": 1.986689
        },
        {
          "mean": 5,
          "observedMean": 5.035753,
          "sd": 1.963267
        },
        {
          "mean": 5,
          "observedMean": 5.034264,
          "sd": 1.935463
        },
        {
          "mean": 5,
          "observedMean": 5.032038,
          "sd": 1.913377
        },
        {
          "mean": 5,
          "observedMean": 5.03225,
          "sd": 1.891161
        },
        {
          "mean": 5,
          "observedMean": 5.033184,
          "sd": 1.869065
        },
        {
          "mean": 5,
          "observedMean": 5.035505,
          "sd": 1.851853
        },
        {
          "mean": 5,
          "observedMean": 5.029663,
          "sd": 1.829249
        },
        {
          "mean": 5,
          "observedMean": 5.024251,
          "sd": 1.807962
        },
        {
          "mean": 5,
          "observedMean": 5.017802,
          "sd": 1.788849
        },
        {
          "mean": 5,
          "observedMean": 5.009051,
          "sd": 1.770538
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.875588,
      "sd": 1.944816,
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
          "observedMean": 4.879663,
          "sd": 1.981889
        },
        {
          "mean": 5,
          "observedMean": 4.87184,
          "sd": 1.976464
        },
        {
          "mean": 5,
          "observedMean": 4.864956,
          "sd": 1.973046
        },
        {
          "mean": 5,
          "observedMean": 4.858427,
          "sd": 1.969479
        },
        {
          "mean": 5,
          "observedMean": 4.859778,
          "sd": 1.965228
        },
        {
          "mean": 5,
          "observedMean": 4.865094,
          "sd": 1.960134
        },
        {
          "mean": 5,
          "observedMean": 4.868999,
          "sd": 1.953917
        },
        {
          "mean": 5,
          "observedMean": 4.871211,
          "sd": 1.949311
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.008867,
      "sd": 1.603008,
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
          "observedMean": 4.955869,
          "sd": 2.060857
        },
        {
          "mean": 5,
          "observedMean": 4.916128,
          "sd": 2.016804
        },
        {
          "mean": 5,
          "observedMean": 4.85954,
          "sd": 1.976359
        },
        {
          "mean": 5,
          "observedMean": 4.864332,
          "sd": 1.936222
        },
        {
          "mean": 5,
          "observedMean": 4.884332,
          "sd": 1.896428
        },
        {
          "mean": 5,
          "observedMean": 4.910636,
          "sd": 1.853509
        },
        {
          "mean": 5,
          "observedMean": 4.928468,
          "sd": 1.822473
        },
        {
          "mean": 5,
          "observedMean": 4.948287,
          "sd": 1.787601
        },
        {
          "mean": 5,
          "observedMean": 4.965089,
          "sd": 1.759204
        },
        {
          "mean": 5,
          "observedMean": 4.986164,
          "sd": 1.72478
        },
        {
          "mean": 5,
          "observedMean": 5.013257,
          "sd": 1.696633
        },
        {
          "mean": 5,
          "observedMean": 5.013945,
          "sd": 1.675206
        },
        {
          "mean": 5,
          "observedMean": 5.018529,
          "sd": 1.650809
        },
        {
          "mean": 5,
          "observedMean": 5.024094,
          "sd": 1.643738
        },
        {
          "mean": 5,
          "observedMean": 5.023025,
          "sd": 1.62305
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.009775,
      "sd": 1.628075,
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
          "observedMean": 4.873475,
          "sd": 2.037061
        },
        {
          "mean": 5,
          "observedMean": 4.824052,
          "sd": 2.001853
        },
        {
          "mean": 5,
          "observedMean": 4.833067,
          "sd": 1.963349
        },
        {
          "mean": 5,
          "observedMean": 4.856239,
          "sd": 1.930053
        },
        {
          "mean": 5,
          "observedMean": 4.875512,
          "sd": 1.895033
        },
        {
          "mean": 5,
          "observedMean": 4.894516,
          "sd": 1.857389
        },
        {
          "mean": 5,
          "observedMean": 4.914003,
          "sd": 1.830483
        },
        {
          "mean": 5,
          "observedMean": 4.936723,
          "sd": 1.804821
        },
        {
          "mean": 5,
          "observedMean": 4.951243,
          "sd": 1.772838
        },
        {
          "mean": 5,
          "observedMean": 4.967158,
          "sd": 1.746696
        },
        {
          "mean": 5,
          "observedMean": 4.979972,
          "sd": 1.719822
        },
        {
          "mean": 5,
          "observedMean": 4.992022,
          "sd": 1.697014
        },
        {
          "mean": 5,
          "observedMean": 5.006436,
          "sd": 1.678539
        },
        {
          "mean": 5,
          "observedMean": 5.019309,
          "sd": 1.657176
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999205,
      "sd": 0.684066,
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
          "observedMean": 5.009884,
          "sd": 1.224737
        },
        {
          "mean": 5,
          "observedMean": 5.025738,
          "sd": 1.142649
        },
        {
          "mean": 5,
          "observedMean": 5.039036,
          "sd": 1.066793
        },
        {
          "mean": 5,
          "observedMean": 5.052877,
          "sd": 1.002556
        },
        {
          "mean": 5,
          "observedMean": 5.064138,
          "sd": 0.939517
        },
        {
          "mean": 5,
          "observedMean": 5.074188,
          "sd": 0.879588
        },
        {
          "mean": 5,
          "observedMean": 5.054428,
          "sd": 0.837568
        },
        {
          "mean": 5,
          "observedMean": 5.039554,
          "sd": 0.796468
        },
        {
          "mean": 5,
          "observedMean": 5.024306,
          "sd": 0.756457
        },
        {
          "mean": 5,
          "observedMean": 5.012066,
          "sd": 0.720351
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.987017,
      "sd": 0.835588,
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
          "observedMean": 5.133244,
          "sd": 1.486507
        },
        {
          "mean": 5,
          "observedMean": 5.159017,
          "sd": 1.354722
        },
        {
          "mean": 5,
          "observedMean": 5.157708,
          "sd": 1.23745
        },
        {
          "mean": 5,
          "observedMean": 5.132068,
          "sd": 1.141703
        },
        {
          "mean": 5,
          "observedMean": 5.106465,
          "sd": 1.061143
        },
        {
          "mean": 5,
          "observedMean": 5.087316,
          "sd": 1.012283
        },
        {
          "mean": 5,
          "observedMean": 5.065743,
          "sd": 0.956062
        },
        {
          "mean": 5,
          "observedMean": 5.047634,
          "sd": 0.91326
        },
        {
          "mean": 5,
          "observedMean": 5.04218,
          "sd": 0.870524
        },
        {
          "mean": 5,
          "observedMean": 5.033534,
          "sd": 0.847628
        },
        {
          "mean": 5,
          "observedMean": 5.024058,
          "sd": 0.843392
        },
        {
          "mean": 5,
          "observedMean": 5.011544,
          "sd": 0.843263
        },
        {
          "mean": 5,
          "observedMean": 5.016327,
          "sd": 0.83597
        },
        {
          "mean": 5,
          "observedMean": 4.998093,
          "sd": 0.834812
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.425406,
      "sd": 3.455506,
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
          "mean": 60.523622,
          "sd": 3.234999
        },
        {
          "mean": 63.421967,
          "sd": 3.43021
        },
        {
          "mean": 65.84001,
          "sd": 3.493762
        },
        {
          "mean": 67.459678,
          "sd": 3.474193
        },
        {
          "mean": 68.247918,
          "sd": 3.454557
        }
      ]
    },
    "female": {
      "mean": 63.265119,
      "sd": 3.046224,
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
          "mean": 51.470624,
          "sd": 2.444377
        },
        {
          "mean": 53.472286,
          "sd": 2.568151
        },
        {
          "mean": 55.841184,
          "sd": 2.76499
        },
        {
          "mean": 58.552302,
          "sd": 2.978537
        },
        {
          "mean": 60.91003,
          "sd": 3.082975
        },
        {
          "mean": 62.421159,
          "sd": 3.076829
        },
        {
          "mean": 63.107414,
          "sd": 3.055761
        },
        {
          "mean": 63.258875,
          "sd": 3.047514
        },
        {
          "mean": 63.265283,
          "sd": 3.045463
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
