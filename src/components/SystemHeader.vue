<template>
  <div class="relative h-14 w-full theme-bg overflow-hidden" @click="globalStore.setThemeVisible(true)">
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGlobalStore } from '@/stores/global';
console.log(window.global_config, 'window.global_config')
const systemTitle = ref(window.global_config?.system?.title || '大数据可视化展平台')
const currentTime = ref('')
const currentDate = ref('')
const screenWidth = ref(0)
const totalIncome = ref('12581189')
const totalExpense = ref('3912410')
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

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

let timer = null

onMounted(() => {
  updateTime()
  updateScreenWidth()
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
