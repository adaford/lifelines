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
      3978,
      3977,
      3977,
      3977,
      3977,
      3977,
      3976,
      3976,
      3976,
      3975,
      3975,
      3975,
      3973,
      3970,
      3968,
      3966,
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
      "observedMean": 5.380548,
      "sd": 2.303519,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.034472,
          "sd": 2.702083
        },
        {
          "mean": 5,
          "observedMean": 5.21264,
          "sd": 2.659535
        },
        {
          "mean": 5,
          "observedMean": 5.383865,
          "sd": 2.617368
        },
        {
          "mean": 5,
          "observedMean": 5.438391,
          "sd": 2.603658
        },
        {
          "mean": 5,
          "observedMean": 5.460938,
          "sd": 2.594487
        },
        {
          "mean": 5,
          "observedMean": 5.476535,
          "sd": 2.588236
        },
        {
          "mean": 5,
          "observedMean": 5.485175,
          "sd": 2.56469
        },
        {
          "mean": 5,
          "observedMean": 5.499452,
          "sd": 2.54017
        },
        {
          "mean": 5,
          "observedMean": 5.509115,
          "sd": 2.51494
        },
        {
          "mean": 5,
          "observedMean": 5.522382,
          "sd": 2.489858
        },
        {
          "mean": 5,
          "observedMean": 5.532966,
          "sd": 2.468303
        },
        {
          "mean": 5,
          "observedMean": 5.543925,
          "sd": 2.447634
        },
        {
          "mean": 5,
          "observedMean": 5.550923,
          "sd": 2.424618
        },
        {
          "mean": 5,
          "observedMean": 5.558316,
          "sd": 2.397901
        },
        {
          "mean": 5,
          "observedMean": 5.528297,
          "sd": 2.374973
        },
        {
          "mean": 5,
          "observedMean": 5.49309,
          "sd": 2.349776
        },
        {
          "mean": 5,
          "observedMean": 5.459223,
          "sd": 2.332073
        },
        {
          "mean": 5,
          "observedMean": 5.424763,
          "sd": 2.315132
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 3.429869,
      "sd": 2.426119,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.055695,
          "sd": 2.729379
        },
        {
          "mean": 5,
          "observedMean": 5.046938,
          "sd": 2.7235
        },
        {
          "mean": 5,
          "observedMean": 5.036528,
          "sd": 2.716826
        },
        {
          "mean": 5,
          "observedMean": 5.007604,
          "sd": 2.707029
        },
        {
          "mean": 5,
          "observedMean": 4.95906,
          "sd": 2.697917
        },
        {
          "mean": 5,
          "observedMean": 4.902434,
          "sd": 2.685712
        },
        {
          "mean": 5,
          "observedMean": 4.781174,
          "sd": 2.663006
        },
        {
          "mean": 5,
          "observedMean": 4.662183,
          "sd": 2.641091
        },
        {
          "mean": 5,
          "observedMean": 4.543939,
          "sd": 2.62226
        },
        {
          "mean": 5,
          "observedMean": 4.426087,
          "sd": 2.601451
        },
        {
          "mean": 5,
          "observedMean": 4.312176,
          "sd": 2.581508
        },
        {
          "mean": 5,
          "observedMean": 4.199678,
          "sd": 2.560837
        },
        {
          "mean": 5,
          "observedMean": 4.088063,
          "sd": 2.543643
        },
        {
          "mean": 5,
          "observedMean": 3.979977,
          "sd": 2.525875
        },
        {
          "mean": 5,
          "observedMean": 3.866013,
          "sd": 2.505513
        },
        {
          "mean": 5,
          "observedMean": 3.756557,
          "sd": 2.489265
        },
        {
          "mean": 5,
          "observedMean": 3.644975,
          "sd": 2.465545
        },
        {
          "mean": 5,
          "observedMean": 3.537553,
          "sd": 2.445453
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.740174,
      "sd": 2.640785,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.020933,
          "sd": 2.704993
        },
        {
          "mean": 5,
          "observedMean": 5.023731,
          "sd": 2.705726
        },
        {
          "mean": 5,
          "observedMean": 5.024642,
          "sd": 2.705219
        },
        {
          "mean": 5,
          "observedMean": 5.013749,
          "sd": 2.702696
        },
        {
          "mean": 5,
          "observedMean": 4.996548,
          "sd": 2.698528
        },
        {
          "mean": 5,
          "observedMean": 4.979902,
          "sd": 2.695305
        },
        {
          "mean": 5,
          "observedMean": 4.955705,
          "sd": 2.690523
        },
        {
          "mean": 5,
          "observedMean": 4.930556,
          "sd": 2.684865
        },
        {
          "mean": 5,
          "observedMean": 4.905903,
          "sd": 2.679836
        },
        {
          "mean": 5,
          "observedMean": 4.881283,
          "sd": 2.675221
        },
        {
          "mean": 5,
          "observedMean": 4.854913,
          "sd": 2.670015
        },
        {
          "mean": 5,
          "observedMean": 4.828121,
          "sd": 2.664236
        },
        {
          "mean": 5,
          "observedMean": 4.798984,
          "sd": 2.658775
        },
        {
          "mean": 5,
          "observedMean": 4.770727,
          "sd": 2.654589
        },
        {
          "mean": 5,
          "observedMean": 4.76005,
          "sd": 2.649873
        },
        {
          "mean": 5,
          "observedMean": 4.755998,
          "sd": 2.648644
        },
        {
          "mean": 5,
          "observedMean": 4.751447,
          "sd": 2.645893
        },
        {
          "mean": 5,
          "observedMean": 4.746309,
          "sd": 2.643373
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 4.342375,
      "sd": 2.368226,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.07516,
          "sd": 2.738053
        },
        {
          "mean": 5,
          "observedMean": 5.057122,
          "sd": 2.709662
        },
        {
          "mean": 5,
          "observedMean": 5.044871,
          "sd": 2.684788
        },
        {
          "mean": 5,
          "observedMean": 5.063882,
          "sd": 2.66063
        },
        {
          "mean": 5,
          "observedMean": 5.014863,
          "sd": 2.642082
        },
        {
          "mean": 5,
          "observedMean": 4.94692,
          "sd": 2.623985
        },
        {
          "mean": 5,
          "observedMean": 4.915663,
          "sd": 2.594164
        },
        {
          "mean": 5,
          "observedMean": 4.857377,
          "sd": 2.559348
        },
        {
          "mean": 5,
          "observedMean": 4.799759,
          "sd": 2.525133
        },
        {
          "mean": 5,
          "observedMean": 4.74664,
          "sd": 2.499022
        },
        {
          "mean": 5,
          "observedMean": 4.705514,
          "sd": 2.468997
        },
        {
          "mean": 5,
          "observedMean": 4.659854,
          "sd": 2.437928
        },
        {
          "mean": 5,
          "observedMean": 4.618604,
          "sd": 2.419965
        },
        {
          "mean": 5,
          "observedMean": 4.57412,
          "sd": 2.403309
        },
        {
          "mean": 5,
          "observedMean": 4.523128,
          "sd": 2.392841
        },
        {
          "mean": 5,
          "observedMean": 4.480476,
          "sd": 2.387243
        },
        {
          "mean": 5,
          "observedMean": 4.440063,
          "sd": 2.380222
        },
        {
          "mean": 5,
          "observedMean": 4.39643,
          "sd": 2.371451
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 5.283766,
      "sd": 2.377604,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.989778,
          "sd": 2.695395
        },
        {
          "mean": 5,
          "observedMean": 5.015367,
          "sd": 2.690947
        },
        {
          "mean": 5,
          "observedMean": 5.045346,
          "sd": 2.684337
        },
        {
          "mean": 5,
          "observedMean": 5.069766,
          "sd": 2.670228
        },
        {
          "mean": 5,
          "observedMean": 5.081451,
          "sd": 2.659318
        },
        {
          "mean": 5,
          "observedMean": 5.085039,
          "sd": 2.655167
        },
        {
          "mean": 5,
          "observedMean": 5.098368,
          "sd": 2.62431
        },
        {
          "mean": 5,
          "observedMean": 5.114877,
          "sd": 2.598414
        },
        {
          "mean": 5,
          "observedMean": 5.13382,
          "sd": 2.575949
        },
        {
          "mean": 5,
          "observedMean": 5.153921,
          "sd": 2.550981
        },
        {
          "mean": 5,
          "observedMean": 5.176231,
          "sd": 2.528825
        },
        {
          "mean": 5,
          "observedMean": 5.191316,
          "sd": 2.506845
        },
        {
          "mean": 5,
          "observedMean": 5.205399,
          "sd": 2.487693
        },
        {
          "mean": 5,
          "observedMean": 5.221785,
          "sd": 2.465757
        },
        {
          "mean": 5,
          "observedMean": 5.235743,
          "sd": 2.448171
        },
        {
          "mean": 5,
          "observedMean": 5.249466,
          "sd": 2.431333
        },
        {
          "mean": 5,
          "observedMean": 5.26621,
          "sd": 2.412794
        },
        {
          "mean": 5,
          "observedMean": 5.283764,
          "sd": 2.393979
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 4.679071,
      "sd": 2.621614,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.94902,
          "sd": 2.73793
        },
        {
          "mean": 5,
          "observedMean": 4.923198,
          "sd": 2.722788
        },
        {
          "mean": 5,
          "observedMean": 4.891222,
          "sd": 2.708345
        },
        {
          "mean": 5,
          "observedMean": 4.879635,
          "sd": 2.692463
        },
        {
          "mean": 5,
          "observedMean": 4.90036,
          "sd": 2.687133
        },
        {
          "mean": 5,
          "observedMean": 4.922781,
          "sd": 2.681431
        },
        {
          "mean": 5,
          "observedMean": 4.912218,
          "sd": 2.675388
        },
        {
          "mean": 5,
          "observedMean": 4.900767,
          "sd": 2.672176
        },
        {
          "mean": 5,
          "observedMean": 4.890526,
          "sd": 2.665509
        },
        {
          "mean": 5,
          "observedMean": 4.882133,
          "sd": 2.661243
        },
        {
          "mean": 5,
          "observedMean": 4.874921,
          "sd": 2.658016
        },
        {
          "mean": 5,
          "observedMean": 4.865255,
          "sd": 2.65298
        },
        {
          "mean": 5,
          "observedMean": 4.856777,
          "sd": 2.646672
        },
        {
          "mean": 5,
          "observedMean": 4.851611,
          "sd": 2.64486
        },
        {
          "mean": 5,
          "observedMean": 4.815144,
          "sd": 2.640643
        },
        {
          "mean": 5,
          "observedMean": 4.782898,
          "sd": 2.635045
        },
        {
          "mean": 5,
          "observedMean": 4.748396,
          "sd": 2.628241
        },
        {
          "mean": 5,
          "observedMean": 4.718628,
          "sd": 2.625373
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 4.853508,
      "sd": 2.355392,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.03422,
          "sd": 2.707614
        },
        {
          "mean": 5,
          "observedMean": 5.130254,
          "sd": 2.624867
        },
        {
          "mean": 5,
          "observedMean": 5.23994,
          "sd": 2.540999
        },
        {
          "mean": 5,
          "observedMean": 5.231431,
          "sd": 2.487466
        },
        {
          "mean": 5,
          "observedMean": 5.239019,
          "sd": 2.464996
        },
        {
          "mean": 5,
          "observedMean": 5.25266,
          "sd": 2.43891
        },
        {
          "mean": 5,
          "observedMean": 5.242464,
          "sd": 2.431596
        },
        {
          "mean": 5,
          "observedMean": 5.235415,
          "sd": 2.418653
        },
        {
          "mean": 5,
          "observedMean": 5.230443,
          "sd": 2.407553
        },
        {
          "mean": 5,
          "observedMean": 5.224562,
          "sd": 2.398075
        },
        {
          "mean": 5,
          "observedMean": 5.21673,
          "sd": 2.391416
        },
        {
          "mean": 5,
          "observedMean": 5.207613,
          "sd": 2.380618
        },
        {
          "mean": 5,
          "observedMean": 5.195429,
          "sd": 2.38048
        },
        {
          "mean": 5,
          "observedMean": 5.184865,
          "sd": 2.376105
        },
        {
          "mean": 5,
          "observedMean": 5.11296,
          "sd": 2.366898
        },
        {
          "mean": 5,
          "observedMean": 5.044567,
          "sd": 2.358243
        },
        {
          "mean": 5,
          "observedMean": 4.980875,
          "sd": 2.35906
        },
        {
          "mean": 5,
          "observedMean": 4.918514,
          "sd": 2.355282
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.919212,
      "sd": 3.379395,
      "ages": [
        {
          "mean": 19.64866,
          "sd": 0.762276
        },
        {
          "mean": 29.80751,
          "sd": 1.143263
        },
        {
          "mean": 34.00693,
          "sd": 1.339834
        },
        {
          "mean": 37.330584,
          "sd": 1.515087
        },
        {
          "mean": 40.154016,
          "sd": 1.66508
        },
        {
          "mean": 42.7416,
          "sd": 1.804127
        },
        {
          "mean": 45.266029,
          "sd": 1.946492
        },
        {
          "mean": 47.735315,
          "sd": 2.087717
        },
        {
          "mean": 50.101555,
          "sd": 2.218267
        },
        {
          "mean": 52.289366,
          "sd": 2.350454
        },
        {
          "mean": 54.265886,
          "sd": 2.481868
        },
        {
          "mean": 56.191934,
          "sd": 2.628719
        },
        {
          "mean": 58.402467,
          "sd": 2.841441
        },
        {
          "mean": 61.139385,
          "sd": 3.124524
        },
        {
          "mean": 64.022597,
          "sd": 3.344412
        },
        {
          "mean": 66.410777,
          "sd": 3.416171
        },
        {
          "mean": 67.996387,
          "sd": 3.400328
        },
        {
          "mean": 68.750217,
          "sd": 3.381161
        }
      ]
    },
    "female": {
      "mean": 63.83527,
      "sd": 3.109745,
      "ages": [
        {
          "mean": 19.35754,
          "sd": 0.750954
        },
        {
          "mean": 29.162568,
          "sd": 1.146625
        },
        {
          "mean": 33.450719,
          "sd": 1.353529
        },
        {
          "mean": 36.956005,
          "sd": 1.52707
        },
        {
          "mean": 39.62003,
          "sd": 1.6726
        },
        {
          "mean": 42.311724,
          "sd": 1.820697
        },
        {
          "mean": 45.054729,
          "sd": 1.970968
        },
        {
          "mean": 47.693077,
          "sd": 2.119813
        },
        {
          "mean": 50.050216,
          "sd": 2.257234
        },
        {
          "mean": 52.135359,
          "sd": 2.387874
        },
        {
          "mean": 54.1537,
          "sd": 2.547918
        },
        {
          "mean": 56.540789,
          "sd": 2.763856
        },
        {
          "mean": 59.266853,
          "sd": 3.007871
        },
        {
          "mean": 61.599598,
          "sd": 3.121015
        },
        {
          "mean": 63.058228,
          "sd": 3.121211
        },
        {
          "mean": 63.693879,
          "sd": 3.104881
        },
        {
          "mean": 63.829284,
          "sd": 3.107319
        },
        {
          "mean": 63.83527,
          "sd": 3.109745
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
      "mean": 4.978676,
      "sd": 1.978606
    },
    {
      "mean": 4.995427,
      "sd": 1.955261
    },
    {
      "mean": 5.012443,
      "sd": 1.936551
    },
    {
      "mean": 5.031106,
      "sd": 1.917663
    },
    {
      "mean": 5.051542,
      "sd": 1.894681
    },
    {
      "mean": 5.070576,
      "sd": 1.874211
    },
    {
      "mean": 5.093248,
      "sd": 1.851965
    },
    {
      "mean": 5.110793,
      "sd": 1.832687
    },
    {
      "mean": 5.134348,
      "sd": 1.814361
    },
    {
      "mean": 5.15059,
      "sd": 1.794147
    },
    {
      "mean": 5.166505,
      "sd": 1.773698
    },
    {
      "mean": 5.181797,
      "sd": 1.755685
    },
    {
      "mean": 5.195441,
      "sd": 1.738286
    },
    {
      "mean": 5.210363,
      "sd": 1.724019
    },
    {
      "mean": 5.223834,
      "sd": 1.702909
    },
    {
      "mean": 5.243281,
      "sd": 1.689187
    },
    {
      "mean": 5.252461,
      "sd": 1.673736
    }
  ]
};
