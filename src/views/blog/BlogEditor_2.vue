<template>
  <div class="blog-editor">
    <!-- 顶部操作栏 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="handleCancel">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ isEditMode ? '编辑文章' : '新建文章' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="handlePreview">
          <el-icon>
            <View />
          </el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          <el-icon>
            <Check />
          </el-icon>
          发布
        </el-button>
      </div>
    </div>

    <div class="editor-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="editor-form">
        <el-row :gutter="20">
          <!-- 左侧编辑器区域 -->
          <el-col :xs="24" :lg="16">
            <!-- 标题 -->
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入博客标题" size="large" clearable @input="generateSlug" />
            </el-form-item>

            <!-- 类型 -->
            <el-form-item label="类型" prop="subject">
              <el-select v-model="formData.subject" placeholder="请选择类型" clearable style="width: 100px;">
                <el-option v-for="type in types" :key="type.id" :label="type.name" :value="type.value" />
              </el-select>
            </el-form-item>

            <!-- 内容 -->
            <el-form-item label="内容" prop="content">
              <RichEditor v-model="formData.content" />
            </el-form-item>

            <!-- 摘要 -->
            <el-form-item label="摘要">
              <el-input v-model="formData.summary" type="textarea" :rows="5" placeholder="请输入文章摘要（留空则自动生成）"
                maxlength="200" show-word-limit />
            </el-form-item>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                保存
              </el-button>
              <el-button @click="handleSaveDraft" :loading="submitting">
                保存草稿
              </el-button>
              <el-button @click="handleCancel">取消</el-button>
            </div>
          </el-col>

          <!-- 右侧设置区域 -->
          <el-col :xs="24" :lg="8">
            <!-- 发布设置卡片 -->
            <el-card class="settings-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>发布设置</span>
                </div>
              </template>

              <!-- 状态 -->
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formData.status">
                  <el-radio value="draft">草稿</el-radio>
                  <el-radio value="published">发布</el-radio>
                  <el-radio value="archived">归档</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="发布时间" v-if="formData.status === 'published'">
                <el-date-picker v-model="publishTime" type="datetime" placeholder="选择发布时间" format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
              </el-form-item>
            </el-card>

            <!-- 分类设置卡片 -->
            <el-card class="settings-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>分类</span>
                  <el-button link type="primary" @click="handleAddCategory">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    新建
                  </el-button>
                </div>
              </template>

              <!-- 分类 -->
              <el-form-item label="分类" prop="categoryId">
                <!-- <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="category in categoryTree" :key="category.id" :label="category.name" :value="category.id"
                  :disabled="category.disabled" />
              </el-select> -->
                <el-tree-select v-model="formData.categoryId" placeholder="请选择分类" :data="categoryTree" check-strictly
                  :render-after-expand="false" show-checkbox check-on-click-node style="width: 100%" clearable
                  :default-expanded-keys="ckeys" node-key="id" />
              </el-form-item>
            </el-card>

            <!-- 标签设置卡片 -->
            <el-card class="settings-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>标签</span>
                  <el-button link type="primary" @click="handleAddTag">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    新建
                  </el-button>
                </div>
              </template>

              <!-- 标签 -->
              <el-form-item label="标签">
                <el-select v-model="formData.tagIds" multiple placeholder="请选择标签" style="width: 100%">
                  <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
                    <div class="tag-option">
                      <span class="tag-color" :style="{ backgroundColor: tag.color || '#409eff' }" />
                      {{ tag.name }}
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- 已选标签展示 -->
              <div class="selected-tags" v-if="selectedTags.length > 0">
                <el-tag v-for="tag in selectedTags" :key="tag.id" :color="tag.color" closable
                  @close="handleRemoveTag(tag.id)" class="selected-tag">
                  {{ tag.name }}
                </el-tag>
              </div>
            </el-card>

            <!-- 封面图 -->
            <el-card class="settings-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>封面图</span>
                </div>
              </template>
              <ImageUpload v-model="formData.coverImage" />
            </el-card>







            <!-- 文章可见性 -->
            <el-form-item label="可见性" prop="visibility">
              <el-select v-model="formData.visibility" placeholder="请选择可见性" clearable style="width: 180px;"
                @change="visibilityChange">
                <el-option v-for="visi in visibilities" :key="visi.value" :label="visi.name" :value="visi.value" />
              </el-select>
              <el-radio-group v-if="visibilityRole" v-model="formData.allowedRoles" class="comment-role">
                <el-radio value="visitor">访客</el-radio>
                <el-radio value="user">普通用户</el-radio>
                <el-radio value="author">作者</el-radio>
                <el-radio value="admin">管理员</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 其他设置 -->
            <el-card class="settings-card">
              <template #header>
                <span>其他设置</span>
              </template>

              <el-form-item label="置顶">
                <el-switch v-model="formData.isTop" />
              </el-form-item>

              <el-form-item label="评论">
                <el-switch v-model="formData.isComment" />
              </el-form-item>

              <!-- 评论权限 -->
              <el-form-item v-if="formData.isComment" label="评论权限" prop="commentPermission">
                <el-select v-model="formData.commentPermission" placeholder="请选择评论权限" clearable style="width: 180px;"
                  @change="commPermissionChange">
                  <el-option v-for="visi in commentPermissions" :key="visi.value" :label="visi.name"
                    :value="visi.value" />
                </el-select>
                <el-radio-group v-if="commentRole" v-model="formData.commentAllowedRoles" class="comment-role">
                  <el-radio value="visitor">访客</el-radio>
                  <el-radio value="user">普通用户</el-radio>
                  <el-radio value="author">作者</el-radio>
                  <el-radio value="admin">管理员</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="文章预览" width="80%" fullscreen class="preview-dialog">
      <div class="preview-content">
        <h1 class="preview-title">{{ formData.title }}</h1>
        <div class="preview-meta">
          <span>分类：{{ categoryName }}</span>
          <span>标签：{{ tagNames.join(', ') }}</span>
          <span>时间：{{ publishTime || formatDate(new Date()) }}</span>
        </div>
        <div class="preview-body" v-html="formData.content" />
      </div>
    </el-dialog>

    <!-- 新建分类对话框 -->
    <el-dialog v-model="categoryDialog.visible" title="新建分类" width="90%" :max-width="500" class="category-dialog">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类别名" prop="slug">
          <el-input v-model="categoryForm.slug" placeholder="分类别名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建标签对话框 -->
    <el-dialog v-model="tagDialog.visible" title="新建标签" width="90%" :max-width="500" class="tag-dialog">
      <el-form :model="tagForm" :rules="tagRules" ref="tagFormRef">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="tagForm.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { ArrowLeft, View, Check, Plus } from '@element-plus/icons-vue'
