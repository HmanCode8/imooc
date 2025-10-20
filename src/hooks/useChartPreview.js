import { ref } from 'vue'

/**
 * 图表预览功能混入
 * 提供双击展开预览的功能
 */
export function useChartPreview() {
  const isPreviewVisible = ref(false)
  const previewOption = ref({})
  const previewTitle = ref('')
  const previewDescription = ref('')
  const previewChartType = ref('')

  /**
   * 显示图表预览
   * @param {Object} option - 图表配置
   * @param {String} title - 图表标题
   * @param {String} description - 图表描述
   * @param {String} chartType - 图表类型
   */
  const showPreview = (option, title = '图表预览', description = '', chartType = '未知类型') => {
    previewOption.value = option
    previewTitle.value = title
    previewDescription.value = description
    previewChartType.value = chartType
    isPreviewVisible.value = true
  }

  /**
   * 隐藏图表预览
   */
  const hidePreview = () => {
    isPreviewVisible.value = false
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

  /**
   * 处理预览关闭事件
   */
  const handlePreviewClose = () => {
    hidePreview()
  }

  /**
   * 处理图表导出事件
   * @param {Object} exportData - 导出数据
   */
  const handleChartExport = (exportData) => {
    console.log('图表导出:', exportData)
    // 这里可以添加导出逻辑，比如发送到服务器或保存到本地
  }

  return {
    // 响应式数据
    isPreviewVisible,
    previewOption,
    previewTitle,
    previewDescription,
    previewChartType,
    
    // 方法
    showPreview,
    hidePreview,
    handleChartDoubleClick,
    handlePreviewClose,
    handleChartExport
  }
}
