import { colorToRGB } from "../ColorModel.js"

import { unsafe } from "../common/DOM.js"

import { DOMManager       } from "./DOMManager.js"
import { nlWordsToNumbers } from "./Util.js"

import type { Num, Num3, Num4, Str1, Str3, Str4 } from "./Types.js"

type UpdateColorF = (hue: Num, sat: Num, value: Num, alpha: Num) => void

// Courtesy of Roko C. Buljan at https://stackoverflow.com/a/31322636/5288538
const getSLAsHSL = (s: Num, b: Num): [Num, Num] => {
  const l          = (2 - s / 100) * b / 2
  const saturation = Math.round(s * b / ((l < 50) ? (l * 2) : (200 - (l * 2)))) | 0
  const lightness  = Math.round(l)
  return [saturation, lightness]
}

// Courtesy of Kamil Kiełczewski at https://stackoverflow.com/a/54071699/5288538
const rgbToHSL = (red: Num, green: Num, blue: Num): [Num, Num, Num] => {

  const rx = red   / 255
  const gx = green / 255
  const bx = blue  / 255

  const v = Math.max(rx, gx, bx)
  const c = v - Math.min(rx, gx, bx)
  const f = 1 - Math.abs(v + v - c - 1)

  const subH  = (c && (
                   (v === rx) ? ((gx - bx)     / c) :
                   (v === gx) ? (2 + (bx - rx) / c) :
                                (4 + (rx - gx) / c)
                ))
  const hue   = 60 * (subH < 0 ? subH + 6 : subH)

  const subS  = (f !== 0) ? (c / f) : 0
  const sat   = Math.round(subS * 100)

  const subL  = (v + v - c) / 2
  const light = Math.round(subL * 100)

  return [hue, sat, light]

}

export class RepresentationReader {

  private updateColor: UpdateColorF
  private dom:         DOMManager

  constructor(updateColor: UpdateColorF, dom: DOMManager) {
    this.dom         = dom
    this.updateColor = updateColor
  }

  updateFromRepr(): void {

    const updateFromHSLA = (hue: Num, saturation: Num, lightness: Num, alpha: Num): void => {

      const scalingFactor = 1 - ((saturation / 100) * 0.5)
      const y             = 100 - (lightness / scalingFactor)

      const h = hue / 360 * 100
      this.updateColor(h, saturation, y, alpha)

    }

    const updateFromRGBA = (r: Num, g: Num, b: Num, a: Num): void => {
      const [h, s, l] = rgbToHSL(r, g, b)
      updateFromHSLA(h, s, l, a)
    }

    const updateFromNLNumber = (num: Num): void => {
      const [r, g, b] = colorToRGB(num)
      updateFromRGBA(r, g, b, 100)
    }

    const dropdown    = this.dom.findReprDropdown()
    const inputValues = this.dom.findInputValues()

    switch (dropdown.value) {
      case "nl-number": {
        const [colorNumber] = inputValues as Str1
        updateFromNLNumber(parseFloat(colorNumber))
        break;
      }
      case "nl-word": {
        const [colorWord]             = inputValues          as Str1
        const [word, operator, value] = colorWord.split(" ") as Str3
        if (nlWordsToNumbers.hasOwnProperty(word)) {
          const baseNum = unsafe(nlWordsToNumbers[word])
          const diff    = ((operator !== "+" && operator !== "-") || isNaN(Number(value))) ? 0 :
                           (operator === "+") ? Number(value) : -Number(value)
          updateFromNLNumber(baseNum + diff)
        }
        break;
      }
      case "hsb": {
        const [hue, saturation, brightness] = (inputValues as Str3).map((v) => parseInt(v)) as Num4
        const [hslSaturation,            _] = getSLAsHSL(saturation, brightness)
        updateFromHSLA(hue, hslSaturation, brightness, 100)
        break;
      }
      case "hsba": {
        const [hue, saturation, brightness, alpha] = (inputValues as Str4).map((v) => parseInt(v)) as Num4
        const [hslSaturation,                   _] = getSLAsHSL(saturation, brightness)
        updateFromHSLA(hue, hslSaturation, brightness, alpha)
        break;
      }
      case "hsl": {
        const [hue, saturation, lightness] = (inputValues as Str3).map((v) => parseInt(v)) as Num3
        updateFromHSLA(hue, saturation, lightness, 100)
        break;
      }
      case "hsla": {
        const [hue, saturation, lightness, alpha] = (inputValues as Str4).map((v) => parseInt(v)) as Num4
        updateFromHSLA(hue, saturation, lightness, alpha)
        break;
      }
      case "rgb": {
        const [red, green, blue] = (inputValues as Str3).map((v) => parseInt(v)) as Num3
        updateFromRGBA(red, green, blue, 100)
        break;
      }
      case "rgba": {
        const [red, green, blue, alpha] = (inputValues as Str4).map((v) => parseInt(v)) as Num4
        updateFromRGBA(red, green, blue, alpha)
        break;
      }
      case "hex": {
        const [fullHex] = inputValues as Str1
        const hex       = fullHex.slice(1)
        if (hex.length === 6 || hex.length === 8) {
          const [red, green, blue, a] = [0, 2, 4, 6].map((n) => parseInt(hex.slice(n, n + 2), 16)) as Num4
          const alpha                 = (!isNaN(a)) ? Math.floor(a / 255 * 100) : 100
          updateFromRGBA(red, green, blue, alpha)
        }
        break;
      }
      default: {
        alert(`Invalid representation dropdown value: ${dropdown.value}`)
      }
    }

  }

}
