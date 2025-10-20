<template>
  <div
    class="bg-gradient-to-b from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 flex flex-col">

    <!-- 3D柱状图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">管线类型分布 (3D)</div>
      <BaseChart :option="barDouble3DOption" class="flex-1" :chartTitle="'销售数据统计'" :chartDescription="'各区县的管线数量'"
        :chartType="'柱状图'" @preview="handleChartPreview" />
    </div>

    <!-- 3D饼图 -->
    <div class="flex flex-col mb-4 h-64">
      <div class="text-sm text-blue-200 mb-2">运行状态 (3D)</div>
      <BaseChart :option="pie3DOption" class="flex-1" @preview="handleChartPreview" />
    </div>

    <!-- 3D散点图 -->
    <div class="flex flex-col h-64">
      <div class="text-sm text-blue-200 mb-2">管线分布 (3D)</div>
      <BaseChart :option="scatter3DOption" class="flex-1" @preview="handleChartPreview" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '../charts/BaseChart.vue'
import { useGlobalChartPreview } from '../../hooks/useGlobalChartPreview.js'
import {
  createBar3DChartConfig,
  createPieChartConfig,
  createBarDouble3DChartConfig,
  CHART_COLORS
} from '../charts/chartConfigs.js'

// 使用全局图表预览功能
const { showPreview } = useGlobalChartPreview()

// 3D柱状图配置
const bar3DOption = computed(() => {
  const data = []
  const categories = ['给水管', '排水管', '燃气管', '热力管', '电力管', '通信管']
  const regions = ['盐都区', '亭湖区', '大丰区', '建湖县', '射阳县', '阜宁县']

  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < regions.length; j++) {
      data.push([i, j, Math.floor(Math.random() * 1000) + 100])
    }
  }

  return createBar3DChartConfig(data, categories, regions, {
    max: 1100,
    min: 100
  })
})

// 3D饼图配置
const pie3DOption = computed(() => {
  const data = [
    { value: 70, name: '正常运行' },
    { value: 20, name: '维护中' },
    { value: 10, name: '故障' }
  ]

  return createPieChartConfig(data, {
    showLabel: false,
    showLegend: true,
    center: ['50%', '50%']
  })
})

// 3D散点图配置
const scatter3DOption = computed(() => {
  const data = []
  for (let i = 0; i < 100; i++) {
    data.push([
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 50 + 10
    ])
  }

  return {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: function (params) {
        return `X: ${params.data[0].toFixed(2)}<br/>Y: ${params.data[1].toFixed(2)}<br/>Z: ${params.data[2].toFixed(2)}<br/>大小: ${params.data[3].toFixed(2)}`
      }
    },
    visualMap: {
      max: 60,
      min: 10,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027']
      },
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      textStyle: {
        color: '#60a5fa',
        fontSize: 10
      }
    },
    xAxis3D: {
      type: 'value',
      name: 'X坐标',
      nameTextStyle: {
        color: '#60a5fa',
        fontSize: 12
      },
      axisLabel: {
        color: '#60a5fa',
        fontSize: 10
      }
    },
    yAxis3D: {
      type: 'value',
      name: 'Y坐标',
      nameTextStyle: {
        color: '#60a5fa',
        fontSize: 12
      },
      axisLabel: {
        color: '#60a5fa',
        fontSize: 10
      }
    },
    zAxis3D: {
      type: 'value',
      name: 'Z坐标',
      nameTextStyle: {
        color: '#60a5fa',
        fontSize: 12
      },
      axisLabel: {
        color: '#60a5fa',
        fontSize: 10
      }
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 200,
      boxHeight: 200,
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      },
      viewControl: {
        distance: 400,
        alpha: 20,
        beta: 40
      },
      environment: 'none'
    },
    series: [{
      type: 'scatter3D',
      data: data,
      symbolSize: function (val) {
        return val[3] * 2
      },
      itemStyle: {
        opacity: 0.8
      },
      emphasis: {
        itemStyle: {
          color: '#ff6b6b'
        }
      }
    }]
  }
})

// 3D柱状图配置
const barDouble3DOption = computed(() => {
  const data = [1700, 800, 1700, 600, 800, 1700]
  const data2 = [2600, 1400, 3350, 1400, 1400, 3350]
  return createBarDouble3DChartConfig(data, data2, {
    max: 3500,
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