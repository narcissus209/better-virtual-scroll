<template>
  <div
    ref="betterVirtualScrollRef"
    class="better-virtual-scroll"
    style="height: 100%; width: 100%; overflow-y: auto; position: relative"
    @scroll.passive="onScroll"
  >
    <slot name="before"></slot>
    <div class="better-virtual-scroll-wrapper" ref="wrapperRef" :style="{ height: totalHeight + 'px' }">
      <div class="better-virtual-scroll-view-list" :style="{ transform: transform }">
        <template v-for="item in renderList" :key="item.data.id">
          <slot :item="item.data" :index="item.index"></slot>
        </template>
      </div>
    </div>
    <slot name="after"></slot>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number; size?: number }">
import { nextTick, onMounted, ref, type Ref, shallowRef, watch } from 'vue'

// type T = {
//   id: string | number
//   size?: number
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: any
// }

type VirtualData = {
  data: T
  index: number
}

type VirtualListItem = {
  height: number
  top: number
  children: VirtualData[]
}

const props = withDefaults(
  defineProps<{
    list: T[]
    itemSize?: number
    buffer?: number // 预留显示的像素
    updateCount?: number
    scrollTop?: number
  }>(),
  {
    scrollTop: 0,
  },
)

const emits = defineEmits<{
  (event: 'update', startIndex: number, endIndex: number): void
}>()

// 减少后面的判断，此值必定存在
const betterVirtualScrollRef = ref() as Ref<HTMLDivElement>
const getScrollTop = () => betterVirtualScrollRef.value.scrollTop
const wrapperRef = ref() as Ref<HTMLDivElement>
let beforeDivHeight = 0

let virtualList: VirtualListItem[] = []
let virtualListLen = 0
const totalHeight = ref(0) // 数据列表总高度
let minHeight = Number.MAX_SAFE_INTEGER // 最小行高
let maxHeight = -1 // 最大行高
let bufferCount = 0 // 上下缓存数量
let maxViewCount = 0 // 一屏的最大数量
const initData = () => {
  beforeDivHeight = wrapperRef.value.getBoundingClientRect().top
  const _list: VirtualListItem[] = []
  let top = 0
  for (let index = 0; index < props.list.length; index++) {
    const height = props.list[index].size || props.itemSize || 0
    if (height) {
      minHeight = minHeight < height ? minHeight : height
      maxHeight = maxHeight > height ? maxHeight : height
      _list.push({
        top,
        height,
        children: [],
      })
    }
    _list[_list.length - 1].children.push({
      index: index,
      data: props.list[index],
    })
    top += height
  }

  // 数据列表总高度与虚拟列表
  totalHeight.value = top
  virtualList = _list
  virtualListLen = _list.length

  // 计算一屏可展示的数量
  const viewHeight = betterVirtualScrollRef.value.getBoundingClientRect().height
  maxViewCount = Math.ceil(viewHeight / minHeight)

  const canScrollHeight = top + beforeDivHeight - viewHeight
  memberTop = Math.min(memberTop, canScrollHeight)

  // 计算上下缓冲去可展示的数量
  const bufferHeight = props.buffer && props.buffer > viewHeight ? props.buffer : viewHeight
  bufferCount = Math.ceil(bufferHeight / minHeight)
}

let preMidStartIndex = 0
const getStartIndex = (scrollTop: number) => {
  if (scrollTop <= minHeight) return 0
  if (virtualListLen <= maxViewCount) return 0
  let startIndex = -1
  // 边界情况，删除过多
  if (preMidStartIndex >= virtualListLen - 1) {
    if (virtualList[virtualListLen - 1].top < scrollTop) {
      startIndex = Math.max(virtualListLen - maxViewCount, 0)
    } else {
      for (let i = virtualListLen - 2; i > 0; i--) {
        if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i + 1].top) {
          startIndex = i
          break
        }
      }
    }
    return startIndex
  }
  if (scrollTop === virtualList[preMidStartIndex].top) {
    startIndex = preMidStartIndex
  } else if (scrollTop > virtualList[preMidStartIndex].top) {
    for (let i = preMidStartIndex; i < virtualListLen - 1; i++) {
      if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i + 1].top) {
        startIndex = i
        break
      }
    }
  } else {
    for (let i = preMidStartIndex; i > 0; i--) {
      if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i + 1].top) {
        startIndex = i
        break
      }
    }
  }

  return startIndex
}

