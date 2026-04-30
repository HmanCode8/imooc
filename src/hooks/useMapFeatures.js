import { ref } from 'vue'
import { createPlantLayer, createMultiVehicleMonitorLayer } from '../utils/createLayer'
import { mapInstanceManager } from './useMapInstance'

/**
 * 地图要素管理 Hook
 * 处理车辆聚合、路段、区域等矢量要素的加载与管理
 */
export function useMapFeatures() {
  const layers = ref({}) // 存储业务图层 { vehicleLayer: layer, monitorLayer: layer, ... }

  /**
   * 初始化车辆聚合图层
   * @param {Object} map OpenLayers 地图实例
   */
  const initVehicleLayer = async (map) => {
    const layerId = 'vehicle-aggregation'
    if (layers.value.vehicleLayer) {
      map.removeLayer(layers.value.vehicleLayer)
    }
    const layer = await createPlantLayer()
    mapInstanceManager.addLayerById(layerId, layer)
    return layer
  }
 /**
   * 更新激活的车辆（用于轨迹分析联动）
   * @param {Array} ids 车辆 ID 数组
   */
  const updateActiveVehicles = (ids) => {
    if (layers.value.monitorLayer && layers.value.monitorLayer.setActiveVehicles) {
      layers.value.monitorLayer.setActiveVehicles(ids)
    }
  }
  /**
   * 初始化多车辆监控图层（带轨迹与动画）
   * @param {Object} map OpenLayers 地图实例
   * @param {Array} data 选中的车辆数据
   * @param {Boolean} showTracks 默认是否显示轨迹
   */
  const initMonitorLayer = async (map, data, showTracks = true) => {
    const layerId = 'vehicle-monitor'
    
    // 1. 如果没有数据，直接移除图层并退出
    if (!data || data.length === 0) {
      mapInstanceManager.removeLayerById(layerId)
      layers.value.monitorLayer = null
      return
    }

    // 2. 创建新图层（内部已处理同 ID 替换）
    const layer = await createMultiVehicleMonitorLayer(data, { showTracks })
    layer.setZIndex(10)
    mapInstanceManager.addLayerById(layerId, layer)
    layers.value.monitorLayer = layer
    return layer
  }

  /**
   * 移除图层
   * @param {Object} map 地图实例
   * @param {String} layerKey 图层键名
   */
  const removeLayer = (layerKey) => {
    const layerIdMap = {
      vehicleLayer: 'vehicle-aggregation',
      monitorLayer: 'vehicle-monitor'
    }
    const id = layerIdMap[layerKey]
    if (id) {
      mapInstanceManager.removeLayerById(id)
      delete layers.value[layerKey]
    }
  }

  /**
   * 设置图层可见性
   * @param {String} layerKey 图层键名
   * @param {Boolean} visible 是否可见
   */
  const setLayerVisible = (layerKey, visible) => {
    const layerIdMap = {
      vehicleLayer: 'vehicle-aggregation',
      monitorLayer: 'vehicle-monitor'
    }
    const id = layerIdMap[layerKey]
    if (id) {
      const layers = mapInstanceManager.getLayers()
      const layer = layers.find(l => l.get('id') === id)
      if (layer) layer.setVisible(visible)
    }
  }

  return {
    layers,
    initVehicleLayer,
    initMonitorLayer,
    removeLayer,
    setLayerVisible,
    updateActiveVehicles
  }
}
