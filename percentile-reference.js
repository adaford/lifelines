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
      "self": 2,
      "sports": 2,
      "extracurricular": 2
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
      "observedMean": 5.823554,
      "sd": 1.790223,
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
          "observedMean": 5.479545,
          "sd": 1.968258
        },
        {
          "mean": 5,
          "observedMean": 5.529389,
          "sd": 1.936309
        },
        {
          "mean": 5,
          "observedMean": 5.574974,
          "sd": 1.908479
        },
        {
          "mean": 5,
          "observedMean": 5.619391,
          "sd": 1.88503
        },
        {
          "mean": 5,
          "observedMean": 5.663318,
          "sd": 1.868299
        },
        {
          "mean": 5,
          "observedMean": 5.708465,
          "sd": 1.851535
        },
        {
          "mean": 5,
          "observedMean": 5.750773,
          "sd": 1.831451
        },
        {
          "mean": 5,
          "observedMean": 5.792031,
          "sd": 1.81657
        },
        {
          "mean": 5,
          "observedMean": 5.794378,
          "sd": 1.810274
        },
        {
          "mean": 5,
          "observedMean": 5.800023,
          "sd": 1.805368
        },
        {
          "mean": 5,
          "observedMean": 5.81246,
          "sd": 1.799792
        },
        {
          "mean": 5,
          "observedMean": 5.82227,
          "sd": 1.789598
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.988392,
      "sd": 1.801631,
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
          "observedMean": 5.010921,
          "sd": 2.034492
        },
        {
          "mean": 5,
          "observedMean": 5.010345,
          "sd": 2.014266
        },
        {
          "mean": 5,
          "observedMean": 5.012893,
          "sd": 1.994033
        },
        {
          "mean": 5,
          "observedMean": 5.011192,
          "sd": 1.96913
        },
        {
          "mean": 5,
          "observedMean": 5.010224,
          "sd": 1.948891
        },
        {
          "mean": 5,
          "observedMean": 5.009547,
          "sd": 1.930592
        },
        {
          "mean": 5,
          "observedMean": 5.0103,
          "sd": 1.908946
        },
        {
          "mean": 5,
          "observedMean": 5.013058,
          "sd": 1.893671
        },
        {
          "mean": 5,
          "observedMean": 5.008195,
          "sd": 1.872739
        },
        {
          "mean": 5,
          "observedMean": 5.003523,
          "sd": 1.853122
        },
        {
          "mean": 5,
          "observedMean": 4.997457,
          "sd": 1.83512
        },
        {
          "mean": 5,
          "observedMean": 4.990951,
          "sd": 1.817093
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.875863,
      "sd": 1.943465,
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
          "observedMean": 4.910687,
          "sd": 2.00271
        },
        {
          "mean": 5,
          "observedMean": 4.902835,
          "sd": 1.997505
        },
        {
          "mean": 5,
          "observedMean": 4.895011,
          "sd": 1.992336
        },
        {
          "mean": 5,
          "observedMean": 4.887952,
          "sd": 1.986886
        },
        {
          "mean": 5,
          "observedMean": 4.879477,
          "sd": 1.982109
        },
        {
          "mean": 5,
          "observedMean": 4.871681,
          "sd": 1.976632
        },
        {
          "mean": 5,
          "observedMean": 4.864835,
          "sd": 1.973144
        },
        {
          "mean": 5,
          "observedMean": 4.858465,
          "sd": 1.969288
        },
        {
          "mean": 5,
          "observedMean": 4.860159,
          "sd": 1.964601
        },
        {
          "mean": 5,
          "observedMean": 4.865711,
          "sd": 1.959398
        },
        {
          "mean": 5,
          "observedMean": 4.869846,
          "sd": 1.953212
        },
        {
          "mean": 5,
          "observedMean": 4.872134,
          "sd": 1.947711
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.197529,
      "sd": 1.693901,
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
          "observedMean": 5.297726,
          "sd": 1.998982
        },
        {
          "mean": 5,
          "observedMean": 5.389967,
          "sd": 1.964074
        },
        {
          "mean": 5,
          "observedMean": 5.486667,
          "sd": 1.926545
        },
        {
          "mean": 5,
          "observedMean": 5.573353,
          "sd": 1.899495
        },
        {
          "mean": 5,
          "observedMean": 5.661406,
          "sd": 1.868608
        },
        {
          "mean": 5,
          "observedMean": 5.744855,
          "sd": 1.842245
        },
        {
          "mean": 5,
          "observedMean": 5.83335,
          "sd": 1.811746
        },
        {
          "mean": 5,
          "observedMean": 5.923856,
          "sd": 1.788448
        },
        {
          "mean": 5,
          "observedMean": 5.984091,
          "sd": 1.766656
        },
        {
          "mean": 5,
          "observedMean": 6.046243,
          "sd": 1.747391
        },
        {
          "mean": 5,
          "observedMean": 6.107678,
          "sd": 1.735608
        },
        {
          "mean": 5,
          "observedMean": 6.157772,
          "sd": 1.713783
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.008637,
      "sd": 1.782168,
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
          "observedMean": 5.225613,
          "sd": 2.025864
        },
        {
          "mean": 5,
          "observedMean": 5.30487,
          "sd": 1.997469
        },
        {
          "mean": 5,
          "observedMean": 5.378194,
          "sd": 1.970081
        },
        {
          "mean": 5,
          "observedMean": 5.450946,
          "sd": 1.940348
        },
        {
          "mean": 5,
          "observedMean": 5.525537,
          "sd": 1.91942
        },
        {
          "mean": 5,
          "observedMean": 5.597221,
          "sd": 1.900689
        },
        {
          "mean": 5,
          "observedMean": 5.665193,
          "sd": 1.877157
        },
        {
          "mean": 5,
          "observedMean": 5.731639,
          "sd": 1.859963
        },
        {
          "mean": 5,
          "observedMean": 5.793066,
          "sd": 1.841417
        },
        {
          "mean": 5,
          "observedMean": 5.855162,
          "sd": 1.825002
        },
        {
          "mean": 5,
          "observedMean": 5.915571,
          "sd": 1.812141
        },
        {
          "mean": 5,
          "observedMean": 5.975267,
          "sd": 1.80033
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.008289,
      "sd": 0.685096,
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
          "observedMean": 4.976161,
          "sd": 1.405526
        },
        {
          "mean": 5,
          "observedMean": 4.993673,
          "sd": 1.31006
        },
        {
          "mean": 5,
          "observedMean": 5.009748,
          "sd": 1.224521
        },
        {
          "mean": 5,
          "observedMean": 5.025811,
          "sd": 1.142468
        },
        {
          "mean": 5,
          "observedMean": 5.03874,
          "sd": 1.067035
        },
        {
          "mean": 5,
          "observedMean": 5.053295,
          "sd": 1.00189
        },
        {
          "mean": 5,
          "observedMean": 5.064991,
          "sd": 0.938633
        },
        {
          "mean": 5,
          "observedMean": 5.075165,
          "sd": 0.878179
        },
        {
          "mean": 5,
          "observedMean": 5.056123,
          "sd": 0.835714
        },
        {
          "mean": 5,
          "observedMean": 5.043581,
          "sd": 0.793621
        },
        {
          "mean": 5,
          "observedMean": 5.030345,
          "sd": 0.754637
        },
        {
          "mean": 5,
          "observedMean": 5.020679,
          "sd": 0.718896
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.152138,
      "sd": 0.857559,
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
          "observedMean": 5.223225,
          "sd": 1.249929
        },
        {
          "mean": 5,
          "observedMean": 5.204953,
          "sd": 1.156465
        },
        {
          "mean": 5,
          "observedMean": 5.187512,
          "sd": 1.078044
        },
        {
          "mean": 5,
          "observedMean": 5.172503,
          "sd": 1.03075
        },
        {
          "mean": 5,
          "observedMean": 5.156808,
          "sd": 0.976829
        },
        {
          "mean": 5,
          "observedMean": 5.147717,
          "sd": 0.933497
        },
        {
          "mean": 5,
          "observedMean": 5.151742,
          "sd": 0.890422
        },
        {
          "mean": 5,
          "observedMean": 5.152766,
          "sd": 0.868151
        },
        {
          "mean": 5,
          "observedMean": 5.150418,
          "sd": 0.864671
        },
        {
          "mean": 5,
          "observedMean": 5.148696,
          "sd": 0.865608
        },
        {
          "mean": 5,
          "observedMean": 5.160267,
          "sd": 0.860958
        },
        {
          "mean": 5,
          "observedMean": 5.15394,
          "sd": 0.862094
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.42642,
      "sd": 3.453204,
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
          "mean": 44.604274,
          "sd": 2.084082
        },
        {
          "mean": 47.062177,
          "sd": 2.232279
        },
        {
          "mean": 49.422775,
          "sd": 2.368903
        },
        {
          "mean": 51.61188,
          "sd": 2.497533
        },
        {
          "mean": 53.609306,
          "sd": 2.624589
        },
        {
          "mean": 55.560045,
          "sd": 2.764711
        },
        {
          "mean": 57.781952,
          "sd": 2.961768
        },
        {
          "mean": 60.52337,
          "sd": 3.234626
        },
        {
          "mean": 63.422183,
          "sd": 3.430097
        },
        {
          "mean": 65.840795,
          "sd": 3.491681
        },
        {
          "mean": 67.461053,
          "sd": 3.471951
        },
        {
          "mean": 68.249118,
          "sd": 3.452642
        }
      ]
    },
    "female": {
      "mean": 63.267817,
      "sd": 3.043634,
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
          "mean": 44.424924,
          "sd": 2.053382
        },
        {
          "mean": 47.045705,
          "sd": 2.19654
        },
        {
          "mean": 49.399446,
          "sd": 2.324169
        },
        {
          "mean": 51.470398,
          "sd": 2.442561
        },
        {
          "mean": 53.472679,
          "sd": 2.565955
        },
        {
          "mean": 55.841753,
          "sd": 2.762691
        },
        {
          "mean": 58.55339,
          "sd": 2.975791
        },
        {
          "mean": 60.91206,
          "sd": 3.080432
        },
        {
          "mean": 62.423367,
          "sd": 3.074334
        },
        {
          "mean": 63.11002,
          "sd": 3.053076
        },
        {
          "mean": 63.261559,
          "sd": 3.044911
        },
        {
          "mean": 63.26798,
          "sd": 3.042874
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
      "mean": 5.594065,
      "sd": 1.867914
    },
    {
      "mean": 5.692709,
      "sd": 1.847029
    },
    {
      "mean": 5.790465,
      "sd": 1.824244
    },
    {
      "mean": 5.884551,
      "sd": 1.801222
    },
    {
      "mean": 5.982536,
      "sd": 1.779401
    },
    {
      "mean": 6.073604,
      "sd": 1.757164
    },
    {
      "mean": 6.160093,
      "sd": 1.73093
    },
    {
      "mean": 6.249338,
      "sd": 1.709986
    },
    {
      "mean": 6.332963,
      "sd": 1.693457
    },
    {
      "mean": 6.416799,
      "sd": 1.676873
    },
    {
      "mean": 6.501966,
      "sd": 1.653853
    },
    {
      "mean": 6.585068,
      "sd": 1.635304
    }
  ]
};
