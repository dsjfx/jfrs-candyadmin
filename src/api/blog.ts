import { CODE_BL, makeUrl } from './base';
import request from './index';
import type { Blog, BlogForm, BlogQueryParams } from '@/types/blog';
import type { PhotoData } from '@/types/photo';

function blogUrl(url: string = ''): string {
  return makeUrl(CODE_BL, url);
}

export const blogApi = {
  // 获取博客列表
  getBlogs(params?: BlogQueryParams) {
    return request.get(blogUrl('/admin/list'), params);
  },

  // 获取博客详情
  getBlog(id: string | number): Promise<Blog> {
    return request.get(blogUrl(`/view/${id}`));
  },

  // 创建博客
  createBlog(data: BlogForm) {
    return request.post(blogUrl(''), data);
  },

  // 创建博客
  createBlogWithPhotos(data: BlogForm) {
    return request.post(blogUrl('/photos'), data);
  },

  // 更新博客
  updateBlog(id: string | number, data: Partial<BlogForm>) {
    return request.put(blogUrl(`/${id}`), data);
  },

  // 删除博客
  deleteBlog(id: string | number) {
    return request.delete(blogUrl(`/${id}`));
  },

  // 批量删除
  batchDelete(ids: (string | number)[]) {
    return request.delete(blogUrl('/batch'), { data: { ids } });
  },

  // 发布/取消发布
  togglePublish(id: string | number, status: 'published' | 'draft') {
    return request.patch(blogUrl(`/${id}/status`), { status });
  }
};