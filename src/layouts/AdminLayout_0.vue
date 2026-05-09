<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'">
        <div class="logo">
          <h2 v-if="!isCollapse">{{ appName }}</h2>
          <h3 v-else>Blog</h3>
        </div>
        <Sidebar :is-collapse="isCollapse" />
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header>
          <div class="header-left">
            <el-button text :icon="isCollapse ? 'Expand' : 'Fold'" @click="toggleCollapse" />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                {{ item.meta?.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="username">{{ userName }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import Sidebar from '@/components/layout/Sidebar.vue';

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta?.title);
});

const userInfoStr = localStorage.getItem('user_info');
const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

const appName = import.meta.env.VITE_APP_TITLE || '博客管理系统'
const userName = userInfo?.nickname;
const userAvatar = userInfo?.avatar;

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      router.push('/login');
    });
  } else if (command === 'profile') {
    // 跳转到个人中心
    // console.log('个人中心');
    router.push({
      path: '/settings',
      state: { from: 'profile' }
    });
  }
};

onMounted(() => {

})
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;

  .el-aside {
    height: 100vh;
    background-color: #001529;
    color: #fff;
    transition: width 0.3s;
    overflow-x: hidden;
    overflow-y: hidden;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2,
      h3 {
        margin: 0;
        color: #fff;
      }
    }
  }

  .el-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7ed;
    background: #fff;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .username {
          font-weight: 500;
        }
      }
    }
  }

  .el-main {
    background-color: #f5f7fa;
    padding: 20px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>