/*
 * [개념]
 * Vue Router 4의 전역 가드는 이동 대상이나 false를 return해 흐름을 제어한다.
 * scrollBehavior는 뒤로 가기 위치 복원과 화면 전환 시 스크롤 위치를 관리하고,
 * route props는 URL 파라미터를 화면 컴포넌트의 명시적인 props로 전달한다.
 *
 * [Vue 2였다면]
 * Vue Router 3에서는 new VueRouter({ mode: 'history', routes })로 인스턴스를 만들고,
 * 가드에서 next()를 반드시 호출했다. catch-all 경로도 path: '*'로 선언했다.
 */
import { createRouter, createWebHistory } from 'vue-router'

import JobListView from '@/views/JobListView.vue'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path: '/',
    redirect: '/jobs',
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: JobListView,
    meta: { title: '공고 목록' },
  },
  {
    path: '/jobs/:id(\\d+)',
    name: 'job-detail',
    component: () => import('@/views/JobDetailView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/scraps',
    name: 'scraps',
    component: () => import('@/views/ScrapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/jobs',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => resolve(savedPosition))
      })
    }

    if (to.name === from.name) return false

    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | 생활일자리`
    : '생활일자리'
})

export default router
