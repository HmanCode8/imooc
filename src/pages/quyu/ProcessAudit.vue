<template>
  <div
    class="h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden"
  >
    <div
      class="theme-bg px-4 py-3 border-b border-gray-100 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="text-lg font-bold text-white">流程审批</div>
      </div>
    </div>

    <div class="px-4 py-3 border-b border-gray-100 bg-white">
      <div class="flex items-center gap-2 ml-auto">
        <el-select
          clearable
          placeholder="请选择申请人"
          v-model="currentUserId"
          class="w-[180px]"
        >
          <el-option
            v-for="u in users"
            :key="u.id"
            :label="u.name"
            :value="u.id"
          />
        </el-select>
        <el-button type="primary" @click="openCreateDialog">
          发起流程
        </el-button>
      </div>
      <div class="flex mt-5 items-center gap-2">
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索标题/申请人/业务名称"
          class="min-w-[220px] flex-1"
        />
        <el-select
          v-model="filterBizType"
          class="w-[120px]"
          clearable
          placeholder="类型"
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
    </div>

    <div class="flex-1 overflow-hidden bg-gray-50">
      <el-tabs v-model="activeTab" class="h-full px-4 pt-2">
        <el-tab-pane name="todo" label="待我审批">
          <div class="h-full overflow-auto pb-4">
            <div
              class="bg-white border border-gray-100 rounded-lg overflow-hidden"
            >
              <el-table
                :data="todoList"
                style="width: 100%"
                row-key="id"
                @row-dblclick="openDetail"
              >
                <el-table-column prop="title" label="标题" min-width="220" />
                <el-table-column prop="bizType" label="类型" width="110">
                  <template #default="{ row }">
                    <el-tag :type="bizTagType(row.bizType)">
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
                    <el-tag :type="statusTagType(row.status)">
                      {{ statusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right">
                  <template #default="{ row }">
                    <el-button @click="openDetail(row)">查看</el-button>
                    <el-button type="success" @click="quickApprove(row)">
                      通过
                    </el-button>
                    <el-button type="danger" @click="quickReject(row)">
                      驳回
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div
              v-if="todoList.length === 0"
              class="py-10 text-center text-gray-400"
            >
              暂无待办
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="mine" label="我发起的">
          <div class="h-full overflow-auto pb-4">
            <div
              class="bg-white border border-gray-100 rounded-lg overflow-hidden"
            >
              <el-table
                :data="myList"
                style="width: 100%"
                row-key="id"
                @row-dblclick="openDetail"
              >
                <el-table-column prop="title" label="标题" min-width="220" />
                <el-table-column prop="bizType" label="类型" width="110">
                  <template #default="{ row }">
                    <el-tag :type="bizTagType(row.bizType)">
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
                    <el-tag :type="statusTagType(row.status)">
                      {{ statusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                  <template #default="{ row }">
                    <el-button @click="openDetail(row)">查看</el-button>
                    <el-button
                      v-if="row.status === 'PENDING'"
                      type="warning"
                      @click="cancelInstance(row)"
                    >
                      撤回
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div
              v-if="myList.length === 0"
              class="py-10 text-center text-gray-400"
            >
              暂无记录
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="done" label="已办/已完成">
          <div class="h-full overflow-auto pb-4">
            <div
              class="bg-white border border-gray-100 rounded-lg overflow-hidden"
            >
              <el-table
                :data="doneList"
                style="width: 100%"
                row-key="id"
                @row-dblclick="openDetail"
              >
                <el-table-column prop="title" label="标题" min-width="220" />
                <el-table-column prop="bizType" label="类型" width="110">
                  <template #default="{ row }">
                    <el-tag :type="bizTagType(row.bizType)">
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
                    <el-tag :type="statusTagType(row.status)">
                      {{ statusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="{ row }">
                    <el-button @click="openDetail(row)">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

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

    <el-dialog v-model="createDialogVisible" title="发起流程" width="720px">
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-position="top"
      >
        <div class="grid grid-cols-2 gap-x-4">
          <el-form-item class="col-span-2" label="业务类型" prop="bizType">
            <el-select v-model="createForm.bizType" class="w-full">
              <el-option
                v-for="t in bizTypes"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </el-form-item>

          <div
            class="col-span-2 text-xs font-semibold text-gray-500 tracking-wider mt-1"
          >
            申请信息
          </div>
          <el-form-item label="申请企业" prop="applyCompany">
            <el-select
              v-model="createForm.applyCompany"
              class="w-full"
              placeholder="请选择"
            >
              <el-option
                v-for="c in enterpriseOptions"
                :key="c"
                :label="c"
                :value="c"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="申请日期" prop="applyDate">
            <el-date-picker
              v-model="createForm.applyDate"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
              placeholder="请选择"
            />
          </el-form-item>
          <el-form-item label="联系人" prop="contactName">
            <el-input v-model="createForm.contactName" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="联系方式" prop="contactPhone">
            <el-input v-model="createForm.contactPhone" placeholder="请输入" />
          </el-form-item>

          <div
            class="col-span-2 text-xs font-semibold text-gray-500 tracking-wider mt-1"
          >
            {{ createBizFormTitle }}
          </div>
          <el-form-item :label="createBizNameLabel" prop="itemName">
            <el-input v-model="createForm.itemName" placeholder="请输入" />
          </el-form-item>
          <el-form-item
            v-if="createForm.bizType === 'route'"
            label="路段编码"
            prop="routeCode"
          >
            <el-input v-model="createForm.routeCode" placeholder="请输入" />
          </el-form-item>
          <el-form-item v-else class="invisible">
            <el-input />
          </el-form-item>

          <el-form-item class="col-span-2" label="所属区" prop="region">
            <el-select
              v-model="createForm.region"
              multiple
              collapse-tags
              collapse-tags-tooltip
              class="w-full"
              placeholder="请选择（可多选）"
            >
              <el-option
                v-for="r in regionOptions"
                :key="r"
                :label="r"
                :value="r"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="col-span-2" label="所属镇街" prop="street">
            <el-input v-model="createForm.street" placeholder="请输入" />
          </el-form-item>

          <el-form-item
            v-if="createForm.bizType === 'parking'"
            class="col-span-2"
            label="地图编辑"
            prop="parkingMapJson"
          >
            <el-input
              v-model="createForm.parkingMapJson"
              type="textarea"
              :rows="4"
              placeholder="可选：填写地图编辑后的数据（JSON）"
            />
          </el-form-item>

          <el-form-item class="col-span-2" label="说明">
            <el-input
              v-model="createForm.description"
              type="textarea"
              :rows="3"
              placeholder="填写新增原因、范围、关键属性等"
            />
          </el-form-item>
        </div>
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
          <div class="bg-white border border-gray-100 rounded-lg p-3">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="标题" :span="2">
                {{ currentDetail.title }}
              </el-descriptions-item>
              <el-descriptions-item label="业务类型">
                <el-tag :type="bizTagType(currentDetail.bizType)">
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
                <el-tag :type="statusTagType(currentDetail.status)">
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
              <el-descriptions-item v-else label="更新时间"
                >-</el-descriptions-item
              >
              <el-descriptions-item label="说明" :span="2">
                {{ currentDetail.description || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">表单数据</div>
            <div class="bg-white border border-gray-100 rounded-lg p-3">
              <el-descriptions :column="2" border>
                <el-descriptions-item
                  v-for="(f, idx) in payloadFields(currentDetail)"
                  :key="idx"
                  :label="f.label"
                >
                  {{ f.value }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">审批记录</div>
            <div class="bg-white border border-gray-100 rounded-lg p-3">
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
          </div>

          <div v-if="canOperateCurrent" class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-700">审批操作</div>
            <div class="bg-white border border-gray-100 rounded-lg p-3">
              <el-input
                v-model="operateComment"
                type="textarea"
                :rows="3"
                placeholder="填写审批意见（可选）"
              />
              <div class="flex items-center gap-2 mt-3">
                <el-button type="success" @click="approveCurrent"
                  >通过</el-button
                >
                <el-button type="danger" @click="rejectCurrent">驳回</el-button>
              </div>
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
  { value: "route", label: "路段" },
  { value: "area", label: "区域" },
  { value: "parking", label: "停车场" },
];

const enterpriseOptions = ["测试A", "测试B"];
const regionOptions = ["禅城区", "南海区", "顺德区", "高明区", "三水区"];

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
  applyCompany: "",
  applyDate: dayjs().format("YYYY-MM-DD"),
  contactName: "",
  contactPhone: "",
  itemName: "",
  routeCode: "",
  region: [],
  street: "",
  description: "",
  parkingMapJson: "",
});
const createFormRef = ref();

const createBizNameLabel = computed(() => {
  if (createForm.bizType === "route") return "路段名称";
  if (createForm.bizType === "area") return "区域名称";
  if (createForm.bizType === "parking") return "停车场名称";
  return "名称";
});
const createBizFormTitle = computed(() => {
  if (createForm.bizType === "route") return "路段申请表";
  if (createForm.bizType === "area") return "区域申请表";
  if (createForm.bizType === "parking") return "停车场申请表";
  return "申请表";
});

const requiredIf = (predicate, message) => {
  return (rule, value, callback) => {
    if (!predicate()) return callback();
    if (String(value || "").trim()) return callback();
    callback(new Error(message));
  };
};

const createFormRules = {
  bizType: [{ required: true, message: "请选择业务类型", trigger: "change" }],
  applyCompany: [
    { required: true, message: "请选择申请企业", trigger: "change" },
  ],
  applyDate: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  contactName: [{ required: true, message: "请填写联系人", trigger: "blur" }],
  contactPhone: [
    { required: true, message: "请填写联系方式", trigger: "blur" },
  ],
  itemName: [
    {
      validator: requiredIf(
        () => ["route", "area", "parking"].includes(createForm.bizType),
        "请填写名称",
      ),
      trigger: "blur",
    },
  ],
  routeCode: [
    {
      validator: requiredIf(
        () => createForm.bizType === "route",
        "请填写路段编码",
      ),
      trigger: "blur",
    },
  ],
  region: [
    {
      validator: (rule, value, callback) => {
        if (!["route", "area", "parking"].includes(createForm.bizType))
          return callback();
        if (Array.isArray(value) && value.length > 0) return callback();
        callback(new Error("请选择所属区"));
      },
      trigger: "change",
    },
  ],
  street: [
    {
      validator: requiredIf(
        () => ["route", "area", "parking"].includes(createForm.bizType),
        "请填写所属镇街",
      ),
      trigger: "blur",
    },
  ],
  parkingMapJson: [
    {
      validator: (rule, value, callback) => {
        if (createForm.bizType !== "parking") return callback();
        const txt = String(value || "").trim();
        if (!txt) return callback();
        try {
          JSON.parse(txt);
          callback();
        } catch {
          callback(new Error("地图编辑数据 JSON 格式不正确"));
        }
      },
      trigger: "blur",
    },
  ],
};

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
      payload: {
        applyCompany: "测试A",
        applyDate: dayjs(now - 1000 * 60 * 60 * 6).format("YYYY-MM-DD"),
        contactName: "张三",
        contactPhone: "13800000000",
        name: "桂城测试路段A",
        code: "RD-A001",
        region: ["南海区"],
        street: "桂城街道",
      },
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
      payload: {
        applyCompany: "测试B",
        applyDate: dayjs(now - 1000 * 60 * 60 * 30).format("YYYY-MM-DD"),
        contactName: "李四",
        contactPhone: "13900000000",
        name: "禅城核心区B",
        region: ["禅城区"],
        street: "石湾街道",
      },
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
  createForm.applyCompany = "";
  createForm.applyDate = dayjs().format("YYYY-MM-DD");
  createForm.contactName = "";
  createForm.contactPhone = "";
  createForm.itemName = "";
  createForm.routeCode = "";
  createForm.region = [];
  createForm.street = "";
  createForm.description = "";
  createForm.parkingMapJson = "";
  createDialogVisible.value = true;
};

watch(
  () => createForm.bizType,
  () => {
    createForm.itemName = "";
    createForm.routeCode = "";
    createForm.parkingMapJson = "";
  },
);

const buildPayloadFromForm = () => {
  const regions = Array.isArray(createForm.region)
    ? createForm.region.filter(Boolean)
    : [];
  const base = {
    applyCompany: String(createForm.applyCompany || "").trim(),
    applyDate: createForm.applyDate,
    contactName: String(createForm.contactName || "").trim(),
    contactPhone: String(createForm.contactPhone || "").trim(),
    region: regions,
    street: String(createForm.street || "").trim(),
  };

  if (createForm.bizType === "route") {
    return {
      ...base,
      name: String(createForm.itemName || "").trim(),
      code: String(createForm.routeCode || "").trim(),
    };
  }
  if (createForm.bizType === "area") {
    return { ...base, name: String(createForm.itemName || "").trim() };
  }
  if (createForm.bizType === "parking") {
    const txt = String(createForm.parkingMapJson || "").trim();
    return {
      ...base,
      name: String(createForm.itemName || "").trim(),
      map: txt ? JSON.parse(txt) : null,
    };
  }
  return { ...base, name: String(createForm.itemName || "").trim() };
};

const validateCreateForm = async () => {
  if (!createFormRef.value) return false;
  return await new Promise((resolve) => {
    createFormRef.value.validate((valid) => resolve(!!valid));
  });
};

const submitCreate = async () => {
  const ok = await validateCreateForm();
  if (!ok) return;

  let payload = {};
  try {
    payload = buildPayloadFromForm();
  } catch {
    ElMessage.error("表单数据有误，请检查后重试");
    return;
  }
  const bizName = payload?.name || "-";

  const now = Date.now();
  const applicantId = currentUserId.value;
  const instance = {
    id: `wf_${now}_${Math.random().toString(16).slice(2)}`,
    title: `新增${bizTypeLabel(createForm.bizType)}：${bizName}`,
    bizType: createForm.bizType,
    bizName,
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

const fmt = (v) => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s ? s : "-";
};

const fmtRegion = (v) => {
  if (Array.isArray(v)) return v.length ? v.join("、") : "-";
  return fmt(v);
};

const payloadFields = (detail) => {
  const payload = detail?.payload || {};
  const common = [
    { label: "申请企业", value: fmt(payload.applyCompany) },
    { label: "申请日期", value: fmt(payload.applyDate) },
    { label: "联系人", value: fmt(payload.contactName) },
    { label: "联系方式", value: fmt(payload.contactPhone) },
  ];

  if (detail?.bizType === "route") {
    return [
      ...common,
      { label: "路段名称", value: fmt(payload.name) },
      { label: "路段编码", value: fmt(payload.code) },
      { label: "所属区", value: fmtRegion(payload.region) },
      { label: "所属镇街", value: fmt(payload.street) },
    ];
  }
  if (detail?.bizType === "area") {
    return [
      ...common,
      { label: "区域名称", value: fmt(payload.name) },
      { label: "所属区", value: fmtRegion(payload.region) },
      { label: "所属镇街", value: fmt(payload.street) },
    ];
  }
  if (detail?.bizType === "parking") {
    const hasMap = payload.map !== null && payload.map !== undefined;
    return [
      ...common,
      { label: "停车场名称", value: fmt(payload.name) },
      { label: "所属区", value: fmtRegion(payload.region) },
      { label: "所属镇街", value: fmt(payload.street) },
      { label: "地图编辑", value: hasMap ? "已编辑" : "-" },
    ];
  }

  return [
    ...common,
    { label: "名称", value: fmt(payload.name) },
    { label: "所属区", value: fmtRegion(payload.region) },
    { label: "所属镇街", value: fmt(payload.street) },
  ];
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
