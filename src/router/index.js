import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import registerRouterHook from './routerPermission'

const routes = [{ path: '/', name: 'Home', component: Home }]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

registerRouterHook(router)
export default router
