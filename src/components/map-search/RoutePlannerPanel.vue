<template>
  <div>
    <!-- 路线类型选择 -->
    <div class="mb-4 flex items-center justify-between">
      <el-radio-group v-model="routeType" size="default">
        <el-radio-button label="driving">驾车</el-radio-button>
        <el-radio-button label="transfer">公交</el-radio-button>
        <el-radio-button label="walking">步行</el-radio-button>
        <el-radio-button label="riding">骑行</el-radio-button>
      </el-radio-group>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-600">高德面板</span>
        <el-switch v-model="showNativePanel" />
      </div>
    </div>

    <!-- 起点输入 -->
    <div class="mb-3">
      <div class="text-xs text-gray-600 mb-1">起点</div>
      <el-autocomplete v-model="startPoint" :fetch-suggestions="handleStartSearch" placeholder="请输入起点或点击地图选择" clearable
        class="w-full" @select="handleStartSelect" @clear="handleStartClear">
        <template #default="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ item.name }}</span>
            <span class="text-xs text-gray-500">{{ item.address }}</span>
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 终点输入 -->
    <div class="mb-3">
      <div class="text-xs text-gray-600 mb-1">终点</div>
      <el-autocomplete v-model="endPoint" :fetch-suggestions="handleEndSearch" placeholder="请输入终点或点击地图选择" clearable
        class="w-full" @select="handleEndSelect" @clear="handleEndClear">
        <template #default="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ item.name }}</span>
            <span class="text-xs text-gray-500">{{ item.address }}</span>
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 规划按钮 -->
    <div class="flex gap-2 mb-4">
      <el-button type="primary" class="flex-1" :loading="planning" :disabled="!canPlan" @click="handlePlanRoute">
        开始规划
      </el-button>
      <el-button v-if="routeResults.length > 0" type="danger" plain @click="clearRoutes">
        清除路线
      </el-button>
    </div>

    <!-- 规划结果 -->
    <div v-if="routeResults.length > 0" class="space-y-3">
      <div class="text-xs text-gray-500">共找到 {{ routeResults.length }} 条路线</div>
      <div class="max-h-96 overflow-auto border rounded-md divide-y bg-white">
        <div v-for="(route, index) in routeResults" :key="index" class="p-3 hover:bg-gray-100 cursor-pointer"
          @click="selectRoute(route, index)">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold">方案 {{ index + 1 }}</span>
            <span class="text-xs px-2 py-1 rounded"
              :class="selectedRouteIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200'">
              {{ selectedRouteIndex === index ? '已选择' : '点击选择' }}
            </span>
          </div>
          <div class="text-xs text-gray-600 space-y-1">
            <div class="flex items-center gap-4">
              <div v-if="route.distance">
                <span class="font-medium">距离：</span>{{ formatDistance(route.distance) }}
              </div>
              <div v-if="route.time">
                <span class="font-medium">时间：</span>{{ formatTime(route.time) }}
              </div>
              <div v-if="route.cost !== undefined && route.cost > 0">
                <span class="font-medium">费用：</span>¥{{ route.cost }}
              </div>
              <div v-if="route.tolls !== undefined && route.tolls > 0">
                <span class="font-medium">过路费：</span>¥{{ route.tolls }}
              </div>
            </div>
            <div v-if="route.steps && route.steps.length > 0" class="mt-2">
              <div class="flex items-center justify-between mb-1">
                <div class="text-gray-500">路线指引：</div>
                <el-button text size="small" class="!px-2" @click="toggleExpanded(index)">
                  <el-icon class="mr-1">
                    <CaretBottom v-if="isExpanded(index)" />
                    <CaretRight v-else />
                  </el-icon>
                  {{ isExpanded(index) ? '收起' : '展开' }}
                </el-button>
              </div>
              <div class="pl-2 max-h-40 overflow-auto space-y-1">
                <div v-for="(step, stepIndex) in visibleSteps(route, index)" :key="stepIndex" class="text-xs">
                  {{ stepIndex + 1 }}. {{ getStepInstruction(step) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else-if="hasSearched" description="未找到路线，请调整起点或终点" class="mt-6" />
    <el-empty v-else description="请输入起点和终点进行路线规划" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CaretBottom, CaretRight } from '@element-plus/icons-vue'

const props = defineProps({
  pluginManager: Object,
  mapInstance: Object,
})

// 路线类型
const routeType = ref('driving')
// 起点和终点
const startPoint = ref('')
const endPoint = ref('')
const startLocation = ref(null) // { lng, lat, name, address }
const endLocation = ref(null)

// 规划状态
const planning = ref(false)
const routeResults = ref([])
const selectedRouteIndex = ref(-1)
const hasSearched = ref(false)
const expandedMap = ref({})
const showNativePanel = ref(true)

// 插件实例
const autoCompleteInstance = ref(null)
const routePluginInstance = ref(null)
const searchTimeoutHandle = ref(null)
const createLngLat = (lng, lat) => {
  const AMap = props.pluginManager?.AMap
  if (AMap && typeof AMap.LngLat === 'function') {
    return new AMap.LngLat(Number(lng), Number(lat))
  }
  return [Number(lng), Number(lat)]
}
const ensureCity = async (lnglat) => {
  try {
    const geocoder = await props.pluginManager.useGeocoder({})
    return await new Promise((resolve) => {
      geocoder.getAddress(lnglat, (status, result) => {
        if (status === 'complete' && result?.regeocode?.addressComponent) {
          const comp = result.regeocode.addressComponent
          const city = comp.city || comp.province || comp.district || ''
          resolve(city || '北京')
        } else {
          resolve('北京')
        }
      })
    })
  } catch (_) {
    return '北京'
  }
}

// 计算属性
const canPlan = computed(() => {
  return !!(startLocation.value && endLocation.value && props.pluginManager && props.mapInstance)
})

const isReady = computed(() => !!(props.pluginManager && props.mapInstance))

// 初始化自动完成插件
const ensureAutoComplete = async () => {
  if (!isReady.value) {
    return null
  }

  if (!autoCompleteInstance.value) {
    autoCompleteInstance.value = await props.pluginManager.useAutoComplete({
      city: '全国',
      citylimit: false,
    })
  }

  return autoCompleteInstance.value
}

// 起点搜索
const handleStartSearch = async (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }

  try {
    const autoComplete = await ensureAutoComplete()
    if (!autoComplete) {
      cb([])
      return
    }

    autoComplete.search(queryString, (status, result) => {
      if (status === 'complete' && result.tips) {
        const suggestions = result.tips.map((tip) => ({
          value: tip.name,
          name: tip.name,
          address: tip.address || tip.district || '',
          location: tip.location,
        }))
        cb(suggestions)
      } else {
        cb([])
      }
    })
  } catch (error) {
    console.error('搜索起点失败', error)
    cb([])
  }
}

