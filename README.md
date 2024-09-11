<h1 align="center">
  <a href="https://npmjs.com/package/vue-global-config" target="_blank" rel="noopener noreferrer">
    Vue Global Config <sup><img alt="version" src="https://img.shields.io/npm/v/vue-global-config.svg?style=flat-square&color=white&label="></sup>
  </a>
</h1>

<p align="center">
  Configure your Vue 2/3 components globally!
  <br>
  <b>Global Props + Attrs + Listeners + Hooks + Slots.</b>
  <br>
  <a href="https://juejin.cn/post/7189930273528774714">Blog: How to implement global Slots in Vue?</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-global-config?activeTab=versions"><img alt="created at" src="https://img.shields.io/github/created-at/cloydlau/vue-global-config?&color=1C404E&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPjxnIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik04IDQwaDMyVjI0SDh6Ii8+PHBhdGggc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iNCIgZD0iTTQwIDQwSDhtMzIgMEg0aDRtMzIgMGg0bS00IDBWMjRIOHYxNiIvPjxwYXRoIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjQiIGQ9Im00MCAzNGwtNC0ybC00IDJsLTQtMmwtNCAybC00LTJsLTQgMmwtNC0ybC00IDJtMjQtMTB2LTltLTggOXYtOW0tOCA5di05bTE2LTVWOG0tOCAyVjhtLTggMlY4TTggMjR2MTZtMzItMTZ2MTYiLz48L2c+PC9zdmc+"></a>
  <a href="https://github.com/antfu/eslint-config"><img alt="code style" src="https://antfu.me/badge-code-style.svg"></a>
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fcloydlau%2Fvue-global-config?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcloydlau%2Fvue-global-config.svg?type=shield"/></a>
  <a href="https://bundlephobia.com/package/vue-global-config"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/vue-global-config"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits"></a>
  <a href="https://semantic-release.gitbook.io"><img alt="semantic release" src="https://img.shields.io/badge/release-semantic-e10079?logo=semantic-release"></a>
  <a href="https://pr.new"><img src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a>
</p>

<br>

- Vue 3

```ts
app.use(YourComponent, {
  // Global Prop
  'title': 'Global Title',

  // Global Attr
  'data': [
    { key: 1, label: 'Global Option 1' },
    { key: 2, label: 'Global Option 2' },
  ],

  // Global Listener
  '@leftCheckChange': function () {
    console.log('Global LeftCheckChange')
  },

  // Global Hook
  '@vue:mounted': function () {
    console.log('Global Mounted')
  },

  // Global Slot
  '#left-footer': () => h('Fragment', undefined, 'Global Slot'),

  // Global Scoped Slot
  '#default': ({ option }) => h('Fragment', undefined, `${option.label} (From Global Scoped Slot)`),
})
```

- Vue 2

```ts
Vue.use(YourComponent, {
  // Global Prop
  'title': 'Global Title',

  // Global Attr
  'data': [
    { key: 1, label: 'Global Option 1' },
    { key: 2, label: 'Global Option 2' },
  ],

  // Global Listener
  '@left-check-change': function () {
    console.log('Global LeftCheckChange')
  },

  // Global Hook
  '@hook:mounted': function () {
    console.log('Global Mounted')
  },

  // Global Slot
  '#left-footer': () => ({ render: h => h('span', undefined, 'Global Slot') }),

  // Global Scoped Slot
  '#default': ({ option }) => ({ render: h => h('span', undefined, `${option.label} (From Global Scoped Slot)`) }),
})
```

<br>

## Why?

Vue provides support for globally registering components, but no configuration.

