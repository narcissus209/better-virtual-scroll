import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home.vue'),
      redirect: '/demo1',
      children: [
        {
          path: 'demo1',
          name: 'demo1',
          component: () => import('@/views/demo1.vue'),
        },
        {
          path: 'demo2',
          name: 'demo2',
          component: () => import('@/views/demo2.vue'),
        },
        {
          path: 'demo3',
          name: 'demo3',
          component: () => import('@/views/demo3.vue'),
        },
      ],
    },
  ],
})
