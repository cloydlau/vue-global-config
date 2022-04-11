import { notEmpty } from 'kayran'
import { mapKeys } from 'lodash-es'
import { isVue3 } from 'vue-demi'
import evaluateProp from './evaluateProp'

// 将对象中的键名 '@xxx' 转换为 'onXxx'
function atToOn (obj: object) {
  return mapKeys(obj, (v: any, k: string) => {
    if (k.startsWith('@')) {
      const keyArray = Array.from(k)
      keyArray.shift()
      keyArray[0] = keyArray[0].toUpperCase()
      keyArray.unshift('n')
      keyArray.unshift('o')
      return keyArray.join('')
    } else {
      return k
    }
  })
}

// 可以同时触发 实例事件 和 全局事件 的事件监听器
// Vue 3 将 $listeners 移除
// Vue 3 中事件监听器是以 on 为前缀的 attribute，为 $attrs 对象的一部分
export default function evaluateAttrs (sources: [object, object]) {
  const [attrs, globalAttrs] = sources
  return notEmpty(globalAttrs) ? evaluateProp([attrs], {
    default: isVue3 ? atToOn(globalAttrs) : globalAttrs,
    mergeFunction: (event, globalEvent) => (...args: any) => {
      event.apply(this, args)
      globalEvent?.apply(this, args)
    },
  }) : attrs
}
