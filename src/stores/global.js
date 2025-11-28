import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isSplitScreen: false,
    latitudeAndLongitude: null,
    // 二三维联动视图状态
    linkedView: {
      lon: 114.1672,
      lat: 22.2783,
      zoom: 16,      // 2D
      height: 2100,  // 3D
      source: null,  // '2d' | '3d' | null
    },
  }),
  actions: {
    setSplitScreen(value) {
      this.isSplitScreen = value
    },
    setLatitudeAndLongitude(value) {
      this.latitudeAndLongitude = value
    },
    setLinkedView(payload) {
      // payload: { lon, lat, zoom?, height?, source }
      this.linkedView = { ...this.linkedView, ...payload }
    },
  },
})
