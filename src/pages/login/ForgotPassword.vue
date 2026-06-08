<template>
  <div class="forgot-container flex items-center justify-center h-screen w-screen overflow-hidden">
    <!-- 统一登录同款背景图+遮罩 -->
    <div class="forgot-bg" aria-hidden="true"></div>
    <div class="forgot-overlay" aria-hidden="true"></div>

    <div
      class="relative z-10 w-[500px] p-10 rounded-2xl border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50"></div>

      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white tracking-wider mb-2">找回密码</h1>
        <p class="text-blue-400/60 text-sm">通过注册邮箱验证后重置登录密码</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="forgot-form">
        <el-form-item prop="username">
          <template #label>
            <span class="text-white/70 text-sm">账号</span>
          </template>
          <el-input v-model="form.username" placeholder="请输入登录账号" prefix-icon="User" class="custom-input" />
        </el-form-item>

        <el-form-item prop="email">
          <template #label>
            <span class="text-white/70 text-sm">注册邮箱</span>
          </template>
          <el-input v-model="form.email" placeholder="请输入注册时绑定的邮箱" prefix-icon="Message" class="custom-input" />
        </el-form-item>

        <el-form-item prop="code">
          <template #label>
            <span class="text-white/70 text-sm">验证码</span>
          </template>
          <div class="flex gap-2 w-full">
            <el-input v-model="form.code" placeholder="请输入邮箱验证码" prefix-icon="Key" maxlength="6"
              class="custom-input flex-1" />
            <el-button class="send-code-btn shrink-0" :disabled="codeCountdown > 0 || sendingCode"
              :loading="sendingCode" @click="handleSendCode">
              {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item prop="password">
            <template #label>
              <span class="text-white/70 text-sm">新密码</span>
            </template>
            <el-input v-model="form.password" type="password" placeholder="请输入新密码" prefix-icon="Lock" show-password
              class="custom-input" />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <template #label>
              <span class="text-white/70 text-sm">确认密码</span>
            </template>
            <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入" prefix-icon="CircleCheck"
              show-password class="custom-input" @keyup.enter="handleReset" />
          </el-form-item>
        </div>

        <el-button type="primary"
          class="w-full h-12 text-lg font-bold tracking-widest uppercase mt-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border-none"
          :loading="loading" @click="handleReset">
          重置密码
        </el-button>

        <div class="text-center mt-6">
          <router-link to="/login" class="text-blue-400 text-xs font-bold hover:underline">
            返回登录
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { userApi } from "@/services/user";
import md5 from "md5";
// 共用登录背景图
import loginBg from '@/assets/login.png'
const loginBgUrl = `url(${loginBg})`

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const sendingCode = ref(false);
const codeCountdown = ref(0);
let countdownTimer = null;

const form = reactive({
  username: "",
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
});

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请再次输入密码"));
  } else if (value !== form.password) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码为 6 位", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于 6 位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: "blur" },
  ],
};

const startCountdown = () => {
  codeCountdown.value = 60;
  countdownTimer = setInterval(() => {
    codeCountdown.value -= 1;
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

const handleSendCode = async () => {
  try {
    await formRef.value?.validateField(["username", "email"]);
  } catch {
    return;
  }

  sendingCode.value = true;
  try {
    const res = await userApi.sendResetCode({
      username: form.username,
      email: form.email,
    });
    if (res.code === 200) {
      ElMessage.success(res.msg || "验证码已发送至邮箱，请查收");
      startCountdown();
    } else {
      ElMessage.error(res.msg || "验证码发送失败");
    }
  } catch (error) {
    ElMessage.error(error.message || "验证码发送失败");
  } finally {
    sendingCode.value = false;
  }
};

const handleReset = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;
    const res = await userApi.resetPassword({
      username: form.username,
      email: form.email,
      code: form.code,
      password: md5(form.password),
      confirmPassword: md5(form.confirmPassword),
    });

    if (res.code === 200) {
      ElMessage.success("密码重置成功，请使用新密码登录");
      router.push("/login");
    } else {
      ElMessage.error(res.msg || "密码重置失败");
    }
  } catch (error) {
    ElMessage.error(error.message || "密码重置失败");
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style lang="scss" scoped>
.forgot-container {
  position: relative;
}

.forgot-bg {
  position: absolute;
  inset: 0;
  background-image: v-bind(loginBgUrl);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.forgot-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(10, 15, 35, 0.55) 0%,
      rgba(10, 20, 50, 0.35) 50%,
      rgba(5, 10, 25, 0.5) 100%);
  pointer-events: none;
}

.send-code-btn {
  height: 44px;
  min-width: 120px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #93c5fd;

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    color: #fff;
  }

  &:disabled {
    opacity: 0.6;
  }
}

:deep(.custom-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    transition: all 0.3s;

    &:hover,
    &.is-focus {
      border-color: rgba(59, 130, 246, 0.5) !important;
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.1) !important;
    }
  }

  .el-input__inner {
    color: white !important;
    height: 44px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .el-input__prefix-icon {
    color: rgba(255, 255, 255, 0.4);
  }
}

.el-button--primary {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border: none;

  &:hover {
    background: linear-gradient(90deg, #1d4ed8, #2563eb);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>