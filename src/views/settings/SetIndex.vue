<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab" tab-position="left" class="settings-tabs" @tab-click="handleTabClick">
      <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :lazy="true">
        <template #label>
          <span class="tab-label">
            <el-icon>
              <component :is="tab.icon" />
            </el-icon>
            {{ tab.label }}
          </span>
        </template>

        <!-- 加载状态 -->
        <div v-if="loadingStates[tab.name]" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="errorStates[tab.name]" class="error-container">
          <el-result icon="error" title="加载失败" sub-title="组件加载失败，请重试">
            <template #extra>
              <el-button type="primary" @click="retryLoad(tab.name)">重试</el-button>
            </template>
          </el-result>
        </div>

        <!-- 组件内容 -->
        <div v-else-if="activeTab === tab.name && loadedComponents[tab.name]">
          <component :is="loadedComponents[tab.name]" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw, onMounted } from 'vue'
import {
  Setting,
  User,
  Lock,
  Bell,
  Brush,
  Folder,
} from '@element-plus/icons-vue'
import type { TabsPaneContext } from 'element-plus'

// 定义组件模块的类型
interface ComponentModule {
  default: any; // Vue 组件
  meta?: {
    name: string;
    version: string;
  }
}

// 标签页配置
const tabs = [
  { name: 'general', label: '通用设置', icon: Setting },
  { name: 'profile', label: '个人资料', icon: User },
  { name: 'security', label: '安全设置', icon: Lock },
  { name: 'notification', label: '通知设置', icon: Bell },
  { name: 'theme', label: '主题设置', icon: Brush },
  { name: 'backup', label: '备份恢复', icon: Folder },
]

const activeTab = ref('general')
const loadedComponents = reactive<Record<string, any>>({})
const loadingStates = reactive<Record<string, boolean>>({})
const errorStates = reactive<Record<string, boolean>>({})

// 组件名称映射
const componentNames: Record<string, string> = {
  general: 'GeneralSettings',
  profile: 'ProfileSettings',
  security: 'SecuritySettings',
  notification: 'NotificationSettings',
  theme: 'ThemeSettings',
  backup: 'BackupSettings'
}

// 初始化所有标签页的状态
tabs.forEach(tab => {
  loadingStates[tab.name] = false
  errorStates[tab.name] = false
})

// 标签页点击处理
const handleTabClick = async (tab: TabsPaneContext) => {
  const tabName = tab.paneName as string

  // 如果组件已加载，直接使用
  if (loadedComponents[tabName]) {
    return
  }

  await loadComponent(tabName)
}

// 加载组件
const loadComponent = async (tabName: string) => {
  loadingStates[tabName] = true
  errorStates[tabName] = false

  try {
    // 1. 调用接口获取配置
    const config = await fetchTabConfig(tabName)
    // console.log(`获取到 ${tabName} 配置:`, config)

    // 2. 如果未启用，显示提示
    if (!config.enabled) {
      const disabledComponent = {
        template: `<el-alert type="warning" :closable="false" show-icon>该功能未启用</el-alert>`
      }
      loadedComponents[tabName] = markRaw(disabledComponent)
      return
    }

    // 3. 动态导入组件
    const modules = import.meta.glob<ComponentModule>('./*.vue')
    const module = await modules[`./${componentNames[tabName]}.vue`]()
    // const module = await import(`./${componentNames[tabName]}.vue`)
    const component = module.default || module

    // 4. 保存组件
    loadedComponents[tabName] = markRaw(component)

  } catch (error) {
    console.error(`加载 ${tabName} 组件失败:`, error)
    errorStates[tabName] = true
  } finally {
    loadingStates[tabName] = false
  }
}

// 获取标签页配置
const fetchTabConfig = async (tabName: string) => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const configs: Record<string, any> = {
    general: { enabled: true, permissions: ['admin'] },
    profile: { enabled: true, permissions: ['user'] },
    security: { enabled: true, permissions: ['admin'] },
    notification: { enabled: true, permissions: ['user'] },
    theme: { enabled: true, permissions: ['admin'] },
    backup: { enabled: true, permissions: ['admin'] }
  }

  return configs[tabName]
}

// 重试加载
const retryLoad = (tabName: string) => {
  delete loadedComponents[tabName]
  loadComponent(tabName)
}

// 预加载第一个标签页
onMounted(() => {
  const from = history.state?.from || 'general'
  activeTab.value = from
  loadComponent(from)
})

</script>

<style lang="scss" scoped>
.loading-container {
  padding: 40px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>