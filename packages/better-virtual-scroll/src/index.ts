import type { App } from 'vue'
import { BetterVirtualScroll } from './components'

export * from './components'
export default {
  install: (app: App) => {
    app.component('BetterVirtualScroll', BetterVirtualScroll)
  },
}
