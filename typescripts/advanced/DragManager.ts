import type { Elem, Num } from "./Types.js"

export class DragManager {

  setupDrag1DX(elem: Elem, setter: (x: Num) => void): void {

    let mouseDown = false

    const setPosition = (x: number): void => {

      const { left, right, width } = elem.getBoundingClientRect()

      const absX       = x
      const clampedX   = (absX < left) ? left : (absX > right) ? right : absX
      const relX       = clampedX - left
      const percentage = Math.round(relX / width * 100)

      setter(percentage)

    }

    const onMouseDown = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = true
        setPosition(e.clientX)
      }
    }

    const onMouseMove = (e: MouseEvent): void => {
      if (mouseDown) {
        setPosition(e.clientX)
      }
    }

    const onMouseUp = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = false
      }
    }

    elem.addEventListener("mousedown" , onMouseDown, false)
    elem.addEventListener("mousemove" , onMouseMove, false)
    elem.addEventListener("mouseup"   , onMouseUp  , false)
    elem.addEventListener("mouseleave", onMouseUp  , false)

  }

  setupDrag1DY(elem: Elem, setter: (y: Num) => void): void {

    let mouseDown = false

    const setPosition = (y: number): void => {

      const { bottom, top, height } = elem.getBoundingClientRect()

      const absY       = y
      const clampedY   = (absY < top) ? top : (absY > bottom) ? bottom : absY
      const relY       = bottom - clampedY
      const percentage = Math.round(relY / height * 100)

      setter(percentage)

    }

    const onMouseDown = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = true
        setPosition(e.clientY)
      }
    }

    const onMouseMove = (e: MouseEvent): void => {
      if (mouseDown) {
        setPosition(e.clientY)
      }
    }

    const onMouseUp = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = false
      }
    }

    elem.addEventListener("mousedown" , onMouseDown, false)
    elem.addEventListener("mousemove" , onMouseMove, false)
    elem.addEventListener("mouseup"   , onMouseUp  , false)
    elem.addEventListener("mouseleave", onMouseUp  , false)

  }

  setupDrag2D(elem: Elem, setter: (x: Num, y: Num) => void): void {

    let mouseDown = false

    const setPosition = (x: number, y: number): void => {

      const { left, right, width } = elem.getBoundingClientRect()

      const absX        = x
      const clampedX    = (absX < left) ? left : (absX > right) ? right : absX
      const relX        = clampedX - left
      const xPercentage = Math.round(relX / width * 100)

      const { top, bottom, height } = elem.getBoundingClientRect()

      const absY        = y
      const clampedY    = (absY < top) ? top : (absY > bottom) ? bottom : absY
      const relY        = clampedY - top
      const yPercentage = Math.round(relY / height * 100)

      setter(xPercentage, yPercentage)

    }

    const onMouseDown = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = true
        setPosition(e.clientX, e.clientY)
      }
    }

    const onMouseMove = (e: MouseEvent): void => {
      if (mouseDown) {
        setPosition(e.clientX, e.clientY)
      }
    }

    const onMouseUp = (e: MouseEvent): void => {
      if (e.button == 0) {
        mouseDown = false
      }
    }

    elem.addEventListener("mousedown" , onMouseDown, false)
    elem.addEventListener("mousemove" , onMouseMove, false)
    elem.addEventListener("mouseup"   , onMouseUp  , false)
    elem.addEventListener("mouseleave", onMouseUp  , false)

  }

}
