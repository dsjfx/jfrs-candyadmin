<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="sidebar"
        :class="{ 'sidebar-collapsed': isCollapse, 'sidebar-mobile': isMobile }">
        <!-- 移动端遮罩层 -->
        <div v-if="isMobile && !isCollapse" class="sidebar-mask" @click="toggleCollapse"></div>

        <div class="logo-container">
          <div class="logo" @click="goHome">
            <!-- <img v-if="!isCollapse" src="/logo.svg" alt="Logo" class="logo-img" /> -->
            <h2 v-if="!isCollapse && !isMobile" class="logo-text"> {{ appName }}</h2>
            <h2 v-else-if="!isCollapse && isMobile" class="logo-text">
              糖果
              <el-button text v-if="isMobile" :icon="Fold" @click="toggleCollapse" class="collapse-btn" />
            </h2>
            <h3 v-else class="logo-text-mini">糖果</h3>
          </div>
        </div>

        <div class="sidebar-content">
          <Sidebar :is-collapse="isCollapse" @close-menu="handlerClose" />
        </div>

        <!-- 侧边栏底部信息 -->
        <div class="sidebar-footer" v-if="!isCollapse">
          <div class="version-info">
            <span>版本 v{{ appVersion }}</span>
          </div>
        </div>
      </el-aside>

      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="header" :class="{ 'header-mobile': isMobile }">
          <div class="header-left">
            <!-- 折叠按钮 -->
            <el-button text :icon="isCollapse ? Expand : Fold" @click="toggleCollapse" class="collapse-btn" />

            <!-- 面包屑导航（桌面端显示） -->
            <el-breadcrumb separator="/" class="breadcrumb" v-if="!isMobile">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                {{ item.meta?.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <!-- 搜索按钮（移动端） -->
            <el-button text class="mobile-search-btn" @click="showSearch = true" v-if="isMobile">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>

            <!-- 全屏按钮 -->
            <el-tooltip content="全屏" placement="bottom">
              <el-button text @click="toggleFullScreen">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </el-button>
            </el-tooltip>

            <!-- 消息通知 -->
            <el-dropdown trigger="click" @command="handleNotificationCommand">
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
                <el-button text>
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-button>
              </el-badge>
              <template #dropdown>
                <el-dropdown-menu class="notification-dropdown">
                  <div class="notification-header">
                    <span>消息通知</span>
                    <el-link type="primary" underline="never" @click="markAllRead">
                      全部已读
                    </el-link>
                  </div>
                  <div class="notification-list">
                    <div v-for="item in notifications" :key="item.id" class="notification-item">
                      <div class="notification-content">{{ item.content }}</div>
                      <div class="notification-time">{{ formatTime(item.time) }}</div>
                    </div>
                    <div v-if="notifications.length === 0" class="notification-empty">
                      暂无通知
                    </div>
                  </div>
                  <div class="notification-footer">
                    <el-link type="primary" underline="never">查看更多</el-link>
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 用户菜单 -->
            <el-dropdown @command="handleCommand" class="user-dropdown">
              <span class="user-info">
                <el-avatar :size="32" :src="userAvatar" class="user-avatar">
                  {{ userName.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="username" v-if="!isMobile">{{ userName }}</span>
                <el-icon class="arrow-icon">
                  <ArrowDown />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon>
                      <User />
                    </el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon>
                      <Setting />
                    </el-icon>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon>
                      <SwitchButton />
                    </el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 标签页导航（可选） -->
        <div class="tabs-view" v-if="showTabs && !isMobile">
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick" @tab-remove="handleTabRemove">
            <el-tab-pane v-for="tab in visitedTabs" :key="tab.path" :label="tab.title" :name="tab.path"
              :closable="tab.path !== '/'" />
          </el-tabs>
        </div>

        <!-- 主要内容 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>

        <!-- 底部版权信息（移动端隐藏） -->
        <el-footer class="footer" v-if="!isMobile">
          <span>© {{ currentYear }} {{ appName }}. All rights reserved.</span>
          <!-- <span class="footer-right">
            <el-link type="primary" underline="never">关于我们</el-link>
            <el-link type="primary" underline="never">联系我们</el-link>
            <el-link type="primary" underline="never">帮助中心</el-link>
          </span> -->
        </el-footer>
      </el-container>
    </el-container>

    <!-- 移动端搜索对话框 -->
    <el-drawer v-model="showSearch" title="搜索" direction="ttb" size="auto" :with-header="true"
      class="mobile-search-drawer">
      <el-input v-model="searchKeyword" placeholder="搜索文章、分类、标签..." size="large" clearable @keyup.enter="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <div class="search-history" v-if="searchHistory.length > 0">
        <div class="search-history-header">
          <span>搜索历史</span>
          <el-link type="danger" underline="never" @click="clearSearchHistory">清空</el-link>
        </div>
        <div class="search-history-list">
          <el-tag v-for="item in searchHistory" :key="item" size="small" @click="searchKeyword = item; handleSearch()">
            {{ item }}
          </el-tag>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, TabPaneName } from 'element-plus';
import {
  Expand, Fold, FullScreen, Bell, User, Setting,
  SwitchButton, ArrowDown, Search
} from '@element-plus/icons-vue'
import Sidebar from '@/components/layout/Sidebar.vue';

const route = useRoute();
const router = useRouter();

// 响应式状态
const isCollapse = ref(false);
const isMobile = ref(false);
const showSearch = ref(false)
const searchKeyword = ref('')
const showTabs = ref(true)
const activeTab = ref('')

// 侧边栏宽度
const sidebarWidth = computed(() => {
  if (isMobile.value) return '150px'
  return isCollapse.value ? '64px' : '240px'
})

// 面包屑
const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta?.title);
});

