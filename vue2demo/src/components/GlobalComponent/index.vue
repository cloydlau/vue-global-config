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
import { globalProps, globalAttrs, globalEvents, globalHooks } from './index'
import { conclude, listenGlobalHooks } from '../../vue-global-config'

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
      // 非必须：给 globalEvents 绑定 this，以便在全局配置中访问 this
      for (const k in globalEvents) {
        globalEvents[k] = globalEvents[k].bind(this)
      }

      console.log(this.$listeners)

      return conclude([this.$listeners], {
        default: globalEvents,
        // mergeFunction 的作用是让全局 events 和实例 events 都执行，互不冲突
        // 如果想让实例 events 覆盖全局 events，则不需要 mergeFunction
        mergeFunction: (localEvent, globalEvent) => (...args) => {
          localEvent(args)
          globalEvent?.(args)
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
