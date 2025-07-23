'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Search, ChevronDown, ChevronRight, Play, Calendar, BarChart3, Target, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { analyticsService, PromptAnalyticsGroup, PromptAnalyticsStats } from '@/lib/database/analytics'
import { promptService } from '@/lib/database/prompts'
import { useAuth } from '@/contexts/AuthContext'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { PromptForm } from '@/components/prompts/PromptForm'
import type { Prompt } from '@/types/database'


const platformIcons = {
  'ChatGPT': '🤖',
  'Perplexity': '🔍',
  'Google AI Overviews': '🌟',
  'Microsoft Copilot': '💼',
}

export function PromptsInsights() {
  const { organization } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [stats, setStats] = useState<PromptAnalyticsStats | null>(null)
  const [promptGroups, setPromptGroups] = useState<PromptAnalyticsGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit/Delete modal states
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [deletingPrompt, setDeletingPrompt] = useState<{ id: string; text: string } | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    if (!organization?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getPromptAnalytics(organization.id)
      setStats(data.stats)
      setPromptGroups(data.groups)
      // Auto-expand first group if any
      if (data.groups.length > 0) {
        setExpandedGroups([data.groups[0].id])
      }
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }, [organization?.id])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const filteredGroups = promptGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTopic = selectedTopic === 'all' || group.topic.toLowerCase() === selectedTopic.toLowerCase()
    return matchesSearch && matchesTopic
  })

  const uniqueTopics = [...new Set(promptGroups.map(group => group.topic.toLowerCase()))]

  // Handler functions for edit/delete operations
  const handleEditPrompt = async (promptId: string) => {
    try {
      setActionLoading(true)
      const result = await promptService.getById(promptId)
      if (result.data) {
        setEditingPrompt(result.data)
        setIsEditDialogOpen(true)
      } else {
        setError(result.error || 'Failed to load prompt')
      }
    } catch (err) {
      setError('Failed to load prompt for editing')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePrompt = (promptId: string, promptText: string) => {
    setDeletingPrompt({ id: promptId, text: promptText })
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePrompt = async () => {
    if (!deletingPrompt) return

    try {
      setActionLoading(true)
      const result = await promptService.delete(deletingPrompt.id)
      if (result.error) {
        setError(result.error)
      } else {
        // Refresh the analytics data
        await fetchAnalytics()
        setIsDeleteDialogOpen(false)
        setDeletingPrompt(null)
      }
    } catch (err) {
      setError('Failed to delete prompt')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false)
    setEditingPrompt(null)
    // Refresh the analytics data
    await fetchAnalytics()
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setEditingPrompt(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            onClick={() => window.location.reload()}
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPrompts || 0}</div>
            <p className="text-xs text-muted-foreground">Across all topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExecutions || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Visibility</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgVisibility || 0}%</div>
            <p className="text-xs text-green-500">+3.8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lastRun || 'Never'}</div>
            <p className="text-xs text-muted-foreground">Auto-execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Prompt Analysis</CardTitle>
              <CardDescription>
                {filteredGroups.length} prompt groups • {filteredGroups.reduce((sum, group) => sum + group.promptCount, 0)} total prompts
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {uniqueTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>Run All</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <Collapsible 
                key={group.id}
                open={expandedGroups.includes(group.id)}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        {expandedGroups.includes(group.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{group.title}</h3>
                            <Badge variant="outline">{group.topic}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.promptCount} prompts • {group.executions} executions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-medium">{group.visibility}%</div>
                          <div className={`text-xs ${group.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {group.trend >= 0 ? '+' : ''}{group.trend}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">#{group.rank}</div>
                          <div className="text-xs text-muted-foreground">Rank</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{group.shareOfVoice}%</div>
                          <div className="text-xs text-muted-foreground">Share</div>
                        </div>
                        <div className="w-24">
                          <Progress value={group.visibility} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Prompt</TableHead>
                            <TableHead>Mentioned</TableHead>
                            <TableHead>Platforms</TableHead>
                            <TableHead>Response Preview</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead className="w-12">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.prompts.map((prompt) => (
                            <TableRow key={prompt.id}>
                              <TableCell className="max-w-sm">
                                <div className="font-medium text-sm">
                                  {prompt.text.length > 80 
                                    ? `${prompt.text.slice(0, 80)}...` 
                                    : prompt.text
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={prompt.mentions ? "default" : "secondary"}>
                                  {prompt.mentions ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {prompt.platforms.map((platform) => (
                                    <span 
                                      key={platform}
                                      className="text-lg"
                                      title={platform}
                                    >
                                      {platformIcons[platform as keyof typeof platformIcons] || '❓'}
                                    </span>
                                  ))}
                                  {prompt.platforms.length === 0 && (
                                    <span className="text-muted-foreground text-sm">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-md">
                                {prompt.response ? (
                                  <div className="text-sm text-muted-foreground">
                                    {prompt.response.slice(0, 100)}...
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No response</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{prompt.region}</Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0"
                                      disabled={actionLoading}
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditPrompt(prompt.id)}
                                      disabled={actionLoading}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePrompt(prompt.id, prompt.text)}
                                      disabled={actionLoading}
                                      variant="destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update the prompt information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingPrompt && (
            <PromptForm
              prompt={editingPrompt}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt:
              <br />
              <br />
              <span className="font-medium bg-muted p-2 rounded text-sm block max-w-full overflow-hidden text-ellipsis">
                &quot;{deletingPrompt?.text.slice(0, 100)}{deletingPrompt?.text && deletingPrompt.text.length > 100 ? '...' : ''}&quot;
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePrompt}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}