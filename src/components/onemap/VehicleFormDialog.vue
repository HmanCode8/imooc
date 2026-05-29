<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑车辆' : '新增车辆'"
    width="640px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="max-h-[60vh] overflow-y-auto pr-2"
    >
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="车架号" prop="id">
        <el-input
          v-model="form.id"
          placeholder="如 LSVGP2AU3JW097701"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item label="车牌号" prop="plateNo">
        <el-input v-model="form.plateNo" placeholder="如 粤E·A8881" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="车辆类型" prop="type">
            <el-select v-model="form.type" class="w-full">
              <el-option
                v-for="item in VEHICLE_TYPE_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车辆种类" prop="category">
            <el-select v-model="form.category" class="w-full">
              <el-option
                v-for="item in VEHICLE_CATEGORY_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属企业" prop="enterprise">
            <el-select
              v-model="form.enterprise"
              filterable
              allow-create
              class="w-full"
            >
              <el-option
                v-for="item in ENTERPRISE_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="辖区" prop="region">
            <el-select v-model="form.region" class="w-full">
              <el-option
                v-for="item in REGION_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="在线状态" prop="status">
            <el-select v-model="form.status" class="w-full">
              <el-option
                v-for="item in VEHICLE_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地图颜色" prop="color">
            <el-color-picker v-model="form.color" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">安全员信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="姓名" prop="securityInfo.name">
            <el-input v-model="form.securityInfo.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="securityInfo.gender">
            <el-select v-model="form.securityInfo.gender" class="w-full">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="联系电话" prop="securityInfo.phone">
        <el-input v-model="form.securityInfo.phone" maxlength="11" />
      </el-form-item>
      <el-form-item label="驾驶证号" prop="securityInfo.licenseNo">
        <el-input v-model="form.securityInfo.licenseNo" />
      </el-form-item>

      <el-divider content-position="left">终端状态</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="行驶速度">
            <el-input-number
              v-model="form.terminalInfo.speed"
              :min="0"
              :max="120"
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电量(%)">
            <el-input-number
              v-model="form.terminalInfo.power"
              :min="0"
              :max="100"
              class="w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="驾驶状态">
            <el-input v-model="form.terminalInfo.status" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信号强度">
            <el-select v-model="form.terminalInfo.signalStatus" class="w-full">
              <el-option label="强" value="强" />
              <el-option label="中" value="中" />
              <el-option label="弱" value="弱" />
              <el-option label="无" value="无" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import {
  ENTERPRISE_OPTIONS,
  REGION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_STATUS_OPTIONS,
} from "@/mock/car";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  vehicle: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const isEdit = computed(() => !!props.vehicle?.id);
const formRef = ref(null);
const submitting = ref(false);

const emptyForm = () => ({
  id: "",
  plateNo: "",
  type: "正式",
  category: "无人物流车",
  enterprise: ENTERPRISE_OPTIONS[0],
  region: REGION_OPTIONS[0],
  status: "online",
  color: "#5dca8e",
  securityInfo: {
    name: "",
    gender: "男",
    phone: "",
    unit: ENTERPRISE_OPTIONS[0],
    licenseNo: "",
  },
  terminalInfo: {
    speed: 0,
    status: "自动驾驶",
    power: 80,
    signalStatus: "强",
  },
});

const form = reactive(emptyForm());

const rules = {
  id: [
    { required: true, message: "请输入车架号", trigger: "blur" },
    { min: 8, message: "车架号至少 8 位", trigger: "blur" },
  ],
  plateNo: [{ required: true, message: "请输入车牌号", trigger: "blur" }],
  type: [{ required: true, message: "请选择车辆类型", trigger: "change" }],
  category: [{ required: true, message: "请选择车辆种类", trigger: "change" }],
  enterprise: [{ required: true, message: "请选择企业", trigger: "change" }],
  region: [{ required: true, message: "请选择辖区", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  "securityInfo.name": [
    { required: true, message: "请输入安全员姓名", trigger: "blur" },
  ],
  "securityInfo.phone": [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1\d{10}$/,
      message: "请输入有效手机号",
      trigger: "blur",
    },
  ],
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.assign(form, emptyForm());
    if (props.vehicle) {
      const v = props.vehicle;
      Object.assign(form, {
        id: v.id,
        plateNo: v.plateNo,
        type: v.type,
        category: v.category,
        enterprise: v.enterprise,
        region: v.region,
        status: v.status,
        color: v.color || "#5dca8e",
        securityInfo: { ...emptyForm().securityInfo, ...v.securityInfo },
        terminalInfo: { ...emptyForm().terminalInfo, ...v.terminalInfo },
      });
    }
  },
);

const handleClosed = () => {
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    form.securityInfo.unit = form.enterprise;
    emit("submit", {
      ...JSON.parse(JSON.stringify(form)),
      isEdit: isEdit.value,
    });
    visible.value = false;
  } finally {
    submitting.value = false;
  }
};
</script>
