/**
 * 高德地图插件管理器
 * 用于统一管理和使用高德地图的各种复杂插件
 */
export default class PluginManager {
  constructor(map, AMap) {
    this.map = map
    this.AMap = AMap
    this.instances = {}
    this.loadedPlugins = new Set() // 已加载的插件名称
  }

  /**
   * 加载插件
   * @param {string|Array} pluginNames - 插件名称或插件名称数组
   * @returns {Promise} 返回 Promise
   */
  loadPlugin(pluginNames) {
    return new Promise((resolve, reject) => {
      const plugins = Array.isArray(pluginNames) ? pluginNames : [pluginNames]
      const needLoad = plugins.filter((name) => !this.loadedPlugins.has(name))

      if (needLoad.length === 0) {
        resolve()
        return
      }

      this.AMap.plugin(needLoad, () => {
        needLoad.forEach((name) => this.loadedPlugins.add(name))
        resolve()
      })
    })
  }

  /**
   * 使用插件 - 创建插件实例
   * @param {string} pluginName - 插件名称（如 'Driving', 'PlaceSearch'）
   * @param {Object} options - 插件配置选项
   * @param {boolean} forceNew - 是否强制创建新实例（默认复用已存在的实例）
   * @returns {Promise} 返回插件实例
   */
  async use(pluginName, options = {}, forceNew = false) {
    const fullPluginName = this._getFullPluginName(pluginName)

    // 如果已存在实例且不强制新建，直接返回
    if (this.instances[pluginName] && !forceNew) {
      return this.instances[pluginName]
    }

    // 加载插件
    await this.loadPlugin(fullPluginName)

    // 创建插件实例
    const PluginClass = this._getPluginConstructor(fullPluginName)
    if (!PluginClass) {
      throw new Error(`插件 ${fullPluginName} 不存在或未正确加载`)
    }

    const instance = new PluginClass(options)
    this.instances[pluginName] = instance

    return instance
  }

  /**
   * 获取插件实例
   * @param {string} pluginName - 插件名称
   * @returns {Object|null} 插件实例
   */
  get(pluginName) {
    return this.instances[pluginName] || null
  }

  /**
   * 移除插件实例
   * @param {string} pluginName - 插件名称
   */
  remove(pluginName) {
    const instance = this.instances[pluginName]
    if (instance) {
      // 如果插件有 destroy 方法，调用它
      if (typeof instance.destroy === 'function') {
        instance.destroy()
      }
      // 如果插件有 clear 方法，调用它
      if (typeof instance.clear === 'function') {
        instance.clear()
      }
      delete this.instances[pluginName]
    }
  }

  /**
   * 清除所有插件实例
   */
  clear() {
    Object.keys(this.instances).forEach((pluginName) => {
      this.remove(pluginName)
    })
  }

  /**
   * 获取完整的插件名称
   * @private
   */
  _getFullPluginName(pluginName) {
    // 如果已经是完整名称（包含 AMap.），直接返回
    if (pluginName.startsWith('AMap.')) {
      return pluginName
    }
    // 否则添加 AMap. 前缀
    return `AMap.${pluginName}`
  }

  /**
   * 根据插件名称获取构造函数
   * 兼容 AMap.PlaceSearch 这类多级命名
   * @private
   */
  _getPluginConstructor(fullPluginName) {
    const nameWithoutPrefix = fullPluginName.replace(/^AMap\./, '')
    const nameParts = nameWithoutPrefix.split('.')
    let constructor = this.AMap

    for (const part of nameParts) {
      if (!constructor || typeof constructor[part] === 'undefined') {
        return null
      }
      constructor = constructor[part]
    }

    return constructor
  }

  // ========== 路线规划插件 ==========

  /**
   * 驾车路线规划
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Driving>}
   */
  async useDriving(options = {}) {
    return this.use('Driving', {
      map: this.map,
      panel: options.panel || null,
      hideMarkers: options.hideMarkers || false,
      showTraffic: options.showTraffic || false,
      ...options,
    })
  }

  /**
   * 公交路线规划
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Transfer>}
   */
  async useTransfer(options = {}) {
    return this.use('Transfer', {
      map: this.map,
      panel: options.panel || null,
      hideMarkers: options.hideMarkers || false,
      ...options,
    })
  }

  /**
   * 步行路线规划
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Walking>}
   */
  async useWalking(options = {}) {
    return this.use('Walking', {
      map: this.map,
      panel: options.panel || null,
      hideMarkers: options.hideMarkers || false,
      ...options,
    })
  }

