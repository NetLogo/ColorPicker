const findElems = (container: Document | Element, selector: string): Array<HTMLElement> => {
  return Array.from(container.querySelectorAll(selector))
}

const findElemByID = (id: string): HTMLElement => {
  return unsafe(document.getElementById(id))
}

const findInputs = (container: Document | Element, selector: string): Array<HTMLInputElement> => {
  return findElems(container, selector) as Array<HTMLInputElement>
}

const findInputByID = (id: string): HTMLInputElement => {
  return document.getElementById(id) as HTMLInputElement
}

const setInput = (elem: HTMLInputElement, value: { toString: () => string }): void => {
  elem.value = value.toString()
}

const setInputByID = (id: string, value: { toString: () => string }): void => {
  setInput(findInputByID(id), value)
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const unsafe = <T>(x: T | undefined | null): T => x!
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export { findElemByID, findElems, findInputByID, findInputs, setInput, setInputByID, unsafe }
