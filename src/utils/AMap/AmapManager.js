import AMapLoader from '@amap/amap-jsapi-loader'
import PluginManager from './pluginManager'
const PLUGINS = [
  {
    key: 'AMap.ToolBar',
    name: '工具条，控制地图的缩放、平移等',
  },
  {
    key: 'AMap.Scale',
    name: '比例尺，显示地图在当前层级和纬度下的比例尺',
  },
  {
    key: 'AMap.HawkEye',
    name: '鹰眼，显示缩略图',
  },
  {
    key: 'AMap.MapType',
    name: '地图类型切换，提供地图、卫星、卫星+路网等视图',
  },
  {
    key: 'AMap.Geolocation',
    name: '定位，获取用户当前定位信息',
  },
  {
    key: 'AMap.Driving',
    name: '驾车导航，提供驾车路线规划',
  },
  {
    key: 'AMap.StationSearch',
    name: '公交站点查询，提供公交站点查询服务',
  },
  {
    key: 'AMap.ElasticMarker',
    name: '弹性点标记，可拖拽、可缩放、可旋转',
  },
]
export default class AMapManager {
  constructor() {
    this.map = null
    this.markers = []
  }

  getAMap() {
    return new Promise((resolve, reject) => {
      window._AMapSecurityConfig = {
        securityJsCode: '6085427d676bf31809b13d14ff59d5c2',
      }
      AMapLoader.load({
        key: '7f5ef064337ed54bb3c512342009a0aa', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: PLUGINS.map((item) => item.key), //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          resolve(AMap)
        })
        .catch((e) => {
          console.log(e)
        })
    })
  }
  // 添加地图控件
  _addcontroller = (AMap) => {
    const toolbar = new AMap.ToolBar() //创建工具条插件实例
    this.map.addControl(toolbar) //添加工具条插件到页面
    const scale = new AMap.Scale()
    this.map.addControl(scale)
    const overView = new AMap.HawkEye()
    this.map.addControl(overView)
    const mapType = new AMap.MapType()
    this.map.addControl(mapType)
  }
  // 添加插件
  _addPlugins = (AMap) => {
    this.pluginManager = new PluginManager(this.map, AMap)
  }
  getPluginManager() {
    return this.pluginManager
  }
  initMap(mapId, options) {
    return new Promise(async (resolve, reject) => {
      try {
        const AMap = await this.getAMap(mapId, options)
        const map = new AMap.Map(mapId, options)
        this.map = map
        map.on('click', function (ev) {
          //触发事件的对象
          var target = ev.target
          //触发事件的地理坐标，AMap.LngLat 类型
          var lnglat = ev.lnglat
          //触发事件的像素坐标，AMap.Pixel 类型
          var pixel = ev.pixel
          //触发事件类型
          var type = ev.type
          console.log(ev, 'ev')
        })
        this._addcontroller(AMap)
        this._addPlugins(AMap)
        resolve(map)
      } catch (error) {
        reject(error)
      }
    })
  }
  getMap() {
    return this.map
  }
}
