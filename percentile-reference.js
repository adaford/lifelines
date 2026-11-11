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
      3976,
      3974,
      3973,
      3973,
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
    "choiceStatMultiplier": 6,
    "infantStabilityMultiplier": 2,
    "skillVariation": {
      "proportional": 0.1
    },
    "development": {
      "innateScale": 0.6
    },
    "reproduce": "node scripts/calibrate-percentiles.mjs --samples 2000 --seed 200001"
  },
  "stats": {
    "intelligence": {
      "mean": 5,
      "observedMean": 4.691029,
      "sd": 1.912008,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.074535,
          "sd": 2.17921
        },
        {
          "mean": 5,
          "observedMean": 5.259103,
          "sd": 2.156768
        },
        {
          "mean": 5,
          "observedMean": 5.437076,
          "sd": 2.133125
        },
        {
          "mean": 5,
          "observedMean": 5.492479,
          "sd": 2.124831
        },
        {
          "mean": 5,
          "observedMean": 5.502064,
          "sd": 2.122562
        },
        {
          "mean": 5,
          "observedMean": 5.506668,
          "sd": 2.117754
        },
        {
          "mean": 5,
          "observedMean": 5.453207,
          "sd": 2.100598
        },
        {
          "mean": 5,
          "observedMean": 5.399678,
          "sd": 2.083002
        },
        {
          "mean": 5,
          "observedMean": 5.35034,
          "sd": 2.063333
        },
        {
          "mean": 5,
          "observedMean": 5.304849,
          "sd": 2.044394
        },
        {
          "mean": 5,
          "observedMean": 5.258315,
          "sd": 2.023926
        },
        {
          "mean": 5,
          "observedMean": 5.213206,
          "sd": 2.006671
        },
        {
          "mean": 5,
          "observedMean": 5.168691,
          "sd": 1.98989
        },
        {
          "mean": 5,
          "observedMean": 5.120682,
          "sd": 1.973568
        },
        {
          "mean": 5,
          "observedMean": 5.033952,
          "sd": 1.962086
        },
        {
          "mean": 5,
          "observedMean": 4.947208,
          "sd": 1.950504
        },
        {
          "mean": 5,
          "observedMean": 4.865551,
          "sd": 1.934442
        },
        {
          "mean": 5,
          "observedMean": 4.783959,
          "sd": 1.922779
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 2.823342,
      "sd": 1.886284,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030385,
          "sd": 2.206269
        },
        {
          "mean": 5,
          "observedMean": 5.032535,
          "sd": 2.204983
        },
        {
          "mean": 5,
          "observedMean": 5.033347,
          "sd": 2.204106
        },
        {
          "mean": 5,
          "observedMean": 5.008489,
          "sd": 2.201955
        },
        {
          "mean": 5,
          "observedMean": 4.986291,
          "sd": 2.196258
        },
        {
          "mean": 5,
          "observedMean": 4.960855,
          "sd": 2.196928
        },
        {
          "mean": 5,
          "observedMean": 4.782022,
          "sd": 2.178588
        },
        {
          "mean": 5,
          "observedMean": 4.607918,
          "sd": 2.162072
        },
        {
          "mean": 5,
          "observedMean": 4.437862,
          "sd": 2.142772
        },
        {
          "mean": 5,
          "observedMean": 4.267759,
          "sd": 2.123124
        },
        {
          "mean": 5,
          "observedMean": 4.100717,
          "sd": 2.103408
        },
        {
          "mean": 5,
          "observedMean": 3.931739,
          "sd": 2.081012
        },
        {
          "mean": 5,
          "observedMean": 3.768077,
          "sd": 2.056488
        },
        {
          "mean": 5,
          "observedMean": 3.609157,
          "sd": 2.033634
        },
        {
          "mean": 5,
          "observedMean": 3.443416,
          "sd": 2.006822
        },
        {
          "mean": 5,
          "observedMean": 3.283278,
          "sd": 1.978744
        },
        {
          "mean": 5,
          "observedMean": 3.126612,
          "sd": 1.948793
        },
        {
          "mean": 5,
          "observedMean": 2.974841,
          "sd": 1.919246
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.85854,
      "sd": 2.002623,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938915,
          "sd": 2.023951
        },
        {
          "mean": 5,
          "observedMean": 4.938798,
          "sd": 2.024483
        },
        {
          "mean": 5,
          "observedMean": 4.930875,
          "sd": 2.023511
        },
        {
          "mean": 5,
          "observedMean": 4.923186,
          "sd": 2.023337
        },
        {
          "mean": 5,
          "observedMean": 4.914693,
          "sd": 2.022288
        },
        {
          "mean": 5,
          "observedMean": 4.906803,
          "sd": 2.020309
        },
        {
          "mean": 5,
          "observedMean": 4.89835,
          "sd": 2.019341
        },
        {
          "mean": 5,
          "observedMean": 4.889145,
          "sd": 2.017747
        },
        {
          "mean": 5,
          "observedMean": 4.880272,
          "sd": 2.016269
        },
        {
          "mean": 5,
          "observedMean": 4.870126,
          "sd": 2.014876
        },
        {
          "mean": 5,
          "observedMean": 4.861389,
          "sd": 2.013648
        },
        {
          "mean": 5,
          "observedMean": 4.85151,
          "sd": 2.012904
        },
        {
          "mean": 5,
          "observedMean": 4.840657,
          "sd": 2.012024
        },
        {
          "mean": 5,
          "observedMean": 4.844887,
          "sd": 2.009974
        },
        {
          "mean": 5,
          "observedMean": 4.848745,
          "sd": 2.007814
        },
        {
          "mean": 5,
          "observedMean": 4.852841,
          "sd": 2.005805
        },
        {
          "mean": 5,
          "observedMean": 4.853669,
          "sd": 2.005082
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.555377,
      "sd": 2.033985,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.002082,
          "sd": 2.21191
        },
        {
          "mean": 5,
          "observedMean": 5.052018,
          "sd": 2.198416
        },
        {
          "mean": 5,
          "observedMean": 5.104234,
          "sd": 2.188101
        },
        {
          "mean": 5,
          "observedMean": 5.171984,
          "sd": 2.175888
        },
        {
          "mean": 5,
          "observedMean": 5.212874,
          "sd": 2.169575
        },
        {
          "mean": 5,
          "observedMean": 5.234258,
          "sd": 2.165365
        },
        {
          "mean": 5,
          "observedMean": 5.17091,
          "sd": 2.142519
        },
        {
          "mean": 5,
          "observedMean": 5.113373,
          "sd": 2.134612
        },
        {
          "mean": 5,
          "observedMean": 5.054766,
          "sd": 2.12015
        },
        {
          "mean": 5,
          "observedMean": 5.005848,
          "sd": 2.1122
        },
        {
          "mean": 5,
          "observedMean": 4.95837,
          "sd": 2.105738
        },
        {
          "mean": 5,
          "observedMean": 4.906875,
          "sd": 2.096239
        },
        {
          "mean": 5,
          "observedMean": 4.865273,
          "sd": 2.083149
        },
        {
          "mean": 5,
          "observedMean": 4.822439,
          "sd": 2.076718
        },
        {
          "mean": 5,
          "observedMean": 4.769781,
          "sd": 2.061761
        },
        {
          "mean": 5,
          "observedMean": 4.713114,
          "sd": 2.055695
        },
        {
          "mean": 5,
          "observedMean": 4.662622,
          "sd": 2.051152
        },
        {
          "mean": 5,
          "observedMean": 4.616533,
          "sd": 2.039487
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.771178,
      "sd": 1.990141,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.097369,
          "sd": 2.207042
        },
        {
          "mean": 5,
          "observedMean": 5.141169,
          "sd": 2.209905
        },
        {
          "mean": 5,
          "observedMean": 5.201282,
          "sd": 2.211453
        },
        {
          "mean": 5,
          "observedMean": 5.237194,
          "sd": 2.210997
        },
        {
          "mean": 5,
          "observedMean": 5.258146,
          "sd": 2.21073
        },
        {
          "mean": 5,
          "observedMean": 5.207467,
          "sd": 2.189907
        },
        {
          "mean": 5,
          "observedMean": 5.168089,
          "sd": 2.169542
        },
        {
          "mean": 5,
          "observedMean": 5.130541,
          "sd": 2.14918
        },
        {
          "mean": 5,
          "observedMean": 5.097842,
          "sd": 2.127394
        },
        {
          "mean": 5,
          "observedMean": 5.063091,
          "sd": 2.107389
        },
        {
          "mean": 5,
          "observedMean": 5.024094,
          "sd": 2.089015
        },
        {
          "mean": 5,
          "observedMean": 4.987594,
          "sd": 2.070071
        },
        {
          "mean": 5,
          "observedMean": 4.94554,
          "sd": 2.058608
        },
        {
          "mean": 5,
          "observedMean": 4.912537,
          "sd": 2.045698
        },
        {
          "mean": 5,
          "observedMean": 4.879924,
          "sd": 2.033702
        },
        {
          "mean": 5,
          "observedMean": 4.849604,
          "sd": 2.020733
        },
        {
          "mean": 5,
          "observedMean": 4.821659,
          "sd": 2.004961
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.678232,
      "sd": 2.148896,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.891608,
          "sd": 2.196033
        },
        {
          "mean": 5,
          "observedMean": 4.86603,
          "sd": 2.189742
        },
        {
          "mean": 5,
          "observedMean": 4.836336,
          "sd": 2.181156
        },
        {
          "mean": 5,
          "observedMean": 4.815655,
          "sd": 2.177933
        },
        {
          "mean": 5,
          "observedMean": 4.832009,
          "sd": 2.173285
        },
        {
          "mean": 5,
          "observedMean": 4.846612,
          "sd": 2.172187
        },
        {
          "mean": 5,
          "observedMean": 4.843089,
          "sd": 2.168516
        },
        {
          "mean": 5,
          "observedMean": 4.839899,
          "sd": 2.166555
        },
        {
          "mean": 5,
          "observedMean": 4.838061,
          "sd": 2.166154
        },
        {
          "mean": 5,
          "observedMean": 4.836381,
          "sd": 2.163653
        },
        {
          "mean": 5,
          "observedMean": 4.833285,
          "sd": 2.161548
        },
        {
          "mean": 5,
          "observedMean": 4.832788,
          "sd": 2.160076
        },
        {
          "mean": 5,
          "observedMean": 4.832114,
          "sd": 2.157726
        },
        {
          "mean": 5,
          "observedMean": 4.831087,
          "sd": 2.15633
        },
        {
          "mean": 5,
          "observedMean": 4.800471,
          "sd": 2.155261
        },
        {
          "mean": 5,
          "observedMean": 4.772671,
          "sd": 2.152318
        },
        {
          "mean": 5,
          "observedMean": 4.741946,
          "sd": 2.152299
        },
        {
          "mean": 5,
          "observedMean": 4.708253,
          "sd": 2.150415
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.717362,
      "sd": 1.898819,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.061216,
          "sd": 2.197313
        },
        {
          "mean": 5,
          "observedMean": 5.13471,
          "sd": 2.170063
        },
        {
          "mean": 5,
          "observedMean": 5.071272,
          "sd": 2.140284
        },
        {
          "mean": 5,
          "observedMean": 5.060425,
          "sd": 2.126444
        },
        {
          "mean": 5,
          "observedMean": 5.050169,
          "sd": 2.117833
        },
        {
          "mean": 5,
          "observedMean": 5.046079,
          "sd": 2.088736
        },
        {
          "mean": 5,
          "observedMean": 5.017716,
          "sd": 2.071548
        },
        {
          "mean": 5,
          "observedMean": 4.994321,
          "sd": 2.044021
        },
        {
          "mean": 5,
          "observedMean": 4.969703,
          "sd": 2.024079
        },
        {
          "mean": 5,
          "observedMean": 4.944512,
          "sd": 2.006828
        },
        {
          "mean": 5,
          "observedMean": 4.910123,
          "sd": 1.986478
        },
        {
          "mean": 5,
          "observedMean": 4.884556,
          "sd": 1.968398
        },
        {
          "mean": 5,
          "observedMean": 4.851211,
          "sd": 1.952589
        },
        {
          "mean": 5,
          "observedMean": 4.828627,
          "sd": 1.936373
        },
        {
          "mean": 5,
          "observedMean": 4.795052,
          "sd": 1.919809
        },
        {
          "mean": 5,
          "observedMean": 4.76816,
          "sd": 1.911098
        },
        {
          "mean": 5,
          "observedMean": 4.748414,
          "sd": 1.908948
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.010071,
      "sd": 3.164389,
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
          "mean": 33.967552,
          "sd": 1.298739
        },
        {
          "mean": 37.293977,
          "sd": 1.448244
        },
        {
          "mean": 40.129663,
          "sd": 1.577604
        },
        {
          "mean": 42.733947,
          "sd": 1.698217
        },
        {
          "mean": 45.252805,
          "sd": 1.829083
        },
        {
          "mean": 47.735716,
          "sd": 1.958562
        },
        {
          "mean": 50.104118,
          "sd": 2.083204
        },
        {
          "mean": 52.306234,
          "sd": 2.207346
        },
        {
          "mean": 54.305289,
          "sd": 2.333468
        },
        {
          "mean": 56.244618,
          "sd": 2.463698
        },
        {
          "mean": 58.458335,
          "sd": 2.675056
        },
        {
          "mean": 61.197716,
          "sd": 2.948519
        },
        {
          "mean": 64.090625,
          "sd": 3.144864
        },
        {
          "mean": 66.488987,
          "sd": 3.202623
        },
        {
          "mean": 68.079193,
          "sd": 3.176434
        },
        {
          "mean": 68.840136,
          "sd": 3.159796
        }
      ]
    },
    "female": {
      "mean": 63.939107,
      "sd": 2.761378,
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
          "mean": 33.472767,
          "sd": 1.295679
        },
        {
          "mean": 36.98507,
          "sd": 1.442531
        },
        {
          "mean": 39.65585,
          "sd": 1.558978
        },
        {
          "mean": 42.349321,
          "sd": 1.681065
        },
        {
          "mean": 45.109819,
          "sd": 1.810263
        },
        {
          "mean": 47.752063,
          "sd": 1.936725
        },
        {
          "mean": 50.124258,
          "sd": 2.041153
        },
        {
          "mean": 52.190498,
          "sd": 2.152203
        },
        {
          "mean": 54.193905,
          "sd": 2.289193
        },
        {
          "mean": 56.566838,
          "sd": 2.503335
        },
        {
          "mean": 59.287295,
          "sd": 2.732816
        },
        {
          "mean": 61.631713,
          "sd": 2.82753
        },
        {
          "mean": 63.118766,
          "sd": 2.802615
        },
        {
          "mean": 63.785118,
          "sd": 2.775665
        },
        {
          "mean": 63.932092,
          "sd": 2.762994
        },
        {
          "mean": 63.939107,
          "sd": 2.761378
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
      "mean": 5.180903,
      "sd": 1.958838
    },
    {
      "mean": 5.283435,
      "sd": 1.932725
    },
    {
      "mean": 5.385205,
      "sd": 1.911086
    },
    {
      "mean": 5.489899,
      "sd": 1.889871
    },
    {
      "mean": 5.591846,
      "sd": 1.867935
    },
    {
      "mean": 5.683423,
      "sd": 1.848839
    },
    {
      "mean": 5.784565,
      "sd": 1.828784
    },
    {
      "mean": 5.882221,
      "sd": 1.806158
    },
    {
      "mean": 5.975329,
      "sd": 1.782855
    },
    {
      "mean": 6.064487,
      "sd": 1.762983
    },
    {
      "mean": 6.14957,
      "sd": 1.743102
    },
    {
      "mean": 6.234523,
      "sd": 1.719512
    },
    {
      "mean": 6.322335,
      "sd": 1.704627
    },
    {
      "mean": 6.409506,
      "sd": 1.684587
    },
    {
      "mean": 6.485672,
      "sd": 1.672028
    },
    {
      "mean": 6.55673,
      "sd": 1.655351
    }
  ]
};
