<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'

const enableLocalConfig = ref(true)
const isMounted = ref(true)
const localConfig = computed(() => ({
  ...enableLocalConfig.value && {
    // Local Prop
    title: 'Local Title',
    // Local Attr
    data: [
      { key: 1, label: 'Local Option 1' },
      { key: 2, label: 'Local Option 2' },
    ],
    // Local Listener
    onLeftCheckChange() {
      console.log('Local LeftCheckChange')
    },
    // Local Hook
    onVnodeMounted() {
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
        modelValue="https://picsum.photos/100/100"
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
      v-bind="localConfig"
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
