<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 折线图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线运行监控</div>
      <div class="flex h-full w-full">
        <BaseChart :option="lineChartOption" chartType="管线运行监控折线图" class="flex-1 w-1/2" @preview="handleChartPreview" />
        <BaseChart :option="lineChartOption" chartType="管线运行监控折线图" class="flex-1 w-1/2" @preview="handleChartPreview" />
      </div>
    </div>

    <!-- 柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">区域管线统计</div>
      <div class="flex h-full w-full">
        <BaseChart :option="barChartOption" chartType="柱状图" class="flex-1" @preview="handleChartPreview" />
        <BaseChart :option="lineChartOption" chartType="管线运行监控折线图" class="flex-1 w-1/2" @preview="handleChartPreview" />
      </div>
    </div>

    <!-- 饼图 -->
    <div class="h-60 flex flex-col">
      <BaseChart :option="pieChartOption" class="flex-1" />
    </div>
    <!-- 饼图 -->
    <div class="h-60 flex flex-col">
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

import { useGlobalChartPreview } from '../../hooks/useGlobalChartPreview.js'

// 使用全局图表预览功能
const { showPreview } = useGlobalChartPreview()
// 折线图配置 - 管线运行监控
const lineChartOption = computed(() => {
  const xAxisData = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']
  const seriesData = [
    {
      name: '压力',
      data: [85, 88, 82, 90, 87, 85, 88, 92, 89, 86, 84, 87, 90, 88, 85, 87, 89, 91, 88, 86, 84, 87, 89, 85]
    },
    {
      name: '流量',
      data: [75, 78, 72, 80, 77, 75, 78, 82, 79, 76, 74, 77, 80, 78, 75, 77, 79, 81, 78, 76, 74, 77, 79, 75]
    }
  ]

  return createLineChartConfig(seriesData, xAxisData, {
    max: 100,
    showArea: true,
    showLegend: true
  })
})

// 柱状图配置 - 区域管线统计
const barChartOption = computed(() => {
  const categories = ['盐都区', '亭湖区', '大丰区', '建湖县', '射阳县', '阜宁县', '滨海县', '响水县']
  const data = [12, 10, 8, 6, 4, 3, 2, 1]

  return createBarChartConfig(data, categories, {
    max: 15,
    colors: CHART_COLORS.gradient.blue,
    rotateLabels: true
  })
})

// 饼图配置 - 管线分布
const pieChartOption = computed(() => {
  const data = [
    { value: 35, name: '给水管' },
    { value: 25, name: '排水管' },
    { value: 20, name: '燃气管' },
    { value: 15, name: '热力管' },
    { value: 5, name: '其他' }
  ]

  return createPieChartConfig(data, {
    radius: ['30%', '70%'],
    showLabel: true,
    showLegend: true,
    center: ['60%', '50%']
  })
})

// 处理图表预览
const handleChartPreview = (previewData) => {
  showPreview(
    previewData.option,
    previewData.title,
    previewData.description,
    previewData.chartType
  )
}
</script>