import { assignInWith, cloneDeep, isObject, isPlainObject, mapKeys, mergeWith } from 'lodash-es'
import * as changeCase from 'change-case'

// isPlainObject Vue 及 Vue 实例返回 false
// cloneDeep 不完全支持 Vue 实例

enum MergeObjectOptions {
  deep = 'deep',
  shallow = 'shallow',
}

type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

type PropConstructor<T = any> =
  | { new(...args: any[]): T & {} }
  | { (): T }
  | PropMethod<T>

type PropMethod<T, TConstructor = any> = [T] extends [
  ((...args: any) => any) | undefined,
] // if is function with args, allowing non-required functions
  ? { new(): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean,
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const isSimpleType = /* #__PURE__ */ makeMap(
  'String,Number,Boolean,Function,Symbol,BigInt',
)

// 不使用 ctor.name 的原因：
// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor: any): string {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ctor === null ? 'null' : ''
}

interface AssertionResult {
  valid: boolean
  expectedType: string
}

function assertType(value: unknown, type: PropConstructor): AssertionResult {
  let valid
  // Number → 'Number'
  const expectedType = getType(type)
  if (isSimpleType(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else if (expectedType === 'null') {
    valid = value === null
  } else {
    valid = value instanceof type
  }
  return {
    valid,
    expectedType,
  }
}

function validateProp({
  prop, type, validator,
}: {
  type: any
  prop: any
  validator: any
}) {
  if (![undefined, null].includes(prop) && type) {
    let isValid = false
    const types = Array.isArray(type) ? type : [type]; const expectedTypes = []

    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(prop, types[i])
      expectedTypes.push(expectedType || '')
      isValid = valid
    }

    if (!isValid)
      throw new Error(`Invalid prop: type check failed, expecting [${expectedTypes.join(', ')}], receiving: ${prop}`)
  }
  if (validator && !validator(prop))
    throw new Error(`Invalid prop: validator check failed, receiving: ${prop}`)
}

function MergeObject(sources: any[], {
  mergeObject,
  mergeFunction,
  camelCase,
}: {
  mergeObject: string
  mergeFunction: false | ((accumulator: any, currentValue: any, index?: any, array?: any) => Function)
  camelCase: boolean
}) {
  const reversedSource = []
  for (let i = sources.length - 1; i >= 0; i--) {
    // shallow: 只有最外层的键会被转换
    // changeCase.camelCase 默认会把键中包含字母数字之外的任意字符如 $ _ 的键值对干掉
    // attrs 的命名正好不允许包含 $ _，但是 props、listeners 允许
    // 对于不同 case 的同名属性，覆盖优先级：
    // 由对象内部属性定义顺序决定，保留后定义的
    // 注意：合并对象时，属性顺序会被改变，属性顺序以靠后的（优先级低的）对象为优先！
    reversedSource.push(camelCase
      ? mapKeys(sources[i], (v: any, k: any) => changeCase.camelCase(k, {
        stripRegexp: /-/g, // 只过滤短横线，以便 kebab-case 转换为 camelCase
      }))
      : sources[i])
  }

  const customizer = mergeFunction
    ? (objValue: any, srcValue: any) =>
        (objValue instanceof Function && srcValue instanceof Function)
          ? mergeFunction(srcValue, objValue)
          : undefined
    : undefined

  // merge, assignIn 会改变原始对象
  return mergeObject === MergeObjectOptions.deep
    ? mergeWith(...reversedSource, customizer)
    : assignInWith(...reversedSource, customizer)
}

function MergeFunction(sources: any[], {
  mergeFunction,
}: { mergeFunction: (accumulator: any, currentValue: any, index?: any, array?: any) => Function }) {
  return sources.reduce(mergeFunction, () => { })
}

/**
 * @param {any[]} configSequence - prop序列（优先级从高到低，最后是默认值）
 * @param {object} [config] - 配置
 * @param {PropType<any>} [config.type] - 数据类型校验
 * @param {any} [config.default] - 默认值（显式）
 * @param {boolean} [config.defaultIsDynamic = false] - 动态生成默认值
 * @param {boolean} [config.required = false] - 是否必传校验
 * @param {function} [config.validator] - 自定义校验
 * @param {string} [config.camelCase = true] - 是否将对象的键统一为驼峰命名
 * @param {false|string} [config.mergeObject = 'deep'] - 合并对象的方式
 * @param {boolean} [config.mergeObjectApplyOnlyToDefault = false] - mergeObject仅作用于default
 * @param {false|((accumulator, currentValue, index?, array?) => Function)} [config.mergeFunction = false] - 融合函数的方式
 * @param {boolean} [config.mergeFunctionApplyOnlyToDefault = true] - mergeFunction仅作用于default
 * @returns {any} 最终的prop
 */
export default function conclude(
  configSequence: any[], config: {
    type?: PropType<any>
    default?: any
    defaultIsDynamic?: boolean
    required?: boolean
    validator?: (prop: any) => boolean
    camelCase?: boolean
    mergeObject?: string | false
    mergeObjectApplyOnlyToDefault?: boolean
    mergeFunction?: false | ((accumulator: any, currentValue: any, index?: any, array?: any) => Function)
    mergeFunctionApplyOnlyToDefault?: boolean
  } = {},
): any {
  // console.log('传参：', configSequence)

  const {
    type,
    default: defaultValue,
    defaultIsDynamic = false,
    required = false,
    validator,
    camelCase = true,
    mergeObjectApplyOnlyToDefault = false,
    mergeFunctionApplyOnlyToDefault = true,
  } = config

  let {
    mergeObject = MergeObjectOptions.deep,
    mergeFunction = false,
  } = config

  let configSequenceCopy

  if (defaultIsDynamic) {
    if (!(defaultValue instanceof Function)) {
      throw new TypeError(`Invalid option: default. config.default should be Function when config.defaultIsDynamic enabled, receiving: ${defaultValue}`)
    }

    configSequenceCopy = [...configSequence]
  } else {
    configSequenceCopy = [...configSequence, defaultValue]
  }

  let result; let isPlainObjectArray = false; let isFunctionArray = false
  for (let i = 0; i < configSequenceCopy.length; i++) {
    const v = configSequenceCopy[i]
    if (v !== undefined) {
      validateProp({
        type, prop: v, validator,
      })

      const itemIsPlainObject = isPlainObject(v)
      const itemIsFunction = v instanceof Function
      isPlainObjectArray = itemIsPlainObject
      isFunctionArray = itemIsFunction
      // 只要有一项不是 po / function，则不是纯粹的 po / function 数组
      // 如果两者都不是，则没有继续检查的必要了
      if (!itemIsPlainObject && !itemIsFunction)
        break
    }
  }

  if (isPlainObjectArray) {
    configSequenceCopy = cloneDeep(configSequenceCopy)
  } else {
    // 只有纯粹的 po 数组才能进行对象合并
    mergeObject = false

    // 只有纯粹的 function / po 数组才能进行函数融合
    if (!isFunctionArray) {
      mergeFunction = false
    }
  }

  for (let i = 0; i < configSequenceCopy.length; i++) {
    const prop = configSequenceCopy[i]
    if (prop !== undefined) {
      if (i === configSequenceCopy.length - 1) {
        result = prop
      } else if (mergeObject) {
        result = MergeObject(mergeObjectApplyOnlyToDefault
          // 直接将权重最高的 prop 与默认值进行合并
          ? [prop, defaultValue]
          // 依次合并（一次性完成，跳出循环）
          // reverse 会改变原始对象
          : configSequenceCopy, {
          mergeObject,
          mergeFunction,
          camelCase,
        })
      } else if (mergeFunction) {
        result = MergeFunction(mergeFunctionApplyOnlyToDefault
          // 直接将权重最高的 prop 与默认值进行融合
          ? [prop, defaultValue]
          // 依次融合（一次性完成，跳出循环）
          : configSequenceCopy, {
          mergeFunction,
        })
      } else {
        result = prop
      }
      break
    }
  }

  if (required && [undefined, null].includes(result)) {
    throw new Error('Missing required prop')
  }

  if (defaultIsDynamic) {
    return conclude(
      configSequence, {
        ...config,
        default: defaultValue(result),
        defaultIsDynamic: false,
      })
  }
  return result
}
