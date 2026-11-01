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
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2
    },
    "toddlerFocus": {
      "work": 2,
      "social": 2,
      "family": 2,
      "self": 2,
      "creative": 2
    },
    "choices": "uniform, independent seeded draws",
    "focusPolicy": "two-point targets fitted to birth-condition budgets and active condition/event caps; spare points left unused",
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
    "childhoodDeductionScale": 0.1,
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
      "observedMean": 5.915467,
      "sd": 1.618627,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.060985,
          "sd": 2.188049
        },
        {
          "mean": 5,
          "observedMean": 5.128369,
          "sd": 2.150264
        },
        {
          "mean": 5,
          "observedMean": 5.193691,
          "sd": 2.11207
        },
        {
          "mean": 5,
          "observedMean": 5.241567,
          "sd": 2.073785
        },
        {
          "mean": 5,
          "observedMean": 5.271893,
          "sd": 2.038486
        },
        {
          "mean": 5,
          "observedMean": 5.290604,
          "sd": 2.001284
        },
        {
          "mean": 5,
          "observedMean": 5.353326,
          "sd": 1.958041
        },
        {
          "mean": 5,
          "observedMean": 5.424903,
          "sd": 1.91903
        },
        {
          "mean": 5,
          "observedMean": 5.492043,
          "sd": 1.882575
        },
        {
          "mean": 5,
          "observedMean": 5.556226,
          "sd": 1.847534
        },
        {
          "mean": 5,
          "observedMean": 5.619482,
          "sd": 1.819926
        },
        {
          "mean": 5,
          "observedMean": 5.684619,
          "sd": 1.79061
        },
        {
          "mean": 5,
          "observedMean": 5.746386,
          "sd": 1.755605
        },
        {
          "mean": 5,
          "observedMean": 5.805069,
          "sd": 1.724741
        },
        {
          "mean": 5,
          "observedMean": 5.82459,
          "sd": 1.703413
        },
        {
          "mean": 5,
          "observedMean": 5.844853,
          "sd": 1.680278
        },
        {
          "mean": 5,
          "observedMean": 5.872397,
          "sd": 1.664219
        },
        {
          "mean": 5,
          "observedMean": 5.897601,
          "sd": 1.634321
        }
      ]
    },
    "strength": {
      "mean": 5,
      "observedMean": 5.009162,
      "sd": 1.750564,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.036157,
          "sd": 2.205595
        },
        {
          "mean": 5,
          "observedMean": 5.045352,
          "sd": 2.170528
        },
        {
          "mean": 5,
          "observedMean": 5.053835,
          "sd": 2.13712
        },
        {
          "mean": 5,
          "observedMean": 5.047953,
          "sd": 2.102472
        },
        {
          "mean": 5,
          "observedMean": 5.042117,
          "sd": 2.069029
        },
        {
          "mean": 5,
          "observedMean": 5.036879,
          "sd": 2.03889
        },
        {
          "mean": 5,
          "observedMean": 5.036317,
          "sd": 2.010018
        },
        {
          "mean": 5,
          "observedMean": 5.034164,
          "sd": 1.986393
        },
        {
          "mean": 5,
          "observedMean": 5.035932,
          "sd": 1.963305
        },
        {
          "mean": 5,
          "observedMean": 5.034667,
          "sd": 1.935658
        },
        {
          "mean": 5,
          "observedMean": 5.032639,
          "sd": 1.913955
        },
        {
          "mean": 5,
          "observedMean": 5.032806,
          "sd": 1.891736
        },
        {
          "mean": 5,
          "observedMean": 5.033544,
          "sd": 1.869204
        },
        {
          "mean": 5,
          "observedMean": 5.036031,
          "sd": 1.852046
        },
        {
          "mean": 5,
          "observedMean": 5.030546,
          "sd": 1.82922
        },
        {
          "mean": 5,
          "observedMean": 5.025966,
          "sd": 1.807955
        },
        {
          "mean": 5,
          "observedMean": 5.019836,
          "sd": 1.788016
        },
        {
          "mean": 5,
          "observedMean": 5.011564,
          "sd": 1.76922
        }
      ]
    },
    "attractiveness": {
      "mean": 5,
      "observedMean": 4.876837,
      "sd": 1.943684,
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
          "observedMean": 4.934823,
          "sd": 2.015601
        },
        {
          "mean": 5,
          "observedMean": 4.926799,
          "sd": 2.011923
        },
        {
          "mean": 5,
          "observedMean": 4.91713,
          "sd": 2.006927
        },
        {
          "mean": 5,
          "observedMean": 4.910533,
          "sd": 2.002446
        },
        {
          "mean": 5,
          "observedMean": 4.90283,
          "sd": 1.997408
        },
        {
          "mean": 5,
          "observedMean": 4.895099,
          "sd": 1.992116
        },
        {
          "mean": 5,
          "observedMean": 4.888314,
          "sd": 1.986595
        },
        {
          "mean": 5,
          "observedMean": 4.879889,
          "sd": 1.981678
        },
        {
          "mean": 5,
          "observedMean": 4.872175,
          "sd": 1.976482
        },
        {
          "mean": 5,
          "observedMean": 4.865323,
          "sd": 1.973042
        },
        {
          "mean": 5,
          "observedMean": 4.859023,
          "sd": 1.969213
        },
        {
          "mean": 5,
          "observedMean": 4.860534,
          "sd": 1.964664
        },
        {
          "mean": 5,
          "observedMean": 4.866004,
          "sd": 1.959503
        },
        {
          "mean": 5,
          "observedMean": 4.870396,
          "sd": 1.953273
        },
        {
          "mean": 5,
          "observedMean": 4.872714,
          "sd": 1.947962
        }
      ]
    },
    "social": {
      "mean": 5,
      "observedMean": 6.159291,
      "sd": 1.639214,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.99889,
          "sd": 2.220147
        },
        {
          "mean": 5,
          "observedMean": 5.052734,
          "sd": 2.170834
        },
        {
          "mean": 5,
          "observedMean": 5.108891,
          "sd": 2.126904
        },
        {
          "mean": 5,
          "observedMean": 5.183073,
          "sd": 2.083074
        },
        {
          "mean": 5,
          "observedMean": 5.215383,
          "sd": 2.045784
        },
        {
          "mean": 5,
          "observedMean": 5.229605,
          "sd": 2.011153
        },
        {
          "mean": 5,
          "observedMean": 5.303288,
          "sd": 1.976122
        },
        {
          "mean": 5,
          "observedMean": 5.389733,
          "sd": 1.939812
        },
        {
          "mean": 5,
          "observedMean": 5.481011,
          "sd": 1.899715
        },
        {
          "mean": 5,
          "observedMean": 5.563024,
          "sd": 1.870605
        },
        {
          "mean": 5,
          "observedMean": 5.646629,
          "sd": 1.835676
        },
        {
          "mean": 5,
          "observedMean": 5.725799,
          "sd": 1.807227
        },
        {
          "mean": 5,
          "observedMean": 5.808251,
          "sd": 1.774338
        },
        {
          "mean": 5,
          "observedMean": 5.895769,
          "sd": 1.748375
        },
        {
          "mean": 5,
          "observedMean": 5.953107,
          "sd": 1.724139
        },
        {
          "mean": 5,
          "observedMean": 6.013377,
          "sd": 1.70231
        },
        {
          "mean": 5,
          "observedMean": 6.071205,
          "sd": 1.686461
        },
        {
          "mean": 5,
          "observedMean": 6.120232,
          "sd": 1.664464
        }
      ]
    },
    "creativity": {
      "mean": 5,
      "observedMean": 6.143236,
      "sd": 1.684074,
      "ages": [
        {
          "mean": 5,
          "observedMean": 5.043035,
          "sd": 2.202419
        },
        {
          "mean": 5,
          "observedMean": 5.065671,
          "sd": 2.164904
        },
        {
          "mean": 5,
          "observedMean": 5.088283,
          "sd": 2.127087
        },
        {
          "mean": 5,
          "observedMean": 5.127216,
          "sd": 2.09262
        },
        {
          "mean": 5,
          "observedMean": 5.160508,
          "sd": 2.063664
        },
        {
          "mean": 5,
          "observedMean": 5.179178,
          "sd": 2.034234
        },
        {
          "mean": 5,
          "observedMean": 5.254488,
          "sd": 2.000098
        },
        {
          "mean": 5,
          "observedMean": 5.343879,
          "sd": 1.969628
        },
        {
          "mean": 5,
          "observedMean": 5.427801,
          "sd": 1.937618
        },
        {
          "mean": 5,
          "observedMean": 5.510267,
          "sd": 1.903517
        },
        {
          "mean": 5,
          "observedMean": 5.593215,
          "sd": 1.878132
        },
        {
          "mean": 5,
          "observedMean": 5.674508,
          "sd": 1.853308
        },
        {
          "mean": 5,
          "observedMean": 5.751948,
          "sd": 1.823163
        },
        {
          "mean": 5,
          "observedMean": 5.828346,
          "sd": 1.799343
        },
        {
          "mean": 5,
          "observedMean": 5.898316,
          "sd": 1.773771
        },
        {
          "mean": 5,
          "observedMean": 5.965757,
          "sd": 1.750879
        },
        {
          "mean": 5,
          "observedMean": 6.034497,
          "sd": 1.730892
        },
        {
          "mean": 5,
          "observedMean": 6.101562,
          "sd": 1.710804
        }
      ]
    },
    "health": {
      "mean": 5,
      "observedMean": 5.010946,
      "sd": 0.682701,
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
          "observedMean": 4.8857,
          "sd": 1.882459
        },
        {
          "mean": 5,
          "observedMean": 4.885466,
          "sd": 1.748997
        },
        {
          "mean": 5,
          "observedMean": 4.923656,
          "sd": 1.622756
        },
        {
          "mean": 5,
          "observedMean": 4.957694,
          "sd": 1.510229
        },
        {
          "mean": 5,
          "observedMean": 4.976536,
          "sd": 1.406888
        },
        {
          "mean": 5,
          "observedMean": 4.994332,
          "sd": 1.310692
        },
        {
          "mean": 5,
          "observedMean": 5.010048,
          "sd": 1.224674
        },
        {
          "mean": 5,
          "observedMean": 5.026332,
          "sd": 1.142455
        },
        {
          "mean": 5,
          "observedMean": 5.039708,
          "sd": 1.066712
        },
        {
          "mean": 5,
          "observedMean": 5.054062,
          "sd": 1.002376
        },
        {
          "mean": 5,
          "observedMean": 5.065865,
          "sd": 0.938998
        },
        {
          "mean": 5,
          "observedMean": 5.076343,
          "sd": 0.87885
        },
        {
          "mean": 5,
          "observedMean": 5.058031,
          "sd": 0.835645
        },
        {
          "mean": 5,
          "observedMean": 5.044674,
          "sd": 0.793686
        },
        {
          "mean": 5,
          "observedMean": 5.031991,
          "sd": 0.753523
        },
        {
          "mean": 5,
          "observedMean": 5.021478,
          "sd": 0.718583
        }
      ]
    },
    "stability": {
      "mean": 5,
      "observedMean": 5.167024,
      "sd": 0.825228,
      "ages": [
        {
          "mean": 5,
          "observedMean": 4.981425,
          "sd": 2.23032
        },
        {
          "mean": 5,
          "observedMean": 5.063236,
          "sd": 2.015039
        },
        {
          "mean": 5,
          "observedMean": 5.132665,
          "sd": 1.826588
        },
        {
          "mean": 5,
          "observedMean": 5.10436,
          "sd": 1.64413
        },
        {
          "mean": 5,
          "observedMean": 5.135564,
          "sd": 1.48667
        },
        {
          "mean": 5,
          "observedMean": 5.16243,
          "sd": 1.354732
        },
        {
          "mean": 5,
          "observedMean": 5.167869,
          "sd": 1.2376
        },
        {
          "mean": 5,
          "observedMean": 5.155054,
          "sd": 1.139949
        },
        {
          "mean": 5,
          "observedMean": 5.142128,
          "sd": 1.05851
        },
        {
          "mean": 5,
          "observedMean": 5.136103,
          "sd": 1.008363
        },
        {
          "mean": 5,
          "observedMean": 5.125746,
          "sd": 0.950903
        },
        {
          "mean": 5,
          "observedMean": 5.122681,
          "sd": 0.909183
        },
        {
          "mean": 5,
          "observedMean": 5.133151,
          "sd": 0.865031
        },
        {
          "mean": 5,
          "observedMean": 5.139064,
          "sd": 0.841054
        },
        {
          "mean": 5,
          "observedMean": 5.144612,
          "sd": 0.833235
        },
        {
          "mean": 5,
          "observedMean": 5.145888,
          "sd": 0.832739
        },
        {
          "mean": 5,
          "observedMean": 5.163196,
          "sd": 0.825936
        },
        {
          "mean": 5,
          "observedMean": 5.162651,
          "sd": 0.827527
        }
      ]
    }
  },
  "height": {
    "male": {
      "mean": 68.427514,
      "sd": 3.453632,
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
          "mean": 36.772871,
          "sd": 1.625384
        },
        {
          "mean": 39.551141,
          "sd": 1.790294
        },
        {
          "mean": 42.113615,
          "sd": 1.943187
        },
        {
          "mean": 44.604037,
          "sd": 2.084324
        },
        {
          "mean": 47.062172,
          "sd": 2.232603
        },
        {
          "mean": 49.423183,
          "sd": 2.36916
        },
        {
          "mean": 51.61178,
          "sd": 2.497932
        },
        {
          "mean": 53.609814,
          "sd": 2.62491
        },
        {
          "mean": 55.561127,
          "sd": 2.765797
        },
        {
          "mean": 57.78329,
          "sd": 2.962336
        },
        {
          "mean": 60.524849,
          "sd": 3.234731
        },
        {
          "mean": 63.423587,
          "sd": 3.429817
        },
        {
          "mean": 65.841595,
          "sd": 3.492575
        },
        {
          "mean": 67.461637,
          "sd": 3.472572
        },
        {
          "mean": 68.24997,
          "sd": 3.452735
        }
      ]
    },
    "female": {
      "mean": 63.265851,
      "sd": 3.045978,
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
          "mean": 36.451242,
          "sd": 1.602186
        },
        {
          "mean": 39.067269,
          "sd": 1.750771
        },
        {
          "mean": 41.714157,
          "sd": 1.899314
        },
        {
          "mean": 44.424607,
          "sd": 2.054441
        },
        {
          "mean": 47.045292,
          "sd": 2.198135
        },
        {
          "mean": 49.399416,
          "sd": 2.326109
        },
        {
          "mean": 51.470614,
          "sd": 2.444435
        },
        {
          "mean": 53.472226,
          "sd": 2.56837
        },
        {
          "mean": 55.841244,
          "sd": 2.765196
        },
        {
          "mean": 58.552413,
          "sd": 2.978825
        },
        {
          "mean": 60.910534,
          "sd": 3.082866
        },
        {
          "mean": 62.421779,
          "sd": 3.076648
        },
        {
          "mean": 63.108135,
          "sd": 3.055535
        },
        {
          "mean": 63.259606,
          "sd": 3.04727
        },
        {
          "mean": 63.266015,
          "sd": 3.045218
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
      "mean": 5.1808,
      "sd": 1.958485
    },
    {
      "mean": 5.283022,
      "sd": 1.932617
    },
    {
      "mean": 5.38472,
      "sd": 1.911016
    },
    {
      "mean": 5.490611,
      "sd": 1.889863
    },
    {
      "mean": 5.593638,
      "sd": 1.868253
    },
    {
      "mean": 5.692367,
      "sd": 1.846898
    },
    {
      "mean": 5.790131,
      "sd": 1.823419
    },
    {
      "mean": 5.885741,
      "sd": 1.799098
    },
    {
      "mean": 5.983371,
      "sd": 1.777669
    },
    {
      "mean": 6.074994,
      "sd": 1.754839
    },
    {
      "mean": 6.161991,
      "sd": 1.728527
    },
    {
      "mean": 6.251719,
      "sd": 1.708047
    },
    {
      "mean": 6.335013,
      "sd": 1.690868
    },
    {
      "mean": 6.419207,
      "sd": 1.673431
    },
    {
      "mean": 6.503864,
      "sd": 1.650105
    },
    {
      "mean": 6.58727,
      "sd": 1.629848
    }
  ]
};
