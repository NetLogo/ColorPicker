import { colorToRGB, nearestColorNumberOfRGB                                      } from "./ColorModel.js"
import { findElemByID, findElems, findInputByID, findInputs, setInputByID, unsafe } from "./DOM.js"

type Elem        = HTMLElement
type Input       = HTMLInputElement
type Num         = number
type Str         = string

type ColorUpdate = { hue: Num, saturation: Num, lightness: Num, alpha: Num }

const dataModel =
  { alphaX:  0
  , hueX:    0
  , swatchX: 0
  , swatchY: 0
  }

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

const casper = new Image()
casper.src   = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="

const calcHueDegrees = (hue: Num): Num => Math.round(360 * (hue / 100))

const clamp = (percentage: Num): Num => Math.max(0, Math.min(100, percentage))

const hideGhost = (elem: Elem): void => {
  elem.addEventListener("dragstart", (e: DragEvent) => {
    unsafe(e.dataTransfer).setDragImage(casper, 0, 0)
  }, false)
}

const setupDrag1D = (elem: Elem, setter: (x: Num) => void): void => {

  const onMouseLocation = (e: MouseEvent): void => {

    if (e.clientX > 0) {

      const target = e.target as Elem

      const { left, right, width } = target.getBoundingClientRect()

      const absX       = e.clientX
      const clampedX   = (absX < left) ? left : (absX > right) ? right : absX
      const relX       = clampedX - left
      const percentage = Math.round(relX / width * 100)

      setter(percentage)

    }

  }

  hideGhost(elem)

  elem.addEventListener("click", onMouseLocation, false)
  elem.addEventListener("drag" , onMouseLocation, false)

}

const setupDrag2D = (elem: Elem, setter: (x: Num, y: Num) => void): void => {

  const onMouseLocation = (e: MouseEvent): void => {

    if (e.clientX > 0 && e.clientY > 0) {

      const target = e.target as Elem

      const { left, right, width } = target.getBoundingClientRect()

      const absX        = e.clientX
      const clampedX    = (absX < left) ? left : (absX > right) ? right : absX
      const relX        = clampedX - left
      const xPercentage = Math.round(relX / width * 100)

      const { top, bottom, height } = target.getBoundingClientRect()

      const absY        = e.clientY
      const clampedY    = (absY < top) ? top : (absY > bottom) ? bottom : absY
      const relY        = clampedY - top
      const yPercentage = Math.round(relY / height * 100)

      setter(xPercentage, yPercentage)

    }

  }

  hideGhost(elem)
  elem.addEventListener("click", onMouseLocation, false)
  elem.addEventListener("drag" , onMouseLocation, false)

}

const setAlpha = (alpha: Num): void => {
  const clamped    = clamp(alpha)
  dataModel.alphaX = clamped
  findElemByID("alpha-knob").style.left = `${clamped.toFixed(2)}%`
  updateColor()
}

const setHue = (hueX: Num): void => {

  const clamped  = clamp(hueX)
  dataModel.hueX = clamped
  findElemByID("hue-knob"       ).style.left       = `${clamped.toFixed(2)}%`
  findElemByID("swatch-gradient").style.background = `hsla(${calcHueDegrees(hueX)}deg, 100%, 50%, 100%)`

  const { hue, saturation, lightness } = updateColor()
  updateAlphaGradient(hue, saturation, lightness)

}

const setSwatchCoords = (x: Num, y: Num): void => {

  const clampedX = clamp(x)
  const clampedY = clamp(y)

  dataModel.swatchX = clampedX
  dataModel.swatchY = clampedY

  const swatchPointer = findElemByID("swatch-pointer")
  swatchPointer.style.left = `${clampedX.toFixed(2)}%`
  swatchPointer.style.top  = `${clampedY.toFixed(2)}%`

  const { hue, saturation, lightness } = updateColor()
  updateAlphaGradient(hue, saturation, lightness)

}

const updateColor = (): ColorUpdate => {

  const hue        = calcHueDegrees(dataModel.hueX)
  const saturation = dataModel.swatchX
  const maxL       = (100 - dataModel.swatchY)
  const minL       = maxL / 2
  const lightness  = Math.round(minL + ((maxL - minL) * ((100 - saturation) / 100)))
  const alpha      = dataModel.alphaX

  findElemByID("preview-color").style.background = `hsla(${hue}deg, ${saturation}%, ${lightness}%, ${alpha}%)`

  refreshReprValues(hue, saturation, lightness, alpha)

  return { hue, saturation, lightness, alpha }

}

