// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1982,
      "female": 1983
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
      3975,
      3973,
      3972,
      3972,
      3970,
      3969,
      3967,
      3966,
      3965
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
      "observedMean": 4.672361,
      "sd": 1.613223,
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
          "observedMean": 5.400976,
          "sd": 1.959169
        },
        {
          "mean": 5,
          "observedMean": 5.34455,
          "sd": 1.92053
        },
        {
          "mean": 5,
          "observedMean": 5.292241,
          "sd": 1.88308
        },
        {
          "mean": 5,
          "observedMean": 5.247088,
          "sd": 1.846738
        },
        {
          "mean": 5,
          "observedMean": 5.194745,
          "sd": 1.809579
        },
        {
          "mean": 5,
          "observedMean": 5.147619,
          "sd": 1.778376
        },
        {
          "mean": 5,
          "observedMean": 5.100785,
          "sd": 1.747055
        },
        {
          "mean": 5,
          "observedMean": 5.052968,
          "sd": 1.716119
        },
        {
          "mean": 5,
          "observedMean": 4.977123,
          "sd": 1.696408
        },
        {
          "mean": 5,
          "observedMean": 4.899796,
          "sd": 1.677118
        },
        {
          "mean": 5,
          "observedMean": 4.825952,
          "sd": 1.653651
        },
        {
          "mean": 5,
          "observedMean": 4.756805,
          "sd": 1.629923
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.107521,
      "sd": 1.667412,
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
          "observedMean": 4.834779,
          "sd": 2.023864
        },
        {
          "mean": 5,
          "observedMean": 4.671582,
          "sd": 1.992833
        },
        {
          "mean": 5,
          "observedMean": 4.511889,
          "sd": 1.960162
        },
        {
          "mean": 5,
          "observedMean": 4.356167,
          "sd": 1.931889
        },
        {
          "mean": 5,
          "observedMean": 4.206257,
          "sd": 1.902194
        },
        {
          "mean": 5,
          "observedMean": 4.05371,
          "sd": 1.872126
        },
        {
          "mean": 5,
          "observedMean": 3.910536,
          "sd": 1.840382
        },
        {
          "mean": 5,
          "observedMean": 3.773442,
          "sd": 1.811125
        },
        {
          "mean": 5,
          "observedMean": 3.633529,
          "sd": 1.782193
        },
        {
          "mean": 5,
          "observedMean": 3.498486,
          "sd": 1.751538
        },
        {
          "mean": 5,
          "observedMean": 3.364905,
          "sd": 1.722335
        },
        {
          "mean": 5,
          "observedMean": 3.2338,
          "sd": 1.695309
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.864338,
      "sd": 1.93424,
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
          "observedMean": 4.904759,
          "sd": 1.995829
        },
        {
          "mean": 5,
          "observedMean": 4.896635,
          "sd": 1.990765
        },
        {
          "mean": 5,
          "observedMean": 4.888332,
          "sd": 1.985486
        },
        {
          "mean": 5,
          "observedMean": 4.88123,
          "sd": 1.980716
        },
        {
          "mean": 5,
          "observedMean": 4.871346,
          "sd": 1.974895
        },
        {
          "mean": 5,
          "observedMean": 4.865293,
          "sd": 1.970818
        },
        {
          "mean": 5,
          "observedMean": 4.856886,
          "sd": 1.968183
        },
        {
          "mean": 5,
          "observedMean": 4.846523,
          "sd": 1.962964
        },
        {
          "mean": 5,
          "observedMean": 4.850929,
          "sd": 1.958053
        },
        {
          "mean": 5,
          "observedMean": 4.854681,
          "sd": 1.951684
        },
        {
          "mean": 5,
          "observedMean": 4.858437,
          "sd": 1.945655
        },
        {
          "mean": 5,
          "observedMean": 4.860608,
          "sd": 1.939937
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.570081,
      "sd": 1.679615,
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
          "observedMean": 5.126446,
          "sd": 1.984469
        },
        {
          "mean": 5,
          "observedMean": 5.075654,
          "sd": 1.944061
        },
        {
          "mean": 5,
          "observedMean": 5.026049,
          "sd": 1.903883
        },
        {
          "mean": 5,
          "observedMean": 4.980629,
          "sd": 1.876083
        },
        {
          "mean": 5,
          "observedMean": 4.943228,
          "sd": 1.851021
        },
        {
          "mean": 5,
          "observedMean": 4.899096,
          "sd": 1.821567
        },
        {
          "mean": 5,
          "observedMean": 4.867127,
          "sd": 1.794909
        },
        {
          "mean": 5,
          "observedMean": 4.828635,
          "sd": 1.770064
        },
        {
          "mean": 5,
          "observedMean": 4.773453,
          "sd": 1.74696
        },
        {
          "mean": 5,
          "observedMean": 4.718713,
          "sd": 1.72987
        },
        {
          "mean": 5,
          "observedMean": 4.672949,
          "sd": 1.71108
        },
        {
          "mean": 5,
          "observedMean": 4.627655,
          "sd": 1.692596
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.692999,
      "sd": 1.711669,
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
          "observedMean": 5.161507,
          "sd": 2.035346
        },
        {
          "mean": 5,
          "observedMean": 5.119995,
          "sd": 2.000381
        },
        {
          "mean": 5,
          "observedMean": 5.08298,
          "sd": 1.96252
        },
        {
          "mean": 5,
          "observedMean": 5.050176,
          "sd": 1.931208
        },
        {
          "mean": 5,
          "observedMean": 5.011286,
          "sd": 1.897926
        },
        {
          "mean": 5,
          "observedMean": 4.970816,
          "sd": 1.867998
        },
        {
          "mean": 5,
          "observedMean": 4.933225,
          "sd": 1.840295
        },
        {
          "mean": 5,
          "observedMean": 4.893421,
          "sd": 1.818027
        },
        {
          "mean": 5,
          "observedMean": 4.854217,
          "sd": 1.795135
        },
        {
          "mean": 5,
          "observedMean": 4.816077,
          "sd": 1.776522
        },
        {
          "mean": 5,
          "observedMean": 4.780476,
          "sd": 1.75379
        },
        {
          "mean": 5,
          "observedMean": 4.749125,
          "sd": 1.735501
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.977385,
      "sd": 0.685785,
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
          "observedMean": 4.969032,
          "sd": 1.40437
        },
        {
          "mean": 5,
          "observedMean": 4.983873,
          "sd": 1.309691
        },
        {
          "mean": 5,
          "observedMean": 4.998451,
          "sd": 1.223175
        },
        {
          "mean": 5,
          "observedMean": 5.012694,
          "sd": 1.142458
        },
        {
          "mean": 5,
          "observedMean": 5.025132,
          "sd": 1.070334
        },
        {
          "mean": 5,
          "observedMean": 5.037191,
          "sd": 1.001553
        },
        {
          "mean": 5,
          "observedMean": 5.047827,
          "sd": 0.935429
        },
        {
          "mean": 5,
          "observedMean": 5.057243,
          "sd": 0.879603
        },
        {
          "mean": 5,
          "observedMean": 5.038554,
          "sd": 0.835638
        },
        {
          "mean": 5,
          "observedMean": 5.024883,
          "sd": 0.78967
        },
        {
          "mean": 5,
          "observedMean": 5.01066,
          "sd": 0.748268
        },
        {
          "mean": 5,
          "observedMean": 4.991964,
          "sd": 0.718231
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.995465,
      "sd": 0.801495,
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
          "observedMean": 5.233285,
          "sd": 1.234176
        },
        {
          "mean": 5,
          "observedMean": 5.208765,
          "sd": 1.154076
        },
        {
          "mean": 5,
          "observedMean": 5.189308,
          "sd": 1.07216
        },
        {
          "mean": 5,
          "observedMean": 5.172306,
          "sd": 1.013673
        },
        {
          "mean": 5,
          "observedMean": 5.15924,
          "sd": 0.964725
        },
        {
          "mean": 5,
          "observedMean": 5.133753,
          "sd": 0.913645
        },
        {
          "mean": 5,
          "observedMean": 5.123764,
          "sd": 0.871828
        },
        {
          "mean": 5,
          "observedMean": 5.100924,
          "sd": 0.84537
        },
        {
          "mean": 5,
          "observedMean": 5.081325,
          "sd": 0.838142
        },
        {
          "mean": 5,
          "observedMean": 5.051827,
          "sd": 0.831478
        },
        {
          "mean": 5,
          "observedMean": 5.035021,
          "sd": 0.818159
        },
        {
          "mean": 5,
          "observedMean": 5.016972,
          "sd": 0.818264
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.249723,
      "sd": 3.103865,
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
          "mean": 45.273514,
          "sd": 1.825966
        },
        {
          "mean": 47.767059,
          "sd": 1.953835
        },
        {
          "mean": 50.146566,
          "sd": 2.076858
        },
        {
          "mean": 52.361192,
          "sd": 2.199432
        },
        {
          "mean": 54.377696,
          "sd": 2.322387
        },
        {
          "mean": 56.334947,
          "sd": 2.450144
        },
        {
          "mean": 58.570438,
          "sd": 2.657118
        },
        {
          "mean": 61.333815,
          "sd": 2.922047
        },
        {
          "mean": 64.254801,
          "sd": 3.111752
        },
        {
          "mean": 66.678906,
          "sd": 3.160227
        },
        {
          "mean": 68.293792,
          "sd": 3.124787
        },
        {
          "mean": 69.07352,
          "sd": 3.10065
        }
      ]
    },
    "female": {
      "mean": 64.108215,
      "sd": 2.735393,
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
          "mean": 45.129185,
          "sd": 1.809956
        },
        {
          "mean": 47.78001,
          "sd": 1.934088
        },
        {
          "mean": 50.163256,
          "sd": 2.03633
        },
        {
          "mean": 52.242969,
          "sd": 2.145858
        },
        {
          "mean": 54.262552,
          "sd": 2.279755
        },
        {
          "mean": 56.653847,
          "sd": 2.491529
        },
        {
          "mean": 59.39399,
          "sd": 2.718789
        },
        {
          "mean": 61.757466,
          "sd": 2.811911
        },
        {
          "mean": 63.266045,
          "sd": 2.782844
        },
        {
          "mean": 63.948569,
          "sd": 2.751257
        },
        {
          "mean": 64.100968,
          "sd": 2.737128
        },
        {
          "mean": 64.108215,
          "sd": 2.735393
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
      "mean": 5.593627,
      "sd": 1.868393
    },
    {
      "mean": 5.684361,
      "sd": 1.848683
    },
    {
      "mean": 5.784115,
      "sd": 1.828511
    },
    {
      "mean": 5.881821,
      "sd": 1.805169
    },
    {
      "mean": 5.974093,
      "sd": 1.781016
    },
    {
      "mean": 6.065812,
      "sd": 1.760508
    },
    {
      "mean": 6.152777,
      "sd": 1.738583
    },
    {
      "mean": 6.238865,
      "sd": 1.713408
    },
    {
      "mean": 6.327297,
      "sd": 1.698493
    },
    {
      "mean": 6.413096,
      "sd": 1.67636
    },
    {
      "mean": 6.490539,
      "sd": 1.666348
    },
    {
      "mean": 6.56296,
      "sd": 1.6509
    }
  ]
};
