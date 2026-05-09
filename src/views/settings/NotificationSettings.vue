<template>
  <div class="notification-settings">
    <h3 class="section-title">通知设置</h3>

    <!-- 邮件通知 -->
    <el-card class="notification-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>邮件通知</span>
        </div>
      </template>

      <el-form :model="formData" label-width="120px">
        <el-form-item label="新评论通知">
          <el-switch v-model="formData.email.comment" />
          <div class="form-desc">文章收到新评论时发送邮件通知</div>
        </el-form-item>

        <el-form-item label="评论回复通知">
          <el-switch v-model="formData.email.reply" />
          <div class="form-desc">评论被回复时发送邮件通知</div>
        </el-form-item>

        <el-form-item label="文章审核通知">
          <el-switch v-model="formData.email.approval" />
          <div class="form-desc">新文章需要审核时发送通知</div>
        </el-form-item>

        <el-form-item label="系统通知">
          <el-switch v-model="formData.email.system" />
          <div class="form-desc">系统维护、更新等重要通知</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 站内通知 -->
    <el-card class="notification-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>站内通知</span>
        </div>
      </template>

      <el-form :model="formData" label-width="120px">
        <el-form-item label="新评论通知">
          <el-switch v-model="formData.site.comment" />
        </el-form-item>

        <el-form-item label="评论回复通知">
          <el-switch v-model="formData.site.reply" />
        </el-form-item>

        <el-form-item label="文章审核通知">
          <el-switch v-model="formData.site.approval" />
        </el-form-item>

        <el-form-item label="系统通知">
          <el-switch v-model="formData.site.system" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知时间段 -->
    <el-card class="notification-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>免打扰设置</span>
        </div>
      </template>

      <el-form :model="formData" label-width="120px">
        <el-form-item label="开启免打扰">
          <el-switch v-model="formData.doNotDisturb.enabled" />
        </el-form-item>

        <el-form-item label="时间段" v-if="formData.doNotDisturb.enabled">
          <el-time-picker v-model="formData.doNotDisturb.timeRange" is-range range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间" format="HH:mm" value-format="HH:mm" />
          <div class="form-desc">在此时间段内不发送任何通知</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提交按钮 -->
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        保存设置
      </el-button>
      <el-button @click="handleReset">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const submitting = ref(false)

const formData = reactive({
  email: {
    comment: true,
    reply: true,
    approval: true,
    system: true
  },
  site: {
    comment: true,
    reply: true,
    approval: true,
    system: true
  },
  doNotDisturb: {
    enabled: false,
    timeRange: ['23:00', '07:00']
  }
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('notificationSettings', JSON.stringify(formData))
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formData.email = { comment: true, reply: true, approval: true, system: true }
  formData.site = { comment: true, reply: true, approval: true, system: true }
  formData.doNotDisturb = { enabled: false, timeRange: ['23:00', '07:00'] }
  ElMessage.success('已恢复默认设置')
}
</script>

<style lang="scss" scoped>
.notification-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .notification-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      font-weight: 500;
    }
  }

  .form-desc {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .form-actions {
    margin-top: 30px;
    display: flex;
    gap: 10px;
  }
}
</style>