// 终点搜索
const handleEndSearch = async (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }

  try {
    const autoComplete = await ensureAutoComplete()
    if (!autoComplete) {
      cb([])
      return
    }

    autoComplete.search(queryString, (status, result) => {
      if (status === 'complete' && result.tips) {
        const suggestions = result.tips.map((tip) => ({
          value: tip.name,
          name: tip.name,
          address: tip.address || tip.district || '',
          location: tip.location,
        }))
        cb(suggestions)
      } else {
        cb([])
      }
    })
  } catch (error) {
    console.error('搜索终点失败', error)
    cb([])
  }
}

// 起点选择
const handleStartSelect = (item) => {
  if (item.location) {
    startLocation.value = {
      lng: item.location.lng || item.location[0],
      lat: item.location.lat || item.location[1],
      name: item.name,
      address: item.address,
    }
    startPoint.value = item.name
  }
}

// 终点选择
const handleEndSelect = (item) => {
  if (item.location) {
    endLocation.value = {
      lng: item.location.lng || item.location[0],
      lat: item.location.lat || item.location[1],
      name: item.name,
      address: item.address,
    }
    endPoint.value = item.name
  }
}

// 清除起点
const handleStartClear = () => {
  startLocation.value = null
  startPoint.value = ''
}

// 清除终点
const handleEndClear = () => {
  endLocation.value = null
  endPoint.value = ''
}

// 获取路线规划插件实例
const getRoutePlugin = async () => {
  if (!isReady.value) {
    ElMessage.warning('地图尚未初始化')
    return null
  }

  const pluginMethods = {
    driving: 'useDriving',
    transfer: 'useTransfer',
    walking: 'useWalking',
    riding: 'useRiding',
  }

  const method = pluginMethods[routeType.value]
  if (!method) {
    ElMessage.error('不支持的路线类型')
    return null
  }

  // 先清除之前的实例
  if (routePluginInstance.value) {
    try {
      if (typeof routePluginInstance.value.clear === 'function') {
        routePluginInstance.value.clear()
      }
      if (typeof routePluginInstance.value.clearMap === 'function') {
        routePluginInstance.value.clearMap()
      }
    } catch (e) {
      console.warn('清除旧路线失败', e)
    }
  }

  // 创建新的插件实例（因为路线类型可能改变）
  // 隐藏默认面板，但保留路线和标记在地图上的显示
  routePluginInstance.value = await props.pluginManager[method]({
    map: props.mapInstance,
    panel: showNativePanel.value ? 'my-panel' : null,
    hideMarkers: false, // 保留标记显示，但面板被隐藏
    showTraffic: routeType.value === 'driving',
    autoFitView: true, // 自动调整视野
  })

  return routePluginInstance.value
}

