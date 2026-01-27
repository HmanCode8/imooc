import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Style, Icon, Text, Fill, Stroke } from 'ol/style'
import img from '@/assets/location.png'
function createPointLayer(options) {
  const olmap = options.map || window.olMap

  // ---- ① 地图只保留一个点 ----
  if (olmap._singlePointLayer) {
    olmap.removeLayer(olmap._singlePointLayer)
  }

  // ---- ② 转换坐标 ----
  const coord = fromLonLat(options.geometry)
  const feature = new Feature({
    geometry: new Point(coord),
  })

  const vectorSource = new VectorSource({
    features: [feature],
  })

  // ---- ③ 使用图标样式 ----
  const style = new Style({
    image: new Icon({
      src: options.icon || img, // 你的图标路径
      anchor: [0.5, 1], // 图标底部对准坐标
      scale: options.scale || 0.2,
    }),
    text: new Text({
      text: options.label || '21', // 你要显示的文字
      offsetY: 20, // 文字在图标下方（可调）
      font: '14px sans-serif',
      fill: new Fill({ color: options.textColor || 'black' }),
      stroke: new Stroke({ color: '#fff', width: 3 }), // 白色描边防止重叠看不清
    }),
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: style,
    zIndex: 9999,
  })

  olmap.addLayer(vectorLayer)
  olmap._singlePointLayer = vectorLayer // 保存此图层用于下次删除

  // ---- ④ 自动定位到点 ----
  olmap.getView().fit(feature.getGeometry().getExtent(), {
    maxZoom: 18,
    duration: 600,
  })

  return vectorLayer
}

export { createPointLayer }
