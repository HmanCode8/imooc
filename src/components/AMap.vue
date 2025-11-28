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
import PluginManager from "@/utils/AMap/PluginManager.js";
import { useAMapStore } from "@/stores/AMapStore.js";

const mapStyles = ref([
  {
    label: '标准',
    value: 'normal'
  },
  {
    label: '马卡龙',
    value: 'macaron'
  },
  {
    label: '涂鸦',
    value: 'graffiti'
  },
  {
    label: '远山黛',
    value: 'whitesmoke'
  },
  {
    label: '幻影黑',
    value: 'dark'
  },
  {
    label: '草色青',
    value: 'fresh'
  },
  {
    label: '极夜蓝',
    value: 'darkblue'
  },
  {
    label: '靛青蓝',
    value: 'blue'
  },
  {
    label: '月光银',
    value: 'light'
  },
  {
    label: '雅士灰',
    value: 'grey'
  },

])
const mapStyle = ref('fresh')
const mapTager = ref(null)

const AMapStore = useAMapStore()

const changeMapStyle = (style) => {
  mapTager.value.setMapStyle(`amap://styles/${style}`)

}
const markerContent = `<div class=" relative ">
<img src="//a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png">
<div class=" absolute right-0 top-0 text-black" onclick="clearMarker()">X</div>
</div>`
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
  AMapStore.setMap(Amap)

})

</script>
<style scoped></style>