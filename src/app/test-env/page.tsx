'use client'

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1>Environment Variables Test</h1>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
        </p>
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'NOT SET'}
        </p>
      </div>
    </div>
  )
}