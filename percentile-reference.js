// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1981,
      "female": 1981
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
    "focusPolicy": "core two-point targets with optional school activities unenrolled and both sports and extracurricular inactivity penalties active; fitted to birth-condition budgets and active condition/event caps, stacked capacity changes and required minima; spare points left unused",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3978,
      3977,
      3977,
      3977,
      3977,
      3977,
      3976,
      3976,
      3976,
      3975,
      3975,
      3975,
      3974,
      3970,
      3967,
      3965,
      3962,
      3962
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
    },
    "choiceStatMultiplier": 6,
    "infantStabilityMultiplier": 2,
    "skillVariation": {
      "proportional": 0.1
    },
    "development": {
      "innateScale": 0.6
    },
    "reproduce": "node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001"
  },
  "stats": {
    "intelligence": {
      "mean": 5,
      "observedMean": 5.382514,
      "sd": 2.304449,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.034472,
          "sd": 2.702083
        },
        {
          "mean": 5,
          "observedMean": 5.212931,
          "sd": 2.659573
        },
        {
          "mean": 5,
          "observedMean": 5.384413,
          "sd": 2.617444
        },
        {
          "mean": 5,
          "observedMean": 5.439052,
          "sd": 2.603575
        },
        {
          "mean": 5,
          "observedMean": 5.461534,
          "sd": 2.594418
        },
        {
          "mean": 5,
          "observedMean": 5.477164,
          "sd": 2.588207
        },
        {
          "mean": 5,
          "observedMean": 5.486397,
          "sd": 2.563598
        },
        {
          "mean": 5,
          "observedMean": 5.50171,
          "sd": 2.53574
        },
        {
          "mean": 5,
          "observedMean": 5.512601,
          "sd": 2.509867
        },
        {
          "mean": 5,
          "observedMean": 5.523634,
          "sd": 2.485454
        },
        {
          "mean": 5,
          "observedMean": 5.535258,
          "sd": 2.463389
        },
        {
          "mean": 5,
          "observedMean": 5.545801,
          "sd": 2.44116
        },
        {
          "mean": 5,
          "observedMean": 5.553864,
          "sd": 2.420308
        },
        {
          "mean": 5,
          "observedMean": 5.559507,
          "sd": 2.396011
        },
        {
          "mean": 5,
          "observedMean": 5.527196,
          "sd": 2.373932
        },
        {
          "mean": 5,
          "observedMean": 5.493073,
          "sd": 2.350336
        },
        {
          "mean": 5,
          "observedMean": 5.462797,
          "sd": 2.333428
        },
        {
          "mean": 5,
          "observedMean": 5.427087,
          "sd": 2.317552
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.428862,
      "sd": 2.427668,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.055695,
          "sd": 2.729379
        },
        {
          "mean": 5,
          "observedMean": 5.046938,
          "sd": 2.7235
        },
        {
          "mean": 5,
          "observedMean": 5.036528,
          "sd": 2.716826
        },
        {
          "mean": 5,
          "observedMean": 5.007792,
          "sd": 2.706966
        },
        {
          "mean": 5,
          "observedMean": 4.959364,
          "sd": 2.697866
        },
        {
          "mean": 5,
          "observedMean": 4.902653,
          "sd": 2.685695
        },
        {
          "mean": 5,
          "observedMean": 4.78396,
          "sd": 2.662783
        },
        {
          "mean": 5,
          "observedMean": 4.664449,
          "sd": 2.642127
        },
        {
          "mean": 5,
          "observedMean": 4.546081,
          "sd": 2.622859
        },
        {
          "mean": 5,
          "observedMean": 4.429027,
          "sd": 2.602297
        },
        {
          "mean": 5,
          "observedMean": 4.313947,
          "sd": 2.584128
        },
        {
          "mean": 5,
          "observedMean": 4.202387,
          "sd": 2.564709
        },
        {
          "mean": 5,
          "observedMean": 4.091062,
          "sd": 2.546879
        },
        {
          "mean": 5,
          "observedMean": 3.98,
          "sd": 2.528238
        },
        {
          "mean": 5,
          "observedMean": 3.86597,
          "sd": 2.508805
        },
        {
          "mean": 5,
          "observedMean": 3.756211,
          "sd": 2.494165
        },
        {
          "mean": 5,
          "observedMean": 3.645569,
          "sd": 2.470343
        },
        {
          "mean": 5,
          "observedMean": 3.536497,
          "sd": 2.44827
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.74159,
      "sd": 2.640954,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.020933,
          "sd": 2.704993
        },
        {
          "mean": 5,
          "observedMean": 5.023731,
          "sd": 2.705726
        },
        {
          "mean": 5,
          "observedMean": 5.024642,
          "sd": 2.705219
        },
        {
          "mean": 5,
          "observedMean": 5.013832,
          "sd": 2.702765
        },
        {
          "mean": 5,
          "observedMean": 4.996603,
          "sd": 2.698574
        },
        {
          "mean": 5,
          "observedMean": 4.979957,
          "sd": 2.69535
        },
        {
          "mean": 5,
          "observedMean": 4.95514,
          "sd": 2.691001
        },
        {
          "mean": 5,
          "observedMean": 4.930234,
          "sd": 2.685913
        },
        {
          "mean": 5,
          "observedMean": 4.905807,
          "sd": 2.680685
        },
        {
          "mean": 5,
          "observedMean": 4.88127,
          "sd": 2.676539
        },
        {
          "mean": 5,
          "observedMean": 4.854782,
          "sd": 2.671252
        },
        {
          "mean": 5,
          "observedMean": 4.828108,
          "sd": 2.665464
        },
        {
          "mean": 5,
          "observedMean": 4.799585,
          "sd": 2.659124
        },
        {
          "mean": 5,
          "observedMean": 4.771497,
          "sd": 2.65412
        },
        {
          "mean": 5,
          "observedMean": 4.761421,
          "sd": 2.649374
        },
        {
          "mean": 5,
          "observedMean": 4.757126,
          "sd": 2.646914
        },
        {
          "mean": 5,
          "observedMean": 4.752676,
          "sd": 2.644749
        },
        {
          "mean": 5,
          "observedMean": 4.74789,
          "sd": 2.643295
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.349977,
      "sd": 2.373838,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07516,
          "sd": 2.738053
        },
        {
          "mean": 5,
          "observedMean": 5.057122,
          "sd": 2.709662
        },
        {
          "mean": 5,
          "observedMean": 5.044901,
          "sd": 2.684757
        },
        {
          "mean": 5,
          "observedMean": 5.064106,
          "sd": 2.660585
        },
        {
          "mean": 5,
          "observedMean": 5.015074,
          "sd": 2.642038
        },
        {
          "mean": 5,
          "observedMean": 4.947252,
          "sd": 2.623883
        },
        {
          "mean": 5,
          "observedMean": 4.919115,
          "sd": 2.594614
        },
        {
          "mean": 5,
          "observedMean": 4.856866,
          "sd": 2.562793
        },
        {
          "mean": 5,
          "observedMean": 4.801177,
          "sd": 2.529867
        },
        {
          "mean": 5,
          "observedMean": 4.751283,
          "sd": 2.503877
        },
        {
          "mean": 5,
          "observedMean": 4.708387,
          "sd": 2.476718
        },
        {
          "mean": 5,
          "observedMean": 4.66487,
          "sd": 2.443632
        },
        {
          "mean": 5,
          "observedMean": 4.626767,
          "sd": 2.424594
        },
        {
          "mean": 5,
          "observedMean": 4.582315,
          "sd": 2.407412
        },
        {
          "mean": 5,
          "observedMean": 4.532952,
          "sd": 2.395082
        },
        {
          "mean": 5,
          "observedMean": 4.488142,
          "sd": 2.389245
        },
        {
          "mean": 5,
          "observedMean": 4.446303,
          "sd": 2.383906
        },
        {
          "mean": 5,
          "observedMean": 4.403534,
          "sd": 2.369063
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.293226,
      "sd": 2.377229,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.989778,
          "sd": 2.695395
        },
        {
          "mean": 5,
          "observedMean": 5.015367,
          "sd": 2.690947
        },
        {
          "mean": 5,
          "observedMean": 5.045346,
          "sd": 2.684337
        },
        {
          "mean": 5,
          "observedMean": 5.069809,
          "sd": 2.670285
        },
        {
          "mean": 5,
          "observedMean": 5.081408,
          "sd": 2.659213
        },
        {
          "mean": 5,
          "observedMean": 5.085094,
          "sd": 2.654982
        },
        {
          "mean": 5,
          "observedMean": 5.096326,
          "sd": 2.623009
        },
        {
          "mean": 5,
          "observedMean": 5.115536,
          "sd": 2.595953
        },
        {
          "mean": 5,
          "observedMean": 5.135561,
          "sd": 2.573022
        },
        {
          "mean": 5,
          "observedMean": 5.153654,
          "sd": 2.54896
        },
        {
          "mean": 5,
          "observedMean": 5.176958,
          "sd": 2.527846
        },
        {
          "mean": 5,
          "observedMean": 5.193225,
          "sd": 2.506803
        },
        {
          "mean": 5,
          "observedMean": 5.210631,
          "sd": 2.487378
        },
        {
          "mean": 5,
          "observedMean": 5.228787,
          "sd": 2.466877
        },
        {
          "mean": 5,
          "observedMean": 5.241899,
          "sd": 2.449048
        },
        {
          "mean": 5,
          "observedMean": 5.256375,
          "sd": 2.430749
        },
        {
          "mean": 5,
          "observedMean": 5.274129,
          "sd": 2.413281
        },
        {
          "mean": 5,
          "observedMean": 5.291391,
          "sd": 2.394
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.677279,
      "sd": 2.625174,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94902,
          "sd": 2.73793
        },
        {
          "mean": 5,
          "observedMean": 4.923198,
          "sd": 2.722788
        },
        {
          "mean": 5,
          "observedMean": 4.891187,
          "sd": 2.708352
        },
        {
          "mean": 5,
          "observedMean": 4.879653,
          "sd": 2.692474
        },
        {
          "mean": 5,
          "observedMean": 4.900488,
          "sd": 2.687059
        },
        {
          "mean": 5,
          "observedMean": 4.922934,
          "sd": 2.681254
        },
        {
          "mean": 5,
          "observedMean": 4.912743,
          "sd": 2.676265
        },
        {
          "mean": 5,
          "observedMean": 4.900264,
          "sd": 2.671399
        },
        {
          "mean": 5,
          "observedMean": 4.889608,
          "sd": 2.665286
        },
        {
          "mean": 5,
          "observedMean": 4.881778,
          "sd": 2.66386
        },
        {
          "mean": 5,
          "observedMean": 4.872948,
          "sd": 2.659433
        },
        {
          "mean": 5,
          "observedMean": 4.86357,
          "sd": 2.654315
        },
        {
          "mean": 5,
          "observedMean": 4.855057,
          "sd": 2.647451
        },
        {
          "mean": 5,
          "observedMean": 4.848329,
          "sd": 2.645085
        },
        {
          "mean": 5,
          "observedMean": 4.811922,
          "sd": 2.639203
        },
        {
          "mean": 5,
          "observedMean": 4.779317,
          "sd": 2.635378
        },
        {
          "mean": 5,
          "observedMean": 4.747115,
          "sd": 2.628955
        },
        {
          "mean": 5,
          "observedMean": 4.71633,
          "sd": 2.628465
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.856328,
      "sd": 2.357541,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03422,
          "sd": 2.707614
        },
        {
          "mean": 5,
          "observedMean": 5.130194,
          "sd": 2.624941
        },
        {
          "mean": 5,
          "observedMean": 5.239909,
          "sd": 2.541196
        },
        {
          "mean": 5,
          "observedMean": 5.231554,
          "sd": 2.487834
        },
        {
          "mean": 5,
          "observedMean": 5.239442,
          "sd": 2.46534
        },
        {
          "mean": 5,
          "observedMean": 5.253354,
          "sd": 2.439027
        },
        {
          "mean": 5,
          "observedMean": 5.248124,
          "sd": 2.432293
        },
        {
          "mean": 5,
          "observedMean": 5.236341,
          "sd": 2.421946
        },
        {
          "mean": 5,
          "observedMean": 5.229655,
          "sd": 2.410929
        },
        {
          "mean": 5,
          "observedMean": 5.225299,
          "sd": 2.402118
        },
        {
          "mean": 5,
          "observedMean": 5.216911,
          "sd": 2.392017
        },
        {
          "mean": 5,
          "observedMean": 5.20718,
          "sd": 2.382059
        },
        {
          "mean": 5,
          "observedMean": 5.198911,
          "sd": 2.379492
        },
        {
          "mean": 5,
          "observedMean": 5.191598,
          "sd": 2.375086
        },
        {
          "mean": 5,
          "observedMean": 5.116879,
          "sd": 2.364267
        },
        {
          "mean": 5,
          "observedMean": 5.046884,
          "sd": 2.354788
        },
        {
          "mean": 5,
          "observedMean": 4.985175,
          "sd": 2.356925
        },
        {
          "mean": 5,
          "observedMean": 4.923417,
          "sd": 2.353631
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.918339,
      "sd": 3.379424,
      "ages": [
        {
          "mean": 19.64866,
          "sd": 0.762276
        },
        {
          "mean": 29.80751,
          "sd": 1.143263
        },
        {
          "mean": 34.00693,
          "sd": 1.339834
        },
        {
          "mean": 37.331012,
          "sd": 1.515438
        },
        {
          "mean": 40.154464,
          "sd": 1.665373
        },
        {
          "mean": 42.742104,
          "sd": 1.804458
        },
        {
          "mean": 45.26692,
          "sd": 1.942213
        },
        {
          "mean": 47.736316,
          "sd": 2.082895
        },
        {
          "mean": 50.098103,
          "sd": 2.215663
        },
        {
          "mean": 52.287826,
          "sd": 2.347659
        },
        {
          "mean": 54.268308,
          "sd": 2.477794
        },
        {
          "mean": 56.196571,
          "sd": 2.625049
        },
        {
          "mean": 58.407583,
          "sd": 2.838128
        },
        {
          "mean": 61.140262,
          "sd": 3.123985
        },
        {
          "mean": 64.0213,
          "sd": 3.344055
        },
        {
          "mean": 66.412404,
          "sd": 3.417353
        },
        {
          "mean": 67.998865,
          "sd": 3.400608
        },
        {
          "mean": 68.751116,
          "sd": 3.382879
        }
      ]
    },
    "female": {
      "mean": 63.825381,
      "sd": 3.116955,
      "ages": [
        {
          "mean": 19.35754,
          "sd": 0.750954
        },
        {
          "mean": 29.162568,
          "sd": 1.146625
        },
        {
          "mean": 33.450844,
          "sd": 1.353527
        },
        {
          "mean": 36.955663,
          "sd": 1.527106
        },
        {
          "mean": 39.619729,
          "sd": 1.672497
        },
        {
          "mean": 42.311462,
          "sd": 1.820338
        },
        {
          "mean": 45.050975,
          "sd": 1.972618
        },
        {
          "mean": 47.690538,
          "sd": 2.125859
        },
        {
          "mean": 50.047481,
          "sd": 2.26511
        },
        {
          "mean": 52.136516,
          "sd": 2.39673
        },
        {
          "mean": 54.155294,
          "sd": 2.557901
        },
        {
          "mean": 56.535933,
          "sd": 2.777614
        },
        {
          "mean": 59.25729,
          "sd": 3.018317
        },
        {
          "mean": 61.591343,
          "sd": 3.132082
        },
        {
          "mean": 63.048922,
          "sd": 3.128645
        },
        {
          "mean": 63.684186,
          "sd": 3.112767
        },
        {
          "mean": 63.819516,
          "sd": 3.114447
        },
        {
          "mean": 63.825381,
          "sd": 3.116955
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
      "mean": 4.978676,
      "sd": 1.978606
    },
    {
      "mean": 4.995427,
      "sd": 1.955261
    },
    {
      "mean": 5.012448,
      "sd": 1.936552
    },
    {
      "mean": 5.030962,
      "sd": 1.917602
    },
    {
      "mean": 5.051333,
      "sd": 1.894607
    },
    {
      "mean": 5.07134,
      "sd": 1.874038
    },
    {
      "mean": 5.093221,
      "sd": 1.85216
    },
    {
      "mean": 5.110321,
      "sd": 1.83216
    },
    {
      "mean": 5.133999,
      "sd": 1.811412
    },
    {
      "mean": 5.150337,
      "sd": 1.788483
    },
    {
      "mean": 5.168317,
      "sd": 1.770108
    },
    {
      "mean": 5.185038,
      "sd": 1.751315
    },
    {
      "mean": 5.200059,
      "sd": 1.734998
    },
    {
      "mean": 5.217345,
      "sd": 1.721909
    },
    {
      "mean": 5.231107,
      "sd": 1.700059
    },
    {
      "mean": 5.250596,
      "sd": 1.68558
    },
    {
      "mean": 5.260095,
      "sd": 1.67163
    }
  ]
};
