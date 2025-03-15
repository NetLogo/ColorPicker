import { findElemByID, findElems } from "./common/DOM.js"

import { Picker         } from "./advanced/Picker.js"
import { OutputType     } from "./advanced/OutputType.js"
import { StandardSwatch } from "./StandardSwatch.js"

declare global {
  interface Window {
    standard: StandardSwatch
    advanced: Picker
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

  setUpTabListener("standard-tab", "standard-pane")
  setUpTabListener("advanced-tab", "advanced-pane")

  window.standard = new StandardSwatch(document)
  window.advanced = new Picker(document, new Set([OutputType.HSLA]))

});
