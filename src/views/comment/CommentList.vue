<template>
  <div class="comment-list">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="4" v-for="stat in statsList" :key="stat.key">
          <el-card class="stat-card" :body-style="{ padding: '15px' }" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon>
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="搜索评论内容/作者" clearable @clear="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="评论状态" clearable @change="handleSearch"
            style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="垃圾评论" value="spam" />
            <el-option label="回收站" value="trash" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleSearch" />
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
        <el-dropdown @command="handleBulkOperation" :disabled="selectedIds.length === 0">
          <el-button type="primary">
            批量操作 <el-icon>
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="approve">
                <el-icon><Select /></el-icon>
                批量通过
              </el-dropdown-item>
              <el-dropdown-item command="spam">
                <el-icon>
                  <Warning />
                </el-icon>
                标记垃圾
              </el-dropdown-item>
              <el-dropdown-item command="trash">
                <el-icon>
                  <Delete />
                </el-icon>
                移入回收站
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon>
                  <DeleteFilled />
                </el-icon>
                永久删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 评论表格 -->
    <el-table v-loading="loading" :data="comments" @selection-change="handleSelectionChange" row-key="id"
      default-expand-all :tree-props="{ children: 'replies', hasChildren: 'hasChildren' }">
      <el-table-column type="selection" width="55" />

      <el-table-column label="评论内容" min-width="300">
        <template #default="{ row }">
          <div class="comment-content">
            <div class="comment-author">
              <el-avatar :size="24" :src="row.author.avatar">
                {{ row.author.name.charAt(0) }}
              </el-avatar>
              <div class="author-info">
                <span class="author-name">{{ row.author.name }}</span>
                <span class="author-email">{{ row.author.email }}</span>
              </div>
              <el-tag v-if="row.status === 'pending'" size="small" type="warning" class="status-tag">
                待审核
              </el-tag>
              <el-tag v-else-if="row.status === 'spam'" size="small" type="danger" class="status-tag">
                垃圾
              </el-tag>
              <el-tag v-else-if="row.status === 'trash'" size="small" type="info" class="status-tag">
                回收站
              </el-tag>
            </div>
            <div class="comment-text">{{ row.content }}</div>
            <div class="comment-meta">
              <span>文章：{{ row.postTitle }}</span>
              <span>IP：{{ row.ip || '未知' }}</span>
              <span v-if="row.replyTo">
                回复 @{{ row.replyTo.name }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="likes" label="点赞" width="80" align="center" />
      <el-table-column prop="dislikes" label="点踩" width="80" align="center" />

      <el-table-column prop="createdAt" label="评论时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt, 'YYYY-MM-DD HH:mm') }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleApprove(row)" v-if="row.status === 'pending'">
            通过
          </el-button>

          <el-button size="small" type="success" link @click="handleReply(row)">
            回复
          </el-button>

          <el-button size="small" type="warning" link @click="handleMarkSpam(row)" v-if="row.status !== 'spam'">
            垃圾
          </el-button>

          <el-button size="small" type="danger" link @click="handleDelete(row)">
            删除
          </el-button>

          <el-dropdown trigger="click" @command="handleMoreAction($event, row)">
            <el-button size="small" link>
              更多 <el-icon>
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="viewPost">查看文章</el-dropdown-item>
                <el-dropdown-item command="blockUser">拉黑用户</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>

    <!-- 回复评论对话框 -->
    <el-dialog v-model="replyDialog.visible" :title="`回复 ${replyDialog.author}`" width="600px">
      <el-form :model="replyForm">
        <el-form-item>
          <el-input v-model="replyForm.content" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSendReply" :loading="replyLoading">
          发送回复
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑评论对话框 -->
    <el-dialog v-model="editDialog.visible" title="编辑评论" width="600px">
      <el-form :model="editForm">
        <el-form-item label="评论内容">
          <el-input v-model="editForm.content" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="editLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  ArrowDown,
  Select,
  Warning,
  Delete,
  DeleteFilled,
  Download,
  ChatDotRound,
  ChatLineRound,
  Clock,
  Document
} from '@element-plus/icons-vue'
import { useCommentStore } from '@/stores/comment'
import { formatDate } from '@/utils/common'

const router = useRouter()
const commentStore = useCommentStore()

const loading = ref(false)
const comments = computed(() => commentStore.comments)
const total = computed(() => commentStore.total)
const selectedIds = ref<(string | number)[]>([])

// 统计列表
const statsList = computed(() => [
  {
    key: 'total',
    label: '总评论',
    value: commentStore.stats?.total || 0,
    icon: ChatDotRound,
    color: '#409eff'
  },
  {
    key: 'pending',
    label: '待审核',
    value: commentStore.stats?.pending || 0,
    icon: Clock,
    color: '#e6a23c'
  },
  {
    key: 'approved',
    label: '已通过',
    value: commentStore.stats?.approved || 0,
    icon: Select,
    color: '#67c23a'
  },
  {
    key: 'spam',
    label: '垃圾评论',
    value: commentStore.stats?.spam || 0,
    icon: Warning,
    color: '#f56c6c'
  },
  {
    key: 'today',
    label: '今日新增',
    value: commentStore.stats?.today || 0,
    icon: ChatLineRound,
    color: '#9b59b6'
  },
  {
    key: 'thisMonth',
    label: '本月新增',
    value: commentStore.stats?.thisMonth || 0,
    icon: Document,
    color: '#3498db'
  }
])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20
})

