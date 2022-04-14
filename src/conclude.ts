import { isPlainObject, mergeWith, assignInWith, cloneDeep, mapKeys } from 'lodash-es'
import * as changeCase from 'change-case'
import { typeOf } from 'kayran'

// isPlainObject Vue及Vue实例返回false
// cloneDeep不完全支持Vue实例

enum MergeObjectOptions {
  deep = 'deep',
  shallow = 'shallow',
}

function validateProp ({
  type, name, prop, validator
}) {
  if (type) {
    if (typeOf(type) === 'string') {
      type = [type]
    }
    const actualType = typeOf(prop)
    if (!type.includes(actualType)) {
      throw Error(`${name}需为${type.toString()}类型（得到${actualType}）`)
    }
  }
  if (validator && !validator(prop)) {
    throw Error(`${name}不合法`)
  }
}

function MergeObject (sources, {
  mergeObject,
  mergeFunction,
}) {
  const customizer = mergeFunction ?
    (objValue, srcValue) =>
      (typeOf(objValue) === 'function' && typeOf(srcValue) === 'function') ?
        mergeFunction(srcValue, objValue) :
        undefined
    : undefined

  // merge, assignIn会改变原始对象
  return mergeObject === MergeObjectOptions.deep ?
    mergeWith(...sources, customizer) :
    assignInWith(...sources, customizer)
}

function MergeFunction (sources, {
  mergeFunction
}) {
  return sources.reduce(mergeFunction, () => {})
}

/**
 * @param {any[]} configSequence - prop序列（优先级从高到低，最后是默认值）
 * @param {object} [config] - 配置
 * @param {string} [config.name] - prop名称，用于报错提示
 * @param {string|string[]} [config.type] - 数据类型校验
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
export default function conclude (
  configSequence: any[], config: {
    name?: string,
    type?: string | string[],
    default?: any,
    defaultIsDynamic?: boolean,
    required?: boolean,
    validator?: (prop: any) => boolean,
    camelCase?: boolean,
    mergeObject?: string | false,
    mergeObjectApplyOnlyToDefault?: boolean,
    mergeFunction?: false | ((accumulator, currentValue, index?, array?) => Function),
    mergeFunctionApplyOnlyToDefault?: boolean,
  } = {}
): any {
  //console.log('传参：', configSequence)

  let {
    name = '',
    type,
    default: defaultValue,
    defaultIsDynamic = false,
    required = false,
    validator,
    camelCase = true,
    mergeObject = MergeObjectOptions.deep,
    mergeObjectApplyOnlyToDefault = false,
    mergeFunction = false,
    mergeFunctionApplyOnlyToDefault = true,
  } = config

  let configSequenceCopy

  if (defaultIsDynamic) {
    if (typeOf(defaultValue) !== 'function') {
      throw Error(`${name}动态生成默认值时，默认值需为函数类型`)
    }
    configSequenceCopy = [...configSequence]
  } else {
    configSequenceCopy = [...configSequence, defaultValue]
  }

  let result, isPlainObjectArray = false, isFunctionArray = false
  for (let i = 0; i < configSequenceCopy.length; i++) {
    const v = configSequenceCopy[i]
    if (v !== undefined) {
      validateProp({
        type, name, prop: v, validator
      })

      const itemIsPlainObject = isPlainObject(v)
      const itemIsFunction = typeOf(v) === 'function'
      isPlainObjectArray = itemIsPlainObject
      isFunctionArray = itemIsFunction
      // 只要有一项不是po/function，则不是纯粹的po/function数组
      // 如果两者都不是，则没有继续检查的必要了
      if (!itemIsPlainObject && !itemIsFunction) {
        break
      }
    }
  }

  if (isPlainObjectArray) {
    configSequenceCopy = cloneDeep(configSequenceCopy)
  } else {
    // 只有纯粹的po数组才能进行对象合并
    mergeObject = false

    // 只有纯粹的function/po数组才能进行函数融合
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
        result = MergeObject(mergeObjectApplyOnlyToDefault ?
          // 直接将权重最高的prop与默认值进行合并
          [defaultValue, prop] :
          // 依次合并（一次性完成，跳出循环）
          // reverse会改变原始对象
          [...configSequenceCopy].reverse(), {
          mergeObject,
          mergeFunction
        })
      } else if (mergeFunction) {
        result = MergeFunction(mergeFunctionApplyOnlyToDefault ?
          // 直接将权重最高的prop与默认值进行融合
          [prop, defaultValue] :
          // 依次融合（一次性完成，跳出循环）
          configSequenceCopy, {
          mergeFunction,
        })
      } else {
        result = prop
      }
      break
    }
  }

  if (required && result === undefined) {
    throw Error(`${name}参数不能为空`)
  }

  if (defaultIsDynamic) {
    return conclude(
      configSequence, {
        ...config,
        default: defaultValue(result),
        defaultIsDynamic: false
      })
  } else {
    //console.log('生效：', result)
    return camelCase && isPlainObject(result) ?
      // 只有最外层的键会被转换
      // changeCase.camelCase 默认会把键中包含字母数字之外的任意字符如 $ _ 的键值对干掉
      // attrs 的命名正好不允许包含 $ _
      // 但是 props、listeners 允许
      mapKeys(result, (v: any, k: any) => changeCase.camelCase(k, {
        stripRegexp: /-/g // 只过滤短横线，以便 kebab-case 转换为 camelCase
      })) :
      result
  }
}
