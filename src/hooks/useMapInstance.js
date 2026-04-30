/**
 * 地图实例管理类
 */
class MapInstanceManager {
  constructor() {
    // 地图实例
    this.mapInstance = null
    this.mapReady = false

    // 地图状态
    this.mapState = {
      currentMapType: 'arcgis',
      layers: [],
      view: null,
      isInitialized: false
    }
    this.historyServeice = 0
    // 叠加图层存储
    this.overlayLayers = []
  }
  /**
   * 设置地图实例
   */
  setMapInstance(map) {
    this.mapInstance = map
    this.mapReady = true
    this.mapState.isInitialized = true
    this.mapState.view = map.getView()
    this.mapState.layers = map.getLayers().getArray()
  }

  /**
   * 获取地图实例
   */
  getMapInstance() {
    return this.mapInstance
  }

  /**
   * 检查地图是否已初始化
   */
  isMapReady() {
    return this.mapReady && this.mapInstance !== null
  }

  /**
   * 等待地图初始化完成
   */
  waitForMapReady() {
    return new Promise((resolve) => {
      if (this.isMapReady()) {
        resolve(this.mapInstance)
      } else {
        const checkInterval = setInterval(() => {
          if (this.isMapReady()) {
            clearInterval(checkInterval)
            resolve(this.mapInstance)
          }
        }, 100)
      }
    })
  }

  /**
   * 添加图层到地图
   */
  addPipeLayer(layer, metadata = {}) {
    if (this.isMapReady()) {
      const { id: layerId, layerList, resourceid, nowSize } = metadata
      const sindexList = layerList
      if (!layerId) {
        console.warn('必须提供图层ID')
        return null
      }
      //判断是否是叠加了新增的图层
      if (this.historyServeice > nowSize) {
        this.clearPipeline()
      }
      this.historyServeice = nowSize

      // 判断是否已经存在该图层
      const filterLayer = this.overlayLayers.find((item) => item.resourceid === resourceid)
      if (filterLayer) {
        this.mapInstance.removeLayer(filterLayer.layer)
        this.overlayLayers = this.overlayLayers.filter((item) => item.resourceid !== resourceid)
      }
      // 存储图层
      this.overlayLayers.push({
        layerId,
        layer,
        resourceid,
        sindexList
      })
      // 添加到地图
      this.mapInstance.addLayer(layer)
    }
  }
  clearPipeline() {
    this.overlayLayers.forEach((layer) => {
      this.mapInstance.removeLayer(layer.layer)
    })
    this.overlayLayers = []
  }
  /**
   * 添加图层到地图（带 ID 管理）
   */
  addLayerById(layerId, layer) {
    if (!this.isMapReady()) return
    
    // 如果已存在同名 ID 图层，先移除
    this.removeLayerById(layerId)
    
    layer.set('id', layerId)
    this.mapInstance.addLayer(layer)
    this.overlayLayers.push({
      layerId,
      layer
    })
  }

  /**
   * 通过ID移除图层
   */
  removeLayerById(layerId) {
    if (!this.isMapReady()) return false
    
    const index = this.overlayLayers.findIndex(item => item.layerId === layerId)
    if (index !== -1) {
      const layerObj = this.overlayLayers[index]
      this.mapInstance.removeLayer(layerObj.layer)
      this.overlayLayers.splice(index, 1)
      return true
    }
    
    // 兜底：从地图实例中直接查找并删除
    const layers = this.mapInstance.getLayers().getArray()
    const layer = layers.find(l => l.get('id') === layerId)
    if (layer) {
      this.mapInstance.removeLayer(layer)
      return true
    }
    
    return false
  }

  /**
   * 获取所有图层
   */
  getLayers() {
    if (this.isMapReady()) {
      return this.mapInstance.getLayers().getArray()
    }
    return []
  }

  /**
   * 设置地图视图
   */
  setView(view) {
    if (this.isMapReady()) {
      this.mapInstance.setView(view)
      this.mapState.view = view
    } else {
      console.warn('地图实例未初始化，无法设置视图')
    }
  }

  /**
   * 获取地图视图
   */
  getView() {
    if (this.isMapReady()) {
      return this.mapInstance.getView()
    }
    return null
  }

  /**
   * 设置地图中心点
   */
  setCenter(center) {
    if (this.isMapReady()) {
      const view = this.mapInstance.getView()
      view.setCenter(center)
    } else {
      console.warn('地图实例未初始化，无法设置中心点')
    }
  }

  /**
   * 设置地图缩放级别
   */
  setZoom(zoom) {
    if (this.isMapReady()) {
      const view = this.mapInstance.getView()
      view.setZoom(zoom)
    } else {
      console.warn('地图实例未初始化，无法设置缩放级别')
    }
  }

  /**
   * 简单的图层管理
   */
  get layerManager() {
    return {
      // 根据ID获取图层
      getLayerById: (layerId) => {
        return this.overlayLayers[layerId]
      }
    }
  }

  /**
   * 更新地图状态
   */
  updateMapState(updates) {
    Object.assign(this.mapState, updates)
  }

  /**
   * 获取地图状态
   */
  getMapState() {
    return { ...this.mapState }
  }

  /**
   * 重置地图实例
   */
  resetMapInstance() {
    this.mapInstance = null
    this.mapReady = false
    this.mapState.isInitialized = false
    this.mapState.view = null
    this.mapState.layers = []
    // 清空叠加图层
    Object.keys(this.overlayLayers).forEach((key) => {
      delete this.overlayLayers[key]
    })
  }
}

// 创建单例实例
const mapInstanceManager = new MapInstanceManager()

// 在开发环境下暴露到全局，方便调试
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.mapInstanceManager = mapInstanceManager
}

// 导出类和单例实例
export { MapInstanceManager }
export { mapInstanceManager }
