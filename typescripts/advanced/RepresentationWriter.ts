import { nearestColorNumberOfRGB } from "../ColorModel.js"

import { DOMManager       } from "./DOMManager.js"
import { nlWordsToNumbers } from "./Util.js"

import type { Num, Str } from "./Types.js"

export class RepresentationWriter {

  private dom: DOMManager

  constructor(dom: DOMManager) {
    this.dom = dom
  }

  refreshReprValues(hue: Num, saturation: Num, lightness: Num, alpha: Num): void {

    // Courtesy of Roko C. Buljan at https://stackoverflow.com/a/31322636/5288538
    const getSBAsHSB = (s: Num, l: Num): [Num, Num] => {
      const temp = s * ((l < 50) ? l : (100 - l)) / 100
      const hsbS = Math.round(200 * temp / (l + temp)) | 0
      const hsbB = Math.round(temp + l)
      return [hsbS, hsbB]
    }

    // Courtesy of Kamil Kiełczewski at https://stackoverflow.com/a/64090995/5288538
    const asRGB = (): [Num, Num, Num] => {
      const l     = lightness / 100
      const a     = (saturation / 100) * Math.min(l, 1 - l)
      const morph = (n: Num): Num => {
        const k     = (n + hue / 30) % 12
        const value = l - (a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
        return Math.round(value * 255)
      }
      return [morph(0), morph(8), morph(4)]
    }

    const findColorWord = (r: Num, g: Num, b: Num): Str => {

      const colorNumber = nearestColorNumberOfRGB(r, g, b)

      if (colorNumber === 0) {
        return "black"
      } else if (colorNumber === 9.9) {
        return "white"
      } else {

        const pairs = Object.entries(nlWordsToNumbers).slice(2)

        const [nearestWord, nearestValue] =
          pairs.reduce(
            (acc, x) => Math.abs(colorNumber - x[1]) < Math.abs(colorNumber - acc[1]) ? x : acc
          , ["nonsense", 1e9]
          )

        const rd = (x: Num): Num => Math.round(x * 10) / 10

        const diff = (colorNumber === nearestValue) ? "" :
                     (colorNumber   > nearestValue) ? `+ ${rd(colorNumber - nearestValue)}` : `- ${rd(nearestValue - colorNumber)}`

        return `${nearestWord} ${diff}`

      }

    }

    const activeControls = this.dom.findActiveControls()

    switch (activeControls.id) {
      case "netlogo-number-controls": {
        const [r, g, b]   = asRGB()
        const colorNumber = nearestColorNumberOfRGB(r, g, b)
        this.dom.setInputByID("netlogo-number", colorNumber)
        break
      }
      case "netlogo-word-controls": {
        this.dom.setInputByID("netlogo-word", findColorWord(...asRGB()))
        break
      }
      case "hsb-controls": {
        const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
        this.dom.setInputByID("hsb-h",           hue)
        this.dom.setInputByID("hsb-s", hsbSaturation)
        this.dom.setInputByID("hsb-b",    brightness)
        break
      }
      case "hsba-controls": {
        const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
        this.dom.setInputByID("hsba-h",           hue)
        this.dom.setInputByID("hsba-s", hsbSaturation)
        this.dom.setInputByID("hsba-b",    brightness)
        this.dom.setInputByID("hsba-a",         alpha)
        break
      }
      case "hsl-controls": {
        this.dom.setInputByID("hsl-h",        hue)
        this.dom.setInputByID("hsl-s", saturation)
        this.dom.setInputByID("hsl-l",  lightness)
        break
      }
      case "hsla-controls": {
        this.dom.setInputByID("hsla-h",        hue)
        this.dom.setInputByID("hsla-s", saturation)
        this.dom.setInputByID("hsla-l",  lightness)
        this.dom.setInputByID("hsla-a",      alpha)
        break
      }
      case "rgb-controls": {
        const [r, g, b] = asRGB()
        this.dom.setInputByID("rgb-r", r)
        this.dom.setInputByID("rgb-g", g)
        this.dom.setInputByID("rgb-b", b)
        break
      }
      case "rgba-controls": {
        const [r, g, b] = asRGB()
        this.dom.setInputByID("rgba-r",     r)
        this.dom.setInputByID("rgba-g",     g)
        this.dom.setInputByID("rgba-b",     b)
        this.dom.setInputByID("rgba-a", alpha)
        break
      }
      case "hex-controls": {
        const hex = (x: Num): Str => x.toString(16).padStart(2, "0")
        const [r, g, b] = asRGB()
        const a         = Math.round(alpha / 100 * 255)
        this.dom.setInputByID("hex", `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`)
        break
      }
      default: {
        alert(`Invalid representation dropdown ID: ${activeControls.id}`)
      }
    }

  }

}
