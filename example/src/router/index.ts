import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/demo1',
    },
    {
      path: '/demo1',
      name: 'demo1',
      component: () => import('@/views/demo1.vue'),
    },
  ],
})

export default router
