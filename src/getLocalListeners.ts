function objectFilter(
  obj: Record<keyof any, any>,
  predicate: (key: string) => boolean,
): Record<keyof any, any> {
  return Object.keys(obj)
    .filter(key => predicate(key))
    .reduce((prev: Record<keyof any, any>, curr) => {
      prev[curr] = obj[curr]
      return prev
    }, {})
}

export default function getLocalListeners(listeners: Record<keyof any, any>) {
  return objectFilter(listeners, key => !key.startsWith('hook:'))
}
