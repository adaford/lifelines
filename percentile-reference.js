// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1981,
      "female": 1982
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
      3977,
      3975,
      3974,
      3974,
      3974,
      3973,
      3972,
      3972,
      3972,
      3972,
      3971,
      3971,
      3969,
      3969,
      3969,
      3968,
      3965,
      3963
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
        "intelligence": -0.038872,
        "strength": -0.008339,
        "social": -0.032837,
        "creativity": -0.03333
      },
      "wellbeingTarget": {
        "health": 5.043729,
        "stability": 4.6597
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
      "observedMean": 5.003235,
      "sd": 2.181026,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.070062,
          "sd": 2.277753
        },
        {
          "mean": 5,
          "observedMean": 5.100209,
          "sd": 2.270517
        },
        {
          "mean": 5,
          "observedMean": 5.133592,
          "sd": 2.262731
        },
        {
          "mean": 5,
          "observedMean": 5.114391,
          "sd": 2.250296
        },
        {
          "mean": 5,
          "observedMean": 5.080244,
          "sd": 2.233045
        },
        {
          "mean": 5,
          "observedMean": 5.04807,
          "sd": 2.215257
        },
        {
          "mean": 5,
          "observedMean": 5.059549,
          "sd": 2.221069
        },
        {
          "mean": 5,
          "observedMean": 5.083872,
          "sd": 2.229869
        },
        {
          "mean": 5,
          "observedMean": 5.077611,
          "sd": 2.22724
        },
        {
          "mean": 5,
          "observedMean": 5.078381,
          "sd": 2.225829
        },
        {
          "mean": 5,
          "observedMean": 5.08104,
          "sd": 2.227981
        },
        {
          "mean": 5,
          "observedMean": 5.07856,
          "sd": 2.212909
        },
        {
          "mean": 5,
          "observedMean": 5.07934,
          "sd": 2.212834
        },
        {
          "mean": 5,
          "observedMean": 5.084936,
          "sd": 2.212381
        },
        {
          "mean": 5,
          "observedMean": 5.061895,
          "sd": 2.208891
        },
        {
          "mean": 5,
          "observedMean": 5.046929,
          "sd": 2.210335
        },
        {
          "mean": 5,
          "observedMean": 5.034345,
          "sd": 2.207726
        },
        {
          "mean": 5,
          "observedMean": 5.011281,
          "sd": 2.190765
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.007949,
      "sd": 2.094938,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.06349,
          "sd": 2.29499
        },
        {
          "mean": 5,
          "observedMean": 5.056316,
          "sd": 2.283336
        },
        {
          "mean": 5,
          "observedMean": 5.054823,
          "sd": 2.272635
        },
        {
          "mean": 5,
          "observedMean": 5.030204,
          "sd": 2.267009
        },
        {
          "mean": 5,
          "observedMean": 5.020861,
          "sd": 2.251906
        },
        {
          "mean": 5,
          "observedMean": 5.018095,
          "sd": 2.233059
        },
        {
          "mean": 5,
          "observedMean": 5.01921,
          "sd": 2.220341
        },
        {
          "mean": 5,
          "observedMean": 5.016574,
          "sd": 2.210451
        },
        {
          "mean": 5,
          "observedMean": 5.019386,
          "sd": 2.19574
        },
        {
          "mean": 5,
          "observedMean": 5.021604,
          "sd": 2.188632
        },
        {
          "mean": 5,
          "observedMean": 5.021694,
          "sd": 2.182361
        },
        {
          "mean": 5,
          "observedMean": 5.018134,
          "sd": 2.175002
        },
        {
          "mean": 5,
          "observedMean": 5.022183,
          "sd": 2.165997
        },
        {
          "mean": 5,
          "observedMean": 5.021287,
          "sd": 2.155488
        },
        {
          "mean": 5,
          "observedMean": 5.023522,
          "sd": 2.137077
        },
        {
          "mean": 5,
          "observedMean": 5.02228,
          "sd": 2.127598
        },
        {
          "mean": 5,
          "observedMean": 5.0184,
          "sd": 2.115712
        },
        {
          "mean": 5,
          "observedMean": 5.013773,
          "sd": 2.108889
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.979286,
      "sd": 1.987383,
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
          "observedMean": 4.967126,
          "sd": 1.985569
        },
        {
          "mean": 5,
          "observedMean": 4.96647,
          "sd": 1.985203
        },
        {
          "mean": 5,
          "observedMean": 4.96651,
          "sd": 1.985521
        },
        {
          "mean": 5,
          "observedMean": 4.96815,
          "sd": 1.987195
        },
        {
          "mean": 5,
          "observedMean": 4.968578,
          "sd": 1.987663
        },
        {
          "mean": 5,
          "observedMean": 4.969391,
          "sd": 1.987583
        },
        {
          "mean": 5,
          "observedMean": 4.969869,
          "sd": 1.987426
        },
        {
          "mean": 5,
          "observedMean": 4.969716,
          "sd": 1.986796
        },
        {
          "mean": 5,
          "observedMean": 4.968973,
          "sd": 1.985647
        },
        {
          "mean": 5,
          "observedMean": 4.968532,
          "sd": 1.985203
        },
        {
          "mean": 5,
          "observedMean": 4.970517,
          "sd": 1.985193
        },
        {
          "mean": 5,
          "observedMean": 4.971645,
          "sd": 1.985583
        },
        {
          "mean": 5,
          "observedMean": 4.972895,
          "sd": 1.986969
        },
        {
          "mean": 5,
          "observedMean": 4.973647,
          "sd": 1.988283
        },
        {
          "mean": 5,
          "observedMean": 4.976159,
          "sd": 1.989425
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.99241,
      "sd": 2.096058,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030397,
          "sd": 2.297539
        },
        {
          "mean": 5,
          "observedMean": 5.023555,
          "sd": 2.274757
        },
        {
          "mean": 5,
          "observedMean": 5.021854,
          "sd": 2.255094
        },
        {
          "mean": 5,
          "observedMean": 4.999726,
          "sd": 2.241125
        },
        {
          "mean": 5,
          "observedMean": 4.975944,
          "sd": 2.225439
        },
        {
          "mean": 5,
          "observedMean": 4.945808,
          "sd": 2.210565
        },
        {
          "mean": 5,
          "observedMean": 4.934025,
          "sd": 2.196532
        },
        {
          "mean": 5,
          "observedMean": 4.932253,
          "sd": 2.197696
        },
        {
          "mean": 5,
          "observedMean": 4.941349,
          "sd": 2.185047
        },
        {
          "mean": 5,
          "observedMean": 4.940604,
          "sd": 2.172496
        },
        {
          "mean": 5,
          "observedMean": 4.946584,
          "sd": 2.165736
        },
        {
          "mean": 5,
          "observedMean": 4.956265,
          "sd": 2.153203
        },
        {
          "mean": 5,
          "observedMean": 4.9558,
          "sd": 2.144566
        },
        {
          "mean": 5,
          "observedMean": 4.956301,
          "sd": 2.134911
        },
        {
          "mean": 5,
          "observedMean": 4.951807,
          "sd": 2.130221
        },
        {
          "mean": 5,
          "observedMean": 4.953308,
          "sd": 2.122981
        },
        {
          "mean": 5,
          "observedMean": 4.967326,
          "sd": 2.106908
        },
        {
          "mean": 5,
          "observedMean": 4.98343,
          "sd": 2.100491
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.000886,
      "sd": 2.172103,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.045817,
          "sd": 2.289883
        },
        {
          "mean": 5,
          "observedMean": 5.034926,
          "sd": 2.276369
        },
        {
          "mean": 5,
          "observedMean": 5.022098,
          "sd": 2.26292
        },
        {
          "mean": 5,
          "observedMean": 5.020536,
          "sd": 2.256305
        },
        {
          "mean": 5,
          "observedMean": 5.009859,
          "sd": 2.246106
        },
        {
          "mean": 5,
          "observedMean": 4.99381,
          "sd": 2.235708
        },
        {
          "mean": 5,
          "observedMean": 5.007553,
          "sd": 2.244129
        },
        {
          "mean": 5,
          "observedMean": 5.01791,
          "sd": 2.24408
        },
        {
          "mean": 5,
          "observedMean": 5.014517,
          "sd": 2.238537
        },
        {
          "mean": 5,
          "observedMean": 5.014184,
          "sd": 2.239745
        },
        {
          "mean": 5,
          "observedMean": 5.014293,
          "sd": 2.233704
        },
        {
          "mean": 5,
          "observedMean": 5.015905,
          "sd": 2.228131
        },
        {
          "mean": 5,
          "observedMean": 5.012271,
          "sd": 2.214811
        },
        {
          "mean": 5,
          "observedMean": 5.005765,
          "sd": 2.202212
        },
        {
          "mean": 5,
          "observedMean": 5.005336,
          "sd": 2.194284
        },
        {
          "mean": 5,
          "observedMean": 4.998667,
          "sd": 2.182834
        },
        {
          "mean": 5,
          "observedMean": 4.996678,
          "sd": 2.170651
        },
        {
          "mean": 5,
          "observedMean": 4.999876,
          "sd": 2.168742
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.001176,
      "sd": 0.795552,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.940345,
          "sd": 2.287901
        },
        {
          "mean": 5,
          "observedMean": 4.901939,
          "sd": 2.174117
        },
        {
          "mean": 5,
          "observedMean": 4.907147,
          "sd": 2.043798
        },
        {
          "mean": 5,
          "observedMean": 4.91046,
          "sd": 1.932204
        },
        {
          "mean": 5,
          "observedMean": 4.949733,
          "sd": 1.813744
        },
        {
          "mean": 5,
          "observedMean": 4.956381,
          "sd": 1.711604
        },
        {
          "mean": 5,
          "observedMean": 4.961898,
          "sd": 1.609237
        },
        {
          "mean": 5,
          "observedMean": 4.964451,
          "sd": 1.515676
        },
        {
          "mean": 5,
          "observedMean": 4.972477,
          "sd": 1.432106
        },
        {
          "mean": 5,
          "observedMean": 4.980992,
          "sd": 1.34789
        },
        {
          "mean": 5,
          "observedMean": 4.988288,
          "sd": 1.26722
        },
        {
          "mean": 5,
          "observedMean": 4.989627,
          "sd": 1.197177
        },
        {
          "mean": 5,
          "observedMean": 5.001022,
          "sd": 1.121659
        },
        {
          "mean": 5,
          "observedMean": 5.004948,
          "sd": 1.05913
        },
        {
          "mean": 5,
          "observedMean": 5.005848,
          "sd": 0.992188
        },
        {
          "mean": 5,
          "observedMean": 5.005676,
          "sd": 0.932634
        },
        {
          "mean": 5,
          "observedMean": 5.004904,
          "sd": 0.884354
        },
        {
          "mean": 5,
          "observedMean": 5.000585,
          "sd": 0.83515
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.998542,
      "sd": 0.663802,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018087,
          "sd": 2.318658
        },
        {
          "mean": 5,
          "observedMean": 5.114536,
          "sd": 2.166953
        },
        {
          "mean": 5,
          "observedMean": 5.221442,
          "sd": 2.015428
        },
        {
          "mean": 5,
          "observedMean": 5.179071,
          "sd": 1.8666
        },
        {
          "mean": 5,
          "observedMean": 5.165398,
          "sd": 1.711685
        },
        {
          "mean": 5,
          "observedMean": 5.114557,
          "sd": 1.577048
        },
        {
          "mean": 5,
          "observedMean": 5.079625,
          "sd": 1.473306
        },
        {
          "mean": 5,
          "observedMean": 5.069982,
          "sd": 1.369911
        },
        {
          "mean": 5,
          "observedMean": 5.067319,
          "sd": 1.272294
        },
        {
          "mean": 5,
          "observedMean": 5.064431,
          "sd": 1.172254
        },
        {
          "mean": 5,
          "observedMean": 5.060509,
          "sd": 1.085923
        },
        {
          "mean": 5,
          "observedMean": 5.057537,
          "sd": 1.014938
        },
        {
          "mean": 5,
          "observedMean": 5.048915,
          "sd": 0.93889
        },
        {
          "mean": 5,
          "observedMean": 5.049058,
          "sd": 0.875572
        },
        {
          "mean": 5,
          "observedMean": 5.020146,
          "sd": 0.833398
        },
        {
          "mean": 5,
          "observedMean": 5.003452,
          "sd": 0.793444
        },
        {
          "mean": 5,
          "observedMean": 5.006298,
          "sd": 0.738833
        },
        {
          "mean": 5,
          "observedMean": 5.0023,
          "sd": 0.691269
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.281247,
      "sd": 3.471667,
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
          "mean": 33.499441,
          "sd": 1.433274
        },
        {
          "mean": 36.741807,
          "sd": 1.631189
        },
        {
          "mean": 39.510971,
          "sd": 1.800227
        },
        {
          "mean": 42.066205,
          "sd": 1.952649
        },
        {
          "mean": 44.541037,
          "sd": 2.095846
        },
        {
          "mean": 46.981269,
          "sd": 2.247589
        },
        {
          "mean": 49.335488,
          "sd": 2.394564
        },
        {
          "mean": 51.513117,
          "sd": 2.522925
        },
        {
          "mean": 53.504043,
          "sd": 2.650221
        },
        {
          "mean": 55.444605,
          "sd": 2.783717
        },
        {
          "mean": 57.661139,
          "sd": 2.990122
        },
        {
          "mean": 60.399814,
          "sd": 3.261939
        },
        {
          "mean": 63.288594,
          "sd": 3.454407
        },
        {
          "mean": 65.699385,
          "sd": 3.521052
        },
        {
          "mean": 67.318628,
          "sd": 3.498946
        },
        {
          "mean": 68.102297,
          "sd": 3.473166
        }
      ]
    },
    "female": {
      "mean": 63.147402,
      "sd": 3.181133,
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
          "mean": 33.00005,
          "sd": 1.460206
        },
        {
          "mean": 36.412325,
          "sd": 1.668443
        },
        {
          "mean": 39.012557,
          "sd": 1.823378
        },
        {
          "mean": 41.657458,
          "sd": 1.978493
        },
        {
          "mean": 44.363795,
          "sd": 2.140201
        },
        {
          "mean": 46.96639,
          "sd": 2.290755
        },
        {
          "mean": 49.314295,
          "sd": 2.430238
        },
        {
          "mean": 51.380005,
          "sd": 2.557611
        },
        {
          "mean": 53.386561,
          "sd": 2.697849
        },
        {
          "mean": 55.748736,
          "sd": 2.890077
        },
        {
          "mean": 58.457855,
          "sd": 3.108875
        },
        {
          "mean": 60.795793,
          "sd": 3.217536
        },
        {
          "mean": 62.303652,
          "sd": 3.215227
        },
        {
          "mean": 62.989521,
          "sd": 3.194483
        },
        {
          "mean": 63.139295,
          "sd": 3.180941
        },
        {
          "mean": 63.147767,
          "sd": 3.180146
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
      "mean": 4.947448,
      "sd": 1.997485
    },
    {
      "mean": 5.012327,
      "sd": 1.968583
    },
    {
      "mean": 5.209612,
      "sd": 1.910319
    },
    {
      "mean": 5.392552,
      "sd": 1.87423
    },
    {
      "mean": 5.511827,
      "sd": 1.863007
    },
    {
      "mean": 5.610622,
      "sd": 1.878558
    },
    {
      "mean": 5.68857,
      "sd": 1.870274
    },
    {
      "mean": 5.785247,
      "sd": 1.848614
    },
    {
      "mean": 5.879909,
      "sd": 1.821995
    },
    {
      "mean": 5.970796,
      "sd": 1.797154
    },
    {
      "mean": 6.067489,
      "sd": 1.78058
    },
    {
      "mean": 6.15311,
      "sd": 1.754005
    },
    {
      "mean": 6.240867,
      "sd": 1.734575
    },
    {
      "mean": 6.33812,
      "sd": 1.7168
    },
    {
      "mean": 6.424288,
      "sd": 1.698005
    },
    {
      "mean": 6.515877,
      "sd": 1.673968
    },
    {
      "mean": 6.593947,
      "sd": 1.652104
    }
  ]
};
