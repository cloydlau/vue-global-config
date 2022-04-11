import { notEmpty } from 'kayran'
import evaluateProp from './evaluateProp'

// 可以同时触发 实例事件 和 全局事件 的事件监听器
export default function evaluateListeners (sources: [object, object]) {
  const [listeners, globalEvents] = sources
  return notEmpty(globalEvents) ? evaluateProp([listeners], {
    default: globalEvents,
    mergeFunction: (event, globalEvent) => (...args: any) => {
      event.apply(this, args)
      globalEvent?.apply(this, args)
    },
  }) : listeners
}
