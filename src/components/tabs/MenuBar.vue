<script setup>

import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../../stores/global'

const globalStore = useGlobalStore()
const activeMenu = ref("")


const onMenuChange = (m) => {
  activeMenu.value = m.id
}

onMounted(() => {
  activeMenu.value = globalStore.menuBarList[0].id
})
</script>

<template>
  <div class="h-full w-24 py-1 theme-active">
    <div @click="onMenuChange(m)"
      :class="`flex flex-col items-center rounded-sm  p-2 mx-1 hover:cursor-pointer ${activeMenu === m.id ? 'theme-tab-active' : ''}`"
      v-for="m in globalStore.menuBarList" :key="m.id">
      <div><i :class="`iconfont ${m.icon} text-2xl`"></i></div>
      <div class="text-[14px] text-center">{{ m.name }}</div>
    </div>
  </div>
</template>

<style scoped></style>