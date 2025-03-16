import { findElemByID, findElems, unsafe } from "./common/DOM.js"

import { Picker       } from "./advanced/Picker.js"
import { OutputType   } from "./advanced/OutputType.js"
import { SimpleSwatch } from "./SimpleSwatch.js"

declare global {
  interface Window {

    simple:   SimpleSwatch
    advanced: Picker

    useNumberOnlyPicker: () => void
    useNonPickPicker:    () => void

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

});

window.useNumberOnlyPicker = (): void => {
  window.advanced = new Picker(document, new Set([OutputType.NLNumber]))
}

window.useNonPickPicker = (): void => {
  findElemByID(document)("pick-button").classList.add("hidden")
  const types = [ OutputType.NLNumber, OutputType.NLWord, OutputType.RGB, OutputType.RGBA, OutputType.HSB, OutputType.HSBA
                , OutputType.HSL, OutputType.HSLA]
  window.advanced = new Picker(document, new Set(types))
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
