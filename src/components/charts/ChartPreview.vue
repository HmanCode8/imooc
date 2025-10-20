<template>
  <!-- 图表预览模态框 -->
  <div v-if="isVisible" class="chart-preview-overlay" @click="closePreview">
    <div class="chart-preview-container" @click.stop>
      <!-- 预览头部 -->
      <div class="chart-preview-header">
        <div class="chart-preview-title">
          <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
          <p class="text-sm text-gray-300">{{ description }}</p>
        </div>
        <div class="chart-preview-actions">
          <button @click="toggleFullscreen" class="action-btn" :title="isFullscreen ? '退出全屏' : '全屏显示'">
            {{ isFullscreen ? '⤓' : '⤢' }}
          </button>
          <button @click="exportChart" class="action-btn" title="导出图表">
            📥
          </button>
          <button @click="closePreview" class="action-btn close-btn" title="关闭预览">
            ✕
          </button>
        </div>
      </div>

      <!-- 预览内容 -->
      <div class="chart-preview-content">
        <div ref="previewChartRef" class="chart-preview-chart" :class="{ 'fullscreen': isFullscreen }">
          <BaseChart :enablePreview="false" :option="chartOption" :height="isFullscreen ? '100vh' : '70vh'"
            :width="isFullscreen ? '100vw' : '80vw'" :autoResize="true" />
        </div>
      </div>

      <!-- 预览底部信息 -->
      <div class="chart-preview-footer">
        <div class="chart-info">
          <span class="text-sm text-gray-400">图表类型: {{ chartType }}</span>
          <span class="text-sm text-gray-400">数据更新时间: {{ updateTime }}</span>
        </div>
        <div class="chart-controls">
          <button @click="zoomIn" class="control-btn" title="放大">
            🔍+
          </button>
          <button @click="zoomOut" class="control-btn" title="缩小">
            🔍-
          </button>
          <button @click="resetZoom" class="control-btn" title="重置缩放">
            🔄
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  // 是否显示预览
  visible: {
    type: Boolean,
    default: false
  },
  // 图表配置
  option: {
    type: Object,
    required: true
  },
  // 图表标题
  title: {
    type: String,
    default: '图表预览'
  },
  // 图表描述
  description: {
    type: String,
    default: ''
  },
  // 图表类型
  chartType: {
    type: String,
    default: '未知类型'
  }
})

const emit = defineEmits(['close', 'export'])

// 响应式数据
const isVisible = ref(false)
const isFullscreen = ref(false)
const previewChartRef = ref(null)
const updateTime = ref('')

// 计算属性
const chartOption = computed(() => props.option)

// 监听显示状态
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    updateTime.value = new Date().toLocaleString('zh-CN')
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 监听内部显示状态
watch(isVisible, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

// 关闭预览
const closePreview = () => {
  isVisible.value = false
  isFullscreen.value = false
  document.body.style.overflow = ''
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 导出图表
const exportChart = () => {
  if (previewChartRef.value) {
    const canvas = previewChartRef.value.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${props.title}_${new Date().getTime()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }
  emit('export', {
    title: props.title,
    option: props.option,
    timestamp: new Date().getTime()
  })
}

// 缩放控制
const zoomIn = () => {
  // 这里可以添加图表缩放逻辑
  console.log('放大图表')
}

const zoomOut = () => {
  // 这里可以添加图表缩放逻辑
  console.log('缩小图表')
}

const resetZoom = () => {
  // 这里可以添加重置缩放逻辑
  console.log('重置图表缩放')
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!isVisible.value) return

  switch (event.key) {
    case 'Escape':
      closePreview()
      break
    case 'F11':
      event.preventDefault()
      toggleFullscreen()
      break
  }
}

// 生命周期
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.chart-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.chart-preview-container {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.chart-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.chart-preview-title h3 {
  margin: 0 0 4px 0;
  color: white;
}

.chart-preview-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.chart-preview-content {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.chart-preview-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-preview-chart.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.95);
}

.chart-preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.chart-info {
  display: flex;
  gap: 20px;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-preview-container {
    max-width: 95vw;
    max-height: 95vh;
  }

  .chart-preview-header {
    padding: 16px 20px;
  }

  .chart-preview-content {
    padding: 16px;
  }

  .chart-preview-footer {
    padding: 12px 20px;
    flex-direction: column;
    gap: 12px;
  }

  .chart-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
