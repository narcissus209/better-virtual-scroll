<template>
  <div class="demo1">
    <BetterVirtualScroll :list="list" :buffer="600" :update-count="updateCount">
      <template #before>
        <div>每行的高度不同，点击每行可调整每行的高度</div>
      </template>
      <template v-slot="{ item, index }">
        <div class="item" :style="{ height: item.size + 'px' }" @click="setItemHeight(index)">
          {{ item.text }} -- 行高：{{ item.size }}
        </div>
      </template>
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { BetterVirtualScroll } from 'better-virtual-scroll/src/components'
import { onMounted, ref } from 'vue'

const getRandomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
const getRandomSize = () => 16 + getRandomNum(0, 48)

type Item = {
  id: string | number
  text: string
  size: number
}
const list = ref<Item[]>([])
const updateCount = ref(0)
onMounted(() => {
  const _list: Item[] = []
  for (let i = 0; i < 1000; i++) {
    _list.push({
      id: `id_${i}`,
      text: `item-${i}`,
      size: getRandomSize(),
    })
  }
  list.value = _list
  updateCount.value++
})

const setItemHeight = (index: number) => {
  list.value[index].size = getRandomSize()
  updateCount.value++
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
