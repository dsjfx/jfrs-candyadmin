<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <!-- 左侧品牌区域 -->
      <div class="auth-left">
        <h1 class="brand-title">{{ appName }}</h1>
        <div class="brand-content">
          <p class="brand-description">专业的内容创作与管理平台，让创作更高效</p>
          <div class="brand-features">
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

      <!-- 右侧表单区域 -->
      <div class="auth-right">
        <div class="auth-form-container">
          <!-- 移动端品牌标识（小屏幕显示） -->
          <div class="mobile-brand">
            <h2 class="mobile-brand-title">{{ appName }}</h2>
            <p class="mobile-brand-subtitle">专业的内容创作与管理平台</p>
          </div>
          <!-- 切换登录/注册 -->
          <div class="auth-tabs">
            <button class="auth-tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
              登录
            </button>
            <button class="auth-tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
              注册
            </button>
          </div>

          <!-- 登录表单 -->
          <el-form v-if="activeTab === 'login'" ref="loginFormRef" :model="loginForm" :rules="loginRules"
            class="auth-form" @keyup.enter="handleLogin">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请输入您的账号信息登录</p>

            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock"
                show-password />
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item prop="captcha" v-if="showCaptcha">
              <div class="captcha-wrapper">
                <el-input v-model="loginForm.captcha" placeholder="验证码" size="large" :prefix-icon="Picture" />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img :src="captchaImage" alt="验证码" v-if="captchaImage" />
                  <el-icon v-else>
                    <Loading />
                  </el-icon>
                </div>
              </div>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-link type="primary" underline="never" @click="handleForgotPassword">
                忘记密码？
              </el-link>
            </div>

            <el-button type="primary" size="large" class="submit-button" :loading="loginLoading" @click="handleLogin">
              {{ loginLoading ? '登录中...' : '登录' }}
            </el-button>

            <!-- 第三方登录/注册 -->
            <div class="social-auth" v-if="showOtherLogin">
              <div class="divider">
                <span class="divider-text">其他登录方式</span>
              </div>
              <div class="social-icons">
                <el-tooltip content="微信">
                  <div class="social-icon wechat" @click="handleSocialAuth('wechat')">
                    <el-icon>
                      <ChatDotRound />
                    </el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="QQ">
                  <div class="social-icon qq" @click="handleSocialAuth('qq')">
                    <el-icon>
                      <Message />
                    </el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="GitHub">
                  <div class="social-icon github" @click="handleSocialAuth('github')">
                    <el-icon>
                      <Promotion />
                    </el-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>
          </el-form>

          <!-- 注册表单 -->
          <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" class="auth-form"
            @keyup.enter="handleRegister">
            <h2 class="form-title">创建账号</h2>
            <p class="form-subtitle">填写以下信息完成注册</p>

            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
            </el-form-item>

            <el-form-item prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱" size="large" :prefix-icon="Message" />
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码" size="large"
                :prefix-icon="Lock" show-password />
              <div class="password-strength" v-if="registerForm.password">
                <span>密码强度：</span>
                <el-progress :percentage="passwordStrength" :color="strengthColor" :stroke-width="6"
                  style="width: 150px" />
              </div>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" size="large"
                :prefix-icon="Lock" show-password />
            </el-form-item>

            <el-form-item prop="agreeTerms">
              <el-checkbox v-model="registerForm.agreeTerms" @click="cboxHandler">
                <span class="agree-terms">我已阅读并同意</span>
                <el-link type="primary" underline="always"><span class="agree-terms">《用户协议》</span></el-link>
                <span class="agree-terms">和</span>
                <el-link type="primary" underline="always"><span class="agree-terms">《隐私政策》</span></el-link>
              </el-checkbox>
            </el-form-item>

            <el-button type="primary" size="large" :disabled="enableRegister" class="submit-button"
              :loading="registerLoading" @click="handleRegister">
              注册
            </el-button>

            <!-- 已有账号提示 -->
            <div class="auth-switch">
              已有账号？
              <el-link type="primary" underline="hover" @click="activeTab = 'login'">
                立即登录
              </el-link>
            </div>
          </el-form>

        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-info">
        <span class="footer-copyright">© {{ currentYear }} {{ appName }}</span>
        <span class="footer-version">版本: {{ appVersion }}. </span>
        <!-- <span class="support">技术支持: {{ appSupport }}</span> -->
      </div>
      <div class="footer-beian">
        <a v-if="icpLicense" href="https://beian.miit.gov.cn/" target="_blank">{{ icpLicense }}</a>
        <a v-if="publicSecurityLicense" href="http://www.beian.gov.cn/" target="_blank">{{ publicSecurityLicense
        }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UserLogin'
});

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
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
import { CaptchaResponse } from '@/types/user';
import { printMsg } from '@/utils/prints';
import { useAppName } from '@/composables/useAppName'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前激活的标签页
const activeTab = ref<'login' | 'register'>('login')

