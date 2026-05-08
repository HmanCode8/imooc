<template>
  <div
    v-if="globalStore.detailsVisible"
    class="w-[400px] h-fit max-h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto flex flex-col overflow-hidden border border-white/20 animate-panel-in"
  >
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50"
    >
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 theme-bg rounded-full"></div>
        <span class="font-bold text-gray-700">{{
          globalStore.selectedVehicle?.id
        }}</span>
      </div>
      <el-icon
        class="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
        @click="globalStore.setDetailsVisible(false)"
      >
        <Close />
      </el-icon>
    </div>

    <div class="flex-1 overflow-y-auto">
      <el-tabs v-model="activeTab" class="custom-tabs px-4">
        <el-tab-pane label="基本信息" name="basic">
          <div
            v-if="globalStore.selectedVehicle"
            class="divide-y divide-gray-100 pb-4"
          >
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">车架号</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.id
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">车辆状态</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.statusText ||
                globalStore.selectedVehicle.status
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">车辆种类</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.category
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">车辆类型</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.type
              }}</span>
            </div>
            <div class="py-2.5 flex">
              <div class="text-gray-400 text-sm mb-2">车辆照片</div>
              <div
                class="w-2/3 h-40 ml-4 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200"
              >
                <img
                  v-if="globalStore.selectedVehicle.photo"
                  :src="globalStore.selectedVehicle.photo"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="flex flex-col items-center gap-1 text-gray-300"
                >
                  <el-icon size="24"><Picture /></el-icon>
                  <span class="text-[10px]">暂无照片</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="安全员" name="safety">
          <div
            v-if="globalStore.selectedVehicle?.securityInfo"
            class="divide-y divide-gray-100 pb-4"
          >
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">姓名</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.securityInfo.name
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">性别</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.securityInfo.gender
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">联系电话</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.securityInfo.phone
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">所属单位</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.securityInfo.unit
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">证件号码</span>
              <span class="flex-1 text-gray-700 text-xs">{{
                globalStore.selectedVehicle.securityInfo.licenseNo
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">驾驶证有效期</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.securityInfo.licenseValidUntil || "-"
              }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="终端对接" name="terminal">
          <div
            v-if="globalStore.selectedVehicle?.terminalInfo"
            class="grid grid-cols-1 divide-y divide-gray-100 pb-4"
          >
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">速度</span>
              <span
                class="flex-1 text-gray-700 font-medium text-blue-600 text-sm"
                >{{ globalStore.selectedVehicle.terminalInfo.speed }} km/h</span
              >
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">状态</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.terminalInfo.status
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">剩余电量</span>
              <el-progress
                :percentage="globalStore.selectedVehicle.terminalInfo.power"
                :stroke-width="8"
                class="flex-1"
              />
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">电池温度</span>
              <span class="flex-1 text-gray-700 text-sm"
                >{{
                  globalStore.selectedVehicle.terminalInfo.batteryTemp
                }}°C</span
              >
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">档位</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.terminalInfo.gear || "-"
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">车辆灯光</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.terminalInfo.lightStatus || "-"
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">喇叭</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.terminalInfo.hornStatus || "-"
              }}</span>
            </div>
            <div class="flex py-2.5 items-center">
              <span class="w-24 text-gray-400 text-sm">信号实时状态</span>
              <span class="flex-1 text-gray-700 text-sm">{{
                globalStore.selectedVehicle.terminalInfo.signalRealtime ||
                globalStore.selectedVehicle.terminalInfo.signalStatus ||
                "-"
              }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="w-full flex justify-end my-4">
      <el-button
        type="primary"
        size="small"
        class="w-30 flex justify-end !rounded-md mr-4"
        @click="viewTrajectory"
      >
        <el-icon class="mr-1"><LocationFilled /></el-icon>
        查看车辆轨迹
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Close, Picture, LocationFilled } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures.js";
import { mapInstanceManager } from "@/hooks/useMapInstance";

const globalStore = useGlobalStore();
const { initMonitorLayer } = useMapFeatures();
const activeTab = ref("basic");

const viewTrajectory = async () => {
  globalStore.setTrajectoryVisible(true);

  if (globalStore.selectedVehicle) {
    const map = await mapInstanceManager.waitForMapReady();

    // 1. 同步到全局 store
    globalStore.setSelectedVehicleIds([globalStore.selectedVehicle.id]);

    // 2. 初始化/更新监控图层 (需合并当前日期的轨迹数据)
    const vehicleWithTrajectory = {
      ...globalStore.selectedVehicle,
      ...(globalStore.selectedTrajectory || {}),
    };
    initMonitorLayer(map, [vehicleWithTrajectory], "monitorLayer");

    // 3. 定位到车辆当前位置
    const coords =
      vehicleWithTrajectory.actualRoute &&
      vehicleWithTrajectory.actualRoute.length > 0
        ? vehicleWithTrajectory.actualRoute[0]
        : [113.1315, 23.0268];

    map.getView().animate({
      center: coords,
      zoom: 15,
      duration: 1000,
    });
  }
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
