export class GeolocationPlugin {
  constructor(map, AMap, options = {}) {
    this.map = map
    this.AMap = AMap
    this.options = options
    this.instance = null
  }

  init() {
    this.instance = new this.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      ...this.options,
    })

    this.map.addControl(this.instance)
  }

  getLocation() {
    return new Promise((resolve) => {
      this.instance.getCurrentPosition((status, result) => {
        resolve({ status, result })
      })
    })
  }

  destroy() {
    this.map.removeControl(this.instance)
  }
}
