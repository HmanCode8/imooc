<template>
  <div class="absolute left-24 flex h-full z-50 pointer-events-none">
    <!-- 左侧面板：搜索表单 / 搜索结果 -->
    <div
      class="w-[360px] flex flex-col h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto overflow-hidden border border-white/20"
    >
      <!-- 面板头部 -->
      <div
        class="flex items-center justify-between px-4 py-3 theme-bg text-white"
      >
        <div class="flex items-center gap-2">
          <el-icon
            v-if="currentView === 'list'"
            class="cursor-pointer hover:scale-110 transition-transform"
            @click="currentView = 'search'"
          >
            <ArrowLeft />
          </el-icon>
          <span class="text-lg font-bold">车辆查询</span>
        </div>
      </div>

      <!-- 搜索表单视图 -->
      <div
        v-if="currentView === 'search'"
        class="flex-1 flex flex-col p-4 overflow-y-auto"
      >
        <el-form :model="queryForm" label-width="80px" class="flex-1">
          <el-form-item label="企业">
            <el-select
              v-model="queryForm.enterprise"
              placeholder="请选择企业"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.enterprises"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="辖区">
            <el-select
              v-model="queryForm.region"
              placeholder="请选择辖区"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.regions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆类型">
            <el-select
              v-model="queryForm.type"
              placeholder="请选择类型"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.types"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆种类">
            <el-select
              v-model="queryForm.category"
              placeholder="请选择种类"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.categories"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆状态">
            <el-select
              v-model="queryForm.status"
              placeholder="请选择状态"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.statuses"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <el-button type="primary" :icon="Search" @click="handleSearch"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </div>

      <!-- 搜索结果列表视图 -->
      <div
        v-else-if="currentView === 'list'"
        class="flex-1 flex flex-col overflow-hidden"
      >
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <div
            v-for="item in vehicleList"
            :key="item.id"
            class="p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
            :class="{
              'border-blue-500 bg-blue-50 shadow-sm':
                selectedVehicle?.id === item.id,
            }"
            @click="showDetails(item)"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2 font-bold text-gray-700">
                <el-icon class="text-blue-500"><Van /></el-icon>
                {{ item.id }}
              </div>
              <span
                class="px-2 py-0.5 text-xs rounded border"
                :class="
                  item.type === '正式'
                    ? 'text-green-600 border-green-200 bg-green-50'
                    : 'text-orange-600 border-orange-200 bg-orange-50'
                "
              >
                {{ item.type }}
              </span>
            </div>
            <div class="text-xs space-y-1">
              <div class="flex items-center">
                <span class="w-16">车辆种类：</span>
                <span class="text-gray-700">{{ item.category }}</span>
                <span class="ml-4 w-12">辖区：</span>
                <span class="text-gray-700">{{ item.region }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-16">企业：</span>
                <span class="text-gray-700">{{ item.enterprise }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 border-t border-gray-100 flex justify-center">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            small
          />
        </div>
      </div>
    </div>

    <!-- 车辆详情面板 (对齐顶部，显示在列表右侧) -->
    <div
      v-if="detailsVisible"
      class="w-[400px] h-fit max-h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 border border-white/20"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50"
      >
        <div class="flex items-center gap-2">
          <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
          <span class="font-bold text-gray-700">{{ selectedVehicle?.id }}</span>
        </div>
        <el-icon
          class="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          @click="detailsVisible = false"
        >
          <Close />
        </el-icon>
      </div>

      <div class="flex-1 overflow-y-auto">
        <el-tabs v-model="activeTab" class="custom-tabs px-4">
          <el-tab-pane label="基本信息" name="basic">
            <div v-if="selectedVehicle" class="divide-y divide-gray-100 pb-4">
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">车架号</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.id
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">车辆状态</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.status
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">车辆种类</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.category
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">车辆类型</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.type
                }}</span>
              </div>
              <div class="py-2.5">
                <div class="text-gray-400 text-sm mb-2">车辆照片</div>
                <div
                  class="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200"
                >
                  <img
                    v-if="selectedVehicle.photo"
                    :src="selectedVehicle.photo"
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
              v-if="selectedVehicle?.securityInfo"
              class="divide-y divide-gray-100 pb-4"
            >
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">姓名</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.securityInfo.name
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">性别</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.securityInfo.gender
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">联系电话</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.securityInfo.phone
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">所属单位</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.securityInfo.unit
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">证件号码</span
                ><span class="flex-1 text-gray-700 text-xs">{{
                  selectedVehicle.securityInfo.licenseNo
                }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="终端对接" name="terminal">
            <div
              v-if="selectedVehicle?.terminalInfo"
              class="grid grid-cols-1 divide-y divide-gray-100 pb-4"
            >
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">速度</span
                ><span
                  class="flex-1 text-gray-700 font-medium text-blue-600 text-sm"
                  >{{ selectedVehicle.terminalInfo.speed }} km/h</span
                >
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">状态</span
                ><span class="flex-1 text-gray-700 text-sm">{{
                  selectedVehicle.terminalInfo.status
                }}</span>
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">电量</span>
                <el-progress
                  :percentage="selectedVehicle.terminalInfo.power"
                  :stroke-width="8"
                  class="flex-1"
                />
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">电池温度</span
                ><span class="flex-1 text-gray-700 text-sm"
                  >{{ selectedVehicle.terminalInfo.batteryTemp }}°C</span
                >
              </div>
              <div class="flex py-2.5 items-center">
                <span class="w-24 text-gray-400 text-sm">信号状态</span
                ><span class="flex-1 text-gray-700 text-green-500 text-sm">{{
                  selectedVehicle.terminalInfo.signalStatus
                }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="p-3 border-t border-gray-100 bg-gray-50/50">
        <el-button
          type="primary"
          size="small"
          class="w-full !rounded-md"
          @click="viewTrajectory"
        >
          <el-icon class="mr-1"><LocationFilled /></el-icon>
          查看车辆轨迹
        </el-button>
      </div>
    </div>

    <!-- 轨迹统计面板 (对齐顶部，显示在详情面板右侧) -->
    <div
      v-if="trajectoryVisible"
      class="w-[360px] h-fit max-h-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 border border-white/20"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 text-white"
      >
        <div class="flex items-center gap-2">
          <el-icon
            class="cursor-pointer hover:scale-110 transition-transform"
            @click="backToDetails"
            ><ArrowLeft
          /></el-icon>
          <span class="font-bold">{{ selectedVehicle?.id }}的轨迹</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  Search,
  Refresh,
  Van,
  ArrowLeft,
  Close,
  Picture,
  LocationFilled,
} from "@element-plus/icons-vue";

import { carData } from "@/mock/car";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "../../hooks/useMapFeatures.js";
import { mapInstanceManager } from "../../hooks/useMapInstance";

// 视图控制: 'search' | 'list'
const currentView = ref("search");

const globalStore = useGlobalStore();
const { initMonitorLayer, removeLayer } = useMapFeatures();

// 1. 搜索表单数据结构
const queryForm = reactive({
  enterprise: "",
  region: "",
  type: "",
  category: "",
  status: "",
});

// 2. 选项数据
const options = {
  enterprises: ["顺丰科技", "美团配送", "京东物流", "测试A"],
  regions: ["南海区", "禅城区", "顺德区"],
  types: ["正式", "测试"],
  categories: ["无人物流车", "无人清扫车"],
  statuses: ["正常", "异常", "离线"],
};

// 3. 车辆列表模拟数据
const vehicleList = ref(carData);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// 4. 面板显隐控制逻辑
const detailsVisible = ref(false);
const selectedVehicle = ref(null);
const activeTab = ref("basic");

// 5. 轨迹统计逻辑
const trajectoryVisible = ref(false);
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

const handleSearch = () => {
  currentView.value = "list";
};

const handleReset = () => {
  Object.keys(queryForm).forEach((key) => (queryForm[key] = ""));
};

const showDetails = (vehicle) => {
  if (selectedVehicle.value?.id === vehicle.id) {
    detailsVisible.value = !detailsVisible.value;
  } else {
    selectedVehicle.value = vehicle;
    detailsVisible.value = true;
    trajectoryVisible.value = false; // 切换车辆时关闭轨迹面板
    activeTab.value = "basic";
  }
};

const viewTrajectory = async () => {
  detailsVisible.value = false;
  trajectoryVisible.value = true;

  if (selectedVehicle.value) {
    const map = await mapInstanceManager.waitForMapReady();

    // 1. 同步到全局 store
    globalStore.setSelectedVehicleIds([selectedVehicle.value.id]);

    // 2. 初始化/更新监控图层
    initMonitorLayer(map, [selectedVehicle.value]);

    // 3. 定位到车辆当前位置
    const coords =
      selectedVehicle.value.actualRoute &&
      selectedVehicle.value.actualRoute.length > 0
        ? selectedVehicle.value.actualRoute[0]
        : [113.1315, 23.0268];

    map.getView().animate({
      center: coords,
      duration: 800,
      zoom: 16,
    });
  }
};

const handleCloseTrajectory = () => {
  trajectoryVisible.value = false;
  // 清除地图上的监控图层
  removeLayer("monitorLayer");
  globalStore.setSelectedVehicleIds([]);
};

const backToDetails = () => {
  trajectoryVisible.value = false;
  detailsVisible.value = true;
  // 如果需要返回详情时依然保留图层，可以不调用清除逻辑
};
</script>

<style scoped></style>
