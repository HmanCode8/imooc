  <template>
    <div class="absolute top-10 left-10  w-1/6 text-[14px] z-20">
      <!-- 搜索栏 -->
      <div class="w-full h-12">
        <div class="flex items-center h-full rounded-lg">
          <!-- 输入框 -->
          <!-- <el-input v-model="searchInput" clearable class="w-40" @keyup.enter="handleSearch" /> -->
          <el-input v-model="searchInput" clearable :placeholder="$t('search.button')" :suffix-icon="Search"
            @keyup.enter="handleSearch" />
          <!-- 搜索按钮 -->
          <!-- <el-icon class="mr-1 text-[#000]">
            <Search />
          </el-icon> -->
          <!-- {{ $t('search.button') }} -->
          <!-- 位置图标按钮 -->
          <div
            class="bg-white h-8 w-8 flex items-center rounded-sm hover:cursor-pointer justify-center  ml-2 text-[#000]"
            @click="showLocationPanel = true">
            <el-icon class="flex items-center justify-center ">
              <Location class="text-xl" />
            </el-icon>
          </div>

        </div>
      </div>

      <!-- 搜索结果面板 -->
      <div v-if="searchResults.length > 0" class="p-2 bg-white rounded-md">

        <!-- 结果列表 -->
        <div class="flex-1  text-black h-96 overflow-auto">
          <div v-for="result in searchResults" :key="result.id"
            class="flex items-center justify-between p-2 hover:cursor-pointer hover:bg-gray-100"
            @click="location(result)">
            <div class="flex-1">
              <div class="font-bold">{{ result.name }}</div>
              <div class="text-sm text-gray-600">{{ result.address }}</div>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="text-black  mt-2">
          <!-- dadad -->
          <el-pagination class="flex-1 " small layout="prev, pager, next" :total="total"
            @current-change="handlePageChange" />
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'
import PluginManager from "@/utils/AMap/PluginManager.js";
import { useAMapStore } from "@/stores/AMapStore.js";
const { t } = useI18n()

// 搜索相关
const searchInput = ref('20')
const showResultsPanel = ref(false)
const searchResults = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const AMapStore = useAMapStore()
const pluginManager = ref(null)


// 搜索处理
const handleSearch = () => {
  if (!searchInput.value) {
    return
  }

  // 模拟搜索 - 这里应该调用实际的API
  // 根据搜索关键词生成结果
  AMap.plugin(["AMap.PlaceSearch"], function () {
    const placeSearch = new AMap.PlaceSearch({
      pageSize: pageSize.value, //单页显示结果条数
      pageIndex: currentPage.value, //页码
      city: "010", //兴趣点城市
      citylimit: true, //是否强制限制在设置的城市内搜索
      // panel: "my-panel", //参数值为你页面定义容器的 id 值<div id="my-panel"></div>，结果列表将在此容器中进行展示。
      autoFitView: true, //是否自动调整地图视野使绘制的 Marker 点都处于视口的可见范围
    });
    placeSearch.search(searchInput.value, (status, result) => {
      console.log(status, result)
      if (status === "complete" && result.info === "OK") {
        searchResults.value = result.poiList.pois
        total.value = result.poiList.count
      }

    }); //使用插件搜索关键字并查看结果
  });
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

onMounted(async () => {
  // pluginManager.value = new PluginManager(AMapStore.Amap.getMap(), await AMapStore.Amap.getAMap())
  console.log(AMapStore, 'map')
})
const location = (item) => {
  console.log(item, 'item')

  // pluginManager.use('DrivingPlugin')
  const stylesArray = [
    {
      icon: {
        //图标样式
        img: 'https://a.amap.com/jsapi_demos/static/resource/img/men3.png',
        size: [16, 16], //图标的原始大小
        anchor: 'bottom-center', //锚点位置
        fitZoom: 14, //最合适的级别 在此级别显示为图标原始大小
        scaleFactor: 2, //地图放大一级的缩放比例系数
        maxScale: 2, //图片的最大放大比例，随着地图放大图标会跟着放大，最大为2
        minScale: 1, //图片的最小缩小比例，随着地图缩小图标会跟着缩小，最小为1
      },
      label: {
        //文本标注
        content: item.address, //文本内容
        position: 'BM', //文本位置相对于图标的基准点，"BM"为底部中央
        minZoom: 15, //label的最小显示级别，即文本标注在地图15级及以上，才会显示
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
        content: item.address,
        position: 'BM',
        minZoom: 15,
      },
    },
  ]
  const zoomStyleMapping = {
    14: 0, //14-17级使用样式 0
    15: 0,
    16: 0,
    17: 0,
    18: 1, //18-20级使用样式 1
    19: 1,
    20: 1,
  }
  AMapStore.Amap.pluginManager.use('ElasticMarkerPlugin', {
    position: [item.location.lng, item.location.lat], //点标记位置
    styles: stylesArray, //指定样式列表
    zoomStyleMapping: zoomStyleMapping, //指定 zoom 与样式的映射
  })

}
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>