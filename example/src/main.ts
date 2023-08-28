import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

import { router } from './router'
app.use(router)

import 'better-virtual-scroll/dist/es/style.css'

app.mount('#app')