const appName = computed(() => {
  const titleMaster = import.meta.env.VITE_APP_TITLE_MASTER || '糖果'
  const titleSlave = import.meta.env.VITE_APP_TITLE_SLAVE || '管理平台'
  const title = `${titleMaster} · ${titleSlave}`
  return title || '糖果管理平台'
})

// 用户信息
const userInfoStr = localStorage.getItem('user_info');
const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
const userName = userInfo?.nickname;
const userAvatar = userInfo?.avatar;
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
const currentYear = new Date().getFullYear()

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 通知相关
const unreadCount = ref(3)
const notifications = ref([
  { id: 1, content: '您有一条新评论待审核', time: Date.now() - 1000 * 60 * 5 },
  { id: 2, content: '系统将在今晚进行维护', time: Date.now() - 1000 * 60 * 60 },
  { id: 3, content: '欢迎使用博客管理系统', time: Date.now() - 1000 * 60 * 60 * 24 }
])

// 搜索历史
const searchHistory = ref<string[]>([])

// 缓存的视图
const cachedViews = ref<string[]>([])

// 访问过的标签页
const visitedTabs = ref([
  { path: '/', title: '仪表板', name: 'Dashboard' }
])

// 检测屏幕宽度
const checkScreenWidth = () => {
  const width = window.innerWidth
  isMobile.value = width < 768

  // 小屏幕自动折叠侧边栏
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 监听路由变化，更新标签页
watch(() => route.path, (newPath) => {
  const tab = visitedTabs.value.find(t => t.path === newPath)
  if (!tab && newPath !== '/login') {
    visitedTabs.value.push({
      path: newPath,
      title: route.meta?.title as string || '未知',
      name: route.name as string
    })
  }
  activeTab.value = newPath
})

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen()
    ElMessage.success('已退出全屏模式')
  }
}

// 返回首页
const goHome = () => {
  if (!isMobile.value)
    router.push('/')
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    }).then(() => {
      // authStore.logout()
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      router.push('/login');
      ElMessage.success('已退出登录')
    });
  } else if (command === 'profile') {
    // 跳转到个人中心
    // console.log('个人中心');
    router.push({
      path: '/settings',
      state: { from: 'profile' }
    });
  } else if (command === 'settings') {
    router.push('/settings')
  }
};

// 通知命令
const handleNotificationCommand = () => { }

// 全部已读
const markAllRead = () => {
  unreadCount.value = 0
  ElMessage.success('已标记所有通知为已读')
}

// 标签页点击
const handleTabClick = (tab: any) => {
  router.push(tab.props.name)
}

// 标签页关闭
const handleTabRemove = (name: TabPaneName) => {
  const index = visitedTabs.value.findIndex(t => t.path === name)
  if (index !== -1) {
    visitedTabs.value.splice(index, 1)
    if (route.path === name && visitedTabs.value.length > 0) {
      router.push(visitedTabs.value[visitedTabs.value.length - 1].path)
    }
  }
}

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return

  // 保存搜索历史
  if (!searchHistory.value.includes(searchKeyword.value)) {
    searchHistory.value.unshift(searchKeyword.value)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  // 执行搜索
  router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
  showSearch.value = false
  searchKeyword.value = ''
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
  ElMessage.success('搜索历史已清空')
}

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

