<script setup>
import { ref, provide } from 'vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import OlMap from '../components/OlMap.vue'
import MenuBar from '../components/tabs/MenuBar.vue'
import { useChartPreview } from '../hooks/useChartPreview.js'

const mapType = ref('blueBase')

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

// 切换地图类型
const changeMapType = (key) => {
  mapType.value = key
}
</script>

<template>
  <DashboardLayout @changeMapType="changeMapType">
    <!-- 左侧主菜单栏 (MenuBar) -->
    <template #left-panel>
      <MenuBar />
    </template>

    <!-- 左侧内容抽屉 (由路由控制) -->
    <template #left-drawer>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>

    <!-- 地图内容 -->
    <template #map="{ mapOption }">
      <OlMap :mapType="mapOption.mapType"></OlMap>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<!-- 所有样式都使用 Tailwind CSS 类，无需自定义 CSS -->
