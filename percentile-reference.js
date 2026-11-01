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
    "childhoodDeductionScale": 0.1,
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
      "observedMean": 5.8503,
      "sd": 1.622587,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.060985,
          "sd": 2.188049
        },
        {
          "mean": 5,
          "observedMean": 5.128369,
          "sd": 2.150264
        },
        {
          "mean": 5,
          "observedMean": 5.193691,
          "sd": 2.11207
        },
        {
          "mean": 5,
          "observedMean": 5.241657,
          "sd": 2.073569
        },
        {
          "mean": 5,
          "observedMean": 5.267224,
          "sd": 2.038289
        },
        {
          "mean": 5,
          "observedMean": 5.280611,
          "sd": 2.002535
        },
        {
          "mean": 5,
          "observedMean": 5.339421,
          "sd": 1.959345
        },
        {
          "mean": 5,
          "observedMean": 5.407635,
          "sd": 1.920301
        },
        {
          "mean": 5,
          "observedMean": 5.470121,
          "sd": 1.883861
        },
        {
          "mean": 5,
          "observedMean": 5.529452,
          "sd": 1.849551
        },
        {
          "mean": 5,
          "observedMean": 5.589361,
          "sd": 1.822534
        },
        {
          "mean": 5,
          "observedMean": 5.650551,
          "sd": 1.793435
        },
        {
          "mean": 5,
          "observedMean": 5.708442,
          "sd": 1.759158
        },
        {
          "mean": 5,
          "observedMean": 5.763453,
          "sd": 1.729224
        },
        {
          "mean": 5,
          "observedMean": 5.776788,
          "sd": 1.708219
        },
        {
          "mean": 5,
          "observedMean": 5.792931,
          "sd": 1.686327
        },
        {
          "mean": 5,
          "observedMean": 5.816526,
          "sd": 1.668662
        },
        {
          "mean": 5,
          "observedMean": 5.838153,
          "sd": 1.638297
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.008693,
      "sd": 1.74985,
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
          "observedMean": 5.047963,
          "sd": 2.102485
        },
        {
          "mean": 5,
          "observedMean": 5.042286,
          "sd": 2.069125
        },
        {
          "mean": 5,
          "observedMean": 5.03703,
          "sd": 2.038854
        },
        {
          "mean": 5,
          "observedMean": 5.036684,
          "sd": 2.009818
        },
        {
          "mean": 5,
          "observedMean": 5.034533,
          "sd": 1.98639
        },
        {
          "mean": 5,
          "observedMean": 5.036332,
          "sd": 1.963332
        },
        {
          "mean": 5,
          "observedMean": 5.035132,
          "sd": 1.935527
        },
        {
          "mean": 5,
          "observedMean": 5.032888,
          "sd": 1.913345
        },
        {
          "mean": 5,
          "observedMean": 5.03301,
          "sd": 1.890992
        },
        {
          "mean": 5,
          "observedMean": 5.033702,
          "sd": 1.868598
        },
        {
          "mean": 5,
          "observedMean": 5.036096,
          "sd": 1.851219
        },
        {
          "mean": 5,
          "observedMean": 5.030428,
          "sd": 1.828397
        },
        {
          "mean": 5,
          "observedMean": 5.02554,
          "sd": 1.806763
        },
        {
          "mean": 5,
          "observedMean": 5.01935,
          "sd": 1.786904
        },
        {
          "mean": 5,
          "observedMean": 5.011193,
          "sd": 1.768365
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.876625,
      "sd": 1.94403,
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
          "observedMean": 4.934833,
          "sd": 2.015614
        },
        {
          "mean": 5,
          "observedMean": 4.926832,
          "sd": 2.011938
        },
        {
          "mean": 5,
          "observedMean": 4.917155,
          "sd": 2.006995
        },
        {
          "mean": 5,
          "observedMean": 4.910551,
          "sd": 2.002499
        },
        {
          "mean": 5,
          "observedMean": 4.902833,
          "sd": 1.997347
        },
        {
          "mean": 5,
          "observedMean": 4.895119,
          "sd": 1.99215
        },
        {
          "mean": 5,
          "observedMean": 4.888221,
          "sd": 1.986618
        },
        {
          "mean": 5,
          "observedMean": 4.879849,
          "sd": 1.981769
        },
        {
          "mean": 5,
          "observedMean": 4.872021,
          "sd": 1.976295
        },
        {
          "mean": 5,
          "observedMean": 4.865157,
          "sd": 1.972865
        },
        {
          "mean": 5,
          "observedMean": 4.858845,
          "sd": 1.969078
        },
        {
          "mean": 5,
          "observedMean": 4.86032,
          "sd": 1.964735
        },
        {
          "mean": 5,
          "observedMean": 4.865837,
          "sd": 1.959702
        },
        {
          "mean": 5,
          "observedMean": 4.870335,
          "sd": 1.953577
        },
        {
          "mean": 5,
          "observedMean": 4.872535,
          "sd": 1.948158
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.094127,
      "sd": 1.647479,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99889,
          "sd": 2.220147
        },
        {
          "mean": 5,
          "observedMean": 5.052734,
          "sd": 2.170834
        },
        {
          "mean": 5,
          "observedMean": 5.108102,
          "sd": 2.126902
        },
        {
          "mean": 5,
          "observedMean": 5.180845,
          "sd": 2.083648
        },
        {
          "mean": 5,
          "observedMean": 5.208539,
          "sd": 2.046722
        },
        {
          "mean": 5,
          "observedMean": 5.218564,
          "sd": 2.012327
        },
        {
          "mean": 5,
          "observedMean": 5.286553,
          "sd": 1.976952
        },
        {
          "mean": 5,
          "observedMean": 5.368025,
          "sd": 1.941169
        },
        {
          "mean": 5,
          "observedMean": 5.456015,
          "sd": 1.901211
        },
        {
          "mean": 5,
          "observedMean": 5.533794,
          "sd": 1.872688
        },
        {
          "mean": 5,
          "observedMean": 5.611831,
          "sd": 1.83817
        },
        {
          "mean": 5,
          "observedMean": 5.686939,
          "sd": 1.810527
        },
        {
          "mean": 5,
          "observedMean": 5.766328,
          "sd": 1.777572
        },
        {
          "mean": 5,
          "observedMean": 5.850287,
          "sd": 1.752349
        },
        {
          "mean": 5,
          "observedMean": 5.905169,
          "sd": 1.729843
        },
        {
          "mean": 5,
          "observedMean": 5.961249,
          "sd": 1.708072
        },
        {
          "mean": 5,
          "observedMean": 6.013915,
          "sd": 1.693377
        },
        {
          "mean": 5,
          "observedMean": 6.058623,
          "sd": 1.671667
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.085096,
      "sd": 1.688014,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043035,
          "sd": 2.202419
        },
        {
          "mean": 5,
          "observedMean": 5.065671,
          "sd": 2.164904
        },
        {
          "mean": 5,
          "observedMean": 5.088283,
          "sd": 2.127087
        },
        {
          "mean": 5,
          "observedMean": 5.127252,
          "sd": 2.092596
        },
        {
          "mean": 5,
          "observedMean": 5.155791,
          "sd": 2.064614
        },
        {
          "mean": 5,
          "observedMean": 5.169278,
          "sd": 2.035475
        },
        {
          "mean": 5,
          "observedMean": 5.240486,
          "sd": 2.001431
        },
        {
          "mean": 5,
          "observedMean": 5.326385,
          "sd": 1.970694
        },
        {
          "mean": 5,
          "observedMean": 5.405678,
          "sd": 1.939828
        },
        {
          "mean": 5,
          "observedMean": 5.483779,
          "sd": 1.905806
        },
        {
          "mean": 5,
          "observedMean": 5.562825,
          "sd": 1.880769
        },
        {
          "mean": 5,
          "observedMean": 5.640184,
          "sd": 1.857211
        },
        {
          "mean": 5,
          "observedMean": 5.71373,
          "sd": 1.827438
        },
        {
          "mean": 5,
          "observedMean": 5.785902,
          "sd": 1.803535
        },
        {
          "mean": 5,
          "observedMean": 5.85137,
          "sd": 1.778291
        },
        {
          "mean": 5,
          "observedMean": 5.917152,
          "sd": 1.754443
        },
        {
          "mean": 5,
          "observedMean": 5.982869,
          "sd": 1.734811
        },
        {
          "mean": 5,
          "observedMean": 6.046884,
          "sd": 1.714842
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.001143,
      "sd": 0.685638,
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
          "observedMean": 4.885165,
          "sd": 1.882191
        },
        {
          "mean": 5,
          "observedMean": 4.883912,
          "sd": 1.749452
        },
        {
          "mean": 5,
          "observedMean": 4.921672,
          "sd": 1.622581
        },
        {
          "mean": 5,
          "observedMean": 4.955634,
          "sd": 1.509958
        },
        {
          "mean": 5,
          "observedMean": 4.973869,
          "sd": 1.406026
        },
        {
          "mean": 5,
          "observedMean": 4.990991,
          "sd": 1.310709
        },
        {
          "mean": 5,
          "observedMean": 5.006621,
          "sd": 1.224842
        },
        {
          "mean": 5,
          "observedMean": 5.022189,
          "sd": 1.142941
        },
        {
          "mean": 5,
          "observedMean": 5.035079,
          "sd": 1.067443
        },
        {
          "mean": 5,
          "observedMean": 5.04966,
          "sd": 1.002383
        },
        {
          "mean": 5,
          "observedMean": 5.061128,
          "sd": 0.939231
        },
        {
          "mean": 5,
          "observedMean": 5.07113,
          "sd": 0.87889
        },
        {
          "mean": 5,
          "observedMean": 5.050821,
          "sd": 0.836944
        },
        {
          "mean": 5,
          "observedMean": 5.037401,
          "sd": 0.794988
        },
        {
          "mean": 5,
          "observedMean": 5.023184,
          "sd": 0.755626
        },
        {
          "mean": 5,
          "observedMean": 5.012813,
          "sd": 0.720431
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.083488,
      "sd": 0.837467,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981425,
          "sd": 2.23032
        },
        {
          "mean": 5,
          "observedMean": 5.063613,
          "sd": 2.014977
        },
        {
          "mean": 5,
          "observedMean": 5.131846,
          "sd": 1.827336
        },
        {
          "mean": 5,
          "observedMean": 5.101225,
          "sd": 1.644882
        },
        {
          "mean": 5,
          "observedMean": 5.122079,
          "sd": 1.489251
        },
        {
          "mean": 5,
          "observedMean": 5.140402,
          "sd": 1.35811
        },
        {
          "mean": 5,
          "observedMean": 5.135824,
          "sd": 1.243942
        },
        {
          "mean": 5,
          "observedMean": 5.117323,
          "sd": 1.15025
        },
        {
          "mean": 5,
          "observedMean": 5.099801,
          "sd": 1.069382
        },
        {
          "mean": 5,
          "observedMean": 5.085811,
          "sd": 1.019898
        },
        {
          "mean": 5,
          "observedMean": 5.069701,
          "sd": 0.962026
        },
        {
          "mean": 5,
          "observedMean": 5.062006,
          "sd": 0.917642
        },
        {
          "mean": 5,
          "observedMean": 5.067906,
          "sd": 0.873769
        },
        {
          "mean": 5,
          "observedMean": 5.07005,
          "sd": 0.848494
        },
        {
          "mean": 5,
          "observedMean": 5.070529,
          "sd": 0.843833
        },
        {
          "mean": 5,
          "observedMean": 5.071445,
          "sd": 0.843782
        },
        {
          "mean": 5,
          "observedMean": 5.086431,
          "sd": 0.837954
        },
        {
          "mean": 5,
          "observedMean": 5.082619,
          "sd": 0.841895
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.424564,
      "sd": 3.453608,
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
          "mean": 36.77276,
          "sd": 1.625212
        },
        {
          "mean": 39.551151,
          "sd": 1.790573
        },
        {
          "mean": 42.113942,
          "sd": 1.94332
        },
        {
          "mean": 44.603962,
          "sd": 2.084262
        },
        {
          "mean": 47.061699,
          "sd": 2.232524
        },
        {
          "mean": 49.422147,
          "sd": 2.369171
        },
        {
          "mean": 51.611076,
          "sd": 2.49781
        },
        {
          "mean": 53.608527,
          "sd": 2.624742
        },
        {
          "mean": 55.559125,
          "sd": 2.764903
        },
        {
          "mean": 57.780976,
          "sd": 2.961826
        },
        {
          "mean": 60.522218,
          "sd": 3.23481
        },
        {
          "mean": 63.42079,
          "sd": 3.430462
        },
        {
          "mean": 65.838822,
          "sd": 3.491949
        },
        {
          "mean": 67.458977,
          "sd": 3.472309
        },
        {
          "mean": 68.247137,
          "sd": 3.452981
        }
      ]
    },
    "female": {
      "mean": 63.266271,
      "sd": 3.043618,
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
          "mean": 36.451227,
          "sd": 1.602182
        },
        {
          "mean": 39.067173,
          "sd": 1.750681
        },
        {
          "mean": 41.71459,
          "sd": 1.898508
        },
        {
          "mean": 44.424607,
          "sd": 2.053457
        },
        {
          "mean": 47.045282,
          "sd": 2.196667
        },
        {
          "mean": 49.398882,
          "sd": 2.324339
        },
        {
          "mean": 51.469693,
          "sd": 2.44269
        },
        {
          "mean": 53.471561,
          "sd": 2.566085
        },
        {
          "mean": 55.840489,
          "sd": 2.762686
        },
        {
          "mean": 58.552131,
          "sd": 2.976066
        },
        {
          "mean": 60.91061,
          "sd": 3.080405
        },
        {
          "mean": 62.421971,
          "sd": 3.074368
        },
        {
          "mean": 63.108518,
          "sd": 3.053088
        },
        {
          "mean": 63.260025,
          "sd": 3.044915
        },
        {
          "mean": 63.266434,
          "sd": 3.042858
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
      "mean": 5.884591,
      "sd": 1.801245
    },
    {
      "mean": 5.982561,
      "sd": 1.779429
    },
    {
      "mean": 6.073637,
      "sd": 1.757204
    },
    {
      "mean": 6.16037,
      "sd": 1.731055
    },
    {
      "mean": 6.24963,
      "sd": 1.71004
    },
    {
      "mean": 6.333285,
      "sd": 1.693499
    },
    {
      "mean": 6.41726,
      "sd": 1.677089
    },
    {
      "mean": 6.50211,
      "sd": 1.653922
    },
    {
      "mean": 6.58524,
      "sd": 1.635402
    }
  ]
};
