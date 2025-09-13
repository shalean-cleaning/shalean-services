import { NextResponse } from 'next/server'
import { withApiSafe } from '@/lib/api-safe'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  const supabase = createClient()
  
  const { data: extras, error } = await supabase
    .from('extras')
    .select(`
      id,
      name,
      description,
      price,
      duration_minutes
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch extras: ${error.message}`)
  }

  return NextResponse.json(extras, { status: 200 })
}, { routeName: '/api/extras' })
