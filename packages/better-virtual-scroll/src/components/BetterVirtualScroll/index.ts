/* eslint-disable @typescript-eslint/ban-types */
import BetterVirtualScroll from './BetterVirtualScroll.vue'

export { BetterVirtualScroll }
export default BetterVirtualScroll

type ComponentType<T> = T extends new (...angs: any) => {} ? 'new' : T extends (...args: any) => any ? 'function' : ''
type NewComponentParams<T> = T extends new (...angs: any) => infer EX ? EX : {}
type GenComponentParams<T> = T extends (
  props: infer P,
  ctx: {
    slots: infer S
    attrs: any
    emit: infer E
  },
  expose: (exposed: infer EX) => any,
  ...args: any
) => any
  ? { $props: P; $slots: S; $emit: E; exposed: EX }
  : {}

type ComponentInstance<T> = ComponentType<T> extends 'new' ? NewComponentParams<T> : GenComponentParams<T>

type BetterVirtualScrollInstanceOrigin = ComponentInstance<typeof BetterVirtualScroll>
export type BetterVirtualScrollInstance = Omit<BetterVirtualScrollInstanceOrigin, 'exposed'> &
  BetterVirtualScrollInstanceOrigin['exposed']
export type BetterVirtualScrollProps = BetterVirtualScrollInstanceOrigin['$props']
export type BetterVirtualScrollSlots = BetterVirtualScrollInstanceOrigin['$slots']
export type BetterVirtualScrollEmit = BetterVirtualScrollInstanceOrigin['$emit']
export type BetterVirtualScrollExposed = BetterVirtualScrollInstanceOrigin['exposed']
