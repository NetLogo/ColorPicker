import { switchMap, unsafe } from "../common/Util.js"

import { DOMManager          } from "./DOMManager.js"
import { DragManager         } from "./DragManager.js"
import { OutputType          } from "./OutputType.js"
import { ReadsReprFromInputs } from "./ReadsReprFromInputs.js"
import { GUI_HSLA            } from "./Representation.js"
import { WritesReprToInputs  } from "./WritesReprToInputs.js"

import { calcHueDegrees, clamp, optionValueToContainerID, outputTypeToHTMLValue } from "./Util.js"

import type { El, InputEl, Num, OptionEl, SelectEl, Str } from "../common/Types.js"

import type { Representation } from "./Representation.js"

const reprHasAlpha = (repr: Str) => ["hsba", "hsla", "rgba", "hex"].includes(repr)

export class Picker {

  public dom: DOMManager

  private repr: Representation

  private reprReader: ReadsReprFromInputs
  private reprWriter: WritesReprToInputs

  constructor(doc: Document, outputTypes: Set<OutputType>) {

    this.dom = new DOMManager(doc)

    this.repr = new GUI_HSLA(0, 0, 0, 0)

    this.reprReader = new ReadsReprFromInputs()
    this.reprWriter = new WritesReprToInputs()

    const outputDropdown = this.dom.findOutputDropdown()
    outputDropdown.addEventListener("change", () => this.updateOutputControl())

    this.activateOutputs(outputTypes)

    const reprDropdown = this.dom.findReprDropdown()
    reprDropdown.addEventListener("change", () => this.updateReprControls())
    reprDropdown.value = "nl-number"
    this.updateReprControls()

    this.setHue(60)
    this.setSwatchCoords(75, 20)
    this.setAlpha(100)

    Array.from(this.dom.findElems<InputEl>(".repr-input")).forEach(
      (input) => {
        input.addEventListener("change", () => this.reprReader.read(this.dom, (x) => this.setRepr(x)))
      }
    )

    const dragMan = new DragManager()
    dragMan.setupDrag2D (this.dom.findElemByID("swatch-container"), doc, (x: Num, y: Num) => this.setSwatchCoords(x, y))
    dragMan.setupDrag1DY(this.dom.findElemByID(    "alpha-slider"), doc, (a: Num)         => this.setAlpha(a))
    dragMan.setupDrag1DY(this.dom.findElemByID(      "hue-slider"), doc, (h: Num)         => this.setHue(h))

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

  setRepr(repr: Representation): void {

    this.repr = repr

    const hsla = repr.toGUI_HSLA()

    this.setHue(hsla.hue)
    this.setSwatchCoords(hsla.saturation, hsla.lightness)
    this.setAlpha(hsla.alpha)

  }

  updateColor(): void {
    const hsla = this.repr.toHSLA()
    this.dom.findElemByID("preview-color").style.background = `hsla(${hsla.hue}deg, ${hsla.saturation}%, ${hsla.lightness}%, ${hsla.alpha}%)`
    this.reprWriter.write(this.dom, this.repr)
    this.updateOutput()
  }

  updateOutputControl(): void {
    this.updateAlphaVis()
    this.updateOutput()
  }

  updateOutput(): void {
    this.dom.findElemByID("output-field").innerText = this.getOutputValue()
    this.validateControls()
  }

  validateControls(): void {

    const alpha = this.repr.toGUI_HSLA().alpha

    const outie          = this.dom.findOutputDropdown()
    const outputHasAlpha = reprHasAlpha(outie.value)

    if ((alpha === 100) || outputHasAlpha) {
      outie.classList.remove("alpha-warning")
      outie.title = ""
    } else {
      outie.classList.add("alpha-warning")
      outie.title = "You have chosen a color with alpha (transparency), but this output format does not support\
 transparency, so the output color will be entirely opaque."
    }

  }

  getOutputValue(): Str {

    const value       = unsafe(this.dom.findElemByID<SelectEl>("output-format-dropdown").selectedOptions[0]).value
    const pairs       = Array.from(outputTypeToHTMLValue.entries()) as Array<[OutputType, Str]>
    const reversedMap = new Map(pairs.map(([a, b]) => [b, a]))

    const scaleAlpha = (alpha: Num) => Math.round(alpha / 100 * 255)

    switch (reversedMap.get(value)) {
      case OutputType.NLNumber:
        return this.repr.toNLNumber().number.toString()
      case OutputType.NLWord:
        const word = this.repr.toNLWord().word
        const str  = word.includes(" ") ? `(${word})` : word
        return str
      case OutputType.RGB:
        const rgb = this.repr.toRGB()
        return `(rgb ${rgb.red} ${rgb.green} ${rgb.blue})`
      case OutputType.RGBA:
        const rgba        = this.repr.toRGBA()
        const alpha       = scaleAlpha(rgba.alpha)
        const alphaSuffix = (alpha < 255) ? ` ${alpha}` : ""
        return `[${rgba.red} ${rgba.green} ${rgba.blue}${alphaSuffix}]`
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
    const elem   = unsafe(this.dom.findElems<El>(".slider-background.alpha")[0])
    elem.style.background = `linear-gradient(to top, hsla(${hslStr}, 0) 0%, hsl(${hslStr}) 100%)`

  }

  private updateReprControls(): void {

    this.dom.findElems(".repr-controls-container .repr-controls").forEach((c: El) => { c.style.display = "" })

    const dropdown     = this.dom.findReprDropdown()
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    this.dom.findElemByID(targetElemID).style.display = "flex"

    this.updateAlphaVis()

    this.updateColor()

  }

  private updateAlphaVis(): void {

    const innie          = this.dom.findReprDropdown()
    const outie          = this.dom.findOutputDropdown()
    const inputHasAlpha  = reprHasAlpha(innie.value)
    const outputHasAlpha = reprHasAlpha(outie.value)

    const alphaWrapper = this.dom.findElemByID("alpha-wrapper")

    if (inputHasAlpha || outputHasAlpha) {
      alphaWrapper.classList.remove("hidden")
    } else {
      alphaWrapper.classList.add("hidden")
      this.setAlpha(100)
    }

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

        const elem    = unsafe(this.dom.findElems<OptionEl>(`#output-format-dropdown > option[value=${optionValue}]`)[0])
        elem.disabled = false
        elem.selected = true

      }
    )

  }

}
