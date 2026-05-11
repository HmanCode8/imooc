<script setup>
import { computed, onUnmounted, watch } from "vue";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { ArrowLeft, Plus, Close, View, CircleCheck, Delete, Refresh, Search } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import regionData from "@/mock/region";
import { useMapDraw } from "@/hooks/useMapDraw";
import { useAudit } from "@/composables/useAudit";
const headerMap = {
  id: "申请ID",
  companyName: "申请企业",
  applyDate: "申请时间",
  contactName: "联系人",
  contactPhone: "联系电话",
  totalCount: "点位总数",
  segmentCount: "点位数量",
  status: "审核状态",
  remark: "备注",

  // 子点位 segments 字段
  "segments.id": "点位ID",
  "segments.type": "几何类型",
  "segments.name": "点位名称",
  "segments.code": "点位编码",
  "segments.areaCode": "区县编码",
  "segments.areaName": "区县名称",
  "segments.streetCode": "街道编码",
  "segments.streetName": "街道名称",
  "segments.coords": "经纬度坐标"
};
const globalStore = useGlobalStore();
const { drawing, startDraw, stopDraw, clearDraw, addPoint, getSegmentColor } = useMapDraw();

const calcPseudoCount = (coords) => {
  return coords && coords.length === 2 ? 1 : 0;
};

const createNewSegment = (index) => {
  return {
    segmentName: "",
    segmentCode: `PK-${dayjs().format("YYYYMMDDHHmmss")}-${index + 1}`,
    districtCode: "",
    streetCode: "",
    coords: [],
  };
};

const audit = useAudit({
  storageKey: "parking_audit_rows_v1",
  auditType: "parking",
  createNewSegment,
  calcMetric: calcPseudoCount,
  metricLabel: "数量(个)",
  segmentLabel: "停车场",
  setDetailVisible: globalStore.setParkingAuditDetailVisible,
  setSelectedItem: globalStore.setSelectedParkingAuditItem,
  setSelectedSegmentId: globalStore.setSelectedParkingAuditSegmentId,
  getDetailVisible: () => globalStore.parkingAuditDetailVisible,
  getSelectedItem: () => globalStore.selectedParkingAuditItem,
  getSelectedSegmentId: () => globalStore.selectedParkingAuditSegmentId,
});

const {
  state,
  viewMode,
  auditVisible,
  auditForm,
  auditTarget,
  createForm,
  currentSegmentIndex,
  currentSegment,
  drawnMetric,
  companyPool,
  statusOptions,
  statusTag,
  formatDate,
  filteredRows,
  total,
  pageRows,
  onSearch,
  onReset,
  indexMethod,
  openDetail,
  openAudit,
  submitAudit,
  removeRow,
  addSegment,
  removeSegment,
  openCreate,
  onExport,
  submitCreate: baseSubmitCreate,
  metricLabel,
  segmentLabel,
  auditType,
  saveRows,
} = audit;

const districtOptions = computed(() => {
  const districts = regionData?.districts || [];
  return districts.map((d) => ({ label: d.areaName, value: d.areaCode }));
});

const streetOptions = computed(() => {
  if (!currentSegment.value) return [];
  const districts = regionData?.districts || [];
  const found = districts.find((d) => d.areaCode === currentSegment.value.districtCode);
  const streets = found?.streets || [];
  return streets.map((s) => ({ label: s.name, value: s.code }));
});

watch(
  () => currentSegment.value?.districtCode,
  () => {
    if (currentSegment.value) {
      currentSegment.value.streetCode = "";
    }
  },
);

watch(
  () => [currentSegmentIndex.value, createForm.segments.length],
  async () => {
    if (viewMode.value === "create") {
      await renderAllSegments();
    }
  },
  { deep: true },
);

watch(
  () => viewMode.value,
  async (newVal) => {
    if (newVal === "create") {
      await renderAllSegments();
    } else {
      clearDraw();
    }
  },
);

const closeCreate = async () => {
  viewMode.value = "list";
  createForm.segments = [];
  clearDraw();
  stopDraw({ removeLayer: true, silent: true });
};

const clearParkingDraw = async () => {
  if (currentSegment.value) {
    currentSegment.value.coords = [];
    await renderAllSegments();
  }
};

const renderAllSegments = async () => {
  try {
    clearDraw();
    for (let i = 0; i < createForm.segments.length; i++) {
      const seg = createForm.segments[i];
      if (seg.coords && seg.coords.length === 2) {
        await addPoint(seg.coords, getSegmentColor(i), "parking-audit-draw");
      }
    }
  } catch (err) {
    console.error("渲染停车场失败:", err);
  }
};

const startParkingDraw = async () => {
  try {
    ElMessage.info("请在地图上单击添加停车场点位");
    const geom = await startDraw("Point", {
      layerId: "parking-audit-draw",
      clearBefore: false,
      fitView: true,
      fitPadding: [50, 450, 50, 50],
      maxZoom: 10,
    });
    if (currentSegment.value) {
      currentSegment.value.coords = geom?.coordinates || [];
      await renderAllSegments();
    }
  } catch {
    return;
  }
};

