import { defineStore } from 'pinia'
import { commentApi } from '@/api/comment'
import type { Comment, CommentForm, CommentQueryParams, CommentStats } from '@/types/comment'

interface CommentState {
  comments: Comment[]
  currentComment: Comment | null
  total: number
  loading: boolean
  stats: CommentStats | null
  queryParams: CommentQueryParams
}

export const useCommentStore = defineStore('comment', {
  state: (): CommentState => ({
    comments: [],
    currentComment: null,
    total: 0,
    loading: false,
    stats: null,
    queryParams: {
      page: 1,
      limit: 20,
      search: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }),

  actions: {
    // 获取评论列表
    async fetchComments(params?: Partial<CommentQueryParams>) {
      this.loading = true
      try {
        if (params) {
          this.queryParams = { ...this.queryParams, ...params }
        }

        const { data, total } = await commentApi.getComments(this.queryParams)
        this.comments = data
        this.total = total
      } catch (error) {
        console.error('获取评论列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取评论详情
    async fetchComment(id: string | number) {
      try {
        const data = await commentApi.getComment(id)
        this.currentComment = data
        return data
      } catch (error) {
        console.error('获取评论详情失败:', error)
        throw error
      }
    },

    // 创建评论
    async createComment(data: CommentForm) {
      try {
        const result = await commentApi.createComment(data)
        this.comments.unshift(result)
        this.total += 1
        await this.fetchCommentStats()
        return result
      } catch (error) {
        console.error('创建评论失败:', error)
        throw error
      }
    },

    // 更新评论
    async updateComment(id: string | number, data: Partial<Comment>) {
      try {
        const result = await commentApi.updateComment(id, data)
        const index = this.comments.findIndex(item => item.id === id)
        if (index !== -1) {
          this.comments[index] = { ...this.comments[index], ...result }
        }
        return result
      } catch (error) {
        console.error('更新评论失败:', error)
        throw error
      }
    },

    // 删除评论
    async deleteComment(id: string | number) {
      try {
        await commentApi.deleteComment(id)
        this.comments = this.comments.filter(item => item.id !== id)
        this.total -= 1
        await this.fetchCommentStats()
      } catch (error) {
        console.error('删除评论失败:', error)
        throw error
      }
    },

    // 批量删除
    async batchDelete(ids: (string | number)[]) {
      try {
        await commentApi.batchDelete(ids)
        this.comments = this.comments.filter(item => !ids.includes(item.id))
        this.total -= ids.length
        await this.fetchCommentStats()
      } catch (error) {
        console.error('批量删除评论失败:', error)
        throw error
      }
    },

    // 批量更新状态
    async batchUpdateStatus(ids: (string | number)[], status: string) {
      try {
        await commentApi.batchUpdateStatus(ids, status)

        // 更新本地数据
        this.comments.forEach(comment => {
          if (ids.includes(comment.id)) {
            comment.status = status as any
          }
        })

        await this.fetchCommentStats()
      } catch (error) {
        console.error('批量更新状态失败:', error)
        throw error
      }
    },

    // 审核评论
    async approveComment(id: string | number) {
      try {
        await commentApi.approveComment(id)
        const comment = this.comments.find(item => item.id === id)
        if (comment) {
          comment.status = 'approved'
        }
        await this.fetchCommentStats()
      } catch (error) {
        console.error('审核评论失败:', error)
        throw error
      }
    },

    // 标记为垃圾评论
    async markAsSpam(id: string | number) {
      try {
        await commentApi.markAsSpam(id)
        const comment = this.comments.find(item => item.id === id)
        if (comment) {
          comment.status = 'spam'
        }
        await this.fetchCommentStats()
      } catch (error) {
        console.error('标记垃圾评论失败:', error)
        throw error
      }
    },

    // 回复评论
    async replyToComment(id: string | number, data: { content: string }) {
      try {
        const result = await commentApi.replyToComment(id, data)
        await this.fetchComments()
        return result
      } catch (error) {
        console.error('回复评论失败:', error)
        throw error
      }
    },

    // 获取评论统计
    async fetchCommentStats() {
      try {
        const data = await commentApi.getCommentStats()
        this.stats = data
      } catch (error) {
        console.error('获取评论统计失败:', error)
        throw error
      }
    },

    // 清空当前评论
    clearCurrentComment() {
      this.currentComment = null
    },

    // 重置查询参数
    resetQueryParams() {
      this.queryParams = {
        page: 1,
        limit: 20,
        search: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    }
  },

  getters: {
    // 待审核评论数
    pendingCount: (state) => {
      return state.comments.filter(c => c.status === 'pending').length
    },

    // 已审核评论数
    approvedCount: (state) => {
      return state.comments.filter(c => c.status === 'approved').length
    },

    // 垃圾评论数
    spamCount: (state) => {
      return state.comments.filter(c => c.status === 'spam').length
    },

    // 根据文章ID获取评论
    getCommentsByPostId: (state) => (postId: string | number) => {
      return state.comments.filter(comment => comment.postId === postId)
    },

    // 获取顶级评论（没有父评论的）
    topLevelComments: (state) => {
      return state.comments.filter(comment => !comment.parentId)
    },

    // 构建评论树
    commentTree: (state) => {
      const comments = [...state.comments]
      const map: Record<string | number, Comment & { children?: Comment[] }> = {}
      const roots: (Comment & { children?: Comment[] })[] = []

      // 创建映射
      comments.forEach(comment => {
        map[comment.id] = { ...comment, children: [] }
      })

      // 构建树
      comments.forEach(comment => {
        if (comment.parentId && map[comment.parentId]) {
          map[comment.parentId].children?.push(map[comment.id])
        } else {
          roots.push(map[comment.id])
        }
      })

      return roots
    }
  }
})