import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client with service role key (admin access, bypasses RLS)
 * Use this for server-side operations that need full database access
 */
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Creates a Supabase client with anon key (respects RLS, session-aware)
 * Use this for server-side operations that should respect user permissions
 * This version properly reads cookies from the incoming request
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    _supabaseAdmin = createSupabaseAdmin();
  }
  return _supabaseAdmin;
}