<template>
  <div ref="demo3Ref" class="demo3">
    <BetterVirtualScroll class="scroll" :list="list" :buffer="600" :update-count="updateCount">
      <template #before>
        <div>特殊布局, 一行可展示多条, 行高相同, 以每行展示 4 条为例子</div>
        <div>图片宽度按宽度比例放 4 个, 宽高成比例 1:1 的图片</div>
        <div>内容两边 padding 为 24, 图片上下左右间隔为 16</div>
      </template>
      <template v-slot="{ item }">
        <div v-if="item.type === 'title'" class="title">{{ item.text }}</div>
        <div v-else class="item" :class="{ 'item-first': item.size }">
          <img :src="item.img" />
        </div>
      </template>
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { BetterVirtualScroll } from 'better-virtual-scroll'
import { onMounted, ref } from 'vue'
import img1 from '@/assets/imgs/img1.jpg'
import img2 from '@/assets/imgs/img2.jpg'
import img3 from '@/assets/imgs/img3.jpg'
import img4 from '@/assets/imgs/img4.jpg'
import img5 from '@/assets/imgs/img5.jpg'

const imgs: Record<string, string> = {
  img1,
  img2,
  img3,
  img4,
  img5,
}

const getRandomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type Item = {
  id: string | number
  text: string
  size: number
  img?: string
  type: 'title' | 'item'
}

const list = ref<Item[]>([])
const updateCount = ref(0)
const clientWidth = document.body.clientWidth
const row = 4 // 一行 4 个
const contentPadding = 24 // 内容两边 padding
const imgSpace = 16 // 图片间隔
const width = Math.floor((clientWidth - contentPadding * 2 - imgSpace * (row - 1)) / row) // 图片宽度
const itemSize = width + imgSpace // 图片包括 margin 的 itemSize, 用于虚拟滚动高度计算
onMounted(() => {
  const _list: Item[] = []
  for (let i = 0; i < 30; i++) {
    _list.push({
      id: `title_${i}`,
      text: `标题---${i}`,
      size: 40, // 标题的高度为 40px
      type: 'title',
    })
    const count = getRandomNum(10, 50)
    for (let j = 0; j < count; j++) {
      _list.push({
        id: `title_${i}_item_${j}`,
        text: `图片---${j}`,
        size: j % row === 0 ? itemSize : 0, // 一行显示4个，第一张图片高度为这一行的高度，后3张设为0
        img: imgs['img' + getRandomNum(1, 5)],
        type: 'item',
      })
    }
  }
  list.value = _list
  updateCount.value++
})
</script>

<style lang="less" scoped>
.demo3 {
  height: 100%;
  .scroll::-webkit-scrollbar {
    // 滚动条宽度会影响图片宽度
    width: 0px;
  }
  :deep(.better-virtual-scroll-view-list) {
    padding: 0 calc(v-bind(contentPadding) * 1px);
  }
}
.title {
  width: 100%;
  height: 40px;
}
.item {
  display: inline-block;
  position: relative;
  width: calc(v-bind(width) * 1px);
  height: calc(v-bind(width) * 1px);
  margin-left: calc(v-bind(imgSpace) * 1px);
  margin-bottom: calc(v-bind(imgSpace) * 1px);
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  &.item-first {
    margin-left: 0;
  }
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}
</style>
