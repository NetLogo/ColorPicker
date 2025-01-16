declare global {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  interface Window {
  /* eslint-enable @typescript-eslint/consistent-type-definitions */
    NLColorModel: {
      colorToRGB:              (c: number)                       => [number, number, number]
      nearestColorNumberOfRGB: (r: number, g: number, b: number) => number
    }
  }
}

const colorToRGB              = (c: number):      [number, number, number] => window.NLColorModel.colorToRGB(c)
const nearestColorNumberOfRGB = (r: number, g: number, b: number): number  => window.NLColorModel.nearestColorNumberOfRGB(r, g, b)

export { colorToRGB, nearestColorNumberOfRGB }
