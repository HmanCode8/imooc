<template>
  <div
    class="relative h-full w-full theme-bg flex justify-between items-center px-6 text-white"
  >
    <div class="flex items-center">
      <div
        class="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center bg-white/10"
      >
        <i class="iconfont icon-cheliangyizhangtu text-2xl"></i>
      </div>
      <div class="pl-4 text-2xl font-bold tracking-wider italic">
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

    <div
      class="flex items-center gap-4 text-white/80 text-sm cursor-pointer hover:text-white transition-colors"
      @click="globalStore.setThemeVisible(true)"
    >
      <div class="flex flex-col items-end">
        <span class="font-mono">{{ currentDate }}</span>
        <span class="font-mono">{{ currentTime }}</span>
      </div>
      <div class="h-8 w-[1px] bg-white/20"></div>
      <span class="text-lg">主题</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useGlobalStore } from "@/stores/global";
import { menuList } from "../mock/menu";

const router = useRouter();
const systemTitle = ref(
  window.global_config?.system?.title || "大数据可视化展平台",
);
const activeMenu = ref("onemap");
const currentTime = ref("");
const currentDate = ref("");
const screenWidth = ref(0);

const globalStore = useGlobalStore();
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  currentDate.value = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
};

const onMenuChage = (m) => {
  activeMenu.value = m.id;
  globalStore.setMenuBarList(m.children);

  // 自动跳转到该模块下的第一个子页面
  if (m.children && m.children.length > 0) {
    router.push(m.children[0].path);
  }
};

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

let timer = null;

onMounted(() => {
  updateTime();
  updateScreenWidth();
  onMenuChage(menuList[0]);
  timer = setInterval(updateTime, 1000);
  window.addEventListener("resize", updateScreenWidth);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
  window.removeEventListener("resize", updateScreenWidth);
});
</script>

<!-- 所有样式都使用 Tailwind CSS 类，无需自定义 CSS -->
