'use client'

import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export type Role = 'owner' | 'admin' | 'member' | 'viewer'

export interface UserPermissions {
  canCreateBrands: boolean
  canEditBrands: boolean
  canDeleteBrands: boolean
  canCreatePrompts: boolean
  canEditPrompts: boolean
  canDeletePrompts: boolean
  canExecutePrompts: boolean
  canViewAnalytics: boolean
  canExportData: boolean
  canManageUsers: boolean
  canManageOrganization: boolean
}

const getRolePermissions = (role: Role): UserPermissions => {
  switch (role) {
    case 'owner':
      return {
        canCreateBrands: true,
        canEditBrands: true,
        canDeleteBrands: true,
        canCreatePrompts: true,
        canEditPrompts: true,
        canDeletePrompts: true,
        canExecutePrompts: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageUsers: true,
        canManageOrganization: true,
      }
    case 'admin':
      return {
        canCreateBrands: true,
        canEditBrands: true,
        canDeleteBrands: true,
        canCreatePrompts: true,
        canEditPrompts: true,
        canDeletePrompts: true,
        canExecutePrompts: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageUsers: true,
        canManageOrganization: false,
      }
    case 'member':
      return {
        canCreateBrands: true,
        canEditBrands: true,
        canDeleteBrands: false,
        canCreatePrompts: true,
        canEditPrompts: true,
        canDeletePrompts: false,
        canExecutePrompts: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageUsers: false,
        canManageOrganization: false,
      }
    case 'viewer':
      return {
        canCreateBrands: false,
        canEditBrands: false,
        canDeleteBrands: false,
        canCreatePrompts: false,
        canEditPrompts: false,
        canDeletePrompts: false,
        canExecutePrompts: false,
        canViewAnalytics: true,
        canExportData: false,
        canManageUsers: false,
        canManageOrganization: false,
      }
    default:
      // No permissions for unknown roles
      return {
        canCreateBrands: false,
        canEditBrands: false,
        canDeleteBrands: false,
        canCreatePrompts: false,
        canEditPrompts: false,
        canDeletePrompts: false,
        canExecutePrompts: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageUsers: false,
        canManageOrganization: false,
      }
  }
}

export function usePermissions() {
  const { user, organization } = useAuth()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions>(getRolePermissions('viewer'))
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !organization) {
        setUserRole(null)
        setPermissions(getRolePermissions('viewer'))
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_organizations')
          .select('role')
          .eq('user_id', user.id)
          .eq('organization_id', organization.id)
          .single()

        if (error) {
          // Handle case where user doesn't have an organization relationship
          if (error.code === 'PGRST116') {
            console.warn(`User ${user.email} is not associated with organization ${organization.name}. Defaulting to viewer role.`)
            setUserRole('viewer')
            setPermissions(getRolePermissions('viewer'))
          } else {
            console.error('Error fetching user role:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            setUserRole(null)
            setPermissions(getRolePermissions('viewer'))
          }
          return
        }

        const role = data.role as Role
        setUserRole(role)
        setPermissions(getRolePermissions(role))
      } catch (error) {
        console.error('Unexpected error fetching user role:', error)
        setUserRole(null)
        setPermissions(getRolePermissions('viewer'))
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user, organization, supabase])

  const hasRole = (requiredRole: Role): boolean => {
    if (!userRole) return false
    
    const roleHierarchy: Record<Role, number> = {
      viewer: 1,
      member: 2,
      admin: 3,
      owner: 4,
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission]
  }

  return {
    userRole,
    permissions,
    loading,
    hasRole,
    hasPermission,
  }
}