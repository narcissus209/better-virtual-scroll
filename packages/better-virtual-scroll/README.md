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

- `updateCount`: 如果列表数据更新了，可通过修改此字段来更新页面数据

  ```ts
  type UpdateCount = number
  ```

## Usage

### 简单的 demo1

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
