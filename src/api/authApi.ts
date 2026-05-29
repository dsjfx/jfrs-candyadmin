import request from './index';
import { CaptchaParam, LoginParams, RegisterParams, UserInfo } from "@/types/user";

export const authApi = {
  // 注册
  register(params: RegisterParams) {
    return request.post('/auth/register', params)
  },

  // 登陆
  login(params: LoginParams) {
    return request.post('/auth/login', params)
  },

  // 注销
  logout() {
    return request.post('/auth/logout')
  },

  // 获取用户信息
  getProfile(info: Partial<UserInfo>) {
    return request.get('/auth/profile', info)
  },

  // 更新用户信息
  updateProfile(info: Partial<UserInfo>) {
    return request.post('/auth/profile', info)
  },

  getUserAvatar(params: Partial<UserInfo>) {
    return request.get('/auth/avatar', params);
  },

  validateCaptcha(captchaParam: CaptchaParam) {
    return request.post('/captcha/validate', captchaParam)
  },

  refreshCaptcha(param: CaptchaParam) {
    return request.post('/captcha/refresh', param)
  },
}