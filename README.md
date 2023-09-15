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