Some UI framework like Element Plus thoughtfully provides [config-provider](https://element-plus.org/en-US/component/config-provider.html#config-provider-attributes).

But note that it's only for **partial props**. Global attrs/listeners/hooks/slots are all **not** supported.

Make your components capable of globally configuring, is a not-that-hard but tiresome drudgery.

Entangled in global/local/default parameters, which one to choose? It should be replaced or shallow merged or deep merged when it comes to plain object type? What if I want all functions triggered instead of ony one when it comes to function type? How to decide when both camel case and kebab case of a same parameter come together?

<br>

## Features

- Support Vue 2.6/2.7/3
- Support global **Props**
- Support global **Attrs**
- Support global **Listeners**
  - Support triggering both global listener and local listener
  - Support triggering either global listener or local listener
  - Support current instance (`this`) access
- Support global **Hooks** (internal API)
  - Such as `@vue:mounted`/`onVnodeMounted` in Vue 3, see https://github.com/vuejs/core/issues/4457
  - Such as `@hook:mounted` in Vue 2, see https://github.com/vuejs/vue/issues/10312
  - Support current instance (`this`) access
- Support global **Slots** & **Scoped Slots**
  - Vue 3
    - Render function (`h`/`createVNode`)
    - Component definition (`{ render: () => h() }` / `{ template: '...' }`)
    - Locally or globally registered component name
    - Imported SFC
  - Vue 2
    - Component definition (`{ render: h => h() }` / `{ template: '...' }` / `Vue.compile('<span>...</span>')`)
    - Component constructor (`Vue.extend()`)
    - Locally or globally registered component name
    - Imported SFC
- Provide weight algorithm to deal with trade-off and merging issues of global/local/default parameters.
  - Support deep merge, shallow merge or directly replace values of plain object type
  - Support merge or directly replace values of function type

<br>

## Install

### Peer Dependencies

- vue
- ~~@vue/composition-api~~: Only for Vue 2.6 or earlier

### NPM

```shell
npm i vue-global-config
```

### CDN + ESM

```html
<script type="importmap">
  {
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/vue/dist/vue.esm-browser.prod.js",
      "vue-demi": "https://cdn.jsdelivr.net/npm/vue-demi/lib/v3/index.mjs",
      "vue-global-config": "https://cdn.jsdelivr.net/npm/vue-global-config/dist/vue-global-config.mjs"
    }
  }
</script>
<script type="module">
  import { conclude, getLocalListeners, listenGlobalHooks, resolveConfig } from 'vue-global-config'
</script>
```

### CDN + IIFE

```html
<script src="https://cdn.jsdelivr.net/npm/vue-global-config@0.6"></script>
<script>
  const { conclude, getLocalListeners, listenGlobalHooks, resolveConfig } = VueGlobalConfig
</script>
```

<br>

## Example

- [Vue 3](./demo/vue3)
- [Vue 2.7](./demo/vue2.7)
- [Vue 2.6](./demo/vue2.6)

<br>

## API

<a name="resolveConfig"></a>

### resolveConfig

Get global props, attrs, listeners, hooks and slots by analysing global parameters passed by component user.

#### Param

```ts
/**
 * @param {Record<keyof any, any>} globalConfig - global parameters
 * @param {Record<keyof any, any>} [options] - Options
 * @param {string[] | Record<keyof any, any>} [options.props = []] - local props, for the purpose of differentiating between props and attrs
 * @param {boolean} [options.camelizePropNames = false] - whether to camelize prop names
 * @returns {{
 *   props: Record<keyof any, any>,
 *   attrs: Record<keyof any, any>,
 *   listeners: Record<string, (...args: any) => unknown>,
 *   hooks: Record<string, (...args: any) => unknown>
 *   slots: Record<string, (...args: any) => unknown>
 * }} global props, attrs, listeners, hooks and slots
 */
```

```ts
// Example

// Vue version before 2.7 should add an extra @vue/composition-api
// import VCA from '@vue/composition-api'
// Vue.use(VCA)

import { resolveConfig } from 'vue-global-config'

resolveConfig({
  'msg': 'some prop',
  'placeholder': 'some attr',
  '@blur': function () {},
  '@hook:mounted': function () {},
  '#left-footer': () => h('Fragment', undefined, 'Global Slot'),
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
 * @param {Record<keyof any, any>} [options] - Options
 * @param {PropType<any>} [options.type] - Data type checking
 * @param {any} [options.default] - Default value (explicit)
 * @param {boolean} [options.defaultIsDynamic = false] - Dynamic generation of default values
 * @param {boolean} [options.required = false] - Requirement checking
 * @param {(prop: any) => boolean} [options.validator] - Custom validator
 * @param {string} [options.camelizeObjectKeys = false] - Whether to camelize object keys
 * @param {false|string} [options.mergeObject = 'deep'] - The way to merge objects
 * @param {(objValue: any, srcValue: any, key: string, object: Record<string, any>, source: Record<string, any>, stack: object) => any} [options.mergeObjectCustomizer] - To produce the merged values of the destination and source properties. Returning undefined to maintain the default behavior
 * @param {boolean} [options.mergeObjectApplyOnlyToDefault = false] - `mergeObject` only works on `default`
 * @param {false|((accumulator, currentValue, currentIndex?, array?) => )} [options.mergeFunction = false] - The way to merge functions
 * @param {boolean} [options.mergeFunctionApplyOnlyToDefault = true] - `mergeFunction` only works on `default`
 * @returns {any} Final prop
 */
```

```ts
// Example

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

#### config.mergeObjectCustomizer

The `customizer` argument of [mergeWith](https://lodash.com/docs#mergeWith) (`mergeObject: 'deep'`) or [assignInWith](https://lodash.com/docs#assignInWith) (`mergeObject: 'shallow'`) for customizing assigned values.

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
  mergeFunction: (accumulator, currentValue) => (...args) => {
    accumulator(...args)
    currentValue?.(...args)
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

Explicitly specify the default value.

Useful when `mergeObjectApplyOnlyToDefault`, `mergeFunctionApplyOnlyToDefault` or `defaultIsDynamic` is enabled.

When `defaultIsDynamic` is enabled, `config.default` should be a Function and its return value will be used for default value.

Otherwise just put the default value at the end of `configSequence`.

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

Detailed changes for each release are documented in the [release notes](https://github.com/cloydlau/vue-global-config/releases)

<br>


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcloydlau%2Fvue-global-config.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcloydlau%2Fvue-global-config?ref=badge_large)