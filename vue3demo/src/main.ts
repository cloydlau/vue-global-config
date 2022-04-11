import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'

import Parent from './components/Parent'

createApp(App)
.use(ElementPlus)
.use(Parent, {
  'parentProp': '传给 Parent 的全局 prop',
  'childAttr': '传给 Child 的全局 attr',
  '@childEvent' () {ElMessage.info('传给 Child 的全局 event')},
  '@vnodeMounted' () {ElMessage.info('Parent 的全局 hook')},
})
.mount('#app')
