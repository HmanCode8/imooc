import { http } from '../utils/request'

// 用户相关API
export const userApi = {
  // 登录
  login: (data) => {
    return http.post('/user/login', data)
  },
  // 获取用户头像
  getUserAvatar: (data) => {
    return http.get('/user/getAvatar', data)
  },
  // 退出登录
  logout: (data) => {
    return http.post('/user/logout', data)
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

  //获取用户设置
  getUserSetting: (data) => {
    return http.get('/user/setting', data)
  },
  //添加更新用户设置
  updateUserSetting: (data) => {
    return http.post('/user/setting', data)
  },
  //获取区域列表和街道列表
  getDistricts: (data) => {
    return http.get('/districts', data)
  },
  //获取区域列表
  getDistrictsFirst: (data) => {
    return http.get('/districts/first', data)
  },
  // 上传头像
  uploadAvatar: (data) => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('username', data.username)
    return http.post('/user/uploadAvatar', formData)
  },
}

export default {
  userApi,
}
