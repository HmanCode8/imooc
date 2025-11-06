<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map.js'
import OSM from 'ol/source/OSM.js'
import TileLayer from 'ol/layer/Tile.js'
import View from 'ol/View.js'
import { fromLonLat } from 'ol/proj.js'
import ScaleLine from 'ol/control/ScaleLine.js'
import Zoom from 'ol/control/Zoom.js'
import { MousePosition } from 'ol/control.js'
import { createStringXY } from 'ol/coordinate.js'
import WMTS from 'ol/source/WMTS'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4.js'
import { get as getProjection } from 'ol/proj'
import WMTSTileGrid from 'ol/tilegrid/WMTS'


const serviceConfig = {
  type: 'WMTS',
  view_config: {
    // center: [120.15648234, 33.35160457],
    zoom: 16,
    projection: {
      code: 'EPSG:4490',
      definition: '+proj=longlat +ellps=GRS80 +no_defs'
    },
    extent: {
      xmin: 116.10358013377254,
      ymin: 30.710719079012677,
      xmax: 122.09030402444137,
      ymax: 35.21265930204362
    }
  },
  layer_config: {
    url: 'https://jiangsu.tianditu.gov.cn/historyraster/rest/services/historyVector/js_sldt_blue/MapServer/WMTS',
    layer: 'historyVector_js_sldt_blue',
    matrixSet: 'default',
    format: 'image/png',
    style: 'default',
    origin: [-180, 90],
    resolutions: [
      1.406250026231578, 0.703125013115789, 0.3515625065578945, 0.17578125327894775,
      0.08789062663947399, 0.043945313319736994, 0.021972656659868472, 0.010986328329934226,
      0.005493164164967124, 0.0027465820824835504, 0.0013732910412417797, 0.0006866455206208899,
      0.0003433227603104438, 0.0001716613801552224, 0.00008583069007761132,
      0.00004291534503880566, 0.000021457672519402802, 0.000010728836259701401,
      0.000005364418129850712, 0.000002682209064925356, 0.000001341104532462678
    ]
  }
}
const proJectConfig = (projection) => {
  proj4.defs(projection?.code, projection?.definition)
  register(proj4)
  return getProjection(projection?.code)
}
/**
 * 创建 WMTS 图层
 */
const createWMTSLayer = () => {
  const { view_config, layer_config } = serviceConfig
  const projection = proJectConfig(view_config.projection)
  const extent = [
    view_config.extent.xmin,
    view_config.extent.ymin,
    view_config.extent.xmax,
    view_config.extent.ymax
  ]
  const layer = new TileLayer({
    source: new WMTS({
      url: layer_config.url,
      layer: layer_config.layer,
      matrixSet: layer_config.matrixSet,
      style: layer_config.style,
      format: layer_config.format,
      projection: projection,
      tileGrid: new WMTSTileGrid({
        extent: extent,
        origin: layer_config?.origin,
        resolutions: layer_config?.resolutions,
        matrixIds: layer_config?.resolutions?.map((_, i) => i.toString())
      })
    })
  })
  return {
    layer,
    projection
  }
}
const mapContainer = ref < HTMLDivElement | null > (null)

onMounted(() => {
  // 创建地图视图
  const { layer, projection } = createWMTSLayer()


  const centerX = (serviceConfig.view_config.extent?.xmin + serviceConfig.view_config.extent?.xmax) / 2
  const centerY = (serviceConfig.view_config.extent?.ymin + serviceConfig.view_config.extent?.ymax) / 2
  const view = new View({
    projection: projection,
    center: [centerX, centerY],
    zoom: serviceConfig.view_config.zoom,
    minZoom: 1,
    maxZoom: 20
  })
  // 初始化地图
  const map = new Map({
    target: mapContainer.value!,
    layers: [layer],
    controls: [],
    view
  })


  // ✅ 缩放控件
  // const zoomControl = new Zoom()
  // map.addControl(zoomControl)

  // ✅ 比例尺控件
  const scaleLineControl = new ScaleLine({
    units: 'metric',
    minWidth: 100,
    className: 'custom-scale-line absolute bottom-10 left-10'
  })
  map.addControl(scaleLineControl)

  // ✅ 鼠标位置控件
  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position absolute bottom-20 left-40',
  })
  map.addControl(mousePositionControl)

})
</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="mapContainer" class="w-full h-full"></div>
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

<style scoped>
.custom-mouse-position {
  font-size: 12px;
  font-weight: bold;
  color: #000;
  background-color: #fff;
  padding: 5px;
  border-radius: 3px;
}
</style>
