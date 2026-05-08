<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useGlobalStore } from "../../stores/global";
import comprehensiveDefaultData from "../../mock/comprehensive";
import { useMapFeatures } from "../../hooks/useMapFeatures";
import { mapInstanceManager } from "../../hooks/useMapInstance";
import PopupContent from "@/components/PopupContent.vue";
import Popup from "@/utils/mapOverlay";
import _ from "lodash";
const globalStore = useGlobalStore();
const { initComprehensiveLayer, removeLayer } = useMapFeatures();

// 视图状态：categories (分类列表) | items (详情列表)
const viewState = ref("categories");
const activeCategory = ref(null);
const keys = [
  "area_audit_rows_v1",
  "line_audit_rows_v1",
  "parking_audit_rows_v1",
];
const typeKeys = {
  area_audit_rows_v1: "车辆运行区域",
  line_audit_rows_v1: "车辆运行路段",
  parking_audit_rows_v1: "停车场",
}
const iconKeys = {
  area_audit_rows_v1: "quyu",
  line_audit_rows_v1: "luxian",
  parking_audit_rows_v1: "tingchewei",
}
const colorKeys = {
  area_audit_rows_v1: "#5dca8e",
  line_audit_rows_v1: "#5dca8e",
  parking_audit_rows_v1: "#5dca8e", 
}
const comprehensiveData = reactive({});
const loadRows = () => {
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [];
      //审批通过的
      const data = arr.filter(d=>d.status === 'approved');
      console.log(data, "data11===");

      comprehensiveData[key] = {
        id: key,
        name: typeKeys[key],
        count: data.reduce((acc, cur) => acc + cur.segments.length, 0),
        unit: "条",
        icon: iconKeys[key],
        color: colorKeys[key],
        features: data.map(d=>_.flattenDeep(d.segments)),
      };
      console.log(comprehensiveData, "comprehensiveData");
      
    } catch {
      return [];
    }
  }
};
loadRows();
const toggleCategory = async (item) => {
  // activeCategory.value = item;
  // viewState.value = "items";
console.log('item',item)
  globalStore.setActiveComprehensiveType(item.id);
  const map = mapInstanceManager.getMapInstance();
  if (map) {
    const layer = await initComprehensiveLayer(map, _.flattenDeep(item.features), item.id);
    if (layer) {
      const source = layer.getSource();
      const extent = source.getExtent();
      if (extent && extent[0] !== Infinity) {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 450],
          duration: 1000,
        });
      }
    }
  }
};

const backToCategories = () => {
  viewState.value = "categories";
  // 不清除地图图层，保持显示，除非需要
};

const selectItem = (feature) => {
  const map = mapInstanceManager.getMapInstance();
  if (!map) return;

  // 设置全局状态显示详情面板
  globalStore.setSelectedComprehensiveItem(feature);
  globalStore.setComprehensiveDetailVisible(true);
  // 关闭车辆详情，避免重叠
  globalStore.setDetailsVisible(false);

  // 定位到该要素
  let coords;
  if (feature.type === "Point") {
    coords = feature.coords;
  } else if (feature.type === "LineString") {
    coords = feature.coords[0]; // 取第一个点
  } else if (feature.type === "Polygon") {
    coords = feature.coords[0][0]; // 取第一个环的第一个点
  }

  if (coords) {
    map.getView().animate({
      center: coords,
      zoom: 15,
      duration: 500,
    });
  }
};

onMounted(async () => {
  const map = await mapInstanceManager.waitForMapReady();
  if (globalStore.activeComprehensiveType && map) {
    const item = comprehensiveData.find(
      (d) => d.id === globalStore.activeComprehensiveType,
    );
    if (item) {
      activeCategory.value = item;
      initComprehensiveLayer(map, item.features, item.id);
    }
  }
});
</script>

