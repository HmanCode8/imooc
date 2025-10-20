<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">

    <!-- 第一个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">年度统计</div>
      <BaseChart :option="barChart1Option" class="flex-1" />
    </div>

    <!-- 第二个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">月度统计</div>
      <BaseChart :option="barChart2Option" class="flex-1" />
    </div>

    <!-- 三个饼图 -->
    <div class="flex flex-col h-48">
      <div class="text-sm text-blue-200 mb-2">统计概览：</div>
      <div class="flex-1 grid grid-cols-3 gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">总长度</div>
          <BaseChart :option="pieChart1Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">总投资</div>
          <BaseChart :option="pieChart2Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">维护费用</div>
          <BaseChart :option="pieChart3Option" class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import {
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'

// 柱状图1配置 - 年度统计
const barChart1Option = computed(() => {
  const categories = ['2019', '2020', '2021', '2022', '2023', '2024']
  const data = [1200, 1400, 1600, 1800, 1900, 2000]

  return createBarChartConfig(data, categories, {
    max: 2000,
    barWidth: '20%',
    colors: CHART_COLORS.gradient.cyan
  })
})

// 柱状图2配置 - 月度统计
const barChart2Option = computed(() => {
  const categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const data = [150, 120, 180, 200, 190, 170, 160, 180, 190, 200, 180, 160]

  return createBarChartConfig(data, categories, {
    max: 200,
    barWidth: '20%',
    colors: CHART_COLORS.gradient.purple,
    rotateLabels: true
  })
})

// 饼图1配置 - 总长度
const pieChart1Option = computed(() => {
  const data = [
    { value: 40, name: '给水管' },
    { value: 30, name: '排水管' },
    { value: 20, name: '燃气管' },
    { value: 10, name: '其他' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图2配置 - 总投资
const pieChart2Option = computed(() => {
  const data = [
    { value: 50, name: '建设投资' },
    { value: 30, name: '设备投资' },
    { value: 20, name: '其他投资' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图3配置 - 维护费用
const pieChart3Option = computed(() => {
  const data = [
    { value: 60, name: '日常维护' },
    { value: 25, name: '大修费用' },
    { value: 15, name: '应急维修' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})
</script>