import { defineStore } from 'pinia';
import { blogApi } from '@/api/blog';
import type { Blog, BlogForm, BlogQueryParams } from '@/types/blog';
import type { Photo, PhotoData } from '@/types/photo';
import { wrapPhotos } from '@/utils/FuncUtils';

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  total: number;
  loading: boolean;
  queryParams: BlogQueryParams;
}

export const useBlogStore = defineStore('blog', {
  state: (): BlogState => ({
    blogs: [],
    currentBlog: null,
    total: 0,
    loading: false,
    queryParams: {
      page: 1,
      limit: 20,
      search: '',
      status: 'published',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }),

  actions: {
    // 获取博客列表
    async fetchBlogs(params?: Partial<BlogQueryParams>) {
      this.loading = true;
      try {
        if (params) {
          this.queryParams = { ...this.queryParams, ...params };
        }

        const { records, pagination } = await blogApi.getBlogs(this.queryParams);

        this.blogs = records;
        this.total = pagination.total;
      } catch (error) {
        console.error('获取博客列表失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取博客详情
    async fetchBlog(id: string | number) {
      try {
        const data = await blogApi.getBlog(id);
        this.currentBlog = data;
        return data;
      } catch (error) {
        console.error('获取博客详情失败:', error);
        throw error;
      }
    },

    // 创建博客
    async createBlog(data: BlogForm) {
      try {
        const result = await blogApi.createBlog(data);
        this.blogs.unshift(result);
        return result;
      } catch (error) {
        console.error('创建博客失败:', error);
        throw error;
      }
    },

    // 创建博客
    async createBlogWithPhotos(data: BlogForm, photos: Photo[]) {
      try {
        const photoDatas: PhotoData[] = wrapPhotos(photos);
        data.photos = photoDatas;
        const result = await blogApi.createBlogWithPhotos(data);
        this.blogs.unshift(result);
        return result;
      } catch (error) {
        console.error('创建博客失败:', error);
        throw error;
      }
    },

    // 更新博客
    async updateBlog(id: string | number, data: Partial<BlogForm>) {
      try {
        const result = await blogApi.updateBlog(id, data);
        const index = this.blogs.findIndex(item => item.id === id);
        if (index !== -1) {
          this.blogs[index] = { ...this.blogs[index], ...result };
        }
        return result;
      } catch (error) {
        console.error('更新博客失败:', error);
        throw error;
      }
    },

    // 删除博客
    async deleteBlog(id: string | number) {
      try {
        await blogApi.deleteBlog(id);
        this.blogs = this.blogs.filter(item => item.id !== id);
        this.total -= 1;
      } catch (error) {
        console.error('删除博客失败:', error);
        throw error;
      }
    },

    // 清空当前博客
    clearCurrentBlog() {
      this.currentBlog = null;
    }
  },

  getters: {
    // 获取分类统计等衍生数据
    statusStats(): Record<string, number> {
      const stats: Record<string, number> = {};
      this.blogs.forEach(blog => {
        stats[blog.status] = (stats[blog.status] || 0) + 1;
      });
      return stats;
    }
  }
});
 