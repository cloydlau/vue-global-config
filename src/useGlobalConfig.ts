export default function useGlobalConfig (globalConfig: { [key: string]: any }, localProps: string[] | object = []) {
  let
    globalProps: { [key: string]: any } = {},
    globalAttrs: { [key: string]: any } = {},
    globalEvents: { [key: string]: Function } = {},
    globalHooks: { [key: string]: Function } = {}

  const localPropsArray = Array.isArray(localProps) ? localProps : Object.keys(localProps)

  for (let k in globalConfig) {
    if (k.startsWith('@')) {
      const eventName = k.substring(1)
      if (eventName) {
        if (eventName.startsWith('hook:')) {
          globalHooks[eventName] = globalConfig[k]
        } else {
          globalEvents[eventName] = globalConfig[k]
        }
      } else {
        console.warn('[vue-global-props] Empty event name!')
      }
    } else if (localPropsArray.includes(k)) {
      globalAttrs[k] = globalConfig[k]
    } else {
      globalProps[k] = globalConfig[k]
    }
  }

  return {
    props: globalProps,
    attrs: globalAttrs,
    events: globalEvents,
    hooks: globalHooks // 仅用于 Vue 2，Vue 3 不支持 @hook:xxx
  }
}
