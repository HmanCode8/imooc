import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Cluster from 'ol/source/Cluster'
import Style from 'ol/style/Style'
import CircleStyle from 'ol/style/Circle'
import Text from 'ol/style/Text'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'
import Stroke from 'ol/style/Stroke'
import car from '@/assets/car.png'

function getRandomColor() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff9900', '#00ffff', '#ff00ff']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成佛山区域随机车辆点位
function createRandomFoshanFeatures(count = 120) {
  const features = []
  // 佛山核心经纬度范围
  const minLng = 112.95
  const maxLng = 113.3
  const minLat = 22.85
  const maxLat = 23.15

  for (let i = 0; i < count; i++) {
    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)
    const rotate = Math.random() * Math.PI * 2

    const feature = new Feature({
      geometry: new Point([lng, lat]),
      rotateHi: rotate,
      color: getRandomColor(),
    })
    features.push(feature)
  }
  return features
}

// 创建车辆图层 + 聚合
async function createPlantLayer(params) {
  // 1. 创建原始点位数据源
  const source = new VectorSource({
    features: createRandomFoshanFeatures(120),
  })

  // 2. 🔥 核心：开启聚合（距离越小，聚合越严格）
  const clusterSource = new Cluster({
    source: source,
    distance: 50, // 多少像素内的点会被聚合
    minDistance: 10, // 最小距离
  })

  // 3. 聚合样式（数字圆圈）
  const styleCache = {}
  const clusterLayer = new VectorLayer({
    source: clusterSource,
    style: (feature) => {
      const size = feature.get('features').length
      // 单个点 → 显示小车
      if (size === 1) {
        const realFeature = feature.get('features')[0]

        return new Style({
          image: new Icon({
            src: car,
            scale: 0.2, // ⚠️ 不用 width/height
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: realFeature.get('rotateHi') || 0,
            color: realFeature.get('color'),
          }),
        })
      }
      // 多个点 → 显示聚合数字
      if (!styleCache[size]) {
        styleCache[size] = new Style({
          image: new CircleStyle({
            radius: 22,
            fill: new Fill({ color: 'rgba(255, 102, 0, 0.7)' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          }),
          text: new Text({
            text: String(size),
            fill: new Fill({ color: '#fff' }),
            font: 'bold 14px Arial',
          }),
        })
      }
      return styleCache[size]
    },
  })

  return clusterLayer
}

export { createPlantLayer }
