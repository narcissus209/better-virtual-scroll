import { BetterVirtualScroll } from './BetterVirtualScroll'

export { BetterVirtualScroll }
export default {
  install: (app: any) => {
    app.component('BetterVirtualScroll', BetterVirtualScroll)
  },
}
