import { colorToRGB, nearestColorNumberOfRGB } from "../ColorModel.js"

import { findElemByID, findElems, findInputByID, findInputs, setInputByID, unsafe } from "../common/DOM.js"

import { Draggable } from "./Draggable.js"

import type { ColorUpdate, Elem, Input, Num, Str } from "./Types.js"

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

const calcHueDegrees = (hue: Num): Num => Math.round(360 * (hue / 100))

const clamp = (percentage: Num): Num => Math.max(0, Math.min(100, percentage))

export class Picker extends Draggable {

  private doc: Document

  private alphaX:  number
  private hueX:    number
  private swatchX: number
  private swatchY: number

  constructor(doc: Document) {

    super()

    this.doc = doc

    this.alphaX  = 0
    this.hueX    = 0
    this.swatchX = 0
    this.swatchY = 0

    const reprDropdown = this.findInputByID("repr-dropdown")
    reprDropdown.addEventListener("change", () => this.updateReprControls())
    reprDropdown.value = "nl-number"
    this.updateReprControls()

    this.setHue(60)
    this.setSwatchCoords(75, 20)
    this.setAlpha(100)

    Array.from(this.doc.querySelectorAll(".repr-input")).forEach(
      (input) => {
        input.addEventListener("change", () => this.updateFromRepr())
      }
    )

    this.setupDrag2D(this.findElemByID("swatch-container"), (x, y) => this.setSwatchCoords(x, y))
    this.setupDrag1D(this.findElemByID(    "alpha-slider"), (a)    => this.setAlpha(a))
    this.setupDrag1D(this.findElemByID(      "hue-slider"), (h)    => this.setHue(h))

    this.findElemByID("copy-icon").addEventListener("click", (): void => {

      const controls = this.findActiveControls()
      const inputs   = findInputs(controls, ".repr-input")
      const text     = inputs.map((input: Input) => input.value).join(" ")

      void navigator.clipboard.writeText(text)

    })

  }

  setAlpha(alpha: Num): void {
    const clamped = clamp(alpha)
    this.alphaX   = clamped
    this.findElemByID("alpha-knob").style.left = `${clamped.toFixed(2)}%`
    this.updateColor()
  }

  setHue(hueX: Num): void {

    const clamped = clamp(hueX)
    this.hueX     = clamped
    this.findElemByID("hue-knob"       ).style.left       = `${clamped.toFixed(2)}%`
    this.findElemByID("swatch-gradient").style.background = `hsla(${calcHueDegrees(hueX)}deg, 100%, 50%, 100%)`

    const { hue, saturation, lightness } = this.updateColor()
    this.updateAlphaGradient(hue, saturation, lightness)

  }

  setSwatchCoords(x: Num, y: Num): void {

    const clampedX = clamp(x)
    const clampedY = clamp(y)

    this.swatchX = clampedX
    this.swatchY = clampedY

    const swatchPointer = this.findElemByID("swatch-pointer")
    swatchPointer.style.left = `${clampedX.toFixed(2)}%`
    swatchPointer.style.top  = `${clampedY.toFixed(2)}%`

    const { hue, saturation, lightness } = this.updateColor()
    this.updateAlphaGradient(hue, saturation, lightness)

  }

  updateColor(): ColorUpdate {

    const hue        = calcHueDegrees(this.hueX)
    const saturation = this.swatchX
    const maxL       = (100 - this.swatchY)
    const minL       = maxL / 2
    const lightness  = Math.round(minL + ((maxL - minL) * ((100 - saturation) / 100)))
    const alpha      = this.alphaX

    this.findElemByID("preview-color").style.background = `hsla(${hue}deg, ${saturation}%, ${lightness}%, ${alpha}%)`

    this.refreshReprValues(hue, saturation, lightness, alpha)

    return { hue, saturation, lightness, alpha }

  }

  private updateAlphaGradient(hue: Num, saturation: Num, lightness: Num): void {
    const hslStr = `${hue} ${saturation} ${lightness}`
    const [elem] = findElems(this.doc, ".slider-background.alpha") as [Elem]
    elem.style.background = `linear-gradient(to right, hsla(${hslStr} / 0%) 0%, hsl(${hslStr}) 100%)`
  }

  private findElemByID(id: Str): HTMLElement {
    return findElemByID(this.doc)(id)
  }

  private findInputByID(id: Str): HTMLInputElement {
    return findInputByID(this.doc)(id)
  }

  private setInputByID(id: string, value: { toString: () => string }): void {
    return setInputByID(this.doc)(id, value)
  }

  private updateReprControls(): void {

    findElems(this.doc, ".repr-controls-container .repr-controls").forEach((c: Elem) => { c.style.display = "" })

    const dropdown     = this.findInputByID("repr-dropdown")
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    this.findElemByID(targetElemID).style.display = "flex"

    this.handleAlphaSlider(dropdown.value)

    this.updateColor()

  }

  private handleAlphaSlider(formatName: Str): void {
    if (["hsba", "hsla", "rgba", "hex"].includes(formatName)) {
      this.findElemByID("alpha-bar").classList.remove("hidden")
    } else {
      this.setAlpha(100)
      this.findElemByID("alpha-bar").classList.add("hidden")
    }
  }

