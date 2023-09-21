import { isVue3 } from 'vue-demi'

function atToOn(eventName: string) {
  const keyArray = Array.from(eventName)
  keyArray[0] = keyArray[0].toUpperCase()
  keyArray.unshift('n')
  keyArray.unshift('o')
  return keyArray.join('')
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

  const propsList = Array.isArray(props) ? props : Object.keys(props)

  for (const k in config) {
    if (k.startsWith('@')) {
      const eventName = k.substring(1)
      if (isVue3) {
        if (eventName.startsWith('vnode')) {
          res.hooks[atToOn(eventName)] = config[k]
        } else {
          // Vue 3
          // @xxx → onXxx
          res.listeners[atToOn(eventName)] = config[k]
        }
      } else {
        if (eventName.startsWith('hook:')) {
          res.hooks[eventName] = config[k]
        } else {
          // Vue 2
          // @xxx → xxx
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
    } else if (propsList.includes(k)) {
      res.props[k] = config[k]
    } else {
      res.attrs[k] = config[k]
    }
  }

  return res
}