const submitCreate = () => {
  baseSubmitCreate({
    onSubmit: async ({ companyName, contactName, contactPhone }) => {
      const districts = regionData?.districts || [];
      const segments = [];
      let totalCount = 0;

      for (let i = 0; i < createForm.segments.length; i++) {
        const seg = createForm.segments[i];
        const segmentName = String(seg.segmentName || "").trim();
        if (!segmentName) {
          ElMessage.warning(`停车场 ${i + 1}：请输入停车场名称`);
          currentSegmentIndex.value = i;
          return;
        }
        const segmentCode = String(seg.segmentCode || "").trim();
        if (!segmentCode) {
          ElMessage.warning(`停车场 ${i + 1}：停车场编码生成失败`);
          currentSegmentIndex.value = i;
          return;
        }
        if (!seg.districtCode) {
          ElMessage.warning(`停车场 ${i + 1}：请选择所属区`);
          currentSegmentIndex.value = i;
          return;
        }
        if (!seg.streetCode) {
          ElMessage.warning(`停车场 ${i + 1}：请选择所属镇街`);
          currentSegmentIndex.value = i;
          return;
        }
        if (!seg.coords || seg.coords.length !== 2) {
          ElMessage.warning(`停车场 ${i + 1}：请先在地图上添加停车场点位`);
          currentSegmentIndex.value = i;
          return;
        }

        const district = districts.find((d) => d.areaCode === seg.districtCode);
        const street = district?.streets?.find((s) => s.code === seg.streetCode);
        totalCount += 1;

        segments.push({
          id: `seg_${crypto.randomUUID?.() || Date.now()}_${i}`,
          type: "parking",
          name: segmentName,
          code: segmentCode,
          areaCode: seg.districtCode,
          areaName: district?.areaName || "",
          streetCode: seg.streetCode,
          streetName: street?.name || "",
          type: "Point",
          coords: seg.coords,
        });
      }

      const row = {
        id: `app_${crypto.randomUUID?.() || Date.now()}`,
        companyName,
        applyDate: dayjs(createForm.applyDate).toISOString(),
        contactName,
        contactPhone,
        totalCount,
        segmentCount: segments.length,
        status: "pending",
        remark: "",
        segments,
      };
      state.rows = [row, ...state.rows];
      closeCreate();
      state.page = 1;
      saveRows();
      ElMessage.success("已新增申请（待审核）");
    },
  });
};

onUnmounted(() => {
  globalStore.setParkingAuditDetailVisible(false);
  globalStore.setSelectedParkingAuditItem(null);
  globalStore.setSelectedParkingAuditSegmentId("");
  closeCreate();
});
</script>

