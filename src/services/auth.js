import { http } from '../utils/request'

// 咨询相关API
export const authApi = {
  // 获取地图数据
  // getCasLoginUrl: (params) => http.get('/authservice/oauth/authorize', params),
  getTokenApi: (params) => http.get('/authservice/oauth/token', params),
  // getUserInfo: (params) => http.get('/authservice/user/userinfo', params),
  getUserSecretKey: (params) =>
    http.get('/oauthtokenapigateway/openapiservice/user/getSecret', params),
  getBaseMap: (params) => http.get('/oauthtokenapigateway/openapiservice/map/getBaseMap', params),
  getResourceTree: (params) =>
    http.get('/oauthtokenapigateway/modelservice/api/User/ServiceResourceTree', params)
}

export default {
  authApi
}
