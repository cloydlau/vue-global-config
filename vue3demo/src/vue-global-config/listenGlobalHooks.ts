import { notEmpty } from 'kayran'

// 仅适用于 Vue 2
// 在 Vue 2 中，只有组件才能触发 hooks，原生元素不行
// 通过劫持 emit 来实现同时触发全局 hooks 和实例 hooks
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
