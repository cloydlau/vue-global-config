<template>
  <div v-bind="globalHooks">
    <h1>权衡后的 prop：{{ ParentProp }}</h1>
    <Child v-bind="Attrs"/>
  </div>
</template>

<script>
import { globalProps, globalAttrs, globalEvents, globalHooks } from './index'
import { evaluateProp } from '../../vue-global-config'
import Child from './Child.vue'

export default {
  name: 'Parent',
  components: { Child },
  props: ['parentProp'],
  data () {
    return {
      console,
      globalHooks
    }
  },
  computed: {
    ParentProp () {
      return evaluateProp([this.parentProp, globalProps.parentProp])
    },
    // 在 Vue 3 中，this.$attrs 同时包含了 attrs 和 事件
    // Attrs 是【全局 attrs 和实例 attrs 的权衡结果】+【全局事件和实例事件的权衡结果】
    Attrs () {
      return evaluateProp([this.$attrs], {
        default: { ...globalAttrs, ...globalEvents },
        // mergeFunction 的作用是让全局事件和实例事件都执行，互不冲突
        // 如果想让实例事件覆盖全局事件，则不需要 mergeFunction
        mergeFunction: (event, globalEvent) => (...args) => {
          event.apply(this, args)
          globalEvent?.apply(this, args)
        },
      })
    },
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

</style>
