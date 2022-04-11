//import { consolePrefix } from '../package.json'

export default function useGlobalConfig (
  globalConfig: { [key: string]: any },
  localProps: string[] | object = []
) {
  let
    globalProps: { [key: string]: any } = {},
    globalAttrs: { [key: string]: any } = {},
    globalEvents: { [key: string]: Function } = {},
    globalHooks: { [key: string]: Function } = {}

  const localPropsArray = Array.isArray(localProps) ? localProps : Object.keys(localProps)

  for (let k in globalConfig) {
    if (k.startsWith('@')) {
      if (k.startsWith('hook:')) {
        globalHooks[k] = globalConfig[k]
      } else {
        globalEvents[k] = globalConfig[k]
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
    events: globalEvents,
    hooks: globalHooks // 仅用于 Vue 2，Vue 3 不支持 @hook:xxx
  }
}
