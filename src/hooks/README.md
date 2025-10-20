# 地图服务 Hooks 使用指南

## 概述

本项目提供了三个核心的地图管理 hooks，用于管理地图服务和叠加图层：

1. **useMapServices** - 地图服务管理
2. **useOverlayLayers** - 叠加图层管理
3. **useMapManager** - 综合地图管理

## 1. useMapServices - 地图服务管理

### 功能特性

- 支持多种服务类型：WMTS、WMS、XYZ、ArcGIS REST
- 统一的服务切换接口
- 自动图层创建和管理

### 使用方法

```javascript
import { useMapServices } from '@/hooks/useMapServices.js'

const {
  currentServiceType,
  currentServiceConfig,
  switchMapService,
  createLayerByType,
  getAvailableServices,
  getServicesByType
} = useMapServices()

// 切换地图服务
switchMapService(map, 'OSM') // 切换到 OpenStreetMap

// 获取所有可用服务
const services = getAvailableServices()

// 根据类型获取服务
const wmtsServices = getServicesByType('WMTS')
```

### 支持的服务类型

| 类型        | 说明                 | 示例                    |
| ----------- | -------------------- | ----------------------- |
| WMTS        | Web Map Tile Service | 天地图、ArcGIS WMTS     |
| WMS         | Web Map Service      | GeoServer WMS           |
| XYZ         | 标准瓦片服务         | OpenStreetMap、高德地图 |
| ARCGIS_REST | ArcGIS REST 服务     | ArcGIS Online 服务      |

## 2. useOverlayLayers - 叠加图层管理

### 功能特性

- 图层添加/移除
- 可见性控制
- 透明度调节
- 图层分组管理
- 层级控制

### 使用方法

```javascript
import { useOverlayLayers } from '@/hooks/useOverlayLayers.js'

const {
  addOverlayLayer,
  removeOverlayLayer,
  toggleLayerVisibility,
  setLayerOpacity,
  createLayerGroup,
  toggleGroupVisibility
} = useOverlayLayers()

// 添加叠加图层
const layerId = addOverlayLayer(map, layer, {
  id: 'my-layer',
  name: '我的图层',
  type: 'vector',
  group: 'overlays',
  opacity: 0.8,
  visible: true
})

// 切换图层可见性
toggleLayerVisibility(layerId)

// 设置图层透明度
setLayerOpacity(layerId, 0.5)

// 创建图层组
createLayerGroup('overlays', {
  visible: true,
  opacity: 0.8
})

// 切换图层组可见性
toggleGroupVisibility('overlays')
```

## 3. useMapManager - 综合地图管理

### 功能特性

- 整合地图服务和叠加图层管理
- 地图状态监控
- 视图管理
- 统一的管理接口

### 使用方法

```javascript
import { useMapManager } from '@/hooks/useMapManager.js'

const {
  initMapManager,
  destroyMapManager,
  switchMapService,
  addOverlayLayer,
  addServiceOverlay,
  setMapView,
  mapStatus,
  availableServices,
  currentOverlayLayers
} = useMapManager()

// 初始化地图管理器
initMapManager(map)

// 切换地图服务
switchMapService('arcgisSample') // 切换到 ArcGIS 服务

// 添加服务作为叠加层
const layerId = addServiceOverlay('arcgisSample', {
  name: 'ArcGIS 叠加层',
  opacity: 0.7,
  visible: true
})

// 设置地图视图
setMapView({
  center: [120.0, 32.0],
  zoom: 10
})

// 监听地图状态
watch(mapStatus, (status) => {
  console.log('地图状态:', status)
  console.log('当前服务:', status.currentService)
  console.log('叠加层数量:', status.overlayCount)
})
```

## 4. 在组件中使用

### OlMap 组件示例