const handlerClose = () => {
  if (isMobile.value) {
    toggleCollapse()
  }
}

onMounted(() => {
  checkScreenWidth()
  window.addEventListener('resize', checkScreenWidth)
  loadSearchHistory()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenWidth)
})
</script>

<style lang="scss" scoped>
// 响应式变量
$breakpoint-mobile: 768px;
$breakpoint-tablet: 992px;

.admin-layout {
  height: 100vh;
  overflow: hidden;

  @media (max-width: $breakpoint-mobile) {
    height: 100%;
    min-height: 100vh;
  }
}

// 侧边栏样式
.sidebar {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  background-color: #667eea;
  color: #fff;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  overflow-x: hidden;

  @media (max-width: $breakpoint-mobile) {
    position: fixed;
    left: 0;
    top: 0;
    height: calc(100vh - 40px);
    z-index: 1002;
    transform: translateX(0);
    transition: transform 0.3s ease;

    &.sidebar-collapsed {
      transform: translateX(-100%);
    }
  }

  .sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-img {
        width: 32px;
        height: 32px;
      }

      .logo-text {
        margin: 0;
        color: #fff;
        font-size: 2rem;
        font-weight: 600;
        white-space: nowrap;

        @media (max-width: $breakpoint-mobile) {
          font-size: 16px;
        }
      }

      .logo-text-mini {
        margin: 0;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .sidebar-content {
    height: 100%;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;

    .version-info {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 主容器
.main-container {
  // display: flex;
  // flex-direction: column;
  // overflow: hidden;
  // background-color: #f5f7fa;
  height: 100vh;
  overflow-y: auto; // 主内容区域滚动
  overflow-x: hidden;
}

// 头部样式
.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;

  @media (max-width: $breakpoint-mobile) {
    padding: 0 12px;
    height: 50px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;

      @media (max-width: $breakpoint-mobile) {
        font-size: 18px;
      }
    }

    .breadcrumb {
      :deep(.el-breadcrumb__inner) {
        font-size: 14px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: $breakpoint-mobile) {
      gap: 8px;
    }

    .mobile-search-btn {
      .el-icon {
        font-size: 18px;
      }
    }

    .notification-badge {
      :deep(.el-badge__content) {
        top: 8px;
        right: 8px;
      }
    }

    .user-dropdown {
      cursor: pointer;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .user-avatar {
          background: #409eff;
          color: #fff;
          font-weight: 500;
        }

        .username {
          font-size: 14px;
          color: #333;

          @media (max-width: $breakpoint-mobile) {
            display: none;
          }
        }

        .arrow-icon {
          font-size: 12px;
          color: #909399;

          @media (max-width: $breakpoint-mobile) {
            display: none;
          }
        }
      }
    }
  }
}

// 标签页样式
.tabs-view {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav) {
    border: none;
  }

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;

    &.is-active {
      color: #409eff;
    }
  }
}

// 主要内容区域
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  @media (max-width: $breakpoint-mobile) {
    padding: 12px;
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

// 底部样式
.footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 50px;
  font-size: 12px;
  color: #909399;

  .footer-right {
    display: flex;
    gap: 20px;
  }
}

// 通知下拉菜单样式
.notification-dropdown {
  width: 320px;

  @media (max-width: $breakpoint-mobile) {
    width: 280px;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 500;
  }

  .notification-list {
    max-height: 300px;
    overflow-y: auto;

    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      .notification-content {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      }

      .notification-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .notification-empty {
      padding: 40px;
      text-align: center;
      color: #909399;
    }
  }

  .notification-footer {
    padding: 12px 16px;
    text-align: center;
    border-top: 1px solid #e4e7ed;
  }
}

// 移动端搜索抽屉
.mobile-search-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 20px;
    padding: 16px 20px;
  }

  :deep(.el-drawer__body) {
    padding: 20px;
  }

  .search-history {
    margin-top: 20px;

    .search-history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }

    .search-history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-tag {
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #409eff;
          color: #fff;
        }
      }
    }
  }
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 移动端适配
@media (max-width: $breakpoint-mobile) {
  .header-right {
    .el-button.text {
      .el-icon {
        font-size: 18px;
      }
    }
  }

  .footer {
    display: none;
  }
}

// 平板适配
@media (min-width: ($breakpoint-mobile + 1)) and (max-width: $breakpoint-tablet) {
  .sidebar {
    width: 200px !important;

    &.sidebar-collapsed {
      width: 60px !important;
    }
  }

  .main-content {
    padding: 16px;
  }
}
</style>