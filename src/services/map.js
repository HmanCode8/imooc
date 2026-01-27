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
    http.get(getWMTSUrl(serverUrl) + '/1.0.0/WMTSCapabilities.xml', {}, { responseType: 'text' }),
  //获取附近地名
  // http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"公园","level":12,"queryRadius":5000,"pointLonlat":"116.48016,39.93136",
  // "queryType":3,"start":0,"count":10}&type=query&tk=您的密钥
   getNearbyPlace: (params) => http.get('/v2/search', params)
}

export default {
  mapApi
}
