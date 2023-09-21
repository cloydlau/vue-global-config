import Vue from 'vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import App from './App.vue'
import YourComponent from './YourComponent'

Vue.use(ElementUI)
Vue.use(YourComponent, {
  // Global Prop
  'title': 'Global Title',

  // Global Attr
  'data': [
    { key: 1, label: 'Global Option 1' },
    { key: 2, label: 'Global Option 2' },
  ],

  // Global Listener
  '@left-check-change': function () {
    console.log('Global LeftCheckChange')
  },

  // Global Hook
  '@hook:mounted': function () {
    console.log('Global Mounted')
  },

  // Global Slot
  // '#left-footer': () => ({ render: h => h('span', undefined, 'Global Slot') }),
  '#left-footer': () => Vue.compile('<span>Global Slot From Vue.compile</span>'),

  // Global Scoped Slot
  '#default': ({ option }) => ({ render: h => h('span', undefined, `${option.label} (From Global Scoped Slot)`) }),
})

new Vue({
  render: h => h(App),
}).$mount('#app')
