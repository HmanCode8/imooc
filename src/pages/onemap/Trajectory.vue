<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { carData } from '@/mock/car'
import _ from 'lodash'
import { Search } from '@element-plus/icons-vue'
import { useGlobalStore } from '@/stores/global'
import { useMapFeatures } from "../../hooks/useMapFeatures.js";
import { mapInstanceManager } from '../../hooks/useMapInstance'
import Popup from '@/utils/mapOverlay';  // 导入封装的 Popup 类
import PopupContent from '@/components/PopupContent.vue';  // 导入你的 Vue 组件
const { initMonitorLayer,removeLayer } = useMapFeatures()

const globalStore = useGlobalStore()
const filterText = ref('')
const treeRef = ref()
const activeStatusTab = ref('all') // 全部, 在线, 离线

let popup = null

// 1. 将原始数据改造成 el-tree 要求的结构，并增加 Tab 过滤
const treeData = computed(() => {
  // 先按 Tab 过滤车辆
  const filteredByTab = carData.filter(car => {
    if (activeStatusTab.value === 'all') return true
    return car.status === activeStatusTab.value
  })

  // 再按单位分组
  const grouped = _.groupBy(filteredByTab, 'enterprise')
  return Object.keys(grouped).map(enterprise => ({
    id: enterprise,
    label: enterprise,
    isEnterprise: true,
    children: grouped[enterprise].map(car => ({
      id: car.id,
      label: car.plateNo,
      isEnterprise: false,
      status: car.status,
      ...car
    }))
  })).filter(group => group.children.length > 0) // 过滤掉没有子节点的单位
})

// 2. 搜索过滤逻辑
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

// 地图点击事件处理
const handleMapClick = (event) => {
  const map = mapInstanceManager.getMapInstance()
  if (!map) return

  const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f)
  if (!feature) {
    popup?.close()
    return
  }

  // 处理聚合图层和普通图层
  let carFeature = null
  const clusterFeatures = feature.get('features')
  
  if (clusterFeatures) {
    // 如果是聚合图层，且只有一个子要素，则视为点击了该车辆
    if (clusterFeatures.length === 1) {
      carFeature = clusterFeatures[0]
    }
  } else if (feature.get('type') === 'car') {
    // 普通车辆要素
    carFeature = feature
  }

  if (carFeature) {
    const carId = carFeature.get('carId')
    const car = carData.find(c => c.id === carId)
    if (car) {
      const coordinates = carFeature.getGeometry().getCoordinates()
      popup.show(PopupContent, coordinates, {
        title: car.plateNo,
        carData: car // 传递完整的车辆数据
      })
    }
  } else {
    popup?.close()
  }
}

onMounted(async () => {
  const map = await mapInstanceManager.waitForMapReady()
  popup = new Popup(map)
  
  // 绑定点击事件
  map.on('click', handleMapClick)
})

onUnmounted(() => {
  const map = mapInstanceManager.getMapInstance()
  if (map) {
    map.un('click', handleMapClick)
  }
  popup?.close()
})

