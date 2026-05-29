<template>
  <div class="h-full flex flex-col">
    <div
      class="flex items-center justify-between px-4 py-3 theme-bg text-white shrink-0"
    >
      <span class="text-lg font-bold">车辆后台管理</span>
      <el-button type="primary" size="small" :icon="Plus" @click="openCreate">
        新增车辆
      </el-button>
    </div>

    <div class="flex-1 flex flex-col p-4 overflow-hidden bg-white">
      <el-form :inline="true" :model="query" class="shrink-0 mb-3">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="车架号 / 车牌"
            clearable
            class="!w-44"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="企业">
          <el-select
            v-model="query.enterprise"
            clearable
            placeholder="全部"
            class="!w-32"
          >
            <el-option
              v-for="item in ENTERPRISE_OPTIONS"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="辖区">
          <el-select
            v-model="query.region"
            clearable
            placeholder="全部"
            class="!w-32"
          >
            <el-option
              v-for="item in REGION_OPTIONS"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="query.type"
            clearable
            placeholder="全部"
            class="!w-28"
          >
            <el-option
              v-for="item in VEHICLE_TYPE_OPTIONS"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="flex-1 overflow-hidden">
        <el-table
          :data="paginatedList"
          border
          stripe
          height="100%"
          size="small"
        >
          <el-table-column prop="id" label="车架号" min-width="160" show-overflow-tooltip />
          <el-table-column prop="plateNo" label="车牌" width="110" />
          <el-table-column prop="type" label="类型" width="72" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.type === '正式' ? 'success' : 'warning'"
                size="small"
              >
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="种类" width="110" show-overflow-tooltip />
          <el-table-column prop="enterprise" label="企业" width="90" />
          <el-table-column prop="region" label="辖区" width="90" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'online' ? 'success' : 'info'"
                size="small"
              >
                {{ row.statusText || (row.status === "online" ? "在线" : "离线") }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="安全员" width="90" prop="securityInfo.name" />
          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="shrink-0 pt-3 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          small
        />
      </div>
    </div>

    <VehicleFormDialog
      v-model="dialogVisible"
      :vehicle="editingVehicle"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, Refresh } from "@element-plus/icons-vue";
import VehicleFormDialog from "@/components/onemap/VehicleFormDialog.vue";
import { useVehicleStore } from "@/stores/vehicle";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures";
import { mapInstanceManager } from "@/hooks/useMapInstance";
import {
  ENTERPRISE_OPTIONS,
  REGION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from "@/mock/car";

const vehicleStore = useVehicleStore();
const globalStore = useGlobalStore();
const { initVehicleLayer } = useMapFeatures();

async function refreshMapLayer() {
  const map = mapInstanceManager.getMapInstance();
  if (map) {
    await initVehicleLayer(map, vehicleStore.list, "vehicle-aggregation");
  }
}

const query = reactive({
  keyword: "",
  enterprise: "",
  region: "",
  type: "",
});

const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const editingVehicle = ref(null);

onMounted(() => {
  vehicleStore.init();
});

const filteredList = computed(() => {
  const kw = query.keyword.trim().toLowerCase();
  return vehicleStore.list.filter((car) => {
    const matchKw =
      !kw ||
      car.id?.toLowerCase().includes(kw) ||
      car.plateNo?.toLowerCase().includes(kw);
    const matchEnterprise =
      !query.enterprise || car.enterprise === query.enterprise;
    const matchRegion = !query.region || car.region === query.region;
    const matchType = !query.type || car.type === query.type;
    return matchKw && matchEnterprise && matchRegion && matchType;
  });
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  query.keyword = "";
  query.enterprise = "";
  query.region = "";
  query.type = "";
  currentPage.value = 1;
};

const openCreate = () => {
  editingVehicle.value = null;
  dialogVisible.value = true;
};

const openEdit = (row) => {
  editingVehicle.value = { ...row };
  dialogVisible.value = true;
};

const handleFormSubmit = async (payload) => {
  try {
    if (payload.isEdit) {
      const { isEdit, ...data } = payload;
      const id = data.id;
      vehicleStore.updateVehicle(id, data);
      if (globalStore.selectedVehicle?.id === id) {
        globalStore.setSelectedVehicle(vehicleStore.getById(id));
      }
      ElMessage.success("车辆信息已更新");
      await refreshMapLayer();
    } else {
      const { isEdit, ...data } = payload;
      vehicleStore.addVehicle(data);
      ElMessage.success("车辆已新增");
      await refreshMapLayer();
    }
  } catch (e) {
    ElMessage.error(e.message || "操作失败");
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定删除车辆「${row.plateNo || row.id}」？删除后地图与查询列表将同步更新。`,
      "删除确认",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" },
    );
    vehicleStore.removeVehicle(row.id);
    if (globalStore.selectedVehicle?.id === row.id) {
      globalStore.setDetailsVisible(false);
      globalStore.setSelectedVehicle(null);
    }
    ElMessage.success("已删除");
    await refreshMapLayer();
  } catch {
    /* 用户取消 */
  }
};
</script>
