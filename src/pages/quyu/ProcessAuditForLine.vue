<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { useGlobalStore } from "@/stores/global";
import ProcessAudit from "@/components/quyu/ProcessAudit.vue";

const globalStore = useGlobalStore();
const route = useRoute();

const auditConfig = computed(() => {
  const isResLine = route.name === "processAuditForResLine";
  return {
    storageKey: isResLine ? "res_line_audit_rows_v1" : "line_audit_rows_v1",
    auditType: isResLine ? "resLine" : "line",
    segmentLabel: isResLine ? "转场路段" : "路段",
    title: isResLine ? "转场路线" : "路线",
    codePrefix: "RD"
  };
});

// 导出表头映射
const headerMap = {
  id: "申请ID",
  companyName: "申请企业",
  applyDate: "申请日期",
  totalLengthKm: "路线长度(km)",
  segmentCount: "路段数量",
  status: "申请状态",
  contactName: "联系人",
  contactPhone: "联系电话",
  
  // 子路段
  // "segments.name": "路段名称",
  // "segments.code": "路段编码",
  // "segments.areaName": "所属区",
  // "segments.streetName": "所属街道",
  // "segments.lengthKm": "路段长度(km)",
  // "segments.coords": "路线坐标"
};

const calcPseudoLengthKm = (coords) => {
  if (!coords || coords.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const dx = (lng2 - lng1) * 111.32;
    const dy = (lat2 - lat1) * 110.574;
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  return Number(sum.toFixed(2));
};

const createNewSegment = (index) => {
  return {
    segmentName: "",
    segmentCode: `${auditConfig.value.codePrefix}-${dayjs().format("YYYYMMDDHHmmss")}-${index + 1}`,
    districtCode: "",
    streetCode: "",
    coords: [],
  };
};

const globalStoreMethods = {
  setDetailVisible: globalStore.setLineAuditDetailVisible,
  setSelectedItem: globalStore.setSelectedLineAuditItem,
  setSelectedSegmentId: globalStore.setSelectedLineAuditSegmentId,
  getDetailVisible: () => globalStore.lineAuditDetailVisible,
  getSelectedItem: () => globalStore.selectedLineAuditItem,
  getSelectedSegmentId: () => globalStore.selectedLineAuditSegmentId,
};
</script>

<template>
  <ProcessAudit
    :storageKey="computed(() => auditConfig.storageKey)"
    :auditType="computed(() => auditConfig.auditType)"
    :segmentLabel="computed(() => auditConfig.segmentLabel)"
    :title="auditConfig.title"
    metricLabel="长度"
    metricProp="totalLengthKm"
    metricUnit="km"
    drawType="LineString"
    :calcMetric="calcPseudoLengthKm"
    :createNewSegment="createNewSegment"
    :headerMap="headerMap"
    :globalStoreMethods="globalStoreMethods"
  />
</template>
