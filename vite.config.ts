import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig(({ mode }) => {
  if (mode === 'inlined') {
    return {
      build: {
        outDir: 'dist/inlined',
      },
      plugins: [viteSingleFile({
        deleteInlinedFiles: true
      })]
    }
  }
  return {}
})