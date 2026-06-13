export interface Tag {
  id: number | string
  name: string
  slug: string
  color?: string
  description?: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface TagForm {
  id: number | string
  name: string
  slug: string
  color?: string
  description?: string
}

export interface TagQueryParams {
  current?: number
  size?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC'
}