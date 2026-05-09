import { defineStore } from 'pinia'
import { categoryApi } from '@/api/category'
import type { Category, CategoryForm, CategoryTree } from '@/types/category'
import { isDefined } from '@/utils/common'

interface CategoryState {
  categories: Category[]
  categoryTree: CategoryTree[]
  currentCategory: Category | null
  total: number
  loading: boolean
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    categoryTree: [],
    currentCategory: null,
    total: 0,
    loading: false
  }),

  actions: {
    // 获取分类列表（平铺）
    async fetchCategories(params?: CategoryForm) {
      this.loading = true
      try {
        const { records, pagination } = await categoryApi.getCategories(params)
        this.categories = records
        this.total = pagination.total

        // 构建树形结构
        this.buildCategoryTree()
      } catch (error) {
        console.error('获取分类列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取分类详情
    async fetchCategory(id: string | number) {
      try {
        const data = await categoryApi.getCategory(id)
        this.currentCategory = data
        return data
      } catch (error) {
        console.error('获取分类详情失败:', error)
        throw error
      }
    },

    // 创建分类
    async createCategory(data: CategoryForm) {
      try {
        const result = await categoryApi.createCategory(data)
        this.categories.push(result)
        this.buildCategoryTree()
        return result
      } catch (error) {
        console.error('创建分类失败:', error)
        throw error
      }
    },

    // 更新分类
    async updateCategory(id: string | number, data: Partial<CategoryForm>) {
      try {
        const result = await categoryApi.updateCategory(id, data)
        const index = this.categories.findIndex(item => item.id === id)
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...result }
        }
        this.buildCategoryTree()
        return result
      } catch (error) {
        console.error('更新分类失败:', error)
        throw error
      }
    },

    // 删除分类
    async deleteCategory(id: string | number) {
      try {
        await categoryApi.deleteCategory(id)
        this.categories = this.categories.filter(item => item.id !== id)
        this.buildCategoryTree()
        this.total -= 1
      } catch (error) {
        console.error('删除分类失败:', error)
        throw error
      }
    },

    // 批量删除
    async batchDelete(ids: (string | number)[]) {
      try {
        await categoryApi.batchDelete(ids)
        this.categories = this.categories.filter(item => !ids.includes(item.id))
        this.buildCategoryTree()
        this.total -= ids.length
      } catch (error) {
        console.error('批量删除分类失败:', error)
        throw error
      }
    },

    // 更新排序
    async updateOrder(orders: Array<{ id: string | number; sort: number }>) {
      try {
        await categoryApi.updateOrder(orders)

        // 更新本地数据
        orders.forEach(orderItem => {
          const category = this.categories.find(item => item.id === orderItem.id)
          if (category) {
            category.sort = orderItem.sort
          }
        })

        this.buildCategoryTree()
      } catch (error) {
        console.error('更新排序失败:', error)
        throw error
      }
    },

    // 构建分类树
    buildCategoryTree() {
      const categories = [...this.categories]

      // 按排序值排序
      categories.sort((a, b) => a.sort - b.sort)

      // 构建树形结构
      const tree: CategoryTree[] = []
      const map: Record<string | number, CategoryTree> = {}

      // 先创建所有节点的映射
      categories.forEach(category => {
        map[category.id] = {
          ...category,
          value: `${category.id}`,
          label: category.name,
          children: []
        }
      })

      // 构建树
      categories.forEach(category => {
        const node = map[category.id]

        if (category.parentId) {
          // 如果有父节点，添加到父节点的children中
          const parent = map[category.parentId]
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(node)
          } else {
            // 如果父节点不存在，直接添加到根节点
            tree.push(node)
          }
        } else {
          // 根节点
          tree.push(node)
        }
      })

      // 对子节点排序
      const sortChildren = (nodes: CategoryTree[]) => {
        nodes.sort((a, b) => a.sort - b.sort)
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            sortChildren(node.children)
          }
        })
      }

      sortChildren(tree)
      this.categoryTree = tree
    },

    // 清空当前分类
    clearCurrentCategory() {
      this.currentCategory = null
    },

    // 获取分类选项（用于选择器）
    getCategoryOptions(parentId?: string | number) {
      const options: Array<{ value: string | number; label: string; disabled?: boolean }> = []

      const addOption = (category: CategoryTree, depth = 0) => {
        const prefix = depth > 0 ? ' '.repeat(depth * 4) + '└─ ' : ''
        const disabled = category.id === parentId // 不能选择自己作为父级

        options.push({
          value: category.id,
          label: prefix + category.name,
          disabled
        })

        if (category.children && category.children.length > 0) {
          category.children.forEach(child => addOption(child, depth + 1))
        }
      }

      this.categoryTree.forEach(category => addOption(category))
      return options
    },

    // 获取分类路径（面包屑）
    getCategoryPath(categoryId: string | number): Category[] {
      const path: Category[] = []

      const findPath = (node: CategoryTree, targetId: string | number): boolean => {
        if (node.id === targetId) {
          path.unshift(node)
          return true
        }

        if (node.children) {
          for (const child of node.children) {
            if (findPath(child, targetId)) {
              path.unshift(node)
              return true
            }
          }
        }

        return false
      }

      for (const category of this.categoryTree) {
        if (findPath(category, categoryId)) {
          break
        }
      }

      return path
    }
  },

  getters: {
    // 获取根分类
    rootCategories(): Category[] {
      return this.categories.filter(category => !category.parentId)
    },

    // 获取有子分类的分类
    parentCategories(): Category[] {
      return this.categories.filter(category =>
        this.categories.some(child => child.parentId === category.id)
      )
    },

    // 获取叶子分类（没有子分类）
    leafCategories(): Category[] {
      return this.categories.filter(category =>
        !this.categories.some(child => child.parentId === category.id)
      )
    },

    // 根据ID获取分类
    getCategoryById: (state) => (id: string | number) => {
      return state.categories.find(category => category.id === id)
    },

    // 根据slug获取分类
    getCategoryBySlug: (state) => (slug: string) => {
      return state.categories.find(category => category.slug === slug)
    },

    // 统计分类下的文章数
    categoryStats(): Record<string | number, number> {
      const stats: Record<string | number, number> = {}

      this.categories.forEach(category => {
        stats[category.id] = category.blogCount || 0
      })

      return stats
    },

    // 获取所有分类的 id
    getCategoryKeys(): Array<string | number> {
      return [...new Set(this.categories.map(category => category.parentId).filter(isDefined))]
    }
  }
})