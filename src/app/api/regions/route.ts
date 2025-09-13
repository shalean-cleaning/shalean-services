import { NextResponse } from 'next/server'
import { withApiSafe } from '@/lib/api-safe'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  const supabase = createClient()
  
  const { data: regions, error } = await supabase
    .from('regions')
    .select(`
      id,
      name,
      state,
      suburbs (
        id,
        name,
        postcode,
        delivery_fee
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch regions: ${error.message}`)
  }

  return NextResponse.json(regions, { status: 200 })
}, { routeName: '/api/regions' })
