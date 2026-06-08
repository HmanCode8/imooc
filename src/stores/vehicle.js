import { defineStore } from 'pinia'
import { carData, normalizeCar, createDefaultHistory } from '@/mock/car'
import { useGlobalStore } from '@/stores/global'
import previewcar from '@/assets/previewcar.webp'

const STORAGE_KEY = 'yutu-vehicle-list'

const apiMode = () => window.global_config?.system?.apiMode ?? 'mock'

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveToStorage(list) {
  if (apiMode() === 'service') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('车辆列表持久化失败', e)
  }
}

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    list: [],
    initialized: false,
  }),
  getters: {
    vehicleList: (state) => state.list,
    getById: (state) => (id) => state.list.find((c) => c.id === id),
  },
  actions: {
    init() {
      if (this.initialized) return
      const stored = loadFromStorage()
      this.list = (stored ?? carData).map((car, i) => normalizeCar(car, i))
      this.initialized = true
      this.syncToGlobal()
    },

    /** 从接口或外部同步整表（如地图加载后） */
    setList(data) {
      this.list = (data || []).map((car, i) => normalizeCar(car, i))
      this.initialized = true
      saveToStorage(this.list)
      this.syncToGlobal()
    },

    syncToGlobal() {
      const globalStore = useGlobalStore()
      globalStore.setCarList([...this.list])
    },

    addVehicle(payload) {
      if (this.list.some((c) => c.id === payload.id)) {
        throw new Error('车架号已存在')
      }
      const index = this.list.length
      const raw = {
        ...payload,
        photo: payload.photo || previewcar,
        history: payload.history || createDefaultHistory(),
        terminalInfo: payload.terminalInfo || {
          speed: 0,
          status: payload.status === 'offline' ? '离线' : '自动驾驶',
          power: 80,
          signalStatus: '强',
        },
      }
      const car = normalizeCar(raw, index)
      this.list.push(car)
      saveToStorage(this.list)
      this.syncToGlobal()
      return car
    },

    updateVehicle(id, payload) {
      const idx = this.list.findIndex((c) => c.id === id)
      if (idx === -1) throw new Error('车辆不存在')
      const merged = { ...this.list[idx], ...payload, id }
      this.list[idx] = normalizeCar(merged, idx)
      saveToStorage(this.list)
      this.syncToGlobal()
      return this.list[idx]
    },

    removeVehicle(id) {
      const idx = this.list.findIndex((c) => c.id === id)
      if (idx === -1) throw new Error('车辆不存在')
      this.list.splice(idx, 1)
      saveToStorage(this.list)
      this.syncToGlobal()
    },
  },
})
