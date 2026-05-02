<template>
  <div class="flex flex-col gap-2 p-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 pointer-events-auto">
    <!-- 测距 -->
    <button
      @click="handleMeasure('LineString')"
      :class="[
        'flex flex-col items-center justify-center w-14 h-14 rounded-md transition-all hover:bg-blue-50 group',
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

    <!-- 测面 -->
    <button
      @click="handleMeasure('Polygon')"
      :class="[
        'flex flex-col items-center justify-center w-14 h-14 rounded-md transition-all hover:bg-blue-50 group',
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

    <!-- 清除 -->
    <button
      @click="handleClear"
      class="flex flex-col items-center justify-center w-14 h-14 rounded-md transition-all hover:bg-red-50 text-gray-600 hover:text-red-600 group"
      title="清除测量"
    >
      <div class="mb-1 transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <span class="text-[10px] font-bold">清除</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMapMeasure } from '@/hooks/useMapMeasure';

const { startMeasure, stopMeasure, clearMeasure } = useMapMeasure();
const activeType = ref(null);

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
</script>

<style scoped>
/* 可以添加一些阴影动画 */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
