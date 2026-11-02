// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1982,
      "female": 1980
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
    "focusPolicy": "core two-point targets with optional school activities unenrolled; fitted to birth-condition budgets and active condition/event caps; spare points left unused",
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
      3973,
      3973,
      3973,
      3973,
      3972,
      3972,
      3972,
      3971,
      3968,
      3965,
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
      "observedMean": 6.028988,
      "sd": 1.66907,
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
          "observedMean": 5.453918,
          "sd": 2.064722
        },
        {
          "mean": 5,
          "observedMean": 5.449917,
          "sd": 2.037205
        },
        {
          "mean": 5,
          "observedMean": 5.439323,
          "sd": 2.006562
        },
        {
          "mean": 5,
          "observedMean": 5.501295,
          "sd": 1.968367
        },
        {
          "mean": 5,
          "observedMean": 5.558154,
          "sd": 1.933788
        },
        {
          "mean": 5,
          "observedMean": 5.623614,
          "sd": 1.895399
        },
        {
          "mean": 5,
          "observedMean": 5.686021,
          "sd": 1.866706
        },
        {
          "mean": 5,
          "observedMean": 5.748588,
          "sd": 1.836066
        },
        {
          "mean": 5,
          "observedMean": 5.809124,
          "sd": 1.806948
        },
        {
          "mean": 5,
          "observedMean": 5.864413,
          "sd": 1.78372
        },
        {
          "mean": 5,
          "observedMean": 5.918862,
          "sd": 1.757247
        },
        {
          "mean": 5,
          "observedMean": 5.945828,
          "sd": 1.740593
        },
        {
          "mean": 5,
          "observedMean": 5.970171,
          "sd": 1.723893
        },
        {
          "mean": 5,
          "observedMean": 5.992697,
          "sd": 1.704235
        },
        {
          "mean": 5,
          "observedMean": 6.019836,
          "sd": 1.68348
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.992706,
      "sd": 1.796258,
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
          "observedMean": 5.006195,
          "sd": 2.033158
        },
        {
          "mean": 5,
          "observedMean": 5.006922,
          "sd": 2.011644
        },
        {
          "mean": 5,
          "observedMean": 5.01003,
          "sd": 1.99075
        },
        {
          "mean": 5,
          "observedMean": 5.010838,
          "sd": 1.967464
        },
        {
          "mean": 5,
          "observedMean": 5.011246,
          "sd": 1.946938
        },
        {
          "mean": 5,
          "observedMean": 5.014115,
          "sd": 1.927769
        },
        {
          "mean": 5,
          "observedMean": 5.018766,
          "sd": 1.908706
        },
        {
          "mean": 5,
          "observedMean": 5.019293,
          "sd": 1.890511
        },
        {
          "mean": 5,
          "observedMean": 5.013167,
          "sd": 1.870748
        },
        {
          "mean": 5,
          "observedMean": 5.005988,
          "sd": 1.85118
        },
        {
          "mean": 5,
          "observedMean": 5.005522,
          "sd": 1.833952
        },
        {
          "mean": 5,
          "observedMean": 4.999443,
          "sd": 1.814314
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.881711,
      "sd": 1.94799,
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
          "observedMean": 4.909386,
          "sd": 2.002054
        },
        {
          "mean": 5,
          "observedMean": 4.902077,
          "sd": 1.996582
        },
        {
          "mean": 5,
          "observedMean": 4.895882,
          "sd": 1.992041
        },
        {
          "mean": 5,
          "observedMean": 4.88846,
          "sd": 1.988346
        },
        {
          "mean": 5,
          "observedMean": 4.88191,
          "sd": 1.983617
        },
        {
          "mean": 5,
          "observedMean": 4.87481,
          "sd": 1.978384
        },
        {
          "mean": 5,
          "observedMean": 4.867608,
          "sd": 1.97302
        },
        {
          "mean": 5,
          "observedMean": 4.859887,
          "sd": 1.968291
        },
        {
          "mean": 5,
          "observedMean": 4.86567,
          "sd": 1.963067
        },
        {
          "mean": 5,
          "observedMean": 4.869338,
          "sd": 1.95944
        },
        {
          "mean": 5,
          "observedMean": 4.873165,
          "sd": 1.954445
        },
        {
          "mean": 5,
          "observedMean": 4.878224,
          "sd": 1.951684
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.045505,
      "sd": 1.697761,
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
          "observedMean": 5.209532,
          "sd": 2.06255
        },
        {
          "mean": 5,
          "observedMean": 5.21963,
          "sd": 2.032273
        },
        {
          "mean": 5,
          "observedMean": 5.284351,
          "sd": 1.999695
        },
        {
          "mean": 5,
          "observedMean": 5.357369,
          "sd": 1.970587
        },
        {
          "mean": 5,
          "observedMean": 5.429177,
          "sd": 1.934596
        },
        {
          "mean": 5,
          "observedMean": 5.502494,
          "sd": 1.90531
        },
        {
          "mean": 5,
          "observedMean": 5.578183,
          "sd": 1.871175
        },
        {
          "mean": 5,
          "observedMean": 5.652044,
          "sd": 1.84213
        },
        {
          "mean": 5,
          "observedMean": 5.7286,
          "sd": 1.817064
        },
        {
          "mean": 5,
          "observedMean": 5.797044,
          "sd": 1.789915
        },
        {
          "mean": 5,
          "observedMean": 5.850619,
          "sd": 1.773694
        },
        {
          "mean": 5,
          "observedMean": 5.902022,
          "sd": 1.75093
        },
        {
          "mean": 5,
          "observedMean": 5.953627,
          "sd": 1.725943
        },
        {
          "mean": 5,
          "observedMean": 6.005725,
          "sd": 1.710845
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.127355,
      "sd": 1.713638,
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
          "observedMean": 5.239982,
          "sd": 2.026211
        },
        {
          "mean": 5,
          "observedMean": 5.32617,
          "sd": 1.997753
        },
        {
          "mean": 5,
          "observedMean": 5.411805,
          "sd": 1.96677
        },
        {
          "mean": 5,
          "observedMean": 5.498263,
          "sd": 1.939147
        },
        {
          "mean": 5,
          "observedMean": 5.581732,
          "sd": 1.910309
        },
        {
          "mean": 5,
          "observedMean": 5.660284,
          "sd": 1.885689
        },
        {
          "mean": 5,
          "observedMean": 5.73393,
          "sd": 1.860658
        },
        {
          "mean": 5,
          "observedMean": 5.808857,
          "sd": 1.836458
        },
        {
          "mean": 5,
          "observedMean": 5.881579,
          "sd": 1.809566
        },
        {
          "mean": 5,
          "observedMean": 5.952611,
          "sd": 1.784442
        },
        {
          "mean": 5,
          "observedMean": 6.016953,
          "sd": 1.758197
        },
        {
          "mean": 5,
          "observedMean": 6.086913,
          "sd": 1.735921
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.994361,
      "sd": 0.699669,
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
          "observedMean": 4.973335,
          "sd": 1.404581
        },
        {
          "mean": 5,
          "observedMean": 4.987696,
          "sd": 1.308241
        },
        {
          "mean": 5,
          "observedMean": 4.999263,
          "sd": 1.221225
        },
        {
          "mean": 5,
          "observedMean": 5.013687,
          "sd": 1.140033
        },
        {
          "mean": 5,
          "observedMean": 5.025834,
          "sd": 1.066819
        },
        {
          "mean": 5,
          "observedMean": 5.03966,
          "sd": 0.998615
        },
        {
          "mean": 5,
          "observedMean": 5.050778,
          "sd": 0.935409
        },
        {
          "mean": 5,
          "observedMean": 5.063484,
          "sd": 0.878552
        },
        {
          "mean": 5,
          "observedMean": 5.048419,
          "sd": 0.836034
        },
        {
          "mean": 5,
          "observedMean": 5.033765,
          "sd": 0.793865
        },
        {
          "mean": 5,
          "observedMean": 5.019531,
          "sd": 0.763807
        },
        {
          "mean": 5,
          "observedMean": 5.006825,
          "sd": 0.730425
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.133397,
      "sd": 0.836864,
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
          "observedMean": 5.218114,
          "sd": 1.496463
        },
        {
          "mean": 5,
          "observedMean": 5.226693,
          "sd": 1.364446
        },
        {
          "mean": 5,
          "observedMean": 5.211099,
          "sd": 1.244257
        },
        {
          "mean": 5,
          "observedMean": 5.189037,
          "sd": 1.149008
        },
        {
          "mean": 5,
          "observedMean": 5.168492,
          "sd": 1.081316
        },
        {
          "mean": 5,
          "observedMean": 5.154465,
          "sd": 1.023991
        },
        {
          "mean": 5,
          "observedMean": 5.146383,
          "sd": 0.970299
        },
        {
          "mean": 5,
          "observedMean": 5.143033,
          "sd": 0.921993
        },
        {
          "mean": 5,
          "observedMean": 5.138505,
          "sd": 0.889035
        },
        {
          "mean": 5,
          "observedMean": 5.134683,
          "sd": 0.863958
        },
        {
          "mean": 5,
          "observedMean": 5.134821,
          "sd": 0.850034
        },
        {
          "mean": 5,
          "observedMean": 5.130088,
          "sd": 0.840111
        },
        {
          "mean": 5,
          "observedMean": 5.130648,
          "sd": 0.834042
        },
        {
          "mean": 5,
          "observedMean": 5.128212,
          "sd": 0.839431
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.429183,
      "sd": 3.409102,
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
          "mean": 44.615214,
          "sd": 2.087091
        },
        {
          "mean": 47.068904,
          "sd": 2.231702
        },
        {
          "mean": 49.428124,
          "sd": 2.362772
        },
        {
          "mean": 51.612002,
          "sd": 2.492547
        },
        {
          "mean": 53.603768,
          "sd": 2.621422
        },
        {
          "mean": 55.551896,
          "sd": 2.758992
        },
        {
          "mean": 57.780387,
          "sd": 2.961481
        },
        {
          "mean": 60.518104,
          "sd": 3.215669
        },
        {
          "mean": 63.4241,
          "sd": 3.397427
        },
        {
          "mean": 65.841349,
          "sd": 3.461991
        },
        {
          "mean": 67.460403,
          "sd": 3.439945
        },
        {
          "mean": 68.248502,
          "sd": 3.412279
        }
      ]
    },
    "female": {
      "mean": 63.249652,
      "sd": 3.053768,
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
          "mean": 44.429235,
          "sd": 2.050803
        },
        {
          "mean": 47.03391,
          "sd": 2.194307
        },
        {
          "mean": 49.388589,
          "sd": 2.325393
        },
        {
          "mean": 51.456882,
          "sd": 2.439466
        },
        {
          "mean": 53.468272,
          "sd": 2.571033
        },
        {
          "mean": 55.839612,
          "sd": 2.774791
        },
        {
          "mean": 58.548987,
          "sd": 2.989935
        },
        {
          "mean": 60.899672,
          "sd": 3.097492
        },
        {
          "mean": 62.405267,
          "sd": 3.089059
        },
        {
          "mean": 63.092354,
          "sd": 3.069395
        },
        {
          "mean": 63.244513,
          "sd": 3.055581
        },
        {
          "mean": 63.249672,
          "sd": 3.052264
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
      "mean": 5.591388,
      "sd": 1.874499
    },
    {
      "mean": 5.69087,
      "sd": 1.851535
    },
    {
      "mean": 5.790126,
      "sd": 1.826881
    },
    {
      "mean": 5.882718,
      "sd": 1.809437
    },
    {
      "mean": 5.977387,
      "sd": 1.789421
    },
    {
      "mean": 6.071309,
      "sd": 1.768427
    },
    {
      "mean": 6.165521,
      "sd": 1.748235
    },
    {
      "mean": 6.25431,
      "sd": 1.729712
    },
    {
      "mean": 6.332893,
      "sd": 1.713366
    },
    {
      "mean": 6.417084,
      "sd": 1.691572
    },
    {
      "mean": 6.503228,
      "sd": 1.674396
    },
    {
      "mean": 6.58429,
      "sd": 1.657814
    }
  ]
};
