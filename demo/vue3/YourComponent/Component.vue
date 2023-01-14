<template>
  <div v-bind="globalHooks">
    <h1>{{ Title }}</h1>

    <el-transfer v-bind="Attrs">
      <!-- Place global slots in front of local slots so that local slots get higher priority -->
      <template
        v-for="(v, k) in globalSlots"
        #[k]="slotProps"
      >
        <component :is="v(slotProps)" />
      </template>
      <template
        v-for="(v, k) in slots"
        #[k]="slotProps"
      >
        <slot
          :name="k"
          v-bind="slotProps"
        />
      </template>
    </el-transfer>
  </div>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'
import { globalProps, globalAttrs, globalListeners, globalHooks, globalSlots } from './index'
import { conclude } from '../../../src'

const props = defineProps(['title'])
const Title = computed(() => conclude([props.title, globalProps.title]))
const Attrs = computed(() => conclude([useAttrs(), globalAttrs, globalListeners]))

console.log(globalListeners)
const slots = useSlots()
</script>

<script lang="ts">
export default {
  name: 'YourComponent',
}
</script>

<style scoped>
:deep(.el-transfer-panel) {
  width: 360px !important;
}
</style>
