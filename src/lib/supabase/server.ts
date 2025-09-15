import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // SERVICE ROLE only used on server routes
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
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