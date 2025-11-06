<template>
  <div class="bg-gray-50 p-6 w-full h-full overflow-auto">
    <!-- 顶部摘要卡片 -->
    <div class="grid grid-cols-6 gap-4 mb-2">
      <div v-for="(card, index) in summaryCards" :key="index"
        class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div class="text-sm text-gray-600 mb-2">{{ card.title }}</div>
        <div class="text-xl font-bold text-gray-800 mb-2">{{ card.value }}</div>

        <!-- 变化百分比和箭头 -->
        <div class="flex items-center gap-1 mb-2">
          <el-icon :class="card.change >= 0 ? 'text-green-500' : 'text-red-500'" class="text-xs">
            <ArrowUp v-if="card.change >= 0" />
            <ArrowDown v-else />
          </el-icon>
          <span :class="card.change >= 0 ? 'text-green-500' : 'text-red-500'" class="text-xs font-medium">
            {{ card.change >= 0 ? '+' : '' }}{{ card.change }}% {{ $t('statistical.compared ') }}
          </span>
        </div>

        <!-- 小水平柱状图 -->
        <!-- <el-progress :percentage="card.proportion" :status="card.change >= 0 ? 'success' : 'exception'" /> -->
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div :class="card.change >= 0 ? 'bg-green-500' : 'bg-red-500'" class="h-full transition-all duration-500"
            :style="{ width: `${Math.abs(card.proportion)}%` }"></div>
        </div>

        <!-- 百分比（区域卡片） -->
        <div v-if="card.proportion" class="text-xs text-gray-500 mt-2">
          {{ card.proportion }}%
        </div>
      </div>
    </div>

    <!-- 中间控制区域 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">{{ $t('statistical.title') }}</h2>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <el-button size="small" @click="handleDownload">
            <el-icon class="mr-1">
              <Download />
            </el-icon>
            Download
          </el-button>
          <el-button size="small" :type="viewMode === 'chart' ? 'primary' : 'default'" @click="viewMode = 'chart'">
            <el-icon class="mr-1">
              <DataAnalysis />
            </el-icon>
            Chart
          </el-button>
          <el-button size="small" :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'">
            <el-icon class="mr-1">
              <List />
            </el-icon>
            Table
          </el-button>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="flex gap-2 mb-4">
        <el-button v-for="tab in filterTabs" :key="tab.value" size="small"
          :type="activeFilter === tab.value ? 'primary' : 'default'" @click="activeFilter = tab.value">
          {{ tab.label }}
        </el-button>
      </div>

      <!-- 图例 -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded"></div>
          <span class="text-sm text-gray-600">Essential</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm text-gray-600">Non-Essential</span>
        </div>
      </div>
    </div>

    <!-- 底部图表区域 -->
    <div v-if="viewMode === 'chart'" class="grid grid-cols-2 gap-6 h-96">
      <!-- 左侧：甜甜圈图 -->
      <div class=" rounded-lg shadow-md h-full flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 ml-2">{{ $t('statistical.proportion') }}:</h3>
        <BaseChart :option="barChart2Option1" class="flex-1" />
      </div>

      <!-- 右侧：堆叠柱状图 -->
      <div class=" rounded-lg shadow-md h-full flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 ml-2">{{ $t('statistical.regin') }}:</h3>
        <!-- <div ref="stackedBarChartRef" class="w-full h-80"></div> -->
        <BaseChart :option="barChart2Option" class="w-full h-full" />
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="bg-white rounded-lg shadow-md p-6">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="region" label="Region" width="200" />
        <el-table-column prop="essential" label="Essential" />
        <el-table-column prop="nonEssential" label="Non-Essential" />
        <el-table-column prop="total" label="Total" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown, Download, DataAnalysis, List } from '@element-plus/icons-vue'
import BaseChart from '../components/charts/BaseChart.vue'
import {
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS
} from '../components/charts/chartConfigs.js'


// 摘要卡片数据
const summaryCards = ref([
  {
    title: 'Total',
    value: '357916',
    change: -0.3,
    proportion: null
  },
  {
    title: 'Hong Kong Island',
    value: '76465',
    change: 0.3,
    proportion: 61.36
  },
  {
    title: 'Kowloon',
    value: '75106',
    change: -0.5,
    proportion: 20.98
  },
  {
    title: 'New Territories',
    value: '104418',
    change: 0.3,
    proportion: 29.14
  },
  {
    title: 'New Territories West',
    value: '105927',
    change: 0.3,
    proportion: 28.06
  },
  {
    title: 'New Territories',
    value: '104418',
    change: 0.3,
    proportion: 29.14
  },
])

// 视图模式
const viewMode = ref('chart')

// 筛选标签
const filterTabs = ref([
  { label: 'FW', value: 'fw' },
  { label: 'RW', value: 'rw' },
  { label: 'SW', value: 'sw' },
  { label: 'Total', value: 'total' }
])

const activeFilter = ref('fw')

// 图表引用
const donutChartRef = ref(null)
const stackedBarChartRef = ref(null)
let donutChart = null
let stackedBarChart = null

// 表格数据
const tableData = ref([
  { region: 'Hong Kong Island', essential: 3841, nonEssential: 72624, total: 76465 },
  { region: 'Kowloon', essential: 3755, nonEssential: 71351, total: 75106 },
  { region: 'New Territories', essential: 5221, nonEssential: 99197, total: 104418 },
  { region: 'New Territories West', essential: 5296, nonEssential: 100631, total: 105927 },
  { region: 'Total', essential: 18113, nonEssential: 339803, total: 357916 }
])


// 柱状图2配置 - 性能分析
const barChart2Option1 = computed(() => {
  const categories = ['流量效率', '压力稳定', '水质指标', '能耗水平', '运行可靠', '维护便利']
  const data = [
    { value: 1048, name: '流量效率' },
    { value: 735, name: '压力稳定' },
    { value: 580, name: '水质指标' },
    { value: 484, name: '能耗水平' },
    { value: 300, name: '运行可靠' }
  ]

  return createPieChartConfig(data, categories, {
    max: 100,
    colors: CHART_COLORS.gradient.green,
  })
})
// 柱状图2配置 - 性能分析
const barChart2Option = computed(() => {
  const categories = ['Hong Kong Island', 'Kowloon', 'New Territories', 'New Territories West']
  const data = [3841, 3755, 5221, 5296]

  return createBarChartConfig(data, categories, {
    max: 100,
    barWidth: 20,
    colors: CHART_COLORS.gradient.green,
  })
})


// 下载处理
const handleDownload = () => {
  console.log('Download clicked')
  // 这里可以实现下载功能
}

// 监听筛选变化
watch(activeFilter, () => {
  // 这里可以根据筛选条件更新数据
  console.log('Filter changed:', activeFilter.value)
})

// 监听视图模式变化
watch(viewMode, async (newMode) => {
  if (newMode === 'chart') {
    await nextTick()
    createDonutChart()
    createStackedBarChart()
  }
})

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  if (donutChart) {
    donutChart.resize()
  }
  if (stackedBarChart) {
    stackedBarChart.resize()
  }
}

onMounted(async () => {
  await nextTick()
  if (viewMode.value === 'chart') {
    createDonutChart()
    createStackedBarChart()
  }
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (donutChart) {
    donutChart.dispose()
  }
  if (stackedBarChart) {
    stackedBarChart.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 自定义样式 */
</style>