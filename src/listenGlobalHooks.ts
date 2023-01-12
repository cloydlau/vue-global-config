// Only for Vue 2
// In Vue 2, only components can trigger hooks, not native elements
// Hijack `emit` to trigger both global hooks and instance hooks

import type { ComponentPublicInstance } from 'vue-demi'

export default function listenGlobalHooks(this: ComponentPublicInstance, globalHooks: Record<string, any>) {
  if (Object.getOwnPropertyNames(globalHooks || {}).length) {
    const originalEmit = this.$emit
    this.$emit = function (...args) {
      originalEmit.apply(this, args)
      const [eventName, ...eventArgs] = args
      globalHooks[eventName]?.apply(this, eventArgs)
    }
  }
}
