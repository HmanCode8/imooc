<template>
  <div class="bg-gray-50 p-6 w-full h-full overflow-auto">
    <!-- 顶部摘要卡片 -->
    <div class="grid grid-cols-6 gap-4 mb-2">
      <div v-for="(card, key) in summaryCards" :key="key"
        class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div class="text-sm text-gray-600 mb-2">{{ key }}</div>
        <div class="text-xl font-bold text-gray-800 mb-2">{{ card }}</div>

        <!-- 变化百分比和箭头 -->
        <div class="flex items-center gap-1 mb-2">
          <el-icon :class="card >= 0 ? 'text-green-500' : 'text-red-500'" class="text-xs">
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
        <el-button v-for="(v, k) in { ...valveTypes, 'TOTAL': [] }" :key="k" size="small"
          :type="valveTypeKey === k ? 'primary' : 'default'" @click="onValveTypeChange(k)">
          {{ k }}
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
        <BaseChart :option="pieChartOption" class="flex-1" />
      </div>

      <!-- 右侧：堆叠柱状图 -->
      <div class=" rounded-lg shadow-md h-full flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 ml-2">{{ $t('statistical.regin') }}:</h3>
        <!-- <div ref="stackedBarChartRef" class="w-full h-80"></div> -->
        <BaseChart :option="barChartOption" class="w-full h-full" />
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="bg-white rounded-lg shadow-md p-6">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="region.regionName" label="Region" width="200" />
        <el-table-column prop="valveType" label="阀门类型" />
        <el-table-column prop="valveNumber" label="阀门数量" />
        <el-table-column prop="valveCode" label="阀门代码" />
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
import _ from 'lodash'
import { statitcsApi } from '@/services/layers.js'



const valveTypeKey = ref('fw')

// 图表引用

let donutChart = null
let stackedBarChart = null
const valveList = ref([])
const valveTypes = ref([])
const regionValves = ref([])
const summaryCards = ref([])

// 图表数据
const chartDataByRegion = ref([])
const categoriesByRegion = ref([])
const chartPieDataByRegion = ref([])
// 表格数据
const tableData = ref([])

const groupbyData = (data, key) => _.groupBy(data, key)

const getValve = async () => {
  try {
    const res = await statitcsApi.geValves()
    if (res.code === 200) {
      valveList.value = res.data
      const types = groupbyData(res.data, 'valveType')
      valveTypes.value = types
      const defaultKey = Object.keys(valveTypes.value)[0]
      valveTypeKey.value = defaultKey
      onValveTypeChange(defaultKey)
    }
  } catch (error) {
    console.log(error)
  }
}
getValve()

const onValveTypeChange = (key) => {
  valveTypeKey.value = key
  const arr = valveTypes.value[key]
  tableData.value = key === 'TOTAL' ? valveList.value : valveTypes.value[key]
  const d = key === 'TOTAL' ? valveList.value : arr
  const dd = _.mapValues(_.groupBy(d, 'region.regionName'), v => _.sumBy(v, n => Number(n.valveNumber)))
  summaryCards.value = dd
  categoriesByRegion.value = _.keys(dd)
  const vList = _.values(dd)
  chartDataByRegion.value = vList
  const sum = _.sum(vList)
  const ddd = _.map(dd, (_, i) => ({ name: i, value: ((dd[i] / sum) * 100).toFixed(2) }))
  chartPieDataByRegion.value = ddd
  // 摘要卡片数据
}

// 视图模式
const viewMode = ref('chart')




// 饼图配置 - 性能分析
const pieChartOption = computed(() => createPieChartConfig([...chartPieDataByRegion.value, ...chartPieDataByRegion.value, ...chartPieDataByRegion.value], categoriesByRegion.value, {
  colors: CHART_COLORS.gradient.green,
}))
// 柱状图2配置 - 性能分析
const barChartOption = computed(() => createBarChartConfig(chartDataByRegion.value, categoriesByRegion.value, {
  barWidth: 20,
  colors: CHART_COLORS.gradient.green,
}))


// 下载处理
const handleDownload = () => {
  console.log('Download clicked')
  // 这里可以实现下载功能
}

// 监听筛选变化
watch(valveTypeKey, () => {
  // 这里可以根据筛选条件更新数据
  console.log('Filter changed:', valveTypeKey.value)
})

// 监听视图模式变化
watch(viewMode, async (newMode) => {
  if (newMode === 'chart') {
    await nextTick()
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
    // createStackedBarChart()
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