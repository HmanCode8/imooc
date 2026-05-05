<template>
  <div
    v-if="globalStore.trajectoryVisible"
    class="absolute bottom-5 left-1/2 -translate-x-1/2 w-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-2xl px-6 py-1 pointer-events-auto flex items-center gap-4 border border-blue-100 animate-playback-in"
  >
    <!-- 播放/暂停按钮 -->
    <div
      class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
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
            v-for="(seg, index) in globalStore.selectedTrajectory
              ?.statusSegments"
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
        <span>{{ globalStore.selectedTrajectory?.startTime || "00:00" }}</span>
        <template v-if="globalStore.selectedTrajectory?.statusSegments">
          <span
            v-for="seg in globalStore.selectedTrajectory.statusSegments.slice(
              0,
              -1,
            )"
            :key="seg.endTime"
          >
            {{ seg.endTime }}
          </span>
        </template>
        <span>{{ globalStore.selectedTrajectory?.endTime || "23:59" }}</span>
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
  const trajectory = globalStore.selectedTrajectory;
  if (!vehicle || !trajectory || !trajectory.statusSegments) return;

  // 1. 找到当前时间进度所在的片段
  const currentSeg = trajectory.statusSegments.find(
    (s) => timeProgress.value >= s.startPct && timeProgress.value <= s.endPtc,
  );

  if (!currentSeg) return;

  // 2. 根据片段内的时间进度，线性插值计算出空间进度
  let lineProgress = currentSeg.startLinePct;

  if (currentSeg.type !== "stay" && currentSeg.endPtc !== currentSeg.startPct) {
    const timeRatio =
      (timeProgress.value - currentSeg.startPct) /
      (currentSeg.endPtc - currentSeg.startPct);
    lineProgress =
      currentSeg.startLinePct +
      timeRatio * (currentSeg.endLinePct - currentSeg.startLinePct);
  }

  if (layers.value.monitorLayer && layers.value.monitorLayer.setProgress) {
    layers.value.monitorLayer.setProgress(lineProgress);
  }
};

onUnmounted(() => {
  stopTimer();
});

// 监听日期切换，重置播放器
watch(
  () => globalStore.selectedDate,
  () => {
    timeProgress.value = 0;
    isPlaying.value = false;
    stopTimer();
    syncMapProgress();
  },
);
</script>

<style scoped>
.animate-playback-in {
  animation: playbackSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes playbackSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
