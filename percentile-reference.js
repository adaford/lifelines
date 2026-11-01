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
    "development": {
      "innateScale": 0.6,
      "skillReversion": 0.012,
      "childhoodBias": {
        "intelligence": -0.062654,
        "strength": 0.014429,
        "social": -0.082272,
        "creativity": -0.07666
      },
      "wellbeingTarget": {
        "health": 5.24477,
        "stability": 5.431694
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
      "observedMean": 4.994571,
      "sd": 1.5699,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.034675,
          "sd": 2.18011
        },
        {
          "mean": 5,
          "observedMean": 5.043575,
          "sd": 2.141707
        },
        {
          "mean": 5,
          "observedMean": 5.051441,
          "sd": 2.102809
        },
        {
          "mean": 5,
          "observedMean": 5.045529,
          "sd": 2.060758
        },
        {
          "mean": 5,
          "observedMean": 5.021929,
          "sd": 2.021969
        },
        {
          "mean": 5,
          "observedMean": 4.987261,
          "sd": 1.980593
        },
        {
          "mean": 5,
          "observedMean": 4.999464,
          "sd": 1.934574
        },
        {
          "mean": 5,
          "observedMean": 5.016984,
          "sd": 1.892385
        },
        {
          "mean": 5,
          "observedMean": 5.032652,
          "sd": 1.854165
        },
        {
          "mean": 5,
          "observedMean": 5.046075,
          "sd": 1.816131
        },
        {
          "mean": 5,
          "observedMean": 5.059301,
          "sd": 1.786478
        },
        {
          "mean": 5,
          "observedMean": 5.074699,
          "sd": 1.755969
        },
        {
          "mean": 5,
          "observedMean": 5.087596,
          "sd": 1.721164
        },
        {
          "mean": 5,
          "observedMean": 5.099829,
          "sd": 1.688762
        },
        {
          "mean": 5,
          "observedMean": 5.074635,
          "sd": 1.663293
        },
        {
          "mean": 5,
          "observedMean": 5.054163,
          "sd": 1.640335
        },
        {
          "mean": 5,
          "observedMean": 5.036133,
          "sd": 1.619829
        },
        {
          "mean": 5,
          "observedMean": 5.019705,
          "sd": 1.587305
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 4.996797,
      "sd": 1.771261,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03067,
          "sd": 2.204268
        },
        {
          "mean": 5,
          "observedMean": 5.046588,
          "sd": 2.169042
        },
        {
          "mean": 5,
          "observedMean": 5.061574,
          "sd": 2.135359
        },
        {
          "mean": 5,
          "observedMean": 5.064765,
          "sd": 2.100289
        },
        {
          "mean": 5,
          "observedMean": 5.059251,
          "sd": 2.069095
        },
        {
          "mean": 5,
          "observedMean": 5.051972,
          "sd": 2.040883
        },
        {
          "mean": 5,
          "observedMean": 5.048979,
          "sd": 2.015327
        },
        {
          "mean": 5,
          "observedMean": 5.044048,
          "sd": 1.993801
        },
        {
          "mean": 5,
          "observedMean": 5.042282,
          "sd": 1.973278
        },
        {
          "mean": 5,
          "observedMean": 5.037278,
          "sd": 1.947855
        },
        {
          "mean": 5,
          "observedMean": 5.031977,
          "sd": 1.927623
        },
        {
          "mean": 5,
          "observedMean": 5.028812,
          "sd": 1.907708
        },
        {
          "mean": 5,
          "observedMean": 5.026499,
          "sd": 1.887684
        },
        {
          "mean": 5,
          "observedMean": 5.02589,
          "sd": 1.87152
        },
        {
          "mean": 5,
          "observedMean": 5.017369,
          "sd": 1.851299
        },
        {
          "mean": 5,
          "observedMean": 5.013168,
          "sd": 1.830095
        },
        {
          "mean": 5,
          "observedMean": 5.007658,
          "sd": 1.8098
        },
        {
          "mean": 5,
          "observedMean": 4.999162,
          "sd": 1.79042
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.870861,
      "sd": 1.939204,
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
          "observedMean": 4.929849,
          "sd": 2.010691
        },
        {
          "mean": 5,
          "observedMean": 4.921805,
          "sd": 2.007041
        },
        {
          "mean": 5,
          "observedMean": 4.912269,
          "sd": 2.002255
        },
        {
          "mean": 5,
          "observedMean": 4.905794,
          "sd": 1.997994
        },
        {
          "mean": 5,
          "observedMean": 4.897925,
          "sd": 1.992806
        },
        {
          "mean": 5,
          "observedMean": 4.890264,
          "sd": 1.987474
        },
        {
          "mean": 5,
          "observedMean": 4.883419,
          "sd": 1.982481
        },
        {
          "mean": 5,
          "observedMean": 4.875112,
          "sd": 1.97759
        },
        {
          "mean": 5,
          "observedMean": 4.867345,
          "sd": 1.972391
        },
        {
          "mean": 5,
          "observedMean": 4.860468,
          "sd": 1.969079
        },
        {
          "mean": 5,
          "observedMean": 4.853894,
          "sd": 1.965417
        },
        {
          "mean": 5,
          "observedMean": 4.855347,
          "sd": 1.961028
        },
        {
          "mean": 5,
          "observedMean": 4.860551,
          "sd": 1.955278
        },
        {
          "mean": 5,
          "observedMean": 4.864457,
          "sd": 1.948574
        },
        {
          "mean": 5,
          "observedMean": 4.866551,
          "sd": 1.943927
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 5.008112,
      "sd": 1.592938,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.996318,
          "sd": 2.207495
        },
        {
          "mean": 5,
          "observedMean": 4.975955,
          "sd": 2.150804
        },
        {
          "mean": 5,
          "observedMean": 4.959384,
          "sd": 2.100151
        },
        {
          "mean": 5,
          "observedMean": 4.96386,
          "sd": 2.05158
        },
        {
          "mean": 5,
          "observedMean": 4.922585,
          "sd": 2.008035
        },
        {
          "mean": 5,
          "observedMean": 4.863898,
          "sd": 1.967488
        },
        {
          "mean": 5,
          "observedMean": 4.868813,
          "sd": 1.926067
        },
        {
          "mean": 5,
          "observedMean": 4.88757,
          "sd": 1.886751
        },
        {
          "mean": 5,
          "observedMean": 4.913525,
          "sd": 1.8456
        },
        {
          "mean": 5,
          "observedMean": 4.929268,
          "sd": 1.81561
        },
        {
          "mean": 5,
          "observedMean": 4.948737,
          "sd": 1.779678
        },
        {
          "mean": 5,
          "observedMean": 4.964729,
          "sd": 1.750246
        },
        {
          "mean": 5,
          "observedMean": 4.986484,
          "sd": 1.718132
        },
        {
          "mean": 5,
          "observedMean": 5.012311,
          "sd": 1.68998
        },
        {
          "mean": 5,
          "observedMean": 5.014789,
          "sd": 1.668457
        },
        {
          "mean": 5,
          "observedMean": 5.017182,
          "sd": 1.646522
        },
        {
          "mean": 5,
          "observedMean": 5.021311,
          "sd": 1.637568
        },
        {
          "mean": 5,
          "observedMean": 5.021524,
          "sd": 1.612789
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 4.99421,
      "sd": 1.62884,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.018552,
          "sd": 2.197999
        },
        {
          "mean": 5,
          "observedMean": 4.972676,
          "sd": 2.153078
        },
        {
          "mean": 5,
          "observedMean": 4.928544,
          "sd": 2.109286
        },
        {
          "mean": 5,
          "observedMean": 4.902653,
          "sd": 2.069396
        },
        {
          "mean": 5,
          "observedMean": 4.87094,
          "sd": 2.036489
        },
        {
          "mean": 5,
          "observedMean": 4.825792,
          "sd": 2.001679
        },
        {
          "mean": 5,
          "observedMean": 4.832795,
          "sd": 1.962293
        },
        {
          "mean": 5,
          "observedMean": 4.853253,
          "sd": 1.928941
        },
        {
          "mean": 5,
          "observedMean": 4.869733,
          "sd": 1.894127
        },
        {
          "mean": 5,
          "observedMean": 4.885874,
          "sd": 1.857038
        },
        {
          "mean": 5,
          "observedMean": 4.901099,
          "sd": 1.830347
        },
        {
          "mean": 5,
          "observedMean": 4.921251,
          "sd": 1.804509
        },
        {
          "mean": 5,
          "observedMean": 4.934611,
          "sd": 1.77288
        },
        {
          "mean": 5,
          "observedMean": 4.94855,
          "sd": 1.746191
        },
        {
          "mean": 5,
          "observedMean": 4.960267,
          "sd": 1.72082
        },
        {
          "mean": 5,
          "observedMean": 4.972987,
          "sd": 1.697442
        },
        {
          "mean": 5,
          "observedMean": 4.988266,
          "sd": 1.677482
        },
        {
          "mean": 5,
          "observedMean": 5.003726,
          "sd": 1.656709
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.003544,
      "sd": 0.686975,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.905678,
          "sd": 2.198584
        },
        {
          "mean": 5,
          "observedMean": 4.901779,
          "sd": 2.033997
        },
        {
          "mean": 5,
          "observedMean": 4.894277,
          "sd": 1.882607
        },
        {
          "mean": 5,
          "observedMean": 4.895705,
          "sd": 1.749
        },
        {
          "mean": 5,
          "observedMean": 4.935758,
          "sd": 1.622813
        },
        {
          "mean": 5,
          "observedMean": 4.971466,
          "sd": 1.510133
        },
        {
          "mean": 5,
          "observedMean": 4.988674,
          "sd": 1.407794
        },
        {
          "mean": 5,
          "observedMean": 5.004835,
          "sd": 1.312185
        },
        {
          "mean": 5,
          "observedMean": 5.018772,
          "sd": 1.227329
        },
        {
          "mean": 5,
          "observedMean": 5.032558,
          "sd": 1.145833
        },
        {
          "mean": 5,
          "observedMean": 5.044287,
          "sd": 1.070939
        },
        {
          "mean": 5,
          "observedMean": 5.056869,
          "sd": 1.006493
        },
        {
          "mean": 5,
          "observedMean": 5.067146,
          "sd": 0.943551
        },
        {
          "mean": 5,
          "observedMean": 5.07596,
          "sd": 0.883453
        },
        {
          "mean": 5,
          "observedMean": 5.054524,
          "sd": 0.840779
        },
        {
          "mean": 5,
          "observedMean": 5.040665,
          "sd": 0.798833
        },
        {
          "mean": 5,
          "observedMean": 5.025788,
          "sd": 0.757979
        },
        {
          "mean": 5,
          "observedMean": 5.015913,
          "sd": 0.723235
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.995583,
      "sd": 0.83068,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.97463,
          "sd": 2.227561
        },
        {
          "mean": 5,
          "observedMean": 5.05256,
          "sd": 2.012862
        },
        {
          "mean": 5,
          "observedMean": 5.118381,
          "sd": 1.823984
        },
        {
          "mean": 5,
          "observedMean": 5.084078,
          "sd": 1.641162
        },
        {
          "mean": 5,
          "observedMean": 5.118587,
          "sd": 1.483808
        },
        {
          "mean": 5,
          "observedMean": 5.147674,
          "sd": 1.35251
        },
        {
          "mean": 5,
          "observedMean": 5.140946,
          "sd": 1.233837
        },
        {
          "mean": 5,
          "observedMean": 5.117645,
          "sd": 1.138502
        },
        {
          "mean": 5,
          "observedMean": 5.090989,
          "sd": 1.058067
        },
        {
          "mean": 5,
          "observedMean": 5.072581,
          "sd": 1.007722
        },
        {
          "mean": 5,
          "observedMean": 5.054719,
          "sd": 0.949437
        },
        {
          "mean": 5,
          "observedMean": 5.036776,
          "sd": 0.908779
        },
        {
          "mean": 5,
          "observedMean": 5.032255,
          "sd": 0.868965
        },
        {
          "mean": 5,
          "observedMean": 5.02595,
          "sd": 0.841189
        },
        {
          "mean": 5,
          "observedMean": 5.01785,
          "sd": 0.837095
        },
        {
          "mean": 5,
          "observedMean": 5.007847,
          "sd": 0.837963
        },
        {
          "mean": 5,
          "observedMean": 5.016045,
          "sd": 0.829978
        },
        {
          "mean": 5,
          "observedMean": 5.002894,
          "sd": 0.827887
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.429556,
      "sd": 3.453548,
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
          "mean": 33.526737,
          "sd": 1.43165
        },
        {
          "mean": 36.77447,
          "sd": 1.625033
        },
        {
          "mean": 39.553358,
          "sd": 1.789923
        },
        {
          "mean": 42.116275,
          "sd": 1.942028
        },
        {
          "mean": 44.607009,
          "sd": 2.082807
        },
        {
          "mean": 47.065525,
          "sd": 2.230912
        },
        {
          "mean": 49.426521,
          "sd": 2.367215
        },
        {
          "mean": 51.615214,
          "sd": 2.495694
        },
        {
          "mean": 53.613454,
          "sd": 2.622617
        },
        {
          "mean": 55.564593,
          "sd": 2.764278
        },
        {
          "mean": 57.786258,
          "sd": 2.960439
        },
        {
          "mean": 60.527897,
          "sd": 3.233859
        },
        {
          "mean": 63.425724,
          "sd": 3.430182
        },
        {
          "mean": 65.843689,
          "sd": 3.493782
        },
        {
          "mean": 67.463456,
          "sd": 3.473636
        },
        {
          "mean": 68.252198,
          "sd": 3.453247
        }
      ]
    },
    "female": {
      "mean": 63.272203,
      "sd": 3.043959,
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
          "mean": 33.028672,
          "sd": 1.41015
        },
        {
          "mean": 36.454155,
          "sd": 1.601655
        },
        {
          "mean": 39.071343,
          "sd": 1.749877
        },
        {
          "mean": 41.719054,
          "sd": 1.898111
        },
        {
          "mean": 44.429748,
          "sd": 2.052569
        },
        {
          "mean": 47.050932,
          "sd": 2.195934
        },
        {
          "mean": 49.405614,
          "sd": 2.324398
        },
        {
          "mean": 51.476878,
          "sd": 2.44217
        },
        {
          "mean": 53.478505,
          "sd": 2.566371
        },
        {
          "mean": 55.847184,
          "sd": 2.763001
        },
        {
          "mean": 58.559486,
          "sd": 2.976067
        },
        {
          "mean": 60.91738,
          "sd": 3.080532
        },
        {
          "mean": 62.428972,
          "sd": 3.074482
        },
        {
          "mean": 63.115116,
          "sd": 3.053254
        },
        {
          "mean": 63.26613,
          "sd": 3.045301
        },
        {
          "mean": 63.272369,
          "sd": 3.043199
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
      "mean": 5.18086,
      "sd": 1.959057
    },
    {
      "mean": 5.283299,
      "sd": 1.933135
    },
    {
      "mean": 5.385245,
      "sd": 1.911555
    },
    {
      "mean": 5.49091,
      "sd": 1.890498
    },
    {
      "mean": 5.593847,
      "sd": 1.868721
    },
    {
      "mean": 5.692287,
      "sd": 1.847581
    },
    {
      "mean": 5.790327,
      "sd": 1.823709
    },
    {
      "mean": 5.886252,
      "sd": 1.798883
    },
    {
      "mean": 5.984413,
      "sd": 1.777797
    },
    {
      "mean": 6.076516,
      "sd": 1.755652
    },
    {
      "mean": 6.164105,
      "sd": 1.729634
    },
    {
      "mean": 6.253509,
      "sd": 1.709293
    },
    {
      "mean": 6.337369,
      "sd": 1.691755
    },
    {
      "mean": 6.421325,
      "sd": 1.674528
    },
    {
      "mean": 6.506511,
      "sd": 1.651287
    },
    {
      "mean": 6.58914,
      "sd": 1.631159
    }
  ]
};
