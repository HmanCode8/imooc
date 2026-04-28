import { Feature } from 'ol'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import car from '@/assets/car.png'
import { http } from '../utils/request'

// 调用
async function createPlantLayer(params) {
  const plantLayer = new VectorLayer({
    source: new VectorSource({
      features: [
        new Feature({
          geometry: new Point([116.4, 39.9]),
          rotateHi: 2,
        }),
        new Feature({
          geometry: new Point([199414.25, 97318.14]),
          rotateHi: 3,
        }),
      ],
    }),
    style: {
      'icon-src': car,
      'icon-width': 150,
      'icon-height': 150,
      'icon-anchor': [0.5, 0.5],
      'icon-rotate-with-view': true,
      'icon-rotation': ['get', 'rotateHi'],
    },
  })
  return plantLayer
}

export { createPlantLayer }
