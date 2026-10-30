// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1978,
      "female": 1981
    },
    "cryLevel": 3,
    "cryThroughAge": 1,
    "focus": {
      "work": 3,
      "social": 3,
      "family": 3,
      "self": 3
    },
    "toddlerFocus": {
      "work": 3,
      "social": 2,
      "family": 2,
      "self": 3,
      "creative": 2
    },
    "choices": "uniform, independent seeded draws",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3979,
      3973,
      3972,
      3971,
      3969,
      3969,
      3968,
      3968,
      3968,
      3967,
      3966,
      3965,
      3965,
      3965,
      3963,
      3960,
      3960,
      3959
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
    },
    "development": {
      "innateScale": 0.8,
      "skillReversion": 0.012,
      "childhoodBias": {
        "intelligence": -0.034749,
        "strength": -0.006114,
        "social": -0.034802,
        "creativity": -0.033537
      },
      "wellbeingTarget": {
        "health": 5.022861,
        "stability": 4.723184
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
      "observedMean": 4.991149,
      "sd": 2.185733,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07186,
          "sd": 2.303494
        },
        {
          "mean": 5,
          "observedMean": 5.066853,
          "sd": 2.284783
        },
        {
          "mean": 5,
          "observedMean": 5.059174,
          "sd": 2.27143
        },
        {
          "mean": 5,
          "observedMean": 5.043494,
          "sd": 2.262582
        },
        {
          "mean": 5,
          "observedMean": 5.013606,
          "sd": 2.24614
        },
        {
          "mean": 5,
          "observedMean": 4.981922,
          "sd": 2.227633
        },
        {
          "mean": 5,
          "observedMean": 5.003104,
          "sd": 2.239482
        },
        {
          "mean": 5,
          "observedMean": 5.034012,
          "sd": 2.245314
        },
        {
          "mean": 5,
          "observedMean": 5.032749,
          "sd": 2.24211
        },
        {
          "mean": 5,
          "observedMean": 5.034362,
          "sd": 2.23576
        },
        {
          "mean": 5,
          "observedMean": 5.039254,
          "sd": 2.231706
        },
        {
          "mean": 5,
          "observedMean": 5.044491,
          "sd": 2.228227
        },
        {
          "mean": 5,
          "observedMean": 5.043438,
          "sd": 2.224266
        },
        {
          "mean": 5,
          "observedMean": 5.042696,
          "sd": 2.215156
        },
        {
          "mean": 5,
          "observedMean": 5.032159,
          "sd": 2.205351
        },
        {
          "mean": 5,
          "observedMean": 5.016616,
          "sd": 2.208106
        },
        {
          "mean": 5,
          "observedMean": 5.003717,
          "sd": 2.20575
        },
        {
          "mean": 5,
          "observedMean": 5.001379,
          "sd": 2.193789
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.001228,
      "sd": 2.093388,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01008,
          "sd": 2.297584
        },
        {
          "mean": 5,
          "observedMean": 5.003544,
          "sd": 2.288135
        },
        {
          "mean": 5,
          "observedMean": 5.006783,
          "sd": 2.273234
        },
        {
          "mean": 5,
          "observedMean": 4.987437,
          "sd": 2.274926
        },
        {
          "mean": 5,
          "observedMean": 4.975903,
          "sd": 2.256819
        },
        {
          "mean": 5,
          "observedMean": 4.974785,
          "sd": 2.236306
        },
        {
          "mean": 5,
          "observedMean": 4.975828,
          "sd": 2.22872
        },
        {
          "mean": 5,
          "observedMean": 4.98495,
          "sd": 2.219131
        },
        {
          "mean": 5,
          "observedMean": 4.984756,
          "sd": 2.208254
        },
        {
          "mean": 5,
          "observedMean": 4.990449,
          "sd": 2.194805
        },
        {
          "mean": 5,
          "observedMean": 4.993668,
          "sd": 2.185841
        },
        {
          "mean": 5,
          "observedMean": 4.99678,
          "sd": 2.171446
        },
        {
          "mean": 5,
          "observedMean": 4.996409,
          "sd": 2.163524
        },
        {
          "mean": 5,
          "observedMean": 4.996777,
          "sd": 2.159072
        },
        {
          "mean": 5,
          "observedMean": 5.010595,
          "sd": 2.136498
        },
        {
          "mean": 5,
          "observedMean": 5.006485,
          "sd": 2.127639
        },
        {
          "mean": 5,
          "observedMean": 5.002414,
          "sd": 2.118298
        },
        {
          "mean": 5,
          "observedMean": 4.999997,
          "sd": 2.10485
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.023882,
      "sd": 1.98967,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.009383,
          "sd": 1.989297
        },
        {
          "mean": 5,
          "observedMean": 5.010302,
          "sd": 1.989228
        },
        {
          "mean": 5,
          "observedMean": 5.011253,
          "sd": 1.987106
        },
        {
          "mean": 5,
          "observedMean": 5.009718,
          "sd": 1.987185
        },
        {
          "mean": 5,
          "observedMean": 5.010335,
          "sd": 1.986559
        },
        {
          "mean": 5,
          "observedMean": 5.010333,
          "sd": 1.987023
        },
        {
          "mean": 5,
          "observedMean": 5.010343,
          "sd": 1.986145
        },
        {
          "mean": 5,
          "observedMean": 5.01004,
          "sd": 1.985827
        },
        {
          "mean": 5,
          "observedMean": 5.009866,
          "sd": 1.986113
        },
        {
          "mean": 5,
          "observedMean": 5.008929,
          "sd": 1.986686
        },
        {
          "mean": 5,
          "observedMean": 5.008145,
          "sd": 1.985679
        },
        {
          "mean": 5,
          "observedMean": 5.00972,
          "sd": 1.98463
        },
        {
          "mean": 5,
          "observedMean": 5.009823,
          "sd": 1.986109
        },
        {
          "mean": 5,
          "observedMean": 5.010953,
          "sd": 1.98542
        },
        {
          "mean": 5,
          "observedMean": 5.01282,
          "sd": 1.986105
        },
        {
          "mean": 5,
          "observedMean": 5.017416,
          "sd": 1.987165
        },
        {
          "mean": 5,
          "observedMean": 5.020616,
          "sd": 1.987756
        },
        {
          "mean": 5,
          "observedMean": 5.023437,
          "sd": 1.988897
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.998664,
      "sd": 2.109749,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04187,
          "sd": 2.317953
        },
        {
          "mean": 5,
          "observedMean": 5.034931,
          "sd": 2.300026
        },
        {
          "mean": 5,
          "observedMean": 5.029137,
          "sd": 2.277079
        },
        {
          "mean": 5,
          "observedMean": 5.006347,
          "sd": 2.262209
        },
        {
          "mean": 5,
          "observedMean": 4.984447,
          "sd": 2.243907
        },
        {
          "mean": 5,
          "observedMean": 4.943568,
          "sd": 2.230051
        },
        {
          "mean": 5,
          "observedMean": 4.937639,
          "sd": 2.21276
        },
        {
          "mean": 5,
          "observedMean": 4.940005,
          "sd": 2.214073
        },
        {
          "mean": 5,
          "observedMean": 4.957409,
          "sd": 2.20328
        },
        {
          "mean": 5,
          "observedMean": 4.954057,
          "sd": 2.19301
        },
        {
          "mean": 5,
          "observedMean": 4.948871,
          "sd": 2.184605
        },
        {
          "mean": 5,
          "observedMean": 4.951188,
          "sd": 2.167838
        },
        {
          "mean": 5,
          "observedMean": 4.948651,
          "sd": 2.148633
        },
        {
          "mean": 5,
          "observedMean": 4.949904,
          "sd": 2.137578
        },
        {
          "mean": 5,
          "observedMean": 4.949382,
          "sd": 2.132455
        },
        {
          "mean": 5,
          "observedMean": 4.956318,
          "sd": 2.127922
        },
        {
          "mean": 5,
          "observedMean": 4.969576,
          "sd": 2.122653
        },
        {
          "mean": 5,
          "observedMean": 4.99177,
          "sd": 2.112011
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.991455,
      "sd": 2.155432,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.049875,
          "sd": 2.284212
        },
        {
          "mean": 5,
          "observedMean": 5.04189,
          "sd": 2.274812
        },
        {
          "mean": 5,
          "observedMean": 5.027934,
          "sd": 2.262228
        },
        {
          "mean": 5,
          "observedMean": 5.02675,
          "sd": 2.255882
        },
        {
          "mean": 5,
          "observedMean": 5.015747,
          "sd": 2.244484
        },
        {
          "mean": 5,
          "observedMean": 4.999237,
          "sd": 2.231876
        },
        {
          "mean": 5,
          "observedMean": 5.013303,
          "sd": 2.235118
        },
        {
          "mean": 5,
          "observedMean": 5.020277,
          "sd": 2.237805
        },
        {
          "mean": 5,
          "observedMean": 5.017576,
          "sd": 2.229234
        },
        {
          "mean": 5,
          "observedMean": 5.015776,
          "sd": 2.220828
        },
        {
          "mean": 5,
          "observedMean": 5.012359,
          "sd": 2.214491
        },
        {
          "mean": 5,
          "observedMean": 5.014516,
          "sd": 2.207143
        },
        {
          "mean": 5,
          "observedMean": 5.011259,
          "sd": 2.200939
        },
        {
          "mean": 5,
          "observedMean": 5.011077,
          "sd": 2.194204
        },
        {
          "mean": 5,
          "observedMean": 5.006398,
          "sd": 2.18388
        },
        {
          "mean": 5,
          "observedMean": 5.002051,
          "sd": 2.175026
        },
        {
          "mean": 5,
          "observedMean": 4.991947,
          "sd": 2.168699
        },
        {
          "mean": 5,
          "observedMean": 4.994497,
          "sd": 2.156628
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999177,
      "sd": 0.690086,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.001625,
          "sd": 1.964763
        },
        {
          "mean": 5,
          "observedMean": 4.959178,
          "sd": 1.868909
        },
        {
          "mean": 5,
          "observedMean": 4.957923,
          "sd": 1.758754
        },
        {
          "mean": 5,
          "observedMean": 4.951188,
          "sd": 1.662912
        },
        {
          "mean": 5,
          "observedMean": 4.986749,
          "sd": 1.566225
        },
        {
          "mean": 5,
          "observedMean": 4.992053,
          "sd": 1.474766
        },
        {
          "mean": 5,
          "observedMean": 4.993653,
          "sd": 1.385006
        },
        {
          "mean": 5,
          "observedMean": 5.002712,
          "sd": 1.302875
        },
        {
          "mean": 5,
          "observedMean": 5.004945,
          "sd": 1.225585
        },
        {
          "mean": 5,
          "observedMean": 5.009471,
          "sd": 1.153675
        },
        {
          "mean": 5,
          "observedMean": 5.012924,
          "sd": 1.085327
        },
        {
          "mean": 5,
          "observedMean": 5.013764,
          "sd": 1.018637
        },
        {
          "mean": 5,
          "observedMean": 5.016136,
          "sd": 0.957301
        },
        {
          "mean": 5,
          "observedMean": 5.016555,
          "sd": 0.903509
        },
        {
          "mean": 5,
          "observedMean": 5.015483,
          "sd": 0.853259
        },
        {
          "mean": 5,
          "observedMean": 5.011908,
          "sd": 0.808282
        },
        {
          "mean": 5,
          "observedMean": 5.00723,
          "sd": 0.772455
        },
        {
          "mean": 5,
          "observedMean": 5.001545,
          "sd": 0.728302
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.993392,
      "sd": 0.604388,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043827,
          "sd": 1.947156
        },
        {
          "mean": 5,
          "observedMean": 5.022405,
          "sd": 1.809345
        },
        {
          "mean": 5,
          "observedMean": 5.027657,
          "sd": 1.682382
        },
        {
          "mean": 5,
          "observedMean": 5.001125,
          "sd": 1.555595
        },
        {
          "mean": 5,
          "observedMean": 4.998048,
          "sd": 1.423422
        },
        {
          "mean": 5,
          "observedMean": 4.963222,
          "sd": 1.308023
        },
        {
          "mean": 5,
          "observedMean": 4.949854,
          "sd": 1.222154
        },
        {
          "mean": 5,
          "observedMean": 4.959937,
          "sd": 1.137883
        },
        {
          "mean": 5,
          "observedMean": 4.975267,
          "sd": 1.056362
        },
        {
          "mean": 5,
          "observedMean": 4.984302,
          "sd": 0.983362
        },
        {
          "mean": 5,
          "observedMean": 4.986186,
          "sd": 0.912806
        },
        {
          "mean": 5,
          "observedMean": 4.988767,
          "sd": 0.852307
        },
        {
          "mean": 5,
          "observedMean": 5.003049,
          "sd": 0.796504
        },
        {
          "mean": 5,
          "observedMean": 5.002451,
          "sd": 0.754105
        },
        {
          "mean": 5,
          "observedMean": 4.990686,
          "sd": 0.71501
        },
        {
          "mean": 5,
          "observedMean": 4.973878,
          "sd": 0.687125
        },
        {
          "mean": 5,
          "observedMean": 4.974755,
          "sd": 0.655823
        },
        {
          "mean": 5,
          "observedMean": 4.991048,
          "sd": 0.621316
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.441289,
      "sd": 3.304669,
      "ages": [
        {
          "mean": 19.622185,
          "sd": 0.728739
        },
        {
          "mean": 29.48301,
          "sd": 1.168199
        },
        {
          "mean": 33.578953,
          "sd": 1.39742
        },
        {
          "mean": 36.831814,
          "sd": 1.584067
        },
        {
          "mean": 39.611316,
          "sd": 1.732689
        },
        {
          "mean": 42.169894,
          "sd": 1.882557
        },
        {
          "mean": 44.668437,
          "sd": 2.019397
        },
        {
          "mean": 47.120792,
          "sd": 2.156107
        },
        {
          "mean": 49.478669,
          "sd": 2.283565
        },
        {
          "mean": 51.65706,
          "sd": 2.410432
        },
        {
          "mean": 53.633742,
          "sd": 2.533867
        },
        {
          "mean": 55.565663,
          "sd": 2.664334
        },
        {
          "mean": 57.762931,
          "sd": 2.853047
        },
        {
          "mean": 60.486377,
          "sd": 3.107811
        },
        {
          "mean": 63.372316,
          "sd": 3.301728
        },
        {
          "mean": 65.798819,
          "sd": 3.360807
        },
        {
          "mean": 67.439687,
          "sd": 3.33142
        },
        {
          "mean": 68.252062,
          "sd": 3.306201
        }
      ]
    },
    "female": {
      "mean": 63.197683,
      "sd": 3.023851,
      "ages": [
        {
          "mean": 19.307495,
          "sd": 0.728648
        },
        {
          "mean": 28.79821,
          "sd": 1.13797
        },
        {
          "mean": 32.981002,
          "sd": 1.373083
        },
        {
          "mean": 36.396059,
          "sd": 1.560048
        },
        {
          "mean": 39.012864,
          "sd": 1.704267
        },
        {
          "mean": 41.673315,
          "sd": 1.858332
        },
        {
          "mean": 44.391375,
          "sd": 2.009424
        },
        {
          "mean": 47.008418,
          "sd": 2.15229
        },
        {
          "mean": 49.353763,
          "sd": 2.281824
        },
        {
          "mean": 51.422393,
          "sd": 2.414825
        },
        {
          "mean": 53.429057,
          "sd": 2.56133
        },
        {
          "mean": 55.804836,
          "sd": 2.784796
        },
        {
          "mean": 58.514539,
          "sd": 3.017885
        },
        {
          "mean": 60.857897,
          "sd": 3.108642
        },
        {
          "mean": 62.353903,
          "sd": 3.079082
        },
        {
          "mean": 63.034223,
          "sd": 3.032241
        },
        {
          "mean": 63.188082,
          "sd": 3.024089
        },
        {
          "mean": 63.197683,
          "sd": 3.023851
        }
      ]
    }
  },
  "lifestyle": [
    {
      "mean": 4.9975,
      "sd": 1.992861
    },
    {
      "mean": 4.968082,
      "sd": 1.995783
    },
    {
      "mean": 5.024415,
      "sd": 1.976239
    },
    {
      "mean": 5.21425,
      "sd": 1.933608
    },
    {
      "mean": 5.40418,
      "sd": 1.891431
    },
    {
      "mean": 5.52381,
      "sd": 1.883747
    },
    {
      "mean": 5.617788,
      "sd": 1.893431
    },
    {
      "mean": 5.708417,
      "sd": 1.900077
    },
    {
      "mean": 5.791835,
      "sd": 1.878495
    },
    {
      "mean": 5.88256,
      "sd": 1.846645
    },
    {
      "mean": 5.977817,
      "sd": 1.827999
    },
    {
      "mean": 6.066314,
      "sd": 1.80264
    },
    {
      "mean": 6.159647,
      "sd": 1.777252
    },
    {
      "mean": 6.248928,
      "sd": 1.755072
    },
    {
      "mean": 6.326356,
      "sd": 1.742554
    },
    {
      "mean": 6.413323,
      "sd": 1.724896
    },
    {
      "mean": 6.476768,
      "sd": 1.709736
    },
    {
      "mean": 6.558838,
      "sd": 1.680871
    }
  ]
};
