<template>
  <el-dialog
    v-model="visible"
    width="1100px"
    :close-on-click-modal="false"
    class="chat-dialog"
    append-to-body
    @closed="handleClosed"
  >
      <ChatPanel 
        :config="chatConfig" 
        @init="onChatInit"
        @message="onMessage"
        @send="onSend"
        @error="onError"
      />
  </el-dialog>

</template>

<script setup>
import { ChatPanel, createChatConfig } from 'vue-chat-kit'
import 'vue-chat-kit/style'
// 解析全部 query 参数
const searchParams = new URLSearchParams(location.search)
// 取单个参数，例：?username=admin3
const username = JSON.parse(sessionStorage.getItem('userName')) || '默认用户名'
import { ref } from 'vue'
const visible = ref(false)

console.log(sessionStorage.getItem('casToken'),"casToken:")

// 配置聊天组件
const chatConfig = createChatConfig({
  api: {
    baseUrl: 'http://localhost:1609',
    websocketUrl: 'ws://localhost:3000/ws/chat',
  },
  user: {
    username: username
  },
  modules: {
    friends: true,
    apply: true,
    settings: true,
    fileUpload: true,
    avatarCrop: true
  },
  // 添加自定义请求头（简单方式）
  // headers: {
  //   'Authorization': `Bearer ${sessionStorage.getItem('casToken')}`
  // },
  // 或者使用更灵活的请求拦截器
  requestInterceptors: [
    (config) => {
      // 在这里添加你的认证 token
      const token = sessionStorage.getItem('casToken')
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      }
      return config
    }
  ],
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 处理响应，例如 401 重定向等
      return response
    }
  ]
})

// 事件处理
const onChatInit = () => {
  console.log('聊天组件初始化完成')
}

const onMessage = (msg) => {
  console.log('收到新消息:', msg)
}

const onSend = (data) => {
  console.log('发送消息:', data)
}

const onError = (err) => {
  console.error('聊天组件错误:', err)
}
</script>

<style scoped>
.chart-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chart-page h1 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.chat-container {
  max-width: 1100px;
  margin: 0 auto;
  height: 700px;
}
</style>
