'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TrendingUp, TrendingDown, Crown, Building } from 'lucide-react'

const competitors = [
  {
    rank: 1,
    name: 'Your Brand',
    logo: null,
    visibility: 55.6,
    change: -0.6,
    shareOfVoice: 24.8,
    mentions: 6347,
    owned: true,
  },
  {
    rank: 2,
    name: 'Competitor Alpha',
    logo: '/logos/competitor-a.png',
    visibility: 48.2,
    change: 2.3,
    shareOfVoice: 21.4,
    mentions: 5892,
    owned: false,
  },
  {
    rank: 3,
    name: 'Market Leader Corp',
    logo: '/logos/competitor-b.png',
    visibility: 45.7,
    change: -1.8,
    shareOfVoice: 19.8,
    mentions: 5234,
    owned: false,
  },
  {
    rank: 4,
    name: 'Innovation Inc',
    logo: '/logos/competitor-c.png',
    visibility: 42.1,
    change: 4.2,
    shareOfVoice: 18.2,
    mentions: 4567,
    owned: false,
  },
  {
    rank: 5,
    name: 'Digital Solutions Ltd',
    logo: '/logos/competitor-d.png',
    visibility: 38.9,
    change: 1.7,
    shareOfVoice: 15.8,
    mentions: 3891,
    owned: false,
  },
]

const platforms = ['ChatGPT', 'Perplexity', 'Google AI', 'Copilot']
const platformColors = {
  'ChatGPT': 'bg-blue-500',
  'Perplexity': 'bg-purple-500',
  'Google AI': 'bg-green-500',
  'Copilot': 'bg-orange-500',
}

// Mock platform-specific data
const getPlatformScores = (baseScore: number) => {
  return {
    'ChatGPT': Math.round(baseScore * (0.9 + Math.random() * 0.2)),
    'Perplexity': Math.round(baseScore * (0.85 + Math.random() * 0.3)),
    'Google AI': Math.round(baseScore * (0.8 + Math.random() * 0.25)),
    'Copilot': Math.round(baseScore * (0.7 + Math.random() * 0.4)),
  }
}

export function CompetitorComparison() {
  return (
    <div className="space-y-6">
      {/* Overview Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Visibility Score</TableHead>
              <TableHead>Share of Voice</TableHead>
              <TableHead>Total Mentions</TableHead>
              <TableHead>Platform Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((competitor) => {
              const platformScores = getPlatformScores(competitor.visibility)
              return (
                <TableRow key={competitor.rank} className={competitor.owned ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-1">
                      <span>#{competitor.rank}</span>
                      {competitor.rank === 1 && <Crown className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={competitor.logo || ''} alt={competitor.name} />
                        <AvatarFallback>
                          {competitor.owned ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            competitor.name.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{competitor.name}</div>
                        {competitor.owned && (
                          <Badge variant="secondary" className="text-xs">Owned</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{competitor.visibility}%</span>
                        <div className={`flex items-center space-x-1 text-xs ${
                          competitor.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {competitor.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{Math.abs(competitor.change)}%</span>
                        </div>
                      </div>
                      <Progress value={competitor.visibility} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{competitor.shareOfVoice}%</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{competitor.mentions.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {platforms.map((platform) => {
                        const score = platformScores[platform as keyof typeof platformScores]
                        const color = platformColors[platform as keyof typeof platformColors]
                        return (
                          <div
                            key={platform}
                            className={`w-2 h-6 rounded-sm ${color}`}
                            style={{
                              opacity: score / 100,
                            }}
                            title={`${platform}: ${score}%`}
                          />
                        )
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Platform Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const color = platformColors[platform as keyof typeof platformColors]
          const topPerformer = competitors[0] // Your brand
          const platformScores = getPlatformScores(topPerformer.visibility)
          const platformScore = platformScores[platform as keyof typeof platformScores]
          
          return (
            <div key={platform} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="font-medium text-sm">{platform}</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{platformScore}%</div>
                <div className="text-xs text-muted-foreground">Your visibility score</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>vs. #2 competitor</span>
                  <span className="text-green-500">+7.4%</span>
                </div>
                <Progress value={Math.min(100, (platformScore / competitors[1].visibility) * 100)} className="h-1" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Market Share Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">+2.3%</div>
          <div className="text-sm text-muted-foreground">Market share gained vs. last month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">#1</div>
          <div className="text-sm text-muted-foreground">Position in category</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">4/4</div>
          <div className="text-sm text-muted-foreground">Leading platforms</div>
        </div>
      </div>
    </div>
  )
}