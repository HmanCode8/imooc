import BasePlugins from './BasePlugins'

export class ElasticMarkerPlugin extends BasePlugins {
  constructor(map, AMap, options = {}) {
    super(map, AMap, options)
  }

  init(options) {
    if (this.marker) {
      this.map.remove(this.marker)
    }

    this.marker = new this.AMap.ElasticMarker({
      map: this.map,
      ...options,
    })
  }

  update(options) {
    this.init(options)
  }
}
