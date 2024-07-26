import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build  : {
    lib: {
      entry   : 'src/sref.ts',
      name    : 'sRef',
      fileName: 'sref',
    },
  },
})
