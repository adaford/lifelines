// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1984,
      "female": 1981
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
      3972,
      3970,
      3969,
      3968,
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
      "observedMean": 4.705569,
      "sd": 1.903793,
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
          "observedMean": 5.492331,
          "sd": 2.124867
        },
        {
          "mean": 5,
          "observedMean": 5.501793,
          "sd": 2.122498
        },
        {
          "mean": 5,
          "observedMean": 5.506074,
          "sd": 2.11781
        },
        {
          "mean": 5,
          "observedMean": 5.452422,
          "sd": 2.10044
        },
        {
          "mean": 5,
          "observedMean": 5.398612,
          "sd": 2.081782
        },
        {
          "mean": 5,
          "observedMean": 5.348476,
          "sd": 2.063213
        },
        {
          "mean": 5,
          "observedMean": 5.303106,
          "sd": 2.043989
        },
        {
          "mean": 5,
          "observedMean": 5.25619,
          "sd": 2.022928
        },
        {
          "mean": 5,
          "observedMean": 5.211135,
          "sd": 2.005992
        },
        {
          "mean": 5,
          "observedMean": 5.16523,
          "sd": 1.989354
        },
        {
          "mean": 5,
          "observedMean": 5.117654,
          "sd": 1.973027
        },
        {
          "mean": 5,
          "observedMean": 5.035592,
          "sd": 1.955419
        },
        {
          "mean": 5,
          "observedMean": 4.95439,
          "sd": 1.938378
        },
        {
          "mean": 5,
          "observedMean": 4.879728,
          "sd": 1.921316
        },
        {
          "mean": 5,
          "observedMean": 4.797812,
          "sd": 1.909107
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 2.781589,
      "sd": 1.841262,
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
          "observedMean": 4.776162,
          "sd": 2.174784
        },
        {
          "mean": 5,
          "observedMean": 4.596937,
          "sd": 2.154595
        },
        {
          "mean": 5,
          "observedMean": 4.421164,
          "sd": 2.130996
        },
        {
          "mean": 5,
          "observedMean": 4.246356,
          "sd": 2.106949
        },
        {
          "mean": 5,
          "observedMean": 4.075058,
          "sd": 2.083493
        },
        {
          "mean": 5,
          "observedMean": 3.902217,
          "sd": 2.058025
        },
        {
          "mean": 5,
          "observedMean": 3.735802,
          "sd": 2.030197
        },
        {
          "mean": 5,
          "observedMean": 3.574022,
          "sd": 2.004865
        },
        {
          "mean": 5,
          "observedMean": 3.409992,
          "sd": 1.975774
        },
        {
          "mean": 5,
          "observedMean": 3.247693,
          "sd": 1.944901
        },
        {
          "mean": 5,
          "observedMean": 3.087221,
          "sd": 1.909458
        },
        {
          "mean": 5,
          "observedMean": 2.930539,
          "sd": 1.874072
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.853544,
      "sd": 2.004815,
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
          "observedMean": 4.930852,
          "sd": 2.023521
        },
        {
          "mean": 5,
          "observedMean": 4.923163,
          "sd": 2.023347
        },
        {
          "mean": 5,
          "observedMean": 4.914671,
          "sd": 2.022298
        },
        {
          "mean": 5,
          "observedMean": 4.906803,
          "sd": 2.020303
        },
        {
          "mean": 5,
          "observedMean": 4.898327,
          "sd": 2.019351
        },
        {
          "mean": 5,
          "observedMean": 4.889019,
          "sd": 2.017722
        },
        {
          "mean": 5,
          "observedMean": 4.880133,
          "sd": 2.01634
        },
        {
          "mean": 5,
          "observedMean": 4.870088,
          "sd": 2.015013
        },
        {
          "mean": 5,
          "observedMean": 4.861374,
          "sd": 2.013914
        },
        {
          "mean": 5,
          "observedMean": 4.851324,
          "sd": 2.013174
        },
        {
          "mean": 5,
          "observedMean": 4.840443,
          "sd": 2.012101
        },
        {
          "mean": 5,
          "observedMean": 4.842513,
          "sd": 2.010902
        },
        {
          "mean": 5,
          "observedMean": 4.846748,
          "sd": 2.009144
        },
        {
          "mean": 5,
          "observedMean": 4.849408,
          "sd": 2.007558
        },
        {
          "mean": 5,
          "observedMean": 4.850386,
          "sd": 2.005268
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.346396,
      "sd": 1.905554,
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
          "observedMean": 5.104355,
          "sd": 2.188266
        },
        {
          "mean": 5,
          "observedMean": 5.172024,
          "sd": 2.176077
        },
        {
          "mean": 5,
          "observedMean": 5.212625,
          "sd": 2.169723
        },
        {
          "mean": 5,
          "observedMean": 5.233825,
          "sd": 2.165475
        },
        {
          "mean": 5,
          "observedMean": 5.164691,
          "sd": 2.13919
        },
        {
          "mean": 5,
          "observedMean": 5.090282,
          "sd": 2.1218
        },
        {
          "mean": 5,
          "observedMean": 5.015548,
          "sd": 2.097607
        },
        {
          "mean": 5,
          "observedMean": 4.948483,
          "sd": 2.079026
        },
        {
          "mean": 5,
          "observedMean": 4.885526,
          "sd": 2.060047
        },
        {
          "mean": 5,
          "observedMean": 4.817489,
          "sd": 2.04212
        },
        {
          "mean": 5,
          "observedMean": 4.760048,
          "sd": 2.020266
        },
        {
          "mean": 5,
          "observedMean": 4.700214,
          "sd": 2.004573
        },
        {
          "mean": 5,
          "observedMean": 4.63289,
          "sd": 1.985485
        },
        {
          "mean": 5,
          "observedMean": 4.56468,
          "sd": 1.96216
        },
        {
          "mean": 5,
          "observedMean": 4.49196,
          "sd": 1.937525
        },
        {
          "mean": 5,
          "observedMean": 4.427618,
          "sd": 1.920439
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.676202,
      "sd": 1.957919,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.085108,
          "sd": 2.200361
        },
        {
          "mean": 5,
          "observedMean": 5.117249,
          "sd": 2.19638
        },
        {
          "mean": 5,
          "observedMean": 5.160355,
          "sd": 2.189912
        },
        {
          "mean": 5,
          "observedMean": 5.191225,
          "sd": 2.187034
        },
        {
          "mean": 5,
          "observedMean": 5.207005,
          "sd": 2.184119
        },
        {
          "mean": 5,
          "observedMean": 5.154902,
          "sd": 2.162269
        },
        {
          "mean": 5,
          "observedMean": 5.11463,
          "sd": 2.141145
        },
        {
          "mean": 5,
          "observedMean": 5.075236,
          "sd": 2.119234
        },
        {
          "mean": 5,
          "observedMean": 5.040322,
          "sd": 2.096703
        },
        {
          "mean": 5,
          "observedMean": 5.003423,
          "sd": 2.075741
        },
        {
          "mean": 5,
          "observedMean": 4.961527,
          "sd": 2.056121
        },
        {
          "mean": 5,
          "observedMean": 4.921953,
          "sd": 2.037937
        },
        {
          "mean": 5,
          "observedMean": 4.877335,
          "sd": 2.025672
        },
        {
          "mean": 5,
          "observedMean": 4.842203,
          "sd": 2.006651
        },
        {
          "mean": 5,
          "observedMean": 4.807189,
          "sd": 1.991171
        },
        {
          "mean": 5,
          "observedMean": 4.769466,
          "sd": 1.978717
        },
        {
          "mean": 5,
          "observedMean": 4.73439,
          "sd": 1.968092
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.6817,
      "sd": 2.139673,
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
          "observedMean": 4.836286,
          "sd": 2.181152
        },
        {
          "mean": 5,
          "observedMean": 4.815502,
          "sd": 2.1779
        },
        {
          "mean": 5,
          "observedMean": 4.831763,
          "sd": 2.173226
        },
        {
          "mean": 5,
          "observedMean": 4.846237,
          "sd": 2.172151
        },
        {
          "mean": 5,
          "observedMean": 4.842767,
          "sd": 2.168506
        },
        {
          "mean": 5,
          "observedMean": 4.839371,
          "sd": 2.166402
        },
        {
          "mean": 5,
          "observedMean": 4.837037,
          "sd": 2.166438
        },
        {
          "mean": 5,
          "observedMean": 4.835161,
          "sd": 2.164323
        },
        {
          "mean": 5,
          "observedMean": 4.832133,
          "sd": 2.162294
        },
        {
          "mean": 5,
          "observedMean": 4.831064,
          "sd": 2.160628
        },
        {
          "mean": 5,
          "observedMean": 4.830224,
          "sd": 2.157766
        },
        {
          "mean": 5,
          "observedMean": 4.829147,
          "sd": 2.156206
        },
        {
          "mean": 5,
          "observedMean": 4.800818,
          "sd": 2.154082
        },
        {
          "mean": 5,
          "observedMean": 4.772401,
          "sd": 2.15211
        },
        {
          "mean": 5,
          "observedMean": 4.739385,
          "sd": 2.148292
        },
        {
          "mean": 5,
          "observedMean": 4.711376,
          "sd": 2.144548
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.885034,
      "sd": 2.098638,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.076249,
          "sd": 2.204686
        },
        {
          "mean": 5,
          "observedMean": 5.162595,
          "sd": 2.183821
        },
        {
          "mean": 5,
          "observedMean": 5.121358,
          "sd": 2.16899
        },
        {
          "mean": 5,
          "observedMean": 5.115054,
          "sd": 2.161251
        },
        {
          "mean": 5,
          "observedMean": 5.107384,
          "sd": 2.158321
        },
        {
          "mean": 5,
          "observedMean": 5.105453,
          "sd": 2.15156
        },
        {
          "mean": 5,
          "observedMean": 5.097125,
          "sd": 2.151106
        },
        {
          "mean": 5,
          "observedMean": 5.091514,
          "sd": 2.144752
        },
        {
          "mean": 5,
          "observedMean": 5.089708,
          "sd": 2.142315
        },
        {
          "mean": 5,
          "observedMean": 5.082568,
          "sd": 2.139441
        },
        {
          "mean": 5,
          "observedMean": 5.075639,
          "sd": 2.131244
        },
        {
          "mean": 5,
          "observedMean": 5.073184,
          "sd": 2.125792
        },
        {
          "mean": 5,
          "observedMean": 5.068492,
          "sd": 2.125665
        },
        {
          "mean": 5,
          "observedMean": 5.042908,
          "sd": 2.116932
        },
        {
          "mean": 5,
          "observedMean": 5.006131,
          "sd": 2.107987
        },
        {
          "mean": 5,
          "observedMean": 4.966352,
          "sd": 2.100611
        },
        {
          "mean": 5,
          "observedMean": 4.928672,
          "sd": 2.096746
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.01442,
      "sd": 3.168438,
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
          "mean": 40.129744,
          "sd": 1.577681
        },
        {
          "mean": 42.733665,
          "sd": 1.697909
        },
        {
          "mean": 45.252423,
          "sd": 1.828198
        },
        {
          "mean": 47.735073,
          "sd": 1.957369
        },
        {
          "mean": 50.103218,
          "sd": 2.08199
        },
        {
          "mean": 52.304585,
          "sd": 2.205578
        },
        {
          "mean": 54.303575,
          "sd": 2.331514
        },
        {
          "mean": 56.242963,
          "sd": 2.462042
        },
        {
          "mean": 58.45751,
          "sd": 2.673874
        },
        {
          "mean": 61.19659,
          "sd": 2.947915
        },
        {
          "mean": 64.088732,
          "sd": 3.154063
        },
        {
          "mean": 66.49532,
          "sd": 3.213524
        },
        {
          "mean": 68.083528,
          "sd": 3.188421
        },
        {
          "mean": 68.84307,
          "sd": 3.167507
        }
      ]
    },
    "female": {
      "mean": 63.94103,
      "sd": 2.7619,
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
          "mean": 39.655845,
          "sd": 1.558976
        },
        {
          "mean": 42.349311,
          "sd": 1.681057
        },
        {
          "mean": 45.109799,
          "sd": 1.810262
        },
        {
          "mean": 47.751686,
          "sd": 1.937017
        },
        {
          "mean": 50.123936,
          "sd": 2.040907
        },
        {
          "mean": 52.190337,
          "sd": 2.152004
        },
        {
          "mean": 54.193558,
          "sd": 2.288815
        },
        {
          "mean": 56.566485,
          "sd": 2.503394
        },
        {
          "mean": 59.286685,
          "sd": 2.732596
        },
        {
          "mean": 61.630599,
          "sd": 2.828301
        },
        {
          "mean": 63.122861,
          "sd": 2.807898
        },
        {
          "mean": 63.789345,
          "sd": 2.781472
        },
        {
          "mean": 63.931254,
          "sd": 2.768236
        },
        {
          "mean": 63.938448,
          "sd": 2.766578
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
      "mean": 5.283301,
      "sd": 1.932946
    },
    {
      "mean": 5.385062,
      "sd": 1.911332
    },
    {
      "mean": 5.489912,
      "sd": 1.88997
    },
    {
      "mean": 5.59133,
      "sd": 1.868712
    },
    {
      "mean": 5.682548,
      "sd": 1.849811
    },
    {
      "mean": 5.783891,
      "sd": 1.829558
    },
    {
      "mean": 5.881368,
      "sd": 1.806715
    },
    {
      "mean": 5.973569,
      "sd": 1.784117
    },
    {
      "mean": 6.063384,
      "sd": 1.764701
    },
    {
      "mean": 6.146763,
      "sd": 1.745095
    },
    {
      "mean": 6.232275,
      "sd": 1.721683
    },
    {
      "mean": 6.319277,
      "sd": 1.703248
    },
    {
      "mean": 6.403237,
      "sd": 1.685168
    },
    {
      "mean": 6.48545,
      "sd": 1.670417
    },
    {
      "mean": 6.564723,
      "sd": 1.656547
    }
  ]
};
