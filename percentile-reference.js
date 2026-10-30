// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1974,
      "female": 1980
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
    "focusPolicy": "balanced targets capped by active event limits; freed points left unused",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3973,
      3972,
      3970,
      3969,
      3969,
      3968,
      3968,
      3968,
      3967,
      3965,
      3965,
      3965,
      3964,
      3962,
      3959,
      3958,
      3955,
      3954
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
        "intelligence": -0.095997,
        "strength": -0.020439,
        "social": -0.088969,
        "creativity": -0.097668
      },
      "wellbeingTarget": {
        "health": 5.14703,
        "stability": 4.220116
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
      "observedMean": 5.01714,
      "sd": 2.499831,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.070062,
          "sd": 2.277753
        },
        {
          "mean": 5,
          "observedMean": 5.097397,
          "sd": 2.277527
        },
        {
          "mean": 5,
          "observedMean": 5.117067,
          "sd": 2.278339
        },
        {
          "mean": 5,
          "observedMean": 5.092209,
          "sd": 2.284926
        },
        {
          "mean": 5,
          "observedMean": 5.014429,
          "sd": 2.270913
        },
        {
          "mean": 5,
          "observedMean": 4.919725,
          "sd": 2.258533
        },
        {
          "mean": 5,
          "observedMean": 4.981729,
          "sd": 2.311683
        },
        {
          "mean": 5,
          "observedMean": 5.060869,
          "sd": 2.361601
        },
        {
          "mean": 5,
          "observedMean": 5.071436,
          "sd": 2.371156
        },
        {
          "mean": 5,
          "observedMean": 5.103544,
          "sd": 2.393102
        },
        {
          "mean": 5,
          "observedMean": 5.116525,
          "sd": 2.397488
        },
        {
          "mean": 5,
          "observedMean": 5.131932,
          "sd": 2.422725
        },
        {
          "mean": 5,
          "observedMean": 5.161627,
          "sd": 2.440453
        },
        {
          "mean": 5,
          "observedMean": 5.185119,
          "sd": 2.46174
        },
        {
          "mean": 5,
          "observedMean": 5.156936,
          "sd": 2.472851
        },
        {
          "mean": 5,
          "observedMean": 5.104688,
          "sd": 2.482789
        },
        {
          "mean": 5,
          "observedMean": 5.086612,
          "sd": 2.489489
        },
        {
          "mean": 5,
          "observedMean": 5.065027,
          "sd": 2.48679
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.011037,
      "sd": 2.295409,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.06349,
          "sd": 2.29499
        },
        {
          "mean": 5,
          "observedMean": 5.05705,
          "sd": 2.30561
        },
        {
          "mean": 5,
          "observedMean": 5.070491,
          "sd": 2.30431
        },
        {
          "mean": 5,
          "observedMean": 4.990035,
          "sd": 2.331137
        },
        {
          "mean": 5,
          "observedMean": 4.960078,
          "sd": 2.331287
        },
        {
          "mean": 5,
          "observedMean": 4.942441,
          "sd": 2.320703
        },
        {
          "mean": 5,
          "observedMean": 4.960504,
          "sd": 2.322408
        },
        {
          "mean": 5,
          "observedMean": 4.97435,
          "sd": 2.317567
        },
        {
          "mean": 5,
          "observedMean": 4.974662,
          "sd": 2.313595
        },
        {
          "mean": 5,
          "observedMean": 4.981762,
          "sd": 2.321324
        },
        {
          "mean": 5,
          "observedMean": 4.988272,
          "sd": 2.325591
        },
        {
          "mean": 5,
          "observedMean": 4.999632,
          "sd": 2.336696
        },
        {
          "mean": 5,
          "observedMean": 5.016411,
          "sd": 2.344402
        },
        {
          "mean": 5,
          "observedMean": 5.032205,
          "sd": 2.342656
        },
        {
          "mean": 5,
          "observedMean": 5.045182,
          "sd": 2.317014
        },
        {
          "mean": 5,
          "observedMean": 5.030124,
          "sd": 2.310879
        },
        {
          "mean": 5,
          "observedMean": 5.029338,
          "sd": 2.312927
        },
        {
          "mean": 5,
          "observedMean": 5.026154,
          "sd": 2.304009
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.994593,
      "sd": 1.993215,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.965983,
          "sd": 1.988663
        },
        {
          "mean": 5,
          "observedMean": 4.964213,
          "sd": 1.986291
        },
        {
          "mean": 5,
          "observedMean": 4.964746,
          "sd": 1.985854
        },
        {
          "mean": 5,
          "observedMean": 4.965431,
          "sd": 1.986829
        },
        {
          "mean": 5,
          "observedMean": 4.964318,
          "sd": 1.98584
        },
        {
          "mean": 5,
          "observedMean": 4.96294,
          "sd": 1.986188
        },
        {
          "mean": 5,
          "observedMean": 4.96249,
          "sd": 1.985565
        },
        {
          "mean": 5,
          "observedMean": 4.962747,
          "sd": 1.985397
        },
        {
          "mean": 5,
          "observedMean": 4.963684,
          "sd": 1.985357
        },
        {
          "mean": 5,
          "observedMean": 4.963413,
          "sd": 1.985735
        },
        {
          "mean": 5,
          "observedMean": 4.964646,
          "sd": 1.986285
        },
        {
          "mean": 5,
          "observedMean": 4.964777,
          "sd": 1.985821
        },
        {
          "mean": 5,
          "observedMean": 4.965496,
          "sd": 1.985742
        },
        {
          "mean": 5,
          "observedMean": 4.964448,
          "sd": 1.986743
        },
        {
          "mean": 5,
          "observedMean": 4.972325,
          "sd": 1.988624
        },
        {
          "mean": 5,
          "observedMean": 4.98003,
          "sd": 1.987797
        },
        {
          "mean": 5,
          "observedMean": 4.98695,
          "sd": 1.989353
        },
        {
          "mean": 5,
          "observedMean": 4.990225,
          "sd": 1.991732
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.016034,
      "sd": 2.220791,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030397,
          "sd": 2.297539
        },
        {
          "mean": 5,
          "observedMean": 5.022029,
          "sd": 2.276311
        },
        {
          "mean": 5,
          "observedMean": 5.014391,
          "sd": 2.25209
        },
        {
          "mean": 5,
          "observedMean": 4.983534,
          "sd": 2.242954
        },
        {
          "mean": 5,
          "observedMean": 4.921678,
          "sd": 2.228182
        },
        {
          "mean": 5,
          "observedMean": 4.823835,
          "sd": 2.208834
        },
        {
          "mean": 5,
          "observedMean": 4.798669,
          "sd": 2.1964
        },
        {
          "mean": 5,
          "observedMean": 4.798012,
          "sd": 2.235407
        },
        {
          "mean": 5,
          "observedMean": 4.833117,
          "sd": 2.236897
        },
        {
          "mean": 5,
          "observedMean": 4.837688,
          "sd": 2.223438
        },
        {
          "mean": 5,
          "observedMean": 4.86002,
          "sd": 2.216915
        },
        {
          "mean": 5,
          "observedMean": 4.887955,
          "sd": 2.207978
        },
        {
          "mean": 5,
          "observedMean": 4.897912,
          "sd": 2.207419
        },
        {
          "mean": 5,
          "observedMean": 4.914417,
          "sd": 2.199387
        },
        {
          "mean": 5,
          "observedMean": 4.915785,
          "sd": 2.210202
        },
        {
          "mean": 5,
          "observedMean": 4.932059,
          "sd": 2.216605
        },
        {
          "mean": 5,
          "observedMean": 4.959593,
          "sd": 2.218421
        },
        {
          "mean": 5,
          "observedMean": 4.978013,
          "sd": 2.213511
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.016816,
      "sd": 2.449703,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.045817,
          "sd": 2.289883
        },
        {
          "mean": 5,
          "observedMean": 5.015754,
          "sd": 2.28868
        },
        {
          "mean": 5,
          "observedMean": 4.981606,
          "sd": 2.287268
        },
        {
          "mean": 5,
          "observedMean": 4.994864,
          "sd": 2.314959
        },
        {
          "mean": 5,
          "observedMean": 4.96418,
          "sd": 2.314207
        },
        {
          "mean": 5,
          "observedMean": 4.902976,
          "sd": 2.30593
        },
        {
          "mean": 5,
          "observedMean": 4.947974,
          "sd": 2.349267
        },
        {
          "mean": 5,
          "observedMean": 5.003213,
          "sd": 2.384696
        },
        {
          "mean": 5,
          "observedMean": 5.016726,
          "sd": 2.403928
        },
        {
          "mean": 5,
          "observedMean": 5.021709,
          "sd": 2.41689
        },
        {
          "mean": 5,
          "observedMean": 5.0157,
          "sd": 2.411973
        },
        {
          "mean": 5,
          "observedMean": 5.028103,
          "sd": 2.420812
        },
        {
          "mean": 5,
          "observedMean": 5.032008,
          "sd": 2.413581
        },
        {
          "mean": 5,
          "observedMean": 5.030709,
          "sd": 2.423342
        },
        {
          "mean": 5,
          "observedMean": 5.038364,
          "sd": 2.43041
        },
        {
          "mean": 5,
          "observedMean": 5.041329,
          "sd": 2.432303
        },
        {
          "mean": 5,
          "observedMean": 5.042759,
          "sd": 2.440087
        },
        {
          "mean": 5,
          "observedMean": 5.035858,
          "sd": 2.445311
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.003708,
      "sd": 0.886448,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.940345,
          "sd": 2.287901
        },
        {
          "mean": 5,
          "observedMean": 4.834994,
          "sd": 2.2022
        },
        {
          "mean": 5,
          "observedMean": 4.850853,
          "sd": 2.086142
        },
        {
          "mean": 5,
          "observedMean": 4.81168,
          "sd": 1.996403
        },
        {
          "mean": 5,
          "observedMean": 4.929269,
          "sd": 1.873902
        },
        {
          "mean": 5,
          "observedMean": 4.96264,
          "sd": 1.769182
        },
        {
          "mean": 5,
          "observedMean": 4.970396,
          "sd": 1.665381
        },
        {
          "mean": 5,
          "observedMean": 4.987807,
          "sd": 1.573669
        },
        {
          "mean": 5,
          "observedMean": 4.988175,
          "sd": 1.496544
        },
        {
          "mean": 5,
          "observedMean": 5.002125,
          "sd": 1.408819
        },
        {
          "mean": 5,
          "observedMean": 5.01598,
          "sd": 1.324469
        },
        {
          "mean": 5,
          "observedMean": 5.028653,
          "sd": 1.250792
        },
        {
          "mean": 5,
          "observedMean": 5.05171,
          "sd": 1.184676
        },
        {
          "mean": 5,
          "observedMean": 5.05999,
          "sd": 1.120087
        },
        {
          "mean": 5,
          "observedMean": 5.049399,
          "sd": 1.056799
        },
        {
          "mean": 5,
          "observedMean": 5.034029,
          "sd": 1.015312
        },
        {
          "mean": 5,
          "observedMean": 5.025475,
          "sd": 0.964838
        },
        {
          "mean": 5,
          "observedMean": 5.02487,
          "sd": 0.91497
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.997494,
      "sd": 0.878332,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018087,
          "sd": 2.318658
        },
        {
          "mean": 5,
          "observedMean": 5.084979,
          "sd": 2.2006
        },
        {
          "mean": 5,
          "observedMean": 5.210393,
          "sd": 2.064989
        },
        {
          "mean": 5,
          "observedMean": 5.146053,
          "sd": 1.927362
        },
        {
          "mean": 5,
          "observedMean": 5.131502,
          "sd": 1.76696
        },
        {
          "mean": 5,
          "observedMean": 5.023401,
          "sd": 1.624191
        },
        {
          "mean": 5,
          "observedMean": 4.92067,
          "sd": 1.546142
        },
        {
          "mean": 5,
          "observedMean": 4.914123,
          "sd": 1.458757
        },
        {
          "mean": 5,
          "observedMean": 4.946968,
          "sd": 1.368185
        },
        {
          "mean": 5,
          "observedMean": 4.967633,
          "sd": 1.284721
        },
        {
          "mean": 5,
          "observedMean": 4.972802,
          "sd": 1.204658
        },
        {
          "mean": 5,
          "observedMean": 5.001092,
          "sd": 1.139348
        },
        {
          "mean": 5,
          "observedMean": 5.019687,
          "sd": 1.075172
        },
        {
          "mean": 5,
          "observedMean": 5.032798,
          "sd": 1.017442
        },
        {
          "mean": 5,
          "observedMean": 4.993248,
          "sd": 0.99045
        },
        {
          "mean": 5,
          "observedMean": 4.951053,
          "sd": 0.964141
        },
        {
          "mean": 5,
          "observedMean": 4.960533,
          "sd": 0.933311
        },
        {
          "mean": 5,
          "observedMean": 4.98245,
          "sd": 0.909212
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.23579,
      "sd": 3.544834,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.447128,
          "sd": 1.217902
        },
        {
          "mean": 33.498315,
          "sd": 1.470466
        },
        {
          "mean": 36.739527,
          "sd": 1.678354
        },
        {
          "mean": 39.492349,
          "sd": 1.847873
        },
        {
          "mean": 42.040307,
          "sd": 2.003649
        },
        {
          "mean": 44.524746,
          "sd": 2.15777
        },
        {
          "mean": 46.965833,
          "sd": 2.312246
        },
        {
          "mean": 49.314127,
          "sd": 2.454856
        },
        {
          "mean": 51.490715,
          "sd": 2.591265
        },
        {
          "mean": 53.475701,
          "sd": 2.715627
        },
        {
          "mean": 55.412641,
          "sd": 2.854903
        },
        {
          "mean": 57.630817,
          "sd": 3.060157
        },
        {
          "mean": 60.368936,
          "sd": 3.321662
        },
        {
          "mean": 63.260772,
          "sd": 3.51383
        },
        {
          "mean": 65.664353,
          "sd": 3.579901
        },
        {
          "mean": 67.271593,
          "sd": 3.564719
        },
        {
          "mean": 68.057514,
          "sd": 3.541717
        }
      ]
    },
    "female": {
      "mean": 63.139722,
      "sd": 3.12263,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.846297,
          "sd": 1.177715
        },
        {
          "mean": 33.013841,
          "sd": 1.400122
        },
        {
          "mean": 36.412533,
          "sd": 1.604721
        },
        {
          "mean": 39.012342,
          "sd": 1.754492
        },
        {
          "mean": 41.653357,
          "sd": 1.910379
        },
        {
          "mean": 44.359909,
          "sd": 2.067016
        },
        {
          "mean": 46.966032,
          "sd": 2.226867
        },
        {
          "mean": 49.308137,
          "sd": 2.354873
        },
        {
          "mean": 51.363574,
          "sd": 2.477532
        },
        {
          "mean": 53.365235,
          "sd": 2.60734
        },
        {
          "mean": 55.732428,
          "sd": 2.804811
        },
        {
          "mean": 58.442973,
          "sd": 3.023504
        },
        {
          "mean": 60.791297,
          "sd": 3.144605
        },
        {
          "mean": 62.294816,
          "sd": 3.146568
        },
        {
          "mean": 62.979308,
          "sd": 3.135015
        },
        {
          "mean": 63.131303,
          "sd": 3.124441
        },
        {
          "mean": 63.139722,
          "sd": 3.12263
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
      "mean": 5.08183,
      "sd": 1.97494
    },
    {
      "mean": 5.183432,
      "sd": 1.955727
    },
    {
      "mean": 5.286275,
      "sd": 1.932823
    },
    {
      "mean": 5.388088,
      "sd": 1.908098
    },
    {
      "mean": 5.487795,
      "sd": 1.891426
    },
    {
      "mean": 5.583034,
      "sd": 1.864819
    },
    {
      "mean": 5.677591,
      "sd": 1.848454
    },
    {
      "mean": 5.770118,
      "sd": 1.822749
    },
    {
      "mean": 5.866594,
      "sd": 1.806657
    },
    {
      "mean": 5.963256,
      "sd": 1.7858
    },
    {
      "mean": 6.054984,
      "sd": 1.765635
    },
    {
      "mean": 6.145332,
      "sd": 1.744804
    },
    {
      "mean": 6.231842,
      "sd": 1.726735
    },
    {
      "mean": 6.318766,
      "sd": 1.702526
    },
    {
      "mean": 6.406898,
      "sd": 1.672656
    },
    {
      "mean": 6.490947,
      "sd": 1.654078
    },
    {
      "mean": 6.575535,
      "sd": 1.63488
    }
  ]
};
