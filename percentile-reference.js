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
      "observedMean": 5.002246,
      "sd": 2.187734,
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
          "observedMean": 5.044602,
          "sd": 2.263249
        },
        {
          "mean": 5,
          "observedMean": 5.015248,
          "sd": 2.247009
        },
        {
          "mean": 5,
          "observedMean": 4.985402,
          "sd": 2.229979
        },
        {
          "mean": 5,
          "observedMean": 5.007473,
          "sd": 2.241619
        },
        {
          "mean": 5,
          "observedMean": 5.038768,
          "sd": 2.247583
        },
        {
          "mean": 5,
          "observedMean": 5.038231,
          "sd": 2.243933
        },
        {
          "mean": 5,
          "observedMean": 5.040441,
          "sd": 2.237855
        },
        {
          "mean": 5,
          "observedMean": 5.045621,
          "sd": 2.233591
        },
        {
          "mean": 5,
          "observedMean": 5.051266,
          "sd": 2.229915
        },
        {
          "mean": 5,
          "observedMean": 5.051092,
          "sd": 2.22598
        },
        {
          "mean": 5,
          "observedMean": 5.051079,
          "sd": 2.216812
        },
        {
          "mean": 5,
          "observedMean": 5.041291,
          "sd": 2.206621
        },
        {
          "mean": 5,
          "observedMean": 5.026609,
          "sd": 2.209775
        },
        {
          "mean": 5,
          "observedMean": 5.014134,
          "sd": 2.207721
        },
        {
          "mean": 5,
          "observedMean": 5.01221,
          "sd": 2.195466
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.001473,
      "sd": 2.093097,
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
          "observedMean": 4.97482,
          "sd": 2.236263
        },
        {
          "mean": 5,
          "observedMean": 4.975853,
          "sd": 2.228673
        },
        {
          "mean": 5,
          "observedMean": 4.984965,
          "sd": 2.219108
        },
        {
          "mean": 5,
          "observedMean": 4.984844,
          "sd": 2.208156
        },
        {
          "mean": 5,
          "observedMean": 4.990756,
          "sd": 2.194369
        },
        {
          "mean": 5,
          "observedMean": 4.99369,
          "sd": 2.185889
        },
        {
          "mean": 5,
          "observedMean": 4.99679,
          "sd": 2.171474
        },
        {
          "mean": 5,
          "observedMean": 4.996353,
          "sd": 2.163623
        },
        {
          "mean": 5,
          "observedMean": 4.996595,
          "sd": 2.159336
        },
        {
          "mean": 5,
          "observedMean": 5.011004,
          "sd": 2.136169
        },
        {
          "mean": 5,
          "observedMean": 5.007048,
          "sd": 2.127096
        },
        {
          "mean": 5,
          "observedMean": 5.002788,
          "sd": 2.117891
        },
        {
          "mean": 5,
          "observedMean": 5.000295,
          "sd": 2.104529
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.023834,
      "sd": 1.989935,
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
          "observedMean": 5.010343,
          "sd": 1.987032
        },
        {
          "mean": 5,
          "observedMean": 5.010358,
          "sd": 1.986168
        },
        {
          "mean": 5,
          "observedMean": 5.01005,
          "sd": 1.985876
        },
        {
          "mean": 5,
          "observedMean": 5.009869,
          "sd": 1.986179
        },
        {
          "mean": 5,
          "observedMean": 5.008977,
          "sd": 1.986758
        },
        {
          "mean": 5,
          "observedMean": 5.008147,
          "sd": 1.985791
        },
        {
          "mean": 5,
          "observedMean": 5.009748,
          "sd": 1.984757
        },
        {
          "mean": 5,
          "observedMean": 5.009879,
          "sd": 1.986268
        },
        {
          "mean": 5,
          "observedMean": 5.011009,
          "sd": 1.985669
        },
        {
          "mean": 5,
          "observedMean": 5.012865,
          "sd": 1.986344
        },
        {
          "mean": 5,
          "observedMean": 5.017441,
          "sd": 1.987431
        },
        {
          "mean": 5,
          "observedMean": 5.020644,
          "sd": 1.988035
        },
        {
          "mean": 5,
          "observedMean": 5.023384,
          "sd": 1.989187
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.006145,
      "sd": 2.111911,
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
          "observedMean": 4.984699,
          "sd": 2.24391
        },
        {
          "mean": 5,
          "observedMean": 4.943963,
          "sd": 2.230188
        },
        {
          "mean": 5,
          "observedMean": 4.938856,
          "sd": 2.213224
        },
        {
          "mean": 5,
          "observedMean": 4.94214,
          "sd": 2.214517
        },
        {
          "mean": 5,
          "observedMean": 4.960108,
          "sd": 2.204082
        },
        {
          "mean": 5,
          "observedMean": 4.957283,
          "sd": 2.19409
        },
        {
          "mean": 5,
          "observedMean": 4.952826,
          "sd": 2.185419
        },
        {
          "mean": 5,
          "observedMean": 4.956006,
          "sd": 2.168807
        },
        {
          "mean": 5,
          "observedMean": 4.953793,
          "sd": 2.14984
        },
        {
          "mean": 5,
          "observedMean": 4.955483,
          "sd": 2.139004
        },
        {
          "mean": 5,
          "observedMean": 4.955231,
          "sd": 2.134038
        },
        {
          "mean": 5,
          "observedMean": 4.963071,
          "sd": 2.129255
        },
        {
          "mean": 5,
          "observedMean": 4.976684,
          "sd": 2.124144
        },
        {
          "mean": 5,
          "observedMean": 4.99898,
          "sd": 2.113718
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.001518,
      "sd": 2.157949,
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
          "observedMean": 5.028424,
          "sd": 2.257251
        },
        {
          "mean": 5,
          "observedMean": 5.020136,
          "sd": 2.247878
        },
        {
          "mean": 5,
          "observedMean": 5.006077,
          "sd": 2.2366
        },
        {
          "mean": 5,
          "observedMean": 5.0184,
          "sd": 2.237794
        },
        {
          "mean": 5,
          "observedMean": 5.024312,
          "sd": 2.239504
        },
        {
          "mean": 5,
          "observedMean": 5.02218,
          "sd": 2.230657
        },
        {
          "mean": 5,
          "observedMean": 5.020932,
          "sd": 2.222492
        },
        {
          "mean": 5,
          "observedMean": 5.017877,
          "sd": 2.216354
        },
        {
          "mean": 5,
          "observedMean": 5.020242,
          "sd": 2.208711
        },
        {
          "mean": 5,
          "observedMean": 5.017397,
          "sd": 2.202574
        },
        {
          "mean": 5,
          "observedMean": 5.01796,
          "sd": 2.195866
        },
        {
          "mean": 5,
          "observedMean": 5.014189,
          "sd": 2.185911
        },
        {
          "mean": 5,
          "observedMean": 5.010555,
          "sd": 2.177143
        },
        {
          "mean": 5,
          "observedMean": 5.000912,
          "sd": 2.171081
        },
        {
          "mean": 5,
          "observedMean": 5.004374,
          "sd": 2.158872
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.000134,
      "sd": 0.68957,
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
          "observedMean": 4.986774,
          "sd": 1.566176
        },
        {
          "mean": 5,
          "observedMean": 4.992114,
          "sd": 1.474782
        },
        {
          "mean": 5,
          "observedMean": 4.993401,
          "sd": 1.384767
        },
        {
          "mean": 5,
          "observedMean": 5.002767,
          "sd": 1.30279
        },
        {
          "mean": 5,
          "observedMean": 5.00504,
          "sd": 1.225458
        },
        {
          "mean": 5,
          "observedMean": 5.009662,
          "sd": 1.153618
        },
        {
          "mean": 5,
          "observedMean": 5.012924,
          "sd": 1.085189
        },
        {
          "mean": 5,
          "observedMean": 5.014072,
          "sd": 1.018369
        },
        {
          "mean": 5,
          "observedMean": 5.016098,
          "sd": 0.957347
        },
        {
          "mean": 5,
          "observedMean": 5.016557,
          "sd": 0.903606
        },
        {
          "mean": 5,
          "observedMean": 5.016043,
          "sd": 0.853529
        },
        {
          "mean": 5,
          "observedMean": 5.013023,
          "sd": 0.808339
        },
        {
          "mean": 5,
          "observedMean": 5.008169,
          "sd": 0.772336
        },
        {
          "mean": 5,
          "observedMean": 5.002667,
          "sd": 0.72815
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.000038,
      "sd": 0.604522,
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
          "observedMean": 5.002465,
          "sd": 1.55601
        },
        {
          "mean": 5,
          "observedMean": 5.001148,
          "sd": 1.424998
        },
        {
          "mean": 5,
          "observedMean": 4.966684,
          "sd": 1.308972
        },
        {
          "mean": 5,
          "observedMean": 4.953147,
          "sd": 1.222183
        },
        {
          "mean": 5,
          "observedMean": 4.963211,
          "sd": 1.137266
        },
        {
          "mean": 5,
          "observedMean": 4.978778,
          "sd": 1.055842
        },
        {
          "mean": 5,
          "observedMean": 4.988364,
          "sd": 0.982922
        },
        {
          "mean": 5,
          "observedMean": 4.99147,
          "sd": 0.912168
        },
        {
          "mean": 5,
          "observedMean": 4.995149,
          "sd": 0.851965
        },
        {
          "mean": 5,
          "observedMean": 5.008719,
          "sd": 0.796175
        },
        {
          "mean": 5,
          "observedMean": 5.008585,
          "sd": 0.754171
        },
        {
          "mean": 5,
          "observedMean": 4.997773,
          "sd": 0.714416
        },
        {
          "mean": 5,
          "observedMean": 4.981428,
          "sd": 0.686582
        },
        {
          "mean": 5,
          "observedMean": 4.982093,
          "sd": 0.65577
        },
        {
          "mean": 5,
          "observedMean": 4.998232,
          "sd": 0.621305
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.440961,
      "sd": 3.303942,
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
          "mean": 44.668569,
          "sd": 2.019202
        },
        {
          "mean": 47.120787,
          "sd": 2.155604
        },
        {
          "mean": 49.47877,
          "sd": 2.28303
        },
        {
          "mean": 51.65708,
          "sd": 2.410015
        },
        {
          "mean": 53.633606,
          "sd": 2.532985
        },
        {
          "mean": 55.565542,
          "sd": 2.66354
        },
        {
          "mean": 57.762714,
          "sd": 2.851915
        },
        {
          "mean": 60.486357,
          "sd": 3.106475
        },
        {
          "mean": 63.372205,
          "sd": 3.300646
        },
        {
          "mean": 65.798531,
          "sd": 3.359608
        },
        {
          "mean": 67.439414,
          "sd": 3.330377
        },
        {
          "mean": 68.251718,
          "sd": 3.305438
        }
      ]
    },
    "female": {
      "mean": 63.198087,
      "sd": 3.023089,
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
          "mean": 41.67332,
          "sd": 1.858319
        },
        {
          "mean": 44.391461,
          "sd": 2.009302
        },
        {
          "mean": 47.00863,
          "sd": 2.152023
        },
        {
          "mean": 49.35405,
          "sd": 2.281499
        },
        {
          "mean": 51.42264,
          "sd": 2.414438
        },
        {
          "mean": 53.42941,
          "sd": 2.560755
        },
        {
          "mean": 55.804876,
          "sd": 2.784434
        },
        {
          "mean": 58.51476,
          "sd": 3.017549
        },
        {
          "mean": 60.858149,
          "sd": 3.10821
        },
        {
          "mean": 62.354362,
          "sd": 3.078471
        },
        {
          "mean": 63.034728,
          "sd": 3.031582
        },
        {
          "mean": 63.188486,
          "sd": 3.023329
        },
        {
          "mean": 63.198087,
          "sd": 3.023089
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
      "mean": 5.524061,
      "sd": 1.883476
    },
    {
      "mean": 5.618292,
      "sd": 1.893533
    },
    {
      "mean": 5.708921,
      "sd": 1.900154
    },
    {
      "mean": 5.792339,
      "sd": 1.878819
    },
    {
      "mean": 5.883317,
      "sd": 1.846762
    },
    {
      "mean": 5.978321,
      "sd": 1.828281
    },
    {
      "mean": 6.06707,
      "sd": 1.802682
    },
    {
      "mean": 6.160404,
      "sd": 1.777255
    },
    {
      "mean": 6.250189,
      "sd": 1.75439
    },
    {
      "mean": 6.327869,
      "sd": 1.74169
    },
    {
      "mean": 6.414333,
      "sd": 1.724507
    },
    {
      "mean": 6.477525,
      "sd": 1.709746
    },
    {
      "mean": 6.558838,
      "sd": 1.68057
    }
  ]
};
