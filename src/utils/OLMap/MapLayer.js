import Overlay from 'ol/Overlay'
export default class MapLayer {
  constructor(map) {
    this.map = map
  }

  createOverlay(options) {
    const overlay = new Overlay(options)
    overlay.setPosition(options.coordinate)

    this.map.addOverlay(overlay)
  }
}
