<template>
  <el-dialog
    v-model="visible"
    width="900px"
    :close-on-click-modal="false"
    class="chat-dialog"
    append-to-body
    @closed="handleClosed"
  >
    <div class="flex h-[600px] bg-white overflow-hidden rounded-lg">
      <div class="w-72 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div class="flex border-b border-gray-200">
          <button
            :class="[
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === 'friends'
                ? 'bg-white text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
            @click="switchTab('friends')"
          >
            好友列表
          </button>
          <button
            :class="[
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'apply'
                ? 'bg-white text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
            @click="switchTab('apply')"
          >
            申请列表
            <span
              v-if="friendApplyList.length > 0"
              class="absolute top-2 right-3 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white min-w-[18px]"
            >
              {{ friendApplyList.length > 99 ? "99+" : friendApplyList.length }}
            </span>
          </button>
        </div>

        <div
          class="p-3 border-b border-gray-200"
          v-if="activeTab === 'friends'"
        >
          <div class="relative">
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索"
              class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <el-icon
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              ><Search
            /></el-icon>
          </div>
        </div>

        <div
          class="p-3 border-b border-gray-200"
          v-if="activeTab === 'friends'"
        >
          <el-button
            type="primary"
            size="small"
            class="w-full"
            @click="openAddFriendDialog"
          >
            <el-icon class="mr-1"><UserFilled /></el-icon>
            添加好友
          </el-button>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <template v-if="activeTab === 'friends'">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              :class="[
                'flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors',
                currentUser?.id === user.id ? 'bg-gray-200' : '',
              ]"
              @click="selectUser(user)"
            >
              <div class="relative flex-shrink-0">
                <img
                  :src="user.avatar"
                  :alt="user.name"
                  class="w-11 h-11 rounded-lg object-cover"
                />
                <span
                  :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    user.online ? 'bg-green-500' : 'bg-gray-400',
                  ]"
                />
              </div>
              <div class="ml-3 flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-800 text-sm">{{
                    user.name
                  }}</span>
                  <span class="text-xs text-gray-400">{{
                    formatLastTime(user.lastMsgTime)
                  }}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-gray-500 truncate pr-2">{{
                    user.lastMsg
                  }}</span>
                  <span
                    v-if="user.unread > 0"
                    class="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  >
                    {{ user.unread > 99 ? "99+" : user.unread }}
                  </span>
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="activeTab === 'apply'" class="p-3">
            <el-empty v-if="loadingFriendApply" description="加载中..." />
            <el-empty
              v-else-if="friendApplyList.length === 0"
              description="暂无好友申请"
            />
            <div
              v-else
              v-for="apply in friendApplyList"
              :key="apply.applyUser || apply.id"
              class="flex items-center justify-between p-3 bg-white rounded-lg mb-2 shadow-sm"
            >
              <div class="flex items-center">
                <img
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${apply.applyUser}`"
                  :alt="apply.applyUser"
                  class="w-11 h-11 rounded-lg object-cover"
                />
                <div class="ml-3">
                  <div class="font-medium text-gray-800 text-sm">
                    {{ apply.applyUser }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">请求添加你为好友</div>
                </div>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="agreeFriend(apply.applyUser)"
              >
                同意
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col min-w-0">
        <div v-if="currentUser" class="flex-1 flex flex-col min-h-0">
          <div
            class="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0"
          >
            <div class="flex items-center">
              <span class="font-medium text-gray-800">{{
                currentUser.name
              }}</span>
              <span
                :class="[
                  'ml-2 text-xs px-2 py-0.5 rounded',
                  currentUser.online
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500',
                ]"
              >
                {{ currentUser.online ? "在线" : "离线" }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-gray-500">
              <el-icon class="cursor-pointer hover:text-gray-700"
                ><Search
              /></el-icon>
              <el-icon class="cursor-pointer hover:text-gray-700"
                ><MoreFilled
              /></el-icon>
            </div>
          </div>

          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-4 bg-[#f5f5f5] min-h-0"
          >
            <div
              v-for="(msg, index) in currentMessages"
              :key="index"
              :class="[
                'flex mb-4',
                msg.isSelf ? 'justify-end' : 'justify-start',
              ]"
            >
              <div v-if="!msg.isSelf" class="flex items-end">
                <img
                  :src="currentUser.avatar"
                  :alt="currentUser.name"
                  class="w-10 h-10 rounded-md"
                />
                <div class="ml-2 max-w-[60%]">
                  <div class="text-xs text-gray-500 mb-1">
                    {{ currentUser.name }}
                  </div>
                  <div
                    class="bg-white rounded-lg rounded-bl-sm px-3 py-2 text-sm text-gray-800 shadow-sm"
                  >
                    {{ msg.text }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ formatTime(msg.time) }}
                  </div>
                </div>
              </div>
              <div v-else class="flex items-end">
                <div class="mr-2 max-w-[60%]">
                  <div class="text-xs text-gray-500 mb-1 text-right">我</div>
                  <div
                    class="bg-green-400 rounded-lg rounded-br-sm px-3 py-2 text-sm text-gray-800 shadow-sm"
                  >
                    {{ msg.text }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1 text-right">
                    {{ formatTime(msg.time) }}
                  </div>
                </div>
                <img :src="myAvatar" alt="我" class="w-10 h-10 rounded-md" />
              </div>
            </div>
          </div>

          <div class="bg-white border-t border-gray-200 flex-shrink-0">
            <div class="flex items-center p-3 gap-2">
              <el-icon class="text-gray-500 cursor-pointer hover:text-gray-700"
                ><ChatDotRound
              /></el-icon>
              <el-icon class="text-gray-500 cursor-pointer hover:text-gray-700"
                ><Folder
              /></el-icon>
              <el-icon class="text-gray-500 cursor-pointer hover:text-gray-700"
                ><Picture
              /></el-icon>
            </div>
            <div class="px-3 pb-3">
              <textarea
                v-model="inputText"
                @keydown.enter.prevent="sendMessage"
                placeholder="输入消息..."
                class="w-full resize-none border-0 outline-none text-sm h-[60px]"
                rows="2"
              />
            </div>
            <div class="flex justify-end px-3 pb-3">
              <el-button
                type="primary"
                :disabled="!inputText.trim()"
                @click="sendMessage"
                class="bg-green-500 hover:bg-green-600 border-0 text-sm px-6"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex-1 flex items-center justify-center flex-col bg-[#f5f5f5]"
        >
          <div class="text-gray-400 text-center">
            <el-icon size="48" class="mb-2"><ChatLineRound /></el-icon>
            <div>
              {{
                activeTab === "apply"
                  ? "在左侧选择好友申请"
                  : "在左侧选择好友开始聊天"
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="addFriendDialogVisible"
      title="添加好友"
      width="500px"
      append-to-body
    >
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="addFriendSearchText"
            type="text"
            placeholder="搜索用户"
            class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <el-icon
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            ><Search
          /></el-icon>
        </div>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <el-empty v-if="loadingAvailableUsers" description="加载中..." />
        <el-empty
          v-else-if="filteredAvailableUsers.length === 0"
          description="暂无用户"
        />
        <div
          v-else
          v-for="user in filteredAvailableUsers"
          :key="user.username"
          class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg mb-2 transition-colors"
        >
          <div class="flex items-center">
            <img
              :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`"
              :alt="user.username"
              class="w-10 h-10 rounded-lg object-cover"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">{{ user.username }}</div>
            </div>
          </div>
          <el-button type="primary" size="small" @click="addFriend(user)">
            添加
          </el-button>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { computed, watch, onUnmounted } from "vue";
import { useChat } from "@/composables/useChat";
import {
  Search,
  MoreFilled,
  ChatDotRound,
  Folder,
  Picture,
  ChatLineRound,
  UserFilled,
} from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const {
  myAvatar,
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
  addFriend,
  agreeFriend,
  switchTab,
} = useChat();

let refreshTimer = null;

const handleClosed = () => {
  reset();
  closeWebSocket();
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

watch(visible, async (newVal) => {
  if (newVal) {
    await getFriendList();
    initWebSocket();
    if (filteredUsers.value.length > 0) {
      selectUser(filteredUsers.value[0]);
    }
    refreshTimer = setInterval(() => {
      getFriendList();
    }, 5000);
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
.chat-dialog :deep(.el-dialog) {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
}

.chat-dialog :deep(.el-dialog__header) {
  display: none;
}

.chat-dialog :deep(.el-dialog__body) {
  padding: 0;
}
</style>
