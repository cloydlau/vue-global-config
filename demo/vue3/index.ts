import { createApp, h } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import YourComponent from './YourComponent'

createApp(App)
  .use(ElementPlus)
  .use(YourComponent, {
    // global prop
    'title': 'Global Title',
    // global attr
    'data': [
      { key: 1, label: 'Global Option 1' },
      { key: 2, label: 'Global Option 2' },
    ],
    // global listener
    '@change': function () { console.log('Global Change') },
    // global hook
    '@vnodeMounted': function () { console.log('Global Mounted') },
    // global slot
    '#left-footer': () => h('Fragment', null, 'Global Slot'),
    // global scoped slot
    '#default': ({ option }) => h('Fragment', null, `${option.label} (From Global Scoped Slot)`),
  })
  .mount('#app')
