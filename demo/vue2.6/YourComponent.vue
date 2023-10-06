<!-- eslint-disable vue/no-v-for-template-key-on-child -->
<script>
import { conclude, getLocalListeners, listenGlobalHooks, resolveConfig } from 'vue-global-config'

const globalProps = {}
const globalAttrs = {}
const globalListeners = {}
const globalHooks = {}
const globalSlots = {}

export default {
  name: 'YourComponent',
  install(app, options = {}) {
    const { props, attrs, listeners, hooks, slots } = resolveConfig(options, this.props)
    Object.assign(globalProps, props)
    Object.assign(globalAttrs, attrs)
    Object.assign(globalListeners, listeners)
    Object.assign(globalHooks, hooks)
    Object.assign(globalSlots, slots)
    app.component(this.name, this)
  },
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
::v-deep .el-transfer-panel {
  width: 360px !important;
}
</style>
