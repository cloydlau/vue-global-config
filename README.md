# vue-global-config

让你的组件支持全局参数配置！

<br>

## 初衷

Vue 提供了注册全局组件的功能，但不支持全局参数配置。

在业界，ElementPlus
贴心地提供了[部分参数的全局配置](https://element-plus.org/zh-CN/component/config-provider.html#config-provider-%E5%B1%9E%E6%80%A7) 。

但仅仅是部分参数，且没有全局事件、没有全局钩子函数。

如果想给自己封装的组件添加对全局参数的支持，是一件苦差事。

纠结于对全局参数和实例参数的权衡，哪个值最终生效？对象的话应该进行浅混入还是深混入？同时出现驼峰和短横线命名如何取舍？

<br>

## 特性

- 兼容 Vue 2 & Vue 3
- 支持全局配置 props
- 支持全局配置 attrs
- 支持全局配置 events
- 支持全局配置 hooks
- 提供参数权重算法，应对全局参数和实例参数的取舍问题

<br>

## 安装

![NPM](https://nodei.co/npm/vue-global-config.png)

``` bash
$ npm add vue-global-config
```

1. 首先要为组件提供一个全局注册的入口，以便该组件能够便全局注册，这是基础
2. 使用 `useGlobalConfig` 对组件使用者的传参进行处理，得到全局的 `{ globalProps, globalAttrs, globalEvents, globalHooks }`
3. 组件引入 `{ globalProps, globalAttrs, globalEvents, globalHooks }`，与组件的实例参数进行权重判定、混合，得到最终的参数值

[Vue 3 示例代码]()

[Vue 2 示例代码]()

<br>

## 全局 props

```vue
<!-- Vue 3（script setup） -->

<template>
  {{ Title }}
</template>

<script setup>
import { computed } from 'vue'
import { evaluateProp } from 'vue-global-config'
import { globalProps } from './index' // 全局注册入口

defineProps(['title'])
const Title = computed(() => evaluateProp([this.title, globalProps.title])) // 权重高的放在前面)
</script>
```

```vue
<!-- Vue 2 & Vue 3（选项式） -->

<template>
  {{ Title }}
</template>

<script>
import { evaluateProp } from 'vue-global-config'
import { globalProps } from './index' // 全局注册入口

export default {
  props: ['title'],
  computed: {
    Title () {
      return evaluateProp([this.title, globalProps.title]) // 权重高的放在前面
    },
  }
}
</script>
```

<br>

## 全局 attrs

attrs 通常用于高阶组件，即二次封装。

```vue
<!-- Vue 3（script setup） -->

<template>
  <el-button v-bind="Attrs"/>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { evaluateProp } from 'vue-global-config'
import { globalAttrs } from './index' // 全局注册入口

// 在 Vue 3 中，attrs 同时包含了 attrs 和 events
const Attrs = computed(() => evaluateProp([useAttrs()], {
  default: globalAttrs,
  // mergeFunction 的作用是让全局事件和实例事件都执行，互不冲突
  // 如果想让实例事件覆盖全局事件，则不需要 mergeFunction
  mergeFunction: (event, globalEvent) => (...args) => {
    event.apply(this, args)
    globalEvent?.apply(this, args)
  }
}))
</script>
```

```vue
<!-- Vue 2 & Vue 3（选项式） -->

<template>
  <el-button v-bind="Attrs"/>
</template>

<script>
import { evaluateProp } from 'vue-global-config'
import { globalAttrs } from './index' // 全局注册入口

export default {
  computed: {
    Attrs () {
      return evaluateProp([this.$attrs], {
        default: globalAttrs,
        // mergeFunction 的作用是让全局事件和实例事件都执行，互不冲突
        // 如果想让实例事件覆盖全局事件，则不需要 mergeFunction
        mergeFunction: (event, globalEvent) => (...args) => {
          event.apply(this, args)
          globalEvent?.apply(this, args)
        }
      })
    },
  }
}
</script>
```

<br>

## 全局 events


