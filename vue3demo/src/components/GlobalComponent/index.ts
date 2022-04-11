let globalProps = {}, globalAttrs = {}, globalEvents = {}
import { useGlobalConfig } from '../../vue-global-config'
import Component, { props as localProps } from './index.vue'

Component.install = (app: any, options = {}) => {
  if (!Component.name) {
    throw Error(`Name is required for a global component.`)
  } else if (Component.install.installed) {
    console.warn(`${Component.name} has been registered.`)
    return
  }

  const { props, attrs, events } = useGlobalConfig(options, localProps)
  globalProps = props
  globalAttrs = attrs
  globalEvents = events

  console.log(props, attrs, events)

  app.component(Component.name, Component)
  Component.install.installed = true
}

export default Component
export { globalProps, globalAttrs, globalEvents }