// 3. 监听树选中状态，同步到全局 store
const handleCheckChange = (node, { checkedNodes }) => {
  // 过滤出选中的车辆节点（排除企业节点）
  const selectedVehicles = checkedNodes.filter(n => !n.isEnterprise)
  
  // 初始化/更新多车辆监控图层
  initMonitorLayer(mapInstanceManager.getMapInstance(), selectedVehicles, "monitorLayer")
  removeLayer('vehicleLayer')
  
  // 同步 ID 到全局状态
  const vehicleIds = selectedVehicles.map(node => node.id)
  globalStore.setSelectedVehicleIds(vehicleIds)

  // 判断当前操作是勾选还是取消勾选
  const isChecked = checkedNodes.some(n => n.id === node.id)
  
  if (isChecked) {
    let targetVehicle = null
    
    if (!node.isEnterprise) {
      // 1. 如果直接勾选的是车辆节点
      targetVehicle = node
    } else if (node.children && node.children.length > 0) {
      // 2. 如果勾选的是单位（父级），则默认展示该单位下的第一个车辆
      targetVehicle = node.children[0]
    }

    // 只有找到明确的车辆节点才创建弹窗
    if (targetVehicle && !targetVehicle.isEnterprise) {
      const coords = targetVehicle.actualRoute && targetVehicle.actualRoute.length > 0 
        ? targetVehicle.actualRoute[0] 
        : [113.1315, 23.0268]

      popup.show(PopupContent, coords, {
        title: targetVehicle.plateNo,
        carData: targetVehicle
      })
      
      // 自动定位
      const map = mapInstanceManager.getMapInstance()
      if (map) {
        map.getView().animate({
          center: coords,
          duration: 500,
          zoom: 15
        })
      }
    }
  } else if (selectedVehicles.length === 0) {
    // 如果没有任何选中的车，关闭弹窗
    popup?.close()
  }
}

const onCheckChange = (node,isCheck,childNodeIsCheck)=>{
  // 保持原有逻辑或仅用于调试，不干扰弹窗逻辑
}


// 统计信息
const stats = computed(() => ({
  all: carData.length,
  online: carData.filter(c => c.status === 'online').length,
  offline: carData.filter(c => c.status === 'offline').length
}))
</script>

<template>
  <div class="flex flex-col h-[95%] w-[400px] ml-10 bg-white border-r border-white/10 theme-color shadow-2xl">
    <!-- 顶部标题 -->
    <div class=" px-4 py-3 flex items-center gap-2">
      <i class="iconfont icon-cheliangyizhangtu text-xl x"></i>
      <span class="font-bold tracking-widest text-lg">重点运营车辆</span>
    </div>

    <!-- 搜索框 -->
    <div class="p-3">
      <el-input
        v-model="filterText"
        placeholder="搜索单位或车牌号"
        :prefix-icon="Search"
        class="custom-search-input"
        clearable
      />
    </div>

    <!-- 状态统计 Tab -->
    <div class="flex px-2 border-b border-white/10 mb-2">
      <div 
        @click="activeStatusTab = 'all'"
        :class="`flex-1 text-center py-2 text-sm cursor-pointer transition-all border-b-2 ${activeStatusTab === 'all' ? 'theme-border' : 'border-transparent text-gray-500'}`"
      >
        全部({{ stats.all }})
      </div>
      <div 
        @click="activeStatusTab = 'online'"
        :class="`flex-1 text-center py-2 text-sm cursor-pointer transition-all border-b-2 ${activeStatusTab === 'online' ? 'theme-border' : 'border-transparent text-gray-500'}`"
      >
        在线({{ stats.online }})
      </div>
      <div 
        @click="activeStatusTab = 'offline'"
        :class="`flex-1 text-center py-2 text-sm cursor-pointer transition-all border-b-2 ${activeStatusTab === 'offline' ? 'theme-border' : 'border-transparent text-gray-500'}`"
      >
        离线({{ stats.offline }})
      </div>
    </div>

    <!-- 树形列表 -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="{ children: 'children', label: 'label' }"
        show-checkbox
        node-key="id"
        :filter-node-method="filterNode"
        class="custom-tree"
        @check="handleCheckChange"
      >
        <template #default="{ node, data }">
          <div class="flex items-center gap-2 py-1 w-full overflow-hidden">
            <template v-if="data.isEnterprise">
              <i class="iconfont icon-quyuguanli "></i>
              <span class="text-sm font-medium truncate">{{ node.label }}</span>
              <span class="text-[10px]  ml-1">({{ data.children.length }})</span>
            </template>
            <template v-else>
              <i :class="`iconfont icon-cheliangyizhangtu text-lg ${data.status === 'online' ? 'text-green-400' : 'text-gray-500'}`"></i>
              <span :class="`text-sm truncate`">{{ node.label }}</span>
            </template>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>



<style scoped lang="scss"></style>