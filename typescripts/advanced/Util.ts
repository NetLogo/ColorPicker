import { OutputType } from "./OutputType.js"

import type { Num, Str } from "./Types.js"

const calcHueDegrees = (hue: Num): Num => Math.round(360 * (hue / 100))

const clamp = (percentage: Num): Num => Math.max(0, Math.min(100, percentage))

const nlWordsToNumbers =
  {     "black":   0
  ,     "white": 9.9
  ,      "gray":   5
  ,       "red":  15
  ,    "orange":  25
  ,     "brown":  35
  ,    "yellow":  45
  ,     "green":  55
  ,      "lime":  65
  , "turquoise":  75
  ,      "cyan":  85
  ,       "sky":  95
  ,      "blue": 105
  ,    "violet": 115
  ,   "magenta": 125
  ,      "pink": 135
  } as Record<Str, Num>

const optionValueToContainerID =
  { "nl-number": "netlogo-number-controls"
  , "nl-word":   "netlogo-word-controls"
  , "hsb":       "hsb-controls"
  , "hsba":      "hsba-controls"
  , "hsl":       "hsl-controls"
  , "hsla":      "hsla-controls"
  , "rgb":       "rgb-controls"
  , "rgba":      "rgba-controls"
  , "hex":       "hex-controls"
  } as Record<Str, Str>


const outputTypeToHTMLValue =
  new Map([
    [OutputType.NLNumber, "nl-number"]
  , [OutputType.NLWord  , "nl-word"  ]
  , [OutputType.RGB     , "rgb"      ]
  , [OutputType.RGBA    , "rgba"     ]
  , [OutputType.HSB     , "hsb"      ]
  , [OutputType.HSBA    , "hsba"     ]
  , [OutputType.HSL     , "hsl"      ]
  , [OutputType.HSLA    , "hsla"     ]
  ]) as Map<OutputType, Str>

export { calcHueDegrees, clamp, nlWordsToNumbers, optionValueToContainerID, outputTypeToHTMLValue }
