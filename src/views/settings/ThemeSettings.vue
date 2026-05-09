<template>
  <div class="theme-settings">
    <h3 class="section-title">主题设置</h3>

    <!-- 主题切换 -->
    <el-card class="theme-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>主题切换</span>
        </div>
      </template>

      <div class="theme-grid">
        <div v-for="theme in themes" :key="theme.value" class="theme-item"
          :class="{ active: currentTheme === theme.value }" @click="currentTheme = theme.value">
          <div class="theme-preview" :style="{ background: theme.preview }">
            <div class="theme-preview-header" :style="{ background: theme.headerColor }"></div>
            <div class="theme-preview-sidebar" :style="{ background: theme.sidebarColor }"></div>
            <div class="theme-preview-content"></div>
          </div>
          <div class="theme-name">{{ theme.name }}</div>
          <el-icon v-if="currentTheme === theme.value" class="theme-check">
            <Check />
          </el-icon>
        </div>
      </div>
    </el-card>

    <!-- 颜色自定义 -->
    <el-card class="theme-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>颜色自定义</span>
        </div>
      </template>

      <el-form :model="customColors" label-width="100px">
        <el-form-item label="主题色">
          <el-color-picker v-model="customColors.primary" show-alpha />
        </el-form-item>

        <el-form-item label="背景色">
          <el-color-picker v-model="customColors.background" show-alpha />
        </el-form-item>

        <el-form-item label="文字色">
          <el-color-picker v-model="customColors.text" show-alpha />
        </el-form-item>

        <el-form-item label="边框色">
          <el-color-picker v-model="customColors.border" show-alpha />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 布局设置 -->
    <el-card class="theme-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>布局设置</span>
        </div>
      </template>

      <el-form :model="layoutSettings" label-width="120px">
        <el-form-item label="侧边栏宽度">
          <el-slider v-model="layoutSettings.sidebarWidth" :min="180" :max="300" show-input input-size="small" />
        </el-form-item>

        <el-form-item label="头部固定">
          <el-switch v-model="layoutSettings.fixedHeader" />
        </el-form-item>

        <el-form-item label="侧边栏固定">
          <el-switch v-model="layoutSettings.fixedSidebar" />
        </el-form-item>

        <el-form-item label="显示标签页">
          <el-switch v-model="layoutSettings.showTabs" />
        </el-form-item>

        <el-form-item label="面包屑导航">
          <el-switch v-model="layoutSettings.showBreadcrumb" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 动画设置 -->
    <el-card class="theme-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>动画设置</span>
        </div>
      </template>

      <el-form :model="animationSettings" label-width="120px">
        <el-form-item label="页面切换动画">
          <el-select v-model="animationSettings.pageTransition" placeholder="请选择">
            <el-option label="淡入淡出" value="fade" />
            <el-option label="滑动" value="slide" />
            <el-option label="缩放" value="scale" />
            <el-option label="无动画" value="none" />
          </el-select>
        </el-form-item>

        <el-form-item label="动画速度">
          <el-slider v-model="animationSettings.speed" :min="0.1" :max="1" :step="0.1" show-input input-size="small" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提交按钮 -->
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        保存主题
      </el-button>
      <el-button @click="handleReset">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const submitting = ref(false)
const currentTheme = ref('light')

const themes = [
  {
    name: '明亮主题',
    value: 'light',
    preview: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%)',
    headerColor: '#fff',
    sidebarColor: '#f5f7fa'
  },
  {
    name: '暗黑主题',
    value: 'dark',
    preview: 'linear-gradient(135deg, #1f2d3d 0%, #2c3e50 100%)',
    headerColor: '#2c3e50',
    sidebarColor: '#1f2d3d'
  },
  {
    name: '海洋主题',
    value: 'ocean',
    preview: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    headerColor: '#2193b0',
    sidebarColor: '#6dd5ed'
  },
  {
    name: '森林主题',
    value: 'forest',
    preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    headerColor: '#134e5e',
    sidebarColor: '#71b280'
  }
]

const customColors = reactive({
  primary: '#409eff',
  background: '#f5f7fa',
  text: '#303133',
  border: '#dcdfe6'
})

const layoutSettings = reactive({
  sidebarWidth: 240,
  fixedHeader: true,
  fixedSidebar: true,
  showTabs: true,
  showBreadcrumb: true
})

const animationSettings = reactive({
  pageTransition: 'fade',
  speed: 0.3
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const settings = {
      theme: currentTheme.value,
      colors: customColors,
      layout: layoutSettings,
      animation: animationSettings
    }

    localStorage.setItem('themeSettings', JSON.stringify(settings))
    ElMessage.success('主题保存成功')

    // 应用主题（实际项目中可能需要动态加载CSS）
    applyTheme()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  currentTheme.value = 'light'
  customColors.primary = '#409eff'
  customColors.background = '#f5f7fa'
  customColors.text = '#303133'
  customColors.border = '#dcdfe6'
  layoutSettings.sidebarWidth = 240
  layoutSettings.fixedHeader = true
  layoutSettings.fixedSidebar = true
  layoutSettings.showTabs = true
  layoutSettings.showBreadcrumb = true
  animationSettings.pageTransition = 'fade'
  animationSettings.speed = 0.3
  ElMessage.success('已恢复默认主题')
}

const applyTheme = () => {
  // 动态修改CSS变量
  document.documentElement.style.setProperty('--el-color-primary', customColors.primary)
  document.documentElement.style.setProperty('--el-bg-color', customColors.background)
  document.documentElement.style.setProperty('--el-text-color-primary', customColors.text)
  document.documentElement.style.setProperty('--el-border-color', customColors.border)
}
</script>

<style lang="scss" scoped>
.theme-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .theme-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      font-weight: 500;
    }
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 10px;

    .theme-item {
      position: relative;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      &.active {
        .theme-preview {
          box-shadow: 0 0 0 3px #409eff;
        }
      }

      .theme-preview {
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

        .theme-preview-header {
          height: 30px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }

        .theme-preview-sidebar {
          width: 40px;
          height: 90px;
          position: absolute;
          top: 30px;
          left: 0;
        }

        .theme-preview-content {
          position: absolute;
          top: 30px;
          left: 40px;
          right: 0;
          bottom: 0;
          background: #fff;
        }
      }

      .theme-name {
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        color: #606266;
      }

      .theme-check {
        position: absolute;
        top: 5px;
        right: 5px;
        color: #409eff;
        font-size: 18px;
        background: #fff;
        border-radius: 50%;
        padding: 2px;
      }
    }
  }

  .form-actions {
    margin-top: 30px;
    display: flex;
    gap: 10px;
  }
}
</style>