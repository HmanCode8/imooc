import { inject } from 'vue'

/**
 * 全局图表预览功能混入
 * 通过 inject 获取全局预览功能
 */
export function useGlobalChartPreview() {
  const chartPreview = inject('chartPreview')

  if (!chartPreview) {
    console.warn('useGlobalChartPreview: chartPreview not found in context')
    return {
      showPreview: () => {},
      hidePreview: () => {},
      handleChartExport: () => {}
    }
  }

  /**
   * 显示图表预览
   * @param {Object} option - 图表配置
   * @param {String} title - 图表标题
   * @param {String} description - 图表描述
   * @param {String} chartType - 图表类型
   */
  const showPreview = (option, title = '图表预览', description = '', chartType = '未知类型') => {
    chartPreview.showPreview(option, title, description, chartType)
  }

  /**
   * 隐藏图表预览
   */
  const hidePreview = () => {
    chartPreview.hidePreview()
  }

  /**
   * 处理图表导出事件
   * @param {Object} exportData - 导出数据
   */
  const handleChartExport = (exportData) => {
    chartPreview.handleChartExport(exportData)
  }

  /**
   * 处理图表双击事件
   * @param {Object} option - 图表配置
   * @param {String} title - 图表标题
   * @param {String} description - 图表描述
   * @param {String} chartType - 图表类型
   */
  const handleChartDoubleClick = (option, title, description, chartType) => {
    showPreview(option, title, description, chartType)
  }

  return {
    showPreview,
    hidePreview,
    handleChartExport,
    handleChartDoubleClick
  }
}
