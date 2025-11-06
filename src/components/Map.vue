<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import MapManager from '@/utils/mapManager.js'
import { useGlobalStore } from '@/stores/global'
import MapEventManager from '@/utils/mapEventManager.js'
const globalStore = useGlobalStore()
const mapInstance = ref(null)

const tk = '6634328493219d95572f0c985b2a3eac'

onMounted(() => {
  const manager = new MapManager('mapContainer', tk)
  manager.initMap()
  const mapEvent = new MapEventManager(manager.getMap())
  // 监听鼠标移动事件
  mapEvent.on('move', (e) => {
    // console.log('鼠标经纬度：', e.coordinate)
    // console.log('像素坐标：', e.pixel)
  })
  // 点击
  mapEvent.on('click', (e) => {
    globalStore.setLatitudeAndLongitude(e.coordinate)

    console.log('点击位置：', e.coordinate)
  })

  // 地图拖动
  mapEvent.on('dragstart', (e) => console.log('开始拖动地图', e))
  mapEvent.on('dragend', (e) => console.log('拖动结束', e))

  mapInstance.value = manager
})

onUnmounted(() => {
  mapInstance.value.mapEvent.cleanup()
})
const mapTypeChange = () => {
  const type = mapInstance.value?.getMapType()
  mapInstance.value?.switchBaseLayer(type === 'image' ? 'vector' : 'image')
}

const onSplitScreen = () => {
  globalStore.setSplitScreen(!globalStore.isSplitScreen)
  console.log('分屏状态:', globalStore.isSplitScreen)
}
</script>

<template>
  <div class="relative w-full h-full">
    <div id="mapContainer" class="w-full h-full"></div>
    <div
      class="absolute top-10 right-10 flex items-center gap-4 justify-center py-1 px-2 bg-white text-[#9faeca] rounded-md">
      <i class="iconfont icon-ersanweiliandong text-xl hover:text-blue-500 cursor-pointer" @click="mapTypeChange"></i>
      <i class="iconfont icon-ersanweifenping text-xl hover:text-blue-500 cursor-pointer" @click="onSplitScreen"></i>
      <i class="iconfont icon-tuceng "></i>
      <i class="iconfont icon-shuxing"></i>
      <i class="iconfont icon-ceju"></i>
      <i class="iconfont icon-huizhijuxing"></i>
      <i class="iconfont icon-shanchu"></i>
      <i class="iconfont icon-full-screen"></i>
    </div>
  </div>
</template>
