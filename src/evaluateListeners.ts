import { notEmpty } from 'kayran'
import { mapKeys } from 'lodash-es'
import { isVue3 } from 'vue-demi'
import evaluateProp from './evaluateProp'

// 将对象中的键名 '@xxx' 转换为 'onXxx'
function atToOn (obj: object) {
  return mapKeys(obj, (v: any, k: string) => {
    const keyArray = Array.from(k)
    keyArray.shift()
    keyArray[0] = keyArray[0].toUpperCase()
    keyArray.unshift('n')
    keyArray.unshift('o')
    return keyArray.join('')
  })
}

// 可以同时触发 实例事件 和 全局事件 的事件监听器
export default function evaluateListeners (
  globalEvents: { [key: string]: Function },
  // Vue 2 传 this.$listeners
  // Vue 3 传 this.$attrs
  // Vue 3 将 $listeners 移除
  // Vue 3 中事件监听器是以 on 为前缀的 attribute，为 $attrs 对象的一部分
  listeners: object
) {
  return notEmpty(globalEvents) ? evaluateProp([listeners], {
    default: isVue3 ? atToOn(globalEvents) : globalEvents,
    mergeFunction: (event, globalEvent) => (...args: any) => {
      // @ts-ignore
      event.apply(this, args)
      // @ts-ignore
      globalEvent?.apply(this, args)
    },
  }) : listeners
}
