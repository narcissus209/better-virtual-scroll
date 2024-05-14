<template>
  <div ref="demo3Ref" class="demo3">
    <div class="fix">
      <button @click="testClick">按钮</button>
      <button @click="add(10)">前面添加</button>
    </div>
    <BetterVirtualScroll
      ref="scrollRef"
      class="scroll"
      :list="renderList"
      :buffer="600"
      :update-count="updateCount"
      @update="update"
    >
      <template #before>
        <div>特殊布局, 一行可展示多条, 行高相同, 以每行展示 4 条为例子</div>
        <div>图片宽度按宽度比例放 4 个, 宽高成比例 1:1 的图片</div>
        <div>内容两边 padding 为 24, 图片上下左右间隔为 16</div>
        <div class="sticky-top">我可以吸顶</div>
      </template>
      <template v-slot="{ item, index, active }">
        <div v-if="item.type === 'title'" class="title" :data-index="index" :data-active="active">{{ item.data }}</div>
        <div v-else class="item" :class="{ 'item-first': item.height }" :data-index="index" :data-active="active">
          <img :src="item.data" />
          <button class="del-btn" @click="del(item.id)">删除</button>
        </div>
      </template>
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { BetterVirtualScroll } from 'better-virtual-scroll/src/components'
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

type DataItem = {
  id: string
  title: string
  data: string
}
let originData: DataItem[] = []
const getData = () => {
  const _list: DataItem[] = []
  for (let i = 0; i < 30; i++) {
    const title = '标题_' + Math.random().toString().slice(2)
    const count = getRandomNum(10, 50)
    for (let j = 0; j < count; j++) {
      const itemKey = 'img_' + Math.random().toString().slice(2)
      _list.push({
        id: itemKey,
        data: imgs['img' + getRandomNum(1, 5)],
        title: title,
      })
    }
  }
  originData = _list
}

type RenderListItem = {
  id: string
  data: string
  height: number
  left: number
  type: 'title' | 'img'
}
const clientWidth = document.body.clientWidth
const row = 4 // 一行 4 个
const contentPadding = 16 // 内容两边 padding
const imgSpace = 4 // 图片间隔
const width = Math.floor((clientWidth - contentPadding * 2 - imgSpace * (row - 1)) / row) // 图片宽度
const itemSize = width + imgSpace // 图片包括 margin 的 itemSize, 用于虚拟滚动高度计算
const titleHeight = 40
const renderList = ref<RenderListItem[]>([])
const updateCount = ref(0)
const renderData = () => {
  const titleMap: Record<string, DataItem[]> = {}
  for (let i = 0; i < originData.length; i++) {
    const el = originData[i]
    if (!titleMap[el.title]) {
      titleMap[el.title] = []
    }
    titleMap[el.title].push(el)
  }

  const _renderList: RenderListItem[] = []
  for (const key in titleMap) {
    const title = key
    _renderList.push({
      id: title,
      data: title,
      height: titleHeight,
      left: 0,
      type: 'title',
    })
    const list = titleMap[key]
    for (let i = 0; i < list.length; i++) {
      const el = list[i]
      const isFirst = i % row === 0
      _renderList.push({
        id: el.id,
        data: el.data,
        type: 'img',
        height: isFirst ? itemSize : 0, // 一行显示4个，第一张图片高度为这一行的高度，后3张设为0
        left: isFirst ? contentPadding : contentPadding + itemSize * (i % row),
      })
    }
  }
  renderList.value = _renderList
  updateCount.value++
}
onMounted(() => {
  getData()
  renderData()
})

const update = (upStartIndex: number, midStartIndex: number, midEndIndex: number, downEndIndex: number) => {
  // console.log(upStartIndex, midStartIndex, midEndIndex, downEndIndex)
}

const scrollRef = ref()
const testClick = () => {
  // 滚动
  // scrollRef.value.scrollToItemByIndex(1)
  // scrollRef.value.scrollToItemById(list.value[list.value.length - 1].id)
  // scrollRef.value.scrollTo(0)

  // list.value = []
  getData()
  updateCount.value++
}

const add = (index: number) => {
  const title = originData[index].title
  originData.splice(index, 0, {
    id: 'img_' + Math.random().toString().slice(2),
    data: imgs['img' + getRandomNum(1, 5)],
    title: title,
  })
  renderData()
}

const del = (id: string) => {
  originData = originData.filter(item => item.id !== id)
  renderData()
}
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
  width: 100vw;
  padding: 0 calc(v-bind(contentPadding) * 1px);
  height: calc(v-bind(titleHeight) * 1px);
}
.item {
  position: relative;
  width: calc(v-bind(width) * 1px);
  height: calc(v-bind(width) * 1px);
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
  .del-btn {
    position: absolute;
    left: 0;
    top: 0;
  }
}
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}
.fix {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 3;
}
</style>
