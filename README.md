# 虚拟滚动组件

## Install

```shell
npm install --save better-virtual-scroll
```

## Register

全局注册

```ts
import BetterVirtualScroll from 'better-virtual-scroll'

app.use(BetterVirtualScroll)
```

or:

```ts
import { BetterVirtualScroll } from 'better-virtual-scroll'

app.component('BetterVirtualScroll', BetterVirtualScroll)
```

## Props

- `list`: 列表数据
  - `item.id` 必须存在
  - `item.size`: 使用此属性后，`itemSize` 属性失效
  
  ```ts
  type Item = {
    id: string | number // 必须存在且唯一
    size?: number // 使用此属性后，`itemSize` 属性失效
    [key: string]: any
  }
  type List = Item[]
  ```

- `itemSize`: 每条数据的行高，如果行高相同可使用此属性，如果行高不同，需要指定 `list` 中的 `size` 属性

  ```ts
  type ItemSize = number
  ```

- `buffer`: 上下预显示的范围

  ```ts
  type Buffer = number
  ```

- `updateCount`: 如果列表数据更新了，可通过修改此字段来更新页面数据，内部通过 `watch` 这个值来监听数据的变化，没有通过 `watch` list

  ```ts
  type UpdateCount = number
  ```

- `scrollTop`: 通过传入 `scrollTop`，可以初始化当前滚动的高度

  ```ts
  type scrollTop = number
  ```

## Emits

- `update(startIndex: number, endIndex: number)`: 当前虚拟滚动列表的开始下标与结束下标

## Ref Value Event

```ts
type ScrollBehavior = "auto" | "instant" | "smooth";
```

- `scrollTo(top: number, behavior: ScrollBehavior = 'smooth')`: 滚动到指定高度
- `scrollToItemById(id: string | number, behavior: ScrollBehavior = 'smooth')`: 滚动到指定 `id` 的元素
- `scrollToItemByIndex(index: number, behavior: ScrollBehavior = 'smooth')`: 滚动到指定下标的元素

## Usage

### 1. 每条数据的行高相同

```vue
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
  height: 100vh; // 设置外层高度
}
.item {
  height: 32px; // 设置每条数据的高度
}
</style>

```

### 2. 每条数据的行高不同

```vue
<template>
  <div class="demo1">
    <BetterVirtualScroll :list="list" :buffer="600" :update-count="updateCount">
      <template #before>
        <div>每行的高度不同，点击每行可调整每行的高度</div>
      </template>
      <template v-slot="{ item, index }">
        <!-- 设置每行的行高 -->
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
      size: getRandomSize(), // 设置每行的行高
    })
  }
  list.value = _list
  updateCount.value++  // 更新数据
})

const setItemHeight = (index: number) => {
  list.value[index].size = getRandomSize()  // 设置每行的行高
  updateCount.value++  // 更新数据
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

```

### 3. 其他特殊布局

这个示例是一种用于图标显示的布局模式，一行显示 4 个，同时还有一个标题栏

每行的行高相同，由于宽度是由屏幕宽度来自适应的，且宽高 1:1, 所以去掉了滚动条

需要注意 `item` 中 `size` 大小的设置，是一行的高度，需要包含这行的 `margin`

通过 `display: inline-block;`, 来控制每条数据的布局，实现更加自由的布局模式

```vue
<template>
  <div ref="demo3Ref" class="demo3">
    <BetterVirtualScroll class="scroll" :list="list" :buffer="600" :update-count="updateCount" @update="update">
      <template #before>
        <div>特殊布局, 一行可展示多条, 行高相同, 以每行展示 4 条为例子</div>
        <div>图片宽度按宽度比例放 4 个, 宽高成比例 1:1 的图片</div>
        <div>内容两边 padding 为 24, 图片上下左右间隔为 16</div>
      </template>
      <template v-slot="{ item }">
        <!-- 通过类型来区分是标题还是图片 -->
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
  // 构建列表数据
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

const update = (startIndex: number, endIndex: number) => {
  console.log(startIndex, endIndex)
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
```

### 4. 滚动到指定元素

```vue
<template>
  <div>
    <BetterVirtualScroll ref="scrollRef">
      <!-- ... -->
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const scrollRef = ref()
const scrollToTop = () => {
  scrollRef.value.scrollTo(100)
}

const scrollToId = () => {
  scrollRef.value.scrollToItemById('qwe85a1sf')
}

const scrollToIndex = () => {
  scrollRef.value.scrollToItemByIndex(18)
}
</script>

<style lang="less" scoped></style>
```

### 5. 支持吸顶

在 `before` 插槽中，可以通过 `css3` 的 `position: sticky;` 实现吸顶效果

```vue
<template>
  <div>
    <BetterVirtualScroll ref="scrollRef" ...>
      <template #before>
        <div class="sticky-top">我可以吸顶</div>
      </template>
      <!-- ... -->
    </BetterVirtualScroll>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}
</style>
```
