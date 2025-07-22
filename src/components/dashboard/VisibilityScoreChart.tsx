'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { date: 'Jan 15', score: 65 },
  { date: 'Jan 16', score: 68 },
  { date: 'Jan 17', score: 72 },
  { date: 'Jan 18', score: 69 },
  { date: 'Jan 19', score: 74 },
  { date: 'Jan 20', score: 76 },
  { date: 'Jan 21', score: 73 },
]

export function VisibilityScoreChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline space-x-2">
        <div className="text-3xl font-bold">73.2%</div>
        <div className="text-sm text-green-500">+12.5%</div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
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
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-sm text-primary">
                      Visibility Score: {payload[0].value}%
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Peak Score</div>
          <div className="font-medium">76.2%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Avg Score</div>
          <div className="font-medium">70.4%</div>
        </div>
      </div>
    </div>
  )
}