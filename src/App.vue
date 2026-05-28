<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
</script>

<template>
  <el-config-provider :locale="zhCn">
    <ThemeSwitcher />
    <!-- 这里的 router-view 负责切换 登录页(Login) 和 系统主页(Home) -->
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
