export default class BasePlugins {
  constructor(map, AMap, options = {}) {
    this.map = map
    this.AMap = AMap
    this.options = options
    this.instance = null
    this.currentRoute = null
  }

  init() {
    throw new Error('子类必须实现init方法')
  }

  destroy() {
    if (this.currentRoute) {
      this.currentRoute.clear()
    }
  }
}
