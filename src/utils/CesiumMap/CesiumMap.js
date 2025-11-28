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
    // 标记相机是否在移动，用于 postRender 节流联动
    this._isMoving = false
    this._postRenderThrottle = this._throttle(() => {
      if (!this._isMoving) return
      const { lon, lat } = this.getCenterLonLat()
      const height = this.getHeight()
      this.emit('viewChange', { lon, lat, height })
    }, 33)
    this.viewer.scene.postRender.addEventListener(this._postRenderThrottle)
  }

  sanweidiming(lon, lat, height) {
    const Cesium = this.Cesium
    const viewer = this.viewer

    // 叠加地形服务
    var terrainUrls = new Array()

    for (var i = 0; i < subdomains.length; i++) {
      var url = this.tdtUrl.replace('{s}', subdomains[i]) + 'mapservice/swdx?T=elv_c&tk=' + this.token
      terrainUrls.push(url)
    }

    var provider = new Cesium.GeoTerrainProvider({
      urls: terrainUrls,
    })

    viewer.terrainProvider = provider

    var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
    var wtfs = new Cesium.GeoWTFS({
      viewer,
      //三维地名服务，使用wtfs服务
      subdomains: subdomains,
      metadata: {
        boundBox: {
          minX: -180,
          minY: -90,
          maxX: 180,
          maxY: 90,
        },
        minLevel: 1,
        maxLevel: 20,
      },
      depthTestOptimization: true,
      dTOElevation: 15000,
      dTOPitch: Cesium.Math.toRadians(-70),
      aotuCollide: true, //是否开启避让
      collisionPadding: [5, 10, 8, 5], //开启避让时，标注碰撞增加内边距，上、右、下、左
      serverFirstStyle: true, //服务端样式优先
      labelGraphics: {
        font: '28px sans-serif',
        fontSize: 28,
        fillColor: Cesium.Color.WHITE,
        scale: 0.5,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: false,
        backgroundColor: Cesium.Color.RED,
        backgroundPadding: new Cesium.Cartesian2(10, 10),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        eyeOffset: Cesium.Cartesian3.ZERO,
        pixelOffset: new Cesium.Cartesian2(5, 5),
        disableDepthTestDistance: undefined,
      },
      billboardGraphics: {
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        eyeOffset: Cesium.Cartesian3.ZERO,
        pixelOffset: Cesium.Cartesian2.ZERO,
        alignedAxis: Cesium.Cartesian3.ZERO,
        color: Cesium.Color.WHITE,
        rotation: 0,
        scale: 1,
        width: 18,
        height: 18,
        disableDepthTestDistance: undefined,
      },
    })

    //三维地名服务，使用wtfs服务
    wtfs.getTileUrl = function () {
      return this.tdtUrl + 'mapservice/GetTiles?lxys={z},{x},{y}&VERSION=1.0.0&tk=' + this.token
    }

    // 三维图标服务
    wtfs.getIcoUrl = function () {
      return this.tdtUrl + 'mapservice/GetIcon?id={id}&tk=' + token
    }

    wtfs.initTDT([
      { x: 6, y: 1, level: 2, boundBox: { minX: 90, minY: 0, maxX: 135, maxY: 45 } },
      { x: 7, y: 1, level: 2, boundBox: { minX: 135, minY: 0, maxX: 180, maxY: 45 } },
      { x: 6, y: 0, level: 2, boundBox: { minX: 90, minY: 45, maxX: 135, maxY: 90 } },
      { x: 7, y: 0, level: 2, boundBox: { minX: 135, minY: 45, maxX: 180, maxY: 90 } },
      { x: 5, y: 1, level: 2, boundBox: { minX: 45, minY: 0, maxX: 90, maxY: 45 } },
      { x: 4, y: 1, level: 2, boundBox: { minX: 0, minY: 0, maxX: 45, maxY: 45 } },
      { x: 5, y: 0, level: 2, boundBox: { minX: 45, minY: 45, maxX: 90, maxY: 90 } },
      { x: 4, y: 0, level: 2, boundBox: { minX: 0, minY: 45, maxX: 45, maxY: 90 } },
      { x: 6, y: 2, level: 2, boundBox: { minX: 90, minY: -45, maxX: 135, maxY: 0 } },
      { x: 6, y: 3, level: 2, boundBox: { minX: 90, minY: -90, maxX: 135, maxY: -45 } },
      { x: 7, y: 2, level: 2, boundBox: { minX: 135, minY: -45, maxX: 180, maxY: 0 } },
      { x: 5, y: 2, level: 2, boundBox: { minX: 45, minY: -45, maxX: 90, maxY: 0 } },
      { x: 4, y: 2, level: 2, boundBox: { minX: 0, minY: -45, maxX: 45, maxY: 0 } },
      { x: 3, y: 1, level: 2, boundBox: { minX: -45, minY: 0, maxX: 0, maxY: 45 } },
      { x: 3, y: 0, level: 2, boundBox: { minX: -45, minY: 45, maxX: 0, maxY: 90 } },
      { x: 2, y: 0, level: 2, boundBox: { minX: -90, minY: 45, maxX: -45, maxY: 90 } },
      { x: 0, y: 1, level: 2, boundBox: { minX: -180, minY: 0, maxX: -135, maxY: 45 } },
      { x: 1, y: 0, level: 2, boundBox: { minX: -135, minY: 45, maxX: -90, maxY: 90 } },
      { x: 0, y: 0, level: 2, boundBox: { minX: -180, minY: 45, maxX: -135, maxY: 90 } },
    ])
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

    var terrainUrls = new Array()

    // this.sanweidiming()

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
      viewChange: new Set(),
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

  /** 获取屏幕中心对应的经纬度（若不可见则回退相机位置经纬度） */
  getCenterLonLat() {
    const Cesium = this.Cesium
    const canvas = this.viewer.scene.canvas
    const center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
    const cartesian = this.viewer.camera.pickEllipsoid(center)
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      return {
        lon: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
      }
    }
    const pos = this.viewer.camera.positionCartographic
    return {
      lon: Cesium.Math.toDegrees(pos.longitude),
      lat: Cesium.Math.toDegrees(pos.latitude),
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
      this._isMoving = true
      this.emit('dragStart', { type: 'dragStart', originalEvent: event })
    })

    camera.moveEnd.addEventListener((event) => {
      if (isDragging) {
        isDragging = false
        this.emit('dragEnd', { type: 'dragEnd', originalEvent: event })
      }
      const { lon, lat } = this.getCenterLonLat()
      const height = this.getHeight()
      this.emit('zoomChange', { type: 'zoomChange', height })
      this.emit('viewChange', { lon, lat, height })
      this._isMoving = false
    })
  }

  /** 清理所有事件 */
  cleanup() {
    this.eventHandlers.forEach((h) => h.destroy())
    Object.values(this.eventEmitter).forEach((set) => set.clear())
    if (this._postRenderThrottle) {
      this.viewer.scene.postRender.removeEventListener(this._postRenderThrottle)
    }
  }

  _throttle(fn, wait) {
    let last = 0
    let timer = null
    return (...args) => {
      const now = Date.now()
      const remain = wait - (now - last)
      if (remain <= 0) {
        last = now
        fn.apply(this, args)
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null
          last = Date.now()
          fn.apply(this, args)
        }, remain)
      }
    }
  }
}
