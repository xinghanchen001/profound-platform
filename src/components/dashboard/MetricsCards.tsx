'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const metrics = [
  {
    title: "Visibility Score",
    value: "73.2%",
    change: "+12.5%",
    trend: "up" as const,
    description: "Average visibility across all AI platforms",
  },
  {
    title: "Total Mentions",
    value: "6,347",
    change: "+8.2%",
    trend: "up" as const,
    description: "Times mentioned in AI responses",
  },
  {
    title: "Share of Voice",
    value: "24.8%",
    change: "-2.1%",
    trend: "down" as const,
    description: "Market share in AI responses",
  },
  {
    title: "Sentiment Score",
    value: "7.8/10",
    change: "0.0%",
    trend: "neutral" as const,
    description: "Average sentiment across platforms",
  },
]

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.trend === 'up' && (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            {metric.trend === 'down' && (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            {metric.trend === 'neutral' && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span 
                className={
                  metric.trend === 'up' 
                    ? 'text-green-500' 
                    : metric.trend === 'down' 
                    ? 'text-red-500' 
                    : 'text-muted-foreground'
                }
              >
                {metric.change}
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}