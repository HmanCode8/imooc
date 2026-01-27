<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import MapManager from '@/utils/OLMap/mapManager.js'
import { useGlobalStore } from '@/stores/global'
import MapEventManager from '@/utils/OLMap/mapEventManager.js'
import { toLonLat, fromLonLat } from 'ol/proj.js'
import MapLayer from '@/utils/OLMap/mapLayer.js'


const K = 2100 * Math.pow(2, 16)
const heightToZoom = (h) => {
  if (!h || h <= 0) return undefined
  return Math.log2(K / h)
}
const globalStore = useGlobalStore()
const mapInstance = ref(null)

const tk = window.global_config.map.tiandituTK
let suppressUntil = 0

onMounted(() => {
  const manager = new MapManager('mapContainer', tk)
  manager.initMap(window.global_config.map.center)
  console.log('map init', manager.getMap())
  window.olMap = manager.getMap()
  const mapEvent = new MapEventManager(manager.getMap())
  // 初始化视图同步到全局（与 3D 保持一致）
  // 以当前 2D 初始化为准
  const view = manager.getMap().getView()
  const center = view.getCenter()
  const zoom = view.getZoom()
  // EPSG:3857 -> WGS84
  const [lon, lat] = toLonLat(center)
  globalStore.setLinkedView({ lon, lat, zoom, source: '2d' })
  // 监听鼠标移动事件
  mapEvent.on('move', (e) => {
    // console.log('鼠标经纬度：', e.coordinate)
    // console.log('像素坐标：', e.pixel)
  })
  // 点击
  mapEvent.on('click', (e) => {
    globalStore.setLatitudeAndLongitude(e.coordinate)
    console.log('点击位置：', e.coordinate, new MapLayer(manager.getMap()).createOverlay)
  })

  // 地图拖动
  // mapEvent.on('dragstart', (e) => console.log('开始拖动地图', e))
  // mapEvent.on('dragend', (e) => console.log('拖动结束', e))

  // 视图变化（中心/缩放） -> 写入全局，来源标记为 2d
  mapEvent.on('viewchange', ({ lon, lat, zoom }) => {
    if (Date.now() < suppressUntil) return
    globalStore.setLinkedView({ lon, lat, zoom, source: '2d' })
  })

  mapInstance.value = manager
})

// 当 3D 改变视图时，驱动 2D（来源为 3d 时应用）
watch(
  () => globalStore.linkedView,
  (v) => {
    if (!mapInstance.value) return
    if (v?.source === '3d' && v.lon != null && v.lat != null) {
      const view = mapInstance.value.getMap().getView()
      const center3857 = fromLonLat([v.lon, v.lat])
      console.log('center3857', center3857)
      // 抑制回写 200ms，避免循环
      suppressUntil = Date.now() + 200
      view.setCenter(center3857)
      const z = typeof v.zoom === 'number' ? v.zoom : heightToZoom(v.height)
      if (typeof z === 'number' && !Number.isNaN(z)) view.setZoom(z)
    }
  },
  { deep: true }
)

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
const tools = ref([
  {
    icon: 'icon-ersanweiliandong',
    title: '二三维联动',
    click: mapTypeChange,
  },
  {
    icon: 'icon-ersanweifenping',
    title: '分屏',
    click: onSplitScreen,
  },
  {
    icon: 'icon-tuceng',
    title: '图层',
  },
  {
    icon: 'icon-shuxing',
    title: '属性',
  },
  {
    icon: 'icon-ceju',
    title: '测距',
  },
  {
    icon: 'icon-huizhijuxing',
    title: '绘制矩形',
  },
  {
    icon: 'icon-shanchu',
    title: '删除',
  },
  {
    icon: 'icon-full-screen',
    title: '全屏',
  },
])
const toolsActives = ref([])
</script>

<template>
  <div class="relative w-full h-full">
    <div id="mapContainer" class="w-full h-full"></div>
    <div
      class="absolute top-10 right-10 flex items-center gap-4 justify-center py-1 px-2 bg-white text-[#9faeca] rounded-md">
      <i :class="`iconfont ${item.icon}  hover:text-blue-500 cursor-pointer ${toolsActives.includes(item.icon) ? 'text-blue-500' : ''}`"
        v-for="item in tools" :key="item.icon" @click="item.click ? item.click(item.icon) : null"></i>
    </div>
  </div>
</template>
