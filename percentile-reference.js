// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1979,
      "female": 1983
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
      3979,
      3973,
      3972,
      3971,
      3971,
      3971,
      3971,
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
        "intelligence": -0.034144,
        "strength": -0.005709,
        "social": -0.033055,
        "creativity": -0.033106
      },
      "wellbeingTarget": {
        "health": 5.029503,
        "stability": 4.708605
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
      "observedMean": 5.015313,
      "sd": 2.194953,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07186,
          "sd": 2.303494
        },
        {
          "mean": 5,
          "observedMean": 5.067454,
          "sd": 2.284838
        },
        {
          "mean": 5,
          "observedMean": 5.060312,
          "sd": 2.271495
        },
        {
          "mean": 5,
          "observedMean": 5.03997,
          "sd": 2.257932
        },
        {
          "mean": 5,
          "observedMean": 5.019139,
          "sd": 2.243688
        },
        {
          "mean": 5,
          "observedMean": 5.00006,
          "sd": 2.231415
        },
        {
          "mean": 5,
          "observedMean": 4.985898,
          "sd": 2.217563
        },
        {
          "mean": 5,
          "observedMean": 5.003692,
          "sd": 2.228273
        },
        {
          "mean": 5,
          "observedMean": 5.027173,
          "sd": 2.237313
        },
        {
          "mean": 5,
          "observedMean": 5.021542,
          "sd": 2.229548
        },
        {
          "mean": 5,
          "observedMean": 5.032091,
          "sd": 2.229963
        },
        {
          "mean": 5,
          "observedMean": 5.036352,
          "sd": 2.227999
        },
        {
          "mean": 5,
          "observedMean": 5.043457,
          "sd": 2.228747
        },
        {
          "mean": 5,
          "observedMean": 5.047987,
          "sd": 2.218522
        },
        {
          "mean": 5,
          "observedMean": 5.031971,
          "sd": 2.211462
        },
        {
          "mean": 5,
          "observedMean": 5.02128,
          "sd": 2.211794
        },
        {
          "mean": 5,
          "observedMean": 5.028179,
          "sd": 2.208408
        },
        {
          "mean": 5,
          "observedMean": 5.018792,
          "sd": 2.208372
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.003574,
      "sd": 2.092194,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.01008,
          "sd": 2.297584
        },
        {
          "mean": 5,
          "observedMean": 5.003973,
          "sd": 2.288107
        },
        {
          "mean": 5,
          "observedMean": 5.007614,
          "sd": 2.273215
        },
        {
          "mean": 5,
          "observedMean": 5.010277,
          "sd": 2.261657
        },
        {
          "mean": 5,
          "observedMean": 4.984697,
          "sd": 2.25732
        },
        {
          "mean": 5,
          "observedMean": 4.977711,
          "sd": 2.24244
        },
        {
          "mean": 5,
          "observedMean": 4.982732,
          "sd": 2.228677
        },
        {
          "mean": 5,
          "observedMean": 4.982727,
          "sd": 2.21864
        },
        {
          "mean": 5,
          "observedMean": 4.987564,
          "sd": 2.209472
        },
        {
          "mean": 5,
          "observedMean": 4.988962,
          "sd": 2.192833
        },
        {
          "mean": 5,
          "observedMean": 4.990292,
          "sd": 2.188777
        },
        {
          "mean": 5,
          "observedMean": 4.997999,
          "sd": 2.178382
        },
        {
          "mean": 5,
          "observedMean": 5.004948,
          "sd": 2.16502
        },
        {
          "mean": 5,
          "observedMean": 5.003578,
          "sd": 2.160689
        },
        {
          "mean": 5,
          "observedMean": 5.020045,
          "sd": 2.129851
        },
        {
          "mean": 5,
          "observedMean": 5.017818,
          "sd": 2.122594
        },
        {
          "mean": 5,
          "observedMean": 5.014504,
          "sd": 2.111397
        },
        {
          "mean": 5,
          "observedMean": 5.006554,
          "sd": 2.104055
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 5.018349,
      "sd": 1.987876,
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
          "observedMean": 5.009164,
          "sd": 1.985731
        },
        {
          "mean": 5,
          "observedMean": 5.00858,
          "sd": 1.985948
        },
        {
          "mean": 5,
          "observedMean": 5.009411,
          "sd": 1.985724
        },
        {
          "mean": 5,
          "observedMean": 5.009839,
          "sd": 1.985348
        },
        {
          "mean": 5,
          "observedMean": 5.008844,
          "sd": 1.985356
        },
        {
          "mean": 5,
          "observedMean": 5.008816,
          "sd": 1.985565
        },
        {
          "mean": 5,
          "observedMean": 5.009489,
          "sd": 1.985906
        },
        {
          "mean": 5,
          "observedMean": 5.010328,
          "sd": 1.985874
        },
        {
          "mean": 5,
          "observedMean": 5.010428,
          "sd": 1.984917
        },
        {
          "mean": 5,
          "observedMean": 5.01036,
          "sd": 1.984968
        },
        {
          "mean": 5,
          "observedMean": 5.010456,
          "sd": 1.985819
        },
        {
          "mean": 5,
          "observedMean": 5.011656,
          "sd": 1.986091
        },
        {
          "mean": 5,
          "observedMean": 5.013574,
          "sd": 1.986404
        },
        {
          "mean": 5,
          "observedMean": 5.013773,
          "sd": 1.987264
        },
        {
          "mean": 5,
          "observedMean": 5.016065,
          "sd": 1.987594
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.010492,
      "sd": 2.110014,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.04187,
          "sd": 2.317953
        },
        {
          "mean": 5,
          "observedMean": 5.036567,
          "sd": 2.300091
        },
        {
          "mean": 5,
          "observedMean": 5.032288,
          "sd": 2.277139
        },
        {
          "mean": 5,
          "observedMean": 5.01537,
          "sd": 2.254163
        },
        {
          "mean": 5,
          "observedMean": 4.984525,
          "sd": 2.246995
        },
        {
          "mean": 5,
          "observedMean": 4.966751,
          "sd": 2.232909
        },
        {
          "mean": 5,
          "observedMean": 4.945266,
          "sd": 2.215133
        },
        {
          "mean": 5,
          "observedMean": 4.943181,
          "sd": 2.216022
        },
        {
          "mean": 5,
          "observedMean": 4.953442,
          "sd": 2.202744
        },
        {
          "mean": 5,
          "observedMean": 4.955697,
          "sd": 2.19249
        },
        {
          "mean": 5,
          "observedMean": 4.957695,
          "sd": 2.184571
        },
        {
          "mean": 5,
          "observedMean": 4.966054,
          "sd": 2.168378
        },
        {
          "mean": 5,
          "observedMean": 4.966367,
          "sd": 2.158948
        },
        {
          "mean": 5,
          "observedMean": 4.970874,
          "sd": 2.14938
        },
        {
          "mean": 5,
          "observedMean": 4.969952,
          "sd": 2.14381
        },
        {
          "mean": 5,
          "observedMean": 4.968352,
          "sd": 2.129949
        },
        {
          "mean": 5,
          "observedMean": 4.972699,
          "sd": 2.126136
        },
        {
          "mean": 5,
          "observedMean": 4.989856,
          "sd": 2.121347
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.011585,
      "sd": 2.170947,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.049875,
          "sd": 2.284212
        },
        {
          "mean": 5,
          "observedMean": 5.042252,
          "sd": 2.27483
        },
        {
          "mean": 5,
          "observedMean": 5.028674,
          "sd": 2.262319
        },
        {
          "mean": 5,
          "observedMean": 5.019695,
          "sd": 2.250101
        },
        {
          "mean": 5,
          "observedMean": 5.022692,
          "sd": 2.255558
        },
        {
          "mean": 5,
          "observedMean": 5.03305,
          "sd": 2.256894
        },
        {
          "mean": 5,
          "observedMean": 5.022871,
          "sd": 2.243098
        },
        {
          "mean": 5,
          "observedMean": 5.028567,
          "sd": 2.247555
        },
        {
          "mean": 5,
          "observedMean": 5.033157,
          "sd": 2.245994
        },
        {
          "mean": 5,
          "observedMean": 5.03135,
          "sd": 2.232039
        },
        {
          "mean": 5,
          "observedMean": 5.025724,
          "sd": 2.219685
        },
        {
          "mean": 5,
          "observedMean": 5.018022,
          "sd": 2.218587
        },
        {
          "mean": 5,
          "observedMean": 5.017748,
          "sd": 2.211161
        },
        {
          "mean": 5,
          "observedMean": 5.020448,
          "sd": 2.203739
        },
        {
          "mean": 5,
          "observedMean": 5.01936,
          "sd": 2.199042
        },
        {
          "mean": 5,
          "observedMean": 5.01659,
          "sd": 2.184539
        },
        {
          "mean": 5,
          "observedMean": 5.009839,
          "sd": 2.179774
        },
        {
          "mean": 5,
          "observedMean": 5.011284,
          "sd": 2.17594
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5,
      "sd": 0.691172,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.001625,
          "sd": 1.964763
        },
        {
          "mean": 5,
          "observedMean": 4.959593,
          "sd": 1.868842
        },
        {
          "mean": 5,
          "observedMean": 4.958669,
          "sd": 1.758658
        },
        {
          "mean": 5,
          "observedMean": 4.961027,
          "sd": 1.654386
        },
        {
          "mean": 5,
          "observedMean": 4.988456,
          "sd": 1.552031
        },
        {
          "mean": 5,
          "observedMean": 4.988746,
          "sd": 1.463865
        },
        {
          "mean": 5,
          "observedMean": 4.998413,
          "sd": 1.374498
        },
        {
          "mean": 5,
          "observedMean": 5.002737,
          "sd": 1.300426
        },
        {
          "mean": 5,
          "observedMean": 5.002285,
          "sd": 1.224979
        },
        {
          "mean": 5,
          "observedMean": 5.006342,
          "sd": 1.156038
        },
        {
          "mean": 5,
          "observedMean": 5.009373,
          "sd": 1.082003
        },
        {
          "mean": 5,
          "observedMean": 5.012577,
          "sd": 1.015164
        },
        {
          "mean": 5,
          "observedMean": 5.016233,
          "sd": 0.960056
        },
        {
          "mean": 5,
          "observedMean": 5.013777,
          "sd": 0.908245
        },
        {
          "mean": 5,
          "observedMean": 5.022467,
          "sd": 0.853208
        },
        {
          "mean": 5,
          "observedMean": 5.014718,
          "sd": 0.8151
        },
        {
          "mean": 5,
          "observedMean": 5.014116,
          "sd": 0.762872
        },
        {
          "mean": 5,
          "observedMean": 5.002788,
          "sd": 0.727825
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.000096,
      "sd": 0.601579,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043827,
          "sd": 1.947156
        },
        {
          "mean": 5,
          "observedMean": 5.021257,
          "sd": 1.809374
        },
        {
          "mean": 5,
          "observedMean": 5.025412,
          "sd": 1.682385
        },
        {
          "mean": 5,
          "observedMean": 5.001735,
          "sd": 1.548867
        },
        {
          "mean": 5,
          "observedMean": 4.998751,
          "sd": 1.421338
        },
        {
          "mean": 5,
          "observedMean": 4.992838,
          "sd": 1.315078
        },
        {
          "mean": 5,
          "observedMean": 4.983007,
          "sd": 1.219298
        },
        {
          "mean": 5,
          "observedMean": 4.972445,
          "sd": 1.132456
        },
        {
          "mean": 5,
          "observedMean": 4.984815,
          "sd": 1.055942
        },
        {
          "mean": 5,
          "observedMean": 4.99031,
          "sd": 0.977902
        },
        {
          "mean": 5,
          "observedMean": 4.99422,
          "sd": 0.91425
        },
        {
          "mean": 5,
          "observedMean": 5.00253,
          "sd": 0.85117
        },
        {
          "mean": 5,
          "observedMean": 5.007186,
          "sd": 0.798255
        },
        {
          "mean": 5,
          "observedMean": 5.009191,
          "sd": 0.751559
        },
        {
          "mean": 5,
          "observedMean": 4.991283,
          "sd": 0.712108
        },
        {
          "mean": 5,
          "observedMean": 4.978143,
          "sd": 0.680836
        },
        {
          "mean": 5,
          "observedMean": 4.981536,
          "sd": 0.658344
        },
        {
          "mean": 5,
          "observedMean": 4.988625,
          "sd": 0.632695
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 173.88187,
      "sd": 8.3757,
      "ages": [
        {
          "mean": 49.8406,
          "sd": 1.851001
        },
        {
          "mean": 74.887045,
          "sd": 2.96723
        },
        {
          "mean": 85.290886,
          "sd": 3.549436
        },
        {
          "mean": 93.557688,
          "sd": 3.984751
        },
        {
          "mean": 100.636725,
          "sd": 4.381535
        },
        {
          "mean": 107.157003,
          "sd": 4.723756
        },
        {
          "mean": 113.491537,
          "sd": 5.086105
        },
        {
          "mean": 119.737844,
          "sd": 5.42941
        },
        {
          "mean": 125.703664,
          "sd": 5.769226
        },
        {
          "mean": 131.223422,
          "sd": 6.081528
        },
        {
          "mean": 136.252818,
          "sd": 6.40742
        },
        {
          "mean": 141.154929,
          "sd": 6.727186
        },
        {
          "mean": 146.743856,
          "sd": 7.224388
        },
        {
          "mean": 153.65313,
          "sd": 7.872063
        },
        {
          "mean": 161.011916,
          "sd": 8.356402
        },
        {
          "mean": 167.171573,
          "sd": 8.509468
        },
        {
          "mean": 171.34102,
          "sd": 8.43879
        },
        {
          "mean": 173.398944,
          "sd": 8.376957
        }
      ]
    },
    "female": {
      "mean": 160.407973,
      "sd": 7.691481,
      "ages": [
        {
          "mean": 49.04113,
          "sd": 1.850544
        },
        {
          "mean": 73.148069,
          "sd": 2.890215
        },
        {
          "mean": 83.772124,
          "sd": 3.487419
        },
        {
          "mean": 92.419064,
          "sd": 3.955376
        },
        {
          "mean": 99.046959,
          "sd": 4.307928
        },
        {
          "mean": 105.784789,
          "sd": 4.690113
        },
        {
          "mean": 112.678827,
          "sd": 5.085875
        },
        {
          "mean": 119.30357,
          "sd": 5.445454
        },
        {
          "mean": 125.27996,
          "sd": 5.813897
        },
        {
          "mean": 130.523023,
          "sd": 6.14083
        },
        {
          "mean": 135.617945,
          "sd": 6.506246
        },
        {
          "mean": 141.648554,
          "sd": 7.061832
        },
        {
          "mean": 148.528151,
          "sd": 7.645134
        },
        {
          "mean": 154.466207,
          "sd": 7.884596
        },
        {
          "mean": 158.27333,
          "sd": 7.822174
        },
        {
          "mean": 159.996519,
          "sd": 7.703153
        },
        {
          "mean": 160.385207,
          "sd": 7.692248
        },
        {
          "mean": 160.410731,
          "sd": 7.690524
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
      "mean": 5.226334,
      "sd": 1.924005
    },
    {
      "mean": 5.400907,
      "sd": 1.896049
    },
    {
      "mean": 5.527575,
      "sd": 1.884056
    },
    {
      "mean": 5.622513,
      "sd": 1.892153
    },
    {
      "mean": 5.704105,
      "sd": 1.8907
    },
    {
      "mean": 5.792895,
      "sd": 1.881187
    },
    {
      "mean": 5.898211,
      "sd": 1.85537
    },
    {
      "mean": 5.98841,
      "sd": 1.826671
    },
    {
      "mean": 6.073822,
      "sd": 1.800407
    },
    {
      "mean": 6.169564,
      "sd": 1.777557
    },
    {
      "mean": 6.255228,
      "sd": 1.760292
    },
    {
      "mean": 6.329133,
      "sd": 1.735405
    },
    {
      "mean": 6.407006,
      "sd": 1.707704
    },
    {
      "mean": 6.503657,
      "sd": 1.679578
    },
    {
      "mean": 6.578961,
      "sd": 1.665999
    }
  ]
};
