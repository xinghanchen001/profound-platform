import { createClient } from '@/lib/supabase/client'
import type { 
  Brand, 
  CreateBrandInput, 
  UpdateBrandInput, 
  BrandFilters,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '@/types/database'

const supabase = createClient()

export const brandService = {
  // Get all brands with optional filters and pagination
  async getAll(
    filters?: BrandFilters, 
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Brand>>> {
    try {
      let query = supabase
        .from('brands')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }
      if (filters?.is_competitor !== undefined) {
        query = query.eq('is_competitor', filters.is_competitor)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`)
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

  // Get a single brand by ID
  async getById(id: string): Promise<ApiResponse<Brand>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Brand not found'
      }
    }
  },

  // Create a new brand
  async create(input: CreateBrandInput): Promise<ApiResponse<Brand>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({
          ...input,
          is_competitor: input.is_competitor || false
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create brand'
      }
    }
  },

  // Update an existing brand
  async update(id: string, input: UpdateBrandInput): Promise<ApiResponse<Brand>> {
    try {
      const { data, error } = await supabase
        .from('brands')
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
        error: error instanceof Error ? error.message : 'Failed to update brand'
      }
    }
  },

  // Delete a brand
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete brand'
      }
    }
  },

  // Get brands by organization
  async getByOrganization(organizationId: string): Promise<ApiResponse<Brand[]>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch brands'
      }
    }
  },

  // Check if brand name exists in organization
  async nameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('brands')
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
  }
}