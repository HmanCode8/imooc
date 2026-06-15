import { ref, computed, nextTick } from 'vue';
import { chartApi } from '@/services/chart';
import ChatWebSocket from '@/utils/websocket';
import dayjs from 'dayjs';
import { userApi } from "@/services/user";
import { ElMessage } from 'element-plus';

export function useChat() {
  const myUsername = JSON.parse(sessionStorage.getItem('userName')) || 'admin';
  // 初始化默认头像
  const myAvatar = ref(`https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`);
  
  // 用户信息
  const userInfo = ref({
    username: myUsername,
    nickname: '',
    email: '',
    phone: '',
    bio: '',
  });
  const loadingUserInfo = ref(false);

  const friendList = ref([]); // 所有好友（getChartFriends 全部数据）
  const chatList = ref([]); // 消息列表（isChatting 为 1 的好友）
  const chatMsgList = ref([]);
  const currentSelectName = ref('');
  const searchText = ref('');
  const inputText = ref('');
  const messagesContainer = ref(null);
  let socket = null;

  const activeTab = ref('friends');
  const addFriendDialogVisible = ref(false);
  const addFriendSearchText = ref('');
  const availableUsers = ref([]);
  const loadingAvailableUsers = ref(false);
  const friendApplyList = ref([]);
  const loadingFriendApply = ref(false);

  const formatTime = (time) => dayjs(time).format('HH:mm');

  const formatLastTime = (time) => {
    if (!time) return '';
    const now = dayjs();
    const msgTime = dayjs(time);
    if (now.isSame(msgTime, 'day')) return msgTime.format('HH:mm');
    if (now.diff(msgTime, 'day') === 1) return '昨天';
    if (now.diff(msgTime, 'day') < 7) {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekDays[msgTime.day()];
    }
    return msgTime.format('MM/DD');
  };

  // 【初始化执行】加载个人头像，接口异常保留默认头像
  const initUserAvatar = async () => {
    try {
      const res = await userApi.getUserAvatar({ username: myUsername });
      if (res.code === 200 && res.data) {
        myAvatar.value = res.data;
      }
    } catch (error) {
      console.warn('加载个人头像失败，使用默认头像', error);
    }
  };

  const filteredUsers = computed(() => {
    let list = chatList.value;
    if (searchText.value) {
      const keyword = searchText.value.toLowerCase();
      list = list.filter(item => item.username?.toLowerCase().includes(keyword));
    }
    return list.map(item => ({
      id: item.username,
      name: item.username,
      avatar: item.avatar || myAvatar.value,
      online: item.online,
      lastMsg: item.lastMsg || '暂无消息',
      lastTime: item.lastTime,
      unread: item.unReadNum || 0
    }));
  });

  // 过滤后的好友列表（好友 Tab 使用）
  const filteredFriendList = computed(() => {
    let list = friendList.value;
    if (searchText.value) {
      const keyword = searchText.value.toLowerCase();
      list = list.filter(item => item.username?.toLowerCase().includes(keyword));
    }
    return list.map(item => ({
      id: item.username,
      name: item.username,
      avatar: item.avatar || myAvatar.value,
      online: item.online,
      isChatting: item.isChatting
    }));
  });

  const filteredAvailableUsers = computed(() => {
    if (!addFriendSearchText.value) return availableUsers.value;
    return availableUsers.value.filter(item =>
      item.username?.toLowerCase().includes(addFriendSearchText.value.toLowerCase())
    );
  });

  const currentUser = computed(() => {
    return filteredUsers.value.find(item => item.id === currentSelectName.value) || null;
  });

  // 判断文件是否为图片
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const ext = fileName.split('.').pop().toLowerCase();
    return imageExts.includes(ext);
  };

  // 获取文件图标类型
  const getFileIconType = (fileName) => {
    if (!fileName) return 'default';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    return 'default';
  };

  const currentMessages = computed(() => {
    const messages = chatMsgList.value.map(item => {
      // 智能判断是否是文件消息：有 fileUrl 或者 fileName，或者 type 为 'file'
      const isFileMessage = item.type === 'file' || item.fileUrl || item.fileName;
      const fileName = item.fileName || item.msgContent;
      
      return {
        text: item.msgContent,
        isSelf: item.sendUsername === myUsername,
        time: item.createTime,
        sendUsername: item.sendUsername,
        type: isFileMessage ? 'file' : 'text',
        fileType: isImageFile(fileName) ? 'image' : getFileIconType(fileName),
        fileUrl: item.fileUrl || '',
        fileName: fileName,
        fileSize: item.fileSize || 0
      };
    });
    console.log('当前用户:', myUsername);
    console.log('聊天消息列表:', chatMsgList.value);
    console.log('处理后的消息:', messages);
    return messages;
  });

  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  };

  const getFriendList = async () => {
    try {
      const res = await chartApi.getChartFriends({ currentUser: myUsername });
      const allFriends = res.data || [];
      friendList.value = allFriends;
      // 消息列表是 isChatting 为 1 的数据
      chatList.value = allFriends.filter(item => item.isChatting === 1);
      
      // 为每个聊天好友获取未读消息数（统计聊天历史中 isRead 为 0 且对方发送的消息数）
      for (const friend of chatList.value) {
        try {
          const historyRes = await chartApi.getHistoryChat({
            fromUser: myUsername,
            toUser: friend.username
          });
          const messages = historyRes.data || [];
          // 统计 isRead 为 0 且对方发送的消息数量
          friend.unReadNum = messages.filter(msg => 
            msg.isRead === 0 && msg.sendUsername === friend.username
          ).length;
        } catch (err) {
          console.error(`获取 ${friend.username} 未读消息失败`, err);
          friend.unReadNum = 0;
        }
      }
    } catch (error) {
      console.error('获取好友列表失败', error);
    }
  };

  // 获取单个好友的未读消息数
  const getUnreadCountForFriend = async (friendUsername) => {
    try {
      const res = await chartApi.getHistoryChat({
        fromUser: myUsername,
        toUser: friendUsername
      });
      const messages = res.data || [];
      // 统计 isRead 为 0 且对方发送的消息数量
      return messages.filter(msg => 
        msg.isRead === 0 && msg.sendUsername === friendUsername
      ).length;
    } catch (error) {
      console.error('获取未读数量失败', error);
      return 0;
    }
  };

  // 设置好友为聊天状态
  const setFriendToChatStatus = async (friendUser, status = 1) => {
    try {
      await chartApi.getFriendChatStatus({
        currentUser: myUsername,
        friendUser: friendUser,
        status: status
      });
      // 更新好友列表，确保新状态生效
      await getFriendList();
      return true;
    } catch (error) {
      console.error('设置聊天状态失败', error);
      return false;
    }
  };

  const getChatHistory = async (targetName) => {
    console.log(myUsername, 'myUsername');
    try {
      const res = await chartApi.getHistoryChat({
        fromUser: myUsername,
        toUser: targetName
      });
      chatMsgList.value = res.data || [];
      scrollToBottom();
    } catch (error) {
      console.error('获取聊天记录失败', error);
    }
  };

  const markAsRead = async (friendUser) => {
    try {
      await chartApi.setMsgRead({
        currentUser: myUsername,
        friendUser
      });
      getFriendList();
    } catch (error) {
      console.error('标记已读失败', error);
    }
  };

  const selectUser = async (user) => {
    currentSelectName.value = user.id;
    await getChatHistory(user.id);
    await markAsRead(user.id);
    scrollToBottom();
  };

  const sendMessage = () => {
    if (!inputText.value.trim() || !currentSelectName.value || !socket) return;

    const success = socket.send(currentSelectName.value, inputText.value.trim(), 'text');
    if (success) {
      const tempMsg = {
        msgContent: inputText.value.trim(),
        sendUsername: myUsername,
        receiveUsername: currentSelectName.value,
        createTime: new Date(),
        isRead: 0,
        type: 'text'
      };
      chatMsgList.value.push(tempMsg);
      inputText.value = '';
      scrollToBottom();
      setTimeout(() => {
        getChatHistory(currentSelectName.value);
        getFriendList();
      }, 300);
    }
  };

  const sendFile = async (file) => {
    if (!currentSelectName.value || !socket) return false;
    
    try {
      // 获取文件大小
      const fileSize = file.size || 0;
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // 上传文件
      const uploadRes = await chartApi.uploadFile(formData);
      
      if (uploadRes.code === 200 && uploadRes.data) {
        const { fileUrl, fileName } = uploadRes.data;
        
        // 通过 WebSocket 发送文件消息，包含文件大小
        const success = socket.send(
          currentSelectName.value, 
          fileName, 
          'file', 
          fileUrl, 
          fileName,
          fileSize
        );
        
        if (success) {
          // 添加临时消息
          const tempMsg = {
            msgContent: fileName,
            sendUsername: myUsername,
            receiveUsername: currentSelectName.value,
            createTime: new Date(),
            isRead: 0,
            type: 'file',
            fileUrl: fileUrl,
            fileName: fileName,
            fileSize: fileSize
          };
          chatMsgList.value.push(tempMsg);
          scrollToBottom();
          return true;
        }
      } else {
        console.error(uploadRes.msg || '文件上传失败');
        return false;
      }
    } catch (error) {
      console.error('发送文件失败:', error);
      return false;
    }
  };

  // 批量发送文件和文本
  const sendFilesAndText = async (files, text) => {
    if (!currentSelectName.value || !socket) return;
    
    let successCount = 0;
    
    // 先发送文本（如果有）
    if (text && text.trim()) {
      const textSuccess = socket.send(currentSelectName.value, text.trim(), 'text');
      if (textSuccess) {
        const tempMsg = {
          msgContent: text.trim(),
          sendUsername: myUsername,
          receiveUsername: currentSelectName.value,
          createTime: new Date(),
          isRead: 0,
          type: 'text'
        };
        chatMsgList.value.push(tempMsg);
        successCount++;
      }
    }
    
    // 逐个发送文件
    for (const file of files) {
      const fileSuccess = await sendFile(file.file || file);
      if (fileSuccess) {
        successCount++;
      }
    }
    
    // 刷新聊天记录
    setTimeout(() => {
      getChatHistory(currentSelectName.value);
      getFriendList();
    }, 300);
    
    // if (successCount > 0) {
    //   ElMessage.success(`成功发送 ${successCount} 条消息`);
    // }
  };

  const parseWsMessage = (data) => {
    try {
      // 先尝试解析 JSON 格式（新格式）
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.to || jsonData.msg) {
          return {
            to: jsonData.to,
            content: jsonData.msg,
            type: jsonData.type || 'text',
            fileUrl: jsonData.fileUrl || '',
            fileName: jsonData.fileName || '',
            fileSize: jsonData.fileSize || 0
          };
        }
      } catch (e) {
        // JSON 解析失败，尝试旧格式
      }
      
      // 旧格式 [username]：content
      const match = data.match(/^\[(.+?)\]：(.+)$/);
      if (match) {
        return {
          username: match[1],
          content: match[2],
          type: 'text'
        };
      }
    } catch (e) {
      console.error('解析消息失败', e);
    }
    return null;
  };

  const handleWsMessage = (data) => {
    console.log('收到 WebSocket 消息:', data);
    
    // 拦截 上下线状态推送消息
    if (data.includes("【状态变更】")) {
      const reg = /【状态变更】(.+?) 已(上线|下线)/;
      const res = data.match(reg);
      if (res) {
        const targetName = res[1];
        const isOnline = res[2] === "上线";
        const targetFriend = friendList.value.find(item => item.username === targetName);
        if (targetFriend) {
          targetFriend.online = isOnline;
        }
      }
      return;
    }

    const msgInfo = parseWsMessage(data);
    if (msgInfo) {
      console.log('解析后的消息:', msgInfo);
      console.log('当前聊天用户:', currentSelectName.value);
      
      // 如果当前正在聊天，直接刷新聊天记录
      if (currentSelectName.value) {
        console.log('刷新当前聊天记录:', currentSelectName.value);
        // 先临时添加消息到列表，快速显示
        try {
          let tempMsg = {
            msgContent: msgInfo.content,
            sendUsername: currentSelectName.value,
            receiveUsername: myUsername,
            createTime: new Date(),
            isRead: 0,
            type: msgInfo.type || 'text',
            fileUrl: msgInfo.fileUrl || '',
            fileName: msgInfo.fileName || '',
            fileSize: msgInfo.fileSize || 0
          };
          chatMsgList.value.push(tempMsg);
          scrollToBottom();
        } catch (e) {
          console.error('添加临时消息失败', e);
        }
        
        // 然后从服务器获取完整历史记录
        getChatHistory(currentSelectName.value);
      }
      
      // 更新好友列表
      getFriendList();
    }
  };

  const initWebSocket = () => {
    socket = new ChatWebSocket(JSON.parse(sessionStorage.getItem('userName')));
    socket.on('message', handleWsMessage);
    socket.connect();
  };

  const closeWebSocket = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  const reset = () => {
    currentSelectName.value = '';
    chatMsgList.value = [];
    inputText.value = '';
    searchText.value = '';
  };

  const openAddFriendDialog = async () => {
    addFriendDialogVisible.value = true;
    addFriendSearchText.value = '';
    await loadAvailableUsers();
  };

  const loadAvailableUsers = async () => {
    loadingAvailableUsers.value = true;
    try {
      const res = await chartApi.getAvailableUsers?.({ currentUser: myUsername });
      availableUsers.value = res?.data || [];
    } catch (error) {
      console.error('获取可用用户失败', error);
    } finally {
      loadingAvailableUsers.value = false;
    }
  };

  const addFriend = async (user) => {
    try {
      await chartApi.addFriend?.({
        currentUser: myUsername,
        friendUser: user.username
      });
      await getFriendList();
      addFriendDialogVisible.value = false;
    } catch (error) {
      console.error('添加好友失败', error);
    }
  };

  const loadFriendApplyList = async () => {
    loadingFriendApply.value = true;
    try {
      const res = await chartApi.getFriendApply({ currentUser: myUsername });
      friendApplyList.value = res.data || [];
    } catch (error) {
      console.error('获取好友申请列表失败', error);
    } finally {
      loadingFriendApply.value = false;
    }
  };

  const agreeFriend = async (applyUser) => {
    try {
      await chartApi.agreeFriend({
        currentUser: applyUser,
        friendUser: myUsername
      });
      await loadFriendApplyList();
      await getFriendList();
    } catch (error) {
      console.error('同意好友申请失败', error);
    }
  };

  const switchTab = (tab) => {
    activeTab.value = tab;
    if (tab === 'apply') {
      loadFriendApplyList();
    }
  };

  // ========== 初始化：Hook 一调用就加载头像 ==========
  // 异步初始化头像，不阻塞主线程
  initUserAvatar();

  const updateMyAvatar = (avatarUrl) => {
    myAvatar.value = avatarUrl;
  };

  // 获取用户信息
  const getUserInfo = async () => {
    loadingUserInfo.value = true;
    try {
      const res = await userApi.getUserInfo({ username: myUsername });
      if (res.code === 200 && res.data) {
        userInfo.value = {
          ...userInfo.value,
          ...res.data,
        };
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
    } finally {
      loadingUserInfo.value = false;
    }
  };

  // 更新用户信息
  const updateUserInfo = async (data) => {
    try {
      const res = await userApi.updateUserInfo({
        username: myUsername,
        ...data,
      });
      if (res.code === 200) {
        userInfo.value = {
          ...userInfo.value,
          ...data,
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新用户信息失败', error);
      return false;
    }
  };

  return {
    myUsername,
    myAvatar,
    userInfo,
    loadingUserInfo,
    friendList,
    chatList,
    filteredFriendList, // 新增：好友列表专用
    chatMsgList,
    currentSelectName,
    searchText,
    inputText,
    messagesContainer,
    filteredUsers,
    filteredAvailableUsers,
    currentUser,
    currentMessages,
    addFriendDialogVisible,
    addFriendSearchText,
    availableUsers,
    loadingAvailableUsers,
    friendApplyList,
    loadingFriendApply,
    activeTab,
    formatTime,
    formatLastTime,
    scrollToBottom,
    getFriendList,
    getChatHistory,
    getUnreadCountForFriend, // 新增：获取未读数
    setFriendToChatStatus, // 新增：设置聊天状态
    selectUser,
    sendMessage,
    sendFile, // 新增：发送文件
    sendFilesAndText, // 新增：批量发送文件和文本
    initWebSocket,
    closeWebSocket,
    reset,
    openAddFriendDialog,
    loadAvailableUsers,
    addFriend,
    loadFriendApplyList,
    agreeFriend,
    switchTab,
    updateMyAvatar,
    getUserInfo,
    updateUserInfo
  };
}
