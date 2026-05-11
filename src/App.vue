<script setup >
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import Home from "./pages/Home.vue";
</script>

<template>
   <el-config-provider :locale="zhCn">
  <ThemeSwitcher />
  <!-- <router-view /> -->
  <Home />
   </el-config-provider>
</template>

<style scoped></style>
