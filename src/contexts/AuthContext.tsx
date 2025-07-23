'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User as CustomUser, Organization } from '@/types/database'

interface AuthContextType {
  user: User | null
  customUser: CustomUser | null
  session: Session | null
  organization: Organization | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<CustomUser>) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchCustomUser = useCallback(async (userId: string) => {
    try {
      // Fetch custom user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      setCustomUser(userData)

      // Fetch user's organization
      const { data: orgData, error: orgError } = await supabase
        .from('user_organizations')
        .select(`
          organization:organizations(*)
        `)
        .eq('user_id', userId)
        .limit(1)

      if (!orgError && orgData && orgData.length > 0 && orgData[0]?.organization) {
        setOrganization(orgData[0].organization as unknown as Organization)
      } else {
        // User doesn't have an organization - this could be a new user
        console.info('User does not have an organization association')
        setOrganization(null)
        
        // TODO: In a production app, you might want to:
        // 1. Redirect to organization selection/creation page
        // 2. Auto-assign to a default organization
        // 3. Show an onboarding flow
        // For now, we'll let the app handle this gracefully with null checks
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchCustomUser(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // If this is a new user confirmation, create the user record
          if (event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED') {
            // Check if user record exists in our custom users table
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single()

            // Create user record if it doesn't exist
            if (!existingUser) {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || '',
                })

              if (insertError) {
                console.error('Error creating user record:', insertError)
              }
            }
          }
          
          await fetchCustomUser(session.user.id)
        } else {
          setCustomUser(null)
          setOrganization(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchCustomUser, supabase.auth])

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('SignUp attempt for email:', email, 'fullName:', fullName)
    console.log('Supabase client instance:', supabase)
    
    try {
      console.log('About to call signUp...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      console.log('Full SignUp response:', { data, error })
      
      if (error) {
        console.error('Signup error:', error)
        return { error }
      }

      console.log('Signup successful:', data.user?.id, data.user?.email_confirmed_at)

      // In local development with confirmations disabled, create user record immediately
      // The database trigger will handle this in production
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          })

        if (insertError) {
          console.error('Error creating user record:', insertError)
          // Don't return error here as the auth user was created successfully
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Signup exception:', error)
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('SignIn attempt for email:', email)
    console.log('Supabase client instance:', supabase)
    
    try {
      console.log('About to call signInWithPassword...')
      
      // Add timeout to detect hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      )
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const response = await Promise.race([authPromise, timeoutPromise])
      console.log('Full SignIn response:', response)
      console.log('SignIn result:', response.error ? 'Error' : 'Success', response.error?.message)
      console.log('User data:', response.data?.user?.id, response.data?.user?.email)
      return { error: response.error }
    } catch (err) {
      console.error('SignIn exception:', err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<CustomUser>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setCustomUser(prev => prev ? { ...prev, ...updates } : null)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession()
    setSession(session)
    setUser(session?.user ?? null)
  }

  const value = {
    user,
    customUser,
    session,
    organization,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}