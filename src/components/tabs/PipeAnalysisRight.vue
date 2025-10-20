<template>
  <div class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 折线图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">分析趋势</div>
      <BaseChart :option="lineChartOption" class="flex-1" />
    </div>

    <!-- 柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">对比分析</div>
      <BaseChart :option="barChartOption" class="flex-1" />
    </div>

    <!-- 饼图 -->
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">分析结论</div>
      <BaseChart :option="pieChartOption" class="flex-1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import { 
  createLineChartConfig, 
  createBarChartConfig, 
  createPieChartConfig, 
  CHART_COLORS 
} from '../charts/chartConfigs.js'

// 折线图配置 - 分析趋势
const lineChartOption = computed(() => {
  const xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seriesData = [
    {
      name: '风险指数',
      data: [85, 82, 78, 75, 72, 70, 68, 65, 62, 60, 58, 55]
    },
    {
      name: '性能指数',
      data: [60, 65, 70, 75, 78, 80, 82, 85, 88, 90, 92, 95]
    }
  ]
  
  return createLineChartConfig(seriesData, xAxisData, {
    max: 100,
    showArea: true,
    showLegend: true
  })
})

// 柱状图配置 - 对比分析
const barChartOption = computed(() => {
  const categories = ['历史', '当前', '预测', '目标', '优化', '改进']
  const data = [70, 75, 80, 85, 90, 95]
  
  return createBarChartConfig(data, categories, {
    max: 100,
    colors: CHART_COLORS.gradient.purple,
    rotateLabels: true
  })
})

// 饼图配置 - 分析结论
const pieChartOption = computed(() => {
  const data = [
    { value: 50, name: '正常运行' },
    { value: 30, name: '需要关注' },
    { value: 15, name: '需要维护' },
    { value: 5, name: '紧急处理' }
  ]
  
  return createPieChartConfig(data, {
    radius: ['30%', '70%'],
    showLabel: true,
    showLegend: true,
    center: ['60%', '50%']
  })
})
</script>