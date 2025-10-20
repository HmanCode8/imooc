<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 3D折线图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线运行趋势 (3D)</div>
      <BaseChart :option="line3DOption" class="flex-1" @preview="handleChartPreview" />
    </div>

    <!-- 3D柱状图组合 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">区域对比 (3D)</div>
      <BaseChart :option="bar3DOption" class="flex-1" @preview="handleChartPreview" />
    </div>

    <!-- 3D饼图 -->
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">管线分布 (3D)</div>
      <BaseChart :option="pie3DOption" class="flex-1" @preview="handleChartPreview" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import {
  createLine3DChartConfig,
  createBar3DChartConfig,
  createPieChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'
import { useGlobalChartPreview } from '../../hooks/useGlobalChartPreview.js'

// 使用全局图表预览功能
const { showPreview } = useGlobalChartPreview()
// 3D折线图配置
const line3DOption = computed(() => {
  const data1 = []
  const data2 = []
  const data3 = []

  for (let i = 0; i < 20; i++) {
    data1.push([i, 0, Math.sin(i * 0.3) * 50 + 50])
    data2.push([i, 1, Math.cos(i * 0.3) * 50 + 50])
    data3.push([i, 2, Math.sin(i * 0.3 + Math.PI) * 50 + 50])
  }

  const seriesData = [
    { name: '压力', data: data1 },
    { name: '流量', data: data2 },
    { name: '温度', data: data3 }
  ]
  const yAxisData = ['压力', '流量', '温度']

  return createLine3DChartConfig(seriesData, [], yAxisData, {
    max: 100
  })
})

// 3D柱状图配置
const bar3DOption = computed(() => {
  const data = []
  const categories = ['盐都区', '亭湖区', '大丰区', '建湖县', '射阳县', '阜宁县']
  const types = ['给水管', '排水管', '燃气管', '热力管']

  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < types.length; j++) {
      data.push([i, j, Math.floor(Math.random() * 800) + 200])
    }
  }

  return createBar3DChartConfig(data, categories, types, {
    max: 1000,
    min: 200
  })
})

// 3D饼图配置
const pie3DOption = computed(() => {
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