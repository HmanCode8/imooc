<template>
  <div class="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden"
    :style="containerStyle">
    <!-- 控制按钮图标 - 浮动在右上角 -->
    <div v-if="showControls" class="absolute top-2 right-0 z-20">
      <div class="relative">
        <button @click="toggleControls"
          class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          :class="{ 'bg-white/10 text-white': showControlPanel }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- 控制面板 -->
        <Transition name="control-panel">
          <div v-if="showControlPanel"
            class="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-xl z-50 min-w-64">
            <div class="space-y-4">
              <!-- 状态信息 -->
              <div class="text-sm text-gray-300 space-y-1">
                <div class="flex justify-between">
                  <span>总计:</span>
                  <span class="text-white">{{ totalCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span>滚动速度:</span>
                  <span class="text-white">{{ scrollSpeed }}px/s</span>
                </div>
                <div v-if="isPaused" class="flex justify-between">
                  <span>状态:</span>
                  <span class="text-yellow-400 animate-pulse">鼠标悬停暂停</span>
                </div>
              </div>

              <!-- 控制按钮 -->
              <div class="flex gap-2">
                <button @click="toggleScroll" class="flex-1 px-3 py-2 text-sm rounded-md transition-all duration-200"
                  :class="isScrolling
                    ? 'bg-green-600/20 text-green-400 border border-green-400/30 hover:bg-green-600/30'
                    : 'bg-blue-600/20 text-blue-400 border border-blue-400/30 hover:bg-blue-600/30'">
                  {{ isScrolling ? '暂停' : '开始' }}
                </button>
                <button @click="resetScroll"
                  class="px-3 py-2 text-sm bg-gray-600/20 text-gray-300 border border-gray-400/30 rounded-md hover:bg-gray-600/30 transition-all duration-200">
                  重置
                </button>
              </div>

              <!-- 速度控制 -->
              <div class="space-y-2">
                <label class="text-sm text-gray-300">滚动速度</label>
                <input type="range" :min="10" :max="100" :value="scrollSpeed" @input="updateScrollSpeed"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <div class="flex justify-between text-xs text-gray-400">
                  <span>慢</span>
                  <span>快</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="relative overflow-x-auto overflow-y-hidden h-full" ref="tableWrapper" @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave">
      <table class="w-full border-collapse table-fixed min-w-max">
        <!-- 表头 -->
        <thead class="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm">
          <tr>
            <th v-for="(column, index) in columns" :key="index"
              :class="['px-3 py-3 text-left text-sm font-semibold text-gray-200 border-b border-white/6 whitespace-nowrap', column.className]"
              :style="{ width: column.width || 'auto' }">
              {{ column.title }}
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody ref="scrollContent" :style="scrollStyle" class="bg-transparent">
          <tr v-for="(row, rowIndex) in displayData"
            :key="`${row.id || rowIndex}-${Math.floor(rowIndex / originalDataLength)}`" :class="[
              'h-10 transition-colors duration-200 cursor-pointer',
              rowIndex % 2 === 0 ? 'bg-white/2' : 'bg-transparent',
              'hover:bg-blue-500/10'
            ]" @click="handleRowClick(row, rowIndex)">
            <td v-for="(column, colIndex) in columns" :key="colIndex"
              :class="['px-3 py-3 text-sm text-gray-300 border-b border-white/5 whitespace-nowrap overflow-hidden text-ellipsis align-middle', column.className]">
              <slot :name="`cell-${column.key}`" :row="row" :column="column" :value="row[column.key]" :index="rowIndex">
                <span v-if="column.formatter" v-html="column.formatter(row[column.key], row, rowIndex)"></span>
                <span v-else>{{ row[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '数据表格'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  scrollSpeed: {
    type: Number,
    default: 30
  },
  autoStart: {
    type: Boolean,
    default: true
  },
  scrollDelay: {
    type: Number,
    default: 1000
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['row-click', 'scroll-start', 'scroll-stop'])

// 响应式数据
const tableWrapper = ref(null)
const scrollContent = ref(null)
const displayData = ref([])
const originalDataLength = ref(0)
const isScrolling = ref(false)
const scrollSpeed = ref(props.scrollSpeed)
const totalCount = ref(0)
const currentScrollTop = ref(0)
const animationId = ref(null)
const isPaused = ref(false)
const showControlPanel = ref(false)

// 计算属性
const containerStyle = computed(() => {
  // 根据数据量计算高度：表头高度 + 显示行数 * 行高
  const headerHeight = props.showHeader ? 50 : 0 // 表头高度
  const rowHeight = 40 // 每行高度
  const visibleRows = Math.min(originalDataLength.value, 8) // 最多显示8行
  const dataHeight = visibleRows * rowHeight
  const totalHeight = headerHeight + dataHeight

  return {
    height: props.height === 'auto' ? `${totalHeight}px` : props.height,
    width: props.width
  }
})

const scrollStyle = computed(() => ({
  transform: `translateY(-${currentScrollTop.value}px)`,
  transition: isScrolling.value ? 'none' : 'transform 0.3s ease'
}))

// 初始化数据
const initData = () => {
  if (!props.data || props.data.length === 0) return

  originalDataLength.value = props.data.length
  // 复制数据4次以确保无缝循环
  const duplicatedData = [...props.data, ...props.data, ...props.data, ...props.data]
  displayData.value = duplicatedData
  totalCount.value = props.data.length

  console.log('初始化数据:', {
    originalLength: originalDataLength.value,
    displayLength: displayData.value.length,
    totalCount: totalCount.value,
    data: props.data,
    firstRow: props.data[0],
    lastRow: props.data[props.data.length - 1]
  })
}

// 开始滚动
const startScroll = () => {
  if (isScrolling.value) return

  isScrolling.value = true
  emit('scroll-start')

  const animate = () => {
    if (!isScrolling.value || isPaused.value) {
      animationId.value = requestAnimationFrame(animate)
      return
    }

    currentScrollTop.value += scrollSpeed.value / 60 // 60fps

    // 当滚动到原始数据高度时，重置到开始位置（无缝循环）
    const singleDataHeight = originalDataLength.value * 40 // 假设每行40px高度
    if (currentScrollTop.value >= singleDataHeight) {
      currentScrollTop.value = 0
    }

    animationId.value = requestAnimationFrame(animate)
  }

  animate()
}

// 停止滚动
const stopScroll = () => {
  isScrolling.value = false
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  emit('scroll-stop')
}

// 切换滚动状态
const toggleScroll = () => {
  if (isScrolling.value) {
    stopScroll()
  } else {
    startScroll()
  }
}

// 重置滚动
const resetScroll = () => {
  stopScroll()
  currentScrollTop.value = 0
}

// 更新滚动速度
const updateScrollSpeed = (event) => {
  scrollSpeed.value = parseInt(event.target.value)
}

// 处理行点击
const handleRowClick = (row, index) => {
  emit('row-click', { row, index })
}

// 处理鼠标进入
const handleMouseEnter = () => {
  isPaused.value = true
}

// 处理鼠标离开
const handleMouseLeave = () => {
  isPaused.value = false
}

// 切换控制面板
const toggleControls = () => {
  showControlPanel.value = !showControlPanel.value
}

// 监听数据变化
watch(() => props.data, () => {
  initData()
  resetScroll()
})

// 监听滚动速度变化
watch(() => props.scrollSpeed, (newSpeed) => {
  scrollSpeed.value = newSpeed
})

// 点击外部关闭控制面板
const handleClickOutside = (event) => {
  if (showControlPanel.value && !event.target.closest('.relative')) {
    showControlPanel.value = false
  }
}

onMounted(() => {
  initData()
  if (props.autoStart) {
    setTimeout(() => {
      startScroll()
    }, props.scrollDelay)
  }

  // 添加点击外部关闭事件
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopScroll()
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法给父组件
defineExpose({
  startScroll,
  stopScroll,
  resetScroll,
  toggleScroll,
  getTotalCount: () => totalCount.value,
  isScrolling: () => isScrolling.value
})
</script>

<style scoped>
/* 自定义滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

/* 控制面板动画 */
.control-panel-enter-active,
.control-panel-leave-active {
  transition: all 0.2s ease;
}

.control-panel-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.control-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
