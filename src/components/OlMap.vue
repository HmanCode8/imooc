<template>
  <!-- 地图容器 -->
  <div id="map" class="w-full h-full relative">
    <div
      class="absolute left-1 bottom-1 bg-white p-2 rounded-md shadow-md z-10"
    >
      <div
        v-for="item in legend"
        :key="item.name"
        class="flex items-center justify-between"
      >
        <div
          v-if="item.color"
          :style="{ backgroundColor: item.color }"
          class="w-10 h-2"
        ></div>
        <div
          v-else
          :class="`w-10 h-4 py-5 bg-${item.icon} bg-cover bg-center rounded-full`"
        ></div>
        <div class="px-3">{{ item.name }}</div>
      </div>
    </div>
    <div class="absolute inset-0 pointer-events-none z-20">
      <slot name="map-modal"></slot>
    </div>
    <div class="absolute right-2 top-1/2 -translate-y-1/2 z-20">
      <slot name="map-tools"> </slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import "ol/ol.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { authApi } from "@/services/auth";
import { defaults as defaultControls, MousePosition } from "ol/control.js";
import { createStringXY, toStringHDMS } from "ol/coordinate.js";
import { useMapServices } from "../hooks/useMapServices.js";
import { useMapFeatures } from "../hooks/useMapFeatures.js";
import { mapInstanceManager } from "../hooks/useMapInstance.js";
import { useGlobalStore } from "@/stores/global";
import Popup from "@/utils/mapOverlay"; // 导入封装的 Popup 类
import PopupContent from "@/components/PopupContent.vue"; // 导入你的 Vue 组件
import _ from "lodash";
import { toLonLat } from "ol/proj.js";

const props = defineProps({
  mapType: {
    type: String,
  },
});
const legend = ref([
  {
    name: "实际路线",
    color: "#ad58f6",
  },
  {
    name: "规划路线",
    color: "#5dca8e",
  },
  {
    name: "正式车辆",
    icon: "onlinecar",
  },
  {
    name: "测试车辆",
    icon: "testcar",
  },
  {
    name: "离线车辆",
    icon: "offlinecar",
  },
]);
const globalStore = useGlobalStore();
const {
  initVehicleLayer,
  initMonitorLayer,
  setLayerVisible,
  updateActiveVehicles,
} = useMapFeatures();
const showPopup = ref(false);
const coordinate = ref([]);

const mapType = ref(window.global_config.map.mapType);
watch(
  () => props.mapType,
  (newVal, oldVal) => {
    console.log("props.mapType", newVal);
    mapType.value = newVal;
  },
);
// 使用地图实例管理 hook
// 使用地图实例管理类
// 注意：不要解构方法，保持 this 上下文

// 图层缓存管理
const layerCache = {}; // 存储已创建的图层 {arcgis: layer, xyz: layer, ...}
const userSecretKey = ref(null); // 缓存的用户秘钥

// 获取用户秘钥（只获取一次）
const getUserSecretKeyFn = async () => {
  if (userSecretKey.value) {
    return userSecretKey.value;
  }

  try {
    const res = await authApi.getUserSecretKey();
    if (res.ReturnCode === 0) {
      userSecretKey.value = res.Data;
      return userSecretKey.value;
    } else {
      throw new Error("获取用户秘钥失败");
    }
  } catch (error) {
    console.error("获取用户秘钥异常:", error);
    throw error;
  }
};

// 获取基础地图URL（只获取一次）
const getBaseMapUrl = async (mType) => {
  const cacheKey = `baseMap_${mType}`;

  if (layerCache[cacheKey]) {
    return layerCache[cacheKey];
  }

  try {
    const ak = await getUserSecretKeyFn();
    const res = await authApi.getBaseMap({
      syskey: window.global_config.system.clientId,
    });

    if (res.ReturnCode === 0) {
      const { Data } = res;

      const mtMap = window.global_config.map.mpaKeys;

      const baseMapItem = _.find(Data, (d) => d.basemaptype === mtMap[mType]);

      if (!baseMapItem) {
        throw new Error(
          `未找到${mType}对应的基础地图配置，basemaptype: ${mtMap[mType]}`,
        );
      }

      const baseMapId = _.get(baseMapItem, "resourceid");

      const url = `${window.global_config.system.arcgisServerUrl}/MapService/${baseMapId}/${ak}`;
      const baseMapUrl =
        window.global_config.map[mType].type === "XYZ" ? url : `${url}/export`;

      // 缓存URL
      layerCache[cacheKey] = baseMapUrl;
      return baseMapUrl;
    } else {
      throw new Error("获取基础地图失败");
    }
  } catch (error) {
    console.error("获取基础地图异常:", error);
    throw error;
  }
};

