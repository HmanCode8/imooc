<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import { useGlobalStore } from "../stores/global";

const router = useRouter();
const route = useRoute();
const globalStore = useGlobalStore();

// 根据当前路由判断激活的子菜单
const activeMenu = computed(() => {
  return route.path;
});

const onMenuChange = (m) => {
  if (m.path) {
    router.push(m.path);
  }
};
</script>

<template>
  <div class="h-full w-full theme-primary p-2">
    <div
      v-for="m in globalStore.menuBarList"
      :key="m.id"
      @click="onMenuChange(m)"
      :class="`flex flex-col items-center rounded-sm p-2 hover:cursor-pointer ${activeMenu === m.path ? 'theme-bg scale-105 shadow-lg shadow-blue-500/20' : ' theme-text-color'}`"
    >
      <i :class="`iconfont ${m.icon} font-bold text-3xl`"></i>
      <div class="text-center leading-tight text-sm">
        {{ m.name }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
