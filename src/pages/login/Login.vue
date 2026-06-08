<template>
  <div class="login-container flex items-center justify-center h-screen w-screen overflow-hidden">
    <div class="login-bg" aria-hidden="true"></div>
    <div class="login-overlay" aria-hidden="true"></div>

    <!-- 登录卡片 -->
    <div
      class="login-card relative z-10 w-[450px] p-10 rounded-2xl border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
      <!-- 卡片装饰边角 -->
      <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50"></div>

      <!-- 头部标识 -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <el-icon class="text-blue-400 text-3xl">
            <Van />
          </el-icon>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-wider mb-2">无人车管理系统</h1>
        <p class="text-blue-400/60 text-sm">Autonomous Vehicle Management System</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top" class="login-form"
        @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <template #label>
            <span class="text-white/70 text-sm">账号</span>
          </template>
          <el-input v-model="loginForm.username" placeholder="请输入账号" prefix-icon="User" class="custom-input" />
        </el-form-item>

        <el-form-item prop="password">
          <template #label>
            <span class="text-white/70 text-sm">密码</span>
          </template>
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password
            class="custom-input" />
        </el-form-item>

        <!-- 下面代码不变 -->
        <div class="flex items-center justify-between mb-8">
          <el-checkbox v-model="rememberMe" class="custom-checkbox">
            <span class="text-white/60 text-xs">记住密码</span>
          </el-checkbox>
          <router-link to="/forgot-password" class="text-blue-400/80 text-xs hover:text-blue-400 transition-colors">
            忘记密码？
          </router-link>
        </div>

        <el-button type="primary"
          class="w-full h-12 text-lg font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border-none"
          :loading="loading" @click="handleLogin">
          进入系统
        </el-button>

        <div class="text-center mt-6">
          <span class="text-white/40 text-xs">还没有账号？</span>
          <router-link to="/register" class="text-blue-400 text-xs font-bold hover:underline ml-1">立即注册</router-link>
        </div>
      </el-form>

      <!-- 底部版权 -->
      <div class="mt-10 text-center text-white/20 text-[10px] tracking-widest uppercase">
        © 2024 YUTU TECHNOLOGY. ALL RIGHTS RESERVED.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userApi } from '@/services/user';
import md5 from 'md5';
import loginBg from '@/assets/login.png';

const loginBgUrl = `url(${loginBg})`;
const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
});

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (valid) {
      loading.value = true;
      const res = await userApi.login({
        username: loginForm.username,
        password: md5(loginForm.password)
      });
      if (res.code === 200) {
        ElMessage.success('登录成功，欢迎进入系统');
        sessionStorage.setItem('casToken', res.data.token);
        sessionStorage.setItem('userName', JSON.stringify(res.data.userName));
        window.dispatchEvent(new Event('user-login'));
        router.push('/');
      } else {
        ElMessage.error(res.msg || '登录失败');
      }
    }
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
}

.login-bg {
  position: absolute;
  inset: 0;
  background-image: v-bind(loginBgUrl);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(10, 15, 35, 0.55) 0%,
      rgba(10, 20, 50, 0.35) 50%,
      rgba(5, 10, 25, 0.5) 100%);
  pointer-events: none;
}

.login-card {
  background: rgba(15, 23, 42, 0.45);
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
