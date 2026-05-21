import { http } from '../utils/request'

// 咨询相关API
export const carApi = {
  //新增车辆
  getCar: (data) => {
    return http.get('/car/list', data)
  },

}

export default {
  carApi
}
