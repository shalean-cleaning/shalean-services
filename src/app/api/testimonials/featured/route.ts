import { NextResponse } from 'next/server'

import { withApiSafe } from '@/lib/api-safe'
export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  const testimonials = [
    {
      id: 't1',
      name: 'Alex',
      avatar: '/images/placeholder.png',
      quote: 'Brilliant service, quick booking, spotless result.',
    },
  ]
  return NextResponse.json(testimonials, { status: 200 })
}, { routeName: '/api/testimonials/featured' })
