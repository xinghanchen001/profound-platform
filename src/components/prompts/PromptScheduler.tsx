'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { promptService } from '@/lib/database/prompts'
import type { Prompt } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  prompt_ids: z.array(z.string()).min(1, 'At least one prompt must be selected'),
  platforms: z.array(z.string()).min(1, 'At least one platform must be selected'),
  frequency: z.enum(['once', 'hourly', 'daily', 'weekly', 'monthly']),
  start_time: z.string(),
  timezone: z.string(),
  is_active: z.boolean().default(true),
  max_executions: z.number().optional(),
  execution_timeout: z.number().default(30),
  retry_attempts: z.number().default(3),
  retry_delay: z.number().default(5)
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

interface ScheduleExecution {
  id: string
  schedule_id: string
  prompt_id: string
  platform: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at?: string
  completed_at?: string
  error_message?: string
  response_data?: any
}

interface PromptSchedule {
  id: string
  name: string
  prompt_ids: string[]
  platforms: string[]
  frequency: string
  start_time: string
  timezone: string
  is_active: boolean
  max_executions?: number
  execution_timeout: number
  retry_attempts: number
  retry_delay: number
  created_at: string
  updated_at: string
  next_execution?: string
  total_executions: number
  last_execution?: string
  last_status?: string
}

const platforms = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-green-500' },
  { id: 'perplexity', name: 'Perplexity', color: 'bg-blue-500' },
  { id: 'google-ai', name: 'Google AI', color: 'bg-orange-500' },
  { id: 'microsoft-copilot', name: 'Microsoft Copilot', color: 'bg-purple-500' }
]

const frequencies = [
  { value: 'once', label: 'Run Once', description: 'Execute immediately' },
  { value: 'hourly', label: 'Hourly', description: 'Every hour' },
  { value: 'daily', label: 'Daily', description: 'Once per day' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week' },
  { value: 'monthly', label: 'Monthly', description: 'Once per month' }
]

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' }
]

interface PromptSchedulerProps {
  prompts?: Prompt[]
  onRefresh?: () => void
}

