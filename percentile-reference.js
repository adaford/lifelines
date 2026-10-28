// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1978,
      "female": 1984
    },
    "cryLevel": 3,
    "focus": {
      "work": 3,
      "social": 3,
      "family": 3,
      "self": 3
    },
    "choices": "uniform, independent seeded draws",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3978,
      3972,
      3971,
      3970,
      3970,
      3970,
      3970,
      3969,
      3969,
      3969,
      3969,
      3969,
      3969,
      3968,
      3968,
      3965,
      3964,
      3962
    ],
    "development": {
      "innateScale": 0.8,
      "skillReversion": 0.012,
      "childhoodBias": {
        "intelligence": -0.03031,
        "strength": -0.004584,
        "social": -0.030553,
        "creativity": -0.030086
      },
      "wellbeingTarget": {
        "health": 5.036037,
        "stability": 4.704038
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
      "observedMean": 5.012299,
      "sd": 1.710704,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.021242,
          "sd": 1.551151
        },
        {
          "mean": 5,
          "observedMean": 5.016202,
          "sd": 1.552461
        },
        {
          "mean": 5,
          "observedMean": 5.010647,
          "sd": 1.559727
        },
        {
          "mean": 5,
          "observedMean": 4.991924,
          "sd": 1.562504
        },
        {
          "mean": 5,
          "observedMean": 4.97433,
          "sd": 1.564745
        },
        {
          "mean": 5,
          "observedMean": 4.959836,
          "sd": 1.56902
        },
        {
          "mean": 5,
          "observedMean": 4.949383,
          "sd": 1.571059
        },
        {
          "mean": 5,
          "observedMean": 4.967783,
          "sd": 1.594815
        },
        {
          "mean": 5,
          "observedMean": 4.990771,
          "sd": 1.618839
        },
        {
          "mean": 5,
          "observedMean": 4.991091,
          "sd": 1.626888
        },
        {
          "mean": 5,
          "observedMean": 5.004727,
          "sd": 1.643274
        },
        {
          "mean": 5,
          "observedMean": 5.013502,
          "sd": 1.652894
        },
        {
          "mean": 5,
          "observedMean": 5.019821,
          "sd": 1.662565
        },
        {
          "mean": 5,
          "observedMean": 5.026906,
          "sd": 1.667218
        },
        {
          "mean": 5,
          "observedMean": 5.016109,
          "sd": 1.677158
        },
        {
          "mean": 5,
          "observedMean": 5.006023,
          "sd": 1.693236
        },
        {
          "mean": 5,
          "observedMean": 5.014028,
          "sd": 1.700374
        },
        {
          "mean": 5,
          "observedMean": 5.009879,
          "sd": 1.711572
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.004013,
      "sd": 1.584518,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.9991,
          "sd": 1.537506
        },
        {
          "mean": 5,
          "observedMean": 4.99087,
          "sd": 1.547403
        },
        {
          "mean": 5,
          "observedMean": 4.996928,
          "sd": 1.546908
        },
        {
          "mean": 5,
          "observedMean": 5.000836,
          "sd": 1.551895
        },
        {
          "mean": 5,
          "observedMean": 4.976945,
          "sd": 1.565849
        },
        {
          "mean": 5,
          "observedMean": 4.97201,
          "sd": 1.564423
        },
        {
          "mean": 5,
          "observedMean": 4.976761,
          "sd": 1.565653
        },
        {
          "mean": 5,
          "observedMean": 4.976698,
          "sd": 1.569794
        },
        {
          "mean": 5,
          "observedMean": 4.982671,
          "sd": 1.574483
        },
        {
          "mean": 5,
          "observedMean": 4.981756,
          "sd": 1.572765
        },
        {
          "mean": 5,
          "observedMean": 4.984225,
          "sd": 1.578989
        },
        {
          "mean": 5,
          "observedMean": 4.991199,
          "sd": 1.57902
        },
        {
          "mean": 5,
          "observedMean": 4.998597,
          "sd": 1.580021
        },
        {
          "mean": 5,
          "observedMean": 4.997969,
          "sd": 1.588338
        },
        {
          "mean": 5,
          "observedMean": 5.016447,
          "sd": 1.571902
        },
        {
          "mean": 5,
          "observedMean": 5.013485,
          "sd": 1.578135
        },
        {
          "mean": 5,
          "observedMean": 5.011178,
          "sd": 1.582984
        },
        {
          "mean": 5,
          "observedMean": 5.006486,
          "sd": 1.587354
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.001176,
      "sd": 1.277154,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.992972,
          "sd": 1.267745
        },
        {
          "mean": 5,
          "observedMean": 4.993524,
          "sd": 1.268067
        },
        {
          "mean": 5,
          "observedMean": 4.993915,
          "sd": 1.267528
        },
        {
          "mean": 5,
          "observedMean": 4.991894,
          "sd": 1.266901
        },
        {
          "mean": 5,
          "observedMean": 4.991748,
          "sd": 1.267853
        },
        {
          "mean": 5,
          "observedMean": 4.992564,
          "sd": 1.2681
        },
        {
          "mean": 5,
          "observedMean": 4.992972,
          "sd": 1.268478
        },
        {
          "mean": 5,
          "observedMean": 4.991972,
          "sd": 1.269036
        },
        {
          "mean": 5,
          "observedMean": 4.99257,
          "sd": 1.270126
        },
        {
          "mean": 5,
          "observedMean": 4.993139,
          "sd": 1.271206
        },
        {
          "mean": 5,
          "observedMean": 4.994024,
          "sd": 1.271246
        },
        {
          "mean": 5,
          "observedMean": 4.99382,
          "sd": 1.270348
        },
        {
          "mean": 5,
          "observedMean": 4.993797,
          "sd": 1.270954
        },
        {
          "mean": 5,
          "observedMean": 4.993605,
          "sd": 1.272044
        },
        {
          "mean": 5,
          "observedMean": 4.99506,
          "sd": 1.27313
        },
        {
          "mean": 5,
          "observedMean": 4.996358,
          "sd": 1.273837
        },
        {
          "mean": 5,
          "observedMean": 4.996509,
          "sd": 1.276012
        },
        {
          "mean": 5,
          "observedMean": 4.999132,
          "sd": 1.276494
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.015962,
      "sd": 1.664893,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01984,
          "sd": 1.551997
        },
        {
          "mean": 5,
          "observedMean": 5.015302,
          "sd": 1.553963
        },
        {
          "mean": 5,
          "observedMean": 5.011772,
          "sd": 1.552216
        },
        {
          "mean": 5,
          "observedMean": 4.995016,
          "sd": 1.549279
        },
        {
          "mean": 5,
          "observedMean": 4.964534,
          "sd": 1.562007
        },
        {
          "mean": 5,
          "observedMean": 4.950668,
          "sd": 1.564607
        },
        {
          "mean": 5,
          "observedMean": 4.931826,
          "sd": 1.571276
        },
        {
          "mean": 5,
          "observedMean": 4.929751,
          "sd": 1.587474
        },
        {
          "mean": 5,
          "observedMean": 4.939519,
          "sd": 1.596443
        },
        {
          "mean": 5,
          "observedMean": 4.944054,
          "sd": 1.601732
        },
        {
          "mean": 5,
          "observedMean": 4.951093,
          "sd": 1.6097
        },
        {
          "mean": 5,
          "observedMean": 4.957153,
          "sd": 1.616584
        },
        {
          "mean": 5,
          "observedMean": 4.958917,
          "sd": 1.619883
        },
        {
          "mean": 5,
          "observedMean": 4.973275,
          "sd": 1.621545
        },
        {
          "mean": 5,
          "observedMean": 4.971094,
          "sd": 1.636822
        },
        {
          "mean": 5,
          "observedMean": 4.973427,
          "sd": 1.643993
        },
        {
          "mean": 5,
          "observedMean": 4.978373,
          "sd": 1.655331
        },
        {
          "mean": 5,
          "observedMean": 4.995053,
          "sd": 1.666258
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.014427,
      "sd": 1.69881,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01156,
          "sd": 1.529057
        },
        {
          "mean": 5,
          "observedMean": 5.004774,
          "sd": 1.53701
        },
        {
          "mean": 5,
          "observedMean": 4.994114,
          "sd": 1.543116
        },
        {
          "mean": 5,
          "observedMean": 4.986537,
          "sd": 1.548349
        },
        {
          "mean": 5,
          "observedMean": 4.99305,
          "sd": 1.571984
        },
        {
          "mean": 5,
          "observedMean": 5.004108,
          "sd": 1.589063
        },
        {
          "mean": 5,
          "observedMean": 4.996534,
          "sd": 1.588771
        },
        {
          "mean": 5,
          "observedMean": 5.005398,
          "sd": 1.608815
        },
        {
          "mean": 5,
          "observedMean": 5.011892,
          "sd": 1.625612
        },
        {
          "mean": 5,
          "observedMean": 5.012426,
          "sd": 1.631935
        },
        {
          "mean": 5,
          "observedMean": 5.008619,
          "sd": 1.637002
        },
        {
          "mean": 5,
          "observedMean": 5.005336,
          "sd": 1.650495
        },
        {
          "mean": 5,
          "observedMean": 5.009632,
          "sd": 1.659661
        },
        {
          "mean": 5,
          "observedMean": 5.012328,
          "sd": 1.661452
        },
        {
          "mean": 5,
          "observedMean": 5.014176,
          "sd": 1.670538
        },
        {
          "mean": 5,
          "observedMean": 5.012067,
          "sd": 1.677794
        },
        {
          "mean": 5,
          "observedMean": 5.008943,
          "sd": 1.683392
        },
        {
          "mean": 5,
          "observedMean": 5.012894,
          "sd": 1.692135
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999894,
      "sd": 0.401879,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.995935,
          "sd": 1.002435
        },
        {
          "mean": 5,
          "observedMean": 4.95597,
          "sd": 0.966389
        },
        {
          "mean": 5,
          "observedMean": 4.953046,
          "sd": 0.909348
        },
        {
          "mean": 5,
          "observedMean": 4.959262,
          "sd": 0.856097
        },
        {
          "mean": 5,
          "observedMean": 4.98796,
          "sd": 0.801194
        },
        {
          "mean": 5,
          "observedMean": 4.987534,
          "sd": 0.759732
        },
        {
          "mean": 5,
          "observedMean": 4.996526,
          "sd": 0.711834
        },
        {
          "mean": 5,
          "observedMean": 4.999657,
          "sd": 0.676494
        },
        {
          "mean": 5,
          "observedMean": 4.999141,
          "sd": 0.644023
        },
        {
          "mean": 5,
          "observedMean": 5.005838,
          "sd": 0.606765
        },
        {
          "mean": 5,
          "observedMean": 5.00679,
          "sd": 0.57158
        },
        {
          "mean": 5,
          "observedMean": 5.010128,
          "sd": 0.535472
        },
        {
          "mean": 5,
          "observedMean": 5.01358,
          "sd": 0.511792
        },
        {
          "mean": 5,
          "observedMean": 5.012734,
          "sd": 0.489489
        },
        {
          "mean": 5,
          "observedMean": 5.020126,
          "sd": 0.461992
        },
        {
          "mean": 5,
          "observedMean": 5.011734,
          "sd": 0.453262
        },
        {
          "mean": 5,
          "observedMean": 5.012441,
          "sd": 0.424011
        },
        {
          "mean": 5,
          "observedMean": 5.002707,
          "sd": 0.41488
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.999021,
      "sd": 0.471114,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01609,
          "sd": 0.995367
        },
        {
          "mean": 5,
          "observedMean": 4.995271,
          "sd": 0.93826
        },
        {
          "mean": 5,
          "observedMean": 4.999736,
          "sd": 0.888169
        },
        {
          "mean": 5,
          "observedMean": 4.977232,
          "sd": 0.820822
        },
        {
          "mean": 5,
          "observedMean": 4.976859,
          "sd": 0.755994
        },
        {
          "mean": 5,
          "observedMean": 4.973222,
          "sd": 0.70803
        },
        {
          "mean": 5,
          "observedMean": 4.966053,
          "sd": 0.668317
        },
        {
          "mean": 5,
          "observedMean": 4.958851,
          "sd": 0.634425
        },
        {
          "mean": 5,
          "observedMean": 4.970542,
          "sd": 0.612005
        },
        {
          "mean": 5,
          "observedMean": 4.979491,
          "sd": 0.577283
        },
        {
          "mean": 5,
          "observedMean": 4.983691,
          "sd": 0.550877
        },
        {
          "mean": 5,
          "observedMean": 4.99101,
          "sd": 0.526071
        },
        {
          "mean": 5,
          "observedMean": 4.998042,
          "sd": 0.505933
        },
        {
          "mean": 5,
          "observedMean": 5.003424,
          "sd": 0.492578
        },
        {
          "mean": 5,
          "observedMean": 4.986477,
          "sd": 0.485048
        },
        {
          "mean": 5,
          "observedMean": 4.97463,
          "sd": 0.479081
        },
        {
          "mean": 5,
          "observedMean": 4.982018,
          "sd": 0.482629
        },
        {
          "mean": 5,
          "observedMean": 4.987351,
          "sd": 0.478569
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 175.191891,
      "sd": 7.780823,
      "ages": [
        {
          "mean": 49.8406,
          "sd": 1.851001
        },
        {
          "mean": 75.257994,
          "sd": 2.836832
        },
        {
          "mean": 85.804484,
          "sd": 3.329345
        },
        {
          "mean": 94.178916,
          "sd": 3.69554
        },
        {
          "mean": 101.344083,
          "sd": 4.036244
        },
        {
          "mean": 107.943911,
          "sd": 4.334108
        },
        {
          "mean": 114.349224,
          "sd": 4.659565
        },
        {
          "mean": 120.659335,
          "sd": 4.961516
        },
        {
          "mean": 126.679798,
          "sd": 5.269751
        },
        {
          "mean": 132.244846,
          "sd": 5.562505
        },
        {
          "mean": 137.318341,
          "sd": 5.877711
        },
        {
          "mean": 142.258497,
          "sd": 6.199032
        },
        {
          "mean": 147.887685,
          "sd": 6.704399
        },
        {
          "mean": 154.843111,
          "sd": 7.366967
        },
        {
          "mean": 162.250969,
          "sd": 7.851822
        },
        {
          "mean": 168.447603,
          "sd": 7.979755
        },
        {
          "mean": 172.640106,
          "sd": 7.876112
        },
        {
          "mean": 174.706973,
          "sd": 7.790968
        }
      ]
    },
    "female": {
      "mean": 161.695433,
      "sd": 7.071348,
      "ages": [
        {
          "mean": 49.04113,
          "sd": 1.850544
        },
        {
          "mean": 73.51817,
          "sd": 2.764178
        },
        {
          "mean": 84.2969,
          "sd": 3.266628
        },
        {
          "mean": 93.059623,
          "sd": 3.66034
        },
        {
          "mean": 99.77291,
          "sd": 3.961909
        },
        {
          "mean": 106.59208,
          "sd": 4.294321
        },
        {
          "mean": 113.562694,
          "sd": 4.64501
        },
        {
          "mean": 120.25791,
          "sd": 4.96122
        },
        {
          "mean": 126.294778,
          "sd": 5.300385
        },
        {
          "mean": 131.586566,
          "sd": 5.605531
        },
        {
          "mean": 136.725504,
          "sd": 5.963511
        },
        {
          "mean": 142.80221,
          "sd": 6.519434
        },
        {
          "mean": 149.736798,
          "sd": 7.109308
        },
        {
          "mean": 155.718469,
          "sd": 7.325314
        },
        {
          "mean": 159.547981,
          "sd": 7.23137
        },
        {
          "mean": 161.281264,
          "sd": 7.090494
        },
        {
          "mean": 161.672202,
          "sd": 7.072861
        },
        {
          "mean": 161.697501,
          "sd": 7.070167
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
      "mean": 4.968829,
      "sd": 1.995478
    },
    {
      "mean": 5.025428,
      "sd": 1.97571
    },
    {
      "mean": 5.226895,
      "sd": 1.923137
    },
    {
      "mean": 5.400756,
      "sd": 1.895467
    },
    {
      "mean": 5.529471,
      "sd": 1.883312
    },
    {
      "mean": 5.623426,
      "sd": 1.890852
    },
    {
      "mean": 5.706045,
      "sd": 1.887781
    },
    {
      "mean": 5.795163,
      "sd": 1.877481
    },
    {
      "mean": 5.899723,
      "sd": 1.851374
    },
    {
      "mean": 5.98967,
      "sd": 1.821914
    },
    {
      "mean": 6.074326,
      "sd": 1.794499
    },
    {
      "mean": 6.17032,
      "sd": 1.773582
    },
    {
      "mean": 6.253464,
      "sd": 1.756177
    },
    {
      "mean": 6.327369,
      "sd": 1.731887
    },
    {
      "mean": 6.40499,
      "sd": 1.704786
    },
    {
      "mean": 6.503153,
      "sd": 1.674767
    },
    {
      "mean": 6.578961,
      "sd": 1.662816
    }
  ]
};
