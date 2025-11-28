<script setup>
import { onMounted, ref, watch } from 'vue'
import CesiumMap from '@/utils/CesiumMap/CesiumMap.js'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()
const cesiumMap = ref(null)
let suppressUntil = 0
const K = 2100 * Math.pow(2, 16)
const zoomToHeight = (z) => K / Math.pow(2, z ?? 16)
onMounted(() => {
  const token = '6634328493219d95572f0c985b2a3eac'
  const map = new CesiumMap('cesiumContainer', token)
  cesiumMap.value = map
  // 初始视图：若全局已有 2D 初始化，则以全局为准，否则设定默认
  const v = globalStore.linkedView
  if (v && v.lon != null && v.lat != null) {
    map.setView(v.lon, v.lat, v.height ?? 2100, 0, -90)
  } else {
    map.setView(114.1672, 22.2783, 2100, 0, -90)
    globalStore.setLinkedView({ lon: 114.1672, lat: 22.2783, height: 2100, source: '3d' })
  }

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

  // 视图变化 -> 写入全局，来源 3d（中心+高度）
  map.on('viewChange', ({ lon, lat, height }) => {
    if (Date.now() < suppressUntil) return
    globalStore.setLinkedView({ lon, lat, height, source: '3d' })
  })

})

watch(() => globalStore.latitudeAndLongitude, (val) => {
  console.log('watch', val)
  if (val) {
    cesiumMap.value.setView(val[0], val[1], 2100, 0, -90)
  }
})

// 当 2D 改变视图时，驱动 3D（来源为 2d 时应用）
watch(
  () => globalStore.linkedView,
  (v) => {
    if (!cesiumMap.value) return
    if (v?.source === '2d' && v.lon != null && v.lat != null) {
      const map = cesiumMap.value
      suppressUntil = Date.now() + 200
      const height = typeof v.zoom === 'number' ? zoomToHeight(v.zoom) : (v.height ?? 2100)
      // 直接设置视图，避免飞行动画造成延迟
      map.setView(v.lon, v.lat, height, 0, -90)
    }
  },
  { deep: true }
)
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
