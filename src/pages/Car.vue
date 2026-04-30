<script setup>
import { ref, onMounted } from 'vue'
import { carData } from '@/mock/car'
import { useMapFeatures } from '@/hooks/useMapFeatures'

const { setTracksVisible } = useMapFeatures()

const activeSubMenu = ref('1')
const showTracks = ref(true)

// 获取统计数据
const totalCars = carData.length
const onlineCars = carData.filter(c => c.status === 'online').length

const toggleTracks = () => {
  showTracks.value = !showTracks.value
  setTracksVisible(showTracks.value)
}
</script>

<template>
  <div class="flex h-full w-[400px] theme-bg-opacity backdrop-blur-md border-r border-white/10 text-white">
    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <h3 class="text-lg font-bold text-blue-400 tracking-wider">车辆实时监控</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">显示轨迹</span>
          <el-switch v-model="showTracks" @change="toggleTracks" />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div class="space-y-4">
          <!-- 统计信息 -->
          <div class="p-3 bg-white/5 rounded-lg border border-white/10">
            <div class="text-sm text-gray-400 mb-2">统计信息</div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                <div class="text-xs text-blue-400">车辆总数</div>
                <div class="text-xl font-bold">{{ totalCars }}</div>
              </div>
              <div class="bg-green-500/10 p-3 rounded border border-green-500/20">
                <div class="text-xs text-green-400">在线运行</div>
                <div class="text-xl font-bold">{{ onlineCars }}</div>
              </div>
            </div>
          </div>
          
          <div class="text-sm text-gray-400">实时车辆列表</div>
          <div class="space-y-2">
            <div v-for="car in carData" :key="car.id" class="p-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-blue-500/30">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-blue-400">{{ car.plateNo }}</span>
                <span :class="`text-[10px] px-1.5 py-0.5 rounded ${car.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`">
                  {{ car.status === 'online' ? '在线' : '离线' }}
                </span>
              </div>
              <div class="flex justify-between text-[11px] text-gray-400">
                <span>{{ car.category }} | {{ car.enterprise }}</span>
                <span class="text-blue-300">{{ car.region }}</span>
              </div>
              <div v-if="car.status === 'online'" class="mt-2 grid grid-cols-3 gap-1 text-[10px] text-gray-500 border-t border-white/5 pt-2">
                <span>速度: {{ car.terminalInfo.speed }}km/h</span>
                <span>电量: {{ car.terminalInfo.power }}%</span>
                <span>信号: {{ car.terminalInfo.signalStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-bg-opacity {
  background: rgba(10, 25, 47, 0.8);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}
</style>

<style scoped lang="scss"></style>