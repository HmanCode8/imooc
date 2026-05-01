<template>
  <div class="text-white rounded-lg p-0 bg-[#0a1d33] min-w-[280px] border border-blue-500/30 shadow-[0_0_15px_rgba(0,145,255,0.3)] overflow-hidden font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 theme-bg border-b border-blue-500/30">
      <div class="flex items-center gap-2">
        <i class="iconfont icon-cheliangyizhangtu text-white"></i>
        <h3 class="text-sm font-bold tracking-wider">{{ carData?.plateNo || title }}</h3>
      </div>
      <div class="hover:text-blue-400 cursor-pointer transition-colors text-lg leading-none" @click="onClose">
        &times;
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-3">
      <!-- Status Tags -->
      <div class="flex gap-2 mb-2">
        <span :class="`px-2 py-0.5 rounded text-[10px] ${carData?.status === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'theme-bg text-gray-400 border border-gray-500/30'}`">
          {{ carData?.status === 'online' ? '在线' : '离线' }}
        </span>
        <span class="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 theme-bg border border-blue-500/30">
          {{ carData?.category }}
        </span>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div class="flex flex-col gap-1">
          <span class="text-gray-400">所属单位</span>
          <span class="text-gray-100 truncate" :title="carData?.enterprise">{{ carData?.enterprise }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-400">当前速度</span>
          <span class="text-blue-400 font-mono">{{ carData?.terminalInfo?.speed || 0 }} km/h</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-400">剩余电量</span>
          <div class="flex items-center gap-1">
            <div class="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500" 
                :style="{ width: `${carData?.terminalInfo?.power || 0}%` }"
              ></div>
            </div>
            <span class="text-gray-100">{{ carData?.terminalInfo?.power || 0 }}%</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-400">运行状态</span>
          <span class="text-gray-100">{{ carData?.terminalInfo?.status || '-' }}</span>
        </div>
      </div>

      <!-- Location -->
      <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
        <div class="flex gap-2">
          <span>Lng: {{ coordinates[0].toFixed(5) }}</span>
          <span>Lat: {{ coordinates[1].toFixed(5) }}</span>
        </div>
        <span class="hover:text-blue-400 cursor-pointer underline" @click="copyToClipboard(`${coordinates[0]},${coordinates[1]}`)">复制坐标</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from 'element-plus'

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('坐标已复制到剪贴板')
  })
};

defineProps({
  title: {
    type: String,
    default: "车辆详情",
  },
  coordinates: {
    type: Array,
    required: true,
  },
  carData: {
    type: Object,
    default: () => ({})
  },
  onClose: {
    type: Function,
    required: true,
  },
});
</script>

<style scoped></style>
