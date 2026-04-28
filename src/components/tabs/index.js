// Tab组件映射配置
export const TAB_COMPONENTS = {
  //menuBar
  menuBar: {
    left: () => import('./MenuBar.vue'),
  },
}

// Tab配置
export const TAB_CONFIG = [
  {
    label: '管线总览',
    value: 'pipeOverview',
    description: '管线系统整体运行状态',
  },
  {
    label: '3D总览',
    value: 'pipeOverview3D',
    description: '管线系统3D可视化展示',
  },
  {
    label: '管线详情',
    value: 'pipeDetail',
    description: '管线详细信息和检测数据',
  },
  {
    label: '管线统计',
    value: 'pipeStatistics',
    description: '管线建设和维护统计数据',
  },
  {
    label: '管线分析',
    value: 'pipeAnalysis',
    description: '管线风险分析和性能评估',
  },
  {
    label: '数据表格',
    value: 'dataTable',
    description: '实时数据监控表格',
  },
]
