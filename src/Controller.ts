import type { Express, Request, Response } from "express"

import express           from "express"
import path              from "path"
import { fileURLToPath } from "url"

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

const app: Express = express()

app.get("/", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../../html/index.html`))
})

app.get("/stylesheets/main.css", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../../stylesheets/main.css`))
})

app.get("/stylesheets/main/main.css", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../../stylesheets/main.css`))
})

app.get("/javascripts/Main.js", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../typescripts/Main.js`))
})

app.get("/javascripts/ColorModel.js", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../typescripts/ColorModel.js`))
})

app.get("/javascripts/DOM.js", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../typescripts/DOM.js`))
})

app.get("/deps/nl-color-model.js", (_: Request, res: Response) => {
  res.sendFile(path.resolve(`${__dirname_}/../../deps/nl-color-model.js`))
})

const port     = 8007
const onLaunch = (): void => { console.log(`Server is running at https://localhost:${port}`) }
app.listen(port, onLaunch);
