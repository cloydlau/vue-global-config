import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { FaFormDialog, FaImage, FaImageUpload, FaPopButton, FaPopSwitch, FaSelect } from 'faim'
import App from './App.vue'
import YourComponent from './YourComponent.vue'

Vue.use(VueCompositionAPI)
Vue.use(ElementUI)
Vue.use(FaFormDialog, {
  // 全局配置
})
Vue.use(FaImage, {
  // 全局配置
})
Vue.use(FaImageUpload, {
  // 全局配置
})
Vue.use(FaPopButton, {
  // 全局配置
})
Vue.use(FaPopSwitch, {
  // 全局配置
})
Vue.use(FaSelect, {
  // 全局配置
})
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
  '#left-footer': () => ({ render: h => h('span', undefined, 'Global Slot') }),

  // Global Scoped Slot
  '#default': ({ option }) => ({ render: h => h('span', undefined, `${option.label} (From Global Scoped Slot)`) }),
})

new Vue({
  render: h => h(App),
}).$mount('#app')
