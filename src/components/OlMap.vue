<template>
  <div id="map" class="map relative"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import "ol/ol.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { authApi } from '@/services/auth'
import { defaults as defaultControls, MousePosition } from "ol/control.js";
import { createStringXY } from "ol/coordinate.js";
import { useMapServices } from "../hooks/useMapServices.js";
import { mapInstanceManager } from "../hooks/useMapInstance.js";

import _ from 'lodash'

const props = defineProps({
  mapType: {
    type: String,
  },

})


const mapType = ref(window.global_config.map.mapType)
watch(() => props.mapType, (newVal, oldVal) => {
  console.log('props.mapType', newVal)
  mapType.value = newVal
})
// 使用地图实例管理 hook
// 使用地图实例管理类
// 注意：不要解构方法，保持 this 上下文

// 图层缓存管理
const layerCache = {} // 存储已创建的图层 {arcgis: layer, xyz: layer, ...}
const userSecretKey = ref(null) // 缓存的用户秘钥

// 获取用户秘钥（只获取一次）
const getUserSecretKeyFn = async () => {
  if (userSecretKey.value) {
    return userSecretKey.value
  }

  try {
    const res = await authApi.getUserSecretKey()
    if (res.ReturnCode === 0) {
      userSecretKey.value = res.Data
      return userSecretKey.value
    } else {
      throw new Error('获取用户秘钥失败')
    }
  } catch (error) {
    console.error('获取用户秘钥异常:', error)
    throw error
  }
}

// 获取基础地图URL（只获取一次）
const getBaseMapUrl = async (mType) => {
  const cacheKey = `baseMap_${mType}`

  if (layerCache[cacheKey]) {
    return layerCache[cacheKey]
  }

  try {
    const ak = await getUserSecretKeyFn()
    const res = await authApi.getBaseMap({ syskey: window.global_config.system.clientId })

    if (res.ReturnCode === 0) {
      const { Data } = res

      const mtMap = window.global_config.map.mpaKeys

      const baseMapItem = _.find(Data, d => d.basemaptype === mtMap[mType])

      if (!baseMapItem) {
        throw new Error(`未找到${mType}对应的基础地图配置，basemaptype: ${mtMap[mType]}`)
      }

      const baseMapId = _.get(baseMapItem, 'resourceid')

      const url = `${window.global_config.system.arcgisServerUrl}/MapService/${baseMapId}/${ak}`
      const baseMapUrl = window.global_config.map[mType].type === 'XYZ' ? url : `${url}/export`

      // 缓存URL
      layerCache[cacheKey] = baseMapUrl
      return baseMapUrl
    } else {
      throw new Error('获取基础地图失败')
    }
  } catch (error) {
    console.error('获取基础地图异常:', error)
    throw error
  }
}

// 创建或获取图层
const getOrCreateLayer = async (mType) => {
  // 直接使用 mType 作为缓存键
  if (layerCache[mType]) {
    return layerCache[mType]
  }

  try {
    const configMap = window.global_config.map || {}
    const { createLayerByType } = useMapServices()

    // 对于需要网络请求的图层类型，先获取URL
    if (mType !== 'wmts') {
      const baseMapUrl = await getBaseMapUrl(mType)

      // 更新配置中的URL
      if (configMap[mType]) {
        configMap[mType].layer_config.url = baseMapUrl
      } else {
        console.warn(`未找到${mType}的配置`)
      }
    }

    const currentConfig = configMap[mType]
    if (!currentConfig) {
      throw new Error(`未找到${mType}的配置`)
    }

    const layerResult = await createLayerByType(currentConfig)
    if (!layerResult) {
      throw new Error(`创建${mType}图层失败`)
    }

    // 缓存图层，使用 mType 作为键
    layerCache[mType] = layerResult
    return layerResult
  } catch (error) {
    console.error(`创建${mType}图层异常:`, error)
    throw error
  }
}

// 初始化地图
const initMap = async () => {
  try {
    console.log('开始初始化地图...')
    const configMap = window.global_config.map || {}

    // 获取默认图层
    const defaultLayerResult = await getOrCreateLayer(mapType.value)
    const { layer: defaultLayer, projection } = defaultLayerResult

    // 获取默认配置
    const currentConfig = configMap[mapType.value]
    if (!currentConfig) {
      throw new Error(`未找到${mapType.value}的配置`)
    }

    // 计算中心点
    const { xmin, xmax, ymin, ymax } = currentConfig.view_config.extent
    const centerX = (xmin + xmax) / 2
    const centerY = (ymin + ymax) / 2

    // 创建地图视图
    const view = new View({
      projection: projection,
      center: [centerX, centerY],
      zoom: currentConfig.view_config.zoom,
      minZoom: 1,
      maxZoom: 20
    })

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(2),
      projection: projection,
      className: "custom-mouse-position position right-1/4 z-10",
      target: document.getElementById("mouse-position"),
      undefinedHTML: "&nbsp;"
    });

    // 创建地图实例
    const map = new Map({
      target: "map",
      layers: [defaultLayer],
      view: view,
      controls: defaultControls().extend([mousePositionControl])
    })

    // 使用类设置地图实例
    mapInstanceManager.setMapInstance(map)

    mapInstanceManager.updateMapState({
      currentMapType: mapType.value,
      layers: [defaultLayer],
      view: view
    })

  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

// 切换地图类型
const switchMapType = async (newMapType) => {
  if (!mapInstanceManager.isMapReady()) {
    return
  }

  try {

    // 隐藏所有已缓存的图层
    Object.keys(layerCache).forEach(mapTypeKey => {
      const cachedLayer = layerCache[mapTypeKey]
      if (cachedLayer && cachedLayer.layer) {
        cachedLayer.layer.setVisible(false)
      }
    })

    // 获取或创建新图层
    const newLayerResult = await getOrCreateLayer(newMapType)
    const { layer: newLayer } = newLayerResult

    // 检查新图层是否已经在地图中
    const existingLayers = mapInstanceManager.getLayers()
    const isLayerInMap = existingLayers.some(layer => layer === newLayer)

    if (!isLayerInMap) {
      // 如果图层不在地图中，添加到地图
      mapInstanceManager.getMapInstance().addLayer(newLayer)
    }

    // 显示新图层
    newLayer.setVisible(true)

    // 更新当前地图类型
    mapType.value = newMapType
    console.log(`地图切换完成: ${newMapType}`)
  } catch (error) {
    console.error(`切换地图类型失败: ${newMapType}`, error)
  }
}

// 监听地图类型变化
watch(mapType, (newType, oldType) => {
  if (oldType && newType !== oldType) {
    switchMapType(newType)
  }
}, { immediate: true })

// 组件挂载时初始化地图
onMounted(async () => {
  await initMap()
})
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
