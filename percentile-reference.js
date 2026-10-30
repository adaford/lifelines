// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1986,
      "female": 1988
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
      3977,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3974,
      3974,
      3974,
      3974,
      3974,
      3974,
      3974,
      3974,
      3974
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
        "intelligence": -0.091691,
        "strength": -0.017822,
        "social": -0.084572,
        "creativity": -0.092658
      },
      "wellbeingTarget": {
        "health": 5.181532,
        "stability": 4.097116
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
      "observedMean": 4.990199,
      "sd": 2.511606,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.070062,
          "sd": 2.277753
        },
        {
          "mean": 5,
          "observedMean": 5.098786,
          "sd": 2.282497
        },
        {
          "mean": 5,
          "observedMean": 5.124682,
          "sd": 2.28167
        },
        {
          "mean": 5,
          "observedMean": 5.09039,
          "sd": 2.283728
        },
        {
          "mean": 5,
          "observedMean": 5.00755,
          "sd": 2.272159
        },
        {
          "mean": 5,
          "observedMean": 4.919135,
          "sd": 2.258824
        },
        {
          "mean": 5,
          "observedMean": 4.970979,
          "sd": 2.310664
        },
        {
          "mean": 5,
          "observedMean": 5.053781,
          "sd": 2.351485
        },
        {
          "mean": 5,
          "observedMean": 5.061029,
          "sd": 2.362944
        },
        {
          "mean": 5,
          "observedMean": 5.087731,
          "sd": 2.375839
        },
        {
          "mean": 5,
          "observedMean": 5.101057,
          "sd": 2.400589
        },
        {
          "mean": 5,
          "observedMean": 5.11571,
          "sd": 2.431244
        },
        {
          "mean": 5,
          "observedMean": 5.136213,
          "sd": 2.438931
        },
        {
          "mean": 5,
          "observedMean": 5.152539,
          "sd": 2.458235
        },
        {
          "mean": 5,
          "observedMean": 5.107396,
          "sd": 2.463002
        },
        {
          "mean": 5,
          "observedMean": 5.072242,
          "sd": 2.481954
        },
        {
          "mean": 5,
          "observedMean": 5.049887,
          "sd": 2.486318
        },
        {
          "mean": 5,
          "observedMean": 5.015984,
          "sd": 2.502938
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.001648,
      "sd": 2.290227,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.06349,
          "sd": 2.29499
        },
        {
          "mean": 5,
          "observedMean": 5.051287,
          "sd": 2.30231
        },
        {
          "mean": 5,
          "observedMean": 5.058619,
          "sd": 2.303896
        },
        {
          "mean": 5,
          "observedMean": 4.966174,
          "sd": 2.336676
        },
        {
          "mean": 5,
          "observedMean": 4.943346,
          "sd": 2.319256
        },
        {
          "mean": 5,
          "observedMean": 4.922013,
          "sd": 2.305036
        },
        {
          "mean": 5,
          "observedMean": 4.932058,
          "sd": 2.308252
        },
        {
          "mean": 5,
          "observedMean": 4.940033,
          "sd": 2.317533
        },
        {
          "mean": 5,
          "observedMean": 4.954408,
          "sd": 2.320453
        },
        {
          "mean": 5,
          "observedMean": 4.969633,
          "sd": 2.325407
        },
        {
          "mean": 5,
          "observedMean": 4.984897,
          "sd": 2.331245
        },
        {
          "mean": 5,
          "observedMean": 4.985418,
          "sd": 2.335165
        },
        {
          "mean": 5,
          "observedMean": 4.993226,
          "sd": 2.345018
        },
        {
          "mean": 5,
          "observedMean": 5.003432,
          "sd": 2.348249
        },
        {
          "mean": 5,
          "observedMean": 5.029791,
          "sd": 2.322409
        },
        {
          "mean": 5,
          "observedMean": 5.024892,
          "sd": 2.316581
        },
        {
          "mean": 5,
          "observedMean": 5.0181,
          "sd": 2.309691
        },
        {
          "mean": 5,
          "observedMean": 5.010531,
          "sd": 2.296212
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.001452,
      "sd": 1.985537,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.965983,
          "sd": 1.988663
        },
        {
          "mean": 5,
          "observedMean": 4.967229,
          "sd": 1.987025
        },
        {
          "mean": 5,
          "observedMean": 4.966408,
          "sd": 1.985494
        },
        {
          "mean": 5,
          "observedMean": 4.966599,
          "sd": 1.985385
        },
        {
          "mean": 5,
          "observedMean": 4.967919,
          "sd": 1.985044
        },
        {
          "mean": 5,
          "observedMean": 4.968936,
          "sd": 1.984387
        },
        {
          "mean": 5,
          "observedMean": 4.968244,
          "sd": 1.983728
        },
        {
          "mean": 5,
          "observedMean": 4.967967,
          "sd": 1.984138
        },
        {
          "mean": 5,
          "observedMean": 4.969293,
          "sd": 1.984354
        },
        {
          "mean": 5,
          "observedMean": 4.969854,
          "sd": 1.985069
        },
        {
          "mean": 5,
          "observedMean": 4.970637,
          "sd": 1.98384
        },
        {
          "mean": 5,
          "observedMean": 4.970312,
          "sd": 1.984027
        },
        {
          "mean": 5,
          "observedMean": 4.97041,
          "sd": 1.984052
        },
        {
          "mean": 5,
          "observedMean": 4.970659,
          "sd": 1.984638
        },
        {
          "mean": 5,
          "observedMean": 4.976696,
          "sd": 1.984453
        },
        {
          "mean": 5,
          "observedMean": 4.983276,
          "sd": 1.984707
        },
        {
          "mean": 5,
          "observedMean": 4.988724,
          "sd": 1.983823
        },
        {
          "mean": 5,
          "observedMean": 4.994039,
          "sd": 1.984316
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.994436,
      "sd": 2.226369,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030397,
          "sd": 2.297539
        },
        {
          "mean": 5,
          "observedMean": 5.03045,
          "sd": 2.273658
        },
        {
          "mean": 5,
          "observedMean": 5.032596,
          "sd": 2.254513
        },
        {
          "mean": 5,
          "observedMean": 4.992687,
          "sd": 2.253004
        },
        {
          "mean": 5,
          "observedMean": 4.921172,
          "sd": 2.237754
        },
        {
          "mean": 5,
          "observedMean": 4.827504,
          "sd": 2.218156
        },
        {
          "mean": 5,
          "observedMean": 4.799862,
          "sd": 2.20719
        },
        {
          "mean": 5,
          "observedMean": 4.791857,
          "sd": 2.239828
        },
        {
          "mean": 5,
          "observedMean": 4.840148,
          "sd": 2.247591
        },
        {
          "mean": 5,
          "observedMean": 4.844714,
          "sd": 2.235234
        },
        {
          "mean": 5,
          "observedMean": 4.841417,
          "sd": 2.231858
        },
        {
          "mean": 5,
          "observedMean": 4.855717,
          "sd": 2.225727
        },
        {
          "mean": 5,
          "observedMean": 4.870934,
          "sd": 2.220812
        },
        {
          "mean": 5,
          "observedMean": 4.874104,
          "sd": 2.205926
        },
        {
          "mean": 5,
          "observedMean": 4.869648,
          "sd": 2.214743
        },
        {
          "mean": 5,
          "observedMean": 4.895259,
          "sd": 2.223329
        },
        {
          "mean": 5,
          "observedMean": 4.937778,
          "sd": 2.21876
        },
        {
          "mean": 5,
          "observedMean": 4.966834,
          "sd": 2.220444
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.990732,
      "sd": 2.416216,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.045817,
          "sd": 2.289883
        },
        {
          "mean": 5,
          "observedMean": 5.022409,
          "sd": 2.283646
        },
        {
          "mean": 5,
          "observedMean": 4.995114,
          "sd": 2.284629
        },
        {
          "mean": 5,
          "observedMean": 5.001346,
          "sd": 2.308251
        },
        {
          "mean": 5,
          "observedMean": 4.977122,
          "sd": 2.315731
        },
        {
          "mean": 5,
          "observedMean": 4.922684,
          "sd": 2.311065
        },
        {
          "mean": 5,
          "observedMean": 4.955826,
          "sd": 2.352542
        },
        {
          "mean": 5,
          "observedMean": 5.001331,
          "sd": 2.382595
        },
        {
          "mean": 5,
          "observedMean": 5.002533,
          "sd": 2.387393
        },
        {
          "mean": 5,
          "observedMean": 5.004158,
          "sd": 2.387475
        },
        {
          "mean": 5,
          "observedMean": 4.995767,
          "sd": 2.393674
        },
        {
          "mean": 5,
          "observedMean": 5.0043,
          "sd": 2.403402
        },
        {
          "mean": 5,
          "observedMean": 5.011837,
          "sd": 2.409932
        },
        {
          "mean": 5,
          "observedMean": 5.013986,
          "sd": 2.415444
        },
        {
          "mean": 5,
          "observedMean": 5.017139,
          "sd": 2.412339
        },
        {
          "mean": 5,
          "observedMean": 5.00381,
          "sd": 2.400662
        },
        {
          "mean": 5,
          "observedMean": 4.9981,
          "sd": 2.395421
        },
        {
          "mean": 5,
          "observedMean": 4.99993,
          "sd": 2.409612
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999602,
      "sd": 0.883715,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.940345,
          "sd": 2.287901
        },
        {
          "mean": 5,
          "observedMean": 4.827164,
          "sd": 2.20888
        },
        {
          "mean": 5,
          "observedMean": 4.840043,
          "sd": 2.07909
        },
        {
          "mean": 5,
          "observedMean": 4.794435,
          "sd": 1.988813
        },
        {
          "mean": 5,
          "observedMean": 4.913557,
          "sd": 1.869793
        },
        {
          "mean": 5,
          "observedMean": 4.939268,
          "sd": 1.7672
        },
        {
          "mean": 5,
          "observedMean": 4.936702,
          "sd": 1.665371
        },
        {
          "mean": 5,
          "observedMean": 4.955499,
          "sd": 1.567492
        },
        {
          "mean": 5,
          "observedMean": 4.968226,
          "sd": 1.490333
        },
        {
          "mean": 5,
          "observedMean": 4.988528,
          "sd": 1.402087
        },
        {
          "mean": 5,
          "observedMean": 5.007207,
          "sd": 1.316565
        },
        {
          "mean": 5,
          "observedMean": 5.015221,
          "sd": 1.237425
        },
        {
          "mean": 5,
          "observedMean": 5.028022,
          "sd": 1.165663
        },
        {
          "mean": 5,
          "observedMean": 5.042192,
          "sd": 1.113519
        },
        {
          "mean": 5,
          "observedMean": 5.042509,
          "sd": 1.065224
        },
        {
          "mean": 5,
          "observedMean": 5.017743,
          "sd": 1.021043
        },
        {
          "mean": 5,
          "observedMean": 5.012937,
          "sd": 0.962155
        },
        {
          "mean": 5,
          "observedMean": 5.00763,
          "sd": 0.932445
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.984041,
      "sd": 0.854193,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018087,
          "sd": 2.318658
        },
        {
          "mean": 5,
          "observedMean": 5.088994,
          "sd": 2.192784
        },
        {
          "mean": 5,
          "observedMean": 5.20007,
          "sd": 2.054924
        },
        {
          "mean": 5,
          "observedMean": 5.105197,
          "sd": 1.93136
        },
        {
          "mean": 5,
          "observedMean": 5.09047,
          "sd": 1.765247
        },
        {
          "mean": 5,
          "observedMean": 4.988931,
          "sd": 1.623779
        },
        {
          "mean": 5,
          "observedMean": 4.899769,
          "sd": 1.539787
        },
        {
          "mean": 5,
          "observedMean": 4.90757,
          "sd": 1.459362
        },
        {
          "mean": 5,
          "observedMean": 4.944543,
          "sd": 1.353008
        },
        {
          "mean": 5,
          "observedMean": 4.965603,
          "sd": 1.26052
        },
        {
          "mean": 5,
          "observedMean": 4.985554,
          "sd": 1.173205
        },
        {
          "mean": 5,
          "observedMean": 5.006548,
          "sd": 1.101236
        },
        {
          "mean": 5,
          "observedMean": 5.00883,
          "sd": 1.023651
        },
        {
          "mean": 5,
          "observedMean": 5.015476,
          "sd": 0.979813
        },
        {
          "mean": 5,
          "observedMean": 4.950307,
          "sd": 0.963326
        },
        {
          "mean": 5,
          "observedMean": 4.912126,
          "sd": 0.928985
        },
        {
          "mean": 5,
          "observedMean": 4.933651,
          "sd": 0.887535
        },
        {
          "mean": 5,
          "observedMean": 4.961948,
          "sd": 0.864892
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.250826,
      "sd": 3.512508,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.442495,
          "sd": 1.197648
        },
        {
          "mean": 33.490428,
          "sd": 1.436588
        },
        {
          "mean": 36.731198,
          "sd": 1.63908
        },
        {
          "mean": 39.495445,
          "sd": 1.814117
        },
        {
          "mean": 42.04927,
          "sd": 1.974657
        },
        {
          "mean": 44.535652,
          "sd": 2.124487
        },
        {
          "mean": 46.987026,
          "sd": 2.275862
        },
        {
          "mean": 49.32993,
          "sd": 2.40344
        },
        {
          "mean": 51.511203,
          "sd": 2.541408
        },
        {
          "mean": 53.498187,
          "sd": 2.665961
        },
        {
          "mean": 55.435045,
          "sd": 2.804299
        },
        {
          "mean": 57.655393,
          "sd": 3.01567
        },
        {
          "mean": 60.389683,
          "sd": 3.286684
        },
        {
          "mean": 63.277372,
          "sd": 3.48787
        },
        {
          "mean": 65.683011,
          "sd": 3.55733
        },
        {
          "mean": 67.290101,
          "sd": 3.538064
        },
        {
          "mean": 68.070665,
          "sd": 3.513613
        }
      ]
    },
    "female": {
      "mean": 63.105216,
      "sd": 3.157203,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.835199,
          "sd": 1.211667
        },
        {
          "mean": 32.991268,
          "sd": 1.461856
        },
        {
          "mean": 36.393919,
          "sd": 1.668426
        },
        {
          "mean": 38.987389,
          "sd": 1.826297
        },
        {
          "mean": 41.632128,
          "sd": 1.978805
        },
        {
          "mean": 44.342847,
          "sd": 2.133662
        },
        {
          "mean": 46.949754,
          "sd": 2.283182
        },
        {
          "mean": 49.296479,
          "sd": 2.417823
        },
        {
          "mean": 51.356836,
          "sd": 2.53792
        },
        {
          "mean": 53.353149,
          "sd": 2.668084
        },
        {
          "mean": 55.708632,
          "sd": 2.862726
        },
        {
          "mean": 58.42078,
          "sd": 3.08209
        },
        {
          "mean": 60.758758,
          "sd": 3.189095
        },
        {
          "mean": 62.26417,
          "sd": 3.187648
        },
        {
          "mean": 62.947923,
          "sd": 3.168616
        },
        {
          "mean": 63.096761,
          "sd": 3.159372
        },
        {
          "mean": 63.105216,
          "sd": 3.157203
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
      "mean": 5.079804,
      "sd": 1.97147
    },
    {
      "mean": 5.183507,
      "sd": 1.948793
    },
    {
      "mean": 5.291258,
      "sd": 1.923704
    },
    {
      "mean": 5.394976,
      "sd": 1.896929
    },
    {
      "mean": 5.498838,
      "sd": 1.870652
    },
    {
      "mean": 5.604252,
      "sd": 1.853117
    },
    {
      "mean": 5.70167,
      "sd": 1.833629
    },
    {
      "mean": 5.798679,
      "sd": 1.809453
    },
    {
      "mean": 5.898189,
      "sd": 1.791129
    },
    {
      "mean": 5.988415,
      "sd": 1.774683
    },
    {
      "mean": 6.082559,
      "sd": 1.75404
    },
    {
      "mean": 6.170813,
      "sd": 1.733062
    },
    {
      "mean": 6.259942,
      "sd": 1.709005
    },
    {
      "mean": 6.348017,
      "sd": 1.690727
    },
    {
      "mean": 6.426067,
      "sd": 1.67308
    },
    {
      "mean": 6.5085,
      "sd": 1.656095
    },
    {
      "mean": 6.583236,
      "sd": 1.64428
    }
  ]
};
