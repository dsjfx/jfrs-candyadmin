import { CODE_TA, makeUrl } from './base';
import api from './index'
import type { TagQueryParams, TagForm } from '@/types/tag'

function tagUrl(url: string = ''): string {
  return makeUrl(CODE_TA, url);
}

export const tagApi = {
  // 获取标签列表
  getTags(params?: TagQueryParams) {
    return api.get(tagUrl(''), params)
  },

  // 获取标签详情
  getTag(id: string | number) {
    return api.get(tagUrl(`/${id}`))
  },

  // 创建标签
  createTag(data: TagForm) {
    return api.post(tagUrl(''), data)
  },

  // 更新标签
  updateTag(id: string | number, data: Partial<TagForm>) {
    return api.put(tagUrl(`/${id}`), data)
  },

  // 删除标签
  deleteTag(id: string | number) {
    return api.delete(tagUrl(`/${id}`))
  },

  // 批量删除
  batchDelete(ids: (string | number)[]) {
    return api.delete(tagUrl('/batch'), { ids })
  },

  // 搜索标签
  searchTags(keyword: string) {
    return api.get(tagUrl('/search'), { keyword })
  },

  // 检查slug是否可用
  checkSlug(slug: string, id?: string | number) {
    return api.get(tagUrl('/check-slug'), { slug, id })
  },

  // 获取热门标签
  getPopularTags(limit: number = 10) {
    return api.get(tagUrl('/popular'), { limit })
  }
}