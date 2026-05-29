// 基础配置
const BASE_URL = window.global_config?.api?.baseUrl || '';
const TIMEOUT = 10000; // 10秒超时

// 请求拦截器
const requestInterceptors = [];

// 响应拦截器
const responseInterceptors = [];

// 添加请求拦截器
export const addRequestInterceptor = (interceptor) => {
  requestInterceptors.push(interceptor);
};

// 添加响应拦截器
export const addResponseInterceptor = (interceptor) => {
  responseInterceptors.push(interceptor);
};

// 错误类型
class RequestError extends Error {
  constructor(message, status, code, data) {
    super(message);
    this.name = 'RequestError';
    this.status = status || 0;
    this.code = code || 0;
    this.data = data;
  }
}

// 默认请求拦截器 - 添加token
addRequestInterceptor((config) => {
  const token = sessionStorage.getItem('casToken') || '';
  config.headers = {
    ...config.headers,
    'Authorization': `Bearer ${token}`,
  };

  // 添加默认headers，但如果是FormData则不设置Content-Type
  if (!(config.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  return config;
});

// 默认响应拦截器 - 处理token过期
addResponseInterceptor((response) => {
  if (response.status === 401) {
    // token 过期逻辑
  }
  return response;
});

// 超时控制
const timeoutPromise = (timeout) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new RequestError('请求超时', 408, 408));
    }, timeout);
  });
};

// 核心请求函数
async function request(url, config = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = TIMEOUT,
    withCredentials = true,
    params,
  } = config;

  // 构建完整URL
  let fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // 应用请求拦截器
  let finalConfig = { method, headers, body, timeout, withCredentials };
  requestInterceptors.forEach(interceptor => {
    finalConfig = interceptor(finalConfig);
  });

  // 构建fetch配置
  const fetchConfig = {
    method: finalConfig.method,
    headers: finalConfig.headers,
    credentials: finalConfig.withCredentials ? 'include' : 'omit',
  };

  // 处理请求体
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      fetchConfig.body = body;
    } else if (typeof body === 'object') {
      fetchConfig.body = JSON.stringify(body);
    } else {
      fetchConfig.body = body;
    }
  }

  // 处理GET参数
  if (params) {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    }
    const queryString = queryParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  try {
    // 发起请求，支持超时控制
    const response = await Promise.race([
      fetch(fullUrl, fetchConfig),
      timeoutPromise(finalConfig.timeout || TIMEOUT)
    ]);

    // 应用响应拦截器
    let finalResponse = response;
    responseInterceptors.forEach(interceptor => {
      finalResponse = interceptor(finalResponse);
    });

    // 检查HTTP状态码
    if (!finalResponse.ok) {
      throw new RequestError(
        `HTTP ${finalResponse.status}: ${finalResponse.statusText}`,
        finalResponse.status,
        finalResponse.status
      );
    }

    // 解析响应数据
    const contentType = finalResponse.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await finalResponse.json();
    } else {
      data = await finalResponse.text();
    }

    // 检查业务状态码
    // if (data && data.code !== undefined && data.code !== 200) {
    //   throw new RequestError(
    //     data.message || '请求失败',
    //     finalResponse.status,
    //     data.code,
    //     data
    //   );
    // }

    return data;
  } catch (error) {
    if (error instanceof RequestError) {
      throw error;
    }

    // 网络错误或其他错误
    throw new RequestError(
      error instanceof Error ? error.message : '网络错误',
      0,
      0
    );
  }
}

// 便捷方法
export const http = {
  get: (url, params, config) =>
    request(url, { ...config, method: 'GET', params }),

  post: (url, data, config) =>
    request(url, { ...config, method: 'POST', body: data }),

  put: (url, data, config) =>
    request(url, { ...config, method: 'PUT', body: data }),

  delete: (url, config) =>
    request(url, { ...config, method: 'DELETE' }),

  patch: (url, data, config) =>
    request(url, { ...config, method: 'PATCH', body: data }),
};

// 默认导出
export default request;