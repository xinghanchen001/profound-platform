// Database type definitions based on our schema

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserOrganization {
  id: string
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface Brand {
  id: string
  organization_id: string
  name: string
  domain?: string
  logo_url?: string
  is_competitor: boolean
  created_at: string
  updated_at: string
}

export interface Platform {
  id: string
  name: string
  slug: string
  logo_url?: string
  is_active: boolean
  created_at: string
}

export interface Topic {
  id: string
  organization_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  organization_id: string
  text: string
  language: string
  region: string
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromptTopic {
  prompt_id: string
  topic_id: string
}

export interface PromptExecution {
  id: string
  prompt_id: string
  platform_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executed_at: string
  completed_at?: string
  error_message?: string
}

export interface ExecutionResult {
  id: string
  execution_id: string
  brand_id?: string
  is_mentioned: boolean
  sentiment?: 'positive' | 'negative' | 'neutral'
  response_text?: string
  response_position?: number
  citations?: Record<string, unknown>
  created_at: string
}

export interface VisibilityScore {
  id: string
  brand_id: string
  platform_id: string
  topic_id: string
  score: number
  rank?: number
  date: string
  created_at: string
}

export interface Citation {
  id: string
  execution_result_id: string
  url: string
  domain: string
  page_title?: string
  citation_type: 'owned' | 'earned' | 'competitor' | 'social'
  created_at: string
}

export interface BotVisit {
  id: string
  organization_id: string
  platform_id: string
  url: string
  user_agent?: string
  ip_address?: string
  visited_at: string
  response_status?: number
}

// Input types for creating new records (without auto-generated fields)
export interface CreateOrganizationInput {
  name: string
  slug: string
}

export interface CreateUserInput {
  id: string // This comes from Supabase auth
  email: string
  full_name?: string
  avatar_url?: string
}

export interface CreateBrandInput {
  organization_id: string
  name: string
  domain?: string
  logo_url?: string
  is_competitor?: boolean
}

export interface CreateTopicInput {
  organization_id: string
  name: string
  description?: string
}

export interface CreatePromptInput {
  organization_id: string
  text: string
  language?: string
  region?: string
  tags?: string[]
  is_active?: boolean
}

// Update types (all fields optional except where required for business logic)
export interface UpdateOrganizationInput {
  name?: string
  slug?: string
}

export interface UpdateUserInput {
  full_name?: string
  avatar_url?: string
}

export interface UpdateBrandInput {
  name?: string
  domain?: string
  logo_url?: string
  is_competitor?: boolean
}

export interface UpdateTopicInput {
  name?: string
  description?: string
}

export interface UpdatePromptInput {
  text?: string
  language?: string
  region?: string
  tags?: string[]
  is_active?: boolean
}

// Extended types with relationships
export interface BrandWithOrganization extends Brand {
  organization: Organization
}

export interface TopicWithOrganization extends Topic {
  organization: Organization
}

export interface PromptWithTopics extends Prompt {
  topics: Topic[]
}

export interface PromptWithOrganization extends Prompt {
  organization: Organization
}

export interface UserWithOrganizations extends User {
  organizations: Array<{
    organization: Organization
    role: UserOrganization['role']
  }>
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Filter and query types
export interface BrandFilters {
  organization_id?: string
  is_competitor?: boolean
  search?: string
}

export interface TopicFilters {
  organization_id?: string
  search?: string
}

export interface PromptFilters {
  organization_id?: string
  topic_id?: string
  is_active?: boolean
  language?: string
  region?: string
  search?: string
}

export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}