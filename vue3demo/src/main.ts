import { createApp } from 'vue'
import App from './App.vue'
import GlobalComponent from './components/GlobalComponent'

createApp(App)
.use(GlobalComponent, {
  msg: '来自全局的 prop',
  abc: '来自全局的 attr',
  '@change' () {console.log('来自全局的 event')},
})
.mount('#app')
