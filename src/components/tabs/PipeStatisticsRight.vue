<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 折线图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">统计趋势</div>
      <BaseChart :option="lineChartOption" class="flex-1" />
    </div>

    <!-- 柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">对比分析</div>
      <BaseChart :option="barChartOption" class="flex-1" />
    </div>

    <!-- 饼图 -->
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">占比分析</div>
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

// 折线图配置 - 统计趋势
const lineChartOption = computed(() => {
  const xAxisData = ['2019', '2020', '2021', '2022', '2023', '2024']
  const seriesData = [
    {
      name: '建设完成率',
      data: [60, 70, 80, 85, 90, 95]
    },
    {
      name: '维护完成率',
      data: [70, 75, 80, 85, 88, 92]
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
  const categories = ['计划', '实际', '预算', '支出', '维护', '检测']
  const data = [100, 95, 90, 85, 80, 75]

  return createBarChartConfig(data, categories, {
    max: 100,
    colors: CHART_COLORS.gradient.orange,
    rotateLabels: true
  })
})

// 饼图配置 - 占比分析
const pieChartOption = computed(() => {
  const data = [
    { value: 40, name: '建设投资' },
    { value: 30, name: '维护费用' },
    { value: 20, name: '检测费用' },
    { value: 10, name: '其他费用' }
  ]

  return createPieChartConfig(data, {
    radius: ['30%', '70%'],
    showLabel: true,
    showLegend: true,
    center: ['60%', '50%']
  })
})
</script>