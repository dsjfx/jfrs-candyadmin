<template>
  <div class="backup-settings">
    <h3 class="section-title">备份恢复</h3>

    <!-- 自动备份设置 -->
    <el-card class="backup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>自动备份设置</span>
        </div>
      </template>

      <el-form :model="backupConfig" label-width="120px">
        <el-form-item label="启用自动备份">
          <el-switch v-model="backupConfig.enabled" />
        </el-form-item>

        <el-form-item label="备份频率" v-if="backupConfig.enabled">
          <el-select v-model="backupConfig.frequency" placeholder="请选择">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>

        <el-form-item label="备份时间" v-if="backupConfig.enabled">
          <el-time-picker v-model="backupConfig.time" placeholder="选择时间" format="HH:mm" value-format="HH:mm" />
        </el-form-item>

        <el-form-item label="保留份数" v-if="backupConfig.enabled">
          <el-input-number v-model="backupConfig.keepCount" :min="1" :max="30" />
          <span class="form-tip">份</span>
        </el-form-item>

        <el-form-item label="备份内容" v-if="backupConfig.enabled">
          <el-checkbox-group v-model="backupConfig.content">
            <el-checkbox value="database">数据库</el-checkbox>
            <el-checkbox value="files">文件</el-checkbox>
            <el-checkbox value="config">配置文件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 手动备份 -->
    <el-card class="backup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>手动备份</span>
          <el-button type="primary" @click="handleCreateBackup" :loading="creating">
            立即备份
          </el-button>
        </div>
      </template>

      <div class="backup-info">
        <p>上次备份时间：{{ lastBackupTime || '从未备份' }}</p>
        <p>备份文件大小：{{ lastBackupSize || '0' }}</p>
      </div>
    </el-card>

    <!-- 备份列表 -->
    <el-card class="backup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>备份列表</span>
        </div>
      </template>

      <el-table :data="backupList" v-loading="loading">
        <el-table-column prop="name" label="备份名称" min-width="200">
          <template #default="{ row }">
            <div class="backup-name">
              <el-icon>
                <Files />
              </el-icon>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'auto' ? 'info' : 'success'" size="small">
              {{ row.type === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleRestore(row)">
              恢复
            </el-button>
            <el-button size="small" type="success" link @click="handleDownload(row)">
              下载
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :total="pagination.total" layout="prev, pager, next" @current-change="loadBackupList" />
      </div>
    </el-card>

    <!-- 恢复确认对话框 -->
    <el-dialog v-model="showRestoreDialog" title="恢复确认" width="400px">
      <el-alert type="warning" :closable="false" show-icon>
        恢复操作将覆盖当前数据，确定要继续吗？
      </el-alert>

      <div class="restore-options" style="margin-top: 20px">
        <el-checkbox v-model="restoreOptions.overwrite">覆盖现有数据</el-checkbox>
        <el-checkbox v-model="restoreOptions.includeFiles">包含文件</el-checkbox>
      </div>

      <template #footer>
        <el-button @click="showRestoreDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRestore" :loading="restoring">
          开始恢复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Files } from '@element-plus/icons-vue'

const loading = ref(false)
const creating = ref(false)
const restoring = ref(false)
const showRestoreDialog = ref(false)
const selectedBackup = ref<any>(null)
const lastBackupTime = ref('2024-03-09 10:30:25')
const lastBackupSize = ref('15.2 MB')

const backupConfig = reactive({
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  keepCount: 7,
  content: ['database', 'files']
})

const restoreOptions = reactive({
  overwrite: true,
  includeFiles: true
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 3
})

const backupList = ref([
  {
    id: 1,
    name: 'backup_20240309_023001.sql.gz',
    size: '15.2 MB',
    createdAt: '2024-03-09 02:30:01',
    type: 'auto'
  },
  {
    id: 2,
    name: 'backup_20240308_023002.sql.gz',
    size: '15.1 MB',
    createdAt: '2024-03-08 02:30:02',
    type: 'auto'
  },
  {
    id: 3,
    name: 'manual_backup_20240307_153021.sql.gz',
    size: '15.3 MB',
    createdAt: '2024-03-07 15:30:21',
    type: 'manual'
  }
])

onMounted(() => {
  loadBackupList()
})

const loadBackupList = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    // 模拟加载
  } finally {
    loading.value = false
  }
}

const handleCreateBackup = async () => {
  creating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('备份创建成功')
    loadBackupList()
  } catch (error) {
    console.error('备份失败:', error)
  } finally {
    creating.value = false
  }
}

const handleRestore = (backup: any) => {
  selectedBackup.value = backup
  showRestoreDialog.value = true
}

const handleDownload = () => {
  ElMessage.info('下载功能开发中')
}

const handleDelete = async (backup: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份文件 "${backup.name}" 吗？`,
      '提示',
      { type: 'warning' }
    )

    // 模拟删除
    await new Promise(resolve => setTimeout(resolve, 500))
    backupList.value = backupList.value.filter(b => b.id !== backup.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const confirmRestore = async () => {
  restoring.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('恢复成功')
    showRestoreDialog.value = false
  } catch (error) {
    console.error('恢复失败:', error)
  } finally {
    restoring.value = false
  }
}
</script>

<style lang="scss" scoped>
.backup-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .backup-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }

  .backup-info {
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;

    p {
      margin: 5px 0;
      color: #606266;
    }
  }

  .backup-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #409eff;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .restore-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>