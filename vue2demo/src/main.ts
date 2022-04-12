import Vue from 'vue'
import VueCompositionAPI, { createApp, h } from '@vue/composition-api'

import App from './App.vue'

Vue.use(VueCompositionAPI)

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import GlobalComponent from './components/GlobalComponent'
Vue.use(GlobalComponent, {
  'msg': '传给 GlobalComponent 的全局 prop',
  'placeholder': '传给 el-input 的全局 attr',
  '@blur' () {
    console.log('传给 el-input 的全局 event', this)
  },
  '@hook:mounted' () {
    console.log('传给 GlobalComponent 的全局 hook', this)
  },
})

const app = createApp({
  render: () => h(App)
})

app.mount('#app')
