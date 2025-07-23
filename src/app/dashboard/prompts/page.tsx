'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PromptList } from '@/components/prompts/PromptList'
import { PromptDesigner } from '@/components/prompts/PromptDesigner'
import { PromptBulkOperations } from '@/components/prompts/PromptBulkOperations'
import { PromptScheduler } from '@/components/prompts/PromptScheduler'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { promptService } from '@/lib/database/prompts'
import type { Prompt } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Wand2, 
  List, 
  Upload, 
  Calendar, 
  Plus,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDesigner, setShowDesigner] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('list')

  const { organization } = useAuth()

  useEffect(() => {
    if (organization) {
      loadPrompts()
    }
  }, [organization, refreshTrigger])

  const loadPrompts = async () => {
    if (!organization) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await promptService.getByOrganization(organization.id)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setPrompts(result.data)
      }
    } catch (err) {
      setError('Failed to load prompts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePromptSaved = (prompt: Prompt) => {
    setShowDesigner(false)
    handleRefresh()
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'list':
        return <List className="h-4 w-4" />
      case 'designer':
        return <Wand2 className="h-4 w-4" />
      case 'bulk':
        return <Upload className="h-4 w-4" />
      case 'scheduler':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const stats = {
    total: prompts.length,
    active: prompts.filter(p => p.is_active).length,
    inactive: prompts.filter(p => !p.is_active).length,
    languages: new Set(prompts.map(p => p.language)).size,
    regions: new Set(prompts.map(p => p.region)).size
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prompt Management</h1>
            <p className="text-muted-foreground">
              Create, manage, and automate prompts for AI search visibility testing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('designer')}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Designer
            </Button>
            <Dialog open={showDesigner} onOpenChange={setShowDesigner}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quick Prompt Creator</DialogTitle>
                  <DialogDescription>
                    Create a new prompt quickly with basic settings
                  </DialogDescription>
                </DialogHeader>
                <PromptDesigner
                  onSave={handlePromptSaved}
                  onCancel={() => setShowDesigner(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Prompts</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.languages}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.regions}</div>
                <div className="text-sm text-muted-foreground">Regions</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="list" className="flex items-center gap-2">
              {getTabIcon('list')}
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="designer" className="flex items-center gap-2">
              {getTabIcon('designer')}
              <span className="hidden sm:inline">Designer</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              {getTabIcon('bulk')}
              <span className="hidden sm:inline">Bulk Ops</span>
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              {getTabIcon('scheduler')}
              <span className="hidden sm:inline">Scheduler</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  All Prompts
                </CardTitle>
                <CardDescription>
                  View and manage your prompt library
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center text-red-600 py-8">
                    Error loading prompts: {error}
                  </div>
                ) : (
                  <PromptList onRefresh={handleRefresh} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designer" className="space-y-4">
            <PromptDesigner
              onSave={handlePromptSaved}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Operations
                </CardTitle>
                <CardDescription>
                  Import, export, and manage prompts in bulk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptBulkOperations
                  prompts={prompts}
                  onRefresh={handleRefresh}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-4">
            <PromptScheduler
              prompts={prompts}
              onRefresh={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}