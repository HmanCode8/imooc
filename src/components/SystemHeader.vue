<template>
  <div class="relative h-14 w-full theme-bg overflow-hidden flex justify-between items-center px-2">
    <div class="flex items-center">
      <div class="w-10 h-10 border rounded-full flex items-center justify-center">
        <i class="iconfont icon-cheliangyizhangtu text-3xl"></i>
      </div>
      <div class="pl-5">{{ systemTitle }}</div>
    </div>
    <div class="flex items-center h-full py-1">
      <div v-for="m in menuList" :key="m.id" @click="onMenuChage(m)"
        :class="`mx-10 px-5 h-full  flex items-center rounded-sm hover:cursor-pointer ${activeMenu === m.id ? 'theme-bg-dark' : ''}`">
        <i :class="`iconfont ${m.icon} text-2xl`"></i>
        <span class="px-2">{{ m.name }}</span>
      </div>
    </div>
    <div @click="globalStore.setThemeVisible(true)">
      <span>{{ currentDate }} {{ currentTime }}</span>
      <span class="px-2">主题</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGlobalStore } from '@/stores/global';
import { menuList } from '../mock/menu'


console.log(window.global_config, 'window.global_config')
const systemTitle = ref(window.global_config?.system?.title || '大数据可视化展平台')
const activeMenu = ref("onemap")
const currentTime = ref('')
const currentDate = ref('')
const screenWidth = ref(0)

const globalStore = useGlobalStore();
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  })
}

const onMenuChage = (m) => {
  activeMenu.value = m.id
  globalStore.setMenuBarList(m.children)
}

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

let timer = null

onMounted(() => {
  updateTime()
  updateScreenWidth()
  onMenuChage(menuList[0])
  timer = setInterval(updateTime, 1000)
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<!-- 所有样式都使用 Tailwind CSS 类，无需自定义 CSS -->
