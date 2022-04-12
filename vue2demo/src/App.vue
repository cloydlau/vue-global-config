<template>
  <div>
    <p>
      传递实例参数：
      <el-switch v-model="enableLocalConfig"/>
    </p>
    <GlobalComponent
      v-bind="localPropsAndAttrs"
      v-on="localEventsAndHooks"
      v-if="mount"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      enableLocalConfig: true,
      mount: true,
    }
  },
  computed: {
    localPropsAndAttrs () {
      return this.enableLocalConfig ? {
        'msg': '传给 GlobalComponent 的实例 prop',
        'placeholder': '传给 el-input 的实例 attr',
      } : {}
    },
    localEventsAndHooks () {
      return this.enableLocalConfig ? {
        'blur' () {
          console.log('传给 el-input 的实例 event', this)
        },
        'hook:mounted' () {
          console.log('传给 el-input 的实例 hook', this)
        },
      } : {}
    }
  },
  watch: {
    enableLocalConfig () {
      // 重载 GlobalComponent
      this.mount = false
      this.$nextTick(() => {
        this.mount = true
      })
    }
  }
}
</script>
