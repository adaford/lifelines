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
        "intelligence": -0.034749,
        "strength": -0.006114,
        "social": -0.034802,
        "creativity": -0.033537
      },
      "wellbeingTarget": {
        "health": 5.022861,
        "stability": 4.723184
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
      "observedMean": 4.9912,
      "sd": 2.185707,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07186,
          "sd": 2.303494
        },
        {
          "mean": 5,
          "observedMean": 5.066853,
          "sd": 2.284783
        },
        {
          "mean": 5,
          "observedMean": 5.059174,
          "sd": 2.27143
        },
        {
          "mean": 5,
          "observedMean": 5.043494,
          "sd": 2.26254
        },
        {
          "mean": 5,
          "observedMean": 5.013589,
          "sd": 2.246135
        },
        {
          "mean": 5,
          "observedMean": 4.98191,
          "sd": 2.227684
        },
        {
          "mean": 5,
          "observedMean": 5.002862,
          "sd": 2.239277
        },
        {
          "mean": 5,
          "observedMean": 5.033901,
          "sd": 2.245174
        },
        {
          "mean": 5,
          "observedMean": 5.032654,
          "sd": 2.241829
        },
        {
          "mean": 5,
          "observedMean": 5.034277,
          "sd": 2.235459
        },
        {
          "mean": 5,
          "observedMean": 5.039236,
          "sd": 2.23139
        },
        {
          "mean": 5,
          "observedMean": 5.044269,
          "sd": 2.227977
        },
        {
          "mean": 5,
          "observedMean": 5.043291,
          "sd": 2.223984
        },
        {
          "mean": 5,
          "observedMean": 5.042754,
          "sd": 2.21489
        },
        {
          "mean": 5,
          "observedMean": 5.032237,
          "sd": 2.205135
        },
        {
          "mean": 5,
          "observedMean": 5.016699,
          "sd": 2.207936
        },
        {
          "mean": 5,
          "observedMean": 5.003806,
          "sd": 2.205605
        },
        {
          "mean": 5,
          "observedMean": 5.001487,
          "sd": 2.193737
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.001324,
      "sd": 2.093252,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01008,
          "sd": 2.297584
        },
        {
          "mean": 5,
          "observedMean": 5.003544,
          "sd": 2.288135
        },
        {
          "mean": 5,
          "observedMean": 5.006783,
          "sd": 2.273234
        },
        {
          "mean": 5,
          "observedMean": 4.98749,
          "sd": 2.274886
        },
        {
          "mean": 5,
          "observedMean": 4.976006,
          "sd": 2.256765
        },
        {
          "mean": 5,
          "observedMean": 4.974895,
          "sd": 2.236257
        },
        {
          "mean": 5,
          "observedMean": 4.975883,
          "sd": 2.22873
        },
        {
          "mean": 5,
          "observedMean": 4.984945,
          "sd": 2.219186
        },
        {
          "mean": 5,
          "observedMean": 4.984738,
          "sd": 2.208317
        },
        {
          "mean": 5,
          "observedMean": 4.990416,
          "sd": 2.194903
        },
        {
          "mean": 5,
          "observedMean": 4.993643,
          "sd": 2.185918
        },
        {
          "mean": 5,
          "observedMean": 4.996755,
          "sd": 2.171526
        },
        {
          "mean": 5,
          "observedMean": 4.996406,
          "sd": 2.163632
        },
        {
          "mean": 5,
          "observedMean": 4.996651,
          "sd": 2.1589
        },
        {
          "mean": 5,
          "observedMean": 5.01057,
          "sd": 2.136314
        },
        {
          "mean": 5,
          "observedMean": 5.006472,
          "sd": 2.127458
        },
        {
          "mean": 5,
          "observedMean": 5.002409,
          "sd": 2.118118
        },
        {
          "mean": 5,
          "observedMean": 5.000045,
          "sd": 2.104664
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.024092,
      "sd": 1.989629,
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
          "observedMean": 5.012943,
          "sd": 1.985999
        },
        {
          "mean": 5,
          "observedMean": 5.017593,
          "sd": 1.987067
        },
        {
          "mean": 5,
          "observedMean": 5.020838,
          "sd": 1.987711
        },
        {
          "mean": 5,
          "observedMean": 5.023672,
          "sd": 1.988844
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.998621,
      "sd": 2.109928,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04187,
          "sd": 2.317953
        },
        {
          "mean": 5,
          "observedMean": 5.034931,
          "sd": 2.300026
        },
        {
          "mean": 5,
          "observedMean": 5.029099,
          "sd": 2.277029
        },
        {
          "mean": 5,
          "observedMean": 5.006402,
          "sd": 2.262156
        },
        {
          "mean": 5,
          "observedMean": 4.984457,
          "sd": 2.243871
        },
        {
          "mean": 5,
          "observedMean": 4.943482,
          "sd": 2.230043
        },
        {
          "mean": 5,
          "observedMean": 4.937491,
          "sd": 2.212798
        },
        {
          "mean": 5,
          "observedMean": 4.939839,
          "sd": 2.214091
        },
        {
          "mean": 5,
          "observedMean": 4.957601,
          "sd": 2.203509
        },
        {
          "mean": 5,
          "observedMean": 4.954322,
          "sd": 2.193185
        },
        {
          "mean": 5,
          "observedMean": 4.949153,
          "sd": 2.184601
        },
        {
          "mean": 5,
          "observedMean": 4.951251,
          "sd": 2.167944
        },
        {
          "mean": 5,
          "observedMean": 4.948885,
          "sd": 2.148707
        },
        {
          "mean": 5,
          "observedMean": 4.95003,
          "sd": 2.137707
        },
        {
          "mean": 5,
          "observedMean": 4.949599,
          "sd": 2.132541
        },
        {
          "mean": 5,
          "observedMean": 4.956356,
          "sd": 2.128041
        },
        {
          "mean": 5,
          "observedMean": 4.969553,
          "sd": 2.122851
        },
        {
          "mean": 5,
          "observedMean": 4.992086,
          "sd": 2.112019
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.991791,
      "sd": 2.155946,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.049875,
          "sd": 2.284212
        },
        {
          "mean": 5,
          "observedMean": 5.04189,
          "sd": 2.274812
        },
        {
          "mean": 5,
          "observedMean": 5.027934,
          "sd": 2.262228
        },
        {
          "mean": 5,
          "observedMean": 5.026699,
          "sd": 2.255868
        },
        {
          "mean": 5,
          "observedMean": 5.015679,
          "sd": 2.244429
        },
        {
          "mean": 5,
          "observedMean": 4.999073,
          "sd": 2.231726
        },
        {
          "mean": 5,
          "observedMean": 5.012948,
          "sd": 2.234628
        },
        {
          "mean": 5,
          "observedMean": 5.019907,
          "sd": 2.237332
        },
        {
          "mean": 5,
          "observedMean": 5.01747,
          "sd": 2.229198
        },
        {
          "mean": 5,
          "observedMean": 5.015842,
          "sd": 2.221143
        },
        {
          "mean": 5,
          "observedMean": 5.012339,
          "sd": 2.214685
        },
        {
          "mean": 5,
          "observedMean": 5.014261,
          "sd": 2.206973
        },
        {
          "mean": 5,
          "observedMean": 5.011125,
          "sd": 2.200908
        },
        {
          "mean": 5,
          "observedMean": 5.011024,
          "sd": 2.194323
        },
        {
          "mean": 5,
          "observedMean": 5.006426,
          "sd": 2.184128
        },
        {
          "mean": 5,
          "observedMean": 5.002135,
          "sd": 2.175354
        },
        {
          "mean": 5,
          "observedMean": 4.992197,
          "sd": 2.168913
        },
        {
          "mean": 5,
          "observedMean": 4.994904,
          "sd": 2.156896
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.99905,
      "sd": 0.689992,
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
          "observedMean": 4.957898,
          "sd": 1.758741
        },
        {
          "mean": 5,
          "observedMean": 4.951163,
          "sd": 1.662919
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
          "observedMean": 5.015443,
          "sd": 0.853149
        },
        {
          "mean": 5,
          "observedMean": 5.01186,
          "sd": 0.808108
        },
        {
          "mean": 5,
          "observedMean": 5.007169,
          "sd": 0.772304
        },
        {
          "mean": 5,
          "observedMean": 5.001462,
          "sd": 0.728198
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.993316,
      "sd": 0.605144,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043827,
          "sd": 1.947156
        },
        {
          "mean": 5,
          "observedMean": 5.022405,
          "sd": 1.809345
        },
        {
          "mean": 5,
          "observedMean": 5.027531,
          "sd": 1.682438
        },
        {
          "mean": 5,
          "observedMean": 5.001052,
          "sd": 1.555629
        },
        {
          "mean": 5,
          "observedMean": 4.998056,
          "sd": 1.42354
        },
        {
          "mean": 5,
          "observedMean": 4.963195,
          "sd": 1.308161
        },
        {
          "mean": 5,
          "observedMean": 4.949531,
          "sd": 1.222411
        },
        {
          "mean": 5,
          "observedMean": 4.959816,
          "sd": 1.137975
        },
        {
          "mean": 5,
          "observedMean": 4.9753,
          "sd": 1.056437
        },
        {
          "mean": 5,
          "observedMean": 4.984345,
          "sd": 0.983456
        },
        {
          "mean": 5,
          "observedMean": 4.986599,
          "sd": 0.912656
        },
        {
          "mean": 5,
          "observedMean": 4.988785,
          "sd": 0.852381
        },
        {
          "mean": 5,
          "observedMean": 5.003168,
          "sd": 0.796497
        },
        {
          "mean": 5,
          "observedMean": 5.002456,
          "sd": 0.754159
        },
        {
          "mean": 5,
          "observedMean": 4.990936,
          "sd": 0.715558
        },
        {
          "mean": 5,
          "observedMean": 4.97406,
          "sd": 0.687691
        },
        {
          "mean": 5,
          "observedMean": 4.975192,
          "sd": 0.656415
        },
        {
          "mean": 5,
          "observedMean": 4.991376,
          "sd": 0.622003
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.441395,
      "sd": 3.304556,
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
          "mean": 36.831814,
          "sd": 1.584067
        },
        {
          "mean": 39.611316,
          "sd": 1.732689
        },
        {
          "mean": 42.169738,
          "sd": 1.882586
        },
        {
          "mean": 44.668533,
          "sd": 2.019372
        },
        {
          "mean": 47.120822,
          "sd": 2.156099
        },
        {
          "mean": 49.478603,
          "sd": 2.283597
        },
        {
          "mean": 51.656949,
          "sd": 2.410493
        },
        {
          "mean": 53.633515,
          "sd": 2.534007
        },
        {
          "mean": 55.565416,
          "sd": 2.664498
        },
        {
          "mean": 57.762588,
          "sd": 2.853304
        },
        {
          "mean": 60.486201,
          "sd": 3.107952
        },
        {
          "mean": 63.372159,
          "sd": 3.301869
        },
        {
          "mean": 65.798682,
          "sd": 3.360922
        },
        {
          "mean": 67.439661,
          "sd": 3.331407
        },
        {
          "mean": 68.252122,
          "sd": 3.306103
        }
      ]
    },
    "female": {
      "mean": 63.198713,
      "sd": 3.024121,
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
          "mean": 39.01303,
          "sd": 1.704257
        },
        {
          "mean": 41.673607,
          "sd": 1.858239
        },
        {
          "mean": 44.392222,
          "sd": 2.009283
        },
        {
          "mean": 47.009144,
          "sd": 2.152137
        },
        {
          "mean": 49.354605,
          "sd": 2.281825
        },
        {
          "mean": 51.423219,
          "sd": 2.414888
        },
        {
          "mean": 53.429874,
          "sd": 2.561502
        },
        {
          "mean": 55.805623,
          "sd": 2.784924
        },
        {
          "mean": 58.515593,
          "sd": 3.018141
        },
        {
          "mean": 60.859148,
          "sd": 3.108989
        },
        {
          "mean": 62.354957,
          "sd": 3.079409
        },
        {
          "mean": 63.035252,
          "sd": 3.032566
        },
        {
          "mean": 63.189112,
          "sd": 3.024363
        },
        {
          "mean": 63.198713,
          "sd": 3.024121
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