  private updateFromRepr(): void {

    // Courtesy of Roko C. Buljan at https://stackoverflow.com/a/31322636/5288538
    const getSLAsHSL = (s: Num, b: Num): [Num, Num] => {
      const l          = (2 - s / 100) * b / 2
      const saturation = Math.round(s * b / ((l < 50) ? (l * 2) : (200 - (l * 2)))) | 0
      const lightness  = Math.round(l)
      return [saturation, lightness]
    }

    const updateFromHSLA = (hue: Num, saturation: Num, lightness: Num, alpha: Num): void => {

      const scalingFactor = 1 - ((saturation / 100) * 0.5)
      const y             = (100 - lightness / scalingFactor)

      this.setHue(hue / 360 * 100)
      this.setSwatchCoords(saturation, y)
      this.setAlpha(alpha)

    }

    const updateFromRGBA = (r: Num, g: Num, b: Num, a: Num): void => {

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

      const [h, s, l] = rgbToHSL(r, g, b)

      updateFromHSLA(h, s, l, a)

    }

    const updateFromNLNumber = (num: Num): void => {
      const [r, g, b] = colorToRGB(num)
      updateFromRGBA(r, g, b, 100)
    }

    const dropdown     = this.findInputByID("repr-dropdown")
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    const container    = this.findElemByID(targetElemID)
    const inputValues  = findInputs(container, ".repr-input").map((i: Input) => i.value)

    switch (dropdown.value) {
      case "nl-number": {
        const [colorNumber] = inputValues as [Str]
        updateFromNLNumber(parseFloat(colorNumber))
        break;
      }
      case "nl-word": {
        const [colorWord]             = inputValues          as [Str]
        const [word, operator, value] = colorWord.split(" ") as [Str, Str, Str]
        if (nlWordsToNumbers.hasOwnProperty(word)) {
          const baseNum = unsafe(nlWordsToNumbers[word])
          const diff    = ((operator !== "+" && operator !== "-") || isNaN(Number(value))) ? 0 :
                           (operator === "+") ? Number(value) : -Number(value)
          updateFromNLNumber(baseNum + diff)
        }
        break;
      }
      case "hsb": {
        const [hue, saturation, brightness] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num]
        const [hslSaturation,            _] = getSLAsHSL(saturation, brightness)
        updateFromHSLA(hue, hslSaturation, brightness, 100)
        break;
      }
      case "hsba": {
        const [hue, saturation, brightness, alpha] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num, Num]
        const [hslSaturation,                   _] = getSLAsHSL(saturation, brightness)
        updateFromHSLA(hue, hslSaturation, brightness, alpha)
        break;
      }
      case "hsl": {
        const [hue, saturation, lightness] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num]
        updateFromHSLA(hue, saturation, lightness, 100)
        break;
      }
      case "hsla": {
        const [hue, saturation, lightness, alpha] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num, Num]
        updateFromHSLA(hue, saturation, lightness, alpha)
        break;
      }
      case "rgb": {
        const [red, green, blue] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num]
        updateFromRGBA(red, green, blue, 100)
        break;
      }
      case "rgba": {
        const [red, green, blue, alpha] = inputValues.map((v) => parseInt(v)) as [Num, Num, Num, Num]
        updateFromRGBA(red, green, blue, alpha)
        break;
      }
      case "hex": {
        const [fullHex] = inputValues as [Str]
        const hex       = fullHex.slice(1)
        if (hex.length === 6 || hex.length === 8) {
          const [red, green, blue, a] = [0, 2, 4, 6].map((n) => parseInt(hex.slice(n, n + 2), 16)) as [Num, Num, Num, Num]
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

  private refreshReprValues(hue: Num, saturation: Num, lightness: Num, alpha: Num): void {

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

    const activeControls = this.findActiveControls()

    switch (activeControls.id) {
      case "netlogo-number-controls": {
        const [r, g, b]   = asRGB()
        const colorNumber = nearestColorNumberOfRGB(r, g, b)
        this.setInputByID("netlogo-number", colorNumber)
        break
      }
      case "netlogo-word-controls": {
        this.setInputByID("netlogo-word", findColorWord(...asRGB()))
        break
      }
      case "hsb-controls": {
        const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
        this.setInputByID("hsb-h",           hue)
        this.setInputByID("hsb-s", hsbSaturation)
        this.setInputByID("hsb-b",    brightness)
        break
      }
      case "hsba-controls": {
        const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
        this.setInputByID("hsba-h",           hue)
        this.setInputByID("hsba-s", hsbSaturation)
        this.setInputByID("hsba-b",    brightness)
        this.setInputByID("hsba-a",         alpha)
        break
      }
      case "hsl-controls": {
        this.setInputByID("hsl-h",        hue)
        this.setInputByID("hsl-s", saturation)
        this.setInputByID("hsl-l",  lightness)
        break
      }
      case "hsla-controls": {
        this.setInputByID("hsla-h",        hue)
        this.setInputByID("hsla-s", saturation)
        this.setInputByID("hsla-l",  lightness)
        this.setInputByID("hsla-a",      alpha)
        break
      }
      case "rgb-controls": {
        const [r, g, b] = asRGB()
        this.setInputByID("rgb-r", r)
        this.setInputByID("rgb-g", g)
        this.setInputByID("rgb-b", b)
        break
      }
      case "rgba-controls": {
        const [r, g, b] = asRGB()
        this.setInputByID("rgba-r",     r)
        this.setInputByID("rgba-g",     g)
        this.setInputByID("rgba-b",     b)
        this.setInputByID("rgba-a", alpha)
        break
      }
      case "hex-controls": {
        const hex = (x: Num): Str => x.toString(16).padStart(2, "0")
        const [r, g, b] = asRGB()
        const a         = Math.round(alpha / 100 * 255)
        this.setInputByID("hex", `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`)
        break
      }
      default: {
        alert(`Invalid representation dropdown ID: ${activeControls.id}`)
      }
    }

  }

  private findActiveControls(): Elem {
    const controls = findElems(this.doc, ".repr-controls-container .repr-controls")
    const active   = controls.find((c: Elem) => c.style.display === "flex")
    return unsafe(active)
  }

}
