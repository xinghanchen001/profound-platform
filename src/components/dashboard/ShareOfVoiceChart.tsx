'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Your Brand', value: 24.8, color: 'hsl(var(--primary))' },
  { name: 'Competitor A', value: 32.1, color: 'hsl(var(--destructive))' },
  { name: 'Competitor B', value: 18.5, color: 'hsl(var(--secondary))' },
  { name: 'Competitor C', value: 15.2, color: 'hsl(var(--muted))' },
  { name: 'Others', value: 9.4, color: 'hsl(var(--accent))' },
]

const COLORS = data.map(item => item.color)

export function ShareOfVoiceChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline space-x-2">
        <div className="text-3xl font-bold">24.8%</div>
        <div className="text-sm text-red-500">-2.1%</div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                    <p className="text-sm font-medium">{payload[0].payload.name}</p>
                    <p className="text-sm text-primary">
                      Share: {payload[0].value}%
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className={item.name === 'Your Brand' ? 'font-medium' : ''}>{item.name}</span>
            </div>
            <span className={item.name === 'Your Brand' ? 'font-medium' : 'text-muted-foreground'}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}