<template>
  <div class="general-settings">
    <h3 class="section-title">通用设置</h3>

    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" label-position="right">
      <!-- 站点信息 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>站点信息</span>
          </div>
        </template>

        <el-form-item label="站点名称" prop="siteName">
          <el-input v-model="formData.siteName" placeholder="请输入站点名称" />
        </el-form-item>

        <el-form-item label="站点描述" prop="siteDescription">
          <el-input v-model="formData.siteDescription" type="textarea" :rows="3" placeholder="请输入站点描述" maxlength="200"
            show-word-limit />
        </el-form-item>

        <el-form-item label="站点关键词" prop="siteKeywords">
          <el-select v-model="formData.siteKeywords" multiple filterable allow-create default-first-option
            placeholder="请输入关键词后按回车" style="width: 100%" />
        </el-form-item>

        <el-form-item label="站点图标" prop="favicon">
          <ImageUpload v-model="formData.favicon" :max-size="1" />
        </el-form-item>

        <el-form-item label="站点 Logo" prop="logo">
          <ImageUpload v-model="formData.logo" :max-size="2" />
        </el-form-item>
      </el-card>

      <!-- 文章设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>文章设置</span>
          </div>
        </template>

        <el-form-item label="每页显示" prop="postsPerPage">
          <el-input-number v-model="formData.postsPerPage" :min="5" :max="100" />
          <span class="form-tip">条</span>
        </el-form-item>

        <el-form-item label="默认分类" prop="defaultCategory">
          <el-select v-model="formData.defaultCategory" placeholder="请选择默认分类">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="评论审核" prop="commentModeration">
          <el-radio-group v-model="formData.commentModeration">
            <el-radio :value="true">开启审核</el-radio>
            <el-radio :value="false">直接显示</el-radio>
          </el-radio-group>
          <div class="form-tip">开启后，评论需要管理员审核才能显示</div>
        </el-form-item>
      </el-card>

      <!-- SEO设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>SEO设置</span>
          </div>
        </template>

        <el-form-item label="URL 模式" prop="urlPattern">
          <el-radio-group v-model="formData.urlPattern">
            <el-radio value="default">默认模式 (?p=123)</el-radio>
            <el-radio value="postname">文章名 (/post-name)</el-radio>
            <el-radio value="date">日期 (/2024/03/09/post-name)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="启用伪静态" prop="enablePrettyUrl">
          <el-switch v-model="formData.enablePrettyUrl" />
        </el-form-item>
      </el-card>

      <!-- 性能设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>性能设置</span>
          </div>
        </template>

        <el-form-item label="启用缓存" prop="enableCache">
          <el-switch v-model="formData.enableCache" />
        </el-form-item>

        <el-form-item label="缓存时间" prop="cacheTime" v-if="formData.enableCache">
          <el-input-number v-model="formData.cacheTime" :min="5" :max="1440" />
          <span class="form-tip">分钟</span>
        </el-form-item>

        <el-form-item label="压缩页面" prop="enableGzip">
          <el-switch v-model="formData.enableGzip" />
        </el-form-item>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存设置
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { useCategoryStore } from '@/stores/category'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const categoryStore = useCategoryStore()

const categories = computed(() => categoryStore.categories)

const formData = reactive({
  siteName: '博客管理系统',
  siteDescription: '一个专业的博客管理平台',
  siteKeywords: ['博客', '管理', 'Vue3', 'TypeScript'],
  favicon: '',
  logo: '',
  postsPerPage: 20,
  defaultCategory: '',
  commentModeration: true,
  urlPattern: 'postname',
  enablePrettyUrl: true,
  enableCache: true,
  cacheTime: 30,
  enableGzip: true
})

const rules: FormRules = {
  siteName: [
    { required: true, message: '请输入站点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  siteDescription: [
    { max: 200, message: '不能超过 200 个字符', trigger: 'blur' }
  ],
  postsPerPage: [
    { type: 'number', min: 5, max: 100, message: '范围在 5-100 之间', trigger: 'blur' }
  ],
  cacheTime: [
    { type: 'number', min: 5, max: 1440, message: '范围在 5-1440 之间', trigger: 'blur' }
  ]
}

onMounted(() => {
  categoryStore.fetchCategories()
  loadSettings()
})

const loadSettings = () => {
  // 从本地存储或 API 加载设置
  const saved = localStorage.getItem('settings')
  if (saved) {
    Object.assign(formData, JSON.parse(saved))
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存到本地存储
    localStorage.setItem('settings', JSON.stringify(formData))

    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  loadSettings()
}
</script>

<style lang="scss" scoped>
.general-settings {
  max-width: 800px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .settings-card {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
  }
}
</style>