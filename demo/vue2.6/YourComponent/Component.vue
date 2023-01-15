<!-- eslint-disable vue/no-v-for-template-key-on-child -->
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

<script>
import { conclude, getLocalListeners, listenGlobalHooks } from '../../../src'
import { globalAttrs, globalHooks, globalListeners, globalProps, globalSlots } from './index'

export default {
  name: 'YourComponent',
  props: ['title'],
  computed: {
    Listeners() {
      return conclude([getLocalListeners(this.$listeners), globalListeners])
    },
    Title() {
      return conclude([this.title, globalProps.title])
    },
    Attrs() {
      return conclude([this.$attrs, globalAttrs])
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

<style scoped>
::v-deep .el-transfer-panel {
  width: 360px !important;
}
</style>
