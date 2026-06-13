<template>
  <div class="tag-list responsive-padding">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索标签名称" clearable @clear="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
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
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon>
          <Plus />
        </el-icon>
        添加标签
      </el-button>
      <el-button v-if="!isMobile" type="danger" plain :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <el-icon>
          <Delete />
        </el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 标签表格 -->
    <el-table v-loading="loading" :data="tags" @selection-change="handleSelectionChange">
      <el-table-column v-if="!isMobile" type="selection" width="55" />
      <el-table-column v-else type="index" label="序号" width="55" />

      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <div class="tag-item">
            <span class="tag-color" :style="{ backgroundColor: row.color || '#409eff' }" />
            <div class="tag-info">
              <div class="tag-name">{{ row.name }}</div>
              <div class="tag-slug">{{ row.slug }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="描述" min-width="200">
        <template #default="{ row }">
          <div class="description" :title="row.description">
            {{ row.description || '暂无描述' }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="blogCount" label="文章数" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small">
            {{ row.blogCount || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" :fixed="isFixed">
        <template #default="{ row }">
          <el-button size="small" type="warning" link @click="handleEdit(row)">
            编辑
          </el-button>

          <el-button size="small" type="danger" link @click="handleDelete(row)" :disabled="row.count > 0">
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

    <!-- 标签表单对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" :width="dialogWidth" :close-on-click-modal="false"
      @closed="handleDialogClosed">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" class="editor-form">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入标签名称" @input="generateSlug" />
        </el-form-item>

        <el-form-item label="标签别名" prop="slug">
          <el-input v-model="formData.slug" placeholder="请输入标签别名" />
          <div class="form-tip">用于URL，建议使用英文小写和连字符</div>
        </el-form-item>

        <el-form-item label="标签颜色" prop="color">
          <div class="color-picker-wrapper">
            <el-color-picker v-model="formData.color" show-alpha :predefine="predefinedColors" placeholder="" />
            <el-input v-model="formData.color" placeholder="#409eff" style="margin-left: 10px; width: 120px;" />
          </div>
          <div class="form-tip">用于前端显示，可选</div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入标签描述" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useTagStore } from '@/stores/tag'
import { checkScreenWidth, formatDate } from '@/utils/common'
import type { TagForm, Tag } from '@/types/tag'
import { getFullLetter } from '@/utils/pinyinUtils'

const tagStore = useTagStore()
const loading = ref(false)
const selectedIds = ref<(string | number)[]>([])
const isMobile = checkScreenWidth();
const isFixed = isMobile ? false : 'right'

const tags = computed(() => tagStore.tags)
const total = computed(() => tagStore.total)

// 动态计算对话框宽度
const dialogWidth = computed(() => {
  if (isMobile) {
    return '90%'  // 移动端宽度 90%
  }
  return '500px'  // 桌面端固定宽度
})

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  current: 1,
  size: 10
})

const dialog = reactive({
  visible: false,
  title: '',
  mode: 'create' as 'create' | 'edit'
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<TagForm>({
  id: '',
  name: '',
  slug: '',
  color: '#409eff',
  description: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入标签别名', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ]
}

// 预定义颜色
const predefinedColors = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#ff69b4',
  '#9b59b6',
  '#3498db',
  '#2ecc71',
  '#f1c40f',
  '#e74c3c',
  '#95a5a6'
]

// 初始化数据
onMounted(() => {
  fetchTags()
})

const fetchTags = async () => {
  try {
    loading.value = true

    const params: Record<string, unknown> = {
      ...searchForm,
      ...pagination
    };
    await tagStore.fetchTags(params)
  } catch (error) {
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchTags()
}

const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

const handleCreate = () => {
  dialog.mode = 'create'
  dialog.title = '添加标签'
  resetForm()
  dialog.visible = true
}

const handleEdit = (row: TagForm) => {
  dialog.mode = 'edit'
  dialog.title = '编辑标签'

  Object.assign(formData, {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color || '#409eff',
    description: row.description
  })

  dialog.visible = true
}

const handleDelete = async (row: TagForm) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签 "${row.name}" 吗？`,
      '提示',
      {
        type: 'warning'
      }
    )

    await tagStore.deleteTag(row.id)
    ElMessage.success('删除成功')
    fetchTags()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.error('删除标签失败:', error)
    ElMessage('取消删除标签')
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个标签吗？`,
      '提示',
      {
        type: 'warning'
      }
    )

    // 检查是否有标签被使用
    const usedTags = tags.value.filter(tag =>
      selectedIds.value.includes(tag.id) && tag.count > 0
    )

    if (usedTags.length > 0) {
      const tagNames = usedTags.map(tag => tag.name).join(', ')
      ElMessage.error(`以下标签正在被使用，无法删除：${tagNames}`)
      return
    }

    // 调用批量删除API
    await tagStore.batchDelete(selectedIds.value)

    selectedIds.value = []
    fetchTags()
    ElMessage.success('批量删除成功')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.error('批量删除失败:', error)
    ElMessage('取消批量删除标签')
  }
}

const handleSelectionChange = (selection: Tag[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchTags()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchTags()
}

const generateSlug = () => {
  if (formData.name /**&& !formData.slug*/) {
    // formData.slug = formData.name
    //   .toLowerCase()
    //   .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-')
    //   .replace(/-+/g, '-')
    //   .replace(/^-|-$/g, '')
    formData.slug = getFullLetter(formData.name)
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    id: undefined,
    name: '',
    slug: '',
    color: '#409eff',
    description: ''
  })
}

const handleDialogClosed = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (dialog.mode === 'create') {
      await tagStore.createTag(formData)
      ElMessage.success('创建成功')
    } else {
      await tagStore.updateTag(formData.id!, formData)
      ElMessage.success('更新成功')
    }

    dialog.visible = false
    fetchTags()
  } catch (error) {
    console.error('保存标签失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.tag-list {
  background: #fff;
  border-radius: 4px;
  // padding: 20px;

  .search-bar {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
    // display: flex;
    // justify-content: space-between;
    // align-items: flex-start;
    // gap: 20px;
    // flex-wrap: wrap;

    @media (max-width: $breakpoint-mobile) {
      flex-direction: column;
    }

    .el-form {
      flex: 1;
    }
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tag-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .tag-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .tag-info {
      .tag-name {
        font-weight: 500;
        margin-bottom: 2px;
      }

      .tag-slug {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .description {
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;

    @media (max-width: $breakpoint-mobile) {
      justify-content: center;
    }
  }
}

.color-picker-wrapper {
  display: flex;
  align-items: center;

  @media (max-width: $breakpoint-mobile) {
    flex-wrap: wrap;
    gap: 10px;

    .el-color-picker {
      width: 100%;
    }

    .el-input {
      width: 100% !important;
      margin-left: 0 !important;
    }
  }
}

@media (max-width: $breakpoint-mobile) {
  .editor-form :deep(.el-form-item) {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-form :deep(.el-form-item__label) {
    justify-content: flex-start;
    width: 100% !important;
    text-align: left;
    padding-bottom: 8px;
  }

  .editor-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100%;
  }
}
</style>