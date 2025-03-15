import { unsafe } from "../common/DOM.js"

import { DOMManager                                      } from "./DOMManager.js"
import { DragManager                                     } from "./DragManager.js"
import { RepresentationReader                            } from "./RepresentationReader.js"
import { RepresentationWriter                            } from "./RepresentationWriter.js"
import { calcHueDegrees, clamp, optionValueToContainerID } from "./Util.js"

import type { ColorUpdate, Elem, Input, Num, Str } from "./Types.js"

export class Picker {

  public dom: DOMManager

  private alphaY:  number
  private hueY:    number
  private swatchX: number
  private swatchY: number

  private reprReader: RepresentationReader
  private reprWriter: RepresentationWriter

  constructor(doc: Document) {

    this.dom = new DOMManager(doc)

    this.alphaY  = 0
    this.hueY    = 0
    this.swatchX = 0
    this.swatchY = 0

    const changeColor = (h: Num, s: Num, v: Num, a: Num) => {
      this.setHue(h)
      this.setSwatchCoords(s, v)
      this.setAlpha(a)
    }

    this.reprReader = new RepresentationReader(changeColor, this.dom)
    this.reprWriter = new RepresentationWriter(this.dom)

    const reprDropdown = this.dom.findReprDropdown()
    reprDropdown.addEventListener("change", () => this.updateReprControls())
    reprDropdown.value = "nl-number"
    this.updateReprControls()

    this.setHue(60)
    this.setSwatchCoords(75, 20)
    this.setAlpha(100)

    Array.from(this.dom.findInputs(doc, ".repr-input")).forEach(
      (input) => {
        input.addEventListener("change", () => this.reprReader.updateFromRepr())
      }
    )

    const dragMan = new DragManager()
    dragMan.setupDrag2D (this.dom.findElemByID("swatch-container"), (x: Num, y: Num) => this.setSwatchCoords(x, y))
    dragMan.setupDrag1DY(this.dom.findElemByID(    "alpha-slider"), (a: Num)         => this.setAlpha(a))
    dragMan.setupDrag1DY(this.dom.findElemByID(      "hue-slider"), (h: Num)         => this.setHue(h))

    this.dom.findElemByID("copy-button").addEventListener("click", () => this.copyToClipboard())

  }

  copyToClipboard(): void {

    const controls = this.dom.findActiveControls()
    const inputs   = this.dom.findInputs(controls, ".repr-input")
    const text     = inputs.map((input: Input) => input.value).join(" ")

    navigator.clipboard.writeText(text)

  }

  setAlpha(alpha: Num): void {
    const clamped = clamp(alpha)
    this.alphaY   = clamped
    this.dom.findElemByID("alpha-knob").style.bottom = `${clamped.toFixed(2)}%`
    this.updateColor()
  }

  setHue(hueY: Num): void {

    const clamped = clamp(hueY)
    this.hueY     = clamped
    this.dom.findElemByID("hue-knob"       ).style.bottom     = `${clamped.toFixed(2)}%`
    this.dom.findElemByID("swatch-gradient").style.background = `hsla(${calcHueDegrees(hueY)}deg, 100%, 50%, 100%)`

    const { hue, saturation, lightness } = this.updateColor()
    this.updateAlphaGradient(hue, saturation, lightness)

  }

  setSwatchCoords(x: Num, y: Num): void {

    const clampedX = clamp(x)
    const clampedY = clamp(y)

    this.swatchX = clampedX
    this.swatchY = clampedY

    const swatchPointer = this.dom.findElemByID("swatch-pointer")
    swatchPointer.style.left = `${clampedX.toFixed(2)}%`
    swatchPointer.style.top  = `${clampedY.toFixed(2)}%`

    const { hue, saturation, lightness } = this.updateColor()
    this.updateAlphaGradient(hue, saturation, lightness)

  }

  updateColor(): ColorUpdate {

    const hue        = calcHueDegrees(this.hueY)
    const saturation = this.swatchX
    const maxL       = 100 - this.swatchY
    const minL       = maxL / 2
    const lightness  = Math.round(minL + ((maxL - minL) * ((100 - saturation) / 100)))
    const alpha      = this.alphaY

    this.dom.findElemByID("preview-color").style.background = `hsla(${hue}deg, ${saturation}%, ${lightness}%, ${alpha}%)`

    this.reprWriter.refreshReprValues(hue, saturation, lightness, alpha)

    return { hue, saturation, lightness, alpha }

  }

  private updateAlphaGradient(hue: Num, saturation: Num, lightness: Num): void {
    const hslStr = `${hue} ${saturation} ${lightness}`
    const [elem] = this.dom.findElems(".slider-background.alpha") as [Elem]
    elem.style.background = `linear-gradient(to top, hsla(${hslStr} / 0%) 0%, hsl(${hslStr}) 100%)`
  }

  private updateReprControls(): void {

    this.dom.findElems(".repr-controls-container .repr-controls").forEach((c: Elem) => { c.style.display = "" })

    const dropdown     = this.dom.findReprDropdown()
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    this.dom.findElemByID(targetElemID).style.display = "flex"

    this.handleAlphaSlider(dropdown.value)

    this.updateColor()

  }

  private handleAlphaSlider(formatName: Str): void {
    if (["hsba", "hsla", "rgba", "hex"].includes(formatName)) {
      this.dom.findElemByID("alpha-bar").classList.remove("hidden")
    } else {
      this.setAlpha(100)
      this.dom.findElemByID("alpha-bar").classList.add("hidden")
    }
  }

}
