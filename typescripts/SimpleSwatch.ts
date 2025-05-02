import { findElemByID, findElems, findFirstElem } from "./common/DOM.js"
import { unsafe                                 } from "./common/Util.js"

import { colorToRGB, rgbToWord } from "./ColorModel.js"

import type { DivEl, OutputEl } from "./common/Types.js"

export class SimpleSwatch {

  private colorNum: number
  private pane:     DivEl

  constructor(doc: Document) {

    this.colorNum = 0

    this.pane = findElemByID<DivEl>(doc)("simple-pane")

    const nums =
      [...Array(11 * 14).keys()].map(
        (x) => {
          if (x <= 139) {
            return x
          } else {
            const overflow = x - 140
            return (overflow * 10) + 9.9
          }
      }).sort((x, y) => x - y)

    nums.forEach(
      (num) => {

        const [r, g, b] = (num % 10 === 0) ? [0, 0, 0] : (Math.floor(num) !== num) ? [255, 255, 255] : colorToRGB(num)
        const rgbCSS    = `rgb(${r}, ${g}, ${b})`

        const isDark = (num - Math.floor(num / 10) * 10) < 4

        let div = doc.createElement("div")
        div.classList.add("swatch-color")
        div.classList.add(isDark ? "dark" : "light")

        if (rgbCSS === "rgb(255, 255, 255)") {
          div.classList.add("white")
        }

        div.style.cssText = `background-color: ${rgbCSS}; border-color: ${rgbCSS};`

        div.onclick = () => {

          this.colorNum   = num
          const [r, g, b] = colorToRGB(num)
          const word      = rgbToWord(r, g, b)
          findFirstElem<OutputEl>(this.pane)(".output-field").value = word

          Array.from(this.pane.querySelectorAll(".swatch-color.selected")).forEach((sc) => sc.classList.remove("selected"))
          div.classList.add("selected")

        }

        div.dataset["color_num"] = (num * 10).toString()

        unsafe(this.pane.querySelector(".swatches")).append(div)

      }
    )

    this.setColor(0)

  }

  getNLNumberValue(): number {
    return this.colorNum
  }

  getOutputValue(isCopy: boolean): string {
    if (isCopy) {
      const word      = findFirstElem<OutputEl>(this.pane)(".output-field").value
      const isLiteral = !word.includes(" ")
      return isLiteral ? word : `(${word})`
    } else {
      return this.colorNum.toString()
    }
  }

  setColor(num: number): void {

    const amped = Math.round(num * 10)

    const elems = findElems<DivEl>(this.pane)(".swatch-color")

    const closestDiv =
      elems.slice(1).reduce(
        (best, elem) => {
          const bestDist = Math.abs(amped - parseInt(unsafe(best.dataset["color_num"])))
          const elemDist = Math.abs(amped - parseInt(unsafe(elem.dataset["color_num"])))
          const isBetter = elemDist < bestDist
          return isBetter ? elem : best
        }
      , unsafe(elems[0])
      )

    closestDiv.click()

  }

}
