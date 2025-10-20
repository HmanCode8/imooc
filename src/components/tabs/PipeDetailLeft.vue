<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">

    <!-- 第一个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线材质分布</div>
      <BaseChart :option="barChart1Option" class="flex-1" />
    </div>

    <!-- 第二个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管径分布</div>
      <BaseChart :option="barChart2Option" class="flex-1" />
    </div>

    <!-- 三个饼图 -->
    <div class="flex flex-col h-48">
      <div class="text-sm text-blue-200 mb-2">管线详情</div>
      <div class="flex-1 grid grid-cols-3 gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">建设年代</div>
          <BaseChart :option="pieChart1Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">设计压力</div>
          <BaseChart :option="pieChart2Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">维护周期</div>
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

// 柱状图1配置 - 管线材质分布
const barChart1Option = computed(() => {
  const categories = ['钢管', '铸铁管', 'PE管', 'PVC管', '混凝土管', '玻璃钢管', '复合管']
  const data = [800, 600, 500, 400, 300, 200, 100]

  return createBarChartConfig(data, categories, {
    max: 1000,
    barWidth: '20%',
    colors: CHART_COLORS.gradient.orange,
    rotateLabels: true
  })
})

// 柱状图2配置 - 管径分布
const barChart2Option = computed(() => {
  const categories = ['DN100', 'DN150', 'DN200', 'DN300', 'DN400', 'DN500', 'DN600']
  const data = [600, 500, 400, 300, 200, 150, 100]

  return createBarChartConfig(data, categories, {
    max: 800,
    barWidth: '20%',
    colors: CHART_COLORS.gradient.red,
    rotateLabels: true
  })
})

// 饼图1配置 - 建设年代
const pieChart1Option = computed(() => {
  const data = [
    { value: 30, name: '2020年后' },
    { value: 25, name: '2015-2020' },
    { value: 20, name: '2010-2015' },
    { value: 15, name: '2005-2010' },
    { value: 10, name: '2005年前' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图2配置 - 设计压力
const pieChart2Option = computed(() => {
  const data = [
    { value: 40, name: '0.4MPa' },
    { value: 30, name: '0.6MPa' },
    { value: 20, name: '0.8MPa' },
    { value: 10, name: '1.0MPa' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图3配置 - 维护周期
const pieChart3Option = computed(() => {
  const data = [
    { value: 50, name: '年度' },
    { value: 30, name: '季度' },
    { value: 20, name: '月度' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})
</script>