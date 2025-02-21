<template>
  <div ref="betterVirtualScrollRef" class="better-virtual-scroll" @scroll.passive="onScroll">
    <slot name="before"></slot>
    <div ref="wrapperRef" class="better-virtual-scroll-wrapper" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in renderList"
        :key="item.data.id"
        class="better-virtual-scroll-item"
        :style="{ transform: item.transform }"
      >
        <slot :item="item.data" :index="item.index" :active="item.active"></slot>
      </div>
    </div>
    <slot name="after"></slot>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number; height?: number; width?: number | '100%' }">
import { nextTick, onMounted, ref, shallowRef, type Ref, watch } from 'vue'

type VirtualListItem = {
  data: T
  top: number
  left: number
  height: number
  width: number | string
  transform: string
  index: number
  active: boolean
}

const props = withDefaults(
  defineProps<{
    list: T[]
    itemHeight?: number
    buffer?: number // 预留显示的像素
    scrollTop?: number
  }>(),
  {
    scrollTop: 0,
  },
)

const emits = defineEmits<{
  (event: 'scrollStart', e: Event): void
  (event: 'scrollEnd', e: Event): void
  (event: 'update', upStartIndex: number, midStartIndex: number, midEndIndex: number, downEndIndex: number): void
  (event: 'hotUpdate', midStartIndex: number, midEndIndex: number): void
}>()

// 减少后面的判断，此值必定存在
const betterVirtualScrollRef = ref() as Ref<HTMLDivElement>
const getScrollTop = () => {
  if (!betterVirtualScrollRef.value?.scrollTop) return 0
  return Math.max(betterVirtualScrollRef.value.scrollTop - beforeDivHeight, 0)
}
const MaxWidth = '100%'
const wrapperRef = ref() as Ref<HTMLDivElement>
let viewHeight = 0 // 可视区域的高度
let viewWidth = 0
let beforeDivHeight = 0
let bufferHeight = 0 // 缓存区域的高度
const initStaticData = () => {
  const rect = betterVirtualScrollRef.value.getBoundingClientRect()
  viewHeight = rect.height
  viewWidth = rect.width
  beforeDivHeight = wrapperRef.value.offsetTop - betterVirtualScrollRef.value.offsetTop
  bufferHeight = props.buffer ? props.buffer : viewHeight
}

const offsetLeft = 16
const calcTops = (list: T[]) => {
  if (list[0]?.height && list[0]?.width) {
    let count = 1
    for (let i = 0; i < list.length; i++) {
      if (list[i].width !== MaxWidth) {
        count = Math.floor((viewWidth - offsetLeft) / (list[i].width as number))
        break
      }
    }
    return new Array<number>(count).fill(0)
  } else {
    return [0]
  }
}
const getArrMin = (arr: number[]) => {
  let res = { val: arr[0], index: 0 }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < res.val) {
      res = { val: arr[i], index: i }
    }
  }
  return res
}
const getArrMax = (arr: number[]) => {
  let res = { val: arr[0], index: 0 }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > res.val) {
      res = { val: arr[i], index: i }
    }
  }
  return res
}
const getWH = (item: T) => {
  if (item.height && item.width) {
    return { height: item.height, width: item.width }
  } else {
    return { height: props.itemHeight || 0, width: MaxWidth }
  }
}
const calcData = (list: T[]) => {
  const tops = calcTops(list)
  const _list: VirtualListItem[] = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const { width, height } = getWH(item)
    const tempItem = {
      data: item,
      top: 0,
      left: 0,
      height: height,
      width: width,
      active: false,
      transform: '',
      index: i,
    }
    if (width === MaxWidth) {
      tempItem.top = getArrMax(tops).val
      tempItem.left = 0
      const newTop = tempItem.top + tempItem.height
      tops.fill(newTop)
    } else {
      const { val, index } = getArrMin(tops)
      tempItem.top = val
      tempItem.left = index * (tempItem.width as number)
      const newTop = tempItem.top + tempItem.height
      tops[index] = newTop
    }
    tempItem.transform = `translate(${tempItem.left}px, ${tempItem.left}px)`
    _list.push(tempItem)
  }
  const contentHeight = getArrMax(tops).val
  return { list: _list, height: contentHeight }
}

let virtualList: VirtualListItem[] = []
let virtualListLen = 0
const totalHeight = ref(0) // 数据列表总高度
const initData = () => {
  const { list, height } = calcData(props.list)
  virtualList = list
  totalHeight.value = height
  virtualListLen = list.length
}

