// 图表配置工厂函数
import * as echarts from 'echarts'

// 获取响应式字体大小
export const getResponsiveFontSize = (baseSize) => {
  const screenWidth = window.innerWidth
  if (screenWidth >= 11520) {
    return Math.round(baseSize) // ultra
  } else if (screenWidth >= 3840) {
    return Math.round(baseSize * 2) // 4k
  } else if (screenWidth >= 1920) {
    return Math.round(baseSize) // fhd
  }
  return baseSize
}

// 通用颜色配置
export const CHART_COLORS = {
  primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
  gradient: {
    blue: ['#3b82f6', '#1e40af'],
    green: ['#10b981', '#047857'],
    orange: ['#f59e0b', '#d97706'],
    red: ['#ef4444', '#dc2626'],
    purple: ['#8b5cf6', '#7c3aed'],
    cyan: ['#06b6d4', '#0891b2']
  }
}

// 通用样式配置
export const CHART_STYLES = {
  backgroundColor: 'transparent',
  textColor: '#fff',
  axisColor: '#3b82f6',
  gridColor: '#1e40af',
  gridOpacity: 0.3
}

// 柱状图配置工厂
export const createBarChartConfig = (data, categories, options = {}) => {
  const {
    title = '',
    max = 1500,
    colors = CHART_COLORS.gradient.blue,
    showGrid = true,
    rotateLabels = false,
    barWidth = '60%',
    tooltip = true
  } = options

  return {
    tooltip: tooltip
      ? {
          formatter: function (params) {
            return `${params.name}: ${params.value}`
          },
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        }
      : undefined,
    backgroundColor: CHART_STYLES.backgroundColor,
    title: title
      ? {
          text: title,
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(14)
          },
          left: 'center',
          top: '5%'
        }
      : undefined,
    grid: {
      left: '10%',
      right: '10%',
      top: title ? '20%' : '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10),
        rotate: rotateLabels ? 45 : 0
      },
      axisLine: {
        lineStyle: {
          color: CHART_STYLES.axisColor
        }
      }
    },
    yAxis: {
      type: 'value',
      max,
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      },
      axisLine: {
        lineStyle: {
          color: CHART_STYLES.axisColor
        }
      },
      splitLine: showGrid
        ? {
            lineStyle: {
              color: CHART_STYLES.gridColor,
              opacity: CHART_STYLES.gridOpacity
            }
          }
        : undefined
    },
    series: [
      {
        data,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors[0] },
            { offset: 1, color: colors[1] }
          ])
        },
        barWidth
      }
    ]
  }
}

