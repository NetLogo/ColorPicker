import { switchMap, unsafe } from "../common/Util.js"

import { DOMManager          } from "./DOMManager.js"
import { DragManager         } from "./DragManager.js"
import { OutputType          } from "./OutputType.js"
import { ReadsReprFromInputs } from "./ReadsReprFromInputs.js"
import { GUI_HSLA            } from "./Representation.js"
import { WritesReprToInputs  } from "./WritesReprToInputs.js"

import { calcHueDegrees, clamp, optionValueToContainerID, outputTypeToHTMLValue } from "./Util.js"

import type { Representation } from "./Representation.js"
import type { Elem, Num, Str } from "./Types.js"

export class Picker {

  public dom: DOMManager

  private repr: Representation

  private reprReader: ReadsReprFromInputs
  private reprWriter: WritesReprToInputs

  constructor(doc: Document, outputTypes: Set<OutputType>) {

    this.dom = new DOMManager(doc)

    this.repr = new GUI_HSLA(0, 0, 0, 0)

    const setRepr = (repr: Representation) => {

      this.repr = repr

      const hsla = repr.toGUI_HSLA()

      this.setHue(hsla.hue)
      this.setSwatchCoords(hsla.saturation, hsla.lightness)
      this.setAlpha(hsla.alpha)

    }

    this.reprReader = new ReadsReprFromInputs()
    this.reprWriter = new WritesReprToInputs()

    const outputDropdown = this.dom.findElemByID("output-format-dropdown")
    outputDropdown.addEventListener("change", () => this.updateOutput())

    this.activateOutputs(outputTypes)

    const reprDropdown = this.dom.findReprDropdown()
    reprDropdown.addEventListener("change", () => this.updateReprControls())
    reprDropdown.value = "nl-number"
    this.updateReprControls()

    this.setHue(60)
    this.setSwatchCoords(75, 20)
    this.setAlpha(100)

    Array.from(this.dom.findInputs(doc, ".repr-input")).forEach(
      (input) => {
        input.addEventListener("change", () => this.reprReader.read(this.dom, setRepr))
      }
    )

    const dragMan = new DragManager()
    dragMan.setupDrag2D (this.dom.findElemByID("swatch-container"), (x: Num, y: Num) => this.setSwatchCoords(x, y))
    dragMan.setupDrag1DY(this.dom.findElemByID(    "alpha-slider"), (a: Num)         => this.setAlpha(a))
    dragMan.setupDrag1DY(this.dom.findElemByID(      "hue-slider"), (h: Num)         => this.setHue(h))

  }

  setAlpha(alpha: Num): void {
    const clamped = clamp(alpha)
    this.repr     = this.repr.withAlpha(clamped)
    this.dom.findElemByID("alpha-knob").style.bottom = `${clamped.toFixed(2)}%`
    this.updateColor()
  }

  setHue(hueY: Num): void {

    const clamped = clamp(hueY)
    this.repr     = this.repr.toGUI_HSLA().withHue(clamped)
    this.dom.findElemByID("hue-knob"       ).style.bottom     = `${clamped.toFixed(2)}%`
    this.dom.findElemByID("swatch-gradient").style.background = `hsla(${calcHueDegrees(hueY)}deg, 100%, 50%, 100%)`

    this.updateColor()
    this.updateAlphaGradient()

  }

  setSwatchCoords(x: Num, y: Num): void {

    const clampedX = clamp(x)
    const clampedY = clamp(y)

    this.repr = this.repr.toGUI_HSLA().withSaturation(clampedX).withLightness(clampedY)

    const swatchPointer = this.dom.findElemByID("swatch-pointer")
    swatchPointer.style.left = `${clampedX.toFixed(2)}%`
    swatchPointer.style.top  = `${clampedY.toFixed(2)}%`

    this.updateColor()
    this.updateAlphaGradient()

  }

  updateColor(): void {
    const hsla = this.repr.toHSLA()
    this.dom.findElemByID("preview-color").style.background = `hsla(${hsla.hue}deg, ${hsla.saturation}%, ${hsla.lightness}%, ${hsla.alpha}%)`
    this.reprWriter.write(this.dom, this.repr)
    this.updateOutput()
  }

  updateOutput(): void {
    this.dom.findElemByID("output-field").innerText = this.getOutputValue()
  }

  getOutputValue(): Str {

    const value       = unsafe((this.dom.findElemByID("output-format-dropdown") as HTMLSelectElement).selectedOptions[0]).value
    const pairs       = Array.from(outputTypeToHTMLValue.entries()) as Array<[OutputType, Str]>
    const reversedMap = new Map(pairs.map(([a, b]) => [b, a]))

    const scaleAlpha = (alpha: Num) => Math.round(alpha / 100 * 255)

    switch (reversedMap.get(value)) {
      case OutputType.NLNumber:
        return this.repr.toNLNumber().number.toString()
      case OutputType.NLWord:
        return `(${this.repr.toNLWord().word})`
      case OutputType.RGB:
        const rgb = this.repr.toRGB()
        return `(rgb ${rgb.red} ${rgb.green} ${rgb.blue})`
      case OutputType.RGBA:
        const rgba = this.repr.toRGBA()
        return `[${rgba.red} ${rgba.green} ${rgba.blue} ${scaleAlpha(rgba.alpha)}]`
      case OutputType.HSB:
        const hsb = this.repr.toHSB()
        return `(hsb ${hsb.hue} ${hsb.saturation} ${hsb.brightness})`
      case OutputType.HSBA:
        const hsba = this.repr.toHSBA()
        return `(lput ${scaleAlpha(hsba.alpha)} (hsb ${hsba.hue} ${hsba.saturation} ${hsba.brightness}))`
      case OutputType.HSL:
        const hsl = this.repr.toHSL()
        return `[${hsl.hue} ${hsl.saturation} ${hsl.lightness}]`
      case OutputType.HSLA:
        const hsla = this.repr.toHSLA()
        return `[${hsla.hue} ${hsla.saturation} ${hsla.lightness} ${scaleAlpha(hsla.alpha)}]`
      default:
        throw new Error(`Unknown output value for output format: ${value}`)
    }

  }

  private updateAlphaGradient(): void {

    const { hue, saturation, lightness } = this.repr.toHSL()

    const hslStr = `${hue}, ${saturation}%, ${lightness}%`
    const [elem] = this.dom.findElems(".slider-background.alpha") as [Elem]
    elem.style.background = `linear-gradient(to top, hsla(${hslStr}, 0) 0%, hsl(${hslStr}) 100%)`

  }

  private updateReprControls(): void {

    this.dom.findElems(".repr-controls-container .repr-controls").forEach((c: Elem) => { c.style.display = "" })

    const dropdown     = this.dom.findReprDropdown()
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    this.dom.findElemByID(targetElemID).style.display = "flex"

    this.updateColor()

  }

  private activateOutputs(outputTypes: Set<OutputType>): void {

    outputTypes.forEach(
      (ot) => {

        const optionValue =
          switchMap(
              ot
            , outputTypeToHTMLValue
            , (target: OutputType) => {
                throw new Error(`Impossible output type: ${JSON.stringify(target)}`)
              }
          )

        const elem    = this.dom.findElems(`#output-format-dropdown > option[value=${optionValue}]`)[0] as HTMLOptionElement
        elem.disabled = false
        elem.selected = true

      }
    )

  }

}
