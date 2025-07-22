'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

const platforms = [
  {
    name: 'ChatGPT',
    score: 78,
    mentions: 2847,
    change: '+15.2%',
    trend: 'up' as const,
    color: 'bg-green-500',
  },
  {
    name: 'Perplexity',
    score: 82,
    mentions: 1934,
    change: '+8.7%',
    trend: 'up' as const,
    color: 'bg-blue-500',
  },
  {
    name: 'Google AI',
    score: 65,
    mentions: 1205,
    change: '-3.2%',
    trend: 'down' as const,
    color: 'bg-yellow-500',
  },
  {
    name: 'Microsoft Copilot',
    score: 71,
    mentions: 361,
    change: '+22.1%',
    trend: 'up' as const,
    color: 'bg-purple-500',
  },
]

export function PlatformBreakdown() {
  return (
    <div className="space-y-6">
      {platforms.map((platform) => (
        <div key={platform.name} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${platform.color}`} />
              <span className="font-medium">{platform.name}</span>
              <Badge variant="outline" className="text-xs">
                {platform.mentions.toLocaleString()} mentions
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{platform.score}%</span>
              <div className={`flex items-center space-x-1 text-xs ${
                platform.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {platform.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{platform.change}</span>
              </div>
            </div>
          </div>
          <Progress value={platform.score} className="h-2" />
        </div>
      ))}
      
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Best Performing</div>
            <div className="font-medium">Perplexity (82%)</div>
          </div>
          <div>
            <div className="text-muted-foreground">Most Mentions</div>
            <div className="font-medium">ChatGPT (2,847)</div>
          </div>
        </div>
      </div>
    </div>
  )
}