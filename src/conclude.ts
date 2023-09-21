import { assignInWith, cloneDeep, isObject, isPlainObject, mapKeys, mergeWith } from 'lodash-es'
import { camelCase } from 'change-case'

// isPlainObject: Vue and Vue instances return `false`
// cloneDeep does not fully support Vue instances

enum MergeObjectOptions {
  deep = 'deep',
  shallow = 'shallow',
}

type PropType<T> = PropConstructor<T> | PropConstructor<T>[]

type PropConstructor<T = any> = { new (...args: any[]): T & object } | { (): T } | PropMethod<T>

type PropMethod<T, TConstructor = any> = [T] extends [((...args: any) => any) | undefined] // if is function with args, allowing non-required functions
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(str: string, expectsLowerCase?: boolean): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

const isSimpleType = /* #__PURE__ */ makeMap('String,Number,Boolean,Function,Symbol,BigInt')

// Reason for not using `ctor.name`:
// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor: any): string {
  const match = ctor?.toString().match(/^\s*function (\w+)/)
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
  prop,
  type,
  validator,
}: {
  type: any
  prop: any
  validator: any
}) {
  if (![undefined, null].includes(prop) && type) {
    let isValid = false
    const types = Array.isArray(type) ? type : [type]
    const expectedTypes = []

    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(prop, types[i])
      expectedTypes.push(expectedType || '')
      isValid = valid
    }

    if (!isValid) {
      throw new Error(
        `Invalid prop: type check failed, expecting [${expectedTypes.join(
          ', ',
        )}], receiving: ${prop}`,
      )
    }
  }
  if (validator && !validator(prop)) {
    throw new Error(`Invalid prop: validator check failed, receiving: ${prop}`)
  }
}

function MergeObject(
  sources: any[],
  {
    mergeObject,
    mergeFunction,
  }: {
    mergeObject: string
    mergeFunction:
    | false
    | ((accumulator: any, currentValue: any, index?: any, array?: any) => (...args: any) => unknown)
  },
) {
  const reversedSource = []
  for (let i = sources.length - 1; i >= 0; i--) {
    reversedSource.push(sources[i])
  }

  const customizer = mergeFunction
    ? (objValue: any, srcValue: any) =>
        (typeof objValue === 'function' && typeof srcValue === 'function')
          ? mergeFunction(srcValue, objValue)
          : undefined
    : undefined

  // merge, assignIn will change the original object
  return mergeObject === MergeObjectOptions.deep
    ? mergeWith(...(reversedSource as []), customizer)
    : assignInWith(...(reversedSource as []), customizer)
}

function MergeFunction(
  sources: any[],
  {
    mergeFunction,
  }: { mergeFunction: (accumulator: any, currentValue: any, index?: any, array?: any) => (...args: any) => unknown },
) {
  return sources.reduce(mergeFunction, () => {})
}

export default function conclude(
  configSequence: any[],
  config: {
    type?: PropType<any>
    default?: any
    defaultIsDynamic?: boolean
    required?: boolean
    validator?: (prop: any) => boolean
    camelizeObjectKeys?: boolean
    mergeObject?: string | false
    mergeObjectApplyOnlyToDefault?: boolean
    mergeFunction?:
    | false
    | ((accumulator: any, currentValue: any, index?: any, array?: any) => (...args: any) => unknown)
    mergeFunctionApplyOnlyToDefault?: boolean
  } = {},
): any {
  const {
    type,
    default: defaultValue,
    defaultIsDynamic = false,
    required = false,
    validator,
    camelizeObjectKeys = false,
    mergeObjectApplyOnlyToDefault = false,
    mergeFunctionApplyOnlyToDefault = true,
  } = config

  let { mergeObject = MergeObjectOptions.deep, mergeFunction = false } = config

  const configSequenceCopy: any[] = []
  let result: any
  let isPlainObjectArray = false
  let isFunctionArray = false

  const handleProp = (prop: any) => {
    if (prop !== undefined) {
      validateProp({ type, prop, validator })

      const itemIsPlainObject = isPlainObject(prop)
      const itemIsFunction = typeof prop === 'function'
      isPlainObjectArray = itemIsPlainObject
      isFunctionArray = itemIsFunction

      // Shallow conversion: only the outermost keys are converted
      // camelCase kills key-value pairs which contain any character other than alphanumeric, such as $ _ in keys by default
      // The naming of attrs does not allow $ _ by change, but props, listeners do
      // For attributes of the same name in different cases, the override priority:
      // determined by the order in which the properties are defined within the object, keeping the ones defined later
      // Note: when merging objects, the order of the attributes is changed, and the order of the attributes takes precedence over the next (lower priority) object!
      if (itemIsPlainObject) {
        prop = cloneDeep(prop)
        return camelizeObjectKeys
          ? mapKeys(prop, (v: any, k: any) =>
            camelCase(k, {
              stripRegexp: /-/g, // Filter only short horizontal lines for kebab-case conversion to camelCase
            }),
          )
          : prop
      }
      return prop
    }
  }

  for (const prop of configSequence) {
    configSequenceCopy.push(handleProp(prop))
  }

  if (!defaultIsDynamic) {
    configSequenceCopy.push(handleProp(defaultValue))
  } else if (!(typeof defaultValue === 'function')) {
    throw new TypeError(
      `Invalid option: config.default should be Function when config.defaultIsDynamic enabled, receiving: ${defaultValue}`,
    )
  }

  if (!isPlainObjectArray) {
    // Only pure po arrays can be object merged
    mergeObject = false

    // Only pure function / po arrays can be functionally fused
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
        result = MergeObject(
          mergeObjectApplyOnlyToDefault
            // Merge the prop with the highest weight directly with the default value
            ? [prop, defaultValue]
            // Merge in sequence (do it all at once, jump out of the loop)
            // reverse will change the original object
            : configSequenceCopy,
          {
            mergeObject,
            mergeFunction,
          },
        )
      } else if (mergeFunction) {
        result = MergeFunction(
          mergeFunctionApplyOnlyToDefault
            // Merge the prop with the highest weight directly with the default value
            ? [prop, defaultValue]
            // Merge in sequence (do it all at once, jump out of the loop)
            : configSequenceCopy,
          {
            mergeFunction,
          },
        )
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
    return conclude(configSequence, {
      ...config,
      default: defaultValue(result),
      defaultIsDynamic: false,
    })
  }
  return result
}
