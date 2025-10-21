<template>
  <div
    class="h-screen w-screen bg-gradient-to-br from-blue-400 to-blue-900  text-white overflow-hidden flex flex-col relative">
    <!-- 科技背景效果 -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0"
        style="background-image: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%);">
      </div>
    </div>

    <!-- 网格背景 -->
    <div class="absolute inset-0 opacity-5"
      style="background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px); background-size: 50px 50px;">
    </div>
    <!-- 头部区域 -->
    <div class="header-container">
      <slot name="header">
        <SystemHeader />
      </slot>
    </div>
    <!-- 主体内容区域 -->
    <div
      class="flex-1 relative h-[calc(100vh-8rem)] fhd:h-[calc(100vh-10rem)] 4k:h-[calc(100vh-12rem)] ultra:h-[calc(100vh-14rem)]">
      <!-- 地图区域 - 占满整个屏幕宽度 -->
      <div class="absolute inset-0 w-full h-full z-5">
        <slot name="map" :mapOption="{ mapType }">
          <h2 class="text-xl fhd:text-2xl 4k:text-3xl font-semibold text-white mb-2">地图区域</h2>
        </slot>
      </div>
      <!-- Tabs区域 -->

      <div class=" absolute left-1/2 z-10 translate-x-[-50%] translate-y-1/2">
        <slot name="top-tabs">
          <div class="">tab</div>
        </slot>
      </div>
      <!-- 左侧面板 - 绝对定位覆盖在地图左侧 -->
      <div class="absolute left-0 opacity-95 top-0 w-1/4 h-full bg-transparent backdrop-blur-sm shadow-lg z-10">
        <div class="h-full overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
          <div class="min-h-full">
            <slot name="left-panel">
              <h3 class="text-lg fhd:text-xl 4k:text-2xl font-semibold text-white mb-2">左侧面板</h3>
            </slot>
          </div>
        </div>
      </div>

      <!-- 右侧面板 - 绝对定位覆盖在地图右侧 -->
      <div class="absolute right-0 opacity-95 top-0 w-1/4 h-full bg-transparent backdrop-blur-sm shadow-lg z-10">
        <div class="h-full overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
          <div class="min-h-full">
            <slot name="right-panel">
              <div
                class="flex flex-col items-center justify-center h-full text-center text-gray-400 border-2 border-dashed border-gray-600 rounded-lg m-4">
                <h3 class="text-lg fhd:text-xl 4k:text-2xl font-semibold text-white mb-2">右侧面板</h3>
                <p class="text-sm fhd:text-base 4k:text-lg">这里可以放置右侧内容</p>
              </div>
            </slot>
          </div>
        </div>
      </div>

      <!-- 地图样式切换 - 抽屉式 -->
      <div class="absolute right-1/4 bottom-10 z-10">
        <MapToggle v-model="mapType" class="" />
      </div>
      <!-- 图层目录（可拖拽） -->
      <DraggableSlot :x="500" :y="100" :z-index="2000" handle=".drag-header">
        <div class="w-[300px]">
          <div class="drag-header cursor-move px-3 py-2 bg-black/40 text-white rounded-t">
            管线目录
          </div>
          <PipeTree ref="pipeTreeRef" />
        </div>
      </DraggableSlot>
    </div>

    <!-- 全局图表预览组件 -->
    <slot name="chart-preview"></slot>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SystemHeader from './SystemHeader.vue'
import MapToggle from "@/components/MapToggle.vue";
import PipeTree from "@/components/PipeTree.vue";
import DraggableSlot from "@/components/DraggableSlot.vue";
// 地图切换相关数据
const currentMapType = ref('LIGHT_GRAY')
const mapType = ref(window.global_config.map.mapType)
const pipeTreeRef = ref(null)
// 定义事件
const emit = defineEmits(['changeMapType'])

// 切换地图类型
const switchMapType = (mapTypeKey) => {
  if (mapTypeKey === 'THREE_D') {
    emit('changeMapType', mapTypeKey)
    return
  }

  currentMapType.value = mapTypeKey
  emit('changeMapType', mapTypeKey)

}

watch(mapType, (val) => {
  console.log('mapType', val)
})
// 获取样式预览类名
const getStylePreviewClass = (mapTypeKey) => {
  const styleClasses = {
    'IMAGERY': 'bg-gradient-to-br from-green-400 to-green-600', // 影像 - 深绿色
    'POLAR_NIGHT': 'bg-gradient-to-br from-blue-900 to-blue-600', // 极夜蓝 - 深蓝色
    'DARK_NIGHT': 'bg-gradient-to-br from-gray-900 to-black', // 暗夜黑 - 黑色
    'LIGHT_GRAY': 'bg-gradient-to-br from-gray-100 to-gray-300', // 浅灰色 - 浅灰色
    'THREE_D': 'bg-gradient-to-br from-purple-400 to-purple-600' // 3D地图 - 紫色
  }
  return styleClasses[mapTypeKey] || 'bg-gray-300'
}

// 暴露方法给父组件
defineExpose({
  currentMapType,
  switchMapType,
  getStylePreviewClass
})
</script>

<style scoped>
/* 地图样式切换 - 抽屉式 */
.map-style-drawer {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* 样式项基础样式 */
.map-style-item {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 第一个选项 - 默认显示 */
.map-style-first {
  position: relative;
  z-index: 20;
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 隐藏的选项 - 初始状态 */
.map-style-hidden {
  position: absolute;
  right: 0;
  bottom: 0;
  opacity: 0;
  transform: translateX(100%) scale(0.8);
  pointer-events: none;
  z-index: 10;
}

/* 悬停时展开所有选项 */
.map-style-drawer:hover .map-style-hidden {
  opacity: 1;
  transform: translateX(0) scale(1);
  pointer-events: auto;
  position: relative;
  right: auto;
  bottom: auto;
}

/* 悬停时第一个选项稍微放大 */
.map-style-drawer:hover .map-style-first {
  transform: scale(1.05);
}

/* 样式项悬停效果 */
.map-style-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.map-style-active {
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid #3b82f6;
}

.map-style-inactive {
  background: transparent;
  border: 2px solid transparent;
}

.map-style-inactive:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 响应式设计 */
@media (max-width: 1920px) {
  .map-style-drawer {
    gap: 6px;
  }

  .map-style-item {
    padding: 2px;
  }
}

@media (min-width: 3840px) {
  .map-style-drawer {
    gap: 12px;
  }

  .map-style-item {
    padding: 6px;
  }
}

@media (min-width: 11520px) {
  .map-style-drawer {
    gap: 16px;
  }

  .map-style-item {
    padding: 8px;
  }
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-thin {
  /* Firefox */
  scrollbar-width: none;
  /* IE and Edge */
  -ms-overflow-style: none;
}

/* Webkit浏览器 (Chrome, Safari, Edge) */
.scrollbar-thin::-webkit-scrollbar {
  display: none;
}
</style>
