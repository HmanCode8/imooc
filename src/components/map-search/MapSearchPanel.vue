<template>
  <div
    class="absolute top-10 left-10 w-1/4 min-w-[320px] text-[14px] z-20 bg-white/95 backdrop-blur-md rounded-md shadow-lg">
    <el-tabs v-model="activeTab" stretch class="px-4">
      <el-tab-pane label="地点搜索" name="poi" />
      <el-tab-pane label="路线规划" name="route" />
    </el-tabs>

    <div class="p-4">
      <PoiSearchPanel v-if="activeTab === 'poi'" :plugin-manager="pluginManager" :map-instance="mapInstance" />
      <RoutePlannerPanel v-else :plugin-manager="pluginManager" :map-instance="mapInstance" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PoiSearchPanel from './PoiSearchPanel.vue'
import RoutePlannerPanel from './RoutePlannerPanel.vue'

defineProps({
  pluginManager: {
    type: Object,
    required: false,
    default: null,
  },
  mapInstance: {
    type: Object,
    required: false,
    default: null,
  },
})

const activeTab = ref('poi')
</script>
