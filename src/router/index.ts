import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { ElMessage } from 'element-plus';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashIndex.vue'),
        meta: { title: '仪表板', icon: 'dashboard' }
      },
      {
        path: 'blogs',
        name: 'BlogList',
        component: () => import('@/views/blog/BlogList.vue'),
        meta: { title: '博客管理', icon: 'document' }
      },
      {
        path: 'blog/create',
        name: 'BlogCreate',
        component: () => import('@/views/blog/BlogEditor.vue'),
        meta: { title: '创建博客', hidden: true }
      },
      {
        path: 'blog/edit/:id',
        name: 'BlogEdit',
        component: () => import('@/views/blog/BlogEditor.vue'),
        meta: { title: '编辑博客', hidden: true }
      },
      {
        path: 'categories',
        name: 'CategoryList',
        component: () => import('@/views/category/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'folder' }
      },
      {
        path: 'tags',
        name: 'TagList',
        component: () => import('@/views/tag/TagList.vue'),
        meta: { title: '标签管理', icon: 'price-tag' }
      },
      {
        path: 'comments',
        name: 'CommentList',
        component: () => import('@/views/comment/CommentList.vue'),
        meta: { title: '评论管理', icon: 'ChatDotRound' }
      },
      {
        path: 'comments/pending',
        name: 'CommentPending',
        component: () => import('@/views/comment/CommentList.vue'),
        meta: { title: '待审核评论', query: { status: 'pending' } }
      },
      {
        path: 'comments/spam',
        name: 'CommentSpam',
        component: () => import('@/views/comment/CommentList.vue'),
        meta: { title: '垃圾评论', query: { status: 'spam' } }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SetIndex.vue'),
        // component: () => import('@/views/settings/SystemConfig.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !token) {
    ElMessage.warning('请先登录');
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;