import RichEditor from '@/components/ui/RichEditor.vue';
import ImageUpload from '@/components/ui/ImageUpload.vue';
import { useBlogStore } from '@/stores/blog';
import { useCategoryStore } from '@/stores/category';
import { useTagStore } from '@/stores/tag';
import type { BlogForm } from '@/types/blog';
import { isNonEmptyArrayTs, formatDate } from '@/utils/common';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const categoryStore = useCategoryStore();
const tagStore = useTagStore();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const previewVisible = ref(false)
const visibilityRole = ref(false);
const commentRole = ref<boolean>(false);

const isEditMode = computed(() => !!route.params.id);

const formData = reactive<BlogForm>({
  title: '',
  subject: 'article',
  content: '',
  summary: '',
  coverImage: '',
  categoryId: '',
  tagIds: [],
  status: 'draft',
  isTop: false,
  isComment: true,
  visibility: 'public',
  allowedRoles: '',
  commentPermission: 'all',
  commentAllowedRoles: '',
});

// 发布时间
const publishTime = ref('')

// 分类数据
const categoryTree = computed(() => categoryStore.categoryTree)
const tags = computed(() => tagStore.tags)
const ckeys = computed(() => categoryStore.getCategoryKeys);

// 选中的标签详情
const selectedTags = computed(() => {
  return tags.value.filter(tag => formData.tagIds.includes(tag.id))
})

// 分类名称
const categoryName = computed(() => {
  const category = categoryStore.categories.find(c => c.id === formData.categoryId)
  return category?.name || '未分类'
})

