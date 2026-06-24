<template>
  <div class="chart-page">
    <h1>聊天组件测试</h1>

    <div class="chat-container">
      <!-- 使用新的 ChatPanel 组件 - 这不是弹窗，可以直接嵌入任何位置 -->
      <ChatPanel
        :config="chatConfig"
        @init="onChatInit"
        @message="onMessage"
        @send="onSend"
        @error="onError"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
// 导入新的组件和配置函数
import {
  ChatPanel,
  createChatConfig,
} from "../../packages/vue-chat-kit/src/index.js";

// 配置聊天组件
const chatConfig = createChatConfig({
  api: {
    baseUrl: "http://localhost:1609",
    websocketUrl: "ws://localhost:3000/ws/chat",
    endpoints: {
      getMyGroups: "/chart/group/list",
    },
  },
  user: {
    username: JSON.parse(sessionStorage.getItem("userName")),
  },
  modules: {
    friends: true,
    apply: true,
    settings: true,
    fileUpload: true,
    avatarCrop: true,
  },
  // 添加自定义请求头（简单方式）
  headers: {
    Authorization: "Bearer your-token-here",
  },
  // 或者使用更灵活的请求拦截器
  requestInterceptors: [
    (config) => {
      // 在这里添加你的认证 token
      const token = sessionStorage.getItem("casToken");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      console.log("原始响应:", response);
      // 处理响应，例如 401 重定向等
      return response;
    },
  ],
});

// 事件处理
const onChatInit = () => {
  console.log("聊天组件初始化完成");
  ElMessage.success("聊天组件已加载");
};

const onMessage = (msg) => {
  console.log("收到新消息:", msg);
};

const onSend = (data) => {
  console.log("发送消息:", data);
};

const onError = (err) => {
  console.error("聊天组件错误:", err);
  ElMessage.error("聊天组件出错了");
};
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-container {
  max-width: 1100px;
  margin: 0 auto;
  height: 700px;
}
</style>