// 创建或获取图层
const getOrCreateLayer = async (mType) => {
  // 直接使用 mType 作为缓存键
  if (layerCache[mType]) {
    return layerCache[mType];
  }

  try {
    const configMap = window.global_config.map || {};
    const { createLayerByType } = useMapServices();

    // 对于需要网络请求的图层类型，先获取URL
    if (!mType.includes("wmts")) {
      const baseMapUrl = await getBaseMapUrl(mType);

      // 更新配置中的URL
      if (configMap[mType]) {
        configMap[mType].layer_config.url = baseMapUrl;
      } else {
        console.warn(`未找到${mType}的配置`);
      }
    }

    const currentConfig = configMap[mType];
    if (!currentConfig) {
      throw new Error(`未找到${mType}的配置`);
    }

    const layerResult = await createLayerByType(currentConfig);
    if (!layerResult) {
      throw new Error(`创建${mType}图层失败`);
    }

    // 缓存图层，使用 mType 作为键
    layerCache[mType] = layerResult;
    return layerResult;
  } catch (error) {
    console.error(`创建${mType}图层异常:`, error);
    throw error;
  }
};
// 关闭弹窗（Vue 事件正常用！）
const closePopup = () => {
  showPopup.value = false;
};
// 初始化地图
const initMap = async () => {
  try {
    console.log("开始初始化地图...");
    const configMap = window.global_config.map || {};

    // 获取默认图层
    const defaultLayerResult = await getOrCreateLayer(mapType.value);
    const { layer: defaultLayer, projection } = defaultLayerResult;

    // 获取默认配置
    const currentConfig = configMap[mapType.value];
    if (!currentConfig) {
      throw new Error(`未找到${mapType.value}的配置`);
    }

    // 计算中心点
    // const { xmin, xmax, ymin, ymax } = currentConfig.view_config.extent
    // const centerX = (xmin + xmax) / 2
    // const centerY = (ymin + ymax) / 2

    // 创建地图视图
    const view = new View({
      projection: projection,
      center: [113.1315, 23.0268],
      zoom: currentConfig.view_config.zoom,
      minZoom: 1,
      maxZoom: 20,
    });

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(2),
      projection: projection,
      className:
        "custom-mouse-position absolute left-1/4 bottom-0 text-black z-10",
      undefinedHTML: "&nbsp;",
    });

    // 创建地图实例
    const map = new Map({
      target: "map",
      layers: [defaultLayer],
      view: view,
      controls: defaultControls().extend([mousePositionControl]),
    });
    mapInstanceManager.setMapInstance(map);

    // 创建 Popup 实例，传入 map 实例
    const popup = new Popup(map);

    // // 地图点击
    // map.on('singleclick', (evt) => {
    //   const coord = evt.coordinate
    //   const ll = toLonLat(coord)

    //   // 给 Vue 变量赋值
    //   coordinate.value = coord.map(c => c.toFixed(2))
    //   popup.show(PopupContent,coord,{})

    // })

    if (configMap.ciawmts || configMap.cvawmts) {
      const k = configMap.ciawmts ? "ciawmts" : "cvawmts";
      const ciaLayer = await getOrCreateLayer(k);
      console.log("cvaLayer", ciaLayer);
      ciaLayer.layer.setZIndex(10);
      map.addLayer(ciaLayer.layer);
    }

    // 初始化业务图层
    // await initMonitorLayer(map)

    // 使用类设置地图实例

    // mapInstanceManager.updateMapState({
    //   currentMapType: mapType.value,
    //   layers: [defaultLayer],
    //   view: view
    // })
  } catch (error) {
    console.error("地图初始化失败:", error);
  }
};

// 切换地图类型
const switchMapType = async (newMapType) => {
  if (!mapInstanceManager.isMapReady()) {
    return;
  }

  try {
    // 隐藏所有已缓存的图层
    Object.keys(layerCache).forEach((mapTypeKey) => {
      const cachedLayer = layerCache[mapTypeKey];
      if (cachedLayer && cachedLayer.layer && mapTypeKey !== "ciawmts") {
        cachedLayer.layer.setVisible(false);
      }
    });

    // 获取或创建新图层
    const newLayerResult = await getOrCreateLayer(newMapType);
    const { layer: newLayer } = newLayerResult;

    // 检查新图层是否已经在地图中
    const existingLayers = mapInstanceManager.getLayers();
    const isLayerInMap = existingLayers.some((layer) => layer === newLayer);

    if (!isLayerInMap) {
      // 如果图层不在地图中，添加到地图
      mapInstanceManager.getMapInstance().addLayer(newLayer);
    }

    // 显示新图层
    newLayer.setVisible(true);

    // 更新当前地图类型
    mapType.value = newMapType;
    console.log(`地图切换完成: ${newMapType}`);
  } catch (error) {
    console.error(`切换地图类型失败: ${newMapType}`, error);
  }
};

// 监听地图类型变化
watch(
  mapType,
  (newType, oldType) => {
    if (oldType && newType !== oldType) {
      switchMapType(newType);
    }
  },
  { immediate: true },
);

// 监听路由变化，控制业务图层显隐
// watch(() => globalStore.activeTab, (newTab) => {
//   if (newTab === 'onemap') {
//     setLayerVisible('vehicleLayer', true)
//     setLayerVisible('monitorLayer', true)
//   } else {
//     setLayerVisible('vehicleLayer', false)
//     setLayerVisible('monitorLayer', false)
//   }
// }, { immediate: true })

// 监听全局选中车辆 ID 变化，更新地图轨迹与动画
// watch(() => globalStore.selectedVehicleIds, (newIds) => {
//   updateActiveVehicles(newIds)
// }, { deep: true })

// 组件挂载时初始化地图
onMounted(async () => {
  await initMap();
});
</script>

<style>
/* 测量工具提示样式 */
.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  pointer-events: none;
  user-select: none;
}

.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.7);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}
.bg-onlinecar {
  background-image: url("@/assets/onlineLeg.png");
}
.bg-testcar {
  background-image: url("@/assets/testLeg.png");
}
.bg-offlinecar {
  background-image: url("@/assets/offlineLeg.png");
}
</style>
