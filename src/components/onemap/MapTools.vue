<template>
  <div
    class="flex flex-col gap-2 p-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 pointer-events-auto"
  >
    <button
      @click="toggleCollapse"
      class="flex flex-col items-center justify-center w-14 h-10 rounded-md transition-all hover:bg-blue-50 text-gray-600 group"
      :title="collapsed ? '展开' : '收起'"
    >
      <div class="transition-transform group-hover:scale-110">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="collapsed"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>
    </button>

    <template v-if="!collapsed">
      <button
        @click="handleStub('图层')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="图层"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l9 5-9 5-9-5 9-5zm0 10l9-5v6l-9 5-9-5V8l9 5z" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">图层</span>
      </button>

      <button
        @click="handleStub('纠错')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="纠错"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 6l3 3M4 20h4l10-10a2 2 0 00-4-4L4 16v4z" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">纠错</span>
      </button>

      <button
        @click="handleStub('书签')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="书签"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">书签</span>
      </button>

      <button
        @click="handleStub('制图')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="制图"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M6 3h12M7 21h10M9 7v12m6-12v12" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">制图</span>
      </button>

      <button
        @click="handleStub('分析')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="分析"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19V5m6 14V9m6 10V7m4 12h-2" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">分析</span>
      </button>

      <button
        @click="handleStub('拾取')"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group text-gray-600"
        title="拾取"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 11l6-6m0 0h-4m4 0v4M5 19l6-6m-6 6h4m-4 0v-4" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">拾取</span>
      </button>

      <button
        @click="handleMeasure('LineString')"
        :class="[
          'flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group',
          activeType === 'LineString' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
        ]"
        title="测距"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">距离</span>
      </button>

      <button
        @click="handleMeasure('Polygon')"
        :class="[
          'flex flex-col items-center justify-center  rounded-md transition-all hover:bg-blue-50 group',
          activeType === 'Polygon' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
        ]"
        title="测面"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2zm2 0h12v10H6V7zm2 2h8v2H8V9zm0 4h8v2H8v-2z" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">面积</span>
      </button>

      <button
        @click="handleClear"
        class="flex flex-col items-center justify-center  rounded-md transition-all hover:bg-red-50 text-gray-600 hover:text-red-600 group"
        title="清除测量"
      >
        <div class="mb-1 transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <span class="text-[10px] font-bold">清除</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useMapMeasure } from "@/hooks/useMapMeasure";

const { startMeasure, stopMeasure, clearMeasure } = useMapMeasure();
const activeType = ref(null);
const collapsed = ref(false);

const handleMeasure = (type) => {
  if (activeType.value === type) {
    stopMeasure();
    activeType.value = null;
  } else {
    activeType.value = type;
    startMeasure(type);
  }
};

const handleClear = () => {
  clearMeasure();
  activeType.value = null;
};

const handleStub = (label) => {
  ElMessage.info(`${label}功能开发中`);
};

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};
</script>

<style scoped>
/* 可以添加一些阴影动画 */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
