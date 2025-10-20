<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">

    <!-- 第一个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线类型分布</div>
      <BaseChart :option="barChart1Option" :chartTitle="'管线类型分布统计'" :chartDescription="'各类管线在系统中的分布情况'"
        :chartType="'柱状图'" class="flex-1" @preview="handleChartPreview" />
    </div>

    <!-- 第二个柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">区域分布</div>
      <BaseChart :option="bambooChart1Option" :chartTitle="'区域分布统计'" :chartDescription="'各区域管线数量分布情况'"
        :chartType="'柱状图'" class="flex-1" @preview="handleChartPreview" />
    </div>

    <!-- 三个饼图 -->
    <div class="flex flex-col h-48">
      <div class="text-sm text-blue-200 mb-2">管线状态</div>
      <div class="flex-1 grid grid-cols-3 gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">运行状态</div>
          <BaseChart :option="pieChart1Option" :chartTitle="'管线运行状态'" :chartDescription="'管线系统运行状态分布'" :chartType="'饼图'"
            class="flex-1" @preview="handleChartPreview" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">维护状态</div>
          <BaseChart :option="pieChart2Option" :chartTitle="'管线维护状态'" :chartDescription="'管线维护状态分布情况'" :chartType="'饼图'"
            class="flex-1" @preview="handleChartPreview" />
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-blue-200 mb-1">风险等级</div>
          <BaseChart :option="pieChart3Option" :chartTitle="'管线风险等级'" :chartDescription="'管线风险等级分布情况'" :chartType="'饼图'"
            class="flex-1" @preview="handleChartPreview" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import { useGlobalChartPreview } from '../../hooks/useGlobalChartPreview.js'
import {
  createBarChartConfig,
  createPieChartConfig,
  createBambooChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'

// 使用全局图表预览功能
const { showPreview } = useGlobalChartPreview()

// 柱状图1配置 - 管线类型分布
const barChart1Option = computed(() => {
  const categories = ['给水管', '排水管', '燃气管', '热力管', '电力管', '通信管', '综合管廊']
  const data = [1200, 800, 1100, 900, 600, 400, 300]

  return createBarChartConfig(data, categories, {
    barWidth: '10%',
    tooltip: true,
    max: 1500,
    colors: CHART_COLORS.gradient.blue,
    rotateLabels: true
  })
})

// 柱状图2配置 - 区域分布
const barChart2Option = computed(() => {
  const categories = ['盐都区', '亭湖区', '大丰区', '建湖县', '射阳县', '阜宁县', '滨海县']
  const data = [1400, 1200, 1000, 800, 600, 400, 200]

  return createBarChartConfig(data, categories, {
    max: 1500,
    colors: CHART_COLORS.gradient.green,
    rotateLabels: true
  })
})

// 竹子图配置 - 管线类型分布
const bambooChart1Option = computed(() => {
  let chartData = {
    xAxisData: ['2015', '2016', '2017', '2018', '2019', '2020'],
    seriesData: [{
      name: '测试1',
      color: '10,237,234',
      data: [80, 74, 90, 68, 75, 84]
    }, {
      name: '测试2',
      color: '229,234,15',
      data: [60, 80, 80, 74, 90, 80]
    }, {
      name: '测试3',
      color: '52,229,15',
      data: [68, 66, 84, 75, 68, 51]
    }]
  };

  const diamondData = chartData.seriesData.reduce((pre, cur, index) => {
    pre[index] = cur.data.map((el, id) => el + (pre[index - 1] ? pre[index - 1][id] : 0))
    return pre
  }, [])

  let seriesData = chartData.seriesData.reduce((p, c, i) => {
    p.push({
      z: i + 1 + 10,
      stack: '总量',
      type: 'bar',
      name: c.name,
      barWidth: c.width || 20,
      data: c.data,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          x2: 0,
          y: 0,
          y2: 1,
          colorStops: [{
            offset: .09,
            color: `rgba(${c.color}, 0)`
          }, {
            offset: 1,
            color: `rgba(${c.color}, .8)`
          }]
        },
      },
      label: {
        show: false,
      }
    }, {
      z: i + 10,
      type: 'pictorialBar',
      symbolPosition: 'end',
      symbol: 'rect',
      symbolOffset: [0, '-50%'],
      symbolSize: [(c.width + 5 || 35), 20],
      data: diamondData[i],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          x2: 0,
          y: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: `rgba(${c.color}, 0)`
          }, {
            offset: .7,
            color: `rgba(${c.color}, 0)`
          }, {
            offset: .71,
            color: `rgba(${c.color}, .8)`
          }, {
            offset: 1,
            color: `rgba(${c.color}, .8)`
          }]
        },
      },
      tooltip: {
        show: false
      },
    })
    return p
  }, [])

  return createBambooChartConfig(seriesData, {
    showLegend: false
  })
})

// 饼图1配置 - 运行状态
const pieChart1Option = computed(() => {
  const data = [
    { value: 70, name: '正常运行' },
    { value: 20, name: '维护中' },
    { value: 10, name: '故障' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图2配置 - 维护状态
const pieChart2Option = computed(() => {
  const data = [
    { value: 60, name: '良好' },
    { value: 25, name: '一般' },
    { value: 15, name: '需维护' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
  })
})

// 饼图3配置 - 风险等级
const pieChart3Option = computed(() => {
  const data = [
    { value: 80, name: '低风险' },
    { value: 15, name: '中风险' },
    { value: 5, name: '高风险' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: false
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