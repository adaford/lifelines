// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1983,
      "female": 1979
    },
    "cryLevel": 3,
    "cryThroughAge": 1,
    "focus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2
    },
    "toddlerFocus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2,
      "creative": 2
    },
    "choices": "uniform, independent seeded draws",
    "focusPolicy": "two-point targets fitted to birth-condition budgets and active condition/event caps; spare points left unused",
    "heightUnit": "inches",
    "conditionedOn": "alive at the observed age",
    "observationsByAge": [
      4000,
      3980,
      3977,
      3977,
      3977,
      3976,
      3975,
      3975,
      3975,
      3975,
      3975,
      3973,
      3973,
      3973,
      3972,
      3971,
      3967,
      3964,
      3962
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
      "observedMean": 5.922751,
      "sd": 1.686059,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.060985,
          "sd": 2.188049
        },
        {
          "mean": 5,
          "observedMean": 5.240231,
          "sd": 2.143617
        },
        {
          "mean": 5,
          "observedMean": 5.412545,
          "sd": 2.099373
        },
        {
          "mean": 5,
          "observedMean": 5.456027,
          "sd": 2.064652
        },
        {
          "mean": 5,
          "observedMean": 5.460722,
          "sd": 2.035054
        },
        {
          "mean": 5,
          "observedMean": 5.457422,
          "sd": 2.003383
        },
        {
          "mean": 5,
          "observedMean": 5.505884,
          "sd": 1.964271
        },
        {
          "mean": 5,
          "observedMean": 5.56357,
          "sd": 1.929955
        },
        {
          "mean": 5,
          "observedMean": 5.616536,
          "sd": 1.898148
        },
        {
          "mean": 5,
          "observedMean": 5.668083,
          "sd": 1.869199
        },
        {
          "mean": 5,
          "observedMean": 5.719114,
          "sd": 1.845695
        },
        {
          "mean": 5,
          "observedMean": 5.770838,
          "sd": 1.821511
        },
        {
          "mean": 5,
          "observedMean": 5.819542,
          "sd": 1.792586
        },
        {
          "mean": 5,
          "observedMean": 5.866874,
          "sd": 1.767898
        },
        {
          "mean": 5,
          "observedMean": 5.874914,
          "sd": 1.75061
        },
        {
          "mean": 5,
          "observedMean": 5.885515,
          "sd": 1.734292
        },
        {
          "mean": 5,
          "observedMean": 5.901341,
          "sd": 1.71854
        },
        {
          "mean": 5,
          "observedMean": 5.916138,
          "sd": 1.696853
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.988054,
      "sd": 1.801141,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.036157,
          "sd": 2.205595
        },
        {
          "mean": 5,
          "observedMean": 5.046482,
          "sd": 2.174476
        },
        {
          "mean": 5,
          "observedMean": 5.055725,
          "sd": 2.144878
        },
        {
          "mean": 5,
          "observedMean": 5.039507,
          "sd": 2.114871
        },
        {
          "mean": 5,
          "observedMean": 5.025228,
          "sd": 2.08495
        },
        {
          "mean": 5,
          "observedMean": 5.010206,
          "sd": 2.059342
        },
        {
          "mean": 5,
          "observedMean": 5.010858,
          "sd": 2.034417
        },
        {
          "mean": 5,
          "observedMean": 5.010282,
          "sd": 2.01419
        },
        {
          "mean": 5,
          "observedMean": 5.01283,
          "sd": 1.993957
        },
        {
          "mean": 5,
          "observedMean": 5.01113,
          "sd": 1.969054
        },
        {
          "mean": 5,
          "observedMean": 5.010003,
          "sd": 1.948753
        },
        {
          "mean": 5,
          "observedMean": 5.009328,
          "sd": 1.93046
        },
        {
          "mean": 5,
          "observedMean": 5.010086,
          "sd": 1.908841
        },
        {
          "mean": 5,
          "observedMean": 5.012847,
          "sd": 1.893568
        },
        {
          "mean": 5,
          "observedMean": 5.007988,
          "sd": 1.872634
        },
        {
          "mean": 5,
          "observedMean": 5.003233,
          "sd": 1.852838
        },
        {
          "mean": 5,
          "observedMean": 4.997242,
          "sd": 1.834783
        },
        {
          "mean": 5,
          "observedMean": 4.990396,
          "sd": 1.816556
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.876047,
      "sd": 1.943754,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.945897,
          "sd": 2.030087
        },
        {
          "mean": 5,
          "observedMean": 4.943523,
          "sd": 2.024537
        },
        {
          "mean": 5,
          "observedMean": 4.943608,
          "sd": 2.021326
        },
        {
          "mean": 5,
          "observedMean": 4.934868,
          "sd": 2.015683
        },
        {
          "mean": 5,
          "observedMean": 4.926927,
          "sd": 2.012083
        },
        {
          "mean": 5,
          "observedMean": 4.917261,
          "sd": 2.007162
        },
        {
          "mean": 5,
          "observedMean": 4.910687,
          "sd": 2.00271
        },
        {
          "mean": 5,
          "observedMean": 4.902835,
          "sd": 1.997505
        },
        {
          "mean": 5,
          "observedMean": 4.895011,
          "sd": 1.992336
        },
        {
          "mean": 5,
          "observedMean": 4.887952,
          "sd": 1.986886
        },
        {
          "mean": 5,
          "observedMean": 4.879477,
          "sd": 1.982109
        },
        {
          "mean": 5,
          "observedMean": 4.871681,
          "sd": 1.976632
        },
        {
          "mean": 5,
          "observedMean": 4.864835,
          "sd": 1.973144
        },
        {
          "mean": 5,
          "observedMean": 4.858492,
          "sd": 1.969321
        },
        {
          "mean": 5,
          "observedMean": 4.860186,
          "sd": 1.964634
        },
        {
          "mean": 5,
          "observedMean": 4.865739,
          "sd": 1.95943
        },
        {
          "mean": 5,
          "observedMean": 4.869985,
          "sd": 1.953159
        },
        {
          "mean": 5,
          "observedMean": 4.872455,
          "sd": 1.947714
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.116497,
      "sd": 1.693881,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99889,
          "sd": 2.220147
        },
        {
          "mean": 5,
          "observedMean": 5.053741,
          "sd": 2.174811
        },
        {
          "mean": 5,
          "observedMean": 5.110432,
          "sd": 2.134748
        },
        {
          "mean": 5,
          "observedMean": 5.180241,
          "sd": 2.094952
        },
        {
          "mean": 5,
          "observedMean": 5.212746,
          "sd": 2.062824
        },
        {
          "mean": 5,
          "observedMean": 5.225335,
          "sd": 2.032266
        },
        {
          "mean": 5,
          "observedMean": 5.294536,
          "sd": 2.000623
        },
        {
          "mean": 5,
          "observedMean": 5.37835,
          "sd": 1.966826
        },
        {
          "mean": 5,
          "observedMean": 5.466953,
          "sd": 1.930217
        },
        {
          "mean": 5,
          "observedMean": 5.545673,
          "sd": 1.903655
        },
        {
          "mean": 5,
          "observedMean": 5.626131,
          "sd": 1.87223
        },
        {
          "mean": 5,
          "observedMean": 5.702786,
          "sd": 1.845751
        },
        {
          "mean": 5,
          "observedMean": 5.784878,
          "sd": 1.814424
        },
        {
          "mean": 5,
          "observedMean": 5.86857,
          "sd": 1.791343
        },
        {
          "mean": 5,
          "observedMean": 5.923439,
          "sd": 1.769394
        },
        {
          "mean": 5,
          "observedMean": 5.980499,
          "sd": 1.749702
        },
        {
          "mean": 5,
          "observedMean": 6.036844,
          "sd": 1.736471
        },
        {
          "mean": 5,
          "observedMean": 6.081685,
          "sd": 1.714914
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.091731,
      "sd": 1.744801,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043035,
          "sd": 2.202419
        },
        {
          "mean": 5,
          "observedMean": 5.064623,
          "sd": 2.170861
        },
        {
          "mean": 5,
          "observedMean": 5.087113,
          "sd": 2.137523
        },
        {
          "mean": 5,
          "observedMean": 5.126035,
          "sd": 2.106645
        },
        {
          "mean": 5,
          "observedMean": 5.152195,
          "sd": 2.081949
        },
        {
          "mean": 5,
          "observedMean": 5.162686,
          "sd": 2.055783
        },
        {
          "mean": 5,
          "observedMean": 5.23356,
          "sd": 2.026209
        },
        {
          "mean": 5,
          "observedMean": 5.320503,
          "sd": 1.997613
        },
        {
          "mean": 5,
          "observedMean": 5.401182,
          "sd": 1.969494
        },
        {
          "mean": 5,
          "observedMean": 5.481532,
          "sd": 1.938358
        },
        {
          "mean": 5,
          "observedMean": 5.563034,
          "sd": 1.915273
        },
        {
          "mean": 5,
          "observedMean": 5.641679,
          "sd": 1.894052
        },
        {
          "mean": 5,
          "observedMean": 5.716761,
          "sd": 1.867414
        },
        {
          "mean": 5,
          "observedMean": 5.790194,
          "sd": 1.846753
        },
        {
          "mean": 5,
          "observedMean": 5.85786,
          "sd": 1.824299
        },
        {
          "mean": 5,
          "observedMean": 5.924815,
          "sd": 1.802889
        },
        {
          "mean": 5,
          "observedMean": 5.989564,
          "sd": 1.784965
        },
        {
          "mean": 5,
          "observedMean": 6.053842,
          "sd": 1.767752
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.008968,
      "sd": 0.685068,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.900375,
          "sd": 2.197731
        },
        {
          "mean": 5,
          "observedMean": 4.894947,
          "sd": 2.033701
        },
        {
          "mean": 5,
          "observedMean": 4.885695,
          "sd": 1.881743
        },
        {
          "mean": 5,
          "observedMean": 4.885283,
          "sd": 1.74889
        },
        {
          "mean": 5,
          "observedMean": 4.922937,
          "sd": 1.622116
        },
        {
          "mean": 5,
          "observedMean": 4.956766,
          "sd": 1.509551
        },
        {
          "mean": 5,
          "observedMean": 4.976108,
          "sd": 1.405545
        },
        {
          "mean": 5,
          "observedMean": 4.993623,
          "sd": 1.31008
        },
        {
          "mean": 5,
          "observedMean": 5.009701,
          "sd": 1.224535
        },
        {
          "mean": 5,
          "observedMean": 5.025766,
          "sd": 1.142481
        },
        {
          "mean": 5,
          "observedMean": 5.038697,
          "sd": 1.067048
        },
        {
          "mean": 5,
          "observedMean": 5.053254,
          "sd": 1.001902
        },
        {
          "mean": 5,
          "observedMean": 5.064953,
          "sd": 0.938644
        },
        {
          "mean": 5,
          "observedMean": 5.075087,
          "sd": 0.87812
        },
        {
          "mean": 5,
          "observedMean": 5.056208,
          "sd": 0.835728
        },
        {
          "mean": 5,
          "observedMean": 5.043697,
          "sd": 0.793572
        },
        {
          "mean": 5,
          "observedMean": 5.030567,
          "sd": 0.754
        },
        {
          "mean": 5,
          "observedMean": 5.020878,
          "sd": 0.71856
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.162547,
      "sd": 0.865708,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981425,
          "sd": 2.23032
        },
        {
          "mean": 5,
          "observedMean": 5.127191,
          "sd": 2.019901
        },
        {
          "mean": 5,
          "observedMean": 5.251954,
          "sd": 1.836687
        },
        {
          "mean": 5,
          "observedMean": 5.208675,
          "sd": 1.653085
        },
        {
          "mean": 5,
          "observedMean": 5.217428,
          "sd": 1.496728
        },
        {
          "mean": 5,
          "observedMean": 5.224874,
          "sd": 1.364704
        },
        {
          "mean": 5,
          "observedMean": 5.221615,
          "sd": 1.250057
        },
        {
          "mean": 5,
          "observedMean": 5.204005,
          "sd": 1.157005
        },
        {
          "mean": 5,
          "observedMean": 5.187125,
          "sd": 1.078409
        },
        {
          "mean": 5,
          "observedMean": 5.172569,
          "sd": 1.031182
        },
        {
          "mean": 5,
          "observedMean": 5.157208,
          "sd": 0.976419
        },
        {
          "mean": 5,
          "observedMean": 5.147976,
          "sd": 0.933627
        },
        {
          "mean": 5,
          "observedMean": 5.153194,
          "sd": 0.891601
        },
        {
          "mean": 5,
          "observedMean": 5.155517,
          "sd": 0.870062
        },
        {
          "mean": 5,
          "observedMean": 5.154544,
          "sd": 0.866994
        },
        {
          "mean": 5,
          "observedMean": 5.15415,
          "sd": 0.869878
        },
        {
          "mean": 5,
          "observedMean": 5.166733,
          "sd": 0.866362
        },
        {
          "mean": 5,
          "observedMean": 5.162364,
          "sd": 0.869022
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.426465,
      "sd": 3.45316,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.450608,
          "sd": 1.200944
        },
        {
          "mean": 33.525953,
          "sd": 1.432138
        },
        {
          "mean": 36.7728,
          "sd": 1.625202
        },
        {
          "mean": 39.551297,
          "sd": 1.790513
        },
        {
          "mean": 42.114178,
          "sd": 1.943208
        },
        {
          "mean": 44.604274,
          "sd": 2.084082
        },
        {
          "mean": 47.062177,
          "sd": 2.232279
        },
        {
          "mean": 49.422775,
          "sd": 2.368903
        },
        {
          "mean": 51.61188,
          "sd": 2.497533
        },
        {
          "mean": 53.609306,
          "sd": 2.624589
        },
        {
          "mean": 55.560045,
          "sd": 2.764711
        },
        {
          "mean": 57.781952,
          "sd": 2.961768
        },
        {
          "mean": 60.52337,
          "sd": 3.234626
        },
        {
          "mean": 63.422183,
          "sd": 3.430097
        },
        {
          "mean": 65.840795,
          "sd": 3.491681
        },
        {
          "mean": 67.461073,
          "sd": 3.471934
        },
        {
          "mean": 68.249158,
          "sd": 3.452601
        }
      ]
    },
    "female": {
      "mean": 63.267746,
      "sd": 3.04366,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.847291,
          "sd": 1.184233
        },
        {
          "mean": 33.026585,
          "sd": 1.409951
        },
        {
          "mean": 36.451313,
          "sd": 1.60214
        },
        {
          "mean": 39.067339,
          "sd": 1.750616
        },
        {
          "mean": 41.714836,
          "sd": 1.898423
        },
        {
          "mean": 44.424924,
          "sd": 2.053382
        },
        {
          "mean": 47.04569,
          "sd": 2.196545
        },
        {
          "mean": 49.399421,
          "sd": 2.324178
        },
        {
          "mean": 51.470363,
          "sd": 2.442572
        },
        {
          "mean": 53.472633,
          "sd": 2.565971
        },
        {
          "mean": 55.841698,
          "sd": 2.762714
        },
        {
          "mean": 58.55333,
          "sd": 2.975813
        },
        {
          "mean": 60.911995,
          "sd": 3.08045
        },
        {
          "mean": 62.423296,
          "sd": 3.074352
        },
        {
          "mean": 63.10995,
          "sd": 3.053098
        },
        {
          "mean": 63.261488,
          "sd": 3.044936
        },
        {
          "mean": 63.267909,
          "sd": 3.0429
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
      "mean": 5.077558,
      "sd": 1.975365
    },
    {
      "mean": 5.180732,
      "sd": 1.958572
    },
    {
      "mean": 5.282982,
      "sd": 1.932743
    },
    {
      "mean": 5.384991,
      "sd": 1.910756
    },
    {
      "mean": 5.490752,
      "sd": 1.889793
    },
    {
      "mean": 5.594065,
      "sd": 1.867914
    },
    {
      "mean": 5.692709,
      "sd": 1.847029
    },
    {
      "mean": 5.790465,
      "sd": 1.824244
    },
    {
      "mean": 5.884551,
      "sd": 1.801222
    },
    {
      "mean": 5.982536,
      "sd": 1.779401
    },
    {
      "mean": 6.073604,
      "sd": 1.757164
    },
    {
      "mean": 6.160093,
      "sd": 1.73093
    },
    {
      "mean": 6.249338,
      "sd": 1.709986
    },
    {
      "mean": 6.332963,
      "sd": 1.693457
    },
    {
      "mean": 6.416799,
      "sd": 1.676873
    },
    {
      "mean": 6.501966,
      "sd": 1.653853
    },
    {
      "mean": 6.585068,
      "sd": 1.635304
    }
  ]
};
