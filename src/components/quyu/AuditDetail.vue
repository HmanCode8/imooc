<template>
  <div
    v-if="detailVisible"
    class="w-[420px] max-h-[calc(100%-16px)] bg-white/95 backdrop-blur-md ml-1 pointer-events-auto flex flex-col overflow-hidden border border-gray-200"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-1.5 h-4 theme-bg rounded-full"></div>
        <div class="font-bold text-gray-800 text-sm truncate">
          {{ selectedItem?.companyName || (auditType === 'line' ? '路段详情' : auditType === 'area' ? '区域详情' : '停车场详情') }}
        </div>
      </div>
      <el-icon
        class="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors"
        @click="close"
      >
        <Close />
      </el-icon>
    </div>

    <div class="p-4 overflow-y-auto bg-gray-50/30">
      <el-descriptions :column="1"  border>
        <el-descriptions-item label="申请日期">
          {{ formatDate(selectedItem?.applyDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ selectedItem?.contactName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">
          {{ selectedItem?.contactPhone || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="statusTag(selectedItem?.status).type" size="small">
            {{ statusTag(selectedItem?.status).text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedItem?.remark" label="备注">
          {{ selectedItem?.remark }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-4 flex items-center justify-between">
        <div class="font-bold text-sm text-gray-800">{{ segmentLabel }}列表</div>
        <div class="text-[10px] text-gray-400">
          共 {{ (selectedItem?.segments || []).length }} 条
        </div>
      </div>

      <div class="mt-2 space-y-2">
        <div
          v-for="seg in selectedItem?.segments || []"
          :key="seg.id"
          class="p-3 rounded-lg border cursor-pointer transition-all bg-white"
          :class="
            selectedSegmentId === seg.id
              ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20'
              : 'border-gray-100 hover:border-blue-200'
          "
          @click="selectSegment(seg)"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div :class="
                auditType === 'line'
                  ? 'w-7 h-7 rounded-full bg-green-500/15 text-green-600'
                  : auditType === 'area'
                  ? 'w-7 h-7 rounded-full bg-blue-500/15 text-blue-600'
                  : 'w-7 h-7 rounded-full bg-orange-500/15 text-orange-600'
              " class="flex items-center justify-center shrink-0">
                <el-icon><component :is="auditType === 'line' ? Share : auditType === 'area' ? Select : CircleCheck" /></el-icon>
              </div>
              <div class="font-bold text-sm truncate">{{ seg.name }}</div>
            </div>
            <div class="text-xs text-gray-500 shrink-0">
              {{ auditType === 'line' ? `${seg.lengthKm} km` : auditType === 'area' ? `${seg.areaSqKm} km²` : '' }}
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 flex items-center justify-between gap-2">
            <div class="truncate">所属区：{{ seg.areaName || "-" }}</div>
            <div class="shrink-0">点位：{{ seg.coords?.length || 0 }}</div>
          </div>
          <div class="mt-1 text-xs text-gray-500 flex items-center justify-between gap-2">
            <div class="truncate">所属镇街：{{ seg.streetName || "-" }}</div>
            <div class="shrink-0 font-mono text-[10px]">{{ seg.code || "-" }}</div>
          </div>
        </div>
      </div>
      <div class="flex mt-2 justify-end">
        <el-button type="primary" @click="exportSelectedSegment" :disabled="!activeSegment">
          导出当前{{ segmentLabel }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, watch } from "vue";
import dayjs from "dayjs";
import { Close, Share, Select, CircleCheck } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";
import { useMapFeatures } from "@/hooks/useMapFeatures";
import { mapInstanceManager } from "@/hooks/useMapInstance";

const props = defineProps({
  auditType: {
    type: String,
    default: "line",
    validator: (val) => ["line", "area", "parking"].includes(val),
  },
});

const globalStore = useGlobalStore();
const { initComprehensiveLayer, removeLayer } = useMapFeatures();

const detailVisible = computed(() => {
  if (props.auditType === "line") return globalStore.lineAuditDetailVisible;
  if (props.auditType === "area") return globalStore.areaAuditDetailVisible;
  return globalStore.parkingAuditDetailVisible;
});

const selectedItem = computed(() => {
  if (props.auditType === "line") return globalStore.selectedLineAuditItem;
  if (props.auditType === "area") return globalStore.selectedAreaAuditItem;
  return globalStore.selectedParkingAuditItem;
});

const selectedSegmentId = computed(() => {
  if (props.auditType === "line") return globalStore.selectedLineAuditSegmentId;
  if (props.auditType === "area") return globalStore.selectedAreaAuditSegmentId;
  return globalStore.selectedParkingAuditSegmentId;
});

const segmentLabel = computed(() => {
  if (props.auditType === "line") return "路段";
  if (props.auditType === "area") return "区域";
  return "停车场";
});

const setDetailVisible = (val) => {
  if (props.auditType === "line") {
    globalStore.setLineAuditDetailVisible(val);
  } else if (props.auditType === "area") {
    globalStore.setAreaAuditDetailVisible(val);
  } else {
    globalStore.setParkingAuditDetailVisible(val);
  }
};

const setSelectedItem = (item) => {
  if (props.auditType === "line") {
    globalStore.setSelectedLineAuditItem(item);
  } else if (props.auditType === "area") {
    globalStore.setSelectedAreaAuditItem(item);
  } else {
    globalStore.setSelectedParkingAuditItem(item);
  }
};

const setSelectedSegmentId = (id) => {
  if (props.auditType === "line") {
    globalStore.setSelectedLineAuditSegmentId(id);
  } else if (props.auditType === "area") {
    globalStore.setSelectedAreaAuditSegmentId(id);
  } else {
    globalStore.setSelectedParkingAuditSegmentId(id);
  }
};

const statusTag = (status) => {
  if (status === "approved") return { type: "success", text: "已通过" };
  if (status === "rejected") return { type: "danger", text: "已驳回" };
  return { type: "warning", text: "待审核" };
};

const formatDate = (val) => {
  if (!val) return "-";
  return dayjs(val).format("YYYY/MM/DD");
};

const activeSegment = computed(() => {
  const row = selectedItem.value;
  if (!row) return null;
  return (row.segments || []).find((s) => s.id === selectedSegmentId.value) || null;
});

const drawSegmentOnMap = async (segment) => {
  if (!segment) return;
  const map = await mapInstanceManager.waitForMapReady();
  if (!map) return;

  const layerType = props.auditType === "line" ? "line_audit_rows_v1" : props.auditType === "area" ? "area_audit_rows_v1" : "parking_audit_rows_v1";
  const features = [
    {
      ...segment,
      type: segment.type || (props.auditType === "line" ? "LineString" : props.auditType === "area" ? "Polygon" : "Point"),
      coords: segment.coords,
    },
  ];

  const layer = await initComprehensiveLayer(map, features, layerType);

  const extent = layer?.getSource?.()?.getExtent?.();
  if (extent && extent[0] !== Infinity) {
    map.getView().fit(extent, {
      padding: [50, 450, 50, 450],
      duration: 500,
      maxZoom: 16,
    });
  }
};

const selectSegment = async (seg) => {
  setSelectedSegmentId(seg.id);
  await drawSegmentOnMap(seg);
};

const close = () => {
  setDetailVisible(false);
  setSelectedItem(null);
  setSelectedSegmentId("");
  removeLayer("comprehensive");
};

const exportSegment = (seg) => {
  if (!seg) return;
  const row = selectedItem.value;
  const payload = {
    companyName: row?.companyName,
    applyDate: row?.applyDate,
    contactName: row?.contactName,
    contactPhone: row?.contactPhone,
    status: row?.status,
    segment: seg,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${segmentLabel.value}_${seg.name || "未命名"}_${seg.code || dayjs().format("YYYYMMDDHHmmss")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const exportSelectedSegment = () => {
  exportSegment(activeSegment.value);
};

watch(
  () => detailVisible.value,
  async (visible) => {
    if (!visible) {
      removeLayer("comprehensive");
      return;
    }
    const row = selectedItem.value;
    if (!row) return;
    if (!selectedSegmentId.value) {
      const firstId = row.segments?.[0]?.id || "";
      setSelectedSegmentId(firstId);
    }
    await drawSegmentOnMap(activeSegment.value);
  },
);

watch(
  () => [selectedItem.value?.id, selectedSegmentId.value],
  async () => {
    if (!detailVisible.value) return;
    await drawSegmentOnMap(activeSegment.value);
  },
);

onUnmounted(() => {
  removeLayer("comprehensive");
});
</script>

<style scoped>
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
