import { findElemByID, findElems, findFirstElem } from "./common/DOM.js"
import { unsafe                                 } from "./common/Util.js"

import { OutputType } from "./advanced/OutputType.js"
import { Picker     } from "./advanced/Picker.js"
import * as Repr      from "./advanced/Representation.js"

import { applyTheme   } from "./ColorTheme.js"
import { SimpleSwatch } from "./SimpleSwatch.js"

import type { El, Num, Str, TemplateEl } from "./common/Types.js"

import type { ColorThemeConfig } from "./ColorTheme.js"

const { NLNumber, NLWord, RGBA } = OutputType

declare global {
  interface Window {

    simple:   SimpleSwatch
    advanced: Picker

    injectCSS:           (css: Str)                 => void
    useNumAndRGBAPicker: ()                         => void
    useNumberOnlyPicker: ()                         => void
    useNonPickPicker:    ()                         => void
    syncTheme:           (config: ColorThemeConfig) => void
    switchToAdvPicker:   ()                         => void

    setValue: (typ: Str, value: any) => void

    nlBabyMonitor: {
      onPick:   (str: Str) => void
      onCopy:   (str: Str) => void
      onCancel: ()         => void
    }

  }
}

const   SIMPLE_TAB_ID =   "simple-tab"
const ADVANCED_TAB_ID = "advanced-tab"

const setUpTabListener = (tabID: Str, contentID: Str): void => {
  findElemByID(document)(tabID).addEventListener("click",
    (e: MouseEvent) => {
      findElems(document)("#tab-strip .tab-button").forEach((tb) => tb.classList.remove("selected"));
      (e.target as El).classList.add("selected")
      findElems(document)("#content-pane .pane").forEach((p: El) => p.classList.add("hidden"))
      findElemByID(document)(contentID).classList.remove("hidden")
    }
  )
}

const instantiateTemplates = (doc: Document): void => {

  const outputsTemplate = (findElemByID<TemplateEl>(doc)("outputs-template")).content

  Array.from(findElems(doc)(".outputs-placeholder")).forEach(
    (placeholder: Element) => {
      const outputs = outputsTemplate.cloneNode(true)
      unsafe(placeholder.parentNode).replaceChild(outputs, placeholder)
    }
  )

}

window.addEventListener("load", () => {

  // `navigator.platform` has been deprecated and replaced with `navigator.userAgentData.platform`,
  // but JFX doesn't support that yet. --Jason B. (4/30/25)
  const platform = navigator.platform
  if (platform === "MacIntel" || platform.startsWith("iPad") || platform.startsWith("iPhone")) {
    document.body.classList.add("apple2025")
  }

  window.nlBabyMonitor = {
    onPick:   (_: Str) => { return }
  , onCopy:   (s: Str) => { navigator.clipboard.writeText(s) }
  , onCancel: ()       => { return }
  }

  setUpTabListener(  SIMPLE_TAB_ID,   "simple-pane")
  setUpTabListener(ADVANCED_TAB_ID, "advanced-pane")

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

  Array.from(findElems(document)(".copy-button")).forEach(
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

})

window.injectCSS = (css: Str): void => {
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

window.setValue = (typ: Str, value: any): void => {

  let repr = undefined

  if (typ === "number") {
    repr = new Repr.NLNumber(value as Num)
  } else if (typ === "rgb") {
    const { red, green, blue } = value as { red: Num, green: Num, blue: Num }
    repr = new Repr.RGB(red, green, blue)
  } else if (typ === "rgba") {
    const { red, green, blue, alpha } = value as { red: Num, green: Num, blue: Num, alpha: Num }
    repr = new Repr.RGBA(red, green, blue, alpha)
  } else {
    throw new Error(`Unknown value type: ${value}`)
  }

  window.simple.setColor(repr.toNLNumber().number)
  window.advanced.setRepr(repr)

}

window.switchToAdvPicker = (): void => {
  unsafe(document.getElementById(ADVANCED_TAB_ID)).click()
}

window.syncTheme = (config: ColorThemeConfig): void => {
  applyTheme(config, document.body)
}

const getOutputValue = (isClipboard: boolean): Str => {

  const selected = findFirstElem(document)("#tab-strip .tab-button.selected")

  switch (selected.id) {
    case SIMPLE_TAB_ID:
      return window.simple.getOutputValue(isClipboard)
    case ADVANCED_TAB_ID:
      return window.advanced.getOutputValue(isClipboard)
    default:
      throw new Error(`Unknown picker type tab ID: ${selected.id}`)
  }

}