// 标签名称列表
const tagNames = computed(() => {
  return selectedTags.value.map(tag => tag.name)
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择类型', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
  visibility: [
    { required: true, message: '请选择可见性', trigger: 'change' },
  ]
};

const types = [
  { id: 1, name: '文章', value: 'article' },
  { id: 2, name: '图片', value: 'image' },
]

const visibilities = [
  { name: '所有人可见', value: 'public' },
  { name: '仅登陆用户可见', value: 'registered_only' },
  { name: '基于角色的访问控制', value: 'role_based' },
  { name: '仅作者和管理员可见', value: 'private' },
]

const commentPermissions = [
  { name: '所有人', value: 'all' },
  { name: '注册用户', value: 'registed' },
  { name: '基于角色的评论控制', value: 'role_based' },
  { name: '仅作者', value: 'none' },
]

// 分类对话框
const categoryDialog = reactive({
  visible: false,
  parentId: null
})
const categoryFormRef = ref<FormInstance>()
const categoryForm = reactive({
  name: '',
  slug: ''
})
const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入分类别名', trigger: 'blur' }]
}

// 标签对话框
const tagDialog = reactive({
  visible: false
})
const tagFormRef = ref<FormInstance>()
const tagForm = reactive({
  name: '',
  color: '#409eff'
})
const tagRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    tagStore.fetchTags()
  ]);

  if (isEditMode.value) {
    await fetchBlogDetail();
  }
});

const fetchBlogDetail = async () => {
  try {
    const blog = await blogStore.fetchBlog(route.params.id as string);
    Object.assign(formData, {
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      coverImage: blog.coverImage,
      categoryId: blog.categoryId,
      status: blog.status,
      isTop: blog.isTop,
      isComment: blog.isComment
    });

    // 由于标签和博客是多对多关系，所以需要单独处理
    const tagIds: number[] = []
    const tags = blog.tags;
    if (isNonEmptyArrayTs(tags)) {
      tags.forEach(tag => {
        tagIds.push(tag.id)
      })
      formData.tagIds = tagIds;
    }

    // 设置发布时间
    if (blog.publishedAt) {
      publishTime.value = blog.publishedAt
    }
  } catch (error) {
    console.error('获取博客详情失败:', error);
    router.push('/blogs');
  }
};

const generateSlug = () => {
  // 自动生成slug的逻辑
  // 这里可以根据需要实现
};

const visibilityChange = (value: string) => {
  if (value === 'role_based') {
    visibilityRole.value = true
  } else {
    visibilityRole.value = false
  }
};

const commPermissionChange = (value: string) => {
  if (value === 'role_based') {
    commentRole.value = true
  } else {
    commentRole.value = false
  }
}

// 标签变化
// const handleTagChange = (value: any) => {
//   // 处理新创建的标签
//   const newTags = value.filter((id: any) => typeof id === 'string')
//   if (newTags.length > 0) {
//     // TODO: 调用创建标签API
//     ElMessage.info('新标签将自动创建')
//   }
// }

// 移除标签
const handleRemoveTag = (tagId: string | number) => {
  formData.tagIds = formData.tagIds.filter(id => id !== tagId)
}

// 新建分类
const handleAddCategory = () => {
  categoryDialog.visible = true
}

const handleCreateCategory = async () => {
  if (!categoryFormRef.value) return

  try {
    await categoryFormRef.value.validate()
    await categoryStore.createCategory({
      name: categoryForm.name,
      slug: categoryForm.slug,
      sort: categoryStore.categories.length
    })
    ElMessage.success('分类创建成功')
    categoryDialog.visible = false
    categoryForm.name = ''
    categoryForm.slug = ''
  } catch (error) {
    console.error('创建分类失败:', error)
  }
}

// 新建标签
const handleAddTag = () => {
  tagDialog.visible = true
}

