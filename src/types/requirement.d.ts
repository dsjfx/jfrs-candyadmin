export interface Requirement {
  id: string | number
  name: string
  system: string
  content: string
  plannedTime: string

  // 新增字段
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'planning' | 'developing' | 'testing' | 'completed' | 'cancelled'
  category: 'feature' | 'improvement' | 'bugfix' | 'optimization' | 'other'
  proposer: string
  assignee: string
  startDate?: string
  endDate?: string
  actualTime?: string
  estimatedHours: number
  actualHours: number
  progress: number
  attachments: string[]
  tags: string[]
  comments: string
  source: 'customer' | 'internal' | 'management' | 'other'
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface RequirementForm {
  name: string
  system: string
  content: string
  plannedTime: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'planning' | 'developing' | 'testing' | 'completed' | 'cancelled'
  category: 'feature' | 'improvement' | 'bugfix' | 'optimization' | 'other'
  proposer: string
  assignee: string
  startDate?: string
  endDate?: string
  estimatedHours: number
  // attachments: string[]
  tags: string[]
  comments: string
  source: 'customer' | 'internal' | 'management' | 'other'
  version: string
}

export interface RequirementQueryParams {
  current?: number
  size?: number
  keyword?: string
  status?: string
  priority?: string
  category?: string
  system?: string
  assignee?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface RequirementStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  completionRate: string
}