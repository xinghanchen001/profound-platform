'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PromptForm } from './PromptForm'
import { promptService } from '@/lib/database/prompts'
import { topicService } from '@/lib/database/topics'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import type { Prompt, Topic } from '@/types/database'
import { MoreHorizontal, Plus, Search, FileText, Play, Pause } from 'lucide-react'

interface PromptListProps {
  onRefresh?: () => void
}

export function PromptList({ onRefresh }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { organization } = useAuth()
  const { hasPermission } = usePermissions()

  const canCreatePrompts = hasPermission('canCreatePrompts')
  const canEditPrompts = hasPermission('canEditPrompts')
  const canDeletePrompts = hasPermission('canDeletePrompts')
  const canExecutePrompts = hasPermission('canExecutePrompts')

  useEffect(() => {
    if (organization) {
      loadData()
    }
  }, [organization])

  const loadData = async () => {
    if (!organization) return

    setLoading(true)
    setError(null)

    try {
      const [promptsResult, topicsResult] = await Promise.all([
        promptService.getByOrganization(organization.id),
        topicService.getByOrganization(organization.id)
      ])
      
      if (promptsResult.error) {
        setError(promptsResult.error)
      } else {
        setPrompts(promptsResult.data || [])
      }

      if (topicsResult.data) {
        setTopics(topicsResult.data)
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (prompt: Prompt) => {
    setPrompts(prev => [prompt, ...prev])
    setShowCreateDialog(false)
  }

  const handleEditSuccess = (updatedPrompt: Prompt) => {
    setPrompts(prev => prev.map(prompt => 
      prompt.id === updatedPrompt.id ? updatedPrompt : prompt
    ))
    setShowEditDialog(false)
    setEditingPrompt(null)
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setShowEditDialog(true)
  }

  const handleToggleActive = async (prompt: Prompt) => {
    try {
      const result = await promptService.update(prompt.id, {
        is_active: !prompt.is_active
      })
      
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setPrompts(prev => prev.map(p => 
          p.id === prompt.id ? result.data! : p
        ))
      }
    } catch (err) {
      setError('Failed to update prompt status')
    }
  }

  const handleDelete = async (prompt: Prompt) => {
    if (!confirm(`Are you sure you want to delete this prompt?`)) {
      return
    }

    try {
      const result = await promptService.delete(prompt.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setPrompts(prev => prev.filter(p => p.id !== prompt.id))
      }
    } catch (err) {
      setError('Failed to delete prompt')
    }
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && prompt.is_active) ||
                         (statusFilter === 'inactive' && !prompt.is_active)
    
    // Note: Topic filtering would require loading prompt-topic relationships
    // For now, we'll implement basic filtering
    
    return matchesSearch && matchesStatus
  })

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select an organization to view prompts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prompts</h2>
          <p className="text-muted-foreground">
            Create and manage prompts for AI search testing
          </p>
        </div>
        {canCreatePrompts && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
              </DialogHeader>
              <PromptForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Prompts</CardTitle>
              <CardDescription>
                {filteredPrompts.length} of {prompts.length} prompts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading prompts...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No prompts match your search.' : 'Get started by creating your first prompt.'}
              </p>
              {canCreatePrompts && !searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Prompt
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="max-w-md">
                      <div className="font-medium text-sm">
                        {prompt.text.length > 100 
                          ? `${prompt.text.slice(0, 100)}...` 
                          : prompt.text
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prompt.language.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prompt.region.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {prompt.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{prompt.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={prompt.is_active ? "default" : "secondary"}>
                          {prompt.is_active ? (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(canEditPrompts || canDeletePrompts || canExecutePrompts) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditPrompts && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(prompt)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(prompt)}>
                                  {prompt.is_active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                              </>
                            )}
                            {canExecutePrompts && (
                              <DropdownMenuItem>
                                Execute Prompt
                              </DropdownMenuItem>
                            )}
                            {canDeletePrompts && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(prompt)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <PromptForm
              prompt={editingPrompt}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingPrompt(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}