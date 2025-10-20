import { http } from '../utils/request'
function getWMTSUrl(serverUrl) {
  console.log(window.location.host)
  if (window.location.host.includes('localhost')) {
    return serverUrl.replace(
      serverUrl.split('ResourceService')[0],
      window.global_config.baseUrl + '/'
    )
  } else {
    return serverUrl
  }
}

// 咨询相关API
export const mapApi = {
  // 获取地图数据
  getBaseMap: (params) => http.get('/oauthtokenapigateway/openapiservice/map/getBaseMap', params),
  getBaseMapInfo: (params) =>
    http.get(
      'http://222.190.118.45:18080/MapService/3487/fabadc46529d4e5888248bfba0b7de37',
      params
    ),
  getWMTSLayerXML: (serverUrl) =>
    http.get(getWMTSUrl(serverUrl) + '/1.0.0/WMTSCapabilities.xml', {}, { responseType: 'text' })
}

export default {
  mapApi
}
