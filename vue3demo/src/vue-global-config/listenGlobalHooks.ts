//import { isVue3 } from 'vue-demi'
import { notEmpty } from 'kayran'

// 仅用于 Vue 2，Vue 3 不支持 @hook:xxx
export default function listenGlobalHooks (globalHooks: { [key: string]: any }) {
  if (notEmpty(globalHooks)) {
    const originalEmit = this.$emit
    this.$emit = function () {
      originalEmit.apply(this, arguments)
      const [eventName, ...args] = arguments
      globalHooks[eventName]?.apply(this, args)
    }
  }
}