const handleCreateTag = async () => {
  if (!tagFormRef.value) return

  try {
    await tagFormRef.value.validate()
    const newTag = await tagStore.createTag({
      name: tagForm.name,
      slug: tagForm.name.toLowerCase().replace(/\s/g, '-'),
      color: tagForm.color,
      id: ''
    })
    ElMessage.success('标签创建成功')
    tagDialog.visible = false
    tagForm.name = ''
    tagForm.color = '#409eff'

    // 自动选中新创建的标签
    formData.tagIds.push(newTag.id)
  } catch (error) {
    console.error('创建标签失败:', error)
  }
}

// 预览
const handlePreview = () => {
  previewVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEditMode.value) {
      await blogStore.updateBlog(route.params.id as string, formData);
      ElMessage.success('更新成功');
    } else {
      await blogStore.createBlog(formData);
      ElMessage.success('创建成功');
    }

    router.push('/blogs');
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    submitting.value = false;
  }
};

const handleSaveDraft = async () => {
  formData.status = 'draft';
  await handleSubmit();
};

const handleCancel = () => {
  router.push('/blogs');
};
</script>

<style lang="scss" scoped>
// 响应式变量
$breakpoint-mobile: 768px;
$breakpoint-tablet: 992px;

.blog-editor {
  background: #f5f7fa;
  min-height: 100vh;

  @media (max-width: $breakpoint-mobile) {
    padding-bottom: 20px;
  }
}

// 头部样式
.editor-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: $breakpoint-mobile) {
    padding: 10px 12px;
    flex-wrap: wrap;
    gap: 10px;

    .header-left,
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;

      @media (max-width: $breakpoint-mobile) {
        font-size: 16px;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 12px;

    @media (max-width: $breakpoint-mobile) {
      .el-button {
        flex: 1;
      }
    }
  }
}

// 内容区域
.editor-content {
  padding: 20px;

  @media (max-width: $breakpoint-mobile) {
    padding: 12px;
  }
}

.editor-form {
  max-width: 1400px;
  margin: 0 auto;

  // 表单项响应式
  :deep(.el-form-item) {
    @media (max-width: $breakpoint-mobile) {
      margin-bottom: 20px;

      .el-form-item__label {
        width: 100% !important;
        text-align: left !important;
        margin-bottom: 8px;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  .title-input {
    :deep(.el-input__wrapper) {
      padding: 12px 16px;

      .el-input__inner {
        font-size: 16px;

        @media (max-width: $breakpoint-mobile) {
          font-size: 14px;
        }
      }
    }
  }
}

// 设置卡片
.settings-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;

  @media (max-width: $breakpoint-mobile) {
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }

  .selected-tags {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .selected-tag {
      cursor: pointer;
    }
  }

  .tag-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .tag-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

// 预览对话框
.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;

    @media (max-width: $breakpoint-mobile) {
      padding: 12px;
    }
  }

  .preview-content {
    max-width: 800px;
    margin: 0 auto;

    .preview-title {
      font-size: 28px;
      text-align: center;
      margin-bottom: 20px;

      @media (max-width: $breakpoint-mobile) {
        font-size: 22px;
      }
    }

    .preview-meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e4e7ed;
      font-size: 14px;
      color: #909399;

      @media (max-width: $breakpoint-mobile) {
        gap: 12px;
        font-size: 12px;
      }
    }

    .preview-body {
      line-height: 1.8;

      :deep(img) {
        max-width: 100%;
        height: auto;
      }

      :deep(pre) {
        overflow-x: auto;
      }
    }
  }
}

// 对话框响应式
.category-dialog,
.tag-dialog {
  :deep(.el-dialog) {
    @media (max-width: $breakpoint-mobile) {
      width: 90% !important;
      margin: 0 auto !important;
    }
  }
}

// 加载状态
:deep(.el-skeleton) {
  padding: 20px;
}

// 富文本编辑器响应式
:deep(.rich-editor) {
  @media (max-width: $breakpoint-mobile) {
    .ql-toolbar {
      overflow-x: auto;
      white-space: nowrap;

      .ql-formats {
        display: inline-block;
        float: none;
      }
    }
  }
}

// 图片上传响应式
:deep(.image-upload) {
  .image-preview {
    @media (max-width: $breakpoint-mobile) {
      height: 150px;
    }
  }

  .upload-area {
    @media (max-width: $breakpoint-mobile) {
      height: 150px;
    }
  }
}
</style>