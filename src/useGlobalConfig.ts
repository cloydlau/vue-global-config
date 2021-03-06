import { isVue3 } from 'vue-demi'

function atToOn (eventName: string) {
  const keyArray = Array.from(eventName)
  keyArray[0] = keyArray[0].toUpperCase()
  keyArray.unshift('n')
  keyArray.unshift('o')
  return keyArray.join('')
}

export default function useGlobalConfig (
  globalConfig: { [key: string]: any },
  localProps: string[] | object = []
): {
  props: object,
  attrs: object,
  listeners: object,
  hooks: object
} {
  let
    globalProps: { [key: string]: any } = {},
    globalAttrs: { [key: string]: any } = {},
    globalListeners: { [key: string]: Function } = {},
    globalHooks: { [key: string]: Function } = {}

  const localPropsArray = Array.isArray(localProps) ? localProps : Object.keys(localProps)

  for (let k in globalConfig) {
    if (k.startsWith('@')) {
      const eventName = k.substring(1)
      if (isVue3) {
        if (eventName.startsWith('vnode')) {
          globalHooks[atToOn(eventName)] = globalConfig[k]
        } else {
          // Vue 3
          // @xxx → onXxx
          globalListeners[atToOn(eventName)] = globalConfig[k]
        }
      } else {
        if (eventName.startsWith('hook:')) {
          globalHooks[eventName] = globalConfig[k]
        } else {
          // Vue 2
          // @xxx → xxx
          globalListeners[eventName] = globalConfig[k]
        }
      }
    } else if (localPropsArray.includes(k)) {
      globalProps[k] = globalConfig[k]
    } else {
      globalAttrs[k] = globalConfig[k]
    }
  }

  return {
    props: globalProps,
    attrs: globalAttrs,
    listeners: globalListeners,
    hooks: globalHooks
  }
}
