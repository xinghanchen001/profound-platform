'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ShoppingInsights() {
  return (
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
  )
}