// 登录表单
const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const showCaptcha = ref(true)
const captchaImage = ref('')
const enableRegister = ref(true)

// 标题
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
// const appSupport = import.meta.env.VITE_APP_TECH_SUPPORT
const currentYear = new Date().getFullYear()

// 备案信息（参考 AdminLayout.vue）
const icpLicense = ref<string | null>(null)
const publicSecurityLicense = ref<string | null>(null)

const { appName } = useAppName('管理系统')

// 是否显示其他登录方式（根据环境配置）
const showOtherLogin = import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true'


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

// 注册表单
const registerFormRef = ref<FormInstance>()
const registerLoading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = registerForm.password
  if (!pwd) return 0

  let strength = 0
  if (pwd.length >= 8) strength += 20
  if (pwd.match(/[a-z]/)) strength += 20
  if (pwd.match(/[A-Z]/)) strength += 20
  if (pwd.match(/[0-9]/)) strength += 20
  if (pwd.match(/[^a-zA-Z0-9]/)) strength += 20

  return strength
})

const strengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 40) return '#f56c6c'
  if (strength < 70) return '#e6a23c'
  return '#67c23a'
})

// 注册表单验证规则
const validatePass2 = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value && passwordStrength.value < 40) {
          callback(new Error('密码强度太低'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  agreeTerms: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const cboxHandler = () => {
  const checked = registerForm.agreeTerms;
  if (checked) {
    enableRegister.value = true
  } else {
    enableRegister.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loginLoading.value = true

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
        message: `欢迎回来，${authStore.userInfo?.nickname || authStore.userInfo?.username}！`,
        duration: 2000
      })

      // 跳转到目标页面或首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    }
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw Object.assign(new Error('异常错误，请检查！'), { cause: error });
    }

    printMsg('登录失败:', error)

    // 刷新验证码
    refreshCaptcha()

    // 显示错误消息
    if (error.name.includes('BlogError')) {
      ElMessage.error(error.message || '登录失败')
    } else {
      // ElMessage.error('登录失败')
    }
  } finally {
    loginLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    registerLoading.value = true

    // 调用注册接口
    const data = await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      role: 'admin',
    })

    if (data && data.userId) {
      ElMessage.success('注册成功，请登录')

      // 清空表单
      resetRegister()

      // 切换到登录页
      resetLogin()
      activeTab.value = 'login'

      // 自动填充用户名
      loginForm.username = registerForm.username
    } else {
      ElMessage.error(data.message || '注册失败')
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      printMsg('注册失败:', error)
      ElMessage.error(error.message || '注册失败，请稍后重试')
    }
  } finally {
    registerLoading.value = false
  }
}

function resetRegister() {
  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.agreeTerms = false
}

function resetLogin() {
  loginForm.username = ''
  loginForm.password = ''
  loginForm.captcha = ''
  loginForm.remember = false
}

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
    const oldCaptcha: CaptchaResponse = JSON.parse(oldCaptchaStr)
    if (oldCaptcha && oldCaptcha.id) {
      captchaId = oldCaptcha.id
    }
  }
  return captchaId
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessageBox.prompt('请输入您的注册邮箱', '找回密码', {
    confirmButtonText: '发送重置邮件',
    cancelButtonText: '取消',
    inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    inputErrorMessage: '邮箱格式不正确'
  }).then(() => {
    ElMessage.success(`重置密码链接已发送至`)
  }).catch(() => {
    ElMessage.info('取消找回密码')
  })
}

// 第三方认证
const handleSocialAuth = (provider: string) => {
  ElMessage.info(`${provider} 登录功能开发中`)
}

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

  // 尝试加载简单用户信息以获取备案信息（icp / 公安备案）
  ; (async () => {
    try {
      const simpleUser = await authStore.getUserAvatar(10)
      if (simpleUser) {
        icpLicense.value = simpleUser.icpLicense ?? null
        publicSecurityLicense.value = simpleUser.publicSecurityLicense ?? null
      }
    } catch (err) {
      // log and ignore
      console.debug('load simple user failed', err)
    }
  })()
})
</script>

<style lang="scss" scoped>
// 响应式变量
$breakpoint-mobile: 768px;
$breakpoint-tablet: 992px;

.auth-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;

  // 小屏幕减小内边距
  @media (max-width: $breakpoint-mobile) {
    padding: 10px;
  }
}

.auth-wrapper {
  width: 100%;
  min-height: 500px;
  display: flex;
  // background: #fff;
  // border-radius: 20px;
  // box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  // 平板屏幕适配
  @media (max-width: $breakpoint-tablet) {
    max-width: 90%;
  }

  // 手机屏幕适配
  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    border-radius: 12px;
    min-height: auto;
  }
}

