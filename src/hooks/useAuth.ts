'use client'

import type { User, AuthError } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase-client'

export type UserRole = 'CUSTOMER' | 'CLEANER' | 'ADMIN'

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string
  phone?: string | null
  role: UserRole
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export interface AuthMethods {
  signIn: (email: string, password: string, returnTo?: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData?: { first_name?: string; last_name?: string }, returnTo?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          setProfile(null)
        } else {
          // Transform database profile to UserProfile interface
          const userProfile: UserProfile = {
            ...profile,
            full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
            is_active: true // Default to active since we don't have this field in the database
          }
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
          } else {
            // Transform database profile to UserProfile interface
            const userProfile: UserProfile = {
              ...profile,
              full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
              is_active: true // Default to active since we don't have this field in the database
            }
            setProfile(userProfile)
          }
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

export function useAuth(): AuthUser & AuthMethods {
  const { user, profile, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const signIn = async (email: string, password: string, returnTo?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && returnTo) {
      router.push(returnTo)
    }

    return { error }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { first_name?: string; last_name?: string },
    returnTo?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (!error && returnTo) {
      router.push(returnTo)
    }

    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      router.push('/')
    }

    return { error }
  }


  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
