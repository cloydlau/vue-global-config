<template>
  <h2>{{ childProp }}</h2>
  <el-button @click="() => { $emit('childEvent', '传给 Parent 的实例 event') }">触发实例事件</el-button>
</template>

<script>
export default {
  props: ['childProp'],
  emits: ['childEvent'],
}
</script>

<style lang="scss" scoped>

</style>
