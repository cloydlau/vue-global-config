# vue-global-config

Configure your Vue 2.6 / 2.7 / 3 components globally!

```ts
// Vue 3

app.use(YourComponent, {
  // global prop
  'message': 'Hello World',

  // global attr
  'placeholder': 'Please enter',

  // global listener
  '@blur': function (e) {
    console.log(e) // event is accessible
    console.log(this) // 'this' is accessible
  },

  // global hook
  '@vnodeMounted': function () {
    console.log(this) // 'this' is accessible
  },
})
```

```ts
// Vue 2

Vue.use(YourComponent, {
  // global prop
  'message': 'Hello World',

  // global attr
  'placeholder': 'Please enter',

  // global listener
  '@blur': function (e) {
    console.log(e) // event is accessible
    console.log(this) // 'this' is accessible
  },

  // global hook
  '@hook:mounted': function () {
    console.log(this) // 'this' is accessible
  },
})
```

<br>

## Why?

Vue provides support for globally registering components, but no configuration.

In the industry, ElementPlus
thoughtfully provides [config-provider](https://element-plus.org/en-US/component/config-provider.html#config-provider-attributes) .

But note that it's only for **partial props**. Global attrs, global listeners & global hooks are all **not** supported.

Make your components capable of globally configuring, is a not-that-hard but tiresome drudgery.

Entangled in global / local / default parameters, which one to choose? It should be replaced or shallow merged or deep merged when it comes to plain object type? What if I want all functions triggered instead of ony one when it comes to function type? How to decide when both camel case and kebab case of a same parameter come together?

<br>

## How?

1. Firstly provide an [entrance](https://github.com/cloydlau/vue-global-config/tree/main/vue3demo/src/components/GlobalComponent/index.ts) for your component to register globally, this is the foundation.
2. Use [useGlobalConfig](#useGlobalConfig) to handle parameters passed by component user, get global props, global attrs, global listeners & global hooks.
3. Import those global parameters, meet them with local / default parameters and determine the final value using [conclude](#conclude) .

[Vue 3 demo](https://github.com/cloydlau/vue-global-config/tree/main/vue3demo/src/components/GlobalComponent)

[Vue 2 demo](https://github.com/cloydlau/vue-global-config/tree/main/vue2demo/src/components/GlobalComponent)

<br>

## Features

- Support Vue 2.6 / 2.7 / 3
- Provide weight algorithm to deal with trade-off and merging issues of global / local / default parameters.
- Support global [props](https://staging.vuejs.org/guide/components/props.html#props)
- Support global [attrs](https://staging.vuejs.org/guide/components/attrs.html)
- Support global [listeners](https://staging.vuejs.org/guide/essentials/event-handling.html#listening-to-listeners)
    - Support triggering both global listener & local listener.
    - Support triggering either global listener or local listener.
- Support global hooks (internal API)
    - Such as `@vnodeMounted` in Vue 3, see https://github.com/vuejs/core/issues/4457
    - Such as `@hook:mounted` in Vue 2, see https://github.com/vuejs/vue/issues/10312
- Support deep merge, shallow merge or directly replace plain object type values
- Support merge or directly replace function type values

<br>

## Vue 3

### Install

![NPM](https://nodei.co/npm/vue-global-config.png)

<br>

### Global Props

```vue
<template>
  {{ Msg }}
</template>

<script setup>
import { computed } from 'vue'
import { conclude } from 'vue-global-config'
import { globalProps } from './index' // Entrance for registering globally

const props = defineProps(['msg'])
const Msg = computed(() => conclude([props.msg, globalProps.msg])) // Place the prop of higher priority in the front
</script>
```

### Global Attrs & Listeners

> In Vue 3, `attrs` includes both attrs & listeners

```vue
<template>
  <el-input v-bind="Attrs" />
</template>

<script setup>
import { computed, getCurrentInstance, useAttrs } from 'vue'
import { conclude } from 'vue-global-config'
import { globalAttrs, globalListeners } from './index' // Entrance for registering globally

const currentInstance = getCurrentInstance()

// Not required: Bind 'this' to globalListeners, if you need it in the global configuration
for (const k in globalListeners)
  globalListeners[k] = globalListeners[k].bind(currentInstance)

const Attrs = computed(() => conclude([useAttrs()], {
  default: { ...globalAttrs, ...globalListeners },
  // mergeFunction's role is to trigger both global and local listener
  // do not use it if you want global listener replaced by local one
  mergeFunction: (localEventListener, globalEventListener) => (...args) => {
    localEventListener(...args)
    globalEventListener(...args)
  },
}))
</script>
```

### Global Hooks

```vue
<template>
  <div v-bind="globalHooks" />
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { globalHooks } from './index' // Entrance for registering globally

const currentInstance = getCurrentInstance()

// Not required: Bind 'this' to globalHooks, if you need it in the global configuration
for (const k in globalHooks)
  globalHooks[k] = globalHooks[k].bind(currentInstance)
</script>
```

<br>

## Vue 2

### Install

``` bash
# Vue 2.7
$ npm add vue-global-config

# Vue 2.6 or Earlier
$ npm add vue-global-config @vue/composition-api
```

<br>

### Global Props

```vue
<template>
  {{ Msg }}
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalProps } from './index' // Entrance for registering globally

export default {
  props: ['msg'],
  computed: {
    Msg() {
      return conclude([this.msg, globalProps.msg]) // Place the prop of higher priority in the front
    },
  }
}
</script>
```

### Global Attrs

```vue
<template>
  <el-input v-bind="Attrs" />
</template>

<script>
import { conclude } from 'vue-global-config'
import { globalAttrs } from './index' // Entrance for registering globally

export default {
  computed: {
    Attrs() {
      return conclude([this.$attrs, globalAttrs]) // Place the prop of higher priority in the front
    },
  }
}
</script>
```

### Global Listeners

```vue
<template>
  <el-input v-on="Listeners" />
</template>

<script>
import { conclude, getLocalListeners } from 'vue-global-config'
import { globalListeners } from './index' // Entrance for registering globally

export default {
  computed: {
    Listeners() {
      // Not required: Bind 'this' to globalListeners, if you need it in the global configuration
      for (const k in globalListeners)
        globalListeners[k] = globalListeners[k].bind(this)

      // getLocalListeners's role is to remove hooks in this.$listeners
      // Check the getLocalListeners chapter for details
      return conclude([getLocalListeners(this.$listeners)], {
        default: globalListeners,
        // mergeFunction's role is to trigger both global and local listener
        // do not use it if you want global listener replaced by local one
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

### Global Hooks

```vue
<template>
  <div />
</template>

<script>
import { listenGlobalHooks } from 'vue-global-config'
import { globalHooks } from './index' // Entrance for registering globally

export default {
  created() {
    // listen global hooks
    listenGlobalHooks.call(this, globalHooks)
  },
}
</script>
```

<br>

<a name="useGlobalConfig"></a>

## API

### useGlobalConfig

Get global props, attrs, listeners & hooks by analysing global parameters passed by component user.

#### Param

```ts
/**
 * @param {object} globalConfig - global parameters
 * @param {string[] | object} [localProps] - local props, for the purpose of differentiating between props and attrs
 * @returns {{
 *   props: object,
 *   attrs: object,
 *   listeners: object,
 *   hooks: object
 * }} global props, attrs, listeners & hooks
 */
```

```ts
// Example

// Vue version before 2.7 should add an extra @vue/composition-api
// import VCA from '@vue/composition-api'
// Vue.use(VCA)

import { useGlobalConfig } from 'vue-global-config'

useGlobalConfig({
  'msg': 'some prop',
  'placeholder': 'some attr',
  '@blur': function () {},
  '@hook:mounted': function () {},
})
```

<br>

<a name="conclude"></a>

### conclude

Vue 提供了 prop 的局部配置和默认值配置，但在封装组件时，还会非常需要一个“全局配置”，否则可能导致每个组件实例进行重复的配置。

举个例子，Element 的 size 与 zIndex 就是支持全局配置的。

当配置多了以后，由于存在不同的优先级，最终组件采用的是哪一项配置，需要进行一定的判断，

在涉及到对象和函数时，判断可能会变得相当复杂。

conclude 的作用就是帮助你计算出最终的配置。

#### Features

- 和 Vue 的 props 一样，提供是否必传、数据类型和自定义的校验
- 对于 plain object 类型的 prop，支持深合并、浅合并和直接覆盖
- 对于 function 类型的 prop，支持融合、直接覆盖
- 支持将对象的键统一为驼峰命名
- 支持动态生成默认值

#### Param

```ts
/**
 * @param {any[]} configSequence - config 序列（优先级从高到低，最后是默认值）
 * @param {object} [config] - 配置
 * @param {string} [config.name] - config 名称，用于报错提示
 * @param {PropType} [config.type] - 数据类型校验
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

#### How can we know whether a prop is passed or not?

以该 prop 是否全等于 `undefined` 作为标识

#### config.type

与 [Vue 的 Prop 类型校验](https://vuejs.org/guide/components/props.html#prop-validation) 一致。

#### config.mergeObject

- `'deep'`: 深合并，高权重 prop 的对象键会覆盖低权重 prop 的同名键，包含嵌套的对象（默认值）
- `'shallow'`: 浅合并，高权重 prop 的对象键会覆盖低权重 prop 的同名键，不含嵌套的对象
- `false`: 不合并，直接覆盖，高权重 prop 的对象会直接覆盖低权重 prop 的对象，与值类型的表现一致

#### config.mergeObjectApplyOnlyToDefault

默认关闭，仅在 mergeObject 开启时有效。

开启时，mergeObject 的规则仅会应用于最后与 default 进行比对的环节中，之前的对象依然会直接覆盖。

关闭时，mergeObject 的规则会应用至所有对象类型 prop 的权重比对中。

使用场景：组件作者想要将组件内部的配置与组件使用者的配置进行合并，但组件使用者自身的各级配置依然保持直接覆盖的规则。

#### config.mergeFunction

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

#### config.mergeFunctionApplyOnlyToDefault

默认开启，仅在 mergeFunction 开启时有效。

函数融合毕竟是一个特殊行为，往往只有组件作者会用到这个功能，

对于组件使用者来说，函数类型的配置可能更希望的是和其他原始类型一样，直接覆盖掉就好了。

开启时，mergeFunction 的规则仅会应用于最后与 default 进行比对的环节中，之前的函数依然会直接覆盖。

关闭时，mergeFunction 的规则会应用至所有函数类型 prop 的权重比对中。

#### config.default

显式指定默认值，如果没有开启 `mergeObjectApplyOnlyToDefault` 或 `mergeFunctionApplyOnlyToDefault` 的话，则没有必要使用该参数，将默认值放在 `configSequence`
的末尾即可。

#### config.camelCase

without

```
const Props = conclude([...], {
  default: (userProp) => {
    if(userProp.beforeClose !== undefined || userProp['before-close'] !== undefined) {
      ...
    }
  },
  defaultIsDynamic: true,
})

if(Props.beforeClose !== undefined || Props['before-close'] !== undefined) {
  ...
}
```

with

```
const Props = conclude([...], {
  default: (userProp) => {
    if(userProp.beforeClose !== undefined) {
      ...
    }
  },
  defaultIsDynamic: true,
})

if(Props.beforeClose !== undefined) {
  ...
}
```

Take a look at this: `<el-select value-key="id" valueKey="code" />`, so is `id` or `code` going to take effect?

The answer is `code` because `valueKey` is latter.

`conclude([{ aB: 1, 'a-b': 2 }])` returns `{ aB: 2 }` in the same way.

With the global config, the situation can be quite complicated.

What does `conclude([{ 'aB': 1, 'a-b': 2 }, { 'a-b': 4, 'aB': 3 }])` return?

`{ aB: 1 }` if `conclude` merge object before unify the keys, because the merge process will change the order of keys.

It will be unpredictable with more props.

So `conclude` choose to unify the keys in advance, so `{ aB: 2 }` will be the answer, it's intuitive.

Why not take kebab-case as default?

- Check [Official Vue style guide](https://v2.vuejs.org/v2/style-guide/index.html#Prop-name-casing-strongly-recommended)

#### Dynamic default value

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

### getLocalListeners

Vue 2 only. For the purpose of listening local hooks.

In Vue 2, `this.$listeners` includes listeners & hooks.

In Vue 3, `attrs` includes attrs and listeners.

As a result in Vue 2, hooks passed locally will be improperly passed to the child component within your component, making hook triggered repeatedly.

By using `getLocalListeners(this.$listeners)`, your can get pure listeners without any hook.

<br>

### listenGlobalHooks

Vue 2 only. For the purpose of listening global hooks.

In Vue 2, only Vue components can trigger a hook, HTML elements don't. So triggering both global & local hooks needs hijacking `emit`.

<br>

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/cloydlau/vue-global-config/releases).

<br>

## Develop

**PR welcome!** 💗

1. Install Deno
    - https://deno.land/#installation
    - https://x.deno.js.cn/#%E5%AE%89%E8%A3%85%E6%9C%80%E6%96%B0%E7%89%88

2. `npm add pnpm @cloydlau/scripts -g; pnpm i`

3. Start

    - `pnpm dev3`
    - `pnpm dev2.7`
    - `pnpm dev2.6`

<br>
