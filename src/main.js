import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/dist/index.css'
import router from './router'
import { createPinia } from 'pinia'
import { setupI18n } from './i18n'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

async function bootstrap() {
  const app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.use(router)
  app.use(createPinia())
  app.use(ElementPlus)
  app.use(await setupI18n())
  app.mount('#app')
}

bootstrap()
