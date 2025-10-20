<template>
  <div class="chart-preview-example">
    <h2 class="text-xl font-bold text-white mb-4">图表预览功能示例</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 示例图表1 -->
      <div class="chart-example-item">
        <h3 class="text-lg font-semibold text-blue-200 mb-2">柱状图示例</h3>
        <BaseChart 
          :option="barChartOption"
          :chartTitle="'销售数据统计'"
          :chartDescription="'2024年各月份销售数据对比分析'"
          :chartType="'柱状图'"
          @preview="handleChartPreview"
        />
      </div>

      <!-- 示例图表2 -->
      <div class="chart-example-item">
        <h3 class="text-lg font-semibold text-blue-200 mb-2">饼图示例</h3>
        <BaseChart 
          :option="pieChartOption"
          :chartTitle="'市场份额分布'"
          :chartDescription="'各产品线在总销售额中的占比情况'"
          :chartType="'饼图'"
          @preview="handleChartPreview"
        />
      </div>

      <!-- 示例图表3 -->
      <div class="chart-example-item">
        <h3 class="text-lg font-semibold text-blue-200 mb-2">折线图示例</h3>
        <BaseChart 
          :option="lineChartOption"
          :chartTitle="'用户增长趋势'"
          :chartDescription="'近12个月用户注册数量变化趋势'"
          :chartType="'折线图'"
          @preview="handleChartPreview"
        />
      </div>

      <!-- 示例图表4 -->
      <div class="chart-example-item">
        <h3 class="text-lg font-semibold text-blue-200 mb-2">3D柱状图示例</h3>
        <BaseChart 
          :option="bar3DOption"
          :chartTitle="'3D数据可视化'"
          :chartDescription="'三维数据展示效果'"
          :chartType="'3D柱状图'"
          @preview="handleChartPreview"
        />
      </div>
    </div>

    <!-- 图表预览组件 -->
    <ChartPreview
      :visible="isPreviewVisible"
      :option="previewOption"
      :title="previewTitle"
      :description="previewDescription"
      :chartType="previewChartType"
      @close="handlePreviewClose"
      @export="handleChartExport"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseChart from './BaseChart.vue'
import ChartPreview from './ChartPreview.vue'
import { useChartPreview } from './useChartPreview.js'
import { 
  createBarChartConfig, 
  createPieChartConfig, 
  createLineChartConfig,
  createBar3DChartConfig,
  CHART_COLORS 
} from './chartConfigs.js'

// 使用图表预览功能
const {
  isPreviewVisible,
  previewOption,
  previewTitle,
  previewDescription,
  previewChartType,
  showPreview,
  hidePreview,
  handleChartExport
} = useChartPreview()

// 示例图表配置
const barChartOption = computed(() => {
  const data = [120, 200, 150, 80, 70, 110, 130, 90, 160, 180, 200, 150]
  const categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return createBarChartConfig(data, categories, {
    max: 250,
    colors: CHART_COLORS.gradient.blue
  })
})

const pieChartOption = computed(() => {
  const data = [
    { value: 335, name: '产品A' },
    { value: 310, name: '产品B' },
    { value: 234, name: '产品C' },
    { value: 135, name: '产品D' },
    { value: 1548, name: '其他' }
  ]
  return createPieChartConfig(data, {
    colors: CHART_COLORS.primary,
    showLegend: true
  })
})

const lineChartOption = computed(() => {
  const xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seriesData = [
    {
      name: '新用户',
      data: [120, 132, 101, 134, 90, 230, 210, 180, 190, 200, 210, 220]
    },
    {
      name: '活跃用户',
      data: [220, 182, 191, 234, 290, 330, 310, 300, 290, 280, 270, 260]
    }
  ]
  return createLineChartConfig(seriesData, xAxisData, {
    showArea: true,
    colors: [CHART_COLORS.primary[0], CHART_COLORS.primary[1]]
  })
})

const bar3DOption = computed(() => {
  const data = [
    ['产品A', 'Q1', 120],
    ['产品A', 'Q2', 150],
    ['产品A', 'Q3', 180],
    ['产品B', 'Q1', 100],
    ['产品B', 'Q2', 130],
    ['产品B', 'Q3', 160],
    ['产品C', 'Q1', 80],
    ['产品C', 'Q2', 110],
    ['产品C', 'Q3', 140]
  ]
  const xAxisData = ['产品A', '产品B', '产品C']
  const yAxisData = ['Q1', 'Q2', 'Q3']
  return createBar3DChartConfig(data, xAxisData, yAxisData, {
    title: '3D柱状图',
    colors: CHART_COLORS.primary
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

// 处理预览关闭
const handlePreviewClose = () => {
  hidePreview()
}
</script>

<style scoped>
.chart-preview-example {
  padding: 20px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 12px;
  margin: 20px;
}

.chart-example-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.chart-example-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}
</style>
