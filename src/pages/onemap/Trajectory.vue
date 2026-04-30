<script setup>
import { ref, watch, computed } from 'vue'
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

// 3. 监听树选中状态，同步到全局 store
const handleCheckChange = (a,b,c) => {
  console.log(a,b,'22')
  console.log(c,'22')
 // 创建 Popup 实例，传入 map 实例
  const popup = new Popup(mapInstanceManager.getMapInstance());
  const checkedNodes = treeRef.value?.getCheckedNodes() || []
  popup.show(PopupContent,[113.10,23.03],{})
  // 过滤出选中的车辆节点（排除企业节点）
  const selectedVehicles = checkedNodes.filter(n => !n.isEnterprise)
  
  // 初始化/更新多车辆监控图层
  initMonitorLayer(mapInstanceManager.getMapInstance(), selectedVehicles)
  removeLayer('vehicleLayer')
  
  // 同步 ID 到全局状态（如果需要）
  const vehicleIds = selectedVehicles.map(node => node.id)
  globalStore.setSelectedVehicleIds(vehicleIds)
}

const onCheckChange = (node,isCheck,childNodeIsCheck)=>{
  // console.log(node,isCheck,childNodeIsCheck,'1111')
  let checkedNodes = []
  if(_.isEmpty(node.children) && isCheck) {
    checkedNodes.push(node)
  }else{
    checkedNodes = node.children.filter(child => child.id === node.id )
  }
  console.log(checkedNodes,'checkedNodes')
}
// 统计信息
const stats = computed(() => ({
  all: carData.length,
  online: carData.filter(c => c.status === 'online').length,
  offline: carData.filter(c => c.status === 'offline').length
}))
</script>

<template>
  <div class="flex flex-col h-full w-[400px] bg-white border-r border-white/10 theme-color shadow-2xl">
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
        @check-change="onCheckChange"
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