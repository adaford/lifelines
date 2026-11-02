// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1985,
      "female": 1986
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
      3976,
      3976,
      3976,
      3976,
      3974,
      3974,
      3973,
      3971
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
      "observedMean": 4.594485,
      "sd": 1.626025,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.074535,
          "sd": 2.17921
        },
        {
          "mean": 5,
          "observedMean": 5.256827,
          "sd": 2.134312
        },
        {
          "mean": 5,
          "observedMean": 5.430684,
          "sd": 2.089978
        },
        {
          "mean": 5,
          "observedMean": 5.472967,
          "sd": 2.055352
        },
        {
          "mean": 5,
          "observedMean": 5.469889,
          "sd": 2.02792
        },
        {
          "mean": 5,
          "observedMean": 5.460772,
          "sd": 1.997292
        },
        {
          "mean": 5,
          "observedMean": 5.395043,
          "sd": 1.955522
        },
        {
          "mean": 5,
          "observedMean": 5.330013,
          "sd": 1.918985
        },
        {
          "mean": 5,
          "observedMean": 5.272812,
          "sd": 1.881212
        },
        {
          "mean": 5,
          "observedMean": 5.219741,
          "sd": 1.846294
        },
        {
          "mean": 5,
          "observedMean": 5.168227,
          "sd": 1.805886
        },
        {
          "mean": 5,
          "observedMean": 5.114215,
          "sd": 1.781139
        },
        {
          "mean": 5,
          "observedMean": 5.063959,
          "sd": 1.749392
        },
        {
          "mean": 5,
          "observedMean": 5.011253,
          "sd": 1.719399
        },
        {
          "mean": 5,
          "observedMean": 4.933431,
          "sd": 1.698791
        },
        {
          "mean": 5,
          "observedMean": 4.85036,
          "sd": 1.678427
        },
        {
          "mean": 5,
          "observedMean": 4.772036,
          "sd": 1.653608
        },
        {
          "mean": 5,
          "observedMean": 4.687777,
          "sd": 1.632894
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.105082,
      "sd": 1.669408,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030385,
          "sd": 2.206269
        },
        {
          "mean": 5,
          "observedMean": 5.040322,
          "sd": 2.174989
        },
        {
          "mean": 5,
          "observedMean": 5.049485,
          "sd": 2.144923
        },
        {
          "mean": 5,
          "observedMean": 5.033601,
          "sd": 2.115078
        },
        {
          "mean": 5,
          "observedMean": 5.019774,
          "sd": 2.084835
        },
        {
          "mean": 5,
          "observedMean": 5.004346,
          "sd": 2.059118
        },
        {
          "mean": 5,
          "observedMean": 4.829844,
          "sd": 2.021389
        },
        {
          "mean": 5,
          "observedMean": 4.665913,
          "sd": 1.989196
        },
        {
          "mean": 5,
          "observedMean": 4.503421,
          "sd": 1.959129
        },
        {
          "mean": 5,
          "observedMean": 4.346439,
          "sd": 1.92551
        },
        {
          "mean": 5,
          "observedMean": 4.192497,
          "sd": 1.892736
        },
        {
          "mean": 5,
          "observedMean": 4.047538,
          "sd": 1.863043
        },
        {
          "mean": 5,
          "observedMean": 3.905943,
          "sd": 1.836042
        },
        {
          "mean": 5,
          "observedMean": 3.766947,
          "sd": 1.808108
        },
        {
          "mean": 5,
          "observedMean": 3.629623,
          "sd": 1.779453
        },
        {
          "mean": 5,
          "observedMean": 3.491107,
          "sd": 1.75112
        },
        {
          "mean": 5,
          "observedMean": 3.362947,
          "sd": 1.722706
        },
        {
          "mean": 5,
          "observedMean": 3.23327,
          "sd": 1.697198
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.865507,
      "sd": 1.944029,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938724,
          "sd": 2.019586
        },
        {
          "mean": 5,
          "observedMean": 4.938788,
          "sd": 2.016369
        },
        {
          "mean": 5,
          "observedMean": 4.930038,
          "sd": 2.010863
        },
        {
          "mean": 5,
          "observedMean": 4.921994,
          "sd": 2.007155
        },
        {
          "mean": 5,
          "observedMean": 4.912409,
          "sd": 2.002334
        },
        {
          "mean": 5,
          "observedMean": 4.905656,
          "sd": 1.996972
        },
        {
          "mean": 5,
          "observedMean": 4.897072,
          "sd": 1.991421
        },
        {
          "mean": 5,
          "observedMean": 4.889157,
          "sd": 1.98678
        },
        {
          "mean": 5,
          "observedMean": 4.881527,
          "sd": 1.981898
        },
        {
          "mean": 5,
          "observedMean": 4.874366,
          "sd": 1.977534
        },
        {
          "mean": 5,
          "observedMean": 4.86578,
          "sd": 1.972892
        },
        {
          "mean": 5,
          "observedMean": 4.85497,
          "sd": 1.967552
        },
        {
          "mean": 5,
          "observedMean": 4.84543,
          "sd": 1.962712
        },
        {
          "mean": 5,
          "observedMean": 4.85048,
          "sd": 1.959205
        },
        {
          "mean": 5,
          "observedMean": 4.854424,
          "sd": 1.955556
        },
        {
          "mean": 5,
          "observedMean": 4.857194,
          "sd": 1.95135
        },
        {
          "mean": 5,
          "observedMean": 4.861331,
          "sd": 1.947538
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.480511,
      "sd": 1.672444,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.002082,
          "sd": 2.21191
        },
        {
          "mean": 5,
          "observedMean": 5.042696,
          "sd": 2.169095
        },
        {
          "mean": 5,
          "observedMean": 5.085602,
          "sd": 2.130489
        },
        {
          "mean": 5,
          "observedMean": 5.142982,
          "sd": 2.092296
        },
        {
          "mean": 5,
          "observedMean": 5.173696,
          "sd": 2.060498
        },
        {
          "mean": 5,
          "observedMean": 5.184605,
          "sd": 2.030575
        },
        {
          "mean": 5,
          "observedMean": 5.120795,
          "sd": 1.98757
        },
        {
          "mean": 5,
          "observedMean": 5.057689,
          "sd": 1.94936
        },
        {
          "mean": 5,
          "observedMean": 5.005941,
          "sd": 1.91243
        },
        {
          "mean": 5,
          "observedMean": 4.954588,
          "sd": 1.871894
        },
        {
          "mean": 5,
          "observedMean": 4.906876,
          "sd": 1.839541
        },
        {
          "mean": 5,
          "observedMean": 4.859618,
          "sd": 1.814085
        },
        {
          "mean": 5,
          "observedMean": 4.818725,
          "sd": 1.793406
        },
        {
          "mean": 5,
          "observedMean": 4.769701,
          "sd": 1.765562
        },
        {
          "mean": 5,
          "observedMean": 4.70504,
          "sd": 1.743287
        },
        {
          "mean": 5,
          "observedMean": 4.655088,
          "sd": 1.723083
        },
        {
          "mean": 5,
          "observedMean": 4.597368,
          "sd": 1.706706
        },
        {
          "mean": 5,
          "observedMean": 4.543018,
          "sd": 1.688814
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.598955,
      "sd": 1.710845,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.089495,
          "sd": 2.177062
        },
        {
          "mean": 5,
          "observedMean": 5.124629,
          "sd": 2.151314
        },
        {
          "mean": 5,
          "observedMean": 5.176477,
          "sd": 2.125824
        },
        {
          "mean": 5,
          "observedMean": 5.202706,
          "sd": 2.100276
        },
        {
          "mean": 5,
          "observedMean": 5.213426,
          "sd": 2.073813
        },
        {
          "mean": 5,
          "observedMean": 5.155679,
          "sd": 2.035861
        },
        {
          "mean": 5,
          "observedMean": 5.109502,
          "sd": 2.001408
        },
        {
          "mean": 5,
          "observedMean": 5.062875,
          "sd": 1.96888
        },
        {
          "mean": 5,
          "observedMean": 5.024029,
          "sd": 1.932099
        },
        {
          "mean": 5,
          "observedMean": 4.977223,
          "sd": 1.89889
        },
        {
          "mean": 5,
          "observedMean": 4.929505,
          "sd": 1.866396
        },
        {
          "mean": 5,
          "observedMean": 4.886293,
          "sd": 1.838337
        },
        {
          "mean": 5,
          "observedMean": 4.842115,
          "sd": 1.817988
        },
        {
          "mean": 5,
          "observedMean": 4.801341,
          "sd": 1.792336
        },
        {
          "mean": 5,
          "observedMean": 4.756444,
          "sd": 1.767926
        },
        {
          "mean": 5,
          "observedMean": 4.706507,
          "sd": 1.747097
        },
        {
          "mean": 5,
          "observedMean": 4.666217,
          "sd": 1.730893
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.974004,
      "sd": 0.691464,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.891608,
          "sd": 2.196033
        },
        {
          "mean": 5,
          "observedMean": 4.886985,
          "sd": 2.03216
        },
        {
          "mean": 5,
          "observedMean": 4.878798,
          "sd": 1.880085
        },
        {
          "mean": 5,
          "observedMean": 4.878753,
          "sd": 1.747296
        },
        {
          "mean": 5,
          "observedMean": 4.917003,
          "sd": 1.620776
        },
        {
          "mean": 5,
          "observedMean": 4.951149,
          "sd": 1.508035
        },
        {
          "mean": 5,
          "observedMean": 4.968848,
          "sd": 1.402766
        },
        {
          "mean": 5,
          "observedMean": 4.982832,
          "sd": 1.305845
        },
        {
          "mean": 5,
          "observedMean": 4.997978,
          "sd": 1.218141
        },
        {
          "mean": 5,
          "observedMean": 5.010023,
          "sd": 1.136757
        },
        {
          "mean": 5,
          "observedMean": 5.022583,
          "sd": 1.059767
        },
        {
          "mean": 5,
          "observedMean": 5.033763,
          "sd": 0.991827
        },
        {
          "mean": 5,
          "observedMean": 5.043006,
          "sd": 0.928383
        },
        {
          "mean": 5,
          "observedMean": 5.052721,
          "sd": 0.86899
        },
        {
          "mean": 5,
          "observedMean": 5.041735,
          "sd": 0.823844
        },
        {
          "mean": 5,
          "observedMean": 5.024801,
          "sd": 0.786335
        },
        {
          "mean": 5,
          "observedMean": 5.008699,
          "sd": 0.755172
        },
        {
          "mean": 5,
          "observedMean": 4.993046,
          "sd": 0.722823
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.984548,
      "sd": 0.786472,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.129078,
          "sd": 2.014326
        },
        {
          "mean": 5,
          "observedMean": 5.253548,
          "sd": 1.830435
        },
        {
          "mean": 5,
          "observedMean": 5.208252,
          "sd": 1.647759
        },
        {
          "mean": 5,
          "observedMean": 5.218305,
          "sd": 1.492065
        },
        {
          "mean": 5,
          "observedMean": 5.227088,
          "sd": 1.359928
        },
        {
          "mean": 5,
          "observedMean": 5.230433,
          "sd": 1.239514
        },
        {
          "mean": 5,
          "observedMean": 5.208647,
          "sd": 1.145869
        },
        {
          "mean": 5,
          "observedMean": 5.192437,
          "sd": 1.069174
        },
        {
          "mean": 5,
          "observedMean": 5.165573,
          "sd": 1.001119
        },
        {
          "mean": 5,
          "observedMean": 5.139681,
          "sd": 0.947456
        },
        {
          "mean": 5,
          "observedMean": 5.123164,
          "sd": 0.893577
        },
        {
          "mean": 5,
          "observedMean": 5.11084,
          "sd": 0.858364
        },
        {
          "mean": 5,
          "observedMean": 5.094399,
          "sd": 0.833509
        },
        {
          "mean": 5,
          "observedMean": 5.077256,
          "sd": 0.818846
        },
        {
          "mean": 5,
          "observedMean": 5.05192,
          "sd": 0.804565
        },
        {
          "mean": 5,
          "observedMean": 5.028757,
          "sd": 0.797765
        },
        {
          "mean": 5,
          "observedMean": 5.015505,
          "sd": 0.795355
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.251451,
      "sd": 3.05853,
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
          "mean": 33.968597,
          "sd": 1.298897
        },
        {
          "mean": 37.297567,
          "sd": 1.448241
        },
        {
          "mean": 40.137009,
          "sd": 1.577242
        },
        {
          "mean": 42.746918,
          "sd": 1.697252
        },
        {
          "mean": 45.281146,
          "sd": 1.814238
        },
        {
          "mean": 47.766536,
          "sd": 1.940145
        },
        {
          "mean": 50.154429,
          "sd": 2.055338
        },
        {
          "mean": 52.362383,
          "sd": 2.172837
        },
        {
          "mean": 54.369904,
          "sd": 2.288794
        },
        {
          "mean": 56.328024,
          "sd": 2.420308
        },
        {
          "mean": 58.56823,
          "sd": 2.621842
        },
        {
          "mean": 61.329155,
          "sd": 2.885773
        },
        {
          "mean": 64.247456,
          "sd": 3.067704
        },
        {
          "mean": 66.671555,
          "sd": 3.119122
        },
        {
          "mean": 68.294343,
          "sd": 3.085698
        },
        {
          "mean": 69.071757,
          "sd": 3.057872
        }
      ]
    },
    "female": {
      "mean": 64.121244,
      "sd": 2.761334,
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
          "mean": 33.473838,
          "sd": 1.295655
        },
        {
          "mean": 36.988602,
          "sd": 1.442369
        },
        {
          "mean": 39.663214,
          "sd": 1.558604
        },
        {
          "mean": 42.36233,
          "sd": 1.680483
        },
        {
          "mean": 45.12613,
          "sd": 1.813648
        },
        {
          "mean": 47.778485,
          "sd": 1.932856
        },
        {
          "mean": 50.167333,
          "sd": 2.048696
        },
        {
          "mean": 52.253256,
          "sd": 2.158961
        },
        {
          "mean": 54.275415,
          "sd": 2.291214
        },
        {
          "mean": 56.669824,
          "sd": 2.493646
        },
        {
          "mean": 59.409955,
          "sd": 2.720527
        },
        {
          "mean": 61.771922,
          "sd": 2.822041
        },
        {
          "mean": 63.282486,
          "sd": 2.801755
        },
        {
          "mean": 63.965405,
          "sd": 2.776507
        },
        {
          "mean": 64.113905,
          "sd": 2.763059
        },
        {
          "mean": 64.121303,
          "sd": 2.76064
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
      "mean": 5.180792,
      "sd": 1.959144
    },
    {
      "mean": 5.283108,
      "sd": 1.933435
    },
    {
      "mean": 5.385326,
      "sd": 1.911414
    },
    {
      "mean": 5.49088,
      "sd": 1.890506
    },
    {
      "mean": 5.593197,
      "sd": 1.870172
    },
    {
      "mean": 5.688234,
      "sd": 1.852009
    },
    {
      "mean": 5.788846,
      "sd": 1.833187
    },
    {
      "mean": 5.878398,
      "sd": 1.815709
    },
    {
      "mean": 5.972867,
      "sd": 1.792744
    },
    {
      "mean": 6.065551,
      "sd": 1.770966
    },
    {
      "mean": 6.158851,
      "sd": 1.746402
    },
    {
      "mean": 6.244132,
      "sd": 1.731441
    },
    {
      "mean": 6.326431,
      "sd": 1.714817
    },
    {
      "mean": 6.408905,
      "sd": 1.700217
    },
    {
      "mean": 6.494139,
      "sd": 1.678627
    },
    {
      "mean": 6.571055,
      "sd": 1.663477
    }
  ]
};