<template>
  <div
    class="h-full flex flex-col bg-white shadow-sm border-r border-gray-100 overflow-hidden"
  >
    <!-- 分类列表视图 -->
    <template v-if="viewState === 'categories'">
      <!-- 标题栏 -->
      <div class="p-4 border-b border-gray-50 theme-bg">
        <h2 class="text-md font-bold flex items-center">
          <!-- <i class="iconfont icon-zongheshujufenxi mr-2 theme-bg"></i> -->
          综合数据
        </h2>
      </div>

      <!-- 数据列表 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="(item, key) in comprehensiveData"
          :key="key"
          @click="toggleCategory(item)"
          :class="`
            group relative cursor-pointer transition-all duration-200
            rounded-lg p-4 border flex items-center justify-between
            ${
              globalStore.activeComprehensiveType === item.id
                ? 'theme-primary  shadow-md scale-[1.01]'
                : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
            }
          `"
        >
          <div class="flex items-center space-x-4">
            <!-- 图标容器 -->
            <div
              :class="`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.icon}`"
            ></div>

            <!-- 名称 -->
            <div
              :class="`font-bold text-sm ${globalStore.activeComprehensiveType === item.id ? 'theme-text-color' : 'text-gray-700'}`"
            >
              {{ item.name }}
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="flex items-baseline space-x-1">
            <span
              :class="`text-xl font-bold ${globalStore.activeComprehensiveType === item.id ? 'theme-text-active' : 'text-gray-800'}`"
            >
              {{ item.count }}
            </span>
            <span class="text-[10px] text-gray-400">({{ item.unit }})</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 要素详情列表视图 -->
    <template v-else-if="viewState === 'items'">
      <!-- 标题栏 -->
      <div
        class="p-4 border-b border-gray-100 theme-bg text-white flex items-center"
      >
        <div
          @click="backToCategories"
          class="mr-3 cursor-pointer text-white/80 hover:text-white transition-colors"
        >
          <i class="iconfont icon-arrow-left font-bold text-lg"></i>
        </div>
        <h2 class="text-md font-bold flex-1">
          {{ activeCategory?.name }}
        </h2>
        <div
          @click="backToCategories"
          class="cursor-pointer text-white/80 hover:text-white px-2 py-1 bg-white/10 rounded text-xs"
        >
          返回
        </div>
      </div>

      <!-- 要素列表 -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
        <div
          v-for="feat in activeCategory?.features"
          :key="feat.id"
          @click="selectItem(feat)"
          :class="`
            p-4 bg-white rounded-lg border transition-all group
            ${
              globalStore.selectedComprehensiveItem?.id === feat.id &&
              globalStore.comprehensiveDetailVisible
                ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                : 'border-gray-100 hover:shadow-sm'
            }
          `"
        >
          <div class="flex justify-between items-center mb-2">
            <div class="font-bold text-sm truncate flex-1">
              {{ feat.name }}
            </div>
            <div
              class="text-[10px] font-mono theme-bg bg-blue-50 px-2 py-0.5 rounded border border-blue-100 ml-2 shrink-0"
            >
              {{ feat.code }}
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
            <div v-if="feat.region" class="flex items-center truncate">
              <i class="iconfont icon-location text-[10px] mr-1 opacity-50"></i>
              <span>{{ feat.region }}</span>
            </div>
            <div
              v-if="feat.length"
              class="flex items-center justify-end truncate"
            >
              <i class="iconfont icon-luxian text-[10px] mr-1 opacity-50"></i>
              <span>{{ feat.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部说明 -->
    <div
      class="p-4 text-[10px] text-gray-400 border-t border-gray-50 bg-gray-50/50"
    >
      <p>* 点击项可在地图上查看对应要素分布及详情</p>
    </div>
  </div>
</template>

<style scoped>
/* 滚动条美化 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.luxian {
  background-image: url("@/assets/luxian.png");
  background-size: 100% 100%;
}
.quyu {
  background-image: url("@/assets/quyu.png");
  background-size: 100% 100%;
}
.zhuanchang {
  background-image: url("@/assets/zhuanchang.png");
  background-size: 100% 100%;
}
.tingchewei {
  background-image: url("@/assets/tingchewei.png");
  background-size: 100% 100%;
}
</style>
