<template>
  <div class="login-container flex items-center justify-center h-screen w-screen overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-[#0a0a12]">
      <div class="stars-bg absolute inset-0 opacity-30"></div>
      <div class="scan-line"></div>
      <div class="glow-effect absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div class="glow-effect absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative z-10 w-[450px] p-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
      <!-- 卡片装饰边角 -->
      <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50"></div>
      
      <!-- 头部标识 -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <el-icon class="text-blue-400 text-3xl"><Van /></el-icon>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-wider mb-2">无人车管理系统</h1>
        <p class="text-blue-400/60 text-sm">Autonomous Vehicle Management System</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item prop="username">
          <template #label>
            <span class="text-white/70 text-sm">账号</span>
          </template>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <template #label>
            <span class="text-white/70 text-sm">密码</span>
          </template>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="flex items-center justify-between mb-8">
          <el-checkbox v-model="rememberMe" class="custom-checkbox">
            <span class="text-white/60 text-xs">记住密码</span>
          </el-checkbox>
          <router-link
            to="/forgot-password"
            class="text-blue-400/80 text-xs hover:text-blue-400 transition-colors"
          >
            忘记密码？
          </router-link>
        </div>

        <el-button
          type="primary"
          class="w-full h-12 text-lg font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border-none"
          :loading="loading"
          @click="handleLogin"
        >
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

    <!-- 装饰性背景图 (无人车) -->
    <div class="absolute right-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
      <img src="@/assets/car.png" alt="car" class="w-full object-contain translate-x-1/4 translate-y-1/4 rotate-[-10deg]" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userApi } from '@/services/user';
import md5 from 'md5';
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
      console.log(res,'登录结果');
      if (res.code === 200) {
        ElMessage.success('登录成功，欢迎进入系统');
        sessionStorage.setItem('casToken', res.data.token);
        sessionStorage.setItem('userName', JSON.stringify(res.data.userName));
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
  background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a12 100%);
  position: relative;
}

.stars-bg {
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 50px 160px, #fff, rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 80px 120px, #fff, rgba(0,0,0,0)),
    radial-gradient(1.5px 1.5px at 110px 210px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 150px 240px, #fff, rgba(0,0,0,0));
  background-size: 200px 250px;
  animation: stars-move 100s linear infinite;
}

@keyframes stars-move {
  from { background-position: 0 0; }
  to { background-position: 1000px 1000px; }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  animation: scan 4s linear infinite;
  z-index: 1;
}

@keyframes scan {
  0% { top: -10%; }
  100% { top: 110%; }
}

:deep(.custom-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    transition: all 0.3s;
    
    &:hover, &.is-focus {
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
