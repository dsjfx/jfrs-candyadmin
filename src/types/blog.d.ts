import { EBlogType, ECommentPermission, EVisibility } from "@/utils/Enumers";

export interface Blog {
  // 主要属性
  id: number | string;
  title: string;
  subtitle?: string;
  subject: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  // 次要属性
  authorId: number | string;
  categoryId: number | string;
  createdAt: string;
  updatedAt: string;
  tagIds?: (number | string)[];
  views?: number;
  likes?: number;
  isTop?: boolean;
  isComment?: boolean;
  publishedAt: string | null;
  author?: BlogAuthor;
  category?: BlogCategory;
  tags?: BlogTags[];
}

export interface BlogForm {
  title: string;
  subtitle: string;
  subject: `${EBlogType}` | null;
  content: string;
  summary?: string;
  coverImage?: string;
  coverThumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  categoryId: number | string;
  tagIds: (number | string)[];
  isTop: boolean;
  isComment: boolean;
  visibility: `${EVisibility}`;
  allowedRoles?: string;
  commentPermission: `${ECommentPermission}`;
  commentAllowedRoles?: string;
  photos?: PhotoData[];
  publishedAt: string | null;
}

export interface BlogQueryParams {
  current?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  subject?: string;
  status?: string;
  categoryId?: number | string;
  tagId?: number | string;
  startDate?: string;
  endDate?: string;
}

/**
 * 博客关联的作者
 */
export type BlogAuthor = {
  id: number;
  username: string;
  avatar?: string;
}

export type BlogCategory = {
  id: number;
  name: string;
  description?: string;
}

export type BlogTags = {
  id: number;
  name: string;
  BlogTag: BlogTag;
}

export type BlogTag = {
  blogId: number;
  tagId: number;
}