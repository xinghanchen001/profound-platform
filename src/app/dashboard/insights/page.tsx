'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VisibilityInsights } from '@/components/insights/VisibilityInsights'
import { SentimentInsights } from '@/components/insights/SentimentInsights'
import { PromptsInsights } from '@/components/insights/PromptsInsights'
import { PlatformsInsights } from '@/components/insights/PlatformsInsights'
import { RegionsInsights } from '@/components/insights/RegionsInsights'
import { ShoppingInsights } from '@/components/insights/ShoppingInsights'
import { CitationsInsights } from '@/components/insights/CitationsInsights'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MoreHorizontal, Download, Filter } from 'lucide-react'

export default function AnswerEngineInsightsPage() {
  const { organization } = useAuth()

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Answer Engine Insights</h1>
            <p className="text-muted-foreground">
              Track {organization?.name || 'your brand'}&apos;s visibility across AI platforms
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time Period:</span>
            <Select defaultValue="7d">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Compare to:</span>
            <Select defaultValue="prev">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prev">Previous Period</SelectItem>
                <SelectItem value="year">Previous Year</SelectItem>
                <SelectItem value="none">No Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Platforms:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="copilot">Copilot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Insights Tabs */}
        <Tabs defaultValue="visibility" className="w-full">
          <div className="border-b border-border">
            <TabsList className="h-12 p-0 bg-transparent space-x-8">
              <TabsTrigger 
                value="visibility" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Visibility
              </TabsTrigger>
              <TabsTrigger 
                value="sentiment" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Sentiment
              </TabsTrigger>
              <TabsTrigger 
                value="prompts" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Prompts
              </TabsTrigger>
              <TabsTrigger 
                value="platforms" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Platforms
              </TabsTrigger>
              <TabsTrigger 
                value="regions" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Regions
              </TabsTrigger>
              <TabsTrigger 
                value="shopping" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                <div className="flex items-center gap-2">
                  Shopping
                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="citations" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Citations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visibility" className="mt-6">
            <VisibilityInsights />
          </TabsContent>

          <TabsContent value="sentiment" className="mt-6">
            <SentimentInsights />
          </TabsContent>

          <TabsContent value="prompts" className="mt-6">
            <PromptsInsights />
          </TabsContent>

          <TabsContent value="platforms" className="mt-6">
            <PlatformsInsights />
          </TabsContent>

          <TabsContent value="regions" className="mt-6">
            <RegionsInsights />
          </TabsContent>

          <TabsContent value="shopping" className="mt-6">
            <ShoppingInsights />
          </TabsContent>

          <TabsContent value="citations" className="mt-6">
            <CitationsInsights />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}