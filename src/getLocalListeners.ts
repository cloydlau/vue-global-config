function objectFilter(obj: { [key: string]: any }, predicate: (key: string) => boolean): object {
  return Object.keys(obj)
    .filter(key => predicate(key))
    .reduce((prev: { [key: string]: any }, curr) => {
      prev[curr] = obj[curr]
      return prev
    }, {})
}

export default function getLocalListeners(listeners: object) {
  return objectFilter(listeners, key => !key.startsWith('hook:'))
}
