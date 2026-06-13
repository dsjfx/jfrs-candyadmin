export interface Category {
  id: number | string
  name: string
  slug: string
  description?: string
  parentId?: number | string
  /** 可选的前端显示颜色，例如 '#409eff' */
  color?: string
  sort: number
  blogCount: number
  createdAt: string
  updatedAt: string
  disabled: boolean
}

export interface CategoryTree extends Category {
  value: string
  label: string
  children?: CategoryTree[]
}

export interface CategoryForm {
  id?: number | string
  name: string
  slug: string
  description?: string
  color?: string
  parentId?: number | string
  sort: number
}

export interface CategoryQueryParams {
  current?: number
  size?: number
  search?: string
  parentId?: number | string
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC'
}