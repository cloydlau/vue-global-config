# vue-global-config

让你的组件参数支持全局配置！

<br>

## 初衷

Vue 提供了注册全局组件的功能，但不支持全局参数配置。

在业界，ElementPlus
贴心地提供了[部分参数的全局配置](https://element-plus.org/zh-CN/component/config-provider.html#config-provider-%E5%B1%9E%E6%80%A7) 。

但仅支持部分 props，不支持全局 attrs、不支持全局事件监听、不支持全局生命周期钩子。

让自己封装的组件支持全局参数，是一件不难实现但颇为繁琐的苦差事。

纠结于全局参数与实例参数的权衡，最终采用哪个值？对象类型应该覆盖、浅合并还是深合并？同名参数的驼峰和短横线形式同时出现如何取舍？

**PS：实例参数即局部参数**

<br>

## 特性

- 兼容 Vue 2 & Vue 3
- 提供参数权重算法，解决全局参数与实例参数的取舍、融合问题
- 支持全局配置 [props](https://staging-cn.vuejs.org/guide/components/props.html#props)
- 支持全局配置 [attrs](https://staging-cn.vuejs.org/guide/components/attrs.html)
- 支持全局配置 [事件监听](https://staging-cn.vuejs.org/guide/essentials/event-handling.html#listening-to-listeners)
    - 支持同名的全局监听器与实例监听器共存（既触发全局监听的回调，也触发实例监听的回调）
    - 支持同名的全局监听器与实例监听器二选一（只触发全局监听和实例监听的其中一个回调）
- 支持全局配置生命周期钩子（内部 API）
    - Vue 3 中语法为 `@vnodeMounted`，参见 https://github.com/vuejs/core/issues/4457
    - Vue 2 中语法为 `@hook:mounted`，参见 https://github.com/vuejs/vue/issues/10312
- 支持深合并、浅合并和直接覆盖 `plain object` 类型的参数
- 支持融合、直接覆盖 `function` 类型的参数

<br>

## 安装

![NPM](https://nodei.co/npm/vue-global-config.png)

``` bash
$ npm add vue-global-config
```

<br>

## 使用

1.

首先要为组件提供一个[全局注册的入口](https://github.com/cloydlau/vue-global-config/tree/main/vue3demo/src/components/GlobalComponent/index.ts)
，以便该组件能被全局注册，这是基础

2. 使用 [useGlobalConfig](#useGlobalConfig) 对组件使用者的传参进行处理，得到四项全局参数 props、attrs、listeners、hooks
3. 组件引入这些全局参数，使用 [conclude](#conclude) 与组件的实例参数进行权重判定、融合，得到最终的参数值

[Vue 3 示例代码](https://github.com/cloydlau/vue-global-config/tree/main/vue3demo/src/components/GlobalComponent)

[Vue 2 示例代码](https://github.com/cloydlau/vue-global-config/tree/main/vue2demo/src/components/GlobalComponent)

<br>

## Vue 3

### 全局 props

```vue

<template>
  {{ Msg }}
</template>

<script setup>
import { computed } from 'vue'
import { conclude } from 'vue-global-config'
import { globalProps } from './index' // 全局注册入口

const props = defineProps(['msg'])
const Msg = computed(() => conclude([props.msg, globalProps.msg])) // 权重高的放在前面
</script>
```

### 全局 attrs & listeners

```vue

<template>
  <el-input v-bind="Attrs"/>
</template>

<script setup>
import { computed, useAttrs, getCurrentInstance } from 'vue'
import { conclude } from 'vue-global-config'
import { globalAttrs, globalListeners } from './index' // 全局注册入口

const currentInstance = getCurrentInstance()

// 非必须：给 globalListeners 绑定 this，以便在全局配置中访问 this
for (const k in globalListeners) {
  globalListeners[k] = globalListeners[k].bind(currentInstance)
}
const Attrs = computed(() => conclude([useAttrs()], {
  // 在 Vue 3 中，attrs 同时包含了 attrs 和 listeners
  default: { ...globalAttrs, ...globalListeners },
  // mergeFunction 的作用是让全局和实例 listeners 都执行，互不冲突
  // 如果想让实例 listeners 覆盖全局 listeners，则不需要 mergeFunction
  mergeFunction: (localEventListener, globalEventListener) => (...args) => {
    localEventListener(...args)
    globalEventListener(...args)
  },
}))
</script>
```

### 全局 hooks

```vue

<template>
  <div v-bind="globalHooks"/>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { globalHooks } from './index' // 全局注册入口

const currentInstance = getCurrentInstance()

// 给 globalHooks 绑定 this，以便在全局配置中访问 this
for (const k in globalHooks) {
  globalHooks[k] = globalHooks[k].bind(currentInstance)
}
</script>
```

<br>

## Vue 2

### 全局 props

```vue

<template>
  {{ Msg }}
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalProps } from './index' // 全局注册入口

export default {
  props: ['msg'],
  computed: {
    Msg () {
      return conclude([this.msg, globalProps.msg]) // 权重高的放在前面
    },
  }
}
</script>
```

### 全局 attrs

```vue

<template>
  <el-input v-bind="Attrs"/>
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalAttrs } from './index' // 全局注册入口

export default {
  computed: {
    Attrs () {
      return conclude([this.$attrs, globalAttrs]) // 权重高的放在前面
    },
  }
}
</script>
```

### 全局 listeners

```vue

<template>
  <el-input v-on="Listeners"/>
</template>

<script>
import { conclude, getLocalListeners } from 'vue-global-config'
import { globalListeners } from './index' // 全局注册入口

export default {
  computed: {
    Listeners () {
      // 非必须：给 globalListeners 绑定 this，以便在全局配置中访问 this
      for (const k in globalListeners) {
        globalListeners[k] = globalListeners[k].bind(this)
      }

      // getLocalListeners 的作用是去掉 this.$listeners 中的 hooks
      // 去掉的原因见 getLocalListeners 章节
      return conclude([getLocalListeners(this.$listeners)], {
        default: globalListeners,
        // mergeFunction 的作用是让全局和实例 listeners 都执行，互不冲突
        // 如果想让实例 listeners 覆盖全局 listeners，则不需要 mergeFunction
        mergeFunction: (localEventListener, globalEventListener) => (...args) => {
          localEventListener(...args)
          globalEventListener(...args)
        },
      })
    },
  }
}
</script>
```

### 全局 hooks

```vue

<template>
  <div/>
</template>

<script>
import { listenGlobalHooks } from 'vue-global-config'
import { globalHooks } from './index' // 全局注册入口

export default {
  created () {
    // 监听全局 hooks
    listenGlobalHooks.call(this, globalHooks)
  },
}
</script>
```

<br>

<a name="useGlobalConfig"></a>

## useGlobalConfig

分析组件使用者传递的全局参数，得到全局的 props、attrs、listeners、hooks

### Param

```ts
/**
 * @param {object} globalConfig - 全局参数
 * @param {string[] | object} [localProps] - 实例 props，用于区分 props 和 attrs
 * @returns {{
 *   props: object,
 *   attrs: object,
 *   listeners: object,
 *   hooks: object
 * }} 全局的 props、attrs、listeners、hooks
 */
```

```ts
// 示例

import { useGlobalConfig } from 'vue-global-config'

useGlobalConfig({
  'msg': 'some prop',
  'placeholder': 'some attr',
  '@blur' () {},
  '@hook:mounted' () {},
})
```

<br>

<a name="conclude"></a>

## conclude

Vue 提供了 prop 的局部配置和默认值配置，但在封装组件时，还会非常需要一个“全局配置”，否则可能导致每个组件实例进行重复的配置。

举个例子，Element 的 size 与 zIndex 就是支持全局配置的。

当配置多了以后，由于存在不同的优先级，最终组件采用的是哪一项配置，需要进行一定的判断，

在涉及到对象和函数时，判断可能会变得相当复杂。

conclude 的作用就是帮助你计算出最终的配置。

### Features

- 和 Vue 的 props 一样，提供是否必传、数据类型和自定义的校验
- 对于 plain object 类型的 prop，支持深合并、浅合并和直接覆盖
- 对于 function 类型的 prop，支持融合、直接覆盖
- 支持将对象的键统一为驼峰命名
- 支持动态生成默认值

### Param

```ts 
/**
 * @param {any[]} configSequence - config 序列（优先级从高到低，最后是默认值）
 * @param {object} [config] - 配置
 * @param {string} [config.name] - config 名称，用于报错提示
 * @param {string|string[]} [config.type] - 数据类型校验
 * @param {any} [config.default] - 默认值（显式）
 * @param {boolean} [config.defaultIsDynamic = false] - 动态生成默认值
 * @param {boolean} [config.required = false] - 是否必传校验
 * @param {function} [config.validator] - 自定义校验
 * @param {string} [config.camelCase = true] - 是否将对象的键统一为驼峰命名
 * @param {false|string} [config.mergeObject = 'deep'] - 合并对象的方式
 * @param {boolean} [config.mergeObjectApplyOnlyToDefault = false] - mergeObject 仅作用于 default
 * @param {false|((accumulator, currentValue, index?, array?) => Function)} [config.mergeFunction = false] - 融合函数的方式
 * @param {boolean} [config.mergeFunctionApplyOnlyToDefault = true] - mergeFunction 仅作用于 default
 * @returns {any} 最终的参数
 */
```

```ts
// 示例

import { conclude } from 'vue-global-config'

conclude([1, 2, undefined]) // 1
```

### 怎么判断某个 prop 有没有传？

以该 prop 是否全等于 `undefined` 作为标识

### config.mergeObject

- `'deep'`: 深合并，高权重 prop 的对象键会覆盖低权重 prop 的同名键，包含嵌套的对象（默认值）
- `'shallow'`: 浅合并，高权重 prop 的对象键会覆盖低权重 prop 的同名键，不含嵌套的对象
- `false`: 不合并，直接覆盖，高权重 prop 的对象会直接覆盖低权重 prop 的对象，与值类型的表现一致

### config.mergeObjectApplyOnlyToDefault

默认关闭，仅在 mergeObject 开启时有效。

开启时，mergeObject 的规则仅会应用于最后与 default 进行比对的环节中，之前的对象依然会直接覆盖。

关闭时，mergeObject 的规则会应用至所有对象类型 prop 的权重比对中。

使用场景：组件作者想要将组件内部的配置与组件使用者的配置进行合并，但组件使用者自身的各级配置依然保持直接覆盖的规则。

### config.mergeFunction

使用场景：在封装组件时，你可能需要通过配置选项的方式监听底层依赖的某些事件，

在将该依赖的配置选项暴露出去时，组件使用者的配置就会与你的配置发生冲突。

mergeFunction 提供定制化的方式来融合函数类型的 prop。

举个例子，知名的富文本库 TinyMCE 的配置选项中有一个叫 `init_instance_callback` 的回调，

在封装这个库时，可以藉此来做一些初始化的工作，为了不破坏组件的灵活性，也会将 TinyMCE 的配置选项暴露出去，

问题来了，组件使用者一旦配置了这个回调，就会与你的配置发生冲突。

与其他数据类型的配置不同的是，函数类型的 prop，往往不期望被用户的配置直接覆盖掉，会有需要进行“融合”的需求。

融合：既执行组件使用者配置的函数，也执行组件内部配置的函数。

函数类型的 prop 包括两种情况：

- prop 本身是函数
- prop 是含有函数属性的对象

conclude
内部使用 [Array.prototype.reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
来执行函数融合，mergeFunction 将被用作参数1。

```ts
conclude([
  () => {
    console.log('我是参数1')
  },
  () => {
    console.log('我是参数2')
  }
], {
  default: () => {
    console.log('我是显式默认值')
  },
  mergeFunction: (accumulator, item) => (...args) => {
    accumulator(...args)
    item?.(...args)
  },
  mergeFunctionApplyOnlyToDefault: false,
})()

// 结果会打印 '我是显式默认值' '我是参数2' '我是参数1' 
```

### config.mergeFunctionApplyOnlyToDefault

默认开启，仅在 mergeFunction 开启时有效。

函数融合毕竟是一个特殊行为，往往只有组件作者会用到这个功能，

对于组件使用者来说，函数类型的配置可能更希望的是和其他原始类型一样，直接覆盖掉就好了。

开启时，mergeFunction 的规则仅会应用于最后与 default 进行比对的环节中，之前的函数依然会直接覆盖。

关闭时，mergeFunction 的规则会应用至所有函数类型 prop 的权重比对中。

### config.default

显式指定默认值，如果没有开启 `mergeObjectApplyOnlyToDefault` 或 `mergeFunctionApplyOnlyToDefault` 的话，则没有必要使用该参数，将默认值放在 `configSequence`
的末尾即可。

### config.camelCase

Vue 的 prop 同时支持驼峰和短横线格式，如果组件使用者同时传了同一个 prop 的两种格式，值还是不相同的，问题来了，此时应该取哪一个值？

在多个配置进行合并时，结果会更加难以预测，所以 conclude 在**合并对象后**默认将对象的键统一为驼峰命名。

为什么不默认使用短横线命名？参见 [Vue官方风格指南](https://v3.cn.vuejs.org/style-guide/#prop-%E5%90%8D%E7%A7%B0%E5%BC%BA%E7%83%88%E6%8E%A8%E8%8D%90)

### 动态生成默认值

使用场景：需要根据组件使用者传的参数来决定默认值

```ts
// 示例

conclude([{
  a: {
    a: 1
  }
}, {
  a: {
    a: 2,
    b: 1
  }
}], {
  // userProp是参数1的计算结果
  default: userProp => ({
    a: {
      c: userProp.a.a === 1 ? 1 : null
    }
  }),
  defaultIsDynamic: true,
})

/**
 * 将得到：
 * {
 *   a: {
 *     a: 1,
 *     b: 1,
 *     c: 1
 *   }
 * }
 */
```

<br>

## getLocalListeners

仅用于 Vue 2，监听实例 hooks 时需要。

在 Vue 2 中，`this.$listeners` 包含 listeners 和 hooks。

在 Vue 3 中，`attrs` 包含 attrs 和 listeners。

所以在 Vue 2 中，通过实例传递的 hooks 会被 `this.$listeners` 错误地传递给组件内部的子组件，导致 hooks 被重复触发。

调用 `getLocalListeners(this.$listeners)` 能够得到去除 hooks 只包含 listeners 的监听器。

<br>

## listenGlobalHooks

仅用于 Vue 2，监听全局 hooks 时需要

在 Vue 2 中，只有组件才能触发 hooks，原生元素不行，所以需要通过劫持 emit 来实现同时触发全局 hooks 和实例 hooks
