/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
  total?: number
  page?: number
  limit?: number
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const res = response.data

    // 如果自定义 code 不是 200，则判断为错误
    if (res.code !== 200) {
      // 401: 未登录
      if (res.code === 401) {
        handleUnauthorized(res.message)
        return Promise.reject(new Error(res.message || '未授权'))
      }

      // 403: 权限不足
      if (res.code === 403) {
        ElMessage.warning('权限不足，无法访问')
        return Promise.reject(new Error(res.message || '权限不足'))
      }

      // 其他错误
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }

    // 如果返回的是分页数据
    if (res.total !== undefined) {
      return {
        data: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit
      }
    }

    return res.data
  },
  (error) => {
    // 处理 HTTP 状态码错误
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.error.message || error.message

      switch (status) {
        case 400:
          ElMessage.error(message || '请求参数错误')
          break
        case 401:
          handleUnauthorized(message)
          break
        case 403:
          ElMessage.error('权限不足，无法访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(message || '请求失败')
      }
    } else if (error.request) {
      // 请求未收到响应
      if (error.message.includes('timeout')) {
        ElMessage.error('请求超时，请检查网络连接')
      } else {
        ElMessage.error('网络连接异常，请检查网络')
      }
    } else {
      // 请求配置错误
      ElMessage.error(error.message || '请求配置错误')
    }

    return Promise.reject(error)
  }
)

// 处理未授权
function handleUnauthorized(message?: string) {
  const authStore = useAuthStore()

  let msg = '登录状态已过期，请重新登录'
  if (message) {
    msg = message;
  }

  ElMessageBox.confirm(msg, '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}

// 封装常用的请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },

  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    // 获取认证 token
    const token = localStorage.getItem('access_token')

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  }
}

export default service