import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import WMTS from 'ol/source/WMTS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { get as getProjection, fromLonLat, toLonLat } from 'ol/proj.js'
import { getTopLeft, getWidth } from 'ol/extent.js'
import ScaleLine from 'ol/control/ScaleLine.js'
import { MousePosition } from 'ol/control.js'
import { createStringXY } from 'ol/coordinate.js'

export default class MapManager {
  constructor(targetId, tk) {
    this.tk = tk
    this.targetId = targetId
    this.layerMaps = {}
    this.mapType = 'vector'
    this.map = null
    this.epsg4326 = 'EPSG:4326'
    this.epsg3857 = 'EPSG:3857'
  }

  // ✅ 创建 WMTS 图层
  createWmtsLayer(url, layer, epsg, matrixSet) {
    const projection = getProjection(epsg)
    if (!projection) {
      throw new Error(`Projection ${epsg} not available`)
    }
    const projectionExtent = projection.getExtent()
    const size = getWidth(projectionExtent) / 256
    const resolutions = []
    const matrixIds = []
    for (let z = 1; z <= 18; z++) {
      resolutions[z] = size / Math.pow(2, z)
      matrixIds[z] = String(z)
    }

    return new TileLayer({
      source: new WMTS({
        url: `${url}?tk=${this.tk}`,
        layer: layer,
        matrixSet,
        format: 'tiles',
        style: 'default',
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions,
          matrixIds,
        }),
        projection,
      }),
    })
  }

  // ✅ 初始化地图
  initMap(center = [114.1672, 22.2783], zoom = 16) {
    // 注册投影，经纬度坐标系
    // const VecLayer = createWmtsLayer('http://t0.tianditu.gov.cn/vec_c/wmts', 'vec', epsg4326, 'c')
    // const imgLayer = createWmtsLayer('http://t0.tianditu.gov.cn/img_c/wmts', 'img', epsg4326, 'c')
    // const cvaLayer = createWmtsLayer('http://t0.tianditu.gov.cn/cva_c/wmts', 'cva', epsg4326, 'c')
    // const ciaLayer = createWmtsLayer('http://t0.tianditu.gov.cn/cia_c/wmts', 'cia', epsg4326, 'c')

    // //注册头晕，墨卡托投影
    // const vecLayer2 = createWmtsLayer('http://t0.tianditu.gov.cn/vec_w/wmts', 'vec', epsg3857, 'w')
    // const ciaLayer2 = createWmtsLayer('http://t0.tianditu.gov.cn/cia_w/wmts', 'cia', epsg3857, 'w')

    const vecLayer = this.createWmtsLayer('http://t0.tianditu.gov.cn/vec_w/wmts', 'vec', this.epsg3857, 'w')
    const cvaLayer = this.createWmtsLayer('http://t0.tianditu.gov.cn/cva_w/wmts', 'cva', this.epsg3857, 'w')
    cvaLayer.setZIndex(2)

    this.layerMaps.vec = vecLayer
    this.layerMaps.cva = cvaLayer

    this.map = new Map({
      target: this.targetId,
      layers: [vecLayer, cvaLayer],
      view: new View({
        center: fromLonLat(center),
        zoom,
        projection: this.epsg3857,
      }),
    })

    this._addControls()
    console.log('✅ 地图初始化完成')
  }

  // ✅ 添加常用控件
  _addControls() {
    const scaleLineControl = new ScaleLine({
      units: 'metric',
      minWidth: 100,
      className: 'absolute bottom-1  left-4 text-black',
    })
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'absolute bottom-2 left-24 text-black',
    })
    this.map.addControl(scaleLineControl)
    this.map.addControl(mousePositionControl)
  }

  // ✅ 获取地图实例
  getMap() {
    return this.map
  }

  // ✅ 获取地图类型
  getMapType() {
    return this.mapType
  }
  // ✅ 设置地图类型
  setMapType(type) {
    this.mapType = type
  }
  // ✅ 获取当前缩放级别
  getZoom() {
    return this.map ? this.map.getView().getZoom() : null
  }

  // ✅ 设置缩放级别
  setZoom(level) {
    if (this.map) {
      this.map.getView().setZoom(level)
    }
  }

  // ✅ 切换底图
  switchBaseLayer(type = 'vector') {
    const { vec, cva, img } = this.layerMaps
    if (type === 'vector') {
      if (img) img.setVisible(false)
      vec.setVisible(true)
    } else if (type === 'image') {
      if (!img) {
        const imgLayer = this.createWmtsLayer('http://t0.tianditu.gov.cn/img_c/wmts', 'img', this.epsg4326, 'c')
        this.layerMaps.img = imgLayer
        this.map.addLayer(imgLayer)
      }
      vec.setVisible(false)
      cva.setZIndex(2)
      this.layerMaps.img.setVisible(true)
    }
    this.setMapType(type)
  }

  // ✅ 添加图层
  addLayer(layer) {
    if (this.map && layer) {
      this.map.addLayer(layer)
    }
  }

  // ✅ 移除图层
  removeLayer(layer) {
    if (this.map && layer) {
      this.map.removeLayer(layer)
    }
  }
}
