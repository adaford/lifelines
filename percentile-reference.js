// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1902,
      "female": 1920
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
      3974,
      3958,
      3948,
      3946,
      3934,
      3925,
      3921,
      3910,
      3901,
      3896,
      3882,
      3875,
      3866,
      3860,
      3853,
      3840,
      3830,
      3822
    ],
    "birthVariation": {
      "skill": 0.8,
      "health": 0.8,
      "stability": 0.8,
      "appearance": 0.8,
      "inheritedAppearance": 1
    },
    "choiceStatMultiplier": 6,
    "infantStabilityMultiplier": 2,
    "skillVariation": {
      "proportional": 0.1
    },
    "development": {
      "innateScale": 0.3
    },
    "reproduce": "node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001"
  },
  "stats": {
    "intelligence": {
      "mean": 5,
      "observedMean": 4.845152,
      "sd": 1.199041,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.013243,
          "sd": 1.20334
        },
        {
          "mean": 5,
          "observedMean": 5.178875,
          "sd": 1.19552
        },
        {
          "mean": 5,
          "observedMean": 5.34,
          "sd": 1.190604
        },
        {
          "mean": 5,
          "observedMean": 5.358822,
          "sd": 1.189875
        },
        {
          "mean": 5,
          "observedMean": 5.367732,
          "sd": 1.190338
        },
        {
          "mean": 5,
          "observedMean": 5.370066,
          "sd": 1.188037
        },
        {
          "mean": 5,
          "observedMean": 5.336838,
          "sd": 1.187662
        },
        {
          "mean": 5,
          "observedMean": 5.301533,
          "sd": 1.187777
        },
        {
          "mean": 5,
          "observedMean": 5.267008,
          "sd": 1.188987
        },
        {
          "mean": 5,
          "observedMean": 5.233427,
          "sd": 1.189128
        },
        {
          "mean": 5,
          "observedMean": 5.198003,
          "sd": 1.190858
        },
        {
          "mean": 5,
          "observedMean": 5.161005,
          "sd": 1.18908
        },
        {
          "mean": 5,
          "observedMean": 5.12593,
          "sd": 1.186874
        },
        {
          "mean": 5,
          "observedMean": 5.090742,
          "sd": 1.187702
        },
        {
          "mean": 5,
          "observedMean": 5.045034,
          "sd": 1.190336
        },
        {
          "mean": 5,
          "observedMean": 4.99423,
          "sd": 1.196383
        },
        {
          "mean": 5,
          "observedMean": 4.944448,
          "sd": 1.195755
        },
        {
          "mean": 5,
          "observedMean": 4.900825,
          "sd": 1.197461
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.866614,
      "sd": 1.194125,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.025425,
          "sd": 1.223054
        },
        {
          "mean": 5,
          "observedMean": 5.029504,
          "sd": 1.220152
        },
        {
          "mean": 5,
          "observedMean": 5.032607,
          "sd": 1.222247
        },
        {
          "mean": 5,
          "observedMean": 5.019357,
          "sd": 1.223864
        },
        {
          "mean": 5,
          "observedMean": 5.00756,
          "sd": 1.225955
        },
        {
          "mean": 5,
          "observedMean": 4.997661,
          "sd": 1.228412
        },
        {
          "mean": 5,
          "observedMean": 4.907098,
          "sd": 1.225531
        },
        {
          "mean": 5,
          "observedMean": 4.818827,
          "sd": 1.222623
        },
        {
          "mean": 5,
          "observedMean": 4.730026,
          "sd": 1.219644
        },
        {
          "mean": 5,
          "observedMean": 4.640085,
          "sd": 1.216382
        },
        {
          "mean": 5,
          "observedMean": 4.551943,
          "sd": 1.21332
        },
        {
          "mean": 5,
          "observedMean": 4.465569,
          "sd": 1.210615
        },
        {
          "mean": 5,
          "observedMean": 4.381032,
          "sd": 1.207099
        },
        {
          "mean": 5,
          "observedMean": 4.295036,
          "sd": 1.205456
        },
        {
          "mean": 5,
          "observedMean": 4.208655,
          "sd": 1.202099
        },
        {
          "mean": 5,
          "observedMean": 4.120784,
          "sd": 1.200581
        },
        {
          "mean": 5,
          "observedMean": 4.036341,
          "sd": 1.198385
        },
        {
          "mean": 5,
          "observedMean": 3.952086,
          "sd": 1.196335
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.976491,
      "sd": 1.177159,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.010893,
          "sd": 1.176351
        },
        {
          "mean": 5,
          "observedMean": 5.013976,
          "sd": 1.177336
        },
        {
          "mean": 5,
          "observedMean": 5.016283,
          "sd": 1.176638
        },
        {
          "mean": 5,
          "observedMean": 5.015808,
          "sd": 1.177387
        },
        {
          "mean": 5,
          "observedMean": 5.014301,
          "sd": 1.178656
        },
        {
          "mean": 5,
          "observedMean": 5.011144,
          "sd": 1.178337
        },
        {
          "mean": 5,
          "observedMean": 5.005659,
          "sd": 1.178103
        },
        {
          "mean": 5,
          "observedMean": 5.00289,
          "sd": 1.177923
        },
        {
          "mean": 5,
          "observedMean": 5.000854,
          "sd": 1.177977
        },
        {
          "mean": 5,
          "observedMean": 4.995345,
          "sd": 1.178412
        },
        {
          "mean": 5,
          "observedMean": 4.991425,
          "sd": 1.178855
        },
        {
          "mean": 5,
          "observedMean": 4.987633,
          "sd": 1.179572
        },
        {
          "mean": 5,
          "observedMean": 4.983086,
          "sd": 1.179084
        },
        {
          "mean": 5,
          "observedMean": 4.978714,
          "sd": 1.178828
        },
        {
          "mean": 5,
          "observedMean": 4.977482,
          "sd": 1.179893
        },
        {
          "mean": 5,
          "observedMean": 4.976442,
          "sd": 1.179868
        },
        {
          "mean": 5,
          "observedMean": 4.976482,
          "sd": 1.178206
        },
        {
          "mean": 5,
          "observedMean": 4.976885,
          "sd": 1.178406
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.500065,
      "sd": 1.289422,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03477,
          "sd": 1.221236
        },
        {
          "mean": 5,
          "observedMean": 5.05185,
          "sd": 1.222927
        },
        {
          "mean": 5,
          "observedMean": 5.069323,
          "sd": 1.224779
        },
        {
          "mean": 5,
          "observedMean": 5.087573,
          "sd": 1.228372
        },
        {
          "mean": 5,
          "observedMean": 5.091082,
          "sd": 1.23414
        },
        {
          "mean": 5,
          "observedMean": 5.088401,
          "sd": 1.237304
        },
        {
          "mean": 5,
          "observedMean": 5.040056,
          "sd": 1.237971
        },
        {
          "mean": 5,
          "observedMean": 4.987952,
          "sd": 1.240113
        },
        {
          "mean": 5,
          "observedMean": 4.944864,
          "sd": 1.242752
        },
        {
          "mean": 5,
          "observedMean": 4.898475,
          "sd": 1.242625
        },
        {
          "mean": 5,
          "observedMean": 4.857177,
          "sd": 1.244629
        },
        {
          "mean": 5,
          "observedMean": 4.814778,
          "sd": 1.245085
        },
        {
          "mean": 5,
          "observedMean": 4.767587,
          "sd": 1.248781
        },
        {
          "mean": 5,
          "observedMean": 4.724302,
          "sd": 1.254956
        },
        {
          "mean": 5,
          "observedMean": 4.672008,
          "sd": 1.264289
        },
        {
          "mean": 5,
          "observedMean": 4.627981,
          "sd": 1.274491
        },
        {
          "mean": 5,
          "observedMean": 4.589409,
          "sd": 1.275509
        },
        {
          "mean": 5,
          "observedMean": 4.537702,
          "sd": 1.285308
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.685602,
      "sd": 1.19343,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99259,
          "sd": 1.196998
        },
        {
          "mean": 5,
          "observedMean": 5.012031,
          "sd": 1.19933
        },
        {
          "mean": 5,
          "observedMean": 5.031385,
          "sd": 1.195319
        },
        {
          "mean": 5,
          "observedMean": 5.046983,
          "sd": 1.197863
        },
        {
          "mean": 5,
          "observedMean": 5.064767,
          "sd": 1.199723
        },
        {
          "mean": 5,
          "observedMean": 5.075137,
          "sd": 1.202092
        },
        {
          "mean": 5,
          "observedMean": 5.044018,
          "sd": 1.199334
        },
        {
          "mean": 5,
          "observedMean": 5.019694,
          "sd": 1.198733
        },
        {
          "mean": 5,
          "observedMean": 4.995601,
          "sd": 1.198255
        },
        {
          "mean": 5,
          "observedMean": 4.972825,
          "sd": 1.195399
        },
        {
          "mean": 5,
          "observedMean": 4.945092,
          "sd": 1.192134
        },
        {
          "mean": 5,
          "observedMean": 4.918596,
          "sd": 1.191824
        },
        {
          "mean": 5,
          "observedMean": 4.887422,
          "sd": 1.190252
        },
        {
          "mean": 5,
          "observedMean": 4.859542,
          "sd": 1.188279
        },
        {
          "mean": 5,
          "observedMean": 4.823306,
          "sd": 1.18786
        },
        {
          "mean": 5,
          "observedMean": 4.790241,
          "sd": 1.187648
        },
        {
          "mean": 5,
          "observedMean": 4.759872,
          "sd": 1.190239
        },
        {
          "mean": 5,
          "observedMean": 4.726775,
          "sd": 1.194218
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.976122,
      "sd": 1.200997,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.982348,
          "sd": 1.228623
        },
        {
          "mean": 5,
          "observedMean": 4.976346,
          "sd": 1.222848
        },
        {
          "mean": 5,
          "observedMean": 4.971935,
          "sd": 1.220069
        },
        {
          "mean": 5,
          "observedMean": 4.968961,
          "sd": 1.2173
        },
        {
          "mean": 5,
          "observedMean": 4.981333,
          "sd": 1.217395
        },
        {
          "mean": 5,
          "observedMean": 4.999359,
          "sd": 1.209713
        },
        {
          "mean": 5,
          "observedMean": 4.99758,
          "sd": 1.207505
        },
        {
          "mean": 5,
          "observedMean": 4.994448,
          "sd": 1.208059
        },
        {
          "mean": 5,
          "observedMean": 4.99535,
          "sd": 1.204584
        },
        {
          "mean": 5,
          "observedMean": 4.99554,
          "sd": 1.203145
        },
        {
          "mean": 5,
          "observedMean": 4.994931,
          "sd": 1.201602
        },
        {
          "mean": 5,
          "observedMean": 4.999778,
          "sd": 1.197521
        },
        {
          "mean": 5,
          "observedMean": 4.999476,
          "sd": 1.198054
        },
        {
          "mean": 5,
          "observedMean": 5.003195,
          "sd": 1.197162
        },
        {
          "mean": 5,
          "observedMean": 4.999676,
          "sd": 1.199491
        },
        {
          "mean": 5,
          "observedMean": 4.991121,
          "sd": 1.198882
        },
        {
          "mean": 5,
          "observedMean": 4.988021,
          "sd": 1.201833
        },
        {
          "mean": 5,
          "observedMean": 4.982979,
          "sd": 1.199789
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.037449,
      "sd": 1.288385,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018165,
          "sd": 1.206976
        },
        {
          "mean": 5,
          "observedMean": 5.118875,
          "sd": 1.208541
        },
        {
          "mean": 5,
          "observedMean": 5.217956,
          "sd": 1.209275
        },
        {
          "mean": 5,
          "observedMean": 5.191933,
          "sd": 1.212883
        },
        {
          "mean": 5,
          "observedMean": 5.186014,
          "sd": 1.219439
        },
        {
          "mean": 5,
          "observedMean": 5.17805,
          "sd": 1.226532
        },
        {
          "mean": 5,
          "observedMean": 5.172512,
          "sd": 1.227432
        },
        {
          "mean": 5,
          "observedMean": 5.167646,
          "sd": 1.232721
        },
        {
          "mean": 5,
          "observedMean": 5.159972,
          "sd": 1.234018
        },
        {
          "mean": 5,
          "observedMean": 5.157757,
          "sd": 1.239434
        },
        {
          "mean": 5,
          "observedMean": 5.152503,
          "sd": 1.245059
        },
        {
          "mean": 5,
          "observedMean": 5.149021,
          "sd": 1.245807
        },
        {
          "mean": 5,
          "observedMean": 5.141055,
          "sd": 1.256349
        },
        {
          "mean": 5,
          "observedMean": 5.137682,
          "sd": 1.258752
        },
        {
          "mean": 5,
          "observedMean": 5.112448,
          "sd": 1.26273
        },
        {
          "mean": 5,
          "observedMean": 5.095788,
          "sd": 1.274163
        },
        {
          "mean": 5,
          "observedMean": 5.076458,
          "sd": 1.272748
        },
        {
          "mean": 5,
          "observedMean": 5.059538,
          "sd": 1.284507
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.27265,
      "sd": 3.305296,
      "ages": [
        {
          "mean": 19.64866,
          "sd": 0.762276
        },
        {
          "mean": 29.819446,
          "sd": 1.133385
        },
        {
          "mean": 34.003409,
          "sd": 1.331549
        },
        {
          "mean": 37.348427,
          "sd": 1.507184
        },
        {
          "mean": 40.185723,
          "sd": 1.648629
        },
        {
          "mean": 42.797473,
          "sd": 1.777374
        },
        {
          "mean": 45.338172,
          "sd": 1.913007
        },
        {
          "mean": 47.824811,
          "sd": 2.038839
        },
        {
          "mean": 50.202763,
          "sd": 2.166607
        },
        {
          "mean": 52.408762,
          "sd": 2.299298
        },
        {
          "mean": 54.42249,
          "sd": 2.429078
        },
        {
          "mean": 56.374006,
          "sd": 2.581042
        },
        {
          "mean": 58.615028,
          "sd": 2.785819
        },
        {
          "mean": 61.368329,
          "sd": 3.069088
        },
        {
          "mean": 64.28453,
          "sd": 3.283601
        },
        {
          "mean": 66.700786,
          "sd": 3.364918
        },
        {
          "mean": 68.318724,
          "sd": 3.344833
        },
        {
          "mean": 69.09989,
          "sd": 3.318524
        }
      ]
    },
    "female": {
      "mean": 64.056234,
      "sd": 3.033775,
      "ages": [
        {
          "mean": 19.35754,
          "sd": 0.750954
        },
        {
          "mean": 29.148033,
          "sd": 1.145974
        },
        {
          "mean": 33.445719,
          "sd": 1.354286
        },
        {
          "mean": 36.957886,
          "sd": 1.529387
        },
        {
          "mean": 39.628147,
          "sd": 1.662787
        },
        {
          "mean": 42.328387,
          "sd": 1.801212
        },
        {
          "mean": 45.093116,
          "sd": 1.94925
        },
        {
          "mean": 47.740784,
          "sd": 2.094939
        },
        {
          "mean": 50.121011,
          "sd": 2.230035
        },
        {
          "mean": 52.222655,
          "sd": 2.358812
        },
        {
          "mean": 54.26188,
          "sd": 2.502553
        },
        {
          "mean": 56.673347,
          "sd": 2.729166
        },
        {
          "mean": 59.424434,
          "sd": 2.964092
        },
        {
          "mean": 61.766472,
          "sd": 3.073583
        },
        {
          "mean": 63.255173,
          "sd": 3.060028
        },
        {
          "mean": 63.903608,
          "sd": 3.038063
        },
        {
          "mean": 64.042578,
          "sd": 3.035966
        },
        {
          "mean": 64.050733,
          "sd": 3.035521
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
      "mean": 4.985365,
      "sd": 1.977052
    },
    {
      "mean": 4.999326,
      "sd": 1.957142
    },
    {
      "mean": 5.023062,
      "sd": 1.934506
    },
    {
      "mean": 5.040867,
      "sd": 1.910074
    },
    {
      "mean": 5.060939,
      "sd": 1.884743
    },
    {
      "mean": 5.073721,
      "sd": 1.865289
    },
    {
      "mean": 5.091188,
      "sd": 1.842614
    },
    {
      "mean": 5.108812,
      "sd": 1.820754
    },
    {
      "mean": 5.130104,
      "sd": 1.798615
    },
    {
      "mean": 5.144236,
      "sd": 1.779303
    },
    {
      "mean": 5.167702,
      "sd": 1.760742
    },
    {
      "mean": 5.18564,
      "sd": 1.744297
    },
    {
      "mean": 5.206133,
      "sd": 1.725715
    },
    {
      "mean": 5.222435,
      "sd": 1.705543
    },
    {
      "mean": 5.236775,
      "sd": 1.690888
    },
    {
      "mean": 5.249847,
      "sd": 1.666276
    },
    {
      "mean": 5.263878,
      "sd": 1.65066
    }
  ]
};
