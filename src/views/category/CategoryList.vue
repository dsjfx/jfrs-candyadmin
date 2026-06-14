<template>
  <div class="category-list responsive-padding">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索分类名称" clearable @clear="handleSearch">
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
        添加分类
      </el-button>
      <el-button v-if="!isMobile" @click="handleExpandAll">
        <el-icon>
          <Expand />
        </el-icon>
        展开全部
      </el-button>
      <el-button v-if="!isMobile" @click="handleCollapseAll">
        <el-icon>
          <Fold />
        </el-icon>
        折叠全部
      </el-button>
    </div>

    <!-- 分类表格 -->
    <el-table v-loading="loading" ref="tableRef" :data="categoryTree" row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :default-expand-all="expandedAll"
      @selection-change="handleSelectionChange" :row-class-name="rowClassName" class="tree-table-basic">
      <el-table-column v-if="!isMobile" type="selection" width="55" />
      <el-table-column v-else type="index" label="序号" width="55" />

      <el-table-column prop="name" label="分类名称" width="200">
        <template #default="{ row }">
          <div class="category-name">
            <span class="category-color" :style="{ backgroundColor: row.color || '#409eff' }"></span>
            <span class="name-text">{{ row.name }}</span>
            <el-tag v-if="row.parentId === null" size="small" type="info">
              根分类
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="slug" label="别名" width="150" />

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

      <el-table-column prop="sort" label="排序" width="150" align="center">
        <template #default="{ row }">
          <el-input-number v-model="row.sort" :min="0" :max="999" size="small" @change="handleOrderChange(row)" />
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" :fixed="isFixed">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleCreateChild(row)">
            添加子分类
          </el-button>

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
    <div class="pagination" v-if="!isTreeMode">
      <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>

    <!-- 分类表单对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" :width="dialogWidth" :close-on-click-modal="false"
      @closed="handleDialogClosed" class="el-dialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" class="editor-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" clearable placeholder="请输入分类名称" @input="generateSlug" />
        </el-form-item>

        <el-form-item label="分类别名" prop="slug">
          <el-input v-model="formData.slug" clearable placeholder="请输入分类别名" />
          <div class="form-tip">用于URL，建议使用英文小写和连字符</div>
        </el-form-item>

        <el-form-item label="父分类" prop="parentId">
          <el-tree-select v-model="formData.parentId" node-key="id" :data="categoryTree" :props="{
            label: 'name',
            children: 'children'
          }" check-strictly :render-after-expand="false" clearable placeholder="请选择父分类（不选则为根分类）" style="width: 100%" />
        </el-form-item>

        <el-form-item label="分类颜色" prop="color">
          <div class="color-picker-wrapper">
            <el-color-picker v-model="formData.color" show-alpha :predefine="predefinedColors" placeholder="" />
            <el-input v-model="formData.color" placeholder="#409eff" style="margin-left: 10px; width: 120px;" />
          </div>
          <div class="form-tip">用于前端显示，可选</div>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" style="width: 100%" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分类描述" maxlength="200"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Expand, Fold } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, TableColumnCtx } from 'element-plus'
import { useCategoryStore } from '@/stores/category'
import type { CategoryForm, CategoryTree } from '@/types/category'
import { checkScreenWidth, formatDate } from '@/utils/common'
import { getFullLetter } from '@/utils/pinyinUtils'

const categoryStore = useCategoryStore()
const loading = ref(false)
const expandedAll = ref(true)
const selectedIds = ref<(string | number)[]>([])
const isMobile = checkScreenWidth();
const isFixed = isMobile ? false : 'right'

const tableRef = ref()

const isTreeMode = computed(() => false) // 始终使用树形模式
const categoryTree = computed(() => categoryStore.categoryTree)
const total = computed(() => categoryStore.total)

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
  mode: 'create' as 'create' | 'edit',
  parentId: null as string | number | null
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<CategoryForm>({
  id: '',
  name: '',
  slug: '',
  description: '',
  color: '#409eff',
  parentId: undefined,
  sort: 0
})


const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  sort: [
    { type: 'number', min: 0, max: 999, message: '排序值在 0-999 之间', trigger: 'blur' }
  ]
}

// 预定义颜色，与 TagList 保持一致
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

// 判断是否为父节点
const isParent = (row: CategoryTree) => {
  return row.children && row.children.length > 0
}

