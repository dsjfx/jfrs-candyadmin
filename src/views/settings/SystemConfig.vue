<template>
  <div class="system-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-button type="primary" :loading="saving" @click="handleSave">
            保存全部设置
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <BasicConfig v-model="formData.basic" />
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <SecurityConfig v-model="formData.security" />
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <NotificationConfig v-model="formData.notification" />
        </el-tab-pane>

        <!-- 主题设置 -->
        <el-tab-pane label="主题设置" name="theme">
          <ThemeConfig v-model="formData.theme" />
        </el-tab-pane>

        <!-- 备份设置 -->
        <el-tab-pane label="备份设置" name="backup">
          <BackupConfig v-model="formData.backup" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ConfigGroupData } from '@/api/systemApi';
import BasicConfig from '@/components/system/BasicConfig.vue';
import SecurityConfig from '@/components/system/SecurityConfig.vue';
import NotificationConfig from '@/components/system/NotificationConfig.vue';
import ThemeConfig from '@/components/system/ThemeConfig.vue';
import BackupConfig from '@/components/system/BackupConfig.vue';
const activeTab = ref('basic');
const saving = ref(false);

const formData = reactive<ConfigGroupData>({
  basic: {
    site_name: '',
    site_description: '',
    site_keywords: [],
    site_icp: '',
    site_footer: ''
  },
  security: {
    security_login_attempts: 5,
    security_jwt_expire_hours: 24,
    security_session_timeout: 30,
    security_enable_captcha: true
  },
  notification: {
    notification_email_on_comment: true,
    notification_email_on_register: true,
    notification_admin_email: ''
  },
  theme: {
    theme_admin: 'light',
    theme_primary_color: '#409EFF',
    theme_sidebar_collapsed: false
  },
  backup: {
    backup_auto_schedule: '0 2 * * *',
    backup_retention_days: 30,
    backup_enable_auto: true
  }
});

const loadConfigs = async () => {
  try {
    // const res = await systemApi.getSystemConfigs();
    // Object.assign(formData.basic, res.data.basic);
    // Object.assign(formData.security, res.data.security);
    // Object.assign(formData.notification, res.data.notification);
    // Object.assign(formData.theme, res.data.theme);
    // Object.assign(formData.backup, res.data.backup);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // } catch (error) {
    // ElMessage.error('加载配置失败', error);
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    // await systemApi.updateSystemConfigs(formData);
    ElMessage.success('保存成功');
  } catch (error) {
    // ElMessage.error('保存失败', error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.system-config {
  padding: 20px;
}

.config-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>