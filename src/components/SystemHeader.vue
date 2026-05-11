<template>
  <div
    class="relative h-full w-full theme-bg flex justify-between items-center px-2 text-white"
  >
    <div class="flex items-center">
      <div class="pl-4 text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-100 bg-clip-text text-transparent">
        {{ systemTitle }}
      </div>
    </div>

    <div class="flex items-center h-full gap-2">
      <div
        v-for="m in menuList"
        :key="m.id"
        @click="onMenuChage(m)"
        class="relative h-full flex items-center justify-center px-6 cursor-pointer transition-all duration-300"
      >
        <!-- 激活：底部高亮线 -->
        <div
          v-if="activeMenu === m.id"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[3px] bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full shadow-lg"
        ></div>

        <!-- 激活：顶部弱光条 -->
        <div
          v-if="activeMenu === m.id"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full"
        ></div>

        <!-- 文字：激活时发光 + 放大 -->
        <span
          class="relative z-10 text-lg font-medium transition-all duration-300"
          :class="
            activeMenu === m.id
              ? 'text-white scale-105 shadow-text'
              : 'text-white/70 hover:text-white hover:scale-105'
          "
        >
          {{ m.name }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-4 text-white/85">
      <div class="cursor-pointer hover:text-white transition-colors" @click="goHome">
        <el-icon size="18"><HomeFilled /></el-icon>
      </div>
      <div class="cursor-pointer hover:text-white transition-colors" @click="openSettings">
        <el-icon size="18"><Setting /></el-icon>
      </div>
      <div class="cursor-pointer hover:text-white transition-colors" @click="openNotifications">
        <el-icon size="18"><Bell /></el-icon>
      </div>
      <div class="h-5 w-px bg-white/20"></div>
      <div class="flex items-center gap-2">
        <el-icon size="18" class="text-white/70"><User /></el-icon>
        <span class="text-sm text-white/90">欢迎您！{{ userName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import { menuList } from "../mock/menu";

const router = useRouter();
const systemTitle = ref(
  window.global_config?.system?.title || "大数据可视化展平台",
);
const activeMenu = ref("onemap");
const userName = ref(sessionStorage.getItem("username") || "admin");
const globalStore = useGlobalStore();

const onMenuChage = (m) => {
  activeMenu.value = m.id;
  globalStore.setMenuBarList(m.children);
  if (m.children && m.children.length > 0) {
    router.push(m.children[0].path);
  }
};

const goHome = () => { onMenuChage(menuList[0]); };
const openSettings = () => { globalStore.setThemeVisible(true); };
const openNotifications = () => { ElMessage.info("暂无通知"); };

onMounted(() => {
  onMenuChage(menuList[0]);
});
</script>

<style scoped>
.shadow-text {
  text-shadow: 0 0 8px rgba(52, 211, 252, 0.6);
}
</style>