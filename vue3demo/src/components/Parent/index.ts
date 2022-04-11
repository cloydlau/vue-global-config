let globalProps = {}, globalAttrs = {}, globalEvents = {}, globalHooks = {}
import { useGlobalConfig } from '../../vue-global-config'
import Component from './index.vue'

Component.install = (app: any, options = {}) => {
  if (!Component.name) {
    throw Error(`Name is required for a global component.`)
  } else if (Component.install.installed) {
    console.warn(`${Component.name} has been registered.`)
    return
  }

  const { props, attrs, events, hooks } = useGlobalConfig(options, Component.props)
  globalProps = props
  globalAttrs = attrs
  globalEvents = events
  globalHooks = hooks

  console.log(props, attrs, events, hooks)

  app.component(Component.name, Component)
  Component.install.installed = true
}

export default Component
export { globalProps, globalAttrs, globalEvents, globalHooks }
