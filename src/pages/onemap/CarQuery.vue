<template>
  <div class="h-full">
    <!-- 左侧面板：搜索表单 / 搜索结果 -->
    <div class="flex flex-col h-full">
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
              v-model="queryForm.vehicleType"
              placeholder="请选择类型"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.vehicleTypes"
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
              v-model="queryForm.vehicleStatus"
              placeholder="请选择状态"
              clearable
              class="w-full"
            >
              <el-option
                v-for="item in options.vehicleStatuses"
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
            v-for="item in paginatedVehicleList"
            :key="item.id"
            class="p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
            :class="{
              'border-blue-500 bg-blue-50 shadow-sm':
                globalStore.selectedVehicle?.id === item.id,
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
                <span class="w-16 text-gray-400">车辆种类：</span>
                <span class="text-gray-700">{{ item.category }}</span>
                <span class="ml-4 w-12 text-gray-400">辖区：</span>
                <span class="text-gray-700">{{ item.region }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-16 text-gray-400">企业：</span>
                <span class="text-gray-700">{{ item.enterprise }}</span>
              </div>
            </div>
          </div>
          <el-empty
            v-if="paginatedVehicleList.length === 0"
            description="暂无数据"
          />
        </div>

        <div
          class="p-3 border-t border-gray-100 flex justify-center bg-gray-50/50"
        >
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            background
            small
            class="custom-pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { Search, Refresh, Van, ArrowLeft } from "@element-plus/icons-vue";
import { useMapFeatures } from "../../hooks/useMapFeatures.js";
import { carData } from "@/mock/car";
import { useGlobalStore } from "@/stores/global";
import { mapInstanceManager } from "@/hooks/useMapInstance";
import dayjs from "dayjs";

const globalStore = useGlobalStore();
const apiMode = window.global_config.system.apiMode;
const { initVehicleLayer, removeLayer } = useMapFeatures();
// 视图控制: 'search' | 'list'
const currentView = ref("search");

// 1. 搜索表单数据结构
const queryForm = reactive({
  enterprise: "",
  region: "",
  vehicleType: "",
  category: "",
  vehicleStatus: "",
});

// 2. 选项数据
const options = {
  enterprises: ["测试A", "测试B"],
  regions: ["禅城区", "南海区", "顺德区", "高明区", "三水区"],
  vehicleTypes: ["测试", "正式"],
  categories: ["无人物流车", "无人货运车", "无人清扫车", "无人安防车"],
  vehicleStatuses: ["正常", "离线"],
};

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 3. 过滤后的车辆列表
const filteredVehicleList = computed(() => {
  const d = apiMode === "service" ? globalStore.carList : carData;
  return d.filter((car) => {
    const matchEnterprise =
      !queryForm.enterprise || car.enterprise === queryForm.enterprise;
    const matchRegion = !queryForm.region || car.region === queryForm.region;
    const matchType = !queryForm.vehicleType || car.type === queryForm.vehicleType;
    const matchCategory =
      !queryForm.category || car.category === queryForm.category;
    const matchStatus =
      !queryForm.vehicleStatus ||
      (queryForm.vehicleStatus === "离线" && car.status === "offline") ||
      (queryForm.vehicleStatus === "正常" && car.status !== "offline");
    return matchEnterprise && matchRegion && matchType && matchCategory && matchStatus;
  });
});

// 4. 分页后的车辆列表
const paginatedVehicleList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredVehicleList.value.slice(start, end);
});

// 总条数
const total = computed(() => filteredVehicleList.value.length);

const handleSearch = async () => {
  currentPage.value = 1; // 搜索时重置页码
  currentView.value = "list";
  const map = await mapInstanceManager.waitForMapReady();
  // await initVehicleLayer(map, "vehicle-aggregation");
};

const handleReset = () => {
  Object.keys(queryForm).forEach((key) => (queryForm[key] = ""));
  currentPage.value = 1;
};

const showDetails = (vehicle) => {
  if (globalStore.selectedVehicle?.id === vehicle.id) {
    globalStore.setDetailsVisible(!globalStore.detailsVisible);
  } else {
    // 切换车辆时，清除上一辆车的轨迹图层并重置日期为今天
    if (globalStore.selectedVehicle) {
      removeLayer("monitorLayer");
      globalStore.setTrajectoryVisible(false);
      globalStore.selectedVehicleIds = [];
    }
    // 重置日期为今天
    const today = dayjs().format("YYYY-MM-DD");
    globalStore.setSelectedDate(today);
    globalStore.setSelectedVehicle(vehicle);
    globalStore.setDetailsVisible(true);
  }
};
</script>

<style scoped></style>
