'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Wand2, 
  Copy, 
  Save, 
  RefreshCw, 
  Sparkles, 
  FileText, 
  Settings, 
  Plus,
  X,
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react'
import { promptService } from '@/lib/database/prompts'
import { topicService } from '@/lib/database/topics'
import { createPromptSchema } from '@/lib/validation/schemas'
import type { Prompt, CreatePromptInput, Topic } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  template: string
  variables: string[]
  example: string
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: 'brand-inquiry',
    name: 'Brand Inquiry',
    description: 'Ask about a specific brand or company',
    category: 'Brand Research',
    template: 'What can you tell me about {brand}? I&apos;m particularly interested in their {aspect}.',
    variables: ['brand', 'aspect'],
    example: 'What can you tell me about Tesla? I&apos;m particularly interested in their electric vehicles.'
  },
  {
    id: 'product-comparison',
    name: 'Product Comparison',
    description: 'Compare products or services',
    category: 'Product Research',
    template: 'Compare {product1} and {product2} in terms of {criteria}. Which would you recommend for {usecase}?',
    variables: ['product1', 'product2', 'criteria', 'usecase'],
    example: 'Compare iPhone and Samsung Galaxy in terms of camera quality. Which would you recommend for photography?'
  },
  {
    id: 'recommendation',
    name: 'Recommendation Request',
    description: 'Ask for recommendations in a specific category',
    category: 'Recommendations',
    template: 'Can you recommend the best {category} for {purpose}? My budget is around {budget}.',
    variables: ['category', 'purpose', 'budget'],
    example: 'Can you recommend the best laptops for video editing? My budget is around $2000.'
  },
  {
    id: 'how-to',
    name: 'How-to Question',
    description: 'Ask for step-by-step guidance',
    category: 'Tutorials',
    template: 'How do I {action} using {tool}? Please provide step-by-step instructions.',
    variables: ['action', 'tool'],
    example: 'How do I edit videos using Adobe Premiere Pro? Please provide step-by-step instructions.'
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Get help with specific problems',
    category: 'Support',
    template: 'I&apos;m having trouble with {problem}. I&apos;ve tried {attempted_solutions}. What else can I do?',
    variables: ['problem', 'attempted_solutions'],
    example: 'I&apos;m having trouble with my Wi-Fi connection. I&apos;ve tried restarting the router. What else can I do?'
  }
]

interface PromptDesignerProps {
  onSave?: (prompt: Prompt) => void
  onCancel?: () => void
}

export function PromptDesigner({ onSave, onCancel }: PromptDesignerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTag, setCurrentTag] = useState('')
  const [templates] = useState<PromptTemplate[]>(defaultTemplates)

  const { organization } = useAuth()

  const form = useForm<CreatePromptInput>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      organization_id: organization?.id || '',
      text: '',
      language: 'en',
      region: 'us',
      tags: [],
      is_active: true
    }
  })

  const tags = form.watch('tags') || []
  const promptText = form.watch('text')

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

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    
    const variables: Record<string, string> = {}
    template.variables.forEach(variable => {
      variables[variable] = ''
    })
    setTemplateVariables(variables)
    
    form.setValue('text', template.template)
  }

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...templateVariables, [variable]: value }
    setTemplateVariables(newVariables)
    
    if (selectedTemplate) {
      let processedTemplate = selectedTemplate.template
      Object.entries(newVariables).forEach(([key, val]) => {
        processedTemplate = processedTemplate.replace(new RegExp(`{${key}}`, 'g'), val || `{${key}}`)
      })
      form.setValue('text', processedTemplate)
    }
  }

  const handleAutoGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const generatedPrompts = [
      'What are the best practices for sustainable business operations in 2024?',
      'How do modern AI tools compare to traditional software solutions for business productivity?',
      'What should I consider when choosing between cloud-based and on-premise solutions for my company?',
      'Can you explain the benefits and drawbacks of remote work policies in contemporary business?',
      'What are the emerging trends in digital marketing that businesses should be aware of?'
    ]

    const randomPrompt = generatedPrompts[Math.floor(Math.random() * generatedPrompts.length)]
    form.setValue('text', randomPrompt)
    setIsGenerating(false)
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

  const onSubmit = async (data: CreatePromptInput) => {
    if (!organization) {
      setError('No organization selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await promptService.create({
        ...data,
        organization_id: organization.id
      }, selectedTopicIds)

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        onSave?.(result.data)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (promptText) {
      navigator.clipboard.writeText(promptText)
    }
  }

  const categoryGroups = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, PromptTemplate[]>)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Designer</h1>
          <p className="text-muted-foreground">Create powerful prompts with AI assistance and templates</p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Prompt Templates</SheetTitle>
                <SheetDescription>
                  Choose from pre-built templates to get started quickly
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                <div className="space-y-6">
                  {Object.entries(categoryGroups).map(([category, categoryTemplates]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {categoryTemplates.map((template) => (
                          <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                            <CardContent className="p-4" onClick={() => handleTemplateSelect(template)}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{template.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                  <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-50 p-2 rounded">
                                    {template.example}
                                  </p>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Prompt Builder
              </CardTitle>
              <CardDescription>
                Design your prompt using our advanced editor or templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Template Variables */}
                  {selectedTemplate && selectedTemplate.variables.length > 0 && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Template Variables</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable}>
                            <label className="text-sm font-medium text-blue-700 capitalize">
                              {variable.replace('_', ' ')}
                            </label>
                            <Input
                              placeholder={`Enter ${variable}...`}
                              value={templateVariables[variable] || ''}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt Text */}
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Prompt Text
                          </FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={copyToClipboard}
                            disabled={!promptText}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your prompt text or use a template..."
                            className="resize-none min-h-[120px] font-mono"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {promptText ? promptText.length : 0} characters
                          </span>
                          {promptText && (
                            <span>
                              ~{Math.ceil(promptText.split(' ').length / 4)} tokens
                            </span>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Settings */}
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

                  {/* Topics */}
                  {availableTopics.length > 0 && (
                    <div className="space-y-3">
                      <FormLabel>Topics (Optional)</FormLabel>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                        {availableTopics.map((topic) => (
                          <div key={topic.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={topic.id}
                              checked={selectedTopicIds.includes(topic.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTopicIds(prev => [...prev, topic.id])
                                } else {
                                  setSelectedTopicIds(prev => prev.filter(id => id !== topic.id))
                                }
                              }}
                              disabled={isLoading}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={topic.id}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {topic.name}
                            </label>
                          </div>
                        ))}
                      </div>
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
                  </div>

                  {/* Active Switch */}
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
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Prompt
                        </>
                      )}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>💡 Be specific about what you&apos;re looking for</p>
                <p>🎯 Include context about your use case</p>
                <p>📝 Ask for comparisons to get better insights</p>
                <p>🔍 Use industry-specific terms</p>
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Ideas
              </Button>
            </CardContent>
          </Card>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}