.auth-left {
  flex: 1;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;

  // 平板屏幕适配
  @media (max-width: $breakpoint-tablet) {
    padding: 40px 30px;
  }

  // 手机屏幕隐藏左侧品牌区域
  @media (max-width: $breakpoint-mobile) {
    display: none;
  }

  .brand-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    @media (max-width: $breakpoint-tablet) {
      font-size: 28px;
    }
  }

  .brand-description {
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.9;
    margin-bottom: 40px;

    @media (max-width: $breakpoint-tablet) {
      font-size: 14px;
      margin-bottom: 30px;
    }
  }

  .feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;

    .el-icon {
      margin-right: 12px;
      font-size: 20px;
      background: rgba(255, 255, 255, 0.2);
      padding: 5px;
      border-radius: 8px;
    }
  }
}

.auth-right {
  // flex: 1;
  width: 400px;
  display: flex;
  align-items: start;
  justify-content: center;
  margin-right: 8%;
  // padding: 40px;
  background: #fff;
  border-radius: 20px;

  // 手机屏幕适配
  @media (max-width: $breakpoint-mobile) {
    width: auto;
    margin: auto 10px;
    padding: 30px 20px;
  }
}

.auth-form-container {
  width: 100%;
  max-width: 360px;

  // 手机屏幕适配
  @media (max-width: $breakpoint-mobile) {
    max-width: 100%;
  }
}

// 移动端品牌标识（小屏幕显示）
.mobile-brand {
  display: none;
  text-align: center;
  margin-bottom: 30px;

  @media (max-width: $breakpoint-mobile) {
    display: block;
  }

  .mobile-brand-title {
    font-size: 24px;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 8px;
  }

  .mobile-brand-subtitle {
    font-size: 12px;
    color: #909399;
  }
}

.auth-tabs {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;

  .auth-tab {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 500;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: #409eff;
      transition: width 0.3s;
    }

    &:hover {
      color: #606266;
    }

    &.active {
      color: #409eff;

      &::after {
        width: 50px;
      }
    }

    // 手机屏幕适配
    @media (max-width: $breakpoint-mobile) {
      font-size: 14px;
      padding: 10px 0;
    }
  }
}

.auth-form {
  .form-title {
    font-size: 24px;
    font-weight: 600;
    // color: #333;#667eea
    color: rgba(102, 126, 234, 1.0);
    margin-bottom: 8px;
    text-align: center;

    @media (max-width: $breakpoint-mobile) {
      font-size: 20px;
    }
  }

  .form-subtitle {
    font-size: 14px;
    // color: #909399;
    color: rgba(102, 126, 234, 0.8);
    margin-bottom: 10px;
    text-align: center;

    @media (max-width: $breakpoint-mobile) {
      font-size: 12px;
      margin-bottom: 20px;
    }
  }

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
    }
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    @media (max-width: $breakpoint-mobile) {
      flex-wrap: wrap;
    }
  }

  .agree-terms {
    @media (max-width: $breakpoint-mobile) {
      font-size: 12px;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;

    @media (max-width: $breakpoint-mobile) {
      margin: 15px 0;
    }
  }

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;

    @media (max-width: $breakpoint-mobile) {
      height: 40px;
      font-size: 14px;
    }
  }

  .auth-switch {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #606266;

    @media (max-width: $breakpoint-mobile) {
      margin-top: 15px;
      font-size: 12px;
    }
  }
}

.social-auth {
  margin-top: 20px;

  @media (max-width: $breakpoint-mobile) {
    margin-top: 16px;
  }

  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

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

  .social-icons {
    display: flex;
    justify-content: center;
    gap: 20px;

    .social-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #e4e7ed;

      .el-icon {
        font-size: 20px;
        color: #909399;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &.wechat {
          background: #07c160;
          border-color: #07c160;

          .el-icon {
            color: #fff;
          }
        }

        &.qq {
          background: #12b7f5;
          border-color: #12b7f5;

          .el-icon {
            color: #fff;
          }
        }

        &.github {
          background: #333;
          border-color: #333;

          .el-icon {
            color: #fff;
          }
        }
      }

      @media (max-width: $breakpoint-mobile) {
        width: 40px;
        height: 40px;

        .el-icon {
          font-size: 18px;
        }
      }
    }
  }
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;

  @media (max-width: $breakpoint-mobile) {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 10px;
  }

  .footer-info {
    display: flex;
    justify-content: center;
    gap: 10px;

    .footer-copyright {
      color: #BCD2EE;
      margin-bottom: 8px;
    }

    .footer-version {
      color: #BCD2EE;
    }
  }

  .footer-beian {
    a {
      color: #c0c4cc;
      text-decoration: none;

      &:hover {
        color: variables.$color-primary;
      }
    }
  }
}
</style>