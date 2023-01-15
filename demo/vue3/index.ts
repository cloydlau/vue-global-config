import { createApp, h } from 'vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import App from './App.vue'
import YourComponent from './YourComponent'

createApp(App)
  .use(ElementPlus)
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
    '@vnodeMounted': function () {
      console.log('Global Mounted')
    },
    // Global Slot
    '#left-footer': () => h('Fragment', undefined, 'Global Slot'),
    // Global Scoped Slot
    '#default': ({ option }) => h('Fragment', undefined, `${option.label} (From Global Scoped Slot)`),
  })
  .mount('#app')
