import type { Plugin, install } from 'vue-demi'
import { resolveConfig } from '../../../src'
import Component from './Component.vue'

type SFCWithInstall<T> = T & Plugin & { install: typeof install }

function withInstall<T, E extends Record<keyof any, any>>(main: T, extra?: E) {
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

const globalProps: Record<keyof any, any> = {}
const globalAttrs: Record<keyof any, any> = {}
const globalListeners: Record<keyof any, any> = {}
const globalHooks: Record<keyof any, any> = {}
const globalSlots: Record<keyof any, any> = {}

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
