<script>
export default {
  data() {
    return {
      enableLocalConfig: true,
      isMounted: true,
    }
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
  },
  watch: {
    enableLocalConfig() {
      this.isMounted = false
      this.$nextTick(() => {
        this.isMounted = true
      })
    },
  },
}
</script>

<template>
  <FaFormDialog
    show
  >
    <p>
      <FaImage
        value="https://picsum.photos/100/100"
        qrcode
      />
    </p>
    <p>
      <FaImageUpload />
    </p>
    <p>
      <FaPopSwitch
        v-model="enableLocalConfig"
        inline-prompt
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
  </FaFormDialog>
</template>
