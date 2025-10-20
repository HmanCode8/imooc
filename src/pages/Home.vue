<script setup>
import { ref, shallowRef, defineAsyncComponent, provide } from 'vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import OlMap from '../components/OlMap.vue'
import CesiumMap from '../components/CesiumMap.vue'
import Tabs from '../components/Tabs.vue'
import ChartPreview from '../components/charts/ChartPreview.vue'
import { TAB_COMPONENTS } from '../components/tabs/index.js'
import { useChartPreview } from '../hooks/useChartPreview.js'

// 当前激活的 tab
const activeTab = ref('pipeOverview')
const mapType = ref('blueBase')

// ✅ 使用 shallowRef 防止组件被响应式代理
const LeftComponent = shallowRef(null)
const RightComponent = shallowRef(null)

// 全局图表预览功能
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

// 提供全局预览功能给子组件
provide('chartPreview', {
  showPreview,
  hidePreview,
  handleChartExport
})

// 切换 tab
const changeTab = async (tabValue) => {
  activeTab.value = tabValue

  // 动态加载对应的组件
  const tabComponents = TAB_COMPONENTS[tabValue]
  if (tabComponents) {
    LeftComponent.value = defineAsyncComponent(tabComponents.left)
    RightComponent.value = defineAsyncComponent(tabComponents.right)
  }
}

// 初始化默认 tab
changeTab(activeTab.value)

// 切换地图类型
const changeMapType = (key) => {
  mapType.value = key
}
</script>

<template>
  <DashboardLayout @changeMapType="changeMapType">
    <!-- 顶部 Tabs -->
    <template #top-tabs>
      <Tabs @changeTab="changeTab" />
    </template>

    <!-- 左侧面板 -->
    <template #left-panel>
      <component :is="LeftComponent" v-if="LeftComponent" />
    </template>

    <!-- 地图内容 -->
    <template #map="{ mapOption }">
      <!-- <CesiumMap v-if="mapType === 'THREE_D'" /> -->
      <OlMap :mapType="mapOption.mapType"></OlMap>
    </template>

    <!-- 右侧面板 -->
    <template #right-panel>
      <component :is="RightComponent" v-if="RightComponent" />
    </template>

    <!-- 全局图表预览 -->
    <template #chart-preview>
      <ChartPreview :visible="isPreviewVisible" :option="previewOption" :title="previewTitle"
        :description="previewDescription" :chartType="previewChartType" @close="hidePreview"
        @export="handleChartExport" />
    </template>
  </DashboardLayout>
</template>

<!-- 所有样式都使用 Tailwind CSS 类，无需自定义 CSS -->
