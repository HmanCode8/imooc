<script setup>
import dayjs from "dayjs";
import { useGlobalStore } from "@/stores/global";
import ProcessAudit from "@/components/quyu/ProcessAudit.vue";

const globalStore = useGlobalStore();

const headerMap = {
  id: "申请ID",
  type: "申请类型",
  companyName: "申请企业",
  applyDate: "申请时间",
  contactName: "联系人",
  contactPhone: "联系电话",
  totalAreaSqKm: "总面积(km²)",
  segmentCount: "区域数量",
  status: "审核状态",
  // remark: "备注",

  // 子区域 segments 字段
  // "segments.id": "区域ID",
  // "segments.name": "区域名称",
  // "segments.code": "区域编码",
  // "segments.areaCode": "区县编码",
  // "segments.areaName": "区县名称",
  // "segments.streetCode": "街道编码",
  // "segments.streetName": "街道名称",
  // "segments.type": "几何类型",
  // "segments.areaSqKm": "区域面积(km²)",
  // "segments.coords": "边界坐标串",
};

const calcPseudoAreaSqKm = (coords) => {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[j];
    area += lng1 * 111.32 * (lat2 * 110.574);
    area -= lng2 * 111.32 * (lat1 * 110.574);
  }
  area = Math.abs(area) / 2;
  return Number(area.toFixed(2));
};

const createNewSegment = (index) => {
  return {
    segmentName: "",
    segmentCode: `AR-${dayjs().format("YYYYMMDDHHmmss")}-${index + 1}`,
    districtCode: "",
    streetCode: "",
    coords: [],
  };
};

const globalStoreMethods = {
  setDetailVisible: globalStore.setAreaAuditDetailVisible,
  setSelectedItem: globalStore.setSelectedAreaAuditItem,
  setSelectedSegmentId: globalStore.setSelectedAreaAuditSegmentId,
  getDetailVisible: () => globalStore.areaAuditDetailVisible,
  getSelectedItem: () => globalStore.selectedAreaAuditItem,
  getSelectedSegmentId: () => globalStore.selectedAreaAuditSegmentId,
};
</script>

<template>
  <ProcessAudit
    storageKey="area_audit_rows_v1"
    auditType="area"
    segmentLabel="区域"
    title="区域"
    metricLabel="面积"
    metricProp="totalAreaSqKm"
    metricUnit="km²"
    drawType="Polygon"
    :calcMetric="calcPseudoAreaSqKm"
    :createNewSegment="createNewSegment"
    :headerMap="headerMap"
    :globalStoreMethods="globalStoreMethods"
  />
</template>
