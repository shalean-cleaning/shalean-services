'use client'

import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase-client'

export type UserRole = 'CUSTOMER' | 'CLEANER' | 'ADMIN'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export function useUser(): AuthUser {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, profile, loading }
}

export function useRequireRole(requiredRole: UserRole) {
  const { user, profile, loading } = useUser()
  
  const hasRole = profile?.role === requiredRole || profile?.role === 'ADMIN'
  
  return {
    user,
    profile,
    loading,
    hasRole,
    isAuthorized: !loading && user && hasRole
  }
}

export function useRequireAuth() {
  const { user, profile, loading } = useUser()
  
  return {
    user,
    profile,
    loading,
    isAuthenticated: !loading && !!user
  }
}
