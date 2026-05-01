<template>
  <div
    v-if="globalStore.trajectoryVisible"
    class="w-[360px] h-fit max-h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 border border-white/20"
  >
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-gray-100 theme-bg text-white"
    >
      <div class="flex items-center gap-2">
        <el-icon
          class="cursor-pointer hover:scale-110 transition-transform"
          @click="backToDetails"
        >
          <ArrowLeft />
        </el-icon>
        <span class="font-bold">{{ globalStore.selectedVehicle?.id }}的轨迹</span>
      </div>
      <el-icon
        class="cursor-pointer hover:text-red-200 transition-colors"
        @click="handleCloseTrajectory"
      >
        <Close />
      </el-icon>
    </div>

    <div class="p-4 space-y-4 overflow-y-auto">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">轨迹日期</span>
        <el-date-picker
          v-model="trajectoryDate"
          type="date"
          placeholder="选择日期"
          size="small"
          class="!w-40"
        />
      </div>

      <div
        class="grid grid-cols-1 bg-gray-50/80 border border-gray-100 rounded-xl p-3 divide-y divide-gray-200 divide-dashed"
      >
        <div
          v-for="(val, label) in trajectoryStatsMap"
          :key="label"
          class="flex justify-between py-2.5 text-sm"
        >
          <span class="text-gray-400">{{ label }}</span>
          <span class="text-gray-700 font-semibold">{{ val }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { ArrowLeft, Close } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures.js";

const globalStore = useGlobalStore();
const { removeLayer } = useMapFeatures();

const trajectoryDate = ref(new Date());
const trajectoryStats = reactive({
  date: "2026/04/30",
  startTime: "11:00",
  endTime: "12:00",
  totalDuration: "1 小时",
  totalDistance: "3.5 km",
  stayDuration: "12 分钟",
  maxSpeed: "28 km/h",
  avgSpeed: "14 km/h",
  deviationStatus: "偏移",
});

const trajectoryStatsMap = computed(() => ({
  日期: trajectoryStats.date,
  开始时间: trajectoryStats.startTime,
  结束时间: trajectoryStats.endTime,
  移动总时长: trajectoryStats.totalDuration,
  移动距离: trajectoryStats.totalDistance,
  停留时长: trajectoryStats.stayDuration,
  最高时速: trajectoryStats.maxSpeed,
  平均时速: trajectoryStats.avgSpeed,
  偏移情况: trajectoryStats.deviationStatus,
}));

const handleCloseTrajectory = () => {
  globalStore.setTrajectoryVisible(false);
  // 清除地图上的监控图层
  removeLayer("monitorLayer");
  globalStore.setSelectedVehicleIds([]);
};

const backToDetails = () => {
  globalStore.setDetailsVisible(true);
};
</script>

<style scoped></style>
