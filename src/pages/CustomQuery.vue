<template>
  <div class="absolute top-10 left-10 bg-white/95 backdrop-blur-md rounded-sm h-[90%] w-1/3 overflow-auto z-10">
    <!-- 面板头部 -->
    <div class="flex items-center border-b p-2">
      <h2 class=" font-bold text-gray-800">{{ $t('query.title') }}</h2>

    </div>
    <p class="text-sm text-red-600">{{ $t('query.description') }}</p>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Define the scope 区域 -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-4">
          <el-icon class="text-blue-500 text-lg">
            <Location />
          </el-icon>
          <h3 class="text-base font-semibold text-gray-700">{{ $t('query.scope.title') }}</h3>
        </div>

        <!-- 范围选择按钮 -->
        <div class="flex gap-3 mb-4">
          <el-button :type="activeScope === 'draw' ? 'primary' : 'default'" @click="activeScope = 'draw'"
            class="!rounded-lg !px-4 !py-2" :class="{ 'bg-[#4793eb]': activeScope === 'draw' }">
            <el-icon class="mr-1">
              <EditPen />
            </el-icon>
            {{ $t('query.scope.draw') }}
          </el-button>
          <el-button :type="activeScope === 'admin' ? 'primary' : 'default'" @click="activeScope = 'admin'"
            class="!rounded-lg !px-4 !py-2" :class="{ 'bg-[#4793eb]': activeScope === 'admin' }">
            <el-icon class="mr-1">
              <MapLocation />
            </el-icon>
            {{ $t('query.scope.admin') }}
          </el-button>
          <el-button :type="activeScope === 'dma' ? 'primary' : 'default'" @click="activeScope = 'dma'"
            class="!rounded-lg !px-4 !py-2" :class="{ 'bg-[#4793eb]': activeScope === 'dma' }">
            <el-icon class="mr-1">
              <DataBoard />
            </el-icon>
            {{ $t('query.scope.dma') }}
          </el-button>
        </div>

        <!-- Administrative Division 详细选项 -->
        <div v-if="activeScope === 'admin'" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="space-y-3">
            <!-- Citywide -->
            <div class="flex items-center">
              <el-checkbox v-model="adminOptions.citywide">Citywide</el-checkbox>
            </div>

            <!-- HK -->
            <div class="flex items-center gap-4">
              <el-checkbox v-model="adminOptions.hk.checked">HK</el-checkbox>
              <div v-if="adminOptions.hk.checked" class="flex items-center gap-3">
                <el-radio-group v-model="adminOptions.hk.district">
                  <el-radio label="D1">D1</el-radio>
                  <el-radio label="D2">D2</el-radio>
                  <el-radio label="D3">D3</el-radio>
                  <el-radio label="D4">D4</el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- K -->
            <div class="flex items-center gap-4">
              <el-checkbox v-model="adminOptions.k.checked">K</el-checkbox>
              <div v-if="adminOptions.k.checked" class="flex items-center gap-3">
                <el-radio-group v-model="adminOptions.k.district">
                  <el-radio label="D1">D1</el-radio>
                  <el-radio label="D2">D2</el-radio>
                  <el-radio label="D3">D3</el-radio>
                  <el-radio label="D4">D4</el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- NTE -->
            <div class="flex items-center gap-4">
              <el-checkbox v-model="adminOptions.nte.checked">NTE</el-checkbox>
              <div v-if="adminOptions.nte.checked" class="flex items-center gap-3">
                <el-radio-group v-model="adminOptions.nte.district">
                  <el-radio label="D1">D1</el-radio>
                  <el-radio label="D2">D2</el-radio>
                  <el-radio label="D3">D3</el-radio>
                  <el-radio label="D4">D4</el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- NTW -->
            <div class="flex items-center gap-4">
              <el-checkbox v-model="adminOptions.ntw.checked">NTW</el-checkbox>
              <div v-if="adminOptions.ntw.checked" class="flex items-center gap-3">
                <el-radio-group v-model="adminOptions.ntw.district">
                  <el-radio label="D1">D1</el-radio>
                  <el-radio label="D2">D2</el-radio>
                  <el-radio label="D3">D3</el-radio>
                  <el-radio label="D4">D4</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-3">{{ $t('query.scope.note') }}</p>
        </div>

        <!-- DMA_PMA 选项 -->
        <div v-if="activeScope === 'dma'" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <el-select v-model="selectedDmaPma" placeholder="Select DMA_PMA" class="w-full">
            <el-option label="DMA_001" value="dma_001" />
            <el-option label="PMA_001" value="pma_001" />
            <el-option label="DMA_002" value="dma_002" />
            <el-option label="PMA_002" value="pma_002" />
          </el-select>
        </div>
      </div>

      <!-- Select query criteria 区域 -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-4">
          <el-icon class="text-purple-500 text-lg">
            <Filter />
          </el-icon>
          <h3 class="text-base font-semibold text-gray-700">{{ $t('query.criteria.title') }}</h3>
        </div>

        <div class="space-y-4">
          <div v-for="(criterion, index) in queryCriteria" :key="criterion.id"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('query.scope.where') }} {{ index + 1 }}:
              </label>
              <div class="flex items-center gap-2">
                <el-button circle size="small" @click="addCriterion" class="!w-6 !h-6 !p-0">
                  <el-icon class="text-green-500">
                    <Plus />
                  </el-icon>
                </el-button>
                <el-button circle size="small" @click="removeCriterion(index)" :disabled="queryCriteria.length === 1"
                  class="!w-6 !h-6 !p-0">
                  <el-icon class="text-red-500">
                    <Minus />
                  </el-icon>
                </el-button>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2 items-center">
              <!-- Select Field -->
              <el-select v-model="criterion.field" placeholder="Select Field" class="w-full">
                <el-option label="Watermain" value="watermain" />
                <el-option label="Pipe" value="pipe" />
                <el-option label="Valve" value="valve" />
              </el-select>

              <!-- Field Attribute -->
              <el-select v-model="criterion.attribute" placeholder="Attribute" class="w-full">
                <el-option v-for="attr in getFieldAttributes(criterion.field)" :key="attr.value" :label="attr.label"
                  :value="attr.value" />
              </el-select>

              <!-- Select Condition -->
              <el-select v-model="criterion.condition" placeholder="Condition" class="w-full">
                <el-option label="=" value="=" />
                <el-option label="!=" value="!=" />
                <el-option label="<" value="<" />
                <el-option label="<=" value="<=" />
                <el-option label=">" value=">" />
                <el-option label=">=" value=">=" />
                <el-option label="LIKE" value="LIKE" />
              </el-select>

              <!-- Input Value -->
              <el-input v-model="criterion.value" placeholder="Value" class="w-full" />
            </div>

            <!-- Logic Operator (显示在条件之间) -->
            <div v-if="index < queryCriteria.length - 1" class="flex items-center gap-2 mt-3">
              <el-select v-model="logicOperators[index]" class="w-24">
                <el-option :label="$t('query.logic.and')" value="AND" />
                <el-option :label="$t('query.logic.or')" value="OR" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
      <el-button @click="handleReset" class="!rounded-lg !px-6 !py-2">
        <el-icon class="mr-1">
          <Refresh />
        </el-icon>
        {{ $t('query.actions.reset') }}
      </el-button>
      <el-button type="primary" @click="handleQuery" class="!rounded-lg !px-6 !py-2 'bg-[#4793eb]'">
        <el-icon class="mr-1">
          <Search />
        </el-icon>
        {{ $t('query.actions.query') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Close, Location, EditPen, MapLocation, DataBoard,
  Filter, Plus, Minus, Refresh
} from '@element-plus/icons-vue'

const router = useRouter()

// 范围选择
const activeScope = ref('admin') // 'draw', 'admin', 'dma'

// Administrative Division 选项
const adminOptions = reactive({
  citywide: false,
  hk: { checked: true, district: 'D2' },
  k: { checked: true, district: 'D1' },
  nte: { checked: false, district: 'D1' },
  ntw: { checked: false, district: 'D1' }
})

// DMA_PMA 选择
const selectedDmaPma = ref('')

// 查询条件
const queryCriteria = ref([
  {
    id: 1,
    field: 'watermain',
    attribute: 'DIAMETER',
    condition: '<=',
    value: '200'
  },
  {
    id: 2,
    field: 'watermain',
    attribute: 'MATERIAL',
    condition: '=',
    value: 'PE'
  }
])

// 逻辑运算符
const logicOperators = ref(['AND'])

// 字段属性映射
const getFieldAttributes = (field) => {
  const attributes = {
    watermain: [
      { label: 'DIAMETER', value: 'DIAMETER' },
      { label: 'MATERIAL', value: 'MATERIAL' },
      { label: 'LENGTH', value: 'LENGTH' },
      { label: 'INSTALL_DATE', value: 'INSTALL_DATE' }
    ],
    pipe: [
      { label: 'DIAMETER', value: 'DIAMETER' },
      { label: 'MATERIAL', value: 'MATERIAL' },
      { label: 'PRESSURE', value: 'PRESSURE' }
    ],
    valve: [
      { label: 'TYPE', value: 'TYPE' },
      { label: 'STATUS', value: 'STATUS' },
      { label: 'SIZE', value: 'SIZE' }
    ]
  }
  return attributes[field] || []
}

// 添加查询条件
const addCriterion = () => {
  const newId = Math.max(...queryCriteria.value.map(c => c.id), 0) + 1
  queryCriteria.value.push({
    id: newId,
    field: 'watermain',
    attribute: 'DIAMETER',
    condition: '=',
    value: ''
  })
  logicOperators.value.push('AND')
}

// 删除查询条件
const removeCriterion = (index) => {
  if (queryCriteria.value.length > 1) {
    queryCriteria.value.splice(index, 1)
    if (index < logicOperators.value.length) {
      logicOperators.value.splice(index, 1)
    }
  }
}

// 关闭面板
const handleClose = () => {
  router.push('/home')
}

// 重置
const handleReset = () => {
  activeScope.value = 'draw'
  adminOptions.citywide = false
  adminOptions.hk = { checked: false, district: 'D1' }
  adminOptions.k = { checked: false, district: 'D1' }
  adminOptions.nte = { checked: false, district: 'D1' }
  adminOptions.ntw = { checked: false, district: 'D1' }
  selectedDmaPma.value = ''
  queryCriteria.value = [{
    id: 1,
    field: 'watermain',
    attribute: 'DIAMETER',
    condition: '=',
    value: ''
  }]
  logicOperators.value = []
  console.log('Reset query conditions')
}

// 执行查询
const handleQuery = () => {
  const queryData = {
    scope: {
      type: activeScope.value,
      admin: activeScope.value === 'admin' ? adminOptions : null,
      dma: activeScope.value === 'dma' ? selectedDmaPma.value : null
    },
    criteria: queryCriteria.value.map((criterion, index) => ({
      ...criterion,
      logic: index < queryCriteria.value.length - 1 ? logicOperators.value[index] : null
    }))
  }
  console.log('Execute query:', queryData)
  // 这里可以调用API执行查询
}
</script>

<style scoped>
/* 渐变按钮样式 */
.gradient-button {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  font-weight: 600;
}

.gradient-button:hover {
  background: linear-gradient(to right, #2563eb, #7c3aed);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 自定义滚动条 */
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