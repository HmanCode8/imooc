import { toLonLat } from 'ol/proj.js'

export default class MapEventManager {
  constructor(mapInstance) {
    if (!mapInstance) throw new Error('MapEventManager: mapInstance 不能为空')

    this.map = mapInstance
    this.eventListeners = {
      move: new Set(), // 鼠标移动
      click: new Set(), // 鼠标点击
      dragstart: new Set(), // 开始拖动
      dragend: new Set(), // 结束拖动
    }

    // ✅ 绑定 this，防止解绑失效
    this._mouseMove = this._mouseMove.bind(this)
    this._click = this._click.bind(this)
    this._moveStart = this._moveStart.bind(this)
    this._moveEnd = this._moveEnd.bind(this)

    // ✅ 注册地图原生事件
    this.map.on('pointermove', this._mouseMove)
    this.map.on('click', this._click)
    this.map.on('movestart', this._moveStart)
    this.map.on('moveend', this._moveEnd)
  }

  // =============================
  // ✅ 事件系统
  // =============================

  on(eventName, callback) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].add(callback)
    } else {
      console.warn(`事件 ${eventName} 不受支持`)
    }
  }

  off(eventName, callback) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].delete(callback)
    }
  }

  emit(eventName, event) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach((cb) => cb(event))
    }
  }

  // =============================
  // ✅ 地图原生事件封装
  // =============================

  // 鼠标移动事件
  _mouseMove(e) {
    const coordinate = toLonLat(this.map.getEventCoordinate(e.originalEvent))
    const pixel = this.map.getEventPixel(e.originalEvent)
    this.emit('move', { coordinate, pixel, originalEvent: e })
  }

  // 点击事件
  _click(e) {
    const coordinate = toLonLat(this.map.getEventCoordinate(e.originalEvent))
    const pixel = this.map.getEventPixel(e.originalEvent)
    this.emit('click', { coordinate, pixel, originalEvent: e })
  }

  // 拖动开始
  _moveStart(e) {
    this.emit('dragstart', { type: 'dragstart', originalEvent: e })
  }

  // 拖动结束
  _moveEnd(e) {
    this.emit('dragend', { type: 'dragend', originalEvent: e })
  }

  // =============================
  // ✅ 工具函数
  // =============================

  cleanup() {
    this.map.un('pointermove', this._mouseMove)
    this.map.un('click', this._click)
    this.map.un('movestart', this._moveStart)
    this.map.un('moveend', this._moveEnd)
    Object.values(this.eventListeners).forEach((listeners) => listeners.clear())
  }

  getEvents() {
    return Object.keys(this.eventListeners)
  }
}
