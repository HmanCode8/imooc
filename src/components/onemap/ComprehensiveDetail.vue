<template>
  <div
    v-if="globalStore.comprehensiveDetailVisible"
    class="w-[400px] h-fit bg-white rounded-lg shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 border border-gray-200 ml-2 mt-2"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white"
    >
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-4 theme-bg rounded-full"></div>
        <span class="font-bold text-gray-800 text-sm">{{
          globalStore.selectedComprehensiveItem?.name || "要素详情"
        }}</span>
      </div>
      <el-icon
        class="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors"
        @click="globalStore.setComprehensiveDetailVisible(false)"
      >
        <Close />
      </el-icon>
    </div>

    <!-- Content -->
    <div class="p-4 bg-gray-50/30">
      <div
        class="border border-gray-100 rounded overflow-hidden shadow-sm bg-white"
      >
        <table class="w-full text-xs">
          <tbody>
            <tr
              v-for="(val, label, index) in displayFields"
              :key="label"
              :class="index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'"
            >
              <td class="w-28 px-4 py-3 text-gray-500 border-r border-gray-100">
                {{ label }}
              </td>
              <td class="px-4 py-3 text-gray-800 font-medium">
                {{ val || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div
        class="mt-4 px-1 flex items-center justify-between text-[10px] text-gray-400"
      >
        <div class="flex items-center gap-1">
          <i class="iconfont icon-location text-[10px]"></i>
          <span
            >地理要素类型:
            {{ globalStore.selectedComprehensiveItem?.type }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Close } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global";

const globalStore = useGlobalStore();

const displayFields = computed(() => {
  const item = globalStore.selectedComprehensiveItem;
  if (!item) return {};

  const type = globalStore.activeComprehensiveType;

  if (type === "route" || type === "transition") {
    return {
      路段名称: item.name,
      路段编码: item.code,
      所属区域: item.region,
      所属镇街: item.street,
      长度: item.length,
    };
  } else if (type === "area") {
    return {
      区域名称: item.name,
      区域编码: item.code,
      所属行政区: item.region,
    };
  } else if (type === "parking") {
    return {
      停车场名称: item.name,
      类型: "公共停车场",
      状态: "运行中",
    };
  }
  return { 名称: item.name };
});
</script>

<style scoped>
.animate-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
