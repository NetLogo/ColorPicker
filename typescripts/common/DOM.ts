import { unsafe } from "./Util.js"

const findElems = (container: Document | Element, selector: string): Array<HTMLElement> => {
  return Array.from(container.querySelectorAll(selector))
}

const findElemByID = (doc: Document) => (id: string): HTMLElement => {
  return unsafe(doc.getElementById(id))
}

const findInputs = (container: Document | Element, selector: string): Array<HTMLInputElement> => {
  return findElems(container, selector) as Array<HTMLInputElement>
}

const findInputByID = (doc: Document) => (id: string): HTMLInputElement => {
  return doc.getElementById(id) as HTMLInputElement
}

const setInput = (elem: HTMLInputElement, value: { toString: () => string }): void => {
  elem.value = value.toString()
}

const setInputByID = (doc: Document) => (id: string, value: { toString: () => string }): void => {
  setInput(findInputByID(doc)(id), value)
}

export { findElemByID, findElems, findInputByID, findInputs, setInput, setInputByID }
