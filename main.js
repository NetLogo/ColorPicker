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
  }

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
  }

const casper = new Image()
casper.src   = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="

const calcHueDegrees = (hue) => Math.round(360 * (hue / 100))

const clamp = (percentage) => Math.max(0, Math.min(100, percentage))

const dragX = (e) => {

  if (e.clientX > 0) {

    const width      = e.target.parentElement.parentElement.clientWidth
    const left       = e.target.parentElement.parentElement.getBoundingClientRect().left
    const minX       = left
    const maxX       = minX + width
    const absX       = e.clientX
    const clampedX   = (absX < minX) ? minX : (absX > maxX) ? maxX : absX
    const relX       = clampedX - left
    const percentage = Math.round(relX / width * 100).toFixed(2)

    return percentage

  } else {
    return undefined
  }

}

const dragY = (e) => {

  if (e.clientY > 0) {

    const height     = e.target.parentElement.parentElement.clientHeight
    const top        = e.target.parentElement.parentElement.getBoundingClientRect().top
    const minY       = top
    const maxY       = minY + height
    const absY       = e.clientY
    const clampedY   = (absY < minY) ? minY : (absY > maxY) ? maxY : absY
    const relY       = clampedY - top
    const percentage = Math.round(relY / height * 100).toFixed(2)

    return percentage

  } else {
    return undefined
  }

}

const hideGhost = (elem) => {
  elem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setDragImage(casper, 0, 0)
  }, false)
}

const setupDrag1D = (elem, setter) => {

  const onMouseLocation = (e) => {

    if (e.clientX > 0) {

      const { left, right, width } = e.target.getBoundingClientRect()

      const absX       = e.clientX
      const clampedX   = (absX < left) ? left : (absX > right) ? right : absX
      const relX       = clampedX - left
      const percentage = Math.round(relX / width * 100).toFixed(2)

      setter(percentage)

    }

  }

  hideGhost(elem)

  elem.addEventListener("click", onMouseLocation, false)
  elem.addEventListener("drag" , onMouseLocation, false)

}

const setupDrag2D = (elem, setter) => {

  const onMouseLocation = (e) => {

    if (e.clientX > 0 && e.clientY > 0) {

      const { left, right, width } = e.target.getBoundingClientRect()

      const absX        = e.clientX
      const clampedX    = (absX < left) ? left : (absX > right) ? right : absX
      const relX        = clampedX - left
      const xPercentage = Math.round(relX / width * 100).toFixed(2)

      const { top, bottom, height } = e.target.getBoundingClientRect()

      const absY        = e.clientY
      const clampedY    = (absY < top) ? top : (absY > bottom) ? bottom : absY
      const relY        = clampedY - top
      const yPercentage = Math.round(relY / height * 100).toFixed(2)

      setter(xPercentage, yPercentage)

    }

  }

  hideGhost(elem)
  elem.addEventListener("click", onMouseLocation, false)
  elem.addEventListener("drag" , onMouseLocation, false)

}

const setAlpha = (alpha) => {
  const clamped    = clamp(alpha)
  dataModel.alphaX = clamped
  document.getElementById("alpha-knob").style.left = `${clamped}%`
  updateColor()
}

const setHue = (hue) => {
  const clamped  = clamp(hue)
  dataModel.hueX = clamped
  document.getElementById("hue-knob"       ).style.left       = `${clamped}%`
  document.getElementById("swatch-gradient").style.background = `hsla(${calcHueDegrees(hue)}deg, 100%, 50%, 100%)`
  updateColor()
}

const setSwatchCoords = (x, y) => {

  const clampedX = clamp(x)
  const clampedY = clamp(y)

  dataModel.swatchX = clampedX
  dataModel.swatchY = clampedY

  const swatchPointer = document.getElementById("swatch-pointer")
  swatchPointer.style.left = `${clampedX}%`
  swatchPointer.style.top  = `${clampedY}%`

  updateColor()

}

const updateColor = () => {

  const hue        = calcHueDegrees(dataModel.hueX)
  const saturation = dataModel.swatchX
  const maxL       = (100 - dataModel.swatchY)
  const minL       = maxL / 2
  const lightness  = Math.round(minL + ((maxL - minL) * ((100 - saturation) / 100)))
  const alpha      = dataModel.alphaX

  document.getElementById("preview-color").style.background = `hsla(${hue}deg, ${saturation}%, ${lightness}%, ${alpha}%)`

  refreshReprValues(hue, saturation, lightness, alpha)

}

setupDrag2D(document.getElementById("swatch-container"), setSwatchCoords)
setupDrag1D(document.getElementById(    "alpha-slider"), setAlpha)
setupDrag1D(document.getElementById(      "hue-slider"), setHue)

document.getElementById("copy-icon").addEventListener("click", () => {

  const activeControls =
    Array.from(document.querySelectorAll(".repr-controls-container .repr-controls")).find((c) => c.style.display === "flex")

  const inputs = Array.from(activeControls.querySelectorAll(".repr-input"))
  const text   = inputs.map((input) => input.value).join(" ")

  navigator.clipboard.writeText(text)

})

