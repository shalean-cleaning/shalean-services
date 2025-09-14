import { NextResponse } from 'next/server'

import { withApiSafe } from '@/lib/api-safe'
export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  // TEMP: static data to isolate infra from data source problems
  const data = {
    title: 'Book trusted cleaners in minutes',
    subtitle: 'Fast, friendly, and reliable cleaning across Cape Town.',
    imageUrl: '/images/placeholder.png',
  }
  return NextResponse.json(data, { status: 200 })
}, { routeName: '/api/content/hero' })

