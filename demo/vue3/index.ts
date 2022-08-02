import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import GlobalComponent from './components/GlobalComponent'

createApp(App)
  .use(ElementPlus)
  .use(GlobalComponent, {
    'msg': '传给 GlobalComponent 的全局 prop',
    'placeholder': '传给 el-input 的全局 attr',
    '@blur': function () {
      console.log('传给 el-input 的全局 listener', this)
    },
    '@vnodeMounted': function () {
      console.log('传给 GlobalComponent 的全局 hook', this)
    },
  })
  .mount('#app')
