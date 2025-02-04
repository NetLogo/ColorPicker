import { Picker } from "./picker/Picker.js"

declare global {
  interface Window {
    picker: Picker
  }
}

window.addEventListener("load", () => {
  window.picker = new Picker(document)
});
