<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">

    <!-- 第一个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">风险分析</div>
      <BaseChart :option="barChart1Option" class="flex-1" />
    </div>

    <!-- 第二个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">性能分析</div>
      <BaseChart :option="barChart2Option" class="flex-1" />
    </div>

    <!-- 三个饼图 -->
    <div class="flex flex-col h-48">
      <div class="text-sm text-blue-200 mb-2">分析结果</div>
      <div class="flex-1 grid grid-cols-3 gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">风险等级</div>
          <BaseChart :option="pieChart1Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">性能评级</div>
          <BaseChart :option="pieChart2Option" class="flex-1" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">优化建议</div>
          <BaseChart :option="pieChart3Option" class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import {
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'

import { consultationsApi } from '../../services/ovweview'
const getConsultations = async () => {
  try {
    const res = await consultationsApi.getConsultations({ a: '1212' })
    console.log(res)
  } catch (error) {
    console.warn('获取咨询数据失败:', error)
    // 不跳转登录页，只是记录错误
  }
}
onMounted(() => {
  // 暂时注释掉自动调用，避免认证问题
  // getConsultations()
})

// 柱状图1配置 - 风险分析
const barChart1Option = computed(() => {
  const categories = ['腐蚀风险', '泄漏风险', '变形风险', '老化风险', '外力风险', '环境风险']
  const data = [85, 70, 60, 75, 50, 40]

  return createBarChartConfig(data, categories, {
    max: 100,
    colors: CHART_COLORS.gradient.red,
    rotateLabels: true
  })
})

// 柱状图2配置 - 性能分析
const barChart2Option = computed(() => {
  const categories = ['流量效率', '压力稳定', '水质指标', '能耗水平', '运行可靠', '维护便利']
  const data = [90, 85, 88, 75, 92, 80]

  return createBarChartConfig(data, categories, {
    max: 100,
    colors: CHART_COLORS.gradient.green,
    rotateLabels: true
  })
})

// 饼图1配置 - 风险等级
const pieChart1Option = computed(() => {
  const data = [
    { value: 60, name: '低风险' },
    { value: 25, name: '中风险' },
    { value: 15, name: '高风险' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图2配置 - 性能评级
const pieChart2Option = computed(() => {
  const data = [
    { value: 70, name: '优秀' },
    { value: 20, name: '良好' },
    { value: 10, name: '一般' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图3配置 - 优化建议
const pieChart3Option = computed(() => {
  const data = [
    { value: 50, name: '立即处理' },
    { value: 30, name: '计划处理' },
    { value: 20, name: '持续监控' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})
</script>