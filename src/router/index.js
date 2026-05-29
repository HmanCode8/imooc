import { createRouter, createWebHashHistory } from 'vue-router'
// import registerRouterHook from "./routerPermission.js";
import Home from '@/pages/Home.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/login/Register.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/login/ForgotPassword.vue'),
  },
  {
    path: '/',
    component: Home,
    redirect: '/onemap/realtime',
    children: [
      {
        path: 'onemap',
        name: 'OneMap',
        children: [
          {
            path: 'realtime',
            name: 'Realtime',
            component: () => import('@/pages/onemap/CarQuery.vue'),
          },
          {
            path: 'vehicleManage',
            name: 'VehicleManage',
            component: () => import('@/pages/onemap/VehicleManage.vue'),
          },
          {
            path: 'comprehensive',
            name: 'Comprehensive',
            component: () => import('@/pages/onemap/Comprehensive.vue'),
          },
          {
            path: 'trajectory',
            name: 'Trajectory',
            component: () => import('@/pages/onemap/Trajectory.vue'),
          },
        ],
      },
      {
        path: 'quyu',
        name: 'Quyu',
        children: [
          {
            path: 'processAuditForLine',
            name: 'ProcessAuditForLine',
            component: () => import('@/pages/quyu/ProcessAuditForLine.vue'),
          },
          {
            path: 'processAuditForResLine',
            name: 'processAuditForResLine',
            component: () => import('@/pages/quyu/ProcessAuditForLine.vue'),
          },
          {
            path: 'processAuditForArea',
            name: 'ProcessAuditForArea',
            component: () => import('@/pages/quyu/ProcessAuditForArea.vue'),
          },
          {
            path: 'processAuditForParking',
            name: 'ProcessAuditForParking',
            component: () => import('@/pages/quyu/ProcessAuditForParking.vue'),
          },
          {
            path: 'spaceEdit',
            name: 'SpaceEdit',
            component: () => import('@/pages/quyu/SpaceEdit.vue'),
          },
          {
            path: 'areaInfo',
            name: 'AreaInfo',
            component: () => import('@/pages/quyu/AreaInfo.vue'),
          },
          {
            path: 'recordQuery',
            name: 'RecordQuery',
            component: () => import('@/pages/quyu/RecordQuery.vue'),
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 全局前置守卫：登录校验
router.beforeEach((to, from, next) => {
  // 获取登录凭证
  const token = sessionStorage.getItem('casToken')
  // 白名单：登录、注册页不需要校验
  const whiteList = ['/login', '/register', '/forgot-password']

  if (token) {
    // 已登录，直接放行
    next()
  } else {
    // 未登录：访问白名单页面放行，否则跳登录页
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
