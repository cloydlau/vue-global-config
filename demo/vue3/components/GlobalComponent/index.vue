<template>
  <div v-bind="globalHooks">
    <h2>Msg：{{ Msg }}</h2>
    <el-input v-bind="Attrs" />
  </div>
</template>

<script>
</script>

<script setup>
import { computed, getCurrentInstance, useAttrs } from 'vue'
import { conclude } from '../../../../src'
import { globalAttrs, globalHooks, globalListeners, globalProps } from './index'
/**
 * props
 */
const props = defineProps(['msg'])
export default {
  name: 'GlobalComponent',
}
// import { conclude } from 'vue-global-config'

/* defineOptions({
  name: 'GlobalComponent',
}) */

const currentInstance = getCurrentInstance()

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
    localEventListener(...args)
    globalEventListener(...args)
  },
}))

/**
 * hooks
 */
for (const k in globalHooks) {
  globalHooks[k] = globalHooks[k].bind(currentInstance)
}
</script>
