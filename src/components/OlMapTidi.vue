<template>
  <div id="map" style="width:100%;height:100%"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { get as getProjection } from 'ol/proj'
import { createPlantLayer } from "../utils/createLayer"
import 'ol/ol.css'
import { authApi } from '@/services/auth'

const tk = '6634328493219d95572f0c985b2a3eac'

// 获取中国境内实时飞机
async function getChinaPlanes() {
  try {
    const res = await fetch(`/api/states/all?lamin=18&lomin=73&lamax=54&lomax=135`)
    const data = await res.json()
    console.log('中国境内飞机：', data.states)
    return data.states
  } catch (err) {
    console.error('失败', err)
  }
}

const initMap = async () => {
  // 1. 天地图矢量底图 + 注记
  const vecLayer = new TileLayer({
    source: new XYZ({
      url: `https://t{0-7}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles&tk=${tk}`,
      tilePixelRatio: 1,
      projection: getProjection('EPSG:4326')
    })
  })

  const cvaLayer = new TileLayer({
    source: new XYZ({
      url: `https://t{0-7}.tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles&tk=${tk}`,
      tilePixelRatio: 1,
      projection: getProjection('EPSG:4326')
    })
  })

  // 2. 初始化地图 —— 【佛山中心点标】
  const map = new Map({
    target: 'map',
    layers: [vecLayer, cvaLayer],
    view: new View({
      projection: 'EPSG:4326',
      // 佛山核心坐标：经度, 纬度
      center: [113.1315, 23.0268],
      // 佛山合适缩放级别
      zoom: 15,
    })
  })
  const l = await createPlantLayer()
  map.addLayer(l)
}

onMounted(() => {
  initMap()
  getChinaPlanes()
})
</script>