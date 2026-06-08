import { computed, onMounted, reactive, ref, watch, unref } from 'vue'
import dayjs from 'dayjs'
import { processAuditApi } from '@/services/processAudit'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGlobalStore } from '@/stores/global'
import { exportToExcel } from '../utils/index'
const companyPool = ['测试A', '测试B']

const apiMode = window.global_config.system.apiMode
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const statusTag = (status) => {
  if (status === 'approved') return { type: 'success', text: '已通过' }
  if (status === 'rejected') return { type: 'danger', text: '已驳回' }
  return { type: 'warning', text: '待审核' }
}

const formatDate = (val) => {
  if (!val) return '-'
  return dayjs(val).format('YYYY/MM/DD')
}

export function useAudit(options) {
  const { createNewSegment, calcMetric, metricLabel, setDetailVisible, setSelectedItem, setSelectedSegmentId, getDetailVisible, getSelectedItem, getSelectedSegmentId } = options

  const getStorageKey = () => unref(options.storageKey)
  const getAuditType = () => unref(options.auditType)
  const getSegmentLabel = () => unref(options.segmentLabel)

  const auditType = computed(() => getAuditType())
  const segmentLabel = computed(() => getSegmentLabel())

  const globalStore = useGlobalStore()

  const state = reactive({
    loading: false,
    filters: {
      dateRange: [],
      status: '',
      keyword: '',
      roadType: '',
    },
    page: 1,
    pageSize: 10,
    total: 0,
    rows: [],
  })

  const viewMode = ref('list')
  const auditVisible = ref(false)
  const auditForm = reactive({
    decision: 'approved',
    remark: '',
  })
  const auditTarget = ref(null)

  const createForm = reactive({
    companyName: companyPool[0],
    applyDate: dayjs().toDate(),
    contactName: '',
    contactPhone: '',
    segments: [],
  })

  const currentSegmentIndex = ref(0)

  const currentSegment = computed(() => {
    return createForm.segments[currentSegmentIndex.value] || null
  })

  const drawnMetric = computed(() => {
    return currentSegment.value ? calcMetric(currentSegment.value.coords) : 0
  })

  const activeKeys = {
    area_audit_rows_v1: 'getAreaAudit',
    line_audit_rows_v1: 'getLineAudit',
    res_line_audit_rows_v1: 'getLineAudit',
    parking_audit_rows_v1: 'getPointAudit',
  }

  // 加载数据（接口/本地）
  const loadRows = async () => {
    state.loading = true // 接口请求时加 loading
    try {
      const key = getStorageKey()
      let result = []
      if (apiMode === 'service') {
        const params = {
          page: state.page,
          size: state.pageSize,
          // 把筛选条件传给后端（必须加，否则后端分页无筛选）
          status: state.filters.status,
          keyword: state.filters.keyword,
          startDate: state.filters.dateRange?.[0] ? dayjs(state.filters.dateRange[0]).format('YYYY-MM-DD') : '',
          endDate: state.filters.dateRange?.[1] ? dayjs(state.filters.dateRange[1]).format('YYYY-MM-DD') : '',
        }
        if (key === 'res_line_audit_rows_v1' || key === 'line_audit_rows_v1') {
          params.type = key === 'res_line_audit_rows_v1' ? 'resLine' : 'line'
        }
        const res = await processAuditApi[activeKeys[key]](params)
        if (res.code === 200) {
          state.total = res.data.total || 0
          result = res.data.records || []
        }
      } else {
        const raw = sessionStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          result = Array.isArray(parsed) ? parsed : []
        }
      }
      state.rows = result
      return result
    } catch (error) {
      ElMessage.error(error.message || '获取审核列表失败')
      return []
    } finally {
      state.loading = false
    }
  }

  const saveRows = async (row) => {
    const key = getStorageKey()
    try {
      if (apiMode === 'service') {
        const activeKeys = {
          area_audit_rows_v1: 'addAreaAudit',
          line_audit_rows_v1: 'addLineAudit',
          res_line_audit_rows_v1: 'addLineAudit',
          parking_audit_rows_v1: 'addPointAudit',
        }
        const res = await processAuditApi[activeKeys[key]](row)
        if (res.code === 200) {
          ElMessage.success('新增成功')
          await loadRows()
        } else {
          ElMessage.error(res.msg || '新增失败')
        }
      } else {
        sessionStorage.setItem(key, JSON.stringify(state.rows || []))
      }
    } catch (error) {
      ElMessage.error(error.message || '新增失败')
    }
  }

  onMounted(async () => {
    await loadRows()
  })

  // 页码、页大小变化 → 重新加载
  watch(
    () => [state.page, state.pageSize],
    async () => {
      await loadRows()
    },
    { deep: true },
  )

  // 筛选条件变化 → 重置页码并重新加载
  watch(
    () => [state.filters.status, state.filters.keyword, state.filters.dateRange],
    async () => {
      state.page = 1
      await loadRows()
    },
    { deep: true },
  )

  // storageKey 切换 → 重置并加载
  watch(
    () => getStorageKey(),
    async () => {
      state.page = 1
      state.filters = { dateRange: [], status: '', keyword: '' }
      await loadRows()
      viewMode.value = 'list'
    },
  )

  // 本地模式才做前端过滤
  const filteredRows = computed(() => {
    if (apiMode === 'service') return state.rows

    const { dateRange, status, keyword } = state.filters
    return state.rows.filter((row) => {
      if (status && row.status !== status) return false
      if (keyword) {
        const kw = String(keyword).trim()
        const hit = String(row.companyName || '').includes(kw) || String(row.contactName || '').includes(kw) || String(row.contactPhone || '').includes(kw)
        if (!hit) return false
      }
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange
        if (start && end) {
          const t = dayjs(row.applyDate).valueOf()
          const s = dayjs(start).startOf('day').valueOf()
          const e = dayjs(end).endOf('day').valueOf()
          if (t < s || t > e) return false
        }
      }
      return true
    })
  })

  // 总数
  const total = computed(() => (apiMode === 'service' ? state.total : filteredRows.value.length))

  // ✅ 核心：service 直接返回接口数据，不走本地分页
  const pageRows = computed(() => {
    if (apiMode === 'service') {
      return state.rows
    }
    // 本地模式走前端分页
    const start = (state.page - 1) * state.pageSize
    return filteredRows.value.slice(start, start + state.pageSize)
  })

  const onSearch = () => {
    state.page = 1
    loadRows() // 搜索时重新请求接口
  }

  const onReset = () => {
    state.filters.dateRange = []
    state.filters.status = ''
    state.filters.keyword = ''
    state.page = 1
    loadRows() // 重置时重新请求
  }

  const indexMethod = (index) => (state.page - 1) * state.pageSize + index + 1

  const openDetail = (row) => {
    setSelectedItem(row)
    setSelectedSegmentId(row?.segments?.[0]?.id || '')
    setDetailVisible(true)
  }

  const openAudit = (row) => {
    auditTarget.value = row
    auditForm.decision = row.status === 'rejected' ? 'rejected' : 'approved'
    auditForm.remark = row.remark || ''
    auditVisible.value = true
  }

  const submitAudit = async () => {
    const activeKeys = {
      area_audit_rows_v1: 'auditAreaAudit',
      line_audit_rows_v1: 'auditLineAudit',
      res_line_audit_rows_v1: 'auditLineAudit',
      parking_audit_rows_v1: 'auditPointAudit',
    }
    const key = getStorageKey()
    try {
      if (apiMode === 'service') {
        const res = await processAuditApi[activeKeys[key]]({
          id: auditTarget.value.id,
          status: auditForm.decision,
          remark: auditForm.remark || '',
        })
        console.log('res', res)
      }
      if (!auditTarget.value) return
      if (auditForm.decision === 'rejected' && !String(auditForm.remark || '').trim()) {
        ElMessage.warning('驳回时请填写原因')
        return
      }
      auditTarget.value.status = auditForm.decision
      auditTarget.value.remark = String(auditForm.remark || '')
      auditVisible.value = false
      if (getSelectedItem()?.id === auditTarget.value.id) {
        setSelectedItem(auditTarget.value)
      }
      if (apiMode !== 'service') {
        saveRows()
      }
      ElMessage.success('已提交审批结果')
      // 审核成功后刷新列表
      loadRows()
    } catch (error) {
      ElMessage.error('审核失败')
    }
  }

  const removeRow = async (row) => {
    const activeKeys = {
      area_audit_rows_v1: 'deleteAreaAudit',
      line_audit_rows_v1: 'deleteLineAudit',
      res_line_audit_rows_v1: 'deleteLineAudit',
      parking_audit_rows_v1: 'deletePointAudit',
    }
    const key = getStorageKey()
    try {
      await ElMessageBox.confirm(`确认删除 ${row.companyName || '-'} 的申请记录？`, '提示', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
      if (apiMode === 'service') {
        const res = await processAuditApi[activeKeys[key]]({
          id: row.id,
        })
        if (res.code === 200) {
          ElMessage.success('删除成功')
          loadRows()
        }
        console.log('res', res)
      } else {
        state.rows = state.rows.filter((r) => r.id !== row.id)
      }

      if (getSelectedItem()?.id === row.id) {
        setDetailVisible(false)
        setSelectedItem(null)
        setSelectedSegmentId('')
      }
      if (apiMode !== 'service') {
        saveRows()
        if ((state.page - 1) * state.pageSize >= total.value && state.page > 1) {
          state.page -= 1
        }
      }
    } catch {
      return
    }
  }

  const addSegment = () => {
    createForm.segments.push(createNewSegment(createForm.segments.length))
    currentSegmentIndex.value = createForm.segments.length - 1
  }

  const removeSegment = (index) => {
    if (createForm.segments.length <= 1) {
      ElMessage.warning(`至少保留一个${segmentLabel.value}`)
      return
    }
    createForm.segments.splice(index, 1)
    if (currentSegmentIndex.value >= createForm.segments.length) {
      currentSegmentIndex.value = createForm.segments.length - 1
    }
  }

  const openCreate = () => {
    createForm.companyName = companyPool[0]
    createForm.applyDate = dayjs().toDate()
    createForm.contactName = ''
    createForm.contactPhone = ''
    createForm.segments = [createNewSegment(0)]
    currentSegmentIndex.value = 0
    viewMode.value = 'create'
  }

  const onExport = (headerMap, fileName = 'export') => {
    const data = filteredRows.value || []
    const exportData = data.map((item) => {
      const row = {}
      Object.keys(headerMap).forEach((key) => {
        row[key] = item[key]
      })
      row.status = statusOptions.find((opt) => opt.value === row.status)?.label || row.status
      return row
    })
    exportToExcel(exportData, fileName, headerMap)
  }

  const submitCreate = (options = {}) => {
    const { onSubmit, renderAll, drawType } = options

    const companyName = String(createForm.companyName || '').trim()
    if (!companyName) {
      ElMessage.warning('请输入申请企业')
      return
    }
    const contactName = String(createForm.contactName || '').trim()
    if (!contactName) {
      ElMessage.warning('请输入联系人')
      return
    }
    const contactPhone = String(createForm.contactPhone || '').trim()
    if (contactPhone && !/^\d{6,20}$/.test(contactPhone)) {
      ElMessage.warning('联系方式格式不正确')
      return
    }

    if (!createForm.segments || createForm.segments.length === 0) {
      ElMessage.warning(`请至少添加一个${segmentLabel.value}`)
      return
    }

    if (onSubmit) {
      return onSubmit({
        companyName,
        contactName,
        contactPhone,
        createForm,
        state,
        saveRows,
        viewMode,
      })
    }
  }

  return {
    state,
    viewMode,
    auditVisible,
    auditForm,
    auditTarget,
    createForm,
    currentSegmentIndex,
    currentSegment,
    drawnMetric,
    companyPool,
    statusOptions,
    statusTag,
    formatDate,
    filteredRows,
    total,
    pageRows,
    onSearch,
    onReset,
    indexMethod,
    openDetail,
    openAudit,
    submitAudit,
    removeRow,
    addSegment,
    removeSegment,
    openCreate,
    onExport,
    submitCreate,
    metricLabel,
    segmentLabel,
    auditType,
    saveRows,
    loadRows,
  }
}
