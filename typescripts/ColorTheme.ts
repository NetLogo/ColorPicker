type ColorThemeConfig = Partial<ColorTheme>

interface ColorTheme {
  dialogBackground:        string;
  dialogText:              string;
  tabBackground:           string;
  tabBackgroundHover:      string;
  tabBackgroundSelected:   string;
  tabBorder:               string;
  tabText:                 string;
  tabTextSelected:         string;
  controlBackground:       string;
  controlBackgroundHover:  string;
  controlBackgroundActive: string;
  controlBorder:           string;
  controlText:             string;
  dropdownArrow:           string;
}

const defaultTheme: ColorTheme =
  { dialogBackground:        "#dcdcdc"
  , dialogText:              "black"
  , tabBackground:           "#f0f0f0"
  , tabBackgroundHover:      "#d3d3d3"
  , tabBackgroundSelected:   "#aaaaaa"
  , tabBorder:               "black"
  , tabText:                 "black"
  , tabTextSelected:         "black"
  , controlBackground:       "white"
  , controlBackgroundActive: "#0091ff"
  , controlBackgroundHover:  "#d3d3d3"
  , controlBorder:           "black"
  , controlText:             "black"
  , dropdownArrow:           "black"
  }

const applyTheme = (theme: ColorThemeConfig, element: HTMLElement): void => {

  const t   = { ...defaultTheme, ...theme }
  const set = (k: string, v: string) => element.style.setProperty(k, v)

  set("--dialog-background"        , t.dialogBackground       )
  set("--dialog-text"              , t.dialogText             )
  set("--tab-background"           , t.tabBackground          )
  set("--tab-background-hover"     , t.tabBackgroundHover     )
  set("--tab-background-selected"  , t.tabBackgroundSelected  )
  set("--tab-border"               , t.tabBorder              )
  set("--tab-text"                 , t.tabText                )
  set("--tab-text-selected"        , t.tabTextSelected        )
  set("--control-background"       , t.controlBackground      )
  set("--control-background-active", t.controlBackgroundActive)
  set("--control-background-hover" , t.controlBackgroundHover )
  set("--control-border"           , t.controlBorder          )
  set("--control-text"             , t.controlText            )
  set("--dropdown-arrow"           , t.dropdownArrow          )

}

export { applyTheme }

export type { ColorTheme, ColorThemeConfig }
