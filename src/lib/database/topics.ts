import { createClient } from '@/lib/supabase/client'
import type { 
  Topic, 
  CreateTopicInput, 
  UpdateTopicInput, 
  TopicFilters,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '@/types/database'

const supabase = createClient()

export const topicService = {
  // Get all topics with optional filters and pagination
  async getAll(
    filters?: TopicFilters, 
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Topic>>> {
    try {
      let query = supabase
        .from('topics')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply pagination and sorting
      const page = pagination?.page || 1
      const perPage = pagination?.per_page || 10
      const sortBy = pagination?.sort_by || 'created_at'
      const sortOrder = pagination?.sort_order || 'desc'

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * perPage, page * perPage - 1)

      const { data, error, count } = await query

      if (error) throw error

      const totalPages = Math.ceil((count || 0) / perPage)

      return {
        data: {
          data: data || [],
          count: count || 0,
          page,
          per_page: perPage,
          total_pages: totalPages
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  },

  // Get a single topic by ID
  async getById(id: string): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Topic not found'
      }
    }
  },

  // Create a new topic
  async create(input: CreateTopicInput): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert(input)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create topic'
      }
    }
  },

  // Update an existing topic
  async update(id: string, input: UpdateTopicInput): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update topic'
      }
    }
  },

  // Delete a topic
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete topic'
      }
    }
  },

  // Get topics by organization
  async getByOrganization(organizationId: string): Promise<ApiResponse<Topic[]>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch topics'
      }
    }
  },

  // Check if topic name exists in organization
  async nameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('topics')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('name', name)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).length > 0
    } catch (error) {
      return false
    }
  },

  // Get topic usage count (number of prompts using this topic)
  async getUsageCount(topicId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('prompt_topics')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId)

      if (error) throw error

      return count || 0
    } catch (error) {
      return 0
    }
  }
}