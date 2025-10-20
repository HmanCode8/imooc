<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 折线图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线检测数据</div>
      <BaseChart :option="lineChartOption" class="flex-1" />
    </div>

    <!-- 柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">检测项目统计</div>
      <BaseChart :option="barChartOption" class="flex-1" />
    </div>

    <!-- 饼图 -->
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">检测结果分布</div>
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

// 折线图配置 - 管线检测数据
const lineChartOption = computed(() => {
  const xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seriesData = [
    {
      name: '壁厚检测',
      data: [95, 92, 88, 90, 87, 85, 88, 92, 89, 86, 84, 87]
    },
    {
      name: '腐蚀检测',
      data: [85, 88, 82, 90, 87, 85, 88, 92, 89, 86, 84, 87]
    }
  ]

  return createLineChartConfig(seriesData, xAxisData, {
    max: 100,
    showArea: true,
    showLegend: true
  })
})

// 柱状图配置 - 检测项目统计
const barChartOption = computed(() => {
  const categories = ['壁厚', '腐蚀', '泄漏', '变形', '裂纹', '接头', '阀门', '支架']
  const data = [18, 15, 12, 10, 8, 6, 4, 2]

  return createBarChartConfig(data, categories, {
    max: 20,
    barWidth: '20%',
    colors: CHART_COLORS.gradient.purple,
    rotateLabels: true
  })
})

// 饼图配置 - 检测结果分布
const pieChartOption = computed(() => {
  const data = [
    { value: 70, name: '正常' },
    { value: 20, name: '轻微异常' },
    { value: 8, name: '需要关注' },
    { value: 2, name: '严重异常' }
  ]

  return createPieChartConfig(data, {
    radius: ['20%', '60%'],
    showLabel: true,
    showLegend: true,
    center: ['60%', '50%']
  })
})
</script>