const updateAlphaGradient = (hue: Num, saturation: Num, lightness: Num): void => {
  const hslStr = `${hue} ${saturation} ${lightness}`
  const [elem] = findElems(document, ".slider-background.alpha") as [Elem]
  elem.style.background = `linear-gradient(to right, hsla(${hslStr} / 0%) 0%, hsl(${hslStr}) 100%)`
}

setupDrag2D(findElemByID("swatch-container"), setSwatchCoords)
setupDrag1D(findElemByID(    "alpha-slider"), setAlpha)
setupDrag1D(findElemByID(      "hue-slider"), setHue)

findElemByID("copy-icon").addEventListener("click", (): void => {

  const inputs = findInputs(findActiveControls(), ".repr-input")
  const text   = inputs.map((input: Input) => input.value).join(" ")

  void navigator.clipboard.writeText(text)

})

const findActiveControls = (): Elem => {
  const controls = findElems(document, ".repr-controls-container .repr-controls")
  const active   = controls.find((c: Elem) => c.style.display === "flex")
  return unsafe(active)
}

const updateReprControls = (): void => {

  findElems(document, ".repr-controls-container .repr-controls").forEach((c: Elem) => { c.style.display = "" })

  const dropdown     = findInputByID("repr-dropdown")
  const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
  findElemByID(targetElemID).style.display = "flex"

  handleAlphaSlider(dropdown.value)

  updateColor()

}

const handleAlphaSlider = (formatName: Str): void => {
  if (["hsba", "hsla", "rgba", "hex"].includes(formatName)) {
    findElemByID("alpha-bar").classList.remove("hidden")
  } else {
    setAlpha(100)
    findElemByID("alpha-bar").classList.add("hidden")
  }
}

const updateFromRepr = (): void => {

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

    setHue(hue / 360 * 100)
    setSwatchCoords(saturation, y)
    setAlpha(alpha)

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

  const dropdown     = findInputByID("repr-dropdown")
  const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
  const container    = findElemByID(targetElemID)
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

const refreshReprValues = (hue: Num, saturation: Num, lightness: Num, alpha: Num): void => {

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

  const activeControls = findActiveControls()

  switch (activeControls.id) {
    case "netlogo-number-controls": {
      const [r, g, b]   = asRGB()
      const colorNumber = nearestColorNumberOfRGB(r, g, b)
      setInputByID("netlogo-number", colorNumber)
      break
    }
    case "netlogo-word-controls": {
      setInputByID("netlogo-word", findColorWord(...asRGB()))
      break
    }
    case "hsb-controls": {
      const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
      setInputByID("hsb-h",           hue)
      setInputByID("hsb-s", hsbSaturation)
      setInputByID("hsb-b",    brightness)
      break
    }
    case "hsba-controls": {
      const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
      setInputByID("hsba-h",           hue)
      setInputByID("hsba-s", hsbSaturation)
      setInputByID("hsba-b",    brightness)
      setInputByID("hsba-a",         alpha)
      break
    }
    case "hsl-controls": {
      setInputByID("hsl-h",        hue)
      setInputByID("hsl-s", saturation)
      setInputByID("hsl-l",  lightness)
      break
    }
    case "hsla-controls": {
      setInputByID("hsla-h",        hue)
      setInputByID("hsla-s", saturation)
      setInputByID("hsla-l",  lightness)
      setInputByID("hsla-a",      alpha)
      break
    }
    case "rgb-controls": {
      const [r, g, b] = asRGB()
      setInputByID("rgb-r", r)
      setInputByID("rgb-g", g)
      setInputByID("rgb-b", b)
      break
    }
    case "rgba-controls": {
      const [r, g, b] = asRGB()
      setInputByID("rgba-r",     r)
      setInputByID("rgba-g",     g)
      setInputByID("rgba-b",     b)
      setInputByID("rgba-a", alpha)
      break
    }
    case "hex-controls": {
      const hex = (x: Num): Str => x.toString(16).padStart(2, "0")
      const [r, g, b] = asRGB()
      const a         = Math.round(alpha / 100 * 255)
      setInputByID("hex", `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`)
      break
    }
    default: {
      alert(`Invalid representation dropdown ID: ${activeControls.id}`)
    }
  }

}

const reprDropdown = findInputByID("repr-dropdown")
reprDropdown.addEventListener("change", updateReprControls)
reprDropdown.value = "nl-number"
updateReprControls()

Array.from(document.querySelectorAll(".repr-input")).forEach((input) => { input.addEventListener("change", updateFromRepr) })

window.addEventListener("load", () => {
  setHue(60)
  setSwatchCoords(75, 20)
  setAlpha(100)
});
