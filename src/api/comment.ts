import { CODE_CO, makeUrl } from './base';
import api from './index'
import type { Comment, CommentForm, CommentQueryParams } from '@/types/comment'

function commentUrl(url: string = ''): string {
	return makeUrl(CODE_CO, url);
}

export const commentApi = {
	// 获取评论列表
	getComments(params?: CommentQueryParams) {
		return api.get(commentUrl(''), params)
	},

	// 获取评论详情
	getComment(id: string | number) {
		return api.get(commentUrl(`/view/${id}`))
	},

	// 创建评论
	createComment(data: CommentForm) {
		return api.post(commentUrl(''), data)
	},

	// 更新评论
	updateComment(id: string | number, data: Partial<Comment>) {
		return api.put(commentUrl(`/${id}`), data)
	},

	// 删除评论
	deleteComment(id: string | number) {
		return api.delete(commentUrl(`/${id}`))
	},

	// 批量删除
	batchDelete(ids: (string | number)[]) {
		return api.delete(commentUrl('/batch'), { ids })
	},

	// 批量更新状态
	batchUpdateStatus(ids: (string | number)[], status: string) {
		return api.patch(commentUrl('/batch-status'), { ids, status })
	},

	// 审核评论
	approveComment(id: string | number) {
		return api.patch(commentUrl(`/${id}/approve`))
	},

	// 标记为垃圾评论
	markAsSpam(id: string | number) {
		return api.patch(commentUrl(`/${id}/spam`))
	},

	// 回复评论
	replyToComment(id: string | number, data: { content: string }) {
		return api.post(commentUrl(`/${id}/reply`), data)
	},

	// 获取评论统计
	getCommentStats() {
		return api.get(commentUrl('/stats'))
	},

	// 导出评论
	exportComments(params?: CommentQueryParams) {
		return api.get(commentUrl('/export'), params)
	},

	// 批量操作
	bulkOperation(operation: string, ids: (string | number)[], data?: any) {
		return api.post(commentUrl('/bulk'), { operation, ids, data })
	}
}