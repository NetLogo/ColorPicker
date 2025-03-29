import { findElemByID, findElems } from "./common/DOM.js"
import { unsafe                  } from "./common/Util.js"

import { OutputType } from "./advanced/OutputType.js"
import { Picker     } from "./advanced/Picker.js"

import { applyTheme   } from "./ColorTheme.js"
import { SimpleSwatch } from "./SimpleSwatch.js"

import type { ColorThemeConfig } from "./ColorTheme.js"

const { HSB, HSBA, HSL, HSLA, NLNumber, NLWord, RGB, RGBA } = OutputType

declare global {
  interface Window {

    simple:   SimpleSwatch
    advanced: Picker

    injectCSS:           (css: string)              => void
    useNumAndRGBAPicker: ()                         => void
    useNumberOnlyPicker: ()                         => void
    useNonPickPicker:    ()                         => void
    syncTheme:           (config: ColorThemeConfig) => void

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

window.addEventListener("load", () => {

  window.nlBabyMonitor = {
    onPick:   (_: string) => { return }
  , onCopy:   (_: string) => { return }
  , onCancel: ()          => { return }
  }

  window.nlBabyMonitor.onCopy = (str: string) => navigator.clipboard.writeText(str)

  setUpTabListener(  "simple-tab",   "simple-pane")
  setUpTabListener("advanced-tab", "advanced-pane")

  window.simple   = new SimpleSwatch(document)
  window.advanced = new Picker(document, new Set([]))

  findElemByID(document)("pick-button").addEventListener("click",
    (_: MouseEvent) => {
      window.nlBabyMonitor.onPick(getOutputValue())
    }
  )

  findElemByID(document)("cancel-button").addEventListener("click",
    (_: MouseEvent) => {
      window.nlBabyMonitor.onCancel()
    }
  )

  findElemByID(document)("copy-button").addEventListener("click",
    () => {
      window.nlBabyMonitor.onCopy(getOutputValue())
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
  window.advanced = new Picker(document, new Set([RGBA, NLNumber, NLWord, RGB, HSB, HSBA, HSL, HSLA]))
}

window.useNumAndRGBAPicker = (): void => {
  window.advanced = new Picker(document, new Set([RGBA, NLNumber]))
}

window.syncTheme = (config: ColorThemeConfig): void => {
  applyTheme(config, document.body)
}

const getOutputValue = (): string => {

  const selected = unsafe(Array.from(findElems(document, "#tab-strip .tab-button.selected"))[0])

  switch (selected.id) {
    case "simple-tab":
      return window.simple.getOutputValue()
    case "advanced-tab":
      return window.advanced.getOutputValue()
    default:
      throw new Error(`Unknown picker type tab ID: ${selected.id}`)
  }

}
