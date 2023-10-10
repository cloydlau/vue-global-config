import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { version } from 'vue'
import { parse } from 'semver'
import type { SemVer } from 'semver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { PascalCasedName, name } from './package.json'

const { major, minor } = parse(version) as SemVer

export default defineConfig({
  // 为了获取 Vue.compile
  /* ...mode === 'development' && major === 2 && {
    resolve: {
      alias: {
        vue: path.resolve('./node_modules/vue/dist/vue.esm.js'),
      },
    },
  }, */
  optimizeDeps: {
    exclude: ['vue-demi'],
    include: ['kikimore > qrcode', 'kikimore > sweetalert2', 'kikimore > upng-js'],
  },
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
      ],
      output: {
        globals: {
          [name]: PascalCasedName,
          'vue': 'Vue',
          'vue-demi': 'VueDemi',
        },
      },
    },
  },
  plugins: [{
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(/\{\{ NAME \}\}/, name).replace(/\{\{ VUE_VERSION \}\}/g, String(major === 3 ? major : `${major}.${minor}`))
    },
  }, dts({ rollupTypes: true }), AutoImport({
    // targets to transform
    include: [
      /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      /\.vue$/, /\.vue\?vue/, // .vue
      /\.md$/, // .md
    ],
    // global imports to register
    imports: [
      // presets
      (major === 3 || (major === 2 && minor >= 7)) ? 'vue' : '@vue/composition-api',
    ],
  }), Components(), vue()],
})
