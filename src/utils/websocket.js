class ChatWebSocket {
  constructor(userId, options = {}) {
    this.userId = userId;
    this.wsUrl = options.wsUrl || `ws://localhost:3000/ws/chat?userId=${userId}`;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 3000;
    this.handlers = {
      message: [],
      open: [],
      close: [],
      error: []
    };
    this.isConnecting = false;
  }

  connect() {
    if (this.isConnecting || this.isConnected()) return;
    
    this.isConnecting = true;
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] 连接成功');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.handlers.open.forEach(fn => fn());
      };

      this.socket.onmessage = (event) => {
        try {
          const data = event.data;
          this.handlers.message.forEach(fn => fn(data));
        } catch (e) {
          console.error('[WebSocket] 消息解析失败', e);
        }
      };

      this.socket.onclose = (event) => {
        console.log('[WebSocket] 连接关闭', event.code);
        this.isConnecting = false;
        this.handlers.close.forEach(fn => fn(event));
        if (event.code !== 1000) {
          this.reconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] 连接错误', error);
        this.isConnecting = false;
        this.handlers.error.forEach(fn => fn(error));
      };
    } catch (error) {
      console.error('[WebSocket] 创建连接失败', error);
      this.isConnecting = false;
    }
  }

  send(to, message) {
    if (this.isConnected()) {
      const data = JSON.stringify({ to, msg: message });
      this.socket.send(data);
      return true;
    }
    console.warn('[WebSocket] 连接未建立，无法发送消息');
    return false;
  }

  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
  }

  off(event, handler) {
    if (this.handlers[event]) {
      const index = this.handlers[event].indexOf(handler);
      if (index > -1) {
        this.handlers[event].splice(index, 1);
      }
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('[WebSocket] 重连次数已达上限');
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.handlers = {
        message: [],
        open: [],
        close: [],
        error: []
      };
    }
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default ChatWebSocket;
