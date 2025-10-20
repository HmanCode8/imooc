<template>
  <div class="relative fhd:h-16 4k:h-20 ultra:h-28 w-full overflow-hidden">
    <!-- 背景图片 -->
    <div class="absolute inset-0">
      <img src="/src/assets/sys-header.webp" alt="系统背景" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-blue-900/80"></div>
    </div>

    <!-- 头部内容 -->
    <div class="relative z-10 h-full flex flex-col">
      <!-- 中央标题 -->
      <div class="flex-1 flex items-center justify-center">
        <h1
          class="text-white text-xl fhd:text-xl 4k:text-2xl ultra:text-3xl font-bold text-center drop-shadow-lg tracking-custom">
          {{ systemTitle }}
        </h1>
      </div>

      <!-- 底部信息 -->
      <div class="flex justify-between items-end">
        <!-- 左侧：关键指标 -->
        <!-- <div class="flex items-center gap-8"></div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-400">{{ totalIncome }}</div>
            <div class="text-sm text-blue-200">2018年总收入情况</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-400">{{ totalExpense }}</div>
            <div class="text-sm text-blue-200">2018年总支出情况</div>
          </div>
        </div> -->

        <!-- 右侧：时间信息 -->
        <div
          class="flex items-center gap-2 fhd:gap-3 4k:gap-4 text-blue-200 text-fhd-xs 4k:text-4k-sm ultra:text-ultra-base">
          <span class="text-sky-300 font-semibold text-fhd-sm 4k:text-4k-base ultra:text-ultra-lg">{{ currentTime
            }}</span>
          <span>{{ currentDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

console.log(window.global_config, 'window.global_config')
const systemTitle = ref(window.global_config?.system?.title || '大数据可视化展平台')
const currentTime = ref('')
const currentDate = ref('')
const screenWidth = ref(0)
const totalIncome = ref('12581189')
const totalExpense = ref('3912410')

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
