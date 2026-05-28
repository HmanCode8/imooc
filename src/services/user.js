import { http } from '../utils/request'

// 用户相关API
export const userApi = {
  // 登录
  login: (data) => {
    return http.post('/user/login', data)
  },

  // 注册
  register: (data) => {
    return http.post('/user/register', data)
  },

  // 获取用户信息
  getUserInfo: (data) => {
    return http.get('/user/info', data)
  },

  // 更新用户信息
  updateUserInfo: (data) => {
    return http.put('/user/info', data)
  },

}

export default {
  userApi
}
