<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppName } from '@/composables/useAppName'

const router = useRouter();

onMounted(() => {
  const { appName } = useAppName('管理系统');

  // 监听路由变化，更新页面标题
  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} - ${appName.value}` : appName.value;
  });
});
</script>