import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  UserInfo,
  LoginParams,
  CaptchaParam,
  RegisterParams,
  LoginResponse,
  CaptchaResponse
} from '@/types/user'
import { generateId } from '@/utils/common'
import { printError, printMsg } from '@/utils/prints';
import BlogError from '@/utils/BlogError'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])

  // 初始化时从本地存储恢复状态
  const initAuth = () => {
    const storedToken = localStorage.getItem('access_token')
    const storedUserInfo = localStorage.getItem('user_info')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (error) {
        if (error instanceof Error) {
          printError(error)
        }
        localStorage.removeItem('user_info')
      }
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    try {
      // 初始化 nickname
      const name = generateId(8) + '_' + params.username
      params.nickname = name
      // 保存注册信息
      const data = await authApi.register(params)

      return data
    } catch (error) {
      if (error instanceof Error) {
        printError(error)
      }
    }
  }

  // 登录
  const login = async (params: LoginParams): Promise<LoginResponse> => {
    // 验证码校验
    const captchaParam = {
      captchaId: params.captchaId,
      captchInput: params.captcha
    }
    const result = await authApi.validateCaptcha(captchaParam);
    if (!result || !result.isValid) {
      throw new BlogError("无效的验证码");
    }

    // 调用登录API
    const data = await authApi.login(params)
    if (!data || !data.accessToken || !data.userInfo) {
      throw new BlogError("登陆失败，请重新登陆。");
    }

    const loginData = data as LoginResponse
    loginData.userInfo.permissions = ['*']

    // 保存token和用户信息
    token.value = loginData.accessToken
    userInfo.value = loginData.userInfo
    permissions.value = loginData.userInfo.permissions

    // 保存到本地存储
    localStorage.setItem('access_token', loginData.accessToken)
    localStorage.setItem('user_info', JSON.stringify(loginData.userInfo))

    return loginData
  }

  // 刷新验证码
  const refreshCaptcha = async (oid: string): Promise<CaptchaResponse> => {
    try {
      const param: CaptchaParam = {}
      if (oid) {
        param['captchaId'] = oid
      }

      const data = await authApi.refreshCaptcha(param)
      if (data.id) {
        localStorage.setItem('captcha', JSON.stringify({
          id: data.id,
          expiresIn: data.expiresIn,
        }))
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        printError(error)
      }
      throw error
    }
  }

  // 登出
  const logout = async () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []

    try {
      // 尝试调用退出接口
      await authApi.logout()
    } catch (error) {
      // 如果接口调用失败（如token过期），忽略错误
      if (error instanceof Error) {
        printMsg('退出接口调用失败，直接清理本地存储', error)
      }
    } finally {
      // 无论接口成功与否，都清理本地存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')

      // 跳转到登录页
      window.location.href = '/login'
    }
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!permissions.value.length) return false
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string): boolean => {
    return userInfo.value?.role === role
  }

  // 更新用户信息
  const updateUserInfo = async (info: Partial<UserInfo>) => {
    // 调用更新用户信息接口
    const data = await authApi.getProfile(info)
    printMsg(JSON.stringify(info))

    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      localStorage.setItem('user_info', JSON.stringify(userInfo.value))
    }

    return data;
  }

  // 获取用户信息
  const getUserInfo = async (): Promise<UserInfo> => {
    if (!token.value) {
      throw new BlogError("未登录")
    }

    if (userInfo.value) {
      return userInfo.value
    }

    const data = await authApi.getProfile({})
    if (!data || !data.nickname) {
      throw new BlogError("获取用户信息失败，请重新登录")
    }

    userInfo.value = data as UserInfo
    localStorage.setItem('user_info', JSON.stringify(userInfo.value))

    return userInfo.value
  }

  // 初始化
  initAuth()

  return {
    token,
    userInfo,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole,
    updateUserInfo,
    refreshCaptcha,
    register,
    getUserInfo
  }
})