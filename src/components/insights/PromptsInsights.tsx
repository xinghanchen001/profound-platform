'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Search, ChevronDown, ChevronRight, Play, Calendar, BarChart3, Target } from 'lucide-react'

const promptGroups = [
  {
    id: '1',
    title: 'Financial Services',
    topic: 'Finance',
    promptCount: 12,
    visibility: 78.5,
    trend: 5.2,
    rank: 1,
    shareOfVoice: 28.4,
    executions: 245,
    lastRun: '2024-01-21T10:30:00Z',
    prompts: [
      {
        id: '1a',
        text: 'What are the best financial services for small businesses?',
        mentions: true,
        platforms: ['ChatGPT', 'Perplexity', 'Google AI'],
        response: 'When it comes to financial services for small businesses, several options stand out...',
        region: 'US',
      },
      {
        id: '1b',
        text: 'How do I choose the right business loan provider?',
        mentions: false,
        platforms: [],
        response: null,
        region: 'US',
      },
    ]
  },
  {
    id: '2',
    title: 'Investment Advice',
    topic: 'Investment',
    promptCount: 8,
    visibility: 65.2,
    trend: -2.1,
    rank: 3,
    shareOfVoice: 22.1,
    executions: 189,
    lastRun: '2024-01-21T09:15:00Z',
    prompts: [
      {
        id: '2a',
        text: 'What investment strategies work best for retirement planning?',
        mentions: true,
        platforms: ['ChatGPT', 'Copilot'],
        response: 'Retirement planning requires a diversified approach to investments...',
        region: 'US',
      }
    ]
  },
  {
    id: '3',
    title: 'Credit Management',
    topic: 'Credit',
    promptCount: 15,
    visibility: 82.1,
    trend: 8.7,
    rank: 2,
    shareOfVoice: 31.2,
    executions: 312,
    lastRun: '2024-01-21T11:45:00Z',
    prompts: [
      {
        id: '3a',
        text: 'How can I improve my credit score quickly?',
        mentions: true,
        platforms: ['ChatGPT', 'Perplexity', 'Google AI', 'Copilot'],
        response: 'Improving your credit score requires consistent effort...',
        region: 'US',
      }
    ]
  },
]

const platformIcons = {
  'ChatGPT': '🤖',
  'Perplexity': '🔍',
  'Google AI': '🌟',
  'Copilot': '💼',
}

export function PromptsInsights() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['1'])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const filteredGroups = promptGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTopic = selectedTopic === 'all' || group.topic.toLowerCase() === selectedTopic
    return matchesSearch && matchesTopic
  })

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">Across all topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">746</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Visibility</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75.3%</div>
            <p className="text-xs text-green-500">+3.8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m ago</div>
            <p className="text-xs text-muted-foreground">Auto-execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Prompt Analysis</CardTitle>
              <CardDescription>
                {filteredGroups.length} prompt groups • {filteredGroups.reduce((sum, group) => sum + group.promptCount, 0)} total prompts
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <Button>Run All</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <Collapsible 
                key={group.id}
                open={expandedGroups.includes(group.id)}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        {expandedGroups.includes(group.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{group.title}</h3>
                            <Badge variant="outline">{group.topic}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.promptCount} prompts • {group.executions} executions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-medium">{group.visibility}%</div>
                          <div className={`text-xs ${group.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {group.trend >= 0 ? '+' : ''}{group.trend}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">#{group.rank}</div>
                          <div className="text-xs text-muted-foreground">Rank</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{group.shareOfVoice}%</div>
                          <div className="text-xs text-muted-foreground">Share</div>
                        </div>
                        <div className="w-24">
                          <Progress value={group.visibility} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Prompt</TableHead>
                            <TableHead>Mentioned</TableHead>
                            <TableHead>Platforms</TableHead>
                            <TableHead>Response Preview</TableHead>
                            <TableHead>Region</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.prompts.map((prompt) => (
                            <TableRow key={prompt.id}>
                              <TableCell className="max-w-sm">
                                <div className="font-medium text-sm">
                                  {prompt.text.length > 80 
                                    ? `${prompt.text.slice(0, 80)}...` 
                                    : prompt.text
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={prompt.mentions ? "default" : "secondary"}>
                                  {prompt.mentions ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {prompt.platforms.map((platform) => (
                                    <span 
                                      key={platform}
                                      className="text-lg"
                                      title={platform}
                                    >
                                      {platformIcons[platform as keyof typeof platformIcons]}
                                    </span>
                                  ))}
                                  {prompt.platforms.length === 0 && (
                                    <span className="text-muted-foreground text-sm">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-md">
                                {prompt.response ? (
                                  <div className="text-sm text-muted-foreground">
                                    {prompt.response.slice(0, 100)}...
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No response</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{prompt.region}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}