// PluginManager.js
import * as complexPlugins from './plugins/complex'

export default class PluginManager {
  constructor(map, AMap) {
    this.map = map
    this.AMap = AMap
    this.instances = {}
  }

  use(name, options = {}) {
    const PluginClass = complexPlugins[name]

    if (!PluginClass) {
      console.warn(`Plugin not found: ${name}`)
      return
    }

    // 已创建 → 复用实例，并执行 update()
    if (this.instances[name]) {
      this.instances[name].update(options)
      return this.instances[name]
    }

    // 首次创建
    const instance = new PluginClass(this.map, this.AMap, options)
    this.instances[name] = instance
    return instance
  }
}
