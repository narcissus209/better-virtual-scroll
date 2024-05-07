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
          <slot :item="item.data" :index="item.index" :active="item.active"></slot>
        </template>
      </div>
    </div>
    <slot name="after"></slot>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number; size?: number }">
import { nextTick, onMounted, ref, type Ref, shallowRef, watch } from 'vue'

type VirtualData = {
  data: T
  index: number
  active?: boolean
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
  (event: 'update', upStartIndex: number, midStartIndex: number, midEndIndex: number, downEndIndex: number): void
}>()

// 减少后面的判断，此值必定存在
const betterVirtualScrollRef = ref() as Ref<HTMLDivElement>
const getScrollTop = () => betterVirtualScrollRef.value.scrollTop
const wrapperRef = ref() as Ref<HTMLDivElement>
let beforeDivHeight = 0
let viewHeight = 0 // 可视区域的高度
let bufferHeight = 0 // 缓存区域的高度
const initStaticData = () => {
  viewHeight = betterVirtualScrollRef.value.getBoundingClientRect().height
  beforeDivHeight = wrapperRef.value.getBoundingClientRect().top
  bufferHeight = props.buffer ? props.buffer : viewHeight
}

let virtualList: VirtualListItem[] = []
let virtualListLen = 0
let canScrollHeight = 0
const totalHeight = ref(0) // 数据列表总高度
const initData = () => {
  const _list: VirtualListItem[] = []
  let top = beforeDivHeight
  for (let index = 0; index < props.list.length; index++) {
    const height = props.list[index].size || props.itemSize || 0
    if (height) {
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
  totalHeight.value = top - beforeDivHeight
  virtualList = _list
  virtualListLen = _list.length
  canScrollHeight = Math.max(0, top - viewHeight)
}

let preMidStartIndex = 0
const getMidStartIndex = (scrollTop: number) => {
  if (scrollTop <= virtualList[0].top) return 0
  const oldIndex = Math.min(preMidStartIndex, virtualListLen - 1)
  if (scrollTop === virtualList[oldIndex].top) {
    return oldIndex
  } else if (scrollTop > virtualList[oldIndex].top) {
    for (let i = oldIndex; i < virtualListLen - 1; i++) {
      if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i + 1].top) {
        return i
      }
    }
    return virtualListLen - 1
  } else {
    for (let i = oldIndex; i > 0; i--) {
      if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i - 1].top) {
        return i
      }
    }
    return 0
  }
}

const transform = ref('')
let scrollRange = [0, 0]
const renderList = shallowRef<VirtualData[]>([])
let memberTop = 0
const calcRenderList = (scrollTop?: number) => {
  if (virtualListLen === 0) {
    transform.value = ''
    scrollRange = [0, 0]
    renderList.value = []
    memberTop = 0
    preMidStartIndex = 0
    return
  }
  memberTop = typeof scrollTop === 'number' ? scrollTop : memberTop
  const threshold = {
    top: Math.max(memberTop - bufferHeight, 0),
    midStart: memberTop,
    midEnd: memberTop + viewHeight,
    bottom: memberTop + viewHeight + bufferHeight,
  }

  // 可视区域的开始下标
  const midStartIndex = getMidStartIndex(threshold.midStart)
  preMidStartIndex = midStartIndex

  // 可视区域的结束下标
  let midEndIndex = 0
  for (let i = midStartIndex + 1; i < virtualList.length - 2; i++) {
    if (virtualList[i].top <= threshold.midEnd && threshold.midEnd <= virtualList[i + 1].top) {
      midEndIndex = i
      break
    }
  }
  midEndIndex = midEndIndex ? midEndIndex : virtualList.length - 1

  // 上阈值开始下标
  let upStartIndex = 0
  for (let i = midStartIndex - 1; i > 0; i--) {
    if (virtualList[i].top <= threshold.top && threshold.top <= virtualList[i + 1].top) {
      upStartIndex = i
      break
    }
  }
  upStartIndex = upStartIndex ? upStartIndex : 0

  // 下阈值结束下标
  let downEndIndex = 0
  for (let i = upStartIndex + 1; i < virtualList.length - 2; i++) {
    if (virtualList[i].top <= threshold.bottom && threshold.bottom <= virtualList[i + 1].top) {
      downEndIndex = i
      break
    }
  }
  downEndIndex = downEndIndex ? downEndIndex : virtualList.length - 1

  const activeIndex0 = Math.floor((upStartIndex + midStartIndex) / 2)
  const activeIndex1 = Math.floor((midEndIndex + downEndIndex) / 2)
  // 视图列表数据与移动
  const _renderList: VirtualData[] = []
  for (let i = upStartIndex; i <= downEndIndex; i++) {
    const active = i >= activeIndex0 && i <= activeIndex1
    _renderList.push(...virtualList[i].children.map(item => ({ ...item, active })))
  }
  renderList.value = _renderList
  transform.value = `translate3d(0, ${virtualList[upStartIndex].top - beforeDivHeight}px, 0)`

  // 设置滚动时无需重新计算的范围
  const rangeIndex0 = Math.floor((upStartIndex + midStartIndex) / 2)
  const rangeIndex1 = Math.max(Math.min(Math.floor((midStartIndex + midEndIndex) / 2), virtualListLen - 1), 0)
  const scrollRange0 = rangeIndex0 ? virtualList[rangeIndex0].top : 0
  const scrollRange1 = virtualList[rangeIndex1].top
  scrollRange = [scrollRange0, scrollRange1]

  emits('update', upStartIndex, midStartIndex, midEndIndex, downEndIndex)
}

const onScroll = () => {
  requestAnimationFrame(() => {
    const scrollTop = getScrollTop()
    if (scrollRange[0] !== scrollRange[1]) {
      if (scrollTop >= scrollRange[0] && scrollTop <= scrollRange[1]) {
        return
      }
    }
    calcRenderList(scrollTop)
  })
}

watch(
  () => props.scrollTop,
  async () => {
    if (props.scrollTop === undefined) return
    await nextTick()
    memberTop = Math.min(props.scrollTop, canScrollHeight)
    scrollTo({ top: memberTop, behavior: 'instant' })
  },
  {
    immediate: true,
  },
)

watch(
  () => props.updateCount,
  async () => {
    await nextTick()
    initStaticData()
    initData()
    calcRenderList()
  },
)

onMounted(() => {
  if (!props.list.length) return
  initStaticData()
  initData()
  calcRenderList()
})

type ScrollOpt = {
  top: number
  behavior?: ScrollBehavior
  offsetHeight?: number
}
const scrollTo = (opt: ScrollOpt) => {
  const top = opt.top + (opt.offsetHeight || 0)
  const behavior = opt.behavior || 'smooth'
  betterVirtualScrollRef.value.scrollTo({ top, behavior })
}

const scrollToItemById = (id: T['id'], opt?: Omit<ScrollOpt, 'top'>) => {
  for (let i = 0; i < virtualList.length; i++) {
    for (let j = 0; j < virtualList[i].children.length; j++) {
      if (id === virtualList[i].children[j].data.id) {
        scrollTo({ top: virtualList[i].top, ...opt })
        break
      }
    }
  }
}

const scrollToItemByIndex = (index: number, opt?: Omit<ScrollOpt, 'top'>) => {
  let forIndex = -1
  for (let i = 0; i < virtualList.length; i++) {
    forIndex += virtualList[i].children.length
    if (forIndex >= index) {
      scrollTo({ top: virtualList[i].top, ...opt })
      break
    }
  }
}

defineExpose({ scrollTo, scrollToItemById, scrollToItemByIndex })
</script>
