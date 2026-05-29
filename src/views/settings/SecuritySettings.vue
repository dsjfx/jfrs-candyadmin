<template>
  <div class="security-settings">
    <h3 class="section-title">安全设置</h3>

    <!-- 修改密码 -->
    <el-card class="security-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>

      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="请输入当前密码"
            style="width: 300px" />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码"
            style="width: 300px" />
          <div class="password-strength" v-if="passwordForm.newPassword">
            <span>密码强度：</span>
            <el-progress :percentage="passwordStrength" :color="strengthColor" :stroke-width="8" style="width: 200px" />
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码"
            style="width: 300px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 两步验证 -->
    <el-card class="security-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>两步验证</span>
        </div>
      </template>

      <div class="two-factor-info">
        <el-alert v-if="!twoFactorEnabled" type="warning" :closable="false" show-icon>
          <span>两步验证未启用。启用后，登录时需要输入手机或邮箱验证码，提高账户安全性。</span>
        </el-alert>

        <div class="two-factor-status">
          <span class="status-label">状态：</span>
          <el-tag :type="twoFactorEnabled ? 'success' : 'info'">
            {{ twoFactorEnabled ? '已启用' : '未启用' }}
          </el-tag>
        </div>

        <div class="two-factor-actions">
          <el-button :type="twoFactorEnabled ? 'danger' : 'primary'" @click="handleToggleTwoFactor">
            {{ twoFactorEnabled ? '关闭两步验证' : '开启两步验证' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 登录历史 -->
    <el-card class="security-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>登录历史</span>
          <el-button link @click="loadLoginHistory">刷新</el-button>
        </div>
      </template>

      <el-table :data="loginHistory" v-loading="loadingHistory">
        <el-table-column prop="time" label="登录时间" width="180" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="location" label="登录地点" width="150" />
        <el-table-column prop="device" label="设备" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 两步验证对话框 -->
    <el-dialog v-model="showTwoFactorDialog" :title="twoFactorEnabled ? '关闭两步验证' : '开启两步验证'" width="400px">
      <div v-if="!twoFactorEnabled">
        <p class="dialog-desc">请选择验证方式：</p>
        <el-radio-group v-model="twoFactorType">
          <el-radio value="email">邮箱验证</el-radio>
          <el-radio value="sms">短信验证</el-radio>
        </el-radio-group>

        <div class="two-factor-setup" v-if="twoFactorType === 'email'">
          <p>验证邮箱：{{ formData.email || '未设置邮箱' }}</p>
          <el-button @click="sendTwoFactorCode">发送验证码</el-button>
        </div>

        <div class="two-factor-setup" v-if="twoFactorType === 'sms'">
          <p>验证手机：{{ formData.phone || '未设置手机' }}</p>
          <el-button @click="sendTwoFactorCode">发送验证码</el-button>
        </div>

        <el-input v-model="twoFactorCode" placeholder="请输入验证码" style="margin-top: 20px" />
      </div>

      <div v-else>
        <el-alert type="warning" :closable="false" show-icon>
          关闭两步验证后，账户安全性将降低。确定要继续吗？
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="showTwoFactorDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmTwoFactor" :loading="twoFactorLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const passwordFormRef = ref<FormInstance>()
const loadingHistory = ref(false)
const showTwoFactorDialog = ref(false)
const twoFactorLoading = ref(false)
const twoFactorType = ref('email')
const twoFactorCode = ref('')
const twoFactorEnabled = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const formData = reactive({
  email: '',
  phone: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
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

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能小于8位', trigger: 'blur' },
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
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loginHistory = ref([
  {
    time: '2024-03-09 10:30:25',
    ip: '192.168.1.1',
    location: '北京市',
    device: 'Chrome 122.0 / Windows 10',
    status: '成功'
  },
  {
    time: '2024-03-08 15:20:10',
    ip: '192.168.1.1',
    location: '北京市',
    device: 'Chrome 122.0 / Windows 10',
    status: '成功'
  }
])

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()

    await ElMessageBox.confirm('确定要修改密码吗？', '提示', {
      type: 'warning'
    })

    // 模拟修改密码
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('密码修改成功，请重新登录')

    // 清空表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error)
    }
  }
}

const loadLoginHistory = async () => {
  loadingHistory.value = true
  try {
    // 模拟加载
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    loadingHistory.value = false
  }
}

const handleToggleTwoFactor = () => {
  showTwoFactorDialog.value = true
}

const sendTwoFactorCode = () => {
  ElMessage.success('验证码已发送')
}

const confirmTwoFactor = async () => {
  twoFactorLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (!twoFactorEnabled.value) {
      if (!twoFactorCode.value) {
        ElMessage.warning('请输入验证码')
        return
      }
      twoFactorEnabled.value = true
      ElMessage.success('两步验证已开启')
    } else {
      twoFactorEnabled.value = false
      ElMessage.success('两步验证已关闭')
    }

    showTwoFactorDialog.value = false
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    twoFactorLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.security-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .security-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }

  .two-factor-info {
    .two-factor-status {
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .dialog-desc {
    margin-bottom: 15px;
    color: #606266;
  }

  .two-factor-setup {
    margin: 20px 0;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}
</style>