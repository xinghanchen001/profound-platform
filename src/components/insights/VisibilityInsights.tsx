'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CompetitorComparison } from './CompetitorComparison'
import { VisibilityTrendChart } from './VisibilityTrendChart'
import { ShareOfVoiceChart } from '../dashboard/ShareOfVoiceChart'
import { TrendingUp, TrendingDown, Crown, Target, BarChart3 } from 'lucide-react'

const visibilityMetrics = {
  current: 55.6,
  change: -0.6,
  rank: 1,
  rankChange: 0,
  shareOfVoice: 24.8,
  shareChange: -2.1,
}

const platformMetrics = [
  {
    name: 'ChatGPT',
    score: 78.2,
    change: 15.2,
    mentions: 2847,
    color: 'bg-blue-500',
    icon: '🤖'
  },
  {
    name: 'Perplexity',
    score: 82.1,
    change: 8.7,
    mentions: 1934,
    color: 'bg-purple-500',
    icon: '🔍'
  },
  {
    name: 'Google AI',
    score: 65.3,
    change: -3.2,
    mentions: 1205,
    color: 'bg-green-500',
    icon: '🌟'
  },
  {
    name: 'Microsoft Copilot',
    score: 71.4,
    change: 22.1,
    mentions: 361,
    color: 'bg-orange-500',
    icon: '💼'
  },
]

export function VisibilityInsights() {
  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Visibility Score */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Visibility Score</CardTitle>
                <CardDescription>
                  Overall brand visibility across all AI platforms
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline space-x-3">
                <div className="text-4xl font-bold">{visibilityMetrics.current}%</div>
                <div className={`flex items-center space-x-1 text-sm ${
                  visibilityMetrics.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {visibilityMetrics.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(visibilityMetrics.change)}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your brand appears in {visibilityMetrics.current}% of relevant AI-generated answers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Rank */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Visibility Rank</CardTitle>
                <CardDescription>
                  Market position ranking
                </CardDescription>
              </div>
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <div className="text-4xl font-bold">#{visibilityMetrics.rank}</div>
                {visibilityMetrics.rankChange === 0 && (
                  <Badge variant="outline" className="text-xs">No Change</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Leading position in your market category
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visibility Trends</CardTitle>
          <CardDescription>
            Track visibility changes over time across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisibilityTrendChart />
        </CardContent>
      </Card>

      {/* Platform Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Performance</CardTitle>
            <CardDescription>
              Visibility score breakdown by AI platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {platformMetrics.map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {platform.mentions.toLocaleString()} mentions
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold">{platform.score}%</span>
                      <div className={`flex items-center space-x-1 text-xs ${
                        platform.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {platform.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(platform.change)}%</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={platform.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Share of Voice */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Share of Voice</CardTitle>
                <CardDescription>
                  Market share in AI-generated answers
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{visibilityMetrics.shareOfVoice}%</span>
                <div className={`flex items-center space-x-1 text-xs ${
                  visibilityMetrics.shareChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {visibilityMetrics.shareChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(visibilityMetrics.shareChange)}%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ShareOfVoiceChart />
          </CardContent>
        </Card>
      </div>

      {/* Competitor Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Competitor Analysis</CardTitle>
          <CardDescription>
            Compare your visibility against key competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompetitorComparison />
        </CardContent>
      </Card>
    </div>
  )
}