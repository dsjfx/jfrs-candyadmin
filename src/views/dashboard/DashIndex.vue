<template>
  <div class="dashboard-container">
    <!-- 欢迎栏 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎回来，{{ userInfo?.nickname || '管理员' }}！👋
          </h1>
          <p class="welcome-subtitle">
            {{ getGreeting() }}，今天是 {{ currentDate }}，祝您工作愉快！
          </p>
        </div>
        <div class="welcome-actions">
          <el-button type="primary" @click="handleCreateBlog" class="el-button">
            <el-icon>
              <Plus />
            </el-icon>
            写文章
          </el-button>
          <el-button @click="handleQuickNavigate" class="el-button">
            <el-icon>
              <Operation />
            </el-icon>
            快速导航
          </el-button>
        </div>
      </div>
      <div class="user-avatar">
        <el-avatar :size="64" :src="userInfo?.avatar">
          {{ userInfo?.username?.charAt(0).toUpperCase() || 'A' }}
        </el-avatar>
        <div class="user-status">
          <span class="status-dot online"></span>
          <span class="status-text">在线</span>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="6" :lg="6" class="el-col">
          <StatsCard title="文章总数" :value="stats.totalPosts" :icon="Document" color="#409eff" :trend="stats.postsTrend"
            :loading="loading.stats" />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6" class="el-col">
          <StatsCard title="今日新增" :value="stats.todayPosts" :icon="Plus" color="#67c23a" :trend="stats.todayTrend"
            :loading="loading.stats" />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6" class="el-col">
          <StatsCard title="分类数量" :value="stats.totalCategories" :icon="Folder" color="#e6a23c"
            :trend="stats.categoriesTrend" :loading="loading.stats" />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6" class="el-col">
          <StatsCard title="标签数量" :value="stats.totalTags" :icon="PriceTag" color="#f56c6c" :trend="stats.tagsTrend"
            :loading="loading.stats" />
        </el-col>
      </el-row>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <el-row :gutter="20">
        <!-- 左侧：最近文章和访问统计 -->
        <el-col :xs="24" :lg="16">
          <!-- 最近文章 -->
          <el-card class="recent-posts-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  最近文章
                </span>
                <el-button type="primary" link @click="$router.push('/blogs')">
                  查看全部
                </el-button>
              </div>
            </template>

            <div class="recent-posts-list">
              <div v-if="loading.recentPosts" class="loading-container">
                <el-skeleton :rows="5" animated />
              </div>

              <div v-else-if="recentPosts.length === 0" class="empty-data">
                <el-empty description="暂无文章" />
              </div>

              <div v-else class="posts-container">
                <div v-for="post in recentPosts" :key="post.id" class="post-item" @click="handleEditPost(post.id)">
                  <div class="post-content">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <div class="post-meta">
                      <span class="meta-item">
                        <el-icon>
                          <Calendar />
                        </el-icon>
                        {{ formatDate(post.createdAt, 'MM-DD HH:mm') }}
                      </span>
                      <span class="meta-item">
                        <el-icon>
                          <View />
                        </el-icon>
                        {{ post.views }}
                      </span>
                      <span class="meta-item">
                        <el-icon>
                          <Star />
                        </el-icon>
                        {{ post.likes }}
                      </span>
                      <el-tag size="small" :type="post.status === 'published' ? 'success' : 'info'" class="status-tag">
                        {{ post.status === 'published' ? '已发布' : '草稿' }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="post-actions">
                    <el-button size="small" link @click.stop="handleEditPost(post.id)">
                      编辑
                    </el-button>
                    <el-dropdown trigger="click" @command="handlePostAction($event, post)">
                      <el-button size="small" link>
                        <el-icon>
                          <More />
                        </el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="view">
                            <el-icon>
                              <View />
                            </el-icon>
                            预览
                          </el-dropdown-item>
                          <el-dropdown-item command="publish" v-if="post.status === 'draft'">
                            <el-icon>
                              <Promotion />
                            </el-icon>
                            发布
                          </el-dropdown-item>
                          <el-dropdown-item command="unpublish" v-if="post.status === 'published'">
                            <el-icon>
                              <Hide />
                            </el-icon>
                            取消发布
                          </el-dropdown-item>
                          <el-dropdown-item command="delete" divided>
                            <el-icon>
                              <Delete />
                            </el-icon>
                            删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 访问统计 -->
          <el-card class="visit-stats-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon>
                    <DataAnalysis />
                  </el-icon>
                  访问统计
                </span>
                <div class="date-range-selector">
                  <el-radio-group v-model="visitStatsRange" size="small" @change="handleVisitStatsRangeChange">
                    <el-radio-button value="week">近7天</el-radio-button>
                    <el-radio-button value="month">近30天</el-radio-button>
                    <el-radio-button value="quarter">近90天</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>

            <div class="visit-stats-content">
              <div v-if="loading.visitStats" class="loading-container">
                <el-skeleton :rows="3" animated />
              </div>

              <div v-else class="stats-chart">
                <VisitStatsChart :data="visitStatsData" :loading="loading.visitStats" />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：快捷操作和系统状态 -->
        <el-col :xs="24" :lg="8">
          <!-- 快捷操作 -->
          <el-card class="quick-actions-card" shadow="never">
            <template #header>
              <span class="card-title">
                <el-icon>
                  <Operation />
                </el-icon>
                快捷操作
              </span>
            </template>

            <div class="quick-actions-grid">
              <div v-for="action in quickActions" :key="action.key" class="action-item"
                @click="handleQuickAction(action)">
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <el-icon :size="20">
                    <component :is="action.icon" />
                  </el-icon>
                </div>
                <span class="action-text">{{ action.text }}</span>
              </div>
            </div>
          </el-card>

          <!-- 系统状态 -->
          <el-card class="system-status-card" shadow="never">
            <template #header>
              <span class="card-title">
                <el-icon>
                  <Monitor />
                </el-icon>
                系统状态
              </span>
            </template>

            <div class="system-status-list">
              <div class="status-item">
                <span class="status-label">服务器时间</span>
                <span class="status-value">{{ currentTime }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">系统版本</span>
                <span class="status-value">v{{ appVersion }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">API状态</span>
                <span class="status-value">
                  <el-tag size="small" :type="apiStatus.online ? 'success' : 'danger'">
                    {{ apiStatus.online ? '正常' : '异常' }}
                  </el-tag>
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">数据库状态</span>
                <span class="status-value">
                  <el-tag size="small" :type="dbStatus.online ? 'success' : 'danger'">
                    {{ dbStatus.online ? '正常' : '异常' }}
                  </el-tag>
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">内存使用</span>
                <div class="progress-container">
                  <el-progress :percentage="systemStatus.memory.percentage"
                    :color="getProgressColor(systemStatus.memory.percentage)" :show-text="false" />
                  <span class="progress-text">
                    {{ systemStatus.memory.used }} / {{ systemStatus.memory.total }}
                  </span>
                </div>
              </div>
              <div class="status-item">
                <span class="status-label">磁盘使用</span>
                <div class="progress-container">
                  <el-progress :percentage="systemStatus.disk.percentage"
                    :color="getProgressColor(systemStatus.disk.percentage)" :show-text="false" />
                  <span class="progress-text">
                    {{ systemStatus.disk.used }} / {{ systemStatus.disk.total }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 待办事项 -->
          <el-card class="todo-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon>
                    <List />
                  </el-icon>
                  待办事项
                </span>
                <el-button size="small" link @click="handleAddTodo">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </el-button>
              </div>
            </template>

            <div class="todo-list">
              <div v-if="loading.todos" class="loading-container">
                <el-skeleton :rows="3" animated />
              </div>

              <div v-else-if="todos.length === 0" class="empty-todos">
                <p>暂无待办事项</p>
              </div>

              <div v-else>
                <div v-for="todo in todos" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
                  <el-checkbox v-model="todo.completed" @change="handleTodoToggle()" />
                  <span class="todo-text" @click="handleTodoToggle()">
                    {{ todo.text }}
                  </span>
                  <el-button size="small" text circle @click="handleDeleteTodo(todo)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <div class="todo-input" v-if="showTodoInput">
                <el-input v-model="newTodoText" placeholder="输入待办事项" size="small" @keyup.enter="handleTodoSave"
                  @blur="showTodoInput = false">
                  <template #append>
                    <el-button size="small" @click="handleTodoSave">
                      保存
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 底部信息 -->
    <div class="footer-section">
      <p class="footer-text">
        <el-icon>
          <InfoFilled />
        </el-icon>
        最后更新: {{ formatDate(lastUpdate, 'YYYY-MM-DD HH:mm:ss') }}
        | 文章总数: {{ stats.totalPosts }} | 今日访问: {{ stats.todayVisits }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Plus,
  Folder,
  PriceTag,
  Clock,
  Calendar,
  View,
  Star,
  More,
  Hide,
  Delete,
  Operation,
  DataAnalysis,
  Monitor,
  List,
  Promotion,
  InfoFilled,
  Setting,
  // UserFilled,
  // UploadFilled,
  CollectionTag,
  ChatDotRound,
  Bell
} from '@element-plus/icons-vue'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import VisitStatsChart from '@/components/dashboard/VisitStatsChart.vue'
import { useAuthStore } from '@/stores/auth'
import { useBlogStore } from '@/stores/blog'
import { useCategoryStore } from '@/stores/category'
import { useTagStore } from '@/stores/tag'
import { formatDate } from '@/utils/common'
import { Blog } from '@/types/blog'
import type { VisitStat } from '@/types/stat'

const router = useRouter()
const authStore = useAuthStore()
const blogStore = useBlogStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const userInfo = computed(() => authStore.userInfo)
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// 当前日期和时间
const currentDate = ref('')
const currentTime = ref('')
let timeInterval: number

// 加载状态
const loading = reactive({
  stats: true,
  recentPosts: true,
  visitStats: true,
  todos: false
})

// 统计数据
const stats = reactive({
  totalPosts: 0,
  todayPosts: 0,
  totalCategories: 0,
  totalTags: 0,
  todayVisits: 0,
  postsTrend: 0,
  todayTrend: 0,
  categoriesTrend: 0,
  tagsTrend: 0
})

// 最近文章
const recentPosts = ref<Blog[]>([])

// 访问统计
const visitStatsRange = ref<'week' | 'month' | 'quarter'>('week')
const visitStatsData = ref<VisitStat>({
  labels: [''],
  visits: [0],
  pageviews: [0]
})

// 系统状态
const apiStatus = reactive({ online: true })
const dbStatus = reactive({ online: true })
const systemStatus = reactive({
  memory: {
    used: '1.2 GB',
    total: '4.0 GB',
    percentage: 30
  },
  disk: {
    used: '12.5 GB',
    total: '50.0 GB',
    percentage: 25
  }
})

// 待办事项
const todos = ref<any[]>([
  { id: 1, text: '完善仪表板统计数据', completed: false },
  { id: 2, text: '优化文章编辑器的体验', completed: true },
  { id: 3, text: '添加评论管理功能', completed: false },
  { id: 4, text: '准备系统更新文档', completed: false }
])
const showTodoInput = ref(false)
const newTodoText = ref('')

// 快捷操作
const quickActions = [
  { key: 'write', text: '写文章', icon: Document, color: '#409eff' },
  { key: 'comments', text: '评论管理', icon: ChatDotRound, color: '#3498db' },
  // { key: 'upload', text: '上传文件', icon: UploadFilled, color: '#67c23a' },
  { key: 'category', text: '管理分类', icon: Folder, color: '#e6a23c' },
  { key: 'tag', text: '管理标签', icon: CollectionTag, color: '#f56c6c' },
  // { key: 'users', text: '用户管理', icon: UserFilled, color: '#9b59b6' },
  { key: 'notifications', text: '消息通知', icon: Bell, color: '#2ecc71' },
  { key: 'settings', text: '系统设置', icon: Setting, color: '#909399' },
]

// 最后更新时间
const lastUpdate = ref(Date.now())

// 初始化
onMounted(() => {
  initDateTime()
  fetchDashboardData()
  startTimeUpdate()
  startHealthCheck()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 初始化日期时间
const initDateTime = () => {
  const now = new Date()
  currentDate.value = formatDate(now, 'YYYY年MM月DD日 dddd')
  currentTime.value = formatDate(now, 'HH:mm:ss')
}

// 更新时间
const startTimeUpdate = () => {
  timeInterval = setInterval(() => {
    currentTime.value = formatDate(new Date(), 'HH:mm:ss')
  }, 1000)
}

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 24) return '晚上好'
  return '你好'
}

// 获取仪表板数据
const fetchDashboardData = async () => {
  try {
    await Promise.all([
      fetchStats(),
      fetchRecentPosts(),
      fetchVisitStats()
    ])
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}

// 获取统计数据
const fetchStats = async () => {
  loading.stats = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 获取博客数据
    await blogStore.fetchBlogs({ current: 1, size: 1 })
    stats.totalPosts = blogStore.total
    stats.todayPosts = Math.floor(Math.random() * 10) // 模拟今日新增
    stats.postsTrend = Math.floor(Math.random() * 20) - 10 // -10到10的随机趋势

    // 获取分类数据
    await categoryStore.fetchCategories()
    stats.totalCategories = categoryStore.categories.length
    stats.categoriesTrend = Math.floor(Math.random() * 5) // 0到5的随机趋势

    // 获取标签数据
    await tagStore.fetchTags()
    stats.totalTags = tagStore.tags.length
    stats.tagsTrend = Math.floor(Math.random() * 8) // 0到8的随机趋势

    // 模拟其他数据
    stats.todayVisits = Math.floor(Math.random() * 1000)
    stats.todayTrend = Math.floor(Math.random() * 30) - 15 // -15到15的随机趋势
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.stats = false
  }
}

// 获取最近文章
const fetchRecentPosts = async () => {
  loading.recentPosts = true
  try {
    await blogStore.fetchBlogs({
      current: 1,
      size: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    recentPosts.value = blogStore.blogs.slice(0, 5)
  } catch (error) {
    console.error('获取最近文章失败:', error)
  } finally {
    loading.recentPosts = false
  }
}

// 获取访问统计
const fetchVisitStats = async () => {
  loading.visitStats = true
  try {
    // 模拟访问统计数据
    await new Promise(resolve => setTimeout(resolve, 800))

    const days = visitStatsRange.value === 'week' ? 7 :
      visitStatsRange.value === 'month' ? 30 : 90

    visitStatsData.value = {
      labels: Array.from({ length: days }, (_, i) =>
        formatDate(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000, 'MM-DD')
      ),
      visits: Array.from({ length: days }, () => Math.floor(Math.random() * 1000)),
      pageviews: Array.from({ length: days }, () => Math.floor(Math.random() * 5000))
    }
  } catch (error) {
    console.error('获取访问统计失败:', error)
  } finally {
    loading.visitStats = false
  }
}

// 健康检查
const startHealthCheck = () => {
  // 模拟API健康检查
  setInterval(async () => {
    try {
      // 这里应该调用实际的健康检查API
      apiStatus.online = Math.random() > 0.1 // 90%在线率
      dbStatus.online = Math.random() > 0.05 // 95%在线率

      // 模拟系统资源使用情况
      systemStatus.memory.percentage = Math.floor(Math.random() * 30) + 20 // 20-50%
      systemStatus.disk.percentage = Math.floor(Math.random() * 20) + 10 // 10-30%
    } catch (error) {
      console.error('健康检查失败:', error)
    }
  }, 30000) // 每30秒检查一次
}

// 进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 事件处理函数
const handleCreateBlog = () => {
  router.push('/blog/create')
}

const handleQuickNavigate = () => {
  ElMessage.info('快速导航功能开发中')
}

const handleEditPost = (id: string | number) => {
  router.push(`/blog/edit/${id}`)
}

const handlePostAction = (command: string, post: any) => {
  switch (command) {
    case 'view':
      // 在新窗口打开预览
      window.open(`/blog/${post.id}`, '_blank')
      break
    case 'publish':
      handlePublishPost(post.id)
      break
    case 'unpublish':
      handleUnpublishPost(post.id)
      break
    case 'delete':
      handleDeletePost(post.id)
      break
  }
}

const handlePublishPost = async (id: string | number) => {
  try {
    await blogStore.updateBlog(id, { status: 'published' })
    ElMessage.success('发布成功')
    fetchRecentPosts()
    fetchStats()
  } catch (error) {
    console.error('发布失败:', error)
  }
}

const handleUnpublishPost = async (id: string | number) => {
  try {
    await blogStore.updateBlog(id, { status: 'draft' })
    ElMessage.success('已取消发布')
    fetchRecentPosts()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDeletePost = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      type: 'warning'
    })

    await blogStore.deleteBlog(id)
    ElMessage.success('删除成功')
    fetchRecentPosts()
    fetchStats()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleVisitStatsRangeChange = () => {
  fetchVisitStats()
}

const handleQuickAction = (action: any) => {
  const routes: Record<string, string> = {
    write: '/blog/create',
    category: '/categories',
    tag: '/tags',
    settings: '/settings',
    users: '/users',
    comments: '/comments'
  }

  if (routes[action.key]) {
    router.push(routes[action.key])
  } else {
    ElMessage.info(`${action.text}功能开发中`)
  }
}

const handleAddTodo = () => {
  showTodoInput.value = true
}

const handleTodoToggle = async () => {
  // 这里应该调用API更新待办事项状态
  await new Promise(resolve => setTimeout(resolve, 300))
  ElMessage.success('待办事项已更新')
}

const handleTodoSave = () => {
  if (!newTodoText.value.trim()) return

  const newTodo = {
    id: Date.now(),
    text: newTodoText.value,
    completed: false
  }

  todos.value.unshift(newTodo)
  newTodoText.value = ''
  showTodoInput.value = false

  ElMessage.success('已添加待办事项')
}

const handleDeleteTodo = async (todo: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个待办事项吗？', '提示')

    todos.value = todos.value.filter(t => t.id !== todo.id)
    ElMessage.success('已删除待办事项')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 用户取消删除
  }
}

// 监听访问统计范围变化
watch(visitStatsRange, () => {
  fetchVisitStats()
})
</script>

<style lang="scss" scoped>
// 响应式变量
$breakpoint-mobile: 768px;
$breakpoint-tablet: 992px;
$breakpoint-desktop: 1200px;

.dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: $breakpoint-mobile) {
    padding: 12px;
  }
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }

  .welcome-content {
    flex: 1;

    .welcome-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;

      @media (max-width: $breakpoint-mobile) {
        font-size: 22px;
      }
    }

    .welcome-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 20px;

      @media (max-width: $breakpoint-mobile) {
        font-size: 14px;
      }
    }

    .welcome-actions {
      display: flex;
      gap: 12px;

      @media (max-width: $breakpoint-mobile) {
        justify-content: center;
      }

      .el-button {
        @media (max-width: $breakpoint-mobile) {
          font-size: 12px;
          padding: 8px 16px;
        }
      }
    }
  }

  .user-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;

    @media (max-width: $breakpoint-mobile) {
      display: none;
    }

    .user-status {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 12px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;

        &.online {
          background-color: #52c41a;
        }
      }
    }
  }
}

