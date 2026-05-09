export interface Comment {
	id: number | string
	content: string
	author: {
		id: number | string
		name: string
		email?: string
		avatar?: string
		website?: string
	}
	postId: number | string
	postTitle: string
	parentId?: number | string  // 父评论ID，用于回复
	replyTo?: {
		id: number | string
		name: string
	}
	status: 'pending' | 'approved' | 'spam' | 'trash'
	ip?: string
	userAgent?: string
	likes: number
	dislikes: number
	createdAt: string
	updatedAt: string
	replies?: Comment[]  // 回复列表
}

export interface CommentForm {
	content: string
	authorId?: number | string
	postId: number | string
	parentId?: number | string
}

export interface CommentQueryParams {
	page?: number
	limit?: number
	search?: string
	status?: 'pending' | 'approved' | 'spam' | 'trash' | ''
	postId?: number | string
	startDate?: string
	endDate?: string
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export interface CommentStats {
	total: number
	pending: number
	approved: number
	spam: number
	trash: number
	today: number
	thisWeek: number
	thisMonth: number
}