import { createBrowserClient } from '@supabase/ssr'

import { envClient } from '@/env.client'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    envClient.NEXT_PUBLIC_SUPABASE_URL,
    envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
