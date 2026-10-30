// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1978,
      "female": 1981
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
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3979,
      3973,
      3972,
      3971,
      3969,
      3969,
      3968,
      3968,
      3968,
      3967,
      3966,
      3965,
      3965,
      3965,
      3963,
      3960,
      3960,
      3959
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
        "intelligence": -0.038027,
        "strength": -0.006223,
        "social": -0.034754,
        "creativity": -0.033157
      },
      "wellbeingTarget": {
        "health": 5.02253,
        "stability": 4.652891
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
      "observedMean": 5.01246,
      "sd": 2.199405,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07186,
          "sd": 2.303494
        },
        {
          "mean": 5,
          "observedMean": 5.108155,
          "sd": 2.291075
        },
        {
          "mean": 5,
          "observedMean": 5.14142,
          "sd": 2.283221
        },
        {
          "mean": 5,
          "observedMean": 5.121171,
          "sd": 2.274726
        },
        {
          "mean": 5,
          "observedMean": 5.086817,
          "sd": 2.258759
        },
        {
          "mean": 5,
          "observedMean": 5.051091,
          "sd": 2.240809
        },
        {
          "mean": 5,
          "observedMean": 5.068385,
          "sd": 2.252283
        },
        {
          "mean": 5,
          "observedMean": 5.095648,
          "sd": 2.258347
        },
        {
          "mean": 5,
          "observedMean": 5.090554,
          "sd": 2.255033
        },
        {
          "mean": 5,
          "observedMean": 5.08871,
          "sd": 2.248345
        },
        {
          "mean": 5,
          "observedMean": 5.089337,
          "sd": 2.244448
        },
        {
          "mean": 5,
          "observedMean": 5.090593,
          "sd": 2.240319
        },
        {
          "mean": 5,
          "observedMean": 5.086542,
          "sd": 2.237718
        },
        {
          "mean": 5,
          "observedMean": 5.08141,
          "sd": 2.227753
        },
        {
          "mean": 5,
          "observedMean": 5.066656,
          "sd": 2.217528
        },
        {
          "mean": 5,
          "observedMean": 5.047845,
          "sd": 2.221116
        },
        {
          "mean": 5,
          "observedMean": 5.030955,
          "sd": 2.219182
        },
        {
          "mean": 5,
          "observedMean": 5.025722,
          "sd": 2.207966
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.000692,
      "sd": 2.094058,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01008,
          "sd": 2.297584
        },
        {
          "mean": 5,
          "observedMean": 5.003471,
          "sd": 2.288149
        },
        {
          "mean": 5,
          "observedMean": 5.006602,
          "sd": 2.273267
        },
        {
          "mean": 5,
          "observedMean": 4.987188,
          "sd": 2.274985
        },
        {
          "mean": 5,
          "observedMean": 4.975613,
          "sd": 2.256865
        },
        {
          "mean": 5,
          "observedMean": 4.974417,
          "sd": 2.236376
        },
        {
          "mean": 5,
          "observedMean": 4.975316,
          "sd": 2.228869
        },
        {
          "mean": 5,
          "observedMean": 4.984302,
          "sd": 2.219374
        },
        {
          "mean": 5,
          "observedMean": 4.98403,
          "sd": 2.208491
        },
        {
          "mean": 5,
          "observedMean": 4.989652,
          "sd": 2.195057
        },
        {
          "mean": 5,
          "observedMean": 4.992929,
          "sd": 2.186313
        },
        {
          "mean": 5,
          "observedMean": 4.995943,
          "sd": 2.171978
        },
        {
          "mean": 5,
          "observedMean": 4.995791,
          "sd": 2.163982
        },
        {
          "mean": 5,
          "observedMean": 4.996068,
          "sd": 2.159569
        },
        {
          "mean": 5,
          "observedMean": 5.009967,
          "sd": 2.136939
        },
        {
          "mean": 5,
          "observedMean": 5.005849,
          "sd": 2.128023
        },
        {
          "mean": 5,
          "observedMean": 5.001677,
          "sd": 2.118681
        },
        {
          "mean": 5,
          "observedMean": 4.999424,
          "sd": 2.105472
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.023991,
      "sd": 1.989602,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.009383,
          "sd": 1.989297
        },
        {
          "mean": 5,
          "observedMean": 5.010302,
          "sd": 1.989228
        },
        {
          "mean": 5,
          "observedMean": 5.011253,
          "sd": 1.987106
        },
        {
          "mean": 5,
          "observedMean": 5.009685,
          "sd": 1.987144
        },
        {
          "mean": 5,
          "observedMean": 5.010287,
          "sd": 1.986449
        },
        {
          "mean": 5,
          "observedMean": 5.01032,
          "sd": 1.986914
        },
        {
          "mean": 5,
          "observedMean": 5.010338,
          "sd": 1.986045
        },
        {
          "mean": 5,
          "observedMean": 5.009995,
          "sd": 1.985723
        },
        {
          "mean": 5,
          "observedMean": 5.009861,
          "sd": 1.986
        },
        {
          "mean": 5,
          "observedMean": 5.008936,
          "sd": 1.986529
        },
        {
          "mean": 5,
          "observedMean": 5.008107,
          "sd": 1.985572
        },
        {
          "mean": 5,
          "observedMean": 5.009695,
          "sd": 1.984549
        },
        {
          "mean": 5,
          "observedMean": 5.009818,
          "sd": 1.985999
        },
        {
          "mean": 5,
          "observedMean": 5.010968,
          "sd": 1.985285
        },
        {
          "mean": 5,
          "observedMean": 5.012842,
          "sd": 1.98597
        },
        {
          "mean": 5,
          "observedMean": 5.017492,
          "sd": 1.987038
        },
        {
          "mean": 5,
          "observedMean": 5.020737,
          "sd": 1.987684
        },
        {
          "mean": 5,
          "observedMean": 5.023571,
          "sd": 1.988816
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.999169,
      "sd": 2.109103,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04187,
          "sd": 2.317953
        },
        {
          "mean": 5,
          "observedMean": 5.034979,
          "sd": 2.300026
        },
        {
          "mean": 5,
          "observedMean": 5.029242,
          "sd": 2.277019
        },
        {
          "mean": 5,
          "observedMean": 5.006735,
          "sd": 2.262093
        },
        {
          "mean": 5,
          "observedMean": 4.98483,
          "sd": 2.243822
        },
        {
          "mean": 5,
          "observedMean": 4.94389,
          "sd": 2.230018
        },
        {
          "mean": 5,
          "observedMean": 4.938335,
          "sd": 2.212993
        },
        {
          "mean": 5,
          "observedMean": 4.940754,
          "sd": 2.213674
        },
        {
          "mean": 5,
          "observedMean": 4.958309,
          "sd": 2.203173
        },
        {
          "mean": 5,
          "observedMean": 4.955083,
          "sd": 2.193185
        },
        {
          "mean": 5,
          "observedMean": 4.949824,
          "sd": 2.18447
        },
        {
          "mean": 5,
          "observedMean": 4.951884,
          "sd": 2.167641
        },
        {
          "mean": 5,
          "observedMean": 4.949243,
          "sd": 2.148476
        },
        {
          "mean": 5,
          "observedMean": 4.950512,
          "sd": 2.137575
        },
        {
          "mean": 5,
          "observedMean": 4.95062,
          "sd": 2.133164
        },
        {
          "mean": 5,
          "observedMean": 4.957103,
          "sd": 2.128531
        },
        {
          "mean": 5,
          "observedMean": 4.970364,
          "sd": 2.123117
        },
        {
          "mean": 5,
          "observedMean": 4.99251,
          "sd": 2.110952
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.998189,
      "sd": 2.156948,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.049875,
          "sd": 2.284212
        },
        {
          "mean": 5,
          "observedMean": 5.042197,
          "sd": 2.274817
        },
        {
          "mean": 5,
          "observedMean": 5.028568,
          "sd": 2.26231
        },
        {
          "mean": 5,
          "observedMean": 5.027689,
          "sd": 2.255951
        },
        {
          "mean": 5,
          "observedMean": 5.016978,
          "sd": 2.244522
        },
        {
          "mean": 5,
          "observedMean": 5.000642,
          "sd": 2.231842
        },
        {
          "mean": 5,
          "observedMean": 5.014858,
          "sd": 2.234737
        },
        {
          "mean": 5,
          "observedMean": 5.022208,
          "sd": 2.237608
        },
        {
          "mean": 5,
          "observedMean": 5.020123,
          "sd": 2.22942
        },
        {
          "mean": 5,
          "observedMean": 5.018939,
          "sd": 2.22153
        },
        {
          "mean": 5,
          "observedMean": 5.015856,
          "sd": 2.215226
        },
        {
          "mean": 5,
          "observedMean": 5.018081,
          "sd": 2.207476
        },
        {
          "mean": 5,
          "observedMean": 5.015369,
          "sd": 2.201405
        },
        {
          "mean": 5,
          "observedMean": 5.01574,
          "sd": 2.194893
        },
        {
          "mean": 5,
          "observedMean": 5.011516,
          "sd": 2.184515
        },
        {
          "mean": 5,
          "observedMean": 5.007547,
          "sd": 2.175678
        },
        {
          "mean": 5,
          "observedMean": 4.997871,
          "sd": 2.169486
        },
        {
          "mean": 5,
          "observedMean": 5.000798,
          "sd": 2.157568
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.999543,
      "sd": 0.689828,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.001625,
          "sd": 1.964763
        },
        {
          "mean": 5,
          "observedMean": 4.959178,
          "sd": 1.868909
        },
        {
          "mean": 5,
          "observedMean": 4.958125,
          "sd": 1.758776
        },
        {
          "mean": 5,
          "observedMean": 4.951767,
          "sd": 1.663114
        },
        {
          "mean": 5,
          "observedMean": 4.986724,
          "sd": 1.56624
        },
        {
          "mean": 5,
          "observedMean": 4.992021,
          "sd": 1.474687
        },
        {
          "mean": 5,
          "observedMean": 4.993673,
          "sd": 1.384857
        },
        {
          "mean": 5,
          "observedMean": 5.002755,
          "sd": 1.302704
        },
        {
          "mean": 5,
          "observedMean": 5.004715,
          "sd": 1.225973
        },
        {
          "mean": 5,
          "observedMean": 5.009405,
          "sd": 1.15361
        },
        {
          "mean": 5,
          "observedMean": 5.013007,
          "sd": 1.085125
        },
        {
          "mean": 5,
          "observedMean": 5.013865,
          "sd": 1.018419
        },
        {
          "mean": 5,
          "observedMean": 5.01605,
          "sd": 0.957235
        },
        {
          "mean": 5,
          "observedMean": 5.016494,
          "sd": 0.903396
        },
        {
          "mean": 5,
          "observedMean": 5.015594,
          "sd": 0.852849
        },
        {
          "mean": 5,
          "observedMean": 5.012241,
          "sd": 0.807917
        },
        {
          "mean": 5,
          "observedMean": 5.007424,
          "sd": 0.772241
        },
        {
          "mean": 5,
          "observedMean": 5.001803,
          "sd": 0.727996
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.999174,
      "sd": 0.605945,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043827,
          "sd": 1.947156
        },
        {
          "mean": 5,
          "observedMean": 5.136791,
          "sd": 1.8106
        },
        {
          "mean": 5,
          "observedMean": 5.247269,
          "sd": 1.683055
        },
        {
          "mean": 5,
          "observedMean": 5.198318,
          "sd": 1.556039
        },
        {
          "mean": 5,
          "observedMean": 5.173367,
          "sd": 1.424314
        },
        {
          "mean": 5,
          "observedMean": 5.119924,
          "sd": 1.308089
        },
        {
          "mean": 5,
          "observedMean": 5.087712,
          "sd": 1.222816
        },
        {
          "mean": 5,
          "observedMean": 5.081469,
          "sd": 1.139665
        },
        {
          "mean": 5,
          "observedMean": 5.081464,
          "sd": 1.057101
        },
        {
          "mean": 5,
          "observedMean": 5.076058,
          "sd": 0.983662
        },
        {
          "mean": 5,
          "observedMean": 5.065137,
          "sd": 0.913939
        },
        {
          "mean": 5,
          "observedMean": 5.055948,
          "sd": 0.853497
        },
        {
          "mean": 5,
          "observedMean": 5.058913,
          "sd": 0.797936
        },
        {
          "mean": 5,
          "observedMean": 5.048066,
          "sd": 0.755524
        },
        {
          "mean": 5,
          "observedMean": 5.027251,
          "sd": 0.716497
        },
        {
          "mean": 5,
          "observedMean": 5.002266,
          "sd": 0.687245
        },
        {
          "mean": 5,
          "observedMean": 4.995088,
          "sd": 0.656388
        },
        {
          "mean": 5,
          "observedMean": 5.003563,
          "sd": 0.62276
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.441456,
      "sd": 3.304524,
      "ages": [
        {
          "mean": 19.622185,
          "sd": 0.728739
        },
        {
          "mean": 29.48301,
          "sd": 1.168199
        },
        {
          "mean": 33.578953,
          "sd": 1.39742
        },
        {
          "mean": 36.831834,
          "sd": 1.584053
        },
        {
          "mean": 39.611351,
          "sd": 1.732687
        },
        {
          "mean": 42.169773,
          "sd": 1.882582
        },
        {
          "mean": 44.668569,
          "sd": 2.019362
        },
        {
          "mean": 47.120857,
          "sd": 2.156089
        },
        {
          "mean": 49.478638,
          "sd": 2.283587
        },
        {
          "mean": 51.656984,
          "sd": 2.410488
        },
        {
          "mean": 53.63355,
          "sd": 2.534005
        },
        {
          "mean": 55.565451,
          "sd": 2.664502
        },
        {
          "mean": 57.762624,
          "sd": 2.85331
        },
        {
          "mean": 60.486236,
          "sd": 3.107959
        },
        {
          "mean": 63.372195,
          "sd": 3.301879
        },
        {
          "mean": 65.798718,
          "sd": 3.360927
        },
        {
          "mean": 67.439707,
          "sd": 3.331387
        },
        {
          "mean": 68.252178,
          "sd": 3.306072
        }
      ]
    },
    "female": {
      "mean": 63.198738,
      "sd": 3.024132,
      "ages": [
        {
          "mean": 19.307495,
          "sd": 0.728648
        },
        {
          "mean": 28.79821,
          "sd": 1.13797
        },
        {
          "mean": 32.981002,
          "sd": 1.373083
        },
        {
          "mean": 36.396059,
          "sd": 1.560048
        },
        {
          "mean": 39.01306,
          "sd": 1.704269
        },
        {
          "mean": 41.673637,
          "sd": 1.858248
        },
        {
          "mean": 44.392252,
          "sd": 2.009292
        },
        {
          "mean": 47.009174,
          "sd": 2.152147
        },
        {
          "mean": 49.354635,
          "sd": 2.281837
        },
        {
          "mean": 51.423249,
          "sd": 2.414901
        },
        {
          "mean": 53.429904,
          "sd": 2.561514
        },
        {
          "mean": 55.805653,
          "sd": 2.784937
        },
        {
          "mean": 58.515623,
          "sd": 3.018156
        },
        {
          "mean": 60.859178,
          "sd": 3.109005
        },
        {
          "mean": 62.354987,
          "sd": 3.079427
        },
        {
          "mean": 63.035277,
          "sd": 3.032579
        },
        {
          "mean": 63.189137,
          "sd": 3.024374
        },
        {
          "mean": 63.198738,
          "sd": 3.024132
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
      "mean": 4.968082,
      "sd": 1.995783
    },
    {
      "mean": 5.024415,
      "sd": 1.976239
    },
    {
      "mean": 5.213998,
      "sd": 1.933701
    },
    {
      "mean": 5.403928,
      "sd": 1.891551
    },
    {
      "mean": 5.523054,
      "sd": 1.884291
    },
    {
      "mean": 5.617284,
      "sd": 1.893861
    },
    {
      "mean": 5.707913,
      "sd": 1.90053
    },
    {
      "mean": 5.791079,
      "sd": 1.879015
    },
    {
      "mean": 5.881804,
      "sd": 1.847211
    },
    {
      "mean": 5.977061,
      "sd": 1.82861
    },
    {
      "mean": 6.065305,
      "sd": 1.803376
    },
    {
      "mean": 6.15889,
      "sd": 1.777816
    },
    {
      "mean": 6.248424,
      "sd": 1.755144
    },
    {
      "mean": 6.325851,
      "sd": 1.742648
    },
    {
      "mean": 6.412819,
      "sd": 1.725017
    },
    {
      "mean": 6.47601,
      "sd": 1.710169
    },
    {
      "mean": 6.558081,
      "sd": 1.681348
    }
  ]
};
