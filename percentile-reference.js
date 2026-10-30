// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1989,
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
      3980,
      3977,
      3977,
      3977,
      3976,
      3976,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3974,
      3973,
      3972,
      3971,
      3969
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
        "intelligence": -0.095118,
        "strength": -0.018873,
        "social": -0.087305,
        "creativity": -0.097331
      },
      "wellbeingTarget": {
        "health": 5.144981,
        "stability": 4.321297
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
      "observedMean": 5.002026,
      "sd": 2.595024,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04077,
          "sd": 2.334487
        },
        {
          "mean": 5,
          "observedMean": 5.043812,
          "sd": 2.334857
        },
        {
          "mean": 5,
          "observedMean": 5.04746,
          "sd": 2.333858
        },
        {
          "mean": 5,
          "observedMean": 5.017543,
          "sd": 2.34427
        },
        {
          "mean": 5,
          "observedMean": 4.944788,
          "sd": 2.334925
        },
        {
          "mean": 5,
          "observedMean": 4.858046,
          "sd": 2.321999
        },
        {
          "mean": 5,
          "observedMean": 4.917377,
          "sd": 2.390352
        },
        {
          "mean": 5,
          "observedMean": 5.007049,
          "sd": 2.432428
        },
        {
          "mean": 5,
          "observedMean": 5.023364,
          "sd": 2.447518
        },
        {
          "mean": 5,
          "observedMean": 5.047253,
          "sd": 2.465785
        },
        {
          "mean": 5,
          "observedMean": 5.070345,
          "sd": 2.487619
        },
        {
          "mean": 5,
          "observedMean": 5.088712,
          "sd": 2.507089
        },
        {
          "mean": 5,
          "observedMean": 5.115283,
          "sd": 2.524302
        },
        {
          "mean": 5,
          "observedMean": 5.132584,
          "sd": 2.532731
        },
        {
          "mean": 5,
          "observedMean": 5.099293,
          "sd": 2.551967
        },
        {
          "mean": 5,
          "observedMean": 5.070068,
          "sd": 2.570668
        },
        {
          "mean": 5,
          "observedMean": 5.04852,
          "sd": 2.568531
        },
        {
          "mean": 5,
          "observedMean": 5.035135,
          "sd": 2.587915
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.001459,
      "sd": 2.364671,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.031165,
          "sd": 2.357187
        },
        {
          "mean": 5,
          "observedMean": 5.025789,
          "sd": 2.372083
        },
        {
          "mean": 5,
          "observedMean": 5.039535,
          "sd": 2.372954
        },
        {
          "mean": 5,
          "observedMean": 4.942444,
          "sd": 2.415741
        },
        {
          "mean": 5,
          "observedMean": 4.926832,
          "sd": 2.39651
        },
        {
          "mean": 5,
          "observedMean": 4.919842,
          "sd": 2.390707
        },
        {
          "mean": 5,
          "observedMean": 4.91837,
          "sd": 2.392612
        },
        {
          "mean": 5,
          "observedMean": 4.93765,
          "sd": 2.397542
        },
        {
          "mean": 5,
          "observedMean": 4.953769,
          "sd": 2.398988
        },
        {
          "mean": 5,
          "observedMean": 4.963225,
          "sd": 2.404376
        },
        {
          "mean": 5,
          "observedMean": 4.984445,
          "sd": 2.408122
        },
        {
          "mean": 5,
          "observedMean": 4.982206,
          "sd": 2.410054
        },
        {
          "mean": 5,
          "observedMean": 5.005434,
          "sd": 2.416054
        },
        {
          "mean": 5,
          "observedMean": 5.019907,
          "sd": 2.414469
        },
        {
          "mean": 5,
          "observedMean": 5.03969,
          "sd": 2.378238
        },
        {
          "mean": 5,
          "observedMean": 5.021543,
          "sd": 2.379307
        },
        {
          "mean": 5,
          "observedMean": 5.015174,
          "sd": 2.379201
        },
        {
          "mean": 5,
          "observedMean": 5.00385,
          "sd": 2.376872
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.954329,
      "sd": 2.027518,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938937,
          "sd": 2.023751
        },
        {
          "mean": 5,
          "observedMean": 4.93876,
          "sd": 2.024788
        },
        {
          "mean": 5,
          "observedMean": 4.937493,
          "sd": 2.024193
        },
        {
          "mean": 5,
          "observedMean": 4.936668,
          "sd": 2.025071
        },
        {
          "mean": 5,
          "observedMean": 4.934701,
          "sd": 2.025676
        },
        {
          "mean": 5,
          "observedMean": 4.934007,
          "sd": 2.025645
        },
        {
          "mean": 5,
          "observedMean": 4.932141,
          "sd": 2.026362
        },
        {
          "mean": 5,
          "observedMean": 4.932179,
          "sd": 2.026075
        },
        {
          "mean": 5,
          "observedMean": 4.932337,
          "sd": 2.025755
        },
        {
          "mean": 5,
          "observedMean": 4.930933,
          "sd": 2.026006
        },
        {
          "mean": 5,
          "observedMean": 4.930448,
          "sd": 2.025957
        },
        {
          "mean": 5,
          "observedMean": 4.929114,
          "sd": 2.025148
        },
        {
          "mean": 5,
          "observedMean": 4.927197,
          "sd": 2.025288
        },
        {
          "mean": 5,
          "observedMean": 4.933158,
          "sd": 2.024908
        },
        {
          "mean": 5,
          "observedMean": 4.938354,
          "sd": 2.027371
        },
        {
          "mean": 5,
          "observedMean": 4.943552,
          "sd": 2.029442
        },
        {
          "mean": 5,
          "observedMean": 4.947985,
          "sd": 2.028813
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.008476,
      "sd": 2.313679,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.997637,
          "sd": 2.359861
        },
        {
          "mean": 5,
          "observedMean": 4.983354,
          "sd": 2.334551
        },
        {
          "mean": 5,
          "observedMean": 4.979208,
          "sd": 2.314693
        },
        {
          "mean": 5,
          "observedMean": 4.942633,
          "sd": 2.32507
        },
        {
          "mean": 5,
          "observedMean": 4.879552,
          "sd": 2.310002
        },
        {
          "mean": 5,
          "observedMean": 4.783747,
          "sd": 2.29167
        },
        {
          "mean": 5,
          "observedMean": 4.768307,
          "sd": 2.290259
        },
        {
          "mean": 5,
          "observedMean": 4.75567,
          "sd": 2.331038
        },
        {
          "mean": 5,
          "observedMean": 4.79519,
          "sd": 2.34063
        },
        {
          "mean": 5,
          "observedMean": 4.823074,
          "sd": 2.322165
        },
        {
          "mean": 5,
          "observedMean": 4.845728,
          "sd": 2.312552
        },
        {
          "mean": 5,
          "observedMean": 4.855298,
          "sd": 2.309596
        },
        {
          "mean": 5,
          "observedMean": 4.868,
          "sd": 2.308032
        },
        {
          "mean": 5,
          "observedMean": 4.894156,
          "sd": 2.30377
        },
        {
          "mean": 5,
          "observedMean": 4.897637,
          "sd": 2.319262
        },
        {
          "mean": 5,
          "observedMean": 4.925671,
          "sd": 2.314365
        },
        {
          "mean": 5,
          "observedMean": 4.949819,
          "sd": 2.314764
        },
        {
          "mean": 5,
          "observedMean": 4.98926,
          "sd": 2.319384
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.003522,
      "sd": 2.552535,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.014382,
          "sd": 2.350248
        },
        {
          "mean": 5,
          "observedMean": 4.980565,
          "sd": 2.349965
        },
        {
          "mean": 5,
          "observedMean": 4.946362,
          "sd": 2.350709
        },
        {
          "mean": 5,
          "observedMean": 4.954491,
          "sd": 2.373051
        },
        {
          "mean": 5,
          "observedMean": 4.933716,
          "sd": 2.386787
        },
        {
          "mean": 5,
          "observedMean": 4.877055,
          "sd": 2.383126
        },
        {
          "mean": 5,
          "observedMean": 4.916323,
          "sd": 2.437996
        },
        {
          "mean": 5,
          "observedMean": 4.972395,
          "sd": 2.479931
        },
        {
          "mean": 5,
          "observedMean": 4.978267,
          "sd": 2.487256
        },
        {
          "mean": 5,
          "observedMean": 4.971791,
          "sd": 2.487712
        },
        {
          "mean": 5,
          "observedMean": 4.978342,
          "sd": 2.491588
        },
        {
          "mean": 5,
          "observedMean": 4.984757,
          "sd": 2.502428
        },
        {
          "mean": 5,
          "observedMean": 4.99318,
          "sd": 2.504809
        },
        {
          "mean": 5,
          "observedMean": 4.998277,
          "sd": 2.505978
        },
        {
          "mean": 5,
          "observedMean": 4.997728,
          "sd": 2.509045
        },
        {
          "mean": 5,
          "observedMean": 5.001714,
          "sd": 2.51034
        },
        {
          "mean": 5,
          "observedMean": 5.006722,
          "sd": 2.520589
        },
        {
          "mean": 5,
          "observedMean": 5.020141,
          "sd": 2.54039
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.001015,
      "sd": 0.907465,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.901867,
          "sd": 2.360057
        },
        {
          "mean": 5,
          "observedMean": 4.791877,
          "sd": 2.279477
        },
        {
          "mean": 5,
          "observedMean": 4.817355,
          "sd": 2.155377
        },
        {
          "mean": 5,
          "observedMean": 4.768051,
          "sd": 2.075184
        },
        {
          "mean": 5,
          "observedMean": 4.904297,
          "sd": 1.932841
        },
        {
          "mean": 5,
          "observedMean": 4.935397,
          "sd": 1.826262
        },
        {
          "mean": 5,
          "observedMean": 4.92911,
          "sd": 1.738208
        },
        {
          "mean": 5,
          "observedMean": 4.950101,
          "sd": 1.627999
        },
        {
          "mean": 5,
          "observedMean": 4.974558,
          "sd": 1.527009
        },
        {
          "mean": 5,
          "observedMean": 4.980765,
          "sd": 1.443726
        },
        {
          "mean": 5,
          "observedMean": 5.003323,
          "sd": 1.356119
        },
        {
          "mean": 5,
          "observedMean": 5.004979,
          "sd": 1.296548
        },
        {
          "mean": 5,
          "observedMean": 5.028317,
          "sd": 1.215951
        },
        {
          "mean": 5,
          "observedMean": 5.039419,
          "sd": 1.150077
        },
        {
          "mean": 5,
          "observedMean": 5.034477,
          "sd": 1.096896
        },
        {
          "mean": 5,
          "observedMean": 5.011782,
          "sd": 1.039365
        },
        {
          "mean": 5,
          "observedMean": 5.001002,
          "sd": 0.994831
        },
        {
          "mean": 5,
          "observedMean": 4.997333,
          "sd": 0.951716
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.997828,
      "sd": 0.863981,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981502,
          "sd": 2.387351
        },
        {
          "mean": 5,
          "observedMean": 4.990676,
          "sd": 2.272048
        },
        {
          "mean": 5,
          "observedMean": 5.071368,
          "sd": 2.12743
        },
        {
          "mean": 5,
          "observedMean": 5.020533,
          "sd": 1.981546
        },
        {
          "mean": 5,
          "observedMean": 5.028798,
          "sd": 1.800486
        },
        {
          "mean": 5,
          "observedMean": 4.930827,
          "sd": 1.659557
        },
        {
          "mean": 5,
          "observedMean": 4.85001,
          "sd": 1.59112
        },
        {
          "mean": 5,
          "observedMean": 4.860209,
          "sd": 1.497595
        },
        {
          "mean": 5,
          "observedMean": 4.889618,
          "sd": 1.394948
        },
        {
          "mean": 5,
          "observedMean": 4.933381,
          "sd": 1.30912
        },
        {
          "mean": 5,
          "observedMean": 4.958269,
          "sd": 1.231418
        },
        {
          "mean": 5,
          "observedMean": 4.970553,
          "sd": 1.164806
        },
        {
          "mean": 5,
          "observedMean": 4.989107,
          "sd": 1.100175
        },
        {
          "mean": 5,
          "observedMean": 5.003859,
          "sd": 1.031129
        },
        {
          "mean": 5,
          "observedMean": 4.962418,
          "sd": 0.993475
        },
        {
          "mean": 5,
          "observedMean": 4.92785,
          "sd": 0.963732
        },
        {
          "mean": 5,
          "observedMean": 4.940934,
          "sd": 0.935364
        },
        {
          "mean": 5,
          "observedMean": 4.972337,
          "sd": 0.898602
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.191388,
      "sd": 3.546621,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.425178,
          "sd": 1.210338
        },
        {
          "mean": 33.477131,
          "sd": 1.45145
        },
        {
          "mean": 36.707146,
          "sd": 1.652387
        },
        {
          "mean": 39.46601,
          "sd": 1.825928
        },
        {
          "mean": 42.015146,
          "sd": 1.986864
        },
        {
          "mean": 44.50102,
          "sd": 2.140936
        },
        {
          "mean": 46.943658,
          "sd": 2.293821
        },
        {
          "mean": 49.288528,
          "sd": 2.432803
        },
        {
          "mean": 51.467392,
          "sd": 2.569084
        },
        {
          "mean": 53.454337,
          "sd": 2.701717
        },
        {
          "mean": 55.391945,
          "sd": 2.841441
        },
        {
          "mean": 57.607749,
          "sd": 3.039251
        },
        {
          "mean": 60.333658,
          "sd": 3.307801
        },
        {
          "mean": 63.222633,
          "sd": 3.509298
        },
        {
          "mean": 65.627407,
          "sd": 3.58421
        },
        {
          "mean": 67.231207,
          "sd": 3.571737
        },
        {
          "mean": 68.013258,
          "sd": 3.548291
        }
      ]
    },
    "female": {
      "mean": 63.060975,
      "sd": 3.14088,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.829377,
          "sd": 1.190134
        },
        {
          "mean": 32.987358,
          "sd": 1.423953
        },
        {
          "mean": 36.395179,
          "sd": 1.624104
        },
        {
          "mean": 38.994006,
          "sd": 1.781574
        },
        {
          "mean": 41.628565,
          "sd": 1.936766
        },
        {
          "mean": 44.329471,
          "sd": 2.094428
        },
        {
          "mean": 46.916786,
          "sd": 2.246423
        },
        {
          "mean": 49.252635,
          "sd": 2.380385
        },
        {
          "mean": 51.317844,
          "sd": 2.503676
        },
        {
          "mean": 53.318861,
          "sd": 2.637789
        },
        {
          "mean": 55.672826,
          "sd": 2.837762
        },
        {
          "mean": 58.378156,
          "sd": 3.062576
        },
        {
          "mean": 60.72333,
          "sd": 3.172268
        },
        {
          "mean": 62.222147,
          "sd": 3.167396
        },
        {
          "mean": 62.902148,
          "sd": 3.151187
        },
        {
          "mean": 63.050091,
          "sd": 3.14228
        },
        {
          "mean": 63.058542,
          "sd": 3.140452
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
      "mean": 5.078347,
      "sd": 1.975148
    },
    {
      "mean": 5.180978,
      "sd": 1.958884
    },
    {
      "mean": 5.282859,
      "sd": 1.933258
    },
    {
      "mean": 5.3844,
      "sd": 1.911766
    },
    {
      "mean": 5.489867,
      "sd": 1.890788
    },
    {
      "mean": 5.590677,
      "sd": 1.87409
    },
    {
      "mean": 5.691532,
      "sd": 1.853857
    },
    {
      "mean": 5.790893,
      "sd": 1.827401
    },
    {
      "mean": 5.888609,
      "sd": 1.806338
    },
    {
      "mean": 5.979595,
      "sd": 1.78963
    },
    {
      "mean": 6.067623,
      "sd": 1.769438
    },
    {
      "mean": 6.155203,
      "sd": 1.753556
    },
    {
      "mean": 6.250297,
      "sd": 1.728369
    },
    {
      "mean": 6.338357,
      "sd": 1.703363
    },
    {
      "mean": 6.41933,
      "sd": 1.682936
    },
    {
      "mean": 6.499295,
      "sd": 1.662164
    },
    {
      "mean": 6.581932,
      "sd": 1.64793
    }
  ]
};
