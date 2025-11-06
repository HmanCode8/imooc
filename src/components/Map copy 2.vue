<script setup lang="ts">
import { onMounted, ref } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import WMTS from 'ol/source/WMTS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { get as getProjection } from 'ol/proj.js'
import { getTopLeft, getWidth } from 'ol/extent.js'
import { fromLonLat } from 'ol/proj'

const tk = '6634328493219d95572f0c985b2a3eac'

const getWMTSLayer = (url, layer, title, visible) => {
  const epsg = 'EPSG:4326';
  const projection = getProjection(epsg);
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  const length = 17;
  const resolutions = new Array(length);
  const matrixIds = new Array(length);
  for (let i = 0; i < length; i += 1) {
    const pow = Math.pow(2, i);
    resolutions[i] = size / pow;
    matrixIds[i] = i;
  }
  const source = new WMTS({
    name: '中国',
    url: url,
    layer: layer,
    style: 'default',
    crossOrigin: 'anonymous',
    matrixSet: 'c',
    format: 'tiles',
    wrapX: true,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions,
      matrixIds,
    }),
  });
  const tileLayer = new TileLayer({
    title: title,
    source,
    visible: visible,
  });
  return tileLayer;
}

// 你的天地图key
onMounted(() => {

  // 天地图投影是 EPSG:4326 或 EPSG:3857（注意匹配 URL 中的 TILEMATRIXSET）
  const layer = getWMTSLayer('http://t0.tianditu.gov.cn/vec_c/wmts?tk=' + tk, 'vec', 'title', true)
  const layer1 = getWMTSLayer('http://t0.tianditu.gov.cn/cva_c/wmts?tk=' + tk, 'cva', 'title', true)
  // 创建天地图影像图层


  // 加载地图

  const map = new Map({
    target: 'mapContainer',
    layers: [layer, layer1],
    view: new View({
      center: [116.4074, 39.9042], // 经纬度原样
      zoom: 8,
      projection: 'EPSG:4326',
    }),
  })
})

</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="mapContainer" id="mapContainer" class="w-full h-full"></div>
    <div class="absolute top-10 hover:cursor-pointer   right-10 flex gap-2 p-2 bg-white rounded-md">
      <el-icon :title="$t('map.controls.fullscreen')">
        <FullScreen class="text-[#000]" />
      </el-icon>
      <el-icon :title="$t('map.controls.layer')">
        <Position class="text-[#000]" />
      </el-icon>
      <el-icon :title="$t('he')">
        <Location class="text-[#000]" />
      </el-icon>
      <el-icon>
        <Box class="text-[#000]" />
      </el-icon>
      <el-icon>
        <FullScreen class="text-[#000]" />
      </el-icon>
      <el-icon>
        <Position class="text-[#000]" />
      </el-icon>
      <el-icon>
        <Location class="text-[#000]" />
      </el-icon>
      <el-icon>
        <Box class="text-[#000]" />
      </el-icon>
    </div>
  </div>
</template>

<style></style>