// 行样式
const rowClassName = ({ row }: { row: CategoryTree }) => {
  if (isParent(row)) {
    return 'parent-tree-row'
  }
  return 'child-tree-row'
}

// 单元格样式
// const cellStyle = ({
//   row,
//   column
// }: {
//   row: CategoryTree
//   column: TableColumnCtx<CategoryTree>
//   rowIndex: number
//   columnIndex: number
// }) => {
//   if (isParent(row) && column.property === 'name') {
//     return {
//       fontWeight: '600',
//       color: '#1890ff'
//     }
//   }
//   return null
// }

// 修改缩进
// const changeIndent = (val) => {
//   // 动态修改 CSS 变量
//   document.documentElement.style.setProperty('--tree-indent', `${val}px`)
// }

// 初始化数据
onMounted(() => {
  fetchCategories()
})

const fetchCategories = async () => {
  try {
    loading.value = true
    const params: Record<string, unknown> = {
      ...searchForm,
      ...pagination
    };

    await categoryStore.fetchCategories(params)
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchCategories()
}

const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

const handleCreate = () => {
  dialog.mode = 'create'
  dialog.title = '添加分类'
  dialog.parentId = null
  resetForm()
  dialog.visible = true
}

const handleCreateChild = (row: CategoryForm) => {
  dialog.mode = 'create'
  dialog.title = `添加子分类 - ${row.name}`
  dialog.parentId = row.id || null
  resetForm()
  formData.parentId = row.id
  dialog.visible = true
}

const handleEdit = (row: CategoryForm) => {
  dialog.mode = 'edit'
  dialog.title = '编辑分类'
  dialog.parentId = row.parentId || null

  Object.assign(formData, {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: row.color || '#409eff',
    parentId: row.parentId,
    sort: row.sort
  })

  dialog.visible = true
}

const handleDelete = async (row: CategoryTree) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${row.name}" 吗？${row.children?.length ? '该操作会同时删除所有子分类！' : ''
      }`,
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    await categoryStore.deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

const handleOrderChange = async (row: CategoryForm) => {
  try {
    await categoryStore.updateCategory(row.id ?? 0, { sort: row.sort })
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    fetchCategories() // 重新获取数据恢复原状
  }
}

const handleExpandAll = () => {
  // expandedAll.value = true
  // 递归展开所有节点
  const expandNode = (data: CategoryTree[]) => {
    data.forEach(row => {
      // 展开当前节点
      tableRef.value?.toggleRowExpansion(row, true)
      // 如果有子节点，递归展开
      if (row.children && row.children.length) {
        expandNode(row.children)
      }
    })
  }
  expandNode(categoryTree.value)
}

// 折叠全部
const handleCollapseAll = () => {
  // expandedAll.value = false
  // 递归收起所有节点
  const collapseNode = (data: CategoryTree[]) => {
    data.forEach(row => {
      tableRef.value?.toggleRowExpansion(row, false)
      if (row.children && row.children.length) {
        collapseNode(row.children)
      }
    })
  }
  collapseNode(categoryTree.value)
}

const handleSelectionChange = (selection: CategoryForm[]) => {
  selectedIds.value = selection
    .map(item => item.id)
    .filter((id): id is string | number => id !== undefined && id !== null)
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchCategories()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchCategories()
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
    description: '',
    color: '#409eff',
    parentId: dialog.parentId,
    sort: 0
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
      await categoryStore.createCategory(formData)
      ElMessage.success('创建成功')
    } else {
      await categoryStore.updateCategory(formData.id!, formData)
      ElMessage.success('更新成功')
    }

    dialog.visible = false
    fetchCategories()
  } catch (error) {
    console.error('保存分类失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.category-list {
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

  .category-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .category-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .name-text {
      font-weight: 500;
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

  .el-overlay-dialog :deep(.el-dialog) {
    @media (max-width: $breakpoint-mobile) {
      width: 90% !important;
      margin: 0 auto !important;
    }
  }
}

.tree-table-basic :deep(.parent-tree-row) {
  background-color: #f0f9ff !important;
  font-weight: 600;
  color: #1890ff;
}

.tree-table-basic :deep(.child-tree-row) {
  background-color: #ffffff !important;
  color: #606266;
}

/* 增加缩进 */
.tree-table-basic :deep(.child-tree-row .el-table_1_column_2 .cell) {
  padding-left: 40px !important;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
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