<template>
  <div v-bind="globalHooks">
    <h2>Msg：{{ Msg }}</h2>
    <el-input v-bind="Attrs"/>
  </div>
</template>

<script>
export default {
  name: 'GlobalComponent',
}
</script>

<script setup>
import { getCurrentInstance, computed, useAttrs } from 'vue'
import { globalProps, globalAttrs, globalEvents, globalHooks } from './index'
import { evaluateProp } from '../../vue-global-config'

const currentInstance = getCurrentInstance()

/**
 * props
 */
const props = defineProps(['msg'])
const Msg = computed(() => evaluateProp([props.msg, globalProps.msg]))

/**
 * attrs & events
 */
// 给 globalEvents 绑定 this，以便在全局配置中访问 currentInstance
for (const k in globalEvents) {
  globalEvents[k] = globalEvents[k].bind(currentInstance)
}
const Attrs = computed(() => evaluateProp([useAttrs()], {
  // 在 Vue 3 中，attrs 同时包含了 attrs 和 events
  default: { ...globalAttrs, ...globalEvents },
  // mergeFunction 的作用是让全局 events 和实例 events 都执行，互不冲突
  // 如果想让实例 events 覆盖全局 events，则不需要 mergeFunction
  mergeFunction: (localEvent, globalEvent) => (...args) => {
    localEvent(args)
    globalEvent?.(args)
  },
}))

/**
 * hooks
 */
// 给 globalHooks 绑定 this，以便在全局配置中访问 currentInstance
for (const k in globalHooks) {
  globalHooks[k] = globalHooks[k].bind(currentInstance)
}
</script>