// 折线图配置工厂
export const createLineChartConfig = (seriesData, xAxisData, options = {}) => {
  const { title = '', max = 100, showArea = true, showLegend = true } = options

  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    title: title
      ? {
          text: title,
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(14)
          },
          left: 'center',
          top: '5%'
        }
      : undefined,
    grid: {
      left: '10%',
      right: '10%',
      top: title ? '20%' : '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      },
      axisLine: {
        lineStyle: {
          color: CHART_STYLES.axisColor
        }
      }
    },
    yAxis: {
      type: 'value',
      max,
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      },
      axisLine: {
        lineStyle: {
          color: CHART_STYLES.axisColor
        }
      },
      splitLine: {
        lineStyle: {
          color: CHART_STYLES.gridColor,
          opacity: CHART_STYLES.gridOpacity
        }
      }
    },
    legend: showLegend
      ? {
          data: seriesData.map((s) => s.name),
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(10)
          },
          top: title ? '15%' : '5%'
        }
      : undefined,
    series: seriesData.map((series, index) => ({
      ...series,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
        width: 2
      },
      itemStyle: {
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
      },
      areaStyle: showArea
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}30`
              },
              { offset: 1, color: `${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}10` }
            ])
          }
        : undefined
    }))
  }
}

// 饼图配置工厂
export const createPieChartConfig = (data, options = {}) => {
  const {
    title = '',
    radius = ['40%', '70%'],
    showLabel = false,
    showLegend = true,
    center = ['50%', '50%']
  } = options

  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    title: title
      ? {
          text: title,
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(14)
          },
          left: 'center',
          top: '5%'
        }
      : undefined,
    legend: showLegend
      ? {
          orient: 'vertical',
          left: 'left',
          top: 'center',
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(10)
          }
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius,
        center,
        data,
        itemStyle: {
          color: (params) => CHART_COLORS.primary[params.dataIndex % CHART_COLORS.primary.length]
        },
        label: {
          show: showLabel,
          color: CHART_STYLES.textColor,
          fontSize: getResponsiveFontSize(10),
          formatter: '{b}: {d}%'
        },
        labelLine: {
          show: showLabel,
          lineStyle: {
            color: CHART_STYLES.axisColor
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// 3D柱状图配置工厂
export const createBar3DChartConfig = (data, xAxisData, yAxisData, options = {}) => {
  const { title = '', max = 1000, min = 0 } = options

  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    title: title
      ? {
          text: title,
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(14)
          },
          left: 'center',
          top: '5%'
        }
      : undefined,
    tooltip: {
      formatter: function (params) {
        return `${xAxisData[params.data[0]]} - ${yAxisData[params.data[1]]}<br/>数量: ${
          params.data[2]
        }`
      }
    },
    visualMap: {
      max,
      min,
      inRange: {
        color: [
          '#313695',
          '#4575b4',
          '#74add1',
          '#abd9e9',
          '#e0f3f8',
          '#ffffcc',
          '#fee090',
          '#fdae61',
          '#f46d43',
          '#d73027',
          '#a50026'
        ]
      },
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      textStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    xAxis3D: {
      type: 'category',
      data: xAxisData,
      name: 'X轴',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    yAxis3D: {
      type: 'category',
      data: yAxisData,
      name: 'Y轴',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    zAxis3D: {
      type: 'value',
      name: 'Z轴',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      boxHeight: 80,
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
        distance: 300,
        alpha: 30,
        beta: 40
      },
      environment: 'none'
    },
    series: [
      {
        type: 'bar3D',
        data,
        shading: 'lambert',
        itemStyle: {
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            color: '#ff6b6b'
          }
        }
      }
    ]
  }
}

// 3D折线图配置工厂
export const createLine3DChartConfig = (seriesData, xAxisData, yAxisData, options = {}) => {
  const { title = '' } = options

  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    title: title
      ? {
          text: title,
          textStyle: {
            color: CHART_STYLES.textColor,
            fontSize: getResponsiveFontSize(14)
          },
          left: 'center',
          top: '5%'
        }
      : undefined,
    tooltip: {
      formatter: function (params) {
        return `时间: ${params.data[0]}<br/>类型: ${
          params.data[1]
        }<br/>数值: ${params.data[2].toFixed(2)}`
      }
    },
    legend: {
      data: seriesData.map((s) => s.name),
      textStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      },
      top: '5%'
    },
    xAxis3D: {
      type: 'value',
      name: '时间',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    yAxis3D: {
      type: 'category',
      data: yAxisData,
      name: '类型',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    zAxis3D: {
      type: 'value',
      name: '数值',
      nameTextStyle: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(12)
      },
      axisLabel: {
        color: CHART_STYLES.textColor,
        fontSize: getResponsiveFontSize(10)
      }
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      boxHeight: 100,
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
        distance: 300,
        alpha: 30,
        beta: 40
      },
      environment: 'none'
    },
    series: seriesData.map((series, index) => ({
      ...series,
      type: 'line3D',
      lineStyle: {
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
        width: 3
      },
      itemStyle: {
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
      }
    }))
  }
}

// 3D柱状图配置工厂
export const createBarDouble3DChartConfig = (data, data2, options = {}) => {
  const colorArr2 = ['rgba(11, 83, 128)', 'rgba(2, 143, 224)', 'rgba(11, 83, 128)']
  const colorArr = ['rgb(12, 109, 122)', 'rgba(1, 241, 228)', 'rgb(12, 109, 122)']
  var color = {
    type: 'linear',
    x: 0,
    x2: 1,
    y: 0,
    y2: 0,
    colorStops: [
      {
        offset: 0,
        color: colorArr[0]
      },
      {
        offset: 0.5,
        color: colorArr[0]
      },
      {
        offset: 0.5,
        color: colorArr[1]
      },
      {
        offset: 1,
        color: colorArr[1]
      }
    ]
  }
  var color2 = {
    type: 'linear',
    x: 0,
    x2: 1,
    y: 0,
    y2: 0,
    colorStops: [
      {
        offset: 0,
        color: colorArr2[0]
      },
      {
        offset: 0.5,
        color: colorArr2[0]
      },
      {
        offset: 0.5,
        color: colorArr2[1]
      },
      {
        offset: 1,
        color: colorArr2[1]
      }
    ]
  }
  var barWidth = 30
  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        var str = params[0].name + ':'
        params.filter(function (item) {
          if (item.componentSubType == 'bar') {
            str += '<br/>' + item.seriesName + '：' + item.value
          }
        })
        return str
      }
    },
    //图表大小位置限制
    grid: {
      x: '10%',
      x2: '5%',
      y: '15%',
      y2: '15%'
    },
    xAxis: {
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      //坐标轴
      axisLine: {
        show: true,
        lineStyle: {
          width: 1,
          color: '#214776'
        },
        textStyle: {
          color: '#fff',
          fontSize: '10'
        }
      },
      type: 'category',
      axisLabel: {
        textStyle: {
          color: '#C5DFFB',
          fontWeight: 500,
          fontSize: '14'
        }
      },
      axisTick: {
        textStyle: {
          color: '#fff',
          fontSize: '16'
        },
        show: false
      },
      axisLine: {
        //坐标轴轴线相关设置。数学上的x轴
        show: true,
        lineStyle: {
          type: 'dashed', //线的类型 虚线
          color: '#DEDEDE'
        }
      }
    },
    yAxis: {
      nameTextStyle: {
        color: '#DEDEDE',
        fontSize: 12,
        padding: 10
      },
      min: 0, //最小
      max: 3500, //最大
      interval: 500, //相差
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed', //线的类型 虚线0
          opacity: 0.2 //透明度
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      //坐标值标注
      axisLabel: {
        show: true,
        textStyle: {
          color: '#C5DFFB'
        }
      }
    },
    series: [
      //中
      {
        z: 1,
        name: '绿色',
        type: 'bar',
        barWidth: barWidth,
        barGap: '0%',
        data: data,
        itemStyle: {
          normal: {
            color: color,
            //柱形图上方标题
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: 'rgb(1, 255, 250)',
                fontSize: 8
              }
            }
          }
        }
      },
      //下
      {
        z: 2,
        name: '绿色',
        type: 'pictorialBar',
        data: data.map((item) => item + 90),
        symbol: 'diamond',
        symbolOffset: ['-75%', '50%'],
        symbolSize: [barWidth, 10],
        itemStyle: {
          normal: {
            color: color
          }
        },
        tooltip: {
          show: false
        }
      },
      //上
      {
        z: 3,
        name: '绿色',
        type: 'pictorialBar',
        symbolPosition: 'end',
        data: data,
        symbol: 'diamond',
        symbolOffset: ['-85%', '-60%'],
        symbolSize: [barWidth - 4, (10 * (barWidth - 4)) / barWidth],
        itemStyle: {
          normal: {
            borderWidth: 2,
            color: colorArr[2]
          }
        },
        tooltip: {
          show: false
        }
      },
      {
        z: 1,
        name: '蓝色',
        type: 'bar',
        barWidth: barWidth,
        barGap: '50%',
        data: data2,
        itemStyle: {
          normal: {
            color: color2,
            //柱形图上方标题
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: 'rgb(2, 157, 246)',
                fontSize: 8
              }
            }
          }
        }
      },
      {
        z: 2,
        name: '蓝色',
        type: 'pictorialBar',
        data: data2.map((item) => item + 90),
        symbol: 'diamond',
        symbolOffset: ['75%', '50%'],
        symbolSize: [barWidth, 10],
        itemStyle: {
          normal: {
            color: color2
          }
        },
        tooltip: {
          show: false
        }
      },
      {
        z: 3,
        name: '蓝色',
        type: 'pictorialBar',
        symbolPosition: 'end',
        data: data2,
        symbol: 'diamond',
        symbolOffset: ['75%', '-50%'],
        symbolSize: [barWidth - 4, (10 * (barWidth - 4)) / barWidth],
        itemStyle: {
          normal: {
            borderWidth: 2,
            color: colorArr2[2]
          }
        },
        tooltip: {
          show: false
        }
      }
    ]
  }
}

//竹子图配置工厂
export const createBambooChartConfig = (seriesData, options = {}) => {
  return {
    backgroundColor: CHART_STYLES.backgroundColor,
    grid: {
      left: 10,
      bottom: 0,
      right: 0,
      top: 20,
      containLabel: true
    },
    legend: {
      width: '100%',
      right: 'center',
      top: 0,
      textStyle: {
        color: '#fff',
        padding: [0, 0, 0, 5]
      },
      itemStyle: {
        borderWidth: 0
      },
      itemWidth: 24,
      itemHeight: 12,
      itemGap: 35
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      axisTick: {
        show: false
      },
      axisLine: {
        symbol: ['none', 'arrow'],
        symbolSize: [10, 10],
        symbolOffset: [0, 10],
        lineStyle: {
          color: '#0B5EA0'
        }
      },
      axisLabel: {
        margin: 20,
        textStyle: {
          color: 'rgb(183,227,252)'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#0C5B9B'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#11456F'
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: 'rgba(36,85,134,.2)'
          }
        },
        axisLabel: {
          margin: 20,
          textStyle: {
            color: '#78C0E6'
          }
        }
      }
    ],
    series: seriesData
  }
}
