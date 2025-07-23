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
  ExternalLink,
  Download,
  ArrowUp,
  ArrowDown,
  FileText,
  Calendar
} from 'lucide-react'
import { citationService, PageCitationStats } from '@/lib/database/citations'
import { useAuth } from '@/contexts/AuthContext'

const platformIcons = {
  'ChatGPT': '🤖',
  'Perplexity': '🔍',
  'Google AI Overviews': '🌟',
  'Microsoft Copilot': '💼',
}

export function PageAnalysis() {
  const { organization } = useAuth()
  const [pageStats, setPageStats] = useState<PageCitationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'citations' | 'date' | 'url'>('citations')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'earned' | 'competitor' | 'social'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (organization) {
      loadPageStats()
    }
  }, [organization, currentPage, sortBy, sortOrder, filterType])

  const loadPageStats = async () => {
    if (!organization) return

    try {
      setLoading(true)
      setError(null)

      const filters = filterType !== 'all' ? { citation_type: filterType as any } : undefined
      const pagination = {
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy === 'citations' ? 'citation_count' : 
                 sortBy === 'date' ? 'last_cited' : 'url',
        sort_order: sortOrder
      }

      const result = await citationService.getPageCitationStats(
        organization.id,
        filters,
        pagination
      )

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setPageStats(result.data.data)
        setTotalPages(result.data.total_pages)
      }
    } catch (err) {
      setError('Failed to load page statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: 'citations' | 'date' | 'url') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const filteredPages = React.useMemo(() => {
    if (!searchTerm) return pageStats

    return pageStats.filter(page => 
      page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.page_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pageStats, searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const truncateUrl = (url: string, maxLength = 60) => {
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + '...'
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export page analysis data')
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
            onClick={loadPageStats}
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
          <h2 className="text-2xl font-bold tracking-tight">Page-Level Citation Analysis</h2>
          <p className="text-muted-foreground">
            Analyze individual page performance for AI citations
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Page Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Page Performance
          </CardTitle>
          <CardDescription>
            Individual URL citation performance and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search URLs, titles, or domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select 
              value={filterType} 
              onValueChange={(value: any) => {
                setFilterType(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="owned">Owned</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('url')}
                    >
                      Page
                      {sortBy === 'url' && (
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
                  <TableHead>Platforms</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('date')}
                    >
                      Last Cited
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.url}>
                    <TableCell className="max-w-md">
                      <div>
                        <div className="font-medium text-sm">
                          {page.page_title || 'Untitled Page'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {truncateUrl(page.url)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {page.domain}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{page.citation_count}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {page.platforms.map((platform) => (
                          <span 
                            key={platform}
                            className="text-sm"
                            title={platform}
                          >
                            {platformIcons[platform as keyof typeof platformIcons] || '❓'}
                          </span>
                        ))}
                        {page.platforms.length === 0 && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          page.citation_type === 'owned' ? 'default' :
                          page.citation_type === 'earned' ? 'secondary' :
                          page.citation_type === 'competitor' ? 'destructive' :
                          'outline'
                        }
                      >
                        {page.citation_type.charAt(0).toUpperCase() + page.citation_type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(page.last_cited)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(page.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pages found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}