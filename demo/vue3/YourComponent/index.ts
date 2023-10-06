import type { Plugin, install } from 'vue-demi'
import { resolveConfig } from 'vue-global-config'
import Component from './Component.vue'

type SFCWithInstall<T> = T & Plugin & { install: typeof install }

function withInstall<T, E extends Record<string, any>>(main: T, extra?: E) {
  (main as SFCWithInstall<T>).install = (app): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app?.component(comp.name, comp)
    }
  }

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      (main as any)[key] = comp
    }
  }
  return main as SFCWithInstall<T> & E
}

const globalProps: Record<string, any> = {}
const globalAttrs: Record<string, any> = {}
const globalListeners: Record<string, any> = {}
const globalHooks: Record<string, any> = {}
const globalSlots: Record<string, any> = {}

const ComponentWithInstall = withInstall(Component)

ComponentWithInstall.install = (app: any, options = {}) => {
  const { props, attrs, listeners, hooks, slots } = resolveConfig(options, Component.props)
  Object.assign(globalProps, props)
  Object.assign(globalAttrs, attrs)
  Object.assign(globalListeners, listeners)
  Object.assign(globalHooks, hooks)
  Object.assign(globalSlots, slots)
  app.component(ComponentWithInstall.name, ComponentWithInstall)
}

export { globalProps, globalAttrs, globalListeners, globalHooks, globalSlots }
export default ComponentWithInstall
