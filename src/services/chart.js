import { http } from '../utils/request'

export const chartApi = {
  // ===================== 【GET 查询接口：仅读取数据】 =====================
  // 获取好友列表
  // params: { currentUser }
  getChartFriends: (params) => http.get('/chart/friends', params),

  // 获取私聊历史聊天记录
  // params: { fromUser, toUser }
  getHistoryChat: (params) => http.get('/chart/history', params),

  // 获取可添加好友列表（未成为好友的用户）
  // params: { currentUser }
  getAvailableUsers: (params) => http.get('/chart/user/canAddFriend', params),

  // 全局模糊搜索用户
  // params: { keyword }
  searchUser: (params) => http.get('/chart/user/search', params),

  // 获取收到的好友申请列表
  // params: { currentUser }
  getFriendApply: (params) => http.get('/chart/friend/applyList', params),

  // -------------------------- 群聊GET查询接口 --------------------------
  // 获取我加入的全部群聊列表（附带每个群未读消息数量）
  // params: { currentUser }
  getMyGroupList: (params) => http.get('/chart/group/my', params),

  // 获取单个群聊完整详情（含公告、自定义群名、群主信息）
  // params: { groupId, currentUser }
  getGroupInfo: (params) => http.get('/chart/group/info', params),

  // 查询群内所有成员（返回每个成员群内昵称、在线状态）
  // params: { groupId, currentUser }
  getGroupMemberList: (params) => http.get('/chart/group/member/list', params),

  // 获取群聊全部历史消息（附带每条消息基础信息）
  // params: { groupId, currentUser }
  getGroupHistoryMsg: (params) => http.get('/chart/group/history', params),

  // 获取指定群的未读消息总条数（用于群列表小红点数字）
  // params: { groupId, currentUser }
  getGroupUnreadCount: (params) => http.get('/chart/group/unread/count', params),

  // 查询单条群消息的已读/未读成员名单
  // params: { groupId, groupMsgId, currentUser }
  getMsgReadUserList: (params) => http.get('/chart/group/msg/read/list', params),

  // 调试接口：后端主动单发推送消息（GET）
  // params: { username, msg }
  pushSingleUser: (params) => http.get('/chart/push/user', params),

  // 调试接口：后端全员广播推送消息（GET）
  // params: { msg }
  pushAllUser: (params) => http.get('/chart/push/all', params),

  // ===================== 【POST 操作接口：新增/修改/提交】 =====================
  // 标记私聊消息为已读
  // data: { currentUser, friendUser }
  setMsgRead: (data) => http.post('/chart/read', data),

  // 发起添加好友申请
  // data: { currentUser, friendUser }
  addFriend: (data) => http.post('/chart/friend/add', data),

  // 修改好友聊天激活状态（打开/关闭聊天页）
  // data: { currentUser, friendUser, status } 拼在url参数
  getFriendChatStatus: (data) => http.post('/chart/friend/chat/status', null, { params: data }),

  // 聊天文件上传（私聊/群聊共用，form-data传file）
  // data: FormData 携带file文件对象
  uploadFile: (data) => http.post('/chart/upload/file', data),

  // 同意好友申请
  // data: { currentUser, friendUser }
  agreeFriend: (data) => http.post('/chart/friend/agree', data),

  // 拉黑好友
  // data: { u1, u2 }
  blackFriend: (data) => http.post('/chart/friend/black', data),

  // -------------------------- 群聊基础操作POST接口 --------------------------
  /**
   * 创建新群聊
   * @param data { groupName: string, remark: string, ownerUsername: string }
   */
  createGroup: (data) => http.post('/chart/group/create', data),

  /**
   * 邀请用户进群，支持单人/批量，统一传数组
   * @param data { groupId: Long, currentUser: string, targetUserList: string[] }
   * 单人示例：targetUserList: ["user01"]
   * 批量示例：targetUserList: ["user01","user02","user03"]
   */
  inviteGroupMember: (data) => http.post('/chart/group/member/add', data),

  /**
   * 退出指定群聊（群主不能走这个接口，必须先转让群主或解散群）
   * @param data { groupId: Long, currentUser: string }
   */
  quitGroup: (data) => http.post('/chart/group/member/quit', data),

  // -------------------------- 新增：群信息修改相关 --------------------------
  /**
   * 修改群基础信息：自定义群名、群公告、群简介（仅群主可用）
   * @param data { groupId: number, currentUser: string, groupNickname: string, remark: string, notice: string }
   */
  updateGroupInfo: (data) => http.post('/chart/group/update/info', data),

  /**
   * 修改群内成员专属昵称
   * 权限：普通用户仅可修改自己；群主可修改全部成员昵称
   * @param data { groupId: number, currentUser: string, targetUsername: string, memberNick: string }
   */
  updateMemberNick: (data) => http.post('/chart/group/member/nick/update', data),

  /**
   * 群主解散/删除整个群聊，级联清空群、群成员、群消息、未读记录
   * 权限：仅群创建群主可调用
   * @param data { groupId: number, currentUser: string }
   */
  deleteGroup: (data) => http.post('/chart/group/delete', data),

  /**
   * 群主移除群内指定普通成员，不可移除群主本人
   * @param data { groupId: number, currentUser: string, targetUsername: string }
   */
  removeGroupMember: (data) => http.post('/chart/group/member/remove', data),

  /**
   * 转让群主权限，转让后方可正常退出群聊
   * 权限：仅当前群主可操作
   * @param data { groupId: number, currentUser: string, newOwnerUsername: string }
   */
  transferGroupOwner: (data) => http.post('/chart/group/owner/transfer', data),

  // -------------------------- 新增：群消息已读标记相关 --------------------------
  /**
   * 单独标记某一条群消息为已读
   * @param data { groupId: number, currentUser: string, groupMsgId: number }
   */
  readSingleGroupMsg: (data) => http.post('/chart/group/msg/read/single', data),

  /**
   * 一键标记当前群全部未读消息为已读
   * 使用场景：用户打开群聊天窗口时调用，清空小红点未读数量
   * @param data { groupId: number, currentUser: string }
   */
  readAllGroupMsg: (data) => http.post('/chart/group/msg/read/all', data),

  /**
   * 查询群内聊天状态（是否在线）
   * @param data { groupId: number, currentUser: string, status: 0/1 }
   */
  getGroupChatStatus: (data) => http.post('/chart/group/status', null, { params: data })
}

export default {
  chartApi
}