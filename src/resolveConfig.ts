import { isVue3 } from 'vue-demi'
import { kebabToCamel } from './utils'

function atToOn(eventName: string) {
  const arr = Array.from(kebabToCamel(eventName) as string)
  arr[0] = arr[0].toUpperCase()
  arr.unshift('o', 'n')
  return arr.join('')
}

interface ResolvedResult {
  props: Record<string, any>
  attrs: Record<string, any>
  listeners: Record<string, (...args: any) => unknown>
  hooks: Record<string, (...args: any) => unknown>
  slots: Record<string, (...args: any) => unknown>
}

export default function resolveConfig(
  config: Record<string, any>,
  props: string[] | Record<string, any> = [],
): ResolvedResult {
  const res: ResolvedResult = {
    props: {},
    attrs: {},
    listeners: {},
    hooks: {},
    slots: {},
  }

  const propsList = (Array.isArray(props) ? props : Object.keys(props)).map(v => kebabToCamel(v))

  for (const k in config) {
    if (k.startsWith('@')) {
      const eventName = k.substring(1)
      if (isVue3) {
        // Vue 3
        // @xxx → onXxx
        if (eventName.startsWith('vue:')) {
          res.hooks[atToOn(eventName.replace('vue:', 'vnode-'))] = config[k]
        } else if (eventName.startsWith('vnode')) {
          res.hooks[atToOn(eventName)] = config[k]
        } else {
          res.listeners[atToOn(eventName)] = config[k]
        }
      } else {
        // Vue 2
        // @xxx → xxx
        if (eventName.startsWith('hook:')) {
          res.hooks[eventName] = config[k]
        } else {
          res.listeners[eventName] = config[k]
        }
      }
    } else if (k.startsWith('#')) {
      /**
       * Vue 2.6/2.7
       *   通过 <slot> 接收插槽
       *     $slots：只有非作用域插槽，属性为数组类型
       *     $scopedSlots：包含所有插槽，属性为函数类型，函数名为 normalized
       *   通过 <component :is=""> 接收插槽
       *     string：组件名
       *     ComponentDefinition (直接书写或导入的 SFC、Vue.compile 的返回值)：POJO 类型
       *     ComponentConstructor (Vue.extend)：函数类型，函数名为 VueComponent
       * Vue 3
       *   通过 <slot> 接收插槽
       *     $slots：属性为函数类型，函数名为 renderFnWithContext
       *   通过 <component :is=""> 接收插槽
       *     string：组件名
       *     Component (直接书写或导入的 SFC)：POJO 类型
       *     虚拟 DOM (渲染函数 h/createVNode 的返回值)：POJO 类型
       */
      const slotName = k.substring(1)
      if (slotName) {
        res.slots[slotName] = config[k]
      }
    } else {
      const camelizedKey = kebabToCamel(k)
      if (propsList.includes(camelizedKey)) {
        res.props[k] = camelizedKey
      } else {
        res.attrs[k] = config[k]
      }
    }
  }

  return res
}