// 规划路线
const handlePlanRoute = async () => {
  if (!canPlan.value) {
    ElMessage.warning('请选择起点和终点')
    return
  }

  planning.value = true
  routeResults.value = []
  selectedRouteIndex.value = -1
  hasSearched.value = true

  try {
    const plugin = await getRoutePlugin()
    if (!plugin) {
      planning.value = false
      return
    }

    // 使用坐标进行路线规划
    const start = createLngLat(startLocation.value.lng, startLocation.value.lat)
    const end = createLngLat(endLocation.value.lng, endLocation.value.lat)

    // 统一使用坐标进行路线规划
    // 高德地图的路线规划插件都支持坐标数组格式
    const cb = (status, result) => {
      handleRouteResult(status, result)
    }
    let invoked = false
    if (routeType.value === 'transfer') {
      try {
        const city = await ensureCity(end)
        plugin.search([
          { keyword: startPoint.value, city },
          { keyword: endPoint.value, city }
        ], cb)
        invoked = true
      } catch (_) {}
    }
    if (!invoked) {
      try {
        const city = routeType.value === 'transfer' ? await ensureCity(end) : undefined
        if (city) {
          plugin.search(start, end, cb, { city })
        } else {
          plugin.search(start, end, cb)
        }
        invoked = true
      } catch (_) {}
    }
    if (!invoked) {
      try {
        plugin.search([start, end], cb)
        invoked = true
      } catch (e2) {
        throw e2
      }
    }
    searchTimeoutHandle.value = setTimeout(() => {
      if (planning.value) {
        planning.value = false
        ElMessage.warning('路线规划超时，请重试')
      }
    }, 12000)
  } catch (error) {
    console.error('路线规划失败', error)
    const errorMsg = error.message || error.toString() || '未知错误'
    ElMessage.error(`路线规划失败（${routeType.value}）：${errorMsg}`)
    planning.value = false
  }
}

// 处理路线规划结果
const handleRouteResult = (status, result) => {
  if (searchTimeoutHandle.value) {
    clearTimeout(searchTimeoutHandle.value)
    searchTimeoutHandle.value = null
  }
  planning.value = false // 确保loading状态关闭

  if (status === 'complete' && result.info === 'OK') {
    // 根据不同路线类型解析结果
    let routes = []

    if (routeType.value === 'driving' && result.routes && result.routes.length > 0) {
      // 驾车路线
      routes = result.routes.map((route) => ({
        distance: route.distance,
        time: route.time,
        steps: route.steps || [],
        path: route.path || [],
        tolls: route.tolls || 0,
        tollDistance: route.tollDistance || 0,
        routeData: route, // 保存完整数据用于地图绘制
      }))
    } else if (routeType.value === 'transfer') {
      const plans = result.transits || result.plans || []
      if (plans.length > 0) {
      // 公交路线 - 解析segments获取详细步骤
      routes = plans.map((plan, planIndex) => {
        const steps = []
        if (plan.segments && plan.segments.length > 0) {
          plan.segments.forEach((segment) => {
            if (segment.walking) {
              steps.push({
                instruction: `步行 ${formatDistance(segment.walking.distance)}`,
                action: 'walking',
                distance: segment.walking.distance,
                time: segment.walking.time,
              })
            }
            if (segment.bus && segment.bus.buslines && segment.bus.buslines.length > 0) {
              segment.bus.buslines.forEach((busline) => {
                steps.push({
                  instruction: `乘坐${busline.name}，${busline.via_stops?.length || 0}站`,
                  action: 'bus',
                  busline: busline.name,
                  distance: busline.distance,
                  time: busline.time,
                })
              })
            }
          })
        }
        return {
          distance: plan.distance,
          time: plan.time,
          steps: steps,
          path: plan.path || [],
          cost: plan.cost || 0,
          nightflag: plan.nightflag || false,
          routeData: plan, // 保存完整数据用于地图绘制
        }
      })
      }
    } else if (routeType.value === 'walking' && result.routes && result.routes.length > 0) {
      // 步行路线
      routes = result.routes.map((route) => ({
        distance: route.distance,
        time: route.time,
        steps: route.steps || [],
        path: route.path || [],
        routeData: route, // 保存完整数据用于地图绘制
      }))
    } else if (routeType.value === 'riding' && result.routes && result.routes.length > 0) {
      // 骑行路线
      routes = result.routes.map((route) => ({
        distance: route.distance,
        time: route.time,
        steps: route.steps || [],
        path: route.path || [],
        routeData: route, // 保存完整数据用于地图绘制
      }))
    }

    routeResults.value = routes
    if (routes.length > 0) {
      selectRoute(routes[0], 0) // 默认选择第一条路线
      ElMessage.success(`找到 ${routes.length} 条路线`)
    } else {
      ElMessage.warning('未找到可用路线')
    }
  } else {
    routeResults.value = []
    const errorMsg = result?.info || result?.message || result?.errorInfo || '未知错误'
    console.error(`路线规划失败（${routeType.value}）`, {
      status,
      result,
      errorMsg,
    })
    ElMessage.error(`路线规划失败（${routeType.value}）：${errorMsg}`)
  }
}

