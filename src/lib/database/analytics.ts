import { createClient } from '@/lib/supabase/client'

export interface PromptAnalyticsGroup {
  id: string
  title: string
  topic: string
  promptCount: number
  visibility: number
  trend: number
  rank: number
  shareOfVoice: number
  executions: number
  lastRun: string
  prompts: PromptAnalyticsItem[]
}

export interface PromptAnalyticsItem {
  id: string
  text: string
  mentions: boolean
  platforms: string[]
  response: string | null
  region: string
}

export interface PromptAnalyticsStats {
  totalPrompts: number
  totalExecutions: number
  avgVisibility: number
  lastRun: string
}

export const analyticsService = {
  async getPromptAnalytics(organizationId: string): Promise<{
    stats: PromptAnalyticsStats
    groups: PromptAnalyticsGroup[]
  }> {
    const supabase = createClient()

    try {
      // Get all prompts with their topics and execution data
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select(`
          id,
          text,
          language,
          region,
          tags,
          is_active,
          created_at,
          prompt_topics (
            topics (
              id,
              name,
              description
            )
          ),
          prompt_executions (
            id,
            platform_id,
            status,
            executed_at,
            completed_at,
            platforms (
              id,
              name,
              slug
            ),
            execution_results (
              id,
              brand_id,
              is_mentioned,
              sentiment,
              response_text,
              response_position,
              brands (
                id,
                name,
                is_competitor
              )
            )
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      if (promptsError) throw promptsError

      // Process the data to group by topics
      const topicGroups = new Map<string, {
        id: string
        name: string
        prompts: any[]
        executions: number
        successfulExecutions: number
      }>()

      let totalPrompts = 0
      let totalExecutions = 0
      let totalSuccessfulExecutions = 0
      let lastRunDate = new Date(0)

      // Process each prompt
      promptsData?.forEach(prompt => {
        totalPrompts++
        
        // Get topic information
        const topic = prompt.prompt_topics?.[0]?.topics
        const topicId = topic?.id || 'uncategorized'
        const topicName = topic?.name || 'Uncategorized'

        if (!topicGroups.has(topicId)) {
          topicGroups.set(topicId, {
            id: topicId,
            name: topicName,
            prompts: [],
            executions: 0,
            successfulExecutions: 0
          })
        }

        const group = topicGroups.get(topicId)!

        // Count executions
        const executions = prompt.prompt_executions || []
        const successfulExecutions = executions.filter(ex => ex.status === 'completed')
        
        group.executions += executions.length
        group.successfulExecutions += successfulExecutions.length
        totalExecutions += executions.length

        // Find latest execution date
        executions.forEach(ex => {
          if (ex.executed_at) {
            const execDate = new Date(ex.executed_at)
            if (execDate > lastRunDate) {
              lastRunDate = execDate
            }
          }
        })

        // Process platforms and responses
        const platforms = new Set<string>()
        let hasPositiveMention = false
        let sampleResponse: string | null = null

        successfulExecutions.forEach(execution => {
          if (execution.platforms?.name) {
            platforms.add(execution.platforms.name)
          }

          execution.execution_results?.forEach(result => {
            if (result.is_mentioned && !result.brands?.is_competitor) {
              hasPositiveMention = true
              if (!sampleResponse && result.response_text) {
                sampleResponse = result.response_text
              }
            }
          })
        })

        // Add prompt to group
        group.prompts.push({
          id: prompt.id,
          text: prompt.text,
          mentions: hasPositiveMention,
          platforms: Array.from(platforms),
          response: sampleResponse,
          region: prompt.region?.toUpperCase() || 'US'
        })
      })

      // Calculate stats
      const avgVisibility = totalExecutions > 0 ? (totalSuccessfulExecutions / totalExecutions) * 100 : 0
      
      const stats: PromptAnalyticsStats = {
        totalPrompts,
        totalExecutions,
        avgVisibility: Math.round(avgVisibility * 10) / 10,
        lastRun: lastRunDate.getTime() > 0 ? formatTimeAgo(lastRunDate) : 'Never'
      }

      // Convert to groups array with analytics
      const groups: PromptAnalyticsGroup[] = Array.from(topicGroups.values())
        .map((group, index) => {
          const visibility = group.executions > 0 ? 
            (group.successfulExecutions / group.executions) * 100 : 0
          
          return {
            id: group.id,
            title: group.name,
            topic: group.name.split(' ')[0], // First word as badge
            promptCount: group.prompts.length,
            visibility: Math.round(visibility * 10) / 10,
            trend: Math.random() * 20 - 10, // Random trend for now
            rank: index + 1,
            shareOfVoice: Math.round((group.executions / totalExecutions) * 100 * 10) / 10,
            executions: group.executions,
            lastRun: new Date().toISOString(),
            prompts: group.prompts
          }
        })
        .sort((a, b) => b.visibility - a.visibility) // Sort by visibility
        .map((group, index) => ({ ...group, rank: index + 1 })) // Update ranks

      return { stats, groups }
    } catch (error) {
      console.error('Error fetching prompt analytics:', error)
      throw error
    }
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}