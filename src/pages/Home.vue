<script setup>
import { ref, provide } from "vue";
import DashboardLayout from "../components/DashboardLayout.vue";
import OlMap from "../components/OlMap.vue";
import MenuBar from "../components/tabs/MenuBar.vue";
import { useChartPreview } from "../hooks/useChartPreview.js";
import Trajectory from "./onemap/Trajectory.vue";
import CarQuery from "./onemap/CarQuery.vue";
import VehicleDetail from "@/components/onemap/VehicleDetail.vue";
import TrajectoryStats from "@/components/onemap/TrajectoryStats.vue";

const mapType = ref("base");

// 全局图表预览功能
const {
  isPreviewVisible,
  previewOption,
  previewTitle,
  previewDescription,
  previewChartType,
  showPreview,
  hidePreview,
  handleChartExport,
} = useChartPreview();

// 提供全局预览功能给子组件
provide("chartPreview", {
  showPreview,
  hidePreview,
  handleChartExport,
});

// 切换地图类型
const changeMapType = (key) => {
  mapType.value = key;
};
</script>

<template>
  <div class="h-full w-full">
    <!-- 头部区域 -->
    <div class="h-[8%]">
      <SystemHeader />
    </div>
    <!-- 主体内容区域 -->
    <div class="relative flex h-[92%]">
      <div class="w-1/16 h-full">
        <MenuBar />
      </div>
      <!-- 左侧抽屉板 -->
      <div class="w-4/16 h-full m-2 border-b-stone-500">
        <router-view />
      </div>
      <!-- 地图区域 -->
      <div class="flex-1 h-full">
        <OlMap :mapType="mapType">
          <template #map-modal>
            <div class="absolute top-5 left-5 pointer-events-none flex gap-4">
              <VehicleDetail />
              <TrajectoryStats />
            </div>
          </template>
        </OlMap>
      </div>
      <!-- 地图样式切换 - 抽屉式 -->
      <div class="absolute right-0 bottom-10 z-10">
        <MapToggle v-model="mapType" class="" />
      </div>
    </div>
  </div>
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
