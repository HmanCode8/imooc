<template>
  <div class="">
    <SimpleInfiniteTable :data="tableData" :columns="columns" :title="tableTitle" height="auto"
      :scroll-speed="scrollSpeed" :auto-start="autoStart" :show-controls="showControls" :show-header="showHeader"
      :show-stats="showStats" @row-click="handleRowClick" @scroll-start="handleScrollStart"
      @scroll-stop="handleScrollStop">
      <!-- 自定义状态列 -->
      <template #cell-time="{ value }">
        <span class="time-text" :title="value">{{ value }}21</span>
      </template>
    </SimpleInfiniteTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SimpleInfiniteTable from './SimpleInfiniteTable.vue'

// 表格配置
const tableTitle = ref('实时数据监控表')
const scrollSpeed = ref(30)
const autoStart = ref(true)
const showControls = ref(true)
const showHeader = ref(false)
const showStats = ref(false)

// 表格列配置
const columns = ref([
  // {
  //   key: 'id',
  //   title: 'ID',
  //   width: '60px',
  //   className: 'text-center'
  // },
  {
    key: 'name',
    title: '设备名称',
    width: '120px'
  },
  {
    key: 'type',
    title: '设备类型',
    width: '80px'
  },
  {
    key: 'status',
    title: '状态',
    width: '80px',
    className: 'text-center'
  },
  // {
  //   key: 'value',
  //   title: '数值',
  //   width: '80px',
  //   className: 'text-right'
  // },
  // {
  //   key: 'location',
  //   title: '位置',
  //   width: '60px'
  // },
  // {
  //   key: 'time',
  //   title: '更新时间',
  //   width: '120px'
  // }
])

// 模拟数据
const tableData = ref([])

// 生成模拟数据
const generateMockData = (count) => {
  const devices = ['报警器', '传感器', '执行器', '控制器', '显示器']
  const statuses = ['正常', '警告', '故障', '离线']
  const locations = ['A区', 'B区', 'C区', 'D区']

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `设备-${String(index + 1).padStart(4, '0')}`,
    type: devices[index % devices.length],
    status: statuses[index % statuses.length],
    value: (Math.random() * 100).toFixed(2),
    location: locations[index % locations.length],
    time: new Date(Date.now() - Math.random() * 86400000).toLocaleString()
  }))
}

// 处理行点击
const handleRowClick = (data) => {
  console.log('点击行:', data)
}

// 处理滚动开始
const handleScrollStart = () => {
  console.log('开始滚动')
}

// 处理滚动停止
const handleScrollStop = () => {
  console.log('停止滚动')
}

// 初始化
onMounted(() => {
  tableData.value = generateMockData(10) // 生成10条数据
})
</script>

<style scoped>
/* 状态徽章样式 - 使用 Tailwind CSS */
.status-badge {
  @apply inline-block px-2 py-1 rounded-full text-xs font-medium text-center min-w-12;
}

.status-normal {
  @apply bg-green-500/20 text-green-400 border border-green-400/30;
}

.status-warning {
  @apply bg-yellow-500/20 text-yellow-400 border border-yellow-400/30;
}

.status-error {
  @apply bg-red-500/20 text-red-400 border border-red-400/30;
}

.status-offline {
  @apply bg-gray-500/20 text-gray-400 border border-gray-400/30;
}

/* 数值样式 - 使用 Tailwind CSS */
.value-text {
  @apply font-semibold font-mono;
}

.value-high {
  @apply text-red-400;
}

.value-medium {
  @apply text-yellow-400;
}

.value-low {
  @apply text-green-400;
}

/* 时间样式 - 使用 Tailwind CSS */
.time-text {
  @apply text-red-900 text-xs;
}

/* 响应式字体大小 - 使用 Tailwind CSS */
/* @media (min-width: 1920px) {
  .status-badge {
    @apply text-sm;
  }

  .time-text {
    @apply text-sm;
  }
}

@media (min-width: 3840px) {
  .status-badge {
    @apply text-base;
  }

  .time-text {
    @apply text-base;
  }
}

@media (min-width: 11520px) {
  .status-badge {
    @apply text-lg;
  }

  .time-text {
    @apply text-lg;
  }
} */
</style>
