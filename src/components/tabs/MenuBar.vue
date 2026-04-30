<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue';
import { useGlobalStore } from '../../stores/global'

const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

// 根据当前路由判断激活的子菜单
const activeMenu = computed(() => {
  return route.path
})

const onMenuChange = (m) => {
  if (m.path) {
    router.push(m.path)
  }
}
</script>

<template>
  <div class="h-full w-24 py-1 theme-active border-r border-white/10">
    <div 
      v-for="m in globalStore.menuBarList" 
      :key="m.id"
      @click="onMenuChange(m)"
      :class="`flex flex-col items-center rounded-lg p-2 mx-2 my-2 transition-all duration-300 hover:cursor-pointer ${activeMenu === m.path ? 'theme-tab-active scale-105 shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`"
    >
      <div class="mb-1"><i :class="`iconfont ${m.icon} text-2xl`"></i></div>
      <div class="text-[12px] text-center leading-tight">{{ m.name }}</div>
    </div>
  </div>
</template>

<style scoped></style>