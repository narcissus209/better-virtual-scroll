<template>
  <div class="demo1">
    <BetterVirtualScroll :list="list" :item-size="32" :buffer="600">
      <template v-slot="{ item }">
        <div class="item">{{ item.text }}</div>
      </template>
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { BetterVirtualScroll } from 'better-virtual-scroll'
import { ref } from 'vue'

type Item = {
  id: string | number
  text: string
}
const list = ref<Item[]>([])

for (let i = 0; i < 1000; i++) {
  list.value.push({
    id: `id_${i}`,
    text: `item-${i}`,
  })
}
</script>

<style lang="less" scoped>
.demo1 {
  height: 100%;
}
.item {
  height: 32px;
}
</style>