// 选择路线
const selectRoute = (route, index) => {
  selectedRouteIndex.value = index

  // 清除之前的路线显示
  if (routePluginInstance.value) {
    try {
      if (typeof routePluginInstance.value.clear === 'function') {
        routePluginInstance.value.clear()
      }
    } catch (e) {
      console.warn('清除路线失败', e)
    }
  }

  // 在地图上显示选中的路线
  // 高德地图插件会自动在地图上绘制路线，但由于我们设置了hideMarkers:true
  // 需要手动控制显示
  if (routePluginInstance.value && route.routeData) {
    try {
      // 使用插件的方法来显示路线
      // 注意：不同插件可能有不同的方法，这里使用通用的方式
      if (route.path && route.path.length > 0) {
        // 路线路径已经包含在routeData中，插件会自动绘制
        // 如果需要手动控制，可以在这里添加逻辑
      }
    } catch (e) {
      console.warn('显示路线失败', e)
    }
  }
}

const isExpanded = (index) => {
  return !!expandedMap.value[index]
}

const toggleExpanded = (index) => {
  expandedMap.value[index] = !expandedMap.value[index]
}

const visibleSteps = (route, index) => {
  if (!route.steps) return []
  return isExpanded(index) ? route.steps : route.steps.slice(0, 3)
}

// 格式化距离
const formatDistance = (distance) => {
  if (!distance) return '未知'
  if (distance < 1000) {
    return `${Math.round(distance)}米`
  }
  return `${(distance / 1000).toFixed(2)}公里`
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '未知'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 获取步骤指引文本
const getStepInstruction = (step) => {
  if (step.instruction) {
    return step.instruction
  }
  if (step.action) {
    return step.action
  }
  if (step.road) {
    return `沿${step.road}行驶`
  }
  return '继续前进'
}

// 清除路线
const clearRoutes = () => {
  routeResults.value = []
  selectedRouteIndex.value = -1
  hasSearched.value = false

  // 清除地图上的路线和标记
  if (routePluginInstance.value) {
    try {
      if (typeof routePluginInstance.value.clear === 'function') {
        routePluginInstance.value.clear()
      }
      if (typeof routePluginInstance.value.clearMap === 'function') {
        routePluginInstance.value.clearMap()
      }
      // 有些插件可能需要调用destroy
      if (typeof routePluginInstance.value.destroy === 'function') {
        routePluginInstance.value.destroy()
      }
    } catch (e) {
      console.warn('清除路线失败', e)
    }
    routePluginInstance.value = null
  }

  ElMessage.success('已清除路线')
}

// 监听路线类型变化，清除之前的结果
watch(routeType, () => {
  routeResults.value = []
  selectedRouteIndex.value = -1
  routePluginInstance.value = null
})

watch(showNativePanel, () => {
  if (routePluginInstance.value) {
    try {
      if (typeof routePluginInstance.value.clear === 'function') {
        routePluginInstance.value.clear()
      }
      if (typeof routePluginInstance.value.destroy === 'function') {
        routePluginInstance.value.destroy()
      }
    } catch (_) {}
    routePluginInstance.value = null
  }
})
</script>

<style scoped></style>
