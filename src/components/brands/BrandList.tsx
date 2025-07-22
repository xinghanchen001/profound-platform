'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BrandForm } from './BrandForm'
import { brandService } from '@/lib/database/brands'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import type { Brand } from '@/types/database'
import { MoreHorizontal, Plus, Search, Building2 } from 'lucide-react'

export function BrandList() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { organization } = useAuth()
  const { hasPermission } = usePermissions()

  const canCreateBrands = hasPermission('canCreateBrands')
  const canEditBrands = hasPermission('canEditBrands')
  const canDeleteBrands = hasPermission('canDeleteBrands')

  useEffect(() => {
    if (organization) {
      loadBrands()
    }
  }, [organization])

  const loadBrands = async () => {
    if (!organization) return

    setLoading(true)
    setError(null)

    try {
      const result = await brandService.getByOrganization(organization.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setBrands(result.data || [])
      }
    } catch (err) {
      setError('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (brand: Brand) => {
    setBrands(prev => [brand, ...prev])
    setShowCreateDialog(false)
  }

  const handleEditSuccess = (updatedBrand: Brand) => {
    setBrands(prev => prev.map(brand => 
      brand.id === updatedBrand.id ? updatedBrand : brand
    ))
    setShowEditDialog(false)
    setEditingBrand(null)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setShowEditDialog(true)
  }

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return
    }

    try {
      const result = await brandService.delete(brand.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setBrands(prev => prev.filter(b => b.id !== brand.id))
      }
    } catch (err) {
      setError('Failed to delete brand')
    }
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select an organization to view brands.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground">
            Manage the brands you want to track in AI search results
          </p>
        </div>
        {canCreateBrands && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
              </DialogHeader>
              <BrandForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Brands</CardTitle>
              <CardDescription>
                {filteredBrands.length} of {brands.length} brands
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading brands...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No brands found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No brands match your search.' : 'Get started by creating your first brand.'}
              </p>
              {canCreateBrands && !searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Brand
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {brand.logo_url && (
                          <img 
                            src={brand.logo_url} 
                            alt={`${brand.name} logo`}
                            className="h-6 w-6 rounded object-cover"
                          />
                        )}
                        {brand.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.domain ? (
                        <a 
                          href={`https://${brand.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {brand.domain}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={brand.is_competitor ? "destructive" : "default"}>
                        {brand.is_competitor ? 'Competitor' : 'Own Brand'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(brand.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(canEditBrands || canDeleteBrands) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditBrands && (
                              <DropdownMenuItem onClick={() => handleEdit(brand)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDeleteBrands && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(brand)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          {editingBrand && (
            <BrandForm
              brand={editingBrand}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingBrand(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}