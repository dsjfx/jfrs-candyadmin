<template>
  <div class="blog-editor">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" class="editor-form">
      <el-row :gutter="20">
        <!-- 左侧编辑器区域 -->
        <el-col :xs="24" :lg="16">
          <!-- 标题 -->
          <el-form-item label="标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入博客标题" size="large" clearable @input="generateSlug" />
          </el-form-item>

          <!-- 子标题 -->
          <el-form-item label="子标题" prop="subtitle">
            <el-input v-model="formData.subtitle" placeholder="请输入子标题" size="large" clearable style="width:400px;" />
          </el-form-item>

          <el-form-item label="类别" prop="subject">
            <el-select v-model="formData.subject" placeholder="请选择类型" clearable style="width: 100px;">
              <el-option v-for="subject in subjects" :key="subject.id" :label="subject.name" :value="subject.value" />
            </el-select>
          </el-form-item>

          <!-- 内容 -->
          <el-form-item label="内容" prop="content">
            <RichEditor v-model="formData.content" />
          </el-form-item>

          <!-- 摘要 -->
          <el-form-item label="摘要" prop="summary">
            <el-input v-model="formData.summary" type="textarea" :rows="5" placeholder="请输入博客摘要（留空则自动生成）"
              maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>

        <!-- 右侧设置区域 -->
        <el-col :xs="24" :lg="8">
          <!-- 封面图 -->
          <el-form-item label="封面图">
            <ImageUpload v-model="formData.coverImage" @upload-success="uploadHandler" />
          </el-form-item>

          <!-- 状态 -->
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio value="draft">草稿</el-radio>
              <el-radio value="published">发布</el-radio>
              <!-- <el-radio value="archived">归档</el-radio> -->
            </el-radio-group>
          </el-form-item>

          <!-- 分类 -->
          <el-form-item label="分类" prop="categoryId">
            <!-- <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
              <el-option v-for="category in categoryTree" :key="category.id" :label="category.name" :value="category.id"
                :disabled="category.disabled" />
            </el-select> -->
            <el-tree-select v-model="formData.categoryId" placeholder="请选择分类" :data="categoryTree" check-strictly
              :render-after-expand="false" show-checkbox check-on-click-node class="editor-form-category" clearable
              :default-expanded-keys="ckeys" node-key="id" filterable :filter-node-method="filterNodeMethod" />
          </el-form-item>

          <!-- 标签 -->
          <el-form-item label="标签">
            <el-select v-model="formData.tagIds" multiple filterable :virtualized="true" placeholder="请选择标签"
              class="editor-form-tag">
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
                <div class="tag-option">
                  <span class="tag-color" :style="{ backgroundColor: tag.color || '#409eff' }" />
                  {{ tag.name }}
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 发布日期 -->
          <el-form-item label="发布日期" prop="publishedAt">
            <el-date-picker v-model="formData.publishedAt" type="datetime" placeholder="选择发布日期和时间"
              value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>

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
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import RichEditor from '@/components/ui/RichEditor.vue';
import ImageUpload from '@/components/ui/ImageUpload.vue';
import { useBlogStore } from '@/stores/blog';
import { useTagStore } from '@/stores/tag';
import { useCategoryStore } from '@/stores/category';
import { assistApi } from '@/api/assist';
import type { BlogForm } from '@/types/blog';
import { Photo } from '@/types/photo';
import type { AssistParams } from '@/types/assist';
import { isNonEmptyArrayTs } from '@/utils/common';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const categoryStore = useCategoryStore();
const tagStore = useTagStore();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const visibilityRole = ref(false);
const commentRole = ref<boolean>(false);
const photos = ref<Photo[]>([]);

const isEditMode = computed(() => !!route.params.id);

const formData = reactive<BlogForm>({
  title: '',
  subtitle: '',
  subject: null,
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
  publishedAt: null,
} as BlogForm);

const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择类别', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, max: 200, message: '摘要不能超过 200 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
  visibility: [
    { required: true, message: '请选择可见性', trigger: 'change' },
  ]
};

const subjects = ref<AssistParams[]>([]);
const visibilities = ref<AssistParams[]>([]);
const commentPermissions = ref<AssistParams[]>([]);

const loadSubjects = async () => {
  try {
    const res = await assistApi.getSubjects({ type: 'subject' });
    const data = res?.data ?? res;
    if (Array.isArray(data)) subjects.value = data;
  } catch (error) {
    console.error('获取类别失败:', error);
  }
}

const loadVisibilities = async () => {
  try {
    const res = await assistApi.getSubjects({ type: 'visibility' });
    const data = res?.data ?? res;
    if (Array.isArray(data)) visibilities.value = data;
  } catch (error) {
    console.error('获取可见性选项失败:', error);
  }
}

const loadCommentPermissions = async () => {
  try {
    const res = await assistApi.getSubjects({ type: 'comment_permission' });
    const data = res?.data ?? res;
    if (Array.isArray(data)) commentPermissions.value = data;
  } catch (error) {
    console.error('获取评论权限选项失败:', error);
  }
}

const categoryTree = computed(() => categoryStore.categoryTree);
const tags = computed(() => tagStore.tags);
const ckeys = computed(() => categoryStore.getCategoryKeys);

// 树节点过滤方法（用于 category tree select 的搜索）
const filterNodeMethod = (value: string, data: { label?: string; name?: string }) => {
  if (!value) return true;
  const label = data.label || data.name || '';
  return label.toString().toLowerCase().includes(value.toLowerCase());
}

// （标签使用 el-select 自带的 filterable 行为，所以无需自定义过滤函数）

// 初始化数据
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchAllCategories(),
    tagStore.fetchAllTags(),
    loadSubjects(),
    loadVisibilities(),
    loadCommentPermissions()
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
      subject: blog.subject,
      content: blog.content,
      summary: blog.summary,
      coverImage: blog.coverImage,
      categoryId: blog.categoryId,
      status: blog.status,
      isTop: blog.isTop,
      isComment: blog.isComment,
      publishedAt: blog.publishedAt || null
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

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEditMode.value) {
      await blogStore.updateBlog(route.params.id as string, formData);
      ElMessage.success('更新成功');
    } else {
      if (photos.value.length > 0) {
        await blogStore.createBlogWithPhotos(formData, photos.value);
      } else {
        await blogStore.createBlog(formData);
      }

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

const uploadHandler = (photo: Photo) => {
  // console.log(photo)
  if (photo && photo.url) {
    photos.value.push(photo);
  }
}
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;

.blog-editor {
  background: #fff;
  border-radius: 4px;
  padding: 20px;

  .editor-form {
    min-height: calc(100vh - 140px);
    margin-bottom: 40px;

    .editor-form-category {
      width: 180px;
    }

    .editor-form-tag {
      width: 150px;
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

  .settings-card {
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
  }

  .comment-role {
    margin-top: 10px;
  }

}

@media (max-width: $breakpoint-mobile) {
  .editor-form :deep(.el-form-item) {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-form :deep(.el-form-item__label) {
    justify-content: flex-start;
    width: 100% !important;
    text-align: left;
    padding-bottom: 8px;
  }

  .editor-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100%;
  }
}
</style>