<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧背景和介绍 -->
      <div class="login-left">
        <div class="login-banner">
          <div class="banner-content">
            <h1 class="banner-title">{{ appName }}</h1>
            <p class="banner-description">
              专业的内容创作与管理平台，让创作更高效
            </p>
            <div class="banner-features">
              <div class="feature-item">
                <el-icon>
                  <Document />
                </el-icon>
                <span>强大的富文本编辑器</span>
              </div>
              <div class="feature-item">
                <el-icon>
                  <Folder />
                </el-icon>
                <span>灵活的标签分类管理</span>
              </div>
              <div class="feature-item">
                <el-icon>
                  <DataAnalysis />
                </el-icon>
                <span>数据统计与分析</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-form-wrapper">
          <div class="login-header">
            <h2 class="login-title">欢迎登录</h2>
            <p class="login-subtitle">请输入您的账号信息</p>
          </div>

          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form"
            @keyup.enter="handleLogin">
            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User"
                :disabled="loading" />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large"
                :prefix-icon="Lock" show-password :disabled="loading" />
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item prop="captcha" v-if="showCaptcha">
              <div class="captcha-wrapper">
                <el-input v-model="loginForm.captcha" placeholder="请输入验证码" size="large" :prefix-icon="Picture"
                  :disabled="loading" maxlength="4" />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img :src="captchaImage" alt="验证码" v-if="captchaImage" />
                  <div class="captcha-loading" v-else>
                    <el-icon>
                      <Loading />
                    </el-icon>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 记住我 -->
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">
                  记住我
                </el-checkbox>
                <el-link type="primary" underline="never">
                  忘记密码？
                </el-link>
              </div>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>

            <!-- 其他登录方式 -->
            <div class="other-login" v-if="showOtherLogin">
              <div class="divider">
                <span class="divider-text">其他登录方式</span>
              </div>
              <div class="login-methods">
                <el-tooltip content="微信登录">
                  <div class="login-method wechat" @click="handleWechatLogin">
                    <el-icon>
                      <ChatDotRound />
                    </el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="QQ登录">
                  <div class="login-method qq" @click="handleQQLogin">
                    <el-icon>
                      <Message />
                    </el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="GitHub登录">
                  <div class="login-method github" @click="handleGithubLogin">
                    <el-icon>
                      <Promotion />
                    </el-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>
          </el-form>

          <!-- 底部信息 -->
          <div class="login-footer">
            <p class="footer-text">
              © {{ currentYear }} {{ appName }}
            </p>
            <p class="version">版本: {{ appVersion }}. 技术支持: {{ appSupport }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 粒子背景 -->
    <div class="particles-bg" ref="particlesRef"></div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UserLogin'
});

import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  User,
  Lock,
  Picture,
  Loading,
  Document,
  Folder,
  DataAnalysis,
  ChatDotRound,
  Message,
  Promotion
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { CaptchaParam, CaptchaResponse } from '@/types/user';

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const showCaptcha = ref(true)
const captchaImage = ref('')

const appName = import.meta.env.VITE_APP_TITLE || '博客管理系统'
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
const appSupport = import.meta.env.VITE_APP_TECH_SUPPORT
const currentYear = new Date().getFullYear()

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: showCaptcha.value
    ? [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
    ]
    : []
}

// 是否显示其他登录方式（根据环境配置）
const showOtherLogin = import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true'

// 加载保存的用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('saved_username')
  if (savedUsername) {
    loginForm.username = savedUsername
    loginForm.remember = true
  }

  // 如果有重定向参数，显示提示
  if (route.query.redirect) {
    ElNotification.warning({
      title: '提示',
      message: '请先登录以继续访问',
      duration: 3000
    })
  }

  // 初始化验证码（如果开启）
  if (showCaptcha.value) {
    refreshCaptcha()
  }
})

// 刷新验证码
const refreshCaptcha = async () => {
  // 获取旧的id
  let captchaId = getCaptchaId();

  // 调用获取验证码的API
  const captcha: CaptchaResponse = await authStore.refreshCaptcha(captchaId)

  if (captcha && captcha.svg) {
    captchaImage.value = `data:image/svg+xml;base64,${btoa(captcha.svg)}`

    // // 使用模拟的验证码
    // captchaImage.value = `data:image/svg+xml;base64,${btoa(`
    //   <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
    //     <rect width="120" height="40" fill="#f5f5f5"/>
    //     <text x="60" y="25" text-anchor="middle" font-family="Arial" font-size="18" fill="#666">
    //       ${Math.random().toString(36).substring(2, 6).toUpperCase()}
    //     </text>
    //     <line x1="0" y1="20" x2="120" y2="20" stroke="#ddd" stroke-width="1"/>
    //     <line x1="30" y1="0" x2="30" y2="40" stroke="#ddd" stroke-width="1"/>
    //     <line x1="90" y1="0" x2="90" y2="40" stroke="#ddd" stroke-width="1"/>
    //   </svg>
    // `)}`
  } else {
    ElMessage.error('验证码刷新失败。')
  }
}

