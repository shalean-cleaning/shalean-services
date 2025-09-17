import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client with service role key (admin access, bypasses RLS)
 * Use this for server-side operations that need full database access
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { persistSession: false } }
  )
}

/**
 * Creates a Supabase client with anon key (respects RLS, session-aware)
 * Use this for server-side operations that should respect user permissions
 * This version properly reads cookies from the incoming request
 */
export async function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// For backward compatibility, but should be avoided in new code
// This will be created lazily to avoid build-time issues
let _supabaseAdmin: ReturnType<typeof createSupabaseAdmin> | null = null;
export const supabaseAdmin = () => {
  if (!_supabaseAdmin) {
    try {
      _supabaseAdmin = createSupabaseAdmin();
    } catch (error) {
      console.error('Failed to create Supabase admin client:', error);
      throw error;
    }
  }
  return _supabaseAdmin;
}