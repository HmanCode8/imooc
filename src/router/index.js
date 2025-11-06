import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import StatisticalAnalysis from '@/pages/StatisticalAnalysis.vue'
import CustomQuery from '../pages/CustomQuery.vue'
import registerRouterHook from './routerPermission'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/home', name: 'Home', component: Home },
  { path: '/statistical-analysis', name: 'StatisticalAnalysis', component: StatisticalAnalysis },
  { path: '/custom-query', name: 'CustomQuery', component: CustomQuery },
]

console.log(window.global_config, 'ffff')
const router = createRouter({
  // 改为 history 模式
  history: createWebHashHistory(),
  routes,
})

// registerRouterHook(router)
export default router
