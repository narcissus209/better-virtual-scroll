<template>
  <div class="demo1">
    <BetterVirtualScroll :list="list" :item-size="32" :buffer="600" :scroll-top="200000">
      <template #before>
        <div>简单的列表模式，且每行高度相同</div>
      </template>
      <template v-slot="{ item, active }">
        <div class="item" :data-active="active">{{ item.text }}</div>
      </template>
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { BetterVirtualScroll } from 'better-virtual-scroll/src/components'
import { ref } from 'vue'

type Item = {
  id: string | number
  text: string
}
const list = ref<Item[]>([])

for (let i = 0; i < 30; i++) {
  list.value.push({
    id: `id_${i}`,
    text: `item-${i}`,
  })
}

// const scrollTop = ref(0)
// const updateCount = ref(1)
// setTimeout(() => {
//   updateCount.value++
//   scrollTop.value = 8000
// }, 2000)
</script>

<style lang="less" scoped>
.demo1 {
  height: 100%;
}
.item {
  height: 32px;
  width: 100%;
}
</style>
