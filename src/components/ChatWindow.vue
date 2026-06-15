<template>
  <el-dialog
    v-model="visible"
    width="1100px"
    :close-on-click-modal="false"
    class="chat-dialog"
    append-to-body
    @closed="handleClosed"
  >
    <div class="flex h-[680px] bg-white overflow-hidden">
      <!-- 左侧图标导航栏 -->
      <div class="w-16 theme-white flex flex-col items-center  gap-2">
        <div class="mb-4 cursor-pointer" @click="handleAvatarClick">
          <img :src="myAvatar" alt="头像" class="w-10 h-10 rounded-full border-2 theme-border" />
        </div>
        <div
          v-for="tab in navTabs"
          :key="tab.id"
          :class="[
            'w-10 h-10 flex items-center justify-center cursor-pointer rounded-lg transition-all relative',
          ]"
          @click="currentNavTab = tab.id"
        >
          <el-icon :size="24">
            <component
              :is="tab.icon"
              class="text-2xl font-bold"
              :class="{ 'text-[#07c160]': currentNavTab === tab.id }"
            />
          </el-icon>
          <span
            v-if="tab.badge"
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
          >
            {{ tab.badge > 99 ? "99+" : tab.badge }}
          </span>
        </div>
        <div class="flex-1"></div>
        <div
          class="w-10 h-10 flex items-center justify-center cursor-pointer rounded-lg hover:bg-[#3a3a3a] transition-all"
          @click="showSettingsDialog = true"
          title="设置"
        >
          <el-icon :size="24" class="text-white"><Setting /></el-icon>
        </div>
      </div>

      <!-- 中间内容栏 -->
      <div class="w-72 bg-[#f5f5f5] border-r border-gray-200 flex flex-col">
        <!-- 搜索栏 -->
        <div class="p-3">
          <div class="relative">
            <el-input
              v-model="searchText"
              style="width: 240px"
              placeholder="搜索"
              :suffix-icon="Search"
            />
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <!-- 聊天列表 -->
          <div v-if="currentNavTab === 'chat'">
            <div
              v-for="chat in filteredUsers"
              :key="chat.id"
              :class="[
                'flex items-center p-3 cursor-pointer hover:bg-[#e5e5e5] transition-colors',
                currentChatId === chat.id ? 'bg-[#d6d6d6]' : '',
              ]"
              @click="selectChat(chat)"
              @contextmenu.prevent.stop="showContextMenu($event, chat)"
            >
              <div class="relative flex-shrink-0">
                <img
                  :src="chat.avatar"
                  :alt="chat.name"
                  class="w-11 h-11 rounded-full object-cover"
                />
                <span
                  v-if="chat.online"
                  class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                ></span>
              </div>
              <div class="ml-3 flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-800 text-sm">{{
                    chat.name
                  }}</span>
                  <span class="text-xs text-gray-400">{{
                    formatLastTime(chat.lastTime)
                  }}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-gray-500 truncate pr-2">{{
                    chat.lastMsg
                  }}</span>
                  <span
                    v-if="chat.unread > 0"
                    class="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  >
                    {{ chat.unread > 99 ? "99+" : chat.unread }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 好友列表 -->
          <div v-if="currentNavTab === 'friends'">
            <div class="p-3">
              <div
                class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[#e5e5e5]"
                @click="openAddFriendDialog"
              >
                <div
                  class="w-11 h-11 bg-[#07c160] rounded-lg flex items-center justify-center"
                >
                  <el-icon class="text-white" :size="20"><Plus /></el-icon>
                </div>
                <span class="text-sm text-gray-800">添加好友</span>
              </div>
            </div>
            <div
              v-for="friend in filteredFriendList"
              :key="friend.id"
              class="flex items-center p-3 cursor-pointer hover:bg-[#e5e5e5] transition-colors"
              @click="selectFriend(friend)"
            >
              <div class="relative flex-shrink-0">
                <img
                  :src="friend.avatar"
                  :alt="friend.name"
                  class="w-11 h-11 rounded-full object-cover"
                />
                <span
                  :class="[
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    friend.online ? 'bg-green-500' : 'bg-gray-400',
                  ]"
                ></span>
              </div>
              <div class="ml-3">
                <span class="font-medium text-gray-800 text-sm">{{
                  friend.name
                }}</span>
              </div>
            </div>
          </div>

          <!-- 申请列表 -->
          <div v-if="currentNavTab === 'apply'">
            <el-empty v-if="loadingFriendApply" description="加载中..." />
            <el-empty
              v-else-if="friendApplyList.length === 0"
              description="暂无好友申请"
            />
            <div
              v-else
              v-for="apply in friendApplyList"
              :key="apply.applyUser || apply.id"
              class="flex items-center justify-between p-3 hover:bg-[#e5e5e5]"
            >
              <div class="flex items-center">
                <img
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${apply.applyUser}`"
                  :alt="apply.applyUser"
                  class="w-11 h-11 rounded-full object-cover"
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
                >同意</el-button
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天/详情区域 -->
      <div class="flex-1 flex flex-col min-w-0 bg-white">
        <!-- 好友信息展示区域 -->
        <div v-if="currentSelectedFriend" class="flex-1 flex flex-col min-h-0">
          <div
            class="flex-1 flex flex-col items-center justify-center p-8 bg-[#f5f5f5]"
          >
            <img
              :src="currentSelectedFriend.avatar"
              :alt="currentSelectedFriend.name"
              class="w-24 h-24 rounded-full object-cover mb-6"
            />
            <div class="text-xl font-medium text-gray-800 mb-2">
              {{ currentSelectedFriend.name }}
            </div>
            <div class="flex items-center gap-2 mb-8">
              <span
                :class="[
                  'w-2 h-2 rounded-full',
                  currentSelectedFriend.online ? 'bg-green-500' : 'bg-gray-400',
                ]"
              ></span>
              <span class="text-sm text-gray-500">{{
                currentSelectedFriend.online ? "在线" : "离线"
              }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              @click="handleStartChat"
              class="w-40"
            >
              <el-icon><ChatDotRound /></el-icon>
              <span>发消息</span>
            </el-button>
          </div>
        </div>
        <!-- 聊天窗口 -->
        <div v-if="currentChat" class="flex-1 flex flex-col min-h-0">
          <!-- 顶部标题栏 -->
          <div
            class="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white"
          >
            <div class="flex items-center gap-3">
              <span class="font-medium text-gray-800">{{
                currentChat.name
              }}</span>
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded',
                  currentChat.online
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500',
                ]"
              >
                {{ currentChat.online ? "在线" : "离线" }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-gray-500">
              <el-icon class="cursor-pointer hover:text-gray-700"
                ><Search
              /></el-icon>
              <el-icon
                class="cursor-pointer hover:text-gray-700"
                @click="showChatDetail = !showChatDetail"
                ><MoreFilled
              /></el-icon>
            </div>
          </div>

          <!-- 聊天消息区域 -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-4 bg-[#f5f5f5] min-h-0 message-list"
          >
            <div
              v-for="(msg, index) in currentMessages"
              :key="index"
              :class="[
                'flex mb-6 items-start',
                msg.isSelf ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <!-- 头像 -->
              <div class="flex-shrink-0">
                <img
                  :src="msg.isSelf ? myAvatar : currentChat.avatar"
                  class="w-10 h-10 rounded-lg object-cover"
                />
              </div>

              <!-- 消息内容 -->
              <div
                :class="[
                  'flex flex-col max-w-[75%]',
                  msg.isSelf ? 'mr-3 items-end' : 'ml-3 items-start',
                ]"
              >
                <div v-if="!msg.isSelf" class="text-xs text-gray-500 mb-1 ml-1">
                  {{ currentChat.name }}
                </div>

                <div class="relative group">
                  <!-- 文本消息 -->
                  <div
                    v-if="msg.type === 'text'"
                    :class="[
                      'px-3 py-2 text-sm break-all whitespace-pre-wrap rounded-lg shadow-sm',
                      msg.isSelf
                        ? 'bg-[#95ec69] text-gray-800 self-end message-bubble-self'
                        : 'bg-white text-gray-800 message-bubble-other',
                    ]"
                  >
                    {{ msg.text }}
                  </div>

                  <!-- 图片文件消息 -->
                  <div
                    v-else-if="msg.type === 'file' && msg.fileType === 'image'"
                    :class="[
                      'rounded-lg relative shadow-sm cursor-pointer overflow-hidden max-w-[300px]',
                      msg.isSelf ? 'self-end' : 'self-start',
                    ]"
                    @click="openFile(msg.fileUrl)"
                  >
                    <img
                      :src="msg.fileUrl"
                      :alt="msg.fileName"
                      class="w-full h-auto block"
                      @error="handleImageError"
                    />
                    <div
                      v-if="msg.fileName || msg.fileSize"
                      :class="[
                        msg.isSelf ? 'bg-[#95ec69] text-gray-700' : 'bg-white text-gray-500',
                      ]"
                    >
                      <!-- <span>{{ msg.fileName }}</span> -->
                      <div class=" absolute left-1 bottom-0 text-white" v-if="msg.fileSize">  {{ formatFileSize(msg.fileSize) }}</div>
                    </div>
                  </div>

                  <!-- 文档文件消息 -->
                  <div
                    v-else-if="msg.type === 'file'"
                    :class="[
                      'rounded-lg shadow-sm cursor-pointer overflow-hidden min-w-[200px]',
                      msg.isSelf
                        ? 'self-end message-bubble-self'
                        : 'message-bubble-other',
                    ]"
                    @click="openFile(msg.fileUrl)"
                  >
                    <div
                      :class="[
                        'flex items-center gap-3 px-4 py-3',
                        msg.isSelf ? 'bg-[#95ec69]' : 'bg-white',
                      ]"
                    >
                      <!-- 文件图标 -->
                      <div
                        :class="[
                          'w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0',
                        ]"
                      >
                        <!-- Excel 图标 -->
                        <i v-if="msg.fileType === 'excel'" class="text-2xl theme-text-active iconfont icon-excel"></i>
                        <!-- PDF 图标 -->
                        <i v-else-if="msg.fileType === 'pdf'" class="text-xl theme-text-active iconfont icon-pdf"></i>
                        <!-- Word 图标 -->
                        <i v-else-if="msg.fileType === 'docx'" class="text-2xl theme-text-active iconfont icon-docx"></i>
                        <!-- 默认图标 -->
                        <el-icon
                          v-else
                          :class="[
                            'text-2xl',
                            msg.isSelf ? 'text-gray-700' : 'text-gray-500',
                          ]"
                        >
                          <Document />
                        </el-icon>
                      </div>

                      <!-- 文件信息 -->
                      <div class="flex-1 min-w-0">
                        <div
                          :class="[
                            'truncate text-sm font-medium leading-tight',
                            msg.isSelf ? 'text-gray-800' : 'text-gray-800',
                          ]"
                        >
                          {{ msg.fileName || msg.text }}
                        </div>
                        <div
                          :class="[
                            'text-xs mt-1 flex items-center gap-2',
                            msg.isSelf ? 'text-gray-600' : 'text-gray-500',
                          ]"
                        >
                          <el-icon :size="12"><Download /></el-icon>
                          <span>点击下载</span>
                          <span v-if="msg.fileSize">· {{ formatFileSize(msg.fileSize) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 时间显示在气泡下方 -->
                  <div
                    :class="[
                      'text-[10px] text-gray-400 mt-1',
                      msg.isSelf ? 'text-right' : 'text-left',
                    ]"
                  >
                    {{ formatTime(msg.time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部输入区域 -->
          <div class="bg-white border-t border-gray-200">
            <!-- 待发送文件预览 -->
            <div
              v-if="pendingFiles.length > 0"
              class="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-2"
            >
              <div
                v-for="(file, index) in pendingFiles"
                :key="file.id"
                class="relative group"
              >
                <!-- 图片预览 -->
                <div
                  v-if="file.isImage"
                  class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    :src="file.previewUrl"
                    :alt="file.name"
                    class="w-full h-full object-cover"
                  />
                  <button
                    @click="removePendingFile(index)"
                    class="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-xs"
                  >
                    ×
                  </button>
                </div>
                <!-- 非图片文件预览 -->
                <div
                  v-else
                  class="relative w-24 h-20 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-1"
                >
                  <el-icon class="text-gray-400 text-2xl mb-1"
                    ><Folder
                  /></el-icon>
                  <span
                    class="text-xs text-gray-500 truncate w-full text-center px-1"
                    >{{ file.name }}</span
                  >
                  <button
                    @click="removePendingFile(index)"
                    class="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center p-3 gap-2">
              <el-icon class="text-gray-500 cursor-pointer hover:text-gray-700"
                ><ChatDotRound
              /></el-icon>
              <el-icon
                class="text-gray-500 cursor-pointer hover:text-gray-700"
                @click="triggerFileSelect"
                ><Folder
              /></el-icon>
              <el-icon class="text-gray-500 cursor-pointer hover:text-gray-700"
                ><Picture
              /></el-icon>
            </div>
            <div class="px-3 pb-3">
              <textarea
                v-model="inputText"
                @keydown.enter.prevent="handleSend"
                @paste="handlePaste"
                placeholder="输入消息或粘贴文件..."
                class="w-full resize-none border-0 outline-none text-sm h-[80px]"
                rows="3"
              />
            </div>
            <div class="flex justify-end px-3 pb-3">
              <el-button
                type="primary"
                :disabled="!inputText.trim() && pendingFiles.length === 0"
                @click="handleSend"
                class="bg-[#07c160] hover:bg-[#06ad56] border-0 text-sm px-6"
              >
                发送
              </el-button>
            </div>

            <!-- 隐藏的文件 input -->
            <input
              ref="fileInputRef"
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect"
            />
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="flex-1 flex items-center justify-center flex-col bg-[#f5f5f5]"
        >
          <el-icon :size="64" class="text-gray-300 mb-2"
            ><ChatLineRound
          /></el-icon>
          <div class="text-gray-400">
            {{
              currentNavTab === "apply"
                ? "在左侧选择好友申请"
                : "在左侧选择好友开始聊天"
            }}
          </div>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div
        v-if="showChatDetail"
        class="w-64 bg-[#f5f5f5] border-l border-gray-200 flex flex-col"
      >
        <div
          class="h-14 flex items-center justify-center border-b border-gray-200"
        >
          <span class="font-medium text-gray-700">聊天详情</span>
        </div>
        <div class="flex-1 p-4">
          <!-- 聊天详情内容 -->
          <div class="flex flex-col items-center">
            <img
              :src="currentChat.avatar"
              :alt="currentChat.name"
              class="w-20 h-20 rounded-full object-cover"
            />
            <div class="mt-3 font-medium text-gray-800 text-lg">
              {{ currentChat.name }}
            </div>
            <div class="mt-6 w-full">
              <div class="bg-white rounded-lg">
                <div
                  class="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <span class="text-sm text-gray-700">查找聊天记录</span>
                </div>
                <div
                  class="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <span class="text-sm text-gray-700">清空聊天记录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加好友弹窗 -->
    <el-dialog
      v-model="addFriendDialogVisible"
      title="添加好友"
      width="500px"
      append-to-body
    >
      <div class="mb-4">
        <div class="relative">
          <el-input
            v-model="addFriendSearchText"
            placeholder="搜索用户"
            :suffix-icon="Search"
          />
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
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-800">{{ user.username }}</div>
            </div>
          </div>
          <el-button type="primary" size="small" @click="addFriend(user)"
            >添加</el-button
          >
        </div>
      </div>
    </el-dialog>

    <!-- 用户设置弹窗 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="个人设置"
      width="560px"
      :close-on-click-modal="false"
      append-to-body
      class="settings-dialog"
    >
      <div class="flex flex-col">
        <!-- 头像设置区域 -->
        <div
          class="flex flex-col items-center mb-8 pb-6 border-b border-gray-100"
        >
          <div class="relative mb-4">
            <img
              :src="myAvatar"
              alt="头像"
              class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div
              class="absolute -bottom-1 -right-1 w-10 h-10 border theme-bg rounded-full flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              @click="triggerAvatarUpload"
            >
              <el-icon :size="18" class="text-white"><Camera /></el-icon>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarFileChange"
            />
          </div>
          <div class="text-center">
            <div class="font-semibold text-gray-800 text-xl">
              {{ userInfo.nickname || myUsername }}
            </div>
            <div class="text-sm text-gray-500 mt-1">@{{ myUsername }}</div>
          </div>
        </div>

        <!-- 用户信息表单 -->
        <div class="space-y-5">
          <div class="flex items-center justify-between mb-2">
            <div class="text-gray-700 font-semibold flex items-center gap-2">
              <el-icon><UserFilled /></el-icon>
              个人信息
            </div>
            <el-button
              v-if="!isEditingUserInfo"
              type="primary"
              size="small"
              @click="startEditUserInfo"
              class="rounded-full"
            >
              编辑
            </el-button>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 space-y-5">
            <!-- 昵称 -->
            <div>
              <label class="block text-sm text-gray-600 mb-2 font-medium"
                >昵称</label
              >
              <el-input
                v-if="isEditingUserInfo"
                v-model="editingUserInfo.nickname"
                placeholder="请输入昵称"
                size="large"
              />
              <div
                v-else
                class="text-gray-800 bg-white rounded-lg px-4 py-3 border border-gray-200"
              >
                {{ userInfo.nickname || "未设置" }}
              </div>
            </div>

            <!-- 邮箱 -->
            <div>
              <label class="block text-sm text-gray-600 mb-2 font-medium"
                >邮箱</label
              >
              <el-input
                v-if="isEditingUserInfo"
                v-model="editingUserInfo.email"
                placeholder="请输入邮箱"
                size="large"
              />
              <div
                v-else
                class="text-gray-800 bg-white rounded-lg px-4 py-3 border border-gray-200"
              >
                {{ userInfo.email || "未设置" }}
              </div>
            </div>

            <!-- 手机号 -->
            <div>
              <label class="block text-sm text-gray-600 mb-2 font-medium"
                >手机号</label
              >
              <el-input
                v-if="isEditingUserInfo"
                v-model="editingUserInfo.phone"
                placeholder="请输入手机号"
                size="large"
              />
              <div
                v-else
                class="text-gray-800 bg-white rounded-lg px-4 py-3 border border-gray-200"
              >
                {{ userInfo.phone || "未设置" }}
              </div>
            </div>

            <!-- 个人简介 -->
            <div>
              <label class="block text-sm text-gray-600 mb-2 font-medium"
                >个人简介</label
              >
              <el-input
                v-if="isEditingUserInfo"
                v-model="editingUserInfo.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下自己吧..."
                size="large"
              />
              <div
                v-else
                class="text-gray-800 bg-white rounded-lg px-4 py-3 border border-gray-200 min-h-[80px]"
              >
                {{ userInfo.bio || "这个人很懒，什么都没写~" }}
              </div>
            </div>

            <!-- 编辑按钮 -->
            <div v-if="isEditingUserInfo" class="flex gap-3 justify-end pt-2">
              <el-button size="default" @click="cancelEditUserInfo"
                >取消</el-button
              >
              <el-button
                type="primary"
                size="default"
                :loading="savingUserInfo"
                @click="saveUserInfo"
                >保存更改</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 头像裁剪弹窗 -->
    <AvatarCrop
      v-model="showAvatarEditor"
      :src="avatarImageSrc"
      @confirm="handleAvatarCropConfirm"
    />

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item" @click="handleRemoveChat">删除聊天</div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, watch, nextTick, ref, onMounted, onUnmounted } from "vue";
import {
  Camera,
  ChatDotRound,
  Folder,
  Picture,
  ChatLineRound,
  MoreFilled,
  Search,
  Plus,
  UserFilled,
  Bell,
  Setting,
  Document,
  Download,
} from "@element-plus/icons-vue";
import { useChat } from "@/composables/useChat";
import { ElMessage } from "element-plus";
import { userApi } from "@/services/user";
import AvatarCrop from "./AvatarCrop.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 导航tab数据
const navTabs = computed(() => [
  { id: "chat", icon: ChatDotRound, badge: 0 },
  { id: "friends", icon: UserFilled, badge: 0 },
  { id: "apply", icon: Bell, badge: friendApplyList.value?.length || 0 }, // 好友申请数量就是 getFriendApply 接口的条数
]);
const currentNavTab = ref("chat");

// 聊天列表数据
const currentChatId = ref(null);
const currentChat = ref(null);
const showChatDetail = ref(false);
const showProfile = ref(false);

// 用户信息编辑
const isEditingUserInfo = ref(false);
const editingUserInfo = ref({
  nickname: "",
  email: "",
  phone: "",
  bio: "",
});
const savingUserInfo = ref(false);

// 设置弹窗
const showSettingsDialog = ref(false);

// 头像相关
const showAvatarEditor = ref(false);
const avatarUploading = ref(false);
const avatarInputRef = ref(null);
const avatarImageSrc = ref("");

// 文件上传相关
const fileInputRef = ref(null);
const pendingFiles = ref([]); // 待发送的文件列表

const {
  myUsername,
  myAvatar,
  userInfo,
  loadingUserInfo,
  friendList,
  filteredFriendList, // 新增：好友列表专用
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
  setFriendToChatStatus, // 新增：设置聊天状态
  selectUser,
  sendMessage,
  sendFile, // 新增：发送文件
  sendFilesAndText, // 新增：批量发送文件和文本
  initWebSocket,
  closeWebSocket,
  reset,
  openAddFriendDialog,
  addFriend,
  loadFriendApplyList,
  agreeFriend,
  updateMyAvatar,
  getUserInfo,
  updateUserInfo,
} = useChat();

// 右键菜单相关
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  chat: null,
});

// 显示右键菜单
const showContextMenu = (e, chat) => {
  e.preventDefault();
  e.stopPropagation();
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    chat: chat,
  };
};

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.visible = false;
};

// 移除聊天（设置状态为0）
const handleRemoveChat = async () => {
  if (!contextMenu.value.chat) return;
  const success = await setFriendToChatStatus(contextMenu.value.chat.id, 0);
  if (success) {
    // 如果当前正在和该好友聊天，清空当前聊天
    if (currentChatId.value === contextMenu.value.chat.id) {
      currentChatId.value = null;
      currentChat.value = null;
    }
  }
  hideContextMenu();
};

// 当前选中展示信息的好友
const currentSelectedFriend = ref(null);

// 监听导航 Tab 变化
watch(currentNavTab, (newTab) => {
  if (newTab !== "friends") {
    // 切换到非好友 Tab 时，重置好友信息展示
    currentSelectedFriend.value = null;
  }
  if (newTab === "chat" && currentChatId.value) {
    // 如果在聊天 Tab 并且已有选中的聊天，确保显示聊天窗口
    currentSelectedFriend.value = null;
  }
});

const selectChat = (chat) => {
  currentChatId.value = chat.id;
  currentChat.value = chat;
  currentSelectedFriend.value = null; // 选择聊天时重置好友信息展示
  showChatDetail.value = false;
  selectUser({
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar,
    online: chat.online,
  });
};

const selectFriend = (friend) => {
  // 在好友 Tab 选择好友时，先显示好友信息而不是直接聊天
  currentSelectedFriend.value = friend;
  currentChatId.value = null;
  currentChat.value = null;
};

// 去聊天
const handleStartChat = async () => {
  if (!currentSelectedFriend.value) return;

  // 调用接口设置好友为聊天状态
  const success = await setFriendToChatStatus(currentSelectedFriend.value.id);
  if (success) {
    // 切换到聊天 Tab
    currentNavTab.value = "chat";

    // 等待列表更新后，选中该好友开始聊天
    await nextTick();
    const chatItem = filteredUsers.value.find(
      (u) => u.id === currentSelectedFriend.value.id,
    );
    if (chatItem) {
      selectChat(chatItem);
    }
    currentSelectedFriend.value = null;
  }
};

const handleAvatarClick = () => {
  showSettingsDialog.value = true;
};

const triggerAvatarUpload = () => {
  avatarInputRef.value?.click();
};

// 文件选择相关
const triggerFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  // 添加到待发送文件列表
  for (const file of files) {
    // 文件大小限制，比如 50MB
    if (file.size > 50 * 1024 * 1024) {
      ElMessage.warning(`文件 ${file.name} 超过50MB，已跳过`);
      continue;
    }

    // 生成预览URL
    const previewUrl = URL.createObjectURL(file);
    pendingFiles.value.push({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: previewUrl,
      isImage: file.type.startsWith("image/"),
    });
  }

  // 清空 input
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

// 移除待发送的文件
const removePendingFile = (index) => {
  const file = pendingFiles.value[index];
  if (file.previewUrl) {
    URL.revokeObjectURL(file.previewUrl);
  }
  pendingFiles.value.splice(index, 1);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 发送消息（文本 + 文件）
const handleSend = async () => {
  if (!inputText.value.trim() && pendingFiles.value.length === 0) {
    return;
  }

  // 复制待发送文件列表
  const filesToSend = [...pendingFiles.value];
  const textToSend = inputText.value;

  // 清空输入框和待发送文件列表
  inputText.value = "";
  pendingFiles.value.forEach((file) => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
  });
  pendingFiles.value = [];

  // 发送
  await sendFilesAndText(filesToSend, textToSend);
};

// 处理粘贴事件
const handlePaste = (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        // 文件大小限制，比如 50MB
        if (file.size > 50 * 1024 * 1024) {
          ElMessage.warning(`文件 ${file.name} 超过50MB，已跳过`);
          continue;
        }

        // 生成预览URL
        const previewUrl = URL.createObjectURL(file);
        pendingFiles.value.push({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: previewUrl,
          isImage: file.type.startsWith("image/"),
        });
      }
    }
  }
};

// 打开文件
const openFile = (fileUrl) => {
  if (!fileUrl) {
    ElMessage.warning('文件地址无效');
    return;
  }

  // 在新窗口打开文件
  window.open(fileUrl, '_blank');
};

// 图片加载失败处理
const handleImageError = (e) => {
  console.warn('图片加载失败:', e);
};

const handleAvatarFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error("图片大小不能超过 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    avatarImageSrc.value = event.target.result;
    showAvatarEditor.value = true;
  };
  reader.readAsDataURL(file);
};

const handleAvatarCropConfirm = async ({ file }) => {
  if (!file) return;

  avatarUploading.value = true;
  try {
    const res = await userApi.uploadAvatar({
      file,
      username: myUsername,
    });
    if (res.code === 200) {
      ElMessage.success("头像上传成功");
      updateMyAvatar(res.data);
      resetAvatar();
    } else {
      ElMessage.error(res.msg || "头像上传失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("头像上传失败");
  } finally {
    avatarUploading.value = false;
  }
};

const resetAvatar = () => {
  avatarImageSrc.value = "";
  showAvatarEditor.value = false;
  if (avatarInputRef.value) {
    avatarInputRef.value.value = "";
  }
};

// 用户信息编辑相关
const startEditUserInfo = () => {
  editingUserInfo.value = {
    nickname: userInfo.value.nickname || "",
    email: userInfo.value.email || "",
    phone: userInfo.value.phone || "",
    bio: userInfo.value.bio || "",
  };
  isEditingUserInfo.value = true;
};

const cancelEditUserInfo = () => {
  isEditingUserInfo.value = false;
  editingUserInfo.value = {
    nickname: "",
    email: "",
    phone: "",
    bio: "",
  };
};

const saveUserInfo = async () => {
  savingUserInfo.value = true;
  try {
    const success = await updateUserInfoApi(editingUserInfo.value);
    if (success) {
      ElMessage.success("保存成功");
      isEditingUserInfo.value = false;
    } else {
      ElMessage.error("保存失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("保存失败");
  } finally {
    savingUserInfo.value = false;
  }
};

const handleClosed = () => {
  reset();
  closeWebSocket();
  showProfile.value = false;
  showChatDetail.value = false;
  showSettingsDialog.value = false;
  resetAvatar();
  isEditingUserInfo.value = false;
};

// 生命周期钩子：监听点击外部关闭右键菜单
onMounted(() => {
  document.addEventListener("click", hideContextMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", hideContextMenu);
});

watch(visible, async (newVal) => {
  if (newVal) {
    await Promise.all([getFriendList(), loadFriendApplyList(), getUserInfo()]);
    initWebSocket();
    if (filteredUsers.value.length > 0) {
      selectChat(filteredUsers.value[0]);
    }
  }
});
</script>

<style scoped>
.chat-dialog :deep(.el-dialog) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

.chat-dialog :deep(.el-dialog__header) {
  display: none;
}

.chat-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* 微信样式消息气泡 */
.message-bubble-self {
  position: relative;
  background-color: #95ec69 !important;
}

.message-bubble-self::after {
  content: "";
  position: absolute;
  right: -5px;
  top: 10px;
  width: 10px;
  height: 10px;
  background-color: #95ec69;
  transform: rotate(45deg);
  box-shadow: 2px -2px 2px 0 rgba(0, 0, 0, 0.05);
}

.message-bubble-other {
  position: relative;
  background-color: white !important;
}

.message-bubble-other::after {
  content: "";
  position: absolute;
  left: -5px;
  top: 10px;
  width: 10px;
  height: 10px;
  background-color: white;
  transform: rotate(45deg);
  box-shadow: -2px 2px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 消息列表滚动条 */
.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
.message-list::-webkit-scrollbar-track {
  background: transparent;
}

/* 设置弹窗样式 */
.settings-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.settings-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0;
  margin: 0;
}

.settings-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.settings-dialog :deep(.el-dialog__body) {
  padding: 20px 24px 24px;
}

.settings-dialog :deep(.el-dialog__footer) {
  padding: 0 24px 24px;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 150px;
}

.context-menu-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.context-menu-item:last-child {
  border-radius: 0 0 8px 8px;
}
</style>
