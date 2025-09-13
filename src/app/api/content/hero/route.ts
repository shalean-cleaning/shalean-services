import { NextResponse } from 'next/server'
import { withApiSafe } from '@/lib/api-safe'
export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  // TEMP: static data to isolate infra from data source problems
  const data = {
    title: 'Book trusted cleaners in minutes',
    subtitle: 'Fast, friendly, and reliable cleaning across Cape Town.',
    imageUrl: 'https://images.unsplash.com/photo-1581578017425-ec3843c6a8a5?w=1600&h=900&fit=crop',
  }
  return NextResponse.json(data, { status: 200 })
}, { routeName: '/api/content/hero' })