<template>
  <div id="mapContainer" class="relative w-full h-full">

    <!-- <div class="style absolute top-10 left-10 z-10">
      <div class="text-black text-lg font-bold">地图切换</div>
      <el-select v-model="mapStyle" placeholder="请选择地图样式">
        <el-option v-for="item in mapStyles" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div> -->
    <div class=" absolute right-10 top-10 z-10" id="my-panel"></div>

    <!-- 地图切换 -->
    <!-- <div class=" absolute top-10 right-0 z-10 flex items-center">
      <div class="right-0 rounded-md p-2 shadow-2xl  bg-gray-600 mx-2 hover:cursor-pointer"
        @click="changeMapStyle(item.value)" v-for="item in mapStyles" :key="item.value" :label="item.label"
        :value="item.value">
        {{ item.label }}
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import AMapManager from "@/utils/AMap/AmapManager.js";
import { useAMapStore } from "@/stores/AMapStore.js";

const mapTager = ref(null)
const AMapStore = useAMapStore()

onMounted(async () => {
  const Amap = new AMapManager();
  const map = await Amap.initMap("mapContainer", {
    viewMode: '3D', //默认使用 2D 模式
    zoom: 15, //地图级别
    // rotateEnable: true, //是否可旋转
    // pitchEnable: true, //是否可倾斜
    // pitch: 75, //倾斜角度
    // // rotation: -15, //旋转角度
    // buildingAnimation: true, //楼块出现是否带动画
    // expandZoomRange: true, //是否支持缩放至范围外
    // center: [114.1672, 22.2783], //地图中心点
  })

  mapTager.value = map

  // 将地图管理器实例存储到 store，方便其他组件使用
  AMapStore.setMap(Amap)
  AMapStore.setPluginsManager(Amap.getPluginManager())
})

</script>
<style scoped></style>