import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import ImageLayer from 'ol/layer/Image.js'
import ImageArcGISRest from 'ol/source/ImageArcGISRest.js'
import XYZ from 'ol/source/XYZ'
import TileGrid from 'ol/tilegrid/TileGrid'
import { get as getProjection } from 'ol/proj'
import proj4 from 'proj4'
import _ from 'lodash'
import { register } from 'ol/proj/proj4.js'
import { mapApi } from '@/services/map.js'
/**
 * 地图服务管理 Hook
 * 根据服务类型创建图层
 */
export function useMapServices() {
  const proJectConfig = (projection) => {
    proj4.defs(projection?.code, projection?.definition)
    register(proj4)
    return getProjection(projection?.code)
  }

  /**
   * 创建 WMTS 图层
   */
  const createWMTSLayer = (serviceConfig) => {
    const { view_config, layer_config } = serviceConfig
    const projection = proJectConfig(view_config.projection)
    const extent = [
      view_config.extent.xmin,
      view_config.extent.ymin,
      view_config.extent.xmax,
      view_config.extent.ymax
    ]
    const layer = new TileLayer({
      source: new WMTS({
        url: layer_config.url,
        layer: layer_config.layer,
        matrixSet: layer_config.matrixSet,
        style: layer_config.style,
        format: layer_config.format,
        projection,
        tileGrid: new WMTSTileGrid({
          extent: extent,
          origin: layer_config?.origin,
          resolutions: layer_config?.resolutions,
          matrixIds: layer_config?.resolutions?.map((_, i) => i.toString())
        })
      })
    })
    return {
      layer,
      projection
    }
  }

  const tileLoadFunction = (imageTile, src) => {
    var img = imageTile.getImage()
    if (typeof window.btoa === 'function') {
      var urlArray = src.split('?')
      var url = urlArray[0]
      var params = urlArray[1]

      var xhr = new XMLHttpRequest()
      xhr.onload = function () {
        if (this.status === 200) {
          var uInt8Array = new Uint8Array(this.response)
          var i = uInt8Array.length
          var binaryString = new Array(i)
          while (i--) {
            binaryString[i] = String.fromCharCode(uInt8Array[i])
          }
          var data = binaryString.join('')
          var type = xhr.getResponseHeader('content-type')
          img.src = src
          if (type.indexOf('image') === 0) {
            img.src = 'data:' + type + ';base64,' + window.btoa(data)
          }
        }
      }
      xhr.open('POST', url, true)
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.responseType = 'arraybuffer'
      xhr.send(params)
    } else {
      img.src = src
    }
  }
  /**
   * 创建 ArcGIS REST 图层
   */

  const createArcGISLayer = (config) => {
    const { view_config, layer_config } = config
    const projection = proJectConfig(view_config.projection)
    const layer = new ImageLayer({
      source: new ImageArcGISRest({
        url: layer_config?.url,
        ratio: 1,
        params: {
          LAYERS: 'show:' + _.join(layer_config?.layers, ','),
          FORMAT: layer_config?.format,
          TRANSPARENT: true
        },
        imageLoadFunction: tileLoadFunction
      })
    })
    return {
      layer,
      projection
    }
  }

  /**
   * 创建 XYZ 图层
   */

  const createXYZLayer = (serviceConfig) => {
    // 创建目标图层
    const { view_config, layer_config } = serviceConfig

    // 从URL中提取token
    const url = new URL(layer_config.url)
    const token = url.searchParams.get('token') || ''
    const baseUrl = layer_config.url.split('?')[0] // 移除token参数

    // 根据服务文档配置瓦片网格
    const tileGrid = new TileGrid({
      tileSize: layer_config.tileSize, // 服务文档显示 256x256
      origin: layer_config.origin, // 服务文档的Origin
      extent: [
        view_config.extent.xmin,
        view_config.extent.ymin,
        view_config.extent.xmax,
        view_config.extent.ymax
      ],
      resolutions: layer_config.resolutions
    })

    // 数据源
    const projection = proJectConfig(view_config.projection)
    const finalUrl = baseUrl + '/tile/{z}/{y}/{x}' + (token ? `?token=${token}` : '')

    const source = new XYZ({
      projection,
      tileGrid,
      crossOrigin: 'anonymous',
      // ArcGIS 瓦片服务格式: /tile/{level}/{row}/{col}
      url: finalUrl,

      tileLoadFunction: (imageTile, src) => {
        imageTile.getImage().src = src
      }
    })

    const layer = new TileLayer({
      source
    })

    return {
      layer,
      projection
    }
  }

  /**
   * 在服务选择为产品中心的是否切到图层，就会调用
   * 获取wmts服务xml文档，构造叠加范围以及切片后缀
   * @returns {*}
   */
  let WMTSGrid = null
  const getWMTSLayerXMLConfig = (serviceConfig) => {
    const { view_config, layer_config } = serviceConfig
    let imageType = 'png32'
    let topLeftCorner = null
    let tempTopLeftCorner = null
    return new Promise((resolve) => {
      mapApi
        .getWMTSLayerXML(layer_config.url)
        .then((res) => {
          if (!res.status) {
            console.error('WMTS XML 请求失败:', res)
            resolve(imageType)
            return
          }
          try {
            const parser = new DOMParser()
            const xmldoc = parser.parseFromString(res.data, 'text/xml')

            const parserError = xmldoc.querySelector('parsererror')
            if (parserError) {
              resolve(imageType)
              return
            }

            const formatElement = xmldoc.getElementsByTagName('Format')[0]
            if (formatElement) {
              imageType = formatElement.textContent.replace('image/', '') // 加载瓦片后缀
            }

            const topLeftCornerElement = xmldoc.getElementsByTagName('TopLeftCorner')[0]
            if (topLeftCornerElement) {
              tempTopLeftCorner = topLeftCornerElement.textContent.split(' ') // 加载瓦片起始点
              topLeftCorner = [Number(tempTopLeftCorner[1]), Number(tempTopLeftCorner[0])]
            }
          } catch (err) {
            console.error('XML 解析异常:', err)
          }

          // 构造切片策略
          if (topLeftCorner) {
            let WMTSobj = {
              origin: JSON.parse(JSON.stringify(topLeftCorner)),
              tileSize: layer_config.tileSize,
              resolutions: layer_config.resolutions,
              matrixIds: layer_config?.resolutions?.map((_, i) => i.toString()),
              extent: [
                view_config.extent.xmin,
                view_config.extent.ymin,
                view_config.extent.xmax,
                view_config.extent.ymax
              ]
            }
            WMTSGrid = new WMTSTileGrid(WMTSobj)
          }
        })
        .catch((err) => {
          console.error('WMTS XML 请求异常:', err)
        })
        .finally(() => {
          resolve(imageType)
        })
    })
  }

  const createXmlWmtsLayer = async (serviceConfig) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { view_config, layer_config } = serviceConfig
        const imageType = await getWMTSLayerXMLConfig(serviceConfig)
        const projection = proJectConfig(view_config.projection)

        // 确保 layers 是数组
        const layers = layer_config.layers || ['all']

        // 存放所有图层
        const createdLayers = []

        for (const layerName of layers) {
          const activedLayer = `ResourceService_${layer_config.resourceid}_${layer_config.areacode}_${layerName}`
          const finalUrl = `${layer_config.url}/${activedLayer}/grid/{z}/{x}/{y}.${imageType}`

          const layer = new TileLayer({
            source: new XYZ({
              projection,
              tileGrid: WMTSGrid,
              crossOrigin: 'anonymous',
              url: finalUrl
            })
          })
          createdLayers.push(layer)
        }
        resolve({
          layers: createdLayers,
          projection
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * 根据服务类型创建图层
   */
  const createLayerByType = async (serviceConfig) => {
    if (!serviceConfig?.type) {
      console.warn('服务配置或类型不存在')
      return null
    }

    switch (serviceConfig.type) {
      case 'WMTS':
        return createWMTSLayer(serviceConfig)
      case 'ARCGIS_REST':
        return createArcGISLayer(serviceConfig)
      case 'XYZ':
        return createXYZLayer(serviceConfig)
      case 'XML':
        return await createXmlWmtsLayer(serviceConfig)
      default:
        console.warn(`不支持的服务类型: ${serviceConfig.type}`)
        return null
    }
  }

  return {
    createLayerByType,
    createWMTSLayer,
    createXmlWmtsLayer,
    createArcGISLayer
  }
}
