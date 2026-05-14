/**
 * 用户
 */
export interface UserInfo {
  id: number | string
  username: string
  nickname: string
  avatar?: string
  email?: string
  role: string
  phone?: string
  gender?: string
  birthday?: string
  bio?: string
  location?: string
  hobbies?: string
  hobbiesList?: string[]
  motto?: string
  position?: string
  github?: string
  weibo?: string
  zhihu?: string
  website?: string
  permissions?: string[]
}

/**
 * 登陆参数
 */
export interface LoginParams {
  username: string
  password: string
  captcha: string
  captchaId: string
  appType: string
}

/**
 * 验证码参数
 */
export interface CaptchaParam {
  captchaId?: string
  captchInput?: string
}

/**
 * 验证码返回
 */
export interface CaptchaResponse {
  id: string
  svg?: string
  expiresIn?: number
}

/**
 * 注册参数
 */
export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  nickname?: string
  email: string
  role?: 'admin' | 'editor' | 'viewer'
  avatar?: string
}

// 登陆响应定义
export interface LoginResponse {
  accessToken: string; // JWT access token
  refreshToken: string; // Refresh token
  expiresIn: number; // Access token 过期时间（秒）
  tokenType: 'Bearer'; // Token 类型
  userInfo: UserInfo;
}
