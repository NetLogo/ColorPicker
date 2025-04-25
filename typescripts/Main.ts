import { findElemByID, findElems } from "./common/DOM.js"
import { unsafe                  } from "./common/Util.js"

import { OutputType } from "./advanced/OutputType.js"
import { Picker     } from "./advanced/Picker.js"
import * as Repr      from "./advanced/Representation.js"

import { applyTheme   } from "./ColorTheme.js"
import { SimpleSwatch } from "./SimpleSwatch.js"

import type { ColorThemeConfig } from "./ColorTheme.js"

const { NLNumber, NLWord, RGBA } = OutputType

declare global {
  interface Window {

    simple:   SimpleSwatch
    advanced: Picker

    injectCSS:           (css: string)              => void
    useNumAndRGBAPicker: ()                         => void
    useNumberOnlyPicker: ()                         => void
    useNonPickPicker:    ()                         => void
    syncTheme:           (config: ColorThemeConfig) => void
    switchToAdvPicker:   ()                         => void

    setValue: (typ: string, value: any) => void

    nlBabyMonitor: {
      onPick:   (str: string) => void
      onCopy:   (str: string) => void
      onCancel: ()            => void
    }

  }
}

const setUpTabListener = (tabID: string, contentID: string) => {
  findElemByID(document)(tabID).addEventListener("click",
    (e: MouseEvent) => {
      findElems(document, "#tab-strip .tab-button").forEach((tb) => tb.classList.remove("selected"));
      (e.target as HTMLElement).classList.add("selected")
      findElems(document, "#content-pane .pane").forEach((p: HTMLElement) => p.classList.add("hidden"))
      findElemByID(document)(contentID).classList.remove("hidden")
    }
  )
}

const instantiateTemplates = (doc: Document): void => {

  const outputsTemplate = (findElemByID(document)("outputs-template") as HTMLTemplateElement).content

  Array.from(findElems(doc, ".outputs-placeholder")).forEach(
    (placeholder: Element) => {
      const outputs = outputsTemplate.cloneNode(true)
      unsafe(placeholder.parentNode).replaceChild(outputs, placeholder)
    }
  )

}

window.addEventListener("load", () => {

  window.nlBabyMonitor = {
    onPick:   (_: string) => { return }
  , onCopy:   (s: string) => { navigator.clipboard.writeText(s) }
  , onCancel: ()          => { return }
  }

  window.nlBabyMonitor.onCopy = (str: string) => navigator.clipboard.writeText(str)

  setUpTabListener(  "simple-tab",   "simple-pane")
  setUpTabListener("advanced-tab", "advanced-pane")

  instantiateTemplates(document)

  window.simple   = new SimpleSwatch(document)
  window.advanced = new Picker(document, new Set([]))

  findElemByID(document)("pick-button").addEventListener("click",
    (_: MouseEvent) => {
      window.nlBabyMonitor.onPick(getOutputValue(false))
    }
  )

  findElemByID(document)("cancel-button").addEventListener("click",
    (_: MouseEvent) => {
      window.nlBabyMonitor.onCancel()
    }
  )

  Array.from(findElems(document, ".copy-button")).forEach(
    (btn) => {

      var isChilling = false

      btn.addEventListener("click", () => {

        if (!isChilling) {

          btn.classList.add("on-cooldown")
          isChilling = true

          setTimeout(
            () => {
              btn.classList.remove("on-cooldown")
              isChilling = false
            }
          , 1200)

          window.nlBabyMonitor.onCopy(getOutputValue(true))

        }

      })

    }
  )

  window.syncTheme({})

});

window.injectCSS = (css: string): void => {
  const elem       = document.createElement("style")
  elem.textContent = css
  document.head.append(elem)
}

window.useNumberOnlyPicker = (): void => {
  window.advanced = new Picker(document, new Set([NLNumber]))
}

window.useNonPickPicker = (): void => {
  findElemByID(document)("pick-button").classList.add("hidden")
  window.advanced = new Picker(document, new Set([NLNumber, NLWord, RGBA]))
}

window.useNumAndRGBAPicker = (): void => {
  window.advanced = new Picker(document, new Set([NLNumber, RGBA]))
}

window.setValue = (typ: string, value: any): void => {

  let repr = undefined

  if (typ === "number") {
    repr = new Repr.NLNumber(value as number)
  } else if (typ === "rgb") {
    const { red, green, blue } = value as { red: number, green: number, blue: number }
    repr = new Repr.RGB(red, green, blue)
  } else if (typ === "rgba") {
    const { red, green, blue, alpha } = value as { red: number, green: number, blue: number, alpha: number }
    repr = new Repr.RGBA(red, green, blue, alpha)
  } else {
    throw new Error(`Unknown value type: ${value}`)
  }

  window.simple.setColor(repr.toNLNumber().number)
  window.advanced.setRepr(repr)

}

window.switchToAdvPicker = (): void => {
  unsafe(document.getElementById("advanced-tab")).click()
}

window.syncTheme = (config: ColorThemeConfig): void => {
  applyTheme(config, document.body)
}

const getOutputValue = (isClipboard: boolean): string => {

  const selected = unsafe(Array.from(findElems(document, "#tab-strip .tab-button.selected"))[0])

  switch (selected.id) {
    case "simple-tab":
      return window.simple.getOutputValue(isClipboard)
    case "advanced-tab":
      return window.advanced.getOutputValue()
    default:
      throw new Error(`Unknown picker type tab ID: ${selected.id}`)
  }

}
