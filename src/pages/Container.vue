<template>
  <div class=" relative flex flex-col h-screen">
    <!-- 系统头部 -->
    <SystemHeader />

    <!-- 主内容区域 -->
    <main class="flex-1 relative overflow-hidden z-10">
      <router-view />
      <div class="flex w-full h-full">
        <div class="flex-1">
          <Map />
        </div>
        <!-- <div :class="`${globalStore.isSplitScreen ? 'flex-1' : 'flex-0'}`">
          <CesiumViewer />
        </div> -->
      </div>
    </main>
    <!-- <div class=" absolute bottom-10 right-10 z-10 flex gap-2 items-center">
      <div class=" bg-[url('@//assets/maps/map2d.png')] w-20 h-14 bg-cover"></div>
      <div class=" bg-[url('@//assets/maps/map3d.png')] w-20 h-14 bg-cover"></div>
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SystemHeader from '@/components/SystemHeader.vue'
import CesiumViewer from '@/components/CesiumViewer.vue'
import Map from '@/components/Map.vue'
// import Map from '@/components/AMap.vue'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()
const { locale } = useI18n()

onMounted(() => {
  // 从本地存储恢复语言设置
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && ['zh-CN', 'zh-TW', 'en'].includes(savedLanguage)) {
    locale.value = savedLanguage
  }
})
</script>