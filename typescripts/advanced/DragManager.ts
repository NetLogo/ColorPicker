import { unsafe } from "../common/DOM.js"

import type { Elem, Num } from "./Types.js"

const casper = new Image()
casper.src   = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="

const hideGhost = (elem: Elem): void => {
  elem.addEventListener("dragstart", (e: DragEvent) => {
    unsafe(e.dataTransfer).setDragImage(casper, 0, 0)
  }, false)
}

export class DragManager {

  setupDrag1DX(elem: Elem, setter: (x: Num) => void): void {

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

  setupDrag1DY(elem: Elem, setter: (y: Num) => void): void {

    const onMouseLocation = (e: MouseEvent): void => {

      if (e.clientY > 0) {

        const target = e.target as Elem

        const { bottom, top, height } = target.getBoundingClientRect()

        const absY       = e.clientY
        const clampedY   = (absY < top) ? top : (absY > bottom) ? bottom : absY
        const relY       = bottom - clampedY
        const percentage = Math.round(relY / height * 100)

        setter(percentage)

      }

    }

    hideGhost(elem)

    elem.addEventListener("click", onMouseLocation, false)
    elem.addEventListener("drag" , onMouseLocation, false)

  }

  setupDrag2D(elem: Elem, setter: (x: Num, y: Num) => void): void {

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

}
