<template>
  <el-menu :default-active="activeMenu" :collapse="isCollapse" router class="sidebar-menu" @select="handleSelect">
    <!-- 仪表板 -->
    <el-menu-item index="/">
      <el-icon>
        <Odometer />
      </el-icon>
      <template #title>仪表板</template>
    </el-menu-item>

    <!-- 文章管理 -->
    <el-menu-item index="/blogs">
      <el-icon>
        <Document />
      </el-icon>
      <template #title>博客管理</template>
    </el-menu-item>

    <!-- 分类管理 -->
    <el-menu-item index="/categories">
      <el-icon>
        <Folder />
      </el-icon>
      <template #title>分类管理</template>
    </el-menu-item>

    <el-menu-item index="/tags">
      <el-icon>
        <PriceTag />
      </el-icon>
      <template #title>标签管理</template>
    </el-menu-item>

    <!-- 评论管理 -->
    <el-sub-menu index="comments">
      <template #title>
        <el-icon>
          <ChatDotRound />
        </el-icon>
        <span>评论管理</span>
      </template>
      <el-menu-item index="/comments">
        <el-icon>
          <ChatLineRound />
        </el-icon>
        <span>全部评论</span>
      </el-menu-item>
      <el-menu-item index="/comments/pending">
        <el-icon>
          <Clock />
        </el-icon>
        <span>待审核</span>
        <el-badge :value="pendingCount" class="menu-badge" v-if="pendingCount > 0" />
      </el-menu-item>
      <el-menu-item index="/comments/spam">
        <el-icon>
          <Warning />
        </el-icon>
        <span>垃圾评论</span>
        <el-badge :value="spamCount" class="menu-badge" v-if="spamCount > 0" />
      </el-menu-item>
    </el-sub-menu>

    <!-- 系统设置 -->
    <el-menu-item index="/settings" v-if="!isMobile">
      <el-icon>
        <Setting />
      </el-icon>
      <template #title>系统设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutSidebar'
})

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Document,
  Folder,
  PriceTag,
  Setting
} from '@element-plus/icons-vue'
import { checkScreenWidth } from '@/utils/common'

interface Props {
  isCollapse?: boolean
}

withDefaults(defineProps<Props>(), {
  isCollapse: false
})

const emit = defineEmits<{
  'close-menu': []
}>()

const route = useRoute()
const activeMenu = ref(route.path)
const pendingCount = ref(10)
const spamCount = ref(3)

const isMobile = checkScreenWidth();

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  emit('close-menu')
}

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  }
)
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.sidebar-menu {
  height: 100%;
  border-right: none;

  &:not(.el-menu--collapse) {
    width: 240px;

    @media (max-width: $breakpoint-mobile) {
      width: 100%;
      max-width: 100%;
    }
  }

  .el-menu-item {

    &.is-active {
      color: #409eff;
      background-color: #ecf5ff;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .el-icon {
    margin-right: 12px;
  }

}
</style>