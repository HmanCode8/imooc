// Tab组件映射配置
export const TAB_COMPONENTS = {
  // 管线总览
  pipeOverview: {
    left: () => import('./PipeOverviewLeft.vue'),
    right: () => import('./PipeOverviewRight.vue')
  },
  // 管线总览3D
  pipeOverview3D: {
    left: () => import('./PipeOverviewLeft3D.vue'),
    right: () => import('./PipeOverviewRight3D.vue')
  },
  // 管线详情
  pipeDetail: {
    left: () => import('./PipeDetailLeft.vue'),
    right: () => import('./PipeDetailRight.vue')
  },
  // 管线统计
  pipeStatistics: {
    left: () => import('./PipeStatisticsLeft.vue'),
    right: () => import('./PipeStatisticsRight.vue')
  },
  // 管线分析
  pipeAnalysis: {
    left: () => import('./PipeAnalysisLeft.vue'),
    right: () => import('./PipeAnalysisRight.vue')
  },
  // 数据表格
  dataTable: {
    left: () => import('./DataTableLeft.vue'),
    right: () => import('./PipeOverviewRight.vue') // 复用右侧组件
  }
}

// Tab配置
export const TAB_CONFIG = [
  {
    label: '管线总览',
    value: 'pipeOverview',
    description: '管线系统整体运行状态'
  },
  {
    label: '3D总览',
    value: 'pipeOverview3D',
    description: '管线系统3D可视化展示'
  },
  {
    label: '管线详情',
    value: 'pipeDetail',
    description: '管线详细信息和检测数据'
  },
  {
    label: '管线统计',
    value: 'pipeStatistics',
    description: '管线建设和维护统计数据'
  },
  {
    label: '管线分析',
    value: 'pipeAnalysis',
    description: '管线风险分析和性能评估'
  },
  {
    label: '数据表格',
    value: 'dataTable',
    description: '实时数据监控表格'
  }
]