let preMidStartIndex = 0
// 获取可视区的开始下标
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
      if (scrollTop >= virtualList[i].top && scrollTop < virtualList[i + 1].top) {
        return i
      }
    }
    return 0
  }
}
// 获取可视区的结束下标
const getMidEndIndex = (scrollTop: number, midStartIndex: number) => {
  const midEndPosition = scrollTop + viewHeight
  // 可视区域的结束下标
  let midEndIndex = 0
  for (let i = midStartIndex + 1; i < virtualList.length - 2; i++) {
    if (virtualList[i].top <= midEndPosition && midEndPosition <= virtualList[i + 1].top) {
      midEndIndex = i
      break
    }
  }
  midEndIndex = midEndIndex ? midEndIndex : virtualList.length - 1
  return midEndIndex
}
// 获取上缓冲区的起始下标
const getUpStartIndex = (scrollTop: number, midStartIndex: number) => {
  const upStartPosition = Math.max(scrollTop - bufferHeight, 0)
  let upStartIndex = 0
  for (let i = midStartIndex - 1; i > 0; i--) {
    if (virtualList[i].top <= upStartPosition && upStartPosition <= virtualList[i + 1].top) {
      upStartIndex = i
      break
    }
  }
  upStartIndex = upStartIndex ? upStartIndex : 0
  return upStartIndex
}
// 获取下缓冲区的结束下标
const getDownEndIndex = (scrollTop: number, midEndIndex: number) => {
  const downEndPosition = scrollTop + viewHeight + bufferHeight
  let downEndIndex = 0
  for (let i = midEndIndex + 1; i < virtualList.length - 2; i++) {
    if (virtualList[i].top <= downEndPosition && downEndPosition <= virtualList[i + 1].top) {
      downEndIndex = i
      break
    }
  }
  downEndIndex = downEndIndex ? downEndIndex : virtualList.length - 1
  return downEndIndex
}

const transform = ref('')
let scrollRange = [0, 0]
const renderList = shallowRef<VirtualListItem[]>([])
const calcRenderList = () => {
  if (virtualListLen === 0) {
    transform.value = ''
    scrollRange = [0, 0]
    renderList.value = []
    preMidStartIndex = 0
    return
  }
  const scrollTop = getScrollTop()

  // 可视区的开始下标
  const midStartIndex = getMidStartIndex(scrollTop)
  preMidStartIndex = midStartIndex
  // 可视区的结束下标
  const midEndIndex = getMidEndIndex(scrollTop, midStartIndex)
  // 上缓冲区的起始下标
  const upStartIndex = getUpStartIndex(scrollTop, midStartIndex)
  // 下缓冲区的结束下标
  const downEndIndex = getDownEndIndex(scrollTop, midEndIndex)
  // 视图列表数据与移动
  const _renderList: VirtualListItem[] = []
  for (let i = upStartIndex; i <= downEndIndex; i++) {
    const active = i >= midStartIndex && i <= midEndIndex
    _renderList.push({ ...virtualList[i], active })
  }
  renderList.value = _renderList

  // 设置滚动时无需重新计算的范围
  const rangeIndex0 = ~~((upStartIndex + midStartIndex) / 2)
  const rangeIndex1 = Math.max(Math.min(~~((midStartIndex + midEndIndex) / 2), virtualListLen - 1), 0)
  const scrollRange0 = rangeIndex0 ? virtualList[rangeIndex0].top : 0
  const scrollRange1 = virtualList[rangeIndex1].top || 0
  scrollRange = [scrollRange0, scrollRange1]

  emits('update', upStartIndex, midStartIndex, midEndIndex, downEndIndex)
}

const calcRenderActive = () => {
  const scrollTop = getScrollTop()
  const midStartIndex = getMidStartIndex(scrollTop)
  const midEndIndex = getMidEndIndex(scrollTop, midStartIndex)

  const _renderList: VirtualListItem[] = []
  let isSame = true
  for (let i = 0; i < renderList.value.length; i++) {
    const item = renderList.value[i]
    const active = item.index >= midStartIndex && item.index <= midEndIndex
    if (active !== item.active) {
      item.active = active
      isSame = false
    }
    _renderList[i] = item
  }
  if (!isSame) {
    renderList.value = _renderList
  }
}

const EmitScrollEndTime = 400
let scrollTimer = 0
let isCalcScroll = false
const onScroll = (e: Event) => {
  if (!scrollTimer) {
    emits('scrollStart', e)
  } else {
    window.clearTimeout(scrollTimer)
    scrollTimer = 0
  }
  scrollTimer = window.setTimeout(() => {
    emits('scrollEnd', e)
  }, EmitScrollEndTime)

  if (isCalcScroll) return
  isCalcScroll = true
  requestAnimationFrame(() => {
    isCalcScroll = false
    const scrollTop = getScrollTop()
    if (!viewHeight) initStaticData()
    // 在指定范围内，只需要计算 renderList 的 active
    if (scrollRange[0] !== scrollRange[1] && scrollTop >= scrollRange[0] && scrollTop <= scrollRange[1]) {
      calcRenderActive()
    } else {
      calcRenderList()
    }
  })
}

let isInListen = false
const listenScrollTop = async () => {
  await nextTick()
  if (isInListen || props.scrollTop === undefined || !wrapperRef.value) return
  isInListen = true
  // 处理数据更新了 dom 还没刷新问题
  while (renderList.value.length !== wrapperRef.value.children.length) {
    await nextTick()
  }
  scrollTo({ top: Math.max(props.scrollTop, 0), behavior: 'instant' })
  isInListen = false
}

watch(() => props.scrollTop, listenScrollTop, {
  immediate: true,
})

watch(
  () => props.list,
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
    if (id === virtualList[i].data.id) {
      scrollTo({ top: virtualList[i].top, ...opt })
      break
    }
  }
}

const scrollToItemByIndex = (index: number, opt?: Omit<ScrollOpt, 'top'>) => {
  scrollTo({ top: virtualList[index].top, ...opt })
}

defineExpose({ scrollTo, scrollToItemById, scrollToItemByIndex })
</script>
<style>
.better-virtual-scroll {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  position: relative;
}
.better-virtual-scroll-wrapper {
  position: relative;
}
.better-virtual-scroll-item {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
