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

  // 发送找回密码验证码
  sendResetCode: (data) => {
    return http.post('/user/forgot-password/sendCode', data)
  },

  // 重置密码
  resetPassword: (data) => {
    return http.post('/user/forgot-password/reset', data)
  },

  // 获取用户信息
  getUserInfo: (data) => {
    return http.get('/user/info', data)
  },

  // 更新用户信息
  updateUserInfo: (data) => {
    return http.put('/user/info', data)
  },
  //获取用户设置
  getUserSetting: (data) => {
    return http.get('/user/setting', data)
  },
  //添加更新用户设置
  updateUserSetting: (data) => {
    return http.post('/user/setting', data)
  },
}

export default {
  userApi
}
