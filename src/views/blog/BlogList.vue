<template>
  <div class="blog-list responsive-padding">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline class="el-form">
        <el-form-item class="el-form-item">
          <el-input v-model="searchForm.keyword" placeholder="搜索标题/内容" clearable @clear="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="!isMobile" class="el-form-item">
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 80px" clearable @change="handleSearch">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select v-model="searchForm.subject" placeholder="类别" clearable style="width: 100px;">
            <el-option v-for="subject in subjects" :key="subject.id" :label="subject.name" :value="subject.value" />
          </el-select>
        </el-form-item>

        <el-form-item class="el-form-item">
          <!-- <el-select v-model="searchForm.categoryId" placeholder="分类" style="width: 80px" clearable
            @change="handleSearch">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select> -->
          <el-tree-select v-model="searchForm.categoryId" placeholder="请选择分类" :data="categoryTree" check-strictly
            :filter-node-method="filterNodeMethod" :default-expanded-keys="ckeys" node-key="id" filterable clearable
            style="width: 150px" />
        </el-form-item>

        <el-form-item class="el-form-item">
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item class="el-form-item">
          <el-date-picker v-model="searchForm.publishedRange" type="daterange" start-placeholder="开始发布日期"
            end-placeholder="结束发布日期" value-format="YYYY-MM-DD" format="YYYY-MM-DD" range-separator="至" unlink-panels />
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon>
          <Plus />
        </el-icon>
        新建博客
      </el-button>
      <el-button v-if="!isMobile" type="danger" plain :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <el-icon>
          <Delete />
        </el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="blogs" @selection-change="handleSelectionChange" style="width: 100%"
      class="el-table">
      <el-table-column v-if="!isMobile" type="selection" width="55" />
      <el-table-column v-else type="index" label="序号" width="55" />

      <el-table-column prop="title" label="标题" min-width="300">
        <template #default="{ row }">
          <div class="title-cell">
            <el-image v-if="row.coverImage" :src="row.coverImage" :preview-src-list="[row.coverImage]" fit="cover"
              class="cover-image" />
            <div class="title-content">
              <router-link :to="`/blog/edit/${row.id}`" class="title-link">
                {{ row.title }}
              </router-link>
              <div class="summary">{{ row.summary }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="类别" width="120">
        <template #default="{ row }">
          {{ subjectMap[row.subject as string] ?? row.subject ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="分类" width="120" />

      <el-table-column label="标签" width="150">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag.id" size="small" class="tag-item">
            {{ tag.name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]" size="small">
            {{ statusText[row.status] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="views" label="浏览" width="80" align="center" />
      <el-table-column prop="likes" label="点赞" width="80" align="center" />

      <!-- <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column> -->

      <el-table-column prop="publishedAt" label="发布日期" width="180">
        <template #default="{ row }">
          {{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" :fixed="isFixed">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row.id)">
            编辑
          </el-button>

          <el-button size="small" type="success" link v-if="row.status !== 'published'" @click="handlePublish(row.id)">
            发布
          </el-button>

          <el-button size="small" type="warning" link v-if="row.status === 'published'"
            @click="handleUnpublish(row.id)">
            取消发布
          </el-button>

          <el-button size="small" type="danger" link @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, FilterNodeMethodFunction, TreeNodeData } from 'element-plus';
import { Search, Plus, Delete } from '@element-plus/icons-vue';
import { useBlogStore } from '@/stores/blog';
import { assistApi } from '@/api/assist';
import { useCategoryStore } from '@/stores/category';
import { checkScreenWidth, formatDate } from '@/utils/common';
import { Blog } from '@/types/blog';

const router = useRouter();
const blogStore = useBlogStore();
const categoryStore = useCategoryStore();

const loading = ref(false);
const blogs = computed(() => blogStore.blogs);
const total = computed(() => blogStore.total);
// const categories = computed(() => categoryStore.categories);
const categoryTree = computed(() => categoryStore.categoryTree);
const ckeys = computed(() => categoryStore.getCategoryKeys);
const isMobile = checkScreenWidth();
const isFixed = isMobile ? false : 'right'

const selectedIds = ref<(string | number)[]>([]);
type TagType = "info" | "success" | "warning" | "primary" | "danger" | undefined

const statusType: Record<string, TagType> = {
  draft: 'info',
  published: 'success',
  archived: 'warning'
} as const;

const statusText: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档'
} as const;

const subjects = ref<{ id: number; name: string; value: string }[]>([]);

const loadSubjects = async () => {
  try {
    const res = await assistApi.getSubjects({ type: 'subject' });
    // assume API returns array directly or under data
    const data = res?.data ?? res;
    if (Array.isArray(data)) {
      subjects.value = data;
    }
  } catch (error) {
    console.error('获取科目失败:', error);
  }
}

const searchForm = reactive({
  keyword: '',
  status: '',
  categoryId: '',
  subject: '',
  publishedRange: [] as string[],
  appType: 'admin',
});

// map subject value -> name for quick lookup
const subjectMap = computed(() => {
  const map: Record<string, string> = {}
  subjects.value.forEach(s => {
    if (s && s.value) map[s.value] = s.name
  })
  return map
})

const pagination = reactive({
  page: 1,
  limit: 10
});

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchBlogs(),
    categoryStore.fetchCategories(),
    loadSubjects()
  ]);
});

const fetchBlogs = async () => {
  try {
    loading.value = true;
    // build params and include published date range if provided
    const params: Record<string, unknown> = {
      ...searchForm,
      ...pagination
    };

    if (searchForm.publishedRange && searchForm.publishedRange.length === 2) {
      params.startDate = searchForm.publishedRange[0];
      params.endDate = searchForm.publishedRange[1];
    }

    await blogStore.fetchBlogs(params);
  } catch (error) {
    console.error('获取博客列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const filterNodeMethod: FilterNodeMethodFunction = (
  value: string,
  data: TreeNodeData
) => {
  return data.label.includes(value)
}

const handleSearch = () => {
  pagination.page = 1;
  fetchBlogs();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.categoryId = '';
  handleSearch();
};

const handleCreate = () => {
  router.push('/blog/create');
};

const handleEdit = (id: string | number) => {
  router.push(`/blog/edit/${id}`);
};

const handlePublish = async (id: string | number) => {
  try {
    await blogStore.updateBlog(id, { status: 'published' });
    ElMessage.success('发布成功');
  } catch (error) {
    console.error('发布失败:', error);
  }
};

const handleUnpublish = async (id: string | number) => {
  try {
    await blogStore.updateBlog(id, { status: 'draft' });
    ElMessage.success('已取消发布');
  } catch (error) {
    console.error('操作失败:', error);
  }
};

const handleDelete = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇博客吗？', '提示', {
      type: 'warning'
    });

    await blogStore.deleteBlog(id);
    ElMessage.success('删除成功');
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const handleSelectionChange = (selection: Blog[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 篇博客吗？`, '提示', {
      type: 'warning'
    });

    // 调用批量删除API
    // await blogApi.batchDelete(selectedIds.value);

    selectedIds.value = [];
    fetchBlogs();
    ElMessage.success('批量删除成功');
  } catch (error) {
    console.error('批量删除失败:', error);
  }
};

const handleSizeChange = (size: number) => {
  pagination.limit = size;
  fetchBlogs();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchBlogs();
};
</script>

<style lang="scss" scoped>
$breakpoint-mobile: 768px;
$breakpoint-tablet: 992px;

.blog-list {
  background: #fff;
  border-radius: 4px;
  // padding: 20px;

  // @media (max-width: $breakpoint-mobile) {
  //   padding: 12px;
  // }

  .search-bar {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;

    .el-form {
      @media (max-width: $breakpoint-mobile) {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .el-form-item {
          width: 100%;
          margin-bottom: 0;
        }
      }
    }
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    // @media (max-width: $breakpoint-mobile) {
    //   flex-direction: column;

    //   .el-button {
    //     width: 100%;
    //   }
    // }
  }

  .title-cell {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .cover-image {
      width: 60px;
      height: 40px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    @media (max-width: $breakpoint-mobile) {
      flex-direction: column;
    }

    .title-content {
      flex: 1;
      min-width: 0;

      .title-link {
        color: #303133;
        text-decoration: none;
        font-weight: 500;
        display: block;
        margin-bottom: 4px;

        &:hover {
          color: #409eff;
        }
      }

      .summary {
        color: #909399;
        font-size: 12px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;

        @media (max-width: $breakpoint-mobile) {
          font-size: 11px;
        }
      }
    }
  }

  // 表格响应式 - 水平滚动
  .el-table {
    overflow-x: auto;

    @media (max-width: $breakpoint-tablet) {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .tag-item {
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;

    @media (max-width: $breakpoint-mobile) {
      justify-content: center;
    }
  }
}
</style>