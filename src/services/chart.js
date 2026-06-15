import { http } from '../utils/request'

export const chartApi = {
  // 获取好友列表：参数 currentUser
  getChartFriends: (params) => http.get('/chart/friends', params),

  // 获取聊天历史：fromUser、toUser
  getHistoryChat: (params) => http.get('/chart/history', params),

  // 标记消息已读 POST
  setMsgRead: (data) => http.post('/chart/read', data),

  // 后端单发推送(调试用)
  pushSingleUser: (params) => http.get('/chart/push/user', params),

  // 后端全员推送(调试用)
  pushAllUser: (params) => http.get('/chart/push/all', params),

  // 获取可添加的用户列表 /chart/user/canAddFriend?currentUser=xxx
  getAvailableUsers: (params) => http.get('/chart/user/canAddFriend', params),

  // 添加好友 post body {currentUser,friendUser}
  addFriend: (data) => http.post('/chart/friend/add', data),

  //获取好友申请列表 /chart/friend/apply?currentUser=xxx
  getFriendApply: (params) => http.get('/chart/friend/applyList', params),

  // 好友聊天状态 /chart/friend/chat/status
  getFriendChatStatus: (data) => http.post('/chart/friend/chat/status', null, { params: data }),

  // 聊天上传文件 post body {file}
  uploadFile: (data) => http.post('/chart/upload/file', data),

  // 同意好友申请 post body {applyUser,targetUser}
  agreeFriend: (data) => http.post('/chart/friend/agree', data),

  // 拉黑好友 post body {u1,u2}
  blackFriend: (data) => http.post('/chart/friend/black', data)
}

export default {
  chartApi
}