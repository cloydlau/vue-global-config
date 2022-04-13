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
import { globalProps, globalAttrs, globalListeners, globalHooks } from './index'
import { conclude } from '../../vue-global-config'

const currentInstance = getCurrentInstance()

/**
 * props
 */
const props = defineProps(['msg'])
const Msg = computed(() => conclude([props.msg, globalProps.msg]))

/**
 * attrs & listeners
 */
for (const k in globalListeners) {
  globalListeners[k] = globalListeners[k].bind(currentInstance)
}
const Attrs = computed(() => conclude([useAttrs()], {
  default: { ...globalAttrs, ...globalListeners },
  mergeFunction: (localEventListener, globalEventListener) => (...args) => {
    localEventListener(args)
    globalEventListener?.(args)
  },
}))

/**
 * hooks
 */
for (const k in globalHooks) {
  globalHooks[k] = globalHooks[k].bind(currentInstance)
}
</script>
