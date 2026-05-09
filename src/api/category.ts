import { CODE_CA, makeUrl } from './base'
import api from './index'
import type { CategoryForm, CategoryQueryParams } from '@/types/category'

function categoryUrl(url: string = ''): string {
  return makeUrl(CODE_CA, url);
}

export const categoryApi = {
  // 获取分类列表
  getCategories(params?: CategoryQueryParams) {
    return api.get(categoryUrl('/admin/list'), params)
  },

  // 获取分类详情
  getCategory(id: string | number) {
    return api.get(categoryUrl(`/${id}`))
  },

  // 创建分类
  createCategory(data: CategoryForm) {
    return api.post(categoryUrl(), data)
  },

  // 更新分类
  updateCategory(id: string | number, data: Partial<CategoryForm>) {
    return api.put(categoryUrl(`/${id}`), data)
  },

  // 删除分类
  deleteCategory(id: string | number) {
    return api.delete(categoryUrl(`/${id}`))
  },

  // 批量删除
  batchDelete(ids: (string | number)[]) {
    return api.delete(categoryUrl('/batch'), { ids })
  },

  // 更新排序
  updateOrder(orders: Array<{ id: string | number; sort: number }>) {
    return api.patch(categoryUrl('/order'), { orders })
  },

  // 检查slug是否可用
  checkSlug(slug: string, id?: string | number) {
    return api.get(categoryUrl('/check-slug'), { slug, id })
  }
}