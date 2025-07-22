'use client'

import { PromptList } from '@/components/prompts/PromptList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function PromptsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <PromptList />
      </div>
    </ProtectedRoute>
  )
}