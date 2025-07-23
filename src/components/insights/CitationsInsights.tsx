'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CitationsInsights() {
  return (
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
  )
}