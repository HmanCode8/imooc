// CesiumMap.js
export default class CesiumMap {
  constructor(containerId, token) {
    this.Cesium = window.Cesium
    this.token = token
    this.containerId = containerId
    this.tdtUrl = 'https://t{s}.tianditu.gov.cn/'
    this.subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
    this.eventHandlers = []
    this.initViewer()
    this.addBaseLayers()
  }

  // 初始化 Cesium Viewer
  initViewer() {
    const Cesium = this.Cesium
    this.viewer = new Cesium.Map(this.containerId, {
      selectionIndicator: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      timeline: false,
      navigationHelpButton: false,
      animation: false,
      shouldAnimate: false,
    })
    this.initEventSystem()
    this.viewer.scene.skyAtmosphere.show = false
  }

  // 添加天地图影像+国界线
  addBaseLayers() {
    const Cesium = this.Cesium
    const token = this.token
    const url = this.tdtUrl
    const subs = this.subdomains

    const imgLayer = new Cesium.UrlTemplateImageryProvider({
      url: url + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + token,
      subdomains: subs,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 18,
    })
    this.viewer.imageryLayers.addImageryProvider(imgLayer)

    const iboLayer = new Cesium.UrlTemplateImageryProvider({
      url: url + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + token,
      subdomains: subs,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 10,
    })
    this.viewer.imageryLayers.addImageryProvider(iboLayer)
  }

  // 设置相机视角（瞬间到达）
  setView(lon, lat, height = 1500, heading = 0, pitch = -35) {
    this.viewer.camera.setView({
      destination: this.Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: this.Cesium.Math.toRadians(heading),
        pitch: this.Cesium.Math.toRadians(pitch),
        roll: 0,
      },
    })
  }

  // 平滑飞行到某地
  flyTo(lon, lat, height = 1500, heading = 0, pitch = -35, duration = 3) {
    this.viewer.camera.flyTo({
      destination: this.Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: this.Cesium.Math.toRadians(heading),
        pitch: this.Cesium.Math.toRadians(pitch),
        roll: 0,
      },
      duration,
    })
  }

  // 获取当前相机高度
  getHeight() {
    const carto = this.viewer.camera.positionCartographic
    return carto.height
  }

  // 设置高度（保持经纬度方向不变）
  setHeight(height) {
    const camera = this.viewer.camera
    const carto = camera.positionCartographic
    const lon = this.Cesium.Math.toDegrees(carto.longitude)
    const lat = this.Cesium.Math.toDegrees(carto.latitude)
    this.setView(lon, lat, height)
  }

  /** 初始化事件系统 */
  initEventSystem() {
    this.eventEmitter = {
      click: new Set(),
      move: new Set(),
      dragStart: new Set(),
      dragEnd: new Set(),
      zoomChange: new Set(),
    }

    this.initMouseEvents()
    this.initCameraEvents()
  }

  /** 注册事件 */
  on(event, callback) {
    if (this.eventEmitter[event]) {
      this.eventEmitter[event].add(callback)
    }
  }

  /** 取消事件 */
  off(event, callback) {
    if (this.eventEmitter[event]) {
      this.eventEmitter[event].delete(callback)
    }
  }

  /** 触发事件 */
  emit(event, data) {
    if (this.eventEmitter[event]) {
      this.eventEmitter[event].forEach((cb) => cb(data))
    }
  }

  /** 鼠标事件 */
  initMouseEvents() {
    const Cesium = this.Cesium
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.eventHandlers.push(handler)

    // 鼠标移动
    handler.setInputAction((movement) => {
      const cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition)
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        this.emit('move', { lon, lat })
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 点击
    handler.setInputAction((click) => {
      const cartesian = this.viewer.camera.pickEllipsoid(click.position)
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        this.emit('click', { lon, lat })
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /** 相机拖动/缩放事件 */
  initCameraEvents() {
    const camera = this.viewer.camera
    let isDragging = false

    camera.moveStart.addEventListener((event) => {
      isDragging = true
      this.emit('dragStart', { type: 'dragStart', originalEvent: event })
    })

    camera.moveEnd.addEventListener((event) => {
      if (isDragging) {
        isDragging = false
        this.emit('dragEnd', { type: 'dragEnd', originalEvent: event })
      }
      this.emit('zoomChange', { type: 'zoomChange', height: this.getHeight() })
    })
  }

  /** 清理所有事件 */
  cleanup() {
    this.eventHandlers.forEach((h) => h.destroy())
    Object.values(this.eventEmitter).forEach((set) => set.clear())
  }
}
