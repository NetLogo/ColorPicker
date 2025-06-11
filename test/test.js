import { Blue, Cyan, Lime, Magenta, Orange, Violet, Yellow                        } from "picker/color/ColorLiteral.js"
import { GUI_HSLA, Hexadecimal, HSB, HSBA, HSL, HSLA, NLNumber, NLWord, RGB, RGBA } from "picker/color/Representation.js"

const testColors =
  [
    [ Hexadecimal.parse("#b8860b")
    , new RGB(184, 134, 11)
    , new RGBA(184, 134, 11, 100)
    , new HSL(42.7, 88.7, 38.2)
    , new HSLA(42.7, 88.7, 38.2, 100)
    , new NLNumber(43.2)
    , new NLWord(Yellow, -1.8)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#ff5733")
    , new RGB(255, 87, 51)
    , new RGBA(255, 87, 51, 100)
    , new HSL(10.6, 100, 60)
    , new HSLA(10.6, 100, 60, 100)
    , new NLNumber(25)
    , new NLWord(Orange)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#33ff57")
    , new RGB(51, 255, 87)
    , new RGBA(51, 255, 87, 100)
    , new HSL(130.6, 100, 60)
    , new HSLA(130.6, 100, 60, 100)
    , new NLNumber(65.6)
    , new NLWord(Lime, 0.6)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#3357ff")
    , new RGB(51, 87, 255)
    , new RGBA(51, 87, 255, 100)
    , new HSL(229.4, 100, 60)
    , new HSLA(229.4, 100, 60, 100)
    , new NLNumber(105.3)
    , new NLWord(Blue, 0.3)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#ff33a8")
    , new RGB(255, 51, 168)
    , new RGBA(255, 51, 168, 100)
    , new HSL(325.6, 100, 60)
    , new HSLA(325.6, 100, 60, 100)
    , new NLNumber(126.2)
    , new NLWord(Magenta, 1.2)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#a833ff")
    , new RGB(168, 51, 255)
    , new RGBA(168, 51, 255, 100)
    , new HSL(274.4, 100, 60)
    , new HSLA(274.4, 100, 60, 100)
    , new NLNumber(115.5)
    , new NLWord(Violet, 0.5)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#33fff6")
    , new RGB(51, 255, 246)
    , new RGBA(51, 255, 246, 100)
    , new HSL(177.4, 100, 60)
    , new HSLA(177.4, 100, 60, 100)
    , new NLNumber(85.2)
    , new NLWord(Cyan, 0.2)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#f6ff33")
    , new RGB(246, 255, 51)
    , new RGBA(246, 255, 51, 100)
    , new HSL(62.6, 100, 60)
    , new HSLA(62.6, 100, 60, 100)
    , new NLNumber(45.3)
    , new NLWord(Yellow, 0.3)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  , [ Hexadecimal.parse("#ff8f33")
    , new RGB(255, 143, 51)
    , new RGBA(255, 143, 51, 100)
    , new HSL(27.1, 100, 60)
    , new HSLA(27.1, 100, 60, 100)
    , new NLNumber(25.9)
    , new NLWord(Orange, 0.9)
    , new GUI_HSLA(0, 0, 0, 0)
    ]
  ];

test("Hexadecimal converts to RGB", () => {
  //expect(2 + 2).toBe(4);
  expect(true).toBe(false);
});

test("Hexadecimal converts to RGBA", () => {
  //expect().toBe(4);
});