const transform = ref('')
let scrollRange = [0, 0]
const renderList = shallowRef<VirtualData[]>([])
let memberTop = 0
const calcRenderList = () => {
  const scrollTop = Math.max(memberTop - beforeDivHeight, 0)

  // 可视区域的开始下标
  const midStartIndex = getStartIndex(scrollTop)
  preMidStartIndex = midStartIndex
  // 可视区域的结束
  const midEndIndex = Math.min(midStartIndex + maxViewCount, virtualListLen)

  // 上缓冲区开始的下班
  const upStartIndex = Math.max(midStartIndex - bufferCount, 0)

  // 下缓冲区结束的下标
  const downEndIndex = Math.min(midEndIndex + bufferCount, virtualListLen)

  // 视图列表数据与移动
  const viewList = virtualList.slice(upStartIndex, downEndIndex)
  const _renderList: VirtualData[] = []
  for (let i = 0; i < viewList.length; i++) {
    _renderList.push(...viewList[i].children)
  }
  renderList.value = _renderList
  transform.value = `translate3d(0, ${virtualList[upStartIndex]?.top || 0}px, 0)`

  // 设置滚动时无需重新计算的范围
  const rangeIndex0 = Math.max(Math.floor(midStartIndex - bufferCount / 2), 0)
  const rangeIndex1 = Math.max(Math.min(Math.floor(midStartIndex + bufferCount / 2), virtualListLen - 1), 0)
  scrollRange = [virtualList[rangeIndex0]?.top || 0, virtualList[rangeIndex1]?.top || 0]
  emits('update', upStartIndex, downEndIndex)
}

const onScroll = () => {
  requestAnimationFrame(() => {
    const scrollTop = getScrollTop()
    if (scrollRange[0] !== scrollRange[1]) {
      if (scrollTop >= scrollRange[0] && scrollTop <= scrollRange[1]) {
        return
      }
    }
    memberTop = scrollTop
    calcRenderList()
  })
}

const scrollTo = (top: number, behavior: ScrollBehavior = 'smooth') => {
  betterVirtualScrollRef.value.scrollTo({ top, behavior })
}

const scrollToItemById = (id: T['id'], behavior: ScrollBehavior = 'smooth') => {
  for (let i = 0; i < virtualList.length; i++) {
    for (let j = 0; j < virtualList[i].children.length; j++) {
      if (id === virtualList[i].children[j].data.id) {
        scrollTo(virtualList[i].top + beforeDivHeight, behavior)
        break
      }
    }
  }
}

const scrollToItemByIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
  let forIndex = -1
  for (let i = 0; i < virtualList.length; i++) {
    forIndex += virtualList[i].children.length
    if (forIndex >= index) {
      scrollTo(virtualList[i].top + beforeDivHeight, behavior)
      break
    }
  }
}

defineExpose({ scrollTo, scrollToItemById, scrollToItemByIndex })

watch(
  () => props.scrollTop,
  async () => {
    if (props.scrollTop === undefined) return
    memberTop = props.scrollTop
    await nextTick()
    scrollTo(memberTop, 'instant')
  },
  {
    immediate: true,
  },
)

watch(
  () => props.updateCount,
  async () => {
    await nextTick()
    initData()
    calcRenderList()
  },
)

onMounted(() => {
  if (!props.list.length) return
  initData()
  calcRenderList()
})
</script>
