'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Download,
  ExternalLink,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { citationService, CitationShareStats, DomainCitationStats } from '@/lib/database/citations'
import { useAuth } from '@/contexts/AuthContext'

const platformIcons = {
  'ChatGPT': '🤖',
  'Perplexity': '🔍',
  'Google AI Overviews': '🌟',
  'Microsoft Copilot': '💼',
}

export function DomainAnalysis() {
  const { organization } = useAuth()
  const [stats, setStats] = useState<CitationShareStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'citations' | 'share' | 'domain'>('citations')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'external'>('all')
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (organization) {
      loadDomainStats()
    }
  }, [organization, timeRange])

  const loadDomainStats = async () => {
    if (!organization) return

    try {
      setLoading(true)
      setError(null)

      // Calculate date range
      const now = new Date()
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const dateFrom = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString()

      const result = await citationService.getCitationShareStats(
        organization.id,
        dateFrom,
        now.toISOString()
      )

      if (result.error) {
        setError(result.error)
      } else {
        setStats(result.data)
      }
    } catch (err) {
      setError('Failed to load domain statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: 'citations' | 'share' | 'domain') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const filteredAndSortedDomains = React.useMemo(() => {
    if (!stats) return []

    let domains = [...stats.top_domains]

    // Apply search filter
    if (searchTerm) {
      domains = domains.filter(domain => 
        domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      domains = domains.filter(domain => 
        filterType === 'owned' ? domain.owned_by_brand : !domain.owned_by_brand
      )
    }

    // Apply sorting
    domains.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'citations':
          comparison = a.citation_count - b.citation_count
          break
        case 'share':
          comparison = a.percentage_share - b.percentage_share
          break
        case 'domain':
          comparison = a.domain.localeCompare(b.domain)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return domains
  }, [stats, searchTerm, filterType, sortBy, sortOrder])

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export domain analysis data')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadDomainStats}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Domain Analysis</h2>
          <p className="text-muted-foreground">
            Analyze citation performance by domain and platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Domain Rankings
          </CardTitle>
          <CardDescription>
            {filteredAndSortedDomains.length} domains found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={(value: 'all' | 'owned' | 'external') => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="owned">Owned Only</SelectItem>
                <SelectItem value="external">External Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Domain Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('domain')}
                    >
                      Domain
                      {sortBy === 'domain' && (
                        sortOrder === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('citations')}
                    >
                      Citations
                      {sortBy === 'citations' && (
                        sortOrder === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('share')}
                    >
                      Share
                      {sortBy === 'share' && (
                        sortOrder === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDomains.map((domain, index) => (
                  <TableRow key={domain.domain}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{domain.domain}</div>
                          <div className="text-xs text-muted-foreground">
                            {domain.citation_count} total citations
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{domain.citation_count}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{domain.percentage_share.toFixed(1)}%</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {domain.platforms.map((platform) => (
                          <div 
                            key={platform.platform_name}
                            className="flex items-center gap-1"
                            title={`${platform.platform_name}: ${platform.citation_count} citations`}
                          >
                            <span className="text-sm">
                              {platformIcons[platform.platform_name as keyof typeof platformIcons] || '❓'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {platform.citation_count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={domain.owned_by_brand ? "default" : "secondary"}
                      >
                        {domain.owned_by_brand ? "Owned" : "External"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {domain.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : domain.trend < 0 ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : null}
                        <span className={`text-xs ${
                          domain.trend > 0 ? 'text-green-500' : 
                          domain.trend < 0 ? 'text-red-500' : 
                          'text-muted-foreground'
                        }`}>
                          {domain.trend !== 0 && (domain.trend > 0 ? '+' : '')}{domain.trend.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedDomains.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No domains found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}