import { defineConfig } from 'vite'
import { name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name,
      entry: 'src/main.ts'
    },
  }
})
