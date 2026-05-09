/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from '@/utils/request'
import type { ResponseData } from '@/utils/request'

// 导出统一的 API 调用方法
export const api = {
  // 通用请求方法
  get<T = any>(url: string, params?: any): Promise<T> {
    return http.get(url, { params })
  },

  post<T = any>(url: string, data?: any): Promise<T> {
    return http.post(url, data)
  },

  put<T = any>(url: string, data?: any): Promise<T> {
    return http.put(url, data)
  },

  patch<T = any>(url: string, data?: any): Promise<T> {
    return http.patch(url, data)
  },

  delete<T = any>(url: string, params?: any): Promise<T> {
    return http.delete(url, { params })
  },

  // 文件上传
  upload<T = any>(file: File, url: string, onProgress?: (progress: number) => void): Promise<T> {
    const base = import.meta.env.VITE_UPLOAD_URL || '/upload'
    return http.upload(`${base}${url}`, file, onProgress)
  }
}

// 导出类型
export type { ResponseData }

export default api