import { notEmpty } from 'kayran'
import { getFinalProp as evaluateProp } from 'kayran'
import { mapKeys } from 'lodash-es'

// 可以同时触发实例事件和全局事件的事件监听器
// 仅用于 Vue 2，Vue 3 将 $listeners 移除
export function evaluateListeners (globalEvents: { [key: string]: Function }) {
  return notEmpty(globalEvents) ? evaluateProp([this.$listeners], {
    default: globalEvents,
    mergeFunction: (event, globalEvent) => (...args) => {
      event.apply(this, args)
      globalEvent?.apply(this, args)
    },
  }) : this.$listeners
}

// 仅用于 Vue 3，Vue 3 中事件监听器是以 on 为前缀的 attribute，即 $attrs 对象的一部分
export function evaluateAttrs (globalEvents: { [key: string]: Function }, attrs: object) {
  const GlobalEvents = mapKeys(globalEvents, (v: any, k: string) => {
    const keyArray = Array.from(k)
    keyArray.shift()
    keyArray[0] = keyArray[0].toUpperCase()
    keyArray.unshift('n')
    keyArray.unshift('o')
    return keyArray.join('')
  })

  return notEmpty(globalEvents) ? evaluateProp([attrs], {
    default: GlobalEvents,
    mergeFunction: (event, globalEvent) => (...args) => {
      event.apply(this, args)
      globalEvent?.apply(this, args)
    },
  }) : attrs
}
