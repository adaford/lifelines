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
    "focusPolicy": "core two-point targets with optional school activities unenrolled; fitted to birth-condition budgets and active condition/event caps; spare points left unused",
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
      "observedMean": 6.021805,
      "sd": 1.660029,
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
          "observedMean": 5.560498,
          "sd": 1.93513
        },
        {
          "mean": 5,
          "observedMean": 5.624102,
          "sd": 1.899955
        },
        {
          "mean": 5,
          "observedMean": 5.691906,
          "sd": 1.870357
        },
        {
          "mean": 5,
          "observedMean": 5.757145,
          "sd": 1.835354
        },
        {
          "mean": 5,
          "observedMean": 5.818365,
          "sd": 1.807064
        },
        {
          "mean": 5,
          "observedMean": 5.875029,
          "sd": 1.777053
        },
        {
          "mean": 5,
          "observedMean": 5.926194,
          "sd": 1.747815
        },
        {
          "mean": 5,
          "observedMean": 5.95281,
          "sd": 1.730007
        },
        {
          "mean": 5,
          "observedMean": 5.971027,
          "sd": 1.709324
        },
        {
          "mean": 5,
          "observedMean": 5.988557,
          "sd": 1.688343
        },
        {
          "mean": 5,
          "observedMean": 6.008327,
          "sd": 1.674911
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.990726,
      "sd": 1.800449,
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
          "observedMean": 5.00508,
          "sd": 2.012351
        },
        {
          "mean": 5,
          "observedMean": 5.004663,
          "sd": 1.991736
        },
        {
          "mean": 5,
          "observedMean": 5.005226,
          "sd": 1.968142
        },
        {
          "mean": 5,
          "observedMean": 5.006388,
          "sd": 1.947812
        },
        {
          "mean": 5,
          "observedMean": 5.008624,
          "sd": 1.927251
        },
        {
          "mean": 5,
          "observedMean": 5.011904,
          "sd": 1.909423
        },
        {
          "mean": 5,
          "observedMean": 5.012815,
          "sd": 1.890719
        },
        {
          "mean": 5,
          "observedMean": 5.008813,
          "sd": 1.870762
        },
        {
          "mean": 5,
          "observedMean": 5.000672,
          "sd": 1.852651
        },
        {
          "mean": 5,
          "observedMean": 5.00101,
          "sd": 1.83351
        },
        {
          "mean": 5,
          "observedMean": 4.997143,
          "sd": 1.817144
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.878938,
      "sd": 1.950181,
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
          "observedMean": 4.895246,
          "sd": 1.991463
        },
        {
          "mean": 5,
          "observedMean": 4.88914,
          "sd": 1.988193
        },
        {
          "mean": 5,
          "observedMean": 4.881449,
          "sd": 1.98325
        },
        {
          "mean": 5,
          "observedMean": 4.874331,
          "sd": 1.978998
        },
        {
          "mean": 5,
          "observedMean": 4.866833,
          "sd": 1.973928
        },
        {
          "mean": 5,
          "observedMean": 4.858742,
          "sd": 1.969203
        },
        {
          "mean": 5,
          "observedMean": 4.864269,
          "sd": 1.965243
        },
        {
          "mean": 5,
          "observedMean": 4.868311,
          "sd": 1.962015
        },
        {
          "mean": 5,
          "observedMean": 4.870877,
          "sd": 1.957369
        },
        {
          "mean": 5,
          "observedMean": 4.875142,
          "sd": 1.954258
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.046029,
      "sd": 1.709355,
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
          "observedMean": 5.285053,
          "sd": 1.996068
        },
        {
          "mean": 5,
          "observedMean": 5.357787,
          "sd": 1.965345
        },
        {
          "mean": 5,
          "observedMean": 5.431451,
          "sd": 1.929045
        },
        {
          "mean": 5,
          "observedMean": 5.509429,
          "sd": 1.898357
        },
        {
          "mean": 5,
          "observedMean": 5.584414,
          "sd": 1.867149
        },
        {
          "mean": 5,
          "observedMean": 5.653166,
          "sd": 1.840812
        },
        {
          "mean": 5,
          "observedMean": 5.7308,
          "sd": 1.818245
        },
        {
          "mean": 5,
          "observedMean": 5.801658,
          "sd": 1.791647
        },
        {
          "mean": 5,
          "observedMean": 5.8552,
          "sd": 1.777973
        },
        {
          "mean": 5,
          "observedMean": 5.911777,
          "sd": 1.753498
        },
        {
          "mean": 5,
          "observedMean": 5.960222,
          "sd": 1.740398
        },
        {
          "mean": 5,
          "observedMean": 6.006687,
          "sd": 1.726078
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.124783,
      "sd": 1.715006,
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
          "observedMean": 5.240775,
          "sd": 2.026682
        },
        {
          "mean": 5,
          "observedMean": 5.327231,
          "sd": 1.997486
        },
        {
          "mean": 5,
          "observedMean": 5.409105,
          "sd": 1.970687
        },
        {
          "mean": 5,
          "observedMean": 5.500626,
          "sd": 1.93939
        },
        {
          "mean": 5,
          "observedMean": 5.583483,
          "sd": 1.91197
        },
        {
          "mean": 5,
          "observedMean": 5.664198,
          "sd": 1.88338
        },
        {
          "mean": 5,
          "observedMean": 5.739182,
          "sd": 1.858497
        },
        {
          "mean": 5,
          "observedMean": 5.81153,
          "sd": 1.833072
        },
        {
          "mean": 5,
          "observedMean": 5.88435,
          "sd": 1.808488
        },
        {
          "mean": 5,
          "observedMean": 5.954875,
          "sd": 1.782409
        },
        {
          "mean": 5,
          "observedMean": 6.016164,
          "sd": 1.759117
        },
        {
          "mean": 5,
          "observedMean": 6.086077,
          "sd": 1.738087
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.994869,
      "sd": 0.701216,
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
          "observedMean": 4.988725,
          "sd": 1.307885
        },
        {
          "mean": 5,
          "observedMean": 5.002007,
          "sd": 1.220456
        },
        {
          "mean": 5,
          "observedMean": 5.016381,
          "sd": 1.140046
        },
        {
          "mean": 5,
          "observedMean": 5.030687,
          "sd": 1.064419
        },
        {
          "mean": 5,
          "observedMean": 5.043282,
          "sd": 0.998416
        },
        {
          "mean": 5,
          "observedMean": 5.054126,
          "sd": 0.934624
        },
        {
          "mean": 5,
          "observedMean": 5.067887,
          "sd": 0.876785
        },
        {
          "mean": 5,
          "observedMean": 5.054184,
          "sd": 0.836602
        },
        {
          "mean": 5,
          "observedMean": 5.037355,
          "sd": 0.797874
        },
        {
          "mean": 5,
          "observedMean": 5.020801,
          "sd": 0.766345
        },
        {
          "mean": 5,
          "observedMean": 5.007959,
          "sd": 0.733333
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.186664,
      "sd": 0.798093,
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
          "observedMean": 5.213036,
          "sd": 1.154492
        },
        {
          "mean": 5,
          "observedMean": 5.200516,
          "sd": 1.083482
        },
        {
          "mean": 5,
          "observedMean": 5.187062,
          "sd": 1.019087
        },
        {
          "mean": 5,
          "observedMean": 5.182804,
          "sd": 0.95665
        },
        {
          "mean": 5,
          "observedMean": 5.181524,
          "sd": 0.900449
        },
        {
          "mean": 5,
          "observedMean": 5.182309,
          "sd": 0.869333
        },
        {
          "mean": 5,
          "observedMean": 5.186083,
          "sd": 0.840793
        },
        {
          "mean": 5,
          "observedMean": 5.188702,
          "sd": 0.833704
        },
        {
          "mean": 5,
          "observedMean": 5.179955,
          "sd": 0.818485
        },
        {
          "mean": 5,
          "observedMean": 5.176602,
          "sd": 0.813511
        },
        {
          "mean": 5,
          "observedMean": 5.183313,
          "sd": 0.807502
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.418417,
      "sd": 3.397022,
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
          "mean": 36.7728,
          "sd": 1.625202
        },
        {
          "mean": 39.551297,
          "sd": 1.790513
        },
        {
          "mean": 42.114178,
          "sd": 1.943208
        },
        {
          "mean": 44.609648,
          "sd": 2.082855
        },
        {
          "mean": 47.062795,
          "sd": 2.22575
        },
        {
          "mean": 49.425923,
          "sd": 2.358373
        },
        {
          "mean": 51.610628,
          "sd": 2.487135
        },
        {
          "mean": 53.604309,
          "sd": 2.613031
        },
        {
          "mean": 55.553942,
          "sd": 2.748335
        },
        {
          "mean": 57.781403,
          "sd": 2.950063
        },
        {
          "mean": 60.527873,
          "sd": 3.205216
        },
        {
          "mean": 63.428532,
          "sd": 3.383736
        },
        {
          "mean": 65.838359,
          "sd": 3.445751
        },
        {
          "mean": 67.455602,
          "sd": 3.426261
        },
        {
          "mean": 68.237526,
          "sd": 3.398108
        }
      ]
    },
    "female": {
      "mean": 63.275,
      "sd": 3.064023,
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
          "mean": 36.451313,
          "sd": 1.60214
        },
        {
          "mean": 39.067339,
          "sd": 1.750616
        },
        {
          "mean": 41.714836,
          "sd": 1.898423
        },
        {
          "mean": 44.433493,
          "sd": 2.055369
        },
        {
          "mean": 47.046291,
          "sd": 2.200958
        },
        {
          "mean": 49.405959,
          "sd": 2.333618
        },
        {
          "mean": 51.470851,
          "sd": 2.450765
        },
        {
          "mean": 53.48158,
          "sd": 2.5837
        },
        {
          "mean": 55.854006,
          "sd": 2.791012
        },
        {
          "mean": 58.571596,
          "sd": 3.005923
        },
        {
          "mean": 60.924668,
          "sd": 3.108641
        },
        {
          "mean": 62.430539,
          "sd": 3.098789
        },
        {
          "mean": 63.117744,
          "sd": 3.079812
        },
        {
          "mean": 63.26996,
          "sd": 3.065675
        },
        {
          "mean": 63.274995,
          "sd": 3.062515
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
      "mean": 5.78583,
      "sd": 1.838076
    },
    {
      "mean": 5.874975,
      "sd": 1.820242
    },
    {
      "mean": 5.968473,
      "sd": 1.794392
    },
    {
      "mean": 6.062822,
      "sd": 1.770754
    },
    {
      "mean": 6.153263,
      "sd": 1.747478
    },
    {
      "mean": 6.239203,
      "sd": 1.729413
    },
    {
      "mean": 6.318518,
      "sd": 1.713403
    },
    {
      "mean": 6.397981,
      "sd": 1.697534
    },
    {
      "mean": 6.484083,
      "sd": 1.678116
    },
    {
      "mean": 6.562421,
      "sd": 1.66174
    }
  ]
};
