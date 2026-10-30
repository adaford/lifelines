// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1988,
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
    "focusPolicy": "balanced targets capped by active event limits; freed points left unused",
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
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3975,
      3974,
      3973,
      3972,
      3971,
      3969
    ],
    "birthVariation": {
      "skill": 2,
      "health": 2,
      "stability": 2,
      "appearance": 2,
      "inheritedAppearance": 1.5
    },
    "development": {
      "innateScale": 0.6,
      "skillReversion": 0.012,
      "childhoodBias": {
        "intelligence": -0.094083,
        "strength": -0.014534,
        "social": -0.098102,
        "creativity": -0.097077
      },
      "wellbeingTarget": {
        "health": 5.161767,
        "stability": 4.292949
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
      "observedMean": 4.999446,
      "sd": 2.260986,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.034675,
          "sd": 2.18011
        },
        {
          "mean": 5,
          "observedMean": 5.013987,
          "sd": 2.17075
        },
        {
          "mean": 5,
          "observedMean": 4.994712,
          "sd": 2.158911
        },
        {
          "mean": 5,
          "observedMean": 4.969298,
          "sd": 2.155322
        },
        {
          "mean": 5,
          "observedMean": 4.924237,
          "sd": 2.14029
        },
        {
          "mean": 5,
          "observedMean": 4.867855,
          "sd": 2.121803
        },
        {
          "mean": 5,
          "observedMean": 4.863903,
          "sd": 2.147842
        },
        {
          "mean": 5,
          "observedMean": 4.897731,
          "sd": 2.157633
        },
        {
          "mean": 5,
          "observedMean": 4.925914,
          "sd": 2.169978
        },
        {
          "mean": 5,
          "observedMean": 4.953467,
          "sd": 2.176115
        },
        {
          "mean": 5,
          "observedMean": 4.98847,
          "sd": 2.182805
        },
        {
          "mean": 5,
          "observedMean": 5.015681,
          "sd": 2.194881
        },
        {
          "mean": 5,
          "observedMean": 5.057072,
          "sd": 2.206869
        },
        {
          "mean": 5,
          "observedMean": 5.08833,
          "sd": 2.211879
        },
        {
          "mean": 5,
          "observedMean": 5.06344,
          "sd": 2.227956
        },
        {
          "mean": 5,
          "observedMean": 5.04004,
          "sd": 2.23973
        },
        {
          "mean": 5,
          "observedMean": 5.029663,
          "sd": 2.239333
        },
        {
          "mean": 5,
          "observedMean": 5.023725,
          "sd": 2.251804
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.997637,
      "sd": 2.120344,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03067,
          "sd": 2.204268
        },
        {
          "mean": 5,
          "observedMean": 5.016869,
          "sd": 2.210946
        },
        {
          "mean": 5,
          "observedMean": 5.025343,
          "sd": 2.20147
        },
        {
          "mean": 5,
          "observedMean": 4.920744,
          "sd": 2.246791
        },
        {
          "mean": 5,
          "observedMean": 4.909419,
          "sd": 2.227087
        },
        {
          "mean": 5,
          "observedMean": 4.903881,
          "sd": 2.21997
        },
        {
          "mean": 5,
          "observedMean": 4.902993,
          "sd": 2.213473
        },
        {
          "mean": 5,
          "observedMean": 4.918848,
          "sd": 2.209281
        },
        {
          "mean": 5,
          "observedMean": 4.935235,
          "sd": 2.204846
        },
        {
          "mean": 5,
          "observedMean": 4.946176,
          "sd": 2.201655
        },
        {
          "mean": 5,
          "observedMean": 4.964521,
          "sd": 2.19416
        },
        {
          "mean": 5,
          "observedMean": 4.962571,
          "sd": 2.194998
        },
        {
          "mean": 5,
          "observedMean": 4.98596,
          "sd": 2.186803
        },
        {
          "mean": 5,
          "observedMean": 4.996684,
          "sd": 2.180495
        },
        {
          "mean": 5,
          "observedMean": 5.021497,
          "sd": 2.141141
        },
        {
          "mean": 5,
          "observedMean": 5.009554,
          "sd": 2.139666
        },
        {
          "mean": 5,
          "observedMean": 5.004076,
          "sd": 2.137604
        },
        {
          "mean": 5,
          "observedMean": 4.996452,
          "sd": 2.132107
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.952968,
      "sd": 2.028346,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938568,
          "sd": 2.023781
        },
        {
          "mean": 5,
          "observedMean": 4.938396,
          "sd": 2.024721
        },
        {
          "mean": 5,
          "observedMean": 4.937081,
          "sd": 2.024157
        },
        {
          "mean": 5,
          "observedMean": 4.936233,
          "sd": 2.024919
        },
        {
          "mean": 5,
          "observedMean": 4.934321,
          "sd": 2.025469
        },
        {
          "mean": 5,
          "observedMean": 4.933647,
          "sd": 2.025314
        },
        {
          "mean": 5,
          "observedMean": 4.931733,
          "sd": 2.026007
        },
        {
          "mean": 5,
          "observedMean": 4.931826,
          "sd": 2.025732
        },
        {
          "mean": 5,
          "observedMean": 4.931945,
          "sd": 2.025611
        },
        {
          "mean": 5,
          "observedMean": 4.930392,
          "sd": 2.025692
        },
        {
          "mean": 5,
          "observedMean": 4.930005,
          "sd": 2.02562
        },
        {
          "mean": 5,
          "observedMean": 4.928543,
          "sd": 2.024806
        },
        {
          "mean": 5,
          "observedMean": 4.926642,
          "sd": 2.024777
        },
        {
          "mean": 5,
          "observedMean": 4.932519,
          "sd": 2.024839
        },
        {
          "mean": 5,
          "observedMean": 4.937224,
          "sd": 2.02706
        },
        {
          "mean": 5,
          "observedMean": 4.942218,
          "sd": 2.02919
        },
        {
          "mean": 5,
          "observedMean": 4.946288,
          "sd": 2.028738
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.007241,
      "sd": 2.15066,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.996318,
          "sd": 2.207495
        },
        {
          "mean": 5,
          "observedMean": 4.945377,
          "sd": 2.180971
        },
        {
          "mean": 5,
          "observedMean": 4.906512,
          "sd": 2.159909
        },
        {
          "mean": 5,
          "observedMean": 4.865064,
          "sd": 2.168377
        },
        {
          "mean": 5,
          "observedMean": 4.828715,
          "sd": 2.151354
        },
        {
          "mean": 5,
          "observedMean": 4.77537,
          "sd": 2.130964
        },
        {
          "mean": 5,
          "observedMean": 4.739492,
          "sd": 2.124629
        },
        {
          "mean": 5,
          "observedMean": 4.693525,
          "sd": 2.156349
        },
        {
          "mean": 5,
          "observedMean": 4.716999,
          "sd": 2.152396
        },
        {
          "mean": 5,
          "observedMean": 4.74793,
          "sd": 2.140874
        },
        {
          "mean": 5,
          "observedMean": 4.778448,
          "sd": 2.135052
        },
        {
          "mean": 5,
          "observedMean": 4.797021,
          "sd": 2.125064
        },
        {
          "mean": 5,
          "observedMean": 4.822083,
          "sd": 2.122723
        },
        {
          "mean": 5,
          "observedMean": 4.859577,
          "sd": 2.121087
        },
        {
          "mean": 5,
          "observedMean": 4.859323,
          "sd": 2.142704
        },
        {
          "mean": 5,
          "observedMean": 4.888593,
          "sd": 2.132512
        },
        {
          "mean": 5,
          "observedMean": 4.927598,
          "sd": 2.145074
        },
        {
          "mean": 5,
          "observedMean": 4.974213,
          "sd": 2.150008
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.999317,
      "sd": 2.308426,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018552,
          "sd": 2.197999
        },
        {
          "mean": 5,
          "observedMean": 4.970178,
          "sd": 2.185796
        },
        {
          "mean": 5,
          "observedMean": 4.922054,
          "sd": 2.174193
        },
        {
          "mean": 5,
          "observedMean": 4.898967,
          "sd": 2.171258
        },
        {
          "mean": 5,
          "observedMean": 4.858579,
          "sd": 2.166673
        },
        {
          "mean": 5,
          "observedMean": 4.803353,
          "sd": 2.158214
        },
        {
          "mean": 5,
          "observedMean": 4.803969,
          "sd": 2.181309
        },
        {
          "mean": 5,
          "observedMean": 4.817731,
          "sd": 2.189872
        },
        {
          "mean": 5,
          "observedMean": 4.835233,
          "sd": 2.19796
        },
        {
          "mean": 5,
          "observedMean": 4.843781,
          "sd": 2.2064
        },
        {
          "mean": 5,
          "observedMean": 4.855462,
          "sd": 2.210397
        },
        {
          "mean": 5,
          "observedMean": 4.867132,
          "sd": 2.218136
        },
        {
          "mean": 5,
          "observedMean": 4.890387,
          "sd": 2.221418
        },
        {
          "mean": 5,
          "observedMean": 4.904493,
          "sd": 2.230937
        },
        {
          "mean": 5,
          "observedMean": 4.923895,
          "sd": 2.247065
        },
        {
          "mean": 5,
          "observedMean": 4.951274,
          "sd": 2.26206
        },
        {
          "mean": 5,
          "observedMean": 4.973701,
          "sd": 2.275293
        },
        {
          "mean": 5,
          "observedMean": 5.000609,
          "sd": 2.29178
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.000678,
      "sd": 0.852178,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.905678,
          "sd": 2.198584
        },
        {
          "mean": 5,
          "observedMean": 4.793098,
          "sd": 2.136691
        },
        {
          "mean": 5,
          "observedMean": 4.819381,
          "sd": 2.014689
        },
        {
          "mean": 5,
          "observedMean": 4.765647,
          "sd": 1.942319
        },
        {
          "mean": 5,
          "observedMean": 4.898811,
          "sd": 1.799944
        },
        {
          "mean": 5,
          "observedMean": 4.93089,
          "sd": 1.701563
        },
        {
          "mean": 5,
          "observedMean": 4.928287,
          "sd": 1.618103
        },
        {
          "mean": 5,
          "observedMean": 4.946657,
          "sd": 1.514842
        },
        {
          "mean": 5,
          "observedMean": 4.97154,
          "sd": 1.420419
        },
        {
          "mean": 5,
          "observedMean": 4.980747,
          "sd": 1.342394
        },
        {
          "mean": 5,
          "observedMean": 5.002035,
          "sd": 1.26121
        },
        {
          "mean": 5,
          "observedMean": 5.006891,
          "sd": 1.209371
        },
        {
          "mean": 5,
          "observedMean": 5.028911,
          "sd": 1.135825
        },
        {
          "mean": 5,
          "observedMean": 5.039592,
          "sd": 1.071431
        },
        {
          "mean": 5,
          "observedMean": 5.033767,
          "sd": 1.022721
        },
        {
          "mean": 5,
          "observedMean": 5.015341,
          "sd": 0.970901
        },
        {
          "mean": 5,
          "observedMean": 5.00467,
          "sd": 0.93037
        },
        {
          "mean": 5,
          "observedMean": 4.998555,
          "sd": 0.889988
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.001481,
      "sd": 0.82268,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.97463,
          "sd": 2.227561
        },
        {
          "mean": 5,
          "observedMean": 4.933837,
          "sd": 2.113708
        },
        {
          "mean": 5,
          "observedMean": 4.97129,
          "sd": 1.966386
        },
        {
          "mean": 5,
          "observedMean": 4.898745,
          "sd": 1.826104
        },
        {
          "mean": 5,
          "observedMean": 4.935396,
          "sd": 1.658938
        },
        {
          "mean": 5,
          "observedMean": 4.895355,
          "sd": 1.539017
        },
        {
          "mean": 5,
          "observedMean": 4.793664,
          "sd": 1.465637
        },
        {
          "mean": 5,
          "observedMean": 4.774304,
          "sd": 1.37138
        },
        {
          "mean": 5,
          "observedMean": 4.798234,
          "sd": 1.279024
        },
        {
          "mean": 5,
          "observedMean": 4.842075,
          "sd": 1.201593
        },
        {
          "mean": 5,
          "observedMean": 4.869791,
          "sd": 1.128113
        },
        {
          "mean": 5,
          "observedMean": 4.895054,
          "sd": 1.06258
        },
        {
          "mean": 5,
          "observedMean": 4.923303,
          "sd": 1.007357
        },
        {
          "mean": 5,
          "observedMean": 4.945655,
          "sd": 0.944161
        },
        {
          "mean": 5,
          "observedMean": 4.93532,
          "sd": 0.92574
        },
        {
          "mean": 5,
          "observedMean": 4.937876,
          "sd": 0.905569
        },
        {
          "mean": 5,
          "observedMean": 4.951679,
          "sd": 0.88114
        },
        {
          "mean": 5,
          "observedMean": 4.979119,
          "sd": 0.851155
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.292827,
      "sd": 3.498636,
      "ages": [
        {
          "mean": 19.629805,
          "sd": 0.7356
        },
        {
          "mean": 29.451231,
          "sd": 1.200606
        },
        {
          "mean": 33.514314,
          "sd": 1.435541
        },
        {
          "mean": 36.752971,
          "sd": 1.632417
        },
        {
          "mean": 39.518547,
          "sd": 1.802599
        },
        {
          "mean": 42.073695,
          "sd": 1.959799
        },
        {
          "mean": 44.565219,
          "sd": 2.110626
        },
        {
          "mean": 47.013127,
          "sd": 2.260802
        },
        {
          "mean": 49.363826,
          "sd": 2.397594
        },
        {
          "mean": 51.546652,
          "sd": 2.531318
        },
        {
          "mean": 53.537104,
          "sd": 2.66015
        },
        {
          "mean": 55.477738,
          "sd": 2.798421
        },
        {
          "mean": 57.696898,
          "sd": 2.995536
        },
        {
          "mean": 60.425078,
          "sd": 3.262783
        },
        {
          "mean": 63.318939,
          "sd": 3.464136
        },
        {
          "mean": 65.726757,
          "sd": 3.53689
        },
        {
          "mean": 67.331761,
          "sd": 3.523131
        },
        {
          "mean": 68.114442,
          "sd": 3.50001
        }
      ]
    },
    "female": {
      "mean": 63.142479,
      "sd": 3.097295,
      "ages": [
        {
          "mean": 19.370765,
          "sd": 0.743345
        },
        {
          "mean": 28.848804,
          "sd": 1.184703
        },
        {
          "mean": 33.015548,
          "sd": 1.412727
        },
        {
          "mean": 36.430236,
          "sd": 1.608455
        },
        {
          "mean": 39.034331,
          "sd": 1.76189
        },
        {
          "mean": 41.674655,
          "sd": 1.914959
        },
        {
          "mean": 44.380342,
          "sd": 2.069155
        },
        {
          "mean": 46.972734,
          "sd": 2.218336
        },
        {
          "mean": 49.311984,
          "sd": 2.349484
        },
        {
          "mean": 51.380201,
          "sd": 2.471165
        },
        {
          "mean": 53.384481,
          "sd": 2.603693
        },
        {
          "mean": 55.741969,
          "sd": 2.802422
        },
        {
          "mean": 58.450987,
          "sd": 3.026142
        },
        {
          "mean": 60.800438,
          "sd": 3.13405
        },
        {
          "mean": 62.302131,
          "sd": 3.125935
        },
        {
          "mean": 62.983029,
          "sd": 3.107839
        },
        {
          "mean": 63.131275,
          "sd": 3.098733
        },
        {
          "mean": 63.139914,
          "sd": 3.096985
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
      "mean": 5.18093,
      "sd": 1.958953
    },
    {
      "mean": 5.283392,
      "sd": 1.932991
    },
    {
      "mean": 5.385258,
      "sd": 1.911525
    },
    {
      "mean": 5.490679,
      "sd": 1.890295
    },
    {
      "mean": 5.590523,
      "sd": 1.873912
    },
    {
      "mean": 5.691746,
      "sd": 1.853716
    },
    {
      "mean": 5.790984,
      "sd": 1.827383
    },
    {
      "mean": 5.889298,
      "sd": 1.806601
    },
    {
      "mean": 5.980468,
      "sd": 1.788604
    },
    {
      "mean": 6.068294,
      "sd": 1.768721
    },
    {
      "mean": 6.155497,
      "sd": 1.753822
    },
    {
      "mean": 6.251172,
      "sd": 1.728657
    },
    {
      "mean": 6.338822,
      "sd": 1.702923
    },
    {
      "mean": 6.419195,
      "sd": 1.683482
    },
    {
      "mean": 6.498122,
      "sd": 1.664923
    },
    {
      "mean": 6.580919,
      "sd": 1.652799
    }
  ]
};
