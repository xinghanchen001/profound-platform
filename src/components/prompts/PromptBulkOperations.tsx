'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react'
import { promptService } from '@/lib/database/prompts'
import { topicService } from '@/lib/database/topics'
import type { Prompt, CreatePromptInput, Topic } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface BulkImportResult {
  success: number
  failed: number
  errors: string[]
  imported: Prompt[]
}

interface PromptBulkOperationsProps {
  prompts?: Prompt[]
  onRefresh?: () => void
}

export function PromptBulkOperations({ prompts = [], onRefresh }: PromptBulkOperationsProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [importText, setImportText] = useState('')
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { organization } = useAuth()

  React.useEffect(() => {
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
      console.error('Failed to load topics:', err)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportText(content)
      
      // Auto-detect format
      if (file.name.endsWith('.json')) {
        setImportFormat('json')
      } else if (file.name.endsWith('.csv')) {
        setImportFormat('csv')
      }
      
      parseImportData(content, file.name.endsWith('.json') ? 'json' : 'csv')
    }
    reader.readAsText(file)
  }

  const parseImportData = (content: string, format: 'csv' | 'json') => {
    try {
      let data: any[] = []
      
      if (format === 'json') {
        const parsed = JSON.parse(content)
        data = Array.isArray(parsed) ? parsed : [parsed]
      } else {
        // Parse CSV
        const lines = content.split('\n').filter(line => line.trim())
        if (lines.length < 2) throw new Error('CSV must have header and at least one data row')
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
      }
      
      setPreviewData(data)
      setShowPreview(true)
    } catch (err) {
      console.error('Failed to parse import data:', err)
      alert('Failed to parse import data. Please check the format.')
    }
  }

  const validatePromptData = (data: any): CreatePromptInput | null => {
    if (!data.text || typeof data.text !== 'string') {
      return null
    }

    return {
      organization_id: organization?.id || '',
      text: data.text,
      language: data.language || 'en',
      region: data.region || 'us',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
    }
  }

  const handleBulkImport = async () => {
    if (!organization || previewData.length === 0) return

    setIsImporting(true)
    const result: BulkImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      imported: []
    }

    for (const item of previewData) {
      try {
        const promptData = validatePromptData(item)
        if (!promptData) {
          result.failed++
          result.errors.push(`Invalid prompt data: ${JSON.stringify(item)}`)
          continue
        }

        const response = await promptService.create(promptData)
        if (response.error) {
          result.failed++
          result.errors.push(response.error)
        } else if (response.data) {
          result.success++
          result.imported.push(response.data)
        }
      } catch (err) {
        result.failed++
        result.errors.push(`Error importing prompt: ${err}`)
      }
    }

    setImportResult(result)
    setIsImporting(false)
    setShowPreview(false)
    setImportText('')
    setPreviewData([])
    
    if (result.success > 0) {
      onRefresh?.()
    }
  }

  const handleExport = async () => {
    if (prompts.length === 0) {
      alert('No prompts to export')
      return
    }

    setIsExporting(true)

    try {
      const exportData = prompts.map(prompt => ({
        text: prompt.text,
        language: prompt.language,
        region: prompt.region,
        tags: prompt.tags,
        is_active: prompt.is_active,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at
      }))

      let content: string
      let filename: string
      let mimeType: string

      if (exportFormat === 'json') {
        content = JSON.stringify(exportData, null, 2)
        filename = `prompts-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        // CSV format
        const headers = ['text', 'language', 'region', 'tags', 'is_active', 'created_at', 'updated_at']
        const csvRows = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = row[header as keyof typeof row]
              if (Array.isArray(value)) {
                return `"${value.join(', ')}"`
              }
              return `"${value}"`
            }).join(',')
          )
        ]
        content = csvRows.join('\n')
        filename = `prompts-export-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      // Download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBulkDelete = async (selectedPrompts: Prompt[]) => {
    if (selectedPrompts.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedPrompts.length} prompts? This action cannot be undone.`)) {
      return
    }

    setIsImporting(true) // Reuse loading state
    
    try {
      const results = await Promise.allSettled(
        selectedPrompts.map(prompt => promptService.delete(prompt.id))
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (successful > 0) {
        onRefresh?.()
      }
      
      alert(`Deleted ${successful} prompts successfully. ${failed} failed.`)
    } catch (err) {
      console.error('Bulk delete failed:', err)
      alert('Bulk delete failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Import/Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Prompts
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Prompts</DialogTitle>
              <DialogDescription>
                Import prompts from CSV or JSON files. Upload a file or paste the content directly.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={importFormat} onValueChange={(value: 'csv' | 'json') => setImportFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Or paste content:</label>
                <Textarea
                  placeholder={importFormat === 'csv' 
                    ? 'text,language,region,tags,is_active\n"What is...","en","us","research,analysis",true'
                    : '[{"text": "What is...", "language": "en", "region": "us", "tags": ["research"], "is_active": true}]'
                  }
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => parseImportData(importText, importFormat)}
                  disabled={!importText.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Importing prompts...</span>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || prompts.length === 0}
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export ({prompts.length})
        </Button>

        <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Import Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the prompts before importing. {previewData.length} prompts detected.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {previewData.map((item, index) => {
                const validation = validatePromptData(item)
                return (
                  <Card key={index} className={validation ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {validation ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">
                            {item.text || 'No text provided'}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.language || 'en'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.region || 'us'}
                            </Badge>
                            {item.tags && (
                              <Badge variant="outline" className="text-xs">
                                {Array.isArray(item.tags) ? item.tags.length : 1} tags
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {previewData.filter(item => validatePromptData(item)).length} valid, 
              {previewData.filter(item => !validatePromptData(item)).length} invalid
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkImport}
                disabled={previewData.filter(item => validatePromptData(item)).length === 0}
              >
                Import Valid Prompts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                <div className="text-sm text-green-700">Imported</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>
            
            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportResult(null)}
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Format Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Format Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium text-xs mb-1">CSV Format:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded font-mono overflow-x-auto">
{`text,language,region,tags,is_active
"What is artificial intelligence?","en","us","tech,AI",true
"Compare iPhone vs Android","en","us","mobile,comparison",true`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-xs mb-1">JSON Format:</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded font-mono overflow-x-auto">
{`[
  {
    "text": "What is artificial intelligence?",
    "language": "en",
    "region": "us", 
    "tags": ["tech", "AI"],
    "is_active": true
  }
]`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}