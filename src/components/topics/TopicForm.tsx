'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { topicService } from '@/lib/database/topics'
import { createTopicSchema, updateTopicSchema } from '@/lib/validation/schemas'
import type { Topic, CreateTopicInput, UpdateTopicInput } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface TopicFormProps {
  topic?: Topic
  onSuccess?: (topic: Topic) => void
  onCancel?: () => void
}

export function TopicForm({ topic, onSuccess, onCancel }: TopicFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useAuth()

  const isEditing = !!topic
  const schema = isEditing ? updateTopicSchema : createTopicSchema

  const form = useForm<CreateTopicInput | UpdateTopicInput>({
    resolver: zodResolver(schema),
    defaultValues: topic ? {
      name: topic.name,
      description: topic.description || ''
    } : {
      organization_id: organization?.id || '',
      name: '',
      description: ''
    }
  })

  const onSubmit = async (data: CreateTopicInput | UpdateTopicInput) => {
    if (!organization) {
      setError('No organization selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let result

      if (isEditing && topic) {
        result = await topicService.update(topic.id, data as UpdateTopicInput)
      } else {
        result = await topicService.create({
          ...data,
          organization_id: organization.id
        } as CreateTopicInput)
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Topic' : 'Create Topic'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update topic information' : 'Add a new topic to organize your prompts'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter topic name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this topic..."
                      className="resize-none"
                      rows={3}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Help your team understand what this topic covers
                  </p>
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
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Topic' : 'Create Topic')}
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