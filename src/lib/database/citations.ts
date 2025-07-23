import { createClient } from '@/lib/supabase/client'
import type { 
  Citation,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '@/types/database'

const supabase = createClient()

export interface CitationFilters {
  organization_id?: string
  platform_id?: string
  brand_id?: string
  citation_type?: 'owned' | 'earned' | 'competitor' | 'social'
  domain?: string
  date_from?: string
  date_to?: string
}

export interface DomainCitationStats {
  domain: string
  citation_count: number
  percentage_share: number
  platforms: {
    platform_name: string
    citation_count: number
  }[]
  trend: number // percentage change from previous period
  owned_by_brand: boolean
}

export interface CitationShareStats {
  total_citations: number
  owned_citations: number
  earned_citations: number
  competitor_citations: number
  social_citations: number
  citation_share_percentage: number
  trend: number
  top_domains: DomainCitationStats[]
}

export interface PageCitationStats {
  url: string
  page_title: string
  domain: string
  citation_count: number
  platforms: string[]
  citation_type: 'owned' | 'earned' | 'competitor' | 'social'
  last_cited: string
}

export const citationService = {
  // Get all citations with filters and pagination
  async getAll(
    filters?: CitationFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Citation>>> {
    try {
      let query = supabase
        .from('citations')
        .select(`
          *,
          execution_results (
            id,
            brand_id,
            is_mentioned,
            sentiment,
            prompt_executions (
              id,
              platform_id,
              platforms (
                id,
                name,
                slug
              )
            )
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters?.citation_type) {
        query = query.eq('citation_type', filters.citation_type)
      }
      if (filters?.domain) {
        query = query.ilike('domain', `%${filters.domain}%`)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
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

  // Get citation share statistics for an organization
  async getCitationShareStats(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<CitationShareStats>> {
    try {
      // Get all citations for the organization's brands within date range
      let query = supabase
        .from('citations')
        .select(`
          *,
          execution_results (
            brand_id,
            prompt_executions (
              platform_id,
              platforms (name),
              prompts (organization_id)
            )
          )
        `)

      if (dateFrom) query = query.gte('created_at', dateFrom)
      if (dateTo) query = query.lte('created_at', dateTo)

      const { data: citationsData, error } = await query

      if (error) throw error

      // Filter citations for this organization
      const orgCitations = citationsData?.filter(citation => 
        citation.execution_results?.prompt_executions?.prompts?.organization_id === organizationId
      ) || []

      // Calculate statistics
      const totalCitations = orgCitations.length
      const ownedCitations = orgCitations.filter(c => c.citation_type === 'owned').length
      const earnedCitations = orgCitations.filter(c => c.citation_type === 'earned').length
      const competitorCitations = orgCitations.filter(c => c.citation_type === 'competitor').length
      const socialCitations = orgCitations.filter(c => c.citation_type === 'social').length

      // Calculate domain statistics
      const domainMap = new Map<string, {
        count: number
        platforms: Map<string, number>
        type: string
      }>()

      orgCitations.forEach(citation => {
        const domain = citation.domain
        const platformName = citation.execution_results?.prompt_executions?.platforms?.name || 'Unknown'
        
        if (!domainMap.has(domain)) {
          domainMap.set(domain, {
            count: 0,
            platforms: new Map(),
            type: citation.citation_type
          })
        }
        
        const domainStats = domainMap.get(domain)!
        domainStats.count++
        domainStats.platforms.set(platformName, (domainStats.platforms.get(platformName) || 0) + 1)
      })

      // Convert to sorted array
      const topDomains: DomainCitationStats[] = Array.from(domainMap.entries())
        .map(([domain, stats]) => ({
          domain,
          citation_count: stats.count,
          percentage_share: totalCitations > 0 ? (stats.count / totalCitations) * 100 : 0,
          platforms: Array.from(stats.platforms.entries()).map(([name, count]) => ({
            platform_name: name,
            citation_count: count
          })),
          trend: 0, // TODO: Calculate trend from previous period
          owned_by_brand: stats.type === 'owned'
        }))
        .sort((a, b) => b.citation_count - a.citation_count)
        .slice(0, 10) // Top 10 domains

      const citationSharePercentage = totalCitations > 0 ? 
        ((ownedCitations + earnedCitations) / totalCitations) * 100 : 0

      return {
        data: {
          total_citations: totalCitations,
          owned_citations: ownedCitations,
          earned_citations: earnedCitations,
          competitor_citations: competitorCitations,
          social_citations: socialCitations,
          citation_share_percentage: citationSharePercentage,
          trend: 0, // TODO: Calculate trend
          top_domains: topDomains
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch citation statistics'
      }
    }
  },

  // Get page-level citation analysis
  async getPageCitationStats(
    organizationId: string,
    filters?: CitationFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<PageCitationStats>>> {
    try {
      let query = supabase
        .from('citations')
        .select(`
          url,
          page_title,
          domain,
          citation_type,
          created_at,
          execution_results (
            prompt_executions (
              platform_id,
              platforms (name),
              prompts (organization_id)
            )
          )
        `, { count: 'exact' })

      if (filters?.citation_type) {
        query = query.eq('citation_type', filters.citation_type)
      }
      if (filters?.domain) {
        query = query.ilike('domain', `%${filters.domain}%`)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data: citationsData, error, count } = await query

      if (error) throw error

      // Filter and group by URL
      const orgCitations = citationsData?.filter(citation => 
        citation.execution_results?.prompt_executions?.prompts?.organization_id === organizationId
      ) || []

      const urlMap = new Map<string, {
        page_title: string
        domain: string
        citation_type: string
        citations: any[]
        platforms: Set<string>
        last_cited: string
      }>()

      orgCitations.forEach(citation => {
        const url = citation.url
        if (!urlMap.has(url)) {
          urlMap.set(url, {
            page_title: citation.page_title || 'Unknown',
            domain: citation.domain,
            citation_type: citation.citation_type,
            citations: [],
            platforms: new Set(),
            last_cited: citation.created_at
          })
        }
        
        const urlStats = urlMap.get(url)!
        urlStats.citations.push(citation)
        const platformName = citation.execution_results?.prompt_executions?.platforms?.name
        if (platformName) urlStats.platforms.add(platformName)
        
        // Update last cited if this citation is more recent
        if (citation.created_at > urlStats.last_cited) {
          urlStats.last_cited = citation.created_at
        }
      })

      // Convert to array and sort
      const pageStats: PageCitationStats[] = Array.from(urlMap.entries())
        .map(([url, stats]) => ({
          url,
          page_title: stats.page_title,
          domain: stats.domain,
          citation_count: stats.citations.length,
          platforms: Array.from(stats.platforms),
          citation_type: stats.citation_type as any,
          last_cited: stats.last_cited
        }))
        .sort((a, b) => b.citation_count - a.citation_count)

      // Apply pagination
      const page = pagination?.page || 1
      const perPage = pagination?.per_page || 10
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedData = pageStats.slice(startIndex, endIndex)
      const totalPages = Math.ceil(pageStats.length / perPage)

      return {
        data: {
          data: paginatedData,
          count: pageStats.length,
          page,
          per_page: perPage,
          total_pages: totalPages
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch page citation statistics'
      }
    }
  },

  // Create a new citation
  async create(citation: Omit<Citation, 'id' | 'created_at'>): Promise<ApiResponse<Citation>> {
    try {
      const { data, error } = await supabase
        .from('citations')
        .insert(citation)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create citation'
      }
    }
  },

  // Get citation network data for 3D visualization
  async getCitationNetworkData(
    organizationId: string,
    filters?: CitationFilters
  ): Promise<ApiResponse<{
    nodes: { id: string; label: string; type: string; size: number }[]
    links: { source: string; target: string; weight: number }[]
  }>> {
    try {
      // Get citations with related data
      let query = supabase
        .from('citations')
        .select(`
          domain,
          citation_type,
          execution_results (
            brand_id,
            brands (name),
            prompt_executions (
              platform_id,
              platforms (name),
              prompts (organization_id)
            )
          )
        `)

      if (filters?.citation_type) {
        query = query.eq('citation_type', filters.citation_type)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data: citationsData, error } = await query

      if (error) throw error

      // Filter for organization
      const orgCitations = citationsData?.filter(citation => 
        citation.execution_results?.prompt_executions?.prompts?.organization_id === organizationId
      ) || []

      // Build network data
      const nodes = new Map<string, { label: string; type: string; size: number }>()
      const linkMap = new Map<string, number>()

      orgCitations.forEach(citation => {
        const domain = citation.domain
        const brandName = citation.execution_results?.brands?.name || 'Unknown Brand'
        const platformName = citation.execution_results?.prompt_executions?.platforms?.name || 'Unknown Platform'

        // Add domain node
        if (!nodes.has(domain)) {
          nodes.set(domain, {
            label: domain,
            type: citation.citation_type,
            size: 0
          })
        }
        nodes.get(domain)!.size++

        // Add brand node
        if (!nodes.has(brandName)) {
          nodes.set(brandName, {
            label: brandName,
            type: 'brand',
            size: 0
          })
        }
        nodes.get(brandName)!.size++

        // Add platform node
        if (!nodes.has(platformName)) {
          nodes.set(platformName, {
            label: platformName,
            type: 'platform',
            size: 0
          })
        }
        nodes.get(platformName)!.size++

        // Add links
        const domainBrandLink = `${domain}-${brandName}`
        const brandPlatformLink = `${brandName}-${platformName}`
        
        linkMap.set(domainBrandLink, (linkMap.get(domainBrandLink) || 0) + 1)
        linkMap.set(brandPlatformLink, (linkMap.get(brandPlatformLink) || 0) + 1)
      })

      // Convert to arrays
      const nodesArray = Array.from(nodes.entries()).map(([id, data]) => ({
        id,
        ...data
      }))

      const linksArray = Array.from(linkMap.entries()).map(([link, weight]) => {
        const [source, target] = link.split('-')
        return { source, target, weight }
      })

      return {
        data: {
          nodes: nodesArray,
          links: linksArray
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch citation network data'
      }
    }
  }
}