```vue
<template>
  <div class="map-container">
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- 服务切换按钮 -->
    <div class="map-controls">
      <button @click="switchToOSM">OpenStreetMap</button>
      <button @click="switchToAMAP">高德地图</button>
      <button @click="addOverlayLayer">添加叠加层</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMapManager } from '@/hooks/useMapManager.js'

const mapContainer = ref(null)
let map = null

const { initMapManager, switchMapService, addServiceOverlay, mapStatus } = useMapManager()

onMounted(() => {
  // 初始化地图
  map = new Map({
    target: mapContainer.value
    // ... 其他配置
  })

  // 初始化地图管理器
  initMapManager(map)
})

// 切换服务
const switchToArcGIS = () => {
  switchMapService('arcgisSample')
}

// 添加叠加层
const addOverlayLayer = () => {
  addServiceOverlay('arcgisSample', {
    name: 'ArcGIS 叠加层',
    opacity: 0.7
  })
}
</script>
```

## 5. 配置扩展

### 添加新的服务类型

在 `public/config.dev.js` 中添加新的服务配置：

```javascript
window.global_config = {
  map: {
    services: {
      // 现有配置...

      // 新的服务类型
      customService: {
        type: 'XYZ',
        title: '自定义服务',
        description: '自定义地图服务',
        url: 'https://your-service.com/{z}/{x}/{y}.png',
        projection: 'EPSG:3857',
        maxZoom: 18,
        minZoom: 0
      }
    }
  }
}
```

### 扩展服务创建器

在 `useMapServices.js` 中添加新的服务类型支持：

```javascript
// 创建自定义服务图层
const createCustomLayer = (serviceConfig) => {
  // 自定义图层创建逻辑
  return new CustomLayer({
    // 配置参数
  })
}

// 在 createLayerByType 中添加新的 case
const createLayerByType = (serviceConfig) => {
  const { TYPE } = serviceConfig

  switch (TYPE) {
    case 'WMTS':
      return createWMTSLayer(serviceConfig)
    case 'WMS':
      return createWMSLayer(serviceConfig)
    case 'XYZ':
      return createXYZLayer(serviceConfig)
    case 'ARCGIS_REST':
      return createArcGISLayer(serviceConfig)
    case 'CUSTOM': // 新增
      return createCustomLayer(serviceConfig)
    default:
      console.warn(`不支持的服务类型: ${TYPE}`)
      return null
  }
}
```

## 6. 最佳实践

### 1. 服务切换

```javascript
// 推荐：使用统一的服务切换方法
switchMapService('arcgisSample')

// 避免：直接操作地图图层
map.getLayers().clear()
map.addLayer(newLayer)
```

### 2. 叠加图层管理

```javascript
// 推荐：使用图层管理器
const layerId = addOverlayLayer(layer, { name: 'My Layer' })
toggleLayerVisibility(layerId)

// 避免：直接操作图层
layer.setVisible(false)
```

### 3. 状态监控

```javascript
// 推荐：使用响应式状态
watch(mapStatus, (status) => {
  // 响应地图状态变化
})

// 避免：手动维护状态
let currentService = 'arcgisSample'
```

### 4. 内存管理

```javascript
// 推荐：在组件销毁时清理
onUnmounted(() => {
  destroyMapManager()
})

// 避免：忘记清理资源
// 可能导致内存泄漏
```

## 7. 故障排除

### 常见问题

1. **服务加载失败**

   - 检查服务 URL 是否正确
   - 确认服务类型配置是否正确
   - 检查网络连接和跨域设置

2. **图层不显示**

   - 检查图层可见性设置
   - 确认图层透明度不为 0
   - 检查图层层级设置

3. **性能问题**
   - 避免同时加载过多叠加层
   - 使用图层分组管理
   - 及时清理不需要的图层

### 调试技巧

```javascript
// 启用调试日志
console.log('当前服务:', mapStatus.value.currentService)
console.log('所有图层:', currentOverlayLayers.value)
console.log('可用服务:', availableServices.value)
```

## 8. 更新日志

- **v1.0.0** - 初始版本，支持 WMTS、WMS、XYZ、ArcGIS REST 服务
- **v1.1.0** - 添加叠加图层管理功能
- **v1.2.0** - 添加图层分组管理
- **v1.3.0** - 添加综合地图管理器
