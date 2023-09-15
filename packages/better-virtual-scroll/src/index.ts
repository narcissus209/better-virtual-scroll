import { BetterVirtualScroll } from './components'

export * from './components'
export default {
  install: (app: any) => {
    app.component('BetterVirtualScroll', BetterVirtualScroll)
  },
}
