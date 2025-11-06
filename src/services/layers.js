import { http } from '../utils/request'

// 咨询相关API
export const layerApi = {
  getzryc: () => http.get('/data/geojson/sjzryc/zryc.geojson'),
}

export default {
  layerApi,
}
