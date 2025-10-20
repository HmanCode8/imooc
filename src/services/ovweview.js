import { http } from '../utils/request'

// 咨询相关API
export const consultationsApi = {
  // 获取咨询列表
  getConsultations: (params) => http.post('/consultations/list', params)
}

export default {
  consultationsApi
}
