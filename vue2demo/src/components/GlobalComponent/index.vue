<template>
  <div>
    <h2>Msg：{{ Msg }}</h2>
    <!-- v-on="Listeners" 的作用： -->
    <!-- 将在父级组件（GlobalComponent）绑定的事件处理方法传递给 el-input -->
    <!-- 当 el-input 触发了对应的事件时，这些方法将被调用 -->
    <el-input v-bind="Attrs" v-on="Listeners"/>
  </div>
</template>

<script>
import { globalProps, globalAttrs, globalListeners, globalHooks } from './index'
import { conclude, getLocalListeners, listenGlobalHooks } from 'vue-global-config'

export default {
  name: 'GlobalComponent',
  props: ['msg'],
  computed: {
    Msg () {
      return conclude([this.msg, globalProps.msg])
    },
    Attrs () {
      return conclude([this.$attrs, globalAttrs])
    },
    Listeners () {
      for (const k in globalListeners) {
        globalListeners[k] = globalListeners[k].bind(this)
      }
      return conclude([getLocalListeners(this.$listeners)], {
        default: globalListeners,
        mergeFunction: (localEventListener, globalEventListener) => (...args) => {
          localEventListener(args)
          globalEventListener?.(args)
        },
      })
    }
  },
  created () {
    // 监听全局 hooks
    listenGlobalHooks.call(this, globalHooks)
  },
}
</script>
