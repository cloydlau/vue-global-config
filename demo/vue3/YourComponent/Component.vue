<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'
import { conclude } from 'vue-global-config'
import { globalAttrs, globalHooks, globalListeners, globalProps, globalSlots } from './index'

const props = defineProps(['title'])
const Title = computed(() => conclude([props.title, globalProps.title]))
const Attrs = computed(() => conclude([useAttrs(), globalAttrs, globalListeners]))
const slots = useSlots()
</script>

<script lang="ts">
export default {
  name: 'YourComponent',
}
</script>

<template>
  <div v-bind="globalHooks">
    <h1>{{ Title }}</h1>

    <el-transfer v-bind="Attrs">
      <!-- Place global Slots in front of local Slots so that local Slots get higher priority -->
      <!-- Global Slots -->
      <template
        v-for="(v, k) in globalSlots"
        #[k]="slotProps"
        :key="k"
      >
        <component :is="v(slotProps)" />
      </template>
      <!-- Local Slots -->
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

<style scoped>
:deep(.el-transfer-panel) {
  width: 360px !important;
}
</style>