// 回复对话框
const replyDialog = reactive({
  visible: false,
  commentId: null as number | string | null,
  author: ''
})
const replyForm = reactive({ content: '' })
const replyLoading = ref(false)

// 编辑对话框
const editDialog = reactive({
  visible: false,
  commentId: null as number | string | null
})
const editForm = reactive({ content: '' })
const editLoading = ref(false)

// 初始化
onMounted(() => {
  fetchComments()
  commentStore.fetchCommentStats()
})

// 获取评论列表
const fetchComments = async () => {
  try {
    loading.value = true
    await commentStore.fetchComments({
      ...searchForm,
      page: pagination.page,
      limit: pagination.limit,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      status: '',
    })
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchComments()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.limit = size
  fetchComments()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchComments()
}

// 批量操作
const handleBulkOperation = (command: string) => {
  if (selectedIds.value.length === 0) return

  const operations: Record<string, { title: string; message: string; action: () => Promise<void> }> = {
    approve: {
      title: '批量通过',
      message: `确定要通过选中的 ${selectedIds.value.length} 条评论吗？`,
      action: async () => {
        await commentStore.batchUpdateStatus(selectedIds.value, 'approved')
        ElMessage.success('批量通过成功')
      }
    },
    spam: {
      title: '标记垃圾',
      message: `确定要将选中的 ${selectedIds.value.length} 条评论标记为垃圾吗？`,
      action: async () => {
        await commentStore.batchUpdateStatus(selectedIds.value, 'spam')
        ElMessage.success('标记成功')
      }
    },
    trash: {
      title: '移入回收站',
      message: `确定要将选中的 ${selectedIds.value.length} 条评论移入回收站吗？`,
      action: async () => {
        await commentStore.batchUpdateStatus(selectedIds.value, 'trash')
        ElMessage.success('已移入回收站')
      }
    },
    delete: {
      title: '永久删除',
      message: `确定要永久删除选中的 ${selectedIds.value.length} 条评论吗？此操作不可恢复！`,
      action: async () => {
        await commentStore.batchDelete(selectedIds.value)
        ElMessage.success('删除成功')
      }
    }
  }

  const op = operations[command]
  if (!op) return

  ElMessageBox.confirm(op.message, op.title, {
    type: command === 'delete' ? 'error' : 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await op.action()
    fetchComments()
    selectedIds.value = []
  }).catch(() => { })
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 通过评论
const handleApprove = async (row: any) => {
  try {
    await commentStore.approveComment(row.id)
    ElMessage.success('评论已通过')
    fetchComments()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 回复评论
const handleReply = (row: any) => {
  replyDialog.commentId = row.id
  replyDialog.author = row.author.name
  replyDialog.visible = true
  replyForm.content = ''
}

// 发送回复
const handleSendReply = async () => {
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replyLoading.value = true
  try {
    await commentStore.replyToComment(replyDialog.commentId!, {
      content: replyForm.content
    })
    ElMessage.success('回复成功')
    replyDialog.visible = false
    fetchComments()
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    replyLoading.value = false
  }
}

// 标记垃圾
const handleMarkSpam = async (row: any) => {
  try {
    await commentStore.markAsSpam(row.id)
    ElMessage.success('已标记为垃圾评论')
    fetchComments()
  } catch (error) {
    console.error('标记失败:', error)
  }
}

// 删除评论
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      type: 'warning'
    })

    await commentStore.deleteComment(row.id)
    ElMessage.success('删除成功')
    fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 更多操作
const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'edit':
      editDialog.commentId = row.id
      editForm.content = row.content
      editDialog.visible = true
      break
    case 'viewPost':
      // 跳转到文章页面
      router.push(`/blog/edit/${row.postId}`)
      break
    case 'blockUser':
      ElMessage.info('拉黑用户功能开发中')
      break
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  editLoading.value = true
  try {
    await commentStore.updateComment(editDialog.commentId!, {
      content: editForm.content
    })
    ElMessage.success('更新成功')
    editDialog.visible = false
    fetchComments()
  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    editLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.comment-list {
  background: #fff;
  border-radius: 4px;
  padding: 20px;

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 24px;
            color: #fff;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;

    .right-actions {
      display: flex;
      gap: 10px;
    }
  }

  .comment-content {
    .comment-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .author-info {
        display: flex;
        flex-direction: column;

        .author-name {
          font-weight: 500;
          color: #333;
        }

        .author-email {
          font-size: 12px;
          color: #909399;
        }
      }

      .status-tag {
        margin-left: auto;
      }
    }

    .comment-text {
      color: #606266;
      margin-bottom: 8px;
      line-height: 1.6;
    }

    .comment-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #909399;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>