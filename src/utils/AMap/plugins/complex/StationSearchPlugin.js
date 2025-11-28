export class StationSearchPlugin {
  constructor(map, AMap, options = {}) {
    this.AMap = AMap
    this.options = options
    this.instance = null
  }

  init() {
    this.instance = new this.AMap.StationSearch({
      pageIndex: 1,
      pageSize: 20,
      ...this.options,
    })
  }

  search(keyword) {
    return new Promise((resolve) => {
      this.instance.search(keyword, (status, result) => {
        resolve({ status, result })
      })
    })
  }
}
