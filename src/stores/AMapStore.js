import { defineStore } from 'pinia'

export const useAMapStore = defineStore('AMap', {
  state: () => ({
    Amap: null,
    pluginsManager: null,
  }),
  actions: {
    setMap(map) {
      this.Amap = map
    },
    setPluginsManager(plugins) {
      this.pluginsManager = plugins
    },
  },
})
