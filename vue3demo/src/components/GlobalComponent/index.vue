<template>
  <div>
    {{ Msg }}
    {{ Attrs.abc }}
  </div>
  <button @click="() => {
    $emit('change', 123)
  }">emit
  </button>
</template>

<script>
import { globalProps, globalAttrs, globalEvents } from './index'
import { evaluateProp, evaluateAttrs } from '../../vue-global-config'

export const props = {
  msg: String,
}

export default {
  name: 'GlobalComponent',
  props,
  data () {
    return {}
  },
  computed: {
    Msg () {
      return evaluateProp([this.msg, globalProps.msg])
    },
    Attrs () {
      return evaluateAttrs.call(this, [this.$attrs, { ...globalAttrs, ...globalEvents }])
    },
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

</style>
