/* eslint-disable @typescript-eslint/ban-types */
import BetterVirtualScroll2 from './BetterVirtualScroll.vue'

export { BetterVirtualScroll2 }
export default BetterVirtualScroll2

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

type BetterVirtualScrollInstanceOrigin = ComponentInstance<typeof BetterVirtualScroll2>
export type BetterVirtualScroll2Instance = Omit<BetterVirtualScrollInstanceOrigin, 'exposed'> &
  BetterVirtualScrollInstanceOrigin['exposed']
export type BetterVirtualScroll2Props = BetterVirtualScrollInstanceOrigin['$props']
export type BetterVirtualScroll2Slots = BetterVirtualScrollInstanceOrigin['$slots']
export type BetterVirtualScroll2Emit = BetterVirtualScrollInstanceOrigin['$emit']
export type BetterVirtualScroll2Exposed = BetterVirtualScrollInstanceOrigin['exposed']
