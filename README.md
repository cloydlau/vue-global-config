<h1 align="center">
  <a href="https://npmjs.com/package/vue-global-config" target="_blank" rel="noopener noreferrer">
    Vue Global Config <sup><img alt="version" src="https://versionbadg.es/cloydlau/vue-global-config.svg"></sup>
  </a>
</h1>

<p align="center">
  Configure your Vue 2.6/2.7/3 components globally!
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/vue-global-config"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/vue-global-config"></a>
  <a href="https://eslint.org"><img alt="code style" src="https://img.shields.io/badge/code_style-ESLint-4B32C3.svg?logo=eslint"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits&logoColor=white"></a>
  <a href="https://github.com/cloydlau/vue-global-config#develop"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

<br>

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

1. Firstly provide an [entrance](https://github.com/cloydlau/vue-global-config/tree/main/demo/vue3/src/components/GlobalComponent/index.ts) for your component to register globally, this is the foundation.
2. Use [useGlobalConfig](#useGlobalConfig) to handle parameters passed by component user, get global props, global attrs, global listeners & global hooks.
3. Import those global parameters, meet them with local / default parameters and determine the final value using [conclude](#conclude) .

<br>

## Features

- Support Vue 2.6/2.7/3
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

## Install

### NPM

```shell
npm i vue-global-config
```

> `@vue/composition-api` is required in Vue 2.6 or Earlier

### CDN + ESM

```html
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue/dist/vue.esm-browser.prod.js",
      "vue-demi": "https://unpkg.com/vue-demi/lib/v3/index.mjs",
      "vue-global-config": "https://unpkg.com/vue-global-config/dist/vue-global-config.mjs"
    }
  }
</script>
<script type="module">
  import { conclude, getLocalListeners, listenGlobalHooks, useGlobalConfig } from 'vue-global-config'
</script>
```

### CDN + UMD

```html
<script src="https://unpkg.com/vue-global-config@0.2"></script>
<script>
  const { conclude, getLocalListeners, listenGlobalHooks, useGlobalConfig } = VueGlobalConfig
</script>
```

<br>

## Usage

### Vue 3

#### Global Props

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

#### Global Attrs & Listeners

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

#### Global Hooks

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

### Vue 2

#### Global Props

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

#### Global Attrs

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

#### Global Listeners

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

#### Global Hooks

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

## API

<a name="useGlobalConfig"></a>

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

`Vue` provides local and default configuration of prop, but when wrapping components, there is a strong need for a "global configuration", which may otherwise lead to duplicate configurations for each component instance.

For example, the size and zIndex of `ElementUI` support global configuration.

When there are more configurations, there is some judgment as to which configuration is used by the final component due to the different priorities.

When it comes to objects and functions, this can get quite complicated.

The role of `conclude` is to help you figure out the final configuration.

#### Features

- Like Vue's props, it provides requirement, data type and custom validator
- For plain object type prop, deep merge, shallow merge and direct override are supported
- For function type prop, support merge and direct override
- Support for unifying the keys of objects into camel names
- Support for dynamic generation of default values

#### Param

```ts
/**
 * @param {any[]} configSequence - Config sequence (priority from highest to lowest, last is the default value)
 * @param {object} [config] - Configuration
 * @param {PropType<any>} [config.type] - Data type checking
 * @param {any} [config.default] - Default value (explicit)
 * @param {boolean} [config.defaultIsDynamic = false] - Dynamic generation of default values
 * @param {boolean} [config.required = false] - Requirement checking
 * @param {function} [config.validator] - Custom validator
 * @param {string} [config.camelizeObjectKeys = false] - Whether or not to camelize object keys
 * @param {false|string} [config.mergeObject = 'deep'] - The way to merge objects
 * @param {boolean} [config.mergeObjectApplyOnlyToDefault = false] - `mergeObject` only works on `default`
 * @param {false|((accumulator, currentValue, index?, array?) => Function)} [config.mergeFunction = false] - The way to fuse functions
 * @param {boolean} [config.mergeFunctionApplyOnlyToDefault = true] - `mergeFunction` only works on `default`
 * @returns {any} Final prop
 */
```

```ts
// 示例

import { conclude } from 'vue-global-config'

conclude([1, 2, undefined]) // 1
```

#### How can we know whether a prop is passed or not?

Whether the prop is all equal to `undefined` or not

#### config.type

Same as [Vue's prop validation](https://vuejs.org/guide/components/props.html#prop-validation).

#### config.mergeObject

- `'deep'`: Deep merge, where the object key of a high-weight prop overwrites the same-name key of a low-weight prop, containing nested objects (the default value)
- `'shallow'`: Shallow merge, where the object key of a high weight prop overwrites the key of the same name of a low weight prop, without nested objects
- `false`: No merging, direct overwriting, objects of high weight prop will directly overwrite objects of low weight prop, consistent with the behavior of value types

#### config.mergeObjectApplyOnlyToDefault

Off by default, only valid when mergeObject is on.

When on, mergeObject's rules are only applied to the final comparison with default, and previous objects are still directly overwritten.

When off, mergeObject's rules are applied to all object type prop weights.

Usage scenario: The component author wants to merge the component's internal configuration with the component user's configuration, but the component user's own configuration at all levels remains directly overwritten by the rules.

#### config.mergeFunction

Usage Scenario: When wrapping a component, you may need to listen to certain events of the underlying dependency by configuration.

When exposing the configuration for that dependency, the component user's configuration will conflict with yours.

`mergeFunction` provides a customized way to merge function type prop.

For example, the well-known rich text library TinyMCE has a callback called `init_instance_callback` in its options.

When wrapping this library, you can use it to do some initialization work and expose TinyMCE's options in order not to break the flexibility of the component.

The problem is that once the component user has configured this callback, it will conflict with your configuration.

Unlike the configuration of other data types, function-type prop is not expected to be directly overridden by the user's configuration, and there is a need for "fusion".

Fusion: executes both functions configured by the component user and functions configured internally by the component.

The function type prop includes two cases:

- prop is itself a function
- prop is an object with function properties

`conclude` internally uses `Array.prototype.reduce` to perform the function fusion, `mergeFunction` will be used as argument 1.

```ts
conclude([
  () => {
    console.log('I am option 1')
  },
  () => {
    console.log('I am option 2')
  }
], {
  default: () => {
    console.log('I am default option')
  },
  mergeFunction: (accumulator, item) => (...args) => {
    accumulator(...args)
    item?.(...args)
  },
  mergeFunctionApplyOnlyToDefault: false,
})()

// Will print 'I am default option' 'I am option 2' 'I am option 1'
```

#### config.mergeFunctionApplyOnlyToDefault

Is turned on by default and is only available when `mergeFunction` is on.

Function merging is, after all, a special behavior, and often only the component author will use this feature.

For component users, the configuration of function types may be more like Primitive Types and just override them.

When turned on, the `mergeFunction` rule is only applied to the final comparison with default, and the previous function is still overwritten directly.

When off, `mergeFunction`'s rules are applied to all function type prop weights.

#### config.default

Explicitly specifies the default value. If `mergeObjectApplyOnlyToDefault` or `mergeFunctionApplyOnlyToDefault` is not enabled, there is no need to use this parameter, just put the default value at the end of `configSequence`.

#### config.camelizeObjectKeys

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

Usage scenario: the default value needs to be determined according to the parameters passed by the component user.

```ts
// Example

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
  // userProp is the result of the calculation of parameter 1
  default: userProp => ({
    a: {
      c: userProp.a.a === 1 ? 1 : null
    }
  }),
  defaultIsDynamic: true,
})

/**
 * Will get:
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

By using `getLocalListeners(this.$listeners)`, you can get pure listeners without any hook.

<br>

### listenGlobalHooks

Vue 2 only. For the purpose of listening global hooks.

In Vue 2, only Vue components can trigger a hook, HTML elements don't. So triggering both global & local hooks needs hijacking `emit`.

<br>

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/cloydlau/vue-global-config/releases).

<br>

## Develop

1. [Install Deno](https://deno.land/manual/getting_started/installation)
2. Run `npm i -g @cloydlau/scripts`
3. Run `cl i` and choose pnpm
4. Run `cl dev3`/`cl dev2.7`/`cl dev2.6`

<br>
