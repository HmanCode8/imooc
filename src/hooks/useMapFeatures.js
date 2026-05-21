import { ref } from "vue";
import {
  createPlantLayer,
  createMultiVehicleMonitorLayer,
  createComprehensiveLayer,
} from "../utils/createLayer";
import { mapInstanceManager } from "./useMapInstance";

// 全局单例，确保不同组件调用 hook 时共享图层引用
const sharedLayers = ref({});

/**
 * 地图要素管理 Hook
 * 处理车辆聚合、路段、区域等矢量要素的加载与管理
 */
export function useMapFeatures() {
  const layers = sharedLayers;

  /**
   * 初始化车辆聚合图层
   * @param {Object} map OpenLayers 地图实例
   */
  const initVehicleLayer = async (map, data,id) => {
    const layerId = id || "vehicle-aggregation";
    if (layers.value.vehicleLayer) {
      map.removeLayer(layers.value.vehicleLayer);
    }
    const layer = await createPlantLayer(data);
    mapInstanceManager.addLayerById(layerId, layer);
    layers.value.vehicleLayer = layer;
    return layer;
  };
  /**
   * 更新激活的车辆（用于轨迹分析联动）
   * @param {Array} ids 车辆 ID 数组
   */
  const updateActiveVehicles = (ids) => {
    if (
      layers.value.monitorLayer &&
      layers.value.monitorLayer.setActiveVehicles
    ) {
      layers.value.monitorLayer.setActiveVehicles(ids);
    }
  };
  /**
   * 初始化多车辆监控图层（带轨迹与动画）
   * @param {Object} map OpenLayers 地图实例
   * @param {Array} data 选中的车辆数据
   * @param {Boolean} showTracks 默认是否显示轨迹
   */
  const initMonitorLayer = async (map, data, showTracks = true,id) => {
    const layerId = id || "vehicle-monitor";

    // 1. 如果没有数据，直接移除图层并退出
    if (!data || data.length === 0) {
      mapInstanceManager.removeLayerById(layerId);
      layers.value.monitorLayer = null;
      return;
    }

    // 2. 创建新图层（内部已处理同 ID 替换）
    const layer = await createMultiVehicleMonitorLayer(data, { showTracks });
    layer.setZIndex(10);
    mapInstanceManager.addLayerById(layerId, layer);
    layers.value.monitorLayer = layer;
    return layer;
  };

  /**
   * 初始化综合数据图层
   * @param {Object} map OpenLayers 地图实例
   * @param {Array} data 综合数据
   * @param {String} type 类型 (route, area, parking, transition)
   */
  const initComprehensiveLayer = async (map, data, type) => {
    const layerId = `comprehensive`;

    // 移除旧图层
    mapInstanceManager.removeLayerById(layerId);

    if (!data || data.length === 0) {
      delete layers.value[layerId];
      return;
    }

    const layer = await createComprehensiveLayer(data, type);
    layer.set("id", layerId);
    mapInstanceManager.addLayerById(layerId, layer);
    layers.value[layerId] = layer;
    return layer;
  };

  /**
   * 移除图层
   * @param {Object} map 地图实例
   * @param {String} layerKey 图层键名
   */
  const removeLayer = (layerKey) => {
    const layerIdMap = {
      vehicleLayer: "vehicle-aggregation",
      monitorLayer: "vehicle-monitor",
      routeLayer: "comprehensive-route",
      areaLayer: "comprehensive-area",
      parkingLayer: "comprehensive-parking",
      transitionLayer: "comprehensive-transition",
    };
    const id = layerIdMap[layerKey] || layerKey;
    if (id) {
      mapInstanceManager.removeLayerById(id);
      delete layers.value[layerKey];
    }
  };

  /**
   * 设置图层可见性
   * @param {String} layerKey 图层键名
   * @param {Boolean} visible 是否可见
   */
  const setLayerVisible = (layerKey, visible) => {
    const layerIdMap = {
      vehicleLayer: "vehicle-aggregation",
      monitorLayer: "vehicle-monitor",
      routeLayer: "comprehensive-route",
      areaLayer: "comprehensive-area",
      parkingLayer: "comprehensive-parking",
      transitionLayer: "comprehensive-transition",
    };
    const id = layerIdMap[layerKey] || layerKey;
    if (id) {
      const allLayers = mapInstanceManager.getLayers();
      const layer = allLayers.find((l) => l.get("id") === id);
      if (layer) layer.setVisible(visible);
    }
  };

  return {
    layers,
    initVehicleLayer,
    initMonitorLayer,
    initComprehensiveLayer,
    removeLayer,
    setLayerVisible,
    updateActiveVehicles,
  };
}
