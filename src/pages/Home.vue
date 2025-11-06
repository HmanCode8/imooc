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
        <div class="bg-white h-8 w-8 flex items-center rounded-sm hover:cursor-pointer justify-center  ml-2 text-[#000]"
          @click="showLocationPanel = true">
          <el-icon class="flex items-center justify-center ">
            <Location class="text-xl" />
          </el-icon>
        </div>

      </div>
    </div>

    <!-- 搜索结果面板 -->
    <div v-if="showResultsPanel" class="mt-2 bg-white">
      <!-- 面板头部 -->
      <div class="flex items-center justify-between p-1 border-b border-gray-200">
        <h3 class=" text-gray-800">
          The search returned {{ totalResults }} results.
        </h3>
        <el-button circle text @click="closeResultsPanel" class="">
          <el-icon class="text-gray-600 text-xl">
            <Close />
          </el-icon>
        </el-button>
      </div>

      <!-- 结果列表 -->
      <div class="flex-1 overflow-y-auto p-2 shadow-2xl h-96">
        <div v-for="(item, index) in paginatedResults" :key="item.id"
          class="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          @click="handleResultClick(item)">
          <!-- 蓝色圆形数字图标 -->
          <div
            class="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </div>

          <!-- 文本内容 -->
          <div class="flex-1 min-w-0">
            <div class="text-base font-medium text-gray-800 mb-1 truncate">
              {{ item.title }}
            </div>
            <div class="text-sm text-gray-600 truncate">
              {{ item.subtitle }}
            </div>
          </div>

          <!-- 位置图标 -->
          <div class="flex-shrink-0">
            <el-icon class="text-blue-500 ">
              <Location />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="flex items-center justify-between p-2 border-t border-gray-200">
        <div class="text-sm text-gray-600">
          Total {{ totalResults }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 搜索相关
const searchInput = ref('20')
const showResultsPanel = ref(false)
const searchResults = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 模拟搜索结果数据
const mockResults = [
  { id: 1, title: 'Manna Cove Block 100', subtitle: '国湖居200座' },
  { id: 2, title: 'The Riviera Block 20', subtitle: '滿花園20座' },
  { id: 3, title: 'Ming Shun Village 204', subtitle: '明顺村204號' },
  { id: 4, title: 'Lady MacLehose Holidy Village 20-21', subtitle: '麥理浩夫人度假村20-21' },
  { id: 5, title: 'Block 25', subtitle: '25座' },
  { id: 6, title: 'Block 30', subtitle: '30座' },
  { id: 7, title: 'Block 35', subtitle: '35座' },
  { id: 8, title: 'Block 40', subtitle: '40座' },
  { id: 9, title: 'Block 45', subtitle: '45座' },
  { id: 10, title: 'Block 50', subtitle: '50座' },
  { id: 11, title: 'Block 55', subtitle: '55座' },
  { id: 12, title: 'Block 60', subtitle: '60座' },
  { id: 13, title: 'Block 65', subtitle: '65座' },
  { id: 14, title: 'Block 70', subtitle: '70座' },
  { id: 15, title: 'Block 75', subtitle: '75座' },
]

// 计算分页后的结果
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return searchResults.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalResults.value / pageSize.value)
})

// 计算可见的页码
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 10) {
    // 如果总页数少于等于10，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总是显示第一页
    pages.push(1)

    if (current <= 4) {
      // 当前页在前4页，显示 1, 2, 3, ..., 10
      for (let i = 2; i <= 3; i++) {
        pages.push(i)
      }
      if (total > 4) {
        pages.push('...')
      }
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后4页，显示 1, ..., 7, 8, 9, 10
      pages.push('...')
      for (let i = total - 2; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间，显示 1, ..., current-1, current, current+1, ..., 10
      pages.push('...')
      pages.push(current - 1)
      pages.push(current)
      pages.push(current + 1)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 搜索处理
const handleSearch = () => {
  if (!searchInput.value) {
    return
  }

  // 模拟搜索 - 这里应该调用实际的API
  // 根据搜索关键词生成结果
  const searchNum = parseInt(searchInput.value) || 20
  totalResults.value = 100 // 模拟总共100条结果

  // 生成搜索结果（这里简化处理，实际应该从API获取）
  searchResults.value = [...mockResults]

  currentPage.value = 1
  showResultsPanel.value = true
}

// 关闭结果面板
const closeResultsPanel = () => {
  showResultsPanel.value = false
}

// 点击位置图标
const handleLocationClick = () => {
  console.log('Location clicked')
  // 这里可以实现定位功能
}

// 点击搜索结果项
const handleResultClick = (item) => {
  console.log('Result clicked:', item)
  // 这里可以实现地图定位到该结果
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