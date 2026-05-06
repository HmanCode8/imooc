<script setup>
import { ref } from "vue";
import OlMap from "../components/OlMap.vue";
import MenuBar from "../components/MenuBar.vue";
import VehicleDetail from "@/components/onemap/VehicleDetail.vue";
import ComprehensiveDetail from "@/components/onemap/ComprehensiveDetail.vue";
import TrajectoryStats from "@/components/onemap/TrajectoryStats.vue";
import TrajectoryPlayback from "@/components/onemap/TrajectoryPlayback.vue";
import MapTools from "@/components/onemap/MapTools.vue";

const mapType = ref(window.global_config.map.mapType);
const isMenuBarCollapsed = ref(false);
const isSidePanelCollapsed = ref(false);

</script>

<template>
  <div class="h-full w-full">
    <!-- 头部区域 -->
    <div class="h-[6%] w-full">
      <SystemHeader />
    </div>
    <!-- 主体内容区域 -->
    <div class="relative w-full flex h-[94%] overflow-hidden">
      <!-- 菜单栏容器 -->
      <div
        class="h-full transition-all duration-300 ease-in-out relative group"
        :class="isMenuBarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-1/20'"
      >
        <MenuBar />
        <!-- 内部折叠按钮 - 展开时显示 -->
        <div
          v-if="!isMenuBarCollapsed"
          class="absolute -right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer bg-white rounded-full shadow-md p-1 border border-gray-200 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
          @click="isMenuBarCollapsed = true"
        >
          <el-icon><ArrowLeft /></el-icon>
        </div>
      </div>

      <!-- 外部展开按钮 - MenuBar 折叠时显示 -->
      <div
        v-if="isMenuBarCollapsed"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-30 cursor-pointer bg-white rounded-r-lg shadow-md p-1 border border-gray-200 hover:text-blue-500 transition-all"
        @click="isMenuBarCollapsed = false"
      >
        <el-icon><ArrowRight /></el-icon>
      </div>

      <!-- 左侧抽屉板容器 -->
      <div
        class="h-full transition-all duration-300 ease-in-out relative group"
        :class="
          isSidePanelCollapsed
            ? 'w-0 opacity-0 overflow-hidden m-0'
            : 'min-w-1/4 m-2 border-b-stone-500'
        "
      >
        <router-view />
        <!-- 内部折叠按钮 - 展开时显示 -->
        <div
          v-if="!isSidePanelCollapsed"
          class="absolute -right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer bg-white rounded-full shadow-md p-1 border border-gray-200 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
          @click="isSidePanelCollapsed = true"
        >
          <el-icon><ArrowLeft /></el-icon>
        </div>
      </div>

      <!-- 外部展开按钮 - SidePanel 折叠时显示 -->
      <div
        v-if="isSidePanelCollapsed"
        class="absolute top-1/2 -translate-y-1/2 z-30 cursor-pointer bg-white rounded-r-lg shadow-md p-1 border border-gray-200 hover:text-blue-500 transition-all"
        :style="{ left: isMenuBarCollapsed ? '32px' : 'calc(6.25% + 10px)' }"
        @click="isSidePanelCollapsed = false"
      >
        <el-icon><ArrowRight /></el-icon>
      </div>
      <!-- 地图区域 -->
      <div class="flex-1 h-full">
        <OlMap :mapType="mapType">
          <template #map-modal>
            <div
              class="absolute left-1 pointer-events-none flex flex-col gap-2"
            >
              <VehicleDetail />
              <ComprehensiveDetail />
              <TrajectoryStats />
            </div>
            <TrajectoryPlayback />
          </template>
          <template #map-tools>
            <MapTools />
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
