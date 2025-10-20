// 基础配置
const BASE_URL = window.global_config.api.baseUrl;
const TIMEOUT = 10000; // 10秒超时

// 请求方法类型
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置接口
interface RequestConfig {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  withCredentials?: boolean;
  params?: any;
}

// 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 错误类型
class RequestError extends Error {
  public status: number;
  public code: number;
  public data: any;

  constructor(message: string, status: number, code: number, data?: any) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// 请求拦截器
const requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];

// 响应拦截器
const responseInterceptors: Array<(response: Response) => Response> = [];

// 添加请求拦截器
export const addRequestInterceptor = (interceptor: (config: RequestConfig) => RequestConfig) => {
  requestInterceptors.push(interceptor);
};

// 添加响应拦截器
export const addResponseInterceptor = (interceptor: (response: Response) => Response) => {
  responseInterceptors.push(interceptor);
};

// 默认请求拦截器 - 添加token
addRequestInterceptor((config) => {

  const token = sessionStorage.getItem('casToken');
  config.headers = {
    ...config.headers,
    'Authorization': `Bearer ${token}`,
    // 'clientid': window.global_config.system.clientId,
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
    sessionStorage.setItem('casToken', '');
    window.location.href = window.global_config.system.logoutUrl;
    // token过期，清除本地token并跳转到登录页
    // localStorage.removeItem('casToken');
    // window.location.href = '/login';
  }
  return response;
});

// 超时控制
const timeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new RequestError('请求超时', 408, 408));
    }, timeout);
  });
};

// 核心请求函数
async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
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
  let finalConfig: RequestConfig = { method, headers, body, timeout, withCredentials };
  requestInterceptors.forEach(interceptor => {
    finalConfig = interceptor(finalConfig);
  });

  // 如果有文件上传，确保不覆盖手动设置的Content-Type
  // 浏览器会自动处理FormData的boundary

  // 构建fetch配置
  const fetchConfig: RequestInit = {
    method: finalConfig.method,
    headers: finalConfig.headers,
    credentials: finalConfig.withCredentials ? 'include' : 'omit',
  };

  // 处理请求体
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // FormData 直接赋值，不需要序列化
      fetchConfig.body = body;
    } else if (typeof body === 'object') {
      // 普通对象使用 JSON 序列化
      fetchConfig.body = JSON.stringify(body);
    } else {
      // 其他类型直接赋值
      fetchConfig.body = body;
    }
  } else if (params) {
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        fullUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${key}=${params[key]}`;
      }
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
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await finalResponse.json();
    } else {
      data = await finalResponse.text();
    }

    // 检查业务状态码
    if (data.code !== undefined && data.code !== 200) {
      throw new RequestError(
        data.message || '请求失败',
        finalResponse.status,
        data.code,
        data
      );
    }

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
  get: <T = any>(url: string, params?: any, config?: Omit<RequestConfig, 'method'>) =>
    request<T>(url, { ...config, method: 'GET', params }),

  post: <T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(url, { ...config, method: 'POST', body: data }),

  put: <T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(url, { ...config, method: 'PUT', body: data }),

  delete: <T = any>(url: string, config?: Omit<RequestConfig, 'method'>) =>
    request<T>(url, { ...config, method: 'DELETE' }),

  patch: <T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(url, { ...config, method: 'PATCH', body: data }),
};

// 导出类型
export type { RequestConfig, ApiResponse, RequestError };

// 默认导出
export default request; 