export function PromptScheduler({ prompts = [], onRefresh }: PromptSchedulerProps) {
  const [schedules, setSchedules] = useState<PromptSchedule[]>([])
  const [executions, setExecutions] = useState<ScheduleExecution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<PromptSchedule | null>(null)
  const [showExecutions, setShowExecutions] = useState(false)

  const { organization } = useAuth()

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      prompt_ids: [],
      platforms: [],
      frequency: 'daily' as const,
      start_time: new Date().toISOString().slice(0, 16),
      timezone: 'UTC',
      is_active: true,
      execution_timeout: 30,
      retry_attempts: 3,
      retry_delay: 5
    }
  })

  useEffect(() => {
    loadSchedules()
    loadExecutions()
  }, [])

  const loadSchedules = async () => {
    // Mock data for now
    const mockSchedules: PromptSchedule[] = [
      {
        id: '1',
        name: 'Daily Brand Monitoring',
        prompt_ids: prompts.slice(0, 3).map(p => p.id),
        platforms: ['chatgpt', 'perplexity'],
        frequency: 'daily',
        start_time: '2024-01-01T09:00',
        timezone: 'UTC',
        is_active: true,
        execution_timeout: 30,
        retry_attempts: 3,
        retry_delay: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        next_execution: '2024-01-02T09:00:00Z',
        total_executions: 45,
        last_execution: '2024-01-01T09:00:00Z',
        last_status: 'completed'
      },
      {
        id: '2',
        name: 'Competitor Analysis Weekly',
        prompt_ids: prompts.slice(2, 5).map(p => p.id),
        platforms: ['google-ai', 'microsoft-copilot'],
        frequency: 'weekly',
        start_time: '2024-01-01T14:00',
        timezone: 'America/New_York',
        is_active: false,
        execution_timeout: 45,
        retry_attempts: 2,
        retry_delay: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        next_execution: '2024-01-08T14:00:00Z',
        total_executions: 8,
        last_execution: '2024-01-01T14:00:00Z',
        last_status: 'failed'
      }
    ]
    setSchedules(mockSchedules)
  }

  const loadExecutions = async () => {
    // Mock execution data
    const mockExecutions: ScheduleExecution[] = [
      {
        id: '1',
        schedule_id: '1',
        prompt_id: prompts[0]?.id || '1',
        platform: 'chatgpt',
        status: 'completed',
        started_at: '2024-01-01T09:00:00Z',
        completed_at: '2024-01-01T09:02:30Z'
      },
      {
        id: '2',
        schedule_id: '1',
        prompt_id: prompts[1]?.id || '2',
        platform: 'perplexity',
        status: 'failed',
        started_at: '2024-01-01T09:00:00Z',
        completed_at: '2024-01-01T09:01:15Z',
        error_message: 'Request timeout'
      },
      {
        id: '3',
        schedule_id: '2',
        prompt_id: prompts[2]?.id || '3',
        platform: 'google-ai',
        status: 'running',
        started_at: '2024-01-01T14:00:00Z'
      }
    ]
    setExecutions(mockExecutions)
  }

  const onSubmit = async (data: ScheduleFormData) => {
    if (!organization) {
      setError('No organization selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Mock create schedule
      const newSchedule: PromptSchedule = {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_executions: 0,
        next_execution: data.frequency === 'once' ? data.start_time : calculateNextExecution(data.start_time, data.frequency)
      }

      setSchedules(prev => [...prev, newSchedule])
      setShowCreateDialog(false)
      form.reset()
      onRefresh?.()
    } catch (err) {
      setError('Failed to create schedule')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNextExecution = (startTime: string, frequency: string): string => {
    const start = new Date(startTime)
    const now = new Date()
    
    switch (frequency) {
      case 'hourly':
        return new Date(Math.max(start.getTime(), now.getTime() + 60 * 60 * 1000)).toISOString()
      case 'daily':
        return new Date(Math.max(start.getTime(), now.getTime() + 24 * 60 * 60 * 1000)).toISOString()
      case 'weekly':
        return new Date(Math.max(start.getTime(), now.getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString()
      case 'monthly':
        return new Date(Math.max(start.getTime(), now.getTime() + 30 * 24 * 60 * 60 * 1000)).toISOString()
      default:
        return startTime
    }
  }

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, is_active: isActive } : s
    ))
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    setExecutions(prev => prev.filter(e => e.schedule_id !== scheduleId))
  }

  const runScheduleNow = async (scheduleId: string) => {
    // Mock immediate execution
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return

    setIsLoading(true)
    
    // Simulate execution
    setTimeout(() => {
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId 
          ? { 
              ...s, 
              last_execution: new Date().toISOString(),
              last_status: 'completed',
              total_executions: s.total_executions + 1
            }
          : s
      ))
      setIsLoading(false)
    }, 2000)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPromptName = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId)
    return prompt ? prompt.text.slice(0, 50) + '...' : 'Unknown Prompt'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Scheduler</h2>
          <p className="text-muted-foreground">Automate prompt execution across AI platforms</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExecutions(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Executions
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Execution Schedule</DialogTitle>
                <DialogDescription>
                  Set up automated prompt execution across multiple AI platforms
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Daily Brand Monitoring" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prompt_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Prompts</FormLabel>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {prompts.map((prompt) => (
                            <div key={prompt.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={prompt.id}
                                checked={field.value.includes(prompt.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, prompt.id])
                                  } else {
                                    field.onChange(field.value.filter(id => id !== prompt.id))
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label
                                htmlFor={prompt.id}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 truncate"
                              >
                                {prompt.text.slice(0, 80)}...
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Platforms</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {platforms.map((platform) => (
                            <div key={platform.id} className="flex items-center space-x-2 p-2 border rounded">
                              <input
                                type="checkbox"
                                id={platform.id}
                                checked={field.value.includes(platform.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, platform.id])
                                  } else {
                                    field.onChange(field.value.filter(id => id !== platform.id))
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <div className={`w-3 h-3 rounded ${platform.color}`} />
                              <label htmlFor={platform.id} className="text-sm font-medium cursor-pointer">
                                {platform.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {frequencies.map((freq) => (
                                <SelectItem key={freq.value} value={freq.value}>
                                  <div>
                                    <div className="font-medium">{freq.label}</div>
                                    <div className="text-xs text-muted-foreground">{freq.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="execution_timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="10"
                              max="300"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retry_attempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retry_delay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Delay (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="60"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Schedule</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Enable this schedule to run automatically
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Create Schedule
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedules List */}
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {frequencies.find(f => f.value === schedule.frequency)?.label}
                    </Badge>
                    {getStatusIcon(schedule.last_status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Prompts: {schedule.prompt_ids.length}</span>
                      <span>Platforms: {schedule.platforms.length}</span>
                      <span>Executions: {schedule.total_executions}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {schedule.platforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId)
                        return platform ? (
                          <Badge key={platformId} variant="outline" className="text-xs">
                            <div className={`w-2 h-2 rounded ${platform.color} mr-1`} />
                            {platform.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                    
                    {schedule.next_execution && (
                      <div>
                        Next: {new Date(schedule.next_execution).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runScheduleNow(schedule.id)}
                    disabled={isLoading}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSchedule(schedule.id, !schedule.is_active)}
                  >
                    {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {schedules.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No schedules created yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first schedule to automate prompt execution across AI platforms
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Executions Dialog */}
      <Dialog open={showExecutions} onOpenChange={setShowExecutions}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Execution History</DialogTitle>
            <DialogDescription>
              Recent prompt executions across all schedules
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {executions.map((execution) => {
                const schedule = schedules.find(s => s.id === execution.schedule_id)
                const platform = platforms.find(p => p.id === execution.platform)
                
                return (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(execution.status)}
                            <span className="font-medium text-sm">
                              {schedule?.name || 'Unknown Schedule'}
                            </span>
                            {platform && (
                              <Badge variant="outline" className="text-xs">
                                <div className={`w-2 h-2 rounded ${platform.color} mr-1`} />
                                {platform.name}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">
                            {getPromptName(execution.prompt_id)}
                          </p>
                          
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {execution.started_at && (
                              <span>Started: {new Date(execution.started_at).toLocaleString()}</span>
                            )}
                            {execution.completed_at && (
                              <span>
                                Duration: {
                                  Math.round(
                                    (new Date(execution.completed_at).getTime() - 
                                     new Date(execution.started_at!).getTime()) / 1000
                                  )
                                }s
                              </span>
                            )}
                          </div>
                          
                          {execution.error_message && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                              {execution.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {executions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No executions found
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}