<template>
  <div
    class="w-full h-full flex flex-col bg-white shadow-sm border-r border-gray-100 overflow-hidden"
  >
    <div class="px-4 py-3 border-b border-gray-50 theme-bg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon
            v-if="viewMode === 'create'"
            class="cursor-pointer hover:scale-110 transition-transform"
            @click="closeCreate"
          >
            <ArrowLeft />
          </el-icon>
          <h2 class="text-md font-bold flex items-center">
            {{ viewMode === "create" ? "新增停车场" : "停车场流程审核" }}
          </h2>
        </div>
      </div>
    </div>

    <template v-if="viewMode === 'list'">
      <div class="py-4 bg-white">
        <div class="rounded-lg border border-gray-200 bg-white p-2 mx-2">
          <div class="flex items-center gap-6">
            <div class="flex-1 min-w-0">
              <el-form-item label="申请时间" class="w-full mb-0">
                <el-date-picker
                  v-model="state.filters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>
            </div>
            <div class="flex-1 min-w-0">
              <el-form-item label="申请状态" class="w-full mb-0">
                <el-select
                  v-model="state.filters.status"
                  placeholder="请选择"
                  clearable
                  class="w-full"
                >
                  <el-option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>

        <div class="mt-4 mx-2 flex items-center justify-between">
         <div>
           <el-button type="primary" @click="openCreate">
            <el-icon class="mr-1"><Plus /></el-icon>
              新增停车场
          </el-button>
          <!-- 导出 -->
          <el-button type="primary" @click="onExport(headerMap, '停车场数据')">
            <el-icon class="mr-1"><Download /></el-icon>
            导出
          </el-button>
         </div>
          <div class="flex items-center gap-2">
            <el-button type="primary" @click="onSearch">
              <el-icon class="mr-1"><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="onReset">
              <el-icon class="mr-1"><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <el-table
          :data="pageRows"
          height="100%"
          v-loading="state.loading"
          @row-click="openDetail"
          stripe
          class="w-full"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            :index="indexMethod"
          />
          <el-table-column
            prop="companyName"
            label="申请企业"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column label="申请日期" width="110">
            <template #default="{ row }">{{ formatDate(row.applyDate) }}</template>
          </el-table-column>
          <el-table-column label="停车场数量(个)" width="130" align="right">
            <template #default="{ row }">{{ row.totalCount }}</template>
          </el-table-column>
          <el-table-column
            prop="segmentCount"
            label="停车场数量"
            width="90"
            align="right"
          />
          <el-table-column label="申请状态" width="90">
            <template #default="{ row }">
              <el-tag :type="statusTag(row.status).type">
                {{ statusTag(row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center">
                <!-- <el-button
                  link
                  type="primary"
                  @click="openDetail(row)"
                  title="查看详情"
                >
                  <el-icon><View /></el-icon>
                </el-button> -->
               <el-button
               
                  link
                  type="primary"
                  @click="openAudit(row)"
                  title="审批"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="removeRow(row)"
                  title="删除"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="p-3 flex justify-end border-t border-gray-50 bg-white">
        <el-pagination
          v-model:current-page="state.page"
          v-model:page-size="state.pageSize"
          :total="total"
          background
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </template>

    <template v-else>
      <div class="flex-1 overflow-y-auto p-4">
        <el-form label-width="86px">
          <div class="text-sm font-bold text-gray-700 mb-2">基础信息</div>
          <div class="grid grid-cols-2 gap-x-6">
            <el-form-item label="申请企业" required>
              <el-select v-model="createForm.companyName" class="w-full">
                <el-option
                  v-for="opt in companyPool"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="申请日期" required>
              <el-date-picker v-model="createForm.applyDate" type="date" class="w-full" />
            </el-form-item>
            <el-form-item label="联系人" required>
              <el-input v-model="createForm.contactName" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系方式" required>
              <el-input v-model="createForm.contactPhone" placeholder="请输入联系方式" />
            </el-form-item>
          </div>

          <div class="flex items-center justify-between mt-4 mb-2">
            <div class="text-sm font-bold text-gray-700">停车场信息</div>
            <el-button type="primary" size="small" @click="addSegment">
              <el-icon><Plus /></el-icon>
              添加停车场
            </el-button>
          </div>

          <div class="mb-2 flex items-center gap-2 flex-wrap">
            <el-button
              v-for="(seg, index) in createForm.segments"
              :key="index"
              :type="currentSegmentIndex === index ? 'primary' : 'default'"
              size="small"
              @click="currentSegmentIndex = index"
              class="relative"
            >
              <span class="flex items-center gap-1">
                <span
                  class="w-3 h-3 rounded-full inline-block"
                  :style="{ backgroundColor: getSegmentColor(index) }"
                ></span>
                停车场 {{ index + 1 }}
              </span>
              <el-icon
                v-if="createForm.segments.length > 1"
                class="ml-1 hover:text-red-500 cursor-pointer"
                @click.stop="removeSegment(index)"
              >
                <Close />
              </el-icon>
            </el-button>
          </div>

          <template v-if="currentSegment">
          <div class="grid grid-cols-2 gap-x-6">
            <el-form-item label="名称" tooltip="请输入停车场名称" required>
              <el-input v-model="currentSegment.segmentName" placeholder="请输入停车场名称" />
            </el-form-item>
            <el-form-item label="编码" required>
              <el-input v-model="currentSegment.segmentCode" disabled />
            </el-form-item>
            <el-form-item label="所属区" required>
              <el-select v-model="currentSegment.districtCode" class="w-full" clearable>
                <el-option
                  v-for="opt in districtOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="所属镇街" required>
              <el-select
                v-model="currentSegment.streetCode"
                class="w-full"
                clearable
                :disabled="!currentSegment.districtCode"
              >
                <el-option
                  v-for="opt in streetOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="mt-2 rounded-lg border border-gray-200 bg-gray-50/40 px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-bold text-gray-700">停车场绘制</div>
              <div class="text-xs text-gray-500">
                点位：{{ currentSegment.coords?.length === 2 ? 1 : 0 }}
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              点击"开始绘制"后在地图上单击添加停车场点位
            </div>
            <div class="mt-3 flex items-center gap-2">
              <el-button type="primary" plain @click="startParkingDraw" :disabled="drawing">
                {{ currentSegment.coords?.length === 2 ? "重新绘制" : "开始绘制" }}
              </el-button>
              <el-button @click="clearParkingDraw" :disabled="drawing || !(currentSegment.coords?.length === 2)">
                清除
              </el-button>
            </div>
          </div>
          </template>
        </el-form>
      </div>

      <div class="p-3 flex items-center justify-end gap-2 border-t border-gray-50 bg-white">
        <el-button @click="closeCreate">取消</el-button>
        <el-button type="primary" @click="submitCreate" :disabled="drawing">确认</el-button>
      </div>
    </template>

    <el-dialog v-model="auditVisible" title="审批" width="420px">
      <el-form label-width="72px">
        <el-form-item label="结论">
          <el-radio-group v-model="auditForm.decision">
            <el-radio-button label="approved">通过</el-radio-button>
            <el-radio-button label="rejected">驳回</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            placeholder="通过可不填；驳回建议填写原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="auditVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAudit">提交</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped lang="scss">
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>
