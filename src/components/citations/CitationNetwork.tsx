'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Network, 
  Download,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react'
import { citationService } from '@/lib/database/citations'
import { useAuth } from '@/contexts/AuthContext'

interface NetworkNode {
  id: string
  label: string
  type: string
  size: number
  x?: number
  y?: number
}

interface NetworkLink {
  source: string
  target: string
  weight: number
}

export function CitationNetwork() {
  const { organization } = useAuth()
  const [networkData, setNetworkData] = useState<{
    nodes: NetworkNode[]
    links: NetworkLink[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'earned' | 'competitor' | 'social'>('all')
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  useEffect(() => {
    if (organization) {
      loadNetworkData()
    }
  }, [organization, filterType, loadNetworkData])

  const loadNetworkData = useCallback(async () => {
    if (!organization) return

    try {
      setLoading(true)
      setError(null)

      const filters = filterType !== 'all' ? { citation_type: filterType as 'owned' | 'earned' | 'competitor' | 'social' } : undefined
      const result = await citationService.getCitationNetworkData(organization.id, filters)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        // Add random positions for visualization
        const nodesWithPositions = result.data.nodes.map(node => ({
          ...node,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50
        }))
        
        setNetworkData({
          nodes: nodesWithPositions,
          links: result.data.links
        })
      }
    } catch {
      setError('Failed to load network data')
    } finally {
      setLoading(false)
    }
  }, [organization, filterType])

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'owned': return '#22c55e' // green
      case 'earned': return '#3b82f6' // blue
      case 'competitor': return '#f97316' // orange
      case 'social': return '#a855f7' // purple
      case 'brand': return '#ef4444' // red
      case 'platform': return '#64748b' // gray
      default: return '#6b7280'
    }
  }

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node)
  }

  const handleExport = () => {
    // TODO: Implement network data export
    console.log('Export network visualization')
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const resetView = () => {
    if (networkData) {
      const updatedNodes = networkData.nodes.map(node => ({
        ...node,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50
      }))
      setNetworkData({ ...networkData, nodes: updatedNodes })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadNetworkData}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Citation Network Visualization</h2>
          <p className="text-muted-foreground">
            Interactive network showing citation relationships between domains, brands, and platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={filterType} 
            onValueChange={(value: 'all' | 'owned' | 'earned' | 'competitor' | 'social') => setFilterType(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Citations</SelectItem>
              <SelectItem value="owned">Owned Only</SelectItem>
              <SelectItem value="earned">Earned Only</SelectItem>
              <SelectItem value="competitor">Competitor Only</SelectItem>
              <SelectItem value="social">Social Only</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Citation Network
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleAnimation}
                  >
                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {networkData?.nodes.length || 0} nodes, {networkData?.links.length || 0} connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
                {/* Simplified 2D Network Visualization */}
                <div className="absolute inset-0 overflow-hidden">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {/* Draw links first (behind nodes) */}
                    {networkData?.links.map((link, index) => {
                      const sourceNode = networkData.nodes.find(n => n.id === link.source)
                      const targetNode = networkData.nodes.find(n => n.id === link.target)
                      if (!sourceNode || !targetNode) return null
                      
                      return (
                        <line
                          key={index}
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#64748b"
                          strokeWidth={Math.min(link.weight / 2, 3)}
                          opacity={0.6}
                        />
                      )
                    })}
                    
                    {/* Draw nodes */}
                    {networkData?.nodes.map((node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={Math.max(node.size * 2, 8)}
                          fill={getNodeColor(node.type)}
                          stroke="#ffffff"
                          strokeWidth={2}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNodeClick(node)}
                          className="hover:opacity-80 transition-opacity"
                        />
                        <text
                          x={node.x}
                          y={(node.y || 0) + Math.max(node.size * 2, 8) + 12}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                          className="pointer-events-none"
                        >
                          {node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                
                {/* Placeholder message when no data */}
                {(!networkData || networkData.nodes.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No citation network data available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Citation relationships will appear here once data is collected
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Controls and Info */}
        <div className="space-y-6">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Owned Domains</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Earned Citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Competitor Citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Social Citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Brands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm">AI Platforms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{selectedNode.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1">
                    <Badge style={{ backgroundColor: getNodeColor(selectedNode.type) }}>
                      {selectedNode.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Connections</label>
                  <p className="text-sm text-muted-foreground">{selectedNode.size}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Nodes</span>
                <span className="text-sm font-medium">{networkData?.nodes.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Links</span>
                <span className="text-sm font-medium">{networkData?.links.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Domains</span>
                <span className="text-sm font-medium">
                  {networkData?.nodes.filter(n => n.type !== 'brand' && n.type !== 'platform').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Brands</span>
                <span className="text-sm font-medium">
                  {networkData?.nodes.filter(n => n.type === 'brand').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Platforms</span>
                <span className="text-sm font-medium">
                  {networkData?.nodes.filter(n => n.type === 'platform').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}