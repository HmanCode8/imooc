<template>
  <div
    v-if="globalStore.trajectoryVisible"
    class="w-[360px] h-fit max-h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto flex flex-col overflow-hidden border border-white/20 animate-panel-in"
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
import { ref, reactive, computed, watch } from "vue";
import { ArrowLeft, Close } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures.js";
import { mapInstanceManager } from "@/hooks/useMapInstance";
import dayjs from "dayjs";

const globalStore = useGlobalStore();
const { removeLayer, initMonitorLayer } = useMapFeatures();

const trajectoryDate = ref(dayjs(globalStore.selectedDate).toDate());

// 监听日期变化
watch(
  trajectoryDate,
  async (newDate) => {
    const dateStr = dayjs(newDate).format("YYYY-MM-DD");
    globalStore.setSelectedDate(dateStr);

    // 重新加载地图轨迹
    if (globalStore.selectedTrajectory) {
      const map = await mapInstanceManager.waitForMapReady();
      // 构造一个临时的车辆对象供 initMonitorLayer 使用，只包含当前日期的轨迹
      const vehicleWithCurrentTrajectory = {
        ...globalStore.selectedVehicle,
        ...globalStore.selectedTrajectory,
      };
      initMonitorLayer(map, [vehicleWithCurrentTrajectory]);

      // 自动定位到新轨迹的起点
      if (vehicleWithCurrentTrajectory.actualRoute?.length > 0) {
        map.getView().animate({
          center: vehicleWithCurrentTrajectory.actualRoute[0],
          duration: 800,
          zoom: 15,
        });
      }
    } else {
      // 如果该日期没有轨迹，清除图层
      removeLayer("monitorLayer");
    }
  },
  { immediate: true },
);

const trajectoryStatsMap = computed(() => {
  const stats = globalStore.selectedTrajectory?.stats;
  if (!stats) return {};

  return {
    日期: globalStore.selectedDate,
    开始时间: globalStore.selectedTrajectory.startTime,
    结束时间: globalStore.selectedTrajectory.endTime,
    移动总时长: stats.totalDuration,
    移动距离: stats.totalDistance,
    停留时长: stats.stayDuration,
    最高时速: stats.maxSpeed,
    平均时速: stats.avgSpeed,
    偏移情况: stats.deviationStatus,
  };
});

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

<style scoped>
.animate-panel-in {
  animation: panelSlideIn 0.3s ease-out;
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
