export class DrivingPlugin {
  constructor(map, AMap, options = {}) {
    this.map = map
    this.AMap = AMap
    this.options = options
    this.instance = null
    this.currentRoute = null
  }

  init() {
    this.instance = new this.AMap.Driving({
      map: this.map,
      showTraffic: true,
      ...this.options,
    })
  }

  search(start, end) {
    return new Promise((resolve) => {
      if (this.currentRoute) {
        this.currentRoute.clear()
      }

      this.instance.search(start, end, (status, result) => {
        this.currentRoute = this.instance
        resolve({ status, result })
      })
    })
  }

  destroy() {
    if (this.currentRoute) {
      this.currentRoute.clear()
    }
  }
}
