<template>
  <el-dialog
    modelValue
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="90%"
  >
    <p>
      <el-switch
        v-model="enableLocalConfig"
        inline-prompt
        active-text="Enable Local Config"
        inactive-text="Disable Local Config"
      />
    </p>
    <YourComponent
      v-if="mount"
      v-bind="localConfig"
    >
      <!-- local slot -->
      <template
        #left-footer
        v-if="enableLocalConfig"
      >
        Local Slot
      </template>
      <!-- local scoped slot -->
      <template
        #default="{ option }"
        v-if="enableLocalConfig"
      >
        {{ option.label }} (From Local Scoped Slot)
      </template>
    </YourComponent>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'

const enableLocalConfig = ref(true)
const mount = ref(true)
const localConfig = computed(() =>
  enableLocalConfig.value
    ? {
      // local prop
      'title': 'Local Title',
      // local attr
      'data': [
        { key: 1, label: 'Local Option 1' },
        { key: 2, label: 'Local Option 2' },
      ],      // local listener
      'onChange': function () {
        console.log('Local Change')
      },
      // local hook
      'onVnodeMounted': function () {
        console.log('Local Mounted')
      },
    }
    : {},
)

watch(enableLocalConfig, (n) => {
  // Reload YourComponent
  mount.value = false
  nextTick(() => {
    mount.value = true
  })
})
</script>
