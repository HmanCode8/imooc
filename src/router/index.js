import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const routes = [
  {
    path: '/',
    redirect: '/onemap/realtime'
  },
  {
    path: '/onemap',
    name: 'OneMap',
    // component: Home,
    children: [
      {
        path: 'realtime',
        name: 'Realtime',
        // component: () => import('@/pages/Car.vue')
      },
      {
        path: 'comprehensive',
        name: 'Comprehensive',
        component: () => import('@/pages/onemap/Comprehensive.vue')
      },
      {
        path: 'trajectory',
        name: 'Trajectory',
        component: () => import('@/pages/onemap/Trajectory.vue')
      }
    ]
  },
  {
    path: '/quyu',
    name: 'Quyu',
    // component: Home,
    children: [
      {
        path: 'processAudit',
        name: 'ProcessAudit',
        component: () => import('@/pages/quyu/ProcessAudit.vue')
      },
      {
        path: 'spaceEdit',
        name: 'SpaceEdit',
        component: () => import('@/pages/quyu/SpaceEdit.vue')
      },
      {
        path: 'areaInfo',
        name: 'AreaInfo',
        component: () => import('@/pages/quyu/AreaInfo.vue')
      },
      {
        path: 'recordQuery',
        name: 'RecordQuery',
        component: () => import('@/pages/quyu/RecordQuery.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// registerRouterHook(router)
export default router
