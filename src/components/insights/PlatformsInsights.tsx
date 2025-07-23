'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'

const platforms = [
  {
    name: 'ChatGPT',
    icon: '🤖',
    color: 'bg-blue-500',
    visibility: 78.2,
    change: 15.2,
    mentions: 2847,
    marketShare: 32.1,
    avgResponse: '1.2s',
  },
  {
    name: 'Perplexity',
    icon: '🔍',
    color: 'bg-purple-500',
    visibility: 82.1,
    change: 8.7,
    mentions: 1934,
    marketShare: 28.4,
    avgResponse: '0.8s',
  },
  {
    name: 'Google AI',
    icon: '🌟',
    color: 'bg-green-500',
    visibility: 65.3,
    change: -3.2,
    mentions: 1205,
    marketShare: 22.7,
    avgResponse: '1.1s',
  },
  {
    name: 'Microsoft Copilot',
    icon: '💼',
    color: 'bg-orange-500',
    visibility: 71.4,
    change: 22.1,
    mentions: 361,
    marketShare: 16.8,
    avgResponse: '1.5s',
  },
]

const trendData = [
  { date: 'Jan 15', chatgpt: 76, perplexity: 79, google: 68, copilot: 65 },
  { date: 'Jan 16', chatgpt: 77, perplexity: 80, google: 67, copilot: 67 },
  { date: 'Jan 17', chatgpt: 78, perplexity: 81, google: 66, copilot: 69 },
  { date: 'Jan 18', chatgpt: 77, perplexity: 82, google: 65, copilot: 70 },
  { date: 'Jan 19', chatgpt: 79, perplexity: 83, google: 66, copilot: 72 },
  { date: 'Jan 20', chatgpt: 78, perplexity: 82, google: 65, copilot: 71 },
  { date: 'Jan 21', chatgpt: 78, perplexity: 82, google: 65, copilot: 71 },
]

export function PlatformsInsights() {
  return (
    <div className="space-y-6">
      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platforms.map((platform) => (
          <Card key={platform.name} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${platform.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{platform.name}</CardTitle>
              <span className="text-2xl">{platform.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{platform.visibility}%</div>
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
                <Progress value={platform.visibility} className="h-2" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Mentions:</span>
                    <span>{platform.mentions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Share:</span>
                    <span>{platform.marketShare}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span>{platform.avgResponse}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Performance Trends</CardTitle>
          <CardDescription>
            Compare visibility trends across all AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                          <p className="text-sm font-medium mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <span className="text-sm capitalize">{entry.dataKey}:</span>
                              <span className="text-sm font-medium" style={{ color: entry.color }}>
                                {entry.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line type="monotone" dataKey="chatgpt" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="perplexity" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="google" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="copilot" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Platform Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Platform</CardTitle>
            <CardDescription>Best visibility this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">🔍</span>
              <div>
                <div className="text-2xl font-bold">Perplexity</div>
                <div className="text-muted-foreground">82.1% visibility</div>
                <div className="flex items-center space-x-1 text-sm text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.7% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fastest Growing</CardTitle>
            <CardDescription>Biggest improvement this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">💼</span>
              <div>
                <div className="text-2xl font-bold">Microsoft Copilot</div>
                <div className="text-muted-foreground">71.4% visibility</div>
                <div className="flex items-center space-x-1 text-sm text-green-500">
                  <Zap className="h-3 w-3" />
                  <span>+22.1% growth</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Platform Analysis</CardTitle>
          <CardDescription>
            Comprehensive metrics for each AI platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {platform.mentions.toLocaleString()} mentions
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <div className="font-medium">{platform.visibility}%</div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{platform.marketShare}%</div>
                    <div className="text-xs text-muted-foreground">Market Share</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{platform.avgResponse}</div>
                    <div className="text-xs text-muted-foreground">Avg Response</div>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}