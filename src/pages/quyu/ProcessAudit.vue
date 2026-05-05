<template>
  <div
    class="h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <i class="iconfont icon-liuchengshenhe text-xl text-blue-600"></i>
        <div class="flex flex-col leading-tight">
          <div class="text-lg font-bold">流程审批</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <el-select v-model="currentUserId">
          <el-option
            v-for="u in users"
            :key="u.id"
            :label="u.name"
            :value="u.id"
          />
        </el-select>
        <el-button type="primary" size="small" @click="openCreateDialog">
          发起流程
        </el-button>
      </div>
    </div>

    <div class="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
      <el-input
        v-model="keyword"
        size="small"
        clearable
        placeholder="搜索标题/申请人/业务名称"
        class="flex-1"
      />
      <el-select
        v-model="filterBizType"
        size="small"
        class="w-[140px]"
        clearable
        placeholder="业务类型"
      >
        <el-option
          v-for="t in bizTypes"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
      <el-select
        v-model="filterStatus"
        size="small"
        class="w-[120px]"
        clearable
        placeholder="状态"
      >
        <el-option
          v-for="s in statusOptions"
          :key="s.value"
          :label="s.label"
          :value="s.value"
        />
      </el-select>
    </div>

    <div class="flex-1 overflow-hidden">
      <el-tabs v-model="activeTab" class="h-full px-2">
        <el-tab-pane name="todo" label="待我审批">
          <div class="h-full overflow-auto px-2 pb-3">
            <el-table
              :data="todoList"
              size="small"
              style="width: 100%"
              row-key="id"
              @row-dblclick="openDetail"
            >
              <el-table-column prop="title" label="标题" min-width="220" />
              <el-table-column prop="bizType" label="类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="bizTagType(row.bizType)">
                    {{ bizTypeLabel(row.bizType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="bizName"
                label="业务名称"
                min-width="160"
              />
              <el-table-column
                prop="applicantName"
                label="申请人"
                width="120"
              />
              <el-table-column prop="createdAt" label="申请时间" width="170">
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="statusTagType(row.status)">
                    {{ statusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="openDetail(row)"
                    >查看</el-button
                  >
                  <el-button
                    size="small"
                    type="success"
                    @click="quickApprove(row)"
                  >
                    通过
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="quickReject(row)"
                  >
                    驳回
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div
              v-if="todoList.length === 0"
              class="py-10 text-center text-gray-400"
            >
              暂无待办
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="mine" label="我发起的">
          <div class="h-full overflow-auto px-2 pb-3">
            <el-table
              :data="myList"
              size="small"
              style="width: 100%"
              row-key="id"
              @row-dblclick="openDetail"
            >
              <el-table-column prop="title" label="标题" min-width="220" />
              <el-table-column prop="bizType" label="类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="bizTagType(row.bizType)">
                    {{ bizTypeLabel(row.bizType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="bizName"
                label="业务名称"
                min-width="160"
              />
              <el-table-column prop="createdAt" label="申请时间" width="170">
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="statusTagType(row.status)">
                    {{ statusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="openDetail(row)"
                    >查看</el-button
                  >
                  <el-button
                    v-if="row.status === 'PENDING'"
                    size="small"
                    type="warning"
                    @click="cancelInstance(row)"
                  >
                    撤回
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div
              v-if="myList.length === 0"
              class="py-10 text-center text-gray-400"
            >
              暂无记录
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="done" label="已办/已完成">
          <div class="h-full overflow-auto px-2 pb-3">
            <el-table
              :data="doneList"
              size="small"
              style="width: 100%"
              row-key="id"
              @row-dblclick="openDetail"
            >
              <el-table-column prop="title" label="标题" min-width="220" />
              <el-table-column prop="bizType" label="类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="bizTagType(row.bizType)">
                    {{ bizTypeLabel(row.bizType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="bizName"
                label="业务名称"
                min-width="160"
              />
              <el-table-column
                prop="applicantName"
                label="申请人"
                width="120"
              />
              <el-table-column prop="updatedAt" label="完成时间" width="170">
                <template #default="{ row }">
                  {{ formatTime(row.updatedAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="结果" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="statusTagType(row.status)">
                    {{ statusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="openDetail(row)"
                    >查看</el-button
                  >
                </template>
              </el-table-column>
            </el-table>

            <div
              v-if="doneList.length === 0"
              class="py-10 text-center text-gray-400"
            >
              暂无记录
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="createDialogVisible" title="发起流程" width="560px">
      <el-form :model="createForm" label-width="92px">
        <el-form-item label="业务类型">
          <el-select v-model="createForm.bizType" class="w-full">
            <el-option
              v-for="t in bizTypes"
              :key="t.value"
              :label="t.label"
              :value="t.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务名称">
          <el-input
            v-model="createForm.bizName"
            placeholder="例如：南海区测试路段A / 某停车场"
          />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="填写新增原因、范围、关键属性等"
          />
        </el-form-item>
        <el-form-item label="表单数据">
          <el-input
            v-model="createForm.payloadJson"
            type="textarea"
            :rows="6"
            placeholder='可选：JSON（例如 {"code":"A001","region":"南海区"}）'
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-gray-500">
            默认审批人：{{ userName(defaultApproverId) }}
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitCreate">提交</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailVisible"
      title="流程详情"
      size="520px"
      destroy-on-close
    >
      <template #default>
        <div v-if="currentDetail" class="flex flex-col gap-4">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="标题">
              {{ currentDetail.title }}
            </el-descriptions-item>
            <el-descriptions-item label="业务类型">
              <el-tag size="small" :type="bizTagType(currentDetail.bizType)">
                {{ bizTypeLabel(currentDetail.bizType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="业务名称">
              {{ currentDetail.bizName }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">
              {{ currentDetail.applicantName }}
            </el-descriptions-item>
            <el-descriptions-item label="审批人">
              {{ userName(currentDetail.approverId) }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag size="small" :type="statusTagType(currentDetail.status)">
                {{ statusLabel(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatTime(currentDetail.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item
              v-if="currentDetail.updatedAt"
              label="更新时间"
            >
              {{ formatTime(currentDetail.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="说明">
              {{ currentDetail.description || "-" }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">表单数据</div>
            <el-input
              :model-value="prettyPayload(currentDetail.payload)"
              type="textarea"
              :rows="8"
              readonly
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">审批记录</div>
            <el-timeline>
              <el-timeline-item
                v-for="(h, idx) in currentDetail.history"
                :key="idx"
                :timestamp="formatTime(h.time)"
                :type="timelineType(h.action)"
              >
                <div class="text-sm">
                  <span class="font-medium">{{ userName(h.userId) }}</span>
                  <span class="ml-2 text-gray-600">{{
                    historyActionLabel(h.action)
                  }}</span>
                </div>
                <div v-if="h.comment" class="text-xs text-gray-500 mt-1">
                  {{ h.comment }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <div v-if="canOperateCurrent" class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">审批操作</div>
            <el-input
              v-model="operateComment"
              type="textarea"
              :rows="3"
              placeholder="填写审批意见（可选）"
            />
            <div class="flex items-center gap-2">
              <el-button type="success" @click="approveCurrent">通过</el-button>
              <el-button type="danger" @click="rejectCurrent">驳回</el-button>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";

const STORAGE_KEY = "workflow.instances.v1";

const users = [
  { id: "u_apply_1", name: "张三（申请人）" },
  { id: "u_apply_2", name: "李四（申请人）" },
  { id: "u_approve_1", name: "王五（审批人）" },
  { id: "u_approve_2", name: "赵六（审批人）" },
];

const defaultApproverId = "u_approve_1";

const bizTypes = [
  { value: "route", label: "道路段新增" },
  { value: "area", label: "区域新增" },
  { value: "parking", label: "停车场新增" },
];

const statusOptions = [
  { value: "PENDING", label: "待审批" },
  { value: "APPROVED", label: "已通过" },
  { value: "REJECTED", label: "已驳回" },
  { value: "CANCELED", label: "已撤回" },
];

const activeTab = ref("todo");
const keyword = ref("");
const filterBizType = ref("");
const filterStatus = ref("");

const currentUserId = ref(
  localStorage.getItem("workflow.currentUserId") || users[0].id,
);
watch(currentUserId, (val) =>
  localStorage.setItem("workflow.currentUserId", val),
);

const instances = ref([]);

const createDialogVisible = ref(false);
const createForm = reactive({
  bizType: "route",
  bizName: "",
  description: "",
  payloadJson: "",
});

const detailVisible = ref(false);
const currentDetail = ref(null);
const operateComment = ref("");

const userName = (userId) =>
  users.find((u) => u.id === userId)?.name || userId || "-";

const formatTime = (ts) => {
  if (!ts) return "-";
  return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
};

const statusLabel = (status) =>
  statusOptions.find((s) => s.value === status)?.label || status;
const statusTagType = (status) => {
  if (status === "PENDING") return "warning";
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "CANCELED") return "info";
  return "info";
};

const bizTypeLabel = (bizType) =>
  bizTypes.find((b) => b.value === bizType)?.label || bizType;
const bizTagType = (bizType) => {
  if (bizType === "route") return "primary";
  if (bizType === "area") return "success";
  if (bizType === "parking") return "warning";
  return "info";
};

const normalizeText = (v) =>
  String(v || "")
    .toLowerCase()
    .trim();

const filtered = computed(() => {
  const kw = normalizeText(keyword.value);
  return instances.value
    .filter((it) => {
      if (filterBizType.value && it.bizType !== filterBizType.value)
        return false;
      if (filterStatus.value && it.status !== filterStatus.value) return false;
      if (!kw) return true;
      const hay = [
        it.title,
        it.bizName,
        it.applicantName,
        userName(it.approverId),
      ]
        .map(normalizeText)
        .join(" ");
      return hay.includes(kw);
    })
    .sort(
      (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt),
    );
});

const todoList = computed(() => {
  return filtered.value.filter(
    (it) => it.status === "PENDING" && it.approverId === currentUserId.value,
  );
});

const myList = computed(() => {
  return filtered.value.filter((it) => it.applicantId === currentUserId.value);
});

const doneList = computed(() => {
  return filtered.value.filter((it) => it.status !== "PENDING");
});

const canOperateCurrent = computed(() => {
  const it = currentDetail.value;
  if (!it) return false;
  return it.status === "PENDING" && it.approverId === currentUserId.value;
});

const prettyPayload = (payload) => {
  try {
    return JSON.stringify(payload ?? {}, null, 2);
  } catch {
    return String(payload ?? "");
  }
};

const historyActionLabel = (action) => {
  if (action === "CREATE") return "发起申请";
  if (action === "APPROVE") return "审批通过";
  if (action === "REJECT") return "审批驳回";
  if (action === "CANCEL") return "申请撤回";
  return action;
};

const timelineType = (action) => {
  if (action === "CREATE") return "primary";
  if (action === "APPROVE") return "success";
  if (action === "REJECT") return "danger";
  if (action === "CANCEL") return "info";
  return "info";
};

const loadInstances = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }

  const now = Date.now();
  return [
    {
      id: `wf_${now - 1000 * 60 * 60 * 6}`,
      title: "新增道路段：桂城测试路段A",
      bizType: "route",
      bizName: "桂城测试路段A",
      applicantId: "u_apply_1",
      applicantName: userName("u_apply_1"),
      approverId: defaultApproverId,
      description: "新增测试道路段，用于自动驾驶道路测试备案。",
      payload: { code: "RD-A001", region: "南海区", lengthKm: 3.2 },
      status: "PENDING",
      createdAt: now - 1000 * 60 * 60 * 6,
      updatedAt: null,
      history: [
        {
          action: "CREATE",
          userId: "u_apply_1",
          time: now - 1000 * 60 * 60 * 6,
          comment: "",
        },
      ],
    },
    {
      id: `wf_${now - 1000 * 60 * 60 * 30}`,
      title: "新增区域：禅城核心区B",
      bizType: "area",
      bizName: "禅城核心区B",
      applicantId: "u_apply_2",
      applicantName: userName("u_apply_2"),
      approverId: "u_approve_2",
      description: "新增区域边界范围，用于测试运营车辆管理。",
      payload: { code: "AR-B002", region: "禅城区" },
      status: "APPROVED",
      createdAt: now - 1000 * 60 * 60 * 30,
      updatedAt: now - 1000 * 60 * 60 * 28,
      history: [
        {
          action: "CREATE",
          userId: "u_apply_2",
          time: now - 1000 * 60 * 60 * 30,
          comment: "",
        },
        {
          action: "APPROVE",
          userId: "u_approve_2",
          time: now - 1000 * 60 * 60 * 28,
          comment: "同意新增。",
        },
      ],
    },
  ];
};

const saveInstances = (list) => {
  instances.value = list;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const openCreateDialog = () => {
  createForm.bizType = "route";
  createForm.bizName = "";
  createForm.description = "";
  createForm.payloadJson = "";
  createDialogVisible.value = true;
};

const parsePayload = (jsonText) => {
  const txt = String(jsonText || "").trim();
  if (!txt) return {};
  return JSON.parse(txt);
};

const submitCreate = async () => {
  if (!createForm.bizName.trim()) {
    ElMessage.warning("请填写业务名称");
    return;
  }
  let payload = {};
  try {
    payload = parsePayload(createForm.payloadJson);
  } catch {
    ElMessage.error("表单数据 JSON 格式不正确");
    return;
  }

  const now = Date.now();
  const applicantId = currentUserId.value;
  const instance = {
    id: `wf_${now}_${Math.random().toString(16).slice(2)}`,
    title: `新增${bizTypeLabel(createForm.bizType).replace("新增", "")}：${createForm.bizName}`,
    bizType: createForm.bizType,
    bizName: createForm.bizName,
    applicantId,
    applicantName: userName(applicantId),
    approverId: defaultApproverId,
    description: createForm.description,
    payload,
    status: "PENDING",
    createdAt: now,
    updatedAt: null,
    history: [
      { action: "CREATE", userId: applicantId, time: now, comment: "" },
    ],
  };

  saveInstances([instance, ...instances.value]);
  createDialogVisible.value = false;
  activeTab.value = "mine";
  ElMessage.success("已提交审批");
};

const openDetail = (row) => {
  currentDetail.value = row;
  operateComment.value = "";
  detailVisible.value = true;
};

const updateInstance = (id, updater) => {
  const next = instances.value.map((it) => {
    if (it.id !== id) return it;
    const copy = { ...it };
    updater(copy);
    return copy;
  });
  saveInstances(next);
  currentDetail.value = next.find((it) => it.id === id) || currentDetail.value;
};

const approve = async (row, comment) => {
  await ElMessageBox.confirm("确认审批通过该流程？", "提示", {
    type: "warning",
  });
  const now = Date.now();
  updateInstance(row.id, (it) => {
    it.status = "APPROVED";
    it.updatedAt = now;
    it.history = [
      ...(it.history || []),
      {
        action: "APPROVE",
        userId: currentUserId.value,
        time: now,
        comment: comment || "",
      },
    ];
  });
  ElMessage.success("已通过");
};

const reject = async (row, comment) => {
  await ElMessageBox.confirm("确认驳回该流程？", "提示", { type: "warning" });
  const now = Date.now();
  updateInstance(row.id, (it) => {
    it.status = "REJECTED";
    it.updatedAt = now;
    it.history = [
      ...(it.history || []),
      {
        action: "REJECT",
        userId: currentUserId.value,
        time: now,
        comment: comment || "",
      },
    ];
  });
  ElMessage.success("已驳回");
};

const quickApprove = (row) => approve(row, "");
const quickReject = (row) => reject(row, "");

const approveCurrent = () => {
  if (!currentDetail.value) return;
  return approve(currentDetail.value, operateComment.value);
};

const rejectCurrent = () => {
  if (!currentDetail.value) return;
  return reject(currentDetail.value, operateComment.value);
};

const cancelInstance = async (row) => {
  await ElMessageBox.confirm("确认撤回该申请？撤回后将无法继续审批。", "提示", {
    type: "warning",
  });
  const now = Date.now();
  updateInstance(row.id, (it) => {
    it.status = "CANCELED";
    it.updatedAt = now;
    it.history = [
      ...(it.history || []),
      { action: "CANCEL", userId: currentUserId.value, time: now, comment: "" },
    ];
  });
  ElMessage.success("已撤回");
};

onMounted(() => {
  const seeded = loadInstances();
  saveInstances(seeded);
});
</script>
