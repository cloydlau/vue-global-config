<template>
  <p>
    传递实例参数：
    <el-switch v-model="enableLocalConfig" />
  </p>
  <GlobalComponent v-if="mount" v-bind="localConfig" />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const enableLocalConfig = ref(true)
const mount = ref(true)
const localConfig = computed(() =>
  enableLocalConfig.value
    ? {
        msg: '传给 GlobalComponent 的实例 prop',
        placeholder: '传给 el-input 的实例 attr',
        onBlur() {
          console.log('传给 el-input 的实例 listener', this)
        },
        onVnodeMounted() {
          console.log('传给 GlobalComponent 的实例 hook', this)
        },
      }
    : {},
)

watch(enableLocalConfig, (n, o) => {
  // 重载 GlobalComponent
  mount.value = false
  nextTick(() => {
    mount.value = true
  })
})
</script>
