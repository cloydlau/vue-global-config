import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { name, pascalCasedName } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
      ],
      output: {
        globals: {
          [name]: pascalCasedName,
          'vue': 'Vue',
          'vue-demi': 'VueDemi',
        },
      },
    },
  },
  plugins: [dts()],
})
