<template>
  <div class="register-container flex items-center justify-center h-screen w-screen overflow-hidden">
    <!-- 和登录完全统一：背景图 + 渐变遮罩 -->
    <div class="register-bg" aria-hidden="true"></div>
    <div class="register-overlay" aria-hidden="true"></div>

    <!-- 注册卡片 -->
    <div
      class="relative z-10 w-[500px] p-10 rounded-2xl border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
      <!-- 卡片装饰边角 -->
      <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50"></div>

      <!-- 头部标识 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white tracking-wider mb-2">创建新账号</h1>
        <p class="text-blue-400/60 text-sm">Join the Autonomous Vehicle Management System</p>
      </div>

      <!-- 注册表单 -->
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top"
        class="register-form">
        <el-form-item prop="username">
          <template #label>
            <span class="text-white/70 text-sm">账号</span>
          </template>
          <el-input v-model="registerForm.username" placeholder="请设置登录账号" prefix-icon="User" class="custom-input" />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item prop="password">
            <template #label>
              <span class="text-white/70 text-sm">密码</span>
            </template>
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
              show-password class="custom-input" />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <template #label>
              <span class="text-white/70 text-sm">确认密码</span>
            </template>
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入"
              prefix-icon="CircleCheck" show-password class="custom-input" />
          </el-form-item>
        </div>

        <el-form-item prop="email">
          <template #label>
            <span class="text-white/70 text-sm">电子邮箱</span>
          </template>
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="Message" class="custom-input" />
        </el-form-item>

        <el-form-item prop="agree">
          <el-checkbox v-model="registerForm.agree" class="custom-checkbox">
            <span class="text-white/60 text-xs">我已阅读并同意 <a href="#" class="text-blue-400">《服务协议》</a> 与 <a href="#"
                class="text-blue-400">《隐私政策》</a></span>
          </el-checkbox>
        </el-form-item>

        <el-button type="primary"
          class="w-full h-12 text-lg font-bold tracking-widest uppercase mt-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          :loading="loading" @click="handleRegister">
          立即注册
        </el-button>

        <div class="text-center mt-6">
          <span class="text-white/40 text-xs">已有账号？</span>
          <router-link to="/login" class="text-blue-400 text-xs font-bold hover:underline ml-1">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userApi } from '@/services/user';
import { User, Lock, Message, CircleCheck } from '@element-plus/icons-vue';
// 和login共用同一张背景图
import loginBg from '@/assets/login.png';
const loginBgUrl = `url(${loginBg})`;

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);
import md5 from 'md5';

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  agree: false
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }, { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  agree: [{
    validator: (rule, value, callback) => {
      if (!value) callback(new Error('请阅读并同意协议'));
      else callback();
    },
    trigger: 'change'
  }]
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  try {
    const valid = await registerFormRef.value.validate();
    if (valid) {
      loading.value = true;
      const res = await userApi.register({
        username: registerForm.username,
        password: md5(registerForm.password),
        confirmPassword: md5(registerForm.confirmPassword),
        email: registerForm.email
      });
      console.log(res, '注册结果');
      if (res.code === 200) {
        ElMessage.success('注册成功！正在为您跳转到登录页...');
        router.push('/login');
        loading.value = false;
      } else {
        ElMessage.error(res.msg || '注册失败');
      }
    }
  } catch (error) {
    console.error('注册验证失败', error);
    ElMessage.error(error.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-container {
  position: relative;
}

/* 和登录页完全一致背景 */
.register-bg {
  position: absolute;
  inset: 0;
  background-image: v-bind(loginBgUrl);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.register-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(10, 15, 35, 0.55) 0%,
      rgba(10, 20, 50, 0.35) 50%,
      rgba(5, 10, 25, 0.5) 100%);
  pointer-events: none;
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

:deep(.custom-checkbox) {
  .el-checkbox__inner {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);

    &::after {
      border-color: #3b82f6;
    }
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .el-checkbox__label {
    padding-left: 8px;
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