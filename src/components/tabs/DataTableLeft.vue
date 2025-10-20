<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">
    <!-- 无限滚动表格 -->
    <div class="mb-4 h-96">
      <div class="text-sm text-blue-200 my-2">实时数据监控</div>
      <InfiniteScrollTableExample />
    </div>
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">性能分析</div>
      <BaseChart :option="barChart2Option" class="flex-1" />
    </div>
  </div>
</template>

<script setup>
import InfiniteScrollTableExample from '../charts/InfiniteScrollTableExample.vue'
import { computed, onMounted } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import {
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'
// 柱状图2配置 - 性能分析
const barChart2Option = computed(() => {
  const categories = ['流量效率', '压力稳定', '水质指标', '能耗水平', '运行可靠', '维护便利']
  const data = [90, 85, 88, 75, 92, 80]

  return createBarChartConfig(data, categories, {
    max: 100,
    barWidth: '20%',
    colors: ['#3b82f6', '#1e40af'],
    // rotateLabels: false
  })
})

</script>

<style scoped>
/* 可以在这里添加特定的样式 */
</style>
