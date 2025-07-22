'use client'

import { BrandList } from '@/components/brands/BrandList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function BrandsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <BrandList />
      </div>
    </ProtectedRoute>
  )
}