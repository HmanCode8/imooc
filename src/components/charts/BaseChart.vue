<template>
  <div class="chart-container" :style="containerStyle" @dblclick="handleDoubleClick"
    :title="enablePreview ? '双击预览图表' : ''">
    <div ref="chartRef" class="w-full h-full"></div>

    <!-- 预览提示 -->
    <div v-if="enablePreview" class="chart-preview-hint">
      <span class="hint-text">双击预览</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  height: {
    type: String,
    default: '100%'
  },
  width: {
    type: String,
    default: '100%'
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  // 是否启用预览功能
  enablePreview: {
    type: Boolean,
    default: true
  },
  // 图表标题（用于预览）
  chartTitle: {
    type: String,
    default: '图表预览'
  },
  // 图表描述（用于预览）
  chartDescription: {
    type: String,
    default: ''
  },
  // 图表类型（用于预览）
  chartType: {
    type: String,
    default: '未知类型'
  }
})

const emit = defineEmits(['preview'])

const chartRef = ref(null)
let chartInstance = null

// 计算容器样式
const containerStyle = computed(() => ({
  height: props.height,
  width: props.width
}))

// 获取响应式字体大小
const getResponsiveFontSize = (baseSize) => {
  const screenWidth = window.innerWidth
  console.log(screenWidth, baseSize, 'screenWidth')
  if (screenWidth >= 11520) {
    return Math.round(baseSize * 2.5) // ultra
  } else if (screenWidth >= 3840) {
    return Math.round(baseSize) // 4k
  } else if (screenWidth >= 1920) {
    return Math.round(baseSize) // fhd
  }
  return baseSize
}

// 处理图表配置，添加响应式字体
const processChartOption = (option) => {
  const processedOption = JSON.parse(JSON.stringify(option))

  // 递归处理字体大小
  const processFontSize = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key === 'fontSize' && typeof obj[key] === 'number') {
          obj[key] = getResponsiveFontSize(obj[key])
        } else if (typeof obj[key] === 'object') {
          processFontSize(obj[key])
        }
      }
    }
  }

  processFontSize(processedOption)
  return processedOption
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const processedOption = processChartOption(props.option)
    chartInstance.setOption(processedOption)
  }
}

// 更新图表
const updateChart = () => {
  if (chartInstance) {
    const processedOption = processChartOption(props.option)
    chartInstance.setOption(processedOption, true)
  }
}

// 响应式处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
    // 重新处理字体大小
    updateChart()
  }
}

// 监听配置变化
watch(() => props.option, () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  initChart()

  if (props.autoResize) {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (props.autoResize) {
    window.removeEventListener('resize', handleResize)
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 处理双击事件
const handleDoubleClick = () => {
  if (props.enablePreview) {
    emit('preview', {
      option: props.option,
      title: props.chartTitle,
      description: props.chartDescription,
      chartType: props.chartType
    })
  }
}

// 暴露方法给父组件
defineExpose({
  getChart: () => chartInstance,
  resize: () => chartInstance?.resize(),
  setOption: (option) => {
    if (chartInstance) {
      const processedOption = processChartOption(option)
      chartInstance.setOption(processedOption)
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chart-preview-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.chart-container:hover .chart-preview-hint {
  opacity: 1;
}

.hint-text {
  font-size: 11px;
  color: #e5e7eb;
}
</style>
