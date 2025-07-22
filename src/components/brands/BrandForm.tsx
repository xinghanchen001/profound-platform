'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { brandService } from '@/lib/database/brands'
import { createBrandSchema, updateBrandSchema } from '@/lib/validation/schemas'
import type { Brand, CreateBrandInput, UpdateBrandInput } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface BrandFormProps {
  brand?: Brand
  onSuccess?: (brand: Brand) => void
  onCancel?: () => void
}

export function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useAuth()

  const isEditing = !!brand
  const schema = isEditing ? updateBrandSchema : createBrandSchema

  const form = useForm<CreateBrandInput | UpdateBrandInput>({
    resolver: zodResolver(schema),
    defaultValues: brand ? {
      name: brand.name,
      domain: brand.domain || '',
      logo_url: brand.logo_url || '',
      is_competitor: brand.is_competitor
    } : {
      organization_id: organization?.id || '',
      name: '',
      domain: '',
      logo_url: '',
      is_competitor: false
    }
  })

  const onSubmit = async (data: CreateBrandInput | UpdateBrandInput) => {
    if (!organization) {
      setError('No organization selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let result

      if (isEditing && brand) {
        result = await brandService.update(brand.id, data as UpdateBrandInput)
      } else {
        result = await brandService.create({
          ...data,
          organization_id: organization.id
        } as CreateBrandInput)
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
        <CardTitle>{isEditing ? 'Edit Brand' : 'Create Brand'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update brand information' : 'Add a new brand to track in AI search results'}
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
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter brand name"
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
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    The main website domain for this brand
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
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
              name="is_competitor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Competitor Brand</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this brand as a competitor to track separately
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
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Brand' : 'Create Brand')}
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