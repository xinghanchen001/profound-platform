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
        .single()

      if (!orgError && orgData?.organization) {
        setOrganization(orgData.organization as unknown as Organization)
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
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) return { error }

      // Create custom user record
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
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
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