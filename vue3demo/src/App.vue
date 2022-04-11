<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { ElMessage } from 'element-plus'
import { ref, computed } from 'vue'

const enableLocalConfig = ref(false)
const parentLocalConfig = computed(() =>
  enableLocalConfig.value ? {
    'parentProp': '传给 Parent 的实例 prop',
    'childAttr': '传给 Child 的实例 attr',
    '@childEvent' () {ElMessage.info('传给 Child 的实例 event')},
    '@vnodeMounted' () {ElMessage.info('传给 Parent 的实例 hook')},
  } : undefined
)
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125"/>

    <div class="wrapper">
      <HelloWorld msg="You did it!"/>
    </div>
  </header>

  <main>
    <TheWelcome/>
    <Parent v-bind="parentLocalConfig" @vnodeMounted="() => { $message.info('Parent 的实例 hook') }"/>
    <p>
      传递实例参数：
      <el-switch v-model="enableLocalConfig"/>
    </p>
  </main>
</template>

<style>
@import './assets/base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
