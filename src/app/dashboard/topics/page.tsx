'use client'

import { TopicList } from '@/components/topics/TopicList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function TopicsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <TopicList />
      </div>
    </ProtectedRoute>
  )
}