// 获取旧的id
const getCaptchaId = () => {
  let captchaId = '';
  const oldCaptchaStr = localStorage.getItem('captcha')
  if (oldCaptchaStr) {
    const oldCaptcha: CaptchaParam = JSON.parse(oldCaptchaStr)
    if (oldCaptcha && oldCaptcha.captchaId) {
      captchaId = oldCaptcha.captchaId
    }
  }
  return captchaId
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 保存用户名（如果勾选了记住我）
    if (loginForm.remember) {
      localStorage.setItem('saved_username', loginForm.username)
    } else {
      localStorage.removeItem('saved_username')
    }

    // 调用登录接口
    const data = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      captcha: loginForm.captcha,
      captchaId: getCaptchaId(),
      appType: 'admin',
    })

    // 清空验证码输入框
    loginForm.captcha = ''
    // 刷新验证码
    refreshCaptcha()

    // 显示欢迎消息
    if (data && data.accessToken && data.userInfo) {
      ElNotification.success({
        title: '登录成功',
        message: `欢迎回来，${authStore.userInfo?.username || '管理员'}！`,
        duration: 2000
      })

      // 跳转到目标页面或首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    }
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw Object.assign(new Error('错误结构不正确'), { cause: error });
    }

    console.error('登录失败:', error)

    // 如果是验证码错误，刷新验证码
    if (error.message?.includes('验证码')) {
      showCaptcha.value = true
      refreshCaptcha()

      // 添加验证码验证规则
      loginRules.captcha = [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
      ]
    }

    // 显示错误消息
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 其他登录方式
const handleWechatLogin = () => {
  ElMessage.info('微信登录功能正在开发中')
}

const handleQQLogin = () => {
  ElMessage.info('QQ登录功能正在开发中')
}

const handleGithubLogin = () => {
  ElMessage.info('GitHub登录功能正在开发中')
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  .particles-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}

.login-wrapper {
  width: 1000px;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  .login-banner {
    max-width: 400px;

    .banner-title {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 20px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .banner-description {
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .banner-features {
      .feature-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        font-size: 14px;

        .el-icon {
          margin-right: 12px;
          font-size: 20px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px;
          border-radius: 8px;
        }

        span {
          opacity: 0.9;
        }
      }
    }
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .login-form-wrapper {
    width: 100%;
    max-width: 400px;

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .login-title {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .login-subtitle {
        font-size: 14px;
        color: #666;
      }
    }

    .login-form {
      .captcha-wrapper {
        display: flex;
        gap: 10px;

        .captcha-image {
          width: 120px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #dcdfe6;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .captcha-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;

            .el-icon {
              animation: rotate 2s linear infinite;
            }
          }
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .login-button {
        width: 100%;
        font-weight: 500;
        font-size: 16px;
        height: 48px;
      }
    }

    .other-login {
      margin-top: 30px;

      .divider {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e4e7ed;
        }

        .divider-text {
          padding: 0 15px;
          color: #909399;
          font-size: 12px;
        }
      }

      .login-methods {
        display: flex;
        justify-content: center;
        gap: 20px;

        .login-method {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e4e7ed;

          .el-icon {
            font-size: 18px;
            color: #666;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            &.wechat {
              background: #07c160;
              border-color: #07c160;

              .el-icon {
                color: white;
              }
            }

            &.qq {
              background: #12b7f5;
              border-color: #12b7f5;

              .el-icon {
                color: white;
              }
            }

            &.github {
              background: #333;
              border-color: #333;

              .el-icon {
                color: white;
              }
            }
          }
        }
      }
    }

    .login-footer {
      margin-top: 40px;
      text-align: center;

      .footer-text {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .version {
        font-size: 12px;
        color: #c0c4cc;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 992px) {
  .login-wrapper {
    width: 90%;
    height: auto;
    min-height: 500px;
  }

  .login-left {
    display: none;
  }

  .login-right {
    padding: 30px 20px;
  }
}

@media (max-width: 576px) {
  .login-container {
    padding: 20px;

    .login-wrapper {
      width: 100%;
      height: auto;
      min-height: 100vh;
      border-radius: 10px;
    }

    .login-right {
      padding: 20px;
    }

    .login-header {
      margin-bottom: 30px;

      .login-title {
        font-size: 24px;
      }
    }

    .captcha-wrapper {
      flex-direction: column;

      .captcha-image {
        width: 100%;
        height: 44px;
      }
    }
  }
}
</style>