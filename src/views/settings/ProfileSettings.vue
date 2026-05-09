<template>
  <div class="profile-settings">
    <h3 class="section-title">个人资料</h3>

    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <!-- 头像 -->
      <el-form-item label="头像" prop="avatar">
        <div class="avatar-uploader">
          <el-avatar :size="100" :src="formData.avatar" v-if="formData.avatar" />
          <div class="avatar-actions">
            <ImageUpload v-model="formData.avatar" :max-size="2" />
            <el-button v-if="formData.avatar" size="small" type="danger" @click="formData.avatar = ''">
              移除
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 基本信息 -->
      <el-card class="profile-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" disabled />
          <div class="form-tip">用户名不可修改</div>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱">
            <template #append>
              <el-button :disabled="emailVerified" @click="handleVerifyEmail">
                {{ emailVerified ? '已验证' : '验证' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号">
            <template #append>
              <el-button :disabled="phoneVerified" @click="handleVerifyPhone">
                {{ phoneVerified ? '已验证' : '验证' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
            <el-radio value="other">保密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="formData.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input v-model="formData.bio" type="textarea" :rows="4" placeholder="介绍一下自己吧" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-card>

      <!-- 社交账号 -->
      <el-card class="profile-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>社交账号</span>
          </div>
        </template>

        <el-form-item label="GitHub" prop="github">
          <el-input v-model="formData.github" placeholder="GitHub 用户名">
            <template #prepend>https://github.com/</template>
          </el-input>
        </el-form-item>

        <el-form-item label="微博" prop="weibo">
          <el-input v-model="formData.weibo" placeholder="微博 ID">
            <template #prepend>https://weibo.com/</template>
          </el-input>
        </el-form-item>

        <el-form-item label="知乎" prop="zhihu">
          <el-input v-model="formData.zhihu" placeholder="知乎 ID">
            <template #prepend>https://zhihu.com/people/</template>
          </el-input>
        </el-form-item>

        <el-form-item label="个人网站" prop="website">
          <el-input v-model="formData.website" placeholder="https://" />
        </el-form-item>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存资料
        </el-button>
      </div>
    </el-form>

    <!-- 验证邮箱对话框 -->
    <el-dialog v-model="showEmailDialog" title="验证邮箱" width="400px">
      <el-form>
        <el-form-item label="验证码">
          <div class="verify-code-input">
            <el-input v-model="emailCode" placeholder="请输入验证码" />
            <el-button :disabled="countdown > 0" @click="sendEmailCode">
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEmail">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { useAuthStore } from '@/stores/auth'
import { printMsg } from '@/utils/prints'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 邮箱验证相关
const showEmailDialog = ref(false)
const emailCode = ref('')
const countdown = ref(0)
const emailVerified = ref(false)
const phoneVerified = ref(false)

const formData = reactive({
  avatar: authStore.userInfo?.avatar || '',
  username: authStore.userInfo?.username || '',
  nickname: authStore.userInfo?.nickname || '',
  email: authStore.userInfo?.email || '',
  phone: '',
  gender: 'other',
  birthday: '',
  bio: '',
  github: '',
  weibo: '',
  zhihu: '',
  website: ''
})

const rules: FormRules = {
  nickname: [
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  website: [
    { pattern: /^https?:\/\/.+/, message: '请输入正确的网址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟保存
    // await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户信息
    authStore.updateUserInfo({
      nickname: formData.nickname,
      avatar: formData.avatar,
      email: formData.email,
    })

    // 更新用户额外信息
    // ...

    ElMessage.success('资料更新成功')
  } catch (error) {
    printMsg('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleVerifyEmail = () => {
  showEmailDialog.value = true
  sendEmailCode()
}

const handleVerifyPhone = () => {
  ElMessage.info('手机验证功能开发中')
}

const sendEmailCode = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  ElMessage.success('验证码已发送到您的邮箱')
}

const confirmEmail = () => {
  if (!emailCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }

  // 验证验证码
  if (emailCode.value === '123456') {
    emailVerified.value = true
    showEmailDialog.value = false
    ElMessage.success('邮箱验证成功')
  } else {
    ElMessage.error('验证码错误')
  }
}
</script>

<style lang="scss" scoped>
.profile-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .profile-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      font-weight: 500;
    }
  }

  .avatar-uploader {
    display: flex;
    align-items: center;
    gap: 20px;

    .avatar-actions {
      display: flex;
      gap: 10px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .form-actions {
    margin-top: 30px;
  }

  .verify-code-input {
    display: flex;
    gap: 10px;
  }
}
</style>