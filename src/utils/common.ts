/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

/**
 * 格式化日期时间
 */
export const formatDate = (
  date: string | number | Date,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (date: string | number | Date): string => {
  const now = dayjs()
  const target = dayjs(date)
  const diffInMinutes = now.diff(target, 'minute')
  const diffInHours = now.diff(target, 'hour')
  const diffInDays = now.diff(target, 'day')

  if (diffInMinutes < 1) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInDays < 30) {
    return `${diffInDays}天前`
  } else {
    return formatDate(date, 'YYYY-MM-DD')
  }
}

/**
 * 生成随机ID
 */
export const generateId = (length = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= interval) {
      fn(...args)
      lastTime = now
    }
  }
}

/**
 * 深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 安全获取对象属性
 */
export const safeGet = <T>(obj: any, path: string, defaultValue?: T): T | undefined => {
  const keys = path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * 生成UUID
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 文件大小格式化
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证手机号格式
 */
export const isValidPhone = (phone: string): boolean => {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 转换查询参数为对象
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString
  const pairs = query.split('&')

  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  }

  return params
}

/**
 * 对象转换为查询字符串
 */
export const toQueryString = (params: Record<string, any>): string => {
  const keys = Object.keys(params)
  if (keys.length === 0) return ''

  const pairs = keys
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

  return pairs.length > 0 ? `?${pairs.join('&')}` : ''
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~  新增工具方法

/**
 * 判断对象的某个属性是否为数组，如果是数组则进一步判断是否为空
 * @param obj 目标对象
 * @param propertyName 属性名
 * @returns 返回一个对象，包含是否是数组以及是否为空的信息
 */
export function checkPropertyIsArrayAndEmpty(obj: any, propertyName: string): {
  isArray: boolean;
  isEmpty: boolean;
} {
  // 检查对象是否存在
  if (!obj || typeof obj !== 'object') {
    return { isArray: false, isEmpty: true };
  }

  const propertyValue = obj[propertyName];
  const isArray = Array.isArray(propertyValue);

  // 如果是数组，判断是否为空；如果不是数组，isEmpty 设为 true
  const isEmpty = isArray ? propertyValue.length === 0 : true;

  return { isArray, isEmpty };
}

/**
 * 判断对象的某个属性是否为数组且非空
 * @param obj 目标对象
 * @param propertyName 属性名
 * @returns 如果是数组且有元素返回 true，否则返回 false
 */
export function isPropertyNonEmptyArray(obj: any, propertyName: string): boolean {
  // 检查对象是否存在
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const propertyValue = obj[propertyName];
  return Array.isArray(propertyValue) && propertyValue.length > 0;
}

/**
 * 判断变量是否为数组
 * @param value 要判断的变量
 * @returns 如果是数组返回 true，否则返回 false
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 判断变量是否为数组（TypeScript 类型保护）
 * @param value 要判断的变量
 * @returns 如果是数组返回 true，否则返回 false
 */
export function isArrayTs<T = any>(value: any): value is T[] {
  return isArray(value);
}

/**
 * 判断变量是否为数组且不为空
 * @param value 要判断的变量
 * @returns 如果是数组且有元素返回 true，否则返回 false
 */
export function isNonEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0;
}
/**
 * 判断变量是否为数组且不为空（泛型版本）
 * @param value 要判断的变量
 * @returns 如果是数组且有元素返回 true，否则返回 false
 */
export function isNonEmptyArrayTs<T>(value: T | T[]): value is T[] {
  return isNonEmptyArray(value);
}

// 自定义类型守卫函数
export function isDefined<T>(value: T | undefined | null | ''): value is T {
  return value !== undefined && value !== null && value !== '';
}

// 检测屏幕宽度
export function checkScreenWidth() {
  const width: number = window.innerWidth
  const isMobile: boolean = width < 768

  return isMobile;
}