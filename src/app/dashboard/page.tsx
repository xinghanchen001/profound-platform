'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VisibilityScoreChart } from '@/components/dashboard/VisibilityScoreChart'
import { ShareOfVoiceChart } from '@/components/dashboard/ShareOfVoiceChart'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { PlatformBreakdown } from '@/components/dashboard/PlatformBreakdown'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MoreHorizontal, Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function DashboardPage() {
  const { organization } = useAuth()

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {organization?.name || 'Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Answer Engine Optimization Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export 6.3k answers
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
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
                Shopping
              </TabsTrigger>
              <TabsTrigger 
                value="citations" 
                className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-1 py-3"
              >
                Citations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visibility" className="mt-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select defaultValue="7d">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">vs.</span>
                <Select defaultValue="prev">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prev">Previous Period</SelectItem>
                    <SelectItem value="year">Previous Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="daily">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">Topics</Button>
                <Button variant="outline">Platforms</Button>
              </div>
            </div>

            {/* Top Metrics Cards */}
            <MetricsCards />

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visibility Score Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Visibility Score</CardTitle>
                      <CardDescription>
                        How often {organization?.name || 'your brand'} appears in AI-generated answers
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">+12.5%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VisibilityScoreChart />
                </CardContent>
              </Card>

              {/* Share of Voice Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Share of Voice</CardTitle>
                      <CardDescription>
                        Mentions of {organization?.name || 'your brand'} in AI-generated answers in relation to competitors
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-500">-2.1%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ShareOfVoiceChart />
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Breakdown</CardTitle>
                <CardDescription>
                  Performance across different AI platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformBreakdown />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab content placeholders */}
          <TabsContent value="sentiment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>
                  Track sentiment trends for {organization?.name || 'your brand'} across AI platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Sentiment analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Performance</CardTitle>
                <CardDescription>
                  Analyze how your prompts perform across different AI engines
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Prompt analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  Detailed performance metrics by AI platform
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Platform analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>
                  Geographic breakdown of AI answer visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Regional analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shopping" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Insights</CardTitle>
                <CardDescription>
                  AI-driven shopping recommendations and product visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Shopping insights coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Citation Analysis</CardTitle>
                <CardDescription>
                  Track how often your content is cited by AI systems
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Citation analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}