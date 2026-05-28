<template>
  <div
    class="relative h-full w-full theme-bg flex justify-between items-center px-2 text-white"
  >
    <div class="flex items-center">
      <!-- <div
        class="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center bg-white/10"
      >
        <i class="iconfont icon-cheliangyizhangtu text-2xl"></i>
      </div> -->
      <div class="pl-4 text-3xl font-bold  ">
        {{ systemTitle }}
      </div>
    </div>

    <div class="flex items-center h-full gap-4">
      <div
        v-for="m in menuList"
        :key="m.id"
        @click="onMenuChage(m)"
        class="relative h-[70%] flex items-center justify-center px-8 cursor-pointer transition-all duration-300 group"
      >
        <!-- 梯形背景 -->
        <div
          v-if="activeMenu === m.id"
          class="absolute inset-0 theme-active shadow-[0_0_15px_rgba(52,152,219,0.5)] border-t border-white/30"
          style="clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)"
        ></div>

        <!-- 悬浮时的梯形背景（半透明） -->
        <div
          v-else
          class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          style="clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)"
        ></div>

        <span
          class="relative z-10 text-xl font-bold transition-colors"
          :class="
            activeMenu === m.id
              ? 'text-white'
              : 'text-white/70 group-hover:text-white'
          "
        >
          {{ m.name }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-4 text-white/85">
      <div
        class="cursor-pointer hover:text-white transition-colors"
        title="首页"
        @click="goHome"
      >
        <el-icon size="18"><HomeFilled /></el-icon>
      </div>
      <div
        class="cursor-pointer hover:text-white transition-colors"
        title="设置"
        @click="openSettings"
      >
        <el-icon size="18"><Setting /></el-icon>
      </div>
      <div
        class="cursor-pointer hover:text-white transition-colors"
        title="通知"
        @click="openNotifications"
      >
        <el-icon size="18"><Bell /></el-icon>
      </div>
      <div class="h-5 w-px bg-white/20"></div>
      <div class="flex items-center gap-2">
        <el-icon size="18" class="text-white/70"><User /></el-icon>
        <span class="text-sm text-white/90">欢迎您！{{ userName }}</span>
      </div>
      <div class="h-5 w-px bg-white/20"></div>
      <div
        class="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
        title="退出登录"
        @click="handleLogout"
      >
        <el-icon size="18"><SwitchButton /></el-icon>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import { menuList } from "../mock/menu";

const router = useRouter();
const systemTitle = ref(
  window.global_config?.system?.title || "大数据可视化展平台",
);
const activeMenu = ref("onemap");
const userName = ref(JSON.parse(sessionStorage.getItem("userName")) || "admin");
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

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    sessionStorage.removeItem("casToken");
    sessionStorage.removeItem("userName");
    ElMessage.success("已退出登录");
    router.push("/login");
  });
};

onMounted(() => {
  onMenuChage(menuList[0]);
});
</script>

<style scoped>
.shadow-text {
  text-shadow: 0 0 8px rgba(52, 211, 252, 0.6);
}
</style>