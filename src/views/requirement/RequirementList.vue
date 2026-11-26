<template>
  <div class="requirement-list">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.key">
          <div class="stat-card" :style="{ borderColor: stat.color }">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-icon" :style="{ color: stat.color }">
              <el-icon>
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索需求名称/内容" clearable style="width: 200px">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="规划中" value="planning" />
            <el-option label="开发中" value="developing" />
            <el-option label="测试中" value="testing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchForm.priority" placeholder="优先级" clearable style="width: 110px">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchForm.system" placeholder="所属系统" clearable style="width: 110px">
            <el-option v-for="system in requirementStore.systems" :key="system" :label="system" :value="system" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="right-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          新建需求
        </el-button>
        <el-button @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="requirements" @selection-change="handleSelectionChange" stripe
      style="width: 100%">
      <el-table-column type="selection" width="50" />

      <el-table-column prop="name" label="需求名称" min-width="180">
        <template #default="{ row }">
          <div class="requirement-name">
            <span class="name-text">{{ row.name }}</span>
            <el-tag v-if="row.priority" size="small" :type="priorityType[row.priority as keyof typeof priorityType]"
              class="priority-tag">
              {{ priorityLabel[row.priority as keyof typeof priorityLabel] }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="system" label="所属系统" width="120" />

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status as keyof typeof statusType]" size="small">
            {{ statusLabel[row.status as keyof typeof statusLabel] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分类" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">
            {{ categoryLabel[row.category as keyof typeof categoryLabel] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="assignee" label="负责人" width="100" />

      <el-table-column prop="progress" label="进度" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.progress || 0" :color="progressColor(row.progress)" :stroke-width="6" />
        </template>
      </el-table-column>

      <el-table-column prop="plannedTime" label="计划时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.plannedTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button size="small" type="success" link @click="handleView(row)">
            详情
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>

    <!-- 需求表单对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" destroy-on-close class="requirement-dialog">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" :disabled="dialog.mode === 'view'">
        <!-- 基本信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入需求名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属系统" prop="system">
              <el-input v-model="formData.system" placeholder="请输入所属系统" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择" style="width: 100%">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                <el-option label="待处理" value="pending" />
                <el-option label="规划中" value="planning" />
                <el-option label="开发中" value="developing" />
                <el-option label="测试中" value="testing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                <el-option label="新功能" value="feature" />
                <el-option label="功能优化" value="improvement" />
                <el-option label="Bug修复" value="bugfix" />
                <el-option label="性能优化" value="optimization" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="formData.source" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in sourceLabel" :key="value" :label="label" :value="value" />
                <!-- <el-option label="客户" value="customer" />
                <el-option label="内部" value="internal" />
                <el-option label="管理层" value="management" />
                <el-option label="其他" value="other" /> -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提出人" prop="proposer">
              <el-input v-model="formData.proposer" placeholder="请输入提出人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="assignee">
              <el-input v-model="formData.assignee" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划时间" prop="plannedTime">
              <el-date-picker v-model="formData.plannedTime" type="datetime" placeholder="选择计划时间"
                format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标版本" prop="version">
              <el-input v-model="formData.version" placeholder="如: v2.0.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预估工时" prop="estimatedHours">
              <el-input-number v-model="formData.estimatedHours" :min="0" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进度" prop="progress">
              <el-slider v-model="formData.progress" :min="0" :max="100" :step="5" show-input input-size="small" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="需求内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请详细描述需求内容" />
        </el-form-item>

        <el-form-item label="标签">
          <el-select v-model="formData.tags" multiple filterable allow-create default-first-option
            placeholder="请输入标签，按回车创建" style="width: 100%" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.comments" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">
          {{ dialog.mode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button v-if="dialog.mode !== 'view'" type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialog.mode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { formatDate } from '@/utils/common'
import { useRequirementStore } from '@/stores/requirement'

const requirementStore = useRequirementStore()

// ============ 状态管理 ============
const loading = ref(false)
const submitting = ref(false)
const selectedIds = ref<string[]>([])

// 数据列表
// const mockdata = ref([
//   {
//     id: 1,
//     name: '用户登录功能优化',
//     system: '用户中心',
//     content: '优化登录流程，增加验证码功能',
//     plannedTime: '2026-04-20 18:00:00',
//     priority: 'high',
//     status: 'developing',
//     category: 'improvement',
//     proposer: '张三',
//     assignee: '李四',
//     estimatedHours: 8,
//     actualHours: 0,
//     progress: 60,
//     tags: ['登录', '优化'],
//     comments: '需要与前端配合',
//     source: 'internal',
//     version: 'v2.0.0',
//     createdAt: '2026-04-01 10:00:00'
//   },
//   {
//     id: 2,
//     name: '数据导出功能',
//     system: '数据管理',
//     content: '支持将数据导出为 Excel 格式',
//     plannedTime: '2026-05-01 18:00:00',
//     priority: 'medium',
//     status: 'planning',
//     category: 'feature',
//     proposer: '王五',
//     assignee: '赵六',
//     estimatedHours: 12,
//     actualHours: 0,
//     progress: 0,
//     tags: ['导出', 'Excel'],
//     comments: '需要支持大数据量导出',
//     source: 'customer',
//     version: 'v2.1.0',
//     createdAt: '2026-04-02 09:00:00'
//   }
// ])

const total = ref(20)

// ============ 搜索和分页 ============
const searchForm = reactive({
  keyword: '',
  status: '',
  priority: '',
  system: '',
})

const pagination = reactive({
  current: 1,
  size: 20
})

// ============ 对话框 ============
const dialog = reactive({
  visible: false,
  title: '新建需求',
  mode: 'create' as 'create' | 'edit' | 'view'
})

const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  system: '',
  content: '',
  plannedTime: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' as 'pending' | 'planning' | 'developing' | 'testing' | 'completed' | 'cancelled',
  category: 'feature' as 'feature' | 'improvement' | 'bugfix' | 'optimization' | 'other',
  proposer: '',
  assignee: '',
  estimatedHours: 0,
  progress: 0,
  tags: [] as string[],
  comments: '',
  source: 'internal' as 'customer' | 'internal' | 'management' | 'other',
  version: '',
  startDate: '',
  endDate: '',
  // attachments: [] as string[],
  actualHours: 0
})

// ============ 表单验证 ============
const rules: FormRules = {
  name: [
    { required: true, message: '请输入需求名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  system: [{ required: true, message: '请输入所属系统', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入需求内容', trigger: 'blur' },
    { min: 10, message: '需求内容至少 10 个字', trigger: 'blur' }
  ],
  plannedTime: [{ required: true, message: '请选择计划时间', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

// 状态映射
const statusLabel: Record<string, string> = {
  pending: '待处理',
  planning: '规划中',
  developing: '开发中',
  testing: '测试中',
  completed: '已完成',
  cancelled: '已取消'
}

const statusType = {
  pending: 'info',
  planning: 'warning',
  developing: 'primary',
  testing: 'primary',
  completed: 'success',
  cancelled: 'danger'
} as const satisfies Record<string, TagType>


const priorityLabel = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
} as const satisfies Record<string, '低' | '中' | '高' | '紧急'>

const priorityType = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger'
} as const satisfies Record<string, TagType>

const categoryLabel: Record<string, string> = {
  feature: '新功能',
  improvement: '功能优化',
  bugfix: 'Bug修复',
  optimization: '性能优化',
  other: '其他'
}

const sourceLabel: Record<string, string> = {
  customer: '客户',
  internal: '内部',
  management: '管理层',
  other: '其他'
}

// ============ 统计信息 ============
const stats = computed(() => {
  const stat = requirementStore.overviewStats
  const result = [
    { key: 'total', label: '总需求', value: stat.total, icon: 'List', color: '#409eff' },
    { key: 'pending', label: '待处理', value: stat.pending, icon: 'Clock', color: '#e6a23c' },
    { key: 'inProgress', label: '进行中', value: stat.inProgress, icon: 'Loading', color: '#409eff' },
    { key: 'completed', label: '已完成', value: stat.completed, icon: 'CircleCheck', color: '#67c23a' }
  ]
  return result
})

const requirements = computed(() => requirementStore.requirements)

// ============ 进度颜色 ============
const progressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

// ============ 方法 ============
const handleSearch = () => {
  pagination.current = 1
  fetchRequirements()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.priority = ''
  handleSearch()
}

const handleCreate = () => {
  dialog.mode = 'create'
  dialog.title = '新建需求'
  resetForm()
  dialog.visible = true
}

const handleEdit = (row: any) => {
  dialog.mode = 'edit'
  dialog.title = '编辑需求'
  Object.assign(formData, row)
  dialog.visible = true
}

const handleView = (row: any) => {
  dialog.mode = 'view'
  dialog.title = '需求详情'
  Object.assign(formData, row)
  dialog.visible = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除需求 "${row.name}" 吗？`, '提示', {
      type: 'warning'
    })
    // 模拟删除
    ElMessage.success('删除成功')
    fetchRequirements()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟保存
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // console.log(formData)
    await requirementStore.createRequirement(formData)


    if (dialog.mode === 'create') {
      ElMessage.success('创建成功')
    } else {
      ElMessage.success('更新成功')
    }

    dialog.visible = false
    fetchRequirements()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchRequirements()
}

const handlePageChange = (current: number) => {
  pagination.current = current
  fetchRequirements()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    name: '',
    system: '',
    content: '',
    plannedTime: '',
    priority: 'medium',
    status: 'pending',
    category: 'feature',
    proposer: '',
    assignee: '',
    estimatedHours: 0,
    progress: 0,
    tags: [],
    comments: '',
    source: 'internal',
    version: '',
    startDate: '',
    endDate: '',
    // attachments: [],
    actualHours: 0
  })
}

const fetchRequirements = async () => {
  await requirementStore.fetchRequirements({
    current: pagination.current,
    size: pagination.size,
    keyword: searchForm.keyword,
    status: searchForm.status,
    priority: searchForm.priority,
    system: searchForm.system,
  })
}

const fetchStats = async () => {
  await requirementStore.getRequirementOverviewStats()
}

const fetchSystems = async () => {
  await requirementStore.getRequirementSystems()
}

onMounted(() => {
  fetchRequirements()

  fetchStats()

  fetchSystems()
})
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.requirement-list {
  background: #fff;
  border-radius: 4px;
  padding: 20px;

  // 统计卡片
  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
      background: #fafafa;
      position: relative;

      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }

      .stat-icon {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 32px;
        opacity: 0.3;
      }
    }
  }

  // 操作栏
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;

    @media (max-width: $breakpoint-mobile) {
      flex-direction: column;
    }

    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-form-item {
        margin-bottom: 0;
      }
    }

    .right-actions {
      display: flex;
      gap: 8px;
    }
  }

  // 需求名称
  .requirement-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .name-text {
      flex: 1;
    }

    .priority-tag {
      flex-shrink: 0;
    }
  }

  // 分页
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;

    @media (max-width: $breakpoint-mobile) {
      justify-content: center;
    }
  }
}

// 对话框
.requirement-dialog {
  :deep(.el-dialog) {
    @media (max-width: $breakpoint-mobile) {
      width: 95% !important;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>