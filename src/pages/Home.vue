<template>
  <MapSearchPanel :plugin-manager="pluginManager" :map-instance="mapInstance" />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAMapStore } from '@/stores/AMapStore.js'
import PluginManager from '@/utils/AMap/PluginManager.js'
import MapSearchPanel from '@/components/map-search/MapSearchPanel.vue'

const AMapStore = useAMapStore()
const pluginManager = ref(null)
const mapInstance = ref(null)

onMounted(async () => {
  try {
    await nextTick()

    const initContext = async () => {
      if (!(AMapStore.Amap && AMapStore.Amap.getMap)) {
        console.warn('AMapStore 中没有地图实例，请确保地图已初始化')
        return false
      }

      mapInstance.value = AMapStore.Amap.getMap()
      const AMap = await AMapStore.Amap.getAMap()
      pluginManager.value =
        AMapStore.pluginsManager || new PluginManager(mapInstance.value, AMap)

      if (!AMapStore.pluginsManager) {
        AMapStore.setPluginsManager(pluginManager.value)
      }
      return true
    }

    const ready = await initContext()
    if (!ready) {
      const tryInit = async () => {
        const ok = await initContext()
        if (!ok) setTimeout(tryInit, 500)
      }
      tryInit()
    }
  } catch (error) {
    console.error('初始化地图失败:', error)
  }
})

import { watch } from 'vue'
watch(
  () => [AMapStore.Amap, AMapStore.pluginsManager],
  async () => {
    if (!mapInstance.value || !pluginManager.value) {
      await nextTick()
      await (async () => {
        if (AMapStore.Amap && AMapStore.Amap.getMap) {
          mapInstance.value = AMapStore.Amap.getMap()
          const AMap = await AMapStore.Amap.getAMap()
          pluginManager.value = AMapStore.pluginsManager || new PluginManager(mapInstance.value, AMap)
          if (!AMapStore.pluginsManager) AMapStore.setPluginsManager(pluginManager.value)
        }
      })()
    }
  }
)
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
