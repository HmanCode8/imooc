import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isSplitScreen: false,
    latitudeAndLongitude: null,
  }),
  actions: {
    setSplitScreen(value) {
      this.isSplitScreen = value
    },
    setLatitudeAndLongitude(value) {
      this.latitudeAndLongitude = value
    },
  },
})
