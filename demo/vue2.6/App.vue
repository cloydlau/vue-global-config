<template>
  <el-dialog
    visible
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="90%"
  >
    <p>
      <el-switch
        v-model="enableLocalConfig"
        active-text="Enable Local Config"
        inactive-text="Disable Local Config"
      />
    </p>
    <YourComponent
      v-if="isMounted"
      v-bind="localPropsAndAttrs"
      v-on="localListeners"
    >
      <!-- Local Slot -->
      <template
        v-if="enableLocalConfig"
        #left-footer
      >
        Local Slot
      </template>
      <!-- Local Scoped Slot -->
      <template
        v-if="enableLocalConfig"
        #default="{ option }"
      >
        {{ option.label }} (From Local Scoped Slot)
      </template>
    </YourComponent>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      enableLocalConfig: true,
      isMounted: true,
    }
  },
  watch: {
    enableLocalConfig(n) {
      this.isMounted = false
      this.$nextTick(() => {
        this.isMounted = true
      })
    },
  },
  computed: {
    localPropsAndAttrs() {
      return {
        ...this.enableLocalConfig && {
          // Local Prop
          title: 'Local Title',
          // Local Attr
          data: [
            { key: 1, label: 'Local Option 1' },
            { key: 2, label: 'Local Option 2' },
          ],
        },
      }
    },
    localListeners() {
      return {
        ...this.enableLocalConfig && {
          // Local Listener
          'left-check-change': function () {
            console.log('Local LeftCheckChange')
          },
          // Local Hook
          'hook:mounted': function () {
            console.log('Local Mounted')
          },
        },
      }
    },
  }
}
</script>
