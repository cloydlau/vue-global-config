import Vue from 'vue'
import App from './App.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import GlobalComponent from './components/GlobalComponent'

Vue.use(ElementUI)
Vue.use(GlobalComponent, {
  'msg': '传给 GlobalComponent 的全局 prop',
  'placeholder': '传给 el-input 的全局 attr',
  '@blur': function () {
    console.log('传给 el-input 的全局 listener', this)
  },
  '@hook:mounted': function () {
    console.log('传给 el-input 的全局 hook', this)
  },
})

new Vue({
  render: h => h(App),
}).$mount('#app')