  /**
   * 骑行路线规划
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Riding>}
   */
  async useRiding(options = {}) {
    return this.use('Riding', {
      map: this.map,
      panel: options.panel || null,
      hideMarkers: options.hideMarkers || false,
      ...options,
    })
  }

  /**
   * 货车路径规划
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.TruckDriving>}
   */
  async useTruckDriving(options = {}) {
    return this.use('TruckDriving', {
      map: this.map,
      panel: options.panel || null,
      hideMarkers: options.hideMarkers || false,
      ...options,
    })
  }

  // ========== 搜索插件 ==========

  /**
   * 地点搜索
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.PlaceSearch>}
   */
  async usePlaceSearch(options = {}) {
    return this.use('PlaceSearch', {
      map: this.map,
      panel: options.panel || null,
      pageSize: options.pageSize || 10,
      pageIndex: options.pageIndex || 1,
      city: options.city || '',
      citylimit: options.citylimit || false,
      autoFitView: options.autoFitView !== false,
      ...options,
    })
  }

  /**
   * 公交路线查询
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.LineSearch>}
   */
  async useLineSearch(options = {}) {
    return this.use('LineSearch', {
      city: options.city || '',
      ...options,
    })
  }

  /**
   * 公交站点查询
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.StationSearch>}
   */
  async useStationSearch(options = {}) {
    return this.use('StationSearch', {
      city: options.city || '',
      ...options,
    })
  }

  /**
   * 输入提示
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.AutoComplete>}
   */
  async useAutoComplete(options = {}) {
    return this.use('AutoComplete', {
      city: options.city || '',
      citylimit: options.citylimit || false,
      ...options,
    })
  }

  /**
   * 行政区查询
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.DistrictSearch>}
   */
  async useDistrictSearch(options = {}) {
    return this.use('DistrictSearch', {
      extensions: options.extensions || 'base',
      level: options.level || 'district',
      ...options,
    })
  }

  // ========== 定位和地理编码插件 ==========

  /**
   * 定位插件
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Geolocation>}
   */
  async useGeolocation(options = {}) {
    return this.use('Geolocation', {
      enableHighAccuracy: options.enableHighAccuracy !== false,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 0,
      convert: options.convert !== false,
      showButton: options.showButton !== false,
      buttonDom: options.buttonDom || null,
      showMarker: options.showMarker !== false,
      showCircle: options.showCircle !== false,
      panToLocation: options.panToLocation !== false,
      zoomToAccuracy: options.zoomToAccuracy !== false,
      ...options,
    })
  }

  /**
   * 地理编码
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Geocoder>}
   */
  async useGeocoder(options = {}) {
    return this.use('Geocoder', {
      city: options.city || '',
      radius: options.radius || 1000,
      ...options,
    })
  }

  /**
   * 坐标转换
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.ConvertFrom>}
   */
  async useConvertFrom(options = {}) {
    return this.use('ConvertFrom', options)
  }

  // ========== 标记和覆盖物插件 ==========

  /**
   * 灵活点标记
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.ElasticMarker>}
   */
  async useElasticMarker(options = {}) {
    return this.use('ElasticMarker', {
      map: this.map,
      ...options,
    })
  }

  // ========== 工具插件 ==========

  /**
   * 鼠标工具
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.MouseTool>}
   */
  async useMouseTool(options = {}) {
    return this.use('MouseTool', {
      map: this.map,
      ...options,
    })
  }

  /**
   * 测距工具
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.RangingTool>}
   */
  async useRangingTool(options = {}) {
    return this.use('RangingTool', {
      map: this.map,
      ...options,
    })
  }

  // ========== 其他插件 ==========

  /**
   * 天气查询
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.Weather>}
   */
  async useWeather(options = {}) {
    return this.use('Weather', {
      city: options.city || '',
      ...options,
    })
  }

  /**
   * 热力图
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.HeatMap>}
   */
  async useHeatMap(options = {}) {
    return this.use('HeatMap', {
      map: this.map,
      ...options,
    })
  }

  /**
   * 点聚合
   * @param {Object} options - 配置选项
   * @returns {Promise<AMap.MarkerCluster>}
   */
  async useMarkerCluster(options = {}) {
    return this.use('MarkerCluster', {
      map: this.map,
      ...options,
    })
  }
}
