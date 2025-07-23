'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const trendData = [
  { date: 'Jan 15', current: 52.3, previous: 48.1, chatgpt: 58, perplexity: 61, google: 45, copilot: 48 },
  { date: 'Jan 16', current: 53.7, previous: 49.2, chatgpt: 59, perplexity: 63, google: 46, copilot: 49 },
  { date: 'Jan 17', current: 55.1, previous: 48.8, chatgpt: 61, perplexity: 65, google: 47, copilot: 50 },
  { date: 'Jan 18', current: 54.2, previous: 50.1, chatgpt: 60, perplexity: 64, google: 46, copilot: 51 },
  { date: 'Jan 19', current: 56.8, previous: 51.3, chatgpt: 63, perplexity: 67, google: 48, copilot: 53 },
  { date: 'Jan 20', current: 55.9, previous: 49.7, chatgpt: 62, perplexity: 66, google: 47, copilot: 52 },
  { date: 'Jan 21', current: 55.6, previous: 50.8, chatgpt: 61, perplexity: 65, google: 48, copilot: 52 },
]

export function VisibilityTrendChart() {
  return (
    <div className="space-y-6">
      {/* Main Trend Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
                    <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                      <p className="text-sm font-medium mb-2">{label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-primary">Current Period:</span>
                          <span className="text-sm font-medium">{payload[0]?.value}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Previous Period:</span>
                          <span className="text-sm font-medium">{payload[1]?.value}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm">Difference:</span>
                          <span className={`text-sm font-medium ${
                            (payload[0]?.value || 0) >= (payload[1]?.value || 0) ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {((payload[0]?.value || 0) - (payload[1]?.value || 0)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="hsl(var(--muted-foreground))"
              fill="url(#previousGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="url(#currentGradient)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Platform Trends</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Line type="monotone" dataKey="chatgpt" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="perplexity" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="google" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="copilot" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div>
          <h4 className="text-sm font-medium mb-3">7-Day Summary</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Peak Score</div>
                <div className="font-medium">56.8%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Lowest Score</div>
                <div className="font-medium">52.3%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Average</div>
                <div className="font-medium">54.8%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Volatility</div>
                <div className="font-medium">4.5%</div>
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="text-muted-foreground text-sm mb-2">Best Performing Platform</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="font-medium">Perplexity</span>
                <span className="text-sm text-muted-foreground">(65.7% avg)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}