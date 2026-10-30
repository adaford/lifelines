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
        "intelligence": -0.095658,
        "strength": -0.018549,
        "social": -0.085243,
        "creativity": -0.096566
      },
      "wellbeingTarget": {
        "health": 5.150338,
        "stability": 4.224217
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
      "observedMean": 4.999826,
      "sd": 2.605319,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04077,
          "sd": 2.334487
        },
        {
          "mean": 5,
          "observedMean": 5.065864,
          "sd": 2.337309
        },
        {
          "mean": 5,
          "observedMean": 5.091378,
          "sd": 2.338147
        },
        {
          "mean": 5,
          "observedMean": 5.060214,
          "sd": 2.348311
        },
        {
          "mean": 5,
          "observedMean": 4.982002,
          "sd": 2.340451
        },
        {
          "mean": 5,
          "observedMean": 4.890865,
          "sd": 2.327634
        },
        {
          "mean": 5,
          "observedMean": 4.949814,
          "sd": 2.395968
        },
        {
          "mean": 5,
          "observedMean": 5.035346,
          "sd": 2.439252
        },
        {
          "mean": 5,
          "observedMean": 5.04917,
          "sd": 2.45339
        },
        {
          "mean": 5,
          "observedMean": 5.06963,
          "sd": 2.473903
        },
        {
          "mean": 5,
          "observedMean": 5.088888,
          "sd": 2.495821
        },
        {
          "mean": 5,
          "observedMean": 5.103434,
          "sd": 2.513984
        },
        {
          "mean": 5,
          "observedMean": 5.127117,
          "sd": 2.533303
        },
        {
          "mean": 5,
          "observedMean": 5.13961,
          "sd": 2.542297
        },
        {
          "mean": 5,
          "observedMean": 5.106195,
          "sd": 2.561388
        },
        {
          "mean": 5,
          "observedMean": 5.075975,
          "sd": 2.581653
        },
        {
          "mean": 5,
          "observedMean": 5.051465,
          "sd": 2.579789
        },
        {
          "mean": 5,
          "observedMean": 5.035497,
          "sd": 2.59795
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.99325,
      "sd": 2.364775,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.031165,
          "sd": 2.357187
        },
        {
          "mean": 5,
          "observedMean": 5.026085,
          "sd": 2.372085
        },
        {
          "mean": 5,
          "observedMean": 5.040096,
          "sd": 2.373115
        },
        {
          "mean": 5,
          "observedMean": 4.94342,
          "sd": 2.415722
        },
        {
          "mean": 5,
          "observedMean": 4.924048,
          "sd": 2.397277
        },
        {
          "mean": 5,
          "observedMean": 4.912319,
          "sd": 2.391595
        },
        {
          "mean": 5,
          "observedMean": 4.912591,
          "sd": 2.393829
        },
        {
          "mean": 5,
          "observedMean": 4.931605,
          "sd": 2.398523
        },
        {
          "mean": 5,
          "observedMean": 4.947633,
          "sd": 2.400329
        },
        {
          "mean": 5,
          "observedMean": 4.957102,
          "sd": 2.405555
        },
        {
          "mean": 5,
          "observedMean": 4.976196,
          "sd": 2.408117
        },
        {
          "mean": 5,
          "observedMean": 4.975243,
          "sd": 2.411343
        },
        {
          "mean": 5,
          "observedMean": 4.99962,
          "sd": 2.417127
        },
        {
          "mean": 5,
          "observedMean": 5.01245,
          "sd": 2.415008
        },
        {
          "mean": 5,
          "observedMean": 5.031319,
          "sd": 2.377633
        },
        {
          "mean": 5,
          "observedMean": 5.014337,
          "sd": 2.37936
        },
        {
          "mean": 5,
          "observedMean": 5.009572,
          "sd": 2.380528
        },
        {
          "mean": 5,
          "observedMean": 4.997857,
          "sd": 2.377075
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.954389,
      "sd": 2.027454,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.93895,
          "sd": 2.023735
        },
        {
          "mean": 5,
          "observedMean": 4.93872,
          "sd": 2.024793
        },
        {
          "mean": 5,
          "observedMean": 4.937503,
          "sd": 2.024212
        },
        {
          "mean": 5,
          "observedMean": 4.936787,
          "sd": 2.025094
        },
        {
          "mean": 5,
          "observedMean": 4.934869,
          "sd": 2.025709
        },
        {
          "mean": 5,
          "observedMean": 4.934085,
          "sd": 2.02567
        },
        {
          "mean": 5,
          "observedMean": 4.932181,
          "sd": 2.026265
        },
        {
          "mean": 5,
          "observedMean": 4.932118,
          "sd": 2.026126
        },
        {
          "mean": 5,
          "observedMean": 4.932269,
          "sd": 2.025853
        },
        {
          "mean": 5,
          "observedMean": 4.931026,
          "sd": 2.026093
        },
        {
          "mean": 5,
          "observedMean": 4.930501,
          "sd": 2.025991
        },
        {
          "mean": 5,
          "observedMean": 4.929177,
          "sd": 2.025123
        },
        {
          "mean": 5,
          "observedMean": 4.927275,
          "sd": 2.025319
        },
        {
          "mean": 5,
          "observedMean": 4.933518,
          "sd": 2.024951
        },
        {
          "mean": 5,
          "observedMean": 4.938749,
          "sd": 2.027153
        },
        {
          "mean": 5,
          "observedMean": 4.943776,
          "sd": 2.029295
        },
        {
          "mean": 5,
          "observedMean": 4.948262,
          "sd": 2.029189
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.98391,
      "sd": 2.31925,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.997637,
          "sd": 2.359861
        },
        {
          "mean": 5,
          "observedMean": 4.985281,
          "sd": 2.334579
        },
        {
          "mean": 5,
          "observedMean": 4.982346,
          "sd": 2.314613
        },
        {
          "mean": 5,
          "observedMean": 4.945939,
          "sd": 2.32522
        },
        {
          "mean": 5,
          "observedMean": 4.883181,
          "sd": 2.31046
        },
        {
          "mean": 5,
          "observedMean": 4.787271,
          "sd": 2.292491
        },
        {
          "mean": 5,
          "observedMean": 4.771185,
          "sd": 2.291111
        },
        {
          "mean": 5,
          "observedMean": 4.754958,
          "sd": 2.333236
        },
        {
          "mean": 5,
          "observedMean": 4.792664,
          "sd": 2.341419
        },
        {
          "mean": 5,
          "observedMean": 4.819434,
          "sd": 2.32308
        },
        {
          "mean": 5,
          "observedMean": 4.839316,
          "sd": 2.314558
        },
        {
          "mean": 5,
          "observedMean": 4.850086,
          "sd": 2.311901
        },
        {
          "mean": 5,
          "observedMean": 4.860252,
          "sd": 2.311334
        },
        {
          "mean": 5,
          "observedMean": 4.885809,
          "sd": 2.305737
        },
        {
          "mean": 5,
          "observedMean": 4.888312,
          "sd": 2.320341
        },
        {
          "mean": 5,
          "observedMean": 4.911462,
          "sd": 2.317227
        },
        {
          "mean": 5,
          "observedMean": 4.931677,
          "sd": 2.31581
        },
        {
          "mean": 5,
          "observedMean": 4.966009,
          "sd": 2.323433
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.997171,
      "sd": 2.554592,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.014382,
          "sd": 2.350248
        },
        {
          "mean": 5,
          "observedMean": 4.981387,
          "sd": 2.350048
        },
        {
          "mean": 5,
          "observedMean": 4.947858,
          "sd": 2.350823
        },
        {
          "mean": 5,
          "observedMean": 4.956621,
          "sd": 2.373121
        },
        {
          "mean": 5,
          "observedMean": 4.934891,
          "sd": 2.387383
        },
        {
          "mean": 5,
          "observedMean": 4.877067,
          "sd": 2.382949
        },
        {
          "mean": 5,
          "observedMean": 4.916134,
          "sd": 2.438403
        },
        {
          "mean": 5,
          "observedMean": 4.97162,
          "sd": 2.480684
        },
        {
          "mean": 5,
          "observedMean": 4.975577,
          "sd": 2.487643
        },
        {
          "mean": 5,
          "observedMean": 4.968609,
          "sd": 2.489448
        },
        {
          "mean": 5,
          "observedMean": 4.975849,
          "sd": 2.493703
        },
        {
          "mean": 5,
          "observedMean": 4.981733,
          "sd": 2.504789
        },
        {
          "mean": 5,
          "observedMean": 4.988249,
          "sd": 2.505748
        },
        {
          "mean": 5,
          "observedMean": 4.991693,
          "sd": 2.506215
        },
        {
          "mean": 5,
          "observedMean": 4.992934,
          "sd": 2.512091
        },
        {
          "mean": 5,
          "observedMean": 4.996849,
          "sd": 2.514377
        },
        {
          "mean": 5,
          "observedMean": 4.999293,
          "sd": 2.522927
        },
        {
          "mean": 5,
          "observedMean": 5.012372,
          "sd": 2.541827
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.00068,
      "sd": 0.908666,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.901867,
          "sd": 2.360057
        },
        {
          "mean": 5,
          "observedMean": 4.792259,
          "sd": 2.279504
        },
        {
          "mean": 5,
          "observedMean": 4.81865,
          "sd": 2.155065
        },
        {
          "mean": 5,
          "observedMean": 4.768484,
          "sd": 2.075375
        },
        {
          "mean": 5,
          "observedMean": 4.903058,
          "sd": 1.932212
        },
        {
          "mean": 5,
          "observedMean": 4.934157,
          "sd": 1.825455
        },
        {
          "mean": 5,
          "observedMean": 4.928393,
          "sd": 1.736327
        },
        {
          "mean": 5,
          "observedMean": 4.948425,
          "sd": 1.627718
        },
        {
          "mean": 5,
          "observedMean": 4.972647,
          "sd": 1.526955
        },
        {
          "mean": 5,
          "observedMean": 4.977967,
          "sd": 1.44391
        },
        {
          "mean": 5,
          "observedMean": 4.999645,
          "sd": 1.356226
        },
        {
          "mean": 5,
          "observedMean": 5.002913,
          "sd": 1.295496
        },
        {
          "mean": 5,
          "observedMean": 5.026611,
          "sd": 1.215259
        },
        {
          "mean": 5,
          "observedMean": 5.037406,
          "sd": 1.147426
        },
        {
          "mean": 5,
          "observedMean": 5.031361,
          "sd": 1.096675
        },
        {
          "mean": 5,
          "observedMean": 5.012001,
          "sd": 1.038625
        },
        {
          "mean": 5,
          "observedMean": 5.001647,
          "sd": 0.994412
        },
        {
          "mean": 5,
          "observedMean": 4.997401,
          "sd": 0.951953
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.00002,
      "sd": 0.867619,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981502,
          "sd": 2.387351
        },
        {
          "mean": 5,
          "observedMean": 5.042771,
          "sd": 2.279868
        },
        {
          "mean": 5,
          "observedMean": 5.170988,
          "sd": 2.14124
        },
        {
          "mean": 5,
          "observedMean": 5.09782,
          "sd": 1.993582
        },
        {
          "mean": 5,
          "observedMean": 5.093153,
          "sd": 1.811201
        },
        {
          "mean": 5,
          "observedMean": 4.984927,
          "sd": 1.669866
        },
        {
          "mean": 5,
          "observedMean": 4.889545,
          "sd": 1.603116
        },
        {
          "mean": 5,
          "observedMean": 4.891527,
          "sd": 1.508574
        },
        {
          "mean": 5,
          "observedMean": 4.916377,
          "sd": 1.405127
        },
        {
          "mean": 5,
          "observedMean": 4.952448,
          "sd": 1.316531
        },
        {
          "mean": 5,
          "observedMean": 4.976103,
          "sd": 1.237727
        },
        {
          "mean": 5,
          "observedMean": 4.986828,
          "sd": 1.1676
        },
        {
          "mean": 5,
          "observedMean": 5.001509,
          "sd": 1.102272
        },
        {
          "mean": 5,
          "observedMean": 5.014191,
          "sd": 1.0352
        },
        {
          "mean": 5,
          "observedMean": 4.970911,
          "sd": 0.999466
        },
        {
          "mean": 5,
          "observedMean": 4.934966,
          "sd": 0.966428
        },
        {
          "mean": 5,
          "observedMean": 4.943701,
          "sd": 0.94038
        },
        {
          "mean": 5,
          "observedMean": 4.973687,
          "sd": 0.906709
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.193303,
      "sd": 3.545431,
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
          "mean": 33.477317,
          "sd": 1.451302
        },
        {
          "mean": 36.706804,
          "sd": 1.652366
        },
        {
          "mean": 39.466417,
          "sd": 1.825942
        },
        {
          "mean": 42.014864,
          "sd": 1.986695
        },
        {
          "mean": 44.500668,
          "sd": 2.13995
        },
        {
          "mean": 46.942357,
          "sd": 2.292318
        },
        {
          "mean": 49.287442,
          "sd": 2.431711
        },
        {
          "mean": 51.466759,
          "sd": 2.568878
        },
        {
          "mean": 53.453392,
          "sd": 2.701412
        },
        {
          "mean": 55.39091,
          "sd": 2.841265
        },
        {
          "mean": 57.606337,
          "sd": 3.038893
        },
        {
          "mean": 60.333543,
          "sd": 3.306664
        },
        {
          "mean": 63.224075,
          "sd": 3.507382
        },
        {
          "mean": 65.629573,
          "sd": 3.582769
        },
        {
          "mean": 67.23264,
          "sd": 3.57008
        },
        {
          "mean": 68.015098,
          "sd": 3.546938
        }
      ]
    },
    "female": {
      "mean": 63.060379,
      "sd": 3.14238,
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
          "mean": 32.987212,
          "sd": 1.423784
        },
        {
          "mean": 36.394942,
          "sd": 1.623777
        },
        {
          "mean": 38.993624,
          "sd": 1.780748
        },
        {
          "mean": 41.627679,
          "sd": 1.936617
        },
        {
          "mean": 44.328902,
          "sd": 2.09416
        },
        {
          "mean": 46.91664,
          "sd": 2.245746
        },
        {
          "mean": 49.252287,
          "sd": 2.380096
        },
        {
          "mean": 51.31738,
          "sd": 2.503655
        },
        {
          "mean": 53.317602,
          "sd": 2.638178
        },
        {
          "mean": 55.671542,
          "sd": 2.838635
        },
        {
          "mean": 58.376866,
          "sd": 3.063043
        },
        {
          "mean": 60.722448,
          "sd": 3.173382
        },
        {
          "mean": 62.221779,
          "sd": 3.168537
        },
        {
          "mean": 62.901831,
          "sd": 3.152406
        },
        {
          "mean": 63.049476,
          "sd": 3.143735
        },
        {
          "mean": 63.057941,
          "sd": 3.141952
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
      "mean": 5.077859,
      "sd": 1.975385
    },
    {
      "mean": 5.179892,
      "sd": 1.958469
    },
    {
      "mean": 5.280805,
      "sd": 1.933134
    },
    {
      "mean": 5.382145,
      "sd": 1.911699
    },
    {
      "mean": 5.487284,
      "sd": 1.890817
    },
    {
      "mean": 5.588043,
      "sd": 1.874247
    },
    {
      "mean": 5.68841,
      "sd": 1.854424
    },
    {
      "mean": 5.787172,
      "sd": 1.82841
    },
    {
      "mean": 5.885109,
      "sd": 1.807697
    },
    {
      "mean": 5.975064,
      "sd": 1.790309
    },
    {
      "mean": 6.062365,
      "sd": 1.770237
    },
    {
      "mean": 6.149361,
      "sd": 1.754875
    },
    {
      "mean": 6.244765,
      "sd": 1.729497
    },
    {
      "mean": 6.333508,
      "sd": 1.703983
    },
    {
      "mean": 6.41303,
      "sd": 1.68431
    },
    {
      "mean": 6.493583,
      "sd": 1.664007
    },
    {
      "mean": 6.576905,
      "sd": 1.650917
    }
  ]
};