.stats-section {
  margin-bottom: 24px;

  .el-col {
    @media (max-width: $breakpoint-mobile) {
      margin-bottom: 12px;
    }
  }
}

.content-section {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
}

.recent-posts-card,
.visit-stats-card,
.quick-actions-card,
.system-status-card,
.todo-card {
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
}

.system-status-card,
.visit-stats-card,
.todo-card {
  display: none;

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

.recent-posts-list {
  .loading-container {
    padding: 20px;
  }

  .empty-data {
    padding: 40px 20px;
    text-align: center;
  }

  .posts-container {
    .post-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #fafafa;
      }

      .post-content {
        flex: 1;
        min-width: 0;

        .post-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: #666;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .status-tag {
            margin-left: auto;
          }
        }
      }

      .post-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
}

.visit-stats-content {
  .loading-container {
    padding: 40px 20px;
  }

  .stats-chart {
    height: 300px;
  }
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 12px;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #409eff;
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      .el-icon {
        color: white;
      }
    }

    .action-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      text-align: center;
    }
  }
}

.system-status-list {
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .status-label {
      font-size: 14px;
      color: #666;
    }

    .status-value {
      font-weight: 500;
      color: #333;
    }

    .progress-container {
      width: 150px;
      display: flex;
      align-items: center;
      gap: 8px;

      .progress-text {
        font-size: 12px;
        color: #999;
        min-width: 60px;
        text-align: right;
      }
    }
  }
}

.todo-list {
  .loading-container {
    padding: 20px;
  }

  .empty-todos {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .todo-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.completed {
      .todo-text {
        text-decoration: line-through;
        color: #999;
      }
    }

    .todo-text {
      flex: 1;
      margin-left: 12px;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .todo-input {
    margin-top: 16px;
  }
}

.footer-section {
  display: none;
  margin-top: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }

  .footer-text {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}
</style>