const updateReprControls = () => {

  Array.from(document.querySelectorAll(".repr-controls-container .repr-controls")).forEach((c) => { c.style.display = "" })

  const dropdown     = document.getElementById("repr-dropdown")
  const targetElemID = optionValueToContainerID[dropdown.value]
  document.getElementById(targetElemID).style.display = "flex"

  handleAlphaSlider(dropdown.value)

  updateColor()

}

const handleAlphaSlider = (formatName) => {
  if (["hsba", "hsla", "rgba"].includes(formatName)) {
    document.getElementById("alpha-bar").classList.remove("hidden")
  } else {
    setAlpha(100)
    document.getElementById("alpha-bar").classList.add("hidden")
  }
}

const updateFromRepr = () => {

  // Courtesy of Roko C. Buljan at https://stackoverflow.com/a/31322636/5288538
  const getSLAsHSL = (s, b) => {
    const l          = (2 - s / 100) * b / 2
    const saturation = Math.round(s * b / ((l < 50) ? (l * 2) : (200 - (l * 2)))) | 0
    const lightness  = Math.round(l)
    return [saturation, lightness]
  }

  const updateFromHSLA = (hue, saturation, lightness, alpha) => {

    const scalingFactor = 1 - ((saturation / 100) * 0.5)
    const y             = (100 - lightness / scalingFactor)

    setHue(hue / 360 * 100)
    setSwatchCoords(saturation, y)
    setAlpha(alpha)

  }

  const updateFromRGBA = (r, g, b, a) => {

    // Courtesy of Kamil Kiełczewski at https://stackoverflow.com/a/54071699/5288538
    const rgbToHSL = (red, green, blue) => {

      const rx = red   / 255
      const gx = green / 255
      const bx = blue  / 255

      const v    = Math.max(rx, gx, bx)
      const c    = v - Math.min(rx, gx, bx)
      const f    = 1 - Math.abs(v + v - c - 1)

      const subH = (c && ((v == rx)) ? ((gx - bx) / c) :
                   ((v === g) ? (2 + (bx - rx) / c) : (4 + (rx - gx) / c)))
      const h    = 60 * (subH < 0 ? subH + 6 : subH)

      const subS = (f !== 0) ? (c / f) : 0
      const s    = Math.round(subS * 100)

      const subL = (v + v - c) / 2
      const l    = Math.round(subL * 100)

      return [h, s, l]

    }

    const [h, s, l] = rgbToHSL(r, g, b)

    updateFromHSLA(h, s, l, a)

  }

  const updateFromNLNumber = (num) => {
    const [r, g, b] = NLColorModel.colorToRGB(num)
    updateFromRGBA(r, g, b, 100)
  }

  const dropdown     = document.getElementById("repr-dropdown")
  const targetElemID = optionValueToContainerID[dropdown.value]
  const container    = document.getElementById(targetElemID)
  const inputValues  = Array.from(container.querySelectorAll(".repr-input")).map((i) => i.value)

  switch (dropdown.value) {
    case "nl-number": {
      const [colorNumber] = inputValues
      updateFromNLNumber(parseFloat(colorNumber))
      break;
    }
    case "nl-word": {
      const [colorWord]             = inputValues
      const [word, operator, value] = colorWord.split(" ")
      if (nlWordsToNumbers.hasOwnProperty(word)) {
        const baseNum = nlWordsToNumbers[word]
        const diff    = ((operator !== "+" && operator !== "-") || isNaN(Number(value))) ? 0 :
                         (operator === "+") ? Number(value) : -Number(value)
        updateFromNLNumber(baseNum + diff)
      }
      break;
    }
    case "hsb": {
      const [hue, saturation, brightness] = inputValues.map((v) => parseInt(v))
      const [hslSaturation, lightness]    = getSLAsHSL(saturation, brightness)
      updateFromHSLA(hue, hslSaturation, brightness, 100)
      break;
    }
    case "hsba": {
      const [hue, saturation, brightness, alpha] = inputValues.map((v) => parseInt(v))
      const [hslSaturation, lightness]           = getSLAsHSL(saturation, brightness)
      updateFromHSLA(hue, hslSaturation, brightness, alpha)
      break;
    }
    case "hsl": {
      const [hue, saturation, lightness] = inputValues.map((v) => parseInt(v))
      updateFromHSLA(hue, saturation, lightness, 100)
      break;
    }
    case "hsla": {
      const [hue, saturation, lightness, alpha] = inputValues.map((v) => parseInt(v))
      updateFromHSLA(hue, saturation, lightness, alpha)
      break;
    }
    case "rgb": {
      const [red, green, blue] = inputValues.map((v) => parseInt(v))
      updateFromRGBA(red, green, blue, 100)
      break;
    }
    case "rgba": {
      const [red, green, blue, alpha] = inputValues.map((v) => parseInt(v))
      updateFromRGBA(red, green, blue, alpha)
      break;
    }
    case "hex": {
      const [fullHex] = inputValues
      const hex       = fullHex.slice(1)
      if (hex.length === 6 || hex.length === 8) {
        const [red, green, blue, a] = [0, 2, 4, 6].map((n) => parseInt(hex.slice(n, n + 2), 16))
        const alpha                 = (a !== "") ? Math.floor(a / 255 * 100) : 100
        updateFromRGBA(red, green, blue, alpha)
      }
      break;
    }
    default: {
      alert(`Invalid representation dropdown ID: ${activeControls.id}`)
    }
  }

}

