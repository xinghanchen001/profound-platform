'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CitationOverview } from '@/components/citations/CitationOverview'
import { DomainAnalysis } from '@/components/citations/DomainAnalysis'
import { PageAnalysis } from '@/components/citations/PageAnalysis'
import { CitationNetwork } from '@/components/citations/CitationNetwork'

export default function CitationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Citations</h1>
        <p className="text-muted-foreground">
          Track and analyze how AI engines cite sources when mentioning your brand
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="network">3D Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CitationOverview />
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <DomainAnalysis />
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <PageAnalysis />
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <CitationNetwork />
        </TabsContent>
      </Tabs>
    </div>
  )
}