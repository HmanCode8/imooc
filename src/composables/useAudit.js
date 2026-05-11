import { computed, onMounted, reactive, ref, watch, unref } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import { exportToExcel } from '../utils/index'
const companyPool = ["测试A", "测试B"];

const statusOptions = [
  { label: "全部", value: "" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
];

const statusTag = (status) => {
  if (status === "approved") return { type: "success", text: "已通过" };
  if (status === "rejected") return { type: "danger", text: "已驳回" };
  return { type: "warning", text: "待审核" };
};

const formatDate = (val) => {
  if (!val) return "-";
  return dayjs(val).format("YYYY/MM/DD");
};

export function useAudit(options) {
  const {
    createNewSegment,
    calcMetric,
    metricLabel,
    setDetailVisible,
    setSelectedItem,
    setSelectedSegmentId,
    getDetailVisible,
    getSelectedItem,
    getSelectedSegmentId,
  } = options;

  const getStorageKey = () => unref(options.storageKey);
  const getAuditType = () => unref(options.auditType);
  const getSegmentLabel = () => unref(options.segmentLabel);

  const auditType = computed(() => getAuditType());
  const segmentLabel = computed(() => getSegmentLabel());

  const globalStore = useGlobalStore();

  const state = reactive({
    loading: false,
    filters: {
      dateRange: [],
      status: "",
      keyword: "",
    },
    page: 1,
    pageSize: 10,
    rows: [],
  });

  const viewMode = ref("list");
  const auditVisible = ref(false);
  const auditForm = reactive({
    decision: "approved",
    remark: "",
  });
  const auditTarget = ref(null);

  const createForm = reactive({
    companyName: companyPool[0],
    applyDate: dayjs().toDate(),
    contactName: "",
    contactPhone: "",
    segments: [],
  });

  const currentSegmentIndex = ref(0);

  const currentSegment = computed(() => {
    return createForm.segments[currentSegmentIndex.value] || null;
  });

  const drawnMetric = computed(() => {
    return currentSegment.value ? calcMetric(currentSegment.value.coords) : 0;
  });

  const loadRows = () => {
    try {
      const key = getStorageKey();
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveRows = () => {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(state.rows || []));
  };

  onMounted(() => {
    state.rows = loadRows();
  });

  watch(
    () => getStorageKey(),
    () => {
      state.rows = loadRows();
      state.page = 1;
      viewMode.value = "list";
    },
  );

  const filteredRows = computed(() => {
    const { dateRange, status, keyword } = state.filters;
    return state.rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (keyword) {
        const kw = String(keyword).trim();
        if (kw) {
          const hit =
            String(row.companyName || "").includes(kw) ||
            String(row.contactName || "").includes(kw) ||
            String(row.contactPhone || "").includes(kw);
          if (!hit) return false;
        }
      }
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        if (start && end) {
          const t = dayjs(row.applyDate).valueOf();
          const s = dayjs(start).startOf("day").valueOf();
          const e = dayjs(end).endOf("day").valueOf();
          if (t < s || t > e) return false;
        }
      }
      return true;
    });
  });

  const total = computed(() => filteredRows.value.length);
  const pageRows = computed(() => {
    const start = (state.page - 1) * state.pageSize;
    return filteredRows.value.slice(start, start + state.pageSize);
  });

  const onSearch = () => {
    state.page = 1;
  };

  const onReset = () => {
    state.filters.dateRange = [];
    state.filters.status = "";
    state.filters.keyword = "";
    state.page = 1;
  };

  const indexMethod = (index) => (state.page - 1) * state.pageSize + index + 1;

  const openDetail = (row) => {
    setSelectedItem(row);
    setSelectedSegmentId(row?.segments?.[0]?.id || "");
    setDetailVisible(true);
  };

  const openAudit = (row) => {
    auditTarget.value = row;
    auditForm.decision = row.status === "rejected" ? "rejected" : "approved";
    auditForm.remark = row.remark || "";
    auditVisible.value = true;
  };

  const submitAudit = async () => {
    if (!auditTarget.value) return;
    if (
      auditForm.decision === "rejected" &&
      !String(auditForm.remark || "").trim()
    ) {
      ElMessage.warning("驳回时请填写原因");
      return;
    }
    auditTarget.value.status = auditForm.decision;
    auditTarget.value.remark = String(auditForm.remark || "");
    auditVisible.value = false;
    if (getSelectedItem()?.id === auditTarget.value.id) {
      setSelectedItem(auditTarget.value);
    }
    saveRows();
    ElMessage.success("已提交审批结果");
  };

  const removeRow = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确认删除 ${row.companyName || "-"} 的申请记录？`,
        "提示",
        { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" },
      );
      state.rows = state.rows.filter((r) => r.id !== row.id);
      if (getSelectedItem()?.id === row.id) {
        setDetailVisible(false);
        setSelectedItem(null);
        setSelectedSegmentId("");
      }
      saveRows();
      if ((state.page - 1) * state.pageSize >= total.value && state.page > 1) {
        state.page -= 1;
      }
      ElMessage.success("已删除");
    } catch {
      return;
    }
  };

  const addSegment = () => {
    createForm.segments.push(createNewSegment(createForm.segments.length));
    currentSegmentIndex.value = createForm.segments.length - 1;
  };

  const removeSegment = (index) => {
    if (createForm.segments.length <= 1) {
      ElMessage.warning(`至少保留一个${segmentLabel.value}`);
      return;
    }
    createForm.segments.splice(index, 1);
    if (currentSegmentIndex.value >= createForm.segments.length) {
      currentSegmentIndex.value = createForm.segments.length - 1;
    }
  };

  const openCreate = () => {
    createForm.companyName = companyPool[0];
    createForm.applyDate = dayjs().toDate();
    createForm.contactName = "";
    createForm.contactPhone = "";
    createForm.segments = [createNewSegment(0)];
    currentSegmentIndex.value = 0;
    viewMode.value = "create";
  };

  const onExport = (headerMap, fileName = "export") => {
    // 不导出segments字段，直接删除
    const exportData = []
    // 取出headerMap有的字段就行
    for (const key in headerMap) {
      if (headerMap[key]) {
        exportData.push(headerMap[key])
      }
    }
    exportToExcel(exportData, fileName, headerMap);
  };



  const submitCreate = (options = {}) => {
    const { onSubmit, renderAll, drawType } = options;

    const companyName = String(createForm.companyName || "").trim();
    if (!companyName) {
      ElMessage.warning("请输入申请企业");
      return;
    }
    const contactName = String(createForm.contactName || "").trim();
    if (!contactName) {
      ElMessage.warning("请输入联系人");
      return;
    }
    const contactPhone = String(createForm.contactPhone || "").trim();
    if (contactPhone && !/^\d{6,20}$/.test(contactPhone)) {
      ElMessage.warning("联系方式格式不正确");
      return;
    }

    if (!createForm.segments || createForm.segments.length === 0) {
      ElMessage.warning(`请至少添加一个${segmentLabel.value}`);
      return;
    }

    if (onSubmit) {
      return onSubmit({
        companyName,
        contactName,
        contactPhone,
        createForm,
        state,
        saveRows,
        viewMode,
      });
    }
  };

  return {
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
    submitCreate,
    metricLabel,
    segmentLabel,
    auditType,
    saveRows,
    loadRows,
  };
}
