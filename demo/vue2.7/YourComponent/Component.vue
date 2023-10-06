<!-- eslint-disable vue/no-v-for-template-key-on-child -->
<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { conclude, getLocalListeners, listenGlobalHooks } from 'vue-global-config'
import { globalAttrs, globalHooks, globalListeners, globalProps, globalSlots } from './index'

const props = defineProps(['title'])
const Title = computed(() => conclude([props.title, globalProps.title]))
const Attrs = computed(() => conclude([useAttrs(), globalAttrs]))
</script>

<script lang="ts">
export default {
  name: 'YourComponent',
  computed: {
    Listeners() {
      return conclude([getLocalListeners(this.$listeners), globalListeners])
    },
    Slots() {
      return conclude([this.$scopedSlots, globalSlots])
    },
  },
  created() {
    listenGlobalHooks.call(this, globalHooks)
  },
}
</script>

<template>
  <div>
    <h1>{{ Title }}</h1>

    <el-transfer
      v-bind="Attrs"
      v-on="Listeners"
    >
      <template
        v-for="(v, k) in Slots"
        #[k]="slotProps"
      >
        <!-- Global Slots -->
        <component
          :is="v(slotProps)"
          v-if="typeof v === 'function' && v.name.startsWith('#')"
          :key="k"
        />
        <!-- Local Slots -->
        <slot
          v-else
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
