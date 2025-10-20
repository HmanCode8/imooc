import { authApi } from '@/services/auth'
import { getQueryString } from '../utils'

// 获取token
const getToken = async (code) => {
  let path = getQueryString('path')
  const tokenParams = {
    client_id: window.global_config.system.clientId,
    client_secret: window.global_config.system.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: window.global_config.system.returnUrl + (path ? '?path=' + path : ''),
    code
  }
  const data = await authApi.getTokenApi(tokenParams)
  const { access_token } = data
  sessionStorage.setItem('casToken', access_token)
  // 跳转到原页面
  window.location.replace(window.global_config.system.returnUrl + '/#' + path)
}

// 单点登录函数
function goToCasLogin(path) {
  sessionStorage.setItem('casToken', '')
  const loginUrl = window.global_config.system.oauthServerUrl + '/oauth/authorize'
  const returnUrl = window.global_config.system.returnUrl + (path ? '?path=' + path : '')
  const url =
    loginUrl +
    '?client_id=' +
    window.global_config.system.clientId +
    '&response_type=code&scopr=all' +
    '&redirect_uri=' +
    returnUrl
  window.location.href = url
}

//路由钩子
function registerRouterHook(router) {
  router.beforeEach(async (to, from, next) => {
    const token = sessionStorage.getItem('casToken')
    if (token) {
      // 权限判断
      next()
    } else {
      const code = getQueryString('code')
      if (code) {
        getToken(code)
      } else {
        goToCasLogin(to.path)
      }
    }
  })
}

export default registerRouterHook
