import { ref, computed, nextTick } from 'vue';
import { chartApi } from '@/services/chart';
import ChatWebSocket from '@/utils/websocket';
import dayjs from 'dayjs';

export function useChat() {
  const myUsername = JSON.parse(sessionStorage.getItem('userName')) || 'admin';
  const myAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`;

  const friendList = ref([]);
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

  const filteredUsers = computed(() => {
    let list = friendList.value;
    if (searchText.value) {
      list = list.filter(item => item.username?.includes(searchText.value));
    }
    return list.map(item => ({
      id: item.username,
      name: item.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
      online: item.online,
      lastMsg: item.lastMsg || '暂无消息',
      lastMsgTime: item.lastTime,
      unread: item.unReadNum
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

  const currentMessages = computed(() => {
    return chatMsgList.value.map(item => ({
      text: item.msgContent,
      isSelf: item.sendUsername === myUsername,
      time: item.createTime,
      sendUsername: item.sendUsername
    }));
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
      friendList.value = res.data || [];
    } catch (error) {
      console.error('获取好友列表失败', error);
    }
  };

  const getChatHistory = async (targetName) => {
    console.log(myUsername,'myUsername');
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

    const success = socket.send(currentSelectName.value, inputText.value.trim());
    if (success) {
      const tempMsg = {
        msgContent: inputText.value.trim(),
        sendUsername: myUsername,
        receiveUsername: currentSelectName.value,
        createTime: new Date(),
        isRead: 0
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

  const parseWsMessage = (data) => {
    try {
      const match = data.match(/^\[(.+?)\]：(.+)$/);
      if (match) {
        return {
          username: match[1],
          content: match[2]
        };
      }
    } catch (e) {
      console.error('解析消息失败', e);
    }
    return null;
  };

  const handleWsMessage = (data) => {
    const msgInfo = parseWsMessage(data);
    if (msgInfo) {
      if (msgInfo.username === currentSelectName.value) {
        getChatHistory(currentSelectName.value);
      }
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

  return {
    myUsername,
    myAvatar,
    friendList,
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
    selectUser,
    sendMessage,
    initWebSocket,
    closeWebSocket,
    reset,
    openAddFriendDialog,
    loadAvailableUsers,
    addFriend,
    loadFriendApplyList,
    agreeFriend,
    switchTab
  };
}
