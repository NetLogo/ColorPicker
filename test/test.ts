import { expect } from "@jest/globals"

import { Blue, Cyan, Lime, Magenta, Orange, Violet, Yellow                        } from "picker/color/ColorLiteral.js"
import { GUI_HSLA, Hexadecimal, HSB, HSBA, HSL, HSLA, NLNumber, NLWord, RGB, RGBA } from "picker/color/Representation.js"

import type { Representation } from "picker/color/Representation.js"

// Test data

const testColors =
  [
    [ Hexadecimal.parse("#b8860b")
    , new RGB(184, 134, 11)
    , new RGBA(184, 134, 11, 100)
    , new HSB(42.7, 94, 72.1)
    , new HSBA(42.7, 94, 72.1, 100)
    , new HSL(42.7, 88.7, 38.2)
    , new HSLA(42.7, 88.7, 38.2, 100)
    , new NLNumber(43.2)
    , new NLWord(Yellow, -1.8)
    ]
  , [ Hexadecimal.parse("#b8860b2b")
    , new RGB(184, 134, 11)
    , new RGBA(184, 134, 11, 17)
    , new HSB(42.7, 94, 72.1)
    , new HSBA(42.7, 94, 72.1, 17)
    , new HSL(42.7, 88.7, 38.2)
    , new HSLA(42.7, 88.7, 38.2, 17)
    , new NLNumber(43.2)
    , new NLWord(Yellow, -1.8)
    ]
  , [ Hexadecimal.parse("#ff5733")
    , new RGB(255, 87, 51)
    , new RGBA(255, 87, 51, 100)
    , new HSB(10.6, 80, 100)
    , new HSBA(10.6, 80, 100, 100)
    , new HSL(10.6, 100, 60)
    , new HSLA(10.6, 100, 60, 100)
    , new NLNumber(25)
    , new NLWord(Orange)
    ]
  , [ Hexadecimal.parse("#33ff57")
    , new RGB(51, 255, 87)
    , new RGBA(51, 255, 87, 100)
    , new HSB(130.6, 80, 100)
    , new HSBA(130.6, 80, 100, 100)
    , new HSL(130.6, 100, 60)
    , new HSLA(130.6, 100, 60, 100)
    , new NLNumber(65.6)
    , new NLWord(Lime, 0.6)
    ]
  , [ Hexadecimal.parse("#3357ff")
    , new RGB(51, 87, 255)
    , new RGBA(51, 87, 255, 100)
    , new HSB(229.4, 80, 100)
    , new HSBA(229.4, 80, 100, 100)
    , new HSL(229.4, 100, 60)
    , new HSLA(229.4, 100, 60, 100)
    , new NLNumber(105.3)
    , new NLWord(Blue, 0.3)
    ]
  , [ Hexadecimal.parse("#ff33a8")
    , new RGB(255, 51, 168)
    , new RGBA(255, 51, 168, 100)
    , new HSB(325.6, 80, 100)
    , new HSBA(325.6, 80, 100, 100)
    , new HSL(325.6, 100, 60)
    , new HSLA(325.6, 100, 60, 100)
    , new NLNumber(126.2)
    , new NLWord(Magenta, 1.2)
    ]
  , [ Hexadecimal.parse("#a833ff")
    , new RGB(168, 51, 255)
    , new RGBA(168, 51, 255, 100)
    , new HSB(274.4, 80, 100)
    , new HSBA(274.4, 80, 100, 100)
    , new HSL(274.4, 100, 60)
    , new HSLA(274.4, 100, 60, 100)
    , new NLNumber(115.5)
    , new NLWord(Violet, 0.5)
    ]
  , [ Hexadecimal.parse("#33fff6")
    , new RGB(51, 255, 246)
    , new RGBA(51, 255, 246, 100)
    , new HSB(177.4, 80, 100)
    , new HSBA(177.4, 80, 100, 100)
    , new HSL(177.4, 100, 60)
    , new HSLA(177.4, 100, 60, 100)
    , new NLNumber(85.2)
    , new NLWord(Cyan, 0.2)
    ]
  , [ Hexadecimal.parse("#f6ff33")
    , new RGB(246, 255, 51)
    , new RGBA(246, 255, 51, 100)
    , new HSB(62.6, 80, 100)
    , new HSBA(62.6, 80, 100, 100)
    , new HSL(62.6, 100, 60)
    , new HSLA(62.6, 100, 60, 100)
    , new NLNumber(45.3)
    , new NLWord(Yellow, 0.3)
    ]
  , [ Hexadecimal.parse("#ff8f33")
    , new RGB(255, 143, 51)
    , new RGBA(255, 143, 51, 100)
    , new HSB(27.1, 80, 100)
    , new HSBA(27.1, 80, 100, 100)
    , new HSL(27.1, 100, 60)
    , new HSLA(27.1, 100, 60, 100)
    , new NLNumber(25.9)
    , new NLWord(Orange, 0.9)
    ]
  ]

const nameToType =
  { "Hexadecimal": Hexadecimal
  , "HSB":         HSB
  , "HSBA":        HSBA
  , "HSL":         HSL
  , "HSLA":        HSLA
//  , "NLNumber":    NLNumber
//  , "NLWord":      NLWord
  , "RGB":         RGB
  , "RGBA":        RGBA
  }

// Test helper functions

const pairsOf = (TypeA, TypeB): Representation => {
  return testColors.map((bundle) => [bundle.find((x) => x instanceof TypeA), bundle.find((x) => x instanceof TypeB)])
}

const checkEquality = (a: Representation, b: Representation): void => {

  const check = (converter: (x: Representation) => Representation, keys: Array<string>): void => {

    const converted = converter(a)

    const target =
      keys.reduce(
        (acc, key) => {
          const value = (key !== "alpha" || "alpha" in a) ? b[key] : 100
          acc[key]    = value
          return acc
        }
      , {})

    expect(converted).toMatchObject(target)

  }

  if (b instanceof Hexadecimal) {
    check(((x) => x.toHexadecimal()), ["red", "green", "blue", "alpha"])
  } else if (b instanceof HSB) {
    check(((x) => x.toHSB()), ["hue", "saturation", "brightness"])
  } else if (b instanceof HSBA) {
    check(((x) => x.toHSBA()), ["hue", "saturation", "brightness", "alpha"])
  } else if (b instanceof HSL) {
    check(((x) => x.toHSL()), ["hue", "saturation", "lightness"])
  } else if (b instanceof HSLA) {
    check(((x) => x.toHSLA()), ["hue", "saturation", "lightness", "alpha"])
  } else if (b instanceof NLNumber) {
    check(((x) => x.toNLNumber()), ["number"])
  } else if (b instanceof NLWord) {
    check(((x) => x.toNLWord()), ["literal", "modifier"])
  } else if (b instanceof RGB) {
    check(((x) => x.toRGB()), ["red", "green", "blue"])
  } else if (b instanceof RGBA) {
    check(((x) => x.toRGBA()), ["red", "green", "blue", "alpha"])
  } else {
    throw new Error(`Unknown representation: ${JSON.stringify(b)}`)
  }

}

// Tests

Object.entries(nameToType).forEach(
  ([name1, typ1]) => {
    Object.entries(nameToType).forEach(
      ([name2, typ2]) => {
        pairsOf(typ1, typ2).forEach(([a, b]) => {
          test(`${a.toString()} converts to ${name1 === name2 ? "itself" : b.toString()}`, () => {
            checkEquality(a, b)
          })
        })
      }
    )
  }
)
