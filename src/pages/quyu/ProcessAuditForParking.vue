<script setup>
import dayjs from "dayjs";
import { useGlobalStore } from "@/stores/global";
import ProcessAudit from "@/components/quyu/ProcessAudit.vue";

const globalStore = useGlobalStore();

const headerMap = {
  id: "申请ID",
  companyName: "申请企业",
  applyDate: "申请时间",
  contactName: "联系人",
  contactPhone: "联系电话",
  totalCount: "点位总数",
  segmentCount: "点位数量",
  status: "审核状态",
  // remark: "备注",

  // 子点位 segments 字段
  // "segments.id": "点位ID",
  // "segments.type": "几何类型",
  // "segments.name": "点位名称",
  // "segments.code": "点位编码",
  // "segments.areaCode": "区县编码",
  // "segments.areaName": "区县名称",
  // "segments.streetCode": "街道编码",
  // "segments.streetName": "街道名称",
  // "segments.coords": "经纬度坐标"
};

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

const globalStoreMethods = {
  setDetailVisible: globalStore.setParkingAuditDetailVisible,
  setSelectedItem: globalStore.setSelectedParkingAuditItem,
  setSelectedSegmentId: globalStore.setSelectedParkingAuditSegmentId,
  getDetailVisible: () => globalStore.parkingAuditDetailVisible,
  getSelectedItem: () => globalStore.selectedParkingAuditItem,
  getSelectedSegmentId: () => globalStore.selectedParkingAuditSegmentId,
};
</script>

<template>
  <ProcessAudit
    storageKey="parking_audit_rows_v1"
    auditType="parking"
    segmentLabel="停车场"
    title="停车场"
    metricLabel="数量"
    metricProp="totalCount"
    metricUnit="个"
    drawType="Point"
    :calcMetric="calcPseudoCount"
    :createNewSegment="createNewSegment"
    :headerMap="headerMap"
    :globalStoreMethods="globalStoreMethods"
  />
</template>
