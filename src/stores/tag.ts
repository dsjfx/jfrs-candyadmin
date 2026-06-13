import { defineStore } from 'pinia'
import { tagApi } from '@/api/tag'
import type { Tag, TagForm, TagQueryParams } from '@/types/tag'

interface TagState {
  tags: Tag[]
  currentTag: Tag | null
  total: number
  loading: boolean
  queryParams: TagQueryParams
}

export const useTagStore = defineStore('tag', {
  state: (): TagState => ({
    tags: [],
    currentTag: null,
    total: 0,
    loading: false,
    queryParams: {
      current: 1,
      size: 10,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }
  }),

  actions: {
    // 获取标签列表
    async fetchTags(params?: Partial<TagQueryParams>) {
      this.loading = true
      try {
        if (params) {
          this.queryParams = { ...this.queryParams, ...params }
        }

        const { records, pagination } = await tagApi.getTags(this.queryParams)
        this.tags = records
        this.total = pagination.total
      } catch (error) {
        console.error('获取标签列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAllTags(params?: Partial<TagQueryParams>) {
      this.loading = true
      try {
        const tags = await tagApi.getAllTags(params)
        this.tags = tags
      } catch (error) {
        console.error('获取标签列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取标签详情
    async fetchTag(id: string | number) {
      try {
        const data = await tagApi.getTag(id)
        this.currentTag = data
        return data
      } catch (error) {
        console.error('获取标签详情失败:', error)
        throw error
      }
    },

    // 创建标签
    async createTag(data: TagForm) {
      try {
        const result = await tagApi.createTag(data)
        this.tags.unshift(result)
        this.total += 1
        return result
      } catch (error) {
        console.error('创建标签失败:', error)
        throw error
      }
    },

    // 更新标签
    async updateTag(id: string | number, data: Partial<TagForm>) {
      try {
        const result = await tagApi.updateTag(id, data)
        const index = this.tags.findIndex(item => item.id === id)
        if (index !== -1) {
          this.tags[index] = { ...this.tags[index], ...result }
        }
        return result
      } catch (error) {
        console.error('更新标签失败:', error)
        throw error
      }
    },

    // 删除标签
    async deleteTag(id: string | number) {
      try {
        await tagApi.deleteTag(id)
        this.tags = this.tags.filter(item => item.id !== id)
        this.total -= 1
      } catch (error) {
        console.error('删除标签失败:', error)
        throw error
      }
    },

    // 批量删除
    async batchDelete(ids: (string | number)[]) {
      try {
        await tagApi.batchDelete(ids)
        this.tags = this.tags.filter(item => !ids.includes(item.id))
        this.total -= ids.length
      } catch (error) {
        console.error('批量删除标签失败:', error)
        throw error
      }
    },

    // 搜索标签
    async searchTags(keyword: string) {
      try {
        const params = {
          ...this.queryParams,
          search: keyword,
          page: 1
        }

        const { data } = await tagApi.getTags(params)
        return data
      } catch (error) {
        console.error('搜索标签失败:', error)
        throw error
      }
    },

    // 清空当前标签
    clearCurrentTag() {
      this.currentTag = null
    },

    // 获取标签选项（用于选择器）
    getTagOptions() {
      return this.tags.map(tag => ({
        value: tag.id,
        label: tag.name,
        color: tag.color
      }))
    },

    // 获取热门标签（按使用次数排序）
    getPopularTags(limit: number = 10) {
      return [...this.tags]
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, limit)
    }
  },

  getters: {
    // 根据ID获取标签
    getTagById: (state) => (id: string | number) => {
      return state.tags.find(tag => tag.id === id)
    },

    // 根据slug获取标签
    getTagBySlug: (state) => (slug: string) => {
      return state.tags.find(tag => tag.slug === slug)
    },

    // 获取带颜色的标签
    coloredTags(): Tag[] {
      return this.tags.filter(tag => tag.color)
    },

    // 统计标签使用情况
    tagStats(): Array<{ name: string; count: number; color?: string }> {
      return this.tags
        .map(tag => ({
          name: tag.name,
          count: tag.count || 0,
          color: tag.color
        }))
        .sort((a, b) => b.count - a.count)
    },

    // 标签云数据
    tagCloud(): Array<{
      name: string
      value: number
      color?: string
      slug: string
    }> {
      const counts = this.tags.map(tag => tag.count || 0)
      const minCount = Math.min(...counts)
      const maxCount = Math.max(...counts)
      const range = maxCount - minCount

      return this.tags.map(tag => {
        const count = tag.count || 0
        // 计算权重，范围在 10-40 之间
        const weight = range > 0
          ? 10 + (30 * (count - minCount) / range)
          : 20

        return {
          name: tag.name,
          value: weight,
          color: tag.color,
          slug: tag.slug
        }
      })
    }
  }
})