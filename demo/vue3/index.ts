import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import { FaFormDialog, FaImage, FaImageUpload, FaPopButton, FaPopSwitch, FaSelect } from 'faim'
import { createApp } from 'vue'
import App from './App.vue'
import YourComponent from './YourComponent'
import 'element-plus/dist/index.css'

const app = createApp(App)
  .use(ElementPlus)
  .use(FaFormDialog, {
    // 全局配置
    width: `${window.outerWidth / 2}px`,
  })
  .use(FaImage, {
    // 全局配置
  })
  .use(FaImageUpload, {
    // 全局配置
  })
  .use(FaPopButton, {
    // 全局配置
  })
  .use(FaPopSwitch, {
    // 全局配置
  })
  .use(FaSelect, {
    // 全局配置
  })
  .use(YourComponent, {
    // Global Prop
    'title': 'Global Title',

    // Global Attr
    'data': [
      { key: 1, label: 'Global Option 1' },
      { key: 2, label: 'Global Option 2' },
    ],

    // Global Listener
    '@leftCheckChange': function () {
      console.log('Global LeftCheckChange')
    },

    // Global Hook
    '@vue:mounted': function () {
      console.log('Global Mounted (from @vue:mounted)')
    },

    // Global Hook
    'onVnodeMounted': function () {
      console.log('Global Mounted (from onVnodeMounted)')
    },

    // Global Slot
    '#left-footer': () => h('Fragment', undefined, 'Global Slot'),

    // Global Scoped Slot
    '#default': ({ option }) => h('Fragment', undefined, `${option.label} (From Global Scoped Slot)`),
  })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
