// 博客类型
export enum EBlogType {
	ARTICLE = 'article',
	IMAGE = 'image',
}

// 文章可见性
export enum EVisibility {
	PUBLIC = 'public', // 所有人可见（包括未登陆用户）
	REGISTER = 'registered_only', // 仅登陆用户可见
	ROLE = 'role_based', // 基于角色的访问控制
	PRIVATE = 'private', // 仅作者和管理员可见
}

// 评论权限
export enum ECommentPermission {
	ALL = 'all',
	REGISTED = 'registed',
	Role = 'role_based',
	NONE = 'none',
}