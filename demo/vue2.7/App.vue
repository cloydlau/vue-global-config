<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const enableLocalConfig = ref(true)
const isMounted = ref(true)
const localPropsAndAttrs = computed(() => ({
  ...enableLocalConfig.value && {
    // Local Prop
    title: 'Local Title',
    // Local Attr
    data: [
      { key: 1, label: 'Local Option 1' },
      { key: 2, label: 'Local Option 2' },
    ],
  },
}))

const localListeners = computed(() => ({
  ...enableLocalConfig.value && {
    // Local Listener
    'left-check-change': function () {
      console.log('Local LeftCheckChange')
    },
    // Local Hook
    'hook:mounted': function () {
      console.log('Local Mounted')
    },
  },
}))

watch(enableLocalConfig, (n) => {
  isMounted.value = false
  nextTick(() => {
    isMounted.value = true
  })
})
</script>

<template>
  <KiFormDialog
    show
  >
    <p>
      <KiImage
        value="https://picsum.photos/100/100"
        qrcode
      />
    </p>
    <p>
      <KiImageUpload />
    </p>
    <p>
      <KiPopSwitch
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
  </KiFormDialog>
</template>