const refreshReprValues = (hue, saturation, lightness, alpha) => {

  // Courtesy of Roko C. Buljan at https://stackoverflow.com/a/31322636/5288538
  const getSBAsHSB = (s, l) => {
    const temp = s * ((l < 50) ? l : (100 - l)) / 100
    const hsbS = Math.round(200 * temp / (l + temp)) | 0
    const hsbB = Math.round(temp + l)
    return [hsbS, hsbB]
  }

  // Courtesy of Kamil Kiełczewski at https://stackoverflow.com/a/64090995/5288538
  const asRGB = () => {
    const l     = lightness / 100
    const a     = (saturation / 100) * Math.min(l, 1 - l)
    const morph = (n) => {
      const k     = (n + hue / 30) % 12
      const value = l - (a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
      return Math.round(value * 255)
    }
    return [morph(0), morph(8), morph(4)]
  }

  const findColorWord = (r, g, b) => {

    const colorNumber = NLColorModel.nearestColorNumberOfRGB(r, g, b)

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

      const r = (x) => Math.round(x * 10) / 10

      const diff = (colorNumber === nearestValue) ? "" :
                   (colorNumber   > nearestValue) ? `+ ${r(colorNumber - nearestValue)}` : `- ${r(nearestValue - colorNumber)}`

      return `${nearestWord} ${diff}`

    }

  }

  const activeControls =
    Array.from(document.querySelectorAll(".repr-controls-container .repr-controls")).find((c) => c.style.display === "flex")

  switch (activeControls.id) {
    case "netlogo-number-controls": {
      const [r, g, b]   = asRGB()
      const colorNumber = NLColorModel.nearestColorNumberOfRGB(r, g, b)
      document.getElementById("netlogo-number").value = colorNumber
      break;
    }
    case "netlogo-word-controls": {
      document.getElementById("netlogo-word").value = findColorWord(...asRGB())
      break;
    }
    case "hsb-controls": {
      const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
      document.getElementById("hsb-h").value = hue
      document.getElementById("hsb-s").value = hsbSaturation
      document.getElementById("hsb-b").value = brightness
      break;
    }
    case "hsba-controls": {
      const [hsbSaturation, brightness] = getSBAsHSB(saturation, lightness)
      document.getElementById("hsba-h").value = hue
      document.getElementById("hsba-s").value = hsbSaturation
      document.getElementById("hsba-b").value = brightness
      document.getElementById("hsba-a").value = alpha
      break;
    }
    case "hsl-controls": {
      document.getElementById("hsl-h").value = hue
      document.getElementById("hsl-s").value = saturation
      document.getElementById("hsl-l").value = lightness
      break;
    }
    case "hsla-controls": {
      document.getElementById("hsla-h").value = hue
      document.getElementById("hsla-s").value = saturation
      document.getElementById("hsla-l").value = lightness
      document.getElementById("hsla-a").value = alpha
      break;
    }
    case "rgb-controls": {
      const [r, g, b] = asRGB()
      document.getElementById("rgb-r").value = r
      document.getElementById("rgb-g").value = g
      document.getElementById("rgb-b").value = b
      break;
    }
    case "rgba-controls": {
      const [r, g, b] = asRGB()
      document.getElementById("rgba-r").value = r
      document.getElementById("rgba-g").value = g
      document.getElementById("rgba-b").value = b
      document.getElementById("rgba-a").value = alpha
      break;
    }
    case "hex-controls": {
      const hex = (x) => x.toString(16).padStart(2, "0")
      const [r, g, b] = asRGB()
      const a         = Math.round(alpha / 100 * 255)
      document.getElementById("hex").value = `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`
      break;
    }
    default: {
      alert(`Invalid representation dropdown ID: ${activeControls.id}`)
    }
  }

}

document.getElementById("repr-dropdown").addEventListener("change", updateReprControls)

document.getElementById("repr-dropdown").value = "nl-number"
updateReprControls()

Array.from(document.querySelectorAll(".repr-input")).forEach((input) => { input.addEventListener("change", updateFromRepr) })

window.addEventListener("load", () => {
  setHue(60)
  setSwatchCoords(75, 20)
  setAlpha(100)
});
