// Generated from seeded game lives; no real-world percentile tables.
// See calibration.reproduce below. Ages contain current same-age peer ratings;
// top-level stat and height moments describe age 18.
export const PERCENTILE_REFERENCE = {
  "calibration": {
    "samplesPerSex": 2000,
    "seedStart": 200001,
    "survivors": {
      "male": 1985,
      "female": 1986
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
    "focusPolicy": "core two-point targets with optional school activities unenrolled and the extracurricular neglect penalty active; fitted to birth-condition budgets and active condition/event caps; spare points left unused",
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
      3976,
      3976,
      3976,
      3976,
      3974,
      3974,
      3973,
      3971
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
      "observedMean": 6.01237,
      "sd": 1.643604,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.074535,
          "sd": 2.17921
        },
        {
          "mean": 5,
          "observedMean": 5.256827,
          "sd": 2.134312
        },
        {
          "mean": 5,
          "observedMean": 5.430684,
          "sd": 2.089978
        },
        {
          "mean": 5,
          "observedMean": 5.472861,
          "sd": 2.055415
        },
        {
          "mean": 5,
          "observedMean": 5.469645,
          "sd": 2.027942
        },
        {
          "mean": 5,
          "observedMean": 5.460289,
          "sd": 1.99738
        },
        {
          "mean": 5,
          "observedMean": 5.522565,
          "sd": 1.962088
        },
        {
          "mean": 5,
          "observedMean": 5.582299,
          "sd": 1.930338
        },
        {
          "mean": 5,
          "observedMean": 5.646368,
          "sd": 1.895874
        },
        {
          "mean": 5,
          "observedMean": 5.711396,
          "sd": 1.863232
        },
        {
          "mean": 5,
          "observedMean": 5.774904,
          "sd": 1.82493
        },
        {
          "mean": 5,
          "observedMean": 5.832472,
          "sd": 1.800593
        },
        {
          "mean": 5,
          "observedMean": 5.890722,
          "sd": 1.769219
        },
        {
          "mean": 5,
          "observedMean": 5.944449,
          "sd": 1.739052
        },
        {
          "mean": 5,
          "observedMean": 5.970521,
          "sd": 1.71663
        },
        {
          "mean": 5,
          "observedMean": 5.985604,
          "sd": 1.694521
        },
        {
          "mean": 5,
          "observedMean": 6.00301,
          "sd": 1.671766
        },
        {
          "mean": 5,
          "observedMean": 6.011432,
          "sd": 1.652532
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.976323,
      "sd": 1.793148,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.030385,
          "sd": 2.206269
        },
        {
          "mean": 5,
          "observedMean": 5.040322,
          "sd": 2.174989
        },
        {
          "mean": 5,
          "observedMean": 5.049485,
          "sd": 2.144923
        },
        {
          "mean": 5,
          "observedMean": 5.033601,
          "sd": 2.115078
        },
        {
          "mean": 5,
          "observedMean": 5.019774,
          "sd": 2.084835
        },
        {
          "mean": 5,
          "observedMean": 5.004346,
          "sd": 2.059118
        },
        {
          "mean": 5,
          "observedMean": 5.000196,
          "sd": 2.031543
        },
        {
          "mean": 5,
          "observedMean": 5.000838,
          "sd": 2.00942
        },
        {
          "mean": 5,
          "observedMean": 4.998705,
          "sd": 1.988952
        },
        {
          "mean": 5,
          "observedMean": 4.997782,
          "sd": 1.964425
        },
        {
          "mean": 5,
          "observedMean": 4.99536,
          "sd": 1.94057
        },
        {
          "mean": 5,
          "observedMean": 4.997618,
          "sd": 1.920537
        },
        {
          "mean": 5,
          "observedMean": 5.000921,
          "sd": 1.902565
        },
        {
          "mean": 5,
          "observedMean": 5.001605,
          "sd": 1.884325
        },
        {
          "mean": 5,
          "observedMean": 4.999024,
          "sd": 1.865563
        },
        {
          "mean": 5,
          "observedMean": 4.99197,
          "sd": 1.847558
        },
        {
          "mean": 5,
          "observedMean": 4.990544,
          "sd": 1.828009
        },
        {
          "mean": 5,
          "observedMean": 4.986056,
          "sd": 1.812975
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.875029,
      "sd": 1.944208,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94128,
          "sd": 2.024831
        },
        {
          "mean": 5,
          "observedMean": 4.938724,
          "sd": 2.019586
        },
        {
          "mean": 5,
          "observedMean": 4.938788,
          "sd": 2.016369
        },
        {
          "mean": 5,
          "observedMean": 4.930038,
          "sd": 2.010863
        },
        {
          "mean": 5,
          "observedMean": 4.921994,
          "sd": 2.007155
        },
        {
          "mean": 5,
          "observedMean": 4.912409,
          "sd": 2.002334
        },
        {
          "mean": 5,
          "observedMean": 4.905656,
          "sd": 1.996972
        },
        {
          "mean": 5,
          "observedMean": 4.897377,
          "sd": 1.991535
        },
        {
          "mean": 5,
          "observedMean": 4.889982,
          "sd": 1.987045
        },
        {
          "mean": 5,
          "observedMean": 4.883091,
          "sd": 1.982205
        },
        {
          "mean": 5,
          "observedMean": 4.876959,
          "sd": 1.977969
        },
        {
          "mean": 5,
          "observedMean": 4.869909,
          "sd": 1.97382
        },
        {
          "mean": 5,
          "observedMean": 4.861358,
          "sd": 1.968522
        },
        {
          "mean": 5,
          "observedMean": 4.85409,
          "sd": 1.963678
        },
        {
          "mean": 5,
          "observedMean": 4.858994,
          "sd": 1.959966
        },
        {
          "mean": 5,
          "observedMean": 4.862685,
          "sd": 1.956285
        },
        {
          "mean": 5,
          "observedMean": 4.865788,
          "sd": 1.952472
        },
        {
          "mean": 5,
          "observedMean": 4.870735,
          "sd": 1.948028
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.559224,
      "sd": 1.671412,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.002082,
          "sd": 2.21191
        },
        {
          "mean": 5,
          "observedMean": 5.056784,
          "sd": 2.167146
        },
        {
          "mean": 5,
          "observedMean": 5.113231,
          "sd": 2.126863
        },
        {
          "mean": 5,
          "observedMean": 5.183259,
          "sd": 2.086983
        },
        {
          "mean": 5,
          "observedMean": 5.213015,
          "sd": 2.055161
        },
        {
          "mean": 5,
          "observedMean": 5.222892,
          "sd": 2.025498
        },
        {
          "mean": 5,
          "observedMean": 5.157055,
          "sd": 1.982393
        },
        {
          "mean": 5,
          "observedMean": 5.093654,
          "sd": 1.944666
        },
        {
          "mean": 5,
          "observedMean": 5.042352,
          "sd": 1.908295
        },
        {
          "mean": 5,
          "observedMean": 4.99339,
          "sd": 1.867426
        },
        {
          "mean": 5,
          "observedMean": 4.948753,
          "sd": 1.835517
        },
        {
          "mean": 5,
          "observedMean": 4.904972,
          "sd": 1.809346
        },
        {
          "mean": 5,
          "observedMean": 4.870923,
          "sd": 1.788646
        },
        {
          "mean": 5,
          "observedMean": 4.829157,
          "sd": 1.760157
        },
        {
          "mean": 5,
          "observedMean": 4.767558,
          "sd": 1.739187
        },
        {
          "mean": 5,
          "observedMean": 4.720773,
          "sd": 1.717709
        },
        {
          "mean": 5,
          "observedMean": 4.667693,
          "sd": 1.702823
        },
        {
          "mean": 5,
          "observedMean": 4.619663,
          "sd": 1.685194
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.604387,
      "sd": 1.697469,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.054698,
          "sd": 2.201618
        },
        {
          "mean": 5,
          "observedMean": 5.077043,
          "sd": 2.169987
        },
        {
          "mean": 5,
          "observedMean": 5.100402,
          "sd": 2.13701
        },
        {
          "mean": 5,
          "observedMean": 5.140686,
          "sd": 2.105879
        },
        {
          "mean": 5,
          "observedMean": 5.167523,
          "sd": 2.080866
        },
        {
          "mean": 5,
          "observedMean": 5.178876,
          "sd": 2.054789
        },
        {
          "mean": 5,
          "observedMean": 5.122347,
          "sd": 2.0175
        },
        {
          "mean": 5,
          "observedMean": 5.078219,
          "sd": 1.984137
        },
        {
          "mean": 5,
          "observedMean": 5.033868,
          "sd": 1.952368
        },
        {
          "mean": 5,
          "observedMean": 4.997915,
          "sd": 1.916318
        },
        {
          "mean": 5,
          "observedMean": 4.953956,
          "sd": 1.883387
        },
        {
          "mean": 5,
          "observedMean": 4.909248,
          "sd": 1.851271
        },
        {
          "mean": 5,
          "observedMean": 4.87089,
          "sd": 1.824292
        },
        {
          "mean": 5,
          "observedMean": 4.833058,
          "sd": 1.803649
        },
        {
          "mean": 5,
          "observedMean": 4.794386,
          "sd": 1.777767
        },
        {
          "mean": 5,
          "observedMean": 4.75235,
          "sd": 1.754937
        },
        {
          "mean": 5,
          "observedMean": 4.705264,
          "sd": 1.734759
        },
        {
          "mean": 5,
          "observedMean": 4.668663,
          "sd": 1.718107
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.990725,
      "sd": 0.694512,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.891608,
          "sd": 2.196033
        },
        {
          "mean": 5,
          "observedMean": 4.886985,
          "sd": 2.03216
        },
        {
          "mean": 5,
          "observedMean": 4.878798,
          "sd": 1.880085
        },
        {
          "mean": 5,
          "observedMean": 4.87871,
          "sd": 1.747343
        },
        {
          "mean": 5,
          "observedMean": 4.916965,
          "sd": 1.62082
        },
        {
          "mean": 5,
          "observedMean": 4.951114,
          "sd": 1.508076
        },
        {
          "mean": 5,
          "observedMean": 4.968815,
          "sd": 1.402803
        },
        {
          "mean": 5,
          "observedMean": 4.982764,
          "sd": 1.305758
        },
        {
          "mean": 5,
          "observedMean": 4.998866,
          "sd": 1.218175
        },
        {
          "mean": 5,
          "observedMean": 5.011469,
          "sd": 1.136837
        },
        {
          "mean": 5,
          "observedMean": 5.024831,
          "sd": 1.060192
        },
        {
          "mean": 5,
          "observedMean": 5.037286,
          "sd": 0.992337
        },
        {
          "mean": 5,
          "observedMean": 5.047995,
          "sd": 0.928825
        },
        {
          "mean": 5,
          "observedMean": 5.059293,
          "sd": 0.869284
        },
        {
          "mean": 5,
          "observedMean": 5.050355,
          "sd": 0.824594
        },
        {
          "mean": 5,
          "observedMean": 5.035956,
          "sd": 0.787482
        },
        {
          "mean": 5,
          "observedMean": 5.021236,
          "sd": 0.756991
        },
        {
          "mean": 5,
          "observedMean": 5.00745,
          "sd": 0.725324
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.072045,
      "sd": 0.792919,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.98349,
          "sd": 2.222802
        },
        {
          "mean": 5,
          "observedMean": 5.129078,
          "sd": 2.014326
        },
        {
          "mean": 5,
          "observedMean": 5.253548,
          "sd": 1.830435
        },
        {
          "mean": 5,
          "observedMean": 5.208743,
          "sd": 1.647603
        },
        {
          "mean": 5,
          "observedMean": 5.218818,
          "sd": 1.491898
        },
        {
          "mean": 5,
          "observedMean": 5.228001,
          "sd": 1.359733
        },
        {
          "mean": 5,
          "observedMean": 5.231411,
          "sd": 1.239027
        },
        {
          "mean": 5,
          "observedMean": 5.211605,
          "sd": 1.14512
        },
        {
          "mean": 5,
          "observedMean": 5.199781,
          "sd": 1.068888
        },
        {
          "mean": 5,
          "observedMean": 5.178252,
          "sd": 1.000367
        },
        {
          "mean": 5,
          "observedMean": 5.158652,
          "sd": 0.946817
        },
        {
          "mean": 5,
          "observedMean": 5.150224,
          "sd": 0.893017
        },
        {
          "mean": 5,
          "observedMean": 5.146813,
          "sd": 0.857996
        },
        {
          "mean": 5,
          "observedMean": 5.139658,
          "sd": 0.834065
        },
        {
          "mean": 5,
          "observedMean": 5.131489,
          "sd": 0.820381
        },
        {
          "mean": 5,
          "observedMean": 5.114039,
          "sd": 0.810169
        },
        {
          "mean": 5,
          "observedMean": 5.097994,
          "sd": 0.802855
        },
        {
          "mean": 5,
          "observedMean": 5.092102,
          "sd": 0.801447
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 69.25199,
      "sd": 3.059053,
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
          "mean": 33.968597,
          "sd": 1.298897
        },
        {
          "mean": 37.297567,
          "sd": 1.448241
        },
        {
          "mean": 40.137009,
          "sd": 1.577242
        },
        {
          "mean": 42.746918,
          "sd": 1.697252
        },
        {
          "mean": 45.281146,
          "sd": 1.814238
        },
        {
          "mean": 47.766375,
          "sd": 1.940056
        },
        {
          "mean": 50.154168,
          "sd": 2.055185
        },
        {
          "mean": 52.36186,
          "sd": 2.172781
        },
        {
          "mean": 54.369251,
          "sd": 2.288778
        },
        {
          "mean": 56.326948,
          "sd": 2.420405
        },
        {
          "mean": 58.567366,
          "sd": 2.622145
        },
        {
          "mean": 61.328356,
          "sd": 2.886291
        },
        {
          "mean": 64.247144,
          "sd": 3.068888
        },
        {
          "mean": 66.671857,
          "sd": 3.120401
        },
        {
          "mean": 68.294957,
          "sd": 3.086749
        },
        {
          "mean": 69.072301,
          "sd": 3.058655
        }
      ]
    },
    "female": {
      "mean": 64.121974,
      "sd": 2.761072,
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
          "mean": 33.473838,
          "sd": 1.295655
        },
        {
          "mean": 36.988602,
          "sd": 1.442369
        },
        {
          "mean": 39.663214,
          "sd": 1.558604
        },
        {
          "mean": 42.36233,
          "sd": 1.680483
        },
        {
          "mean": 45.12613,
          "sd": 1.813648
        },
        {
          "mean": 47.778485,
          "sd": 1.932856
        },
        {
          "mean": 50.167106,
          "sd": 2.048472
        },
        {
          "mean": 52.253377,
          "sd": 2.158981
        },
        {
          "mean": 54.275581,
          "sd": 2.291118
        },
        {
          "mean": 56.669733,
          "sd": 2.493442
        },
        {
          "mean": 59.410086,
          "sd": 2.720458
        },
        {
          "mean": 61.772335,
          "sd": 2.821868
        },
        {
          "mean": 63.282909,
          "sd": 2.801571
        },
        {
          "mean": 63.966019,
          "sd": 2.776288
        },
        {
          "mean": 64.11463,
          "sd": 2.762797
        },
        {
          "mean": 64.122033,
          "sd": 2.760378
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
      "mean": 5.180792,
      "sd": 1.959144
    },
    {
      "mean": 5.283108,
      "sd": 1.933435
    },
    {
      "mean": 5.385326,
      "sd": 1.911414
    },
    {
      "mean": 5.49088,
      "sd": 1.890506
    },
    {
      "mean": 5.593197,
      "sd": 1.870172
    },
    {
      "mean": 5.688197,
      "sd": 1.852002
    },
    {
      "mean": 5.78879,
      "sd": 1.833177
    },
    {
      "mean": 5.878305,
      "sd": 1.815671
    },
    {
      "mean": 5.973119,
      "sd": 1.792396
    },
    {
      "mean": 6.065898,
      "sd": 1.770767
    },
    {
      "mean": 6.159097,
      "sd": 1.746236
    },
    {
      "mean": 6.2442,
      "sd": 1.731395
    },
    {
      "mean": 6.326451,
      "sd": 1.714522
    },
    {
      "mean": 6.408971,
      "sd": 1.699868
    },
    {
      "mean": 6.494205,
      "sd": 1.678132
    },
    {
      "mean": 6.571178,
      "sd": 1.662908
    }
  ]
};
