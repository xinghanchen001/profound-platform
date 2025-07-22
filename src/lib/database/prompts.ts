import { createClient } from '@/lib/supabase/client'
import type { 
  Prompt, 
  CreatePromptInput, 
  UpdatePromptInput, 
  PromptFilters,
  PromptWithTopics,
  Topic,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '@/types/database'

const supabase = createClient()

export const promptService = {
  // Get all prompts with optional filters and pagination
  async getAll(
    filters?: PromptFilters, 
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Prompt>>> {
    try {
      let query = supabase
        .from('prompts')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.language) {
        query = query.eq('language', filters.language)
      }
      if (filters?.region) {
        query = query.eq('region', filters.region)
      }
      if (filters?.search) {
        query = query.ilike('text', `%${filters.search}%`)
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

  // Get a single prompt by ID
  async getById(id: string): Promise<ApiResponse<Prompt>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Prompt not found'
      }
    }
  },

  // Get a prompt with its associated topics
  async getByIdWithTopics(id: string): Promise<ApiResponse<PromptWithTopics>> {
    try {
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

      if (promptError) throw promptError

      const { data: topicsData, error: topicsError } = await supabase
        .from('prompt_topics')
        .select(`
          topic_id,
          topics (*)
        `)
        .eq('prompt_id', id)

      if (topicsError) throw topicsError

      const topics = topicsData?.map((item: { topics: Topic }) => item.topics).filter(Boolean) as Topic[] || []

      return { 
        data: { ...prompt, topics }, 
        error: null 
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Prompt not found'
      }
    }
  },

  // Create a new prompt
  async create(input: CreatePromptInput, topicIds?: string[]): Promise<ApiResponse<Prompt>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...input,
          language: input.language || 'en',
          region: input.region || 'us',
          tags: input.tags || [],
          is_active: input.is_active !== undefined ? input.is_active : true
        })
        .select()
        .single()

      if (error) throw error

      // Associate with topics if provided
      if (topicIds && topicIds.length > 0) {
        const topicAssociations = topicIds.map(topicId => ({
          prompt_id: data.id,
          topic_id: topicId
        }))

        const { error: topicError } = await supabase
          .from('prompt_topics')
          .insert(topicAssociations)

        if (topicError) {
          // If topic association fails, clean up the prompt
          await supabase.from('prompts').delete().eq('id', data.id)
          throw topicError
        }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create prompt'
      }
    }
  },

  // Update an existing prompt
  async update(id: string, input: UpdatePromptInput, topicIds?: string[]): Promise<ApiResponse<Prompt>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update topic associations if provided
      if (topicIds !== undefined) {
        // Remove existing associations
        await supabase
          .from('prompt_topics')
          .delete()
          .eq('prompt_id', id)

        // Add new associations
        if (topicIds.length > 0) {
          const topicAssociations = topicIds.map(topicId => ({
            prompt_id: id,
            topic_id: topicId
          }))

          const { error: topicError } = await supabase
            .from('prompt_topics')
            .insert(topicAssociations)

          if (topicError) throw topicError
        }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update prompt'
      }
    }
  },

  // Delete a prompt
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Cascade delete will handle prompt_topics, but let's be explicit
      await supabase
        .from('prompt_topics')
        .delete()
        .eq('prompt_id', id)

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete prompt'
      }
    }
  },

  // Get prompts by organization
  async getByOrganization(organizationId: string): Promise<ApiResponse<Prompt[]>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch prompts'
      }
    }
  },

  // Get prompts by topic
  async getByTopic(topicId: string): Promise<ApiResponse<Prompt[]>> {
    try {
      const { data, error } = await supabase
        .from('prompt_topics')
        .select(`
          prompts (*)
        `)
        .eq('topic_id', topicId)

      if (error) throw error

      const prompts = data?.map((item: { prompts: Prompt }) => item.prompts).filter(Boolean) as Prompt[] || []

      return { data: prompts, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch prompts'
      }
    }
  },

  // Get active prompts for execution
  async getActivePrompts(organizationId: string): Promise<ApiResponse<Prompt[]>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch active prompts'
      }
    }
  },

  // Get prompt execution statistics
  async getExecutionStats(promptId: string): Promise<ApiResponse<{
    total_executions: number
    successful_executions: number
    failed_executions: number
    last_execution?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('prompt_executions')
        .select('status, executed_at')
        .eq('prompt_id', promptId)

      if (error) throw error

      const executions = data || []
      const stats = {
        total_executions: executions.length,
        successful_executions: executions.filter((e: any) => e.status === 'completed').length,
        failed_executions: executions.filter((e: any) => e.status === 'failed').length,
        last_execution: executions.length > 0 
          ? executions.sort((a: any, b: any) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())[0].executed_at
          : undefined
      }

      return { data: stats, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch execution stats'
      }
    }
  }
}