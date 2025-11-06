<script setup>
import { onMounted, ref, watch } from 'vue'
import CesiumMap from '@/utils/CesiumMap.js'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()
const cesiumMap = ref(null)
onMounted(() => {
  const token = '6634328493219d95572f0c985b2a3eac'
  const map = new CesiumMap('cesiumContainer', token)
  cesiumMap.value = map
  // 设置初始位置：香港湾仔
  map.setView(114.1672, 22.2783, 2100, 0, -90)

  // 移动事件
  // map.on('move', ({ lon, lat }) => {
  //   console.log('鼠标移动：', lon, lat)
  // })

  // 点击事件
  map.on('click', ({ lon, lat }) => {
    console.log('点击位置：', lon, lat)
  })

  // 拖动开始与结束
  map.on('dragStart', (e) => console.log('开始拖动', e))
  map.on('dragEnd', (e) => console.log('结束拖动', e))

  // 监听缩放变化
  map.on('zoomChange', (height) => {
    console.log('当前相机高度：', height)
  })

})

watch(() => globalStore.latitudeAndLongitude, (val) => {
  console.log('watch', val)
  if (val) {
    cesiumMap.value.setView(val[0], val[1], 2100, 0, -90)
  }
})
const location = () => {
  console.log('location')
  // cesiumMap.value.setView(114.1825, 22.2763, 3100)
}
</script>

<!-- ✅ 模板部分 -->
<template>
  <div class="relative w-full h-full">
    <!-- Cesium 容器，地图会渲染在这里 -->
    <div ref="cesiumContainer" id="cesiumContainer" class="w-full h-full"></div>

    <!-- 可选：顶部右侧的工具栏按钮 -->

    <div class="absolute top-10 right-10 flex items-center gap-4 py-1 px-2 bg-white text-[#9faeca] rounded-md">
      <i class="iconfont icon-ersanweiliandong text-xl hover:cursor-pointer" @click="location"></i>
      <!-- <i class="iconfont icon-tuceng"></i>
      <i class="iconfont icon-shuxing"></i>
      <i class="iconfont icon-ceju"></i>
      <i class="iconfont icon-huizhijuxing"></i>
      <i class="iconfont icon-shanchu"></i>
      <i class="iconfont icon-full-screen"></i> -->
    </div>

  </div>
</template>

<!-- ✅ 隐藏 Cesium 默认底部 logo 和版权信息 -->
<style>
.cesium-viewer-bottom {
  display: none !important;
}
</style>
