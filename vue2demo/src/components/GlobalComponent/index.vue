<template>
  <div>
    <h2>Msg：{{ Msg }}</h2>
    <el-input v-bind="Attrs" v-on="Listeners"/>
  </div>
</template>

<script>
import { globalProps, globalAttrs, globalEvents, globalHooks } from './index'
import { evaluateProp } from '../../vue-global-config'

export default {
  name: 'GlobalComponent',
  props: ['msg'],
  data () {
    // 非必须：给 globalHooks 绑定 this，以便在全局配置中访问 this
    for (const k in globalHooks) {
      globalHooks[k] = globalHooks[k].bind(this)
    }

    return {
      globalHooks,
    }
  },
  computed: {
    Msg () {
      return evaluateProp([this.msg, globalProps.msg])
    },
    Attrs () {
      return evaluateProp([this.$attrs], {
        default: globalAttrs,
        // mergeFunction 的作用是让全局 events 和实例 events 都执行，互不冲突
        // 如果想让实例 events 覆盖全局 events，则不需要 mergeFunction
        mergeFunction: (localEvent, globalEvent) => (...args) => {
          localEvent(args)
          globalEvent?.(args)
        },
      })
    },
    Listeners () {
      // 非必须：给 globalEvents 绑定 this，以便在全局配置中访问 this
      for (const k in globalEvents) {
        globalEvents[k] = globalEvents[k].bind(this)
      }

      return evaluateProp([this.$listeners], {
        default: { ...globalEvents, ...globalHooks },
        // mergeFunction 的作用是让全局 events 和实例 events 都执行，互不冲突
        // 如果想让实例 events 覆盖全局 events，则不需要 mergeFunction
        mergeFunction: (localEvent, globalEvent) => (...args) => {
          localEvent(args)
          globalEvent?.(args)
        },
      })
    }
  },
}
</script>
