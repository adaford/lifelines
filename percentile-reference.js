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
      "observedMean": 6.012677,
      "sd": 1.645062,
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
          "observedMean": 5.523073,
          "sd": 1.961888
        },
        {
          "mean": 5,
          "observedMean": 5.582905,
          "sd": 1.93008
        },
        {
          "mean": 5,
          "observedMean": 5.647027,
          "sd": 1.895711
        },
        {
          "mean": 5,
          "observedMean": 5.712052,
          "sd": 1.863253
        },
        {
          "mean": 5,
          "observedMean": 5.775631,
          "sd": 1.824895
        },
        {
          "mean": 5,
          "observedMean": 5.833222,
          "sd": 1.800536
        },
        {
          "mean": 5,
          "observedMean": 5.891582,
          "sd": 1.769524
        },
        {
          "mean": 5,
          "observedMean": 5.945304,
          "sd": 1.739421
        },
        {
          "mean": 5,
          "observedMean": 5.971154,
          "sd": 1.717175
        },
        {
          "mean": 5,
          "observedMean": 5.986193,
          "sd": 1.695021
        },
        {
          "mean": 5,
          "observedMean": 6.003684,
          "sd": 1.672583
        },
        {
          "mean": 5,
          "observedMean": 6.011613,
          "sd": 1.653359
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.976842,
      "sd": 1.793147,
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
          "observedMean": 5.000196,
          "sd": 2.031543
        },
        {
          "mean": 5,
          "observedMean": 5.000913,
          "sd": 2.00942
        },
        {
          "mean": 5,
          "observedMean": 4.998778,
          "sd": 1.988953
        },
        {
          "mean": 5,
          "observedMean": 4.99795,
          "sd": 1.964576
        },
        {
          "mean": 5,
          "observedMean": 4.995528,
          "sd": 1.940719
        },
        {
          "mean": 5,
          "observedMean": 4.997787,
          "sd": 1.920684
        },
        {
          "mean": 5,
          "observedMean": 5.001089,
          "sd": 1.902691
        },
        {
          "mean": 5,
          "observedMean": 5.001776,
          "sd": 1.884434
        },
        {
          "mean": 5,
          "observedMean": 4.999208,
          "sd": 1.865612
        },
        {
          "mean": 5,
          "observedMean": 4.992285,
          "sd": 1.847516
        },
        {
          "mean": 5,
          "observedMean": 4.990924,
          "sd": 1.828134
        },
        {
          "mean": 5,
          "observedMean": 4.986496,
          "sd": 1.813073
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.874895,
      "sd": 1.944285,
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
          "observedMean": 4.897377,
          "sd": 1.991535
        },
        {
          "mean": 5,
          "observedMean": 4.88996,
          "sd": 1.987061
        },
        {
          "mean": 5,
          "observedMean": 4.883068,
          "sd": 1.98222
        },
        {
          "mean": 5,
          "observedMean": 4.876937,
          "sd": 1.977985
        },
        {
          "mean": 5,
          "observedMean": 4.869887,
          "sd": 1.973836
        },
        {
          "mean": 5,
          "observedMean": 4.861336,
          "sd": 1.968538
        },
        {
          "mean": 5,
          "observedMean": 4.854067,
          "sd": 1.963695
        },
        {
          "mean": 5,
          "observedMean": 4.858971,
          "sd": 1.959984
        },
        {
          "mean": 5,
          "observedMean": 4.86275,
          "sd": 1.956392
        },
        {
          "mean": 5,
          "observedMean": 4.865654,
          "sd": 1.952548
        },
        {
          "mean": 5,
          "observedMean": 4.870602,
          "sd": 1.948104
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.540924,
      "sd": 1.671602,
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
          "observedMean": 5.058858,
          "sd": 1.949318
        },
        {
          "mean": 5,
          "observedMean": 5.009157,
          "sd": 1.91256
        },
        {
          "mean": 5,
          "observedMean": 4.961436,
          "sd": 1.871314
        },
        {
          "mean": 5,
          "observedMean": 4.918202,
          "sd": 1.838758
        },
        {
          "mean": 5,
          "observedMean": 4.876054,
          "sd": 1.812296
        },
        {
          "mean": 5,
          "observedMean": 4.843408,
          "sd": 1.791697
        },
        {
          "mean": 5,
          "observedMean": 4.803174,
          "sd": 1.763058
        },
        {
          "mean": 5,
          "observedMean": 4.743109,
          "sd": 1.741708
        },
        {
          "mean": 5,
          "observedMean": 4.697313,
          "sd": 1.720262
        },
        {
          "mean": 5,
          "observedMean": 4.645544,
          "sd": 1.705031
        },
        {
          "mean": 5,
          "observedMean": 4.599736,
          "sd": 1.686125
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.625865,
      "sd": 1.707568,
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
          "observedMean": 5.110153,
          "sd": 2.001351
        },
        {
          "mean": 5,
          "observedMean": 5.064532,
          "sd": 1.968505
        },
        {
          "mean": 5,
          "observedMean": 5.027369,
          "sd": 1.931733
        },
        {
          "mean": 5,
          "observedMean": 4.982397,
          "sd": 1.8982
        },
        {
          "mean": 5,
          "observedMean": 4.936657,
          "sd": 1.865529
        },
        {
          "mean": 5,
          "observedMean": 4.897372,
          "sd": 1.837979
        },
        {
          "mean": 5,
          "observedMean": 4.858677,
          "sd": 1.816832
        },
        {
          "mean": 5,
          "observedMean": 4.819155,
          "sd": 1.790199
        },
        {
          "mean": 5,
          "observedMean": 4.776225,
          "sd": 1.766844
        },
        {
          "mean": 5,
          "observedMean": 4.728314,
          "sd": 1.746058
        },
        {
          "mean": 5,
          "observedMean": 4.690949,
          "sd": 1.728771
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.9907,
      "sd": 0.693788,
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
          "observedMean": 4.982774,
          "sd": 1.305687
        },
        {
          "mean": 5,
          "observedMean": 4.998873,
          "sd": 1.218105
        },
        {
          "mean": 5,
          "observedMean": 5.011502,
          "sd": 1.136753
        },
        {
          "mean": 5,
          "observedMean": 5.024862,
          "sd": 1.060103
        },
        {
          "mean": 5,
          "observedMean": 5.037316,
          "sd": 0.992256
        },
        {
          "mean": 5,
          "observedMean": 5.048021,
          "sd": 0.928814
        },
        {
          "mean": 5,
          "observedMean": 5.059233,
          "sd": 0.869182
        },
        {
          "mean": 5,
          "observedMean": 5.05046,
          "sd": 0.824221
        },
        {
          "mean": 5,
          "observedMean": 5.035989,
          "sd": 0.787177
        },
        {
          "mean": 5,
          "observedMean": 5.021203,
          "sd": 0.756661
        },
        {
          "mean": 5,
          "observedMean": 5.007486,
          "sd": 0.724747
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.070423,
      "sd": 0.792604,
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
          "observedMean": 5.210166,
          "sd": 1.14545
        },
        {
          "mean": 5,
          "observedMean": 5.19799,
          "sd": 1.069179
        },
        {
          "mean": 5,
          "observedMean": 5.176688,
          "sd": 1.000897
        },
        {
          "mean": 5,
          "observedMean": 5.157017,
          "sd": 0.947494
        },
        {
          "mean": 5,
          "observedMean": 5.148403,
          "sd": 0.893564
        },
        {
          "mean": 5,
          "observedMean": 5.144696,
          "sd": 0.858383
        },
        {
          "mean": 5,
          "observedMean": 5.137593,
          "sd": 0.834689
        },
        {
          "mean": 5,
          "observedMean": 5.129791,
          "sd": 0.820946
        },
        {
          "mean": 5,
          "observedMean": 5.112612,
          "sd": 0.810498
        },
        {
          "mean": 5,
          "observedMean": 5.096978,
          "sd": 0.803299
        },
        {
          "mean": 5,
          "observedMean": 5.090518,
          "sd": 0.801091
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.251985,
      "sd": 3.059065,
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
          "mean": 47.766375,
          "sd": 1.940056
        },
        {
          "mean": 50.154168,
          "sd": 2.055185
        },
        {
          "mean": 52.36186,
          "sd": 2.172781
        },
        {
          "mean": 54.369251,
          "sd": 2.288778
        },
        {
          "mean": 56.326953,
          "sd": 2.420401
        },
        {
          "mean": 58.567376,
          "sd": 2.622136
        },
        {
          "mean": 61.328371,
          "sd": 2.886274
        },
        {
          "mean": 64.247159,
          "sd": 3.068873
        },
        {
          "mean": 66.671872,
          "sd": 3.120385
        },
        {
          "mean": 68.294962,
          "sd": 3.086747
        },
        {
          "mean": 69.072296,
          "sd": 3.058667
        }
      ]
    },
    "female": {
      "mean": 64.121984,
      "sd": 2.761083,
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
          "mean": 50.167111,
          "sd": 2.048471
        },
        {
          "mean": 52.253382,
          "sd": 2.158979
        },
        {
          "mean": 54.275591,
          "sd": 2.291114
        },
        {
          "mean": 56.669748,
          "sd": 2.493434
        },
        {
          "mean": 59.410106,
          "sd": 2.720444
        },
        {
          "mean": 61.77235,
          "sd": 2.821857
        },
        {
          "mean": 63.282914,
          "sd": 2.801568
        },
        {
          "mean": 63.966029,
          "sd": 2.776295
        },
        {
          "mean": 64.11464,
          "sd": 2.762808
        },
        {
          "mean": 64.122043,
          "sd": 2.760389
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
      "mean": 5.688197,
      "sd": 1.852002
    },
    {
      "mean": 5.78879,
      "sd": 1.833177
    },
    {
      "mean": 5.878305,
      "sd": 1.815671
    },
    {
      "mean": 5.973119,
      "sd": 1.792396
    },
    {
      "mean": 6.065898,
      "sd": 1.770767
    },
    {
      "mean": 6.159097,
      "sd": 1.746236
    },
    {
      "mean": 6.2442,
      "sd": 1.731395
    },
    {
      "mean": 6.326451,
      "sd": 1.714522
    },
    {
      "mean": 6.408971,
      "sd": 1.699868
    },
    {
      "mean": 6.494205,
      "sd": 1.678132
    },
    {
      "mean": 6.571178,
      "sd": 1.662908
    }
  ]
};
