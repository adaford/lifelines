// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1970,
      "female": 1976
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
      3987,
      3985,
      3978,
      3978,
      3974,
      3971,
      3970,
      3968,
      3966,
      3965,
      3960,
      3960,
      3958,
      3957,
      3955,
      3951,
      3949,
      3946
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
      "observedMean": 4.853857,
      "sd": 1.203559,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.013243,
          "sd": 1.20334
        },
        {
          "mean": 5,
          "observedMean": 5.17757,
          "sd": 1.195161
        },
        {
          "mean": 5,
          "observedMean": 5.337777,
          "sd": 1.189271
        },
        {
          "mean": 5,
          "observedMean": 5.356976,
          "sd": 1.187689
        },
        {
          "mean": 5,
          "observedMean": 5.366388,
          "sd": 1.188262
        },
        {
          "mean": 5,
          "observedMean": 5.369192,
          "sd": 1.186368
        },
        {
          "mean": 5,
          "observedMean": 5.336245,
          "sd": 1.186759
        },
        {
          "mean": 5,
          "observedMean": 5.300897,
          "sd": 1.187615
        },
        {
          "mean": 5,
          "observedMean": 5.265975,
          "sd": 1.189054
        },
        {
          "mean": 5,
          "observedMean": 5.231926,
          "sd": 1.189932
        },
        {
          "mean": 5,
          "observedMean": 5.198023,
          "sd": 1.191307
        },
        {
          "mean": 5,
          "observedMean": 5.161919,
          "sd": 1.189882
        },
        {
          "mean": 5,
          "observedMean": 5.12998,
          "sd": 1.186932
        },
        {
          "mean": 5,
          "observedMean": 5.096483,
          "sd": 1.189242
        },
        {
          "mean": 5,
          "observedMean": 5.052343,
          "sd": 1.192816
        },
        {
          "mean": 5,
          "observedMean": 5.002061,
          "sd": 1.197602
        },
        {
          "mean": 5,
          "observedMean": 4.952194,
          "sd": 1.19928
        },
        {
          "mean": 5,
          "observedMean": 4.910099,
          "sd": 1.201145
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.854638,
      "sd": 1.192242,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.025425,
          "sd": 1.223054
        },
        {
          "mean": 5,
          "observedMean": 5.028259,
          "sd": 1.220344
        },
        {
          "mean": 5,
          "observedMean": 5.031335,
          "sd": 1.221807
        },
        {
          "mean": 5,
          "observedMean": 5.017778,
          "sd": 1.224355
        },
        {
          "mean": 5,
          "observedMean": 5.006383,
          "sd": 1.226132
        },
        {
          "mean": 5,
          "observedMean": 4.995707,
          "sd": 1.227913
        },
        {
          "mean": 5,
          "observedMean": 4.903848,
          "sd": 1.225396
        },
        {
          "mean": 5,
          "observedMean": 4.815741,
          "sd": 1.222488
        },
        {
          "mean": 5,
          "observedMean": 4.726779,
          "sd": 1.218697
        },
        {
          "mean": 5,
          "observedMean": 4.637746,
          "sd": 1.215041
        },
        {
          "mean": 5,
          "observedMean": 4.548931,
          "sd": 1.211469
        },
        {
          "mean": 5,
          "observedMean": 4.461573,
          "sd": 1.208229
        },
        {
          "mean": 5,
          "observedMean": 4.376104,
          "sd": 1.205841
        },
        {
          "mean": 5,
          "observedMean": 4.289184,
          "sd": 1.204387
        },
        {
          "mean": 5,
          "observedMean": 4.201789,
          "sd": 1.199886
        },
        {
          "mean": 5,
          "observedMean": 4.112781,
          "sd": 1.197927
        },
        {
          "mean": 5,
          "observedMean": 4.027694,
          "sd": 1.195691
        },
        {
          "mean": 5,
          "observedMean": 3.940922,
          "sd": 1.194015
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.977126,
      "sd": 1.183109,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.010893,
          "sd": 1.176351
        },
        {
          "mean": 5,
          "observedMean": 5.011981,
          "sd": 1.176967
        },
        {
          "mean": 5,
          "observedMean": 5.01336,
          "sd": 1.176856
        },
        {
          "mean": 5,
          "observedMean": 5.012861,
          "sd": 1.177337
        },
        {
          "mean": 5,
          "observedMean": 5.011207,
          "sd": 1.178476
        },
        {
          "mean": 5,
          "observedMean": 5.008802,
          "sd": 1.178287
        },
        {
          "mean": 5,
          "observedMean": 5.004102,
          "sd": 1.177787
        },
        {
          "mean": 5,
          "observedMean": 5.002083,
          "sd": 1.178082
        },
        {
          "mean": 5,
          "observedMean": 4.998183,
          "sd": 1.178721
        },
        {
          "mean": 5,
          "observedMean": 4.993626,
          "sd": 1.179458
        },
        {
          "mean": 5,
          "observedMean": 4.989723,
          "sd": 1.179581
        },
        {
          "mean": 5,
          "observedMean": 4.985697,
          "sd": 1.179885
        },
        {
          "mean": 5,
          "observedMean": 4.980912,
          "sd": 1.179753
        },
        {
          "mean": 5,
          "observedMean": 4.975515,
          "sd": 1.180685
        },
        {
          "mean": 5,
          "observedMean": 4.975863,
          "sd": 1.182084
        },
        {
          "mean": 5,
          "observedMean": 4.975848,
          "sd": 1.182805
        },
        {
          "mean": 5,
          "observedMean": 4.976315,
          "sd": 1.182029
        },
        {
          "mean": 5,
          "observedMean": 4.9765,
          "sd": 1.182613
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.498918,
      "sd": 1.297313,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03477,
          "sd": 1.221236
        },
        {
          "mean": 5,
          "observedMean": 5.052012,
          "sd": 1.223302
        },
        {
          "mean": 5,
          "observedMean": 5.069854,
          "sd": 1.224167
        },
        {
          "mean": 5,
          "observedMean": 5.088406,
          "sd": 1.227821
        },
        {
          "mean": 5,
          "observedMean": 5.09275,
          "sd": 1.234644
        },
        {
          "mean": 5,
          "observedMean": 5.088858,
          "sd": 1.238212
        },
        {
          "mean": 5,
          "observedMean": 5.039569,
          "sd": 1.23968
        },
        {
          "mean": 5,
          "observedMean": 4.984453,
          "sd": 1.243076
        },
        {
          "mean": 5,
          "observedMean": 4.94001,
          "sd": 1.246699
        },
        {
          "mean": 5,
          "observedMean": 4.894256,
          "sd": 1.244606
        },
        {
          "mean": 5,
          "observedMean": 4.85232,
          "sd": 1.246571
        },
        {
          "mean": 5,
          "observedMean": 4.80946,
          "sd": 1.247622
        },
        {
          "mean": 5,
          "observedMean": 4.761098,
          "sd": 1.25163
        },
        {
          "mean": 5,
          "observedMean": 4.718451,
          "sd": 1.258484
        },
        {
          "mean": 5,
          "observedMean": 4.670394,
          "sd": 1.267939
        },
        {
          "mean": 5,
          "observedMean": 4.62533,
          "sd": 1.280816
        },
        {
          "mean": 5,
          "observedMean": 4.585862,
          "sd": 1.281677
        },
        {
          "mean": 5,
          "observedMean": 4.536447,
          "sd": 1.292044
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.688175,
      "sd": 1.193917,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99259,
          "sd": 1.196998
        },
        {
          "mean": 5,
          "observedMean": 5.011209,
          "sd": 1.19857
        },
        {
          "mean": 5,
          "observedMean": 5.028123,
          "sd": 1.19589
        },
        {
          "mean": 5,
          "observedMean": 5.043934,
          "sd": 1.198325
        },
        {
          "mean": 5,
          "observedMean": 5.061212,
          "sd": 1.200113
        },
        {
          "mean": 5,
          "observedMean": 5.071686,
          "sd": 1.201823
        },
        {
          "mean": 5,
          "observedMean": 5.040363,
          "sd": 1.198815
        },
        {
          "mean": 5,
          "observedMean": 5.016174,
          "sd": 1.199485
        },
        {
          "mean": 5,
          "observedMean": 4.989443,
          "sd": 1.199987
        },
        {
          "mean": 5,
          "observedMean": 4.965993,
          "sd": 1.196368
        },
        {
          "mean": 5,
          "observedMean": 4.938777,
          "sd": 1.193632
        },
        {
          "mean": 5,
          "observedMean": 4.911485,
          "sd": 1.193685
        },
        {
          "mean": 5,
          "observedMean": 4.88148,
          "sd": 1.190741
        },
        {
          "mean": 5,
          "observedMean": 4.855965,
          "sd": 1.190278
        },
        {
          "mean": 5,
          "observedMean": 4.822138,
          "sd": 1.189232
        },
        {
          "mean": 5,
          "observedMean": 4.791439,
          "sd": 1.189302
        },
        {
          "mean": 5,
          "observedMean": 4.760076,
          "sd": 1.19202
        },
        {
          "mean": 5,
          "observedMean": 4.729428,
          "sd": 1.194877
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.923948,
      "sd": 1.231037,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.982348,
          "sd": 1.228623
        },
        {
          "mean": 5,
          "observedMean": 4.973557,
          "sd": 1.224363
        },
        {
          "mean": 5,
          "observedMean": 4.962783,
          "sd": 1.224613
        },
        {
          "mean": 5,
          "observedMean": 4.958723,
          "sd": 1.221627
        },
        {
          "mean": 5,
          "observedMean": 4.970143,
          "sd": 1.222268
        },
        {
          "mean": 5,
          "observedMean": 4.984351,
          "sd": 1.217735
        },
        {
          "mean": 5,
          "observedMean": 4.979582,
          "sd": 1.217105
        },
        {
          "mean": 5,
          "observedMean": 4.975227,
          "sd": 1.217469
        },
        {
          "mean": 5,
          "observedMean": 4.972041,
          "sd": 1.216202
        },
        {
          "mean": 5,
          "observedMean": 4.97061,
          "sd": 1.214903
        },
        {
          "mean": 5,
          "observedMean": 4.967738,
          "sd": 1.215058
        },
        {
          "mean": 5,
          "observedMean": 4.968884,
          "sd": 1.214951
        },
        {
          "mean": 5,
          "observedMean": 4.965144,
          "sd": 1.218284
        },
        {
          "mean": 5,
          "observedMean": 4.965993,
          "sd": 1.219445
        },
        {
          "mean": 5,
          "observedMean": 4.959308,
          "sd": 1.222297
        },
        {
          "mean": 5,
          "observedMean": 4.948824,
          "sd": 1.222597
        },
        {
          "mean": 5,
          "observedMean": 4.941792,
          "sd": 1.226505
        },
        {
          "mean": 5,
          "observedMean": 4.932672,
          "sd": 1.227632
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.076804,
      "sd": 1.286134,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018165,
          "sd": 1.206976
        },
        {
          "mean": 5,
          "observedMean": 5.122621,
          "sd": 1.20726
        },
        {
          "mean": 5,
          "observedMean": 5.224474,
          "sd": 1.207547
        },
        {
          "mean": 5,
          "observedMean": 5.201508,
          "sd": 1.211422
        },
        {
          "mean": 5,
          "observedMean": 5.197843,
          "sd": 1.216829
        },
        {
          "mean": 5,
          "observedMean": 5.19198,
          "sd": 1.222992
        },
        {
          "mean": 5,
          "observedMean": 5.188774,
          "sd": 1.22361
        },
        {
          "mean": 5,
          "observedMean": 5.185209,
          "sd": 1.229299
        },
        {
          "mean": 5,
          "observedMean": 5.182896,
          "sd": 1.22869
        },
        {
          "mean": 5,
          "observedMean": 5.183485,
          "sd": 1.23027
        },
        {
          "mean": 5,
          "observedMean": 5.181183,
          "sd": 1.234288
        },
        {
          "mean": 5,
          "observedMean": 5.178384,
          "sd": 1.234108
        },
        {
          "mean": 5,
          "observedMean": 5.172354,
          "sd": 1.244823
        },
        {
          "mean": 5,
          "observedMean": 5.169565,
          "sd": 1.248128
        },
        {
          "mean": 5,
          "observedMean": 5.146947,
          "sd": 1.252923
        },
        {
          "mean": 5,
          "observedMean": 5.132574,
          "sd": 1.264451
        },
        {
          "mean": 5,
          "observedMean": 5.111511,
          "sd": 1.270173
        },
        {
          "mean": 5,
          "observedMean": 5.095381,
          "sd": 1.28242
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.239452,
      "sd": 3.303733,
      "ages": [
        {
          "mean": 19.64866,
          "sd": 0.762276
        },
        {
          "mean": 29.81866,
          "sd": 1.134133
        },
        {
          "mean": 34.003913,
          "sd": 1.332357
        },
        {
          "mean": 37.344582,
          "sd": 1.509451
        },
        {
          "mean": 40.182472,
          "sd": 1.652243
        },
        {
          "mean": 42.795494,
          "sd": 1.78083
        },
        {
          "mean": 45.33466,
          "sd": 1.914625
        },
        {
          "mean": 47.827048,
          "sd": 2.039254
        },
        {
          "mean": 50.202892,
          "sd": 2.168238
        },
        {
          "mean": 52.409823,
          "sd": 2.297883
        },
        {
          "mean": 54.422823,
          "sd": 2.426126
        },
        {
          "mean": 56.374264,
          "sd": 2.576203
        },
        {
          "mean": 58.60999,
          "sd": 2.780399
        },
        {
          "mean": 61.358517,
          "sd": 3.065403
        },
        {
          "mean": 64.273907,
          "sd": 3.277396
        },
        {
          "mean": 66.690775,
          "sd": 3.357406
        },
        {
          "mean": 68.29721,
          "sd": 3.337713
        },
        {
          "mean": 69.06687,
          "sd": 3.313998
        }
      ]
    },
    "female": {
      "mean": 64.060911,
      "sd": 3.032606,
      "ages": [
        {
          "mean": 19.35754,
          "sd": 0.750954
        },
        {
          "mean": 29.148561,
          "sd": 1.146443
        },
        {
          "mean": 33.445311,
          "sd": 1.354495
        },
        {
          "mean": 36.957043,
          "sd": 1.52945
        },
        {
          "mean": 39.629608,
          "sd": 1.663263
        },
        {
          "mean": 42.331593,
          "sd": 1.803381
        },
        {
          "mean": 45.096283,
          "sd": 1.952195
        },
        {
          "mean": 47.745926,
          "sd": 2.095652
        },
        {
          "mean": 50.126935,
          "sd": 2.230347
        },
        {
          "mean": 52.228238,
          "sd": 2.356361
        },
        {
          "mean": 54.266992,
          "sd": 2.497423
        },
        {
          "mean": 56.679581,
          "sd": 2.723997
        },
        {
          "mean": 59.433101,
          "sd": 2.959327
        },
        {
          "mean": 61.775832,
          "sd": 3.067291
        },
        {
          "mean": 63.260828,
          "sd": 3.054328
        },
        {
          "mean": 63.910212,
          "sd": 3.031789
        },
        {
          "mean": 64.050066,
          "sd": 3.030584
        },
        {
          "mean": 64.056916,
          "sd": 3.034479
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
      "mean": 4.984562,
      "sd": 1.976421
    },
    {
      "mean": 4.996656,
      "sd": 1.954843
    },
    {
      "mean": 5.018716,
      "sd": 1.932559
    },
    {
      "mean": 5.036548,
      "sd": 1.908253
    },
    {
      "mean": 5.055788,
      "sd": 1.882851
    },
    {
      "mean": 5.06791,
      "sd": 1.863471
    },
    {
      "mean": 5.085107,
      "sd": 1.840174
    },
    {
      "mean": 5.104376,
      "sd": 1.819067
    },
    {
      "mean": 5.124492,
      "sd": 1.796365
    },
    {
      "mean": 5.140017,
      "sd": 1.777966
    },
    {
      "mean": 5.160111,
      "sd": 1.760214
    },
    {
      "mean": 5.178781,
      "sd": 1.740375
    },
    {
      "mean": 5.198819,
      "sd": 1.722896
    },
    {
      "mean": 5.2171,
      "sd": 1.704493
    },
    {
      "mean": 5.230079,
      "sd": 1.687152
    },
    {
      "mean": 5.24075,
      "sd": 1.661812
    },
    {
      "mean": 5.253656,
      "sd": 1.645554
    }
  ]
};
