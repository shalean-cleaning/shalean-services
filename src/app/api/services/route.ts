import { NextResponse } from 'next/server'
import { withApiSafe } from '@/lib/api-safe'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  const supabase = createClient()
  
  const { data: services, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      base_price,
      duration_minutes,
      category_id,
      service_categories (
        id,
        name,
        description
      )
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`)
  }

  return NextResponse.json(services, { status: 200 })
}, { routeName: '/api/services' })
