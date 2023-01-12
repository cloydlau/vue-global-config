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
  listeners: Record<string, Function>
  hooks: Record<string, Function>
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
    } else if (propsList.includes(k)) {
      res.props[k] = config[k]
    } else {
      res.attrs[k] = config[k]
    }
  }

  return res
}
