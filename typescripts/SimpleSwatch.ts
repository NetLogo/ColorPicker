import { unsafe } from "./common/DOM.js"

import { colorToRGB } from "./ColorModel.js"

export class SimpleSwatch {

  private colorNum: number

  constructor(doc: Document) {

    this.colorNum = 0

    const swatch = unsafe(doc.getElementById("simple-pane"))

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
          this.colorNum = num
          Array.from(doc.querySelectorAll(".swatch-color.selected")).forEach((sc) => sc.classList.remove("selected"))
          div.classList.add("selected")
        }

        swatch.append(div)

      }
    )

  }

  getOutputValue(): string {
    return this.colorNum.toString()
  }

}
