function objectFilter(obj: Record<string, any>, predicate: (key: string) => boolean): Record<string, any> {
  return Object.keys(obj)
    .filter((key) => predicate(key))
    .reduce((prev: Record<string, any>, curr) => {
      prev[curr] = obj[curr]
      return prev
    }, {})
}

export default function getLocalListeners(listeners: Record<string, any>) {
  return objectFilter(listeners, (key) => !key.startsWith('hook:'))
}
