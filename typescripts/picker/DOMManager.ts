import { findElemByID, findElems, findInputByID, findInputs, setInputByID, unsafe } from "../common/DOM.js"

import { optionValueToContainerID } from "./Util.js"

import type { Elem, Input, Str } from "./Types.js"

export class DOMManager {

  private doc: Document

  constructor(doc: Document) {
    this.doc = doc
  }

  findActiveControls(): Elem {
    const controls = findElems(this.doc, ".repr-controls-container .repr-controls")
    const active   = controls.find((c: Elem) => c.style.display === "flex")
    return unsafe(active)
  }

  findElemByID(id: Str): HTMLElement {
    return findElemByID(this.doc)(id)
  }

  findElems(selector: Str): Array<HTMLElement> {
    return findElems(this.doc, selector)
  }

  findInputByID(id: Str): HTMLInputElement {
    return findInputByID(this.doc)(id)
  }

  findInputs(container: Document | HTMLElement, selector: Str): Array<HTMLInputElement> {
    return findInputs(container, selector)
  }

  findInputValues(): Array<string> {
    const dropdown     = this.findReprDropdown()
    const targetElemID = unsafe(optionValueToContainerID[dropdown.value])
    const container    = this.findElemByID(targetElemID)
    return findInputs(container, ".repr-input").map((i: Input) => i.value)
  }

  findReprDropdown(): HTMLInputElement {
    return this.findInputByID("repr-dropdown")
  }

  setInputByID(id: string, value: { toString: () => string }): void {
    return setInputByID(this.doc)(id, value)
  }

}
