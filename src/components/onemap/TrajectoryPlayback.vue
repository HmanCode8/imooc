<template>
  <div
    v-if="globalStore.trajectoryVisible"
    class="absolute bottom-5 left-1/2 -translate-x-1/2 w-[800px] bg-white/90 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 pointer-events-auto flex items-center gap-4 border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <!-- 播放/暂停按钮 -->
    <div
      class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
      @click="togglePlayback"
    >
      <el-icon class="text-white" size="20">
        <VideoPause v-if="isPlaying" />
        <VideoPlay v-else />
      </el-icon>
    </div>

    <!-- 进度条区域 -->
    <div class="flex-1 flex flex-col gap-1">
      <!-- 状态标签展示 (动态渲染 statusSegments) -->
      <div class="relative h-5 flex items-center px-1">
        <div
          class="absolute inset-0 flex text-[10px] font-bold overflow-hidden rounded-sm"
        >
          <div
            v-for="(seg, index) in globalStore.selectedVehicle?.statusSegments"
            :key="index"
            class="h-full border-r border-white/20 flex items-center justify-center transition-all"
            :style="{
              width: `${seg.endPtc - seg.startPct}%`,
              backgroundColor: getStatusBg(seg.type),
              color: getStatusColor(seg.type),
            }"
          >
            {{ seg.label }}
          </div>
        </div>
      </div>

      <!-- 进度条本体 -->
      <el-slider
        v-model="timeProgress"
        :min="0"
        :max="100"
        :step="0.1"
        :show-tooltip="false"
        class="playback-slider"
        @input="handleProgressInput"
      />

      <!-- 时间刻度 -->
      <div
        class="flex justify-between text-[11px] text-gray-500 font-medium px-1"
      >
        <span>{{ globalStore.selectedVehicle?.startTime || "11:00" }}</span>
        <template v-if="globalStore.selectedVehicle?.statusSegments">
          <span
            v-for="seg in globalStore.selectedVehicle.statusSegments.slice(
              0,
              -1,
            )"
            :key="seg.endTime"
          >
            {{ seg.endTime }}
          </span>
        </template>
        <span>{{ globalStore.selectedVehicle?.endTime || "12:00" }}</span>
      </div>
    </div>

    <!-- 倍速切换 -->
    <div class="flex items-center gap-2 px-2 border-l border-gray-100 ml-2">
      <el-dropdown trigger="click" @command="handleSpeedChange">
        <span
          class="text-blue-600 font-bold text-sm cursor-pointer hover:underline italic"
        >
          {{ playbackSpeed }}x
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="1">1x</el-dropdown-item>
            <el-dropdown-item command="2">2x</el-dropdown-item>
            <el-dropdown-item command="4">4x</el-dropdown-item>
            <el-dropdown-item command="8">8x</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";
import { VideoPlay, VideoPause } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures";

const globalStore = useGlobalStore();
const { layers } = useMapFeatures();

const isPlaying = ref(false);
const timeProgress = ref(0); // 时间轴进度 0-100
const playbackSpeed = ref(1);
let timer = null;

const getStatusBg = (type) => {
  const bgs = {
    normal: "rgba(236, 253, 245, 0.8)", // green-50
    stay: "rgba(255, 251, 235, 0.8)", // yellow-50
    deviation: "rgba(250, 245, 255, 0.8)", // purple-50
  };
  return bgs[type] || "transparent";
};

const getStatusColor = (type) => {
  const colors = {
    normal: "#059669", // green-600
    stay: "#d97706", // yellow-600
    deviation: "#7c3aed", // purple-600
  };
  return colors[type] || "#666";
};

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startTimer();
  } else {
    stopTimer();
  }
};

const startTimer = () => {
  stopTimer();
  timer = setInterval(() => {
    // 进一步降低步进值，使速度变慢且更平滑 (从 0.05 降到 0.02)
    timeProgress.value += 0.02 * playbackSpeed.value;
    if (timeProgress.value >= 100) {
      timeProgress.value = 100;
      isPlaying.value = false;
      stopTimer();
    }
    syncMapProgress();
  }, 30); // 30ms 左右的间隔，接近 30fps，保证平滑度
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
};

const handleProgressInput = (val) => {
  timeProgress.value = val;
  syncMapProgress();
};

const handleSpeedChange = (command) => {
  playbackSpeed.value = parseInt(command);
  if (isPlaying.value) startTimer();
};

/**
 * 核心逻辑：将时间轴进度映射为地图轨迹的进度
 * 正常/偏移：进度随时间线性增长
 * 停留：进度保持不变（小车静止）
 */
const syncMapProgress = () => {
  const vehicle = globalStore.selectedVehicle;
  if (!vehicle || !vehicle.statusSegments) return;

  // 1. 找到当前时间进度所在的片段
  const currentSeg = vehicle.statusSegments.find(
    (s) => timeProgress.value >= s.startPct && timeProgress.value <= s.endPtc,
  );

  if (!currentSeg) return;

  // 2. 计算轨迹进度 (Line Progress 0-1)
  let lineProgress = 0;

  if (currentSeg.type === "stay") {
    // 停留状态：小车坐标固定在当前片段开始时的位置
    lineProgress = currentSeg.startPct / 100;
  } else {
    // 正常/偏移状态：小车在片段起始和结束比例之间平滑移动
    // 我们假设时间轴的百分比直接对应轨迹路径的百分比
    lineProgress = timeProgress.value / 100;
  }

  if (layers.value.monitorLayer && layers.value.monitorLayer.setProgress) {
    layers.value.monitorLayer.setProgress(lineProgress);
  }
};

onUnmounted(() => {
  stopTimer();
});

watch(
  () => globalStore.trajectoryVisible,
  (val) => {
    if (!val) {
      stopTimer();
      isPlaying.value = false;
      timeProgress.value = 0;
    }
  },
);
</script>

<style scoped>
.playback-slider :deep(.el-slider__runway) {
  @apply h-1.5 bg-gray-100/50 rounded-full;
}

.playback-slider :deep(.el-slider__bar) {
  @apply h-1.5 bg-blue-500 rounded-full;
}

.playback-slider :deep(.el-slider__button) {
  @apply w-4 h-4 border-2 border-blue-500 bg-white shadow-md;
}

.playback-slider {
  @apply h-auto py-1;
}
</style>
