import { unsafe } from "./common/Util.js"

import type { Num, Str, Str3 } from "./common/Types.js"

declare global {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  interface Window {
  /* eslint-enable @typescript-eslint/consistent-type-definitions */
    NLColorModel: {
      colorToRGB:              (c: Num)                 => [Num, Num, Num]
      nearestColorNumberOfRGB: (r: Num, g: Num, b: Num) => Num
    }
  }
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

const nlNumbersToWords: Record<Num, Str> = (
  () => {

    const oldEntries = Object.entries(nlWordsToNumbers)
    const newEntries =
      oldEntries.flatMap(
        ([k, v]) => {
          if (!["white", "black", "gray"].includes(k)) {
            return [[v - 5, "black"], [v, k], [v + 4.9, "white"]]
          } else {
            return [[v, k]]
          }
        }
      )

    return Object.fromEntries(newEntries)

  }
)()

const rgbToWord = (r: Num, g: Num, b: Num): Str => {

  const colorNumber = nearestColorNumberOfRGB(r, g, b)

  if (nlNumbersToWords.hasOwnProperty(colorNumber)) {
    return unsafe(nlNumbersToWords[colorNumber])
  } else {

    const pairs = Object.entries(nlWordsToNumbers).slice(2)

    const [nearestWord, nearestValue] =
      pairs.reduce(
        (acc, x) => Math.abs(colorNumber - x[1]) < Math.abs(colorNumber - acc[1]) ? x : acc
      , ["nonsense", 1e9]
      )

    const rd = (x: Num): Num => Math.round(x * 10) / 10

    const diff = (colorNumber === nearestValue) ? "" :
                 (colorNumber   > nearestValue) ? ` + ${rd(colorNumber - nearestValue)}` : ` - ${rd(nearestValue - colorNumber)}`

    return `${nearestWord}${diff}`

  }

}

const colorToRGB = (c: Num): [Num, Num, Num] => window.NLColorModel.colorToRGB(c)

const colorWordToNumber = (nlWord: Str): Num => {
  const [word, operator, value] = nlWord.split(" ") as Str3
  if (nlWordsToNumbers.hasOwnProperty(word)) {
    const baseNum = unsafe(nlWordsToNumbers[word])
    const diff    = ((operator !== "+" && operator !== "-") || isNaN(Number(value))) ? 0 :
                     (operator === "+") ? Number(value) : -Number(value)
    return baseNum + diff
  } else {
    throw new Error(`Invalid NL color word: ${nlWord}`)
  }
}

const nearestColorNumberOfRGB = (r: Num, g: Num, b: Num): Num  => window.NLColorModel.nearestColorNumberOfRGB(r, g, b)

export { colorToRGB, colorWordToNumber, nearestColorNumberOfRGB, nlWordsToNumbers, rgbToWord }
