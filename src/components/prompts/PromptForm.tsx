'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { promptService } from '@/lib/database/prompts'
import { topicService } from '@/lib/database/topics'
import { createPromptSchema, updatePromptSchema } from '@/lib/validation/schemas'
import type { Prompt, CreatePromptInput, UpdatePromptInput, Topic } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'

interface PromptFormProps {
  prompt?: Prompt
  selectedTopics?: Topic[]
  onSuccess?: (prompt: Prompt) => void
  onCancel?: () => void
}

export function PromptForm({ prompt, selectedTopics, onSuccess, onCancel }: PromptFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    selectedTopics?.map(t => t.id) || []
  )
  const [currentTag, setCurrentTag] = useState('')

  const { organization } = useAuth()

  const isEditing = !!prompt
  const schema = isEditing ? updatePromptSchema : createPromptSchema

  const form = useForm<CreatePromptInput | UpdatePromptInput>({
    resolver: zodResolver(schema),
    defaultValues: prompt ? {
      text: prompt.text,
      language: prompt.language,
      region: prompt.region,
      tags: prompt.tags,
      is_active: prompt.is_active
    } : {
      organization_id: organization?.id || '',
      text: '',
      language: 'en',
      region: 'us',
      tags: [],
      is_active: true
    }
  })

  const tags = form.watch('tags') || []

  useEffect(() => {
    if (organization) {
      loadTopics()
    }
  }, [organization])

  const loadTopics = async () => {
    if (!organization) return

    try {
      const result = await topicService.getByOrganization(organization.id)
      if (result.data) {
        setAvailableTopics(result.data)
      }
    } catch (err) {
      setError('Failed to load topics')
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()]
      form.setValue('tags', newTags)
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    form.setValue('tags', newTags)
  }

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(prev => [...prev, topicId])
    } else {
      setSelectedTopicIds(prev => prev.filter(id => id !== topicId))
    }
  }

  const onSubmit = async (data: CreatePromptInput | UpdatePromptInput) => {
    if (!organization) {
      setError('No organization selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let result

      if (isEditing && prompt) {
        result = await promptService.update(prompt.id, data as UpdatePromptInput, selectedTopicIds)
      } else {
        result = await promptService.create({
          ...data,
          organization_id: organization.id
        } as CreatePromptInput, selectedTopicIds)
      }

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        onSuccess?.(result.data)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Prompt' : 'Create Prompt'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update prompt information' : 'Create a new prompt for AI search testing'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your prompt text..."
                      className="resize-none min-h-[100px]"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Write a clear, specific prompt that will be used to test AI search engines
                  </p>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="es">Spain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Topics Selection */}
            {availableTopics.length > 0 && (
              <div className="space-y-3">
                <FormLabel>Topics (Optional)</FormLabel>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {availableTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic.id}
                        checked={selectedTopicIds.includes(topic.id)}
                        onCheckedChange={(checked) => 
                          handleTopicToggle(topic.id, checked as boolean)
                        }
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={topic.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {topic.name}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select topics to organize this prompt
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-3">
              <FormLabel>Tags (Optional)</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={isLoading || !currentTag.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add tags to help categorize and search your prompts
              </p>
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Prompt</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable this prompt for execution in AI search tests
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
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
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Prompt' : 'Create Prompt')}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}