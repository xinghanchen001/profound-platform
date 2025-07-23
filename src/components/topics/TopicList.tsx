'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TopicForm } from './TopicForm'
import { topicService } from '@/lib/database/topics'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import type { Topic } from '@/types/database'
import { MoreHorizontal, Plus, Search, Hash } from 'lucide-react'

export function TopicList() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})

  const { organization } = useAuth()
  const { hasPermission } = usePermissions()

  const canCreateTopics = hasPermission('canCreatePrompts') // Topics are managed by prompt creators
  const canEditTopics = hasPermission('canEditPrompts')
  const canDeleteTopics = hasPermission('canDeletePrompts')

  useEffect(() => {
    if (organization) {
      loadTopics()
    }
  }, [organization])

  const loadTopics = async () => {
    if (!organization) return

    setLoading(true)
    setError(null)

    try {
      const result = await topicService.getByOrganization(organization.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        const topicsData = result.data || []
        setTopics(topicsData)
        
        // Load usage counts for each topic
        const counts: Record<string, number> = {}
        await Promise.all(
          topicsData.map(async (topic) => {
            const count = await topicService.getUsageCount(topic.id)
            counts[topic.id] = count
          })
        )
        setUsageCounts(counts)
      }
    } catch (err) {
      setError('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (topic: Topic) => {
    setTopics(prev => [topic, ...prev])
    setUsageCounts(prev => ({ ...prev, [topic.id]: 0 }))
    setShowCreateDialog(false)
  }

  const handleEditSuccess = (updatedTopic: Topic) => {
    setTopics(prev => prev.map(topic => 
      topic.id === updatedTopic.id ? updatedTopic : topic
    ))
    setShowEditDialog(false)
    setEditingTopic(null)
  }

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic)
    setShowEditDialog(true)
  }

  const handleDelete = async (topic: Topic) => {
    const usageCount = usageCounts[topic.id] || 0
    
    if (usageCount > 0) {
      alert(`Cannot delete "${topic.name}" because it is used by ${usageCount} prompt(s). Please remove it from all prompts first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${topic.name}"?`)) {
      return
    }

    try {
      const result = await topicService.delete(topic.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setTopics(prev => prev.filter(t => t.id !== topic.id))
        setUsageCounts(prev => {
          const { [topic.id]: _, ...rest } = prev
          return rest
        })
      }
    } catch (err) {
      setError('Failed to delete topic')
    }
  }

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select an organization to view topics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Topics</h2>
          <p className="text-muted-foreground">
            Organize your prompts into topics for better management
          </p>
        </div>
        {canCreateTopics && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogDescription>
                  Create a new topic to organize your prompts. Topics help categorize and manage your prompt collections.
                </DialogDescription>
              </DialogHeader>
              <TopicForm
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
              <CardTitle>All Topics</CardTitle>
              <CardDescription>
                {filteredTopics.length} of {topics.length} topics
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading topics...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No topics found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No topics match your search.' : 'Get started by creating your first topic.'}
              </p>
              {canCreateTopics && !searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Topic
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prompts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        {topic.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {topic.description ? (
                        <span className="text-sm text-muted-foreground">
                          {topic.description.length > 100 
                            ? `${topic.description.slice(0, 100)}...` 
                            : topic.description
                          }
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {usageCounts[topic.id] || 0} prompts
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(topic.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(canEditTopics || canDeleteTopics) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditTopics && (
                              <DropdownMenuItem onClick={() => handleEdit(topic)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDeleteTopics && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(topic)}
                                className="text-red-600"
                                disabled={usageCounts[topic.id] > 0}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          {editingTopic && (
            <TopicForm
              topic={editingTopic}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingTopic(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}