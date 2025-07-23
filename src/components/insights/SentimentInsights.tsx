'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from 'lucide-react'

const sentimentData = {
  positive: { score: 67.2, change: 2.3, count: 4251 },
  neutral: { score: 24.8, change: -1.1, count: 1567 },
  negative: { score: 8.0, change: -1.2, count: 506 },
}

const trendData = [
  { date: 'Jan 15', positive: 65, neutral: 26, negative: 9 },
  { date: 'Jan 16', positive: 66, neutral: 25, negative: 9 },
  { date: 'Jan 17', positive: 68, neutral: 24, negative: 8 },
  { date: 'Jan 18', positive: 67, neutral: 25, negative: 8 },
  { date: 'Jan 19', positive: 69, neutral: 23, negative: 8 },
  { date: 'Jan 20', positive: 68, neutral: 24, negative: 8 },
  { date: 'Jan 21', positive: 67, neutral: 25, negative: 8 },
]

const pieData = [
  { name: 'Positive', value: 67.2, color: '#10B981' },
  { name: 'Neutral', value: 24.8, color: '#6B7280' },
  { name: 'Negative', value: 8.0, color: '#EF4444' },
]

export function SentimentInsights() {
  return (
    <div className="space-y-6">
      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
            <Smile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentimentData.positive.score}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{sentimentData.positive.change}%</span>
              <span className="text-muted-foreground">from last period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentimentData.positive.count.toLocaleString()} positive mentions
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neutral Sentiment</CardTitle>
            <Meh className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{sentimentData.neutral.score}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">{sentimentData.neutral.change}%</span>
              <span className="text-muted-foreground">from last period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentimentData.neutral.count.toLocaleString()} neutral mentions
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
            <Frown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{sentimentData.negative.score}%</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{sentimentData.negative.change}%</span>
              <span className="text-muted-foreground">from last period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentimentData.negative.count.toLocaleString()} negative mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Trends</CardTitle>
            <CardDescription>
              Track sentiment changes over time
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
                    domain={[0, 100]}
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
                  <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
            <CardDescription>
              Overall sentiment breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                            <p className="text-sm font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm">
                              {payload[0].value}% of mentions
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Sentiment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Sentiment Analysis</CardTitle>
          <CardDescription>
            Sentiment breakdown by AI platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {['ChatGPT', 'Perplexity', 'Google AI', 'Microsoft Copilot'].map((platform, index) => {
              const positive = 65 + Math.random() * 10
              const negative = 5 + Math.random() * 8
              const neutral = 100 - positive - negative
              
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{platform}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(positive)}% positive
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${positive}%` }}
                    />
                    <div 
                      className="bg-gray-400" 
                      style={{ width: `${neutral}%` }}
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${negative}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}