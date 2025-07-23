'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Link, 
  Globe, 
  Share2, 
  BarChart3,
  Download,
  Calendar
} from 'lucide-react'
import { citationService, CitationShareStats } from '@/lib/database/citations'
import { useAuth } from '@/contexts/AuthContext'

export function CitationOverview() {
  const { organization } = useAuth()
  const [stats, setStats] = useState<CitationShareStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (organization) {
      loadCitationStats()
    }
  }, [organization, timeRange])

  const loadCitationStats = async () => {
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
      setError('Failed to load citation statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export citation data')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            onClick={loadCitationStats}
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
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Citation Share Overview</h2>
          <p className="text-muted-foreground">
            Monitor how AI engines cite sources when mentioning your brand
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citation Share</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.citation_share_percentage.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats?.trend && stats.trend > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(stats?.trend || 0).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_citations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all AI platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owned Citations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.owned_citations || 0}</div>
            <p className="text-xs text-muted-foreground">
              From your own domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned Citations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.earned_citations || 0}</div>
            <p className="text-xs text-muted-foreground">
              From third-party sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Citation Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Citation Type Distribution</CardTitle>
          <CardDescription>
            Breakdown of citations by type and source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citation Types */}
            <div className="space-y-4">
              <h4 className="font-medium">By Source Type</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">Owned</Badge>
                    <span className="text-sm">{stats?.owned_citations || 0} citations</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.total_citations ? 
                      ((stats.owned_citations / stats.total_citations) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <Progress 
                  value={stats?.total_citations ? 
                    (stats.owned_citations / stats.total_citations) * 100 : 0} 
                  className="h-2" 
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-500">Earned</Badge>
                    <span className="text-sm">{stats?.earned_citations || 0} citations</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.total_citations ? 
                      ((stats.earned_citations / stats.total_citations) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <Progress 
                  value={stats?.total_citations ? 
                    (stats.earned_citations / stats.total_citations) * 100 : 0} 
                  className="h-2" 
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-orange-500">Competitor</Badge>
                    <span className="text-sm">{stats?.competitor_citations || 0} citations</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.total_citations ? 
                      ((stats.competitor_citations / stats.total_citations) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <Progress 
                  value={stats?.total_citations ? 
                    (stats.competitor_citations / stats.total_citations) * 100 : 0} 
                  className="h-2" 
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-500">Social</Badge>
                    <span className="text-sm">{stats?.social_citations || 0} citations</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.total_citations ? 
                      ((stats.social_citations / stats.total_citations) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <Progress 
                  value={stats?.total_citations ? 
                    (stats.social_citations / stats.total_citations) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>

            {/* Top Domains */}
            <div className="space-y-4">
              <h4 className="font-medium">Top Citing Domains</h4>
              <div className="space-y-3">
                {stats?.top_domains.slice(0, 5).map((domain, index) => (
                  <div key={domain.domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium">{domain.domain}</div>
                        <div className="text-xs text-muted-foreground">
                          {domain.citation_count} citations
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {domain.percentage_share.toFixed(1)}%
                      </div>
                      <Badge 
                        variant={domain.owned_by_brand ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {domain.owned_by_brand ? "Owned" : "External"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}