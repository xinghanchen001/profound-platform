'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    setResults([])
    addResult('Starting Supabase connection test...')
    
    try {
      const supabase = createClient()
      addResult('Supabase client created successfully')
      
      // Test 1: Try to get session
      addResult('Testing getSession...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      addResult(`Session result: ${sessionError ? 'Error - ' + sessionError.message : 'Success - ' + (sessionData.session ? 'User logged in' : 'No session')}`)
      
      // Test 2: Try to sign up with a test user
      addResult('Testing signUp...')
      const testEmail = `test-${Date.now()}@example.com`
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })
      
      addResult(`SignUp result: ${signUpError ? 'Error - ' + signUpError.message : 'Success - User ID: ' + signUpData.user?.id}`)
      
      // Test 3: Try to sign in with an existing user (if signup worked)
      if (!signUpError && signUpData.user) {
        addResult('Testing signIn with new user...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'password123'
        })
        addResult(`SignIn result: ${signInError ? 'Error - ' + signInError.message : 'Success - User ID: ' + signInData.user?.id}`)
      }
      
    } catch (error) {
      addResult(`Test exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testExistingUser = async () => {
    setLoading(true)
    setResults([])
    addResult('Testing sign in with existing user...')
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'hanchen.xing@outlook.com',
        password: 'your-password-here' // Replace with actual password
      })
      
      addResult(`Existing user sign in: ${error ? 'Error - ' + error.message : 'Success - User ID: ' + data.user?.id}`)
    } catch (error) {
      addResult(`Exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testSupabaseConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Supabase Connection & SignUp'}
            </Button>
            
            <Button 
              onClick={testExistingUser} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Sign In (Existing User)'}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Environment Check:</strong></p>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'NOT SET'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}