<template>
  <div>
    <div class="flex items-center rounded-md gap-2  px-2 py-2 bg-white">
      <el-input v-model="searchInput" clearable placeholder="输入地点关键字" :suffix-icon="Search" size="large" class="flex-1"
        @keyup.enter="handleSearch" />
      <el-button type="primary" size="large" class="px-5" :loading="loading" @click="handleSearch">搜索</el-button>
    </div>

    <div v-if="searchResults.length > 0" class="mt-4 space-y-3">
      <div class="text-xs text-gray-500">共 {{ total }} 条结果</div>
      <div class="text-black h-80 overflow-auto border rounded-md divide-y bg-white">
        <div v-for="result in searchResults" :key="result.id" class="p-3 hover:bg-gray-100 cursor-pointer"
          @click="locate(result)">
          <div class="font-bold text-sm">{{ result.name }}</div>
          <div class="text-xs text-gray-500">{{ result.address }}</div>
        </div>
      </div>
      <el-pagination class="flex-1" small layout="prev, pager, next" :total="total" :page-size="pageSize"
        :current-page="currentPage" @current-change="handlePageChange" />
    </div>

    <el-empty v-else description="请输入关键词进行搜索" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  pluginManager: Object,
  mapInstance: Object,
})

const searchInput = ref('')
const searchResults = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const placeSearchInstance = ref(null)
const currentMarker = ref(null)

const isReady = computed(() => !!(props.pluginManager && props.mapInstance))

watch(
  () => props.pluginManager,
  () => {
    placeSearchInstance.value = null
  }
)

const ensurePlaceSearch = async () => {
  if (!isReady.value) {
    ElMessage.warning('地图尚未初始化，稍后重试')
    return null
  }

  if (!placeSearchInstance.value) {
    placeSearchInstance.value = await props.pluginManager.usePlaceSearch({
      pageSize: pageSize.value,
      pageIndex: currentPage.value,
      city: '010',
      citylimit: true,
      autoFitView: true,
    })
  }

  return placeSearchInstance.value
}

const handleSearch = async () => {
  if (!searchInput.value) {
    ElMessage.warning('请输入关键字')
    return
  }

  loading.value = true
  try {
    const placeSearch = await ensurePlaceSearch()
    if (!placeSearch) return

    placeSearch.setPageIndex(currentPage.value)
    placeSearch.search(searchInput.value, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        searchResults.value = result.poiList.pois
        total.value = result.poiList.count
      } else {
        searchResults.value = []
        total.value = 0
        ElMessage.error('未查询到相关地点')
      }
    })
  } catch (error) {
    console.error('搜索失败', error)
    ElMessage.error('搜索出错，请稍后再试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

const updateMapViewImmediately = (lng, lat, zoom = 16) => {
  if (!props.mapInstance) return
  props.mapInstance.stopMove && props.mapInstance.stopMove()
  const status = props.mapInstance.getStatus ? props.mapInstance.getStatus() : null
  props.mapInstance.setStatus && props.mapInstance.setStatus({ animateEnable: false })

  if (typeof props.mapInstance.setZoomAndCenter === 'function') {
    props.mapInstance.setZoomAndCenter(zoom, [lng, lat])
  } else {
    props.mapInstance.setZoom(zoom)
    props.mapInstance.setCenter([lng, lat])
  }

  const shouldEnable = status ? status.animateEnable !== false : true
  props.mapInstance.setStatus && props.mapInstance.setStatus({ animateEnable: shouldEnable })
}

const locate = async (item) => {
  if (!isReady.value) return

  const lng =
    item.location?.lng ??
    (typeof item.location === 'string' ? parseFloat(item.location.split(',')[0]) : null)
  const lat =
    item.location?.lat ??
    (typeof item.location === 'string' ? parseFloat(item.location.split(',')[1]) : null)

  if (!lng || !lat) {
    ElMessage.error('无法获取该地点坐标')
    return
  }

  if (currentMarker.value) {
    currentMarker.value.setMap(null)
    currentMarker.value = null
  }

  const marker = await props.pluginManager.useElasticMarker({
    map: props.mapInstance,
    position: [lng, lat],
    styles: [
      {
        icon: {
          img: 'https://a.amap.com/jsapi_demos/static/resource/img/men3.png',
          size: [16, 16],
          anchor: 'bottom-center',
          fitZoom: 14,
          scaleFactor: 2,
          maxScale: 2,
          minScale: 1,
        },
        label: {
          content: item.name || item.address,
          position: 'BM',
          minZoom: 15,
        },
      },
      {
        icon: {
          img: 'https://a.amap.com/jsapi_demos/static/resource/img/tingzi.png',
          size: [48, 63],
          anchor: 'bottom-center',
          fitZoom: 17.5,
          scaleFactor: 2,
          maxScale: 2,
          minScale: 0.125,
        },
        label: {
          content: item.name || item.address,
          position: 'BM',
          minZoom: 15,
        },
      },
    ],
    zoomStyleMapping: {
      14: 0,
      15: 0,
      16: 0,
      17: 0,
      18: 1,
      19: 1,
      20: 1,
    },
  })

  currentMarker.value = marker
  updateMapViewImmediately(lng, lat, 16)
}
</script>
